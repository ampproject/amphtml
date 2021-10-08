import {mod} from '#core/math';

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
 * @enum {string}
 */
export const Orientation = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
};

/**
 * @typedef {{
 *   start: number,
 *   end: number,
 *   length: number,
 * }}
 */
let BaseCarouselDimensionDef;

/**
 * @param {!Axis} axis The Axis to get the Dimension for.
 * @param {*} el The Element to get the Dimension For.
 * @return {!BaseCarouselDimensionDef} The dimension for the Element along the given Axis.
 */
export function getDimension(axis, el) {
  const {bottom, height, left, right, top, width} =
    el./*OK*/ getBoundingClientRect();

  return {
    start: Math.round(axis == Axis.X ? left : top),
    end: Math.round(axis == Axis.X ? right : bottom),
    length: Math.round(axis == Axis.X ? width : height),
  };
}

/**
 * @param {!Axis} axis The axis to get the center point for.
 * @param {!Element} el The Element to get the center point for.
 * @return {number} The center point.
 */
export function getCenter(axis, el) {
  const {end, start} = getDimension(axis, el);
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
 * @param {!Axis} axis The Axis to get the position for.
 * @param {!Alignment} alignment The Alignment to get the position for.
 * @param {!Element} el The Element to get the position for.
 * @return {number} The position for the given Element along the given axis for
 *    the given alignment.
 */
export function getPosition(axis, alignment, el) {
  return alignment == Alignment.START
    ? getStart(axis, el)
    : getCenter(axis, el);
}

/**
 * @param {!Axis} axis The axis to check for overlap.
 * @param {!Element} el The Element to check for overlap.
 * @param {number} position A position to check.
 * @return {boolean} If the element overlaps the position along the given axis.
 */
export function overlaps(axis, el, position) {
  const {end, start} = getDimension(axis, el);
  // Ignore the end point, since that is shared with the adjacent Element.
  return start <= position && position < end;
}

/**
 * @param {!Axis} axis The axis to align on.
 * @param {!Alignment} alignment The desired alignment.
 * @param {!Element} container The container to align against.
 * @param {!Element} el The Element get the offset for.
 * @return {number} How far el is from alignment, as a percentage of its length.
 */
export function getPercentageOffsetFromAlignment(
  axis,
  alignment,
  container,
  el
) {
  const elPos = getPosition(axis, alignment, el);
  const containerPos = getPosition(axis, alignment, container);
  const {length: elLength} = getDimension(axis, el);
  return (elPos - containerPos) / elLength;
}

/**
 * Finds the index of a child that overlaps a point within the parent,
 * determined by an axis and alignment. A startIndex is used to look at the
 * children that are more likely to overlap first.
 * @param {!Axis} axis The axis to look along.
 * @param {!Alignment} alignment The alignment to look for within the parent
 *    container.
 * @param {!Element} container  The parent container to look in.
 * @param {!HTMLCollection} children The children to look among.
 * @param {number} startIndex The index to start looking at.
 * @return {number|undefined} The overlapping index, if one exists.
 */
export function findOverlappingIndex(
  axis,
  alignment,
  container,
  children,
  startIndex
) {
  const pos = getPosition(axis, alignment, container);

  // First look at the start index, since is the most likely to overlap.
  if (overlaps(axis, children[startIndex], pos)) {
    return startIndex;
  }

  // Move outwards, since the closer indicies are more likely to overlap.
  for (let i = 1; i <= children.length / 2; i++) {
    const nextIndex = mod(startIndex + i, children.length);
    const prevIndex = mod(startIndex - i, children.length);

    if (overlaps(axis, children[nextIndex], pos)) {
      return nextIndex;
    }

    if (overlaps(axis, children[prevIndex], pos)) {
      return prevIndex;
    }
  }
}

/**
 * Gets the current scroll position for an element along a given axis.
 * @param {!Axis} axis The axis to get the scroll position for.
 * @param {!Element} el The Element to get the scroll position for.
 * @return {number} The scroll position.
 */
export function getScrollPosition(axis, el) {
  if (axis == Axis.X) {
    return el./*OK*/ scrollLeft;
  }

  return el./*OK*/ scrollTop;
}

/**
 * Gets the scroll capacity for an element along a given axis.
 * @param {!Axis} axis The axis to get the scroll capacity for.
 * @param {!Element} el The Element to get the scroll capacity for.
 * @return {number} The scroll capacity.
 */
export function getScrollEnd(axis, el) {
  if (axis == Axis.X) {
    return el./*OK*/ scrollWidth;
  }

  return el./*OK*/ scrollHeight;
}

/**
 * Gets the offset position for an element along a given axis.
 * @param {!Axis} axis The axis to get the offset position for.
 * @param {!Element} el The Element to get the offset position for.
 * @return {number} The offset position.
 */
export function getOffsetPosition(axis, el) {
  if (axis == Axis.X) {
    return el./*OK*/ offsetLeft;
  }

  return el./*OK*/ offetTop;
}

/**
 * Sets the scroll position for an element along a given axis.
 * @param {!Axis} axis The axis to set the scroll position for.
 * @param {!Element} el The Element to set the scroll position for.
 * @param {number} position The scroll position.
 */
export function setScrollPosition(axis, el, position) {
  if (axis == Axis.X) {
    el./*OK*/ scrollLeft = position;
  } else {
    el./*OK*/ scrollTop = position;
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
 * @param {!Axis} axis The axis to scroll along.
 * @param {!Alignment} alignment How to align the element within the container.
 * @param {!Element} container The scrolling container.
 * @param {!Element} el The Element to scroll to.
 * @param {number} offset A percentage offset within the element to scroll to.
 * @return {boolean} Whether not scrolling was performed.
 */
export function scrollContainerToElement(
  axis,
  alignment,
  container,
  el,
  offset = 0
) {
  const startAligned = alignment == Alignment.START;
  const {length} = getDimension(axis, el);
  const snapOffset = startAligned ? getStart(axis, el) : getCenter(axis, el);
  const scrollOffset = startAligned
    ? getStart(axis, container)
    : getCenter(axis, container);
  const delta = Math.round(snapOffset - scrollOffset - offset * length);
  updateScrollPosition(axis, container, delta);

  const {length: containerLength} = getDimension(axis, container);
  const canScroll =
    containerLength + getScrollPosition(axis, container) + delta <
    getScrollEnd(axis, container);
  return !!delta && canScroll;
}
