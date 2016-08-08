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
import {getService} from '../../../src/service';
import {Layout} from '../../../src/layout';
import {dev, user} from '../../../src/log';

/** @private @const {string} */
const TAG = 'amp-share-tracking';

/**
 * @visibleForTesting
 */
export class AmpShareTracking extends AMP.BaseElement {
  /**
    * @return {boolean}
    * @private
    */
  isExperimentOn_() {
    return isExperimentOn(this.win, TAG);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY || layout == Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    user().assert(this.isExperimentOn_(), `${TAG} experiment is disabled`);

    /** @private {string} */
    this.vendorHref_ = this.element.getAttribute('data-href');
    dev().fine(TAG, 'vendorHref_: ', this.vendorHref_);

    /** @private {!Promise<!Object<string, string>>} */
    this.shareTrackingFragments_ = Promise.all([
      this.getIncomingFragment_(),
      this.getOutgoingFragment_()]).then(results => {
        dev().fine(TAG, 'incomingFragment: ', results[0]);
        dev().fine(TAG, 'outgoingFragment: ', results[1]);
        return {
          incomingFragment: results[0],
          outgoingFragment: results[1],
        };
      });

    getService(this.win, 'share-tracking', () => this.shareTrackingFragments_);
  }

  /**
   * Get the incoming share-tracking fragment from the viewer
   * @return {!Promise<string>}
   * @private
   */
  getIncomingFragment_() {
    dev().fine(TAG, 'getting incoming fragment');
    return viewerFor(this.win).getFragment().then(fragment => {
      const match = fragment.match(/\.([^&]*)/);
      return match ? match[1] : '';
    });
  }

  /**
   * Get an outgoing share-tracking fragment
   * @return {!Promise<string>}
   * @private
   */
  getOutgoingFragment_() {
    dev().fine(TAG, 'getting outgoing fragment');
    if (this.vendorHref_) {
      return this.getOutgoingFragmentFromVendor_(this.vendorHref_);
    }
    return this.getOutgoingRandomFragment_();
  }

  /**
   * Get an outgoing share-tracking fragment from vendor
   * by issueing a post request to the url the vendor provided
   * @param {string} vendorUrl
   * @return {!Promise<string>}
   * @private
   */
  getOutgoingFragmentFromVendor_(vendorUrl) {
    const postReq = {
      method: 'POST',
      credentials: 'include',
      requireAmpResponseSourceOrigin: true,
      body: {},
    };
    return xhrFor(this.win).fetchJson(vendorUrl, postReq).then(response => {
      if (response.fragment) {
        return response.fragment;
      }
      user().error(TAG, 'The response from [' + vendorUrl + '] does not ' +
          'have a fragment value.');
      return '';
    }, err => {
      user().error(TAG, 'The request to share-tracking endpoint failed:' + err);
      return '';
    });
  }

  /**
   * Get a random outgoing share-tracking fragment
   * @return {!Promise<string>}
   * @private
   */
  getOutgoingRandomFragment_() {
    // TODO(yuxichen): Generate random outgoing fragment
    const randomFragment = 'rAmDoM';
    return Promise.resolve(randomFragment);
  }
}

AMP.registerElement('amp-share-tracking', AmpShareTracking);
