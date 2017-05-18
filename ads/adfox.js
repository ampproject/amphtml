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

import {loadScript, validateData} from '../3p/3p';
import {yandex} from './yandex';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function adfox(global, data) {
  validateData(data, ['adfoxParams', 'ownerId']);
  loadScript(global, 'https://yastatic.net/pcode/adfox/loader.js',
      () => initAdFox(global, data));
}

/**
 * @param {!Window} global
 * @param {Object} data
 */
function initAdFox(global, data) {
  const params = JSON.parse(data.adfoxParams);
  const container = global.document.createElement('div');

  container.setAttribute('id', 'adfox_container');
  global.document.getElementById('c').appendChild(container);

  global.Ya.adfoxCode.create({
    ownerId: data.ownerId,
    containerId: 'adfox_container',
    params,
    onLoad: data => checkLoading(global, data),
    onRender: () => global.context.renderStart(),
    onError: () => global.context.noContentAvailable(),
    onStub: () => global.context.noContentAvailable(),
  });
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function checkLoading(global, data) {
  if (data.bundleName === 'banner.direct') {
    const dblParams = {
      blockId: data.bundleParams.blockId,
      data: data.bundleParams.data,
      isAdfox: true,
    };

    yandex(global, dblParams);
    return false;
  }
}
