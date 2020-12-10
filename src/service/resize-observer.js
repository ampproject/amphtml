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

import {pushIfNotExist, removeItem} from '../utils/array';
import {
  registerServiceBuilder,
  registerServiceBuilderInEmbedWin,
} from '../service';
import {rethrowAsync} from '../log';

/** @typedef {function(../layout-rect.LayoutSizeDef)} */
let ObserverCallbackDef;

/**
 * Pools resize observers. Eventually the hope is that the call sites can
 * instantiate their own resize observers. But currently there are some
 * performance issues and pooling is desired. For more info, see
 * https://bugs.chromium.org/p/chromium/issues/detail?id=1157544
 *
 * @implements {../service.Disposable}
 */
export class ResizeObserverImpl {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    if (!RESIZE_OBSERVER) {
      return;
    }

    /** @private @const {!ResizeObserver} */
    this.observer_ = new win.ResizeObserver((e) => this.processEntries_(e));

    /** @private {?WeakMap<!Element, !../layout-rect.LayoutSizeDef>} */
    this.lastSizes_ = new WeakMap();

    /** @private {?WeakMap<!Element, !ObserverCallbackDef>} */
    this.callbacks_ = new WeakMap();

    /** @private @const */
    this.microtask_ = Promise.resolve();
  }

  /** @override */
  dispose() {
    if (!RESIZE_OBSERVER) {
      return;
    }
    this.callbacks_ = null;
    this.lastSizes_ = null;
    this.observer_.dispose();
  }

  /**
   * @param {!Element} element
   * @param {!ObserverCallbackDef} callback
   */
  observe(element, callback) {
    if (!RESIZE_OBSERVER) {
      return;
    }
    let callbacks = this.callbacks_.get(element);
    if (!callbacks) {
      callbacks = [];
      this.callbacks_.set(element, callbacks);
      this.observer_.observe(element);
    }
    if (!pushIfNotExist(callbacks, callback)) {
      return;
    }
    const lastSize = this.lastSizes_.get(element);
    if (lastSize) {
      this.microtask_.then(() => callCallbackNoInline(callback, lastSize));
    }
  }

  /**
   * @param {!Element} element
   * @param {!ObserverCallbackDef} callback
   */
  unobserve(element, callback) {
    if (!RESIZE_OBSERVER) {
      return;
    }
    const callbacks = this.callbacks_.get(element);
    if (!callbacks) {
      return;
    }
    removeItem(callbacks, callback);
    if (callbacks.length == 0) {
      this.callbacks_.delete(element);
      this.lastSizes_.delete(element);
      this.observer_.unobserve(element);
    }
  }

  /**
   * @param {!Array<!ResizeObserverEntry>} entries
   * @private
   */
  processEntries_(entries) {
    for (let i = entries.length - 1; i >= 0; i--) {
      const {target, clientRect} = entries[i];
      let seenTarget = false;
      for (let j = i + 1; j < entries.length; j++) {
        if (entries[j] == target) {
          seenTarget = true;
          break;
        }
      }
      if (seenTarget) {
        continue;
      }
      const callbacks = this.callbacks_.get(target);
      if (!callbacks) {
        continue;
      }
      const {width, height} = clientRect;
      /** @type {../layout-rect.LayoutSizeDef} */
      const size = {width, height};
      this.lastSizes_.set(target, size);
      for (let k = 0; k < callbacks.length; k++) {
        callCallbackNoInline(callbacks[k], size);
      }
    }
  }
}

/**
 * @param {!ObserverCallbackDef} callback
 * @param {../layout-rect.LayoutSizeDef} size
 * @noinline
 */
function callCallbackNoInline(callback, size) {
  try {
    callback(size);
  } catch (e) {
    rethrowAsync(e);
  }
}

/**
 * @param {!Window} win
 */
export function installResizeObserver(win) {
  registerServiceBuilder(win, 'resizeObserver', ResizeObserverImpl);
}

/**
 * @param {!Window} win
 */
export function installResizeObserverInEmbedWindow(win) {
  registerServiceBuilderInEmbedWin(win, 'resizeObserver', ResizeObserverImpl);
}
