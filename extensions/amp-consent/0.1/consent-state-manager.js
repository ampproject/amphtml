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

import {Observable} from '../../../src/observable';
import {Services} from '../../../src/services';
import {dev} from '../../../src/log';

const TAG = 'CONSENT-STATE-MANAGER';

/**
 * @enum {number}
 */
export const CONSENT_ITEM_STATE = {
  UNKNOWN: 0,
  GRANTED: 1,
  REJECTED: 2,
};

export class ConsentStateManager {
  constructor(ampdoc) {
    /** @private {?../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!Object<string, ConsentInstance>} */
    this.instances_ = {};

    /** @private {!Object<string, ?Observable>}*/
    this.consentChangeObservable_ = {};

    /** @private {!Object<string, function()>} */
    this.consentReadyResolver_ = {};

    /** @private {!Object<string, Promise>} */
    this.consentReadyPromise_ = {};
  }

  /**
   * Register and create a consent instance to manage state
   * @param {string} instanceId
   */
  registerConsentInstance(instanceId) {
    dev().assert(!this.instances_[instanceId],
        `${TAG}: instance already registered`);
    this.instances_[instanceId] = new ConsentInstance(this.ampdoc_, instanceId);
    this.consentChangeObservable_[instanceId] = new Observable();
    if (this.consentReadyResolver_[instanceId]) {
      this.consentReadyResolver_();
      this.consentReadyPromise_[instanceId] = null;
      this.consentReadyResolver_[instanceId] = null;
    }
  }

  /**
   * Ignore a consent instance.
   * @param {string} instanceId
   */
  ignoreConsentInstance(instanceId) {
    dev().assert(this.instances_[instanceId],
        `${TAG}: cannot find this instance`);
    this.consentChangeObservable_[instanceId].fire(CONSENT_ITEM_STATE.GRANTED);
    this.consentChangeObservable_[instanceId].removeAll();
    this.consentChangeObservable_[instanceId] = null;
  }

  /**
   * Update consent instance state
   * @param {string} instanceId
   * @param {CONSENT_ITEM_STATE} state
   */
  updateConsentInstanceState(instanceId, state) {

    dev().assert(this.instances_[instanceId],
        `${TAG}: cannot find this instance`);

    this.consentChangeObservable_[instanceId].fire(state);
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
    let unlistener = null;
    if (this.consentChangeObservable_[instanceId] === null) {
      // Do not need consent for this instance.
      handler(CONSENT_ITEM_STATE.GRANTED);
      return () => {};
    } else {
      unlistener = this.consentChangeObservable_[instanceId].add(handler);
    }
    // Fire first consent instance state.
    this.getConsentInstanceState(instanceId).then(state => {
      handler(state);
    });
    return unlistener;
  }

  whenConsentReady(instanceId) {
    if (this.instances_[instanceId]) {
      return Promise.resolve();
    }
    if (!this.consentReadyPromise_[instanceId]) {
      this.consentReadyPromise_[instanceId] = new Promise(resolve => {
        this.consentReadyResolver_[instanceId] = resolve;
      });
    }
    return this.consentReadyPromise_[instanceId];
  }
}


class ConsentInstance {
  constructor(ampdoc, id) {
    /** @private {Promise<!../../../src/service/storage-impl.Storage>} */
    this.storagePromise_ = Services.storageForDoc(ampdoc);

    /** @private {?CONSENT_ITEM_STATE} */
    this.localValue_ = null;

    /** @private {string} */
    this.storageKey_ = 'amp-consent:' + id;
  }

  /**
   * Update the local consent state list
   * @param {!CONSENT_ITEM_STATE} state
   */
  update(state) {
    if (state === this.localValue_) {
      return;
    }
    this.localValue_ = state;
    if (state == CONSENT_ITEM_STATE.UNKNOWN) {
      return;
    }

    const value = (state == CONSENT_ITEM_STATE.GRANTED) ? true : false;
    this.storagePromise_.then(storage => {
      storage.set(this.storageKey_, value);
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
      if (!storedValue) {
        // state value undefined;
        this.localValue_ = CONSENT_ITEM_STATE.UNKNOWN;
      } else {
        this.localValue_ = storedValue ?
          CONSENT_ITEM_STATE.GRANTED : CONSENT_ITEM_STATE.REJECTED;
      }
      return this.localValue_;
    });
  }
}
