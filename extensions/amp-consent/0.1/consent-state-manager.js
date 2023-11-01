import {Deferred} from '#core/data-structures/promise';
import {once} from '#core/types/function';
import {hasOwn} from '#core/types/object';

import {Services} from '#service';
import {getRandomString64} from '#service/cid-impl';

import {dev, devAssert} from '#utils/log';

import {expandConsentEndpointUrl, getConsentCID} from './consent-config';
import {
  CONSENT_ITEM_STATE,
  ConsentInfoDef,
  ConsentMetadataDef,
  PURPOSE_CONSENT_STATE,
  calculateLegacyStateValue,
  composeStoreValue,
  constructConsentInfo,
  getConsentStateValue,
  getStoredConsentInfo,
  hasDirtyBit,
  isConsentInfoStoredValueSame,
  recalculateConsentStateValue,
} from './consent-info';

import {getServicePromiseForDoc} from '../../../src/service-helpers';
import {assertHttpsUrl} from '../../../src/url';

const TAG = 'CONSENT-STATE-MANAGER';

/**
 * Returns a promise for a service for the given id and ampdoc. Also expects
 * a service that has the actual implementation. The promise resolves when
 * the implementation loaded.
 * @param {!Element|!ShadowRoot|!./service/ampdoc-impl.AmpDoc} element
 * @return {!Promise<!Object>}
 */
export function getConsentStateManager(element) {
  return getServicePromiseForDoc(element, 'consentStateManager');
}

export class ConsentStateManager {
  /**
   * Creates an instance of ConsentStateManager.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {?string} */
    this.instanceId_ = null;

    /** @private {?ConsentInstance} */
    this.instance_ = null;

    /** @private {?function(!ConsentInfoDef)} */
    this.consentChangeHandler_ = null;

    /** @private {?Promise} */
    this.consentReadyPromise_ = null;

    /** @private {?function()} */
    this.consentReadyResolver_ = null;

    /** @private {{[key: string]: PURPOSE_CONSENT_STATE}|undefined} */
    this.purposeConsents_ = undefined;

    const allPurposeConsentsDeferred = new Deferred();

    /** @private {?function()} */
    this.hasAllPurposeConsentsResolver_ = allPurposeConsentsDeferred.resolve;

    /** @private {!Promise} */
    this.hasAllPurposeConsentsPromise_ = allPurposeConsentsDeferred.promise;

    /** @public @const {function():string} */
    this.consentPageViewId64 = once(() => getRandomString64(this.ampdoc_.win));
  }

  /**
   * Register and create a consent instance to manage state
   * @param {string} instanceId
   * @param {!Object} config
   */
  registerConsentInstance(instanceId, config) {
    if (this.instance_) {
      dev().error(
        TAG,
        'Cannot register consent instance %s, ' +
          'instance %s has already been registered.',
        instanceId,
        this.instanceId_
      );
      return;
    }

    this.instanceId_ = instanceId;

    this.instance_ = new ConsentInstance(this.ampdoc_, instanceId, config);

    if (this.consentReadyResolver_) {
      this.consentReadyResolver_();
      this.consentReadyResolver_ = null;
    }
  }

  /**
   * Update consent instance state
   * @param {CONSENT_ITEM_STATE} state
   * @param {string=} consentStr
   * @param {ConsentMetadataDef=} opt_consentMetadata
   * @param {number=} opt_tcfPolicyVersion
   */
  updateConsentInstanceState(
    state,
    consentStr,
    opt_consentMetadata,
    opt_tcfPolicyVersion
  ) {
    if (!this.instance_) {
      dev().error(TAG, 'instance not registered');
      return;
    }
    this.instance_.update(
      state,
      consentStr,
      this.purposeConsents_,
      opt_consentMetadata,
      false,
      opt_tcfPolicyVersion
    );

    if (this.consentChangeHandler_) {
      this.consentChangeHandler_(
        constructConsentInfo(
          state,
          consentStr,
          opt_consentMetadata,
          this.purposeConsents_,
          undefined,
          opt_tcfPolicyVersion
        )
      );
      // Need to be called after handler.
      this.hasAllPurposeConsents();
    }
  }

  /**
   * Update our current purposeConsents, that will be
   * used in subsequent calls to update().
   * @param {!{[key: string]: boolean}} purposeMap
   * @param {boolean} defaultsOnly
   */
  updateConsentInstancePurposes(purposeMap, defaultsOnly = false) {
    if (!this.purposeConsents_) {
      this.purposeConsents_ = {};
    }
    const purposes = Object.keys(purposeMap);
    purposes.forEach((purpose) => {
      // If defaults only, then only update if it doesn't exist.
      if (defaultsOnly && hasOwn(this.purposeConsents_, purpose)) {
        return;
      }
      const value = !!purposeMap[purpose]
        ? PURPOSE_CONSENT_STATE.ACCEPTED
        : PURPOSE_CONSENT_STATE.REJECTED;
      this.purposeConsents_[purpose] = value;
    });
  }

  /**
   * Get last consent instance stored.
   * @return {Promise<!ConsentInfoDef>}
   */
  getLastConsentInstanceInfo() {
    devAssert(this.instance_, '%s: cannot find the instance', TAG);
    return this.instance_.get();
  }

  /**
   * Get local consent instance state
   * @return {Promise<!ConsentInfoDef>}
   */
  getConsentInstanceInfo() {
    devAssert(this.instance_, '%s: cannot find the instance', TAG);
    return this.instance_.get().then((info) => {
      if (hasDirtyBit(info)) {
        return constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN);
      }
      return info;
    });
  }

  /**
   * Register the handler for every consent state change.
   * @param {function(!ConsentInfoDef)} handler
   */
  onConsentStateChange(handler) {
    devAssert(this.instance_, '%s: cannot find the instance', TAG);

    devAssert(
      !this.consentChangeHandler_,
      '%s: Duplicate consent change handler, will be ignored',
      TAG
    );

    this.consentChangeHandler_ = handler;

    // Fire first consent instance state.
    this.getConsentInstanceInfo().then((info) => {
      handler(info);
    });
  }

  /**
   * Sets a promise which resolves to a shareData object that is to be returned
   * from the remote endpoint.
   *
   * @param {Promise<?Object>} sharedDataPromise
   */
  setConsentInstanceSharedData(sharedDataPromise) {
    devAssert(this.instance_, '%s: cannot find the instance', TAG);
    this.instance_.sharedDataPromise = sharedDataPromise;
  }

  /**
   * Signifies that we collected all the purpose consents
   * from our source of truth (i.e locally stored or updated)
   */
  hasAllPurposeConsents() {
    this.hasAllPurposeConsentsResolver_();
  }

  /**
   * Wait for our purpose consents to be collected,
   * either locally or from update. Let amp-consent handle
   * when to resolve the promis (via update() or directly).
   * @return {!Promise}
   */
  whenHasAllPurposeConsents() {
    return this.hasAllPurposeConsentsPromise_;
  }

  /**
   * Set dirtyBit to current consent info. Refresh stored consent value with
   * dirtyBit
   * @param {boolean=} dirty
   * @return {Promise<void>}
   * TODO(alanorozco): Remove `dirty` argument and always set to true once
   * we remove clearDirtyBitOnResponse_dontUseThisItMightBeRemoved.
   */
  setDirtyBit(dirty = true) {
    return this.instance_.setDirtyBit(dirty);
  }

  /**
   * Returns a promise that resolves to a shareData object that is returned
   * from the remote endpoint.
   *
   * @return {?Promise<?Object>}
   */
  getConsentInstanceSharedData() {
    devAssert(this.instance_, '%s: cannot find the instance', TAG);
    return this.instance_.sharedDataPromise;
  }

  /**
   * Returns a promise that's resolved when consent instance is ready.
   * @return {*} TODO(#23582): Specify return type
   */
  whenConsentReady() {
    if (this.instance_) {
      return Promise.resolve();
    }
    if (!this.consentReadyPromise_) {
      const deferred = new Deferred();
      this.consentReadyPromise_ = deferred.promise;
      this.consentReadyResolver_ = deferred.resolve;
    }
    return this.consentReadyPromise_;
  }

  /**
   * Get last consent instance stored.
   * @visibleForTesting
   * @return {?ConsentInfoDef}
   */
  getSavedInstanceForTesting() {
    return this.instance_.savedConsentInfo_;
  }
}

/**
 * @visibleForTesting
 */
export class ConsentInstance {
  /**
   *
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {string} id
   * @param {!Object} config
   */
  constructor(ampdoc, id, config) {
    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {string} */
    this.id_ = id;

    /** @public {?Promise<Object>} */
    this.sharedDataPromise = null;

    /** @private {Promise<!../../../src/service/storage-impl.Storage>} */
    this.storagePromise_ = Services.storageForTopLevelDoc(ampdoc);

    /** @private {?ConsentInfoDef}*/
    this.localConsentInfo_ = null;

    /** @private {?ConsentInfoDef} */
    this.savedConsentInfo_ = null;

    /** @private {string} */
    this.storageKey_ = 'amp-consent:' + id;

    /** @private {?string} */
    this.onUpdateHref_ = config['onUpdateHref'] || null;
    if (this.onUpdateHref_) {
      assertHttpsUrl(this.onUpdateHref_, 'AMP-CONSENT');
    }

    /** @private {boolean|undefined} */
    this.hasDirtyBitNext_ = undefined;
  }

  /**
   * Set dirtyBit to current consent info. Refresh stored consent value with
   * dirtyBit
   * @param {boolean=} dirty
   * @return {Promise<void>}
   * TODO(alanorozco): Remove `dirty` argument and always set to true once
   * we remove clearDirtyBitOnResponse_dontUseThisItMightBeRemoved.
   */
  setDirtyBit(dirty = true) {
    // Note: this.hasDirtyBitNext_ is only set to true when 'forcePromptOnNext'
    // is set to true and we need to set dirtyBit for next visit.
    this.hasDirtyBitNext_ = dirty;
    return this.get().then((info) => {
      if (hasDirtyBit(info) === dirty) {
        // Current stored value has dirtyBit and is no longer valid.
        // No need to update with dirtyBit
        return;
      }
      this.update(
        info['consentState'],
        info['consentString'],
        info['purposeConsents'],
        info['consentMetadata'],
        dirty
      );
    });
  }

  /**
   * Update the local consent state list
   * @param {!CONSENT_ITEM_STATE} state
   * @param {string=} consentString
   * @param {{[key: string]: PURPOSE_CONSENT_STATE}=} purposeConsents
   * @param {ConsentMetadataDef=} opt_consentMetadata
   * @param {boolean=} opt_systemUpdate
   * @param {number=} opt_tcfPolicyVersion
   */
  update(
    state,
    consentString,
    purposeConsents,
    opt_consentMetadata,
    opt_systemUpdate,
    opt_tcfPolicyVersion
  ) {
    const localState =
      this.localConsentInfo_ && this.localConsentInfo_['consentState'];
    const calculatedState = recalculateConsentStateValue(state, localState);

    if (state === CONSENT_ITEM_STATE.DISMISSED) {
      // If state is dismissed, use the old consent string, metadata,
      // and puporse consents.
      this.localConsentInfo_ = constructConsentInfo(
        calculatedState,
        this.localConsentInfo_?.consentString,
        this.localConsentInfo_?.consentMetadata,
        this.localConsentInfo_?.purposeConsents,
        undefined,
        this.localConsentInfo_?.tcfPolicyVersion
      );
      return;
    }

    // Any user update makes the current state valid, thus remove dirtyBit
    // from localConsentInfo_
    const oldValue = this.localConsentInfo_;
    if (opt_systemUpdate && hasDirtyBit(oldValue)) {
      this.localConsentInfo_ = constructConsentInfo(
        calculatedState,
        consentString,
        opt_consentMetadata,
        purposeConsents,
        true,
        opt_tcfPolicyVersion
      );
    } else {
      // Any user update makes the current state valid, thus remove dirtyBit
      // from localConsentInfo_
      this.localConsentInfo_ = constructConsentInfo(
        calculatedState,
        consentString,
        opt_consentMetadata,
        purposeConsents,
        undefined,
        opt_tcfPolicyVersion
      );
    }

    const newConsentInfo = constructConsentInfo(
      calculatedState,
      consentString,
      opt_consentMetadata,
      purposeConsents,
      this.hasDirtyBitNext_,
      opt_tcfPolicyVersion
    );

    if (isConsentInfoStoredValueSame(newConsentInfo, this.savedConsentInfo_)) {
      // Only update/save to localstorage if it's not dismiss
      // and the value is different from what is stored.
      return;
    }

    // TODO(@zhouyx): Need force update to update timestamp
    this.updateStoredValue_(newConsentInfo);
  }

  /**
   * Write the new value to localStorage and send updateHrefRequest
   * @param {!ConsentInfoDef} consentInfo
   */
  updateStoredValue_(consentInfo) {
    this.storagePromise_.then((storage) => {
      if (
        !isConsentInfoStoredValueSame(
          consentInfo,
          this.localConsentInfo_,
          this.hasDirtyBitNext_
        )
      ) {
        // If state has changed. do not store outdated value.
        return;
      }

      if (consentInfo['consentState'] === CONSENT_ITEM_STATE.UNKNOWN) {
        // Remove stored value if the consentState is unknown
        // Do not consilidate with the value == null check below,
        // because UNKNOWN and DISMISS are different
        storage.remove(this.storageKey_);
        return;
      }

      const value = composeStoreValue(consentInfo);
      if (value == null) {
        // Value can be false, do not use !value check
        // Nothing to store to localStorage
        return;
      }

      this.savedConsentInfo_ = consentInfo;
      storage.setNonBoolean(this.storageKey_, value);
      this.sendUpdateHrefRequest_(consentInfo);
    });
  }

  /**
   * Get the local consent state list
   * @return {!Promise<!ConsentInfoDef>}
   */
  get() {
    if (this.localConsentInfo_) {
      // Return the local value if it has been processed before
      return Promise.resolve(this.localConsentInfo_);
    }

    let storage;
    return this.storagePromise_
      .then((s) => {
        storage = s;
        return storage.get(this.storageKey_);
      })
      .then((storedValue) => {
        if (this.localConsentInfo_) {
          // If local value has been updated, return most updated value;
          return this.localConsentInfo_;
        }

        const consentInfo = getStoredConsentInfo(storedValue);
        this.savedConsentInfo_ = consentInfo;

        if (hasDirtyBit(consentInfo)) {
          // clear stored value.
          this.sendUpdateHrefRequest_(
            constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN)
          );
          storage.remove(this.storageKey_);
          this.savedConsentInfo_ = null;
        }
        // Note: this.localConsentInfo dirtyBit can only be set to false
        // if the stored value has dirtyBit.
        // Any local update reset the value to true.
        this.localConsentInfo_ = consentInfo;
        return this.localConsentInfo_;
      })
      .catch((e) => {
        dev().error(TAG, 'Failed to read storage', e);
        return constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN);
      });
  }

  /**
   * send a POST request to the updateHref with userId with fixed scope
   * and consentInstanceIds
   * @param {!ConsentInfoDef} consentInfo
   */
  sendUpdateHrefRequest_(consentInfo) {
    if (!this.onUpdateHref_) {
      return;
    }
    if (hasDirtyBit(consentInfo)) {
      // No need to send update request if the stored consent info is dirty
      return;
    }
    const legacyConsentState = calculateLegacyStateValue(
      consentInfo['consentState']
    );
    getConsentCID(this.ampdoc_).then((userId) => {
      const request = /** @type {!JsonObject} */ ({
        // Unfortunately we need to keep the name to be backward compatible
        'consentInstanceId': this.id_,
        'ampUserId': userId,
      });
      if (legacyConsentState != null) {
        request['consentState'] = legacyConsentState;
      }
      request['consentStateValue'] = getConsentStateValue(
        consentInfo['consentState']
      );
      if (consentInfo['consentString']) {
        request['consentString'] = consentInfo['consentString'];
      }
      if (consentInfo['consentMetadata']) {
        request['consentMetadata'] = consentInfo['consentMetadata'];
      }
      if (consentInfo['purposeConsents']) {
        request['purposeConsents'] = consentInfo['purposeConsents'];
      }
      if (consentInfo['tcfPolicyVersion']) {
        request['tcfPolicyVersion'] = consentInfo['tcfPolicyVersion'];
      }
      const init = {
        credentials: 'include',
        method: 'POST',
        body: request,
        ampCors: false,
      };
      this.ampdoc_.whenFirstVisible().then(() => {
        expandConsentEndpointUrl(
          this.ampdoc_.getHeadNode(),
          /** @type {string} */ (this.onUpdateHref_)
        ).then((expandedUpdateHref) => {
          Services.xhrFor(this.ampdoc_.win).fetchJson(expandedUpdateHref, init);
        });
      });
    });
  }
}
