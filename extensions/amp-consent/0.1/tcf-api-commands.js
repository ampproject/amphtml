/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {ConsentPolicyManager} from './consent-policy-manager'; // eslint-disable-line no-unused-vars
import {TCF_POST_MESSAGE_API_COMMANDS} from './consent-info';
import {isEnumValue, isObject} from '../../../src/types';
import {user} from '../../../src/log';

/**
 * Event status is only defined for addEventListener command.
 * @typedef {{
  *  tcfPolicyVersion: number,
  *  gdprApplies: (boolean|undefined),
  *  tcString: (string|undefined),
  *  listenerId: (string|undefined),
  *  cmpStatus: (boolean|undefined),
  *  eventStatus: (string|undefined),
  *  additionalData: (Object),
  * }}
  */
 export let MinimalTcData;

const TAG = 'amp-consent';
const tcfPolicyVersion = '2';
const cmpStatus = 'loaded';

/**
 * @param {!Object} payload
 * @param {!Window} win
 * @param {!ConsentPolicyManager} policyManager
 */
export function handleTcfCommand(payload, win, policyManager) {
  const {command} = payload;

  switch (command) {
    case TCF_POST_MESSAGE_API_COMMANDS.GET_TC_DATA:
      handleGetTcData(payload, win, policyManager);
      break;
    case TCF_POST_MESSAGE_API_COMMANDS.PING:
      handlePingEvent(payload, win, policyManager);
      break;
    case TCF_POST_MESSAGE_API_COMMANDS.ADD_EVENT_LISTENER:
    case TCF_POST_MESSAGE_API_COMMANDS.REMOVE_EVENT_LISTENER:
    default:
      return;
  }
}

/**
 * Create minimal PingReturn object. Send to original iframe
 * once object has been filled.
 * @param {!Object} payload
 * @param {!Window} win
 * @param {!ConsentPolicyManager} policyManager
 */
function handleGetTcData(payload, win, policyManager) {
  const consentStringInfoPromise = policyManager.getConsentStringInfo('default');
  const metadataPromise = policyManager.getConsentMetadataInfo('default');
  const sharedDataPromise = policyManager.getMergedSharedData('default');
  
  
  Promise.all([metadataPromise, sharedDataPromise, consentStringInfoPromise]).then((arr) => {
    const returnValue = getMinimalTcData(arr[0], arr[1], arr[2]);
    const {callId} = payload;

    sendTcfApiReturn(win, returnValue, callId);
  });
}

/**
 * Create MinimalTCData object. Fill in fields dependent on
 * command.
 * @param {?Object} metadata
 * @param {?Object} sharedData
 * @param {string=} tcString
 * @param {string=} eventStatus
 * @param {string=} listenerId
 * @return {!MinimalTcData} policyManager
 */
function getMinimalTcData(metadata, sharedData, tcString, eventStatus, listenerId) {
  const purposeOneTreatment = metadata ? metadata['purposeOne'] : undefined;
  const gdprApplies = metadata ? metadata['gdprApplies'] : undefined;
  const additionalConsent = metadata ? metadata['additionalConsent'] : undefined;
  const additionalData = {...sharedData, additionalConsent}
  
  return {
    tcfPolicyVersion,
    gdprApplies,
    tcString,
    listenerId,
    cmpStatus,
    eventStatus,
    purposeOneTreatment,
    additionalData,
  };
}

/**
 * Create minimal PingReturn object. Send to original iframe
 * once object has been filled.
 * @param {!Object} payload
 * @param {!Window} win
 * @param {!ConsentPolicyManager} policyManager
 */
function handlePingEvent(payload, win, policyManager) {
  const cmpLoaded = true;
  policyManager.getConsentMetadataInfo('default').then((metadata) => {
    const gdprApplies = metadata ? metadata['gdprApplies'] : undefined;
    const returnValue = {cmpLoaded, gdprApplies};
    const {callId} = payload;

    sendTcfApiReturn(win, returnValue, callId);
  });
}

/**
 *
 * @param {!Window} win
 * @param {!JsonObject} returnValue
 * @param {string} callId
 * @param {boolean=} success
 */
function sendTcfApiReturn(win, returnValue, callId, success) {
  if (!win) {
    return;
  }

  const __tcfapiReturn = {returnValue, callId, success};
  win./*OK*/ postMessage(
    /** @type {!JsonObject} */ ({
      __tcfapiReturn,
    }),
    '*'
  );
}

/**
 * Checks if the payload from the `tcfapiCall` is valid.
 * @param {JsonObject} payload
 * @return {boolean}
 */
export function isValidTcfApiCall(payload) {
  if (!isObject(payload)) {
    user().error(TAG, `"tcfapiCall" is not an object: ${payload}`);
    return false;
  }
  const {command, parameter, version} = payload;
  if (!isEnumValue(TCF_POST_MESSAGE_API_COMMANDS, command)) {
    user().error(TAG, `Unsupported command found in "tcfapiCall": ${command}`);
    return false;
  }
  if (parameter !== undefined) {
    user().error(
      TAG,
      `Unsupported parameter found in "tcfapiCall": ${parameter}`
    );
    return false;
  }
  if (version != '2') {
    user().error(TAG, `Found incorrect version in "tcfapiCall": ${version}`);
    return false;
  }
  return true;
}
