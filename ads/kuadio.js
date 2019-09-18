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

import {loadScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function kuadio(global, data) {
  validateData(
    data,
    ['widgetId'],
    ['region', 'baseUrl', 'betaMode', 'debugMode', 'fastParse', 'ref']
  );

  global._pvmax = {
    region: data.region,
    baseUrl: data.baseUrl,
    betaMode: data.betaMode === 'true',
    debugMode: data.debugMode === 'true',
    fastParse: data.fastParse !== 'false',
  };

  const e = global.document.createElement('div');
  e.className = '_pvmax_recommend';
  e.setAttribute('data-widget-id', data.widgetId);
  e.setAttribute('data-ref', data.ref || global.context.canonicalUrl);
  global.document.getElementById('c').appendChild(e);

  loadScript(global, 'https://api.pvmax.net/v1.0/pvmax.js');
}
