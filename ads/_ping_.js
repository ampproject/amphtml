/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {dev} from '../src/log';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function _ping_(global, data) {
  global.document.getElementById('c').textContent = data.ping;

  if (data.ad_container) {
    dev().assert(
        global.context.container == data.ad_container, 'wrong container');
  }
  if (data.valid && data.valid == 'true') {
    const img = document.createElement('img');
    if (data.url) {
      img.setAttribute('src', data.url);
    }
    let width, height;
    if (data.adHeight) {
      img.setAttribute('height', data.adHeight);
      height = Number(data.adHeight);
    }
    if (data.adWidth) {
      img.setAttribute('width', data.adWidth);
      width = Number(data.adWidth);
    }
    document.body.appendChild(img);
    if (width || height) {
      global.context.renderStart({width, height});
    } else {
      global.context.renderStart();
    }
    global.context.observeIntersection(function(changes) {
      changes.forEach(function(c) {
        dev().info('AMP-AD', 'Intersection: (WxH)' +
            `${c.intersectionRect.width}x${c.intersectionRect.height}`);
      });
    });
  } else {
    global.context.noContentAvailable();
  }
}
