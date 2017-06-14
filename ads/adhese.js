/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {writeScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adhese(global, data) {
  validateData(data, ['location','format', 'account', 'requestType']);
  let targetParam = '';
  if (data['targeting']) {
    const targetList = data['targeting'];
    for (const category in targetList) {
      targetParam += encodeURIComponent(category);
      const targets = targetList[category];
      for (let x = 0; x < targets.length; x++) {
        targetParam += encodeURIComponent(targets[x]) +
            (targets.length - 1 > x ? ';' : '');
      }
      targetParam += '/';
    }
  }
  targetParam += '?t=' + Date.now();
  writeScript(window, 'https://ads-' + encodeURIComponent(data['account']) +
      '.adhese.com/' + encodeURIComponent(data['requestType']) + '/sl' +
      encodeURIComponent(data['location']) +
      encodeURIComponent(data['position']) + '-' +
      encodeURIComponent(data['format']) + '/' + targetParam);
  const co = global.document.querySelector('#c');
  co.width = data['width'];
  co.height = data['height'];
  co.addEventListener('adhLoaded', getAdInfo, false);
}

/**
 * @param {!Object} e
 */
function getAdInfo(e) {
  if (e.detail.isReady && e.detail.width == e.target.width &&
      e.detail.height == e.target.height) {
    global.context.renderStart();
  } else if (e.detail.isReady && (e.detail.width != e.target.width ||
      e.detail.width != e.target.width)) {
    global.context.renderStart({width: e.detail.width,
      height: e.detail.height});
  } else {
    global.context.noContentAvailable();
  }
}
