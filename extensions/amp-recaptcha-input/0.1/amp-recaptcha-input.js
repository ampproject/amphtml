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
  installRecaptchaService,
  recaptchaServiceFor,
} from './amp-recaptcha-service';
import {isExperimentOn} from '../../../src/experiments';
import {setStyles, toggle} from '../../../src/style';

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
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  buildCallback() {
    if (!this.isExperimentEnabled_) {
      return;
    }

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
    /**
     * TODO(torch2424): Fix possible race condition,
     * of this getting called twice.
     * See <amp-analytics> layoutCallback()
     */
    return this.recaptchaService_.register(this.element);
  }

  /** @override */
  unlayoutCallback() {
    this.recaptchaService_.unregister();
    return true;
  }
}

AMP.extension(TAG, '0.1', AMP => {
  installRecaptchaService(AMP.win);
  AMP.registerElement(TAG, AmpRecaptchaInput, CSS);
});
