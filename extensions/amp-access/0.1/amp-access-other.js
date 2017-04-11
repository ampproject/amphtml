/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {dev} from '../../../src/log';
import {isProxyOrigin} from '../../../src/url';

/** @const {string} */
const TAG = 'amp-access-other';


/** @implements {AccessTypeAdapterDef} */
export class AccessOtherAdapter {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JSONType} configJson
   * @param {!AccessTypeAdapterContextDef} context
   */
  constructor(ampdoc, configJson, context) {
    /** @const */
    this.ampdoc = ampdoc;

    /** @const @private {!AccessTypeAdapterContextDef} */
    this.context_ = context;

    /** @private {?JSONType} */
    this.authorizationResponse_ =
        configJson['authorizationFallbackResponse'] || null;

    /** @const @private {boolean} */
    this.isProxyOrigin_ = isProxyOrigin(ampdoc.win.location);
  }

  /** @override */
  getConfig() {
    return {
      'authorizationResponse': this.authorizationResponse_,
    };
  }

  /** @override */
  isAuthorizationEnabled() {
    // The `type=other` is allowed to use the authorization fallback, but
    // only if it's not on `cdn.ampproject.org`.
    return (!!this.authorizationResponse_ && !this.isProxyOrigin_);
  }

  /** @override */
  authorize() {
    dev().fine(TAG, 'Use the authorization fallback for type=other');
    // Disallow authorization for proxy origin (`cdn.ampproject.org`).
    dev().assert(!this.isProxyOrigin_, 'Cannot authorize for proxy origin');
    return Promise.resolve(dev().assert(this.authorizationResponse_));
  }

  /** @override */
  isPingbackEnabled() {
    return false;
  }

  /** @override */
  pingback() {
    dev().fine(TAG, 'Ignore pingback');
    return Promise.resolve();
  }
}
