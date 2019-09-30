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

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function miximedia(global, data) {
  validateData(data, ['blockid']);
  global._miximedia = global._miximedia || {
    viewId: global.context.pageViewId,
    blockId: data['blockid'],
    htmlURL: data['canonical'] || global.context.canonicalUrl,
    ampURL: data['ampurl'] || global.context.sourceUrl,
    testMode: data['testmode'] || 'false',
    referrer: data['referrer'] || global.context.referrer,
    hostname: global.window.context.location.hostname,
    clientId: window.context.clientId,
    domFingerprint: window.context.domFingerprint,
    location: window.context.location,
    startTime: window.context.startTime,
  };
  global._miximedia.AMPCallbacks = {
    renderStart: global.context.renderStart,
    noContentAvailable: global.context.noContentAvailable,
  };
  // load the miximedia  AMP JS file script asynchronously
  const rand = Math.round(Math.random() * 100000000);
  loadScript(
    global,
    'https://amp.mixi.media/ampclient/mixi.js?rand=' + rand,
    () => {},
    global.context.noContentAvailable
  );
}
