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

import {validateData} from '../3p/3p';
import {parseUrl} from '../src/url';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function cedato(global, data) {
  validateData(data, ['id'], ['domain', 'servingDomain', 'subid', 'version', 'extraParams']);

  if (!data || !data.id) {
    global.context.noContentAvailable();
    return;
  }

  const cb = (Math.random() * 10000 | 0);
  const domain = data.domain || parseUrl(global.context.sourceUrl).origin || null;

  /* Create div for ad to target */
  const playerDiv = global.document.createElement('div');
  playerDiv.id = 'video' + data.id + cb;
  playerDiv.style = 'width: 100%; height: 100%;';
  const playerScript = global.document.createElement('script');
  const srcParams = [
    'https://p.' + (data.servingDomain || 'algovid.com') + '/player/player.js',
    '?p=' + data.id,
    '&cb=' + cb,
    '&w=' + data.width,
    '&h=' + data.height,
    (data.version ? '&pv=' + data.version : ''),
    (data.subid ? '&subid=' + data.subid : ''),
    (domain ? '&d=' + encodeURIComponent(domain) : ''),
    (data.extraParams || ''),
  ];

  playerScript.onload = () => {
    global.context.renderStart();
  };

  playerScript.src = srcParams.join('');
  playerDiv.appendChild(playerScript);
  global.document.getElementById('c').appendChild(playerDiv);
}
