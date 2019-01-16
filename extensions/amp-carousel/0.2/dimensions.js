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

import {setStyle} from '../../../src/style';

/**
 * @enum {number}
 */
export const Axis = {
  X: 0,
  Y: 1,
};

/**
 * @enum {string}
 */
export const Alignment = {
  START: 'start',
  CENTER: 'center',
};

/**
 * @typedef {{
 *   start: number,
 *   end: number,
 *   length: number,
 * }}
 */
let DimensionDef;

/**
 * @param {!Axis} axis The Axis to get the Dimension for.
 * @param {*} el The Element to get the Dimension For.
 * @return {!DimensionDef} The dimension for the Element along the given Axis.
 */
export function getDimension(axis, el) {
  const {
    top,
    bottom,
    height,
    left,
    right,
    width,
  } = el./*OK*/getBoundingClientRect();

  return {
    start: axis == Axis.X ? left : top,
    end: axis == Axis.X ? right : bottom,
    length: axis == Axis.X ? width : height,
  };
}

/**
 * @param {!Axis} axis The axis to get the center point for.
 * @param {!Element} el The Element to get the center point for.
 * @return {number} The center point.
 */
export function getCenter(axis, el) {
  const {start, end} = getDimension(axis, el);
  return (start + end) / 2;
}

/**
 * @param {!Axis} axis The axis to get the start point for.
 * @param {!Element} el The Element to get the start point for.
 * @return {number} The start point.
 */
export function getStart(axis, el) {
  const {start} = getDimension(axis, el);
  return start;
}

/**
 * @param {!Axis} axis The axis along which to set the length.
 * @param {!Element} el The Element to set the length for.
 * @param {number} length The length value, in pixels, to set.
 */
export function updateLengthStyle(axis, el, length) {
  if (axis == Axis.X) {
    setStyle(el, 'width', `${length}px`);
  } else {
    setStyle(el, 'height', `${length}px`);
  }
}

/**
 * Gets the current scroll position for an element along a given axis.
 * @param {!Axis} axis The axis to set the scroll position for.
 * @param {!Element} el The Element to set the scroll position for.
 * @return {number} The scroll position.
 */
export function getScrollPosition(axis, el) {
  if (axis == Axis.X) {
    return el.scrollLeft;
  }

  return el.scrollTop;
}

/**
 * Sets the scroll position for an element along a given axis.
 * @param {!Axis} axis The axis to set the scroll position for.
 * @param {!Element} el The Element to set the scroll position for.
 * @param {number} position The scroll position.
 */
export function setScrollPosition(axis, el, position) {
  if (axis == Axis.X) {
    el.scrollLeft = position;
  } else {
    el.scrollTop = position;
  }

}

/**
 * Updates the scroll position for an element along a given axis.
 * @param {!Axis} axis The axis to set the scroll position for.
 * @param {!Element} el The Element to set the scroll position for.
 * @param {number} delta The scroll delta.
 */
export function updateScrollPosition(axis, el, delta) {
  setScrollPosition(axis, el, getScrollPosition(axis, el) + delta);
}

/**
 * Scrolls the position within a scrolling container to an Element. Unlike
 * `scrollIntoView`, this function does not scroll the container itself into
 * view.
 * @param {!Element} el The Element to scroll to.
 * @param {!Element} container The scrolling container.
 * @param {!Axis} axis The axis to scroll along.
 * @param {!Alignment} alignment How to align the element within the container.
 */
export function scrollContainerToElement(el, container, axis, alignment) {
  const startAligned = alignment == Alignment.START;
  const snapOffset = startAligned ? getStart(axis, el) : getCenter(axis, el);
  const scrollOffset = startAligned ? getStart(axis, container) :
    getCenter(axis, container);
  const delta = snapOffset - scrollOffset;

  updateScrollPosition(axis, container, delta);
}
