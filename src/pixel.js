import {createElementWithAttributes} from '#core/dom';
import {WindowInterface} from '#core/window/interface';

import {Services} from '#service';

import {user} from '#utils/log';

import {
  AttributionReportingStatus,
  isAttributionReportingAllowed,
} from './utils/privacy-sandbox-utils';

/** @const {string} */
const TAG = 'pixel';

/**
 * @param {!Window} win
 * @param {string} src
 * @param {?string=} referrerPolicy
 * @param {string=} attributionSrc
 * @param {(Element|./service/ampdoc-impl.AmpDoc)=} opt_elementOrAmpDoc Whether services are provided by an
 *     element.
 * @return {!Element}
 */
export function createPixel(
  win,
  src,
  referrerPolicy,
  attributionSrc,
  opt_elementOrAmpDoc
) {
  // Caller need to verify window is not destroyed when creating pixel
  if (referrerPolicy && referrerPolicy !== 'no-referrer') {
    user().error(TAG, 'Unsupported referrerPolicy: %s', referrerPolicy);
  }

  return referrerPolicy === 'no-referrer'
    ? createNoReferrerPixel(win, src, attributionSrc, opt_elementOrAmpDoc)
    : createImagePixel(win, src, false, attributionSrc, opt_elementOrAmpDoc);
}

/**
 * @param {!Window} win
 * @param {string} src
 * @param {string=} attributionSrc
 * @param {(Element|./service/ampdoc-impl.AmpDoc)=} opt_elementOrAmpDoc Whether services are provided by an
 *     element.
 * @return {!Element}
 */
function createNoReferrerPixel(win, src, attributionSrc, opt_elementOrAmpDoc) {
  if (isReferrerPolicySupported()) {
    return createImagePixel(
      win,
      src,
      true,
      attributionSrc,
      opt_elementOrAmpDoc
    );
  } else {
    // if "referrerPolicy" is not supported, use iframe wrapper
    // to scrub the referrer.
    const iframe = createElementWithAttributes(
      /** @type {!Document} */ (win.document),
      'iframe',
      {
        'src': 'about:blank',
        'style': 'display:none',
      }
    );
    iframe.onload = () => {
      createImagePixel(
        iframe.contentWindow,
        src,
        undefined,
        undefined,
        opt_elementOrAmpDoc
      );
    };
    win.document.body.appendChild(iframe);
    return iframe;
  }
}

/**
 * @param {!Window} win
 * @param {string} src
 * @param {boolean=} noReferrer
 * @param {string=} attributionSrc
 * @param {(Element|./service/ampdoc-impl.AmpDoc)=} opt_elementOrAmpDoc Whether services are provided by an
 *     element.
 * @return {!Image}
 */
function createImagePixel(
  win,
  src,
  noReferrer = false,
  attributionSrc,
  opt_elementOrAmpDoc
) {
  const Image = WindowInterface.getImage(win);
  const image = new Image();
  if (noReferrer) {
    image.referrerPolicy = 'no-referrer';
  }

  let attributionReportingStatus =
    AttributionReportingStatus.ATTRIBUTION_DATA_UNSPECIFIED;
  if (attributionSrc != null) {
    if (isAttributionReportingAllowed(win.document)) {
      attributionReportingStatus =
        AttributionReportingStatus.ATTRIBUTION_DATA_PRESENT_AND_POLICY_ENABLED;
      const substituteVariables =
        getAttributionReportingStatusUrlVariableRewriter(
          win,
          attributionReportingStatus,
          opt_elementOrAmpDoc
        );
      attributionSrc = substituteVariables(attributionSrc);
      image.attributionSrc = attributionSrc;
    } else {
      attributionReportingStatus =
        AttributionReportingStatus.ATTRIBUTION_DATA_PRESENT;
    }
  }
  const substituteVariables = getAttributionReportingStatusUrlVariableRewriter(
    win,
    attributionReportingStatus,
    opt_elementOrAmpDoc
  );
  src = substituteVariables(src);
  image.src = src;
  return image;
}

/**
 * Check if element attribute "referrerPolicy" is supported by the browser.
 * Safari 11.1 does not support it yet.
 *
 * @return {boolean}
 */
function isReferrerPolicySupported() {
  return 'referrerPolicy' in Image.prototype;
}

/**
 * @param {!Window} win
 * @param {string=} status
 * @param {(Element|./service/ampdoc-impl.AmpDoc)=} opt_elementOrAmpDoc Whether services are provided by an
 *     element.
 * @return {function(string): string}
 */
function getAttributionReportingStatusUrlVariableRewriter(
  win,
  status,
  opt_elementOrAmpDoc
) {
  const substitutionFunctions = {
    'ATTRIBUTION_REPORTING_STATUS': () => status,
  };
  const replacements = Services.urlReplacementsForDoc(
    opt_elementOrAmpDoc || win.document
  );
  const allowlist = {
    'ATTRIBUTION_REPORTING_STATUS': true,
  };

  return (url) =>
    replacements.expandUrlSync(url, substitutionFunctions, allowlist);
}
