/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function aja(global, data) {

  validateData(data, ['sspCode']);

  (global._aja = global._aja || {
    sspCode: data['sspCode'],
  });

  const elStyle = global.document.createElement('iframe');
  elStyle.setAttribute('id', 'adframe');
  elStyle.setAttribute('width', data.width);
  elStyle.setAttribute('height', data.height);
  elStyle.setAttribute('frameborder', '0');
  elStyle.setAttribute('marginheight', '0');
  elStyle.setAttribute('marginwidth', '0');
  elStyle.setAttribute('allowfullscreen', 'true');
  elStyle.setAttribute('scrolling', 'no');
  elStyle.setAttribute('sandbox', 'allow-same-origin allow-top-navigation allow-scripts allow-popups');
  elStyle.setAttribute('position', 'absolute');
  elStyle.src = 'https://static.aja-recommend.com/html/amp.html?ssp_code=' + encodeURIComponent(data['sspCode']);
  global.document.body.appendChild(elStyle);

}
