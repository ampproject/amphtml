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
 * Interface for all AMP Async Input Elements.
 * enforces the overridable function, getValue().
 * Async Input should be implemented
 * by components like AMP form, to async request
 * a value from a component, and then be used for
 * some other action. For examples, this can be used
 * by reCAPTCHA to request tokens for the form.
 *
 * NOTE: Elements that implemented AsyncInput must
 * Also add and follow the other exported constants.
 * See amp-recaptcha-input as an example.
 *
 * @interface
 */
export class AsyncInput {
  /**
   * Called to get the asynchronous value of an
   * AsyncInput field.
   * @return {!Promise<string>}
   */
  getValue() {}
}

/**
 * Attributes
 *
 * Components implementing the AsyncInput,
 * are expected to assert these attributes
 * at the appropriate time.
 *
 * @enum {string}
 */
export const AsyncInputAttributes = {
  /**
   * data-name
   *
   * Required attribute that must be asserted by every async-input
   * Element. This is used by AMP form to add the key
   * for the form submission request
   */
  NAME: 'name',
};

/**
 * Classes
 *
 * Components implementing the AsyncInput,
 * are expected to add the following classes
 * at the appropriate time.
 *
 * @enum {string}
 */
export const AsyncInputClasses = {
  /**
   * i-amphtml-async-input
   *
   * Required base class that must be added to the async-input
   * element on buildCallback or layoutCallback.
   * This will be used by other amp components to find
   * and use async-input elements.
   */
  'ASYNC_INPUT': 'i-amphtml-async-input',
};
