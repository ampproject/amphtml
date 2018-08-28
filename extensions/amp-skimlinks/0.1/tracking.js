import {CustomEventReporterBuilder} from '../../../src/extension-analytics.js';
import {dict} from '../../../src/utils/object';
import {generatePageImpressionId} from './utils';

import {PLATFORM_NAME, XCUST_ATTRIBUTE_NAME} from './constants';



import {
  LINKS_IMPRESSIONS_TRACKING_URL,
  NA_CLICK_TRACKING_URL,
  PAGE_IMPRESSION_TRACKING_URL,
} from './constants';


export class Tracking {
  /**
   * Use tracking instance to track page impressions,
   * link impressions and non-affiliated clicks.
   * @param {AmpElement} element
   * @param {Object} skimOptions
   */
  constructor(element, skimOptions) {
    this.tracking_ = skimOptions.tracking;

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

    this.analytics_ = this.setupAnalytics_(element);
  }

  /**
   *
   * @param {AmpElement} element
   */
  setupAnalytics_(element) {
    // Analytics are not ready until CommonSignals.LOAD_START is triggered.
    const analyticsBuilder = new CustomEventReporterBuilder(element);
    analyticsBuilder.track('page-impressions', PAGE_IMPRESSION_TRACKING_URL);
    analyticsBuilder.track('link-impressions', LINKS_IMPRESSIONS_TRACKING_URL);
    analyticsBuilder.track('non-affiliate-click', NA_CLICK_TRACKING_URL);

    const analytics = analyticsBuilder.build();
    // Overwrite config manually since CustomEventReporterBuilder doesn't
    // support optional config.
    // TODO: add optional config param to .build() so we don't need to mutate
    // a private property from outside.
    analytics.config_.transport = {beacon: true};

    return analytics;
  }

  /**
   *
   */
  getTrackingInfo() {
    return this.trackingInfo_;
  }

  /**
   * Update tracking info
   * @param {Object} newInfo
   */
  setTrackingInfo(newInfo) {
    Object.assign(this.trackingInfo_, newInfo);
  }

  /**
   * Send Page impression and link impressions
   * @param {*} anchorStatusMap
   * @param {number} startTime
   */
  sendImpressionTracking(anchorStatusMap, startTime) {
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

    const commonData = {
      pub: pubcode,
      pag: pageUrl,
      guid,
      uuid: pageImpressionId,
      tz: timezone,
      platform: PLATFORM_NAME,
    };

    const {
      numberAffiliateLinks,
      urls,
    } = this.extractAnchorTrackingInfo_(anchorStatusMap);


    this.sendPageImpressionTracking_(
        commonData,
        numberAffiliateLinks,
        startTime
    );
    this.sendLinkImpressionTracking_(commonData, numberAffiliateLinks, urls);
  }

  /**
   * Send tracking to register non-affiliated click.
   * @param {*} anchor
   */
  sendNaClickTracking(anchor) {
    if (!this.tracking_) {
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

    this.analytics_.trigger('non-affiliate-click', {
      data: JSON.stringify(data), rnd: 'RANDOM',
    });
  }

  /**
   * Page impression tracking request
   * @param {Object} commonData
   * @param {number} numberAffiliateLinks
   * @param {number} startTime
   */
  sendPageImpressionTracking_(commonData, numberAffiliateLinks, startTime) {
    const {customTrackingId, referrer} = this.trackingInfo_;

    const data = /** @type {!JsonObject} */ (Object.assign({
      slc: numberAffiliateLinks,
      // How long did it take to send the tracking
      jsl: new Date().getTime() - startTime,
      pref: referrer,
      uc: customTrackingId,
      t: 1,
    }, commonData));

    this.analytics_.trigger('page-impressions', {
      data: JSON.stringify(data),
    });
  }

  /**
   * Link impressions tracking request
   * @param {Object} commonData
   * @param {number} numberAffiliateLinks
   * @param {Object} urls
   */
  sendLinkImpressionTracking_(commonData, numberAffiliateLinks, urls) {
    const data = /** @type {!JsonObject} */ (Object.assign({
      dl: urls,
      hae: numberAffiliateLinks ? 1 : 0, // 1 if has at least one AE link
      typ: 'l',
    }, commonData));

    this.analytics_.trigger('link-impressions', {
      data: JSON.stringify(data),
    });
  }

  /**
   *
   * @param {*} anchorStatusMap
   * @return {{numberAffiliateLinks: number, urls: Object}}
   */
  extractAnchorTrackingInfo_(anchorStatusMap) {
    let numberAffiliateLinks = 0;
    const urls = {};

    anchorStatusMap.forEach((replacementUrl, anchor) => {
      urls[anchor.href] = urls[anchor.href] || {
        ae: replacementUrl ? 1 : 0,
        count: 0,
      };

      urls[anchor.href].count += 1;

      if (urls[anchor.href].ae === 1) {
        numberAffiliateLinks = numberAffiliateLinks + 1;
      }
    });

    return {
      numberAffiliateLinks,
      urls, // Object like { url1: { count: 1, ae: 0 }, url2: { count: 4, ae: 1 } }
    };
  }
}
