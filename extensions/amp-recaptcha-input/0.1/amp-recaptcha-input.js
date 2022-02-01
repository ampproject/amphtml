/**
 * @fileoverview Async Input Element that uses the
 * amp-recaptcha-service to dispatch actions, and return
 * recaptcha tokens
 */

import {
  AsyncInputAttributes_Enum,
  AsyncInputClasses_Enum,
} from '#core/constants/async-input';
import {Layout_Enum} from '#core/dom/layout';
import {setStyles, toggle} from '#core/dom/style';

import {userAssert} from '#utils/log';

import {
  AmpRecaptchaService,
  recaptchaServiceForDoc,
} from './amp-recaptcha-service';

import {CSS} from '../../../build/amp-recaptcha-input-0.1.css';

/** @const */
const TAG = 'amp-recaptcha-input';

/** @implements {../../../src/async-input.AsyncInput} */
export class AmpRecaptchaInput extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?string} */
    this.sitekey_ = null;

    /** @private {?string} */
    this.action_ = null;

    /** @private {?./amp-recaptcha-service.AmpRecaptchaService} */
    this.recaptchaService_ = null;

    /** @private {?Promise} */
    this.registerPromise_ = null;

    /** @private {boolean} */
    this.global_ = false;
  }

  /** @override */
  buildCallback() {
    this.sitekey_ = userAssert(
      this.element.getAttribute('data-sitekey'),
      'The data-sitekey attribute is required for <amp-recaptcha-input> %s',
      this.element
    );

    this.action_ = userAssert(
      this.element.getAttribute('data-action'),
      'The data-action attribute is required for <amp-recaptcha-input> %s',
      this.element
    );

    userAssert(
      this.element.getAttribute(AsyncInputAttributes_Enum.NAME),
      'The %s attribute is required for <amp-recaptcha-input> %s',
      AsyncInputAttributes_Enum.NAME,
      this.element
    );

    this.global_ = this.element.hasAttribute('data-global');

    return recaptchaServiceForDoc(this.element).then((service) => {
      this.recaptchaService_ = service;

      return this.mutateElement(() => {
        toggle(this.element);
        // Add the required AsyncInput class
        this.element.classList.add(AsyncInputClasses_Enum.ASYNC_INPUT);
        /**
         * These styles will create an in-place element, that is 1x1,
         * but invisible. Absolute positioning keeps it where it would have
         * been, without taking up space. Thus, layoutCallback will still
         * be called at the appropriate time
         */
        setStyles(this.element, {
          'position': 'absolute',
          'width': '1px',
          'height': '1px',
          'overflow': 'hidden',
          'visibility': 'hidden',
        });
      });
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.NODISPLAY;
  }

  /** @override */
  layoutCallback() {
    if (!this.registerPromise_ && this.sitekey_) {
      this.registerPromise_ = this.recaptchaService_.register(
        this.sitekey_,
        this.global_
      );
    }

    return /** @type {!Promise} */ (this.registerPromise_);
  }

  /** @override */
  unlayoutCallback() {
    if (this.registerPromise_) {
      this.recaptchaService_.unregister();
      this.registerPromise_ = null;
    }
    return true;
  }

  /**
   * Function to return the recaptcha token.
   * Will be an override of AMP.AsyncInput
   * @override
   * @return {!Promise<string>}
   */
  getValue() {
    if (this.sitekey_ && this.action_) {
      return this.recaptchaService_.execute(
        this.element.getResourceId(),
        this.action_
      );
    }
    return Promise.reject(
      new Error(
        'amp-recaptcha-input requires both the data-sitekey,' +
          ' and data-action attribute'
      )
    );
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerServiceForDoc('amp-recaptcha', AmpRecaptchaService);
  AMP.registerElement(TAG, AmpRecaptchaInput, CSS);
});
