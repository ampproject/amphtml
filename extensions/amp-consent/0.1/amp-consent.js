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

import {CSS} from '../../../build/amp-consent-0.1.css';
import {ConsentPolicyManager} from './consent-policy-manager';
import {ConsentStateManager} from './consent-state-manager';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {assertHttpsUrl} from '../../../src/url';
import {
  childElementsByTag,
  isJsonScriptTag,
} from '../../../src/dom';
import {dict} from '../../../src/utils/object';
import {getServicePromiseForDoc} from '../../../src/service';
import {isExperimentOn} from '../../../src/experiments';
import {parseJson} from '../../../src/json';
import {user} from '../../../src/log';

const CONSENT_STATE_MANAGER = 'consentStateManager';
const CONSENT_POLICY_MANGER = 'consentPolicyManager';
const AMP_CONSENT_EXPERIMENT = 'amp-consent';
const TAG = 'amp-consent';


export class AmpConsent extends AMP.BaseElement {
  constructor(element) {
    super(element);

    /** @private {?./consent-state-manager.ConsentStateManager} */
    this.consentStateManager_ = null;

    /** @private {?./consent-policy-manager.ConsentPolicyManager} */
    this.consentPolicyManager_ = null;

    /** @private {!JsonObject} */
    this.consentConfig_ = dict();

    /** @private {!JsonObject} */
    this.policyConfig_ = dict();

    /** @private {!Object} */
    this.consentUIRequired_ = {};
  }

  buildCallback() {
    if (!isExperimentOn(this.win, AMP_CONSENT_EXPERIMENT)) {
      return;
    }

    // TODO: Decide what to do with incorrect configuration.
    this.assertAndParseConfig_();

    getServicePromiseForDoc(this.getAmpDoc(), CONSENT_POLICY_MANGER)
        .then(manager => {
          this.consentPolicyManager_ = manager;
          this.generateDefaultPolicy_();
          const policyKeys = Object.keys(this.policyConfig_);
          for (let i = 0; i < policyKeys.length; i++) {
            this.consentPolicyManager_.registerConsentPolicyInstance(
                policyKeys[i], this.policyConfig_[policyKeys[i]]);
          }
        });

    getServicePromiseForDoc(this.getAmpDoc(), CONSENT_STATE_MANAGER)
        .then(manager => {
          this.consentStateManager_ = manager;
          this.init_();
        });

  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /**
   * Init the amp-consent by registering and initiate consent instance.
   */
  init_() {
    const instanceKeys = Object.keys(this.consentConfig_);
    for (let i = 0; i < instanceKeys.length; i++) {
      const instanceId = instanceKeys[i];
      this.consentStateManager_.registerConsentInstance(instanceId);
      this.getConsentRemote_(instanceId).then(response => {
        this.parseConsentResponse_(instanceId, response);
        this.handleUI_(instanceId);
      }).catch(unusedError => {
        // TODO: Handle errors
      });
    }
  }

  /**
   * Generate default consent policy if not defined
   */
  generateDefaultPolicy_() {
    if (this.policyConfig_ && this.policyConfig_['default']) {
      return;
    }
    // Generate default policy
    const instanceKeys = Object.keys(this.consentConfig_);
    const defaultWaitForItems = {};
    for (let i = 0; i < instanceKeys.length; i++) {
      // TODO: Need to support an array.
      defaultWaitForItems[instanceKeys[i]] = undefined;
    }
    const defaultPolicy = {
      'waitFor': defaultWaitForItems,
    };
    this.policyConfig_['default'] = defaultPolicy;
  }

  /**
   * Get localStored consent info, and send request to get consent from endpoint
   * @param {string} instanceId
   * @return {!Promise<!JsonObject>}
   */
  getConsentRemote_(instanceId) {
    // Note: Expect the request to look different in following versions.
    const request = /** @type {!JsonObject} */ ({
      'consentInstanceId': instanceId,
    });
    const init = {
      credentials: 'include',
      method: 'POST',
      body: request,
      requireAmpResponseSourceOrigin: false,
    };
    const href =
        this.consentConfig_[instanceId]['checkConsentHref'];
    assertHttpsUrl(href, this.element);
    return Services.xhrFor(this.win)
        .fetchJson(href, init)
        .then(res => res.json());
  }


  /**
   * Read and parse consent instance config
   * An example valid config json looks like
   * {
   *   "consents": {
   *     "consentABC": {
   *       "checkConsentHref": "https://fake.com"
   *     }
   *   }
   * }
   * TODO: Add support for policy config
   */
  assertAndParseConfig_() {
    // All consent config within the amp-consent component. There will be only
    // one single amp-consent allowed in page.
    // TODO: Make this a shared helper method.
    const scripts = childElementsByTag(this.element, 'script');
    user().assert(scripts.length == 1,
        `${TAG} should have (only) one <script> child`);
    const script = scripts[0];
    user().assert(isJsonScriptTag(script),
        `${TAG} consent instance config should be put in a <script>` +
        'tag with type= "application/json"');
    const config = parseJson(script.textContent);
    const consents = config['consents'];
    user().assert(consents, `${TAG}: consents config is required`);
    this.consentConfig_ = consents;
  }

  /**
   * Parse response from server endpoint
   * The response format example:
   * {
   *   "consentRequired": true/false
   * }
   * TODO: Support vendor lists
   * @param {string} instanceId
   * @param {?JsonObject} response
   */
  parseConsentResponse_(instanceId, response) {
    if (!response || !response['consentRequired']) {
      //Do not need to block.
      this.consentUIRequired_[instanceId] = false;
      this.consentStateManager_.ignoreConsentInstance(instanceId);
      return;
    } else {
      // TODO: Check for current consent state and decide if UI is required.
      this.consentUIRequired_[instanceId] = true;
    }
  }

  /**
   * Handle UI.
   * @param {string} instanceId
   */
  handleUI_(instanceId) {
    // Prompt UI based on other UI on display and promptList for the instance.
    if (!this.consentUIRequired_[instanceId]) {
      return;
    }
  }
}

AMP.extension('amp-consent', '0.1', AMP => {
  AMP.registerElement('amp-consent', AmpConsent, CSS);
  AMP.registerServiceForDoc(CONSENT_STATE_MANAGER, ConsentStateManager);
  AMP.registerServiceForDoc(CONSENT_POLICY_MANGER, ConsentPolicyManager);
});
