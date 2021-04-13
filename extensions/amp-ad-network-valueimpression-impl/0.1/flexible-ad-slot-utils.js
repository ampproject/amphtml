/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import {
  DomAncestorVisitor,
  VisitorCallbackTypeDef,
} from '../../../src/utils/dom-ancestor-visitor';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {dev} from '../../../src/log';

/** @const @enum {number} */
const FULL_WIDTH_SIGNALS = {
  OVERFLOW_HIDDEN: 4,
  ELEMENT_HIDDEN: 128,
};

/**
 * Returns a visitor callback that gets the maximum width the given element may
 * occupy.
 * @param {function(?number): undefined} setWidth Callback to set the value of
 *   the width.
 * @return {!VisitorCallbackTypeDef} Visitor callback.
 */
function getElementWidthVisitor(setWidth) {
  return (element, style) => {
    const layout = element.getAttribute('layout');
    switch (layout) {
      case Layout.FIXED:
        setWidth(parseInt(element.getAttribute('width'), 10) || 0);
        return true;
      case Layout.RESPONSIVE:
      case Layout.FILL:
      case Layout.FIXED_HEIGHT:
      case Layout.FLUID:
        // The above layouts determine the width of the element by the
        // containing element, or by CSS max-width property.
        const maxWidth = parseInt(style.maxWidth, 10);
        if (maxWidth || maxWidth == 0) {
          setWidth(maxWidth);
          return true;
        }
        break;
      case Layout.CONTAINER:
        // Container layout allows the container's size to be determined by
        // the children within it, so in principle we can grow as large as the
        // viewport.
        const viewport = Services.viewportForDoc(dev().assertElement(element));
        setWidth(viewport.getSize().width);
        return true;
      case Layout.NODISPLAY:
      case Layout.FLEX_ITEM:
        setWidth(0);
        return true;
      default:
        // If no layout is provided, we must use getComputedStyle. Padding and
        // border is not included in the overall computed width, so we must
        // manually include them.
        const paddingLeft = parseInt(style.paddingLeft, 10) || 0;
        const paddingRight = parseInt(style.paddingRight, 10) || 0;
        const totalPadding = paddingLeft + paddingRight;
        const borderLeft = parseInt(style.borderLeftWidth, 10) || 0;
        const borderRight = parseInt(style.borderRightWidth, 10) || 0;
        const totalBorder = borderLeft + borderRight;
        setWidth((parseInt(style.width, 10) || 0) + totalPadding + totalBorder);
        return true;
    }
  };
}

/**
 * Returns a Dom visitor callback that will compute the 'fws' request
 * parameter.
 * @param {function(!FULL_WIDTH_SIGNALS): undefined} setSignal Callback to set
 *   the 'fws' value.
 * @return {!VisitorCallbackTypeDef}
 */
function getFullWidthSignalVisitor(setSignal) {
  return (element, style) => {
    if (style.overflowY && style.overflowY != 'visible') {
      setSignal(FULL_WIDTH_SIGNALS.OVERFLOW_HIDDEN);
      return true;
    }
    if (style.display == 'none') {
      setSignal(FULL_WIDTH_SIGNALS.ELEMENT_HIDDEN);
      return true;
    }
  };
}

/** @typedef {{
 *    fwSignal: number,
 *    slotWidth: number,
 *    parentWidth: number,
 *    parentStyle: ?Object<string, string>,
 * }}
 */
export let FlexibleAdSlotDataTypeDef;

/**
 * Returns the fixed size of the given element, or the fixed size of its nearest
 * ancestor that has a fixed size, if the given element has none.
 * @param {!Window} win
 * @param {?Element} element
 * @return {!FlexibleAdSlotDataTypeDef} A record containing data needed for
 *   generating flex ad slot ad requests, and for adjusting the slot
 *   post-response. See type def for more details.
 */
export function getFlexibleAdSlotData(win, element) {
  let fwSignal = 0;
  let slotWidth = -1;
  let parentWidth = -1;
  let parentStyle = null;
  const setFws = (val) => (fwSignal = val);
  const setMsz = (val) => (slotWidth = val);
  const setPsz = (val) => (parentWidth = val);
  new DomAncestorVisitor(win)
    .addVisitor(getElementWidthVisitor(setMsz), 1 /* maxDepth */)
    .addVisitor(getElementWidthVisitor(setPsz), 100 /* maxDepth */)
    .addVisitor(getFullWidthSignalVisitor(setFws), 100 /* maxDepth */)
    // Used to acquire the parentStyle object so as to not recompute it later
    .addVisitor((el, style) => (parentStyle = style), 1 /* maxDepth */)
    .visitAncestorsStartingFrom(element);
  return {fwSignal, slotWidth, parentWidth, parentStyle};
}
