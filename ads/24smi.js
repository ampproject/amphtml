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

import {createElementWithAttributes} from '../src/dom';
import {loadScript, validateData, validateSrcPrefix} from '../3p/3p';

const jsnPrefix = 'https://jsn.24smi.net/';

/**
 * @param {!Document} document
 * @param {string} src
 */
function createContainer(document, src) {
  const parts = src.split('/');
  const blockId = parts[parts.length - 1].split('.')[0];

  const d = createElementWithAttributes(document, 'div', {
    'id': `smi_teaser_${blockId}`,
  });
  document.getElementById('c').appendChild(d);
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function _24smi(global, data) {
  validateData(data, ['src']);
  const {src} = data;
  validateSrcPrefix(jsnPrefix, src);

  createContainer(global.document, src);
  loadScript(global, src);
}
