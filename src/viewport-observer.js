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
import {devAssert} from '../src/log';
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
 * @param {(number|!Array<number>)=} threshold
 *
 * @return {!IntersectionObserver}
 */
export function createViewportObserver(ioCallback, win, threshold) {
  const iframed = isIframed(win);
  const root = /** @type {?Element} */ (iframed
    ? /** @type {*} */ (win.document)
    : null);

  // TODO(#30794): See if we can safely remove rootMargin without adversely
  // affecting metrics.
  const rootMargin = '25%';

  // Chrome 81+ supports rootMargin in x-origin iframes via {root: document}
  // but this throws in other browsers.
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

/** @type {!WeakMap<!Window, !IntersectionObserver>} */
const viewportObservers = new WeakMap();

/** @type {!WeakMap<!Element, function(boolean)>} */
const viewportCallbacks = new WeakMap();

/**
 * Lazily creates an IntersectionObserver per Window to track when elements
 * enter and exit the viewport. Fires viewportCallback when this happens.
 *
 * @param {!Element} element
 * @param {function(boolean)} viewportCallback
 */
export function observeWithSharedInOb(element, viewportCallback) {
  // There should never be two unique observers of the same element.
  devAssert(
    !viewportCallbacks.has(element) ||
      viewportCallbacks.get(element) === viewportCallback
  );

  const win = element.ownerDocument.defaultView;
  let viewportObserver = viewportObservers.get(win);
  if (!viewportObserver) {
    viewportObservers.set(
      win,
      (viewportObserver = createViewportObserver(ioCallback, win))
    );
  }
  viewportCallbacks.set(element, viewportCallback);
  viewportObserver.observe(element);
}

/**
 * Unobserve an element.
 * @param {!Element} element
 */
export function unobserveWithSharedInOb(element) {
  const win = element.ownerDocument.defaultView;
  const viewportObserver = viewportObservers.get(win);
  if (viewportObserver) {
    viewportObserver.unobserve(element);
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
    viewportCallback(isIntersecting);
  }
}
