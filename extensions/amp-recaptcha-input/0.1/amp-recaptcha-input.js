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

import {
  installRecaptchaService,
  recaptchaServiceFor,
} from './amp-recaptcha-service';
import {isExperimentOn} from '../../../src/experiments';

/** @const */
const TAG = 'amp-recaptcha-input';

export class AmpRecaptchaInput extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!./amp-recaptcha-service.AmpRecaptchaService} */
    this.recaptchaService_ = recaptchaServiceFor(this.win);

    /** @private {boolean} */
    this.isExperimentEnabled_ = isExperimentOn(this.win, 'amp-recaptcha-input');
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }

  /** @override */
  layoutCallback() {
    if (this.isExperimentEnabled_) {
      return this.recaptchaService_.register(this);
    }
    return Promise.resolve();
  }

  /**
   * @override
   */
  unlayoutCallback() {
    if (this.isExperimentEnabled_) {
      this.recaptchaService_.unregister(this);
      return true;
    }
    return false;
  }
}

AMP.extension(TAG, '0.1', AMP => {
  installRecaptchaService(AMP.win);
  AMP.registerElement(TAG, AmpRecaptchaInput);
});
