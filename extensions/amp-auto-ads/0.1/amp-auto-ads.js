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
import {user} from '../../../src/log';
import {viewerForDoc, xhrFor} from '../../../src/services';
import {getAdNetworkConfig} from './ad-network-config';
import {isExperimentOn} from '../../../src/experiments';
import {getAttributesFromConfigObj} from './attributes';
import {getPlacementsFromConfigObj} from './placement';

/** @const */
const TAG = 'amp-auto-ads';

/**
 * The window property used to ensure that amp-auto-ads only runs once.
 * @const
 */
const ALREADY_RUN_PROPERTY = '__AMP__AUTO_ADS_HAS_RUN';

class AmpAutoAds {
  /**
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!Node} setupNode
   */
  constructor(ampdoc, setupNode) {
    /** @const @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @const @private {!Node} */
    this.setupNode_ = setupNode;
  }

  run() {
    const win = this.ampdoc_.win;
    user().assert(isExperimentOn(win, 'amp-auto-ads'), 'Experiment is off');

    const type = this.setupNode_.getAttribute('type');
    user().assert(type, 'Missing type attribute');

    const adNetwork = getAdNetworkConfig(
        this.ampdoc_, type, this.setupNode_.dataset);
    user().assert(adNetwork, 'No AdNetworkConfig for type: ' + type);

    if (!adNetwork.isEnabled()) {
      return;
    }

    user().assert(!win[ALREADY_RUN_PROPERTY], 'amp-auto-ads has already run');
    win[ALREADY_RUN_PROPERTY] = true;

    this.getConfig_(adNetwork.getConfigUrl()).then(configObj => {
      if (!configObj) {
        return;
      }

      const placements = getPlacementsFromConfigObj(win, configObj);
      const attributes = Object.assign(adNetwork.getAttributes(),
          getAttributesFromConfigObj(configObj));
      const adTracker = new AdTracker(
          getExistingAds(win), adNetwork.getAdConstraints());
      new AdStrategy(placements, attributes, adTracker).run();
    });
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
    return xhrFor(this.ampdoc_.win)
        .fetchJson(configUrl, xhrInit)
        .catch(reason => {
          user().error(TAG, 'amp-auto-ads config xhr failed: ' + reason);
          return null;
        });
  }
}

export class AmpAutoAdsElement extends AMP.BaseElement {

  /** @override */
  buildCallback() {
    new AmpAutoAds(this.getAmpDoc(), this.element).run();
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }
}

export class AmpAutoAdsService {
  /**
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @const @private {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = viewerForDoc(ampdoc);

    /** @private {boolean} */
    this.hasRun_ = false;

    this.registerCallback_();
  }

  /**
   * @private
   */
  registerCallback_() {
    this.ampdoc_.whenBodyAvailable().then(() => {
      if (!this.runOnceIfDocVisible_()) {
        this.viewer_.onVisibilityChanged(() => this.runOnceIfDocVisible_());
      }
    });
  }

  /**
   * @return {boolean} returns true if running of amp-auto-ads was attempted
   *    (regardless of success) either on this call or a previous one.
   * @private
   */
  runOnceIfDocVisible_() {
    if (!this.hasRun_ && this.viewer_.isVisible()) {
      this.hasRun_ = true;
      const setupNode = this.ampdoc_.win.document.querySelector(
          'META[name="amp-auto-ads-setup"]');
      if (setupNode) {
        new AmpAutoAds(this.ampdoc_, setupNode).run();
      }
    }
    return this.hasRun_;
  }
}


AMP.registerElement('amp-auto-ads', AmpAutoAdsElement);
AMP.registerServiceForDoc('amp-auto-ads-service', AmpAutoAdsService);
