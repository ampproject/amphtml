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

import {writeScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function tracdelight(global, data) {
  validateData(data, [], ['widget_id', 'access_key']);
  /*eslint "google-camelcase/google-camelcase": 0*/
  global.widget_id = data.widget_id;
  global.access_key = data.access_key;
  global.mode = data.mode;
  writeScript(global, 'https://localhost:3000/tracdelight-bundle.js');
}
