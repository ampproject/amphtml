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

import {validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function vmfive(global, data) {
  /*eslint "google-camelcase/google-camelcase": 0*/
  const mandatory_fields = ['appKey', 'placementId', 'adType'];
  const optional_fields = [];

  const {appKey, placementId, adType} = data;

  global._vmfive_amp = {appKey, placementId, adType};

  validateData(data, mandatory_fields, optional_fields);

  createAdUnit(global, placementId, adType);
  setupSDKReadyCallback(global, appKey);
  parallelDownloadScriptsAndExecuteInOrder(global);
}

function parallelDownloadScriptsAndExecuteInOrder(win) {
  [
    'https://vawpro.vm5apis.com/man.js',
    'https://man.vm5apis.com/dist/adn-web-sdk.js',
  ].forEach(function(src) {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    win.document.head.appendChild(script);
  });
}

function createAdUnit(win, placementId, adType) {
  const el = document.createElement('vmfive-ad-unit');
  el.setAttribute('placement-id', placementId);
  el.setAttribute('ad-type', adType);
  win.document.getElementById('c').appendChild(el);
}

function setupSDKReadyCallback(win, appKey) {
  win.onVM5AdSDKReady = sdk => sdk.init({appKey});
}
