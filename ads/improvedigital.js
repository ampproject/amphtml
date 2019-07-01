/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {validateData, writeScript} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function improvedigital(global, data) {
  validateData(data, ['placement'], ['width', 'height', 'optin', 'keyvalue']);

  let url =
    'https://ad.360yield.com' +
    '/adj?' +
    'p=' +
    encodeURIComponent(data.placement) +
    '&w=' +
    encodeURIComponent(data.width) +
    '&h=' +
    encodeURIComponent(data.height) +
    '&optin=' +
    encodeURIComponent(data.optin) +
    '&tz=' +
    new Date().getTimezoneOffset();

  const value = data.keyvalue;
  let newData = '';
  const amps = '&';
  let validKey = 0;

  if (value && value.length > 0) {
    const keys = value.split('&');
    for (let i = 0; i < keys.length; i++) {
      if (!keys[i]) {
        continue;
      }
      const segment = keys[i].split('=');
      const segment1 = segment[1] ? encodeURIComponent(segment[1]) : '';
      if (validKey > 0) {
        newData += amps;
      }
      validKey++;
      newData += segment[0] + '=' + segment1;
    }
  }
  if (newData) {
    url += '&' + newData;
  }
  writeScript(global, url);
}
