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

import {assert} from './asserts';
import {assertLength} from './layout';


/**
 * A single option within a SizeList.
 * @typedef {{
 *   mediaQuery: (string|undefined),
 *   size: (!Length)
 * }}
 */
let SizeListOption;


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
 * @return {!SizeList}
 */
export function parseSizeList(s) {
  const sSizes = s.split(',');
  assert(sSizes.length > 0, 'sizes has to have at least one size');
  const sizes = [];
  sSizes.forEach(sSize => {
    sSize = sSize.replace(/\s+/g, ' ').trim();
    if (sSize.length == 0) {
      return;
    }

    let mediaStr;
    let sizeStr;
    const spaceIndex = sSize.lastIndexOf(' ');
    if (spaceIndex != -1) {
      mediaStr = sSize.substring(0, spaceIndex).trim();
      sizeStr = sSize.substring(spaceIndex + 1).trim();
    } else {
      sizeStr = sSize;
      mediaStr = undefined;
    }
    sizes.push({mediaQuery: mediaStr, size: assertLength(sizeStr)});
  });
  return new SizeList(sizes);
};


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
   * @param {!Array<!SizeListOption>} sizes
   */
  constructor(sizes) {
    assert(sizes.length > 0, 'SizeList must have at least one option');
    /** @private @const {!Array<!SizeListOption>} */
    this.sizes_ = sizes;

    // All sources except for last must have a media query. The last one must
    // not.
    for (let i = 0; i < sizes.length; i++) {
      const option = sizes[i];
      if (i < sizes.length - 1) {
        assert(option.mediaQuery,
            'All options except for the last must have a media condition');
      } else {
        assert(!option.mediaQuery,
            'The last option must not have a media condition');
      }
    }
  }

  /**
   * Selects the first size that matches media conditions. If no options match,
   * the last option is returned.
   *
   * See http://www.w3.org/html/wg/drafts/html/master/semantics.html#attr-img-sizes
   * @param {!Window} win
   * @return {!Length}
   */
  select(win) {
    for (let i = 0; i < this.sizes_.length - 1; i++) {
      const option = this.sizes_[i];
      if (win.matchMedia(option.mediaQuery).matches) {
        return option.size;
      }
    }
    return this.getLast();
  }

  /**
   * Returns the last size in the SizeList, which is the default.
   * @return {!Length}
   */
  getLast() {
    return this.sizes_[this.sizes_.length - 1].size;
  }
}
