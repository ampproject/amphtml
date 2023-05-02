import {createElementWithAttributes} from '#core/dom';
import {WindowInterface} from '#core/window/interface';

import {user} from '#utils/log';

import {isAttributionReportingAllowed} from './utils/privacy-sandbox-utils';

/** @const {string} */
const TAG = 'pixel';

/**
 * @param {!Window} win
 * @param {string} src
 * @param {?string=} referrerPolicy
 * @param {string=} attributionSrc
 * @return {!Element}
 */
export function createPixel(win, src, referrerPolicy, attributionSrc) {
  // Caller need to verify window is not destroyed when creating pixel
  if (referrerPolicy && referrerPolicy !== 'no-referrer') {
    user().error(TAG, 'Unsupported referrerPolicy: %s', referrerPolicy);
  }

  return referrerPolicy === 'no-referrer'
    ? createNoReferrerPixel(win, src, attributionSrc)
    : createImagePixel(win, src, false, attributionSrc);
}

/**
 * @param {!Window} win
 * @param {string} src
 * @param {string=} attributionSrc
 * @return {!Element}
 */
function createNoReferrerPixel(win, src, attributionSrc) {
  if (isReferrerPolicySupported()) {
    return createImagePixel(win, src, true, attributionSrc);
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
      createImagePixel(iframe.contentWindow, src);
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
 * @return {!Image}
 */
function createImagePixel(win, src, noReferrer = false, attributionSrc) {
  const Image = WindowInterface.getImage(win);
  const image = new Image();
  if (noReferrer) {
    image.referrerPolicy = 'no-referrer';
  }
  image.src = src;
  if (isAttributionReportingAllowed(win.document)) {
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
