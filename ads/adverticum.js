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

import {createElementWithAttributes} from '../src/dom';
import {setStyle} from '../src/style';
import {validateData, writeScript} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adverticum(global, data) {
  validateData(data, ['goa3zone'], ['costumetargetstring']);
  const zoneid = 'zone' + data['goa3zone'];
  const d = createElementWithAttributes(global.document, 'div', {
    'id': zoneid,
    'class': 'goAdverticum',
  });

  document.getElementById('c').appendChild(d);
  if (data['costumetargetstring']) {
    const v = createElementWithAttributes(global.document, 'var', {
      'id': 'cT',
      'class': 'customtarget',
    });
    setStyle(v, 'display', 'none');
    v.data = data['costumetargetstring'];
    document.getElementById(d).appendChild(v);
  }
  writeScript(global, '//ad.adverticum.net/g3.js');
}
