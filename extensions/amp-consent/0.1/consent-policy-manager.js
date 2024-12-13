import {CONSENT_POLICY_STATE} from '#core/constants/consent-state';
import {Observable} from '#core/data-structures/observable';
import {Deferred} from '#core/data-structures/promise';
import {isFiniteNumber, isObject} from '#core/types';
import {hasOwn, map} from '#core/types/object';

import {user, userAssert} from '#utils/log';

import {
  CONSENT_ITEM_STATE,
  ConsentInfoDef,
  PURPOSE_CONSENT_STATE,
} from './consent-info';

import {getServicePromiseForDoc} from '../../../src/service-helpers';

const CONSENT_STATE_MANAGER = 'consentStateManager';
const TAG = 'consent-policy-manager';

const ALLOWLIST_POLICY = {
  'default': true,
  '_till_responded': true,
  '_till_accepted': true,
  '_auto_reject': true,
};

export class ConsentPolicyManager {
  /**
   * Creates an instance of ConsentPolicyManager.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!{[key: string]: ?Deferred}} */
    this.policyInstancesDeferred_ = map();

    /** @private {!{[key: string]: ConsentPolicyInstance}} */
    this.instances_ = map();

    /** @private {!Promise} */
    this.ConsentStateManagerPromise_ = getServicePromiseForDoc(
      this.ampdoc_,
      CONSENT_STATE_MANAGER
    );

    /** @private {!Deferred} */
    this.consentPromptInitiated_ = new Deferred();

    const consentValueInitiated = new Deferred();

    /** @private {!Promise} */
    this.consentValueInitiatedPromise_ = consentValueInitiated.promise;

    /** @private {?function()} */
    this.consentValueInitiatedResolver_ = consentValueInitiated.resolve;

    /** @private {!Observable} */
    this.consentStateChangeObservables_ = new Observable();

    /** @private {?string} */
    this.consentInstanceIdDepr_ = null;

    /** @private {?CONSENT_ITEM_STATE} */
    this.consentState_ = null;

    /** @private {?string} */
    this.consentString_ = null;

    /** @private {?number} */
    this.tcfPolicyVersion_ = null;

    /** @private {?Object|undefined} */
    this.consentMetadata_ = null;

    /** @private {?Object|undefined} */
    this.purposeConsents_ = null;

    /** @private {?function()} */
    this.tcfConsentChangeHandler_ = null;
  }

  /**
   *
   * @param {string} consentInstanceId
   */
  setLegacyConsentInstanceId(consentInstanceId) {
    this.consentInstanceIdDepr_ = consentInstanceId;
    this.init_();
  }

  /**
   * Register the policy instance
   * Example policy config format:
   * {
   *   "waitFor": {
   *     "consentABC": []
   *   }
   *   "timeout": {
   *     "seconds": 1,
   *     "fallbackAction": 'reject'
   *   }
   * }
   *
   * TODO: Add support to timeout
   * @param {string} policyId
   * @param {!JsonObject} config
   */
  registerConsentPolicyInstance(policyId, config) {
    if (this.instances_[policyId]) {
      // Note <amp-next-page> could wait for the same consent policy.
      // Return without thowing error.
      // TODO: Make sure multiple consentPolicyManager services is installed
      // for every <amp-next-page>
      return;
    }

    const waitFor = Object.keys(config['waitFor'] || {});
    if (waitFor.length !== 1 || waitFor[0] !== this.consentInstanceIdDepr_) {
      user().error(
        TAG,
        'invalid waitFor value, consent policy will never resolve'
      );
      return;
    }

    const instance = new ConsentPolicyInstance(config);

    this.instances_[policyId] = instance;

    if (this.policyInstancesDeferred_[policyId]) {
      this.policyInstancesDeferred_[policyId].resolve();
      this.policyInstancesDeferred_[policyId] = null;
    }

    this.consentValueInitiatedPromise_.then(() => {
      if (this.consentState_) {
        // Has initial consent state value. Evaluate immediately
        instance.evaluate(this.consentState_);
      }
      this.consentStateChangeObservables_.add((state) => {
        instance.evaluate(state);
      });
      this.consentPromptInitiated_.promise.then(() => {
        instance.startTimeout(this.ampdoc_.win);
      });
    });
  }

  /**
   * Helper method to register to listen to consent instance value change
   * and get the initial consent value
   */
  init_() {
    // Set up handler to listen to consent instance value change.
    this.ConsentStateManagerPromise_.then((manager) => {
      manager.whenConsentReady().then(() => {
        manager.onConsentStateChange((info) => {
          this.consentStateChangeHandler_(info);
          if (this.consentValueInitiatedResolver_) {
            this.consentValueInitiatedResolver_();
            this.consentValueInitiatedResolver_ = null;
          }
        });
      });
    });
  }

  /**
   * Inform consent policy manager that all consent instances
   * state has been initiated with remote value. And ready to start timeout
   */
  enableTimeout() {
    this.consentPromptInitiated_.resolve();
  }

  /**
   * Handle initial consent instance value and following consent value change
   * @param {!ConsentInfoDef} info
   */
  consentStateChangeHandler_(info) {
    const state = info['consentState'];
    const consentStr = info['consentString'];
    const tcfPolicyVersion = info['tcfPolicyVersion'];
    const consentMetadata = info['consentMetadata'];
    const purposeConsents = info['purposeConsents'];
    const {
      consentMetadata_: prevConsentMetadata,
      consentString_: prevConsentStr,
      purposeConsents_: prevPurposeConsents,
      tcfPolicyVersion_: prevTCFPolicyVersion,
    } = this;

    this.consentString_ = consentStr;
    this.tcfPolicyVersion_ = tcfPolicyVersion;
    this.consentMetadata_ = consentMetadata;
    this.purposeConsents_ = purposeConsents;
    if (state === CONSENT_ITEM_STATE.UNKNOWN) {
      // consent state has not been resolved yet.
      return;
    }

    if (state == CONSENT_ITEM_STATE.NOT_REQUIRED) {
      const shouldOverwrite =
        this.consentState_ != CONSENT_ITEM_STATE.ACCEPTED &&
        this.consentState_ != CONSENT_ITEM_STATE.REJECTED;
      // Ignore the consent item state and overwrite state value.
      if (shouldOverwrite) {
        this.consentState_ = CONSENT_ITEM_STATE.NOT_REQUIRED;
      }
    } else if (state == CONSENT_ITEM_STATE.DISMISSED) {
      // When dismissed, use the old value
      if (this.consentState_ === null) {
        this.consentState_ = CONSENT_ITEM_STATE.UNKNOWN;
      }
      // None of the supplementary consent data changes with dismiss action
      this.consentString_ = prevConsentStr;
      this.tcfPolicyVersion_ = prevTCFPolicyVersion;
      this.consentMetadata_ = prevConsentMetadata;
      this.purposeConsents_ = prevPurposeConsents;
    } else {
      this.consentState_ = state;
    }
    this.consentStateChangeObservables_.fire(this.consentState_);
    if (this.tcfConsentChangeHandler_) {
      this.tcfConsentChangeHandler_();
    }
  }

  /**
   * Sets the handler that will be called when a consent change
   * has been fired.
   * @param {function()} callback
   */
  setOnPolicyChange(callback) {
    if (!this.tcfConsentChangeHandler_) {
      this.tcfConsentChangeHandler_ = callback;
    }
  }

  /**
   * Used to wait for policy to resolve;
   * @param {string} policyId
   * @return {!Promise<CONSENT_POLICY_STATE>}
   */
  whenPolicyResolved(policyId) {
    // If customized policy is not supported
    if (!ALLOWLIST_POLICY[policyId]) {
      user().error(
        TAG,
        'can not find policy %s, only predefined policies are supported',
        policyId
      );
      return Promise.resolve(CONSENT_POLICY_STATE.UNKNOWN);
    }
    return this.whenPolicyInstanceRegistered_(policyId).then(() => {
      return this.instances_[policyId].getReadyPromise().then(() => {
        return this.instances_[policyId].getCurrentPolicyStatus();
      });
    });
  }

  /**
   * Wait for policy to resolve and check if it should be unblocked
   * @param {string} policyId
   * @return {!Promise<boolean>}
   */
  whenPolicyUnblock(policyId) {
    // If customized policy is not supported
    if (!ALLOWLIST_POLICY[policyId]) {
      user().error(
        TAG,
        'can not find policy %s, only predefined policies are supported',
        policyId
      );
      return Promise.resolve(false);
    }
    return this.whenPolicyInstanceRegistered_(policyId).then(() => {
      return this.instances_[policyId].getReadyPromise().then(() => {
        return this.instances_[policyId].shouldUnblock();
      });
    });
  }

  /**
   * Get shared data of a policy. If multiple consent instances return
   * sharedData, a merge will be done. For any conflict keys, the value from
   * later consent instance (as defined in the policy config) will override
   * the previous ones.
   *
   * @param {string} policyId
   * @return {!Promise<Object>}
   */
  getMergedSharedData(policyId) {
    return this.whenPolicyResolved(policyId)
      .then(() => this.ConsentStateManagerPromise_)
      .then((manager) => {
        return manager.getConsentInstanceSharedData();
      });
  }

  /**
   * Get the consent string value of a policy. Return a promise that resolves
   * when the policy resolves.
   * @param {string} policyId
   * @return {!Promise<?string>}
   */
  getConsentStringInfo(policyId) {
    return this.whenPolicyResolved(policyId).then(() => {
      return this.consentString_;
    });
  }

  /**
   * Get the tcf policy version of a policy. Return a promise that resolves
   * when the policy resolves.
   * @param {string} policyId
   * @return {!Promise<?number>}
   */
  getTcfPolicyVersion(policyId) {
    return this.whenPolicyResolved(policyId).then(() => {
      return this.tcfPolicyVersion_;
    });
  }

  /**
   * Get the consent metadata value of a policy. Return a promise that resolves
   * when the policy resolves.
   * @param {string} policyId
   * @return {!Promise<?Object|undefined>}
   */
  getConsentMetadataInfo(policyId) {
    return this.whenPolicyResolved(policyId).then(() => {
      return this.consentMetadata_;
    });
  }

  /**
   * Wait for initial consent information to be transmitted,
   * then get consent state for this purpose.
   *
   * Note: Even if we have some intiial consent info, wait until all
   * purposes have been potentially collected, then check.
   * @param {!Array<string>} purposes
   * @return {!Promise<boolean>}
   */
  whenPurposesUnblock(purposes) {
    return this.ConsentStateManagerPromise_.then((manager) => {
      // Wait for all purpose consents (collected through UI or update)
      return manager.whenHasAllPurposeConsents();
    }).then(() => {
      if (!this.purposeConsents_) {
        return false;
      }
      const shouldUnblock = (purpose) =>
        hasOwn(this.purposeConsents_, purpose) &&
        this.purposeConsents_[purpose] === PURPOSE_CONSENT_STATE.ACCEPTED;
      return purposes.every(shouldUnblock);
    });
  }

  /**
   * Wait for policy instance to be registered.
   * @param {string} policyId
   * @return {!Promise}
   */
  whenPolicyInstanceRegistered_(policyId) {
    if (this.instances_[policyId]) {
      return Promise.resolve();
    }
    if (!this.policyInstancesDeferred_[policyId]) {
      this.policyInstancesDeferred_[policyId] = new Deferred();
    }
    return /** @type {!Promise} */ (
      this.policyInstancesDeferred_[policyId].promise
    );
  }
}

export class ConsentPolicyInstance {
  /**
   * Creates an instance of ConsentPolicyInstance.
   * @param {!JsonObject} config
   */
  constructor(config) {
    /** @private {!JsonObject} */
    this.config_ = config;

    const readyDeferred = new Deferred();

    /** @private {!Promise} */
    this.readyPromise_ = readyDeferred.promise;

    /** @private {?function()} */
    this.readyResolver_ = readyDeferred.resolve;

    /** @private {CONSENT_POLICY_STATE} */
    this.status_ = CONSENT_POLICY_STATE.UNKNOWN;

    /** @private {!Array<CONSENT_POLICY_STATE>} */
    this.unblockStateLists_ = config['unblockOn'] || [
      CONSENT_POLICY_STATE.SUFFICIENT,
      CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED,
    ];
  }

  /**
   * @param {Window} win
   */
  startTimeout(win) {
    const timeoutConfig = this.config_['timeout'];

    let timeoutSecond = null;
    let fallbackState;

    if (timeoutConfig != undefined) {
      // timeoutConfig could equal to 0;
      if (isObject(timeoutConfig)) {
        /**
         * "timeout": {
         *   "seconds" : 1,
         *   "fallbackAction": "reject"
         * }
         */
        if (
          timeoutConfig['fallbackAction'] &&
          timeoutConfig['fallbackAction'] == 'reject'
        ) {
          fallbackState = CONSENT_ITEM_STATE.REJECTED;
        } else if (
          timeoutConfig['fallbackAction'] &&
          timeoutConfig['fallbackAction'] != 'dismiss'
        ) {
          user().error(
            TAG,
            'unsupported fallbackAction %s',
            timeoutConfig['fallbackAction']
          );
        }
        timeoutSecond = timeoutConfig['seconds'];
      } else {
        timeoutSecond = timeoutConfig;
      }
      userAssert(
        isFiniteNumber(timeoutSecond),
        'invalid timeout value %s',
        timeoutSecond
      );
    }

    if (timeoutSecond != null) {
      win.setTimeout(() => {
        // Force evaluate on timeout
        fallbackState = fallbackState || CONSENT_ITEM_STATE.UNKNOWN;
        this.evaluate(fallbackState, true);
      }, timeoutSecond * 1000);
    }
  }

  /**
   * Evaluate the incoming consent state and determine if the policy instance
   * should be resolved and what the policy state should be.
   * @param {CONSENT_ITEM_STATE} state
   * @param {boolean} isFallback
   */
  evaluate(state, isFallback = false) {
    if (!state) {
      // Not ready for evaluate yet
      return;
    }

    if (isFallback && !this.readyResolver_) {
      // Discard fallback state if consent status has resolve before timeout.
      return;
    }

    if (state === CONSENT_ITEM_STATE.ACCEPTED) {
      this.status_ = CONSENT_POLICY_STATE.SUFFICIENT;
    } else if (state === CONSENT_ITEM_STATE.REJECTED) {
      this.status_ = CONSENT_POLICY_STATE.INSUFFICIENT;
    } else if (state === CONSENT_ITEM_STATE.NOT_REQUIRED) {
      this.status_ = CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED;
    } else {
      this.status_ = CONSENT_POLICY_STATE.UNKNOWN;
    }

    if (this.readyResolver_) {
      this.readyResolver_();
      this.readyResolver_ = null;
    }
  }

  /**
   * Return a promise that resolved when policy ready.
   * Note: the promise can be reset if use toggle consent state
   * @return {!Promise}
   */
  getReadyPromise() {
    return this.readyPromise_;
  }

  /**
   * Returns the current consent policy state
   * @return {CONSENT_POLICY_STATE}
   */
  getCurrentPolicyStatus() {
    return this.status_;
  }

  /**
   * Returns whether the current consent policy state should be unblocked
   * Caller need to make sure that policy status has resolved
   * @return {boolean}
   */
  shouldUnblock() {
    return this.unblockStateLists_.indexOf(this.status_) > -1;
  }
}
