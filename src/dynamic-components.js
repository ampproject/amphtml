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

/**
 * Dynamic AMP components - documented at spec/amp-cache-guidelines.md under
 * headline "Guidelines: Adding a new cache to the AMP ecosystem"
 */
const AMP_DYNAMIC_COMPONENTS = ['amp-geo'];

/**
 * Determine whether an extension is a dynamic AMP component
 * @param {string} extensionId
 * @return {boolean}
 */
export function isDynamicComponent(extensionId) {
  return (
    Boolean(extensionId) && AMP_DYNAMIC_COMPONENTS.indexOf(extensionId) >= 0
  );
}
