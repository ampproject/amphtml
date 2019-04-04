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
export function svknative(global, data) {

  // ensure we have valid widgetid value
  validateData(data, ['widgetid']);

  var s = global.document.createElement('script');
  var script_key = 'svknativeampwidget_' + Math.floor(Math.random() * 10000000);

  s.setAttribute('data-key', script_key)
  global.document.getElementById('c').appendChild(s);

  (function(w, a) {
    (w[a] = w[a] || []).push({
      'script_key': script_key,
      'settings': {
        'w': data['widgetid'],
	'amp': true
      }
    });

    if(w['_SVKNative_embed'])
      w['_SVKNative_embed'].initWidgets();

  })(global, '_svk_n_widgets');

  // load the SVK Native AMP JS file
  loadScript(global, 'https://widget.svk-native.ru/js/embed.js');
}

/**
 * @param {!Window} global
 * @param {string} widgetId
 */
function createContainer(global, widgetId) {
  return id;
}

