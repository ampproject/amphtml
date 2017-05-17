/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

/** @enum {string} */
export const FilterType = {
  CLICK_DELAY: 'click_delay',
  CLICK_LOCATION: 'click_location',
};

/** @interface */
export class Filter {
  /**
   * @param {!Object<string, string|number>} spec
   * @param {!Event} event
   * @return {boolean} Whether the exit is allowed.
   */
  filter(spec, event) {}
}
