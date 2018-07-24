import {CustomEventReporterBuilder} from '../../../src/extension-analytics.js';

export const TRACKING_API_URL = 'https://t.skimresources.com/api';
import {
  LINK_STATUS__AFFILIATE,
  LINK_STATUS__UNKNOWN,
} from './affiliate-links-manager';

export default class Tracking {
  constructor(element, skimOptions) {
    // 'layoutCallback' from custom-element base class needs be executed in order to have analytics working.
    // Analytics are not setup until CommonSignals.LOAD_START is triggered.
    const analyticsBuilder = new CustomEventReporterBuilder(element);
    analyticsBuilder.track('page-impressions', `${TRACKING_API_URL}/track.php?data=\${data}`);
    analyticsBuilder.track('link-impressions', `${TRACKING_API_URL}/link?data=\${data}`);
    analyticsBuilder.track('non-affiliate-click', `${TRACKING_API_URL}/?call=track&\${documentReferrer}&rnd=\${rnd}&data=\${data}`, {beacon: true});

    this.analytics_ = analyticsBuilder.build();
    this.tracking_ = skimOptions.tracking;
    this.pubcode_ = skimOptions.pubcode;
    // https://github.com/ampproject/amphtml/blob/master/spec/amp-var-substitutions.md
    this.referer_ = '${documentReferrer}';
    this.externalReferer_ = '${externalReferrer}';
    this.timezone_ = '${timezone}';
    this.pageImpressionId_ = generatePageImpressionId();
    this.customTrackingId_ = skimOptions.customTrackingId;
  }

  sendImpressionTracking(userSessionData, anchorStatusMap, startTime) {
    if (!this.tracking_) {
      return;
    }

    const commonData = {
      pag: window.location.href, // TODO: is this the same as this.referer_?
      guid: userSessionData.guid,
      uuid: this.pageImpressionId_,
      tz: this.timezone_,
      sessionid: userSessionData.sessionId,
      pub: this.pubcode_,
    };

    const {
      numberAffiliateLinks,
      urls,
    } = extractAnchorTrackingInfo(anchorStatusMap);


    this.sendPageImpressionTracking_(commonData, numberAffiliateLinks, startTime);
    this.sendLinkImpressionData_(commonData, urls);
  }

  sendNaClickTracking(anchor) {
    if (!this.tracking_) {
      return;
    }

    const data = {
      pubcode: this.pubcode_,
      referrer: this.referer_,
      pref: this.externalReferer_,
      site: 'false',
      url: anchor.href,
      custom: anchor.customTrackingId || this.customTrackingId_,
      xtz: this.timezone_,
      uuid: this.pageImpressionId,
      product: '1',
    };

    this.analytics_.trigger('non-affiliate-click', {
      data: JSON.stringify(data), rnd: '123',
    });
  }

  sendPageImpressionTracking_(commonData, numberAffiliateLinks, startTime) {
    const data = Object.assign({
      slc: numberAffiliateLinks,
      jsl: new Date().getTime() - startTime, // How long did it take to send the tracking
      pref: this.externalReferer_,
      uc: this.customTrackingId_,
      t: 1,
    }, commonData);

    this.analytics_.trigger('page-impressions', {
      data: JSON.stringify(data),
    });
  }

  sendLinkImpressionData_(commonData, urls) {
    const data = Object.assign({
      dl: urls, // DO WE NEED TO REPLACE URL FIRST? ISN'T THIS DONE AUTOMATICALLY?
      hae: '',
      typ: 'l',
    }, commonData);

    this.analytics_.trigger('link-impressions', {
      data: JSON.stringify(data), rnd: '123',
    });
  }
}

function generatePageImpressionId() {
  let str = '';
  for (let i = 0; i < 8; i++) {
    str += Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
  }

  return str;
}

/**
 *
 * @param {*} anchorStatusMap
 * @return -
 */
function extractAnchorTrackingInfo(anchorStatusMap) {
  let numberAffiliateLinks = 0;
  const urls = {};

  anchorStatusMap.forEach((status, anchor) => {
    const urlState = urls[anchor.href];
    if (urlState) {
      urlState.count = urlState.count + 1;
    } else {
      urls[anchor.href] = {
        count: 1,
        ae: status === LINK_STATUS__AFFILIATE || LINK_STATUS__UNKNOWN ? 1 : 0,
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
