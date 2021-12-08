import {MessageType_Enum} from '#core/3p-frame-messaging';
import {layoutRectLtwh} from '#core/dom/layout/rect';
import {WindowInterface} from '#core/window/interface';

import {iframeMessagingClientFor} from '#inabox/inabox-iframe-messaging-client';

import {getMode} from '../../../src/mode';

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
    MessageType_Enum.SEND_POSITIONS,
    MessageType_Enum.POSITION,
    (data) => {
      const boundingClientRect =
        /** @type {!../../../src/layout-rect.LayoutRectDef} */ (
          data['targetRect']
        );
      const viewportRect =
        /** @type {!../../../src/layout-rect.LayoutRectDef} */ (
          data['viewportRect']
        );
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
