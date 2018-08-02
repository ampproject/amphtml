import {CustomEventReporterBuilder} from '../../../src/extension-analytics.js';
import {generatePageImpressionId} from './utils';

import {XCUST_ATTRIBUTE_NAME} from './constants';


export const TRACKING_API_URL = 'https://t.skimresources.com/api';
import {
  LINK_STATUS__AFFILIATE,
  LINK_STATUS__UNKNOWN,
} from './constants';

export default class Tracking {
  /**
   * Use tracking instance to track page impressions,
   * link impressions and non-affiliated clicks.
   * @param {*} element
   * @param {*} skimOptions
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
   * @param {*} element
   */
  setupAnalytics_(element) {
    // 'layoutCallback' from custom-element base class needs be executed in order to have analytics working.
    // Analytics are not setup until CommonSignals.LOAD_START is triggered.
    const analyticsBuilder = new CustomEventReporterBuilder(element);
    analyticsBuilder.track('page-impressions', `${TRACKING_API_URL}/track.php?data=\${data}`);
    // analyticsBuilder.track('page-impressions', `${TRACKING_API_URL}/track.php?canonnical=CANONICAL_URL&ampdoc=AMPDOC_URL&source=SOURCE_URL&document_referrer=\${documentReferrer}`);
    analyticsBuilder.track('link-impressions', `${TRACKING_API_URL}/link?data=\${data}`);
    analyticsBuilder.track('non-affiliate-click', `${TRACKING_API_URL}/?call=track&rnd=\${rnd}&data=\${data}`, {beacon: true});

    return analyticsBuilder.build();
  }

  /**
   *
   */
  getTrackingInfo() {
    return this.trackingInfo_;
  }

  /**
   * Update tracking info
   * @param {*} newInfo
   */
  setTrackingInfo(newInfo) {
    this.trackingInfo_ = Object.assign(this.trackingInfo_, newInfo);
  }

  /**
   * Send Page impression and link impressions
   * @param {*} userSessionData
   * @param {*} anchorStatusMap
   * @param {*} startTime
   */
  sendImpressionTracking(userSessionData, anchorStatusMap, startTime) {
    if (!this.tracking_) {
      return;
    }
    const {pageImpressionId, timezone, pubcode, pageUrl, guid} = this.trackingInfo_;

    const commonData = {
      pub: pubcode,
      pag: pageUrl, // TODO: is this the same as this.referer_?
      guid,
      uuid: pageImpressionId,
      tz: timezone,
    };

    const {
      numberAffiliateLinks,
      urls,
    } = this.extractAnchorTrackingInfo_(anchorStatusMap);


    this.sendPageImpressionTracking_(commonData, numberAffiliateLinks, startTime);
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

    const data = {
      pubcode,
      referrer: pageUrl,
      pref: referrer,
      site: 'false',
      url: anchor.href,
      custom: anchor.getAttribute(XCUST_ATTRIBUTE_NAME) || customTrackingId,
      xtz: timezone,
      uuid: pageImpressionId,
      product: '1',
    };

    this.analytics_.trigger('non-affiliate-click', {
      data: JSON.stringify(data), rnd: '123',
    });
  }

  /**
   * Page impression tracking request
   * @param {*} commonData
   * @param {*} numberAffiliateLinks
   * @param {*} startTime
   */
  sendPageImpressionTracking_(commonData, numberAffiliateLinks, startTime) {
    const {customTrackingId, referrer} = this.trackingInfo_;

    const data = Object.assign({
      slc: numberAffiliateLinks,
      jsl: new Date().getTime() - startTime, // How long did it take to send the tracking
      pref: referrer,
      uc: customTrackingId,
      t: 1,
    }, commonData);

    this.analytics_.trigger('page-impressions', {
      data: JSON.stringify(data),
    });
  }

  /**
   * Link impressions tracking request
   * @param {*} commonData
   * @param {*} numberAffiliateLinks
   * @param {*} urls
   */
  sendLinkImpressionTracking_(commonData, numberAffiliateLinks, urls) {
    const data = Object.assign({
      dl: urls, // DO WE NEED TO REPLACE URL FIRST? ISN'T THIS DONE AUTOMATICALLY?
      hae: numberAffiliateLinks ? 1 : 0, // 1 if has at least one AE link
      typ: 'l',
    }, commonData);

    this.analytics_.trigger('link-impressions', {
      data: JSON.stringify(data), rnd: '123',
    });
  }

  /**
   *
   * @param {*} anchorStatusMap
   */
  extractAnchorTrackingInfo_(anchorStatusMap) {
    let numberAffiliateLinks = 0;
    const urls = {};

    anchorStatusMap.forEach((replacementUrl, anchor) => {
      const urlState = urls[anchor.href];
      if (urlState) {
        urlState.count = urlState.count + 1;
      } else {
        urls[anchor.href] = {
          count: 1,
          ae: replacementUrl ? 1 : 0,
        };
      }

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


