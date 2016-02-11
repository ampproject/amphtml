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

import {loadScript, checkData} from '../src/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function doubleclick(global, data) {
  checkData(data, [
    'slot', 'targeting', 'categoryExclusion',
    'tagForChildDirectedTreatment', 'cookieOptions',
    'overrideWidth', 'overrideHeight',
  ]);
  if (global.context.clientId) {
    // Read by GPT for GA/GPT integration.
    global.gaGlobal = {
      vid: global.context.clientId,
      hid: global.context.pageViewId,
    };
  }
  loadScript(global, 'https://www.googletagservices.com/tag/js/gpt.js', () => {
    global.googletag.cmd.push(function() {
      const googletag = global.googletag;
      const dimensions = [[
        parseInt(data.overrideWidth || data.width, 10),
        parseInt(data.overrideHeight || data.height, 10)
      ]];
      const clientId = window.context.clientId;
      const pageViewId = window.context.pageViewId;
      let correlator = null;
      if (clientId != null) {
        correlator = pageViewId + (clientId.replace(/\D/g, '') % 1e6) * 1e6;
      } else {
        correlator = pageViewId;
      }
      const pubads = googletag.pubads();
      const slot = googletag.defineSlot(data.slot, dimensions, 'c')
          .addService(pubads);
      pubads.enableSingleRequest();
      pubads.markAsAmp();
      pubads.set('page_url', context.canonicalUrl);
      pubads.setCorrelator(Number(correlator));
      googletag.enableServices();

      if (data.targeting) {
        for (const key in data.targeting) {
          slot.setTargeting(key, data.targeting[key]);
        }
      }

      if (data.categoryExclusion) {
        slot.setCategoryExclusion(data.categoryExclusion);
      }

      if (data.tagForChildDirectedTreatment != undefined) {
        pubads.setTagForChildDirectedTreatment(
            data.tagForChildDirectedTreatment);
      }

      if (data.cookieOptions) {
        pubads.setCookieOptions(data.cookieOptions);
      }

      pubads.addEventListener('slotRenderEnded', function(event) {
        let creativeId = event.creativeId ||
            // Full for backfill or empty case. Empty is handled below.
            '_backfill_';
        if (event.isEmpty) {
          context.noContentAvailable();
          creativeId = '_empty_';
        }
        context.reportRenderedEntityIdentifier('dfp-' + creativeId);
      });

      // Exported for testing.
      c.slot = slot;
      googletag.display('c');
    });
  });
}
