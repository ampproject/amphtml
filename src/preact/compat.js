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

import * as compat from /*OK*/ 'preact/compat';

/**
 * @param {function(T, {current: (R|null)}):PreactDef.Renderable} fn
 * @return {function(T):PreactDef.Renderable}
 * @template T, R
 */
export function forwardRef(fn) {
  return compat.forwardRef(fn);
}

/**
 * @param {PreactDef.VNode} vnode
 * @param {HTMLElement} container
 * @return {PreactDef.VNode}
 */
export function createPortal(vnode, container) {
  return compat.createPortal(vnode, container);
}

/**
 * @param {...PreactDef.Renderable} unusedChildren
 * @return {!Array<PreactDef.Renderable>}
 */
export function toChildArray(unusedChildren) {
  return compat.Children.toArray.apply(undefined, arguments);
}
