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
  const experimentFraction = 0.01;

  checkData(data, [
    'slot', 'targeting', 'categoryExclusions',
    'tagForChildDirectedTreatment', 'cookieOptions',
    'overrideWidth', 'overrideHeight',
  ]);

  if (global.context.location.href.indexOf('google_glade=1') > 0 ||
      Math.random() < experimentFraction) {
    doubleClickWithGlade(global, data);
  } else {
    doubleClickWithGpt(global, data);
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function doubleClickWithGpt(global, data) {
  const dimensions = [[
    parseInt(data.overrideWidth || data.width, 10),
    parseInt(data.overrideHeight || data.height, 10),
  ]];

  if (global.context.clientId) {
    // Read by GPT for GA/GPT integration.
    global.gaGlobal = {
      vid: global.context.clientId,
      hid: global.context.pageViewId,
    };
  }

  loadScript(global, 'https://www.googletagservices.com/tag/js/gpt.js', () => {
    global.googletag.cmd.push(() => {
      const googletag = global.googletag;
      const pubads = googletag.pubads();
      const slot = googletag.defineSlot(data.slot, dimensions, 'c')
          .addService(pubads);

      pubads.enableSingleRequest();
      pubads.markAsAmp();
      pubads.set('page_url', global.context.canonicalUrl);
      pubads.setCorrelator(Number(getCorrelator(global)));
      googletag.enableServices();

      if (data.categoryExclusions) {
        if (Array.isArray(data.categoryExclusions)) {
          for (const categoryExclusion of data.categoryExclusions) {
            slot.setCategoryExclusion(categoryExclusion);
          }
        } else {
          slot.setCategoryExclusion(data.categoryExclusions);
        }
      }

      if (data.cookieOptions) {
        pubads.setCookieOptions(data.cookieOptions);
      }

      if (data.tagForChildDirectedTreatment != undefined) {
        pubads.setTagForChildDirectedTreatment(
            data.tagForChildDirectedTreatment);
      }

      if (data.targeting) {
        for (const key in data.targeting) {
          slot.setTargeting(key, data.targeting[key]);
        }
      }

      pubads.addEventListener('slotRenderEnded', event => {
        let creativeId = event.creativeId || '_backfill_';
        if (event.isEmpty) {
          global.context.noContentAvailable();
          creativeId = '_empty_';
        }
        global.context.reportRenderedEntityIdentifier('dfp-' + creativeId);
      });

      // Exported for testing.
      c.slot = slot;
      googletag.display('c');
    });
  });
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function doubleClickWithGlade(global, data) {
  const height = parseInt(data.overrideHeight || data.height, 10);
  const width = parseInt(data.overrideWidth || data.width, 10);

  const jsonParameters = {};
  if (data.categoryExclusions) {
    jsonParameters.categoryExclusions = data.categoryExclusions;
  }
  if (data.cookieOptions) {
    jsonParameters.cookieOptOut = data.cookieOptions;
  }
  if (data.tagForChildDirectedTreatment != undefined) {
    jsonParameters.tagForChildDirectedTreatment =
        data.tagForChildDirectedTreatment;
  }
  if (data.targeting) {
    jsonParameters.targeting = data.targeting;
  }

  const slot = global.document.querySelector('#c');
  slot.setAttribute('data-glade', '');
  slot.setAttribute('data-amp-ad', '');
  slot.setAttribute('data-ad-unit-path', data.slot);
  if (Object.keys(jsonParameters).length > 0) {
    slot.setAttribute('data-json', JSON.stringify(jsonParameters));
  }
  slot.setAttribute('data-page-url', global.context.canonicalUrl);
  slot.setAttribute('height', height);
  slot.setAttribute('width', width);

  window.glade = {correlator: getCorrelator(global)};
  loadScript(global, 'https://securepubads.g.doubleclick.net/static/glade.js');
}

/**
 * @param {!Object} data
 * @return {number}
 */
function getCorrelator(global) {
  const clientId = global.context.clientId;
  const pageViewId = global.context.pageViewId;
  if (global.context.clientId) {
    return pageViewId + (clientId.replace(/\D/g, '') % 1e6) * 1e6;
  } else {
    return pageViewId;
  }
}
