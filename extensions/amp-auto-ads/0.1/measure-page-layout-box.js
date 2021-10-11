import {getPageLayoutBoxBlocking} from '#core/dom/layout/page-layout-box';
import {getWin} from '#core/window';

import {Services} from '.../../../src/service';

/**
 * @param {!Element} element
 * @return {!Promise<!../layout-rect.LayoutRectDef>}
 */
export function measurePageLayoutBox(element) {
  const vsync = Services.vsyncFor(getWin(element));
  return vsync.measurePromise(() => getPageLayoutBoxBlocking(element));
}
