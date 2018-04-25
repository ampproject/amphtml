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
import {dev, user} from '../../../src/log';
import {getServicePromiseForDoc} from '../../../src/service';
import {hasOwn, map} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';

export const MULTI_CONSENT_EXPERIMENT = 'multi-consent';
const CONSENT_STATE_MANAGER = 'consentStateManager';
const TAG = 'consent-policy-manager';


export class ConsentPolicyManager {
  constructor(ampdoc) {
    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!Object<string, ?Promise>} */
    this.policyInstancePromises_ = map();

    /** @private {!Object<string, ?function()>} */
    this.policyInstancePromiseResolvers_ = map();

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

    if (this.policyInstancePromiseResolvers_[policyId]) {
      this.policyInstancePromiseResolvers_[policyId]();
      this.policyInstancePromiseResolvers_[policyId] = null;
      this.policyInstancePromises_[policyId] = null;
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
   * @return {!Promise<CONSENT_POLICY_STATE>}
   */
  whenPolicyResolved(policyId) {
    if (!isExperimentOn(this.ampdoc_.win, MULTI_CONSENT_EXPERIMENT)) {
      // If customized policy is not supported
      if (policyId != 'default') {
        user().error(TAG, 'can not find policy, do not set value to ' +
            'data-block-on-consent');
        return Promise.resolve(CONSENT_POLICY_STATE.UNKNOWN);
      }
    }
    return this.whenPolicyInstanceReady_(policyId).then(() => {
      return this.instances_[policyId].getReadyPromise().then(() => {
        return this.instances_[policyId].getCurrentPolicyStatus();
      });
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
    if (!this.policyInstancePromises_[policyId]) {
      this.policyInstancePromises_[policyId] = new Promise(resolve => {
        this.policyInstancePromiseResolvers_[policyId] = resolve;
      });
    }
    return /** @type {!Promise} */ (this.policyInstancePromises_[policyId]);
  }
}

export class ConsentPolicyInstance {
  constructor(pendingItems) {

    /** @private {!Object<string, ?CONSENT_ITEM_STATE>} */
    this.itemToConsentState_ = map();

    /** @private {?function()} */
    this.readyPromiseResolver_ = null;

    /** @private {!Promise} */
    this.readyPromise_ = new Promise(resolve => {
      this.readyPromiseResolver_ = resolve;
    });

    /** @private {CONSENT_POLICY_STATE} */
    this.status_ = CONSENT_POLICY_STATE.UNKNOWN;
    this.init_(pendingItems);
  }

  /**
   * @param {!Array<string>} pendingItems
   */
  init_(pendingItems) {
    for (let i = 0; i < pendingItems.length; i++) {
      this.itemToConsentState_[pendingItems[i]] = null;
    }
  }

  /**
   * consent instance state change handlerit
   * @param {string} consentId
   * @param {CONSENT_ITEM_STATE} state
   */
  consentStateChangeHandler(consentId, state) {
    // TODO: Keeping an array can have performance issue, change to using a map
    // if necessary.
    dev().assert(hasOwn(this.itemToConsentState_, consentId),
        `cannot find ${consentId} in policy state`);

    if (state == CONSENT_ITEM_STATE.UNKNOWN) {
      // consent state has not been resolved yet.
      return;
    }


    if (state == CONSENT_ITEM_STATE.NOT_REQUIRED) {
      const shouldOverwrite =
          this.itemToConsentState_[consentId] != CONSENT_ITEM_STATE.GRANTED &&
          this.itemToConsentState_[consentId] != CONSENT_ITEM_STATE.REJECTED;
      // Ignore the consent item state and overwrite state value.
      if (shouldOverwrite) {
        this.itemToConsentState_[consentId] = CONSENT_ITEM_STATE.NOT_REQUIRED;
      }
    } else if (state == CONSENT_ITEM_STATE.DISMISSED) {
      // When dismissed, use the old value
      if (this.itemToConsentState_[consentId] === null) {
        this.itemToConsentState_[consentId] = CONSENT_ITEM_STATE.UNKNOWN;
      }
    } else {
      this.itemToConsentState_[consentId] = state;
    }

    this.evaluate_();
  }


  evaluate_() {
    // All consent instances need to be granted
    let isSufficient = true;

    // All consent instances need to be granted or ignored
    let isIgnored = true;

    // A single consent instance is unknown
    let isUnknown = false;

    // Decide to traverse item list every time instead of keeping reject/pending counts
    // Performance should be OK since we expect item list to be small.
    const items = Object.keys(this.itemToConsentState_);
    for (let i = 0; i < items.length; i++) {
      const consentId = items[i];
      if (this.itemToConsentState_[consentId] === null) {
        return;
      }

      if (this.itemToConsentState_[consentId] ==
          CONSENT_ITEM_STATE.NOT_REQUIRED) {
        isSufficient = false;
      }

      if (this.itemToConsentState_[consentId] == CONSENT_ITEM_STATE.REJECTED) {
        isSufficient = false;
        isIgnored = false;
      }

      if (this.itemToConsentState_[consentId] == CONSENT_ITEM_STATE.UNKNOWN) {
        isSufficient = false;
        isIgnored = false;
        isUnknown = true;
      }
    }

    let state = null;

    if (isSufficient) {
      state = CONSENT_POLICY_STATE.SUFFICIENT;
    } else if (isIgnored) {
      state = CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED;
    } else if (isUnknown) {
      state = CONSENT_POLICY_STATE.UNKNOWN;
    } else {
      state = CONSENT_POLICY_STATE.INSUFFICIENT;
    }

    this.status_ = state;

    if (this.readyPromiseResolver_) {
      this.readyPromiseResolver_();
      this.readyPromiseResolver_ = null;
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

  /**
   * Returns the current consent policy state
   * @return {CONSENT_POLICY_STATE}
   */
  getCurrentPolicyStatus() {
    return this.status_;
  }
}
