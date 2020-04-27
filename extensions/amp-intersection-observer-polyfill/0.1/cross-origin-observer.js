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

import {MessageType} from '../../../src/3p-frame-messaging';
import {WindowInterface} from '../../../src/window-interface';
import {getMode} from '../../../src/mode';
import {iframeMessagingClientFor} from '../../../src/inabox/inabox-iframe-messaging-client';
import {layoutRectLtwh} from '../../../src/layout-rect';

/**
 * Setup cross-origin iframe polyfill for AMP iframes, such as inabox.
 *
 * @param {!Window} win
 */
export function maybeSetupCrossOriginObserver(win) {
  if (win == WindowInterface.getTop(win) || getMode(win).runtime != 'inabox') {
    // Not an iframe at all.
    return;
  }

  // Check if there is an iframe client connected and if it's indeed a polyfill.
  const iframeClient = iframeMessagingClientFor(win);
  const setupPolyfillUpdater =
    win.IntersectionObserver['_setupCrossOriginUpdater'];
  if (!iframeClient || !setupPolyfillUpdater) {
    return;
  }

  const updater = setupPolyfillUpdater();
  iframeClient.makeRequest(
    MessageType.SEND_POSITIONS,
    MessageType.POSITION,
    (data) => {
      const boundingClientRect = /** @type {!../../../src/layout-rect.LayoutRectDef} */ (data[
        'targetRect'
      ]);
      const viewportRect = /** @type {!../../../src/layout-rect.LayoutRectDef} */ (data[
        'viewportRect'
      ]);
      const intersectionRect = calculateIntersectionRect(
        viewportRect,
        boundingClientRect
      );
      updater(boundingClientRect, intersectionRect);
    }
  );
}

/**
 * @param {!../../../src/layout-rect.LayoutRectDef} viewportRect
 * @param {!../../../src/layout-rect.LayoutRectDef} targetRect
 * @return {!../../../src/layout-rect.LayoutRectDef}
 * @visibleForTesting
 */
export function calculateIntersectionRect(viewportRect, targetRect) {
  const top = Math.max(targetRect.top, 0);
  const left = Math.max(targetRect.left, 0);
  const bottom = Math.min(targetRect.bottom, viewportRect.height);
  const right = Math.min(targetRect.right, viewportRect.width);
  if (top > bottom || left > right) {
    return layoutRectLtwh(0, 0, 0, 0);
  }
  return layoutRectLtwh(left, top, right - left, bottom - top);
}
