function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { getService, registerServiceBuilder } from "../../../src/service-helpers";
import { hasOwn } from "../../../src/core/types/object";
import { parseLinker } from "./linker";
import { parseQueryString } from "../../../src/core/types/string/url";
import { removeParamsFromSearch } from "../../../src/url";

import { user } from "../../../src/log";

var TAG = 'amp-analytics/linker-reader';

export var LinkerReader = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function LinkerReader(win) {_classCallCheck(this, LinkerReader);
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Object<string, ?Object<string, string>>} */
    this.linkerParams_ = {};
  }

  /**
   * Get the LINKER_PARAM(name, id) value from url and clean the value
   * @param {string} name
   * @param {string} id
   * @return {?string}
   */_createClass(LinkerReader, [{ key: "get", value:
    function get(name, id) {
      if (!name || !id) {
        user().error(TAG, 'LINKER_PARAM requires two params, name and id');
        return null;
      }

      if (!hasOwn(this.linkerParams_, name)) {
        this.linkerParams_[name] = this.parseAndCleanQueryString_(name);
      }

      if (this.linkerParams_[name] && this.linkerParams_[name][id]) {
        return this.linkerParams_[name][id];
      }

      return null;
    }

    /**
     * Parse the url get the key value pair for the linker name
     * and remove the LINKER_PARAM from window location
     * @param {string} name
     * @return {?Object<string, string>}
     */ }, { key: "parseAndCleanQueryString_", value:
    function parseAndCleanQueryString_(name) {
      var params = parseQueryString(this.win_.location.search);
      if (!hasOwn(params, name)) {
        // Linker param not found.
        return null;
      }
      var value = params[name];
      this.removeLinkerParam_(this.win_.location, name);
      return parseLinker(value);
    }

    /**
     * Remove the linker param from the current url
     * @param {!Location} url
     * @param {string} name
     */ }, { key: "removeLinkerParam_", value:
    function removeLinkerParam_(url, name) {
      if (!this.win_.history.replaceState) {
        // Can't replace state. Ignore
        return;
      }
      var searchUrl = url.search;
      var removedLinkerParamSearchUrl = removeParamsFromSearch(searchUrl, name);
      var newHref =
      url.origin +
      url.pathname +
      removedLinkerParamSearchUrl + (
      url.hash || '');
      this.win_.history.replaceState(null, '', newHref);
    } }]);return LinkerReader;}();


/**
 * @param {!Window} win
 */
export function installLinkerReaderService(win) {
  registerServiceBuilder(win, 'amp-analytics-linker-reader', LinkerReader);
}

/**
 * @param {!Window} win
 * @return {!LinkerReader}
 */
export function linkerReaderServiceFor(win) {
  return getService(win, 'amp-analytics-linker-reader');
}
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/linker-reader.js