/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {childElementsByTag} from './core/dom/query';
import {isJsonScriptTag} from './core/dom';
import {parseJson} from './core/types/object/json';

/**
 * Helper method to get the json config from an element <script> tag
 * @param {!Element} element
 * @return {?JsonObject}
 * @throws {!Error} If element does not have exactly one <script> child
 * with type="application/json", or if the <script> contents are not valid JSON.
 */
export function getChildJsonConfig(element) {
  const scripts = childElementsByTag(element, 'script');
  const n = scripts.length;
  if (n !== 1) {
    throw new Error(`Found ${scripts.length} <script> children. Expected 1.`);
  }
  const script = scripts[0];
  if (!isJsonScriptTag(script)) {
    throw new Error('<script> child must have type="application/json"');
  }
  try {
    return parseJson(script.textContent);
  } catch (unusedError) {
    throw new Error('Failed to parse <script> contents. Is it valid JSON?');
  }
}
