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
import {xhrFor} from '../../../src/services';
import {historyForDoc} from '../../../src/services';
import {getService} from '../../../src/service';
import {Layout} from '../../../src/layout';
import {base64UrlEncodeFromBytes} from '../../../src/utils/base64';
import {getCryptoRandomBytesArray} from '../../../src/utils/bytes';
import {dev, user} from '../../../src/log';

/** @private @const {string} */
const TAG = 'amp-share-tracking';

/** @private @const {number} */
const SHARE_TRACKING_NUMBER_OF_BYTES = 6;

/**
 * @visibleForTesting
 */
export class AmpShareTracking extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.vendorHref_ = '';

    /** @private {?Promise<!Object<string, string>>} */
    this.shareTrackingFragments_ = null;

    /** @private {string} */
    this.originalViewerFragment_ = '';
  }

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
    if (!this.isExperimentOn_()) {
      getService(this.win, 'share-tracking',
          () => Promise.reject(user().createError(TAG + ' disabled')));
      user().assert(false, `${TAG} experiment is disabled`);
    }

    this.vendorHref_ = this.element.getAttribute('data-href');
    dev().fine(TAG, 'vendorHref_: ', this.vendorHref_);

    this.shareTrackingFragments_ = Promise.all(
      [this.getIncomingFragment_(), this.getOutgoingFragment_()]
    ).then(results => {
      const incomingFragment = results[0];
      const outgoingFragment = results[1];
      dev().fine(TAG, 'incomingFragment: ', incomingFragment);
      dev().fine(TAG, 'outgoingFragment: ', outgoingFragment);
      if (outgoingFragment && outgoingFragment != '') {
        const newFragment = this.getNewViewerFragment_(incomingFragment,
            outgoingFragment);
        this.getHistory_().updateFragment(newFragment);
      }
      return {incomingFragment, outgoingFragment};
    });

    getService(this.win, 'share-tracking', () => this.shareTrackingFragments_);
  }

  /**
   * Get the incoming share-tracking fragment from the viewer
   * @return {!Promise<string>}
   * @private
   */
  getIncomingFragment_() {
    return this.getOriginalViewerFragment_().then(fragment => {
      // The share tracking fragment should be the first parameter and start
      // with dot in the url fragment
      const match = fragment.match(/^\.([^&]*)/);
      return match ? match[1] : '';
    });
  }

  /**
   * Get the original url fragment from the viewer
   * @return {!Promise<string>}
   * @private
   */
  getOriginalViewerFragment_() {
    return this.getHistory_().getFragment().then(fragment => {
      this.originalViewerFragment_ = fragment;
      return fragment;
    });
  }


  /**
   * Get an outgoing share-tracking fragment
   * @return {!Promise<string>}
   * @private
   */
  getOutgoingFragment_() {
    if (this.vendorHref_) {
      return this.getOutgoingFragmentFromVendor_(this.vendorHref_);
    }
    return Promise.resolve(base64UrlEncodeFromBytes(
        this.getShareTrackingRandomBytes_()));
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
   * Get a random bytes array that has 48 bits (6 bytes).
   * Use win.crypto.getRandomValues if it is available.
   * Otherwise, use Math.random as fallback.
   * @return {!Uint8Array}
   * @private
   */
  getShareTrackingRandomBytes_() {
    // Use win.crypto.getRandomValues to get 48 bits of random value
    let bytes = getCryptoRandomBytesArray(this.win,
        SHARE_TRACKING_NUMBER_OF_BYTES); // 48 bit

    // Support for legacy browsers
    if (!bytes) {
      bytes = new Uint8Array(SHARE_TRACKING_NUMBER_OF_BYTES);
      let random = Math.random();
      for (let i = 0; i < SHARE_TRACKING_NUMBER_OF_BYTES; i++) {
        random *= 256;
        bytes[i] = Math.floor(random);
        random -= bytes[i];
      }
    }
    return bytes;
  }

  /**
   * Generate the new url fragment by replacing incoming share tracking fragment
   * with outgoing share tracking fragment.
   * The original fragment is not modified.
   * @param {string} incomingFragment
   * @param {string} outgoingFragment
   * @return {string}
   * @private
   */
  getNewViewerFragment_(incomingFragment, outgoingFragment) {
    const fragmentResidual = incomingFragment ?
        this.originalViewerFragment_.substr(incomingFragment.length + 1) :
        this.originalViewerFragment_;
    let result = '.' + outgoingFragment;
    if (fragmentResidual) {
      if (fragmentResidual[0] != '&') {
        result += '&';
      }
      result += fragmentResidual;
    }
    return result;
  }

  /** @private @return {!../../../src/service/history-impl.History} */
  getHistory_() {
    return historyForDoc(this.getAmpDoc());
  }

}


// Install the extension.
AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerElement(TAG, AmpShareTracking);
});
