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
import {isIframed} from './dom';

/**
 * Returns an IntersectionObserver tracking the Viewport.
 * Only use this if x-origin iframe rootMargin support is considered nice-to-have,
 * since if not supported this InOb will fallback to one without rootMargin.
 *
 * - If iframed: rootMargin is ignored unless natively supported (Chrome 81+).
 * - If not iframed: all features work properly in both polyfill and built-in.
 *
 * @param {function(!Array<!IntersectionObserverEntry>)} ioCallback
 * @param {!Window} win
 * @param {string=} threshold
 *
 * @return {!IntersectionObserver}
 */
export function getViewportObserver(ioCallback, win, threshold) {
  const iframed = isIframed(win);
  const root = /** @type {?Element} */ (iframed
    ? /** @type {*} */ (win.document)
    : null);

  // TODO(amphtml): Determine if rootMargin is still necessary.
  const rootMargin = '25%';

  try {
    return new win.IntersectionObserver(ioCallback, {
      root,
      rootMargin,
      threshold,
    });
  } catch (e) {
    return new win.IntersectionObserver(ioCallback, {rootMargin, threshold});
  }
}

/** @type {Map<!Window, !IntersectionObserver>} */
const viewportObservers = new Map();

/** @type {WeakMap<!Element, function(bool)>} */
const viewportCallbacks = new WeakMap();

/**
 * Lazily creates an IntersectionObserver per Window to track when elements
 * enter and exit the viewport. Fires viewportCallback when this happens.
 *
 * @param {!Element} element
 * @param {function(boolean)} viewportCallback
 */
export function observe(element, viewportCallback) {
  const win = element.ownerDocument.defaultView;
  if (!viewportObservers.has(win)) {
    viewportObservers.set(win, getViewportObserver(ioCallback, win));
  }
  viewportCallbacks.set(element, viewportCallback);
  viewportObservers.get(win).observe(element);
}

/**
 * Unobserve an element.
 * @param {!Element} element
 */
export function unobserve(element) {
  const win = element.ownerDocument.defaultView;
  if (viewportObservers.has(win)) {
    viewportObservers.get(win).unobserve(element);
  }
  viewportCallbacks.delete(element);
}

/**
 * Call the registered callbacks for each element that has crossed the
 * viewport boundary.
 *
 * @param {!Array<!IntersectionObserverEntry>} entries
 */
function ioCallback(entries) {
  for (let i = 0; i < entries.length; i++) {
    const {isIntersecting, target} = entries[i];
    const viewportCallback = viewportCallbacks.get(target);

    // The callback may not exist if unobserve wasn't called
    // but the element has been GCed.
    if (!viewportCallback) {
      unobserve(target);
      return;
    }

    viewportCallback(isIntersecting);
  }
}
