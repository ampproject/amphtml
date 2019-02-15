/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {parseJson} from '../src/json';
import {validateData, writeScript} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function sas(global, data) {
  let url, adHost;
  const fields = ['site', 'size', 'area'];
  validateData(data, ['customerName'],
      ['adHost', 'site', 'size', 'area', 'mid','tags']);

  if (typeof data.adHost === 'undefined') {
    adHost = encodeURIComponent(data['customerName']) + '-ads.aimatch.com';
  }
  else {
    adHost = encodeURIComponent(data['adHost']);
  }

  url = '//' + adHost + '/' + data['customerName'] + '/jserver';

  for (let idx = 0; idx < fields.length; idx++) {
    if (data[fields[idx]]) {
      if (typeof data[fields[idx]] !== 'undefined') {
        url += '/' + fields[idx] + '=' + encodeURIComponent(data[fields[idx]]);
      }
    }
  }

  if (typeof data.tags !== 'undefined') {
    const tags = parseJson(data.tags);
    for (const tag in tags) {
      url += '/' + tag + '=' + encodeURIComponent(tags[tag]);
    }
  }
  writeScript(global, url, () => {
    global.context.renderStart();
  });
}
