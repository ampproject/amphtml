import {createElementWithAttributes} from '#core/dom';
import {WindowInterface} from '#core/window/interface';

import {user} from '#utils/log';

/** @const {string} */
const TAG = 'pixel';

/**
 * @param {!Window} win
 * @param {string} src
 * @param {?string=} referrerPolicy
 * @param {?boolean=} attributionReportingEligible
 * @param {string=} attributionsrc
 * @return {!Element}
 */
export function createPixel(win, src, referrerPolicy,
                             attributionReportingEligible,
                             attributionSrc) {
  // Caller need to verify window is not destroyed when creating pixel
  if (referrerPolicy && referrerPolicy !== 'no-referrer') {
    user().error(TAG, 'Unsupported referrerPolicy: %s', referrerPolicy);
  }

  return referrerPolicy === 'no-referrer'
    ? createNoReferrerPixel(win, src, attributionReportingEligible, attributionSrc)
    : createImagePixel(win, src, false, attributionReportingEligible, attributionSrc);
}

/**
 * @param {!Window} win
 * @param {string} src
 * @param {?boolean=} attributionReportingEligible
 * @param {string=} attributionsrc
 * @return {!Element}
 */
function createNoReferrerPixel(win, src,
                                attributionReportingEligible,
                                attributionSrc) {
  if (isReferrerPolicySupported()) {
    return createImagePixel(win, src, true, attributionReportingEligible, attributionSrc);
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
      createImagePixel(iframe.contentWindow, src, false, attributionReportingEligible, attributionSrc);
    };
    win.document.body.appendChild(iframe);
    return iframe;
  }
}

/**
 * @param {!Window} win
 * @param {string} src
 * @param {boolean=} noReferrer
 * @param {?boolean=} attributionReportingEligible
 * @param {string=} attributionsrc
 * @return {!Image}
 */
function createImagePixel(win, src, noReferrer = false,
                           attributionReportingEligible = false,
                           attributionSrc) {
  const Image = WindowInterface.getImage(win);
  const image = new Image();
  if (noReferrer) {
    image.referrerPolicy = 'no-referrer';
  }
  image.src = src;
  if (attributionReportingEligible) {
    image.attributionsrc = attributionSrc;
  }
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
