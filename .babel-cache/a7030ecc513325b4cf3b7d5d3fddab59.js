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

import { LayoutRectDef, layoutRectLtwh } from "./rect";

/**
 * @param {!Element} element
 * @return {!LayoutRectDef}
 */
export function getPageLayoutBoxBlocking(element) {
  var stop = element.ownerDocument.body;
  var left = 0;
  var top = 0;
  for (var n = element; n && n != stop; n = n. /*OK*/offsetParent) {
    left += n. /*OK*/offsetLeft;
    top += n. /*OK*/offsetTop;
  }
  var offsetHeight = /** @type {!HTMLElement} */(element).offsetHeight,offsetWidth = /** @type {!HTMLElement} */(element).offsetWidth;
  return layoutRectLtwh(left, top, offsetWidth, offsetHeight);
}
// /Users/mszylkowski/src/amphtml/src/core/dom/layout/page-layout-box.js