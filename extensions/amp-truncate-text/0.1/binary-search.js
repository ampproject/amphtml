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

import {devAssert} from '../../../src/log';

/**
 * When no matching index is found, whether to stop on the next or previous
 * adjacent index.
 * @enum {number}
 */
export const BinarySearchPreference = {
  NEXT: 1,
  PREV: 2,
};

/**
 * When doing a search and finding a matching index, whether to stop
 * immediately or find the rightmost or leftmost match.
 * @enum {number}
 */
export const BinarySearchStop = {
  IMMEDIATE: 0,
  RIGHT: 1,
  LEFT: 2,
};

/**
 * Does a binary search across a range of values until a condition is met. If
 * the condition is met, the index is returned. If the condition is never met,
 * a negative index, minus one is returned adjacent to where the condition
 * would be met.
 * @param {number} start The start value to look at, inclusive.
 * @param {number} end The end value to look at, not inclusive.
 * @param {function(number): number} condition A condition function, returning
 *    positive values if the top half of the range should be searched, negative
 *    values if the bottom half should be searched, and zero if the value was
 *    found.
 * @param {BinarySearchStop=} stop When there are multiple matching values,
 *    whether to return the first found value, the rightmost value or the
 *    leftmost value. Defaults to BinarySearchStop.IMMEDIATE.
 * @param {BinarySearchPreference=} preference A preference on whether to end
 *    on the next index or previous index when there is no exact match found.
 *    Defaults to BinarySearchPreference.NEXT.
 * @return {number} The first value in the range that was found. If no value
 *    was found,
 */
export function binarySearch(
  start,
  end,
  condition,
  stop = BinarySearchStop.IMMEDIATE,
  preference = BinarySearchPreference.NEXT) {
  devAssert(start <= end);

  let low = start;
  let high = end - 1;
  let prefIndex = NaN;
  let match = NaN;

  while (high >= low) {
    const mid = low + Math.floor((high - low) / 2);
    const res = condition(mid);

    if (res > 0 || (res == 0 && stop == BinarySearchStop.RIGHT)) {
      prefIndex = preference == BinarySearchPreference.PREV ? mid : prefIndex;
      match = res == 0 ? mid : match;
      low = mid + 1;
    } else if (res < 0 || (res == 0 && stop == BinarySearchStop.LEFT)) {
      prefIndex = preference == BinarySearchPreference.NEXT ? mid : prefIndex;
      match = res == 0 ? mid : match;
      high = mid - 1;
    } else {
      match = mid;
      break;
    }
  }

  if (!isNaN(match)) {
    return match;
  }

  // Figure out the index to fallback to. If there is a low preference and we
  // end up at the end, then fall back to the last index we visited. Similar
  // for a high preference and the start.
  const index = !isNaN(prefIndex) ?
    prefIndex :
    // If we stopped, high is either less than or equal to low. So if we have
    // a high preference, actually return the current value of low.
    preference == BinarySearchPreference.NEXT ?
      low :
      high;
  return -(index + 1);
}
