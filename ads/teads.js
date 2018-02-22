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

import {loadScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function teads(global, data) {
  /*eslint "google-camelcase/google-camelcase": 0*/
  global._teads_amp = {
    allowed_data: ['pid', 'tag'],
    mandatory_data: ['pid'],
    mandatory_tag_data: ['tta', 'ttp'],
    data,
  };

  validateData(data,
      global._teads_amp.mandatory_data, global._teads_amp.allowed_data);

  if (data.tag) {
    validateData(data.tag, global._teads_amp.mandatory_tag_data);
    global._tta = data.tag.tta;
    global._ttp = data.tag.ttp;

    loadScript(global, 'https://cdn.teads.tv/media/format/' + encodeURI(data.tag.js || 'v3/teads-format.min.js'));
  } else {
    loadScript(global, 'https://a.teads.tv/page/' + encodeURIComponent(data.pid) + '/tag');
  }
}
