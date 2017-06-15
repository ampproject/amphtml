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

import {user} from '../../src/log';

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
 * @param {boolean} strict If set to true, this indicates that a single
 *   malformed size should cause the entire multi-size data string to be
 *   abnadoned. If set to false, then malformed sizes will be ignored, and the
 *   remainder of the string will be parsed for any additional sizes.
 *   Additionally, errors will only be reported if this flag is set to true.
 * @return {?Array<Array<number>>} An array of dimensions.
 */
export function getMultiSizeDimensions(
    multiSizeDataStr,
    primaryWidth,
    primaryHeight,
    multiSizeValidation,
    strict) {

  const dimensions = [];
  const arrayOfSizeStrs = multiSizeDataStr.split(',');

  for (let i = 0; i < arrayOfSizeStrs.length; i++) {

    const sizeStr = arrayOfSizeStrs[i];
    const size = sizeStr.split('x');

    // Make sure that each size is specified in the form WxH.
    if (size.length != 2) {
      user().error('AMP-AD', `Invalid multi-size data format '${sizeStr}'.`);
      if (strict) {
        return null;
      }
      continue;
    }

    const width = Number(size[0]);
    const height = Number(size[1]);

    // Make sure that both dimensions given are positive numbers.
    if (!validateDimensions(width, height,
          w => isNaN(w) || w <= 0,
          h => isNaN(h) || h <= 0,
          badParams => badParams.map(badParam =>
            `Invalid ${badParam.dim} of ${badParam.val} ` +
            `given for secondary size.`).join(' '),
          strict)) {
      if (strict) {
        return null;
      }
      continue;
    }

    // Check that secondary size is not larger than primary size.
    if (!validateDimensions(width, height,
          w => w > primaryWidth,
          h => h > primaryHeight,
          badParams => badParams.map(badParam =>
            `Secondary ${badParam.dim} ${badParam.val} ` +
            `can't be larger than the primary ${badParam.dim}.`).join(' '),
          strict)) {
      if (strict) {
        return null;
      }
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
      if (!validateDimensions(width, height,
            w => w < minWidth,
            h => h < minHeight,
            badParams => badParams.map(badParam =>
              `Secondary ${badParam.dim} ${badParam.val} is ` +
              `smaller than 2/3rds of the primary ${badParam.dim}.`).join(' '),
            strict)) {
        if (strict) {
          return null;
        }
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
 * @param {function(!Array<{dim: string, val: (number|string)}>): string=}
 *   errorBuilder A function that will produce an informative error message.
 * @param {boolean=} reportError If true, indicates that an error message
 *   should be logged to the console.
 * @return {boolean}
 */
function validateDimensions(width, height, widthCond, heightCond,
    errorBuilder, reportError) {
  const badParams = [];
  if (widthCond(width)) {
    badParams.push({dim: 'width', val: width});
  }
  if (heightCond(height)) {
    badParams.push({dim: 'height', val: height});
  }
  if (reportError && badParams.length) {
    user().error('AMP-AD', errorBuilder(badParams));
  }
  return !badParams.length;
}
