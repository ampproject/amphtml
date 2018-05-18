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
 * @fileoverview Common animations utility functions used in the amp-fx
 * presets.
 */

import {Services} from '../../../../src/services';
import {mapRange} from '../../../../src/utils/math';
import {startsWith} from '../../../../src/string';
import {user} from '../../../../src/log';

const MAX_MOBILE_WIDTH = 480;
const MAX_TABLET_WIDTH = 1000;

/**
 * Converts the data-fade-ineasing input into the corresponding `cubic-bezier()`
 * notation.
 * @param {string} keyword to be converted.
 * @return {string} cubic-bezier() notation.
 */
export function convertEasingKeyword(keyword) {
  switch (keyword) {
    case 'linear':
      return 'cubic-bezier(0.00, 0.00, 1.00, 1.00)';
    case 'ease-in-out':
      return 'cubic-bezier(0.80, 0.00, 0.20, 1.00)';
    case 'ease-in':
      return 'cubic-bezier(0.80, 0.00, 0.60, 1.00)';
    case 'ease-out':
      return 'cubic-bezier(0.40, 0.00, 0.40, 1.00)';
    default:
      user().assert(startsWith(keyword, 'cubic-bezier'),
          'All custom bezier curves should be specified by following the ' +
            '`cubic-bezier()` function notation.');
      return keyword;
  }
}

export function resolvePercentageToNumber(val) {
  const precentageStrippedVal = parseFloat(val);
  if (!isNaN(precentageStrippedVal)) {
    return precentageStrippedVal / 100;
  }
}

export function installStyles(element, fxType) {
  switch (fxType) {
    case 'parallax':
      return {
        'will-change': 'transform',
      };
    case 'fade-in':
      return {
        'will-change': 'opacity',
        'opacity': 0,
      };
    case 'fade-in-scroll':
      return {
        'will-change': 'opacity',
        'opacity': 0,
      };
    case 'fly-in-bottom':
    case 'fly-in-top':
    case 'fly-in-left':
    case 'fly-in-right':
      return {
        'will-change': 'transform',
      };
    default:
      return {
        'visibility': 'visible',
      };
  }
}

export function defaultDurationValues(ampdoc, fxType) {
  switch (fxType) {
    case 'fade-in':
      return '1000ms';
    case 'fly-in-bottom':
    case 'fly-in-top':
    case 'fly-in-left':
    case 'fly-in-right':
      const {width} = Services.viewportForDoc(ampdoc).getSize();
      return mapRange(
          Math.min(1000, width), MAX_MOBILE_WIDTH, MAX_TABLET_WIDTH, 400, 600)
          + 'ms';
    default:
      return '1ms';
  }
}

export function defaultFlyInDistanceValues(ampdoc, fxType) {
  switch (fxType) {
    case 'fly-in-bottom':
    case 'fly-in-top':
      const {width} = Services.viewportForDoc(ampdoc).getSize();
      if (width < MAX_TABLET_WIDTH) { // mobile and tablets
        return 25;
      }
      // laptops and desktops
      return 33;
    case 'fly-in-left':
    case 'fly-in-right':
      return 100;
    default:
      return 1;
  }
}

export function defaultMarginValues(fxType) {
  switch (fxType) {
    case 'fade-in':
    case 'fly-in-right':
    case 'fly-in-left':
    case 'fly-in-top':
    case 'fly-in-bottom':
      return {
        'start': 0.05,
      };
    case 'fade-in-scroll':
      return {
        'start': 0,
        'end': 0.5,
      };
    default:
      return {
        'start': 0,
        'end': 1,
      };
  }
}

export function defaultEasingValues(fxType) {
  switch (fxType) {
    case 'fade-in':
      return 'ease-in';
    case 'fly-in-right':
    case 'fly-in-left':
    case 'fly-in-top':
    case 'fly-in-bottom':
      return 'ease-out';
    default:
      return 'ease-in';
  }
}
