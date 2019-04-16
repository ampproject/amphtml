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

import {
  PLATFORM_NAME,
  XCUST_ATTRIBUTE_NAME,
} from './constants';
import {Services} from '../../../src/services';
import {addParamsToUrl} from '../../../src/url';
import {dict} from '../../../src/utils/object';


/**
 * The waypoint class is responsible for building the URL to
 * Skimlinks affiliate API (also called affiliated URL).
 */
export class Waypoint {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!Object} skimOptions
   * @param {!./tracking.Tracking} tracking
   * @param {string} referrer
   */
  constructor(ampdoc, skimOptions, tracking, referrer) {
    /** @private {?./tracking.Tracking} */
    this.tracking_ = tracking;

    /** @private {string} */
    this.documentReferrer_ = referrer;

    /** @private {string} */
    this.canonicalUrl_ = Services.documentInfoForDoc(ampdoc).canonicalUrl;

    /** @private {string} */
    this.timezone_ = `${new Date().getTimezoneOffset()}`;

    /** @private {!Object} */
    this.skimOptions_ = skimOptions;
  }

  /**
   * Creates the go.skimresources.com version of the anchor's url.
   * @param {?HTMLElement} anchor
   * @return {?string}
   * @public
   */
  getAffiliateUrl(anchor) {
    if (!anchor) {
      return null;
    }

    const {
      pubcode,
      pageImpressionId,
      customTrackingId,
      guid,
    } = this.tracking_.getTrackingInfo();

    const xcust = anchor.getAttribute(XCUST_ATTRIBUTE_NAME) || customTrackingId;

    const queryParams = dict({
      'id': pubcode,
      'url': anchor.href,
      'sref': this.canonicalUrl_,
      'pref': this.documentReferrer_,
      'xguid': guid,
      'xuuid': pageImpressionId,
      'xtz': this.timezone_,
      'xs': '1', // Always use source_app=1 (skimlinks)
      'jv': PLATFORM_NAME,
    });
    if (xcust) {
      queryParams['xcust'] = xcust;
    }
    const affiliationUrl = this.skimOptions_.waypointBaseUrl;
    return addParamsToUrl(affiliationUrl, /** @type {!JsonObject} */ (queryParams));
  }
}
