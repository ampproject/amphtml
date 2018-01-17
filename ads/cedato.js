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
import {setStyles} from '../src/style';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function cedato(global, data) {
  const requiredParams = ['id'];
  const optionalParams = [
    'domain',
    'servingDomain',
    'subid',
    'version',
    'extraParams',
  ];
  validateData(data, requiredParams, optionalParams);

  if (!data || !data.id) {
    global.context.noContentAvailable();
    return;
  }

  const cb = (Math.random() * 10000 | 0);
  const domain = data.domain || parseUrl(global.context.sourceUrl).origin;

  /* Create div for ad to target */
  const playerDiv = global.document.createElement('div');
  playerDiv.id = 'video' + data.id + cb;
  setStyles(playerDiv, {
    width: '100%',
    height: '100%',
  });
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
