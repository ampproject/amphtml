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

/** @const {string} */
const TAG = 'amp-access-iframe';


/** @implements {./amp-access-source.AccessTypeAdapterDef} */
export class AccessIframeAdapter {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} configJson
   * @param {!./amp-access-source.AccessTypeAdapterContextDef} context
   */
  constructor(ampdoc, configJson, context) {
    /** @const */
    this.ampdoc = ampdoc;

    /** @const @private {!./amp-access-source.AccessTypeAdapterContextDef} */
    this.context_ = context;
  }

  /** @override */
  getConfig() {
    return {
    };
  }

  /** @override */
  isAuthorizationEnabled() {
    return true;
  }

  /** @override */
  authorize() {
    // TODO(dvoytenko): Implement.
    return Promise.reject(new Error(TAG + ': not implemented'));
  }

  /** @override */
  isPingbackEnabled() {
    return true;
  }

  /** @override */
  pingback() {
    // TODO(dvoytenko): Implement.
    return Promise.reject(new Error(TAG + ': not implemented'));
  }
}
