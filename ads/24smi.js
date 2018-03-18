/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

const jsnPrefix = 'https://jsn.24smi.net/';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function _24smi(global, data) {
  validateData(data, ['src']);
  const src = data.src;
  validateSrcPrefix(jsnPrefix, src);

  createContainer(global, getBlockId(src));
  loadScript(global, src);
}

/**
 * @param {!Window} global
 * @param {string} blockId
 */
function createContainer(global, blockId) {
  const d = global.document.createElement('div');
  d.id = `smi_teaser_${blockId}`;
  global.document.getElementById('c').appendChild(d);
}

/**
 * @param {string} src
 */
function getBlockId(src) {
  const parts = src.split('/');
  return parts[parts.length - 1].split('.')[0];
}
