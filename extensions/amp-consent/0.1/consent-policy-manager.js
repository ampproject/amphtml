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

    this.policyInstances_ = {};
  }

  /**
   * Register the policy instance
   * @param {string} unusedPolicyId
   */
  registerConsentPolicyInstance(unusedPolicyId) {

  }

  /**
   * Handler to check policy instance state on consent state changed.
   * @param {!Object} unusedConsentState
   */
  consentStateChangeHandler_(unusedConsentState) {

  }

  /**
   * Returns a promise with a consent states value
   * @param {string} unusedPolicyId
   * @return {Promise<CONSENT_POLICY_STATE>}
   */
  onPolicyInstanceResolved(unusedPolicyId) {

  }
}
