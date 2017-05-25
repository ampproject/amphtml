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

import {analyticsForDoc} from '../../../src/analytics';
import {timerFor} from '../../../src/services';

/**
 * @typedef {{
 *   visiblePercentageMin: number,
 *   totalTimeMin: number,
 *   continuousTimeMin: number,
 *   refreshInterval: number,
 * }}
 */
export let RefreshConfig;

/** @type {!RefreshConfig} */
const DEFAULT_CONFIG = {
  visiblePercentageMin: 50,
  totalTimeMin: 0,
  continuousTimeMin: 5000,
  refreshInterval: 5000,
};

export class RefreshManager {

  /**
   * @param {!Window} win
   * @param {!Element} element The element to be registered.
   * @param {function(RefreshManager)} callback The function to be invoked when
   *     the element is refreshed.
   * @param {RefreshConfig=} config Specifies the viewability conditions and
   *     the refresh interval.
   */
  constructor(win, element, callback, config = DEFAULT_CONFIG) {

    /** @const @private {!Window} */
    this.win_ = win;

    /** @const @private {!Element} */
    this.element_ = element;

    /** @const @private {function(RefreshManager)} */
    this.callback_ = callback;

    /** @const @private {!RefreshConfig} */
    this.config_ = config;

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = timerFor(win);

    /** @private {?(number|string)} */
    this.refreshTimeoutId_ = null;
  }


  /**
   * Initiates the refresh cycle by initiating the visibility manager on the
   * element.
   */
  initiateRefreshCycle() {
    analyticsForDoc(this.element_, true).then(analytics => {
      analytics.getAnalyticsRoot(this.element_).getVisibilityManager()
          .listenElement(this.element_, this.config_, null, null, () => {
            this.refreshTimeoutId_ = this.timer_.delay(() => {
              this.callback_(this);
            }, this.config_.refreshInterval);
          });
    });
  }
}
