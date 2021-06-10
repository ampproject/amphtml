/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {devAssertElement} from './assert';

/**
 * Whether the tag is an internal (service) AMP tag.
 * @param {!Element|string} tag
 * @return {boolean}
 */
function isInternalElement(tag) {
  const tagName = typeof tag == 'string' ? tag : tag.tagName;
  return !!(tagName && tagName.toLowerCase().startsWith('i-'));
}

/**
 * Returns "true" for internal AMP nodes or for placeholder elements.
 * @param {!Node} node
 * @return {boolean}
 */
export function isInternalOrServiceNode(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }
  node = devAssertElement(node);

  if (isInternalElement(node)) {
    return true;
  }
  if (
    node.tagName &&
    (node.hasAttribute('placeholder') ||
      node.hasAttribute('fallback') ||
      node.hasAttribute('overflow'))
  ) {
    return true;
  }
  return false;
}
