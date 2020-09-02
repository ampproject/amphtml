/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
export function luckyads(global, data) {
  validateData(data, ['src', 'laBlock']);
  const {src} = data;
  createContainer(global, data);
  loadScript(global, src);
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function createContainer(global, data) {
  const d = global.document.createElement('div');
  d.setAttribute('data-la-block', data['laBlock']);
  global.document.getElementById('c').appendChild(d);
}
