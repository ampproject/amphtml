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
  CLICK_DELAY: 'clickDelay',
  CLICK_LOCATION: 'clickLocation',
};

export class Filter {
  /** @param {string} name The name given to this filter. */
  constructor(name) {
    /** @const {string} */
    this.name = name;
  }

  /**
   * @param {!../../../../src/service/action-impl.ActionEventDef} event
   * @return {boolean} Whether the exit is allowed.
   */
  /* eslint-disable no-unused-vars */
  filter(event) {}

  /** Initializes the filter when the parent element is built, if necessary. */
  buildCallback() {}
}
