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

import {hasOwn} from '../src/utils/object';
import {loadScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adincube(global, data) {
  validateData(data, ['adType', 'siteKey'], ['params']);

  let url = global.context.location.protocol;
  url += '//tag.adincube.com/tag/1.0/next?';
  url += 'ad_type=' + encodeURIComponent(String(data['adType']).toUpperCase());
  url += '&ad_subtype=' + encodeURIComponent(data['width']);
  url += 'x' + encodeURIComponent(data['height']);
  url += '&site_key=' + encodeURIComponent(data['siteKey']);
  url += '&r=' + encodeURIComponent(global.context.referrer);
  url += '&h=' + encodeURIComponent(global.context.location.href);
  url += '&c=amp';
  url += '&t=' + Date.now();

  if (data['params']) {
    url += parseParams(data['params']);
  }

  loadScript(global, url);
}

/**
 * @param {string} data
 * @return {string}
 */
function parseParams(data) {
  try {
    const params = JSON.parse(data);
    let queryParams = '';
    for (const p in params) {
      if (hasOwn(params, p)) {
        queryParams += '&' + p + '=' + encodeURIComponent(params[p]);
      }
    }
    return queryParams;
  } catch (e) {
    return '';
  }
}
