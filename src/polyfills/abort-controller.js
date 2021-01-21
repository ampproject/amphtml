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
 * @param {!Window} win
 * @return {typeof AbortController}
 */
function createAbortController(win) {
  class AbortController {
    /** */
    constructor() {
      /** @const {!AbortSignal} */
      this.signal_ = new AbortSignal();
    }

    /** */
    abort() {
      this.signal_.isAborted_ = true;
      if (this.signal_.onabort_) {
        const event = win.document.createEvent('CustomEvent');
        event.initCustomEvent(
          'abort',
          /* bubbles */ false,
          /* cancelable */ false,
          /* detail */ null
        );
        // Notice that in IE the target/currentTarget are not overridable.
        try {
          Object.defineProperties(event, {
            'target': {value: this.signal_},
            'currentTarget': {value: this.signal_},
          });
        } catch (e) {
          // Ignore.
        }
        this.signal_.onabort_(event);
      }
    }

    /**
     * @return {!AbortSignal}
     */
    get signal() {
      return this.signal_;
    }
  }

  return AbortController;
}

class AbortSignal {
  /** */
  constructor() {
    /** @private {boolean} */
    this.isAborted_ = false;
    /** @private {?function(!Event)} */
    this.onabort_ = null;
  }

  /**
   * @return {boolean}
   */
  get aborted() {
    return this.isAborted_;
  }

  /**
   * @return {?function(!Event)}
   */
  get onabort() {
    return this.onabort_;
  }

  /**
   * @param {?function(!Event)} value
   */
  set onabort(value) {
    this.onabort_ = value;
  }
}

/**
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
    value: createAbortController(win),
  });
  Object.defineProperty(win, 'AbortSignal', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: AbortSignal,
  });
}
