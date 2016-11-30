/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {closestByTag, closestBySelector} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {resourcesForDoc} from '../../../src/resources';
import {getParentWindowFrameElement} from '../../../src/service';
import {timerFor} from '../../../src/timer';
import {isFiniteNumber} from '../../../src/types';
import {viewportForDoc} from '../../../src/viewport';
import {viewerForDoc} from '../../../src/viewer';
import {VisibilityState} from '../../../src/visibility-state';
import {startsWith} from '../../../src/string';
import {DEFAULT_THRESHOLD} from '../../../src/intersection-observer-polyfill';

/** @const {number} */
const LISTENER_INITIAL_RUN_DELAY_ = 20;

// Variables that are passed to the callback.
const MAX_CONTINUOUS_TIME = 'maxContinuousVisibleTime';
const TOTAL_VISIBLE_TIME = 'totalVisibleTime';
const FIRST_SEEN_TIME = 'firstSeenTime';
const LAST_SEEN_TIME = 'lastSeenTime';
const FIRST_VISIBLE_TIME = 'fistVisibleTime';
const LAST_VISIBLE_TIME = 'lastVisibleTime';
const MIN_VISIBLE = 'minVisiblePercentage';
const MAX_VISIBLE = 'maxVisiblePercentage';
const ELEMENT_X = 'elementX';
const ELEMENT_Y = 'elementY';
const ELEMENT_WIDTH = 'elementWidth';
const ELEMENT_HEIGHT = 'elementHeight';
const TOTAL_TIME = 'totalTime';
const LOAD_TIME_VISIBILITY = 'loadTimeVisibility';
const BACKGROUNDED = 'backgrounded';
const BACKGROUNDED_AT_START = 'backgroundedAtStart';

// Variables that are not exposed outside this class.
const CONTINUOUS_TIME = 'cT';
const LAST_UPDATE = 'lU';
const IN_VIEWPORT = 'iV';
const TIME_LOADED = 'tL';

// Keys used in VisibilitySpec
const CONTINUOUS_TIME_MAX = 'continuousTimeMax';
const CONTINUOUS_TIME_MIN = 'continuousTimeMin';
const TOTAL_TIME_MAX = 'totalTimeMax';
const TOTAL_TIME_MIN = 'totalTimeMin';
const VISIBLE_PERCENTAGE_MIN = 'visiblePercentageMin';
const VISIBLE_PERCENTAGE_MAX = 'visiblePercentageMax';

const TAG_ = 'Analytics.Visibility';

/**
 * Checks if the value is undefined or positive number like.
 * "", 1, 0, undefined, 100, 101 are positive. -1, NaN are not.
 *
 * Visible for testing.
 *
 * @param {number} num The number to verify.
 * @return {boolean}
 * @private
 */
export function isPositiveNumber_(num) {
  return num === undefined || (typeof num == 'number' && Math.sign(num) >= 0);
}

/**
 * Checks if the value is undefined or a number between 0 and 100.
 * "", 1, 0, undefined, 100 return true. -1, NaN and 101 return false.
 *
 * Visible for testing.
 *
 * @param {number} num The number to verify.
 * @return {boolean}
 */
export function isValidPercentage_(num) {
  return num === undefined ||
      (typeof num == 'number' && Math.sign(num) >= 0 && num <= 100);
}

/**
 * Checks and outputs information about visibilitySpecValidation.
 * @param {!JSONType} config Configuration for instrumentation.
 * @return {boolean} True if the spec is valid.
 * @private
 */
export function isVisibilitySpecValid(config) {
  if (!config['visibilitySpec']) {
    return true;
  }

  const spec = config['visibilitySpec'];
  const selector = spec['selector'];
  if (!selector || (!startsWith(selector, '#') &&
                    !startsWith(selector, 'amp-') &&
                    selector != ':root' &&
                    selector != ':host')) {
    user().error(TAG_, 'Visibility spec requires an id selector, a tag ' +
        'name starting with "amp-" or ":root"');
    return false;
  }

  const ctMax = spec[CONTINUOUS_TIME_MAX];
  const ctMin = spec[CONTINUOUS_TIME_MIN];
  const ttMax = spec[TOTAL_TIME_MAX];
  const ttMin = spec[TOTAL_TIME_MIN];

  if (!isPositiveNumber_(ctMin) || !isPositiveNumber_(ctMax) ||
      !isPositiveNumber_(ttMin) || !isPositiveNumber_(ttMax)) {
    user().error(TAG_,
        'Timing conditions should be positive integers when specified.');
    return false;
  }

  if (ctMax < ctMin || ttMax < ttMin) {
    user().warn('AMP-ANALYTICS', 'Max value in timing conditions should be ' +
        'more than the min value.');
    return false;
  }

  if (!isValidPercentage_(spec[VISIBLE_PERCENTAGE_MAX]) ||
      !isValidPercentage_(spec[VISIBLE_PERCENTAGE_MIN])) {
    user().error(TAG_,
        'visiblePercentage conditions should be between 0 and 100.');
    return false;
  }

  if (spec[VISIBLE_PERCENTAGE_MAX] < spec[VISIBLE_PERCENTAGE_MIN]) {
    user().error(TAG_, 'visiblePercentageMax should be greater than ' +
        'visiblePercentageMin');
    return false;
  }
  return true;
}

/**
 * Returns the element that matches the selector. If the selector is an
 * id, the element with that id is returned. If the selector is a tag name, an
 * ancestor of the analytics element with that tag name is returned.
 *
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc.
 * @param {string} selector The selector for the element to track.
 * @param {!Element} analyticsEl Element whose ancestors to search.
 * @param {!String} selectionMethod The method to use to find the element.
 * @return {?Element} Element corresponding to the selector if found.
 */
export function getElement(ampdoc, selector, analyticsEl, selectionMethod) {
  if (!analyticsEl) {
    return null;
  }

  let foundEl;
  const friendlyFrame = getParentWindowFrameElement(analyticsEl, ampdoc.win);
  // Special case for root selector.
  if (selector == ':host' || selector == ':root') {
    foundEl = friendlyFrame ?
        closestBySelector(friendlyFrame, '.-amp-element') : null;
  } else if (selectionMethod == 'closest') {
    // Only tag names are supported currently.
    foundEl = closestByTag(analyticsEl, selector);
  } else if (selectionMethod == 'scope') {
    foundEl = analyticsEl.parentElement.querySelector(selector);
  } else if (selector[0] == '#') {
    const containerDoc = friendlyFrame ? analyticsEl.ownerDocument : ampdoc;
    foundEl = containerDoc.getElementById(selector.slice(1));
  }

  if (foundEl) {
    // Restrict result to be contained by ampdoc.
    const isContainedInDoc = ampdoc.contains(friendlyFrame || foundEl);
    if (isContainedInDoc) {
      return foundEl;
    }
  }
  return null;
}

/**
 * @typedef {{
 *   state: !Object,
 *   config: !Object,
  *  callback: function(!Object),
  *  shouldBeVisible: boolean,
 * }}
 */
let VisibilityListenerDef;

/**
 * Allows tracking of AMP elements in the viewport.
 *
 * This class allows a caller to specify conditions to evaluate when an element
 * is in viewport and for how long. If the conditions are satisfied, a provided
 * callback is called.
 */
export class Visibility {

  /** @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {
    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc */
    this.ampdoc = ampdoc;

    /**
     * key: resource id.
     * value: [VisibilityListenerDef]
     * @type {!Object<!Array<VisibilityListenerDef>>}
     * @private
     */
    this.listeners_ = Object.create(null);

    /** @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = timerFor(this.ampdoc.win);

    /** @private {Array<!../../../src/service/resource.Resource>} */
    this.resources_ = [];

    /** @private @const {function()} */
    this.boundScrollListener_ = this.scrollListener_.bind(this);

    /** @private @const {function()} */
    this.boundVisibilityListener_ = this.visibilityListener_.bind(this);

    /** @private {boolean} */
    this.scrollListenerRegistered_ = false;

    /** @private {boolean} */
    this.visibilityListenerRegistered_ = false;

    /** @private {!../../../src/service/resources-impl.Resources} */
    this.resourcesService_ = resourcesForDoc(this.ampdoc);

    /** @private {number|string|null} */
    this.scheduledRunId_ = null;

    /** @private {number} Amount of time to wait for next calculation. */
    this.timeToWait_ = Infinity;

    /** @private {boolean} */
    this.scheduledLoadedPromises_ = false;

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = viewerForDoc(this.ampdoc);

    /** @private {boolean} */
    this.backgroundedAtStart_ = !this.viewer_.isVisible();

    /** @private {boolean} */
    this.backgrounded_ = this.backgroundedAtStart_;
  }

  /** @private */
  registerForVisibilityEvents_() {
    if (!this.visibilityListenerRegistered_) {
      this.viewer_.onVisibilityChanged(this.boundVisibilityListener_);
      this.visibilityListenerRegistered_ = true;
      this.visibilityListener_();
    }
  }

  /** @private */
  registerForViewportEvents_() {
    if (!this.scrollListenerRegistered_) {
      const viewport = viewportForDoc(this.ampdoc);

      // Currently unlistens are not being used. In the event that no resources
      // are actively being monitored, the scrollListener should be very cheap.
      viewport.onScroll(this.boundScrollListener_);
      viewport.onChanged(this.boundScrollListener_);
      this.scrollListenerRegistered_ = true;
    }
  }

  /**
   * @param {!Object} config
   * @param {function(!Object)} callback
   * @param {boolean} shouldBeVisible True if the element should be visible
   *  when callback is called. False otherwise.
   * @param {!Element} analyticsElement The amp-analytics element that the
   *  config is associated with.
   */
  listenOnce(config, callback, shouldBeVisible, analyticsElement) {
    const selector = config['selector'];
    const element = user().assertElement(
        getElement(this.ampdoc, selector,
            dev().assertElement(analyticsElement),
            config['selectionMethod']),
        'Element not found for visibilitySpec: ' + selector);

    const resource =
        this.resourcesService_.getResourceForElementOptional(element);

    user().assert(
        resource, 'Visibility tracking not supported on element: ', element);

    this.registerForViewportEvents_();
    this.registerForVisibilityEvents_();

    const resId = resource.getId();
    this.listeners_[resId] = (this.listeners_[resId] || []);
    const state = {};
    state[TIME_LOADED] = Date.now();
    this.listeners_[resId].push({config, callback, state, shouldBeVisible});
    this.resources_.push(resource);

    if (this.scheduledRunId_ === null) {
      this.scheduledRunId_ = this.timer_.delay(() => {
        this.scrollListener_();
      }, LISTENER_INITIAL_RUN_DELAY_);
    }
  }

  /**
   * @param {!Object} config
   * @param {function(!Object)} callback
   * @param {boolean} shouldBeVisible True if the element should be visible
   *   when callback is called. False otherwise.
   * @param {!Element} analyticsElement The amp-analytics element that the
   *   config is associated with.
   */
  listenOnceV2(config, callback, shouldBeVisible, analyticsElement) {
    const selector = config['selector'];
    const element = user().assertElement(
        getElement(this.ampdoc, selector,
            dev().assertElement(analyticsElement),
            config['selectionMethod']),
        'Element not found for visibilitySpec: ' + selector);

    const resource =
        this.resourcesService_.getResourceForElementOptional(element);

    user().assert(
        resource, 'Visibility tracking not supported on element: ', element);

    if (!this.intersectionObserver_) {
      const onIntersectionChange = this.onIntersectionChange_.bind(this);
      /** @private {!IntersectionObserver} */
      this.intersectionObserver_ =
          // TODO: polyfill IntersectionObserver
          new this.ampdoc.win.IntersectionObserver(entries => {
            entries.forEach(onIntersectionChange);
          }, {threshold: DEFAULT_THRESHOLD});
    }

    resource.loadedOnce().then(() => {
      this.intersectionObserver_.observe(element);

      const resId = resource.getId();
      this.listeners_[resId] = (this.listeners_[resId] || []);
      const state = {};
      state[TIME_LOADED] = Date.now();
      this.listeners_[resId].push({config, callback, state, shouldBeVisible});
      this.resources_.push(resource);
    });

    // TODO: support "hidden" spec.
  }

  /** @private */
  onIntersectionChange_(change) {
    const listeners = this.listeners_[change.target.getResourceId()];

    const visible = change.intersectionRatio * 100;
    for (let c = listeners.length - 1; c >= 0; c--) {
      const shouldBeVisible = !!listeners[c]['shouldBeVisible'];
      if (this.updateCounters_(visible, listeners[c], shouldBeVisible)
          && this.viewer_.isVisible() == shouldBeVisible) {
        this.prepareStateForCallback_(
            listeners[c]['state'], change.boundingClientRect);
        listeners[c].callback(listeners[c]['state']);
        listeners.splice(c, 1);
      }
    }

    // Remove target that have no listeners.
    if (listeners.length == 0) {
      this.intersectionObserver_.unobserve(change.target);
    }

    // TODO: support continuousTimeMin and totalTimeMin
  }

  /** @private */
  visibilityListener_() {
    const state = this.viewer_.getVisibilityState();
    if (state == VisibilityState.HIDDEN || state == VisibilityState.PAUSED ||
        state == VisibilityState.INACTIVE) {
      this.backgrounded_ = true;
    }
    this.scrollListener_();
  }

  /** @private */
  scrollListener_() {
    if (this.scheduledRunId_ != null) {
      this.timer_.cancel(this.scheduledRunId_);
      this.scheduledRunId_ = null;
    }

    const loadedPromises = [];

    for (let r = this.resources_.length - 1; r >= 0; r--) {
      const res = this.resources_[r];
      if (!res.hasLoadedOnce()) {
        loadedPromises.push(res.loadedOnce());
        continue;
      }

      const change = res.element.getIntersectionChangeEntry();
      const br = change.boundingClientRect;
      const visible = !isFiniteNumber(change.intersectionRatio) ? 0
          : change.intersectionRatio * 100;

      const listeners = this.listeners_[res.getId()];
      for (let c = listeners.length - 1; c >= 0; c--) {
        const shouldBeVisible = !!listeners[c]['shouldBeVisible'];
        if (this.updateCounters_(visible, listeners[c], shouldBeVisible) &&
            this.viewer_.isVisible() == shouldBeVisible) {
          this.prepareStateForCallback_(listeners[c]['state'], br);
          listeners[c].callback(listeners[c]['state']);
          listeners.splice(c, 1);
        }
      }

      // Remove resources that have no listeners.
      if (listeners.length == 0) {
        this.resources_.splice(r, 1);
      }
    }

    // Schedule a calculation for the time when one of the conditions is
    // expected to be satisfied.
    if (this.scheduledRunId_ === null &&
        this.timeToWait_ < Infinity && this.timeToWait_ > 0) {
      this.scheduledRunId_ = this.timer_.delay(() => {
        this.scrollListener_();
      }, this.timeToWait_);
    }

    // Schedule a calculation for when a resource gets loaded.
    if (loadedPromises.length > 0 && !this.scheduledLoadedPromises_) {
      Promise.race(loadedPromises).then(() => {
        this.scheduledLoadedPromises_ = false;
        this.scrollListener_();
      });
      this.scheduledLoadedPromises_ = true;
    }
  }

  /**
   * Updates counters for a given listener.
   * @param {number} visible Percentage of element visible in viewport.
   * @param {Object<string,Object>} listener The listener whose counters need
   *  updating.
   * @param {boolean} triggerType True if element should be visible.
   *  False otherwise.
   * @return {boolean} true if all visibility conditions are satisfied
   * @private
   */
  updateCounters_(visible, listener, triggerType) {
    const config = listener['config'];
    const state = listener['state'] || {};

    if (visible > 0) {
      const timeElapsed = Date.now() - state[TIME_LOADED];
      state[FIRST_SEEN_TIME] = state[FIRST_SEEN_TIME] || timeElapsed;
      state[LAST_SEEN_TIME] = timeElapsed;
      // Consider it as load time visibility if this happens within 300ms of
      // page load.
      if (state[LOAD_TIME_VISIBILITY] == undefined && timeElapsed < 300) {
        state[LOAD_TIME_VISIBILITY] = visible;
      }
    }

    const wasInViewport = state[IN_VIEWPORT];
    const timeSinceLastUpdate = Date.now() - state[LAST_UPDATE];
    state[IN_VIEWPORT] = this.isInViewport_(visible,
        config[VISIBLE_PERCENTAGE_MIN], config[VISIBLE_PERCENTAGE_MAX]);

    if (state[IN_VIEWPORT] && wasInViewport) {
      // Keep counting.
      this.setState_(state, visible, timeSinceLastUpdate);
    } else if (!state[IN_VIEWPORT] && wasInViewport) {
      // The resource went out of view. Do final calculations and reset state.
      dev().assert(state[LAST_UPDATE] > 0, 'lastUpdated time in weird state.');

      state[MAX_CONTINUOUS_TIME] = Math.max(state[MAX_CONTINUOUS_TIME],
          state[CONTINUOUS_TIME] + timeSinceLastUpdate);

      state[LAST_UPDATE] = -1;
      state[TOTAL_VISIBLE_TIME] += timeSinceLastUpdate;
      state[CONTINUOUS_TIME] = 0;  // Clear only after max is calculated above.
      state[LAST_VISIBLE_TIME] = Date.now() - state[TIME_LOADED];
    } else if (state[IN_VIEWPORT] && !wasInViewport) {
      // The resource came into view. start counting.
      dev().assert(state[LAST_UPDATE] == undefined ||
          state[LAST_UPDATE] == -1, 'lastUpdated time in weird state.');
      state[FIRST_VISIBLE_TIME] = state[FIRST_VISIBLE_TIME] ||
          Date.now() - state[TIME_LOADED];
      this.setState_(state, visible, 0);
    }

    const waitForContinuousTime = config[CONTINUOUS_TIME_MIN]
        ? config[CONTINUOUS_TIME_MIN] - state[CONTINUOUS_TIME]
        : Infinity;
    const waitForTotalTime = config[TOTAL_TIME_MIN]
        ? config[TOTAL_TIME_MIN] - state[TOTAL_VISIBLE_TIME]
        : Infinity;

    // Wait for minimum of (previous timeToWait, positive values of
    // waitForContinuousTime and waitForTotalTime).
    this.timeToWait_ = Math.min(this.timeToWait_,
        waitForContinuousTime > 0 ? waitForContinuousTime : Infinity,
        waitForTotalTime > 0 ? waitForTotalTime : Infinity);
    listener['state'] = state;

    return ((triggerType && state[IN_VIEWPORT]) || !triggerType) &&
        (config[TOTAL_TIME_MIN] === undefined ||
        state[TOTAL_VISIBLE_TIME] >= config[TOTAL_TIME_MIN]) &&
        (config[TOTAL_TIME_MAX] === undefined ||
         state[TOTAL_VISIBLE_TIME] <= config[TOTAL_TIME_MAX]) &&
        (config[CONTINUOUS_TIME_MIN] === undefined ||
         state[CONTINUOUS_TIME] >= config[CONTINUOUS_TIME_MIN]) &&
        (config[CONTINUOUS_TIME_MAX] === undefined ||
         state[CONTINUOUS_TIME] <= config[CONTINUOUS_TIME_MAX]);
  }

  /**
   * For the purposes of these calculations, a resource is in viewport if the
   * visibility conditions are satisfied or they are not defined.
   * @param {number} visible Percentage of element visible
   * @param {number} min Lower bound of visibility condition. Not inclusive
   * @param {number} max Upper bound of visibility condition. Inclusive.
   * @return {boolean} true if the conditions are satisfied.
   * @private
   */
  isInViewport_(visible, min, max) {
    if (min === undefined && max === undefined) {
      return true;
    }

    return !!(visible > (min || 0) && visible <= (max || 100));
  }

  /**
   * @param {!Object} s State of the listener
   * @param {number} visible Percentage of element visible
   * @param {number} sinceLast Milliseconds since last update
   * @private
   */
  setState_(s, visible, sinceLast) {
    s[LAST_UPDATE] = Date.now();
    s[TOTAL_VISIBLE_TIME] = s[TOTAL_VISIBLE_TIME] !== undefined
        ? s[TOTAL_VISIBLE_TIME] + sinceLast : 0;
    s[CONTINUOUS_TIME] = s[CONTINUOUS_TIME] !== undefined
        ? s[CONTINUOUS_TIME] + sinceLast : 0;
    s[MAX_CONTINUOUS_TIME] = s[MAX_CONTINUOUS_TIME] !== undefined
        ? Math.max(s[MAX_CONTINUOUS_TIME], s[CONTINUOUS_TIME]) : 0;
    s[MIN_VISIBLE] =
        s[MIN_VISIBLE] ? Math.min(s[MIN_VISIBLE], visible) : visible;
    s[MAX_VISIBLE] =
        s[MAX_VISIBLE] ? Math.max(s[MAX_VISIBLE], visible) : visible;
    s[LAST_VISIBLE_TIME] = Date.now() - s[TIME_LOADED];
  }

  /**
   * Sets variable values for callback. Cleans up existing values.
   * @param {Object<string, *>} state The state object to populate
   * @param {!../../../src/layout-rect.LayoutRectDef} br The bounding rectangle
   *     for the element
   * @private
   */
  prepareStateForCallback_(state, br) {
    const perf = this.ampdoc.win.performance;
    const viewport = viewportForDoc(this.ampdoc);

    state[ELEMENT_X] = viewport.getScrollLeft() + br.left;
    state[ELEMENT_Y] = viewport.getScrollTop() + br.top;
    state[ELEMENT_WIDTH] = br.width;
    state[ELEMENT_HEIGHT] = br.height;
    state[TOTAL_TIME] = perf && perf.timing && perf.timing.domInteractive
        ? Date.now() - perf.timing.domInteractive
        : '';

    state[LOAD_TIME_VISIBILITY] = state[LOAD_TIME_VISIBILITY] || 0;
    if (state[MIN_VISIBLE] !== undefined) {
      state[MIN_VISIBLE] =
          Math.round(dev().assertNumber(state[MIN_VISIBLE]) * 100) / 100;
    }
    if (state[MAX_VISIBLE] !== undefined) {
      state[MAX_VISIBLE] =
          Math.round(dev().assertNumber(state[MAX_VISIBLE]) * 100) / 100;
    }
    state[BACKGROUNDED] = this.backgrounded_ ? '1' : '0';
    state[BACKGROUNDED_AT_START] = this.backgroundedAtStart_ ? '1' : '0';

    // Remove the state that need not be public and call callback.
    delete state[CONTINUOUS_TIME];
    delete state[LAST_UPDATE];
    delete state[IN_VIEWPORT];
    delete state[TIME_LOADED];

    for (const k in state) {
      if (state.hasOwnProperty(k)) {
        state[k] = String(state[k]);
      }
    }
  }
}
