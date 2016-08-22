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
export function mantisDisplay(global, data) {
  validateData(data, ['property', 'zone'], []);

  global.mantis = global.mantis || [];
  global.mantis.push(['display', 'load', {
    property: data['property'],
  }]);

  const d = global.document.createElement('div');
  d.setAttribute('data-mantis-zone', data['zone']);
  global.document.getElementById('c').appendChild(d);

  loadScript(global, 'https://assets.mantisadnetwork.com/mantodea.min.js');
}

export function mantisRecommend(global, data) {
  validateData(data, ['property'], ['css']);

  global.mantis = global.mantis || [];
  global.mantis.push(['recommend', 'load', {
    property: data['property'],
    render: 'recommended',
    css: data['css'],
  }]);

  const d = global.document.createElement('div');
  d.setAttribute('id', 'recommended');
  global.document.getElementById('c').appendChild(d);

  loadScript(global, 'https://assets.mantisadnetwork.com/recommend.min.js');
}
