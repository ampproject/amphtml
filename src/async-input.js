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
 * Base Class for all AMP Async Input Elements.
 * This simply Extends the Base Element, and adds a new
 * overridable function, getValue(). This should be
 * used by components like AMP form, to async request
 * a value from a component, and then be used for
 * some other action. For examples, this can be used
 * by reCAPTCHA to request tokens for the form.
 */
import {BaseElement} from './base-element';

export class AsyncInput extends BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    element.classList.add('i-amphtml-async-input');
  }

  /**
   * Called to get the asynchronous value of an
   * AsyncInput field.
   * @return {!Promise<string>}
   */
  getValue() {
    throw new Error('Elements that implement AsyncInput' +
      ' must override getValue()');
  }
}
