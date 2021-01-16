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

    /** @private @const {!IntersectionObserver} */
    this.docObserver_ = new win.IntersectionObserver(
      (e) => this.observed_(e, DOC_OBSERVER),
      {
        root: ampdoc.getBody(),
        threshold: 0.001,
      }
    );

    /** @private @const {!IntersectionObserver} */
    this.viewportObserver_ = new win.IntersectionObserver(
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
    this.targetObserverMultimap_ = new Map();

    /** @private @const {!Map<!Element, !Array<boolean>>} */
    this.targetDisplayMap_ = new Map();
  }

  /** @override */
  dispose() {
    this.docObserver_.disconnect();
    this.viewportObserver_.disconnect();
    this.visibilityUnlisten_();
    this.visibilityUnlisten_ = null;
    this.targetObserverMultimap_.clear();
    this.targetDisplayMap_.clear();
  }

  /**
   * @param {!Element} target
   * @param {function(boolean)} callback
   */
  observe(target, callback) {
    let callbacks = this.targetObserverMultimap_.get(target);
    if (!callbacks) {
      callbacks = [];
      this.targetObserverMultimap_.set(target, callbacks);
      this.docObserver_.observe(target);
      this.viewportObserver_.observe(target);
    }
    if (pushIfNotExist(callbacks, callback)) {
      if (this.targetDisplayMap_.has(target)) {
        setTimeout(() => {
          const display = getDisplay(
            this.targetDisplayMap_.get(target),
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
    const callbacks = this.targetObserverMultimap_.get(target);
    if (!callbacks) {
      return;
    }
    removeItem(callbacks, callback);
    if (callbacks.length == 0) {
      this.targetObserverMultimap_.delete(target);
      this.targetDisplayMap_.delete(target);
      this.docObserver_.unobserve(target);
      this.viewportObserver_.unobserve(target);
    }
  }

  /** @private */
  docVisibilityChanged_() {
    this.targetObserverMultimap_.forEach((callbacks, target) => {
      const displays = this.targetDisplayMap_.get(target);
      const oldDisplay = getDisplay(displays, !this.isDocVisible_);
      const newDisplay = getDisplay(displays, this.isDocVisible_);
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
      const callbacks = this.targetObserverMultimap_.get(target);
      if (!callbacks) {
        continue;
      }
      let displays = this.targetDisplayMap_.get(target);
      if (!displays) {
        displays = [];
        this.targetDisplayMap_.set(target, displays);
      }
      const oldDisplay = getDisplay(displays, this.isDocVisible_);
      displays[observer] = isIntersecting;
      const newDisplay = getDisplay(displays, this.isDocVisible_);
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
 * @param {?Array<boolean>} displays
 * @param {boolean} isDocVisible
 * @return {?boolean}
 */
function getDisplay(displays, isDocVisible) {
  if (!isDocVisible) {
    return false;
  }
  if (!displays) {
    // Unknown yet.
    return null;
  }
  if (displays[DOC_OBSERVER] || displays[VIEWPORT_OBSERVER]) {
    // OR condition: one true - the result is true.
    return true;
  }
  if (
    displays[DOC_OBSERVER] === false &&
    displays[VIEWPORT_OBSERVER] === false
  ) {
    // Reverse of OR: both must be false for the result to be false.
    return false;
  }
  // Unknown.
  return null;
}
