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
 * DITRYBIT: Set when the stored consent info need to be revoked next time.
 * @enum {string}
 */
const STORAGE_KEY = {
  STATE: 's',
  STRING: 'r',
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
 * @typedef {{
 *  consentState: CONSENT_ITEM_STATE,
 *  consentString: (string|undefined),
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
        CONSENT_ITEM_STATE.UNKNOWN, undefined, undefined);
  }
  if (typeof value === 'boolean') {
    // legacy format
    return getLegacyStoredConsentInfo(value);
  }
  if (!isObject(value)) {
    throw dev().createError('Invalid stored consent value');
  }

  const consentState = convertValueToState(value[STORAGE_KEY.STATE]);
  return constructConsentInfo(consentState,
      value[STORAGE_KEY.STRING],
      (value[STORAGE_KEY.IS_DIRTY] && value[STORAGE_KEY.IS_DIRTY] === 1));
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
 */
export function recalculateConsentStateValue(newState, previousState) {
  if (!isEnumValue(CONSENT_ITEM_STATE, newState)) {
    newState = CONSENT_ITEM_STATE.UNKNOWN;
  }
  if (newState == CONSENT_ITEM_STATE.DISMISSED ||
      newState == CONSENT_ITEM_STATE.UNKNOWN) {
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
 * @param {boolean=} opt_forceNew
 * @return {?boolean|Object}
 */
export function composeStoreValue(consentInfo, opt_forceNew) {
  if (!opt_forceNew &&
      !consentInfo['consentString'] &&
      consentInfo['isDirty'] === undefined) {
    // TODO: Remove after turn on amp-consent-v2
    return calculateLegacyStateValue(consentInfo['consentState']);
  }
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
    const stateEqual = calculateLegacyStateValue(infoA['consentState']) ===
        calculateLegacyStateValue(infoB['consentState']);
    const stringEqual =
        ((infoA['consentString'] || '') === (infoB['consentString'] || ''));
    let isDirtyEqual;
    if (opt_isDirty) {
      isDirtyEqual = !!infoA['isDirty'] === !!opt_isDirty;
    } else {
      isDirtyEqual = !!infoA['isDirty'] === !!infoB['isDirty'];
    }
    return stateEqual && stringEqual && isDirtyEqual;
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
  return constructConsentInfo(state, undefined, undefined);
}

/**
 * Construct the consentInfo object from values
 * @param {CONSENT_ITEM_STATE} consentState
 * @param {string=} opt_consentString
 * @param {boolean=} opt_isDirty
 * @return {!ConsentInfoDef}
 */
export function constructConsentInfo(consentState,
  opt_consentString, opt_isDirty) {
  return {
    'consentState': consentState,
    'consentString': opt_consentString,
    'isDirty': opt_isDirty,
  };
}

/**
 * Helper function to convert stored value to CONSENT_ITEM_STATE value
 * @param {*} value
 */
function convertValueToState(value) {
  if (value === true || value === 1) {
    return CONSENT_ITEM_STATE.ACCEPTED;
  } else if (value === false || value === 0) {
    return CONSENT_ITEM_STATE.REJECTED;
  }
  return CONSENT_ITEM_STATE.UNKNOWN;
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
  return info['consentState'] === CONSENT_ITEM_STATE.ACCEPTED ||
      info['consentState'] === CONSENT_ITEM_STATE.REJECTED;
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
