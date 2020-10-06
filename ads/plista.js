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
export function plista(global, data) {
  // TODO: check mandatory fields
  validateData(
    data,
    [],
    [
      'publickey',
      'widgetname',
      'urlprefix',
      'item',
      'geo',
      'categories',
      'countrycode',
    ]
  );
  const div = global.document.createElement('div');
  div.setAttribute('data-display', 'plista_widget_' + data.widgetname);
  // container with id "c" is provided by amphtml
  global.document.getElementById('c').appendChild(div);
  window.PLISTA = {
    publickey: data.publickey,
    widgets: [
      {
        name: data.widgetname,
        pre: data.urlprefix,
      },
    ],
    item: data.item,
    geo: data.geo,
    categories: data.categories,
    noCache: true,
    useDocumentReady: false,
    dataMode: 'data-display',
  };

  // load the plista modules asynchronously
  loadScript(
    global,
    'https://static' +
      (data.countrycode ? '-' + encodeURIComponent(data.countrycode) : '') +
      '.plista.com/async.js'
  );
}
