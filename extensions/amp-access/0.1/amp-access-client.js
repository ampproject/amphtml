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

import {Services} from '../../../src/services';
import {assertHttpsUrl} from '../../../src/url';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';

/** @const {string} */
const TAG = 'amp-access-client';

/** @const {number} */
const DEFAULT_AUTHORIZATION_TIMEOUT = 3000;


/** @implements {./amp-access-source.AccessTypeAdapterDef} */
export class AccessClientAdapter {

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

    /** @const @private {string} */
    this.authorizationUrl_ = user().assert(configJson['authorization'],
        '"authorization" URL must be specified');
    assertHttpsUrl(this.authorizationUrl_, '"authorization"');

    /** @const @private {boolean} */
    this.isPingbackEnabled_ = !configJson['noPingback'];

    /** @const @private {string} */
    this.pingbackUrl_ = configJson['pingback'];
    if (this.isPingbackEnabled_) {
      user().assert(this.pingbackUrl_, '"pingback" URL must be specified');
      assertHttpsUrl(this.pingbackUrl_, '"pingback"');
    }

    /** @const @private {number} */
    this.authorizationTimeout_ = this.buildConfigAuthorizationTimeout_(
        configJson);

    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(ampdoc.win);

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(ampdoc.win);
  }

  /**
   * @param {!JsonObject} configJson
   * @return {number}
   */
  buildConfigAuthorizationTimeout_(configJson) {
    if (!configJson['authorizationTimeout']) {
      return DEFAULT_AUTHORIZATION_TIMEOUT;
    }

    let timeout = configJson['authorizationTimeout'];
    user().assert(typeof timeout == 'number',
        '"authorizationTimeout" must be a number');
    if (!(getMode().localDev || getMode().development)) {
      timeout = Math.min(timeout, DEFAULT_AUTHORIZATION_TIMEOUT);
    }
    return timeout;
  }

  /** @override */
  getConfig() {
    return {
      'authorizationUrl': this.authorizationUrl_,
      'pingbackEnabled': this.isPingbackEnabled_,
      'pingbackUrl': this.pingbackUrl_,
      'authorizationTimeout': this.authorizationTimeout_,
    };
  }

  /**
   * @return {string}
   */
  getAuthorizationUrl() {
    return this.authorizationUrl_;
  }

  /** @override */
  isAuthorizationEnabled() {
    return true;
  }

  /**
   * @return {number}
   */
  getAuthorizationTimeout() {
    return this.authorizationTimeout_;
  }

  /** @override */
  authorize() {
    dev().fine(TAG, 'Start authorization via ', this.authorizationUrl_);
    const urlPromise = this.context_.buildUrl(this.authorizationUrl_,
        /* useAuthData */ false);
    return urlPromise.then(url => {
      dev().fine(TAG, 'Authorization URL: ', url);
      return this.timer_.timeoutPromise(
          this.authorizationTimeout_,
          this.xhr_.fetchJson(url, {
            credentials: 'include',
          })).then(res => res.json());
    });
  }

  /** @override */
  isPingbackEnabled() {
    return this.isPingbackEnabled_;
  }

  /** @override */
  pingback() {
    const promise = this.context_.buildUrl(dev().assert(this.pingbackUrl_),
        /* useAuthData */ true);
    return promise.then(url => {
      dev().fine(TAG, 'Pingback URL: ', url);
      return this.xhr_.sendSignal(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: '',
      });
    });
  }

  /** @override */
  postAction() {
    // Nothing to do.
  }
}
