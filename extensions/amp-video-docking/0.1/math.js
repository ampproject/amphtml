/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {DirectionX} from './def';
import {LayoutRectDef, layoutRectLtwh} from '../../../src/layout-rect';
import {mapRange} from '../../../src/utils/math.js';

/**
 * @param {number} containerWidth
 * @param {number} itemWidth
 * @param {number} itemMargin
 * @param {number} directedStep
 * @return {number}
 */
function calculateJustified(
  containerWidth,
  itemWidth,
  itemMargin,
  directedStep
) {
  return directedStep * (containerWidth - itemWidth - itemMargin * 2);
}

/**
 * @param {number} containerWidth
 * @param {number} itemWidth
 * @param {number} itemMargin
 * @param {number} step
 * @return {number}
 */
export function calculateRightJustifiedX(
  containerWidth,
  itemWidth,
  itemMargin,
  step
) {
  return calculateJustified(containerWidth, itemWidth, itemMargin, step);
}

/**
 * @param {number} containerWidth
 * @param {number} itemWidth
 * @param {number} itemMargin
 * @param {number} step
 * @return {number}
 */
export function calculateLeftJustifiedX(
  containerWidth,
  itemWidth,
  itemMargin,
  step
) {
  return calculateJustified(containerWidth, itemWidth, itemMargin, -step);
}

/**
 * Maps an interpolation step in [0..1] to its position in a range.
 * @param {number} step
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
const mapStep = (step, min, max) => mapRange(step, 0, 1, min, max);

/**
 * Provides offset coords to interpolate `from` rect `to` rect.
 * @param {!LayoutRectDef} from
 * @param {!LayoutRectDef} to
 * @param {number=} step  in [0..1]
 * @return {{x: number, y: number, scale: number, relativeX: !DirectionX}}
 *  - x is offset from the original box in pixels.
 *  - y is offset from the original box in pixels.
 *  - scale is the
 */
export function interpolatedBoxesTransform(from, to, step = 1) {
  const relativeX = to.x < from.x ? DirectionX.LEFT : DirectionX.RIGHT;
  const x = mapStep(step, from.x, to.x);
  const y = mapStep(step, from.y, to.y);
  const width = mapStep(step, from.width, to.width);
  const scale = width / from.width;
  return {x, y, scale, relativeX};
}

/**
 * Scales, fits and centers `original` into `container`.
 * @param {!LayoutRectDef} original
 * @param {!LayoutRectDef} container
 * @return {!LayoutRectDef}
 */
export function letterboxRect(original, container) {
  const {width, height} = original;
  const {top, left, width: maxWidth, height: maxHeight} = container;

  const containerAspect = maxWidth / maxHeight;
  const originalAspect = width / height;

  let x, y, scale;

  if (originalAspect > containerAspect) {
    scale = maxWidth / width;
    y = top + maxHeight / 2 - (height * scale) / 2;
    x = left;
  } else {
    scale = maxHeight / height;
    x = left + maxWidth / 2 - (width * scale) / 2;
    y = top;
  }

  return layoutRectLtwh(x, y, width * scale, height * scale);
}

/**
 * @param {!LayoutRectDef} original
 * @param {!LayoutRectDef} container
 * @param {DirectionX} horizontalEdge
 * @param {number} widthRatio
 * @param {number} widthMin
 * @param {number} marginRatio
 * @param {number} marginMax
 * @return {!LayoutRectDef}
 */
export function topCornerRect(
  original,
  container,
  horizontalEdge,
  widthRatio,
  widthMin,
  marginRatio,
  marginMax
) {
  const widthUnit = container.width;

  const margin = Math.min(marginMax, marginRatio * widthUnit);
  const aspect = original.width / original.height;

  const width = Math.max(widthMin, widthUnit * widthRatio);
  const height = width / aspect;

  const x =
    horizontalEdge == DirectionX.RIGHT
      ? container.right - margin - width
      : container.left + margin;

  const y = margin;

  return layoutRectLtwh(x, y, width, height);
}

/**
 * @param {!AmpElement} element
 * @return {boolean}
 */
export const isVisibleBySize = (element) =>
  isSizedRect(element.getPageLayoutBox());

/**
 * @param {!LayoutRectDef|!ClientRect|!DOMRect} rect
 * @return {boolean}
 */
export const isSizedRect = (rect) => rect.width > 0 && rect.height > 0;
