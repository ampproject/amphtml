/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {validateData, validateSrcPrefix, writeScript} from '../3p/3p';

// Valid adform ad source hosts
const hosts = {
  track: 'https://track.adform.net',
  adx: 'https://adx.adform.net',
  a2: 'https://a2.adform.net',
  adx2: 'https://adx2.adform.net',
  asia: 'https://asia.adform.net',
  adx3: 'https://adx3.adform.net',
};

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adform(global, data) {
  validateData(data, [['src', 'bn', 'mid']]);
  global.Adform = {ampData: data};
  const src = data.src;
  const bn = data.bn;
  const mid = data.mid;
  let url;

  // Custom ad url using "data-src" attribute
  if (src) {
    validateSrcPrefix(Object.keys(hosts).map(type => hosts[type]), src);
    url = src;
  }
  // Ad tag using "data-bn" attribute
  else if (bn) {
    url = hosts.track + '/adfscript/?bn=' + encodeURIComponent(bn) + ';msrc=1';
  }
  // Ad placement using "data-mid" attribute
  else if (mid) {
    url = hosts.adx + '/adx/?mid=' + encodeURIComponent(mid);
  }

  writeScript(global, url);
}
