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
import {CONSENT_POLICY_STATE} from '../../../src/consent-state';
import {dev} from '../../../src/log';
import {getServicePromiseForDoc} from '../../../src/service';
import {map} from '../../../src/utils/object';

const CONSENT_STATE_MANAGER = 'consentStateManager';
const TAG = 'consent-policy-manager';

export class ConsentPolicyManager {
  constructor(ampdoc) {
    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!Object<string, ?Promise>} */
    this.policyInstancePromise_ = map();

    /** @private {!Object<string, ?function()>} */
    this.policyInstancePromiseResolver_ = map();

    /** @private {!Object<string, ConsentPolicyInstance>} */
    this.instances_ = map();

    /** @private {!Promise} */
    this.ConsentStateManagerPromise_ =
        getServicePromiseForDoc(this.ampdoc_, CONSENT_STATE_MANAGER);
  }

  /**
   * Register the policy instance
   * Example policy config format:
   * {
   *   "waitFor": {
   *     "consentABC": [], // Can't support array now. All items will be treated as an empty array
   *     "consentDEF": []
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

    /** @private {!Object<string, CONSENT_ITEM_STATE>} */
    this.itemMap_ = map();

    /** @private {number} */
    this.pendingItemCount_ = 0;

    /** @private {number} */
    this.rejectedItemCount_ = 0;

    /** @private {?function(CONSENT_POLICY_STATE)} */
    this.readyPromiseResolver_ = null;

    /** @private {!Promise<CONSENT_POLICY_STATE>} */
    this.readyPromise_ = new Promise(resolve => {
      this.readyPromiseResolver_ = resolve;
    });

    this.init_(pendingItems);
  }

  /**
   * @param {!Array<string>} pendingItems
   */
  init_(pendingItems) {
    for (let i = 0; i < pendingItems.length; i++) {
      this.itemMap_[pendingItems[i]] = CONSENT_ITEM_STATE.UNKNOWN;
    }
    this.pendingItemCount_ = Object.keys(this.itemMap_).length;
  }

  /**
   * consent instance state change handlerit
   * @param {string} consentId
   * @param {CONSENT_ITEM_STATE} state
   */
  consentStateChangeHandler(consentId, state) {
    // TODO: Keeping an array can have performance issue, change to using a map
    // if necessary.
    dev().assert(this.itemMap_[consentId] != undefined,
        `cannot find ${consentId} in policy state`);
    if (state == CONSENT_ITEM_STATE.GRANTED) {
      if (this.itemMap_[consentId] == CONSENT_ITEM_STATE.UNKNOWN) {
        this.pendingItemCount_--;
      }
      if (this.itemMap_[consentId] == CONSENT_ITEM_STATE.REJECTED) {
        this.rejectedItemCount_--;
      }
      this.itemMap_[consentId] = CONSENT_ITEM_STATE.GRANTED;
    }

    if (state == CONSENT_ITEM_STATE.REJECTED) {
      if (this.itemMap_[consentId] == CONSENT_ITEM_STATE.UNKNOWN) {
        this.pendingItemCount_--;
      }
      if (this.itemMap_[consentId] != CONSENT_ITEM_STATE.REJECTED) {
        this.rejectedItemCount_++;
      }
      this.itemMap_[consentId] = CONSENT_ITEM_STATE.REJECTED;
    }

    // We don't need to move around state UNKNOWN because it will be in pending
    // list at first.
    this.evaluate_();
  }


  evaluate_() {
    // TODO: Providing real time consent policy state to other components
    if (this.pendingItemCount_ != 0) {
      return;
    }

    if (!this.readyPromiseResolver_) {
      return;
    }

    if (this.rejectedItemCount_ == 0) {
      // Consent Sufficient
      this.readyPromiseResolver_(CONSENT_POLICY_STATE.SUFFICIENT);
    } else {
      this.readyPromiseResolver_(CONSENT_POLICY_STATE.INSUFFICIENT);
    }
    this.readyPromiseResolver_ = null;
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
