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
import {validateData, loadScript} from '../../3p/3p';
import {dev, user} from '../../src/log';

/**
 * @enum {number}
 * @private
 */
const GladeExperiment = {
  NO_EXPERIMENT: 0,
  GLADE_CONTROL: 1,
  GLADE_EXPERIMENT: 2,
  GLADE_OPT_OUT: 3,
};

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function doubleclick(global, data) {
  const experimentFraction = 0.1;

  // TODO: check mandatory fields
  validateData(data, [], [
    'slot', 'targeting', 'categoryExclusions',
    'tagForChildDirectedTreatment', 'cookieOptions',
    'overrideWidth', 'overrideHeight', 'loadingStrategy',
    'consentNotificationId', 'useSameDomainRenderingUntilDeprecated',
    'experimentId', 'multiSize', 'multiSizeValidation',
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
    if ((href.indexOf('google_glade=0') > 0 || dice < experimentFraction)
        && href.indexOf('google_glade=1') < 0) {
      doubleClickWithGpt(global, data, GladeExperiment.GLADE_CONTROL);
    } else {
      const exp = (dice < 2 * experimentFraction) ?
        GladeExperiment.GLADE_EXPERIMENT : GladeExperiment.NO_EXPERIMENT;
      doubleClickWithGlade(global, data, exp);
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

    // Get multi-size ad request data, if any, and validate it in the following
  // ways: Ensure that the data string is a comma-separated list of sizes of the
  // form wxh; that each secondary dimension is strictly less than its primary
  // dimension counterpart; and, if data-mutli-size-validation is not set to
  // false, that each secondary dimension is at least 2/3rds of its primary
  // dimension counterpart.
  const multiSizeDataStr = data.multiSize;
  if (multiSizeDataStr) {
    const sizesStr = multiSizeDataStr.split(',');
    sizesStr.forEach(sizeStr => {
      const size = sizeStr.split('x');
      if (Array.isArray(size) && size.length == 2) {

        const w = Number(size[0]);
        const h = Number(size[1]);

        if (!Number.isNaN(w) && !Number.isNaN(h)) {
          const primaryW = dimensions[0][0];
          const primaryH = dimensions[0][1];

          // Check secondary size strictly less than primary size.
          if (w < primaryW && h < primaryH) {
            // The minimum ratio of each secondary dimension to its corresponding
            // primary dimension.
            const minRatio = 2 / 3;
            // Check that if multi-size-validation is on, that the secondary sizes
            // are at least minRatio of the primary size.
            const sizeValidation = data.multiSizeValidation;
            if ((sizeValidation === 'false' || sizeValidation === false) ||
                (w >= minRatio * primaryW && h >= minRatio * primaryH)) {
              dimensions.push([w, h]);
            } else {
              user().error('AMP-AD',
                  'Each secondary dimension must be at least 2/3rds of the ' +
                  'corresponding primary dimension, or the ' +
                  'data-multi-size-validation attribute must be set to false.',
                  '<amp-ad>');
            }
          } else {
            user().error('AMP-AD',
                'Secondary sizes must be strictly smaller than the primary size.',
                '<amp-ad>');
          }
        } else {
          user().error('AMP-AD', 'Invalid width or height given for secondary' +
              'size.', '<amp-ad>');
        }
      } else {
        user().error('AMP-Ad', 'Invalid multi-size data format.',
            '<amp-ad>');
      }
    });
  }

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

      if (data['experimentId']) {
        const experimentIdList = data['experimentId'].split(',');
        pubads.forceExperiment = pubads.forceExperiment || function() {};
        experimentIdList &&
            experimentIdList.forEach(eid => pubads.forceExperiment(eid));
      }

      pubads.markAsAmp();
      pubads.set('page_url', global.context.canonicalUrl);
      pubads.setCorrelator(Number(getCorrelator(global)));
      googletag.enableServices();

      if (data.categoryExclusions) {
        if (Array.isArray(data.categoryExclusions)) {
          for (let i = 0; i < data.categoryExclusions.length; i++) {
            slot.setCategoryExclusion(data.categoryExclusions[i]);
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
        global.context.renderStart();
        global.context.reportRenderedEntityIdentifier('dfp-' + creativeId);

        // Handle multi-size-ad request
        if (dimensions.length > 1) {

          const primaryInvSize = dimensions[0];
          const returnedSize = event.size;

          // Is the retruned size strictly smaller than primary inventory size?
          if (returnedSize[0] < primaryInvSize[0] && returnedSize[1] < primaryInvSize[1]) {
            window.context.onResizeSuccess((requestedHeight, requestedWidth) => {
              // Nothing needs to be done.
              console.log('Success');
            });
            window.context.onResizeDenied((requestedHeight, requestedWidth) => {
              // TODO(levitzky) Resize the AMP-created iframe such that the
              // tag-created iframe is centered within it.
              console.log('Denied');
            });
            window.context.requestResize(returnedSize[0], returnedSize[1]);
          }
        }
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
 * @param {!GladeExperiment} gladeExperiment
 */
function doubleClickWithGlade(global, data, gladeExperiment) {
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
  if (gladeExperiment === GladeExperiment.GLADE_EXPERIMENT) {
    jsonParameters.gladeExp = '1';
    jsonParameters.gladeEids = '108809102';
  }
  const expIds = data['experimentId'];
  if (expIds) {
    jsonParameters.gladeEids = jsonParameters.gladeEids ?
        jsonParameters.gladeEids + ',' + expIds : expIds;
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
    global.context.renderStart();
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
