/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview Common animations utility functions used in the animation
 * presets.
 */

import {
  px,
  deg,
  scale,
  rotate,
  translate
} from '../../../src/style';
import {KeyframesDef} from './animation-types';

/**
 * Translates the element on the 2d plane according to the given points.
 * @export
 * @param {number} startX Starting point in the abscissa.
 * @param {number} startY Starting point in the ordinate.
 * @param {number} endX Ending point in the abscissa.
 * @param {number} endY Ending point in the ordinate.
 * @return {KeyframesDef} Keyframes that make up the animation.
 */
export function translate2d(startX, startY, endX, endY) {
  return [
    {transform: translate(startX, startY)},
    {transform: translate(endX, endY)},
  ];
}

/**
 * Translates and rotates the element on the 2d plane.
 * @export
 * @param {number} startX Starting point in the abscissa.
 * @param {number} startY Starting point in the ordinate.
 * @param {number} endX Ending point in the abscissa.
 * @param {number} endY Ending point in the ordinate.
 * @param {number} direction -1 for left, 1 for right
 * @return {KeyframesDef} Keyframes that make up the animation.
 */
export function rotateAndTranslate(startX, startY, endX, endY, direction) {
  return [
    {transform: translate(startX, startY) + ' ' + rotate(deg(direction * 360))},
    {transform: translate(endX, endY) + ' ' + rotate(0)},
  ];
}


/**
 * Gradually shows and grows the element while translating it on the 2d plane.
 * @export
 * @param {number} startX Starting point in the abscissa.
 * @param {number} startY Starting point in the ordinate.
 * @param {number} endX Ending point in the abscissa.
 * @param {number} endY Ending point in the ordinate.
 * @return {KeyframesDef} Keyframes that make up the animation.
 */
export function whooshIn(startX, startY, endX, endY) {
  return [
    {
      opacity: 0,
      transform:  translate(startX, startY) + ' ' + scale(0.15),
    },
    {
      opacity: 1,
      transform: translate(endX, endY) + ' ' + scale(1),
    },
  ];
}
