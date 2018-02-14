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

/**
 * Make an AdPlugg iframe.
 * @param {!Window} global
 * @param {!Object} data
 */
export function adplugg(global,data) {
  // Load ad.js
  loadScript(global, 'https://www.adplugg.com/serve/js/ad.js');

  // Validate the amp-ad attributes.
  validateData(
      data,
      ['accessCode', 'width', 'height'], //required
      ['zone'] //optional
  );

  // Get the amp wrapper element.
  const ampwrapper = global.document.getElementById('c');

  // Build and append the ad tag.
  const adTag = global.document.createElement('div');
  adTag.setAttribute('class', 'adplugg-tag');
  adTag.setAttribute('data-adplugg-access-code', data['accessCode']);
  if (data['zone']) {
    adTag.setAttribute('data-adplugg-zone', data['zone']);
  }
  ampwrapper.appendChild(adTag);

  // Get a handle on the AdPlugg SDK.
  global.AdPlugg = (global.AdPlugg || []);
  const AdPlugg = global.AdPlugg;

  // Register event listeners (via async wrapper).
  AdPlugg.push(function() {

    // Register the renderStart event listener.
    AdPlugg.on(
        adTag,
        'adplugg:renderStart',
        function(event) {
          // Create the opt_data object.
          const optData = {};
          if (event.hasOwnProperty('width')) {
            optData.width = event.width;
          }
          if (event.hasOwnProperty('height')) {
            optData.height = event.height;
          }
          global.context.renderStart(optData);
        }
    );

    // Register the noContentAvailable event listener.
    AdPlugg.on(adTag, 'adplugg:noContentAvailable',
        function() {
          global.context.noContentAvailable();
        }
    );

  });

  // Fill the tag.
  AdPlugg.push({'command': 'run'});

}
