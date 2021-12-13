/**
 * @fileoverview
 * IE 10 throws "Unspecified error" when calling getBoundingClientRect() on a
 * disconnected node.
 * @see https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/106812/
 */

import {isConnectedNode} from '#core/dom';
import {layoutRectLtwh} from '#core/dom/layout/rect';
import * as mode from '#core/mode';

/**
 * Stores the native getBoundingClientRect before we patch it, so that the
 * patch may call the native implementation.
 */
let nativeClientRect;

/**
 * Polyfill for Node.getBoundingClientRect API.
 * @this {Element}
 * @return {ClientRect|LayoutRectDef}
 */
function getBoundingClientRect() {
  // eslint-disable-next-line local/no-invalid-this
  if (mode.isEsm() || isConnectedNode(this)) {
    return nativeClientRect.call(this);
  }

  return layoutRectLtwh(0, 0, 0, 0);
}

/**
 * Determines if this polyfill should be installed.
 * @param {!Window} win
 * @return {boolean}
 */
function shouldInstall(win) {
  if (mode.isEsm()) {
    return false;
  }

  // Don't install in no-DOM environments e.g. worker.
  if (!win.document) {
    return false;
  }

  try {
    const div = win.document.createElement('div');
    const rect = div./*OK*/ getBoundingClientRect();
    return rect.top !== 0;
  } catch (e) {
    // IE 10 or less
    return true;
  }
}

/**
 * Sets the getBoundingClientRect polyfill if using IE 10 or an
 * earlier version.
 * @param {!Window} win
 */
export function install(win) {
  if (shouldInstall(win)) {
    nativeClientRect = Element.prototype.getBoundingClientRect;
    win.Object.defineProperty(win.Element.prototype, 'getBoundingClientRect', {
      value: getBoundingClientRect,
    });
  }
}
