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
export function adreactor(global, data) {
  // TODO: check mandatory fields
  validateData(data, [], ['zid', 'pid', 'custom3']);
  const url =
    'https://adserver.adreactor.com' +
    '/servlet/view/banner/javascript/zone?' +
    'zid=' +
    encodeURIComponent(data.zid) +
    '&pid=' +
    encodeURIComponent(data.pid) +
    '&custom3=' +
    encodeURIComponent(data.custom3) +
    '&random=' +
    Math.floor(89999999 * Math.random() + 10000000) +
    '&millis=' +
    Date.now();
  writeScript(global, url);
}
