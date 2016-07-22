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
import {xhrFor} from '../../../src/xhr';
import {viewerFor} from '../../../src/viewer';
import {dev, user} from '../../../src/log';

/** @private @const {string} */
const TAG = 'amp-share-tracking';

export class AmpShareTracking extends AMP.BaseElement {
  /**
    * @return {boolean}
    * @private
    */
  isExperimentOn_() {
    return isExperimentOn(this.win, TAG);
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    return true;
  }

  /** @override */
  buildCallback() {
    if (!this.isExperimentOn_()) {
      dev.warn(TAG, `TAG ${TAG} disabled`);
      return;
    }

    /** @private {string} */
    this.vendorHref_ = this.element.getAttribute('data-href');
    dev.fine(TAG, 'vendorHref_: ', this.vendorHref_);

    /** @private {!Promise<!Object>} */
    this.shareTrackingFragments_ = Promise.all([
      this.getIncomingFragment_(),
      this.getOutgoingFragment_(this.vendorHref_)]).then(results => {
        dev.fine(TAG, 'incomingFragment: ', results[0]);
        dev.fine(TAG, 'outgoingFragment: ', results[1]);
        return {
          incomingFragment: results[0],
          outgoingFragment: results[1],
        };
      });
  }

  /**
   * Get the incoming share-tracking fragment from the viewer
   * @return {!Promise<string|undefined>}
   * @private
   */
  getIncomingFragment_() {
    return viewerFor(this.win).getFragment().then(fragment => {
      if (!fragment || fragment.indexOf('.') != 0) {
        return;
      }
      const endIndex = fragment.indexOf('&');
      if (endIndex != -1) {
        return fragment.substr(1, (endIndex - 1));
      } else {
        return fragment.substr(1);
      }
    });
  }

  /**
   * Get an outgoing share-tracking fragment
   * @param {string=} opt_vendorUrl
   * @return {!Promise<string|undefined>}
   * @private
   */
  getOutgoingFragment_(opt_vendorUrl) {
    if (opt_vendorUrl) {
      return this.getOutgoingFragmentFromVendor_(opt_vendorUrl);
    }
    return this.getOutgoingRandomFragment_();
  }

  /**
   * Get an outgoing share-tracking fragment from vendor
   * by issueing a post request to the url the vendor provided
   * @param {string} vendorUrl
   * @return {!Promise<string|undefined>}
   * @private
   */
  getOutgoingFragmentFromVendor_(vendorUrl) {
    const postReq = {
      method: 'POST',
      credentials: 'include',
      body: {},
    };
    return xhrFor(this.win).fetchJson(vendorUrl, postReq).then(response => {
      if (response.fragment) {
        return response.fragment;
      } else {
        user.error(TAG, 'The response from [' + vendorUrl + '] does not ' +
            'have an outgoingFragment value. The outgoing fragment is empty.');
      }
    }).catch(error => {
      user.error(TAG, error);
    });
  }

  /**
   * Get a random outgoing share-tracking fragment
   * @return {!Promise<string>}
   * @private
   */
  getOutgoingRandomFragment_() {
    const randomFragment = 'rAmDoM';
    return Promise.resolve(randomFragment);
  }
}

AMP.registerElement('amp-share-tracking', AmpShareTracking);
