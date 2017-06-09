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
 *   creative must be on screen for in oreder to be considered "visible".
 *
 * @typedef {{
 *   visiblePercentageMin: number,
 *   totalTimeMin: number,
 *   continuousTimeMin: number,
 * }}
 */
export let RefreshConfig;

export const MIN_REFRESH_INTERVAL = 3;
export const DATA_ATTR_NAME = 'data-enable-refresh';
export const METATAG_NAME = 'amp-ad-enable-refresh';

const TAG = 'AMP-AD';

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

    /** @const @private {?number} */
    this.refreshInterval_ = this.getPublisherSpecifiedRefreshInterval_();

    /** @const @private {!RefreshConfig} */
    this.config_ = this.getConfiguration_();

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = timerFor(this.win_);

    /** @private {?(number|string)} */
    this.refreshTimeoutId_ = null;

    /** @private {boolean} */
    this.isRefreshable_ = !!(this.config_  // The network has opted-in.
        // The publisher has enabled refresh on this slot.
        && (this.refreshInterval_ || this.refreshInterval_ == '')
        // The slot is contained only within container types eligible for
        // refresh.
        && !getEnclosingContainerTypes(this.element_).filter(container =>
          container != ValidAdContainerTypes['AMP-CAROUSEL']
          && container != ValidAdContainerTypes['AMP-STICKY-AD']).length);
  }


  /**
   * Initiates the refresh cycle by initiating the visibility manager on the
   * element.
   *
   * @return {?Promise} Promise that resolves after refresh event. This promise
   *   is useful to have for test purposes.
   */
  initiateRefreshCycle() {
    if (!this.isRefreshable()) {
      return null;
    }
    return new Promise(resolve => {
      analyticsForDoc(this.element_, true).then(analytics => {
        analytics.getAnalyticsRoot(this.element_).getVisibilityManager()
            .listenElement(this.element_, this.config_, null, null, () => {
              this.refreshTimeoutId_ = this.timer_.delay(() => {
                this.a4a_.refresh(() => this.initiateRefreshCycle());
                resolve();
              }, /** @type {number} */ (this.refreshInterval_));
            });
      });
    });
  }

  /**
   * Terminates the current refresh cycle, if one currently exists. Returns
   * true if the cycle was canceled successfully, false otherwise.
   */
  stopRefreshCycle() {
    if (this.refreshTimeoutId_) {
      this.timer_.cancel(this.refreshTimeoutId_);
      this.refreshTimeoutId_ = null;
      return true;
    }
    return false;
  }

  /**
   * Retrieves the refresh configuration for this slot, as set by the ad
   * network.
   *
   * @return {!RefreshConfig}
   */
  getConfiguration_() {
    const config = refreshConfigs[this.adType_];
    // Convert seconds to milliseconds.
    config['totalTimeMin'] *= 1000;
    config['continuousTimeMin'] *= 1000;
    return config;
  }

  /**
   * Retrieves the publisher-specified refresh interval, if one were set.
   *
   * @return {?number}
   */
  getPublisherSpecifiedRefreshInterval_() {
    const refreshInterval = this.element_.getAttribute(DATA_ATTR_NAME);
    if (refreshInterval) {
      return this.checkAndSanitizeRefreshInterval_(refreshInterval);
    }
    let metaTag;
    const metaTagContent = ((metaTag = this.win_.document
          .getElementsByName(METATAG_NAME))
        && metaTag[0]
        && metaTag[0].getAttribute('content'));
    const networkIntervalPairs =
        metaTagContent ? metaTagContent.split(',') : [];
    for (let i = 0; i < networkIntervalPairs.length; i++) {
      const pair = networkIntervalPairs[i].split('=');
      if (pair.length != 2) {
        user().warn(TAG,
            'refresh metadata config must be of the form ' +
            '`network_type=refresh_interval`');
      } else if (pair[0] == this.adType_) {
        return this.checkAndSanitizeRefreshInterval_(pair[1]);
      }
    }
    return null;
  }

  /**
   * Ensures that refreshInterval is a number no less than 30. Returns null if
   * the given input fails to meet these criteria. This also converts from
   * seconds to milliseconds.
   *
   * @param {(number|string)} refreshInterval
   * @return {?number}
   */
  checkAndSanitizeRefreshInterval_(refreshInterval) {
    if (isNaN(refreshInterval) || refreshInterval == '') {
      user().warn(TAG, 'refresh interval must be a number');
      return null;
    } else if (refreshInterval < MIN_REFRESH_INTERVAL) {
      user().warn(TAG,
          `refresh interval must be at least ${MIN_REFRESH_INTERVAL}s`);
      return MIN_REFRESH_INTERVAL * 1000;
    }
    return Number(refreshInterval) * 1000;
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
  isRefreshable() {
    return this.isRefreshable_;
  }
}
