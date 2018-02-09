/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {writeScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function appvador(global, data) {
  validateData(data, ['id'], ['options', 'jsType', 'customScriptSrc']);

  const container = global.document.getElementById('c');
  const apvDiv = global.document.createElement('div');
  apvDiv.setAttribute('id', 'apvad-' + data.id);
  container.appendChild(apvDiv);

  const scriptUrl = data.customScriptSrc ? data.customScriptSrc :
    'https://cdn.apvdr.com/js/' +
    (data.jsType ? encodeURIComponent(data.jsType) : 'VastAdUnit') +
    '.min.js';
  const apvScript = 'new APV.' +
    (data.jsType ? data.jsType : 'VASTAdUnit') +
    '({s:"' + data.id + '",isAmpAd:true' +
    (data.options ? (',' + data.options) : '') + '}).load();';

  const cb = function() {
    const apvLoadScript = global.document.createElement('script');
    apvLoadScript.text = apvScript;
    container.appendChild(apvLoadScript);
  };

  writeScript(global, scriptUrl, cb);
}
