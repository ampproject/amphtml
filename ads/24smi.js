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
const smiJs = `${jsnPrefix}smi.js`;

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function _24smi(global, data) {
  validateData(data, [['blockid', 'src']]);
  const {src} = data;
  let blockId = data['blockid'];

  if (!blockId) {
    validateSrcPrefix(jsnPrefix, src);
    blockId = getBlockId(src);
  }

  const element = createContainer(global);
  (global.smiq = global.smiq || []).push({
    element,
    blockId,
  });
  loadScript(global, smiJs);
}

/**
 * @param {!Window} global
 * @return {Element}
 */
function createContainer(global) {
  const d = global.document.createElement('div');
  global.document.getElementById('c').appendChild(d);
  return d;
}

/**
 * @param {string} src
 * @return {string}
 */
function getBlockId(src) {
  const parts = src.split('/');
  return parts[parts.length - 1].split('.')[0];
}
