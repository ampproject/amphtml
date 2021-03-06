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
 * See https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
 */

import {installStub, shouldLoadPolyfill} from './stubs/resize-observer-stub';

/**
 * Installs the ResizeObserver polyfill. There are a few different modes of
 * operation.
 *
 * @param {!Window} win
 */
export function install(win) {
  if (shouldLoadPolyfill(win)) {
    installStub(win);
  }
}

/**
 * @param {!Window} parentWin
 * @param {!Window} childWin
 */
export function installForChildWin(parentWin, childWin) {
  if (!childWin.ResizeObserver && parentWin.ResizeObserver) {
    Object.defineProperties(childWin, {
      ResizeObserver: {get: () => parentWin.ResizeObserver},
      ResizeObserverEntry: {get: () => parentWin.ResizeObserverEntry},
    });
  }
}
