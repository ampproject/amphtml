import {Services} from '#service';
import {registerElement} from '#service/custom-element-registry';

import {dev, userAssert} from '#utils/log';

import {BaseElement} from '../../base-element';
import {createPixel} from '../../pixel';

const TAG = 'amp-pixel';

/**
 * A simple analytics instrument. Fires as an impression signal.
 */
export class AmpPixel extends BaseElement {
  /** @override */
  constructor(element) {
    super(element);

    /** @private {?Promise<!Image>} */
    this.triggerPromise_ = null;
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    // No matter what layout is: the pixel is always non-displayed.
    return true;
  }

  /** @override */
  buildCallback() {
    // Element is invisible.
    this.element.setAttribute('aria-hidden', 'true');

    /** @private {?string} */
    this.referrerPolicy_ = this.element.getAttribute('referrerpolicy');
    if (this.referrerPolicy_) {
      // Safari doesn't support referrerPolicy yet. We're using an
      // iframe based trick to remove referrer, which apparently can
      // only do "no-referrer".
      userAssert(
        this.referrerPolicy_ == 'no-referrer',
        `${TAG}: invalid "referrerpolicy" value "${this.referrerPolicy_}".` +
          ' Only "no-referrer" is supported'
      );
    }
    if (
      this.element.hasAttribute('i-amphtml-ssr') &&
      this.element.querySelector('img')
    ) {
      dev().info(TAG, 'inabox img already present');
      return;
    }
    // Trigger, but only when visible.
    this.getAmpDoc().whenFirstVisible().then(this.trigger_.bind(this));
  }

  /**
   * Triggers the signal.
   * @return {*} TODO(#23582): Specify return type
   * @private
   */
  trigger_() {
    if (this.triggerPromise_) {
      // TODO(dvoytenko, #8780): monitor, confirm if there's a bug and remove.
      dev().error(TAG, 'duplicate pixel');
      return this.triggerPromise_;
    }
    // Delay(1) provides a rudimentary "idle" signal.
    // TODO(dvoytenko): use an improved idle signal when available.
    this.triggerPromise_ = Services.timerFor(this.win)
      .promise(1)
      .then(() => {
        const src = this.element.getAttribute('src');
        if (!src) {
          return;
        }
        return Services.urlReplacementsForDoc(this.element)
          .expandUrlAsync(this.assertSource_(src))
          .then((src) => {
            if (!this.win) {
              return;
            }

            const pixel = createPixel(
              this.win,
              src,
              this.referrerPolicy_,
              this.element.getAttribute('attributionsrc'),
              this.element
            );
            dev().info(TAG, 'pixel triggered: ', src);
            return pixel;
          });
      });
  }

  /**
   * @param {?string} src
   * @return {string}
   * @private
   */
  assertSource_(src) {
    userAssert(
      /^(https\:\/\/|\/\/)/i.test(src),
      'The <amp-pixel> src attribute must start with ' +
        '"https://" or "//". Invalid value: ' +
        src
    );
    return /** @type {string} */ (src);
  }
}

/**
 * @param {!Window} win Destination window for the new element.
 */
export function installPixel(win) {
  registerElement(win, TAG, AmpPixel);
}
