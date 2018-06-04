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

import {setStyles} from '../src/style';
import {validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */

export function medyanet(global, data) {
  validateData(data, ['slot', 'domain']);

  global.adunit = data.slot;
  global.size = '[' + data.width + ',' + data.height + ']';
  global.domain = data.domain;

  medyanetAds(global, data);
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function medyanetAds(global, data) {
  const f = global.document.createElement('iframe');
  f.setAttribute('id', 'adframe');
  f.setAttribute('width', data.width);
  f.setAttribute('height', data.height);
  f.setAttribute('frameborder', '0');
  f.setAttribute('marginheight', '0');
  f.setAttribute('marginwidth', '0');
  f.setAttribute('allowfullscreen', 'true');
  f.setAttribute('scrolling', 'no');
  setStyles(f, {
    border: '0 none transparent' ,
    position: 'relative' ,
  });
  f.onload = function() {
    window.context.renderStart();
  };
  f.src = `https://app.medyanetads.com/amp/medyanetads.html?bidderData=${global.domain}&adunit=${global.adunit}&size=${global.size}`;
  const url = window.top.location.search.substring(1);
  if (url && url.indexOf('hb=true') !== -1) {
    f.src = f.src + '&hb=true';
  }
  global.document.body.appendChild(f);
}
