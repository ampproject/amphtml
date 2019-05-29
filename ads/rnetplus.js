/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {loadScript, validateData, validateSrcPrefix} from '../3p/3p';

const jsnPrefix = 'https://api.rnet.plus/';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function rnetplus(global, data) {
  validateData(data, ['src']);
  const {src} = data;
  validateSrcPrefix(jsnPrefix, src);
  createContainer(global, 'rnetplus_' + getBlockId(src));
  loadScript(global, src);
}

/**
 * @param {!Window} global
 * @param {string} renderTo
 */
function createContainer(global, renderTo) {
  const d = global.document.createElement('div');
  d.id = renderTo;
  global.document.getElementById('c').appendChild(d);
}

/**
 * @param {string} src
 * @return {string}
 */
function getBlockId(src) {
  const parts = src.split('?');
  const vars = parts[1].split('&');
  for (let j = 0; j < vars.length; ++j) {
    const pair = vars[j].split('=');
    if (pair[0] == 'blockId') {
      return pair[1];
    }
  }
  return '660';
}
