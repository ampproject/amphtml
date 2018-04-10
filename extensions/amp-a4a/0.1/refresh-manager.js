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

import {RefreshIntersectionObserverWrapper} from './refresh-intersection-observer-wrapper';
import {Services} from '../../../src/services';
import {dev, user} from '../../../src/log';

/**
 * - visibilePercentageMin: The percentage of pixels that need to be on screen
 *   for the creative to be considered "visible".
 * - continuousTimeMin: The amount of continuous time, in milliseconds, that
 *   the creative must be on screen for in order to be considered "visible".
 *
 * @typedef {{
 *   visiblePercentageMin: number,
 *   continuousTimeMin: number,
 * }}
 */
export let RefreshConfig;

export const MIN_REFRESH_INTERVAL = 30;
export const DATA_ATTR_NAME = 'data-enable-refresh';
export const DATA_MANAGER_ID_NAME = 'data-amp-ad-refresh-id';
export const METATAG_NAME = 'amp-ad-enable-refresh';

const TAG = 'AMP-AD';

/**
 * Retrieves the publisher-specified refresh interval, if one were set. This
 * function first checks for appropriate slot attributes and then for
 * metadata tags, preferring whichever it finds first.
 * @param {!Element} element
 * @param {!Window} win
 * @return {?number}
 * @visibleForTesting
 */
export function getPublisherSpecifiedRefreshInterval(element, win) {
  const refreshInterval = element.getAttribute(DATA_ATTR_NAME);
  if (refreshInterval) {
    return checkAndSanitizeRefreshInterval(refreshInterval);
  }
  let metaTag;
  const metaTagContent = ((metaTag = win.document
      .getElementsByName(METATAG_NAME))
      && metaTag[0]
      && metaTag[0].getAttribute('content'));
  if (!metaTagContent) {
    return null;
  }
  const networkIntervalPairs = metaTagContent.split(',');
  for (let i = 0; i < networkIntervalPairs.length; i++) {
    const pair = networkIntervalPairs[i].split('=');
    user().assert(pair.length == 2, 'refresh metadata config must be of ' +
        'the form `network_type=refresh_interval`');
    if (pair[0].toLowerCase() == element.getAttribute('type').toLowerCase()) {
      return checkAndSanitizeRefreshInterval(pair[1]);
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
function checkAndSanitizeRefreshInterval(refreshInterval) {
  const refreshIntervalNum = Number(refreshInterval);
  if (isNaN(refreshIntervalNum) ||
      refreshIntervalNum < MIN_REFRESH_INTERVAL) {
    user().warn(TAG,
        'invalid refresh interval, must be a number no less than ' +
        `${MIN_REFRESH_INTERVAL}: ${refreshInterval}`);
    return null;
  }
  return refreshIntervalNum * 1000;
}

/**
 * Defines the DFA states for the refresh cycle.
 *
 * 1. All newly registered elements begin in the INITIAL state.
 * 2. Only when the element enters the viewport with the specified
 *    intersection ratio does it transition into the VIEW_PENDING state.
 * 3. If the element remains in the viewport for the specified duration, it
 *    will then transition into the REFRESH_PENDING state, otherwise it will
 *    transition back into the INITIAL state.
 * 4. The element will remain in REFRESH_PENDING state until the refresh
 *    interval expires.
 * 5. Once the interval expires, the element will return to the INITIAL state.
 *
 * @enum {string}
 */
const RefreshLifecycleState = {
  /**
   * Element has been registered, but not yet seen on screen.
   */
  INITIAL: 'initial',

  /**
   * The element has appeared in the viewport, but not yet for the required
   * duration.
   */
  VIEW_PENDING: 'view_pending',

  /**
   * The element has been in the viewport for the required duration; the
   * refresh interval for the element has begun.
   */
  REFRESH_PENDING: 'refresh_pending',
};

/**
 * An object containing the IntersectionObservers used to monitor elements.
 * Each IO is configured to a different threshold, and all elements that
 * share the same visiblePercentageMin will be monitored by the same IO.
 *
 * @const {!Object<string, (!IntersectionObserver|!RefreshIntersectionObserverWrapper)>}
 */
const observers = {};

/**
 * An object containing all currently active RefreshManagers. This is used in
 * the IntersectionOberserver callback function to find the appropriate element
 * target.
 *
 * @const {!Object<string, !RefreshManager>}
 */
const managers = {};

/**
 * Used to generate unique IDs for each RefreshManager.
 * @type {number}
 */
let refreshManagerIdCounter = 0;

/**
 * Returns an instance of RefreshManager, if refresh is enabled on the page or
 * slot. An optional predicate for eligibility may be passed. If refresh is not
 * enabled, or fails the optional predicate, null will be returned.
 *
 * @param {!./amp-a4a.AmpA4A} a4a
 * @param {function():boolean=} opt_predicate
 * @return {?RefreshManager}
 */
export function getRefreshManager(a4a, opt_predicate) {
  const refreshInterval =
      getPublisherSpecifiedRefreshInterval(a4a.element, a4a.win);
  if (!refreshInterval || (opt_predicate && !opt_predicate())) {
    return null;
  }
  return new RefreshManager(a4a, {
    visiblePercentageMin: 50,
    continuousTimeMin: 1,
  }, refreshInterval);
}


export class RefreshManager {

  /**
   * @param {!./amp-a4a.AmpA4A} a4a The AmpA4A instance to be refreshed.
   * @param {!RefreshConfig} config
   * @param {number} refreshInterval
   */
  constructor(a4a, config, refreshInterval) {

    /** @private {string} */
    this.state_ = RefreshLifecycleState.INITIAL;

    /** @const @private {!./amp-a4a.AmpA4A} */
    this.a4a_ = a4a;

    /** @const @private {!Window} */
    this.win_ = a4a.win;

    /** @const @private {!Element} */
    this.element_ = a4a.element;

    /** @const @private {string} */
    this.adType_ = this.element_.getAttribute('type').toLowerCase();

    /** @const @private {?number} */
    this.refreshInterval_ = refreshInterval;

    /** @const @private {!RefreshConfig} */
    this.config_ = this.convertAndSanitizeConfiguration_(config);

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.win_);

    /** @private {?(number|string)} */
    this.refreshTimeoutId_ = null;

    /** @private {?(number|string)} */
    this.visibilityTimeoutId_ = null;

    const managerId = String(refreshManagerIdCounter++);
    this.element_.setAttribute(DATA_MANAGER_ID_NAME, managerId);
    managers[managerId] = this;
    this.initiateRefreshCycle();
  }

  /**
   * Returns an IntersectionObserver configured to the given threshold, creating
   * one if one does not yet exist.
   *
   * @param {number} threshold
   * @return {(!IntersectionObserver|!RefreshIntersectionObserverWrapper)}
   */
  getIntersectionObserverWithThreshold_(threshold) {

    const thresholdString = String(threshold);
    return observers[thresholdString] ||
        (observers[thresholdString] = 'IntersectionObserver' in this.win_
          ? new this.win_['IntersectionObserver'](this.ioCallback_, {threshold})
          : new RefreshIntersectionObserverWrapper(
              this.ioCallback_, this.a4a_, {threshold}));
  }

  /**
   * Returns a function that will be invoked directly by the
   * IntersectionObserver implementation. It will implement the core logic of
   * the refresh lifecycle, including the transitions of the DFA.
   *
   * @param {!Array<!IntersectionObserverEntry>} entries
   */
  ioCallback_(entries) {
    entries.forEach(entry => {
      const refreshManagerId = entry.target.getAttribute(DATA_MANAGER_ID_NAME);
      dev().assert(refreshManagerId);
      const refreshManager = managers[refreshManagerId];
      if (entry.target != refreshManager.element_) {
        return;
      }
      switch (refreshManager.state_) {
        case RefreshLifecycleState.INITIAL:
          // First check if the element qualifies as "being on screen", i.e.,
          // that at least a minimum threshold of pixels is on screen. If so,
          // begin a timer, set for the duration of the minimum time on screen
          // threshold. If this timer runs out without interruption, then all
          // viewability conditions have been met, and we can begin the refresh
          // timer.
          if (entry.intersectionRatio >=
              refreshManager.config_.visiblePercentageMin) {
            refreshManager.state_ = RefreshLifecycleState.VIEW_PENDING;
            refreshManager.visibilityTimeoutId_ = refreshManager.timer_.delay(
                () => {
                  refreshManager.state_ = RefreshLifecycleState.REFRESH_PENDING;
                  refreshManager.startRefreshTimer_();
                }, refreshManager.config_.continuousTimeMin);
          }
          break;
        case RefreshLifecycleState.VIEW_PENDING:
          // If the element goes off screen before the minimum on screen time
          // duration elapses, place it back into INITIAL state.
          if (entry.intersectionRatio <
              refreshManager.config_.visiblePercentageMin) {
            refreshManager.timer_.cancel(refreshManager.visibilityTimeoutId_);
            refreshManager.visibilityTimeoutId_ = null;
            refreshManager.state_ = RefreshLifecycleState.INITIAL;
          }
          break;
        case RefreshLifecycleState.REFRESH_PENDING:
        default:
          break;
      }
    });
  }

  /**
   * Initiates the refresh cycle by initiating the visibility manager on the
   * element.
   */
  initiateRefreshCycle() {
    switch (this.state_) {
      case RefreshLifecycleState.INITIAL:
        this.getIntersectionObserverWithThreshold_(
            this.config_.visiblePercentageMin).observe(this.element_);
        break;
      case RefreshLifecycleState.REFRESH_PENDING:
      case RefreshLifecycleState.VIEW_PENDING:
      default:
        break;

    }
  }

  /**
   * Starts the refresh timer for the given monitored element.
   *
   * @return {!Promise<boolean>} A promise that resolves to true when the
   *    refresh timer elapses successfully.
   */
  startRefreshTimer_() {
    return new Promise(resolve => {
      this.refreshTimeoutId_ = this.timer_.delay(() => {
        this.state_ = RefreshLifecycleState.INITIAL;
        this.getIntersectionObserverWithThreshold_(
            this.config_.visiblePercentageMin).unobserve(this.element_);
        this.a4a_.refresh(() => this.initiateRefreshCycle());
        resolve(true);
      }, /** @type {number} */ (this.refreshInterval_));
    });
  }

  /**
   * Converts config to appropriate units, modifying the argument in place. This
   * also ensures that visiblePercentageMin is in the range of [0, 100].
   * @param {!RefreshConfig} config
   * @return {!RefreshConfig}
   */
  convertAndSanitizeConfiguration_(config) {
    dev().assert(config['visiblePercentageMin'] >= 0 &&
        config['visiblePercentageMin'] <= 100,
    'visiblePercentageMin for refresh must be in the range [0, 100]');
    // Convert seconds to milliseconds.
    config['continuousTimeMin'] *= 1000;
    config['visiblePercentageMin'] /= 100;
    return config;
  }
}

