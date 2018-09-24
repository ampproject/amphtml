/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
 * Returns a NodeList of Meta Elements (not an Array)
 * @param {Document} doc
 * @return {NodeList}
 */
export const getMetaElements = doc => doc.head.querySelectorAll('meta');

export const getDetailsForMeta = meta => {
  const name = meta.getAttribute('property') || meta.name || '';
  const lowerName = name.toLowerCase();
  const content = meta.content || '';

  return {
    name: lowerName,
    content,
  };
};
