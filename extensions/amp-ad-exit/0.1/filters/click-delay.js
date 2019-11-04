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
import {dev, userAssert} from '../../../../src/log';

/** @type {string} */
const TAG = 'amp-ad-exit';

export class ClickDelayFilter extends Filter {
  /**
   * @param {string} name The user-defined name of the filter.
   * @param {!../config.ClickDelayConfig} spec
   * @param {!Window} win
   */
  constructor(name, spec, win) {
    super(name, spec.type);
    userAssert(
      spec.type == FilterType.CLICK_DELAY &&
        typeof spec.delay == 'number' &&
        spec.delay > 0,
      'Invalid ClickDelay spec'
    );

    /**
     * @const {!../config.ClickDelayConfig}
     * @visibleForTesting
     */
    this.spec = spec;

    /**
     * @type {number}
     * @visibleForTesting
     */
    this.intervalStart = Date.now();

    if (spec.startTimingEvent) {
      if (!win['performance'] || !win['performance']['timing']) {
        dev().warn(
          TAG,
          'Browser does not support performance timing, ' +
            'falling back to now'
        );
      } else if (
        win['performance']['timing'][spec.startTimingEvent] == undefined
      ) {
        dev().warn(
          TAG,
          `Invalid performance timing event type ${spec.startTimingEvent}` +
            ', falling back to now'
        );
      } else {
        this.intervalStart =
          win['performance']['timing'][spec.startTimingEvent];
      }
    }
  }

  /** @override */
  filter() {
    return Date.now() - this.intervalStart >= this.spec.delay;
  }
}

/**
 * @param {number} delay
 * @param {string=} startTimingEvent
 * @return {!../config.ClickDelayConfig}
 */
export function makeClickDelaySpec(delay, startTimingEvent = undefined) {
  return {type: FilterType.CLICK_DELAY, delay, startTimingEvent};
}
