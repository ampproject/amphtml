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

import {FilterType, Filter} from './filter';
import {user} from '../../../../src/log';

export class ClickDelayFilter extends Filter {
  /**
   * @param {string} name The user-defined name of the filter.
   * @param {!../config.ClickDelayConfig} spec
   */
  constructor(name, spec) {
    super(name);
    user().assert(isValidClickDelaySpec(spec), 'Invalid ClickDelay spec');

    this.delay_ = spec.delay;

    /** @private {number} */
    this.inViewportTime_ = Date.now();
  }

  /** @override */
  filter() {
    return (Date.now() - this.inViewportTime_) >= this.delay_;
  }
}

/**
 * @param {!../config.FilterConfig} spec
 * @return {boolean} Whether the config defines a ClickDelay filter.
 */
function isValidClickDelaySpec(spec) {
  return spec.type == FilterType.CLICK_DELAY && typeof spec.delay == 'number' &&
      spec.delay > 0;
}

export function makeClickDelaySpec(delay) {
  return {type: FilterType.CLICK_DELAY, delay};
}
