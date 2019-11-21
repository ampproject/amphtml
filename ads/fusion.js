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
 * @param {string=} input
 * @return {JsonObject|undefined}
 */
function queryParametersToObject(input) {
  if (!input) {
    return undefined;
  }
  return input
    .split('&')
    .filter(_ => _)
    .reduce((obj, val) => {
      const kv = val.split('=');
      return Object.assign(obj, {[kv[0]]: kv[1] || true});
    }, {});
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function fusion(global, data) {
  validateData(
    data,
    [],
    ['mediaZone', 'layout', 'adServer', 'space', 'parameters']
  );

  const container = global.document.getElementById('c');
  const ad = global.document.createElement('div');
  ad.setAttribute('data-fusion-space', data.space);
  container.appendChild(ad);
  const parameters = queryParametersToObject(data.parameters);

  writeScript(
    global,
    'https://assets.adtomafusion.net/fusion/latest/fusion-amp.min.js',
    () => {
      global.Fusion.apply(container, global.Fusion.loadAds(data, parameters));

      global.Fusion.on.warning.run(ev => {
        if (ev.msg === 'Space not present in response.') {
          global.context.noContentAvailable();
        }
      });
    }
  );
}
