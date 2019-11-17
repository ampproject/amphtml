/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {
  getSourceOrigin,
  getSourceUrl,
  parseUrlDeprecated,
  resolveRelativeUrl,
} from '../../../src/url';
import {user, userAssert} from '../../../src/log';

/**
 * @param {*} page
 * @param {string} documentUrl
 */
export function validatePage(page, documentUrl) {
  user().assertString(page.url, 'page url must be a string');

  // Rewrite relative URLs to absolute, relative to the source URL.
  const base = getSourceUrl(documentUrl);
  page.url = resolveRelativeUrl(page.url, base);

  const url = parseUrlDeprecated(page.url);
  const {origin} = parseUrlDeprecated(documentUrl);
  const sourceOrigin = getSourceOrigin(documentUrl);

  userAssert(
    url.origin === origin || url.origin === sourceOrigin,
    'Invalid page URL supplied to amp-next-page, pages must be from the same origin as the current document'
  );
  user().assertString(page.image, 'page image must be a string');
  user().assertString(page.title, 'page title must be a string');

  // Rewrite canonical URLs to cache URLs, when served from the cache.
  if (sourceOrigin !== origin && url.origin === sourceOrigin) {
    page.url =
      `${origin}/c/` +
      (url.protocol === 'https:' ? 's/' : '') +
      encodeURIComponent(url.host) +
      url.pathname +
      (url.search || '') +
      (url.hash || '');
  }
}
