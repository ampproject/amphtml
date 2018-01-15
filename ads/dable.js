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

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function dable(global, data) {
  // check required props
  validateData(data, ['widgetId']);

  (global.dable = global.dable || function() {
    (global.dable.q = global.dable.q || []).push(arguments);
  });
  global.dable('setService', data['serviceName'] ||
      global.window.context.location.hostname);
  global.dable('setURL', global.window.context.sourceUrl);
  global.dable('setRef', global.window.context.referrer);

  const slot = global.document.createElement('div');
  slot.id = '_dbl_' + Math.floor(Math.random() * 100000);
  slot.setAttribute('data-widget_id', data['widgetId']);

  const divContainer = global.document.getElementById('c');
  if (divContainer) {
    divContainer.appendChild(slot);
  }

  const itemId = data['itemId'] || '';

  if (itemId) {
    global.dable('sendLog', 'view', {id: itemId});
  }

  // call render widget
  global.dable('renderWidget', slot.id, itemId, function(hasAd) {
    if (hasAd) {
      global.context.renderStart();
    } else {
      global.context.noContentAvailable();
    }
  });

  // load the Dable script asynchronously
  loadScript(global, 'https://static.dable.io/dist/plugin.min.js');
}
