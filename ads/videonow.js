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
export function videonow(global, data) {
  /*eslint "google-camelcase/google-camelcase": 0*/
  global._videonow_amp = {
    allowed_data: ['pid', 'type', 'src'],
    mandatory_data: ['pid'],
    data,
  };

  validateData(data,
      global._videonow_amp.mandatory_data, global._videonow_amp.allowed_data);

  const profileId = data.pid || 1;
  const type = data.type || 'prod';

  const protocol = global.location && global.location.protocol || 'https:';
  // production version by default
  let script = (data.src && decodeURI(data.src)) || (protocol +
      '//static.videonow.ru/dev/vn_init_module.js?profileId=' + profileId);

  if (type === 'local') {
    script = protocol + '//localhost:8085/vn_init.js?profileId=' +
        profileId + '&url=' +
        encodeURIComponent(protocol + '//localhost:8085/init');
  } else if (type === 'dev') {
    // this part can be changed late
    script = protocol +
        '//static.videonow.ru/dev/vn_init_module.js?profileId=' +
        profileId + '&url=' +
        encodeURIComponent(protocol + '//data.videonow.ru/?init');
  }

  loadScript(global, script);
}
