function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import { dict } from "../core/types/object";

import { Services } from "./";

import { parseUrlDeprecated } from "../url";

/**
 * Exposes CID API if provided by the Viewer.
 */
export var ViewerCidApi = /*#__PURE__*/function () {
  /**
   * Creates an instance of ViewerCidApi.
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function ViewerCidApi(ampdoc) {_classCallCheck(this, ViewerCidApi);
    /** @private {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!./viewer-interface.ViewerInterface} */
    this.viewer_ = Services.viewerForDoc(this.ampdoc_);

    var _Services$documentInf = Services.documentInfoForDoc(this.ampdoc_),canonicalUrl = _Services$documentInf.canonicalUrl;

    /** @private {?string} */
    this.canonicalOrigin_ = canonicalUrl ?
    parseUrlDeprecated(canonicalUrl).origin :
    null;
  }

  /**
   * Resolves to true if Viewer is trusted and supports CID API.
   * @return {!Promise<boolean>}
   */_createClass(ViewerCidApi, [{ key: "isSupported", value:
    function isSupported() {
      if (!this.viewer_.hasCapability('cid')) {
        return Promise.resolve(false);
      }
      return this.viewer_.isTrustedViewer();
    }

    /**
     * Returns scoped CID retrieved from the Viewer.
     * @param {string|undefined} apiKey
     * @param {string} scope
     * @return {!Promise<?JsonObject|string|undefined>}
     */ }, { key: "getScopedCid", value:
    function getScopedCid(apiKey, scope) {
      var payload = dict({
        'scope': scope,
        'clientIdApi': !!apiKey,
        'canonicalOrigin': this.canonicalOrigin_ });

      if (apiKey) {
        payload['apiKey'] = apiKey;
      }
      return this.viewer_.sendMessageAwaitResponse('cid', payload);
    } }]);return ViewerCidApi;}();
// /Users/mszylkowski/src/amphtml/src/service/viewer-cid-api.js