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

    /**
     * This must be defined before getConfiguration_ is called, since that
     * function can override this value.
     *
     * @private {boolean}
     */
    this.enabled_ = false;

    /** @const @private {!RefreshConfig} */
    this.config_ = this.getConfiguration_();

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
    if (!this.enabled_) {
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
   * Retrieves the refresh configuration for this slot. The base of the
   * configuration is set by the network, but the refresh interval must be set
   * at the page or slot level in order for the slot to be refresh-enabled.
   *
   * @return {!RefreshConfig}
   */
  getConfiguration_() {
    const networkConfig = refreshConfigs[this.adType_];
    let metaTag = [];
    const refreshInterval = this.element_.getAttribute('data-enable-refresh') ||
        ((metaTag = this.win_.document.getElementsByName(
            `amp-ad-enable-refresh:${this.adType_}`)) && metaTag[0] &&
         metaTag[0].getAttribute('content'));
    if (refreshInterval != 'false' && !isNaN(refreshInterval)) {
      if (refreshInterval) {
        // If we're here, then data-enable-refresh is set, and it's a number.
        // This check is needed because isNaN(undefined) and isNaN('') are both
        // false, so it's possible that refreshInterval == undefined or
        // refreshInterval == ''.
        networkConfig['refreshInterval'] =
            // TODO(levitzky) Using 5 only for testing.
            Math.max(5, Number(refreshInterval));
        // TODO(levitzky) Should we print some error to the console if the
        // publisher's refresh interval is less than 30?
      }
      this.enabled_ = true;
    }
    return networkConfig;
  }
}
