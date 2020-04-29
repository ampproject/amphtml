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

import {validateData, writeScript} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adsnative(global, data) {
  try {
    validateData(data, ['anapiid'], ['ankv', 'ancat', 'antid']);
  } catch (e) {
    validateData(data, ['annid', 'anwid'], ['ankv', 'ancat', 'antid']);
  }

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
  const actualcat = data.ancat ? data.ancat.split(',') : undefined;

  // populate settings
  global._AdsNativeOpts = {
    apiKey: data.anapiid,
    networkKey: data.annid,
    nativeAdElementId: 'adsnative_ampad',
    currentPageUrl: global.context.location.href,
    widgetId: data.anwid,
    templateKey: data.antid,
    categories: actualcat,
    keyValues: actualkv,
    amp: true,
  };

  // drop ad placeholder div
  const ad = global.document.createElement('div');
  const ampwrapper = global.document.getElementById('c');
  ad.id = global._AdsNativeOpts.nativeAdElementId;
  ampwrapper.appendChild(ad);

  // load renderjs
  writeScript(global, 'https://static.adsnative.com/static/js/render.v1.js');
}
