/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {isExperimentOn} from '../../../src/experiments';
import {fromClass} from '../../../src/service';
import {xhrFor} from '../../../src/xhr';
import {viewerFor} from '../../../src/viewer';
import {dev} from '../../../src/log';

/** @private @const {string} */
const TAG = 'amp-share-tracking';

/**
 * @export
 * @typedef {{
 *   outgoingFragment: string
 * }}
 */
let ShareTrackingPostResponseDef;

export class AmpShareTracking extends AMP.BaseElement {
  /**
    * @return {boolean}
    * @private
    */
  isExperimentOn_() {
    return isExperimentOn(this.getWin(), TAG);
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    return true;
  }

  /** @override */
  createdCallback() {
    if (!this.isExperimentOn_()) {
      dev.warn(TAG, `TAG ${TAG} disabled`);
      return;
    }

    /** @private @const {!Window} */
    this.win_ = this.getWin();

    /** @private @const {!ShareTrackingService} */
    this.shareTrackingService_ = getShareTrackingService_(this.win_);
  }

  /** @override */
  buildCallback() {
    if (!this.isExperimentOn_()) {
      dev.warn(TAG, `TAG ${TAG} disabled`);
      return;
    }

    this.vendorHref = this.element.getAttribute('data-href');
    dev.fine(TAG, 'vendorHref: ', this.vendorHref);

    return Promise.all([
      this.shareTrackingService_.getIncomingFragment(),
      this.shareTrackingService_.getOutgoingFragment(this.vendorHref)]).then(
        results => {
          this.incomingFragment = results[0];
          this.outgoingFragment = results[1];
          dev.fine(TAG, 'get incoming fragment: ' + this.incomingFragment);
          dev.fine(TAG, 'get outgoing fragment: ' + this.outgoingFragment);
        });
  }
}

/**
 * ShareTrackingService processes the incoming and outgoing url fragment
 */
export class ShareTrackingService {
  constructor(window) {
    this.win_ = window;
  }

  /**
   * Get the incoming share-tracking fragment from the url
   * @return {!Promise<string>}
   */
  getIncomingFragment() {
    // remove the #
    const hash = this.win_.location.hash.substr(1);

    // when the url contains the share-tracking identifier directly
    if (hash.indexOf('.') == 0) {
      const endIndex = hash.indexOf('&');
      if (endIndex != -1) {
        return Promise.resolve(hash.substr(1, (endIndex - 1)));
      } else {
        return Promise.resolve(hash.substr(1));
      }
    }

    // get the share-tracking identifier from the viewer
    return viewerFor(this.win_).getShareTrackingIncomingFragment();
  }

  /**
   * Get an outgoing share-tracking fragment
   * @return {!Promise<string>}
   */
  getOutgoingFragment(vendorUrl) {
    if (vendorUrl) {
      return this.getOutgoingFragmentFromVendor(vendorUrl).then(
        response => {
          if (!response.outgoingFragment) {
            dev.warn(TAG, 'The response from [' + vendorUrl +
                '] does not have an outgoingFragment value. ' +
                'Generating outgoing fragment using random generator.');
            return this.getOutgoingFragmentRandomly();
          } else {
            return Promise.resolve(response.outgoingFragment);
          }
        }
      );
    } else {
      return this.getOutgoingFragmentRandomly();
    }
  }

  /**
   * Get an outgoing share-tracking fragment from vendor
   * by issueing a post request to the url the vendor provided
   * @return {!Promise<!ShareTrackingPostResponseDef>}
   */
  getOutgoingFragmentFromVendor(vendorUrl) {
    const postReq = {
      method: 'POST',
      credentials: 'include',
      body: {},
    };
    return xhrFor(this.win_).fetchJson(vendorUrl, postReq);
  }

  /**
   * Get a random outgoing share-tracking fragment
   * @return {!Promise<string>}
   */
  getOutgoingFragmentRandomly() {
    const randomFragment = this.getRandomFragment();
    return Promise.resolve(randomFragment);
  }

  /**
   * Get a random fragment
   * @return {!string}
   */
  getRandomFragment() {
    // TODO(yuxichen): generate random fragment
    return 'rAmDoM';
  }
}

/**
 * @param {!Window} window
 * @return {!ShareTrackingService}
 * @private
 */
function getShareTrackingService_(window) {
  return fromClass(window, 'shareTrackingService', ShareTrackingService);
}

/**
 * @param {!Window} window
 * @return {!ShareTrackingService}
 */
export function installShareTrackingService(window) {
  return getShareTrackingService_(window);
}

installShareTrackingService(AMP.win);

AMP.registerElement('amp-share-tracking', AmpShareTracking);
