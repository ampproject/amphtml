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
 *
 * This is the stub to support IntersectionObserver. It's installed from
 * polyfills/intersection-observer.js and upgraded from the
 * amp-intersection-observer-polyfill extension.
 */

import {Services} from '../services';

const UPGRADERS = '_upgraders';
const NATIVE = '_native';
const STUB = '_stub';

/**
 * @param {!Window} win
 * @return {boolean}
 * @visibleForTesting
 */
export function shouldLoadPolyfill(win) {
  return (
    !win.IntersectionObserver ||
    !win.IntersectionObserverEntry ||
    !!win.IntersectionObserver[STUB] ||
    !supportsDocumentRoot(win)
  );
}

/**
 * @param {typeof IntersectionObserver} Native
 * @param {typeof IntersectionObserver} Polyfill
 * @return {typeof IntersectionObserver}
 */
function getIntersectionObserverDispatcher(Native, Polyfill) {
  return function (ioCallback, opts) {
    if (opts && opts.root && opts.root.nodeType === 9) {
      return new Polyfill(ioCallback, opts);
    } else {
      return new Native(ioCallback, opts);
    }
  };
}

/**
 * Installs the InOb stubs. This should only be called in two cases:
 * 1. No native InOb exists.
 * 2. Native InOb is present, but lacks document root support.
 *
 * @param {!Window} win
 */
export function installStub(win) {
  if (!win.IntersectionObserver) {
    win.IntersectionObserver = IntersectionObserverStub;
    win.IntersectionObserver[STUB] = IntersectionObserverStub;
    return;
  }

  const Native = win.IntersectionObserver;
  win.IntersectionObserver = getIntersectionObserverDispatcher(
    win.IntersectionObserver,
    IntersectionObserverStub
  );
  win.IntersectionObserver[STUB] = IntersectionObserverStub;
  win.IntersectionObserver[NATIVE] = Native;
}

/**
 * Returns true if IntersectionObserver supports a document root.
 * @param {!Window} win
 * @return {boolean}
 */
export function supportsDocumentRoot(win) {
  try {
    new win.IntersectionObserver(() => {}, {root: win.document});
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {!Window} win
 */
export function scheduleUpgradeIfNeeded(win) {
  if (shouldLoadPolyfill(win)) {
    Services.extensionsFor(win).preloadExtension(
      'amp-intersection-observer-polyfill'
    );
  }
}

/**
 * @param {!Window} win
 * @param {function()} installer
 */
export function upgradePolyfill(win, installer) {
  // Can't use the IntersectionObserverStub here directly since it's a separate
  // instance deployed in v0.js vs the polyfill extension.
  const Stub = /** @type {typeof IntersectionObserverStub} */ (win
    .IntersectionObserver[STUB]);
  if (Stub) {
    const Native = win.IntersectionObserver[NATIVE];
    delete win.IntersectionObserver;
    delete win.IntersectionObserverEntry;
    installer();
    const Polyfill = win.IntersectionObserver;
    if (Native) {
      win.IntersectionObserver = getIntersectionObserverDispatcher(
        Native,
        Polyfill
      );
    }

    const upgraders = Stub[UPGRADERS].slice(0);
    const microtask = Promise.resolve();
    const upgrade = (upgrader) => {
      microtask.then(() => upgrader(Polyfill));
    };
    if (upgraders.length > 0) {
      /** @type {!Array} */ (upgraders).forEach(upgrade);
    }
    Stub[
      UPGRADERS
    ] = /** @type {!Array<function(typeof IntersectionObserver)>} */ ({
      'push': upgrade,
    });
  } else {
    // Even if this is not the stub, we still may need to polyfill
    // `isIntersecting`. See `shouldLoadPolyfill` for more info.
    installer();
  }
}

/**
 * The stub for `IntersectionObserver`. Implements the same interface, but
 * keeps the tracked elements in memory until the actual polyfill arives.
 * This stub is necessary because the polyfill itself is significantly bigger.
 */
export class IntersectionObserverStub {
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

    /** @private {?Array<!Element>} */
    this.elements_ = [];

    /** @private {?IntersectionObserver} */
    this.inst_ = null;

    // Wait for the upgrade.
    IntersectionObserverStub[UPGRADERS].push(this.upgrade_.bind(this));
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
   * @param {typeof IntersectionObserver} constr
   * @private
   */
  upgrade_(constr) {
    const inst = new constr(this.callback_, this.options_);
    this.inst_ = inst;
    this.elements_.forEach((e) => inst.observe(e));
    this.elements_ = null;
  }
}

/**
 * @type {!Array<function(typeof IntersectionObserver)>}
 */
IntersectionObserverStub[UPGRADERS] = [];

/** @visibleForTesting */
export function resetStubsForTesting() {
  IntersectionObserverStub[UPGRADERS] = [];
}
