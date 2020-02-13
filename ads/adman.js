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

import {validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adman(global, data) {
  validateData(data, ['ws', 'host', 's'], []);

  const script = global.document.createElement('script');
  script.setAttribute('data-ws', data.ws);
  script.setAttribute('data-h', data.host);
  script.setAttribute('data-s', data.s);
  script.setAttribute('data-tech', 'amp');

  script.src = 'https://static.adman.gr/adman.js';

  global.document.body.appendChild(script);
}
