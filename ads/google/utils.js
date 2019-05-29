/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {
  ExternalCorePubVars,
  MIN_PUB_CONTROL_WIDTH_OF_DESKTOP,
  getAutoConfig,
  getPubControlConfig,
} from './a4a/shared/content-recommendation.js';
import {user} from '../../src/log';

/**
 * Approved height for AdSense full-width responsive ads.
 * @const {number}
 */
export const ADSENSE_RSPV_WHITELISTED_HEIGHT = 320;

/**
 * The attribute value for AdSense data-auto-format tag.
 * For full-width responsive ad: data-auto-format='rspv'.
 * For full-width matched content responsive ad: data-auto-format='mcrspv'
 * @const {string}
 */
export const ADSENSE_RSPV_TAG = 'rspv';
export const ADSENSE_MCRSPV_TAG = 'mcrspv';

/**
 * Required size to be sent with fluid requests.
 * @const {string}
 */
export const DUMMY_FLUID_SIZE = '320x50';

/**
 * Required size to be sent with fluid requests in array format.
 * @const {!Array<number>}
 */
const DUMMY_FLUID_SIZE_ARR = DUMMY_FLUID_SIZE.split('x').map(dim =>
  Number(dim)
);

/**
 * Given the amp-ad data attribute containing the multi-size dimensions, and a
 * set of primary dimensions, this function will return all valid multi-size
 * [width, height] pairs in an array.
 *
 * @param {string} multiSizeDataStr The amp-ad data attribute containing the
 *   multi-size dimensions.
 * @param {number} primaryWidth The primary width of the ad slot.
 * @param {number} primaryHeight The primary height of the ad slot.
 * @param {boolean} multiSizeValidation A flag that if set to true will enforce
 *   the rule that ensures multi-size dimensions are no less than 2/3rds of
 *   their primary dimension's counterpart.
 * @param {boolean=} isFluidPrimary Indicates whether the ad slot's primary
 *   size is fluid.
 * @return {?Array<!Array<number>>} An array of dimensions.
 */
export function getMultiSizeDimensions(
  multiSizeDataStr,
  primaryWidth,
  primaryHeight,
  multiSizeValidation,
  isFluidPrimary = false
) {
  const dimensions = [];
  const arrayOfSizeStrs = multiSizeDataStr.split(',');

  for (let i = 0; i < arrayOfSizeStrs.length; i++) {
    const sizeStr = arrayOfSizeStrs[i];
    if (sizeStr.toLowerCase() == 'fluid') {
      if (!isFluidPrimary) {
        // If the primary size is fluid, then the dummy size will already be
        // be included.
        dimensions.push(DUMMY_FLUID_SIZE_ARR);
      }
      continue;
    }
    const size = sizeStr.split('x');

    // Make sure that each size is specified in the form WxH.
    if (size.length != 2) {
      user().error('AMP-AD', `Invalid multi-size data format '${sizeStr}'.`);
      continue;
    }

    const width = Number(size[0]);
    const height = Number(size[1]);

    // Make sure that both dimensions given are positive numbers.
    if (
      !validateDimensions(
        width,
        height,
        w => isNaN(w) || w <= 0,
        h => isNaN(h) || h <= 0,
        badParams =>
          badParams
            .map(
              badParam =>
                `Invalid ${badParam.dim} of ${badParam.val} ` +
                'given for secondary size.'
            )
            .join(' ')
      )
    ) {
      continue;
    }

    // Check that secondary size is not larger than primary size.
    if (
      !isFluidPrimary &&
      !validateDimensions(
        width,
        height,
        w => w > primaryWidth,
        h => h > primaryHeight,
        badParams =>
          badParams
            .map(
              badParam =>
                `Secondary ${badParam.dim} ${badParam.val} ` +
                `can't be larger than the primary ${badParam.dim}.`
            )
            .join(' ')
      )
    ) {
      continue;
    }

    // Check that if multi-size-validation is on, that the secondary sizes
    // are at least minRatio of the primary size.
    if (multiSizeValidation) {
      // The minimum ratio of each secondary dimension to its corresponding
      // primary dimension.
      const minRatio = 2 / 3;
      const minWidth = minRatio * primaryWidth;
      const minHeight = minRatio * primaryHeight;
      if (
        !validateDimensions(
          width,
          height,
          w => w < minWidth,
          h => h < minHeight,
          badParams =>
            badParams
              .map(
                badParam =>
                  `Secondary ${badParam.dim} ${badParam.val} is ` +
                  `smaller than 2/3rds of the primary ${badParam.dim}.`
              )
              .join(' ')
        )
      ) {
        continue;
      }
    }

    // Passed all checks! Push additional size to dimensions.
    dimensions.push([width, height]);
  }

  return dimensions;
}

/**
 * A helper function for determining whether a given width or height violates
 * some condition.
 *
 * Checks the width and height against their corresponding conditions. If
 * either of the conditions fail, the errorBuilder function will be called with
 * the appropriate arguments, its result will be logged to user().error, and
 * validateDimensions will return false. Otherwise, validateDimensions will
 * only return true.
 *
 * @param {(number|string)} width
 * @param {(number|string)} height
 * @param {function((number|string)): boolean} widthCond
 * @param {function((number|string)): boolean} heightCond
 * @param {function(!Array<{dim: string, val: (number|string)}>): string=} errorBuilder
 * A function that will produce an informative error message.
 * @return {boolean}
 */
function validateDimensions(
  width,
  height,
  widthCond,
  heightCond,
  errorBuilder
) {
  const badParams = [];
  if (widthCond(width)) {
    badParams.push({dim: 'width', val: width});
  }
  if (heightCond(height)) {
    badParams.push({dim: 'height', val: height});
  }
  if (badParams.length) {
    user().warn('AMP-AD', errorBuilder(badParams));
  }
  return !badParams.length;
}

/**
 * Calculates height of responsive matched content slot based on its width.
 * This logic should be kept as close to possible to the logic inside
 * adsbygoogle.js.
 *
 * @param {number} availableWidth
 * @param {!Element} element <amp-ad> tag which contains publisher settings
 *     if any.
 * @return {number} height to use for the matched content slot.
 */
export function getMatchedContentResponsiveHeightAndUpdatePubParams(
  availableWidth,
  element
) {
  const pubControlParams = {
    numberOfRows: element.getAttribute(ExternalCorePubVars.ROWS_NUM),
    numberOfColumns: element.getAttribute(ExternalCorePubVars.COLUMNS_NUM),
    layoutType: element.getAttribute(ExternalCorePubVars.UI_TYPE),
  };
  let config;
  if (
    pubControlParams.numberOfRows ||
    pubControlParams.numberOfColumns ||
    pubControlParams.layoutType
  ) {
    // Publisher provided at least 1 param  which means we are in
    // "pub controlled matched content" mode.
    config = getPubControlConfig(availableWidth, pubControlParams);
  } else {
    // Publisher didn't provide any matched content params so use auto mode.
    config = getAutoConfig(
      availableWidth,
      availableWidth <= MIN_PUB_CONTROL_WIDTH_OF_DESKTOP
    );
  }
  if (config.validationError) {
    user().error('AMP-AD', config.validationError);
    // There was an error in pub params and we logged it in console.
    // Return 0 as height to hide slot.
    return 0;
  }
  element.setAttribute(ExternalCorePubVars.ROWS_NUM, config.numberOfRows);
  element.setAttribute(ExternalCorePubVars.COLUMNS_NUM, config.numberOfColumns);
  element.setAttribute(ExternalCorePubVars.UI_TYPE, config.layoutType);

  return config.slotHeight;
}
