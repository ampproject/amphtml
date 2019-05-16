/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {assertLength, assertLengthOrPercent} from './layout';
import {userAssert} from './log';

/**
 * A single option within a SizeList.
 * @typedef {{
 *   mediaQuery: (string|undefined),
 *   size: (!./layout.LengthDef)
 * }}
 */
let SizeListOptionDef;

/**
 * Parses the text representation of "sizes" into SizeList object.
 *
 * There could be any number of size options within the SizeList. They are tried
 * in the order they were defined. The final size option must not have "media"
 * condition specified. All other size options must have "media" condition
 * specified.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Attributes
 * See http://www.w3.org/html/wg/drafts/html/master/semantics.html#attr-img-sizes
 * @param {string} s
 * @param {boolean=} opt_allowPercentAsLength when parsing heights
 * @return {!SizeList}
 */
export function parseSizeList(s, opt_allowPercentAsLength) {
  const sSizes = s.split(',');
  userAssert(sSizes.length > 0, 'sizes has to have at least one size');
  const sizes = [];
  sSizes.forEach(sSize => {
    sSize = sSize.replace(/\s+/g, ' ').trim();
    if (sSize.length == 0) {
      return;
    }

    let mediaStr;
    let sizeStr;

    // Process the expression from the end.
    const lastChar = sSize.charAt(sSize.length - 1);
    let div;
    let func = false;
    if (lastChar == ')') {
      // Value is the CSS function, e.g. `calc(50vw + 10px)`.
      func = true;

      // First, skip to the opening paren.
      let parens = 1;
      div = sSize.length - 2;
      for (; div >= 0; div--) {
        const c = sSize.charAt(div);
        if (c == '(') {
          parens--;
        } else if (c == ')') {
          parens++;
        }
        if (parens == 0) {
          break;
        }
      }

      // Then, skip to the begining to the function's name.
      const funcEnd = div - 1;
      if (div > 0) {
        div--;
        for (; div >= 0; div--) {
          const c = sSize.charAt(div);
          if (
            !(
              c == '%' ||
              c == '-' ||
              c == '_' ||
              (c >= 'a' && c <= 'z') ||
              (c >= 'A' && c <= 'Z') ||
              (c >= '0' && c <= '9')
            )
          ) {
            break;
          }
        }
      }
      userAssert(div < funcEnd, 'Invalid CSS function in "%s"', sSize);
    } else {
      // Value is the length or a percent: accept a wide range of values,
      // including invalid values - they will be later asserted to conform
      // to exact CSS length or percent value.
      div = sSize.length - 2;
      for (; div >= 0; div--) {
        const c = sSize.charAt(div);
        if (
          !(
            c == '%' ||
            c == '.' ||
            (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            (c >= '0' && c <= '9')
          )
        ) {
          break;
        }
      }
    }
    if (div >= 0) {
      mediaStr = sSize.substring(0, div + 1).trim();
      sizeStr = sSize.substring(div + 1).trim();
    } else {
      sizeStr = sSize;
      mediaStr = undefined;
    }
    sizes.push({
      mediaQuery: mediaStr,
      size: func
        ? sizeStr
        : opt_allowPercentAsLength
        ? assertLengthOrPercent(sizeStr)
        : assertLength(sizeStr),
    });
  });
  return new SizeList(sizes);
}

/**
 * A SizeList object contains one or more sizes as typically seen in "sizes"
 * attribute.
 *
 * See "select" method for details on how the size selection is performed.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Attributes
 * See http://www.w3.org/html/wg/drafts/html/master/semantics.html#attr-img-sizes
 */
export class SizeList {
  /**
   * @param {!Array<!SizeListOptionDef>} sizes
   */
  constructor(sizes) {
    userAssert(sizes.length > 0, 'SizeList must have at least one option');
    /** @private @const {!Array<!SizeListOptionDef>} */
    this.sizes_ = sizes;

    // All sources except for last must have a media query. The last one must
    // not.
    for (let i = 0; i < sizes.length; i++) {
      const option = sizes[i];
      if (i < sizes.length - 1) {
        userAssert(
          option.mediaQuery,
          'All options except for the last must have a media condition'
        );
      } else {
        userAssert(
          !option.mediaQuery,
          'The last option must not have a media condition'
        );
      }
    }
  }

  /**
   * Selects the first size that matches media conditions. If no options match,
   * the last option is returned.
   *
   * See http://www.w3.org/html/wg/drafts/html/master/semantics.html#attr-img-sizes
   * @param {!Window} win
   * @return {!./layout.LengthDef|string}
   */
  select(win) {
    const sizes = this.sizes_;
    const length = sizes.length - 1;

    // Iterate all but the last size
    for (let i = 0; i < length; i++) {
      const option = sizes[i];
      // Only the last item (which we don't iterate) has an undefined
      // mediaQuery.
      const query = /** @type {string} */ (option.mediaQuery);
      if (win.matchMedia(query).matches) {
        return option.size;
      }
    }

    // Returns the last size in the SizeList, which is the default.
    return sizes[length].size;
  }
}
