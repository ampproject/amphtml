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
import {getMode} from './mode';
import {isIframed} from './dom';
import {toWin} from './types';

/**
 * Returns an IntersectionObserver tracking the Viewport.
 *
 * @param {function(!Array<!IntersectionObserverEntry>)} ioCallback
 * @param {!Window} win
 * @param {{threshold: (number|!Array<number>)=, needsRootBounds: boolean=}=} opts
 *
 * @return {!IntersectionObserver}
 */
export function createViewportObserver(ioCallback, win, opts = {}) {
  const {threshold, needsRootBounds} = opts;
  return new win.IntersectionObserver(ioCallback, {
    threshold,
    root: isIframed(win) && needsRootBounds ? win.document : undefined,
  });
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
  if (getMode().localDev) {
    devAssert(
      !viewportCallbacks.has(element) ||
        viewportCallbacks.get(element) === viewportCallback
    );
  }

  const win = toWin(element.ownerDocument.defaultView);
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
  const win = toWin(element.ownerDocument.defaultView);
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
    if (viewportCallback) {
      viewportCallback(isIntersecting);
    }
  }
}
