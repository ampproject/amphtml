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

import {AdStrategy} from './ad-strategy';
import {
  AdTracker,
  getAdConstraintsFromConfigObj,
  getExistingAds,
} from './ad-tracker';
import {AnchorAdStrategy} from './anchor-ad-strategy';
import {Services} from '../../../src/services';
import {getAdNetworkConfig} from './ad-network-config';
import {getAttributesFromConfigObj} from './attributes';
import {getPlacementsFromConfigObj} from './placement';
import {isExperimentOn} from '../../../src/experiments';
import {userAssert} from '../../../src/log';

/** @const */
const TAG = 'amp-auto-ads';

/** @const */
const AD_TAG = 'amp-ad';

export class AmpAutoAds extends AMP.BaseElement {
  /** @override */
  buildCallback() {
    userAssert(isExperimentOn(this.win, 'amp-auto-ads'), 'Experiment is off');

    const type = this.element.getAttribute('type');
    userAssert(type, 'Missing type attribute');

    const adNetwork = getAdNetworkConfig(type, this.element);
    userAssert(adNetwork, 'No AdNetworkConfig for type: ' + type);

    if (!adNetwork.isEnabled(this.win)) {
      return;
    }

    const ampdoc = this.getAmpDoc();
    Services.extensionsFor(this.win)./*OK*/ installExtensionForDoc(
      ampdoc,
      AD_TAG
    );

    const viewer = Services.viewerForDoc(this.getAmpDoc());
    const whenVisible = viewer.whenFirstVisible();

    whenVisible
      .then(() => {
        return this.getConfig_(adNetwork.getConfigUrl());
      })
      .then(configObj => {
        if (!configObj) {
          return;
        }
        const noConfigReason = configObj['noConfigReason'];
        if (noConfigReason) {
          this.user().warn(TAG, noConfigReason);
          return;
        }

        const placements = getPlacementsFromConfigObj(ampdoc, configObj);
        const attributes = /** @type {!JsonObject} */ (Object.assign(
          adNetwork.getAttributes(),
          getAttributesFromConfigObj(configObj)
        ));
        const sizing = adNetwork.getSizing();
        const adConstraints =
          getAdConstraintsFromConfigObj(ampdoc, configObj) ||
          adNetwork.getDefaultAdConstraints();
        const adTracker = new AdTracker(getExistingAds(ampdoc), adConstraints);
        new AdStrategy(
          placements,
          attributes,
          sizing,
          adTracker,
          adNetwork.isResponsiveEnabled()
        ).run();
        new AnchorAdStrategy(ampdoc, attributes, configObj).run();
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
   * @return {!Promise<!JsonObject>}
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
    return Services.xhrFor(this.win)
      .fetchJson(configUrl, xhrInit)
      .then(res => res.json())
      .catch(reason => {
        this.user().error(TAG, 'amp-auto-ads config xhr failed: ' + reason);
        return null;
      });
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpAutoAds);
});
