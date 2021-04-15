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

import {CONSENT_STRING_TYPE} from '../../../src/consent-state';
import {deepEquals} from '../../../src/json';
import {dev, user} from '../../../src/log';
import {hasOwn, map} from '../../../src/core/types/object';
import {isEnumValue, isObject} from '../../../src/core/types';

const TAG = 'amp-consent';

/**
 * Key values for retriving/storing consent info object.
 * STATE: Set when user accept or reject consent.
 * STRING: Set when a consent string is used to store more granular consent info
 * on vendors.
 * METADATA: Set when consent metadata is passed in to store more granular consent info
 * on vendors.
 * DITRYBIT: Set when the stored consent info need to be revoked next time.
 * PURPOSE_CONSENTS: Set when consents for purposes are passed in for client side
 * granular consent. Only values ACCEPT and REJECT signals are stored.
 * @enum {string}
 */
export const STORAGE_KEY = {
  STATE: 's',
  STRING: 'r',
  IS_DIRTY: 'd',
  METADATA: 'm',
  PURPOSE_CONSENTS: 'pc',
};

/**
 * Key values for retriving/storing metadata values within consent info
 * @enum {string}
 */
export const METADATA_STORAGE_KEY = {
  CONSENT_STRING_TYPE: 'cst',
  ADDITIONAL_CONSENT: 'ac',
  GDPR_APPLIES: 'ga',
  PURPOSE_ONE: 'po',
};

/**
 * Unlike the global consent state, only accepted and
 * rejected values are respected and stored.
 * In the future, we might consider more nuanced states.
 * @enum {number}
 */
export const PURPOSE_CONSENT_STATE = {
  ACCEPTED: 1,
  REJECTED: 2,
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
 * @enum {string}
 * @visibleForTesting
 */
export const TCF_POST_MESSAGE_API_COMMANDS = {
  GET_TC_DATA: 'getTCData',
  PING: 'ping',
  ADD_EVENT_LISTENER: 'addEventListener',
  REMOVE_EVENT_LISTENER: 'removeEventListener',
};

/**
 * @typedef {{
 *  consentState: CONSENT_ITEM_STATE,
 *  consentString: (string|undefined),
 *  consentMetadata: (ConsentMetadataDef|undefined),
 *  purposeConsents: (Object<string, PURPOSE_CONSENT_STATE>|undefined),
 *  isDirty: (boolean|undefined),
 * }}
 */
export let ConsentInfoDef;

/**
 * Used in ConsentInfoDef
 * @typedef {{
 *  consentStringType: (CONSENT_STRING_TYPE|undefined),
 *  additionalConsent: (string|undefined),
 *  gdprApplies: (boolean|undefined),
 *  purposeOne: (boolean|undefined),
 * }}
 */
export let ConsentMetadataDef;

/**
 * Convert the legacy storage value to Consent Info
 * @param {boolean|Object|undefined} value
 * @return {ConsentInfoDef}
 */
export function getStoredConsentInfo(value) {
  if (value === undefined) {
    return constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN);
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
    convertStorageMetadata(value[STORAGE_KEY.METADATA]),
    value[STORAGE_KEY.PURPOSE_CONSENTS],
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

  if (consentInfo['isDirty'] === true) {
    obj[STORAGE_KEY.IS_DIRTY] = 1;
  }

  if (consentInfo['consentMetadata']) {
    obj[STORAGE_KEY.METADATA] = composeMetadataStoreValue(
      consentInfo['consentMetadata']
    );
  }

  if (consentInfo['purposeConsents']) {
    obj[STORAGE_KEY.PURPOSE_CONSENTS] = consentInfo['purposeConsents'];
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
    let isDirtyEqual;
    if (opt_isDirty) {
      isDirtyEqual = !!infoA['isDirty'] === !!opt_isDirty;
    } else {
      isDirtyEqual = !!infoA['isDirty'] === !!infoB['isDirty'];
    }
    const metadataEqual = deepEquals(
      infoA['consentMetadata'],
      infoB['consentMetadata']
    );
    const purposeConsentsEqual = deepEquals(
      infoA['purposeConsents'],
      infoB['purposeConsents']
    );
    return (
      stateEqual &&
      stringEqual &&
      metadataEqual &&
      purposeConsentsEqual &&
      isDirtyEqual
    );
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
  return constructConsentInfo(state);
}

/**
 * Construct the consentInfo object from values
 *
 * @param {CONSENT_ITEM_STATE} consentState
 * @param {string=} opt_consentString
 * @param {ConsentMetadataDef=} opt_consentMetadata
 * @param {Object<string, PURPOSE_CONSENT_STATE>=} opt_purposeConsents
 * @param {boolean=} opt_isDirty
 * @return {!ConsentInfoDef}
 */
export function constructConsentInfo(
  consentState,
  opt_consentString,
  opt_consentMetadata,
  opt_purposeConsents,
  opt_isDirty
) {
  return {
    'consentState': consentState,
    'consentString': opt_consentString,
    'consentMetadata': opt_consentMetadata,
    'purposeConsents': opt_purposeConsents,
    'isDirty': opt_isDirty,
  };
}

/**
 * Construct the consentMetadataDef object from values
 *
 * @param {CONSENT_STRING_TYPE=} opt_consentStringType
 * @param {string=} opt_additionalConsent
 * @param {boolean=} opt_gdprApplies
 * @param {boolean=} opt_purposeOne
 * @return {!ConsentMetadataDef}
 */
export function constructMetadata(
  opt_consentStringType,
  opt_additionalConsent,
  opt_gdprApplies,
  opt_purposeOne
) {
  return {
    'consentStringType': opt_consentStringType,
    'additionalConsent': opt_additionalConsent,
    'gdprApplies': opt_gdprApplies,
    'purposeOne': opt_purposeOne,
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
 * Converts ConsentMetadataDef to stroage value:
 * {'gdprApplies': true, 'additionalConsent': undefined, 'consentStringType': 2} =>
 * {'ga': true, 'cst': 2}
 *
 * @param {ConsentMetadataDef=} consentInfoMetadata
 * @return {Object}
 */
export function composeMetadataStoreValue(consentInfoMetadata) {
  const storageMetadata = map();
  if (consentInfoMetadata['consentStringType']) {
    storageMetadata[METADATA_STORAGE_KEY.CONSENT_STRING_TYPE] =
      consentInfoMetadata['consentStringType'];
  }
  if (consentInfoMetadata['additionalConsent']) {
    storageMetadata[METADATA_STORAGE_KEY.ADDITIONAL_CONSENT] =
      consentInfoMetadata['additionalConsent'];
  }
  if (consentInfoMetadata['gdprApplies'] != undefined) {
    storageMetadata[METADATA_STORAGE_KEY.GDPR_APPLIES] =
      consentInfoMetadata['gdprApplies'];
  }
  if (consentInfoMetadata['purposeOne'] != undefined) {
    storageMetadata[METADATA_STORAGE_KEY.PURPOSE_ONE] =
      consentInfoMetadata['purposeOne'];
  }
  return storageMetadata;
}

/**
 * Converts stroage metadata to ConsentMetadataDef:
 * {'ga': true, 'cst': 2} =>
 * {'gdprApplies': true, 'additionalConsnet': undefined, 'consentStringType': 2}
 *
 * @param {Object|null|undefined} storageMetadata
 * @return {ConsentMetadataDef}
 */
export function convertStorageMetadata(storageMetadata) {
  if (!storageMetadata) {
    return constructMetadata();
  }
  return constructMetadata(
    storageMetadata[METADATA_STORAGE_KEY.CONSENT_STRING_TYPE],
    storageMetadata[METADATA_STORAGE_KEY.ADDITIONAL_CONSENT],
    storageMetadata[METADATA_STORAGE_KEY.GDPR_APPLIES],
    storageMetadata[METADATA_STORAGE_KEY.PURPOSE_ONE]
  );
}

/**
 * Confirm that the metadata values are valid.
 * Remove and provide user error otherwise.
 * @param {JsonObject} metadata
 */
export function assertMetadataValues(metadata) {
  const consentStringType = metadata['consentStringType'];
  const additionalConsent = metadata['additionalConsent'];
  const gdprApplies = metadata['gdprApplies'];
  const purposeOne = metadata['purposeOne'];
  const errorFields = [];

  if (
    consentStringType &&
    !isEnumValue(CONSENT_STRING_TYPE, consentStringType)
  ) {
    delete metadata['consentStringType'];
    errorFields.push('consentStringType');
  }
  if (additionalConsent && typeof additionalConsent != 'string') {
    delete metadata['additionalConsent'];
    errorFields.push('additionalConsent');
  }
  if (gdprApplies && typeof gdprApplies != 'boolean') {
    delete metadata['gdprApplies'];
    errorFields.push('gdprApplies');
  }
  if (purposeOne && typeof purposeOne != 'boolean') {
    delete metadata['purposeOne'];
    errorFields.push('purposeOne');
  }
  for (let i = 0; i < errorFields.length; i++) {
    user().error(
      TAG,
      'Consent metadata value "%s" is invalid.',
      errorFields[i]
    );
  }
}
