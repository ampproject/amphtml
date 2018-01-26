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

import {user} from '../../../src/log';
import {isArray} from '../../../src/types';

/**
 * @typedef {{
 *   recommendations: (!Array<!AmpDocumentRecommendationsReco>|undefined),
 * }}
 */
export let AmpDocumentRecommendationsConfig;


/**
 * @typedef {{
 *   ampUrl: !string,
 *   image: !string,
 *   title: !string,
 * }}
 */
export let AmpDocumentRecommendationsReco;


/**
 * Checks whether the object conforms to the AmpDocumentRecommendationsConfig spec.
 * 
 * @param {*} config The config to validate.
 * @return {!./config.AmpDocumentRecommendationsConfig}
 */
export function assertConfig(config) {
  user().assert(config);
  user().assert(isArray(config.recommendations));
  assertRecos(config.recommendations);
  return /** @type {!AmpDocumentRecommendationsConfig} */ (config);
}

function assertRecos(recos) {
  recos.forEach(reco => assertReco(reco));
}

function assertReco(reco) {
  user().assert(
      typeof reco.ampUrl == 'string',
      'ampUrl must be a string');
  user().assert(
      typeof reco.image == 'string',
      'image must be a string');
  user().assert(
      typeof reco.title == 'string',
      'title must be a string');
}