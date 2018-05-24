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

import {loadScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function amoad(global, data) {
  validateData(data, ['sid'], ['adType']);

  let script;
  const attrs = {};
  if (data['adType'] === 'native') {
    script = 'https://j.amoad.com/js/n.js';
    attrs['class'] = 'amoad_native';
    attrs['data-sid'] = data.sid;
  } else {
    script = 'https://j.amoad.com/js/a.js';
    attrs['class'] = `amoad_frame sid_${data.sid} container_div sp`;
  }
  global.amoadOption = {ampData: data};

  const d = global.document.createElement('div');
  Object.keys(attrs).forEach(k => {
    d.setAttribute(k, attrs[k]);
  });
  global.document.getElementById('c').appendChild(d);

  loadScript(global, script);
}
