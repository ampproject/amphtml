/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {CustomEventReporterBuilder} from '../../../src/extension-analytics.js';
import {generatePageImpressionId, isExcludedUrl} from './utils';

import {
  LINKS_IMPRESSIONS_TRACKING_URL,
  NA_CLICK_TRACKING_URL,
  PAGE_IMPRESSION_TRACKING_URL,
  PLATFORM_NAME,
  XCUST_ATTRIBUTE_NAME,
} from './constants';

/**
 * The Tracking class exposes some public methods to
 * send the 3 potential Skimlinks tracking requests to Skimlinks tracking API:
 *  - Page impression tracking
 *  - Link impression tracking
 *  - Non-affiliate click tracking.
 *
 * It uses the amp-analytics internal API (https://github.com/ampproject/amphtml/blob/master/extensions/amp-analytics/amp-components-analytics.md)
 * in order to send the tracking requests.
 */
export class Tracking {
  /**
   * Use tracking instance to track page impressions,
   * link impressions and non-affiliated clicks.
   * @param {!AmpElement} element
   * @param {!Object} skimOptions
   */
  constructor(element, skimOptions) {
    /** @private {boolean} */
    this.tracking_ = skimOptions.tracking;

    /** @private {!Object} */
    this.trackingInfo_ = {
      pubcode: skimOptions.pubcode,
      // https://github.com/ampproject/amphtml/blob/master/spec/amp-var-substitutions.md
      pageUrl: 'CANONICAL_URL',
      referrer: 'DOCUMENT_REFERRER',
      timezone: 'TIMEZONE',
      pageImpressionId: generatePageImpressionId(),
      customTrackingId: skimOptions.customTrackingId,
      guid: null,
    };

    /** @private {!Object} */
    this.skimOptions_ = skimOptions;
    this.analytics_ = this.setupAnalytics_(element);
  }

  /**
   * Getter to access the tracking data from outside the class.
   * @return {!Object}
   * @public
   */
  getTrackingInfo() {
    return this.trackingInfo_;
  }

  /**
   * Setter to update the tracking data from outside the class.
   * This is mainly used for setting the guid that we receive from beaconAPI.
   * @param {!Object} newInfo
   * @public
   */
  setTrackingInfo(newInfo) {
    Object.assign(this.trackingInfo_, newInfo);
  }

  /**
   * Sends "Page impression" and "Link impression" tracking requests (POST).
   * @param {!./link-rewriter/link-rewriter.AnchorReplacementList} anchorReplacementList
   * @public
   */
  sendImpressionTracking(anchorReplacementList) {
    if (!this.tracking_) {
      return;
    }
    const {
      pageImpressionId,
      timezone,
      pubcode,
      pageUrl,
      guid,
    } = this.trackingInfo_;

    // This data is common to both page & link impression requests.
    const commonData = {
      pub: pubcode,
      pag: pageUrl,
      guid,
      uuid: pageImpressionId,
      tz: timezone,
      platform: PLATFORM_NAME,
    };

    const {numberAffiliateLinks, urls} = this.extractAnchorTrackingInfo_(
        anchorReplacementList
    );

    this.sendPageImpressionTracking_(
        commonData,
        numberAffiliateLinks
    );
    this.sendLinkImpressionTracking_(commonData, numberAffiliateLinks, urls);
  }

  /**
   * Sends tracking request to Skimlinks tracking API in order to
   * register non-affiliated click.
   * @param {!HTMLElement} anchor
   * @public
   */
  sendNaClickTracking(anchor) {
    if (!this.tracking_ || isExcludedUrl(anchor.href, this.skimOptions_)) {
      return;
    }
    const {
      pageImpressionId,
      timezone,
      pubcode,
      pageUrl,
      referrer,
      customTrackingId,
    } = this.trackingInfo_;

    const data = /** @type {!JsonObject} */ ({
      pubcode,
      referrer: pageUrl,
      pref: referrer,
      site: 'false',
      url: anchor.href,
      custom: anchor.getAttribute(XCUST_ATTRIBUTE_NAME) || customTrackingId,
      xtz: timezone,
      uuid: pageImpressionId,
      product: '1',
      platform: PLATFORM_NAME,
    });

    // Sends POST request. Second param is the object used to interpolate
    // placeholder variables defined in NA_CLICK_TRACKING_URL.
    this.analytics_.trigger('non-affiliate-click', {
      data: JSON.stringify(data),
      rnd: 'RANDOM',
    });
  }

  /**
   * Sends tracking request to Skimlinks tracking API in order to
   * register page impression request.
   * @param {!Object} commonData
   * @param {number} numberAffiliateLinks
   * @private
   */
  sendPageImpressionTracking_(commonData, numberAffiliateLinks) {
    const {customTrackingId, referrer} = this.trackingInfo_;

    const data = /** @type {!JsonObject} */ (Object.assign(
        {
          slc: numberAffiliateLinks,
          // Javascript load time, not relevent in AMP context.
          jsl: 0,
          pref: referrer,
          uc: customTrackingId,
          t: 1,
        },
        commonData
    ));

    // Sends POST request. Second param is the object used to interpolate
    // placeholder variables defined in PAGE_IMPRESSION_TRACKING_URL.
    this.analytics_.trigger('page-impressions', {
      data: JSON.stringify(data),
    });
  }

  /**
   * Sends tracking request to Skimlinks tracking API in order to
   * register link impression request.
   * @param {!Object} commonData
   * @param {number} numberAffiliateLinks
   * @param {!Object} urls
   * @private
   */
  sendLinkImpressionTracking_(commonData, numberAffiliateLinks, urls) {
    const data = /** @type {!JsonObject} */ (Object.assign(
        {
          dl: urls,
          hae: numberAffiliateLinks ? 1 : 0, // 1 if has at least one AE link
          typ: 'l',
        },
        commonData
    ));

    // Send POST request. Second param is the object used to interpolate
    // placeholder variables defined in LINKS_IMPRESSIONS_TRACKING_URL.
    this.analytics_.trigger('link-impressions', {
      data: JSON.stringify(data),
    });
  }

  /**
   * Initialise the amp-analytics internal API.
   * Warning: Analytics API will not send any request until
   * CommonSignals.LOAD_START has been triggered.
   * (See "initTracking_" in amp-skimlinks.js)
   * @param {!AmpElement} element
   * @private
   */
  setupAnalytics_(element) {
    const analyticsBuilder = new CustomEventReporterBuilder(element);
    // Configure analytics to send POST request when receiving
    // 'page-impressions' event.
    analyticsBuilder.track('page-impressions', PAGE_IMPRESSION_TRACKING_URL);
    analyticsBuilder.track('link-impressions', LINKS_IMPRESSIONS_TRACKING_URL);
    analyticsBuilder.track('non-affiliate-click', NA_CLICK_TRACKING_URL);

    const analytics = analyticsBuilder.build();
    /*
      Use {beacon: true} to send the request through sendBeacon()
      https://www.ampproject.org/docs/analytics/deep_dive_analytics#how-data-gets-sent:-transport-attribute

      Overwrite config manually since CustomEventReporterBuilder doesn't
      support optional config.
      TODO: add optional config param to .build() so we don't need to mutate
      a private property from outside.
    */
    analytics.config_.transport = {beacon: true};

    return analytics;
  }

  /**
   * Extract the information about links on the page
   * in order to send it to the tracking API:
   * - Number of affiliate links on the pages
   * - A map of each url seen on the page associated with some information:
   *   i.e: {url1: { count: 1, ae: 0 }, url2: { count: 4, ae: 1}}
   *
   * @param {!./link-rewriter/link-rewriter.AnchorReplacementList} anchorReplacementList - Map of all the anchors on the page
   *    associated with their potential replacement url.
   * @return {!{numberAffiliateLinks: number, urls: !Object}}
   * @private
   */
  extractAnchorTrackingInfo_(anchorReplacementList) {
    let numberAffiliateLinks = 0;
    const urls = {};

    anchorReplacementList.forEach(({replacementUrl, anchor}) => {
      if (isExcludedUrl(anchor.href, this.skimOptions_)) {
        return;
      }

      urls[anchor.href] = urls[anchor.href] || {
        ae: replacementUrl ? 1 : 0,
        count: 0,
      };

      urls[anchor.href].count += 1;

      if (urls[anchor.href].ae === 1) {
        numberAffiliateLinks += 1;
      }
    });

    return {
      numberAffiliateLinks,
      urls,
    };
  }
}
