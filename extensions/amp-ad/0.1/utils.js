/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

/** @const {!Object} */
export const ValidAdContainerTypes = {
  'AMP-STICKY-AD': 'sa',
  'AMP-FX-FLYING-CARPET': 'fc',
  'AMP-LIGHTBOX': 'lb',
};

/**
 * Returns a map containing all ad containers that enclose the given ad
 * element. The params of the map are restricted to the ValidAdContainerTypes,
 * and the values are all true.
 * @param {!Element} adElement
 * @return {!Object<string, boolean>}
 */
export function getAllParentAdContainers(adElement) {
  const containerTypeSet = {};
  for (let el = adElement.parentElement, counter = 0;
      el && counter < 20; el = el.parentElement, counter++) {
    const tagName = el.tagName.toUpperCase();
    if (ValidAdContainerTypes[tagName]) {
      containerTypeSet[ValidAdContainerTypes[tagName]] = true;
    }
  }
  return containerTypeSet;
}

