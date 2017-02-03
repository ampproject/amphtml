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

import {AdTracker, getExistingAds} from './ad-tracker';
import {AdStrategy} from './ad-strategy';
import {dev, user} from '../../../src/log';
import {xhrFor} from '../../../src/xhr';
import {getAdNetworkConfig} from './ad-network-config';
import {isExperimentOn} from '../../../src/experiments';
import {getPlacementsFromConfigObj} from './placement';

/** @const */
const TAG = 'amp-auto-ads';

/**
 * The target number of ads for the page. Both existing ads and any inserted by
 * amp-auto-ads count towards this.
 * TODO: Make this configurable via the JSON config returned by the ad network.
 * @const {number}
 */
const TARGET_AD_COUNT = 3;

/**
 * The minimum distance between any two ads in pixels. Auto ads will only be
 * inserted in positions where they are estimated to be a vertical distance of
 * this or more from any other ads.
 * TODO: Make this configurable via the JSON config returned by the ad network.
 * @const {number}
 */
const MIN_AD_SPACING = 500;


export class AmpAutoAds extends AMP.BaseElement {

  /** @override */
  buildCallback() {
    user().assert(isExperimentOn(self, 'amp-auto-ads'), 'Experiment is off');

    const type = this.element.getAttribute('type');
    user().assert(type, 'Missing type attribute');

    const adNetwork = getAdNetworkConfig(type, this.element);
    user().assert(adNetwork, 'No AdNetworkConfig for type: ' + type);

    this.getConfig_(adNetwork.getConfigUrl()).then(configObj => {
      const placements = getPlacementsFromConfigObj(this.win, configObj);
      const adTracker = new AdTracker(getExistingAds(this.win), MIN_AD_SPACING);
      new AdStrategy(type, placements, adNetwork.getDataAttributes(),
          adTracker, TARGET_AD_COUNT).run();
    });
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }

  /**
   * Tries to load an auto-ads configuration from the given URL. This uses a
   * non-credentialed request.
   * @param {string} configUrl
   * @return {!Promise<!JSONType>}
   * @private
   */
  getConfig_(configUrl) {
    // Non-credentialed request
    const xhrInit = {
      mode: 'cors',
      method: 'GET',
      credentials: 'omit',
      requireAmpResponseSourceOrigin: false,
    };
    return xhrFor(this.win)
        .fetchJson(configUrl, xhrInit)
        .catch(reason => {
          dev().error(TAG, 'amp-auto-ads config xhr failed: ' + reason);
          return null;
        });
  }
}

AMP.registerElement('amp-auto-ads', AmpAutoAds);
