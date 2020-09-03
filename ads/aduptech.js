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

import {loadScript, validateData} from '../3p/3p';

/**
 * ID for the html container
 *
 * @const {string}
 */
export const ADUPTECH_ELEMENT_ID = 'aduptech';

/**
 * URL to the AdUp Technology javascript api
 *
 * @const {string}
 */
export const ADUPTECH_API_URL = 'https://s.d.adup-tech.com/jsapi';

/**
 * Logic for the AdUp Technology amp-ad tag
 *
 * @param {!Window} global
 * @param {!Object} data
 */
export function aduptech(global, data) {
  const {context, document} = global;

  validateData(
    data,
    ['placementkey'],
    ['mincpc', 'query', 'pageurl', 'gdpr', 'gdpr_consent', 'adtest']
  );

  // add id attriubte to container
  document.getElementById('c').setAttribute('id', ADUPTECH_ELEMENT_ID);

  // init api options
  const options = {
    amp: true,
    responsive: true,
    placementkey: data.placementkey,
    onAds: () => context.renderStart(),
    onNoAds: () => context.noContentAvailable(),
  };

  if ('mincpc' in data) {
    options.mincpc = data.mincpc;
  }

  if ('query' in data) {
    options.query = data.query;
  }

  if ('adtest' in data) {
    options.adtest = data.adtest;
  }

  if ('pageurl' in data) {
    options.pageurl = data.pageurl;
  } else if (context.sourceUrl) {
    options.pageurl = context.sourceUrl;
  } else if (context.location && context.location.href) {
    options.pageurl = context.location.href;
  }

  if ('gdpr' in data) {
    options.gdpr = data.gdpr;
  }

  // prefer consent string from consentSharedData (if defined)
  // otherwise use consent string from optional tag attribute
  if (
    context.consentSharedData !== null &&
    typeof context.consentSharedData === 'object' &&
    context.consentSharedData.consentString &&
    context.consentSharedData.consentString !== ''
  ) {
    // eslint-disable-next-line google-camelcase/google-camelcase
    options.gdpr_consent = context.consentSharedData.consentString;
  } else if ('gdpr_consent' in data) {
    // eslint-disable-next-line google-camelcase/google-camelcase
    options.gdpr_consent = data.gdpr_consent;
  }

  // load api and embed ads iframe
  loadScript(global, ADUPTECH_API_URL, () =>
    global.uAd.embed(ADUPTECH_ELEMENT_ID, options)
  );
}
