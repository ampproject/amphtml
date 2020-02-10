/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
export function temedya(global, data) {
  validateData(data, ['title']);
  global._temedya = global._temedya || {
    title: data.title,
    keyId: data.keyId,
    siteId: data.siteId,
    siteUrl: data.siteUrl,
    typeId: data.typeId,
    paidItem: data.paidItem,
    organicItem: data.organicItem,
    theme: data.theme,
  };
  global._temedya.AMPCallbacks = {
    renderStart: global.context.renderStart,
    noContentAvailable: global.context.noContentAvailable,
  };
  // load the temedya  AMP JS file script asynchronously
  loadScript(
    global,
    'https://vidyome-com.cdn.vidyome.com/vidyome/builds/temedya-amp.js',
    () => {},
    global.context.noContentAvailable
  );
}
