/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {IntersectionObserverPolyfill} from '../../../src/intersection-observer-polyfill';
import {timerFor} from '../../../src/services';

/**
 * Returns the singleton instance of the refresher from the window object, or
 * creates and returns one if one has not yet been constructed.
 *
 * @param {!Window} win
 * @return {!Refresher}
 */
export function getRefresherFor(win) {
  const nameInWindow = 'AMP_A4A_REFRESHER';
  return win[nameInWindow] || (win[nameInWindow] = new Refresher(win));
}

const DEFAULT_VISIBILITY_THRESHOLD = 0.5;
const DEFAULT_MIN_ON_SCREEN_TIME = 1000;  // In ms.
const ELEMENT_REFERENCE_ATTRIBUTE = 'data-amp-a4a-refresh-id';

/**
 * Bundles together all relevant state data concerning an individual element
 * being monitored.
 *
 * @typedef {{
 *   onScreenTimeoutId: {?(number|string)},
 *   refreshTimeoutId: {?(number|string)},
 *   visibilityThreshold: {number},
 *   minOnScreenTime: {number},
 *   refreshInterval: {number},
 *   callback: {function},
 *   state: {string}
 * }} */
let RefreshStateInfo;

/**
 * Defines the DFA states for the refresh cycle.
 *
 * (1) All newly registered elements begin in the INITIAL state.
 * (2) Only when the element enters the viewport with the specified
 *     intersection ratio does it transition into the VIEW_PENDING state.
 * (3) If the element remains in the viewport for the specified duration, it
 *     will then transition into the REFRESH_PENDING state, otherwise it will
 *     transition back into the INITIAL state.
 * (4) The element will remain in REFRESH_PENDING state until the refresh
 *     interval expires.
 * (5) Once the interval expires, the element will enter the REFRESHED state.
 *     The element will remain in this state until reset() is called on the
 *     element, at which point it will return to the INITIAL state.
 *
 * @enum {String}
 */
const REFRESH_STATE = {
  // Element has been registered, but not yet seen on screen.
  INITIAL: 'initial',
  // The element has appeared in the viewport, but not yet for the required
  // duration.
  VIEW_PENDING: 'view_pending',
  // The element has been in the viewport for the required duration; the
  // refresh interval for the element has begun.
  REFRESH_PENDING: 'refresh_pending',
  // The refresh interval has elapsed; the element is in the process of being
  // refreshed.
  REFRESHED: 'refreshed',
};

export class Refresher {

  /**
   * @param {!Window} win
   */
  constructor(win) {

    /** @const @private {!Window} */
    this.win_ = win;

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = timerFor(win);

    /**
     * The Intersection Observer used for all monitored elements.
     *
     * @const @private {!IntersectionObserver|!IntersectionObserverPolyfill}
     */
    this.intersectionObserver_ = 'IntersectionObserver' in win
        ? new win['IntersectionObserver'](this.ioCallback_, ioConfig)
        : new IntersectionObserverPolyfill(this.ioCallback_, ioConfig);


    /**
     * A an object containing the RefreshState of all elements currently being
     * monitored, indexed by a unique ID stored as data-amp-a4a-refresh-id on
     * the element.
     *
     * @const @private {!Object<string, RefreshStateInfo>}
     */
    this.refreshStateInfos_ = {};

    /**
     * Used to distinguish elements in this.intersectionObservers_. This is
     * incremented with each newly registered element.
     *
     * @private {number}
     */
    this.elementReferenceId_ = 0;
  }

  ioCallback_(entries) {
    for (entry of entries) {
      const elementReference = entry.target.getAttribute(
          ELEMENT_REFERENCE_ATTRIBUTE);
      const refreshStateInfo = this.refreshStateInfos_[elementReference];
      switch (refreshStateInfo.state) {
        case INITIAL:
          if (entry.intersectionRatio >=
              refreshStateInfo.visibilityThreshold) {
            refreshStateInfo.state = REFRESH_STATE.VIEW_PENDING;
            refreshStateInfo.onScreenTimeoutId = this.timer_.delay(() => {
              refreshStateInfo.state = REFRESH_STATE.REFRESH_PENDING;
              this.startRefreshTimer_(refreshStateInfo);
            }, refreshStateInfo.minOnScreenTime);
          }
          break;
        case VIEW_PENDING:
          // If the element goes off screen before the minimum on screen time
          // duration elapses, place it back into INITIAL state.
          if (entry.intersectionRatio < refreshStateInfo.visibilityThreshold) {
            this.timer_.cancel(refreshStateInfo.onScreenTimeoutId);
            refreshStateInfo.state = REFRESH_STATE.INITIAL;
          }
          break;
        case REFRESH_PENDING:
        case REFRESHED:
        default:
          break;
      }
    }
  }

  registerElement(element, callback, refreshInterval, opt_config) {
    const refreshStateInfo = {
      visibilityThreshold: (opt_config && opt_config['threshold'])
          || DEFAULT_VISIBILITY_THRESHOLD,
      minOnScreenTime: (opt_config && opt_config['minOnScreenTime'])
          || DEFAULT_MIN_ON_SCREEN_TIME;
      callback,
      refreshInterval,
    };
    const uniqueId = `elementReference.${this.elementReferenceId_++}`;
    this.refreshStateInfos_[uniqueId] = /** @type {RefreshStateInfo} */
        (refreshStateInfo);
    element.setAttribute(ELEMENT_REFERENCE_ATTRIBUTE, uniqueId);
    intersectionObserver.observe(element);
  }

  startRefreshTimer_(refreshStateInfo) {
    this.timer_.delay(() => {
      refreshStateInfo.state = REFRESH_STATE.REFRESHED;
      refreshStateInfo.callback();
    }, refreshStateInfo.refreshInterval);
  }

  getRefreshStateInfo_(element) {
    // TODO(levitzky) assert that ELEMENT_REFERENCE_ATTRIBUTE exists.
    const id = element.getAttribute(ELEMENT_REFERENCE_ATTRIBUTE);
    // TODO(levitzky) assert that this.refreshStateInfos_ contains id.
    return this.refreshStateInfos_[id];
  }

  reset(element) {
    const info = this.getRefreshStateInfo_(element);
    info.state = REFRESH_STATE.INITIAL;
    info.onScreenTimeoutId = null;
  }

  restartRefreshTimer(element) {
    const info = this.getRefreshStateInfo(element);
    if (info.state != REFRESH_STATE.REFRESH_PENDING) {
      return;
    }
    const refreshTimeoutId = info.refreshTimeoutId;
    this.timer_.cancel(refreshTimeoutId);
    startRefreshTimer_(info);
  }
}
