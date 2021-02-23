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

import {Services} from '../services';
import {layoutRectLtwh} from '../layout-rect';
import {toWin} from '../types';

/**
 * @param {!Element} element
 * @return {!../layout-rect.LayoutRectDef}
 */
export function getPageLayoutBoxBlocking(element) {
  const stop = element.ownerDocument.body;
  let left = 0;
  let top = 0;
  for (let n = element; n && n != stop; n = n./*OK*/ offsetParent) {
    left += n./*OK*/ offsetLeft;
    top += n./*OK*/ offsetTop;
  }
  const {offsetWidth, offsetHeight} = element;
  return layoutRectLtwh(left, top, offsetWidth, offsetHeight);
}

/**
 * @param {!Element} element
 * @return {!Promise<!../layout-rect.LayoutRectDef>}
 */
export function measurePageLayoutBox(element) {
  const vsync = Services.vsyncFor(toWin(element.ownerDocument.defaultView));
  return vsync.measurePromise(() => getPageLayoutBoxBlocking(element));
}
