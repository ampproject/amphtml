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
  IntersectionObserverStub,
  supportsDocumentRoot,
} from '../polyfillstub/intersection-observer-stub';

/**
 * @param {!Window} win
 */
export function install(win) {
  const NativeIntersectionObserver = win.IntersectionObserver;
  if (!NativeIntersectionObserver) {
    win.IntersectionObserver = /** @type {typeof IntersectionObserver} */ (IntersectionObserverStub);
  } else if (!supportsDocumentRoot(win)) {
    win.IntersectionObserver = function (ioCallback, opts) {
      if (opts && opts.root && opts.root.nodeType === 9) {
        return new IntersectionObserverStub(ioCallback, opts);
      } else {
        return new NativeIntersectionObserver(ioCallback, opts);
      }
    };
    win.IntersectionObserver.native = NativeIntersectionObserver;
  }
  fixEntry(win);
}

/**
 * @param {!Window} parentWin
 * @param {!Window} childWin
 */
export function installForChildWin(parentWin, childWin) {
  if (childWin.IntersectionObserver) {
    fixEntry(childWin);
  } else if (parentWin.IntersectionObserver) {
    Object.defineProperties(childWin, {
      IntersectionObserver: {get: () => parentWin.IntersectionObserver},
      IntersectionObserverEntry: {
        get: () => parentWin.IntersectionObserverEntry,
      },
    });
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
