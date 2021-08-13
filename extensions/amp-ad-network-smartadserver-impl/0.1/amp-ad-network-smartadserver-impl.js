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

import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';
import {Deferred} from '#core/data-structures/promise';
import {Services} from '#service';
import {buildUrl} from '#ads/google/a4a/shared/url-builder';
import {dev} from '../../../src/log';
import {getConsentPolicyInfo} from '../../../src/consent';
import {getOrCreateAdCid} from '../../../src/ad-cid';
import {getPageLayoutBoxBlocking} from '#core/dom/layout/page-layout-box';
import {tryParseJson} from '#core/types/object/json';

/** @type {string} */
const TAG = 'amp-ad-network-smartadserver-impl';

/** @const {number} */
const MAX_URL_LENGTH = 15360;

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

    /** @protected {!Deferred<string>} */
    this.getAdUrlDeferred = new Deferred();
  }

  /** @override */
  getAdUrl(opt_consentTuple, opt_rtcResponsesPromise) {
    const consentPolicy = super.getConsentPolicy() || 'default';
    Promise.race([
      getConsentPolicyInfo(this.element, consentPolicy),
      new Promise((resolve) => setTimeout(() => resolve(''), 100)),
    ]).then((consentString) => {
      opt_rtcResponsesPromise = opt_rtcResponsesPromise || Promise.resolve();

      const checkStillCurrent = this.verifyStillCurrent();
      opt_rtcResponsesPromise.then((result) => {
        checkStillCurrent();

        const vendor = this.getBestRtcCallout_(result);
        const hbParams = {};
        const cacheParams = {};
        if (vendor && Object.keys(vendor).length) {
          hbParams['hb_bid'] = vendor.hb_bidder || 'unknown';
          hbParams['hb_cpm'] = vendor.hb_pb || 0.0;
          hbParams['hb_ccy'] = 'USD';

          cacheParams.id = vendor.hb_cache_id;
          cacheParams.host = vendor.hb_cache_host;
          cacheParams.path = vendor.hb_cache_path;
        }

        const domain =
          this.element.getAttribute('data-domain') ||
          'https://www.smartadserver.com';
        const formatId = this.element.getAttribute('data-format');
        const tagId = 'sas_' + formatId;

        const adUrl = buildUrl(
          domain + '/ac',
          {
            siteid: this.element.getAttribute('data-site'),
            pgid: this.element.getAttribute('data-page'),
            fmtid: formatId,
            tgt: this.element.getAttribute('data-target'),
            tag: tagId,
            // eslint-disable-next-line google-camelcase/google-camelcase
            gdpr_consent: consentString,
            noadcbk: true,
            pgDomain: this.win.top.location.hostname,
            out: 'iframe',
            tmstp: Date.now(),
            ...hbParams,
          },
          MAX_URL_LENGTH,
          TRUNCATION_PARAM
        );

        this.getAdUrlDeferred.resolve(adUrl);

        this.win.addEventListener(
          'message',
          (event) => {
            if (
              event.origin === domain &&
              event.data === 'SMRT NOAD ' + tagId
            ) {
              Object.keys(cacheParams).length
                ? this.renderRtcAd_(cacheParams)
                : this.element.setAttribute('style', 'height:0px');
            }
          },
          false
        );
      });
    });

    return this.getAdUrlDeferred.promise;
  }

  /**
   * Chooses RTC callout with highest bid price.
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
        return;
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

  /**
   * Gets and renders RTC creative
   * @param {Object} params
   * @return {?Promise}
   */
  renderRtcAd_(params) {
    fetch(
      new Request(
        `https://${params.host}${params.path}?showAdm=1&uuid=${params.id}`
      )
    )
      .then((response) => response.json())
      .then((creative) => {
        const i = document.createElement('iframe');
        i.setAttribute('scrolling', 'no');
        i.setAttribute('style', 'border:0; margin:0');
        i.setAttribute('width', this.element.getAttribute('width'));
        i.setAttribute('height', this.element.getAttribute('height'));
        this.element.appendChild(i);

        const d = i.contentWindow.document;
        d.write(
          `<html><head></head><body style="margin:0px">${creative.adm}</body></html>`
        );
        d.close();
      })
      .catch(console.error);
  }

  /** @override */
  isValidElement() {
    return this.isAmpAdElement();
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
      REFERRER: (opt_timeout) => this.getReferrer_(opt_timeout),
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
}

AMP.extension(TAG, '0.1', (AMP) =>
  AMP.registerElement(TAG, AmpAdNetworkSmartadserverImpl)
);

// const _log = (msg) => {
//   console /*OK*/
//     .log(
//       '%cks',
//       'background:#900c3f; border-radius:2px; color:#feffff; font-family:lato,sans-serif; padding:1px 3px',
//       msg
//     );
// };
