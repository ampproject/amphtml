
import {getPageLayoutBoxBlocking} from '#core/dom/layout/page-layout-box';
import {toWin} from '#core/window';

import {Services} from '.../../../src/service';

/**
 * @param {!Element} element
 * @return {!Promise<!../layout-rect.LayoutRectDef>}
 */
export function measurePageLayoutBox(element) {
  const vsync = Services.vsyncFor(toWin(element.ownerDocument.defaultView));
  return vsync.measurePromise(() => getPageLayoutBoxBlocking(element));
}
