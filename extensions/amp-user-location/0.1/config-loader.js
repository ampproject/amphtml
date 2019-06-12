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

import {
  UrlReplacementPolicy,
  batchFetchJsonFor,
} from '../../../src/batched-json';
import {dict} from '../../../src/utils/object';
import {isArray, isObject} from '../../../src/types';
import {isJsonScriptTag} from '../../../src/dom';
import {tryParseJson} from '../../../src/json';
import {user, userAssert} from '../../../src/log';

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

    // Prefer the fetchConfig if it's ready, and if not use the script config.
    if (this.hasScriptConfig_() && this.hasRemoteConfig_()) {
      // We chain the Promises passed to `Promise.race` because `race` handles
      // already-resolved promises differently if they have a then block
      // e.g.
      // await Promise.race([Promise.resolve(1 + 1), Promise.resolve(0)]); // => 2
      // await Promise.race([
      //   Promise.resolve(1).then(x => x + 1),
      //   Promise.resolve(0),
      // ]); // => 0 💩
      // await Promise.race([
      //   Promise.resolve().then(() => Promise.resolve(1).then(x => x + 1)),
      //   Promise.resolve().then(() => Promise.resolve(0)),
      // ]); // => 2 😄
      return Promise.race([
        Promise.resolve().then(() => this.fetchConfig()),
        Promise.resolve().then(() => this.getScriptConfig_()),
      ]);
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

    const {children, tagName: TAG} = this.element_;
    userAssert(
      children.length == 1,
      '%s may only have one configuration json <script> tag',
      TAG
    );

    const firstChild = children[0];
    if (!isJsonScriptTag(firstChild)) {
      user().error(
        TAG,
        'config should be in a <script> tag with type="application/json".'
      );
      return Promise.resolve(dict());
    }

    const promise = new Promise((resolve, reject) => {
      const json = tryParseJson(firstChild.textContent, e => {
        // Rejects synchronously, so if an error occurs,
        // the resolve below will have no effect
        reject(e);
      });

      if (!json) {
        return resolve(dict());
      }

      resolve(this.assertIsObject_(json));
    });

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
    return this.fetch_(this.ampdoc_, this.element_, '.', policy).then(json =>
      this.assertIsObject_(json)
    );
  }

  /**
   * Wrapper to stub during testing.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!Element} element
   * @param {string} token
   * @param {!UrlReplacementPolicy} policy
   * @return {!Promise<!JsonObject|!Array<JsonObject>>}
   * @private visible for testing
   */
  fetch_(ampdoc, element, token, policy) {
    return batchFetchJsonFor(ampdoc, element, token, policy);
  }

  /**
   * Ensure that the configuration object is not an array or scalar type.
   * @param {!JsonObject|!Array<!JsonObject>} configJson
   * @return {!JsonObject}
   */
  assertIsObject_(configJson) {
    userAssert(
      !isArray(configJson) && isObject(configJson),
      'expected %s configuration to be object',
      this.element_.tagName
    );
    return /** @type {!JsonObject} */ (configJson);
  }
}
