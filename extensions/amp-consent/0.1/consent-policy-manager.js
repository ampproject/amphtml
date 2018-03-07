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

import {
  CONSENT_ITEM_STATE,
  ConsentStateManager,
} from './consent-state-manager';
import {getServicePromiseForDoc} from '../../../src/service';


const CONSENT_STATE_MANAGER = 'consentStateManager';


/**
 * Possible consent policy state to proceed with.
 * @enum {number}
 */
export const CONSENT_POLICY_STATE = {
  SUFFIENT: 0,
  INSUFFICIENT: 1,
  UNKNOWN: 2,
};

export class ConsentPolicyManager {
  constructor(ampdoc) {
    this.ampdoc_ = ampdoc;

    this.policyPromise_ = {};

    this.policyResolver_ = {};

    this.ConsentStateManagerPromise_ =
        getServicePromiseForDoc(this.ampdoc_, CONSENT_STATE_MANAGER);
  }

  /**
   * Register the policy instance
   * @param {string} policyId
   * @param {!JsonObject} config
   */
  registerConsentPolicyInstance(policyId, config) {
    if (this.policyPromise_[policyId]) {
      return;
    }
    this.policyPromise_ = new Promise(resolve => {
      this.policyResolver_[policyId] = resolve;
    });

    this.initPolicy_(config);
  }

  initPolicy_(config) {
    this.ConsentStateManagerPromise_.then(manager => {
      const itemsToWait = Object.keys(config['itemsToWait']);
      for (let i = 0; i < itemsToWait.length; i++) {
        manager.onConsentStateChange(itemsToWait[i], state => {
          this.consentStateChangeHandler_(state);
        });
      }
    });
  }

  /**
   * Returns a promise with a consent states value
   * @param {string} unusedPolicyId
   * @return {Promise<CONSENT_POLICY_STATE>}
   */
  onPolicyInstanceResolved(unusedPolicyId) {

  }
}
