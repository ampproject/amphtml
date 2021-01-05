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

/**
 * @param {!Object} payload
 * @param {!Window} source
 * @param {!ConsentPolicyManager} policyManager
 */
export function handleTcfCommand(payload, source, policyManager) {
  const {command} = payload;

  switch (command) {
    case TCF_POST_MESSAGE_API_COMMANDS.GET_TC_DATA:
    case TCF_POST_MESSAGE_API_COMMANDS.PING:
      handlePingEvent(payload, source, policyManager);
      break;
    case TCF_POST_MESSAGE_API_COMMANDS.ADD_EVENT_LISTENER:
    case TCF_POST_MESSAGE_API_COMMANDS.REMOVE_EVENT_LISTENER:
    default:
      return;
  }
}

/**
 * Create minimal PingReturn object. Send to original source
 * once object has been filled.
 * @param {!Object} payload
 * @param {!Window} source
 * @param {!ConsentPolicyManager} policyManager
 */
export function handlePingEvent(payload, source, policyManager) {
  const cmpLoaded = true;
  const metadataPromise = policyManager.getConsentMetadataInfo('default');

  metadataPromise.then((metadata) => {
    const gdprApplies = metadata ? metadata['gdprApplies'] : undefined;
    const returnValue = {cmpLoaded, gdprApplies};
    const {callId} = payload;

    sendTcfApiReturn(source, returnValue, callId);
  });
}

/**
 *
 * @param {!Window} source
 * @param {!JsonObject} returnValue
 * @param {string} callId
 * @param {boolean=} success
 */
function sendTcfApiReturn(source, returnValue, callId, success) {
  if (!source) {
    return;
  }

  const __tcfapiReturn = {returnValue, callId, success};
  source./*OK*/ postMessage(
    /** @type {!JsonObject} */ ({
      __tcfapiReturn,
    }),
    '*'
  );
}
