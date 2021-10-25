/** Polyfill for the public AbortController. */
class AbortController {
  /** Constructor. */
  constructor() {
    /** @const {!AbortSignal} */
    this.signal_ = new AbortSignal();
  }

  /** Triggers an abort signal. */
  abort() {
    if (this.signal_.isAborted_) {
      // Already aborted.
      return;
    }
    this.signal_.isAborted_ = true;
    if (this.signal_.onabort_) {
      const event = /** @type {!Event} */ ({
        'type': 'abort',
        'bubbles': false,
        'cancelable': false,
        'target': this.signal_,
        'currentTarget': this.signal_,
      });
      this.signal_.onabort_(event);
    }
  }

  /** @return {!AbortSignal} */
  get signal() {
    return this.signal_;
  }
}

/** Polyfill for the public AbortSignal. */
class AbortSignal {
  /** */
  constructor() {
    /** @private {boolean} */
    this.isAborted_ = false;
    /** @private {?function(!Event)} */
    this.onabort_ = null;
  }

  /** @return {boolean} */
  get aborted() {
    return this.isAborted_;
  }

  /** @return {?function(!Event)} */
  get onabort() {
    return this.onabort_;
  }

  /** @param {?function(!Event)} value */
  set onabort(value) {
    this.onabort_ = value;
  }
}

/**
 * Sets the AbortController and AbortSignal polyfills if not defined.
 * @param {!Window} win
 */
export function install(win) {
  if (win.AbortController) {
    return;
  }
  Object.defineProperty(win, 'AbortController', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: AbortController,
  });
  Object.defineProperty(win, 'AbortSignal', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: AbortSignal,
  });
}
