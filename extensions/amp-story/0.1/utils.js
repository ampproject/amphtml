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

import {closestBySelector} from '../../../src/dom';
import {user} from '../../../src/log';

/**
 * Returns millis as number if given a string(e.g. 1s, 200ms etc)
 * @param {string} time
 * @return {number|undefined}
 */
export function timeStrToMillis(time) {
  const match = time.toLowerCase().match(/^([0-9\.]+)\s*(s|ms)$/);
  if (!match) {
    return NaN;
  }

  const num = match[1];
  const units = match[2];

  user().assert(
      match &&
          match.length == 3 &&
          (units == 's' || units == 'ms'),
      'Invalid time string %s', time);

  return units == 's' ? parseFloat(num) * 1000 : parseInt(num, 10);
}


/**
 * Determines whether the specified element has an action for its on="tap:..."
 * handler.
 * @param {!Element} el
 * @return {boolean}
 */
export function hasTapAction(el) {
  // There are better ways to determine this, but they're all bound to action
  // service race conditions. This is good enough for our use case.
  return el.hasAttribute('on') &&
      !!el.getAttribute('on').match(/(^|;)\s*tap\s*:/);
}


/**
 * Calculates a client rect without applying scaling transformations.
 * @note Must be run in a vsync measure context.
 * @param {!Element} el
 * @return {!ClientRect}
 */
export function unscaledClientRect(el) {
  const {width, height, left, top} = el./*OK*/getBoundingClientRect();

  const scaleFactorX = width == 0 ? 1 : width / el./*OK*/offsetWidth;
  const scaleFactorY = height == 0 ? 1 : height / el./*OK*/offsetHeight;

  return /** @type {!ClientRect} */ ({
    left: left / scaleFactorX,
    top: top / scaleFactorY,
    width: width / scaleFactorX,
    height: height / scaleFactorY,
  });
}


/**
 * Finds an amp-video/amp-audio ancestor.
 * @param {!Element} el
 * @return {?AmpElement}
 */
export function ampMediaElementFor(el) {
  return closestBySelector(el, 'amp-video, amp-audio');
}
