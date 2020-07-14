/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import {parseJson} from '../src/json';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function sona(global, data) {
  validateData(data, ['config'], ['responsive']);

  // Additional validation
  const dataConfig = data['config'];
  const adConfig = parseJson(dataConfig);

  // Add configuration
  const configScript = global.document.createElement('SCRIPT');
  const config = global.document.createTextNode(
    '(sona = window.sona || ' + JSON.stringify(adConfig) + ')'
  );
  configScript.appendChild(config);

  // Set up amp-ad
  const slot = global.document.getElementById('c');
  const ad = global.document.createElement('SONA-WIDGET');
  ad.setAttribute('auto-responsive', '');
  ad.className = 'ad-tag';

  // setup ad from sona
  slot.appendChild(ad);
  slot.appendChild(configScript);

  // Initialise sona widget and get Image/Video
  const scriptUrl = 'https://cdn.sonaserve.com/v1.1/dist.js';
  loadScript(global, scriptUrl);
}
