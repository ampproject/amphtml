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
export function a9(global, data) {
  // TODO: check mandatory fields
  validateData(data, [], ['aax_size', 'aax_pubname', 'aax_src']);
  /*eslint "google-camelcase/google-camelcase": 0*/
  global.aax_size = data.aax_size;
  global.aax_pubname = data.aax_pubname;
  global.aax_src = data.aax_src;
  writeScript(global, 'https://c.amazon-adsystem.com/aax2/assoc.js');
}
