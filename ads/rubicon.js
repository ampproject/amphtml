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

import {getSourceUrl} from '../src/url';
import {validateData, writeScript} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function rubicon(global, data) {
  // TODO: check mandatory fields
  validateData(data, [], [
    'account', 'site', 'zone', 'size',
    'kw', 'visitor', 'inventory',
    'method', 'callback',
  ]);

  if (data.method === 'smartTag') {
    smartTag(global, data);
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function smartTag(global, data) {
  const pageURL = getSourceUrl(context.location.href);
  /* eslint-disable */
  global.rp_account = data.account;
  global.rp_site = data.site;
  global.rp_zonesize = data.zone + '-' + data.size;
  global.rp_adtype = 'js';
  global.rp_page = pageURL;
  global.rp_kw = data.kw;
  global.rp_visitor = data.visitor;
  global.rp_inventory = data.inventory;
  global.rp_amp = 'st';
  global.rp_callback = data.callback;
  /* eslint-enable */
  writeScript(global, 'https://ads.rubiconproject.com/ad/'
      + encodeURIComponent(data.account) + '.js');
}
