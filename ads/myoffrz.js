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

import {validateData, writeScript} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function myoffrz(global, data) {
  validateData(data, ['config'], ['script']);
  global.config = data.config;
  global.sourceUrl = global.context.sourceUrl;

  // create an expected placeholder
  const d = global.document.createElement('div');
  d.setAttribute('id', 'myoffrz');
  global.document.getElementById('c').appendChild(d);

  writeScript(global, data.script || 'https://cdn.myoffrz.io/amp/script.js');
}
