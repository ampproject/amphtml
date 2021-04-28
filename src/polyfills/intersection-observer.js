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
 * @fileoverview
 * See https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver.
 */

import {
  installStub,
  shouldLoadPolyfill,
} from '../polyfills/stubs/intersection-observer-stub';

/**
 * Installs the IntersectionObserver polyfill. There are a few different modes of operation.
 * - No native support: immediately register a Stub and upgrade lazily once the full polyfill loads.
 * - Partial InOb support: choose between the lazily upgrading Stub and the native InOb on a per-instance basis.
 * - Full InOb support: Don't install anything.
 *
 * @param {!Window} win
 */
export function install(win) {
  if (shouldLoadPolyfill(win)) {
    installStub(win);
  }
  fixEntry(win);
}

/**
 * @param {!Window} parentWin
 * @param {!Window} childWin
 */
export function installForChildWin(parentWin, childWin) {
  if (shouldLoadPolyfill(childWin)) {
    Object.defineProperties(childWin, {
      IntersectionObserver: {get: () => parentWin.IntersectionObserver},
      IntersectionObserverEntry: {
        get: () => parentWin.IntersectionObserverEntry,
      },
    });
  } else {
    fixEntry(childWin);
  }
}

/** @param {!Window} win */
function fixEntry(win) {
  // Minimal polyfill for Edge 15's lack of `isIntersecting`
  // See: https://github.com/w3c/IntersectionObserver/issues/211
  if (
    win.IntersectionObserverEntry &&
    !('isIntersecting' in win.IntersectionObserverEntry.prototype)
  ) {
    Object.defineProperty(
      win.IntersectionObserverEntry.prototype,
      'isIntersecting',
      {
        enumerable: true,
        configurable: true,
        get() {
          return this.intersectionRatio > 0;
        },
      }
    );
  }
}
