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
export function adgeneration(global, data) {
  validateData(data, ['id'], ['targetid', 'displayid', 'adtype', 'option']);

  // URL encoding
  const option = data.option ? encodeQueryValue(data.option) : null;

  const url =
    'https://i.socdm.com/sdk/js/adg-script-loader.js?' +
    'id=' +
    encodeURIComponent(data.id) +
    '&width=' +
    encodeURIComponent(data.width) +
    '&height=' +
    encodeURIComponent(data.height) +
    '&async=true' +
    '&adType=' +
    validateAdType(data.adType) +
    '&displayid=' +
    (data.displayid ? encodeURIComponent(data.displayid) : '1') +
    '&tagver=2.0.0' +
    (data.targetid ? '&targetID=' + encodeURIComponent(data.targetid) : '') +
    (option ? '&' + option : '');
  writeScript(global, url);
}

/**
 * URL encoding of query string
 * @param {string} str
 * @return {string}
 */
function encodeQueryValue(str) {
  return str
    .split('&')
    .map(v => {
      const key = v.split('=')[0],
        val = v.split('=')[1];
      return encodeURIComponent(key) + '=' + encodeURIComponent(val);
    })
    .join('&');
}
/**
 * If adtype is "RECTANGLE", replace it with "RECT"
 * @param {string} str
 * @return {string}
 */
function validateAdType(str) {
  if (str != null) {
    const upperStr = encodeURIComponent(str.toUpperCase());
    if (upperStr === 'RECTANGLE') {
      return 'RECT';
    } else {
      return upperStr;
    }
  }
  return 'FREE';
}
