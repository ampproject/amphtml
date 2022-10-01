import {layoutRectLtwh} from '#core/dom/layout/rect';
import {mapRange} from '#core/math';

import {DirectionX, RectDef} from './def';

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
 * @param {!RectDef} from
 * @param {!RectDef} to
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
 * @param {!RectDef} original
 * @param {!RectDef} container
 * @return {!RectDef}
 */
export function letterboxRect(original, container) {
  const {height, width} = original;
  const {height: maxHeight, left, top, width: maxWidth} = container;

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
 * @param {!RectDef} original
 * @param {!RectDef} container
 * @param {DirectionX} horizontalEdge
 * @param {number} widthRatio
 * @param {number} widthMin
 * @param {number} marginRatio
 * @param {number} marginMax
 * @return {!RectDef}
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
  isSizedRect(element./*OK*/ getBoundingClientRect());

/**
 * @param {!RectDef} rect
 * @return {boolean}
 */
export const isSizedRect = (rect) => rect.width > 0 && rect.height > 0;
