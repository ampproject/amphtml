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

import {validateData, validateSrcPrefix, writeScript} from '../3p/3p';

// Valid OnNetwork movie and ad source hosts
const hosts = {
  video: 'https://video.onnetwork.tv',
  cdn: 'https://cdn.onnetwork.tv',
  cdnx: 'https://cdnx.onnetwork.tv',
  vast: 'https://vast.onnetwork.tv',
};

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function onnetwork(global, data) {
  validateData(data, [['src', 'sid', 'mid']]);
  global.onnetwork = {ampData: data};
  const {src, sid, mid} = data;
  let url;

  // Custom movie url using "data-src" attribute
  if (src) {
    validateSrcPrefix(Object.keys(hosts).map(type => hosts[type]), src);
    url = src;
  }
  // Movie tag using "data-sid" attribute
  else if (sid) {
    url = hosts.video + '/embed.php?ampsrc=1&sid=' + encodeURIComponent(sid);
  // Movie placement using "data-mid" attribute
  }
  else if (mid) {
    url = hosts.video + '/embed.php?ampsrc=1&mid=' + encodeURIComponent(mid);
  }

  writeScript(global, url);
}
