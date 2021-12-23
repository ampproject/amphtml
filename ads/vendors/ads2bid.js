/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function ads2bid(global, data) {
  validateData(data, ['blockId', 'siteId', 'src']);
  const {blockId, siteId, src} = data;
  const url = src + `/html/amp?site_id=${siteId}&blocks=${blockId}`;
  createContainer(global);
  loadScript(global, url);
}

/**
 * @param {!Window} global
 */
function createContainer(global) {
  const div = global.document.createElement('div');
  div.setAttribute('data-ads2bid', 1);
  global.document.getElementById('c').appendChild(div);
}
