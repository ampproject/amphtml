/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {Services} from '../../../src/services';
import {createElementWithAttributes} from '../../../src/dom';
import {dict} from '../../../src/utils/object';
import {user} from '../../../src/log';

const TAG = 'amp-auto-ads';
const STICKY_AD_TAG = 'amp-sticky-ad';
const OPT_IN_STATUS_ANCHOR_ADS = 2;


export class AnchorAdStrategy {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject<string, string>} baseAttributes Any attributes that
   *     should be added to any inserted ads.
   * @param {!JSONType} configObj
   */
  constructor(ampdoc, baseAttributes, configObj) {
    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const @private {!JsonObject<string, string>} */
    this.baseAttributes_ = baseAttributes;

    /** @const @private {!JSONType} */
    this.configObj_ = configObj;
  }

  /**
   * @return {!Promise<boolean>} Resolves when the strategy is complete.
   */
  run() {
    if (!this.isAnchorAdEnabled_()) {
      return Promise.resolve(false);
    }
    if (this.hasExistingStickyAd_()) {
      user().warn(TAG, 'exists <amp-sticky-ad>');
      return Promise.resolve(false);
    }
    Services.extensionsFor(this.ampdoc.win)./*OK*/installExtensionForDoc(
        this.ampdoc, STICKY_AD_TAG, '1.0');
    this.placeStickyAd_();
    return Promise.resolve(true);
  }

  /**
   * @return {boolean}
   * @private
   */
  hasExistingStickyAd_() {
    return !!this.ampdoc.getRootNode().querySelector('AMP-STICKY-AD');
  }

  /**
   * @return {boolean}
   * @private
   */
  isAnchorAdEnabled_() {
    const optInStatus = this.configObj_['optInStatus'];
    if (!optInStatus) {
      return false;
    }
    for (let i = 0; i < optInStatus.length; i++) {
      if (optInStatus[i] == OPT_IN_STATUS_ANCHOR_ADS) {
        return true;
      }
    }
    return false;
  }

  /**
   * @private
   */
  placeStickyAd_() {
    const viewportWidth =
        Services.viewportForDoc(this.ampdoc).getWidth();
    const attributes = /** @type {!JsonObject} */ (
      Object.assign(dict(), this.baseAttributes_, dict({
        'width': String(viewportWidth),
        'height': '100',
      })));
    const doc = this.ampdoc.win.document;
    const ampAd = createElementWithAttributes(
        doc, 'amp-ad', attributes);
    const stickyAd = createElementWithAttributes(
        doc, 'amp-sticky-ad', dict({'layout': 'nodisplay'}));
    stickyAd.appendChild(ampAd);
    const body = this.ampdoc.getBody();
    body.insertBefore(stickyAd, body.firstChild);
  }
}
