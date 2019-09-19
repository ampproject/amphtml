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
export function baidu(global, data) {
  validateData(data, ['cproid']);

  const id =
    '_' +
    Math.random()
      .toString(36)
      .slice(2);
  const container = global.document.createElement('div');
  container.id = id;
  global.document.getElementById('c').appendChild(container);

  global.slotbydup = global.slotbydup || [];
  global.slotbydup.push({
    id: data['cproid'],
    container: id,
    display: 'inlay-fix',
    async: true,
  });

  global.addEventListener('message', () => {
    global.context.renderStart();
  });

  loadScript(
    global,
    'https://dup.baidustatic.com/js/dm.js',
    () => {},
    () => {
      // noContentAvailable should be called,
      // if parent iframe receives no message.
      // setTimeout can work, but it's not that reliable.
      // So, only the faliure of JS loading is dealed with for now.
      global.context.noContentAvailable();
    }
  );
}
