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
  const mandatoryAttributes = ['pid', 'width', 'height'];
  const optionalAttributes = ['kind', 'src'];

  validateData(data, mandatoryAttributes, optionalAttributes);

  const profileId = data.pid || 1;
  const kind = data.type || 'prod';

  // production version by default
  let script =
    (data.src && decodeURI(data.src)) ||
    'https://static.videonow.ru/vn_init.js' + '?amp=1&profileId=' + profileId;

  if (kind === 'local') {
    script =
      'https://localhost:8085/vn_init.js?amp=1' +
      '?profileId=' +
      profileId +
      '&url=' +
      encodeURIComponent('https://localhost:8085/init');
  } else if (kind === 'dev') {
    script =
      'https://static.videonow.ru/dev/vn_init_module.js' +
      '?amp=1&profileId=' +
      profileId +
      '&url=' +
      encodeURIComponent('https://data.videonow.ru/?init');
  }

  loadScript(global, script);
}
