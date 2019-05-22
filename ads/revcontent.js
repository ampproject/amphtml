/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
export function revcontent(global, data) {
  const endpoint =
    'https://labs-cdn.revcontent.com/build/amphtml/revcontent.amp.min.js';
  const required = ['id', 'width', 'height', 'wrapper'];
  const optional = [
    'api',
    'key',
    'ssl',
    'adxw',
    'adxh',
    'rows',
    'cols',
    'domain',
    'source',
    'testing',
    'endpoint',
    'publisher',
    'branding',
    'font',
    'css',
    'sizer',
    'debug',
    'ampcreative',
  ];

  validateData(data, required, optional);
  global.data = data;
  writeScript(window, endpoint);
}
