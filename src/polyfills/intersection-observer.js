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

/**
 * @fileoverview
 * See https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver.
 */


/* DO NOT SUBMIT: example:
var inob = new IntersectionObserver(function(records) {
  console.log('inob: ', records);
});
inob.observe($0);
*/


/**
 * @param {!Window} win
 */
export function install(win) {
  // DO NOT SUBMIT: remove, testing.
  delete win.IntersectionObserver;
  delete win.IntersectionObserverEntry;

  if (!win.IntersectionObserver) {
    win.IntersectionObserver = /** @type {typeof IntersectionObserver} */ (IntersectionObserverStub);
  }
}

/**
 * @param {!Window} childWin
 */
export function installForChildWin(childWin) {
  const parent = childWin.parent;
  if (!childWin.IntersectionObserver &&
      parent &&
      parent.IntersectionObserver) {
    childWin.IntersectionObserver = parent.IntersectionObserver;
    childWin.IntersectionObserverEntry = parent.IntersectionObserverEntry;
  }
}

/**
 * @param {!Window} win
 */
export function shouldLoadPolyfill(win) {
  return (
    !win.IntersectionObserver ||
    win.IntersectionObserver === IntersectionObserverStub ||
    !win.IntersectionObserverEntry ||
    !('isIntersecting' in win.IntersectionObserverEntry.prototype)
  );
}

/**
 * @param {!Window} win
 * @param {function()} installer
 */
export function upgradePolyfill(win, installer) {
  // Can't use the IntersectionObserverStub here directly since it's a separate
  // instance deployed in v0.js vs the polyfill extension.
  const Stub = /** @type {typeof IntersectionObserverStub} */ (win.IntersectionObserver);
  if (!Stub || Stub.stubs_) {
    delete win.IntersectionObserver;
    delete win.IntersectionObserverEntry;
    installer();
    const Impl = win.IntersectionObserver;
    const stubs = Stub.stubs_;
    Stub.stubs_ = [];
    if (stubs.length > 0) {
      const microtask = Promise.resolve();
      stubs.forEach(stub => {
        microtask.then(() => stub.upgrade_(Impl));
      });
    }
  }
}

/**
 * The stub for `IntersectionObserver`. Implements the same interface, but
 * keeps the tracked elements in memory until the actual polyfill arives.
 * This stub is necessary because the polyfill itself is significantly bigger.
 */
class IntersectionObserverStub {

  /**
   * @param {!IntersectionObserverCallback} callback
   * @param {!IntersectionObserverInit=} options
   */
  constructor(callback, options) {
    /** @private @const */
    this.callback_ = callback;

    /** @private @const {!IntersectionObserverInit} */
    this.options_ = {
      root: null,
      rootMargin: '0px 0px 0px 0px',
      ...options,
    };

    // Must fail on the document root to ensure that the polyfill is not
    // confused with the new spec that allows document as the root.
    const root = this.options_.root;
    if (root && root.nodeType !== /* ELEMENT */ 1) {
      throw new Error('root document is not supported');
    }

    /** @private {?Array<!Element>} */
    this.elements_ = [];

    /** @private {?IntersectionObserver} */
    this.inst_ = null;

    // Wait for the upgrade.
    IntersectionObserverStub.stubs_.push(this);
  }

  /**
   * @export
   * @return {?Element}
   */
  get root() {
    if (this.inst_) {
      return this.inst_.root;
    }
    return this.options_.root || null;
  }

  /**
   * @export
   * @return {*}
   */
  get rootMargin() {
    if (this.inst_) {
      return this.inst_.rootMargin;
    }
    return this.options_.rootMargin;
  }

  /**
   * @export
   * @return {*}
   */
  get thresholds() {
    if (this.inst_) {
      return this.inst_.thresholds;
    }
    return [].concat(this.options_.threshold || 0);
  }

  /**
   * @export
   */
  disconnect() {
    if (this.inst_) {
      this.inst_.disconnect();
    } else {
      this.elements_.length = 0;
    }
  }

  /**
   * @export
   * @return {!Array}
   */
  takeRecords() {
    if (this.inst_) {
      return this.inst_.takeRecords();
    }
    return [];
  }

  /**
   * @export
   * @param {!Element} target
   */
  observe(target) {
    if (this.inst_) {
      this.inst_.observe(target);
    } else {
      if (this.elements_.indexOf(target) == -1) {
        this.elements_.push(target);
      }
    }
  }

  /**
   * @export
   * @param {!Element} target
   */
  unobserve(target) {
    if (this.inst_) {
      this.inst_.unobserve(target);
    } else {
      const index = this.elements_.indexOf(target);
      if (index != -1) {
        this.elements_.splice(index, 1);
      }
    }
  }

  /**
   * @param {function(new:IntersectionObserver, !IntersectionObserverCallback, !IntersectionObserverInit=)} constr
   * @private
   */
  upgrade_(constr) {
    const inst = new constr(this.callback_, this.options_);
    this.inst_ = inst;
    this.elements_.forEach(e => inst.observe(e));
    this.elements_ = null;
  }
}

/**
 * @type {!Array<!IntersectionObserverStub>}
 * @private
 */
IntersectionObserverStub.stubs_ = [];
