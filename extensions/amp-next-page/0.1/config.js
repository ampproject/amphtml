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

import {Services} from '../../../src/services';
import {
  getSourceOrigin,
  getSourceUrl,
  resolveRelativeUrl,
} from '../../../src/url';
import {isArray} from '../../../src/types';
import {user, userAssert} from '../../../src/log';

const ADSENSE_REC_ORIGIN = 'https://googleads.g.doubleclick.net';

/**
 * @typedef {{
 *   pages: !Array<!AmpNextPageItem>,
 *   hideSelectors: (!Array<string>|undefined)
 * }}
 */
export let AmpNextPageConfig;

/**
 * @typedef {{
 *   ampUrl: string,
 *   image: string,
 *   title: string,
 * }}
 */
export let AmpNextPageItem;

/**
 * Checks whether the object conforms to the AmpNextPageConfig spec.
 * @param {!Element} context
 * @param {*} config The config to validate.
 * @param {string} documentUrl URL of the currently active document, i.e.
 *     context.getAmpDoc().getUrl()
 * @return {!AmpNextPageConfig}
 */
export function assertConfig(context, config, documentUrl) {
  userAssert(config, 'amp-next-page config must be specified');
  userAssert(isArray(config.pages), 'pages must be an array');
  assertRecos(context, config.pages, documentUrl);

  if ('hideSelectors' in config) {
    userAssert(
      isArray(config['hideSelectors']),
      'amp-next-page hideSelectors should be an array'
    );
    assertSelectors(config['hideSelectors']);
  }

  return /** @type {!AmpNextPageConfig} */ (config);
}

/**
 * @param {!Element} context
 * @param {!Array<*>} recos
 * @param {string} documentUrl
 */
function assertRecos(context, recos, documentUrl) {
  recos.forEach(reco => assertReco(context, reco, documentUrl));
}

const BANNED_SELECTOR_PATTERNS = [/(^|\W)i-amphtml-/];

/**
 * Asserts for valid selectors.
 *
 * @param {!Array<string>} selectors
 */
function assertSelectors(selectors) {
  selectors.forEach(selector => {
    BANNED_SELECTOR_PATTERNS.forEach(pattern => {
      user().assertString(
        selector,
        'amp-next-page hideSelector value should be a string'
      );
      userAssert(
        !pattern.test(selector),
        'amp-next-page hideSelector %s not allowed',
        selector
      );
    });
  });
}

/**
 * @param {!Element} context
 * @param {*} reco
 * @param {string} documentUrl
 */
function assertReco(context, reco, documentUrl) {
  user().assertString(reco.ampUrl, 'ampUrl must be a string');

  // Rewrite relative URLs to absolute, relative to the source URL.
  const base = getSourceUrl(documentUrl);
  reco.ampUrl = resolveRelativeUrl(reco.ampUrl, base);

  const urlService = Services.urlForDoc(context);
  const url = urlService.parse(reco.ampUrl);
  const {origin} = urlService.parse(documentUrl);
  const sourceOrigin = getSourceOrigin(documentUrl);

  userAssert(
    url.origin === origin ||
      url.origin === sourceOrigin ||
      isValidAdSenseURL(context, url, origin),
    'pages must be from the same origin as the current document'
  );
  user().assertString(reco.image, 'image must be a string');
  user().assertString(reco.title, 'title must be a string');

  // Rewrite canonical URLs to cache URLs, when served from the cache.
  if (sourceOrigin !== origin && url.origin === sourceOrigin) {
    reco.ampUrl =
      `${origin}/c/` +
      (url.protocol === 'https:' ? 's/' : '') +
      encodeURIComponent(url.host) +
      url.pathname +
      (url.search || '') +
      (url.hash || '');
  }
}

/**
 * @param {!Element} context
 * @param {!Location} url
 * @param {string} origin
 * @return {boolean}
 */
function isValidAdSenseURL(context, url, origin) {
  const matches = url.search.match(/adurl=(.*)(?:&|$)/);
  if (!matches) {
    return false;
  }
  const urlService = Services.urlForDoc(context);
  const targetUrl = urlService.parse(matches[1]);
  return url.origin === ADSENSE_REC_ORIGIN && targetUrl.origin === origin;
}
