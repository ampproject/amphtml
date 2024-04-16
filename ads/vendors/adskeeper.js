/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adskeeper(global, data) {
  validateData(data, ['publisher', 'widget', 'container'], ['url', 'options']);

  const scriptRoot = global.document.createElement('div');
  scriptRoot.id = data.container;

  global.document.body.appendChild(scriptRoot);

  /**
   * Returns path for provided js filename
   * @param {string} publisher js filename
   * @return {string} Path to provided filename.
   */
  function getResourceFilePath(publisher) {
    const publisherStr = publisher.replace(/[^a-zA-Z0-9]/g, '');
    return `${publisherStr[0]}/${publisherStr[1]}`;
  }

  const url =
    `https://jsc.adskeeper.com/${getResourceFilePath(data.publisher)}/` +
    `${encodeURIComponent(data.publisher)}.` +
    `${encodeURIComponent(data.widget)}.js`;

  global.uniqId = (
    '00000' + Math.round(Math.random() * 100000).toString(16)
  ).slice(-5);
  global['ampOptions' + data.widget + '_' + global.uniqId] = data.options;

  global.context.observeIntersection(function (changes) {
    /** @type {!Array} */ (changes).forEach(function (c) {
      global['intersectionRect' + data.widget + '_' + global.uniqId] =
        c.intersectionRect;
      global['boundingClientRect' + data.widget + '_' + global.uniqId] =
        c.boundingClientRect;
    });
  });

  loadScript(global, data.url || url);
}
