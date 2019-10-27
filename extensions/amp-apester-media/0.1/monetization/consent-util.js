/* eslint-disable google-camelcase/google-camelcase */

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

import {dict} from '../../../../src/utils/object';
import {
  getConsentPolicyInfo,
  getConsentPolicyState,
} from '../../../../src/consent';

import {dev} from '../../../../src/log';

import {CONSENT_POLICY_STATE} from '../../../../src/consent-state';

const TAG = 'amp-apester-media';

const awaitPromiseTimeout = response => {
  return new Promise(resolve => {
    const wait = setTimeout(() => {
      clearTimeout(wait);
      resolve(response);
    }, 3000);
  });
};
/**
 * @param {AmpElement} apesterElement
 * @return {Promise<!JsonObject>}
 * */
export function getConsentData(apesterElement) {
  const consentStatePromise = Promise.race([
    getConsentPolicyState(apesterElement, 'default'),
    awaitPromiseTimeout(CONSENT_POLICY_STATE.UNKNOWN),
  ]).catch(err => {
    dev().error(TAG, 'Error determining consent state', err);
    return CONSENT_POLICY_STATE.UNKNOWN;
  });
  const consentStringPromise = Promise.race([
    getConsentPolicyInfo(apesterElement, 'default').catch(err => {
      dev().error(TAG, 'Error determining consent string', err);
      return null;
    }),
    awaitPromiseTimeout(),
  ]);

  return Promise.all([consentStatePromise, consentStringPromise]).then(
    consentDataResponse => {
      const consentStatus = consentDataResponse[0];
      const gdprString = consentDataResponse[1];
      switch (consentStatus) {
        case CONSENT_POLICY_STATE.SUFFICIENT:
          return dict({'gdpr': 1, 'user_consent': 1, 'gdprString': gdprString});
        case CONSENT_POLICY_STATE.INSUFFICIENT:
        case CONSENT_POLICY_STATE.UNKNOWN:
          return dict({'gdpr': 1, 'user_consent': 0, 'gdprString': gdprString});
        case CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED:
        default:
          return {};
      }
    }
  );
}
