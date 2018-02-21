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

import {Filter, FilterType} from './filter';
import {dev, user} from '../../../../src/log';
import {matches} from '../../../../src/dom';

/**
 * A Filter that ignores events originating from elements that match a specified
 * element selector.
 */
export class InactiveElementFilter extends Filter {
  /**
   * @param {string} name The user-defined name of the filter.
   * @param {!../config.InactiveElementConfig} spec
   */
  constructor(name, spec) {
    super(name);
    user().assert(isValidInactiveElementSpec(spec),
        'Invalid InactiveElementspec');

    /** @private {string} */
    this.selector_ = spec.selector;
  }

  /** @override */
  filter(event) {
    const element = dev().assertElement(event.target);
    return !matches(element, this.selector_);
  }
}

/**
 * @param {!../config.InactiveElementConfig} spec
 * @return {boolean} Whether the config defines a InactiveElement filter.
 */
function isValidInactiveElementSpec(spec) {
  return spec.type == FilterType.INACTIVE_ELEMENT &&
      typeof spec.selector == 'string';
}

/**
 * @param {string} selector A CSS selector matching elements to ignore.
 */
export function makeInactiveElementSpec(selector) {
  return {type: FilterType.INACTIVE_ELEMENT, selector};
}
