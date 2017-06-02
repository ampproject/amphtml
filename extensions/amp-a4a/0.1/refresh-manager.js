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
import {refreshConfigs} from '../../../ads/_a4a-config';
import {timerFor} from '../../../src/services';

/**
 * visibilePercentageMin - The percentage of pixels that need to be on screen
 *   for the creative to be considered "visible".
 * totalTimeMin - The total amount of time, in milliseconds, that the creative
 *   must be on screen in order to be considered "visible".
 * continuousTimeMin - The amount of continuous time, in milliseconds, that the
 *   creative must be on screen for in oreder to be considered "visible"
 * refreshInterval - The amount of time, in milliseconds, that must pass in
 *   between the creative being "seen" and the refresh trigger.
 *
 * @typedef {{
 *   visiblePercentageMin: number,
 *   totalTimeMin: number,
 *   continuousTimeMin: number,
 *   refreshInterval: number,
 * }}
 */
export let RefreshConfig;

export class RefreshManager {

  /**
   * @param {!./amp-a4a.AmpA4A} a4a The AmpA4A instance to be refreshed.
   */
  constructor(a4a) {

    /** @const @private {!./amp-a4a.AmpA4A} */
    this.a4a_ = a4a;

    /** @const @private {!Window} */
    this.win_ = a4a.win;

    /** @const @private {!Element} */
    this.element_ = a4a.element;

    /** @const @private {string} */
    this.adType_ = this.element_.getAttribute('type');

    /** @const @private {!RefreshConfig} */
    this.config_ = refreshConfigs[this.adType_];

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = timerFor(this.win_);

    /** @private {?(number|string)} */
    this.refreshTimeoutId_ = null;
  }


  /**
   * Initiates the refresh cycle by initiating the visibility manager on the
   * element.
   */
  initiateRefreshCycle() {
    if (!this.isRefreshEnabled_()) {
      // This instance of AmpA4A is not eligible for refresh, or does not have
      // it enabled.
      return;
    }
    analyticsForDoc(this.element_, true).then(analytics => {
      analytics.getAnalyticsRoot(this.element_).getVisibilityManager()
          .listenElement(this.element_, this.config_, null, null, () => {
            this.refreshTimeoutId_ = this.timer_.delay(() => {
              this.a4a_.refresh(() => {
                this.initiateRefreshCycle();
              });
            }, this.config_.refreshInterval);
          });
    });
  }

  /**
   * If this ad slot's network has opted in for refresh, and refresh has been
   * enabled on this slot, this method will return the refresh configuration
   * for this slot; otherwise, it will return null.
   *
   */
  isRefreshEnabled_() {
    if (!this.config_) {
      // Network has not opted in for refresh eligibility; we can ignore any
      // and all publisher configurations related to refresh.
      return false;
    }
    /** @type ?NodeList<!Element> */
    let metaTag;
    return this.element_.getAttribute('data-enable-refresh') == 'true' ||
        ((metaTag = this.win_.document.getElementsByName(
            `amp-ad-enable-refresh:${this.adType_}`)) && metaTag[0] &&
         metaTag[0].getAttribute('content') == 'true');
  }
}
