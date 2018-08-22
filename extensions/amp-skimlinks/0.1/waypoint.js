import {AFFILIATION_API, PLATFORM_NAME, XCUST_ATTRIBUTE_NAME } from './constants';
import {addParamsToUrl} from '../../../src/url';


export default class Waypoint {
  /**
   *
   * @param {*} tracking
   */
  constructor(tracking) {
    this.tracking_ = tracking;
  }

  /**
   *
   * @param {*} anchor
   */
  getAffiliateUrl(anchor) {
    if (!anchor) {
      return null;
    }

    const {
      pubcode,
      referrer,
      externalReferrer,
      timezone,
      pageImpressionId,
      customTrackingId,
      guid,
    } = this.tracking_.getTrackingInfo();

    const xcust = anchor.getAttribute(XCUST_ATTRIBUTE_NAME) || customTrackingId;
    const queryParams = {
      id: pubcode,
      url: anchor.href,
      sref: referrer,
      pref: externalReferrer,
      xguid: guid,
      xuuid: pageImpressionId,
      xtz: timezone,
      xs: '1', // Always use source_app=1 (skimlinks)
      platform: PLATFORM_NAME,
    };
    if (xcust) {
      queryParams.xcust = xcust;
    }

    return addParamsToUrl(AFFILIATION_API, queryParams);
  }
}
