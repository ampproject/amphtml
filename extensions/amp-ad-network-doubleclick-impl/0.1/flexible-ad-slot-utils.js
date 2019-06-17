/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {DomAncestorVisitor} from '../../../src/utils/dom-ancestor-visitor';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';

/** @const @enum {number} */
const FULL_WIDTH_SIGNALS = {
  UNUSED_DEFAULT: 0,
  ELEMENT_MISSING: 1,
  OVERFLOW_HIDDEN: 2,
  NULL_STYLE: 3,
  // enums 4, 5, 6 are reserved but unused here.
  ELEMENT_HIDDEN: 7,
  ELEMENT_IN_IFRAME: 8
}

/**
 * Gets the maximum width the given element may occupy.
 * @param {!Element} element
 * @param {!Object<style, style>} style
 * @return {?number} The width if it was found, null otherwise.
 */
function getElementWidth(el, style) {
  const layout = el.getAttribute('layout');
  switch (layout) {
    case Layout.FIXED:
      return parseInt(el.getAttribute('width'), 10) || 0;
    case Layout.RESPONSIVE:
    case Layout.FILL:
    case Layout.FIXED_HEIGHT:
    case Layout.FLUID:
      // The above layouts determine the width of the element by the
      // containing element, or by CSS max-width property.
      const maxWidth = parseInt(style.maxWidth, 10);
      if (maxWidth || maxWidth == 0) {
        return maxWidth;
      }
      return null;
    case Layout.CONTAINER:
      // Container layout allows the container's size to be determined by
      // the children within it, so in principle we can grow as large as the
      // viewport.
      const viewport = Services.viewportForDoc(dev().assertElement(element));
      return viewport.getSize().width;
    case Layout.NODISPLAY:
    case Layout.FLEX_ITEM:
      return 0;
    default:
      // If no layout is provided, we must use getComputedStyle.
      return parseInt(style.width, 10) || 0;
  }
};

/**
 * Gets the maximum width the given element may occupy.
 * @param {!Element} element
 * @param {!Object<style, style>} style
 * @param {function(*): undefined} returnResult
 */

function getFullWidthSignal(el, style) {
  return -1;
}

/**
 * Returns the fixed size of the given element, or the fixed size of its nearest
 * ancestor that has a fixed size, if the given element has none.
 * @param {!Window} win
 * @param {?Element} element
 * @return {number} The width of the given element, or of the nearest ancestor
 *    with a fixed size, if the given element has none.
 */
export function getFlexibleAdSlotRequestParams(win, element) {
  return new DomAncestorVisitor(win)
    .addVisitor('psz', getElementWidth, 100 /* maxDepth */)
    .addVisitor('msz', getElementWidth, 1 /* maxDepth */)
    .addVisitor('fws', getFullWidthSignal, 100 /* maxDepth */)
    .visitAncestorsStartingFrom(element)
    .getAllResults();
}
