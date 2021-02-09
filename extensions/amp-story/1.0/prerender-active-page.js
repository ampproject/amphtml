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

import {escapeCssSelectorIdent} from '../../../src/css';
import {parseQueryString} from '../../../src/url';
import {toWin} from '../../../src/types';

/**
 * Returns true if the page should be prerendered (for being an active page or
 * first page).
 * @param {!AmpElement} pageElement
 * @return {boolean}
 */
export function isPrerenderActivePage(pageElement) {
  const win = toWin(pageElement.ownerDocument.defaultView);
  const hashId = parseQueryString(win.location.href)['page'];
  let selector = 'amp-story-page:first-of-type';
  if (hashId) {
    selector += `, amp-story-page#${escapeCssSelectorIdent(hashId)}`;
  }
  const selectorNodes = win.document.querySelectorAll(selector);
  return selectorNodes[selectorNodes.length - 1] === pageElement;
}
