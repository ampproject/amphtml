import {createElementWithAttributes} from '#core/dom';
import {WindowInterface} from '#core/window/interface';

import {Services} from '#service';

import {user} from '#utils/log';

/** @const {string} */
const TAG = 'pixel';

/**
 * @param {!Window} win
 * @param {string} src
 * @param {?string=} referrerPolicy
 * @param {(Element|./service/ampdoc-impl.AmpDoc)=} opt_elementOrAmpDoc Whether services are provided by an
 *     element.
 * @return {!Element}
 */
export function createPixel(win, src, referrerPolicy, opt_elementOrAmpDoc) {
  // Caller need to verify window is not destroyed when creating pixel
  if (referrerPolicy && referrerPolicy !== 'no-referrer') {
    user().error(TAG, 'Unsupported referrerPolicy: %s', referrerPolicy);
  }

  return referrerPolicy === 'no-referrer'
    ? createNoReferrerPixel(win, src, opt_elementOrAmpDoc)
    : createImagePixel(win, src, false, opt_elementOrAmpDoc);
}

/**
 * @param {!Window} win
 * @param {string} src

 * @param {(Element|./service/ampdoc-impl.AmpDoc)=} opt_elementOrAmpDoc Whether services are provided by an
 *     element.
 * @return {!Element}
 */
function createNoReferrerPixel(win, src, opt_elementOrAmpDoc) {
  if (isReferrerPolicySupported()) {
    return createImagePixel(win, src, true, opt_elementOrAmpDoc);
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

 * @param {(Element|./service/ampdoc-impl.AmpDoc)=} opt_elementOrAmpDoc Whether services are provided by an
 *     element.
 * @return {!Image}
 */
function createImagePixel(win, src, noReferrer = false, opt_elementOrAmpDoc) {
  const Image = WindowInterface.getImage(win);
  const image = new Image();
  if (noReferrer) {
    image.referrerPolicy = 'no-referrer';
  }

  const replacements = Services.urlReplacementsForDoc(
    opt_elementOrAmpDoc || win.document
  );
  src = replacements.expandUrlSync(src);
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
