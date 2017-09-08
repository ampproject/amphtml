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
export function relap(global, data) {
  validateData(data, [], ['token', 'url', 'anchorid']);

  window.relapV6WidgetReady = function() {
    window.context.renderStart();
  };

  window.relapV6WidgetNoSimilarPages = function() {
    window.context.noContentAvailable();
  };

  const url = `https://relap.io/api/v6/head.js?token=${encodeURIComponent(data['token'])}&url=${encodeURIComponent(data['url'])}`;
  loadScript(global, url);

  const anchorEl = global.document.createElement('div');
  anchorEl.id = data['anchorid'];
  global.document.getElementById('c').appendChild(anchorEl);
}
