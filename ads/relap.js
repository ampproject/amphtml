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
  validateData(data, [], ['token', 'url', 'anchorid', 'version']);

  const urlParam = data['url'] || window.context.canonicalUrl;

  if (data['version'] === 'v7') {
    window.onRelapAPIReady = function(relapAPI) {
      relapAPI['init']({
        token: data['token'],
        url: urlParam,
      });
    };

    window.onRelapAPIInit = function(relapAPI) {
      relapAPI['addWidget']({
        cfgId: data['anchorid'],
        anchorEl: global.document.getElementById('c'),
        position: 'append',
        events: {
          onReady: function() {
            window.context.renderStart();
          },
          onNoContent: function() {
            window.context.noContentAvailable();
          },
        },
      });
    };

    loadScript(global, 'https://v7.relap.io/relap.js');
  } else {
    window.relapV6WidgetReady = function() {
      window.context.renderStart();
    };

    window.relapV6WidgetNoSimilarPages = function() {
      window.context.noContentAvailable();
    };

    const anchorEl = global.document.createElement('div');
    anchorEl.id = data['anchorid'];
    global.document.getElementById('c').appendChild(anchorEl);

    const url = `https://relap.io/api/v6/head.js?token=${encodeURIComponent(
      data['token']
    )}&url=${encodeURIComponent(urlParam)}`;
    loadScript(global, url);
  }
}
