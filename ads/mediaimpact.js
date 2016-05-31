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

import {loadScript} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */

export function mediaimpact(global, data) {
  global.fif = false;
  window.addEventListener('load', function() {
    asmi.sas.call(data.site + '/(' + data.page + ')',
      data.format,
      data.target + ';googleAMP=1;',
      '',
      'sas_' + data.slot.replace('sas_',''),
      1);
  }, false);
  asmiSetup = {
    view: 'm',
    async: true,
  };
  loadScript(global, 'https://ec-ns.sascdn.com/diff/251/divscripte/amp.js?dom=' + window.context.location.host, () => {
    if (!document.getElementById('sas_' + data.slot.replace('sas_',''))) {
      const adContainer = global.document.createElement('div');
      adContainer.id = 'sas_' + data.slot.replace('sas_','');
      global.document.body.appendChild(adContainer);
    }
  });
}
