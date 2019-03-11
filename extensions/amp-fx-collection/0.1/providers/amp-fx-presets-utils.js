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

import {FxType} from '../fx-type';
import {Services} from '../../../../src/services';
import {mapRange} from '../../../../src/utils/math';
import {startsWith} from '../../../../src/string';
import {userAssert} from '../../../../src/log';

const MAX_MOBILE_WIDTH = 480;
const MAX_TABLET_WIDTH = 1000;

/**
 * Converts the data-fade-ineasing input into the corresponding `cubic-bezier()`
 * notation.
 * @param {string} keyword to be converted.
 * @return {string} cubic-bezier() notation.
 */
export function convertEasingKeyword(keyword) {
  const curves = {
    'linear': 'cubic-bezier(0.00, 0.00, 1.00, 1.00)',
    'ease-in-out': 'cubic-bezier(0.80, 0.00, 0.20, 1.00)',
    'ease-in': 'cubic-bezier(0.80, 0.00, 0.60, 1.00)',
    'ease-out': 'cubic-bezier(0.40, 0.00, 0.40, 1.00)',
  };
  if (curves[keyword]) {
    return curves[keyword];
  }
  userAssert(startsWith(keyword, 'cubic-bezier'),
      'All custom bezier curves should be specified by following the ' +
        '`cubic-bezier()` function notation.');
  return keyword;
}

/**
 * Returns absolute number for a given percentage
 *
 * @param {string} val
 * @return {?number}
 */
export function resolvePercentageToNumber(val) {
  const precentageStrippedVal = parseFloat(val);
  if (!isNaN(precentageStrippedVal)) {
    return precentageStrippedVal / 100;
  }
  return null;
}

/**
 * Returns styles for the animation.
 *
 * @param {Element} element
 * @param {string} fxType
 * @return {!Object<string, string>}
 */
export function getDefaultStyles(element, fxType) {
  switch (fxType) {
    case FxType.FLOAT_IN_TOP:
    case FxType.FLOAT_IN_BOTTOM:
      return {
        'will-change': 'transform,opacity,pointer-events',
      };
    case FxType.PARALLAX:
      return {
        'will-change': 'transform',
      };
    case FxType.FADE_IN:
      return {
        'will-change': 'opacity',
        'opacity': 0,
      };
    case FxType.FADE_IN_SCROLL:
      return {
        'will-change': 'opacity',
        'opacity': 0,
      };
    case FxType.FLY_IN_BOTTOM:
    case FxType.FLY_IN_TOP:
    case FxType.FLY_IN_LEFT:
    case FxType.FLY_IN_RIGHT:
      return {
        'will-change': 'transform',
      };
    default:
      return {
        'visibility': 'visible',
      };
  }
}

/**
 * Returns animation duration for the given animation type.
 *
 * @param {!../../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} fxType
 * @return {string}
 */
export function defaultDurationValues(ampdoc, fxType) {
  switch (fxType) {
    case FxType.FADE_IN:
      return '1000ms';
    case FxType.FLY_IN_BOTTOM:
    case FxType.FLY_IN_TOP:
    case FxType.FLY_IN_LEFT:
    case FxType.FLY_IN_RIGHT:
      const {width} = Services.viewportForDoc(ampdoc).getSize();
      return mapRange(
          Math.min(1000, width), MAX_MOBILE_WIDTH, MAX_TABLET_WIDTH, 400, 600)
          + 'ms';
    default:
      return '1ms';
  }
}

/**
 * Returns fly-in distance for the given ampdoc and animation type.
 *
 * @param {!../../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} fxType
 * @return {number}
 */
export function defaultFlyInDistanceValues(ampdoc, fxType) {
  switch (fxType) {
    case FxType.FLY_IN_BOTTOM:
    case FxType.FLY_IN_TOP:
      const {width} = Services.viewportForDoc(ampdoc).getSize();
      if (width < MAX_TABLET_WIDTH) { // mobile and tablets
        return 25;
      }
      // laptops and desktops
      return 33;
    case FxType.FLY_IN_LEFT:
    case FxType.FLY_IN_RIGHT:
      return 100;
    default:
      return 1;
  }
}

/**
 * Returns margin values for defaultMarginValues
 *
 * @param {string} fxType
 * @return {!Object<string, number>}
 */
export function defaultMarginValues(fxType) {
  switch (fxType) {
    case FxType.FADE_IN:
    case FxType.FLY_IN_RIGHT:
    case FxType.FLY_IN_LEFT:
    case FxType.FLY_IN_TOP:
    case FxType.FLY_IN_BOTTOM:
      return {
        'start': 0.05,
      };
    case FxType.FADE_IN_SCROLL:
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

/**
 * Returns easing values for the given function
 *
 * @param {string} fxType
 * @return {string}
 */
export function defaultEasingValues(fxType) {
  switch (fxType) {
    case FxType.FADE_IN:
      return 'ease-in';
    case FxType.FLY_IN_RIGHT:
    case FxType.FLY_IN_LEFT:
    case FxType.FLY_IN_TOP:
    case FxType.FLY_IN_BOTTOM:
      return 'ease-out';
    default:
      return 'ease-in';
  }
}
