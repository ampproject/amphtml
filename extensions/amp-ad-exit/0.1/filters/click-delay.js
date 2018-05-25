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

import {Filter, FilterType} from './filter';
<<<<<<< HEAD
import {dev, user} from '../../../../src/log';

/** @type {string} */
const TAG = 'amp-ad-exit';
=======
import {user} from '../../../../src/log';
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d

export class ClickDelayFilter extends Filter {
  /**
   * @param {string} name The user-defined name of the filter.
   * @param {!../config.ClickDelayConfig} spec
<<<<<<< HEAD
   * @param {!Window} win
   */
  constructor(name, spec, win) {
    super(name);
    user().assert(spec.type == FilterType.CLICK_DELAY &&
      typeof spec.delay == 'number' && spec.delay > 0,
    'Invalid ClickDelay spec');

    /**
    * @type {number}
    * @visibleForTesting
    */
    this.intervalStart = Date.now();

    if (spec.startTimingEvent) {
      if (!win['performance'] || !win['performance']['timing']) {
        dev().warn(TAG, 'Browser does not support performance timing, ' +
            'falling back to now');
      } else if (
        win['performance']['timing'][spec.startTimingEvent] == undefined) {
        dev().warn(TAG,
            `Invalid performance timing event type ${spec.startTimingEvent}` +
            ', falling back to now');
      } else {
        this.intervalStart =
          win['performance']['timing'][spec.startTimingEvent];
      }
    }

    /** @private {number} */
    this.delay_ = spec.delay;
=======
   */
  constructor(name, spec) {
    super(name);
    user().assert(isValidClickDelaySpec(spec), 'Invalid ClickDelay spec');

    this.delay_ = spec.delay;

    /** @private {number} */
    this.inViewportTime_ = Date.now();
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
  }

  /** @override */
  filter() {
<<<<<<< HEAD
    return (Date.now() - this.intervalStart) >= this.delay_;
  }
}

=======
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

>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
export function makeClickDelaySpec(delay) {
  return {type: FilterType.CLICK_DELAY, delay};
}
