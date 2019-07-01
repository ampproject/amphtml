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
import {setStyles} from '../src/style';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function mytarget(global, data) {
  validateData(data, ['adSlot'], ['adQuery']);

  // Create ad tag placeholder
  const container = global.document.createElement('ins');

  container.setAttribute('class', 'mrg-tag');
  container.setAttribute('data-ad-slot', data['adSlot']);
  if (data['adQuery']) {
    container.setAttribute('data-ad-query', data['adQuery']);
  }
  setStyles(container, {
    display: 'inline-block',
    width: '100%',
    height: '100%',
  });
  global.document.getElementById('c').appendChild(container);

  // Add tag and callbacks to queue
  (global.MRGtag = global.MRGtag || []).push({
    onNoAds: () => global.context.noContentAvailable(),
    onAdsSuccess: () => global.context.renderStart(),
  });

  // Load main js asynchronously
  loadScript(global, 'https://ad.mail.ru/static/ads-async.js');
}
