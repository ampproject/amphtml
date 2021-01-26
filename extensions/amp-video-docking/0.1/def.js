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
import {LayoutRectDef} from '../../../src/layout-rect';

/** @enum {string} */
export const DirectionX = {LEFT: 'left', RIGHT: 'right'};

/** @enum {string} */
export const DirectionY = {TOP: 'top', BOTTOM: 'bottom'};

/** A loose small decimal amount to compensate for rough float calculations. */
export const FLOAT_TOLERANCE = 0.02;

/**
 * Maintain dimensions and controls for wide players that don't take much
 * of the viewport (e.g. audio players) have their dimensions and controls
 * respected.
 * @param {!LayoutRectDef} inlineRect
 * @param {!LayoutRectDef} viewportRect
 * @return {boolean}
 */
export function shouldRespectControls(inlineRect, viewportRect) {
  const {height, width} = inlineRect;
  const aspect = width / height;
  const area = width * height;
  const viewportArea = viewportRect.width * viewportRect.height;
  return (
    // Relatively short to ensure that controls are only content.
    height < 100 &&
    // very wide, videos are not likely to be >= 4:1
    aspect >= 4 / 1 &&
    // ensure that viewport is not excessively covered (20%)
    area / viewportArea <= 0.2
  );
}
