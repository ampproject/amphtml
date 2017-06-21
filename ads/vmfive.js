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
export function vmfive(global, data) {
  /*eslint "google-camelcase/google-camelcase": 0*/
  const mandatory_fields = ['appKey', 'placementId', 'adType'];
  const optional_fields = [];

  const {appKey, placementId, adType} = data;

  global._vmfive_amp = {appKey, placementId, adType};

  validateData(data, mandatory_fields, optional_fields);

  createAdUnit(global, placementId, adType);
  loadScripts(global);
  setupSDKReadyCallback(global, appKey);
}

function loadScripts(win) {
  return Promise.all([loadMANScript(win), loadSDKScript(win)]);
}

function loadMANScript(win) {
  return new Promise((resolve, reject) => {
    const s = win.document.createElement('script');
    s.src = 'https://vawpro.vm5apis.com/man.js';
    s.id = 'vm5ad-js-sdk';
    s.onload = resolve;
    s.onerror = reject;
    win.document.body.appendChild(s);
  });
}

function loadSDKScript(win) {
  return new Promise((resolve, reject) => {
    loadScript(win, 'https://man.vm5apis.com/dist/adn-web-sdk.js', resolve, reject);
  });
}

function createAdUnit(win, placementId, adType) {
  const el = document.createElement('vmfive-ad-unit');
  el.setAttribute('placement-id', placementId);
  el.setAttribute('ad-type', adType);
  win.document.body.appendChild(el);
}

function setupSDKReadyCallback(win, appKey) {
  win.onVM5AdSDKReady = function(sdk) {
    sdk.init({appKey});
  };
}
