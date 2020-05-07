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
import {getData} from '../src/event-helper';
import {tryParseJson} from '../src/json';

const requiredParams = ['pubname', 'widgetname'];
const aclreMessagePrefix = 'lre:playerReady://';

const scriptHost = 'player.anyclip.com';
const scriptPath = 'anyclip-widget/lre-widget/prod/v1/src';
const scriptName = 'aclre-amp-loader.js';
const scriptUrl = `https://${scriptHost}/${scriptPath}/${scriptName}`;

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function anyclip(global, data) {
  validateData(data, requiredParams);

  global.addEventListener('message', (event) => {
    const message = /** @type {string} */ (getData(event));
    if (message.indexOf(aclreMessagePrefix) !== 0) {
      return
    }
    const data = tryParseJson(message.replace(aclreMessagePrefix, ''));
    if (!data) {
      return;
    }
    const widget = global.anyclip.getWidget(null, data['sessionId']);
    if (widget) {
      global.context.renderStart();
    }
  });

  loadScript(global, scriptUrl, () => 
  {
    global.anyclip = global.anyclip || {};
    global.anyclip.getWidget = global.anyclip.getWidget || function(){};
  });
}
