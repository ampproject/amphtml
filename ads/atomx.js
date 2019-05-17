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

import {validateData, writeScript} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function atomx(global, data) {
  const optionals = ['click', 'uv1', 'uv2', 'uv3', 'context'];

  validateData(data, ['id'], optionals);

  const args = [
    'size=' + data.width + 'x' + data.height,
    'id=' + encodeURIComponent(data.id),
  ];

  for (let i = 0; i < optionals.length; i++) {
    const optional = optionals[i];
    if (optional in data) {
      args.push(optional + '=' + encodeURIComponent(data[optional]));
    }
  }

  writeScript(global, 'https://s.ato.mx/p.js#' + args.join('&'));
}
