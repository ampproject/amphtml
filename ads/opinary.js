/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
export function opinary(global, data) {
  validateData(data, ['client']);

  const div = global.document.createElement('div');
  div.setAttribute('id', 'opinary-automation-placeholder');
  global.document.getElementById('c').appendChild(div);

  if (!document.querySelector('link[rel=\'canonical\']')) {
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = global.context.canonicalUrl;
    global.document.head.appendChild(link);
  }

  const url = `https://widgets.opinary.com/a/${data.client}.js`;

  loadScript(global, url);
}
