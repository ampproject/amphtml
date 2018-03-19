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

import {CONSENT_ITEM_STATE} from './consent-state-manager';
import {dev} from '../../../src/log';
import {getServicePromiseForDoc} from '../../../src/service';

const CONSENT_STATE_MANAGER = 'consentStateManager';
const TAG = 'consent-policy-manager';

/**
 * Possible consent policy state to proceed with.
 * @enum {number}
 */
export const CONSENT_POLICY_STATE = {
  SUFFICIENT: 0,
  INSUFFICIENT: 1,
  UNKNOWN: 2,
};

export class ConsentPolicyManager {
  constructor(ampdoc) {
    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!Object<string, ?Promise>} */
    this.policyInstancePromise_ = {};

    /** @private {!Object<string, ?function()>} */
    this.policyInstancePromiseResolver_ = {};

    /** @private {!Object<string, ConsentPolicyInstance>} */
    this.instances_ = {};

    /** @private {!Promise} */
    this.ConsentStateManagerPromise_ =
        getServicePromiseForDoc(this.ampdoc_, CONSENT_STATE_MANAGER);
  }

  /**
   * Register the policy instance
   * Example policy config format:
   * {
   *   "waitFor": {
   *     "consentABC": undefined,
   *     "consentDEF": undefined
   *   }
   * }
   *
   * TODO: Add support to timeout
   * @param {string} policyId
   * @param {!JsonObject} config
   */
  registerConsentPolicyInstance(policyId, config) {
    dev().assert(!this.instances_[policyId],
        `${TAG}: instance already registered`);

    const waitFor = Object.keys(config['waitFor'] || {});

    const instance = new ConsentPolicyInstance(waitFor);

    this.instances_[policyId] = instance;

    if (this.policyInstancePromiseResolver_[policyId]) {
      this.policyInstancePromiseResolver_[policyId]();
      this.policyInstancePromiseResolver_[policyId] = null;
      this.policyInstancePromise_[policyId] = null;
    }

    this.ConsentStateManagerPromise_.then(manager => {
      for (let i = 0; i < waitFor.length; i++) {
        const consentId = waitFor[i];
        manager.whenConsentReady(consentId).then(() => {
          manager.onConsentStateChange(consentId, state => {
            instance.consentStateChangeHandler(consentId, state);
          });
        });
      }
    });
  }


  /**
   * Used to wait for policy to resolve;
   * @param {string} policyId
   * @return {!Promise}
   */
  whenPolicyResolved(policyId) {
    return this.whenPolicyInstanceReady_(policyId).then(() => {
      return this.instances_[policyId].getReadyPromise();
    });
  }

  /**
   * Wait for policy instance to be ready.
   * @param {string} policyId
   * @return {!Promise}
   */
  whenPolicyInstanceReady_(policyId) {
    if (this.instances_[policyId]) {
      return Promise.resolve();
    }
    if (!this.policyInstancePromise_[policyId]) {
      this.policyInstancePromise_[policyId] = new Promise(resolve => {
        this.policyInstancePromiseResolver_[policyId] = resolve;
      });
    }
    return /** @type {!Promise} */ (this.policyInstancePromise_[policyId]);
  }
}

export class ConsentPolicyInstance {
  constructor(pendingItems) {
    /** @private {!Array<string>} */
    this.pendingItems_ = pendingItems;

    /** @private {?function()} */
    this.readyPromiseResolver_ = null;

    /** @private {!Promise} */
    this.readyPromise_ = new Promise(resolve => {
      this.readyPromiseResolver_ = resolve;
    });
  }

  /**
   * consent instance state change handlerit
   * @param {string} consentId
   * @param {CONSENT_ITEM_STATE} state
   */
  consentStateChangeHandler(consentId, state) {
    // TODO: Keeping an array can have performance issue, change to using a map
    // if necessary.
    if (state == CONSENT_ITEM_STATE.GRANTED) {
      const index = this.pendingItems_.indexOf(consentId);
      if (index > -1) {
        this.pendingItems_.splice(index, 1);
      }
    }

    if (state == CONSENT_ITEM_STATE.REJECTED) {
      const index = this.pendingItems_.indexOf(consentId);
      if (index == -1) {
        this.pendingItems_.push(consentId);
      }
    }

    // We don't need to move around state UNKNOWN because it will be in pending
    // list at first.
    this.evaluate_();
  }


  evaluate_() {
    if (this.pendingItems_.length == 0) {
      this.readyPromiseResolver_();
      this.readyPromiseResolver_ = null;
    } else {
      // It's possible user toggle state. And ready promise needs to be reset
      // TODO: Do not reset ready promise in case of timeout
      if (!this.readyPromiseResolver_) {
        this.readyPromise_ = new Promise(resolve => {
          this.readyPromiseResolver_ = resolve;
        });
      }
    }
  }

  /**
   * Return a promise that resolved when policy ready.
   * Note: the promise can be reset if use toggle consent state
   * @return {!Promise}
   */
  getReadyPromise() {
    return this.readyPromise_;
  }
}
