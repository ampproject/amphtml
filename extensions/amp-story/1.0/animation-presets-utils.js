/**
 * @fileoverview Common animations utility functions used in the animation
 * presets.
 */

import {rotate, scale, translate} from '#core/dom/style';

import {StoryAnimationDimsDef, WebKeyframesDef} from './animation-types';

/**
 * Translates the element on the 2d plane according to the given points.
 * @param {number} startX Starting point in the abscissa.
 * @param {number} startY Starting point in the ordinate.
 * @param {number} endX Ending point in the abscissa.
 * @param {number} endY Ending point in the ordinate.
 * @return {WebKeyframesDef} Keyframes that make up the animation.
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
 * @return {WebKeyframesDef} Keyframes that make up the animation.
 */
export function rotateAndTranslate(startX, startY, endX, endY, direction) {
  return [
    {transform: translate(startX, startY) + ' ' + rotate(direction * 120)},
    {transform: translate(endX, endY) + ' ' + rotate(0)},
  ];
}

/**
 * Gradually shows and grows the element while translating it on the 2d plane.
 * @param {number} startX Starting point in the abscissa.
 * @param {number} startY Starting point in the ordinate.
 * @param {number} endX Ending point in the abscissa.
 * @param {number} endY Ending point in the ordinate.
 * @return {WebKeyframesDef} Keyframes that make up the animation.
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
  return (
    dimensions.targetWidth <= dimensions.pageWidth ||
    dimensions.targetHeight <= dimensions.pageHeight
  );
}

/**
 * Calculate target scaling factor so that it is at least 25% larger than the
 * page.
 * @param {StoryAnimationDimsDef} dimensions Dimensions of page and target.
 * @return {number}
 */
export function calculateTargetScalingFactor(dimensions) {
  if (targetFitsWithinPage(dimensions)) {
    const scalingFactor = 1.25;
    const widthFactor =
      dimensions.pageWidth > dimensions.targetWidth
        ? dimensions.pageWidth / dimensions.targetWidth
        : 1;
    const heightFactor =
      dimensions.pageHeight > dimensions.targetHeight
        ? dimensions.pageHeight / dimensions.targetHeight
        : 1;
    return Math.max(widthFactor, heightFactor) * scalingFactor;
  }
  return 1;
}

/**
 * Scale the image in every frame by a certain factor.
 * @param {WebKeyframesDef} keyframes Keyframes that will be used for the animation.
 * @param {number} scalingFactor Scaling factor at which target will be scaled.
 * @return {WebKeyframesDef}
 */
function enlargeKeyFrames(keyframes, scalingFactor) {
  /** @type {!Array} */ (keyframes).forEach((frame) => {
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
 * @return {WebKeyframesDef} Keyframes that make up the animation.
 */
export function scaleAndTranslate(startX, startY, endX, endY, scalingFactor) {
  if (scalingFactor === 1) {
    return translate2d(startX, startY, endX, endY);
  }
  return enlargeKeyFrames(
    translate2d(startX, startY, endX, endY),
    scalingFactor
  );
}
