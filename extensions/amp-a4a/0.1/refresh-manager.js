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
import {
  getEnclosingContainerTypes,
  ValidAdContainerTypes,
} from '../../../ads/google/a4a/utils';
import {user} from '../../../src/log';

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

export const MIN_REFRESH_INTERVAL = 30;
export const DATA_ATTR_NAME = 'data-enable-refresh';
export const METADATA_NAME = 'amp-ad-enable-refresh';

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
     * Represents the refresh interval in between refresh events. This is a
     * string because this value comes directly from the data-attribute on the
     * ad slot, and may have the value "false", indicating that this slot should
     * not be refresh-enabled, the value "", indicating that the
     * network-default refresh interval should be used, and null, indicating
     * that the publisher has not enabled this slot for refresh.
     *
     * Note: a value of "false" differs from null in that the former implies
     * that refresh is globally enabled on the page, but disabled for this
     * specific slot, whereas null indicates that the publisher has not enabled
     * refresh on the page (and therefore this slot) altogether.
     *
     * @const @private {?string} */
    this.refreshInterval_ = this.getPublisherSpecifiedRefreshInterval_();

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
   *
   * @return {?Promise} Promise that resolves after refresh event. This promise
   *   is useful to have for test purposes.
   */
  initiateRefreshCycle() {
    return new Promise(resolve => {
      analyticsForDoc(this.element_, true).then(analytics => {
        analytics.getAnalyticsRoot(this.element_).getVisibilityManager()
            .listenElement(this.element_, this.config_, null, null, () => {
              this.refreshTimeoutId_ = this.timer_.delay(() => {
                this.a4a_.refresh(() => this.initiateRefreshCycle());
                resolve();
              }, this.config_.refreshInterval);
            });
      });
    });
  }

  /**
   * Terminates the current refresh cycle, if one currently exists. This
   * function also returns a courtesy callback, which, if invoked, will
   * initiate a new refresh cycle.
   */
  stopRefreshCycle() {
    if (this.refreshTimeoutId_) {
      this.timer_.cancel(this.refreshTimeoutId_);
      this.refreshTimeoutId_ = null;
    }
  }

  /**
   * Retrieves the refresh configuration for this slot, as set by the ad
   * network.
   *
   * @return {!RefreshConfig}
   */
  getConfiguration_() {
    const config = refreshConfigs[this.adType_];
    if (this.refreshInterval_ && this.refreshInterval_ != 'false') {
      config['refreshInterval'] = this.refreshInterval_;
    }
    // Convert seconds to milliseconds.
    config['totalTimeMin'] *= 1000;
    config['continuousTimeMin'] *= 1000;
    config['refreshInterval'] *= 1000;
    return config;
  }

  /**
   * Retrieves the publisher-specified refresh interval, if one were set.
   *
   * @return {?string}
   */
  getPublisherSpecifiedRefreshInterval_() {
    let metaTag = [];
    let refreshInterval = this.element_.getAttribute(DATA_ATTR_NAME)
        || ((metaTag = this.win_.document.getElementsByName(
            `${METADATA_NAME}:${this.adType_}`))
            && metaTag[0]
            && metaTag[0].getAttribute('content'));
    if (refreshInterval != 'false' && !isNaN(refreshInterval)) {
      if (refreshInterval) {
        // If we're here, then data-enable-refresh is set, and it's a number.
        // This check is needed because isNaN(undefined) and isNaN('') are both
        // false, so it's possible that refreshInterval == undefined or
        // refreshInterval == '' after first check.
        if (refreshInterval < MIN_REFRESH_INTERVAL) {
          user().warn(
              `refresh interval must be at least ${MIN_REFRESH_INTERVAL}s`);
          refreshInterval = String(MIN_REFRESH_INTERVAL);
        }
      }
      return refreshInterval;
    }
    return null;
  }

  /**
   * Returns true if this slot is eligible and enabled for refresh. A slot is
   * eligible for refresh if it is of a network type that has opted in to
   * refresh eligibility, and is not the child of an invalid container type
   * (the only valid types are carousel and sticky-ad). The slot is
   * refresh-enabled if the publisher has supplied an appropriate data
   * attribute either on the slot or as part of a meta tag.
   *
   * @return {boolean}
   */
  isEligibleForRefresh() {
        // The network has opted into refresh.
    return !!(this.config_
        // The publisher has enabled refresh on this slot.
        && (this.refreshInterval_ || this.refreshInterval_ == '')
        // The slot is contained only within container types eligible for
        // refresh.
        && !getEnclosingContainerTypes(this.element_).filter(container =>
            container != ValidAdContainerTypes['AMP-CAROUSEL']
            && container != ValidAdContainerTypes['AMP-STICKY-AD']).length);
  }
}
