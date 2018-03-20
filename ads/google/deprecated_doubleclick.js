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
import {dev} from '../../src/log';
import {getMultiSizeDimensions} from './utils';
import {loadScript, validateData} from '../../3p/3p';
import {makeCorrelator} from './correlator';
import {setStyles} from '../../src/style';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function deprecatedDoubleclick(global, data) {
  // TODO: check mandatory fields
  validateData(data, [], [
    'slot', 'targeting', 'categoryExclusions',
    'tagForChildDirectedTreatment', 'cookieOptions',
    'overrideWidth', 'overrideHeight', 'loadingStrategy',
    'consentNotificationId', 'useSameDomainRenderingUntilDeprecated',
    'experimentId', 'multiSize', 'multiSizeValidation', 'ampSlotIndex',
  ]);

  if (global.context.clientId) {
    // Read by GPT/Glade for GA/Doubleclick integration.
    global.gaGlobal = {
      cid: global.context.clientId,
      hid: global.context.pageViewId,
    };
  }
  centerAd(global);
  writeAdScript(global, data);
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function doubleClickWithGpt(global, data) {
  // Handle multi-size data parsing, validation, and inclusion into dimensions.
  const multiSizeDataStr = data.multiSize || null;
  const primaryWidth = parseInt(data.overrideWidth || data.width, 10);
  const primaryHeight = parseInt(data.overrideHeight || data.height, 10);
  let dimensions;
  if (multiSizeDataStr && (dimensions = getMultiSizeDimensions(
      multiSizeDataStr,
      primaryWidth,
      primaryHeight,
      (data.multiSizeValidation || 'true') == 'true'))) {
    dimensions.unshift([primaryWidth, primaryHeight]);
  } else {
    dimensions = [[primaryWidth, primaryHeight]];
  }

  loadScript(
      global, 'https://www.googletagservices.com/tag/js/gpt.js', () => {
        global.googletag.cmd.push(() => {
          const googletag = global.googletag;
          const pubads = googletag.pubads();
          const slot = googletag.defineSlot(data.slot, dimensions, 'c')
              .addService(pubads);

          if (data['experimentId']) {
            const experimentIdList = data['experimentId'].split(',');
            pubads.forceExperiment = pubads.forceExperiment || (() => {});
            (experimentIdList || [])
                .forEach(eid => pubads.forceExperiment(eid));
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
            const primaryInvSize = dimensions[0];
            const pWidth = primaryInvSize[0];
            const pHeight = primaryInvSize[1];
            const returnedSize = event.size;
            const rWidth = returnedSize ? returnedSize[0] : null;
            const rHeight = returnedSize ? returnedSize[1] : null;

            let creativeId = event.creativeId || '_backfill_';

            // If the creative is empty, or either dimension of the returned size
            // is larger than its counterpart in the primary size, then we don't
            // want to render the creative.
            if (event.isEmpty ||
                returnedSize && (rWidth > pWidth || rHeight > pHeight)) {
              global.context.noContentAvailable();
              creativeId = '_empty_';
            } else {
              // We only want to call renderStart with a specific size if the
              // returned creative size matches one of the multi-size sizes.
              let newSize;
              for (let i = 1; i < dimensions.length; i++) {
                // dimensions[0] is the primary or overridden size.
                if (dimensions[i][0] == rWidth && dimensions[i][1] == rHeight) {
                  newSize = {
                    width: rWidth,
                    height: rHeight,
                  };
                  break;
                }
              }
              global.context.renderStart(newSize);
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
  const expIds = data['experimentId'];
  if (expIds) {
    jsonParameters.gladeEids = jsonParameters.gladeEids ?
      jsonParameters.gladeEids + ',' + expIds : expIds;
  }


  const slot = global.document.getElementById('c');
  slot.setAttribute('data-glade', '');
  slot.setAttribute('data-amp-ad', '');
  slot.setAttribute('data-ad-unit-path', data.slot);
  if (Object.keys(jsonParameters).length > 0) {
    slot.setAttribute('data-json', JSON.stringify(jsonParameters));
  }
  slot.setAttribute('data-page-url', global.context.canonicalUrl);

  // Center the ad in the container.
  slot.setAttribute('height', requestHeight);
  slot.setAttribute('width', requestWidth);

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

/**
 * @param {!Window} global
 */
function centerAd(global) {
  setStyles(dev().assertElement(global.document.getElementById('c')), {
    top: '50%',
    left: '50%',
    bottom: '',
    right: '',
    transform: 'translate(-50%, -50%)',
  });
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function writeAdScript(global, data) {
  if (data.useSameDomainRenderingUntilDeprecated != undefined
      || data.multiSize || (
      global.context && global.context.location &&
            global.context.location.href &&
            global.context.location.href.indexOf('google_glade=0') > 0 &&
            global.context.location.href.indexOf('google_glade=1') < 0)) {
    doubleClickWithGpt(global, data);
  } else {
    doubleClickWithGlade(global, data);
  }
}
