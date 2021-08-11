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

import { LruCache } from "../core/data-structures/lru-cache";

import { urls } from "../config";
import { registerServiceBuilderForDoc } from "../service-helpers";
import {
assertAbsoluteHttpOrHttpsUrl as _assertAbsoluteHttpOrHttpsUrl,
assertHttpsUrl as _assertHttpsUrl,
getSourceOrigin as _getSourceOrigin,
getSourceUrl as _getSourceUrl,
isProtocolValid as _isProtocolValid,
isProxyOrigin as _isProxyOrigin,
isSecureUrlDeprecated,
parseUrlWithA,
resolveRelativeUrl as _resolveRelativeUrl } from "../url";


var SERVICE = 'url';

/**
 */
export var Url = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function Url(ampdoc) {_classCallCheck(this, Url);
    var root = ampdoc.getRootNode();
    var doc = root.ownerDocument || root;

    /** @private @const {!HTMLAnchorElement} */
    this.anchor_ = /** @type {!HTMLAnchorElement} */(doc.createElement('a'));

    /** @private @const {?LruCache} */
    this.cache_ = false ? null : new LruCache(100);
  }

  /**
   * Parses the URL in the context of the current document.
   *
   * @param {string} url
   * @param {boolean=} opt_nocache
   *   Cache is always ignored on ESM builds, see https://go.amp.dev/pr/31594
   * @return {!Location}
   */_createClass(Url, [{ key: "parse", value:
    function parse(url, opt_nocache) {
      return parseUrlWithA(
      this.anchor_,
      url,
      false || opt_nocache ? null : this.cache_);

    }

    /**
     * @param {string|!Location} url
     * @return {!Location}
     * @private
     */ }, { key: "parse_", value:
    function parse_(url) {
      if (typeof url !== 'string') {
        return url;
      }
      return this.parse(url);
    }

    /**
     * Returns whether the URL has valid protocol.
     * Deep link protocol is valid, but not javascript etc.
     * @param {string|!Location} url
     * @return {boolean}
     */ }, { key: "isProtocolValid", value:
    function isProtocolValid(url) {
      return _isProtocolValid(url);
    }

    /**
     * Returns the source origin of an AMP document for documents served
     * on a proxy origin or directly.
     * @param {string|!Location} url URL of an AMP document.
     * @return {string} The source origin of the URL.
     */ }, { key: "getSourceOrigin", value:
    function getSourceOrigin(url) {
      return _getSourceOrigin(this.parse_(url));
    }

    /**
     * Returns the source URL of an AMP document for documents served
     * on a proxy origin or directly.
     * @param {string|!Location} url URL of an AMP document.
     * @return {string}
     */ }, { key: "getSourceUrl", value:
    function getSourceUrl(url) {
      return _getSourceUrl(this.parse_(url));
    }

    /**
     * Returns absolute URL resolved based on the relative URL and the base.
     * @param {string} relativeUrlString
     * @param {string|!Location} baseUrl
     * @return {string}
     */ }, { key: "resolveRelativeUrl", value:
    function resolveRelativeUrl(relativeUrlString, baseUrl) {
      return _resolveRelativeUrl(relativeUrlString, this.parse_(baseUrl));
    }

    /**
     * Asserts that a given url is HTTPS or protocol relative. It's a user-level
     * assert.
     *
     * Provides an exception for localhost.
     *
     * @param {?string|undefined} urlString
     * @param {!Element|string} elementContext Element where the url was found.
     * @param {string=} sourceName Used for error messages.
     * @return {string}
     */ }, { key: "assertHttpsUrl", value:
    function assertHttpsUrl(urlString, elementContext) {var sourceName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'source';
      return _assertHttpsUrl(urlString, elementContext, sourceName);
    }

    /**
     * Asserts that a given url is an absolute HTTP or HTTPS URL.
     * @param {string} urlString
     * @return {string}
     */ }, { key: "assertAbsoluteHttpOrHttpsUrl", value:
    function assertAbsoluteHttpOrHttpsUrl(urlString) {
      return _assertAbsoluteHttpOrHttpsUrl(urlString);
    }

    /**
     * Returns whether the URL has the origin of a proxy.
     * @param {string|!Location} url URL of an AMP document.
     * @return {boolean}
     */ }, { key: "isProxyOrigin", value:
    function isProxyOrigin(url) {
      return _isProxyOrigin(this.parse_(url));
    }

    /**
     * Returns `true` if the URL is secure: either HTTPS or localhost (for
     * testing).
     * @param {string} url
     * @return {boolean}
     */ }, { key: "isSecure", value:
    function isSecure(url) {
      return isSecureUrlDeprecated(this.parse_(url));
    }

    /**
     * Returns the correct origin for a given window.
     * @param {!Window} win
     * @return {string} origin
     */ }, { key: "getWinOrigin", value:
    function getWinOrigin(win) {
      return win.origin || this.parse_(win.location.href).origin;
    }

    /**
     * If the resource URL is referenced from the publisher's origin,
     * convert the URL to be referenced from the cache.
     * @param {string} resourceUrl The URL of the document to load
     * @return {string}
     */ }, { key: "getCdnUrlOnOrigin", value:
    function getCdnUrlOnOrigin(resourceUrl) {
      if (_isProxyOrigin(resourceUrl)) {
        return resourceUrl;
      }

      var _this$parse_ = this.parse_(resourceUrl),hash = _this$parse_.hash,host = _this$parse_.host,pathname = _this$parse_.pathname,search = _this$parse_.search;
      var encodedHost = encodeURIComponent(host);
      return "".concat(urls.cdn, "/c/").concat(encodedHost).concat(pathname).concat(search).concat(hash);
    } }]);return Url;}();


/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installUrlForDoc(ampdoc) {
  registerServiceBuilderForDoc(
  ampdoc,
  SERVICE,
  Url,
  /* opt_instantiate */true);

}
// /Users/mszylkowski/src/amphtml/src/service/url-impl.js