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

const n = 'yandexZenAsyncCallbacks';
const renderTo = 'zen-widget';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function zen(global, data) {
  validateData(
    data,
    ['clid'],
    ['size', 'orientation', 'successCallback', 'failCallback']
  );

  addToQueue(global, data);
  loadScript(global, 'https://zen.yandex.ru/widget-loader');
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

    const {YandexZen} = global;
    const config = Object.assign(data, {
      clid: JSON.parse(data.clid),
      container: `#${renderTo}`,
      isAMP: true,
      successCallback: () => {
        if (typeof data.successCallback === 'function') {
          data.successCallback();
        }
      },
      failCallback: () => {
        if (typeof data.failCallback === 'function') {
          data.failCallback();
        }
      },
    });

    YandexZen.renderWidget(config);
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
