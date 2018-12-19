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
 * Describes the contract for an inputmask UX controller.
 * @interface
 */
export class MaskInterface {
  /**
   * Initialize an inputmask UX for an input element using the given mask.
   * The constructor does not apply the mask to the element.
   * @param {!Element} unusedElement
   * @param {string} unusedMask
   */
  constructor(unusedElement, unusedMask) {}

  /**
   * Apply the mask to the element.
   */
  mask() {}

  /**
   * Get the value of the masked element.
   * @return {string}
   */
  getValue() {}

  /**
   * Get the unmasked value from the element
   * @return {string}
   */
  getUnmaskedValue() {}

  /**
   * Removes the inputmask from the input element UX and cleans up any resources
   * consumed by the controller.
   */
  dispose() {}
}
