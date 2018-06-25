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

import {Deferred} from '../../../src/utils/promise';
import {Observable} from '../../../src/observable';
import {Services} from '../../../src/services';
import {assertHttpsUrl} from '../../../src/url';
import {dev} from '../../../src/log';
import {isEnumValue} from '../../../src/types';

const TAG = 'CONSENT-STATE-MANAGER';
const CID_SCOPE = 'AMP-CONSENT';

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
      dev().error(TAG, `instance ${instanceId} already registered`);
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
   */
  updateConsentInstanceState(instanceId, state) {
    if (!this.instances_[instanceId] ||
        !this.consentChangeObservables_[instanceId]) {
      dev().error(TAG, `instance ${instanceId} not registered`);
      return;
    }
    this.consentChangeObservables_[instanceId].fire(state);
    this.instances_[instanceId].update(state);
  }

  /**
   * Get local consent instance state
   * @param {string} instanceId
   * @return {Promise<CONSENT_ITEM_STATE>}
   */
  getConsentInstanceState(instanceId) {
    dev().assert(this.instances_[instanceId],
        `${TAG}: cannot find this instance`);
    return this.instances_[instanceId].get();
  }

  /**
   * Register the handler for every consent state change.
   * @param {string} instanceId
   * @param {function(CONSENT_ITEM_STATE)} handler
   */
  onConsentStateChange(instanceId, handler) {
    dev().assert(this.instances_[instanceId],
        `${TAG}: cannot find this instance`);

    const unlistener = this.consentChangeObservables_[instanceId].add(handler);
    // Fire first consent instance state.
    this.getConsentInstanceState(instanceId).then(state => {
      handler(state);
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
    dev().assert(this.instances_[instanceId],
        `${TAG}: cannot find this instance`);
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
    dev().assert(this.instances_[instanceId],
        `${TAG}: cannot find this instance`);
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

    /** @private {string} */
    this.id_ = id;

    /** @public {?Promise<Object>} */
    this.sharedDataPromise = null;

    /** @private {Promise<!../../../src/service/storage-impl.Storage>} */
    this.storagePromise_ = Services.storageForDoc(ampdoc);

    /** @private {?CONSENT_ITEM_STATE} */
    this.localValue_ = null;

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
   */
  update(state) {
    if (!isEnumValue(CONSENT_ITEM_STATE, state)) {
      state = CONSENT_ITEM_STATE.UNKNOWN;
    }

    if (state == CONSENT_ITEM_STATE.DISMISSED) {
      this.localValue_ = this.localValue_ || CONSENT_ITEM_STATE.UNKNOWN;
      return;
    }

    if (state == CONSENT_ITEM_STATE.NOT_REQUIRED) {
      if (!this.localValue_ || this.localValue_ == CONSENT_ITEM_STATE.UNKNOWN) {
        this.localValue_ = CONSENT_ITEM_STATE.NOT_REQUIRED;
      }
      return;
    }

    if (state === this.localValue_) {
      return;
    }

    this.localValue_ = state;

    if (state == CONSENT_ITEM_STATE.UNKNOWN) {
      return;
    }

    const value = (state == CONSENT_ITEM_STATE.ACCEPTED);
    this.storagePromise_.then(storage => {
      if (state != this.localValue_) {
        // If state has changed. do not store.
        return;
      }
      storage.set(this.storageKey_, value);
      this.sendUpdateHrefRequest_(value);
    });
  }

  /**
   * Get the local consent state list
   * @return {!Promise<CONSENT_ITEM_STATE>}
   */
  get() {
    if (this.localValue_) {
      return Promise.resolve(
          /** @type {CONSENT_ITEM_STATE} */ (this.localValue_));
    }

    return this.storagePromise_.then(storage => {
      return storage.get(this.storageKey_);
    }).then(storedValue => {
      if (this.localValue_) {
        // If value has been updated. return most updated value;
        return this.localValue_;
      }
      if (storedValue === undefined) {
        // state value undefined;
        this.localValue_ = CONSENT_ITEM_STATE.UNKNOWN;
      } else {
        this.localValue_ = storedValue ?
          CONSENT_ITEM_STATE.ACCEPTED : CONSENT_ITEM_STATE.REJECTED;
      }
      return this.localValue_;
    }).catch(e => {
      dev().error(TAG, 'Failed to read storage', e);
      return CONSENT_ITEM_STATE.UNKNOWN;
    });
  }

  /**
   * send a POST request to the updateHref with userId with fixed scope
   * and consentInstanceId
   * @param {boolean} state
   */
  sendUpdateHrefRequest_(state) {
    if (!this.onUpdateHref_) {
      return;
    }
    const cidPromise = Services.cidForDoc(this.ampdoc_).then(cid => {
      return cid.get({scope: CID_SCOPE, createCookieIfNotPresent: true},
          Promise.resolve());
    });
    cidPromise.then(userId => {
      const request = /** @type {!JsonObject} */ ({
        'consentInstanceId': this.id_,
        'ampUserId': userId,
        'consentState': state,
      });
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
