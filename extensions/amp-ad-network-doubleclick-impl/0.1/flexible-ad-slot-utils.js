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
import {dev} from '../../../src/log';

/** @const @enum {number} */
const FULL_WIDTH_SIGNALS = {
  OVERFLOW_HIDDEN: 4,
  ELEMENT_HIDDEN: 128,
};

/**
 * Gets the maximum width the given element may occupy.
 * @param {!Element} element
 * @param {!Object<string, string>} style
 * @return {?number} The width if it was found, null otherwise.
 */
function getElementWidth(element, style) {
  const layout = element.getAttribute('layout');
  switch (layout) {
    case Layout.FIXED:
      return parseInt(element.getAttribute('width'), 10) || 0;
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
}

/**
 * Returns a callback function that can be passed as a visitor for computing the
 * 'fws' request parameter.
 */
function getFullWidthSignalVisitor() {
  return (el, style) => {
    if (style.overflowY && style.overflowY != 'visible') {
      return FULL_WIDTH_SIGNALS.OVERFLOW_HIDDEN;
    }
    if (style.display == 'none') {
      return FULL_WIDTH_SIGNALS.ELEMENT_HIDDEN;
    }
  };
}

/** @typedef {{
 *    fwSignal: ?number,
 *    slotWidth: ?number,
 *    parentWidth: ?number,
 * }}
 */
let ParamsTypeDef;

/**
 * Returns the fixed size of the given element, or the fixed size of its nearest
 * ancestor that has a fixed size, if the given element has none.
 * @param {!Window} win
 * @param {?Element} element
 * @return {!ParamsTypeDef} The width of the given
 *    element, or of the nearest ancestor with a fixed size, if the given
 *    element has none.
 */
export function getFlexibleAdSlotRequestParams(win, element) {
  return /** @type {!ParamsTypeDef} */ (new DomAncestorVisitor(win)
    .addVisitor('parentWidth', getElementWidth, 100 /* maxDepth */)
    .addVisitor('slotWidth', getElementWidth, 1 /* maxDepth */)
    .addVisitor('fwSignal', getFullWidthSignalVisitor(), 100 /* maxDepth */)
    .visitAncestorsStartingFrom(element)
    .getAllResults());
}
