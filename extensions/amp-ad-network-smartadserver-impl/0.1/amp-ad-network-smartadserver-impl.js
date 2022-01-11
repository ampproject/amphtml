/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {buildUrl} from '#ads/google/a4a/shared/url-builder';

import {getPageLayoutBoxBlocking} from '#core/dom/layout/page-layout-box';
import {tryParseJson} from '#core/types/object/json';
import {includes} from '#core/types/string';

import {Services} from '#service';

import {dev} from '#utils/log';

import {getOrCreateAdCid} from '../../../src/ad-cid';
import {getConsentPolicyInfo} from '../../../src/consent';
import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';

/** @type {string} */
const TAG = 'amp-ad-network-smartadserver-impl';

/** @const {number} */
const MAX_URL_LENGTH = 15360;

/** @type {string} */
const SAS_NO_AD_STR = '<html><head></head><body></body></html>';

/**
 * @const {!./shared/url-builder.QueryParameterDef}
 * @visibleForTesting
 */
const TRUNCATION_PARAM = {
  name: 'trunc',
  value: 1,
};

/** @final */
export class AmpAdNetworkSmartadserverImpl extends AmpA4A {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);
  }

  /** @override */
  getAdUrl(opt_consentTuple, opt_rtcResponsesPromise) {
    return Promise.any([
      getConsentPolicyInfo(this.element, this.getConsentPolicy() || 'default'),
      new Promise((resolve) => setTimeout(() => resolve(), 10)),
    ]).then((consentString) => {
      opt_rtcResponsesPromise = opt_rtcResponsesPromise || Promise.resolve();
      const checkStillCurrent = this.verifyStillCurrent();

      return opt_rtcResponsesPromise.then((result) => {
        checkStillCurrent();
        const rtc = this.getBestRtcCallout_(result);
        const urlParams = {};

        if (rtc && Object.keys(rtc).length) {
          urlParams['hb_bid'] = rtc.hb_bidder || '';
          urlParams['hb_cpm'] = rtc.hb_pb;
          urlParams['hb_ccy'] = 'USD';
          urlParams['hb_cache_id'] = rtc.hb_cache_id || '';
          urlParams['hb_cache_host'] = rtc.hb_cache_host || '';
          urlParams['hb_cache_path'] = rtc.hb_cache_path || '';
          urlParams['hb_width'] = this.element.getAttribute('width');
          urlParams['hb_height'] = this.element.getAttribute('height');
        }

        const formatId = this.element.getAttribute('data-format');
        const tagId = 'sas_' + formatId;
        return buildUrl(
          (this.element.getAttribute('data-domain') ||
            'https://www.smartadserver.com') + '/ac',
          {
            'siteid': this.element.getAttribute('data-site'),
            'pgid': this.element.getAttribute('data-page'),
            'fmtid': formatId,
            'tgt': this.element.getAttribute('data-target'),
            'tag': tagId,
            'out': 'amp-hb',
            ...urlParams,
            'gdpr_consent': consentString,
            'pgDomain': this.win.top.location.hostname,
            'tmstp': Date.now(),
          },
          MAX_URL_LENGTH,
          TRUNCATION_PARAM
        );
      });
    });
  }

  /** @override */
  isValidElement() {
    return this.isAmpAdElement();
  }

  /** @override */
  sendXhrRequest(adUrl) {
    return super.sendXhrRequest(adUrl).then((response) => {
      return response.text().then((responseText) => {
        if (includes(responseText, SAS_NO_AD_STR)) {
          this./*OK*/ collapse();
        }
        return new Response(response);
      });
    });
  }

  /** @override */
  getCustomRealTimeConfigMacros_() {
    const allowed = {
      'width': true,
      'height': true,
      'json': true,
      'data-override-width': true,
      'data-override-height': true,
      'data-multi-size': true,
      'data-slot': true,
    };

    return {
      PAGEVIEWID: () => Services.documentInfoForDoc(this.element).pageViewId,
      PAGEVIEWID_64: () =>
        Services.documentInfoForDoc(this.element).pageViewId64,
      HREF: () => this.win.location.href,
      CANONICAL_URL: () =>
        Services.documentInfoForDoc(this.element).canonicalUrl,
      TGT: () =>
        JSON.stringify(
          (tryParseJson(this.element.getAttribute('json')) || {})['targeting']
        ),
      ADCID: (opt_timeout) =>
        getOrCreateAdCid(
          this.getAmpDoc(),
          'AMP_ECID_GOOGLE',
          '_ga',
          parseInt(opt_timeout, 10)
        ),
      ATTR: (name) => {
        if (!allowed[name]) {
          dev().warn(TAG, `Invalid attribute ${name}`);
          return '';
        } else {
          return this.element.getAttribute(name);
        }
      },
      ELEMENT_POS: () => getPageLayoutBoxBlocking(this.element).top,
      SCROLL_TOP: () =>
        Services.viewportForDoc(this.getAmpDoc()).getScrollTop(),
      PAGE_HEIGHT: () =>
        Services.viewportForDoc(this.getAmpDoc()).getScrollHeight(),
      BKG_STATE: () => (this.getAmpDoc().isVisible() ? 'visible' : 'hidden'),
    };
  }

  /**
   * Chooses RTC callout with highest bid price
   * @param {Array<Object>} rtcResponseArray
   * @return {Object}
   */
  getBestRtcCallout_(rtcResponseArray) {
    if (!rtcResponseArray) {
      return {};
    }

    let highestOffer = {};
    rtcResponseArray.forEach((item) => {
      if (!item || !item.response || !item.response.targeting) {
        return null;
      } else if (
        (highestOffer.hb_pb &&
          item.response.targeting.hb_pb > highestOffer.hb_pb) ||
        (!highestOffer.hb_pb && item.response.targeting.hb_pb > 0.0)
      ) {
        highestOffer = item.response.targeting;
      }
    });

    return highestOffer;
  }
}

AMP.extension(TAG, '0.1', (AMP) =>
  AMP.registerElement(TAG, AmpAdNetworkSmartadserverImpl)
);
