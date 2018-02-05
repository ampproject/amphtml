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

import {
  computeInMasterFrame,
  loadScript,
  validateData,
} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function kargo(global, data) {
  /*eslint "google-camelcase/google-camelcase": 0*/

  validateData(data, ['site', 'slot'], ['options']);

  // Kargo AdTag url
  const kargoScriptUrl = 'https://storage.cloud.kargo.com/ad/network/tag/v3/' + data.site + '.js';

  // parse extra ad call options (optional)
  let options = {};
  if (data.options != null) {
    try {
      options = JSON.parse(data.options);
    } catch (e) {}
  }

  // Add window source reference to ad options
  options.source_window = global;

  computeInMasterFrame(global, 'kargo-load', function(done) {
    // load AdTag in Master window
    loadScript(this, kargoScriptUrl, () => {
      let success = false;
      if (this.Kargo != null && this.Kargo.loaded) {
        success = true;
      }

      done(success);
    });
  }, success => {
    if (success) {
      const w = options.source_window;

      // Add reference to Kargo api to this window if it's not the Master window
      if (!w.context.isMaster) {
        w.Kargo = w.context.master.Kargo;
      }

      w.Kargo.getAd(data.slot, options);
    } else {
      throw new Error('Kargo AdTag failed to load');
    }
  });
}
