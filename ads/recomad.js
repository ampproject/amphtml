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
 * Add a container for the recomAD widget,
 * which will be discovered by the script automatically.
 *
 * @param {Element} container
 * @param {string} appId
 * @param {string} widgetId
 * @param {string} searchTerm
 * @param {string} origin
 * @param {string} baseUrl
 * @param {string} puid
 */
function createWidgetContainer(
  container,
  appId,
  widgetId,
  searchTerm,
  origin,
  baseUrl,
  puid
) {
  container.className = 's24widget';

  container.setAttribute('data-app-id', appId);
  container.setAttribute('data-widget-id', widgetId);
  searchTerm && container.setAttribute('data-search-term', searchTerm);
  origin && container.setAttribute('data-origin', origin);
  baseUrl && container.setAttribute('data-base-url', baseUrl);
  puid && container.setAttribute('data-puid', puid);

  window.document.body.appendChild(container);
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function recomad(global, data) {
  validateData(data, ['appId', 'widgetId', ['searchTerm', 'origin']]);

  createWidgetContainer(
    window.document.createElement('div'),
    data['appId'],
    data['widgetId'],
    data['searchTerm'] || '',
    data['origin'] || '',
    data['baseUrl'] || '',
    data['puid'] || ''
  );

  loadScript(window, 'https://widget.s24.com/js/s24widget.min.js');
}
