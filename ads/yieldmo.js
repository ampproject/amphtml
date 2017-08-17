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

import {loadScript} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yieldmo(global, data) {

  const ymElem = global.document.createElement('div');
  ymElem.id = 'ym_' + data.ymid;
  ymElem.className = 'ym';
  ymElem.dataset['ampEnabled'] = true;
  global.document.getElementById('c').appendChild(ymElem);

  const ymJs = 'https://static.yieldmo.com/ym.amp1.js';

  loadScript(global, ymJs);
}
