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

import {createElementWithAttributes} from '../src/dom';
import {loadScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adstir(global, data) {
  // TODO: check mandatory fields
  validateData(data, [], ['appId', 'adSpot']);

  const d = createElementWithAttributes(global.document, 'div', {
    'class': 'adstir-ad-async',
    'data-ver': '4.0',
    'data-app-id': data['appId'],
    'data-ad-spot': data['adSpot'],
    'data-amp': true,
    'data-origin': global.context.location.href,
  });
  global.document.getElementById('c').appendChild(d);

  loadScript(global, 'https://js.ad-stir.com/js/adstir_async.js');
}
