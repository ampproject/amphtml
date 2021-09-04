/**
 * @fileoverview
 * See https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver.
 *
 * This is the stub to support IntersectionObserver. It's installed from
 * polyfills/intersection-observer.js and upgraded from the
 * amp-intersection-observer-polyfill extension.
 */

/** @typedef {function(!typeof IntersectionObserver)} */
let InObUpgraderDef;

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
    !supportsDocumentRoot(win) ||
    isWebkit(win)
  );
}

/**
 * All current WebKit (as of Safari 14.x) {root:document} IntersectionObservers
 * will report incorrect rootBounds, intersectionRect, and intersectionRatios
 * and therefore we force the polyfill in this case.
 * See: https://bugs.webkit.org/show_bug.cgi?id=219495.
 *
 * @param {!Window} win
 * @return {boolean}
 */
function isWebkit(win) {
  // navigator.vendor is always "Apple Computer, Inc." for all iOS browsers and
  // Mac OS Safari.
  return /apple/i.test(win.navigator.vendor);
}

/**
 * @param {!typeof IntersectionObserver} Native
 * @param {!typeof IntersectionObserver} Polyfill
 * @return {!typeof IntersectionObserver}
 */
function getIntersectionObserverDispatcher(Native, Polyfill) {
  /**
   * @param {!IntersectionObserverCallback} ioCallback
   * @param {IntersectionObserverInit=} opts
   * @return {!IntersectionObserver}
   */
  function Ctor(ioCallback, opts) {
    if (opts?.root?.nodeType === /* Node.DOCUMENT_NODE */ 9) {
      return new Polyfill(ioCallback, opts);
    } else {
      return new Native(ioCallback, opts);
    }
  }
  return Ctor;
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
    new win.IntersectionObserver(() => {}, {
      // TODO(rcebulko): Update when CC updates their externs
      // See https://github.com/google/closure-compiler/pull/3804
      root: /** @type {?} */ (win.document),
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {!Window} win
 * @param {function()} installer
 */
export function upgradePolyfill(win, installer) {
  // Can't use the IntersectionObserverStub here directly since it's a separate
  // instance deployed in v0.js vs the polyfill extension.
  const Stub = win.IntersectionObserver[STUB];
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

    /** @type {!Array<!InObUpgraderDef>} */
    const upgraders = Stub[UPGRADERS].slice(0);
    const microtask = Promise.resolve();
    const upgrade = (upgrader) => {
      microtask.then(() => upgrader(Polyfill));
    };
    upgraders.forEach(upgrade);
    Stub[UPGRADERS] = {'push': upgrade};
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
 *
 * It doesn't technically extend IntersectionObserver, but this allows the stub
 * to be seen as equivalent when typechecking calls expecting an
 * IntersectionObserver.
 * @extends IntersectionObserver
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

    /** @private {!Array<!Element>} */
    this.elements_ = [];

    /** @private {?IntersectionObserver} */
    this.inst_ = null;

    // Wait for the upgrade.
    IntersectionObserverStub[UPGRADERS].push(this.upgrade_.bind(this));
  }

  /** @return {?Element} */
  get root() {
    if (this.inst_) {
      return this.inst_.root;
    }
    // eslint-disable-next-line local/no-forbidden-terms
    return /** @type {!Element} */ (this.options_.root) || null;
  }

  /** @return {string} */
  get rootMargin() {
    if (this.inst_) {
      return this.inst_.rootMargin;
    }
    // The CC-provided IntersectionObserverInit type allows for rootMargin to be
    // undefined, but we provide a default, so it's guaranteed to be a string
    // here.
    return /** @type {string} */ (this.options_.rootMargin);
  }

  /** @return {!Array<number>} */
  get thresholds() {
    if (this.inst_) {
      return this.inst_.thresholds;
    }
    return [].concat(this.options_.threshold || 0);
  }

  /** @return {undefined} */
  disconnect() {
    if (this.inst_) {
      this.inst_.disconnect();
    } else {
      this.elements_.length = 0;
    }
  }

  /** @return {!Array<!IntersectionObserverEntry>} */
  takeRecords() {
    if (this.inst_) {
      return this.inst_.takeRecords();
    }
    return [];
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
   * @param {!typeof IntersectionObserver} Ctor
   * @private
   */
  upgrade_(Ctor) {
    const inst = new Ctor(this.callback_, this.options_);
    this.inst_ = inst;
    for (const e of this.elements_) {
      inst.observe(e);
    }
    this.elements_.length = 0;
  }
}

/** @type {!Array<!InObUpgraderDef>} */
IntersectionObserverStub[UPGRADERS] = [];

/** @visibleForTesting */
export function resetStubsForTesting() {
  IntersectionObserverStub[UPGRADERS] = [];
}
