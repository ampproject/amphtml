

import {LayoutRectDef, layoutRectLtwh} from './rect';

/**
 * @param {!Element} element
 * @return {!LayoutRectDef}
 */
export function getPageLayoutBoxBlocking(element) {
  const stop = element.ownerDocument.body;
  let left = 0;
  let top = 0;
  for (let n = element; n && n != stop; n = n./*OK*/ offsetParent) {
    left += n./*OK*/ offsetLeft;
    top += n./*OK*/ offsetTop;
  }
  const {offsetHeight, offsetWidth} = /** @type {!HTMLElement} */ (element);
  return layoutRectLtwh(left, top, offsetWidth, offsetHeight);
}
