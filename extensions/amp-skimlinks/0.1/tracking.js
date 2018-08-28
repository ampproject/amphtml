import {CustomEventReporterBuilder} from '../../../src/extension-analytics.js';
import {dict} from '../../../src/utils/object';
import {generatePageImpressionId} from './utils';

import {PLATFORM_NAME, XCUST_ATTRIBUTE_NAME} from './constants';



import {
  LINKS_IMPRESSIONS_TRACKING_URL,
  NA_CLICK_TRACKING_URL,
  PAGE_IMPRESSION_TRACKING_URL,
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
   * @param {AmpElement} element
   * @param {Object} skimOptions
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

    this.analytics_ = this.setupAnalytics_(element);
  }

  /**
   * Getter to access the tracking data from outside the class.
   * @public
   * @return {Object}
   */
  getTrackingInfo() {
    return this.trackingInfo_;
  }

  /**
   * Setter to update the tracking data from outside the class.
   * This is mainly used for setting the guid that we receive from beaconAPI.
   * @public
   * @param {!Object} newInfo
   */
  setTrackingInfo(newInfo) {
    Object.assign(this.trackingInfo_, newInfo);
  }

  /**
   * Sends "Page impression" and "Link impression" tracking requests (POST).
   * @public
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

    // This data is common to both page & link impression requests.
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
   * Sends tracking request to Skimlinks tracking API in order to
   * register non-affiliated click.
   * @public
   * @param {HTMLElement} anchor
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

    // Triggers POST request. Second param is the object used to interpolate
    // placeholder variables defined in NA_CLICK_TRACKING_URL.
    this.analytics_.trigger('non-affiliate-click', {
      data: JSON.stringify(data), rnd: 'RANDOM',
    });
  }

  /**
   * Sends tracking request to Skimlinks tracking API in order to
   * register page impression request.
   * @private
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

    // Triggers POST request. Second param is the object used to interpolate
    // placeholder variables defined in PAGE_IMPRESSION_TRACKING_URL.
    this.analytics_.trigger('page-impressions', {
      data: JSON.stringify(data),
    });
  }

  /**
   * Sends tracking request to Skimlinks tracking API in order to
   * register link impression request.
   * @private
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

    // Triggers POST request. Second param is the object used to interpolate
    // placeholder variables defined in LINKS_IMPRESSIONS_TRACKING_URL.
    this.analytics_.trigger('link-impressions', {
      data: JSON.stringify(data),
    });
  }


  /**
   * Initialise the amp-analytics internal API.
   * @private
   * @param {AmpElement} element
   */
  setupAnalytics_(element) {
    // Analytics are not ready until CommonSignals.LOAD_START is triggered.
    const analyticsBuilder = new CustomEventReporterBuilder(element);
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
   * @private
   * @param {*} anchorStatusMap - Map of all the anchors on the page
   *    associated with their potential replacement url.
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
      urls,
    };
  }
}
