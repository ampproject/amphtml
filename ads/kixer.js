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
import {parseUrlDeprecated} from '../src/url';

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

  let inView = false;
  let viewed = false;
  let viewTimer = null;

  const d = global.document.createElement('div');
  d.id = '__kx_ad_' + data.adslot;
  global.document.getElementById('c').appendChild(d);

  const kxload = function() {
    d.removeEventListener('load', kxload, false);
    if (d.childNodes.length > 0) {
      global.context.renderStart();
    } else {
      global.context.noContentAvailable();
    }
  };
  d.addEventListener('load', kxload, false); // Listen for the kixer load event

  const kxviewCheck = function(intersectionEntry) {
    inView = intersectionEntry.intersectionRatio > 0.5; // Half of the unit is in the viewport
    if (inView) {
      if (!viewed && viewTimer == null) {
        // If the ad hasn't been viewed and the timer is not set
        viewTimer = setTimeout(kxviewFire, 900); // Set a Timeout to check the ad in 900ms and fire the view
      }
    } else {
      if (viewTimer) {
        // If the Timeout is set
        clearTimeout(viewTimer); // Clear the Timeout
        viewTimer = null;
      }
    }
  };

  const kxviewFire = function() {
    if (inView) {
      // if the ad is still in the viewport
      if (typeof __kx_viewability.process_locked === 'function') {
        viewed = true;
        __kx_viewability.process_locked(data.adslot); // Fire kixer view
      }
    }
  };

  global.context.observeIntersection(function(changes) {
    changes.forEach(function(c) {
      kxviewCheck(c);
    });
  });

  loadScript(global, 'https://cdn.kixer.com/ad/load.js', () => {
    global.__kx_domain = parseUrlDeprecated(global.context.sourceUrl).hostname; // Get domain
    __kxamp[data.adslot] = 1;
    __kx_ad_slots.push(data.adslot);
    __kx_ad_start();
  });
}
