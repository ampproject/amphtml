/**
 * @fileoverview
 * See https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
 *
 * This is the stub to support ResizeObserver. It's installed from
 * polyfills/resize-observer.js and upgraded from the
 * amp-resize-observer-polyfill extension.
 */

/** @typedef {function(!typeof ResizeObserver)} */
let ResObsUpgraderDef;

const UPGRADERS = '_upgraders';
const STUB = '_stub';

/**
 * @param {!Window} win
 * @return {boolean}
 * @visibleForTesting
 */
export function shouldLoadPolyfill(win) {
  return !win.ResizeObserver || !!win.ResizeObserver[STUB];
}

/**
 * Installs the ResOb stubs.
 *
 * @param {!Window} win
 */
export function installStub(win) {
  if (win.ResizeObserver) {
    return;
  }

  win.ResizeObserver = ResizeObserverStub;
  win.ResizeObserver[STUB] = ResizeObserverStub;
}

/**
 * @param {!Window} win
 * @param {function()} installer
 */
export function upgradePolyfill(win, installer) {
  // Can't use the ResizeObserverStub here directly since it's a separate
  // instance deployed in v0.js vs the polyfill extension.
  const Stub = win.ResizeObserver[STUB];
  if (Stub) {
    delete win.ResizeObserver;
    delete win.ResizeObserverEntry;
    installer();

    const Polyfill = win.ResizeObserver;
    /** @type {!Array<ResObsUpgraderDef>} */
    const upgraders = Stub[UPGRADERS].slice(0);
    const microtask = Promise.resolve();
    const upgrade = (upgrader) => {
      microtask.then(() => upgrader(Polyfill));
    };
    for (const upgrader of upgraders) {
      upgrade(upgrader);
    }
    Stub[UPGRADERS] = {'push': upgrade};
  } else {
    // Even if this is not the stub, we still may need to install the polyfill.
    // See `shouldLoadPolyfill` for more info.
    installer();
  }
}

/**
 * The stub for `ResizeObserver`. Implements the same interface, but
 * keeps the tracked elements in memory until the actual polyfill arives.
 * This stub is necessary because the polyfill itself is significantly bigger.
 * It doesn't technically extend ResizeObserver, but this allows the stub
 * to be seen as equivalent when typechecking calls expecting a ResizeObserver.
 * @extends ResizeObserver
 */
export class ResizeObserverStub {
  /** @param {!ResizeObserverCallback} callback */
  constructor(callback) {
    /** @private @const {!ResizeObserverCallback} */
    this.callback_ = callback;

    /** @private {!Array<!Element>} */
    this.elements_ = [];

    /** @private {?ResizeObserver} */
    this.inst_ = null;

    // Wait for the upgrade.
    ResizeObserverStub[UPGRADERS].push(this.upgrade_.bind(this));
  }

  /** @return {undefined} */
  disconnect() {
    if (this.inst_) {
      this.inst_.disconnect();
    } else {
      this.elements_.length = 0;
    }
  }

  /** @param {!Element} target */
  observe(target) {
    if (this.inst_) {
      this.inst_.observe(target);
    } else {
      if (this.elements_.indexOf(target) == -1) {
        this.elements_.push(target);
      }
    }
  }

  /** @param {!Element} target */
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
   * @param {!typeof ResizeObserver} Ctor
   * @private
   */
  upgrade_(Ctor) {
    const inst = new Ctor(this.callback_);
    this.inst_ = inst;
    for (const e of this.elements_) {
      inst.observe(e);
    }
    this.elements_.length = 0;
  }
}

/** @type {!Array<!ResObsUpgraderDef>} */
ResizeObserverStub[UPGRADERS] = [];

/** @visibleForTesting */
export function resetStubsForTesting() {
  ResizeObserverStub[UPGRADERS] = [];
}
