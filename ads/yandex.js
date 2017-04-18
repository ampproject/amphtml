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
import {loadScript, validateData} from '../3p/3p';

const n = 'yandexContextAsyncCallbacks';
const renderTo = 'yandex_rtb';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yandex(global, data) {
  validateData(data, ['blockId'], ['data', 'isAdfox']);

  addToQueue(global, data);
  loadScript(global, 'https://yastatic.net/partner-code/loaders/context_amp.js');
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function addToQueue(global, data) {
  global[n] = global[n] || [];
  global[n].push(() => {

    // Create container
    createContainer(global, renderTo);

    // Show Ad in container
    global.Ya.Context.AdvManager.render({
      blockId: data.blockId,
      statId: data.statId,
      renderTo,
      data: data.data,
      async: true,
      onRender: () => {
        // Move adfox queue
        if (data.isAdfox && global.Ya.adfoxCode.onRender) {
          global.Ya.adfoxCode.onRender();
        }
      },
    }, () => {
      global.context.noContentAvailable();
    });
  });
}

/**
 * @param {!Window} global
 * @param {string} id
 */
function createContainer(global, id) {
  const d = global.document.createElement('div');
  d.id = id;
  global.document.getElementById('c').appendChild(d);
}
