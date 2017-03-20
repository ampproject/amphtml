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

import {loadScript, validateData} from '../3p/3p';

/* global
__kxamp: false,
__kx_ad_slots: false,
__kx_ad_start: false,
__kx_viewability: false,
*/

/**
 * @param {!Window} global
 * @param {!Object} data
 */

export function kixer(global, data) {
  /*eslint "google-camelcase/google-camelcase": 0*/
  validateData(data, ['adslot'], []);

  let coords;
  let in_view = false;
  let view_interval;

  const d = global.document.createElement('div');
  d.id = '__kx_ad_' + data.adslot;
  global.document.getElementById('c').appendChild(d);

  const kxload = function() {
    d.removeEventListener('load', kxload, false);
    if (d.childNodes.length > 0) {
      global.context.renderStart();
      view_interval = setInterval(function() {
        kxview_check(); // Once the ad has loaded, start checking for an ad view
      }, 900);
    } else {
      global.context.noContentAvailable();
    }
  };
  d.addEventListener('load', kxload, false); // Listen for the kixer load event

  const kxview_check = function() {
    if (coords.intersectionRect.height > coords.boundingClientRect.height / 2) {
      if (in_view === true) { // if the ad was in view on the previous interval
        clearInterval(view_interval);
        if (typeof __kx_viewability.process_locked === 'function') {
          __kx_viewability.process_locked(data.adslot);
        }
      }
      in_view = true;
    } else {
      in_view = false;
    }
  };

  global.context.observeIntersection(function(changes) {
    changes.forEach(function(c) {
      coords = c;
    });
  });

  const unlisten = global.context.observeIntersection(function(changes) {
    changes.forEach(function(c) {
      if (c.intersectionRect.height > 0) {
        if (typeof __kx_viewability.process_locked === 'function') {
          __kx_viewability.process_locked(data.adslot);
        }
        unlisten();
      }
    });
  });

  loadScript(global, 'https://cdn.kixer.com/ad/load.js', () => {
    __kxamp[data.adslot] = 1;
    __kx_ad_slots.push(data.adslot);
    __kx_ad_start();
  });
}
