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

import {Services} from '../../../src/services';
import {toWin} from '../../../src/types';

/**
 * Returns a promise to the layoutBox for the element. If the element is
 * resource-backed then makes use of the resource layoutBox, otherwise
 * measures the element directly.
 * @param {!Element} element
 * @return {!Promise<!../../../src/layout-rect.LayoutRectDef>}
 */
export function getElementLayoutBox(element) {
  const resources = Services.resourcesForDoc(element);
  const resource = resources.getResourceForElementOptional(element);
  if (resource) {
    return resource.getPageLayoutBoxAsync();
  }
  const vsync = Services.vsyncFor(toWin(element.ownerDocument.defaultView));
  return vsync.measurePromise(() => {
    const viewport = Services.viewportForDoc(element);
    return viewport.getLayoutRect(element);
  });
}
