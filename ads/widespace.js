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
export function widespace(global, data) {
  const WS_AMP_CODE_VER = '1.0.1';
  // Optional demography parameters.
  let demo = [];

  demo = ['Gender', 'Country', 'Region', 'City', 'Postal', 'Yob'].map(d => {
    return 'demo' + d;
  });

  validateData(data, ['sid'], demo);

  const url =
    'https://engine.widespace.com/map/engine/dynamic?isamp=1' +
    '&ampver=' +
    WS_AMP_CODE_VER +
    '&#sid=' +
    encodeURIComponent(data.sid);

  writeScript(global, url);
}
