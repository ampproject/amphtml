/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {assert} from './asserts';
import {layoutRectLtwh, rectIntersection, moveLayoutRect} from
    './layout-rect';

/**
 * Produces a change entry for that should be compatible with
 * IntersectionObserverEntry.
 *
 * Mutates passed in rootBounds to have x and y according to spec.
 *
 * @param {number} time Time when values below were measured.
 * @param {!LayoutRect} rootBounds Equivalent to viewport.getRect()
 * @param {!LayoutRect} elementLayoutBox Layout box of the element
 *     that may intersect with the rootBounds.
 * @return {!IntersectionObserverEntry} A change entry.
 * @private
 */
export function getIntersectionChangeEntry(
    measureTime, rootBounds, elementLayoutBox) {
  // Building an IntersectionObserverEntry.
  // http://rawgit.com/slightlyoff/IntersectionObserver/master/index.html#intersectionobserverentry
  // These should always be equal assuming rootBounds cannot have negative
  // dimension.
  rootBounds.x = rootBounds.left;
  rootBounds.y = rootBounds.top;

  const boundingClientRect =
      moveLayoutRect(elementLayoutBox, -1 * rootBounds.x, -1 * rootBounds.y);
  assert(boundingClientRect.width >= 0 &&
      boundingClientRect.height >= 0, 'Negative dimensions in ad.');
  boundingClientRect.x = boundingClientRect.left;
  boundingClientRect.y = boundingClientRect.top;

  const intersectionRect =
      rectIntersection(rootBounds, elementLayoutBox) ||
      // No intersection.
      layoutRectLtwh(0, 0, 0, 0);
  intersectionRect.x = intersectionRect.left;
  intersectionRect.y = intersectionRect.top;

  return {
    time: measureTime,
    rootBounds,
    boundingClientRect,
    intersectionRect,
  };
}
