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

/** @type {string} */
const SAS_NO_AD_STRING = 'window.context.noContentAvailable';

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

    /** @private {?Element} */
    this.fallback_ = this.getFallback();
  }

  /** @override */
  getAdUrl(opt_consentTuple, opt_rtcResponsesPromise) {
    const consentPolicy = super.getConsentPolicy() || 'default';
    Promise.any([
      getConsentPolicyInfo(this.element, consentPolicy),
      new Promise((resolve) => setTimeout(() => resolve(), 20)),
    ]).then((consentString) => {
      opt_rtcResponsesPromise = opt_rtcResponsesPromise || Promise.resolve();
      const checkStillCurrent = this.verifyStillCurrent();
      opt_rtcResponsesPromise
        .then((result) => {
          checkStillCurrent();
          const hb_ = {};
          const cache_ = {};
          const vendor = this.getBestRtcCallout_(result);
          if (vendor && Object.keys(vendor).length) {
            hb_['hb_bid'] = vendor.hb_bidder || 'unknown';
            hb_['hb_cpm'] = vendor.hb_pb || 0.0;
            hb_['hb_ccy'] = 'USD';

            cache_.id = vendor.hb_cache_id;
            cache_.host = vendor.hb_cache_host;
            cache_.path = vendor.hb_cache_path;
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
              out: 'amp',
              // eslint-disable-next-line google-camelcase/google-camelcase
              gdpr_consent: consentString,
              ...hb_,
              pgDomain: this.win.top.location.hostname,
              tmstp: Date.now(),
            },
            MAX_URL_LENGTH,
            TRUNCATION_PARAM
          );

          fetch(adUrl, {credentials: 'include'})
            .then((response) => {
              response.text().then((adResponse) => {
                if (!adResponse.includes(SAS_NO_AD_STRING)) {
                  this.renderIframe_(adResponse, this.element, false);
                } else {
                  Object.keys(cache_).length
                    ? this.getRtcAd_(cache_, this.element)
                    : this.element.setAttribute('style', 'display:none');
                }
              });
            })
            .catch(console.error);

          this.getAdUrlDeferred.resolve();
        })
        .catch(console.error);
    });

    return this.getAdUrlDeferred.promise;
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
   * Gets and starts rendering RTC creative
   * @param {Object} params
   * @param {Element} element
   * @return {?Promise}
   */
  getRtcAd_(params, element) {
    fetch(
      new Request(
        `https://${params.host}${params.path}?showAdm=1&uuid=${params.id}`
      )
    )
      .then((response) => response.json())
      .then((creative) => this.renderIframe_(creative.adm, element));
  }

  /**
   * Renders iframe with ad
   * @param {string} adScript
   * @param {Element} element
   * @param {boolean} isHtml
   */
  renderIframe_(adScript, element, isHtml = true) {
    const i = document.createElement('iframe');
    i.setAttribute('width', '100%');
    i.setAttribute('height', '100%');
    i.setAttribute('scrolling', 'no');
    i.setAttribute('style', 'border:0; margin:0');
    element.appendChild(i);

    const d = i.contentWindow.document;
    const html = isHtml ? adScript : `<script>${adScript}</script>`;
    d.open('text/html', 'replace');
    d.write(
      `<!DOCTYPE html><head></head><body style="margin:0">${html}</body></html>`
    );
    d.close();

    const width = element.getAttribute('width');
    const height = element.getAttribute('height');
    element.setAttribute('style', `width:${width}px; height:${height}px`);
    element.removeAttribute('hidden');

    if (this.fallback_) {
      this.fallback_.setAttribute('hidden', '');
    }
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
