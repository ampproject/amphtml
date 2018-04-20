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

import {computedStyle} from '../../../../src/style';
import {startsWith} from '../../../../src/string';
import {user} from '../../../../src/log';

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

export function installStyles(ampdoc, element, fxType, flyInDistance) {
  const style = computedStyle(ampdoc.win, element);
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
      return {
        'will-change': 'transform',
        'top': 'calc(' + style.top + ' + ' + flyInDistance + 'vh)',
      };
    case 'fly-in-top':
      return {
        'will-change': 'transform',
        'top': 'calc(' + style.top + ' - ' + flyInDistance + 'vh)',
      };
    case 'fly-in-left':
      return {
        'will-change': 'transform',
        'left': 'calc(' + style.left + ' - ' + flyInDistance + 'vw)',
      };
    case 'fly-in-right':
      return {
        'will-change': 'transform',
        'left': 'calc(' + style.left + ' + ' + flyInDistance + 'vw)',
      };
  }
}

export function defaultDurationValues(fxType) {
  switch (fxType) {
    case 'fade-in':
      return '1000ms';
    case 'fly-in-bottom':
      return '400ms';
    case 'fly-in-top':
      return '400ms';
    case 'fly-in-left':
      return '400ms';
    case 'fly-in-right':
      return '400ms';
    default:
      return '1ms';
  }
}

export function flyInDistanceValues(fxType) {
  switch (fxType) {
    case 'fly-in-bottom':
      return '10';
    case 'fly-in-top':
      return '10';
    case 'fly-in-left':
      return '5';
    case 'fly-in-right':
      return '5';
    default:
      return '1';
  }
}

export function marginValues(fxType) {
  switch (fxType) {
    case 'fade-in':
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
