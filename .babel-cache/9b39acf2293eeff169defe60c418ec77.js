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
import { devAssert } from "../../assert";
import { isIframed } from "./..";
import * as mode from "../../mode";
import { toWin } from "../../window";

/**
 * Returns an IntersectionObserver tracking the Viewport.
 *
 * @param {function(!Array<!IntersectionObserverEntry>)} ioCallback
 * @param {!Window} win
 * @param {{
 *   threshold: (number|!Array<number>|undefined),
 *   needsRootBounds: (boolean|undefined),
 * }=} opts
 * @return {!IntersectionObserver}
 */
export function createViewportObserver(ioCallback, win) {var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var needsRootBounds = opts.needsRootBounds,threshold = opts.threshold;
  // The Document -> Element type conversion is necessary to satisfy the
  // `IntersectionObserver` constructor extern that only accepts `Element`.
  var root =
  isIframed(win) && needsRootBounds ?
  /** @type {?} */(win.document) :
  undefined;
  return new win.IntersectionObserver(ioCallback, {
    threshold: threshold,
    root: root });

}

/** @type {!WeakMap<!Window, !IntersectionObserver>} */
var viewportObservers = new WeakMap();

/** @type {!WeakMap<!Element, function(boolean)>} */
var viewportCallbacks = new WeakMap();

/**
 * Lazily creates an IntersectionObserver per Window to track when elements
 * enter and exit the viewport. Fires viewportCallback when this happens.
 *
 * @param {!Element} element
 * @param {function(boolean)} viewportCallback
 */
export function observeWithSharedInOb(element, viewportCallback) {
  // There should never be two unique observers of the same element.
  if (mode.isLocalDev()) {
    devAssert(
    !viewportCallbacks.has(element) ||
    viewportCallbacks.get(element) === viewportCallback);

  }

  var win = toWin(element.ownerDocument.defaultView);
  var viewportObserver = viewportObservers.get(win);
  if (!viewportObserver) {
    viewportObservers.set(
    win, (
    viewportObserver = createViewportObserver(ioCallback, win)));

  }
  viewportCallbacks.set(element, viewportCallback);
  viewportObserver.observe(element);
}

/**
 * Unobserve an element.
 * @param {!Element} element
 */
export function unobserveWithSharedInOb(element) {
  var win = toWin(element.ownerDocument.defaultView);
  var viewportObserver = viewportObservers.get(win);
  (viewportObserver === null || viewportObserver === void 0) ? (void 0) : viewportObserver.unobserve(element);
  viewportCallbacks.delete(element);
}

/**
 * Call the registered callbacks for each element that has crossed the
 * viewport boundary.
 *
 * @param {!Array<!IntersectionObserverEntry>} entries
 */
function ioCallback(entries) {
  for (var i = 0; i < entries.length; i++) {var _viewportCallbacks$ge;
    var _entries$i = entries[i],isIntersecting = _entries$i.isIntersecting,target = _entries$i.target;
    ((_viewportCallbacks$ge = viewportCallbacks.get(target)) === null || _viewportCallbacks$ge === void 0) ? (void 0) : _viewportCallbacks$ge(isIntersecting);
  }
}
// /Users/mszylkowski/src/amphtml/src/core/dom/layout/viewport-observer.js