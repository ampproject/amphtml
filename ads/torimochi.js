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

import {parseJson} from '../src/json';
import {validateData, writeScript} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function torimochi(global, data) {

  validateData(data, ['area', 'adtype']);

  if (data.width < global.width) {
    global.width = data.width;
  }
  global.height = data.height;
  global.area = data['area'];
  global.adtype = data['adtype'];
  global.tcid = data['tcid'];
  global.wid = data['wid'];
  global.extra = parseJson(data['extra'] || '{}');
  global.context.renderStart({width: global.width, height: global.height});

  const url = 'https://asset.torimochi-ad.net/js/torimochi_ad_amp.min.js?v=' + Date.now();

  writeScript(global, url);
}
