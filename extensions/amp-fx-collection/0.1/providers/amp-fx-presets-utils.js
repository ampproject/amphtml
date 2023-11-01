/**
 * @fileoverview Common animations utility functions used in the amp-fx
 * presets.
 */

import {mapRange} from '#core/math';

import {Services} from '#service';

import {userAssert} from '#utils/log';

import {FxType} from '../fx-type';

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
  userAssert(
    keyword.startsWith('cubic-bezier'),
    'All custom bezier curves should be specified by following the ' +
      '`cubic-bezier()` function notation.'
  );
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
 * @return {!{[key: string]: string}}
 */
export function installStyles(element, fxType) {
  switch (fxType) {
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
      return (
        mapRange(
          Math.min(1000, width),
          MAX_MOBILE_WIDTH,
          MAX_TABLET_WIDTH,
          400,
          600
        ) + 'ms'
      );
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
      if (width < MAX_TABLET_WIDTH) {
        // mobile and tablets
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
 * @return {!{[key: string]: number}}
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
