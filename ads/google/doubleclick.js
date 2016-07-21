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

import {makeCorrelator} from './correlator';
import {checkData, loadScript} from '../../3p/3p';

/**
 * @enum {number}
 * @private
 */
const GladeExperiment = {
  NO_EXPERIMENT: 0,
  GLADE_CONTROL: 1,
  GLADE_OPT_OUT: 2,
};

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function doubleclick(global, data) {
  const experimentFraction = 0.5;

  checkData(data, [
    'slot', 'targeting', 'categoryExclusions',
    'tagForChildDirectedTreatment', 'cookieOptions',
    'overrideWidth', 'overrideHeight', 'loadingStrategy',
    'consentNotificationId', 'useSameDomainRenderingUntilDeprecated',
  ]);

  if (global.context.clientId) {
    // Read by GPT/Glade for GA/Doubleclick integration.
    global.gaGlobal = {
      vid: global.context.clientId,
      hid: global.context.pageViewId,
    };
  }

  if (data.useSameDomainRenderingUntilDeprecated != undefined) {
    doubleClickWithGpt(global, data, GladeExperiment.GLADE_OPT_OUT);
  } else {
    const dice = Math.random();
    const href = global.context.location.href;
    if ((href.indexOf('google_glade=1') > 0 || dice < experimentFraction)
        && href.indexOf('google_glade=0') < 0) {
      doubleClickWithGlade(global, data);
    } else {
      const exp = (dice < 2 * experimentFraction) ?
        GladeExperiment.GLADE_CONTROL : GladeExperiment.NO_EXPERIMENT;
      doubleClickWithGpt(global, data, exp);
    }
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 * @param {!GladeExperiment} gladeExperiment
 */
function doubleClickWithGpt(global, data, gladeExperiment) {
  const dimensions = [[
    parseInt(data.overrideWidth || data.width, 10),
    parseInt(data.overrideHeight || data.height, 10),
  ]];

  loadScript(global, 'https://www.googletagservices.com/tag/js/gpt.js', () => {
    global.googletag.cmd.push(() => {
      const googletag = global.googletag;
      const pubads = googletag.pubads();
      const slot = googletag.defineSlot(data.slot, dimensions, 'c')
          .addService(pubads);

      if (gladeExperiment === GladeExperiment.GLADE_CONTROL) {
        pubads.markAsGladeControl();
      } else if (gladeExperiment === GladeExperiment.GLADE_OPT_OUT) {
        pubads.markAsGladeOptOut();
      }

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
      global.document.getElementById('c')['slot'] = slot;
      googletag.display('c');
    });
  });
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function doubleClickWithGlade(global, data) {
  const requestHeight = parseInt(data.overrideHeight || data.height, 10);
  const requestWidth = parseInt(data.overrideWidth || data.width, 10);

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

  // Size setup.
  // The ad container should simply fill the amp-ad iframe, but we still
  // need to request a specific size from the ad server.
  // The ad container size will be relative to the amp-iframe, so if the
  // latter changes the ad container will match it.
  slot.setAttribute('width', 'fill');
  slot.setAttribute('height', 'fill');
  slot.setAttribute('data-request-height', requestHeight);
  slot.setAttribute('data-request-width', requestWidth);

  slot.addEventListener('gladeAdFetched', event => {
    if (event.detail.empty) {
      global.context.noContentAvailable();
    }
  });

  window.glade = {correlator: getCorrelator(global)};
  loadScript(global, 'https://securepubads.g.doubleclick.net/static/glade.js');
}

/**
 * @param {!Window} global
 * @return {number}
 */
function getCorrelator(global) {
  return makeCorrelator(global.context.clientId, global.context.pageViewId);
}
