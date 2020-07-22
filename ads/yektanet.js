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
  validateData(data, ['publisherName', 'scriptName', 'posId']);

  const container = document.getElementById('c'),
    adDiv = document.createElement('div');
  adDiv.setAttribute('id', data['posId']);
  container.appendChild(adDiv);

  const now = new Date(),
    version = [
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
    ].join('0');

  loadScript(
    global,
    `https://cdn.yektanet.com/js/${encodeURIComponent(
      data['publisherName']
    )}/${encodeURIComponent(data['scriptName'])}?v=${version}`
  );
}
