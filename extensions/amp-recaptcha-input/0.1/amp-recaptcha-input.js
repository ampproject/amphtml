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

import {AmpRecaptcha} from './amp-recaptcha-service';

export class AmpRecaptchaInput extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    console.log('ayyeee');
  }

  /** @override */
  isLayoutSupported(layout) {
    return true;
  }

  /** @override */
  layoutCallback() {
    console.log('layout callback!');
    return AmpRecaptcha.register(this);
  }

  /**
   * @override
   */
  unlayoutCallback() {
    AmpRecaptcha.unregister(this);
    return true;
  }
}

AMP.extension('amp-recaptcha-input', '0.1', AMP => {
  AMP.registerElement('amp-recaptcha-input', AmpRecaptchaInput);
});
