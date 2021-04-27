/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {arrayOrSingleItemToArray} from '../types/array';

/**
 * Utility method that propagates attributes from a source element
 * to an updateable element.
 * If `opt_removeMissingAttrs` is true, then also removes any specified
 * attributes that are missing on the source element from the updateable element.
 * @param {string|!Array<string>} attributes
 * @param {!Element} sourceElement
 * @param {!Element} updateElement
 * @param {boolean=} opt_removeMissingAttrs
 */
export function propagateAttributes(
  attributes,
  sourceElement,
  updateElement,
  opt_removeMissingAttrs
) {
  attributes = arrayOrSingleItemToArray(attributes);
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    const val = sourceElement.getAttribute(attr);
    if (null !== val) {
      updateElement.setAttribute(attr, val);
    } else if (opt_removeMissingAttrs) {
      updateElement.removeAttribute(attr);
    }
  }
}
