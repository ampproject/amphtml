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
import {hasOwn, map} from '../../../src/utils/object';
import {isEnumValue, isObject} from '../../../src/types';

/**
 * Key values for retriving/storing consent info object.
 * STATE: Set when user accept or reject consent.
 * STRING: Set when a consent string is used to store more granular consent info
 * on vendors.
 * CONSENT_TYPE: Set when a consent type is used to store more metadata on the consent string.
 * DITRYBIT: Set when the stored consent info need to be revoked next time.
 * @enum {string}
 */
export const STORAGE_KEY = {
  STATE: 's',
  STRING: 'r',
  CONSENT_TYPE: 'ct',
  IS_DIRTY: 'd',
};

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
 * @enum {number}
 */
export const CONSENT_TYPE = {
  TCF_V1: 1,
  TCF_V2: 2,
  US_PRIVACY_STRING: 3,
};

/**
 * @typedef {{
 *  consentState: CONSENT_ITEM_STATE,
 *  consentString: (string|undefined),
 *  consentType: (CONSENT_TYPE|undefined),
 *  isDirty: (boolean|undefined),
 * }}
 */
export let ConsentInfoDef;

/**
 * Convert the legacy storage value to Consent Info
 * @param {boolean|Object|undefined} value
 * @return {ConsentInfoDef}
 */
export function getStoredConsentInfo(value) {
  if (value === undefined) {
    return constructConsentInfo(
      CONSENT_ITEM_STATE.UNKNOWN,
      undefined,
      undefined,
      undefined
    );
  }
  if (typeof value === 'boolean') {
    // legacy format
    return getLegacyStoredConsentInfo(value);
  }
  if (!isObject(value)) {
    throw dev().createError('Invalid stored consent value');
  }

  const consentState = convertValueToState(value[STORAGE_KEY.STATE]);
  return constructConsentInfo(
    consentState,
    value[STORAGE_KEY.STRING],
    value[STORAGE_KEY.CONSENT_TYPE],
    value[STORAGE_KEY.IS_DIRTY] && value[STORAGE_KEY.IS_DIRTY] === 1
  );
}

/**
 * Helper function to detect if stored consent has dirtyBit set
 * @param {?ConsentInfoDef} consentInfo
 * @return {boolean}
 */
export function hasDirtyBit(consentInfo) {
  if (!consentInfo) {
    return false;
  }
  if (hasOwn(consentInfo, 'isDirty') && consentInfo['isDirty'] == true) {
    return true;
  }
  return false;
}

/**
 * Return the new consent state value based on stored state and new state
 * @param {!CONSENT_ITEM_STATE} newState
 * @param {!CONSENT_ITEM_STATE} previousState
 * @return {!CONSENT_ITEM_STATE}
 */
export function recalculateConsentStateValue(newState, previousState) {
  if (!isEnumValue(CONSENT_ITEM_STATE, newState)) {
    newState = CONSENT_ITEM_STATE.UNKNOWN;
  }
  if (newState == CONSENT_ITEM_STATE.DISMISSED) {
    return previousState || CONSENT_ITEM_STATE.UNKNOWN;
  }
  if (newState == CONSENT_ITEM_STATE.NOT_REQUIRED) {
    if (previousState && previousState != CONSENT_ITEM_STATE.UNKNOWN) {
      return previousState;
    }
  }
  return newState;
}

/**
 * Compose the value to store to localStorage based on the consentInfo
 * @param {!ConsentInfoDef} consentInfo
 * @return {?boolean|Object}
 */
export function composeStoreValue(consentInfo) {
  const obj = map();
  const consentState = consentInfo['consentState'];
  if (consentState == CONSENT_ITEM_STATE.ACCEPTED) {
    obj[STORAGE_KEY.STATE] = 1;
  } else if (consentState == CONSENT_ITEM_STATE.REJECTED) {
    obj[STORAGE_KEY.STATE] = 0;
  } else {
    // Only store consentString and dirtyBit with reject/accept action
    return null;
  }

  if (consentInfo['consentString']) {
    obj[STORAGE_KEY.STRING] = consentInfo['consentString'];
  }

  if (consentInfo['consentType']) {
    obj[STORAGE_KEY.CONSENT_TYPE] = consentInfo['consentType'];
  }

  if (consentInfo['isDirty'] === true) {
    obj[STORAGE_KEY.IS_DIRTY] = 1;
  }

  if (Object.keys(obj) == 0) {
    return null;
  }

  return obj;
}

/**
 * Convert the consentState to legacy boolean stored value
 * @param {!CONSENT_ITEM_STATE} consentState
 * @return {?boolean}
 */
export function calculateLegacyStateValue(consentState) {
  if (consentState == CONSENT_ITEM_STATE.ACCEPTED) {
    return true;
  }
  if (consentState == CONSENT_ITEM_STATE.REJECTED) {
    return false;
  }
  return null;
}

/**
 * Compare two consentInfo.
 * Return true if they can be converted to the same stored value.
 * @param {?ConsentInfoDef} infoA
 * @param {?ConsentInfoDef} infoB
 * @param {boolean=} opt_isDirty
 * @return {boolean}
 */
export function isConsentInfoStoredValueSame(infoA, infoB, opt_isDirty) {
  if (!infoA && !infoB) {
    return true;
  }
  if (infoA && infoB) {
    const stateEqual =
      calculateLegacyStateValue(infoA['consentState']) ===
      calculateLegacyStateValue(infoB['consentState']);
    const stringEqual =
      (infoA['consentString'] || '') === (infoB['consentString'] || '');
    const typeEqual = infoA['consentType'] === infoB['consentType'];
    let isDirtyEqual;
    if (opt_isDirty) {
      isDirtyEqual = !!infoA['isDirty'] === !!opt_isDirty;
    } else {
      isDirtyEqual = !!infoA['isDirty'] === !!infoB['isDirty'];
    }
    return stateEqual && stringEqual && typeEqual && isDirtyEqual;
  }
  return false;
}

/**
 * Convert the legacy boolean stored value to consentInfo object
 * @param {boolean} value
 * @return {!ConsentInfoDef}
 */
function getLegacyStoredConsentInfo(value) {
  const state = convertValueToState(value);
  return constructConsentInfo(state, undefined, undefined, undefined);
}

/**
 * Construct the consentInfo object from values
 * @param {CONSENT_ITEM_STATE} consentState
 * @param {string=} opt_consentString
 * @param {CONSENT_TYPE=} opt_consentType
 * @param {boolean=} opt_isDirty
 * @return {!ConsentInfoDef}
 */
export function constructConsentInfo(
  consentState,
  opt_consentString,
  opt_consentType,
  opt_isDirty
) {
  return {
    'consentState': consentState,
    'consentString': opt_consentString,
    'consentType': opt_consentType,
    'isDirty': opt_isDirty,
  };
}

/**
 * Helper function to convert stored value to CONSENT_ITEM_STATE value
 * @param {*} value
 * @return {!CONSENT_ITEM_STATE}
 */
export function convertValueToState(value) {
  if (value === true || value === 1) {
    return CONSENT_ITEM_STATE.ACCEPTED;
  } else if (value === false || value === 0) {
    return CONSENT_ITEM_STATE.REJECTED;
  }
  return CONSENT_ITEM_STATE.UNKNOWN;
}

/**
 * Helper function to convert response enum value to CONSENT_ITEM_STATE value
 * @param {*} value
 * @return {?CONSENT_ITEM_STATE}
 */
export function convertEnumValueToState(value) {
  if (value === 'accepted') {
    return CONSENT_ITEM_STATE.ACCEPTED;
  } else if (value === 'rejected') {
    return CONSENT_ITEM_STATE.REJECTED;
  } else if (value === 'unknown') {
    return CONSENT_ITEM_STATE.UNKNOWN;
  }
  return null;
}

/**
 * Helper function to convert response enum value to CONSENT_TYPE value
 * @param {*} value
 * @return {?CONSENT_TYPE}
 */
export function convertEnumValueToConsentType(value) {
  if (value === 'tcf-v1') {
    return CONSENT_TYPE.TCF_V1;
  } else if (value === 'tcf-v2') {
    return CONSENT_TYPE.TCF_V2;
  } else if (value === 'us-privacy-string') {
    return CONSENT_TYPE.US_PRIVACY_STRING;
  }
  return null;
}

/**
 *
 * @param {!ConsentInfoDef} info
 * @return {boolean}
 */
export function hasStoredValue(info) {
  if (info['consentString']) {
    return true;
  }
  return (
    info['consentState'] === CONSENT_ITEM_STATE.ACCEPTED ||
    info['consentState'] === CONSENT_ITEM_STATE.REJECTED
  );
}

/**
 * Convert the CONSENT_ITEM_STATE back to readable string
 * @param {!CONSENT_ITEM_STATE} enumState
 * @return {string}
 */
export function getConsentStateValue(enumState) {
  if (enumState === CONSENT_ITEM_STATE.ACCEPTED) {
    return 'accepted';
  }

  if (enumState === CONSENT_ITEM_STATE.REJECTED) {
    return 'rejected';
  }

  return 'unknown';
}

/**
 * Convert the CONSENT_TYPE back to readable string
 * @param {!CONSENT_TYPE} enumType
 * @return {string|undefined}
 */
export function getConsentTypeValue(enumType) {
  switch (enumType) {
    case CONSENT_TYPE.TCF_V1:
      return 'tcf-v1';
    case CONSENT_TYPE.TCF_V2:
      return 'tcf-v2';
    case CONSENT_TYPE.US_PRIVACY_STRING:
      return 'us-privacy-string';
    default:
      return undefined;
  }
}

/**
 * Handle consent metadata by returning and object with
 * fields based off consentString.
 * @param {string|undefined} consentString
 * @param {string|undefined} consentType
 * @return {!Object}
 */
export function getConsentMetadata(consentString, consentType) {
  const metadata = {};
  // TODO(micajuineho) treat gdprApplies the same way
  if (consentString) {
    metadata['consentString'] = consentString;
    metadata['consentType'] =
      convertEnumValueToConsentType(consentType) || undefined;
  }
  return metadata;
}
