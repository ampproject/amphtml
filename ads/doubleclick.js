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

import {writeScript} from '../src/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function doubleclick(global, data) {
  writeScript(global,
      'https://www.googletagservices.com/tag/js/gpt.js',
      function() {
        global.googletag.cmd.push(function() {
          var dimensions = [[
            parseInt(data.width, 10),
            parseInt(data.height, 10)
          ]];
          var slot = googletag.defineSlot(data.slot, dimensions, 'c')
              .addService(googletag.pubads());
          googletag.pubads().enableSingleRequest();
          googletag.pubads().enableSyncRendering();
          googletag.pubads().set('page_url', context.location.href);
          googletag.enableServices();

          if (data.targeting) {
            for (var key in data.targeting) {
              slot.setTargeting(key, data.targeting[key]);
            }
          }

          if (data.categoryExclusion) {
            slot.setCategoryExclusion(data.categoryExclusion);
          }

          if (data.tagForChildDirectedTreatment != undefined) {
            slot.TagForChildDirectedTreatment(
                data.tagForChildDirectedTreatment);
          }

          // This must be called from its own script tag.
          global.docEndCallback = function() {
            global.googletag.display('c');
          };
        });
      });
}
