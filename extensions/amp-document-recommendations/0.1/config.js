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
 *   recommendations: (!Array<!AmpDocumentRecommendationsReco>|undefined),
 * }}
 */
export let AmpDocumentRecommendationsConfig;

/**
 * @typedef {{
 *   ampUrl: string,
 *   image: string,
 *   title: string,
 * }}
 */
export let AmpDocumentRecommendationsReco;

/**
 * Checks whether the object conforms to the AmpDocumentRecommendationsConfig
 * spec.
 *
 * @param {*} config The config to validate.
 * @param {string} host The host of the current document
 *     (document.location.host). All recommendations must be for the same domain
 *     as the current document so the URL can be updated safely.
 * @return {!./config.AmpDocumentRecommendationsConfig}
 */
export function assertConfig(config, host) {
  user().assert(
      config, 'amp-document-recommendations config must be specified');
  user().assert(
      isArray(config.recommendations), 'recommendations must be an array');
  assertRecos(config.recommendations, host);
  return /** @type {!AmpDocumentRecommendationsConfig} */ (config);
}

function assertRecos(recos, host) {
  recos.forEach(reco => assertReco(reco, host));
}

function assertReco(reco, host) {
  const url = parseUrl(reco.ampUrl);
  user().assert(typeof reco.ampUrl == 'string', 'ampUrl must be a string');
  user().assert(url.host == host,
      'recommendations must be from the same host as the current document');
  user().assert(typeof reco.image == 'string', 'image must be a string');
  user().assert(typeof reco.title == 'string', 'title must be a string');
}
