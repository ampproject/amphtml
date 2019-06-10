/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {
  UrlReplacementPolicy,
  batchFetchJsonFor,
} from '../../../src/batched-json';
import {dict} from '../../../src/utils/object';
import {isJsonScriptTag} from '../../../src/dom';
import {isObject} from '../../../src/types';
import {tryParseJson} from '../../../src/json';
import {user, userAssert} from '../../../src/log';

const TAG = 'amp-user-location';

/**
 * ConfigLoader unifies configuration parsing logic for local and remote
 * config resources.
 */
export class ConfigLoader {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!Element} element
   */
  constructor(ampdoc, element) {
    /** @private @const */
    this.ampdoc_ = ampdoc;

    /** @private @const */
    this.element_ = element;

    /**
     * This is not intended to be referenced directly.
     * Instead, call `getConfig_`
     * @private {?Promise<!JsonObject>}
     */
    this.fetchPromise_ = null;

    /**
     * This is not intended to be referenced directly.
     * Instead, call `getConfig_`
     * @private {?Promise<!JsonObject>}
     */
    this.scriptConfigPromise_ = null;
  }

  /**
   * Loads the local or remote config, if available. There are 4 cases:
   * 1. Local config only
   * 2. Local and remote config, with local used before remote config loads
   * 3. Remote config only
   * 4. No config specified
   * @return {!Promise<!JsonObject>}
   */
  getConfig() {
    // If there is a local config but not remote config,
    // then use the local config immediately.
    if (this.hasScriptConfig_() && !this.hasRemoteConfig_()) {
      return this.getScriptConfig_();
    }

    if (this.hasScriptConfig_() && this.hasRemoteConfig_()) {
      // Prefer the fetchConfig if it's ready, and if not use the script config.
      return Promise.race([this.fetchConfig(), this.getScriptConfig_()]);
    }

    // this.hasScriptConfig_() must have returned false by this point
    if (this.hasRemoteConfig_()) {
      return this.fetchConfig();
    }

    // If there is no remote or local config, use an empty dict.
    return Promise.resolve(dict());
  }

  /**
   * @return {boolean}
   * @private
   */
  hasScriptConfig_() {
    return this.element_.children.length > 0;
  }

  /**
   * @return {boolean}
   * @private
   */
  hasRemoteConfig_() {
    return this.element_.hasAttribute('src');
  }

  /**
   * Parse a JSON script tag for configuration, if present.
   * @return {!Promise<!JsonObject>}
   * @private
   */
  getScriptConfig_() {
    if (!this.hasScriptConfig_()) {
      return Promise.resolve(dict());
    }

    if (this.scriptConfigPromise_) {
      return this.scriptConfigPromise_;
    }

    const {children} = this.element_;
    userAssert(
      children.length == 1,
      'amp-user-location may only have one configuration json <script> tag'
    );

    const firstChild = children[0];
    if (!isJsonScriptTag(firstChild)) {
      user().error(
        TAG,
        'amp-user-location config should be in a <script> tag ' +
          'with type="application/json".'
      );
      return Promise.resolve(dict()); // TODO(cvializ): error handling is hard : (
    }

    const {promise, resolve, reject} = new Deferred();
    const json = tryParseJson(firstChild.textContent, e => {
      // Rejects synchronously, so if an error occurs,
      // the resolve below will have no effect
      reject(e);
    });
    resolve(assertIsObject(json));

    return (this.scriptConfigPromise_ = promise);
  }

  /**
   * If a remote config is present, fetch it. Consumer code can call this
   * early to pre-fetch the config before calling `getConfig`.
   * This is designed to only fetch the config once.
   * @return {!Promise<!JsonObject>}
   */
  fetchConfig() {
    if (!this.hasRemoteConfig_()) {
      return Promise.resolve(dict());
    }

    if (this.fetchPromise_) {
      return this.fetchPromise_;
    }

    return (this.fetchPromise_ = this.getRemoteConfig_());
  }

  /**
   * Reads the data from the URL provided in the 'src' attribute.
   * For use with remote data.
   * @return {!Promise<!JsonObject>}
   * @private
   */
  getRemoteConfig_() {
    const policy = UrlReplacementPolicy.ALL;
    return this.fetch_(this.ampdoc_, this.element_, '.', policy);
  }

  /**
   * Wrapper to stub during testing.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!Element} element
   * @param {string} token
   * @param {!UrlReplacementPolicy} policy
   * @return {!Promise<!JsonObject>}
   * @private
   */
  fetch_(ampdoc, element, token, policy) {
    return batchFetchJsonFor(ampdoc, element, token, policy).then(
      assertIsObject
    );
  }
}

/**
 * Ensure that the configuration object is not an array or scalar type.
 * @param {!JsonObject|!Array<!JsonObject>} configJson
 */
function assertIsObject(configJson) {
  user().assert(isObject(configJson), 'expected configuration to be object');
  return /** @type {!JsonObject} */ (configJson);
}
