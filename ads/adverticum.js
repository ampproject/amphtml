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

import {writeScript} from '../3p/3p';
import {validateData} from '../3p/3p';
import {setStyle} from '../src/style';
/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adverticum(global, data) {
  validateData(data, ['goa3zone'], ['costumetargetstring']);
  const zoneid = 'zone' + data['goa3zone'];
  const d = global.document.createElement('div');

  d.id = zoneid;
  d.classList.add('goAdverticum');

  document.getElementById('c').appendChild(d);
  if (data['costumetargetstring']) {
    const s = global.document.createTextNode(data['costumetargetstring']);
    const v = global.document.createElement('var');
    v.setAttribute('id', 'cT');
    v.setAttribute('class', 'customtarget');
    setStyle(v, 'display', 'none');
    v.appendChild(s);
    document.getElementById(zoneid).appendChild(v);
  }
  writeScript(global, '//ad.adverticum.net/g3.js');

}
