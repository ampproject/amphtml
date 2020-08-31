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
export function ppstudio(global, data) {
  validateData(data, ['crid', 'width', 'height', 'holderScript'], []);

  global._ppstudio = {
    crid: data.crid,
    width: data.width,
    height: data.height,
    holderScript: data.holderScript,
  };

  const e = global.document.createElement('script');
  e.id = 'pps-script-' + data.crid;
  e.setAttribute('data-width', data.width);
  e.setAttribute('data-height', data.height);
  e.setAttribute('data-click-url', '');
  e.src = data.holderScript;
  global.document.getElementById('c').appendChild(e);

  const i = global.document.createElement('ins');
  i.classList.add('ppstudio');
  i.setAttribute('data-pps-target-id', 'cr-' + data.crid);
  global.document.getElementById('c').appendChild(i);

  loadScript(global, 'https://ads-cdn.tenmax.io/code/ppstudio.js', () => {
    global.context.renderStart();
  });
}
