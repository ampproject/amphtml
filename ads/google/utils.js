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
 * @param {!Array<Array<number>>=} opt_dimensions An array into which to put
 *   the multi-size dimensions.
 * @param {boolean} multiSizeValidation A flag that if set to true will enforce
 *   the rule that ensures multi-size dimensions are no less than 2/3rds of
 *   their primary dimension's counterpart.
 * @return {!Array<Array<number>>} An array of dimensions.
 */
export function getMultiSizeDimensions(
    multiSizeDataStr,
    primaryWidth,
    primaryHeight,
    multiSizeValidation,
    opt_dimensions) {

  const dimensions = opt_dimensions || [];
  const arrayOfSizeStrs = multiSizeDataStr.split(',');

  arrayOfSizeStrs.forEach(sizeStr => {

    const size = sizeStr.split('x');

    // Make sure that each size is specified in the form val1xval2.
    if (size.length != 2) {
      user().error('AMP-AD', `Invalid multi-size data format '${sizeStr}'.`);
      return;
    }

    const width = Number(size[0]);
    const height = Number(size[1]);

    // Make sure that both dimensions given are numbers.
    if (!validateDimensions(width, height,
          w => isNaN(w),
          h => isNaN(h),
          ({badDim, badVal}) =>
          `Invalid ${badDim} of ${badVal} given for secondary size.`)) {
      return;
    }

   /*
This check renders makes it only possible to do a GCD size for the primary unit. Without the ability to put a creative wrapper on AdX demand we cannot resize the container back down to 300x250.
By removing this requirement we set the defaut size to 300x250 for AdX support and allow the amp-ad comtainer to resize up to accomadate our direct sold sponsorhip larger ad sizes. The container will only resize downward when BTF so there is no negative effect on user experience that I've seen.
Perhaps the better way to solve this is to include a new attribute in the amp-ad tag that allows for this option as an override. Thanks Sam smansour@hearst
     // Check that secondary size is not larger than primary size.
    if (!validateDimensions(width, height,
          w => w > primaryWidth,
         h => h > primaryHeight,
         ({badDim, badVal}) => `Secondary ${badDim} ${badVal} ` +
         `can't be larger than the primary ${badDim}.`)) {
     return;
   }*/
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
            ({badDim, badVal}) => `Secondary ${badDim} ${badVal} is ` +
            `smaller than 2/3rds of the primary ${badDim}.`)) {
        return;
      }
    }
    // Passed all checks! Push additional size to dimensions.
    dimensions.push([width, height]);
  });

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
 * @param {!function((number|string)): boolean} widthCond
 * @param {!function((number|string)): boolean} heightCond
 * @param {!function(!{badDim: string, badVal: (string|number)}): string}
 *    errorBuilder A function that will produce an informative error message.
 * @return {boolean}
 */

function validateDimensions(width, height, widthCond, heightCond,
    errorBuilder) {
  let badParams = null;
  if (widthCond(width) && heightCond(height)) {
    badParams = {
      badDim: 'width and height',
      badVal: width + 'x' + height,
    };
  }
  else if (widthCond(width)) {
    badParams = {
      badDim: 'width',
      badVal: width,
    };
  }
  else if (heightCond(height)) {
    badParams = {
      badDim: 'height',
      badVal: height,
    };
  }
  if (badParams) {
    user().error('AMP-AD', errorBuilder(badParams));
    return false;
  }
  return true;
}
