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
import {isEnumValue} from '../../../src/types';

const TAG = 'CONSENT-STATE-MANAGER';

/**
 * @enum {number}
 */
export const CONSENT_ITEM_STATE = {
  UNKNOWN: 0,
  GRANTED: 1,
  REJECTED: 2,
  DISMISSED: 3,
  IGNORED: 4,
  // TODO(@zhouyx): Seperate UI state from consent state. Add consent requirement state
  // ui_state = {pending, active, complete}
  // consent_state = {unknown, granted, rejected}
};

export class ConsentStateManager {
  constructor(ampdoc) {
    /** @private {?../../../src/service/ampdoc-impl.AmpDoc} */
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
   */
  registerConsentInstance(instanceId) {
    dev().assert(!this.instances_[instanceId],
        `${TAG}: instance already registered`);
    this.instances_[instanceId] = new ConsentInstance(this.ampdoc_, instanceId);
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
    dev().assert(this.instances_[instanceId],
        `${TAG}: cannot find this instance`);
    dev().assert(this.consentChangeObservables_[instanceId],
        `${TAG}: should not update ignored consent`);
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
    let unlistener = null;
    if (this.consentChangeObservables_[instanceId] === null) {
      // Do not need consent for this instance.
      handler(CONSENT_ITEM_STATE.GRANTED);
      return () => {};
    } else {
      unlistener = this.consentChangeObservables_[instanceId].add(handler);
    }
    // Fire first consent instance state.
    this.getConsentInstanceState(instanceId).then(state => {
      handler(state);
    });

    return unlistener;
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
      this.consentReadyPromises_[instanceId] = new Promise(resolve => {
        this.consentReadyResolvers_[instanceId] = resolve;
      });
    }
    return this.consentReadyPromises_[instanceId];
  }
}

/**
 * @visibleForTesting
 */
export class ConsentInstance {
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
    if (!isEnumValue(CONSENT_ITEM_STATE, state)) {
      state = CONSENT_ITEM_STATE.UNKNOWN;
    }

    if (state == CONSENT_ITEM_STATE.DISMISSED) {
      this.localValue_ = this.localValue_ || CONSENT_ITEM_STATE.UNKNOWN;
      return;
    }

    if (state == CONSENT_ITEM_STATE.IGNORED) {
      if (!this.localValue_ || this.localValue_ == CONSENT_ITEM_STATE.UNKNOWN) {
        this.localValue_ = CONSENT_ITEM_STATE.IGNORED;
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

    const value = (state == CONSENT_ITEM_STATE.GRANTED);
    this.storagePromise_.then(storage => {
      if (state != this.localValue_) {
        // If state has changed. do not store.
        return;
      }
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
      if (this.localValue_) {
        // If value has been updated. return most updated value;
        return this.localValue_;
      }
      if (storedValue === undefined) {
        // state value undefined;
        this.localValue_ = CONSENT_ITEM_STATE.UNKNOWN;
      } else {
        this.localValue_ = storedValue ?
          CONSENT_ITEM_STATE.GRANTED : CONSENT_ITEM_STATE.REJECTED;
      }
      return this.localValue_;
    }).catch(e => {
      dev().error(TAG, 'Failed to read storage', e);
      return CONSENT_ITEM_STATE.UNKNOWN;
    });
  }
}
