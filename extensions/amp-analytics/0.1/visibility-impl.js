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

import {
  closestByTag,
  closestBySelector,
  scopedQuerySelector,
} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {map} from '../../../src/utils/object';
import {resourcesForDoc} from '../../../src/services';
import {getParentWindowFrameElement} from '../../../src/service';
import {timerFor} from '../../../src/services';
import {viewportForDoc} from '../../../src/services';
import {viewerForDoc} from '../../../src/services';
import {startsWith} from '../../../src/string';
import {
  DEFAULT_THRESHOLD,
  IntersectionObserverPolyfill,
  nativeIntersectionObserverSupported,
} from '../../../src/intersection-observer-polyfill';

// Variables that are passed to the callback.
const MAX_CONTINUOUS_TIME = 'maxContinuousVisibleTime';
const TOTAL_VISIBLE_TIME = 'totalVisibleTime';
const FIRST_SEEN_TIME = 'firstSeenTime';
const LAST_SEEN_TIME = 'lastSeenTime';
const FIRST_VISIBLE_TIME = 'firstVisibleTime';
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
const SCHEDULED_RUN_ID = 'schId';

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
 * @param {!JsonObject} config Configuration for instrumentation.
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
        closestBySelector(
            friendlyFrame, '.i-amphtml-element') : null;
  } else if (selectionMethod == 'closest') {
    // Only tag names are supported currently.
    foundEl = closestByTag(analyticsEl, selector);
  } else if (selectionMethod == 'scope') {
    foundEl = scopedQuerySelector(
        dev().assertElement(analyticsEl.parentElement), selector);
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

    /** @private {boolean} */
    this.visibilityListenerRegistered_ = false;

    /** @private {!../../../src/service/resources-impl.Resources} */
    this.resourcesService_ = resourcesForDoc(this.ampdoc);

    /** @private {number} Amount of time to wait for next calculation. */
    this.timeToWait_ = Infinity;

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = viewerForDoc(this.ampdoc);

    /** @private {boolean} */
    this.backgroundedAtStart_ = !this.viewer_.isVisible();

    /** @private {boolean} */
    this.backgrounded_ = this.backgroundedAtStart_;

    /** @private {!Object<number, number>} */
    this.lastVisiblePercent_ = map();

    /** @private {?IntersectionObserver|?IntersectionObserverPolyfill} */
    this.intersectionObserver_ = null;
  }

  /**
   * @param {!Object} config
   * @param {function(!Object)} callback
   * @param {boolean} shouldBeVisible True if the element should be visible
   *   when callback is called. False otherwise.
   * @param {!Element} analyticsElement The amp-analytics element that the
   *   config is associated with.
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

    if (!this.intersectionObserver_) {
      const onIntersectionChanges = entries => {
        entries.forEach(change => {
          this.onIntersectionChange_(
              change.target,
              change.intersectionRatio * 100,
              /* docVisible */true);
        });
      };

      if (nativeIntersectionObserverSupported(this.ampdoc.win)) {
        this.intersectionObserver_ = new this.ampdoc.win.IntersectionObserver(
            onIntersectionChanges, {threshold: DEFAULT_THRESHOLD});
      } else {
        this.intersectionObserver_ = new IntersectionObserverPolyfill(
            onIntersectionChanges, {threshold: DEFAULT_THRESHOLD});
        //TODO: eventually this is go into the proposed layoutManager.
        const viewport = viewportForDoc(this.ampdoc);
        const ticker = () => {
          this.intersectionObserver_.tick(viewport.getRect());
        };
        viewport.onScroll(ticker);
        viewport.onChanged(ticker);
        // Tick in the next event loop. That's how native InOb works.
        setTimeout(ticker);
      }
    }

    resource.loadedOnce().then(() => {
      const resId = resource.getId();
      this.listeners_[resId] = (this.listeners_[resId] || []);
      const state = {};
      state[TIME_LOADED] = this.now_();
      this.listeners_[resId].push({config, callback, state, shouldBeVisible});
      this.resources_.push(resource);
      this.intersectionObserver_.observe(element);
    });

    if (!this.visibilityListenerRegistered_) {
      this.viewer_.onVisibilityChanged(() => {
        this.onDocumentVisibilityChange_(this.viewer_.isVisible());
      });
      this.visibilityListenerRegistered_ = true;
    }
  }

  /**
   * @param {!Element} target
   * @param {number} visible
   * @param {boolean} docVisible
   * @private
   **/
  onIntersectionChange_(target, visible, docVisible) {
    const resource = this.resourcesService_.getResourceForElement(target);
    const listeners = this.listeners_[resource.getId()];
    if (docVisible) {
      this.lastVisiblePercent_[resource.getId()] = visible;
    } else {
      visible = 0;
    }

    for (let c = listeners.length - 1; c >= 0; c--) {
      const listener = listeners[c];
      const shouldBeVisible = !!listener.shouldBeVisible;
      const config = listener.config;
      const state = listener.state;

      // Update states and check if all conditions are satisfied
      const conditionsMet =
          this.updateCounters_(visible, listener, shouldBeVisible);

      // Hidden trigger
      if (!shouldBeVisible) {
        if (!docVisible && conditionsMet) {
          this.triggerCallback_(listeners, listener, resource.getLayoutBox());
        }
        // done for hidden trigger
        continue;
      }

      // Visible trigger
      if (conditionsMet) {
        this.triggerCallback_(listeners, listener, resource.getLayoutBox());
      } else if (state[IN_VIEWPORT] && !state[SCHEDULED_RUN_ID]) {
        // There is unmet duration condition, schedule a check
        const timeToWait = this.computeTimeToWait_(state, config);
        if (timeToWait <= 0) {
          continue;
        }
        state[SCHEDULED_RUN_ID] = this.timer_.delay(() => {
          dev().assert(state[IN_VIEWPORT], 'should have been in viewport');
          if (this.updateCounters_(
              this.lastVisiblePercent_[resource.getId()],
              listener, /* shouldBeVisible */ true)) {
            this.triggerCallback_(listeners, listener, resource.getLayoutBox());
          }
        }, timeToWait);
      } else if (!state[IN_VIEWPORT] && state[SCHEDULED_RUN_ID]) {
        this.timer_.cancel(state[SCHEDULED_RUN_ID]);
        state[SCHEDULED_RUN_ID] = null;
      }
    }

    // Remove target that have no listeners.
    if (listeners.length == 0) {
      this.intersectionObserver_.unobserve(target);
    }
  }

  /**
   * @param {boolean} docVisible
   * @private
   */
  onDocumentVisibilityChange_(docVisible) {
    if (!docVisible) {
      this.backgrounded_ = true;
    }
    for (let i = 0; i < this.resources_.length; i++) {
      const resource = this.resources_[i];
      if (!resource.hasLoadedOnce()) {
        continue;
      }
      this.onIntersectionChange_(
          resource.element,
          this.lastVisiblePercent_[resource.getId()] || 0,
          docVisible);
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
      const timeElapsed = this.now_() - state[TIME_LOADED];
      state[FIRST_SEEN_TIME] = state[FIRST_SEEN_TIME] || timeElapsed;
      state[LAST_SEEN_TIME] = timeElapsed;
      // Consider it as load time visibility if this happens within 300ms of
      // page load.
      if (state[LOAD_TIME_VISIBILITY] == undefined && timeElapsed < 300) {
        state[LOAD_TIME_VISIBILITY] = visible;
      }
    }

    const wasInViewport = state[IN_VIEWPORT];
    const timeSinceLastUpdate = this.now_() - state[LAST_UPDATE];
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
      state[LAST_VISIBLE_TIME] = this.now_() - state[TIME_LOADED];
    } else if (state[IN_VIEWPORT] && !wasInViewport) {
      // The resource came into view. start counting.
      dev().assert(state[LAST_UPDATE] == undefined ||
          state[LAST_UPDATE] == -1, 'lastUpdated time in weird state.');
      state[FIRST_VISIBLE_TIME] = state[FIRST_VISIBLE_TIME] ||
          this.now_() - state[TIME_LOADED];
      this.setState_(state, visible, 0);
    }

    listener['state'] = state;

    return ((triggerType && state[IN_VIEWPORT]) || !triggerType) &&
        (config[TOTAL_TIME_MIN] === undefined ||
            state[TOTAL_VISIBLE_TIME] >= config[TOTAL_TIME_MIN]) &&
        (config[TOTAL_TIME_MAX] === undefined ||
            state[TOTAL_VISIBLE_TIME] <= config[TOTAL_TIME_MAX]) &&
        (config[CONTINUOUS_TIME_MIN] === undefined ||
            (state[MAX_CONTINUOUS_TIME] || 0) >= config[CONTINUOUS_TIME_MIN]) &&
        (config[CONTINUOUS_TIME_MAX] === undefined ||
            (state[MAX_CONTINUOUS_TIME] || 0) <= config[CONTINUOUS_TIME_MAX]);
  }

  /**
   * @param {!Object} state
   * @param {!Object} config
   * @return {number}
   * @private
   */
  computeTimeToWait_(state, config) {
    const waitForContinuousTime =
        config[CONTINUOUS_TIME_MIN] > state[CONTINUOUS_TIME]
            ? config[CONTINUOUS_TIME_MIN] - state[CONTINUOUS_TIME]
            : 0;

    const waitForTotalTime =
        config[TOTAL_TIME_MIN] > state[TOTAL_VISIBLE_TIME]
            ? config[TOTAL_TIME_MIN] - state[TOTAL_VISIBLE_TIME]
            : 0;

    // Wait for minimum of (previous timeToWait, positive values of
    // waitForContinuousTime and waitForTotalTime).
    this.timeToWait_ = Math.min(this.timeToWait_,
        waitForContinuousTime || Infinity,
        waitForTotalTime || Infinity);

    // Return a max of wait time (used by V2)
    return Math.max(waitForContinuousTime, waitForTotalTime);
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
    return !!(visible > (min || 0) && visible <= (max || 100));
  }

  /**
   * @param {!Object} s State of the listener
   * @param {number} visible Percentage of element visible
   * @param {number} sinceLast Milliseconds since last update
   * @private
   */
  setState_(s, visible, sinceLast) {
    s[LAST_UPDATE] = this.now_();
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
    s[LAST_VISIBLE_TIME] = this.now_() - s[TIME_LOADED];
  }

  /**
   * Trigger listener callback.
   * @param {!Array<VisibilityListenerDef>} listeners
   * @param {!VisibilityListenerDef} listener
   * @param {!../../../src/dom-rect.DOMRectDef} layoutBox The bounding rectangle
   *     for the element
   * @private
   */
  triggerCallback_(listeners, listener, layoutBox) {
    const state = listener.state;
    if (state[SCHEDULED_RUN_ID]) {
      this.timer_.cancel(state[SCHEDULED_RUN_ID]);
      state[SCHEDULED_RUN_ID] = null;
    }
    this.prepareStateForCallback_(state, layoutBox);
    listener.callback(state);
    listeners.splice(listeners.indexOf(listener), 1);
  }

  /**
   * Sets variable values for callback. Cleans up existing values.
   * @param {Object<string, *>} state The state object to populate
   * @param {!../../../src/dom-rect.DOMRectDef} layoutBox The bounding rectangle
   *     for the element
   * @private
   */
  prepareStateForCallback_(state, layoutBox) {
    state[ELEMENT_X] = layoutBox.left;
    state[ELEMENT_Y] = layoutBox.top;
    state[ELEMENT_WIDTH] = layoutBox.width;
    state[ELEMENT_HEIGHT] = layoutBox.height;
    state[TOTAL_TIME] = this.getTotalTime_() || '';

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
    delete state[SCHEDULED_RUN_ID];

    for (const k in state) {
      if (state.hasOwnProperty(k)) {
        state[k] = String(state[k]);
      }
    }
  }

  getTotalTime_() {
    const perf = this.ampdoc.win.performance;
    return perf && perf.timing && perf.timing.domInteractive
        ? this.now_() - perf.timing.domInteractive
        : null;
  }

  now_() {
    return this.ampdoc.win.Date.now();
  }
}
