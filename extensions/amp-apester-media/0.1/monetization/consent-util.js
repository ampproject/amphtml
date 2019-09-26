/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
  getConsentPolicyInfo,
  getConsentPolicyState,
} from '../../../../src/consent';

import {CONSENT_POLICY_STATE} from '../../../../src/consent-state';

const TAG = 'amp-apester-media';
/**
 * @param {AmpApesterMedia} apesterElement
 * @return {!JsonObject}
 * */
export function getConsentData(apesterElement) {
  const consentStatePromise = getConsentPolicyState(apesterElement).catch(
    err => {
      apesterElement.dev().error(TAG, 'Error determining consent state', err);
      return CONSENT_POLICY_STATE.UNKNOWN;
    }
  );
  const consentStringPromise = getConsentPolicyInfo(apesterElement).catch(
    err => {
      apesterElement.dev().error(TAG, 'Error determining consent string', err);
      return null;
    }
  );
  return Promise.all([consentStatePromise, consentStringPromise]).then(
    consentDataResponse => {
      const consentStatus = consentDataResponse[0];
      const gdprString = consentDataResponse[1];
      //todo check right behavior
      switch (consentStatus) {
        case CONSENT_POLICY_STATE.SUFFICIENT:
          return {gdpr: 1, user_consent: 1, param4: gdprString};
        case CONSENT_POLICY_STATE.INSUFFICIENT:
        case CONSENT_POLICY_STATE.UNKNOWN:
          return {gdpr: 1, user_consent: 0, param4: gdprString};
        case CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED:
        default:
          return {};
      }
    }
  );
}
