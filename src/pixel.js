import {createElementWithAttributes} from '#core/dom';
import {dict} from '#core/types/object';
import {WindowInterface} from '#core/window/interface';

import {user} from './log';

/** @const {string} */
const TAG = 'pixel';

/**
 * @param {!Window} win
 * @param {string} src
 * @param {?string=} referrerPolicy
 * @return {!Element}
 */
export function createPixel(win, src, referrerPolicy) {
  // Caller need to verify window is not destroyed when creating pixel
  if (referrerPolicy && referrerPolicy !== 'no-referrer') {
    user().error(TAG, 'Unsupported referrerPolicy: %s', referrerPolicy);
  }

  return referrerPolicy === 'no-referrer'
    ? createNoReferrerPixel(win, src)
    : createImagePixel(win, src);
}

/**
 * @param {!Window} win
 * @param {string} src
 * @return {!Element}
 */
function createNoReferrerPixel(win, src) {
  if (isReferrerPolicySupported()) {
    return createImagePixel(win, src, true);
  } else {
    // if "referrerPolicy" is not supported, use iframe wrapper
    // to scrub the referrer.
    const iframe = createElementWithAttributes(
      /** @type {!Document} */ (win.document),
      'iframe',
      dict({
        'src': 'about:blank',
        'style': 'display:none',
      })
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
 * @return {!Image}
 */
function createImagePixel(win, src, noReferrer = false) {
  const Image = WindowInterface.getImage(win);
  const image = new Image();
  if (noReferrer) {
    image.referrerPolicy = 'no-referrer';
  }
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
