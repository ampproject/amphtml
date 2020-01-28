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

import {validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function temedya(global, data) {
  validateData(data, ['keyId','siteId']);
  temedyaAds(global, data);
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */

function temedyaAds(global, data) {
  const f = global.document.createElement('script');
  f.setAttribute('title', data.title);
  f.setAttribute('key-id', data.keyId);
  f.setAttribute('site-id', data.siteId);
  f.setAttribute('site-url', data.siteUrl);
  f.setAttribute('type-id', data.typeId);
  f.setAttribute('paid-item', data.paidItem);
  f.setAttribute('organic-item', data.organicItem);
  f.setAttribute('theme', data.theme);

  f.onload = function() {
    window.context.renderStart();
  };
  
  f.src = 'https://vidyome-com.cdn.vidyome.com/vidyome/builds/widgets.js';
  global.document.body.appendChild(f);
}
