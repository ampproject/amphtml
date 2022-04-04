import {user, userAssert} from '#utils/log';

import {
  getSourceOrigin,
  getSourceUrl,
  parseUrlDeprecated,
  resolveRelativeUrl,
} from '../../../src/url';

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
