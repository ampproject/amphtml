/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

const requiredParams = ['spot'];
const optionsParams = [
  'keywords',
  'adType',
  'param1',
  'param2',
  'param3',
  'subid',
  'cols',
  'rows',
  'title',
  'titlePosition',
  'adsByPosition',
];
const adContainerId = 'runative_id';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function runative(global, data) {
  // ensure we have valid widgetIds value
  validateData(data, requiredParams, optionsParams);

  const adContainer = global.document.getElementById('c');
  const adNativeContainer = getAdContainer(global);
  const initScript = getInitAdScript(global, data);

  adContainer.appendChild(adNativeContainer);

  // load the RUNative AMP JS file
  loadScript(global, '//cdn.run-syndicate.com/sdk/v1/n.js', () => {
    global.document.body.appendChild(initScript);
  });
}

/**
 * @param {!Object} data
 */
function getInitData(data) {
  const initKeys = requiredParams.concat(optionsParams);
  const initParams = {};

  initKeys.forEach(key => {
    if (key in data) {
      const initKey = key === 'adType' ? 'type' : key;

      initParams[initKey] = data[key];
    }
  });

  initParams['element_id'] = adContainerId;

  return initParams;
}

/**
 * @param {!Window} global
 */
function getAdContainer(global) {
  const container = global.document.createElement('div');

  container['id'] = adContainerId;

  return container;
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function getInitAdScript(global, data) {
  const scriptElement = global.document.createElement('script');
  const initData = getInitData(data);
  const initScript = global.document.createTextNode(
    `NativeAd(${JSON.stringify(initData)});`
  );

  scriptElement.appendChild(initScript);

  return scriptElement;
}
