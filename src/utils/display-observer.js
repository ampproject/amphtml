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

import {getServiceForDoc, registerServiceBuilderForDoc} from '../service';
import {pushIfNotExist, removeItem} from './array';
import {rethrowAsync} from '../log';

const SERVICE_ID = 'DisplayObserver';

const DOC_OBSERVER = 0;
const VIEWPORT_OBSERVER = 1;

/** @implements {Disposable} */
export class DisplayObserver {
  /**
   * @param {!AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    const {win} = ampdoc;

    /** @private @const {!Array<!IntersectionObserver>} */
    this.observers_ = [];
    this.observers_[DOC_OBSERVER] = new win.IntersectionObserver(
      (e) => this.observed_(e, DOC_OBSERVER),
      {
        root: ampdoc.getBody(),
        threshold: 0.001,
      }
    );
    this.observers_[VIEWPORT_OBSERVER] = new win.IntersectionObserver(
      (e) => this.observed_(e, VIEWPORT_OBSERVER),
      {threshold: 0.001}
    );

    /** @private {boolean} */
    this.isDocVisible_ = ampdoc.isVisible();

    /** @private {?UnlistenDef} */
    this.visibilityUnlisten_ = ampdoc.onVisibilityChanged(() => {
      if (ampdoc.isVisible() !== this.isDocVisible_) {
        this.isDocVisible_ = ampdoc.isVisible();
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
    this.observers_[DOC_OBSERVER].disconnect();
    this.observers_[VIEWPORT_OBSERVER].disconnect();
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
      this.observers_[DOC_OBSERVER].observe(target);
      this.observers_[VIEWPORT_OBSERVER].observe(target);
    }
    if (pushIfNotExist(callbacks, callback)) {
      if (this.targetObservations_.has(target)) {
        // Notify the existing observation immediately.
        setTimeout(() => {
          const display = computeDisplay(
            this.targetObservations_.get(target),
            this.isDocVisible_
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
      this.observers_[DOC_OBSERVER].unobserve(target);
      this.observers_[VIEWPORT_OBSERVER].unobserve(target);
    }
  }

  /** @private */
  docVisibilityChanged_() {
    this.targetObserverCallbacks_.forEach((callbacks, target) => {
      const observations = this.targetObservations_.get(target);
      const oldDisplay = computeDisplay(observations, !this.isDocVisible_);
      const newDisplay = computeDisplay(observations, this.isDocVisible_);
      if (newDisplay != null && newDisplay !== oldDisplay) {
        for (let k = 0; k < callbacks.length; k++) {
          callCallbackNoInline(callbacks[k], newDisplay);
        }
      }
    });
  }

  /**
   * @param {!Array<!IntersectionObserverEntry>} entries
   * @param {number} observer
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
        observations = [];
        this.targetObservations_.set(target, observations);
      }
      const oldDisplay = computeDisplay(observations, this.isDocVisible_);
      observations[observer] = isIntersecting;
      const newDisplay = computeDisplay(observations, this.isDocVisible_);
      if (newDisplay != null && newDisplay !== oldDisplay) {
        for (let k = 0; k < callbacks.length; k++) {
          callCallbackNoInline(callbacks[k], newDisplay);
        }
      }
    }
  }
}

/**
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
 * @param {!Element} target
 * @return {!DisplayObserver}
 */
function getObserver(target) {
  registerServiceBuilderForDoc(target, SERVICE_ID, DisplayObserver);
  return /** @type {!DisplayObserver} */ (getServiceForDoc(target, SERVICE_ID));
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

/**
 * @param {?Array<boolean>} observations
 * @param {boolean} isDocVisible
 * @return {?boolean}
 */
function computeDisplay(observations, isDocVisible) {
  if (!isDocVisible) {
    return false;
  }
  if (!observations) {
    // Unknown yet.
    return null;
  }
  if (observations[DOC_OBSERVER] || observations[VIEWPORT_OBSERVER]) {
    // OR condition: one true - the result is true.
    return true;
  }
  if (
    observations[DOC_OBSERVER] === false &&
    observations[VIEWPORT_OBSERVER] === false
  ) {
    // Reverse of OR: both must be false for the result to be false.
    return false;
  }
  // Unknown.
  return null;
}
