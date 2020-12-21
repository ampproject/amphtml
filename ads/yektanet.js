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

import {loadScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yektanet(global, data) {
  validateData(data, ['publisherName', 'scriptName', 'posId'], ['adType']);

  const isBanner = data['adType'] === 'banner';

  const container = document.getElementById('c');
  const adDiv = document.createElement('div');
  adDiv.setAttribute('id', data['posId']);
  if (isBanner) {
    adDiv.setAttribute('class', 'yn-bnr');
  }
  container.appendChild(adDiv);

  const now = new Date();
  const version = [
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
  ].join('0');

  const scriptSrc = isBanner
    ? 'https://cdn.yektanet.com/template/bnrs/yn_bnr.min.js'
    : `https://cdn.yektanet.com/js/${encodeURIComponent(
        data['publisherName']
      )}/${encodeURIComponent(data['scriptName'])}`;

  loadScript(global, `${scriptSrc}?v=${version}`);
}
