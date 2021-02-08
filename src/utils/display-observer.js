/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {VisibilityState} from '../visibility-state';
import {getServiceForDoc, registerServiceBuilderForDoc} from '../service';
import {pushIfNotExist, removeItem} from './array';
import {rethrowAsync} from '../log';

const SERVICE_ID = 'DisplayObserver';

const DISPLAY_THRESHOLD = 0.51;

/**
 * Observes whether the specified target is displayable. The initial observation
 * is returned shortly after observing, and subsequent observations are
 * returned when the target's displayable state changes.
 *
 * The element is displayable if:
 * 1. It doesn't have `display: none` style or `hidden` attribute.
 * 2. It intersects with the main document's scroller by at least 51%. This
 *    means if the element is offset from the main scroller using
 *    `translateX(-1000px)`, it's not displayable. Another example, if the
 *    element is nested inside another scroller and scrolled off the screen.
 *    However, if an element is inside the main document's scroller, but simply
 *    not in the viewport, it's considered to be "displayable".
 *
 * @param {!Element} target
 * @param {function(boolean)} callback
 */
export function observeDisplay(target, callback) {
  getObserver(target).observe(target, callback);
}

/**
 * @param {!Element} target
 * @param {!ObserverCallbackDef} callback
 */
export function unobserveDisplay(target, callback) {
  getObserver(target).unobserve(target, callback);
}

/**
 * @param {!Element} target
 * @return {!Promise<boolean>}
 */
export function measureDisplay(target) {
  const observer = getObserver(target);
  return new Promise((resolve) => {
    const onDisplay = (display) => {
      resolve(display);
      observer.unobserve(target, onDisplay);
    };
    observer.observe(target, onDisplay);
  });
}

/**
 * @implements {Disposable}
 * @visibleForTesting
 * @package
 */
export class DisplayObserver {
  /**
   * @param {!AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    const {win} = ampdoc;

    /** @private @const {!Array<!IntersectionObserver>} */
    this.observers_ = [];
    const boundObserved = this.observed_.bind(this);
    this.observers_.push(
      new win.IntersectionObserver(boundObserved, {
        root: ampdoc.getBody(),
        threshold: DISPLAY_THRESHOLD,
      })
    );
    // Viewport observer is only needed because `postion:fixed` elements
    // are not observable by a documentElement or body's root.
    this.observers_.push(
      new win.IntersectionObserver(boundObserved, {
        threshold: DISPLAY_THRESHOLD,
      })
    );

    /** @private {boolean} */
    this.isDocDisplay_ = computeDocIsDisplayed(ampdoc.getVisibilityState());

    /** @private {?UnlistenDef} */
    this.visibilityUnlisten_ = ampdoc.onVisibilityChanged(() => {
      const display = computeDocIsDisplayed(ampdoc.getVisibilityState());
      if (display !== this.isDocDisplay_) {
        this.isDocDisplay_ = display;
        this.docVisibilityChanged_();
      }
    });

    /** @private @const {!Map<!Element, !Array<function(boolean)>>} */
    this.targetObserverCallbacks_ = new Map();

    /** @private @const {!Map<!Element, !Array<boolean>>} */
    this.targetObservations_ = new Map();
  }

  /** @override */
  dispose() {
    this.observers_.forEach((observer) => observer.disconnect());
    this.visibilityUnlisten_();
    this.visibilityUnlisten_ = null;
    this.targetObserverCallbacks_.clear();
    this.targetObservations_.clear();
  }

  /**
   * @param {!Element} target
   * @param {function(boolean)} callback
   */
  observe(target, callback) {
    let callbacks = this.targetObserverCallbacks_.get(target);
    if (!callbacks) {
      callbacks = [];
      this.targetObserverCallbacks_.set(target, callbacks);
      for (let i = 0; i < this.observers_.length; i++) {
        this.observers_[i].observe(target);
      }
    }
    if (pushIfNotExist(callbacks, callback)) {
      if (this.targetObservations_.has(target)) {
        // Notify the existing observation immediately.
        setTimeout(() => {
          const display = computeDisplay(
            this.targetObservations_.get(target),
            this.isDocDisplay_
          );
          if (display != null) {
            callCallbackNoInline(callback, display);
          }
        });
      }
    }
  }

  /**
   * @param {!Element} target
   * @param {function()} callback
   */
  unobserve(target, callback) {
    const callbacks = this.targetObserverCallbacks_.get(target);
    if (!callbacks) {
      return;
    }
    removeItem(callbacks, callback);
    if (callbacks.length == 0) {
      this.targetObserverCallbacks_.delete(target);
      this.targetObservations_.delete(target);
      for (let i = 0; i < this.observers_.length; i++) {
        this.observers_[i].unobserve(target);
      }
    }
  }

  /** @private */
  docVisibilityChanged_() {
    this.targetObserverCallbacks_.forEach((callbacks, target) => {
      const observations = this.targetObservations_.get(target);
      const oldDisplay = computeDisplay(observations, !this.isDocDisplay_);
      const newDisplay = computeDisplay(observations, this.isDocDisplay_);
      notifyIfChanged(callbacks, newDisplay, oldDisplay);
    });
  }

  /**
   * @param {!Array<!IntersectionObserverEntry>} entries
   * @param {!IntersectionObserver} observer
   * @private
   */
  observed_(entries, observer) {
    const seen = new Set();
    for (let i = entries.length - 1; i >= 0; i--) {
      const {target, isIntersecting} = entries[i];
      if (seen.has(target)) {
        continue;
      }
      seen.add(target);
      const callbacks = this.targetObserverCallbacks_.get(target);
      if (!callbacks) {
        continue;
      }
      let observations = this.targetObservations_.get(target);
      if (!observations) {
        observations = emptyObservations(this.observers_.length);
        this.targetObservations_.set(target, observations);
      }
      const oldDisplay = computeDisplay(observations, this.isDocDisplay_);
      const index = this.observers_.indexOf(observer);
      observations[index] = isIntersecting;
      const newDisplay = computeDisplay(observations, this.isDocDisplay_);
      notifyIfChanged(callbacks, newDisplay, oldDisplay);
    }
  }
}

/**
 * @param {!Element} target
 * @return {!DisplayObserver}
 */
function getObserver(target) {
  registerServiceBuilderForDoc(target, SERVICE_ID, DisplayObserver);
  return /** @type {!DisplayObserver} */ (getServiceForDoc(target, SERVICE_ID));
}

/**
 * @param {number} length
 * @return {!Array<number>}
 */
function emptyObservations(length) {
  const result = new Array(length);
  for (let i = 0; i < length; i++) {
    result[i] = null;
  }
  return result;
}

/**
 * @param {?Array<boolean>} observations
 * @param {boolean} isDocDisplay
 * @return {?boolean}
 */
function computeDisplay(observations, isDocDisplay) {
  if (!isDocDisplay) {
    return false;
  }
  if (!observations) {
    // Unknown yet.
    return null;
  }
  return observations.reduce(displayReducer);
}

/**
 * @param {!VisibilityState} visibilityState
 * @return {boolean}
 */
function computeDocIsDisplayed(visibilityState) {
  return (
    visibilityState == VisibilityState.VISIBLE ||
    // The document is still considered "displayed" or at least "displayable"
    // when it's hidden (tab is switched). Only prerender/paused/inactive
    // states require pause of resources.
    visibilityState == VisibilityState.HIDDEN
  );
}

/**
 * @param {?boolean} acc
 * @param {?boolean|undefined} value
 * @return {?boolean}
 */
function displayReducer(acc, value) {
  if (acc || value) {
    // OR condition: one true - the result is true.
    return true;
  }
  if (acc === false && value === false) {
    // Reverse of OR: both must be false for the result to be false.
    return false;
  }
  // Unknown.
  return null;
}

/**
 * @param {!Array<function(boolean)>} callbacks
 * @param {boolean} newDisplay
 * @param {boolean} oldDisplay
 */
function notifyIfChanged(callbacks, newDisplay, oldDisplay) {
  if (newDisplay != null && newDisplay !== oldDisplay) {
    for (let i = 0; i < callbacks.length; i++) {
      callCallbackNoInline(callbacks[i], newDisplay);
    }
  }
}

/**
 * @param {!ObserverCallbackDef} callback
 * @param {../layout-rect.LayoutSizeDef} size
 */
function callCallbackNoInline(callback, size) {
  try {
    callback(size);
  } catch (e) {
    rethrowAsync(e);
  }
}
