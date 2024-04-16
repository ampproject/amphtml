import {PLATFORM_NAME, XCUST_ATTRIBUTE_NAME} from './constants';
import {generatePageImpressionId, isExcludedAnchorUrl} from './utils';

import {CustomEventReporterBuilder} from '../../../src/extension-analytics';

const PAGE_IMPRESSIONS = 'page-impressions';
const LINK_IMPRESSIONS = 'link-impressions';
const NON_AFFILIATE_CLICK = 'non-affiliate-click';

/**
 * The Tracking class exposes some public methods to
 * send the 3 potential Skimlinks tracking requests to Skimlinks tracking API:
 *  - Page impression tracking
 *  - Link impression tracking
 *  - Non-affiliate click tracking.
 *
 * It uses the amp-analytics internal API (https://github.com/ampproject/amphtml/blob/main/extensions/amp-analytics/amp-components-analytics.md)
 * in order to send the tracking requests.
 */
export class Tracking {
  /**
   * Use tracking instance to track page impressions,
   * link impressions and non-affiliated clicks.
   * @param {!AmpElement} element
   * @param {!Object} skimOptions
   * @param {string} referrer
   */
  constructor(element, skimOptions, referrer) {
    /** @private {boolean} */
    this.tracking_ = skimOptions.tracking;

    /** @private {!Object} */
    this.trackingInfo_ = {
      customTrackingId: skimOptions.customTrackingId,
      guid: null,
      pageImpressionId: generatePageImpressionId(),
      // https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-var-substitutions.md
      pageUrl: 'CANONICAL_URL',
      pubcode: skimOptions.pubcode,
      referrer,
      timezone: 'TIMEZONE',
    };

    /** @private {!Object} */
    this.skimOptions_ = skimOptions;

    /** @private {!Object} */
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
    const {guid, pageImpressionId, pageUrl, pubcode, timezone} =
      this.trackingInfo_;

    // This data is common to both page & link impression requests.
    const commonData = {
      'pub': pubcode,
      'pag': pageUrl,
      'guid': guid,
      'uuid': pageImpressionId,
      'tz': timezone,
      'jv': PLATFORM_NAME,
    };

    const {numberAffiliateLinks, urls} = this.extractAnchorTrackingInfo_(
      anchorReplacementList
    );

    this.sendPageImpressionTracking_(commonData, numberAffiliateLinks);
    this.sendLinkImpressionTracking_(commonData, numberAffiliateLinks, urls);
  }

  /**
   * Sends tracking request to Skimlinks tracking API in order to
   * register non-affiliated click.
   * @param {!HTMLElement} anchor
   * @public
   */
  sendNaClickTracking(anchor) {
    if (!this.tracking_ || isExcludedAnchorUrl(anchor, this.skimOptions_)) {
      return;
    }
    const {
      customTrackingId,
      pageImpressionId,
      pageUrl,
      pubcode,
      referrer,
      timezone,
    } = this.trackingInfo_;

    const data = {
      'pubcode': pubcode,
      'referrer': pageUrl,
      'pref': referrer,
      'site': 'false',
      'url': anchor.href,
      'custom': anchor.getAttribute(XCUST_ATTRIBUTE_NAME) || customTrackingId,
      'xtz': timezone,
      'uuid': pageImpressionId,
      'product': '1',
      'jv': PLATFORM_NAME,
    };

    // Sends POST request. Second param is the object used to interpolate
    // placeholder variables defined in NA_CLICK_TRACKING_URL
    // (See constants.js).
    this.analytics_.trigger(NON_AFFILIATE_CLICK, {
      'data': JSON.stringify(data),
      'rnd': 'RANDOM',
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

    const data = /** @type {!JsonObject} */ ({
      'slc': numberAffiliateLinks,
      'jsl': 0,
      'pref': referrer,
      'uc': customTrackingId,
      't': 1,
      ...commonData,
    });

    // Sends POST request. Second param is the object used to interpolate
    // placeholder variables defined in PAGE_IMPRESSION_TRACKING_URL
    // (See constants.js).
    this.analytics_.trigger(PAGE_IMPRESSIONS, {
      'data': JSON.stringify(data),
    });
  }

  /**
   * Sends tracking request to Skimlinks tracking API in order to
   * register link impression request.
   * @param {!Object} commonData
   * @param {number} numberAffiliateLinks
   * @param {!JsonObject} urls
   * @private
   */
  sendLinkImpressionTracking_(commonData, numberAffiliateLinks, urls) {
    if (numberAffiliateLinks === 0) {
      // Nothing to send.
      return;
    }

    const data = /** @type {!JsonObject} */ ({
      'dl': urls,
      'hae': numberAffiliateLinks ? 1 : 0,
      'typ': 'l',
      ...commonData,
    });

    // Send POST request. Second param is the object used to interpolate
    // placeholder variables defined in LINKS_IMPRESSIONS_TRACKING_URL.
    // (See constants.js).
    this.analytics_.trigger(LINK_IMPRESSIONS, {
      'data': JSON.stringify(data),
    });
  }

  /**
   * Initialise the amp-analytics internal API.
   * Warning: Analytics API will not send any request until
   * CommonSignals.LOAD_START has been triggered.
   * (See "initTracking_" in amp-skimlinks.js)
   * @param {!AmpElement} element
   * @return {!Object}
   * @private
   */
  setupAnalytics_(element) {
    const analyticsBuilder = new CustomEventReporterBuilder(element);
    const {linksTrackingUrl, nonAffiliateTrackingUrl, pageTrackingUrl} =
      this.skimOptions_.config;

    // Configure analytics to send POST request when receiving
    // 'page-impressions' event.
    analyticsBuilder.track(PAGE_IMPRESSIONS, pageTrackingUrl);
    analyticsBuilder.track(LINK_IMPRESSIONS, linksTrackingUrl);
    analyticsBuilder.track(NON_AFFILIATE_CLICK, nonAffiliateTrackingUrl);

    analyticsBuilder.setTransportConfig({
      'beacon': true,
      'image': true,
      // Tracking API supports CORS with wildcard in Access-Control-Origin
      // which is not compatible with the credentials flag set to true when
      // using xhrpost.
      'xhrpost': false,
    });

    return analyticsBuilder.build();
  }

  /**
   * Extract the information about links on the page
   * in order to send it to the tracking API:
   * - Number of affiliate links on the pages
   * - A map of each AE url seen on the page associated with some information:
   *   i.e: {url1: { count: 1, ae: 1 }, url2: { count: 4, ae: 1}}
   *
   * Note: NA links are now excluded from the tracking info.
   *
   * @param {!./link-rewriter/link-rewriter.AnchorReplacementList} anchorReplacementList - List of all the anchors on the page
   *    associated with their potential replacement url.
   * @return {!{numberAffiliateLinks: number, urls: !JsonObject}}
   * @private
   */
  extractAnchorTrackingInfo_(anchorReplacementList) {
    let numberAffiliateLinks = 0;
    const urls = {};

    anchorReplacementList.forEach((anchorReplacement) => {
      const {anchor, replacementUrl} = anchorReplacement;
      const isExcluded = isExcludedAnchorUrl(anchor, this.skimOptions_);
      const isAffiliate = Boolean(replacementUrl);
      // Do not track na-links since the backend doesn't use them.
      if (!isAffiliate || isExcluded) {
        return;
      }

      urls[anchor.href] = urls[anchor.href] || {
        'ae': 1, // 1 means affiliated link.
        'count': 0,
      };

      urls[anchor.href]['count'] += 1;
      numberAffiliateLinks += 1;
    });

    return {
      numberAffiliateLinks,
      urls,
    };
  }
}
