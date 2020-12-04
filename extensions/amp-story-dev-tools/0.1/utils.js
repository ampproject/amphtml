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

import {parseQueryString} from '../../../src/url';

/**
 * Updates the hashString with the dictionary<string, string> passed in
 * @public
 * @param {!Object<string, string>} updates
 * @param {!Window} win
 */
export function updateHash(updates, win) {
  let queryHash = parseQueryString(win.location.hash);
  queryHash = Object.assign(queryHash, updates);
  win.location.hash = Object.entries(queryHash)
    .filter((keyValue) => keyValue[1] != undefined)
    .map((keyValue) => keyValue[0] + '=' + keyValue[1])
    .join('&');
}

/**
 * Deletes the node after the passed timeout.
 * @public
 * @param {!Element} context the mutateElement context
 * @param {!Element} element the element to remove
 * @param {number} timeout time in ms after which the element will be removed
 */
export function removeAfterTimeout(context, element, timeout) {
  setTimeout(() => context.mutateElement(() => element.remove()), timeout);
}

/**
 * Deletes the node after the passed timeout.
 * @public
 * @param {!Element} context the mutateElement context
 * @param {!Element} element the element to remove
 * @param {number} timeout time in ms after which the element will be removed
 * @param {string} attributeName
 * @param {string=} attributeValue
 */
export function addAttributeAfterTimeout(
  context,
  element,
  timeout,
  attributeName,
  attributeValue = ''
) {
  setTimeout(
    () =>
      context.mutateElement(() =>
        element.setAttribute(attributeName, attributeValue)
      ),
    timeout
  );
}
