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


import {
  validateDataExists,
  writeScript,
} from '../3p/3p';


/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adsnative(global, data) {
  // Validate empty fields
  validateDataExists(data, ['annid']);

  // convert string to object
  let actualkv = undefined;
  if (data.ankv) {
    actualkv = {};
    const arraykv = data.ankv.split(',');
    for (const k in arraykv) {
      const kv = arraykv[k].split(':');
      actualkv[kv.pop()] = kv.pop();
    }
  }

  // convert string to array
  let actualcat = undefined;
  if (data.ancat) {
    actualcat = data.ancat.split(',');
  }

  // populate settings
  const gan = global._AdsNativeOpts = {};
  gan.apiKey = data.anapiid;
  gan.networkKey = data.annid;
  gan.nativeAdElementId = data.annid;
  gan.currentPageUrl = global.context.location.href;
  gan.widgetId = data.anwid;
  gan.templateKey = data.antkey;
  gan.categories = actualcat;
  gan.keyValues = actualkv || undefined;
  gan.amp = true;

  // drop ad placeholder div
  const ad = global.document.createElement('div');
  ad.id = data.annid;
  global.document.body.appendChild(ad);

  // load renderjs
  writeScript(global, 'https://static.adsnative.com/static/js/render.v1.js');
}
