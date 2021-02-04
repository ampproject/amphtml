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
 * @typedef {{
 *  gdprApplies: (boolean|undefined),
 *  cmpLoaded: (boolean),
 *  cmpStatus: (string|undefined),
 *  tcfPolicyVersion: number,
 * }}
 */
export let MinimalPingReturn;

const TAG = 'amp-consent';
const TCF_POLICY_VERSION = 2;
const CMP_STATUS = 'loaded';
const CMP_LOADED = true;

export class TcfApiCommandManager {
  /**
   * Creates an instance of TcfApiCommandManager.
   * @param {!./consent-policy-manager.ConsentPolicyManager} policyManager
   */
  constructor(policyManager) {
    /** @private {!./consent-policy-manager.ConsentPolicyManager} */
    this.policyManager_ = policyManager;
  }

  /**
   * @param {!Object} data
   * @param {!Window} win
   */
  handleTcfCommand(data, win) {
    if (!this.isValidTcfApiCall_(data['__tcfapiCall'])) {
      return;
    }

    const payload = data['__tcfapiCall'];
    const {command} = payload;
    switch (command) {
      case TCF_POST_MESSAGE_API_COMMANDS.PING:
        this.handlePingEvent_(payload, win);
        break;
      case TCF_POST_MESSAGE_API_COMMANDS.GET_TC_DATA:
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
   */
  handlePingEvent_(payload, win) {
    this.policyManager_.getConsentMetadataInfo('default').then((metadata) => {
      const returnValue = this.getMinimalPingReturn_(metadata);
      const {callId} = payload;

      this.sendTcfApiReturn_(win, returnValue, callId);
    });
  }

  /**
   * Create minimal PingReturn object.
   * @param {?Object} metadata
   * @return {!MinimalPingReturn}
   */
  getMinimalPingReturn_(metadata) {
    const gdprApplies = metadata ? metadata['gdprApplies'] : undefined;
    return {
      gdprApplies,
      cmpLoaded: CMP_LOADED,
      cmpStatus: CMP_STATUS,
      tcfPolicyVersion: TCF_POLICY_VERSION,
    };
  }

  /**
   *
   * @param {!Window} win
   * @param {!JsonObject} returnValue
   * @param {string} callId
   * @param {boolean=} success
   */
  sendTcfApiReturn_(win, returnValue, callId, success) {
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
  isValidTcfApiCall_(payload) {
    if (!isObject(payload)) {
      user().error(TAG, `"tcfapiCall" is not an object: ${payload}`);
      return false;
    }
    const {command, parameter, version} = payload;
    if (!isEnumValue(TCF_POST_MESSAGE_API_COMMANDS, command)) {
      user().error(
        TAG,
        `Unsupported command found in "tcfapiCall": ${command}`
      );
      return false;
    }
    if (parameter) {
      user().error(
        TAG,
        `Unsupported parameter found in "tcfapiCall": ${parameter}`
      );
      return false;
    }
    if (version !== 2) {
      user().error(TAG, `Found incorrect version in "tcfapiCall": ${version}`);
      return false;
    }
    return true;
  }

  /**
   * @param {?Object} metadata
   * @return {!MinimalPingReturn}
   * @visibleForTesting
   */
  getMinimalPingReturnForTesting(metadata) {
    return this.getMinimalPingReturn_(metadata);
  }
}
