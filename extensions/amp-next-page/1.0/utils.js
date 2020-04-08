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
 * @param {string} url
 * @param {string} hostUrl
 * @return {!Location}
 */
export function validateUrl(url, hostUrl) {
  const parsedUrl = parseUrlDeprecated(url);
  const {origin} = parseUrlDeprecated(hostUrl);
  const sourceOrigin = getSourceOrigin(hostUrl);

  userAssert(
    parsedUrl.origin === origin || parsedUrl.origin === sourceOrigin,
    'Invalid page URL supplied to amp-next-page, pages must be from the same origin as the current document'
  );

  return parsedUrl;
}

/**
 * @param {!./page.PageMeta} page
 * @param {string} hostUrl
 */
export function validatePage(page, hostUrl) {
  user().assertString(page.url, 'page url must be a string');

  const base = getSourceUrl(hostUrl);
  const {origin} = parseUrlDeprecated(hostUrl);
  page.url = resolveRelativeUrl(page.url, base);

  const url = validateUrl(page.url, hostUrl);
  user().assertString(page.image, 'page image must be a string');
  user().assertString(page.title, 'page title must be a string');

  const sourceOrigin = getSourceOrigin(hostUrl);

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
