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

/** @enum {string} */
export const DirectionX = {LEFT: 'left', RIGHT: 'right'};

/** @enum {string} */
export const DirectionY = {TOP: 'top', BOTTOM: 'bottom'};

/** A loose small decimal amount to compensate for rough float calculations. */
export const FLOAT_TOLERANCE = 0.02;

/** Ratio to viewport width to use when docked to corner. */
export const CORNER_WIDTH_RATIO = 0.3;

/** Min width in pixels for corner area. */
export const CORNER_WIDTH_MIN = 180;

/** Max amount of pixels to use for margins (it's relative to viewport.) */
export const CORNER_MARGIN_MAX = 30;

/** Max % of viewport width to use form margins. */
export const CORNER_MARGIN_RATIO = 0.04;

/** Min viewport width for dock to appear at all. */
export const MIN_VIEWPORT_WIDTH = 320;

/** Min visible intersection ratio of inline box to undock when scrolling. */
export const REVERT_TO_INLINE_RATIO = 0.85;

/**
 * Width/height of placeholder icon when the inline box is large.
 * @visibleForTesting
 */
export const PLACEHOLDER_ICON_LARGE_WIDTH = 48;

/** Margin applied to placeholder icon when the inline box is large. */
export const PLACEHOLDER_ICON_LARGE_MARGIN = 40;

/** Width/height of placeholder icon when the inline box is small. */
export const PLACEHOLDER_ICON_SMALL_WIDTH = 32;

/** Margin applied to placeholder icon when the inline box is large. */
export const PLACEHOLDER_ICON_SMALL_MARGIN = 20;

/** @const {!Array<!./breakpoints.SyntheticBreakpointDef>} */
export const PLACEHOLDER_ICON_BREAKPOINTS = [
  {
    className: 'amp-small',
    minWidth: 0,
  },
  {
    className: 'amp-large',
    minWidth: 420,
  },
];

/** @visibleForTesting @const {string} */
export const BASE_CLASS_NAME = 'i-amphtml-video-docked';

/** @enum {string} */
export const Actions = {DOCK: 'dock', UNDOCK: 'undock'};

/** @enum {string} */
export const DockTargetType = {
  // Dynamically calculated corner based on viewport percentage. Draggable.
  CORNER: 'corner',
  // Targets author-defined element's box. Not draggable.
  SLOT: 'slot',
};

/**
 * @struct @typedef {{
 *   video: !VideoOrBaseElementDef,
 *   target: !DockTargetDef,
 *   step: number,
 * }}
 */
export let DockedDef;

/**
 * @struct @typedef {{
 *   type: DockTargetType,
 *   rect: !LayoutRectDef,
 * }}
 */
export let DockTargetDef;

/**
 * @param {number} x
 * @param {number} y
 * @param {number} scale
 * @return {string}
 */
export const transform = (x, y, scale) =>
  `translate(${x}px, ${y}px) scale(${scale})`;
