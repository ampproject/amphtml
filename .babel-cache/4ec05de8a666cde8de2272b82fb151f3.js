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

import { computedStyle } from "../style";
import { tryCallback } from "../../error";
import { remove } from "../../types/array";
import { toWin } from "../../window";

import { LayoutSizeDef } from "./rect";

/** @typedef {!LayoutSizeDef|!ResizeObserverSize} TargetSize */

/** @enum {number} */
var Type = {
  /**
   * Mapped to the `ResizeObserverEntry.contentRect` and returns a
   * `LayoutSizeDef` value.
   */
  CONTENT: 0,
  /**
   * Mapped to the `ResizeObserverEntry.borderBoxSize` and returns a
   * `ResizeObserverSize` value.
   */
  BORDER_BOX: 1 };


var VERTICAL_RE = /vertical/;

/** @const {!WeakMap<!Window, !ResizeObserver>} */
var observers = /* #__PURE__ */new WeakMap();

/**
 * @const {!WeakMap<!Element, !Array<{
 *   type: !Type,
 *   callback: (function(!LayoutSizeDef)|function(!ResizeObserverSize))
 * }>>}
 */
var targetObserverMultimap = /* #__PURE__ */new WeakMap();

/** @const {!WeakMap<!Element, !ResizeObserverEntry>} */
var targetEntryMap = /* #__PURE__ */new WeakMap();

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
  return new Promise(function (resolve) {
    var onSize = function onSize(size) {
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
  return new Promise(function (resolve) {
    var onSize = function onSize(size) {
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
  var win = element.ownerDocument.defaultView;
  if (!win) {
    return;
  }
  var callbacks = targetObserverMultimap.get(element);
  if (!callbacks) {
    callbacks = [];
    targetObserverMultimap.set(element, callbacks);
    getObserver(win).observe(element);
  }
  var exists = callbacks.some(
  function (cb) {return cb.callback === callback && cb.type === type;});

  if (!exists) {
    callbacks.push({ type: type, callback: callback });
    var entry = targetEntryMap.get(element);
    if (entry) {
      setTimeout(function () {return computeAndCall(type, callback, entry);});
    }
  }
}

/**
 * @param {!Element} element
 * @param {!Type} type
 * @param {function(!LayoutSizeDef)|function(!ResizeObserverSize)} callback
 */
function unobserveSize(element, type, callback) {
  var callbacks = targetObserverMultimap.get(element);
  if (!callbacks) {
    return;
  }
  remove(callbacks, function (cb) {return cb.callback === callback && cb.type === type;});
  if (callbacks.length == 0) {
    targetObserverMultimap.delete(element);
    targetEntryMap.delete(element);
    var win = element.ownerDocument.defaultView;
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
  var observer = observers.get(win);
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
  var seen = new Set();
  for (var i = entries.length - 1; i >= 0; i--) {
    var entry = entries[i];
    var target = entry.target;
    if (seen.has(target)) {
      continue;
    }
    seen.add(target);
    var callbacks = targetObserverMultimap.get(target);
    if (!callbacks) {
      continue;
    }
    targetEntryMap.set(target, entry);
    for (var k = 0; k < callbacks.length; k++) {
      var _callbacks$k = callbacks[k],callback = _callbacks$k.callback,type = _callbacks$k.type;
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
    var contentRect = entry.contentRect;
    var height = contentRect.height,width = contentRect.width;
    /** @type {!LayoutSizeDef} */
    var size = { width: width, height: height };
    tryCallback(callback, size);
  } else if (type == Type.BORDER_BOX) {
    var borderBoxSizeArray = entry.borderBoxSize;
    /** @type {!ResizeObserverSize} */
    var borderBoxSize;
    if (borderBoxSizeArray) {
      // `borderBoxSize` is supported. Only single-fragment border boxes are
      // supported here (`borderBoxSize[0]`).
      if (borderBoxSizeArray.length > 0) {
        borderBoxSize = borderBoxSizeArray[0];
      } else {
        borderBoxSize = /** @type {!ResizeObserverSize} */({
          inlineSize: 0,
          blockSize: 0 });

      }
    } else {
      // `borderBoxSize` is not supported: polyfill it via blocking measures.
      var target = entry.target;
      var win = toWin(target.ownerDocument.defaultView);
      var isVertical = VERTICAL_RE.test(
      computedStyle(win, target)['writing-mode']);

      var offsetHeight = /** @type {!HTMLElement} */(target).offsetHeight,offsetWidth = /** @type {!HTMLElement} */(target).offsetWidth;
      var inlineSize, blockSize;
      if (isVertical) {
        blockSize = offsetWidth;
        inlineSize = offsetHeight;
      } else {
        inlineSize = offsetWidth;
        blockSize = offsetHeight;
      }
      borderBoxSize = { inlineSize: inlineSize, blockSize: blockSize };
    }
    tryCallback(callback, borderBoxSize);
  }
}
// /Users/mszylkowski/src/amphtml/src/core/dom/layout/size-observer.js