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
import {LayoutRectDef, layoutRectLtwh} from '../../../src/layout-rect';

/**
 * @param {function():T} get
 * @return {{get: function():T, configurable: boolean, enumerable: boolean}}
 * @template T
 */
const readonlyGetterProp = (get) => ({
  get,
  configurable: false,
  enumerable: true,
});

/**
 * Returns a `LayoutRectDef`-like object whose values match the viewport's area
 * accoding to service.
 * @param {!../../../src/service/viewport/viewport-interface.ViewportInterface} viewport
 * @return {!LayoutRectDef} with dynamic getters
 */
export function createViewportRect(viewport) {
  const width = readonlyGetterProp(() => viewport.getSize().width);
  const height = readonlyGetterProp(() => viewport.getSize().height);

  return /** @type {!LayoutRectDef} */ (Object.defineProperties(
    layoutRectLtwh(0, 0, 0, 0),
    {
      width,
      height,
      right: width,
      bottom: height,
    }
  ));
}
