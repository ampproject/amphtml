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
export function adbutler(global,data) {
  validateData(
    data,
    ['account', 'zone', 'width', 'height'],
    ['keyword', 'place']
  );

  data['place'] = data['place'] || 0;

  const placeholderID = 'placement_' + data['zone'] + '_' + data['place'];

  // placeholder div
  const d = global.document.createElement('div');
  d.setAttribute('id', placeholderID);
  global.document.getElementById('c').appendChild(d);

  global.AdButler = global.AdButler || {};
  global.AdButler.ads = global.AdButler.ads || [];

  global.AdButler.ads.push({
    handler(opt) {
      global.AdButler.register(
          data['account'],
          data['zone'],
          [data['width'], data['height']],
          placeholderID,
          opt
      );
    },
    opt: {
      place: data['place'],
      pageKey: global.context.pageViewId,
      keywords: data['keyword'],
      domain: 'servedbyadbutler.com',
      click: 'CLICK_MACRO_PLACEHOLDER',
    },
  });
  loadScript(global, 'https://servedbyadbutler.com/app.js');
}
