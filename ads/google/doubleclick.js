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
import {setStyles} from '../../src/style';

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
    'experimentId', 'multiSize', 'multiSizeValidation', 'ampSlotIndex',
  ]);

  if (global.context.clientId) {
    // Read by GPT/Glade for GA/Doubleclick integration.
    global.gaGlobal = {
      vid: global.context.clientId,
      hid: global.context.pageViewId,
    };
  }

  // Center the ad in the container.
  const container = global.document.querySelector('#c');
  setStyles(dev().assertElement(container), {
    top: '50%',
    left: '50%',
    bottom: '',
    right: '',
    transform: 'translate(-50%, -50%)',
  });

  if (data.useSameDomainRenderingUntilDeprecated != undefined ||
      data.multiSize) {
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
 * A helper function for determining whether a given width or height violates
 * some condition.
 *
 * Checks the width and height against their corresponding conditions. If
 * either of the conditions fail, the errorBuilder function will be called with
 * the appropriate arguments, its result will be logged to user().error, and
 * validateDimensions will return false. Otherwise, validateDimensions will
 * only return true.
 *
 * @param {(number|string)} width
 * @param {(number|string)} height
 * @param {!function((number|string)): boolean} widthCond
 * @param {!function((number|string)): boolean} heightCond
 * @param {!function(!{badDim: string, badVal: (string|number)}): string}
 *    errorBuilder A function that will produce an informative error message.
 * @return {boolean}
 */
function validateDimensions(width, height, widthCond, heightCond,
    errorBuilder) {
  let badParams = null;
  if (widthCond(width) && heightCond(height)) {
    badParams = {
      badDim: 'width and height',
      badVal: width + 'x' + height,
    };
  }
  else if (widthCond(width)) {
    badParams = {
      badDim: 'width',
      badVal: width,
    };
  }
  else if (heightCond(height)) {
    badParams = {
      badDim: 'height',
      badVal: height,
    };
  }
  if (badParams) {
    user().error('AMP-AD', errorBuilder(badParams));
    return false;
  }
  return true;
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
  // ways:
  // 1) Ensure that the data string is a comma-separated list of sizes of the
  //    form WxH;
  // 2) that each secondary dimension is strictly less than its primary
  //    dimension counterpart;
  // 3) and, if data-mutli-size-validation is not set to false, that each
  //    secondary dimension is at least 2/3rds of its primary dimension
  //    counterpart.
  const multiSizeDataStr = data.multiSize || null;
  if (multiSizeDataStr) {
    const sizesStr = multiSizeDataStr.split(',');
    sizesStr.forEach(sizeStr => {

      const size = sizeStr.split('x');

      // Make sure that each size is specified in the form val1xval2.
      if (size.length != 2) {
        user().error('AMP-AD', `Invalid multi-size data format '${sizeStr}'.`);
        return;
      }

      const widthStr = size[0];
      const heightStr = size[1];

      // Make sure that both dimensions given are numbers.
      if (!validateDimensions(widthStr, heightStr,
            w => isNaN(Number(w)),
            h => isNaN(Number(h)),
            ({badDim, badVal}) =>
            `Invalid ${badDim} of ${badVal} given for secondary size.`)) {
        return;
      }

      const width = Number(widthStr);
      const height = Number(heightStr);
      const primarySize = dimensions[0];
      const primaryWidth = primarySize[0];
      const primaryHeight = primarySize[1];

      // Check that secondary size is not larger than primary size.
      if (!validateDimensions(width, height,
            w => w > primaryWidth,
            h => h > primaryHeight,
            ({badDim, badVal}) => `Secondary ${badDim} ${badVal} ` +
              `can't be larger than the primary ${badDim}.`)) {
        return;
      }

      // Check that if multi-size-validation is on, that the secondary sizes
      // are at least minRatio of the primary size.
      const validate = data.multiSizeValidation || 'true';
      if (validate != 'false' && validate != false) {

        // The minimum ratio of each secondary dimension to its corresponding
        // primary dimension.
        const minRatio = 2 / 3;
        const minWidth = minRatio * primaryWidth;
        const minHeight = minRatio * primaryHeight;
        if (!validateDimensions(width, height,
              w => w < minWidth,
              h => h < minHeight,
              ({badDim, badVal}) => `Secondary ${badDim} ${badVal} is ` +
              `smaller than 2/3rds of the primary ${badDim}.`)) {
          return;
        }
      }

      // Passed all checks! Push additional size to dimensions.
      dimensions.push([width, height]);
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
