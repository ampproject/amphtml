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
import {Services} from '../../../src/services';
import {assertHttpsUrl} from '../../../src/url';
import {dev, devAssert, user} from '../../../src/log';
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
  }

  /**
   * Register and create a consent instance to manage state
   * @param {string} instanceId
   * @param {!Object} config
   */
  registerConsentInstance(instanceId, config) {
    if (this.instance_) {
      dev().error(TAG, 'Cannot register consent instance %s, ' +
          'instance %s has already been registered.',
      instanceId, this.instanceId_);
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
   */
  updateConsentInstanceState(state, consentStr) {
    if (!this.instance_) {
      dev().error(TAG, 'instance not registered');
      return;
    }

    this.instance_.update(state, consentStr);

    if (this.consentChangeHandler_) {
      this.consentChangeHandler_(constructConsentInfo(state, consentStr));
    }
  }

  /**
   * Get local consent instance state
   * @return {Promise<!ConsentInfoDef>}
   */
  getConsentInstanceInfo() {
    devAssert(this.instance_,
        '%s: cannot find the instance', TAG);
    return this.instance_.get();
  }

  /**
   * Register the handler for every consent state change.
   * @param {function(!ConsentInfoDef)} handler
   */
  onConsentStateChange(handler) {
    devAssert(this.instance_,
        '%s: cannot find the instance', TAG);

    devAssert(!this.consentChangeHandler_,
        '%s: Duplicate consent change handler, will be ignored', TAG);

    this.consentChangeHandler_ = handler;

    // Fire first consent instance state.
    this.getConsentInstanceInfo().then(info => {
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
    devAssert(this.instance_,
        '%s: cannot find the instance', TAG);
    this.instance_.sharedDataPromise = sharedDataPromise;
  }

  /**
   * Returns a promise that resolves to a shareData object that is returned
   * from the remote endpoint.
   *
   * @return {?Promise<?Object>}
   */
  getConsentInstanceSharedData() {
    devAssert(this.instance_,
        '%s: cannot find the instance', TAG);
    return this.instance_.sharedDataPromise;
  }

  /**
   * Returns a promise that's resolved when consent instance is ready.
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
    const localState =
        this.localConsentInfo_ && this.localConsentInfo_['consentState'];
    const localConsentStr =
        this.localConsentInfo_ && this.localConsentInfo_['consentString'];
    const calculatedState =
        recalculateConsentStateValue(state, localState);

    if (state === CONSENT_ITEM_STATE.DISMISSED) {
      // If state is dismissed, use the old consent string.
      this.localConsentInfo_ =
          constructConsentInfo(calculatedState, localConsentStr);
      return;
    }

    const newConsentInfo = constructConsentInfo(calculatedState, consentString);
    const oldConsentInfo = this.localConsentInfo_;
    this.localConsentInfo_ = newConsentInfo;

    if (isConsentInfoStoredValueSame(newConsentInfo, oldConsentInfo)) {
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

      const consentStr = consentInfo['consentString'];
      if (consentStr && consentStr.length > 150) {
        // Verify the length of consentString.
        // 150 * 2 (utf8Encode) * 4/3 (base64) = 400 bytes.
        // TODO: Need utf8Encode if necessary.
        user().error(TAG,
            'Cannot store consentString which length exceeds 150 ' +
            'Previous stored consentInfo will be cleared');
        // If new consentInfo value cannot be stored, need to remove previous
        // value
        storage.remove(this.storageKey_);
        // TODO: Good to have a way to inform CMP service in this case
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
        // Unfortunately we need to keep the name to be backward compatible
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
