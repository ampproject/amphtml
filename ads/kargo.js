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

import {loadScript, checkData, validateDataExists} from '../3p/3p';

const dataKeys = ['site', 'slot', 'options'];
const requiredDataKeys = ['site', 'slot'];

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function kargo(global, data) {
  /*eslint "google-camelcase/google-camelcase": 0*/

  // validate incoming data
  checkData(data, dataKeys);
  validateDataExists(data, requiredDataKeys);

  // get master amp-ad window
  const top = global.context.master;

  // Kargo AdTag url
  const kargoScriptUrl = 'https://storage.cloud.kargo.com/ad/network/tag/v3/' + data.site + '.js';

  // parse extra ad call options (optional)
  let options = {};
  if (global.JSON && data.options != null) {
    try {
      options = global.JSON.parse(data.options);
    } catch (e) {}
  }

  // Adding required ad call slot information
  options.kargo_id = data.slot;
  options.source_window = global;
  options.source_element = global.document.body.firstChild;

  // Add Kargo AdTag to master window if it has not been loaded or started to load
  if (!top.__krg_load_started) {
    if (!(top.Kargo || {}).loaded) {
      loadScript(top, kargoScriptUrl);
    }

    top.__krg_load_started = true;
  }

  // Add Ad call to Ad queue
  (top.Kargo = top.Kargo || {}).ads = top.Kargo.ads || [];
  top.Kargo.ads.push(options);

  // Process Ad queue
  (top.Kargo.loadAds || function() {})();
}
