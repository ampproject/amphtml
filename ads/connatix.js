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

import {hasOwn} from '../src/utils/object';
import {tryParseJson} from '../src/json';
import {validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function connatix(global, data) {

  validateData(data, ['connatix']);

  // Because 3p's loadScript does not allow for data attributes,
  // we will write the JS tag ourselves.
  const script = global.document.createElement('script');
  const cnxData = Object.assign(Object(tryParseJson(data['connatix'])));
  global.cnxAmpAd = true;
  for (const key in cnxData) {
    if (hasOwn(cnxData, key)) {
      script.setAttribute(key, cnxData[key]);
    }
  }

  window.addEventListener('connatix_no_content', function() {
    window.context.noContentAvailable();
  }, false);

  script.onload = () => {
    global.context.renderStart();
  };

  script.src = 'https://cdn.connatix.com/min/connatix.renderer.infeed.min.js';
  global.document.getElementById('c').appendChild(script);
}
