/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Async Input Element that uses the
 * amp-recaptcha-service to dispatch actions, and return
 * recaptcha tokens
 */

import {CSS} from '../../../build/amp-recaptcha-input-0.1.css';
import {Layout} from '../../../src/layout';
import {
  installRecaptchaServiceForDoc,
  recaptchaServiceForDoc,
} from './amp-recaptcha-service';
import {isExperimentOn} from '../../../src/experiments';
import {setStyles, toggle} from '../../../src/style';
import {user} from '../../../src/log';

/** @const */
const TAG = 'amp-recaptcha-input';

export class AmpRecaptchaInput extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?string} **/
    this.sitekey_ = null;

    /** @private {?string} */
    this.action_ = null;

    /** @private {?./amp-recaptcha-service.AmpRecaptchaService} */
    this.recaptchaService_ = null;

    /** @private {?Promise} */
    this.registerPromise_ = null;

    /** @private {boolean} */
    this.isExperimentEnabled_ = isExperimentOn(this.win, 'amp-recaptcha-input');
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  buildCallback() {
    if (!this.isExperimentEnabled_) {
      return;
    }

    this.sitekey_ = user().assert(
        this.element.getAttribute('data-sitekey'),
        'The data-sitekey attribute is required for <amp-recaptcha-input> %s',
        this.element);

    this.action_ = user().assert(
        this.element.getAttribute('data-action'),
        'The data-action attribute is required for <amp-recaptcha-input> %s',
        this.element);

    this.recaptchaService_ = recaptchaServiceForDoc(this.getAmpDoc());

    return this.mutateElement(() => {
      toggle(this.element);
      /**
       * We are applying styles here, to minizime the amp.css file.
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
  }

  /** @override */
  layoutCallback() {
    if (!this.registerPromise_ && this.sitekey_) {
      this.registerPromise_ = this.recaptchaService_.register(this.sitekey_);
    }
    return this.registerPromise_;
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
   * @return {Promise<string>}
   */
  getValue() {

    if (this.sitekey_ && this.action_) {
      return this.recaptchaService_.execute(
          this.element.getResourceId(), this.sitekey_, this.action_
      );
    }
    return Promise.reject(new Error(
        'amp-recaptcha-input requires both the data-sitekey,' +
        ' and data-action attribute'
    ));
  }
}

AMP.extension(TAG, '0.1', AMP => {
  installRecaptchaServiceForDoc(AMP.ampdoc);
  AMP.registerElement(TAG, AmpRecaptchaInput, CSS);
});
