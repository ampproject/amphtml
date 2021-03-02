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

import {computeInMasterFrame, validateData, writeScript} from '../../3p/3p';
import {getSourceUrl, parseUrlDeprecated} from '../../src/url';
import {hasOwn} from '../../src/utils/object';

const mandatoryParams = ['tagtype', 'cid'],
  optionalParams = [
    'timeout',
    'crid',
    'misc',
    'slot',
    'targeting',
    'categoryExclusions',
    'tagForChildDirectedTreatment',
    'cookieOptions',
    'overrideWidth',
    'overrideHeight',
    'loadingStrategy',
    'consentNotificationId',
    'useSameDomainRenderingUntilDeprecated',
    'experimentId',
    'multiSize',
    'multiSizeValidation',
  ];
// useSameDomainRenderingUntilDeprecated is included to ensure publisher
// amp-tags don't break before 29th March

/**
 * @param {!Window} global
 * @param {{
 *   tagtype: string,
 *   cid: string,
 *   crid: (string|undefined),
 *   misc: (string|undefined),
 *   targeting: (Object|undefined),
 * }} data
 */
export function medianet(global, data) {
  validateData(data, mandatoryParams, optionalParams);

  /** @type {./3p/ampcontext-integration.IntegrationAmpContext} */
  const context = /** @type {./3p/ampcontext-integration.IntegrationAmpContext} */ (global.context);
  const publisherUrl =
      context.canonicalUrl || getSourceUrl(context.location.href),
    referrerUrl = context.referrer;

  if (data.tagtype === 'headerbidder') {
    //parameter tagtype is used to identify the product the publisher is using. Going ahead we plan to support more product types.
    loadHBTag(global, data, publisherUrl, referrerUrl);
  } else if (data.tagtype === 'cm' && data.crid) {
    loadCMTag(global, data, publisherUrl, referrerUrl);
  } else {
    context.noContentAvailable();
  }
}

/**
 * @param {!Window} global
 * @return {{renderStartCb: (function(*=)), reportRenderedEntityIdentifierCb: (function(*=)), noContentAvailableCb: (function())}}
 */
function getCallbacksObject(global) {
  /** @type {./3p/ampcontext-integration.IntegrationAmpContext} */
  const context = /** @type {./3p/ampcontext-integration.IntegrationAmpContext} */ (global.context);
  return {
    renderStartCb: (opt_data) => {
      context.renderStart(opt_data);
    },
    reportRenderedEntityIdentifierCb: (ampId) => {
      context.reportRenderedEntityIdentifier(ampId);
    },
    noContentAvailableCb: () => {
      context.noContentAvailable();
    },
  };
}

/**
 * @param {!Window} global
 * @param {{
 *   tagtype: string,
 *   cid: string,
 *   crid: (string|undefined),
 *   misc: (string|undefined),
 *   targeting: (Object|undefined),
 *   requrl: (string|undefined),
 *   refurl: (string|undefined),
 *   versionId: (string|undefined),
 * }} data
 * @param {string} publisherUrl
 * @param {?string} referrerUrl
 */
function loadCMTag(global, data, publisherUrl, referrerUrl) {
  /**
   * Sets macro type.
   * @param {string} type
   */
  function setMacro(type) {
    if (!type) {
      return;
    }
    const name = 'medianet_' + type;
    if (hasOwn(data, type)) {
      global[name] = data[type];
    }
  }

  /**
   * Sets additional data.
   */
  function setAdditionalData() {
    data.requrl = publisherUrl || '';
    data.refurl = referrerUrl || '';
    data.versionId = '211213';

    setMacro('width');
    setMacro('height');
    setMacro('crid');
    setMacro('requrl');
    setMacro('refurl');
    setMacro('versionId');
    setMacro('misc');
  }

  /**
   * Sets callback.
   */
  function setCallbacks() {
    global._mNAmp = getCallbacksObject(global);
  }

  /**
   * Loads the script.
   */
  function loadScript() {
    let url = 'https://contextual.media.net/ampnmedianet.js?';
    url += 'cid=' + encodeURIComponent(data.cid);
    url += '&https=1';
    url += '&requrl=' + encodeURIComponent(data.requrl || '');
    url += '&refurl=' + encodeURIComponent(data.refurl || '');
    writeScript(global, url);
  }

  /**
   * Initializer.
   */
  function init() {
    setAdditionalData();
    setCallbacks();
    loadScript();
  }

  init();
}

/**
 * @param {!Window} global
 * @param {{
 *   tagtype: string,
 *   cid: string,
 *   crid: (string|undefined),
 *   misc: (string|undefined),
 *   targeting: (Object|undefined),
 *   requrl: (string|undefined),
 *   refurl: (string|undefined),
 *   versionId: (string|undefined),
 * }} data
 * @param {string} publisherUrl
 * @param {?string} referrerUrl
 */
function loadHBTag(global, data, publisherUrl, referrerUrl) {
  /** @type {./3p/ampcontext-integration.IntegrationAmpContext} */
  const context = /** @type {./3p/ampcontext-integration.IntegrationAmpContext} */ (global.context);

  /**
   * Loads MNETAd.
   */
  function loadMNETAd() {
    if (loadMNETAd.alreadyCalled) {
      return;
    }
    loadMNETAd.alreadyCalled = true;

    global.advBidxc = context.master.advBidxc;
    if (global.advBidxc && typeof global.advBidxc.renderAmpAd === 'function') {
      global.addEventListener('message', (event) => {
        global.advBidxc.renderAmpAd(event, global);
      });
    }

    data.targeting = data.targeting || {};

    if (
      global.advBidxc &&
      typeof global.advBidxc.setAmpTargeting === 'function'
    ) {
      global.advBidxc.setAmpTargeting(global, data);
    }
    global.advBidxc.loadAmpAd(global, data);
  }

  /**
   * Handler for mnet.
   */
  function mnetHBHandle() {
    global.advBidxc = context.master.advBidxc;
    if (
      global.advBidxc &&
      typeof global.advBidxc.registerAmpSlot === 'function'
    ) {
      global.advBidxc.registerAmpSlot({
        cb: loadMNETAd,
        data,
        winObj: global,
      });
    }
  }

  computeInMasterFrame(
    global,
    'medianet-hb-load',
    (done) => {
      /*eslint "google-camelcase/google-camelcase": 0*/
      global.advBidxc_requrl = publisherUrl;
      global.advBidxc_refurl = referrerUrl;
      global.advBidxc = {
        registerAmpSlot: () => {},
        setAmpTargeting: () => {},
        renderAmpAd: () => {},
        loadAmpAd: () => {
          context.noContentAvailable();
        },
      };
      global.advBidxc.amp = getCallbacksObject(global);
      const publisherDomain = parseUrlDeprecated(publisherUrl).hostname;
      writeScript(
        global,
        'https://contextual.media.net/bidexchange.js?https=1&amp=1&cid=' +
          encodeURIComponent(data.cid) +
          '&dn=' +
          encodeURIComponent(publisherDomain),
        () => {
          done(null);
        }
      );
    },
    mnetHBHandle
  );
}
