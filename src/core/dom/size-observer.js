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

import {computedStyle} from './style';
import {remove} from '../types/array';
import {toWin} from '../window';
import {tryCallback} from '../error';

// typedef imports
import {LayoutSizeDef} from '../math/layout-rect';

/** @typedef {!LayoutSizeDef|!ResizeObserverSize} TargetSize */

/** @enum {number} */
const Type = {
  /**
   * Mapped to the `ResizeObserverEntry.contentRect` and returns a
   * `LayoutSizeDef` value.
   */
  CONTENT: 0,
  /**
   * Mapped to the `ResizeObserverEntry.borderBoxSize` and returns a
   * `ResizeObserverSize` value.
   */
  BORDER_BOX: 1,
};

const VERTICAL_RE = /vertical/;

/** @const {!WeakMap<!Window, !ResizeObserver>} */
const observers = new WeakMap();

/**
 * @const {!WeakMap<!Element, !Array<{
 *   type: !Type,
 *   callback: (function(!LayoutSizeDef)|function(!ResizeObserverSize))
 * }>>}
 */
const targetObserverMultimap = new WeakMap();

/** @const {!WeakMap<!Element, !ResizeObserverEntry>} */
const targetEntryMap = new WeakMap();

/**
 * @param {!Element} element
 * @param {function(!LayoutSizeDef)} callback
 */
export function observeContentSize(element, callback) {
  observeSize(element, Type.CONTENT, callback);
}

/**
 * @param {!Element} element
 * @param {function(!LayoutSizeDef)} callback
 */
export function unobserveContentSize(element, callback) {
  unobserveSize(element, Type.CONTENT, callback);
}

/**
 * @param {!Element} element
 * @return {!Promise<!LayoutSizeDef>}
 */
export function measureContentSize(element) {
  return new Promise((resolve) => {
    const onSize = (size) => {
      resolve(size);
      unobserveContentSize(element, onSize);
    };
    observeContentSize(element, onSize);
  });
}

/**
 * Note: this method doesn't support multi-fragment border boxes.
 * @param {!Element} element
 * @param {function(!ResizeObserverSize)} callback
 */
export function observeBorderBoxSize(element, callback) {
  observeSize(element, Type.BORDER_BOX, callback);
}

/**
 * Note: this method doesn't support multi-fragment border boxes.
 * @param {!Element} element
 * @param {function(!ResizeObserverSize)} callback
 */
export function unobserveBorderBoxSize(element, callback) {
  unobserveSize(element, Type.BORDER_BOX, callback);
}

/**
 * Note: this method doesn't support multi-fragment border boxes.
 * @param {!Element} element
 * @return {!Promise<!ResizeObserverSize>}
 */
export function measureBorderBoxSize(element) {
  return new Promise((resolve) => {
    const onSize = (size) => {
      resolve(size);
      unobserveBorderBoxSize(element, onSize);
    };
    observeBorderBoxSize(element, onSize);
  });
}

/**
 * @param {!Element} element
 * @param {!Type} type
 * @param {function(!LayoutSizeDef)|function(!ResizeObserverSize)} callback
 */
function observeSize(element, type, callback) {
  const win = element.ownerDocument.defaultView;
  if (!win) {
    return;
  }
  let callbacks = targetObserverMultimap.get(element);
  if (!callbacks) {
    callbacks = [];
    targetObserverMultimap.set(element, callbacks);
    getObserver(win).observe(element);
  }
  const exists = callbacks.some(
    (cb) => cb.callback === callback && cb.type === type
  );
  if (!exists) {
    callbacks.push({type, callback});
    const entry = targetEntryMap.get(element);
    if (entry) {
      setTimeout(() => computeAndCall(type, callback, entry));
    }
  }
}

/**
 * @param {!Element} element
 * @param {!Type} type
 * @param {function(!LayoutSizeDef)|function(!ResizeObserverSize)} callback
 */
function unobserveSize(element, type, callback) {
  const callbacks = targetObserverMultimap.get(element);
  if (!callbacks) {
    return;
  }
  remove(callbacks, (cb) => cb.callback === callback && cb.type === type);
  if (callbacks.length == 0) {
    targetObserverMultimap.delete(element);
    targetEntryMap.delete(element);
    const win = element.ownerDocument.defaultView;
    if (win) {
      getObserver(win).unobserve(element);
    }
  }
}

/**
 * @param {!Window} win
 * @return {!ResizeObserver}
 */
function getObserver(win) {
  let observer = observers.get(win);
  if (!observer) {
    observer = new win.ResizeObserver(processEntries);
    observers.set(win, observer);
  }
  return observer;
}

/**
 * @param {!Array<!ResizeObserverEntry>} entries
 */
function processEntries(entries) {
  const seen = new Set();
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i];
    const {target} = entry;
    if (seen.has(target)) {
      continue;
    }
    seen.add(target);
    const callbacks = targetObserverMultimap.get(target);
    if (!callbacks) {
      continue;
    }
    targetEntryMap.set(target, entry);
    for (let k = 0; k < callbacks.length; k++) {
      const {callback, type} = callbacks[k];
      computeAndCall(type, callback, entry);
    }
  }
}

/**
 * @param {Type} type
 * @param {function(!LayoutSizeDef)|function(!ResizeObserverSize)} callback
 * @param {!ResizeObserverEntry} entry
 */
function computeAndCall(type, callback, entry) {
  if (type == Type.CONTENT) {
    const {contentRect} = entry;
    const {height, width} = contentRect;
    /** @type {!LayoutSizeDef} */
    const size = {width, height};
    tryCallback(callback, size);
  } else if (type == Type.BORDER_BOX) {
    const {borderBoxSize: borderBoxSizeArray} = entry;
    /** @type {!ResizeObserverSize} */
    let borderBoxSize;
    if (borderBoxSizeArray) {
      // `borderBoxSize` is supported. Only single-fragment border boxes are
      // supported here (`borderBoxSize[0]`).
      if (borderBoxSizeArray.length > 0) {
        borderBoxSize = borderBoxSizeArray[0];
      } else {
        borderBoxSize = /** @type {!ResizeObserverSize} */ ({
          inlineSize: 0,
          blockSize: 0,
        });
      }
    } else {
      // `borderBoxSize` is not supported: polyfill it via blocking measures.
      const {target} = entry;
      const win = toWin(target.ownerDocument.defaultView);
      const isVertical = VERTICAL_RE.test(
        computedStyle(win, target)['writing-mode']
      );
      const {offsetHeight, offsetWidth} = /** @type {!HTMLElement} */ (target);
      let inlineSize, blockSize;
      if (isVertical) {
        blockSize = offsetWidth;
        inlineSize = offsetHeight;
      } else {
        inlineSize = offsetWidth;
        blockSize = offsetHeight;
      }
      borderBoxSize = {inlineSize, blockSize};
    }
    tryCallback(callback, borderBoxSize);
  }
}
