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

import {Services} from '../../../src/services';

export class ConsentStateManager {
  constructor(ampdoc) {
    this.ampdoc = ampdoc;

    this.instances_ = {};
  }

  /**
   * Register and create a consent instance to manage state
   * @param {string} instanceId
   */
  registerConsentInstance(instanceId) {
    this.instances_[instanceId] = new ConsentInstance(this.ampdoc, instanceId);
  }

  /**
   * Update consent instance state
   * @param {string} unusedInstanceId
   * @param {!Object} unusedConsentState
   */
  updateConsentInstanceState(unusedInstanceId, unusedConsentState) {

  }

  /**
   * Get local consent instance state
   * @param {string} unusedInstanceId
   * @return {!Object}
   */
  getConsentInstanceState(unusedInstanceId) {

  }

  /**
   * Register the handler for every consent state change.
   * @param {string} unusedInstanceId
   * @param {function(!Object)} unusedHandler
   */
  onConsentStateChange(unusedInstanceId, unusedHandler) {

  }
}

class ConsentInstance {
  constructor(ampdoc, unusedId) {

    this.storagePromise_ = Services.storageForDoc(ampdoc);

    this.localValue_ = null;

    this.disableLocalStorage_ = false;

    this.storageKey_ = null;
  }

  /**
   * Serialize the state to a string that stored in localStorage
   * @param {!Object} unusedConsentState
   * @return {string}
   */
  serializeState_(unusedConsentState) {

  }

  /**
   * Deserialize a string and convert to consent items state
   * @param {string} unusedStr
   * @return {!Object}
   */
  deserializeState_(unusedStr) {

  }

  /**
   * Update the local consent state list
   * @param {!Object} unusedConsentState
   */
  update(unusedConsentState) {

  }

  /**
   * Get the local consent state list
   * @return {!Object}
   */
  get() {

  }
}
