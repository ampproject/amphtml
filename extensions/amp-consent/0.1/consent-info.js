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

import {dev} from '../../../src/log';

/**
 * @enum {number}
 */
export const CONSENT_ITEM_STATE = {
  ACCEPTED: 1,
  REJECTED: 2,
  DISMISSED: 3,
  NOT_REQUIRED: 4,
  UNKNOWN: 5,
  // TODO(@zhouyx): Seperate UI state from consent state. Add consent
  // requirement state ui_state = {pending, active, complete} consent_state =
  // {unknown, accepted, rejected}
};

/**
 * @typedef {{
 *  consentState: CONSENT_ITEM_STATE,
 *  consentString: (string|undefined),
 *  isDirty: (boolean|undefined),
 * }}
 */
export let ConsentInfoDef;

/**
 * Convert the legacy storage value to Consent Info
 * @param {boolean|undefined} value
 * @return {ConsentInfoDef}
 */
export function getStoredConsentInfo(value) {
  if (value === undefined) {
    return constructConsentInfo(
        CONSENT_ITEM_STATE.UNKNOWN, undefined, undefined);
  }
  if (typeof value === 'boolean') {
    // legacy format
    return getLegacyStoredConsentInfo(value);
  }
  throw dev().createError('Invalid stored consent value');
}

/**
 * Convert the legacy boolean stored value to consentInfo object
 * @param {boolean} value
 * @return {!ConsentInfoDef}
 */
function getLegacyStoredConsentInfo(value) {
  const state = value ? CONSENT_ITEM_STATE.ACCEPTED :
    CONSENT_ITEM_STATE.REJECTED;
  return constructConsentInfo(state, undefined, undefined);
}

/**
 * Construct the consentInfo object from values
 * @param {CONSENT_ITEM_STATE} consentState
 * @param {string|undefined} consentString
 * @param {boolean|undefined} isDirty
 * @return {!ConsentInfoDef}
 */
function constructConsentInfo(consentState, consentString, isDirty) {
  return {
    'consentState': consentState,
    'consentString': consentString,
    'isDirty': isDirty,
  };
}
