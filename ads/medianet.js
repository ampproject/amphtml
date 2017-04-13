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

import {writeScript, validateData, computeInMasterFrame} from '../3p/3p';
import {getSourceUrl} from '../src/url';
import {doubleclick} from '../ads/google/doubleclick';

const mandatoryParams = ['tagtype', 'cid'],
  optionalParams = [
    'timeout', 'crid', 'misc',
    'slot', 'targeting', 'categoryExclusions',
    'tagForChildDirectedTreatment', 'cookieOptions',
    'overrideWidth', 'overrideHeight', 'loadingStrategy',
    'consentNotificationId', 'useSameDomainRenderingUntilDeprecated',
    'experimentId', 'multiSize', 'multiSizeValidation',
  ],
  dfpParams = [
    'slot', 'targeting', 'categoryExclusions',
    'tagForChildDirectedTreatment', 'cookieOptions',
    'overrideWidth', 'overrideHeight', 'loadingStrategy',
    'consentNotificationId', 'useSameDomainRenderingUntilDeprecated',
    'experimentId', 'multiSize', 'multiSizeValidation',
  ],
  dfpDefaultTimeout = 1000;

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function medianet(global, data) {
  validateData(data, mandatoryParams, optionalParams);

  const publisherUrl = global.context.canonicalUrl ||
      getSourceUrl(global.context.location.href),
    referrerUrl = global.context.referrer;

  if (data.tagtype === 'headerbidder') { //parameter tagtype is used to identify the product the publisher is using. Going ahead we plan to support more product types.
    loadHBTag(global, data, publisherUrl, referrerUrl);
  } else if (data.tagtype === 'cm' && data.crid) {
    loadCMTag(global, data, publisherUrl, referrerUrl);
  } else {
    global.context.noContentAvailable();
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 * @param {!string} publisherUrl
 * @param {?string} referrerUrl
 */
function loadCMTag(global, data, publisherUrl, referrerUrl) {
  /*eslint "google-camelcase/google-camelcase": 0*/
  function setMacro(type) {
    if (!type) {
      return;
    }
    const name = 'medianet_' + type;
    if (data.hasOwnProperty(type)) {
      global[name] = data[type];
    }
  }

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

  function setCallbacks() {
    global._mNAmp = {
      renderStartCb: opt_data => {
        global.context.renderStart(opt_data);
      },
      reportRenderedEntityIdentifierCb: ampId => {
        global.context.reportRenderedEntityIdentifier(ampId);
      },
      noContentAvailableCb: () => {
        global.context.noContentAvailable();
      },
    };
  }

  function loadScript() {
    let url = 'https://contextual.media.net/ampnmedianet.js?';
    url += 'cid=' + encodeURIComponent(data.cid);
    url += '&https=1';
    url += '&requrl=' + encodeURIComponent(data.requrl);
    url += '&refurl=' + encodeURIComponent(data.refurl);
    writeScript(global, url);
  }

  function init() {
    setAdditionalData();
    setCallbacks();
    loadScript();
  }

  init();
}

/**
 * @param {!Window} global
 * @param {!Object} data
 * @param {!string} publisherUrl
 * @param {?string} referrerUrl
 */
function loadHBTag(global, data, publisherUrl, referrerUrl) {
  function deleteUnexpectedDoubleclickParams() {
    const allParams = mandatoryParams.concat(optionalParams);
    let currentParam = '';
    for (let i = 0; i < allParams.length; i++) {
      currentParam = allParams[i];
      if (dfpParams.includes(currentParam) === false && data[currentParam]) {
        delete data[currentParam];
      }
    }
  }

  let isDoubleClickCalled = false;

  function loadDFP() {
    if (isDoubleClickCalled) {
      return;
    }
    isDoubleClickCalled = true;

    global.advBidxc = global.context.master.advBidxc;
    if (global.advBidxc && typeof global.advBidxc.renderAmpAd === 'function') {
      global.addEventListener('message', event => {
        global.advBidxc.renderAmpAd(event, global);
      });
    }

    data.targeting = data.targeting || {};

    if (global.advBidxc &&
      typeof global.advBidxc.setAmpTargeting === 'function') {
      global.advBidxc.setAmpTargeting(global, data);
    }
    deleteUnexpectedDoubleclickParams();
    doubleclick(global, data);
  }

  function mnetHBHandle() {
    global.advBidxc = global.context.master.advBidxc;
    if (global.advBidxc &&
      typeof global.advBidxc.registerAmpSlot === 'function') {
      global.advBidxc.registerAmpSlot({
        cb: loadDFP,
        data,
        winObj: global,
      });
    }
  }

  global.setTimeout(() => {
    loadDFP();
  }, data.timeout || dfpDefaultTimeout);

  computeInMasterFrame(global, 'medianet-hb-load', done => {
    /*eslint "google-camelcase/google-camelcase": 0*/
    global.advBidxc_requrl = publisherUrl;
    global.advBidxc_refurl = referrerUrl;
    global.advBidxc = {
      registerAmpSlot: () => {},
      setAmpTargeting: () => {},
      renderAmpAd: () => {},
    };
    writeScript(global, 'https://contextual.media.net/bidexchange.js?https=1&amp=1&cid=' + encodeURIComponent(data.cid), () => {
      done(null);
    });
  }, mnetHBHandle);
}
