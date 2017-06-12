/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {px, resetStyles, setStyles, translate} from './style';


/**
 * Centers a frame with a translate transition.
 * This function does direct DOM manipulation, so it needs to run under vsync
 * mutate context.
 * @param {!HTMLIFrameElement} iframe
 * @param {!ClientRect} iframeRect
 * @param {{width: number, height: number}} viewportSize
 * @param {number} transitionTimeMs
 */
export function centerFrameUnderVsyncMutate(
    iframe, iframeRect, viewportSize, transitionTimeMs) {
  const translateX = px(
      (viewportSize.width / 2 - iframeRect.width / 2) - iframeRect.left);

  const translateY = px(
      (viewportSize.height / 2 - iframeRect.height / 2) - iframeRect.top);

  setStyles(iframe, {
    'position': 'fixed',
    'top': px(iframeRect.top),
    'right': px(viewportSize.width - (iframeRect.left + iframeRect.width)),
    'left': px(iframeRect.left),
    'bottom': px(viewportSize.height - (iframeRect.top + iframeRect.height)),
    'height': px(iframeRect.height),
    'width': px(iframeRect.width),
    'transition':
        `transform ${(transitionTimeMs / 1000)}s ease`,
    'transform': translate(translateX, translateY),
  });
}


/**
 * Expands frame to fill the entire viewport.
 * This function does direct DOM manipulation, so it needs to run under vsync
 * mutate context.
 * @param {!HTMLIFrameElement} iframe
 * @param {{width: number, height: number}} viewportSize
 */
export function expandFrameUnderVsyncMutate(iframe, viewportSize) {
  setStyles(iframe, {
    'position': 'fixed',
    'z-index': 1000,
    'left': 0,
    'right': 0,
    'top': 0,
    'bottom': 0,
    'width': px(viewportSize.width),
    'height': px(viewportSize.height),
    'transition': null,
    'transform': null,
  });
}


/**
 * Resets frame that was previously expanded to fill the entire viewport.
 * This function does direct DOM manipulation, so it needs to run under vsync
 * mutate context.
 * @param {!HTMLIFrameElement} iframe
 */
export function collapseFrameUnderVsyncMutate(iframe) {
  resetStyles(iframe, [
    'position',
    'z-index',
    'left',
    'right',
    'top',
    'bottom',
    'width',
    'height',
  ]);
}
