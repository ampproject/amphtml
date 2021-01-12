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

import {pushIfNotExist, removeItem} from './array';
import {rethrowAsync} from '../log';

/** @typedef {function(../layout-rect.LayoutSizeDef)} */
let ContentSizeObserverCallbackDef;

/** @const {!WeakMap<!Window, !ResizeObserver>} */
const observers = new WeakMap();

/** @const {!WeakMap<!Element, !ContentSizeObserverCallbackDef>} */
const targetObserverListMap = new WeakMap();

/** @const {!WeakMap<!Element, !../layout-rect.LayoutSizeDef>} */
const targetSizeListMap = new WeakMap();

/**
 * @param {!Element} element
 * @param {!ContentSizeObserverCallbackDef} callback
 */
export function observeContentSize(element, callback) {
  const win = element.ownerDocument.defaultView;
  if (!win) {
    return;
  }
  let callbacks = targetObserverListMap.get(element);
  if (!callbacks) {
    callbacks = [];
    targetObserverListMap.set(element, callbacks);
    getObserver(win).observe(element);
  }
  if (pushIfNotExist(callbacks, callback)) {
    const size = targetSizeListMap.get(element);
    if (size) {
      setTimeout(() => callCallbackNoInline(callback, size));
    }
  }
}

/**
 * @param {!Element} element
 * @param {!ObserverCallbackDef} callback
 */
export function unobserveContentSize(element, callback) {
  const callbacks = targetObserverListMap.get(element);
  if (!callbacks) {
    return;
  }
  removeItem(callbacks, callback);
  if (callbacks.length == 0) {
    targetObserverListMap.delete(element);
    targetSizeListMap.delete(element);
    const win = element.ownerDocument.defaultView;
    if (win) {
      getObserver(win).unobserve(element);
    }
  }
}

/**
 * @param {!Element} element
 * @return {!Promise<!../layout-rect.LayoutSizeDef>}
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
  for (let i = entries.length - 1; i >= 0; i--) {
    const {target, contentRect} = entries[i];
    let seenTarget = false;
    for (let j = i + 1; j < entries.length; j++) {
      if (entries[j].target == target) {
        seenTarget = true;
        break;
      }
    }
    if (seenTarget) {
      continue;
    }
    const callbacks = targetObserverListMap.get(target);
    if (!callbacks) {
      continue;
    }
    const {width, height} = contentRect;
    /** @type {../layout-rect.LayoutSizeDef} */
    const size = {width, height};
    targetSizeListMap.set(target, size);
    for (let k = 0; k < callbacks.length; k++) {
      callCallbackNoInline(callbacks[k], size);
    }
  }
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
