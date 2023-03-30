import {isEnumValue, isObject} from '#core/types';
import {hasOwn, map} from '#core/types/object';

import {user} from '#utils/log';

import {TCF_POST_MESSAGE_API_COMMANDS} from './consent-info';
import {ConsentPolicyManager} from './consent-policy-manager'; // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * Event status is only defined for addEventListener command.
 * @typedef {{
 *  tcfPolicyVersion: number,
 *  gdprApplies: (boolean|undefined),
 *  tcString: (string|undefined),
 *  listenerId: (string|undefined),
 *  cmpStatus: (string),
 *  eventStatus: (string),
 *  additionalData: (Object),
 * }}
 */
export let MinimalTcData;

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
const EVENT_STATUS = 'tcloaded';

export class TcfApiCommandManager {
  /**
   * Creates an instance of TcfApiCommandManager.
   * @param {!./consent-policy-manager.ConsentPolicyManager} policyManager
   */
  constructor(policyManager) {
    /** @private {!./consent-policy-manager.ConsentPolicyManager} */
    this.policyManager_ = policyManager;

    /** @private {!Object<number, Object>} */
    this.changeListeners_ = map();

    /** @private {?string} */
    this.currentTcString_ = null;

    /** @private {number} */
    this.listenerId_ = 0;

    // Set the policy manager to signal to us
    // when a new TC has potentially been stored.
    policyManager.setOnPolicyChange(() => {
      this.handleTcDataChange_();
    });
  }

  /**
   * @param {!Object} data
   * @param {!Window} win
   */
  handleTcfCommand(data, win) {
    const payload = data['__tcfapiCall'];

    if (!this.isValidTcfApiCall_(payload)) {
      return;
    }

    const {callId, command, parameter} = payload;
    switch (command) {
      case TCF_POST_MESSAGE_API_COMMANDS.PING:
        this.handlePingEvent_(callId, win);
        break;
      case TCF_POST_MESSAGE_API_COMMANDS.GET_TC_DATA:
        this.handleGetTcData_(callId, win);
        break;
      case TCF_POST_MESSAGE_API_COMMANDS.ADD_EVENT_LISTENER:
        this.handleAddEventListner_(payload, win);
        break;
      case TCF_POST_MESSAGE_API_COMMANDS.REMOVE_EVENT_LISTENER:
        this.handleRemoveEventListner_(callId, parameter, win);
        break;
      default:
        return;
    }
  }

  /**
   * Add a entry to our changeListeners to signify that there
   * is another iframe interested in listening for TCData changes.
   *
   * Each entry has a unique `listenerId` that will be sent
   * back to the 3p iframe.
   * @param {!Object} payload
   * @param {!Window} win
   */
  handleAddEventListner_(payload, win) {
    if (this.changeListeners_[this.listenerId_]) {
      return;
    }
    this.changeListeners_[this.listenerId_] = {
      payload,
      win,
    };
    this.listenerId_++;
  }

  /**
   * @param {string} callId
   * @param {number|string} parameter
   * @param {!Window} win
   */
  handleRemoveEventListner_(callId, parameter, win) {
    const success = !!this.changeListeners_[parameter];
    if (success) {
      delete this.changeListeners_[parameter];
    }

    this.sendTcfApiReturn_(win, /** returnValue */ undefined, callId, success);
  }

  /**
   * Handler for when policy manager signal potential TCData
   * change. Only triggers new TCData to be sent if TC String
   * has been change and is non-null.
   */
  handleTcDataChange_() {
    if (!Object.keys(this.changeListeners_).length) {
      return;
    }

    this.getTcDataPromises_().then((consentPromises) => {
      const newTcString = consentPromises[2];
      if (!newTcString || newTcString === this.currentTcString_) {
        return;
      }

      this.currentTcString_ = newTcString;
      const listenerIds = Object.keys(this.changeListeners_);
      for (let i = 0; i < listenerIds.length; i++) {
        const listenerId = Number(listenerIds[i]);
        if (!hasOwn(this.changeListeners_, listenerId)) {
          continue;
        }
        const {payload, win} = this.changeListeners_[listenerId];
        const {callId} = payload;
        const returnValue = this.getMinimalTcData_(
          consentPromises[0],
          consentPromises[1],
          newTcString,
          listenerId
        );

        this.sendTcfApiReturn_(win, returnValue, callId, true);
      }
    });
  }

  /**
   * @return {!Promise<Array>}
   */
  getTcDataPromises_() {
    const consentStringInfoPromise =
      this.policyManager_.getConsentStringInfo('default');
    const metadataPromise =
      this.policyManager_.getConsentMetadataInfo('default');
    const sharedDataPromise =
      this.policyManager_.getMergedSharedData('default');

    return Promise.all([
      metadataPromise,
      sharedDataPromise,
      consentStringInfoPromise,
    ]);
  }

  /**
   * Create minimal PingReturn object. Send to original iframe
   * once object has been filled.
   * @param {string} callId
   * @param {!Window} win
   */
  handleGetTcData_(callId, win) {
    this.getTcDataPromises_().then((arr) => {
      const returnValue = this.getMinimalTcData_(arr[0], arr[1], arr[2]);

      this.sendTcfApiReturn_(win, returnValue, callId, true);
    });
  }

  /**
   * Create MinimalTCData object. Fill in fields dependent on
   * command.
   * @param {?Object} metadata
   * @param {?Object} sharedData
   * @param {?string} tcString
   * @param {number=} opt_listenerId
   * @return {!MinimalTcData} policyManager
   */
  getMinimalTcData_(metadata, sharedData, tcString, opt_listenerId) {
    const purposeOneTreatment = metadata ? metadata['purposeOne'] : undefined;
    const gdprApplies = metadata ? metadata['gdprApplies'] : undefined;
    const additionalConsent = metadata
      ? metadata['additionalConsent']
      : undefined;
    const additionalData = {...sharedData, additionalConsent};

    return {
      tcfPolicyVersion: TCF_POLICY_VERSION,
      gdprApplies,
      tcString,
      listenerId: opt_listenerId,
      cmpStatus: CMP_STATUS,
      eventStatus: EVENT_STATUS,
      purposeOneTreatment,
      additionalData,
    };
  }

  /**
   * Create minimal PingReturn object. Send to original iframe
   * once object has been filled.
   *
   * @param {string} callId
   * @param {!Window} win
   */
  handlePingEvent_(callId, win) {
    this.policyManager_.getConsentMetadataInfo('default').then((metadata) => {
      const returnValue = this.getMinimalPingReturn_(metadata);

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
   * @param {boolean=} opt_success
   */
  sendTcfApiReturn_(win, returnValue, callId, opt_success) {
    if (!win) {
      return;
    }

    const __tcfapiReturn = {returnValue, callId, success: opt_success};
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
    if (
      (!parameter || isNaN(parameter)) &&
      command == TCF_POST_MESSAGE_API_COMMANDS.REMOVE_EVENT_LISTENER
    ) {
      user().error(
        TAG,
        `Found incorrect parameter in "tcfapiCall": ${parameter}. Please provide a valid number.`
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

  /**
   * @param {?Object} metadata
   * @param {?Object} sharedData
   * @param {?string} tcString
   * @param {number=} listenerId
   * @return {!MinimalPingReturn}
   * @visibleForTesting
   */
  getMinimalTcDataForTesting(metadata, sharedData, tcString, listenerId) {
    return this.getMinimalTcData_(metadata, sharedData, tcString, listenerId);
  }
}
