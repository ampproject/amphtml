import {layoutRectLtwh} from './rect';

/**
 * @param {HTMLElement} element
 * @return {import('./rect').LayoutRectDef}
 */
export function getPageLayoutBoxBlocking(element) {
  const stop = element.ownerDocument.body;
  let left = 0;
  let top = 0;
  for (
    let n = element;
    n && n != stop;
    n = /** @type {HTMLElement} */ (n./*OK*/ offsetParent)
  ) {
    left += n./*OK*/ offsetLeft;
    top += n./*OK*/ offsetTop;
  }
  const {offsetHeight, offsetWidth} = element;
  return layoutRectLtwh(left, top, offsetWidth, offsetHeight);
}
