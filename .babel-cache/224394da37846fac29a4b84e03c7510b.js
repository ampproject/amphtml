function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { LruCache } from "../core/data-structures/lru-cache";
import { urls } from "../config";
import { registerServiceBuilderForDoc } from "../service-helpers";
import { assertAbsoluteHttpOrHttpsUrl as _assertAbsoluteHttpOrHttpsUrl, assertHttpsUrl as _assertHttpsUrl, getSourceOrigin as _getSourceOrigin, getSourceUrl as _getSourceUrl, isProtocolValid as _isProtocolValid, isProxyOrigin as _isProxyOrigin, isSecureUrlDeprecated, parseUrlWithA, resolveRelativeUrl as _resolveRelativeUrl } from "../url";
var SERVICE = 'url';

/**
 */
export var Url = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function Url(ampdoc) {
    _classCallCheck(this, Url);

    var root = ampdoc.getRootNode();
    var doc = root.ownerDocument || root;

    /** @private @const {!HTMLAnchorElement} */
    this.anchor_ =
    /** @type {!HTMLAnchorElement} */
    doc.createElement('a');

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
   */
  _createClass(Url, [{
    key: "parse",
    value: function parse(url, opt_nocache) {
      return parseUrlWithA(this.anchor_, url, false || opt_nocache ? null : this.cache_);
    }
    /**
     * @param {string|!Location} url
     * @return {!Location}
     * @private
     */

  }, {
    key: "parse_",
    value: function parse_(url) {
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
     */

  }, {
    key: "isProtocolValid",
    value: function isProtocolValid(url) {
      return _isProtocolValid(url);
    }
    /**
     * Returns the source origin of an AMP document for documents served
     * on a proxy origin or directly.
     * @param {string|!Location} url URL of an AMP document.
     * @return {string} The source origin of the URL.
     */

  }, {
    key: "getSourceOrigin",
    value: function getSourceOrigin(url) {
      return _getSourceOrigin(this.parse_(url));
    }
    /**
     * Returns the source URL of an AMP document for documents served
     * on a proxy origin or directly.
     * @param {string|!Location} url URL of an AMP document.
     * @return {string}
     */

  }, {
    key: "getSourceUrl",
    value: function getSourceUrl(url) {
      return _getSourceUrl(this.parse_(url));
    }
    /**
     * Returns absolute URL resolved based on the relative URL and the base.
     * @param {string} relativeUrlString
     * @param {string|!Location} baseUrl
     * @return {string}
     */

  }, {
    key: "resolveRelativeUrl",
    value: function resolveRelativeUrl(relativeUrlString, baseUrl) {
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
     */

  }, {
    key: "assertHttpsUrl",
    value: function assertHttpsUrl(urlString, elementContext, sourceName) {
      if (sourceName === void 0) {
        sourceName = 'source';
      }

      return _assertHttpsUrl(urlString, elementContext, sourceName);
    }
    /**
     * Asserts that a given url is an absolute HTTP or HTTPS URL.
     * @param {string} urlString
     * @return {string}
     */

  }, {
    key: "assertAbsoluteHttpOrHttpsUrl",
    value: function assertAbsoluteHttpOrHttpsUrl(urlString) {
      return _assertAbsoluteHttpOrHttpsUrl(urlString);
    }
    /**
     * Returns whether the URL has the origin of a proxy.
     * @param {string|!Location} url URL of an AMP document.
     * @return {boolean}
     */

  }, {
    key: "isProxyOrigin",
    value: function isProxyOrigin(url) {
      return _isProxyOrigin(this.parse_(url));
    }
    /**
     * Returns `true` if the URL is secure: either HTTPS or localhost (for
     * testing).
     * @param {string} url
     * @return {boolean}
     */

  }, {
    key: "isSecure",
    value: function isSecure(url) {
      return isSecureUrlDeprecated(this.parse_(url));
    }
    /**
     * Returns the correct origin for a given window.
     * @param {!Window} win
     * @return {string} origin
     */

  }, {
    key: "getWinOrigin",
    value: function getWinOrigin(win) {
      return win.origin || this.parse_(win.location.href).origin;
    }
    /**
     * If the resource URL is referenced from the publisher's origin,
     * convert the URL to be referenced from the cache.
     * @param {string} resourceUrl The URL of the document to load
     * @return {string}
     */

  }, {
    key: "getCdnUrlOnOrigin",
    value: function getCdnUrlOnOrigin(resourceUrl) {
      if (_isProxyOrigin(resourceUrl)) {
        return resourceUrl;
      }

      var _this$parse_ = this.parse_(resourceUrl),
          hash = _this$parse_.hash,
          host = _this$parse_.host,
          pathname = _this$parse_.pathname,
          search = _this$parse_.search;

      var encodedHost = encodeURIComponent(host);
      return urls.cdn + "/c/" + encodedHost + pathname + search + hash;
    }
  }]);

  return Url;
}();

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installUrlForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, SERVICE, Url,
  /* opt_instantiate */
  true);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVybC1pbXBsLmpzIl0sIm5hbWVzIjpbIkxydUNhY2hlIiwidXJscyIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MiLCJhc3NlcnRBYnNvbHV0ZUh0dHBPckh0dHBzVXJsIiwiYXNzZXJ0SHR0cHNVcmwiLCJnZXRTb3VyY2VPcmlnaW4iLCJnZXRTb3VyY2VVcmwiLCJpc1Byb3RvY29sVmFsaWQiLCJpc1Byb3h5T3JpZ2luIiwiaXNTZWN1cmVVcmxEZXByZWNhdGVkIiwicGFyc2VVcmxXaXRoQSIsInJlc29sdmVSZWxhdGl2ZVVybCIsIlNFUlZJQ0UiLCJVcmwiLCJhbXBkb2MiLCJyb290IiwiZ2V0Um9vdE5vZGUiLCJkb2MiLCJvd25lckRvY3VtZW50IiwiYW5jaG9yXyIsImNyZWF0ZUVsZW1lbnQiLCJjYWNoZV8iLCJ1cmwiLCJvcHRfbm9jYWNoZSIsInBhcnNlIiwicGFyc2VfIiwicmVsYXRpdmVVcmxTdHJpbmciLCJiYXNlVXJsIiwidXJsU3RyaW5nIiwiZWxlbWVudENvbnRleHQiLCJzb3VyY2VOYW1lIiwid2luIiwib3JpZ2luIiwibG9jYXRpb24iLCJocmVmIiwicmVzb3VyY2VVcmwiLCJoYXNoIiwiaG9zdCIsInBhdGhuYW1lIiwic2VhcmNoIiwiZW5jb2RlZEhvc3QiLCJlbmNvZGVVUklDb21wb25lbnQiLCJjZG4iLCJpbnN0YWxsVXJsRm9yRG9jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxRQUFSO0FBRUEsU0FBUUMsSUFBUjtBQUNBLFNBQVFDLDRCQUFSO0FBQ0EsU0FDRUMsNEJBQTRCLElBQTVCQSw2QkFERixFQUVFQyxjQUFjLElBQWRBLGVBRkYsRUFHRUMsZUFBZSxJQUFmQSxnQkFIRixFQUlFQyxZQUFZLElBQVpBLGFBSkYsRUFLRUMsZUFBZSxJQUFmQSxnQkFMRixFQU1FQyxhQUFh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LyoqXG4gKiBDb3B5cmlnaHQgMjAxOCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7THJ1Q2FjaGV9IGZyb20gJyNjb3JlL2RhdGEtc3RydWN0dXJlcy9scnUtY2FjaGUnO1xuXG5pbXBvcnQge3VybHN9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge3JlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2N9IGZyb20gJy4uL3NlcnZpY2UtaGVscGVycyc7XG5pbXBvcnQge1xuICBhc3NlcnRBYnNvbHV0ZUh0dHBPckh0dHBzVXJsLFxuICBhc3NlcnRIdHRwc1VybCxcbiAgZ2V0U291cmNlT3JpZ2luLFxuICBnZXRTb3VyY2VVcmwsXG4gIGlzUHJvdG9jb2xWYWxpZCxcbiAgaXNQcm94eU9yaWdpbixcbiAgaXNTZWN1cmVVcmxEZXByZWNhdGVkLFxuICBwYXJzZVVybFdpdGhBLFxuICByZXNvbHZlUmVsYXRpdmVVcmwsXG59IGZyb20gJy4uL3VybCc7XG5cbmNvbnN0IFNFUlZJQ0UgPSAndXJsJztcblxuLyoqXG4gKi9cbmV4cG9ydCBjbGFzcyBVcmwge1xuICAvKipcbiAgICogQHBhcmFtIHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICAgKi9cbiAgY29uc3RydWN0b3IoYW1wZG9jKSB7XG4gICAgY29uc3Qgcm9vdCA9IGFtcGRvYy5nZXRSb290Tm9kZSgpO1xuICAgIGNvbnN0IGRvYyA9IHJvb3Qub3duZXJEb2N1bWVudCB8fCByb290O1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IUhUTUxBbmNob3JFbGVtZW50fSAqL1xuICAgIHRoaXMuYW5jaG9yXyA9IC8qKiBAdHlwZSB7IUhUTUxBbmNob3JFbGVtZW50fSAqLyAoZG9jLmNyZWF0ZUVsZW1lbnQoJ2EnKSk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHs/THJ1Q2FjaGV9ICovXG4gICAgdGhpcy5jYWNoZV8gPSBJU19FU00gPyBudWxsIDogbmV3IExydUNhY2hlKDEwMCk7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2VzIHRoZSBVUkwgaW4gdGhlIGNvbnRleHQgb2YgdGhlIGN1cnJlbnQgZG9jdW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICogQHBhcmFtIHtib29sZWFuPX0gb3B0X25vY2FjaGVcbiAgICogICBDYWNoZSBpcyBhbHdheXMgaWdub3JlZCBvbiBFU00gYnVpbGRzLCBzZWUgaHR0cHM6Ly9nby5hbXAuZGV2L3ByLzMxNTk0XG4gICAqIEByZXR1cm4geyFMb2NhdGlvbn1cbiAgICovXG4gIHBhcnNlKHVybCwgb3B0X25vY2FjaGUpIHtcbiAgICByZXR1cm4gcGFyc2VVcmxXaXRoQShcbiAgICAgIHRoaXMuYW5jaG9yXyxcbiAgICAgIHVybCxcbiAgICAgIElTX0VTTSB8fCBvcHRfbm9jYWNoZSA/IG51bGwgOiB0aGlzLmNhY2hlX1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd8IUxvY2F0aW9ufSB1cmxcbiAgICogQHJldHVybiB7IUxvY2F0aW9ufVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcGFyc2VfKHVybCkge1xuICAgIGlmICh0eXBlb2YgdXJsICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucGFyc2UodXJsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIFVSTCBoYXMgdmFsaWQgcHJvdG9jb2wuXG4gICAqIERlZXAgbGluayBwcm90b2NvbCBpcyB2YWxpZCwgYnV0IG5vdCBqYXZhc2NyaXB0IGV0Yy5cbiAgICogQHBhcmFtIHtzdHJpbmd8IUxvY2F0aW9ufSB1cmxcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzUHJvdG9jb2xWYWxpZCh1cmwpIHtcbiAgICByZXR1cm4gaXNQcm90b2NvbFZhbGlkKHVybCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc291cmNlIG9yaWdpbiBvZiBhbiBBTVAgZG9jdW1lbnQgZm9yIGRvY3VtZW50cyBzZXJ2ZWRcbiAgICogb24gYSBwcm94eSBvcmlnaW4gb3IgZGlyZWN0bHkuXG4gICAqIEBwYXJhbSB7c3RyaW5nfCFMb2NhdGlvbn0gdXJsIFVSTCBvZiBhbiBBTVAgZG9jdW1lbnQuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHNvdXJjZSBvcmlnaW4gb2YgdGhlIFVSTC5cbiAgICovXG4gIGdldFNvdXJjZU9yaWdpbih1cmwpIHtcbiAgICByZXR1cm4gZ2V0U291cmNlT3JpZ2luKHRoaXMucGFyc2VfKHVybCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHNvdXJjZSBVUkwgb2YgYW4gQU1QIGRvY3VtZW50IGZvciBkb2N1bWVudHMgc2VydmVkXG4gICAqIG9uIGEgcHJveHkgb3JpZ2luIG9yIGRpcmVjdGx5LlxuICAgKiBAcGFyYW0ge3N0cmluZ3whTG9jYXRpb259IHVybCBVUkwgb2YgYW4gQU1QIGRvY3VtZW50LlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRTb3VyY2VVcmwodXJsKSB7XG4gICAgcmV0dXJuIGdldFNvdXJjZVVybCh0aGlzLnBhcnNlXyh1cmwpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFic29sdXRlIFVSTCByZXNvbHZlZCBiYXNlZCBvbiB0aGUgcmVsYXRpdmUgVVJMIGFuZCB0aGUgYmFzZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVXJsU3RyaW5nXG4gICAqIEBwYXJhbSB7c3RyaW5nfCFMb2NhdGlvbn0gYmFzZVVybFxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICByZXNvbHZlUmVsYXRpdmVVcmwocmVsYXRpdmVVcmxTdHJpbmcsIGJhc2VVcmwpIHtcbiAgICByZXR1cm4gcmVzb2x2ZVJlbGF0aXZlVXJsKHJlbGF0aXZlVXJsU3RyaW5nLCB0aGlzLnBhcnNlXyhiYXNlVXJsKSk7XG4gIH1cblxuICAvKipcbiAgICogQXNzZXJ0cyB0aGF0IGEgZ2l2ZW4gdXJsIGlzIEhUVFBTIG9yIHByb3RvY29sIHJlbGF0aXZlLiBJdCdzIGEgdXNlci1sZXZlbFxuICAgKiBhc3NlcnQuXG4gICAqXG4gICAqIFByb3ZpZGVzIGFuIGV4Y2VwdGlvbiBmb3IgbG9jYWxob3N0LlxuICAgKlxuICAgKiBAcGFyYW0gez9zdHJpbmd8dW5kZWZpbmVkfSB1cmxTdHJpbmdcbiAgICogQHBhcmFtIHshRWxlbWVudHxzdHJpbmd9IGVsZW1lbnRDb250ZXh0IEVsZW1lbnQgd2hlcmUgdGhlIHVybCB3YXMgZm91bmQuXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gc291cmNlTmFtZSBVc2VkIGZvciBlcnJvciBtZXNzYWdlcy5cbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgYXNzZXJ0SHR0cHNVcmwodXJsU3RyaW5nLCBlbGVtZW50Q29udGV4dCwgc291cmNlTmFtZSA9ICdzb3VyY2UnKSB7XG4gICAgcmV0dXJuIGFzc2VydEh0dHBzVXJsKHVybFN0cmluZywgZWxlbWVudENvbnRleHQsIHNvdXJjZU5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydHMgdGhhdCBhIGdpdmVuIHVybCBpcyBhbiBhYnNvbHV0ZSBIVFRQIG9yIEhUVFBTIFVSTC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFN0cmluZ1xuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBhc3NlcnRBYnNvbHV0ZUh0dHBPckh0dHBzVXJsKHVybFN0cmluZykge1xuICAgIHJldHVybiBhc3NlcnRBYnNvbHV0ZUh0dHBPckh0dHBzVXJsKHVybFN0cmluZyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBVUkwgaGFzIHRoZSBvcmlnaW4gb2YgYSBwcm94eS5cbiAgICogQHBhcmFtIHtzdHJpbmd8IUxvY2F0aW9ufSB1cmwgVVJMIG9mIGFuIEFNUCBkb2N1bWVudC5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzUHJveHlPcmlnaW4odXJsKSB7XG4gICAgcmV0dXJuIGlzUHJveHlPcmlnaW4odGhpcy5wYXJzZV8odXJsKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIFVSTCBpcyBzZWN1cmU6IGVpdGhlciBIVFRQUyBvciBsb2NhbGhvc3QgKGZvclxuICAgKiB0ZXN0aW5nKS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNTZWN1cmUodXJsKSB7XG4gICAgcmV0dXJuIGlzU2VjdXJlVXJsRGVwcmVjYXRlZCh0aGlzLnBhcnNlXyh1cmwpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjb3JyZWN0IG9yaWdpbiBmb3IgYSBnaXZlbiB3aW5kb3cuXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEByZXR1cm4ge3N0cmluZ30gb3JpZ2luXG4gICAqL1xuICBnZXRXaW5PcmlnaW4od2luKSB7XG4gICAgcmV0dXJuIHdpbi5vcmlnaW4gfHwgdGhpcy5wYXJzZV8od2luLmxvY2F0aW9uLmhyZWYpLm9yaWdpbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiB0aGUgcmVzb3VyY2UgVVJMIGlzIHJlZmVyZW5jZWQgZnJvbSB0aGUgcHVibGlzaGVyJ3Mgb3JpZ2luLFxuICAgKiBjb252ZXJ0IHRoZSBVUkwgdG8gYmUgcmVmZXJlbmNlZCBmcm9tIHRoZSBjYWNoZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlc291cmNlVXJsIFRoZSBVUkwgb2YgdGhlIGRvY3VtZW50IHRvIGxvYWRcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZ2V0Q2RuVXJsT25PcmlnaW4ocmVzb3VyY2VVcmwpIHtcbiAgICBpZiAoaXNQcm94eU9yaWdpbihyZXNvdXJjZVVybCkpIHtcbiAgICAgIHJldHVybiByZXNvdXJjZVVybDtcbiAgICB9XG5cbiAgICBjb25zdCB7aGFzaCwgaG9zdCwgcGF0aG5hbWUsIHNlYXJjaH0gPSB0aGlzLnBhcnNlXyhyZXNvdXJjZVVybCk7XG4gICAgY29uc3QgZW5jb2RlZEhvc3QgPSBlbmNvZGVVUklDb21wb25lbnQoaG9zdCk7XG4gICAgcmV0dXJuIGAke3VybHMuY2RufS9jLyR7ZW5jb2RlZEhvc3R9JHtwYXRobmFtZX0ke3NlYXJjaH0ke2hhc2h9YDtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxVcmxGb3JEb2MoYW1wZG9jKSB7XG4gIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MoXG4gICAgYW1wZG9jLFxuICAgIFNFUlZJQ0UsXG4gICAgVXJsLFxuICAgIC8qIG9wdF9pbnN0YW50aWF0ZSAqLyB0cnVlXG4gICk7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/service/url-impl.js