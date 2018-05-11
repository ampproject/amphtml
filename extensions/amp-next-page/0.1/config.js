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

import {isArray} from '../../../src/types';
import {parseUrl} from '../../../src/url';
import {user} from '../../../src/log';

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
 * @param {*} config The config to validate.
 * @param {string} origin The origin of the current document
 *     (document.location.origin). All recommendations must be for the same
 *     origin as the current document so the URL can be updated safely.
 * @param {string=} sourceOrigin The source origin for the current document, if
 *     the current document is being served from the cache. Any recommendations
 *     pointing at {@code sourceOrigin} will be modified to point to the cache.
 * @return {!AmpNextPageConfig}
 */
export function assertConfig(config, origin, sourceOrigin) {
  user().assert(config, 'amp-next-page config must be specified');
  user().assert(isArray(config.pages), 'pages must be an array');
  assertRecos(config.pages, origin, sourceOrigin);

  if ('hideSelectors' in config) {
    user().assert(isArray(config['hideSelectors']),
        'amp-next-page hideSelectors should be an array');
    assertSelectors(config['hideSelectors']);
  }

  return /** @type {!AmpNextPageConfig} */ (config);
}

function assertRecos(recos, origin, sourceOrigin) {
  recos.forEach(reco => assertReco(reco, origin, sourceOrigin));
}

const BANNED_SELECTOR_PATTERNS = [
  /(^|\W)i-amphtml-/,
];

function assertSelectors(selectors) {
  selectors.forEach(selector => {
    BANNED_SELECTOR_PATTERNS.forEach(pattern => {
      user().assertString(selector,
          `amp-next-page hideSelector value ${selector} is not a string`);
      user().assert(!pattern.test(selector),
          `amp-next-page hideSelector '${selector}' not allowed`);
    });
  });
}

function assertReco(reco, origin, sourceOrigin) {
  const url = parseUrl(reco.ampUrl);
  user().assertString(reco.ampUrl, 'ampUrl must be a string');
  user().assert(url.origin === origin || url.origin === sourceOrigin,
      'pages must be from the same origin as the current document');
  user().assertString(reco.image, 'image must be a string');
  user().assertString(reco.title, 'title must be a string');

  if (sourceOrigin) {
    reco.ampUrl = reco.ampUrl.replace(url.origin, origin);
  }
}
