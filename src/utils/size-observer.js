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

import {rethrowAsync} from '../log';

/** @typedef {function(../layout-rect.LayoutSizeDef)} */
let ContentSizeObserverCallbackDef;

/** @typedef {function(!ResizeObserverEntry)} */
let SizeObserverCallbackDef;

/** @const {!WeakMap<!Window, !ResizeObserver>} */
const observers = new WeakMap();

/** @const {!WeakMap<!Element, !Map<?, !ContentSizeObserverCallbackDef>>} */
const targetObserverMultimap = new WeakMap();

/** @const {!WeakMap<!Element, !ResizeObserverEntry>} */
const targetSizeMap = new WeakMap();

/**
 * @param {!Element} element
 * @param {!ContentSizeObserverCallbackDef} callback
 */
export function observeContentSize(element, callback) {
  observeSizeInternal(element, callback, (entry) => {
    const {contentRect} = entry;
    const {width, height} = contentRect;
    /** @type {../layout-rect.LayoutSizeDef} */
    const size = {width, height};
    callback(size);
  });
}

/**
 * @param {!Element} element
 * @param {!ObserverCallbackDef} callback
 */
export function unobserveContentSize(element, callback) {
  unobserveSizeInternal(element, callback);
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
 * @param {!Element} element
 * @param {!ContentSizeObserverCallbackDef} callback
 */
export function observeSize(element, callback) {
  observeSizeInternal(element, callback, callback);
}

/**
 * @param {!Element} element
 * @param {!ObserverCallbackDef} callback
 */
export function unobserveSize(element, callback) {
  unobserveSizeInternal(element, callback);
}


/**
 * @param {!Element} element
 * @param {?} key
 * @param {!ContentSizeObserverCallbackDef} callback
 */
function observeSizeInternal(element, key, callback) {
  const win = element.ownerDocument.defaultView;
  if (!win) {
    return;
  }
  let callbacks = targetObserverMultimap.get(element);
  if (!callbacks) {
    callbacks = new Map();
    targetObserverMultimap.set(element, callbacks);
    getObserver(win).observe(element);
  }
  if (!callbacks.has(key)) {
    callbacks.set(key, callback);
    const entry = targetSizeMap.get(element);
    if (entry) {
      setTimeout(() => callCallbackNoInline(callback, entry));
    }
  }
}

/**
 * @param {!Element} element
 * @param {?} key
 */
function unobserveSizeInternal(element, key) {
  const callbacks = targetObserverMultimap.get(element);
  if (!callbacks) {
    return;
  }
  callbacks.delete(key);
  if (callbacks.size == 0) {
    targetObserverMultimap.delete(element);
    targetSizeMap.delete(element);
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
    targetSizeMap.set(target, entry);
    callbacks.forEach((callback) => callCallbackNoInline(callback, entry));
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
