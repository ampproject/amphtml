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

import {dev} from '../../../src/log';
import {IntersectionObserverPolyfill} from '../../../src/intersection-observer-polyfill';
import {timerFor} from '../../../src/services';

/**
 * Returns the singleton instance of the RefreshManager from the window object,
 * or creates and returns one, if one has not yet been constructed.
 *
 * @param {!Window} win
 * @return {!RefreshManager}
 */
export function getRefreshManagerFor(win) {
  const nameInWindow = 'AMP_A4A_REFRESHER';
  return win[nameInWindow] || (win[nameInWindow] = new RefreshManager(win));
}

const DEFAULT_MIN_ON_SCREEN_PIXEL_RATIO = 0.5;
const DEFAULT_MIN_ON_SCREEN_TIME = 1000;  // In ms.
const DEFAULT_REFRESH_INTERVAL = 30;  // In sec.
const ELEMENT_REFERENCE_ATTRIBUTE = 'data-amp-a4a-refresh-id';

/** @typedef {{
 *   minOnScreenPixelRatioThreshold: number,
 *   minOnScreenTimeThreshold: number,
 *   refreshInterval: number,
 * }} */
export let RefreshConfig;

/** @type {!RefreshConfig} */
const DEFAULT_CONFIG = {
  minOnScreenPixelRatioThreshold: DEFAULT_MIN_ON_SCREEN_PIXEL_RATIO,
  minOnScreenTimeThreshold: DEFAULT_MIN_ON_SCREEN_TIME,
  refreshInterval: DEFAULT_REFRESH_INTERVAL,
};


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
 * @enum {string}
 */
const RefreshLifecycleState = {
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

export class RefreshManager {

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
        ? new win['IntersectionObserver'](this.ioCallback_)
        : new IntersectionObserverPolyfill(this.ioCallback_);

    /**
     * A an object containing the RefreshState of all elements currently being
     * monitored, indexed by a unique ID stored as data-amp-a4a-refresh-id on
     * the element.
     *
     * @const @private {!Object<string, MonitoredElementWrapper>}
     */
    this.monitoredElementWrappers_ = {};

    /**
     * Used to distinguish elements in this.intersectionObservers_. This is
     * incremented with each newly registered element.
     *
     * @private {number}
     */
    this.elementReferenceId_ = 0;
  }

  /**
   * This function will be invoked directly by the IntersectionObserver
   * implementation. It will implement the core logic of the refresh lifecycle,
   * including the transitions of the DFA.
   */
  ioCallback_(entries) {
    entries.forEach(entry => {
      const wrapper = this.getElementWrapper_(entry.target);
      switch (wrapper.getRefreshLifecycleState()) {
        case RefreshLifecycleState.INITIAL:
          // First check if the element qualifies as "being on screen", i.e.,
          // that at least a minimum threshold of pixels is on screen. If so,
          // begin a timer, set for the duration of the minimum time on screen
          // threshold. If this timer runs out without interruption, then all
          // viewability conditions have been met, and we can begin the refresh
          // timer.
          if (entry.intersectionRatio >=
              wrapper.getMinOnScreenPixelRatioThreshold()) {
            wrapper.setRefreshLifecycleState(
                RefreshLifecycleState.VIEW_PENDING);
            const visibilityTimeoutId = this.timer_.delay(() => {
              wrapper.setRefreshLifecycleState(
                  RefreshLifecycleState.REFRESH_PENDING);
              this.startRefreshTimer_(wrapper);
            }, wrapper.getMinOnScreenTimeThreshold());
            wrapper.setVisibilityTimeoutId(visibilityTimeoutId);
          }
          break;
        case RefreshLifecycleState.VIEW_PENDING:
          // If the element goes off screen before the minimum on screen time
          // duration elapses, place it back into INITIAL state.
          if (entry.intersectionRatio <
              wrapper.getMinOnScreenPixelRatioThreshold()) {
            this.timer_.cancel(wrapper.getVisibilityTimeoutId());
            wrapper.setRefreshLifecycleState(RefreshLifecycleState.INITIAL);
          }
          break;
        case RefreshLifecycleState.REFRESH_PENDING:
        case RefreshLifecycleState.REFRESHED:
        default:
          break;
      }
    });
  }

  /**
   * Registers an element with the Refresh Manager. Registering an element will
   * enable it to be refreshed after it has satisfied viewability conditions,
   * and the refresh interval has elapsed.
   *
   * @param {!Element} element The element to be registered.
   * @param {!function()} callback The function to be invoked when the element is
   *     refreshed.
   * @param {?RefreshConfig} config Specifies the viewability conditions and the
   *     refresh interval.
   */
  registerElement(element, callback, config = DEFAULT_CONFIG) {
    const uniqueId = `elementReference.${this.elementReferenceId_++}`;
    this.monitoredElementWrappers_[uniqueId] = new MonitoredElementWrapper(
        callback,
        config.minOnScreenPixelRatioThreshold,
        config.minOnScreenTimeThreshold,
        config.refreshInterval);
    element.setAttribute(ELEMENT_REFERENCE_ATTRIBUTE, uniqueId);
    this.intersectionObserver_.observe(element);
  }

  /**
   * Starts the refresh timer for the given monitored element.
   *
   * @param {!MonitoredElementWrapper} elementWrapper
   */
  startRefreshTimer_(elementWrapper) {
    this.timer_.delay(() => {
      elementWrapper.setRefreshLifecycleState(RefreshLifecycleState.REFRESHED);
      elementWrapper.invokeCallback();
    }, elementWrapper.getRefreshInterval());
  }

  /**
   * @param {!Element} element The element whose wrapper is to be returned.
   */
  getElementWrapper_(element) {
    const id = element.getAttribute(ELEMENT_REFERENCE_ATTRIBUTE);
    dev().assert(id);
    const wrapper = this.monitoredElementWrappers_[id];
    dev().assert(wrapper);
    return wrapper;
  }

  /**
   * Resets the element to initial conditions. After invoking this function, it
   * will be as if the given element were just registered for the first time.
   *
   * @param {!Element} element
   */
  reset(element) {
    const wrapper = this.getElementWrapper_(element);
    this.timer_.cancel(wrapper.getRefreshTimeoutId());
    this.timer_.cancel(wrapper.getVisibilityTimeoutId());
    wrapper.reset();
  }

  /**
   * Resets the refresh timer for the given element, if one has already begun
   * ticking.
   *
   * @param {!Element} element
   */
  restartRefreshTimer(element) {
    const wrapper = this.getElementWrapper_(element);
    if (wrapper.getRefreshLifecycleState() !=
        RefreshLifecycleState.REFRESH_PENDING) {
      // Timer never started.
      return;
    }
    this.timer_.cancel(wrapper.getRefreshTimeoutId());
    this.startRefreshTimer_(wrapper);
  }
}

class MonitoredElementWrapper {

  /**
   * @param {!function()} callback The function to be invoked when the element
   *     is ready to be refreshed.
   * @param {number} minOnScreenPixelRatioThreshold The ratio of pixels of the
   *     element which must be on screen for part of the viewability condition
   *     to be satisfied.
   * @param {number} minOnScreenTimeThreshold The number of milliseconds the
   *     element must be on screen for part of the viewability condition to be
   *     satisfied.
   * @param {number} refreshInterval The number of seconds to wait before
   *     invoking the callback function.
   */
  constructor(
      callback,
      minOnScreenPixelRatioThreshold,
      minOnScreenTimeThreshold,
      refreshInterval) {

    /**
     * The function that will be invoked when the refreshInterval has expired.
     *
     * @private @const {!function()}
     */
    this.callback_ = callback;

    /**
     * The minimum number of pixels, as a ratio of total number of pixels,
     * that must appear on screen before the refresh timer begins counting
     * down.
     *
     * @private @const {number}
     */
    this.minOnScreenPixelRatioThreshold_ = minOnScreenPixelRatioThreshold;

    /**
     * The minimum time the element must be on screen before the refresh timer
     * begins counting down. Measured in milliseconds.
     *
     * @private @const {number}
     */
    this.minOnScreenTimeThreshold_ = minOnScreenTimeThreshold;

    /**
     * The amount of time that must elapse once the pixel and time visibility
     * thresholds are met before the element is refreshed, and the callback is
     * invoked. Measured in seconds.
     *
     * @private @const {number}
     */
    this.refreshInterval_ = refreshInterval;

    /**
     * Timer id that can be used to cancel visibility timer.
     *
     * @private {?(number|string)}
     */
    this.visibilityTimeoutId_ = null;

    /**
     * Timer id that can be used to cancel refresh timer.
     *
     * @private {?(number|string)}
     */
    this.refreshTimeoutId_ = null;

    /**
     * The current refresh lifecyle state.
     *
     * @private {!RefreshLifecycleState}
     */
    this.state_ = RefreshLifecycleState.INITIAL;
  }

  /**
   * Invokes the callback function.
   */
  invokeCallback() {
    this.callback_();
  }

  /**
   * Resets wrapper to initial conditions.
   */
  reset() {
    this.state_ = RefreshLifecycleState.INITIAL;
    this.refreshTimeoutId_ = null;
    this.visibilityTimeoutId_ = null;
  }

  /**
   * Sets the RefreshLifecycleState to the given new state.
   *
   * @param {!RefreshLifecycleState} newState
   */
  setRefreshLifecycleState(newState) {
    this.state_ = newState;
  }

  /** @return {!RefreshLifecycleState} */
  getRefreshLifecycleState() {
    return this.state_;
  }

  /** @return {number} */
  getRefreshInterval() {
    return this.refreshInterval_;
  }

  /**  @return {number}  */
  getMinOnScreenPixelRatioThreshold() {
    return this.minOnScreenPixelRatioThreshold_;
  }

  /** @return {number} */
  getMinOnScreenTimeThreshold() {
    return this.minOnScreenTimeThreshold_;
  }

  /** @return {?(number|string)} */
  getVisibilityTimeoutId() {
    return this.visibilityTimeoutId_;
  }

  /** @param {number|string} timeoutId */
  setVisibilityTimeoutId(timeoutId) {
    this.visibilityTimeoutId_ = timeoutId;
  }

  /** @return {?(number|string)} */
  getRefreshTimeoutId() {
    return this.refreshTimeoutId_;
  }

  /** @param {number|string} timeoutId */
  setRefreshTimeoutId(timeoutId) {
    this.refreshTimeoutId_ = timeoutId;
  }
}
