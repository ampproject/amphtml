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

/**
 * @param {!Element} el
 * @param {!Window} win
 * @return {boolean} whether element or its ancestors have position
 * fixed (unless they are POSITION_FIXED_TAG_WHITELIST).
 * This should only be called when a layout on the page was just forced
 * anyway.
 */
export function isAdPositionFixed(el, win) {
  let hasFixedAncestor = false;
  do {
    if (POSITION_FIXED_TAG_WHITELIST[el.tagName]) {
      return false;
    }
    if (win/*because only called from onLayoutMeasure */
        ./*OK*/getComputedStyle(el).position == 'fixed') {
      // Because certain blessed elements may contain a position fixed
      // container (which contain an ad), we continue to search the
      // ancestry tree.
      hasFixedAncestor = true;
    }
    el = el.parentNode;
  } while (el && el.tagName != 'BODY');
  return hasFixedAncestor;
}
