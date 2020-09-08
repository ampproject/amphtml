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
  CONSENT_POLICY_STATE, // eslint-disable-line no-unused-vars
} from './consent-state';
import {Services} from './services';

/**
 * Returns a promise that resolve when all consent state the policy wait
 * for resolve. Or if consent service is not available.
 * @param {!Element|!ShadowRoot} element
 * @param {string=} policyId
 * @return {!Promise<?CONSENT_POLICY_STATE>}
 */
export function getConsentPolicyState(element, policyId = 'default') {
  return Services.consentPolicyServiceForDocOrNull(element).then(
    (consentPolicy) => {
      if (!consentPolicy) {
        return null;
      }
      return consentPolicy.whenPolicyResolved(/** @type {string} */ (policyId));
    }
  );
}

/**
 * Returns a promise that resolves to a sharedData retrieved from consent
 * remote endpoint.
 * @param {!Element|!ShadowRoot} element
 * @param {string} policyId
 * @return {!Promise<?Object>}
 */
export function getConsentPolicySharedData(element, policyId) {
  return Services.consentPolicyServiceForDocOrNull(element).then(
    (consentPolicy) => {
      if (!consentPolicy) {
        return null;
      }
      return consentPolicy.getMergedSharedData(
        /** @type {string} */ (policyId)
      );
    }
  );
}

/**
 * @param {!Element|!ShadowRoot} element
 * @param {string} policyId
 * @return {!Promise<string>}
 */
export function getConsentPolicyInfo(element, policyId) {
  // Return the stored consent string.
  return Services.consentPolicyServiceForDocOrNull(element).then(
    (consentPolicy) => {
      if (!consentPolicy) {
        return null;
      }
      return consentPolicy.getConsentStringInfo(
        /** @type {string} */ (policyId)
      );
    }
  );
}

/**
 * @param {!Element|!ShadowRoot} element
 * @param {string} policyId
 * @return {!Promise<?Object|undefined>}
 */
export function getConsentMetadata(element, policyId = 'default') {
  // Return the stored consent metadata.
  return Services.consentPolicyServiceForDocOrNull(element).then(
    (consentPolicy) => {
      if (!consentPolicy) {
        return null;
      }
      return consentPolicy.getConsentMetadataInfo(
        /** @type {string} */ (policyId)
      );
    }
  );
}

/**
 * Determine if an element needs to be blocked by consent based on meta tags.
 * @param {*} element
 * @return {boolean}
 */
export function shouldBlockOnConsentByMeta(element) {
  const ampdoc = element.getAmpDoc();
  let content = ampdoc.getMetaByName('amp-consent-blocking');
  if (!content) {
    return false;
  }

  // Handles whitespace
  content = content.toUpperCase().replace(/\s+/g, '');

  const contents = /** @type {Array<string>} */ (content.split(','));
  return contents.includes(element.tagName);
}
