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

import {
  CONSENT_ITEM_STATE,
  ConsentInfoDef,
  calculateLegacyStateValue,
  composeStoreValue,
  constructConsentInfo,
  getStoredConsentInfo,
  isConsentInfoStoredValueSame,
  recalculateConsentStateValue,
} from './consent-info';
import {Deferred} from '../../../src/utils/promise';
import {Observable} from '../../../src/observable';
import {Services} from '../../../src/services';
import {assertHttpsUrl} from '../../../src/url';
import {dev, devAssert} from '../../../src/log';
import {isExperimentOn} from '../../../src/experiments';


const TAG = 'CONSENT-STATE-MANAGER';
const CID_SCOPE = 'AMP-CONSENT';

export class ConsentStateManager {
  /**
   * Creates an instance of ConsentStateManager.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!Object<string, ConsentInstance>} */
    this.instances_ = {};

    /** @private {!Object<string, ?Observable>}*/
    this.consentChangeObservables_ = {};

    /** @private {!Object<string, ?function()>} */
    this.consentReadyResolvers_ = {};

    /** @private {!Object<string, ?Promise>} */
    this.consentReadyPromises_ = {};
  }

  /**
   * Register and create a consent instance to manage state
   * @param {string} instanceId
   * @param {!Object} config
   */
  registerConsentInstance(instanceId, config) {
    if (this.instances_[instanceId]) {
      dev().error(TAG, 'instance %s already registered', instanceId);
      return;
    }
    this.instances_[instanceId] = new ConsentInstance(
        this.ampdoc_, instanceId, config);
    this.consentChangeObservables_[instanceId] = new Observable();
    if (this.consentReadyResolvers_[instanceId]) {
      this.consentReadyResolvers_[instanceId]();
      this.consentReadyPromises_[instanceId] = null;
      this.consentReadyResolvers_[instanceId] = null;
    }
  }

  /**
   * Update consent instance state
   * @param {string} instanceId
   * @param {CONSENT_ITEM_STATE} state
   * @param {string=} consentStr
   */
  updateConsentInstanceState(instanceId, state, consentStr) {
    if (!this.instances_[instanceId] ||
        !this.consentChangeObservables_[instanceId]) {
      dev().error(TAG, 'instance %s not registered', instanceId);
      return;
    }
    this.consentChangeObservables_[instanceId].fire(
        constructConsentInfo(state, consentStr));
    this.instances_[instanceId].update(state, consentStr);
  }

  /**
   * Get local consent instance state
   * @param {string} instanceId
   * @return {Promise<!ConsentInfoDef>}
   */
  getConsentInstanceInfo(instanceId) {
    devAssert(this.instances_[instanceId],
        '%s: cannot find this instance', TAG);
    return this.instances_[instanceId].get();
  }

  /**
   * Register the handler for every consent state change.
   * @param {string} instanceId
   * @param {function(!ConsentInfoDef)} handler
   */
  onConsentStateChange(instanceId, handler) {
    devAssert(this.instances_[instanceId],
        '%s: cannot find this instance', TAG);

    const unlistener = this.consentChangeObservables_[instanceId].add(handler);
    // Fire first consent instance state.
    this.getConsentInstanceInfo(instanceId).then(info => {
      handler(info);
    });

    return unlistener;
  }


  /**
   * Sets a promise which resolves to a shareData object that is to be returned
   * from the remote endpoint.
   *
   * @param {string} instanceId
   * @param {Promise<?Object>} sharedDataPromise
   */
  setConsentInstanceSharedData(instanceId, sharedDataPromise) {
    devAssert(this.instances_[instanceId],
        '%s: cannot find this instance', TAG);
    this.instances_[instanceId].sharedDataPromise = sharedDataPromise;
  }

  /**
   * Returns a promise that resolves to a shareData object that is returned
   * from the remote endpoint.
   *
   * @param {string} instanceId
   * @return {?Promise<?Object>}
   */
  getConsentInstanceSharedData(instanceId) {
    devAssert(this.instances_[instanceId],
        '%s: cannot find this instance', TAG);
    return this.instances_[instanceId].sharedDataPromise;
  }

  /**
   * Returns a promise that's resolved when consent instance is ready.
   * @param {string} instanceId
   */
  whenConsentReady(instanceId) {
    if (this.instances_[instanceId]) {
      return Promise.resolve();
    }
    if (!this.consentReadyPromises_[instanceId]) {
      const deferred = new Deferred();
      this.consentReadyPromises_[instanceId] = deferred.promise;
      this.consentReadyResolvers_[instanceId] = deferred.resolve;
    }
    return this.consentReadyPromises_[instanceId];
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

    /** @private {boolean} */
    this.isAmpConsentV2ExperimentOn_ =
        isExperimentOn(ampdoc.win, 'amp-consent-v2');

    /** @private {string} */
    this.id_ = id;

    /** @public {?Promise<Object>} */
    this.sharedDataPromise = null;

    /** @private {Promise<!../../../src/service/storage-impl.Storage>} */
    this.storagePromise_ = Services.storageForDoc(ampdoc);

    /** @private {?ConsentInfoDef}*/
    this.localConsentInfo_ = null;

    /** @private {string} */
    this.storageKey_ = 'amp-consent:' + id;

    /** @private {?string} */
    this.onUpdateHref_ = config['onUpdateHref'] || null;
    if (this.onUpdateHref_) {
      assertHttpsUrl(this.onUpdateHref_, 'AMP-CONSENT');
    }
  }

  /**
   * Update the local consent state list
   * @param {!CONSENT_ITEM_STATE} state
   * @param {string=} consentString
   */
  update(state, consentString) {
    const localStateValue =
        this.localConsentInfo_ && this.localConsentInfo_['consentState'];
    const localConsentStr =
        this.localConsentInfo_ && this.localConsentInfo_['consentString'];
    const calculatedState =
        recalculateConsentStateValue(state, localStateValue);

    // TODO(@zhouyx) Make consentString init value to null
    consentString = consentString || localConsentStr || undefined;
    const newConsentInfo = constructConsentInfo(calculatedState, consentString);
    const oldConsentInfo = this.localConsentInfo_;
    this.localConsentInfo_ = newConsentInfo;

    if (state === CONSENT_ITEM_STATE.DISMISSED ||
        isConsentInfoStoredValueSame(newConsentInfo, oldConsentInfo)) {
      // Only update/save to localstorage if it's not dismiss
      // And the value is different from what is stored.
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
    this.storagePromise_.then(storage => {
      if (!isConsentInfoStoredValueSame(
          consentInfo, this.localConsentInfo_)) {
        // If state has changed. do not store outdated value.
        return;
      }
      const value = composeStoreValue(
          consentInfo, this.isAmpConsentV2ExperimentOn_);
      if (value == null) {
        // Value can be false, do not use !value check
        // Nothing to store to localStorage
        return;
      }
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

    return this.storagePromise_.then(storage => {
      return storage.get(this.storageKey_);
    }).then(storedValue => {
      if (this.localConsentInfo_) {
        // If local value has been updated, return most updated value;
        return this.localConsentInfo_;
      }

      const consentInfo = getStoredConsentInfo(storedValue);
      this.localConsentInfo_ = consentInfo;
      return this.localConsentInfo_;
    }).catch(e => {
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
    const consentState =
        calculateLegacyStateValue(consentInfo['consentState']);
    const cidPromise = Services.cidForDoc(this.ampdoc_).then(cid => {
      return cid.get({scope: CID_SCOPE, createCookieIfNotPresent: true},
          Promise.resolve());
    });
    cidPromise.then(userId => {
      const request = /** @type {!JsonObject} */ ({
        'consentInstanceId': this.id_,
        'ampUserId': userId,
      });
      if (consentState != null) {
        request['consentState'] = consentState;
      }
      if (consentInfo['consentString']) {
        request['consentString'] = consentInfo['consentString'];
      }
      const init = {
        credentials: 'include',
        method: 'POST',
        body: request,
        ampCors: false,
      };
      Services.viewerForDoc(this.ampdoc_).whenFirstVisible().then(() => {
        Services.xhrFor(this.ampdoc_.win).fetchJson(
            /** @type {string} */ (this.onUpdateHref_), init);
      });
    });
  }
}
