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
  KeyframesDef,
  StoryAnimationDimsDef,
} from './animation-types';
import {
  rotate,
  scale,
  translate,
} from '../../../src/style';

/**
 * Translates the element on the 2d plane according to the given points.
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
 * @param {number} startX Starting point in the abscissa.
 * @param {number} startY Starting point in the ordinate.
 * @param {number} endX Ending point in the abscissa.
 * @param {number} endY Ending point in the ordinate.
 * @param {number} direction -1 for left, 1 for right
 * @return {KeyframesDef} Keyframes that make up the animation.
 */
export function rotateAndTranslate(startX, startY, endX, endY, direction) {
  return [
    {transform: translate(startX, startY) + ' ' + rotate(direction * 360)},
    {transform: translate(endX, endY) + ' ' + rotate(0)},
  ];
}

/**
 * Gradually shows and grows the element while translating it on the 2d plane.
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
      transform: translate(startX, startY) + ' ' + scale(0.15),
    },
    {
      opacity: 1,
      transform: translate(endX, endY) + ' ' + scale(1),
    },
  ];
}

/**
 * Checks if either of the target's dimensions are smaller than or equal to
 * those of the page.
 * @param {StoryAnimationDimsDef} dimensions Dimensions of page and target.
 * @return {boolean}
 * @visibleForTesting
 */
export function targetFitsWithinPage(dimensions) {
  return dimensions.targetWidth <= dimensions.pageWidth ||
         dimensions.targetHeight <= dimensions.pageHeight;
}

/**
 * Calculate target scaling factor so that it is at least 25% larger than the page.
 * @param {StoryAnimationDimsDef} dimensions Dimensions of page and target.
 * @return {number}
 */
export function calculateTargetScalingFactor(dimensions) {
  if (targetFitsWithinPage(dimensions)) {
    const scalingFactor = 1.25;
    const widthFactor = dimensions.pageWidth > dimensions.targetWidth ?
      dimensions.pageWidth / dimensions.targetWidth : 1;
    const heightFactor = dimensions.pageHeight > dimensions.targetHeight ?
      dimensions.pageHeight / dimensions.targetHeight : 1;
    return Math.max(widthFactor, heightFactor) * scalingFactor;
  }
  return 1;
}

/**
 * Scale the image in every frame by a certain factor.
 * @param {KeyframesDef} keyframes Keyframes that will be used for the animation.
 * @param {number} scalingFactor Scaling factor at which target will be scaled.
 * @return {KeyframesDef}
 */
function enlargeKeyFrames(keyframes, scalingFactor) {
  keyframes.forEach(frame => {
    frame['transform'] += ' ' + scale(scalingFactor);
    frame['transform-origin'] = 'left top';
  });
  return keyframes;
}

/**
 * Translates the element and scales it if necessary.
 * @param {number} startX Starting point in the abscissa.
 * @param {number} startY Starting point in the ordinate.
 * @param {number} endX Ending point in the abscissa.
 * @param {number} endY Ending point in the ordinate.
 * @param {number} scalingFactor Factor by which target will be scaled.
 * @return {KeyframesDef} Keyframes that make up the animation.
 */
export function scaleAndTranslate(startX, startY, endX, endY, scalingFactor) {
  if (scalingFactor === 1) {
    return translate2d(startX, startY, endX, endY);
  }
  return enlargeKeyFrames(
      translate2d(startX, startY, endX, endY), scalingFactor);
}
