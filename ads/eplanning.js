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

import {loadScript, validateDataExists} from '../src/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function eplanning(global, data) {
  validateDataExists(data, [
    'epl_sI', 'epl_isV', 'epl_sV', 'epl_sec', 'epl_kVs', 'epl_e',
  ]);
  // push the two object into the '_eplanning' global
  (global._eplanning = global._eplanning || []).push({
    sI: data.epl_sI,
    isV: data.epl_isV,
    sV: data.epl_sV,
    sec: data.epl_sec,
    kVs: data.epl_kVs,
    e: data.epl_e,
  });
  loadScript(global, 'https://us.img.e-planning.net/layers/epl-amp.js');
}
