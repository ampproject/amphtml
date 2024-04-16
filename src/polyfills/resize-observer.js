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
