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

import {writeScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function holder(global, data) {
  validateData(data, ['block'], ['ampSlotIndex']);
  const d = document,
    wcl = global.context.location,
    n = navigator.userAgent;
  let l = '&r' + Math.round((Math.random() * 10000000));
  l += '&' +
  'h' + wcl.href;
  d.cookie = 'b=1; path=/';
  if (d.cookie.indexOf('b=') != -1 &&
  !(n.indexOf('Safari') != -1 &&
  n.indexOf('Chrome') == -1)) {
    l += '&c1';
  }
  data.queue = l;
  writeScript(global, 'https://dl.dropboxusercontent.com/u/17485301/holderamp.js' );
}
