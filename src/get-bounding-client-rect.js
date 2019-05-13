/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
 * IE 10 throws "Unspecified error" when calling getBoundingClientRect() on a
 * disconnected node.
 * @see https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/106812/
 */

import {
  LayoutRectDef,
  layoutRectLtwh,
} from './layout-rect';
import {isConnectedNode} from './dom';

/**
 * Stores the native getBoundingClientRect before we patch it, so that the
 * patch may call the native implementation.
 */
let nativeClientRect;

/**
 * Polyfill for Node.getBoundingClientRect API.
 * @this {!Element}
 * @return {!ClientRect|!LayoutRectDef}
 */
function getBoundingClientRect() {
  if (isConnectedNode(this)) {
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
  // Don't install in no-DOM environments e.g. worker.
  if (!win.document) {
    return false;
  }

  try {
    const div = win.document.createElement('div');
    const rect = div./*OK*/getBoundingClientRect();
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
