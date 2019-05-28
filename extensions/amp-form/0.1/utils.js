/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
 * Checks if a form field is in its default state.
 * @param {!Element} field
 * @return {boolean}
 */
export function isFieldDefault(field) {
  switch (field.type) {
    case 'select-multiple':
    case 'select-one':
      const {options} = field;
      for (let j = 0; j < options.length; j++) {
        if (options[j].selected !== options[j].defaultSelected) {
          return false;
        }
      }
      break;
    case 'checkbox':
    case 'radio':
      return field.checked === field.defaultChecked;
    default:
      return field.value === field.defaultValue;
  }
  return true;
}
