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

import {parseUrlDeprecated} from '../../src/url';
import {setStyles} from '../../src/style';
import {validateData} from '../../3p/3p';

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

  const cb = Math.floor(Math.random() * 10000);
  const domain =
    data.domain || parseUrlDeprecated(global.context.sourceUrl).origin;

  /* Create div for ad to target */
  const playerDiv = global.document.createElement('div');
  playerDiv.id = 'video' + data.id + cb;
  setStyles(playerDiv, {
    width: '100%',
    height: '100%',
  });
  const playerScript = global.document.createElement('script');
  const servingDomain = data.servingDomain
    ? encodeURIComponent(data.servingDomain)
    : 'algovid.com';
  const srcParams = [
    'https://p.' + servingDomain + '/player/player.js',
    '?p=' + encodeURIComponent(data.id),
    '&cb=' + cb,
    '&w=' + encodeURIComponent(data.width),
    '&h=' + encodeURIComponent(data.height),
    data.version ? '&pv=' + encodeURIComponent(data.version) : '',
    data.subid ? '&subid=' + encodeURIComponent(data.subid) : '',
    domain ? '&d=' + encodeURIComponent(domain) : '',
    data.extraParams || '', // already encoded url query string
  ];

  playerScript.onload = () => {
    global.context.renderStart();
  };

  playerScript.src = srcParams.join('');
  playerDiv.appendChild(playerScript);
  global.document.getElementById('c').appendChild(playerDiv);
}
