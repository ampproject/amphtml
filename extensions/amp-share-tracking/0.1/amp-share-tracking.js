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
import {dev} from '../../../src/log';

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

    /** @private @const {!Window} */
    this.win_ = this.win;

    this.vendorHref = this.element.getAttribute('data-href');
    dev.fine(TAG, 'vendorHref: ', this.vendorHref);

    this.shareTrackingFragments = Promise.all([
      this.getIncomingFragment(),
      this.getOutgoingFragment(this.vendorHref)]).then(results => {
        const fragments = {};
        fragments.incomingFragment = results[0];
        fragments.outgoingFragment = results[1];
        return fragments;
      });

  }

  /**
   * Get the incoming share-tracking fragment from the viewer
   * @return {!Promise<string>}
   * @private
   */
  getIncomingFragment() {
    return viewerFor(this.win_).getFragment().then(hash => {
      if (!hash) {
        return Promise.resolve();
      }

      if (hash.indexOf('.') == 0) {
        const endIndex = hash.indexOf('&');
        if (endIndex != -1) {
          return Promise.resolve(hash.substr(1, (endIndex - 1)));
        } else {
          return Promise.resolve(hash.substr(1));
        }
      }
      return Promise.resolve();
    });
  }

  /**
   * Get an outgoing share-tracking fragment
   * @param {string=} vendorUrl
   * @return {!Promise<string>}
   * @private
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
            return response.outgoingFragment;
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
   * @return {!Promise<!{
   *   outgoingFragment: string
   * }>}
   * @private
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
   * @private
   */
  getOutgoingFragmentRandomly() {
    const randomFragment = 'rAmDoM';
    return Promise.resolve(randomFragment);
  }
}

AMP.registerElement('amp-share-tracking', AmpShareTracking);
