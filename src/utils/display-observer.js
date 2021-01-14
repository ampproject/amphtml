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

/** @implements {Disposable} */
export class DisplayObserver {
  /**
   * @param {!AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    const {win} = ampdoc;

    /** @private @const {!IntersectionObserver} */
    this.docObserver_ = new win.IntersectionObserver(
      (e) => this.observed_(e, 0),
      {
        root: ampdoc.getBody(),
        threshold: 0.001,
      }
    );

    /** @private @const {!IntersectionObserver} */
    this.viewportObserver_ = new win.IntersectionObserver(
      (e) => this.observed_(e, 1),
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
      console.log('DisplayObserver: observe', target.id);
      callbacks = [];
      this.targetObserverMultimap_.set(target, callbacks);
      this.docObserver_.observe(target);
      this.viewportObserver_.observe(target);
    }
    if (pushIfNotExist(callbacks, callback)) {
      const displays = this.targetDisplayMap_.get(target);
      if (displays) {
        setTimeout(() =>
          callCallbackNoInline(
            callback,
            getDisplay(displays, this.isDocVisible_)
          )
        );
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
      console.log('DisplayObserver: unobserve', target.id);
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
      if (newDisplay !== oldDisplay) {
        for (let k = 0; k < callbacks.length; k++) {
          callCallbackNoInline(callbacks[k], newDisplay);
        }
      }
    });
  }

  /**
   * @param {!Array<!IntersectionObserverEntry>} entries
   * @param {number} index
   * @private
   */
  observed_(entries, index) {
    const seen = new Set();
    for (let i = entries.length - 1; i >= 0; i--) {
      const {target, isIntersecting} = entries[i];
      console.log(
        'DisplayObserver: observed_:',
        index,
        target.id,
        isIntersecting
      );
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
      displays[index] = isIntersecting;
      const newDisplay = getDisplay(displays, this.isDocVisible_);
      if (newDisplay !== oldDisplay) {
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
 * @return {boolean}
 */
function getDisplay(displays, isDocVisible) {
  return (
    isDocVisible && displays != null && (displays[0] || displays[1] || false)
  );
}
