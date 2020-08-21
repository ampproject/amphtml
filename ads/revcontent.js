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

import {loadScript, validateData, writeScript} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function revcontent(global, data) {
  let endpoint =
    'https://labs-cdn.revcontent.com/build/amphtml/revcontent.amp.min.js';

  if (typeof data.revcontent !== 'undefined') {
    if (typeof data.env === 'undefined') {
      endpoint = 'https://assets.revcontent.com/master/delivery.js';
    } else if (data.env == 'dev') {
      endpoint = 'https://performante.revcontent.dev/delivery.js';
    } else {
      endpoint = 'https://assets.revcontent.com/' + data.env + '/delivery.js';
    }
  }

  const required = ['id', 'height'];
  const optional = [
    'wrapper',
    'subIds',
    'revcontent',
    'env',
    'loadscript',
    'api',
    'key',
    'ssl',
    'adxw',
    'adxh',
    'rows',
    'cols',
    'domain',
    'source',
    'testing',
    'endpoint',
    'publisher',
    'branding',
    'font',
    'css',
    'sizer',
    'debug',
    'ampcreative',
    'gdpr',
    'gdprConsent',
    'usPrivacy'
  ];

  data.endpoint = data.endpoint ? data.endpoint : 'trends.revcontent.com';

  validateData(data, required, optional);
  global.data = data;
  if (data.loadscript) {
    loadScript(window, endpoint);
  } else {
    writeScript(window, endpoint);
  }
}
