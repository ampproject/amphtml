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

import {validateData, writeScript} from '../../3p/3p';

const mandatoryFields = ['adType'];

const adUrl = 'https://www.myfinance.com/amp/ad';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function myfinance(global, data) {
  validateData(data, mandatoryFields);
  if (!data['mf_referrer']) {
    data['mf_referrer'] =
      global.context.canonicalUrl || global.context.sourceUrl;
  }
  const url = buildUrl(data);
  global.MF_AMP_DATA = data;
  writeScript(global, url);
}

/**
 * Generates the url to call for the script content
 * @param {!Object} data
 * @return {string}
 */
function buildUrl(data) {
  const url = new URL(adUrl);
  Object.entries(data).forEach((entry) =>
    url.searchParams.set(entry[0], entry[1])
  );
  return url.toString();
}
