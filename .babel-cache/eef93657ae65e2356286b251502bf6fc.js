var _templateObject;

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview Provides a services to preconnect to a url to warm up the
 * connection before the real request can be made.
 */
import { whenDocumentComplete } from "./core/document-ready";
import { htmlFor } from "./core/dom/static-template";
import { dev } from "./log";
import { Services } from "./service";
import { registerServiceBuilder } from "./service-helpers";
import { parseUrlDeprecated } from "./url";
var ACTIVE_CONNECTION_TIMEOUT_MS = 180 * 1000;
var PRECONNECT_TIMEOUT_MS = 10 * 1000;

/**
 * @typedef {{
 *   preload: (boolean|undefined),
 *   preconnect: (boolean|undefined)
 * }}
 */
var PreconnectFeaturesDef;

/** @private {?PreconnectFeaturesDef} */
var preconnectFeatures = null;

/**
 * Detect related features if feature detection is supported by the
 * browser. Even if this fails, the browser may support the feature.
 * @param {!Window} win
 * @return {!PreconnectFeaturesDef}
 */
function getPreconnectFeatures(win) {
  if (!preconnectFeatures) {
    var linkTag = win.document.createElement('link');
    var tokenList = linkTag['relList'];
    linkTag.as = 'invalid-value';

    if (!tokenList || !tokenList.supports) {
      return {};
    }

    preconnectFeatures = {
      preconnect: tokenList.supports('preconnect'),
      preload: tokenList.supports('preload'),
      onlyValidAs: linkTag.as != 'invalid-value'
    };
  }

  return preconnectFeatures;
}

/**
 * @param {?PreconnectFeaturesDef} features
 */
export function setPreconnectFeaturesForTesting(features) {
  preconnectFeatures = features;
}
export var PreconnectService = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function PreconnectService(win) {
    _classCallCheck(this, PreconnectService);

    /** @private @const {!Document} */
    this.document_ = win.document;

    /** @private @const {!Element} */
    this.head_ = dev().assertElement(win.document.head);

    /**
     * Origin we've preconnected to and when that connection
     * expires as a timestamp in MS.
     * @private @const {!Object<string, number>}
     */
    this.origins_ = {};

    /**
     * Urls we've prefetched.
     * @private @const {!Object<string, boolean>}
     */
    this.urls_ = {};

    /** @private @const {!./service/platform-impl.Platform}  */
    this.platform_ = Services.platformFor(win);
    // Mark current origin as preconnected.
    this.origins_[parseUrlDeprecated(win.location.href).origin] = true;

    /**
     * Detect support for the given resource hints.
     * Unfortunately not all browsers support this, so this can only
     * be used as an affirmative signal.
     * @private @const {!PreconnectFeaturesDef}
     */
    this.features_ = getPreconnectFeatures(win);

    /** @private @const {!./service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(win);
  }

  /**
   * Preconnects to a URL. Always also does a dns-prefetch because
   * browser support for that is better.
   *
   * It is safe to call this method during prerender with any value,
   * because no action will be performed until the doc is visible.
   *
   * It is safe to call this method with non-HTTP(s) URLs as other URLs
   * are skipped.
   *
   * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
   * @param {string} url
   * @param {boolean=} opt_alsoConnecting Set this flag if you also just
   *    did or are about to connect to this host. This is for the case
   *    where preconnect is issued immediate before or after actual connect
   *    and preconnect is used to flatten a deep HTTP request chain.
   *    E.g. when you preconnect to a host that an embed will connect to
   *    when it is more fully rendered, you already know that the connection
   *    will be used very soon.
   */
  _createClass(PreconnectService, [{
    key: "url",
    value: function url(ampdoc, _url, opt_alsoConnecting) {
      var _this = this;

      ampdoc.whenFirstVisible().then(function () {
        _this.url_(ampdoc, _url, opt_alsoConnecting);
      });
    }
    /**
     * Preconnects to a URL. Always also does a dns-prefetch because
     * browser support for that is better.
     * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
     * @param {string} url
     * @param {boolean=} opt_alsoConnecting Set this flag if you also just
     *    did or are about to connect to this host. This is for the case
     *    where preconnect is issued immediate before or after actual connect
     *    and preconnect is used to flatten a deep HTTP request chain.
     *    E.g. when you preconnect to a host that an embed will connect to
     *    when it is more fully rendered, you already know that the connection
     *    will be used very soon.
     * @private
     */

  }, {
    key: "url_",
    value: function url_(ampdoc, url, opt_alsoConnecting) {
      if (!this.isInterestingUrl_(url)) {
        return;
      }

      var _parseUrlDeprecated = parseUrlDeprecated(url),
          origin = _parseUrlDeprecated.origin;

      var now = Date.now();
      var lastPreconnectTimeout = this.origins_[origin];

      if (lastPreconnectTimeout && now < lastPreconnectTimeout) {
        if (opt_alsoConnecting) {
          this.origins_[origin] = now + ACTIVE_CONNECTION_TIMEOUT_MS;
        }

        return;
      }

      // If we are about to use the connection, don't re-preconnect for
      // 180 seconds.
      var timeout = opt_alsoConnecting ? ACTIVE_CONNECTION_TIMEOUT_MS : PRECONNECT_TIMEOUT_MS;
      this.origins_[origin] = now + timeout;
      // If we know that preconnect is supported, there is no need to do
      // dedicated dns-prefetch.
      var dns;

      if (!this.features_.preconnect) {
        dns = this.document_.createElement('link');
        dns.setAttribute('rel', 'dns-prefetch');
        dns.setAttribute('href', origin);
        this.head_.appendChild(dns);
      }

      var preconnect = this.document_.createElement('link');
      preconnect.setAttribute('rel', 'preconnect');
      preconnect.setAttribute('href', origin);
      preconnect.setAttribute('referrerpolicy', 'origin');
      this.head_.appendChild(preconnect);
      // Remove the tags eventually to free up memory.
      this.timer_.delay(function () {
        if (dns && dns.parentNode) {
          dns.parentNode.removeChild(dns);
        }

        if (preconnect.parentNode) {
          preconnect.parentNode.removeChild(preconnect);
        }
      }, 10000);
      this.preconnectPolyfill_(ampdoc, origin);
    }
    /**
     * Asks the browser to preload a URL. Always also does a preconnect
     * because browser support for that is better.
     *
     * It is safe to call this method during prerender with any value,
     * because no action will be performed until the doc is visible.
     *
     * It is safe to call this method with non-HTTP(s) URLs as other URLs
     * are skipped.
     *
     * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
     * @param {string} url
     * @param {string=} opt_preloadAs
     */

  }, {
    key: "preload",
    value: function preload(ampdoc, url, opt_preloadAs) {
      var _this2 = this;

      if (!this.isInterestingUrl_(url)) {
        return;
      }

      if (this.urls_[url]) {
        return;
      }

      this.urls_[url] = true;
      this.url(ampdoc, url,
      /* opt_alsoConnecting */
      true);

      if (!this.features_.preload) {
        return;
      }

      if (opt_preloadAs == 'document' && this.platform_.isSafari()) {
        // Preloading documents currently does not work in Safari,
        // because it
        // - does not support preloading iframes
        // - and uses a different cache for iframes (when loaded without
        //   as attribute).
        return;
      }

      ampdoc.whenFirstVisible().then(function () {
        _this2.performPreload_(url);
      });
    }
    /**
     * Performs a preload using `<link rel="preload">`.
     * @param {string} url
     * @private
     */

  }, {
    key: "performPreload_",
    value: function performPreload_(url) {
      var preload = htmlFor(this.document_)(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n        <link rel=\"preload\" referrerpolicy=\"origin\" />"])));
      preload.setAttribute('href', url);

      // Do not set 'as' attribute to correct value for now, for 2 reasons
      // - document value is not yet supported and dropped
      // - script is blocked due to CSP.
      // Due to spec change we now have to also preload with the "as"
      // being set to `fetch` when it would previously would be empty.
      // See https://github.com/w3c/preload/issues/80
      // for details.
      if (this.features_.onlyValidAs) {
        preload.as = 'fetch';
      } else {
        preload.as = '';
      }

      this.head_.appendChild(preload);
    }
    /**
     * Skips over non HTTP/HTTPS URL.
     * @param {string} url
     * @return {boolean}
     */

  }, {
    key: "isInterestingUrl_",
    value: function isInterestingUrl_(url) {
      if (url.startsWith('https:') || url.startsWith('http:')) {
        return true;
      }

      return false;
    }
    /**
     * Safari does not support preconnecting, but due to its significant
     * performance benefits we implement this crude polyfill.
     *
     * We make an image connection to a "well-known" file on the origin adding
     * a random query string to bust the cache (no caching because we do want to
     * actually open the connection).
     *
     * This should get us an open SSL connection to these hosts and significantly
     * speed up the next connections.
     *
     * The actual URL is expected to 404. If you see errors for
     * amp_preconnect_polyfill in your DevTools console or server log:
     * This is expected and fine to leave as is. Its fine to send a non 404
     * response, but please make it small :)
     *
     * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
     * @param {string} origin
     * @private
     */

  }, {
    key: "preconnectPolyfill_",
    value: function preconnectPolyfill_(ampdoc, origin) {
      // Unfortunately there is no reliable way to feature detect whether
      // preconnect is supported, so we do this only in Safari, which is
      // the most important browser without support for it.
      if (this.features_.preconnect || !(this.platform_.isSafari() || this.platform_.isIos())) {
        return;
      }

      // Don't attempt to preconnect for ACTIVE_CONNECTION_TIMEOUT_MS since
      // we effectively create an active connection.
      // TODO(@cramforce): Confirm actual http2 timeout in Safari.
      var now = Date.now();
      this.origins_[origin] = now + ACTIVE_CONNECTION_TIMEOUT_MS;
      // Make the URL change whenever we want to make a new request,
      // but make it stay stable in between. While a given page
      // would not actually make a new request, another page might
      // and with this it has the same URL. If (and that is a big if)
      // the server responds with a cacheable response, this reduces
      // requests we make. More importantly, though, it reduces URL
      // entropy as seen by servers and thus allows reverse proxies
      // (read CDNs) to respond more efficiently.
      var cacheBust = now - now % ACTIVE_CONNECTION_TIMEOUT_MS;
      var url = origin + '/robots.txt?_AMP_safari_preconnect_polyfill_cachebust=' + cacheBust;
      var xhr = new XMLHttpRequest();
      xhr.open('HEAD', url, true);
      // We only support credentialed preconnect for now.
      xhr.withCredentials = true;
      xhr.send();
    }
  }]);

  return PreconnectService;
}();

/**
 * @param {!Window} window
 */
export function installPreconnectService(window) {
  registerServiceBuilder(window, 'preconnect', PreconnectService);
}

/**
 * Preconnects to the source URL and canonical domains to make sure
 * outbound navigations are quick. Waits for onload to avoid blocking
 * more high priority loads.
 * @param {!Document} document
 * @return {Promise} When work is done.
 */
export function preconnectToOrigin(document) {
  return whenDocumentComplete(document).then(function () {
    var win = document.defaultView;

    if (win) {
      var preconnect = Services.preconnectFor(win);
      var info = Services.documentInfoForDoc(document.documentElement);
      var ampdoc = Services.ampdoc(document);
      preconnect.url(ampdoc, info.sourceUrl);
      preconnect.url(ampdoc, info.canonicalUrl);
    }
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByZWNvbm5lY3QuanMiXSwibmFtZXMiOlsid2hlbkRvY3VtZW50Q29tcGxldGUiLCJodG1sRm9yIiwiZGV2IiwiU2VydmljZXMiLCJyZWdpc3RlclNlcnZpY2VCdWlsZGVyIiwicGFyc2VVcmxEZXByZWNhdGVkIiwiQUNUSVZFX0NPTk5FQ1RJT05fVElNRU9VVF9NUyIsIlBSRUNPTk5FQ1RfVElNRU9VVF9NUyIsIlByZWNvbm5lY3RGZWF0dXJlc0RlZiIsInByZWNvbm5lY3RGZWF0dXJlcyIsImdldFByZWNvbm5lY3RGZWF0dXJlcyIsIndpbiIsImxpbmtUYWciLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ0b2tlbkxpc3QiLCJhcyIsInN1cHBvcnRzIiwicHJlY29ubmVjdCIsInByZWxvYWQiLCJvbmx5VmFsaWRBcyIsInNldFByZWNvbm5lY3RGZWF0dXJlc0ZvclRlc3RpbmciLCJmZWF0dXJlcyIsIlByZWNvbm5lY3RTZXJ2aWNlIiwiZG9jdW1lbnRfIiwiaGVhZF8iLCJhc3NlcnRFbGVtZW50IiwiaGVhZCIsIm9yaWdpbnNfIiwidXJsc18iLCJwbGF0Zm9ybV8iLCJwbGF0Zm9ybUZvciIsImxvY2F0aW9uIiwiaHJlZiIsIm9yaWdpbiIsImZlYXR1cmVzXyIsInRpbWVyXyIsInRpbWVyRm9yIiwiYW1wZG9jIiwidXJsIiwib3B0X2Fsc29Db25uZWN0aW5nIiwid2hlbkZpcnN0VmlzaWJsZSIsInRoZW4iLCJ1cmxfIiwiaXNJbnRlcmVzdGluZ1VybF8iLCJub3ciLCJEYXRlIiwibGFzdFByZWNvbm5lY3RUaW1lb3V0IiwidGltZW91dCIsImRucyIsInNldEF0dHJpYnV0ZSIsImFwcGVuZENoaWxkIiwiZGVsYXkiLCJwYXJlbnROb2RlIiwicmVtb3ZlQ2hpbGQiLCJwcmVjb25uZWN0UG9seWZpbGxfIiwib3B0X3ByZWxvYWRBcyIsImlzU2FmYXJpIiwicGVyZm9ybVByZWxvYWRfIiwic3RhcnRzV2l0aCIsImlzSW9zIiwiY2FjaGVCdXN0IiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwid2l0aENyZWRlbnRpYWxzIiwic2VuZCIsImluc3RhbGxQcmVjb25uZWN0U2VydmljZSIsIndpbmRvdyIsInByZWNvbm5lY3RUb09yaWdpbiIsImRlZmF1bHRWaWV3IiwicHJlY29ubmVjdEZvciIsImluZm8iLCJkb2N1bWVudEluZm9Gb3JEb2MiLCJkb2N1bWVudEVsZW1lbnQiLCJzb3VyY2VVcmwiLCJjYW5vbmljYWxVcmwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxvQkFBUjtBQUNBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyxHQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLHNCQUFSO0FBQ0EsU0FBUUMsa0JBQVI7QUFFQSxJQUFNQyw0QkFBNEIsR0FBRyxNQUFNLElBQTNDO0FBQ0EsSUFBTUMscUJBQXFCLEdBQUcsS0FBSyxJQUFuQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJQyxxQkFBSjs7QUFFQTtBQUNBLElBQUlDLGtCQUFrQixHQUFHLElBQXpCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNDLHFCQUFULENBQStCQyxHQUEvQixFQUFvQztBQUNsQyxNQUFJLENBQUNGLGtCQUFMLEVBQXlCO0FBQ3ZCLFFBQU1HLE9BQU8sR0FBR0QsR0FBRyxDQUFDRSxRQUFKLENBQWFDLGFBQWIsQ0FBMkIsTUFBM0IsQ0FBaEI7QUFDQSxRQUFNQyxTQUFTLEdBQUdILE9BQU8sQ0FBQyxTQUFELENBQXpCO0FBQ0FBLElBQUFBLE9BQU8sQ0FBQ0ksRUFBUixHQUFhLGVBQWI7O0FBQ0EsUUFBSSxDQUFDRCxTQUFELElBQWMsQ0FBQ0EsU0FBUyxDQUFDRSxRQUE3QixFQUF1QztBQUNyQyxhQUFPLEVBQVA7QUFD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Iiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBQcm92aWRlcyBhIHNlcnZpY2VzIHRvIHByZWNvbm5lY3QgdG8gYSB1cmwgdG8gd2FybSB1cCB0aGVcbiAqIGNvbm5lY3Rpb24gYmVmb3JlIHRoZSByZWFsIHJlcXVlc3QgY2FuIGJlIG1hZGUuXG4gKi9cblxuaW1wb3J0IHt3aGVuRG9jdW1lbnRDb21wbGV0ZX0gZnJvbSAnLi9jb3JlL2RvY3VtZW50LXJlYWR5JztcbmltcG9ydCB7aHRtbEZvcn0gZnJvbSAnLi9jb3JlL2RvbS9zdGF0aWMtdGVtcGxhdGUnO1xuaW1wb3J0IHtkZXZ9IGZyb20gJy4vbG9nJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJy4vc2VydmljZSc7XG5pbXBvcnQge3JlZ2lzdGVyU2VydmljZUJ1aWxkZXJ9IGZyb20gJy4vc2VydmljZS1oZWxwZXJzJztcbmltcG9ydCB7cGFyc2VVcmxEZXByZWNhdGVkfSBmcm9tICcuL3VybCc7XG5cbmNvbnN0IEFDVElWRV9DT05ORUNUSU9OX1RJTUVPVVRfTVMgPSAxODAgKiAxMDAwO1xuY29uc3QgUFJFQ09OTkVDVF9USU1FT1VUX01TID0gMTAgKiAxMDAwO1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIHByZWxvYWQ6IChib29sZWFufHVuZGVmaW5lZCksXG4gKiAgIHByZWNvbm5lY3Q6IChib29sZWFufHVuZGVmaW5lZClcbiAqIH19XG4gKi9cbmxldCBQcmVjb25uZWN0RmVhdHVyZXNEZWY7XG5cbi8qKiBAcHJpdmF0ZSB7P1ByZWNvbm5lY3RGZWF0dXJlc0RlZn0gKi9cbmxldCBwcmVjb25uZWN0RmVhdHVyZXMgPSBudWxsO1xuXG4vKipcbiAqIERldGVjdCByZWxhdGVkIGZlYXR1cmVzIGlmIGZlYXR1cmUgZGV0ZWN0aW9uIGlzIHN1cHBvcnRlZCBieSB0aGVcbiAqIGJyb3dzZXIuIEV2ZW4gaWYgdGhpcyBmYWlscywgdGhlIGJyb3dzZXIgbWF5IHN1cHBvcnQgdGhlIGZlYXR1cmUuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHJldHVybiB7IVByZWNvbm5lY3RGZWF0dXJlc0RlZn1cbiAqL1xuZnVuY3Rpb24gZ2V0UHJlY29ubmVjdEZlYXR1cmVzKHdpbikge1xuICBpZiAoIXByZWNvbm5lY3RGZWF0dXJlcykge1xuICAgIGNvbnN0IGxpbmtUYWcgPSB3aW4uZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuICAgIGNvbnN0IHRva2VuTGlzdCA9IGxpbmtUYWdbJ3JlbExpc3QnXTtcbiAgICBsaW5rVGFnLmFzID0gJ2ludmFsaWQtdmFsdWUnO1xuICAgIGlmICghdG9rZW5MaXN0IHx8ICF0b2tlbkxpc3Quc3VwcG9ydHMpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgcHJlY29ubmVjdEZlYXR1cmVzID0ge1xuICAgICAgcHJlY29ubmVjdDogdG9rZW5MaXN0LnN1cHBvcnRzKCdwcmVjb25uZWN0JyksXG4gICAgICBwcmVsb2FkOiB0b2tlbkxpc3Quc3VwcG9ydHMoJ3ByZWxvYWQnKSxcbiAgICAgIG9ubHlWYWxpZEFzOiBsaW5rVGFnLmFzICE9ICdpbnZhbGlkLXZhbHVlJyxcbiAgICB9O1xuICB9XG4gIHJldHVybiBwcmVjb25uZWN0RmVhdHVyZXM7XG59XG5cbi8qKlxuICogQHBhcmFtIHs/UHJlY29ubmVjdEZlYXR1cmVzRGVmfSBmZWF0dXJlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0UHJlY29ubmVjdEZlYXR1cmVzRm9yVGVzdGluZyhmZWF0dXJlcykge1xuICBwcmVjb25uZWN0RmVhdHVyZXMgPSBmZWF0dXJlcztcbn1cblxuZXhwb3J0IGNsYXNzIFByZWNvbm5lY3RTZXJ2aWNlIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4pIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshRG9jdW1lbnR9ICovXG4gICAgdGhpcy5kb2N1bWVudF8gPSB3aW4uZG9jdW1lbnQ7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshRWxlbWVudH0gKi9cbiAgICB0aGlzLmhlYWRfID0gZGV2KCkuYXNzZXJ0RWxlbWVudCh3aW4uZG9jdW1lbnQuaGVhZCk7XG4gICAgLyoqXG4gICAgICogT3JpZ2luIHdlJ3ZlIHByZWNvbm5lY3RlZCB0byBhbmQgd2hlbiB0aGF0IGNvbm5lY3Rpb25cbiAgICAgKiBleHBpcmVzIGFzIGEgdGltZXN0YW1wIGluIE1TLlxuICAgICAqIEBwcml2YXRlIEBjb25zdCB7IU9iamVjdDxzdHJpbmcsIG51bWJlcj59XG4gICAgICovXG4gICAgdGhpcy5vcmlnaW5zXyA9IHt9O1xuICAgIC8qKlxuICAgICAqIFVybHMgd2UndmUgcHJlZmV0Y2hlZC5cbiAgICAgKiBAcHJpdmF0ZSBAY29uc3QgeyFPYmplY3Q8c3RyaW5nLCBib29sZWFuPn1cbiAgICAgKi9cbiAgICB0aGlzLnVybHNfID0ge307XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4vc2VydmljZS9wbGF0Zm9ybS1pbXBsLlBsYXRmb3JtfSAgKi9cbiAgICB0aGlzLnBsYXRmb3JtXyA9IFNlcnZpY2VzLnBsYXRmb3JtRm9yKHdpbik7XG4gICAgLy8gTWFyayBjdXJyZW50IG9yaWdpbiBhcyBwcmVjb25uZWN0ZWQuXG4gICAgdGhpcy5vcmlnaW5zX1twYXJzZVVybERlcHJlY2F0ZWQod2luLmxvY2F0aW9uLmhyZWYpLm9yaWdpbl0gPSB0cnVlO1xuXG4gICAgLyoqXG4gICAgICogRGV0ZWN0IHN1cHBvcnQgZm9yIHRoZSBnaXZlbiByZXNvdXJjZSBoaW50cy5cbiAgICAgKiBVbmZvcnR1bmF0ZWx5IG5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCB0aGlzLCBzbyB0aGlzIGNhbiBvbmx5XG4gICAgICogYmUgdXNlZCBhcyBhbiBhZmZpcm1hdGl2ZSBzaWduYWwuXG4gICAgICogQHByaXZhdGUgQGNvbnN0IHshUHJlY29ubmVjdEZlYXR1cmVzRGVmfVxuICAgICAqL1xuICAgIHRoaXMuZmVhdHVyZXNfID0gZ2V0UHJlY29ubmVjdEZlYXR1cmVzKHdpbik7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshLi9zZXJ2aWNlL3RpbWVyLWltcGwuVGltZXJ9ICovXG4gICAgdGhpcy50aW1lcl8gPSBTZXJ2aWNlcy50aW1lckZvcih3aW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZWNvbm5lY3RzIHRvIGEgVVJMLiBBbHdheXMgYWxzbyBkb2VzIGEgZG5zLXByZWZldGNoIGJlY2F1c2VcbiAgICogYnJvd3NlciBzdXBwb3J0IGZvciB0aGF0IGlzIGJldHRlci5cbiAgICpcbiAgICogSXQgaXMgc2FmZSB0byBjYWxsIHRoaXMgbWV0aG9kIGR1cmluZyBwcmVyZW5kZXIgd2l0aCBhbnkgdmFsdWUsXG4gICAqIGJlY2F1c2Ugbm8gYWN0aW9uIHdpbGwgYmUgcGVyZm9ybWVkIHVudGlsIHRoZSBkb2MgaXMgdmlzaWJsZS5cbiAgICpcbiAgICogSXQgaXMgc2FmZSB0byBjYWxsIHRoaXMgbWV0aG9kIHdpdGggbm9uLUhUVFAocykgVVJMcyBhcyBvdGhlciBVUkxzXG4gICAqIGFyZSBza2lwcGVkLlxuICAgKlxuICAgKiBAcGFyYW0geyEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfYWxzb0Nvbm5lY3RpbmcgU2V0IHRoaXMgZmxhZyBpZiB5b3UgYWxzbyBqdXN0XG4gICAqICAgIGRpZCBvciBhcmUgYWJvdXQgdG8gY29ubmVjdCB0byB0aGlzIGhvc3QuIFRoaXMgaXMgZm9yIHRoZSBjYXNlXG4gICAqICAgIHdoZXJlIHByZWNvbm5lY3QgaXMgaXNzdWVkIGltbWVkaWF0ZSBiZWZvcmUgb3IgYWZ0ZXIgYWN0dWFsIGNvbm5lY3RcbiAgICogICAgYW5kIHByZWNvbm5lY3QgaXMgdXNlZCB0byBmbGF0dGVuIGEgZGVlcCBIVFRQIHJlcXVlc3QgY2hhaW4uXG4gICAqICAgIEUuZy4gd2hlbiB5b3UgcHJlY29ubmVjdCB0byBhIGhvc3QgdGhhdCBhbiBlbWJlZCB3aWxsIGNvbm5lY3QgdG9cbiAgICogICAgd2hlbiBpdCBpcyBtb3JlIGZ1bGx5IHJlbmRlcmVkLCB5b3UgYWxyZWFkeSBrbm93IHRoYXQgdGhlIGNvbm5lY3Rpb25cbiAgICogICAgd2lsbCBiZSB1c2VkIHZlcnkgc29vbi5cbiAgICovXG4gIHVybChhbXBkb2MsIHVybCwgb3B0X2Fsc29Db25uZWN0aW5nKSB7XG4gICAgYW1wZG9jLndoZW5GaXJzdFZpc2libGUoKS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMudXJsXyhhbXBkb2MsIHVybCwgb3B0X2Fsc29Db25uZWN0aW5nKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVjb25uZWN0cyB0byBhIFVSTC4gQWx3YXlzIGFsc28gZG9lcyBhIGRucy1wcmVmZXRjaCBiZWNhdXNlXG4gICAqIGJyb3dzZXIgc3VwcG9ydCBmb3IgdGhhdCBpcyBiZXR0ZXIuXG4gICAqIEBwYXJhbSB7IS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9hbHNvQ29ubmVjdGluZyBTZXQgdGhpcyBmbGFnIGlmIHlvdSBhbHNvIGp1c3RcbiAgICogICAgZGlkIG9yIGFyZSBhYm91dCB0byBjb25uZWN0IHRvIHRoaXMgaG9zdC4gVGhpcyBpcyBmb3IgdGhlIGNhc2VcbiAgICogICAgd2hlcmUgcHJlY29ubmVjdCBpcyBpc3N1ZWQgaW1tZWRpYXRlIGJlZm9yZSBvciBhZnRlciBhY3R1YWwgY29ubmVjdFxuICAgKiAgICBhbmQgcHJlY29ubmVjdCBpcyB1c2VkIHRvIGZsYXR0ZW4gYSBkZWVwIEhUVFAgcmVxdWVzdCBjaGFpbi5cbiAgICogICAgRS5nLiB3aGVuIHlvdSBwcmVjb25uZWN0IHRvIGEgaG9zdCB0aGF0IGFuIGVtYmVkIHdpbGwgY29ubmVjdCB0b1xuICAgKiAgICB3aGVuIGl0IGlzIG1vcmUgZnVsbHkgcmVuZGVyZWQsIHlvdSBhbHJlYWR5IGtub3cgdGhhdCB0aGUgY29ubmVjdGlvblxuICAgKiAgICB3aWxsIGJlIHVzZWQgdmVyeSBzb29uLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdXJsXyhhbXBkb2MsIHVybCwgb3B0X2Fsc29Db25uZWN0aW5nKSB7XG4gICAgaWYgKCF0aGlzLmlzSW50ZXJlc3RpbmdVcmxfKHVybCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qge29yaWdpbn0gPSBwYXJzZVVybERlcHJlY2F0ZWQodXJsKTtcbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgIGNvbnN0IGxhc3RQcmVjb25uZWN0VGltZW91dCA9IHRoaXMub3JpZ2luc19bb3JpZ2luXTtcbiAgICBpZiAobGFzdFByZWNvbm5lY3RUaW1lb3V0ICYmIG5vdyA8IGxhc3RQcmVjb25uZWN0VGltZW91dCkge1xuICAgICAgaWYgKG9wdF9hbHNvQ29ubmVjdGluZykge1xuICAgICAgICB0aGlzLm9yaWdpbnNfW29yaWdpbl0gPSBub3cgKyBBQ1RJVkVfQ09OTkVDVElPTl9USU1FT1VUX01TO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBJZiB3ZSBhcmUgYWJvdXQgdG8gdXNlIHRoZSBjb25uZWN0aW9uLCBkb24ndCByZS1wcmVjb25uZWN0IGZvclxuICAgIC8vIDE4MCBzZWNvbmRzLlxuICAgIGNvbnN0IHRpbWVvdXQgPSBvcHRfYWxzb0Nvbm5lY3RpbmdcbiAgICAgID8gQUNUSVZFX0NPTk5FQ1RJT05fVElNRU9VVF9NU1xuICAgICAgOiBQUkVDT05ORUNUX1RJTUVPVVRfTVM7XG4gICAgdGhpcy5vcmlnaW5zX1tvcmlnaW5dID0gbm93ICsgdGltZW91dDtcbiAgICAvLyBJZiB3ZSBrbm93IHRoYXQgcHJlY29ubmVjdCBpcyBzdXBwb3J0ZWQsIHRoZXJlIGlzIG5vIG5lZWQgdG8gZG9cbiAgICAvLyBkZWRpY2F0ZWQgZG5zLXByZWZldGNoLlxuICAgIGxldCBkbnM7XG4gICAgaWYgKCF0aGlzLmZlYXR1cmVzXy5wcmVjb25uZWN0KSB7XG4gICAgICBkbnMgPSB0aGlzLmRvY3VtZW50Xy5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gICAgICBkbnMuc2V0QXR0cmlidXRlKCdyZWwnLCAnZG5zLXByZWZldGNoJyk7XG4gICAgICBkbnMuc2V0QXR0cmlidXRlKCdocmVmJywgb3JpZ2luKTtcbiAgICAgIHRoaXMuaGVhZF8uYXBwZW5kQ2hpbGQoZG5zKTtcbiAgICB9XG4gICAgY29uc3QgcHJlY29ubmVjdCA9IHRoaXMuZG9jdW1lbnRfLmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcbiAgICBwcmVjb25uZWN0LnNldEF0dHJpYnV0ZSgncmVsJywgJ3ByZWNvbm5lY3QnKTtcbiAgICBwcmVjb25uZWN0LnNldEF0dHJpYnV0ZSgnaHJlZicsIG9yaWdpbik7XG4gICAgcHJlY29ubmVjdC5zZXRBdHRyaWJ1dGUoJ3JlZmVycmVycG9saWN5JywgJ29yaWdpbicpO1xuICAgIHRoaXMuaGVhZF8uYXBwZW5kQ2hpbGQocHJlY29ubmVjdCk7XG5cbiAgICAvLyBSZW1vdmUgdGhlIHRhZ3MgZXZlbnR1YWxseSB0byBmcmVlIHVwIG1lbW9yeS5cbiAgICB0aGlzLnRpbWVyXy5kZWxheSgoKSA9PiB7XG4gICAgICBpZiAoZG5zICYmIGRucy5wYXJlbnROb2RlKSB7XG4gICAgICAgIGRucy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGRucyk7XG4gICAgICB9XG4gICAgICBpZiAocHJlY29ubmVjdC5wYXJlbnROb2RlKSB7XG4gICAgICAgIHByZWNvbm5lY3QucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChwcmVjb25uZWN0KTtcbiAgICAgIH1cbiAgICB9LCAxMDAwMCk7XG5cbiAgICB0aGlzLnByZWNvbm5lY3RQb2x5ZmlsbF8oYW1wZG9jLCBvcmlnaW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFza3MgdGhlIGJyb3dzZXIgdG8gcHJlbG9hZCBhIFVSTC4gQWx3YXlzIGFsc28gZG9lcyBhIHByZWNvbm5lY3RcbiAgICogYmVjYXVzZSBicm93c2VyIHN1cHBvcnQgZm9yIHRoYXQgaXMgYmV0dGVyLlxuICAgKlxuICAgKiBJdCBpcyBzYWZlIHRvIGNhbGwgdGhpcyBtZXRob2QgZHVyaW5nIHByZXJlbmRlciB3aXRoIGFueSB2YWx1ZSxcbiAgICogYmVjYXVzZSBubyBhY3Rpb24gd2lsbCBiZSBwZXJmb3JtZWQgdW50aWwgdGhlIGRvYyBpcyB2aXNpYmxlLlxuICAgKlxuICAgKiBJdCBpcyBzYWZlIHRvIGNhbGwgdGhpcyBtZXRob2Qgd2l0aCBub24tSFRUUChzKSBVUkxzIGFzIG90aGVyIFVSTHNcbiAgICogYXJlIHNraXBwZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7IS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X3ByZWxvYWRBc1xuICAgKi9cbiAgcHJlbG9hZChhbXBkb2MsIHVybCwgb3B0X3ByZWxvYWRBcykge1xuICAgIGlmICghdGhpcy5pc0ludGVyZXN0aW5nVXJsXyh1cmwpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLnVybHNfW3VybF0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy51cmxzX1t1cmxdID0gdHJ1ZTtcbiAgICB0aGlzLnVybChhbXBkb2MsIHVybCwgLyogb3B0X2Fsc29Db25uZWN0aW5nICovIHRydWUpO1xuICAgIGlmICghdGhpcy5mZWF0dXJlc18ucHJlbG9hZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAob3B0X3ByZWxvYWRBcyA9PSAnZG9jdW1lbnQnICYmIHRoaXMucGxhdGZvcm1fLmlzU2FmYXJpKCkpIHtcbiAgICAgIC8vIFByZWxvYWRpbmcgZG9jdW1lbnRzIGN1cnJlbnRseSBkb2VzIG5vdCB3b3JrIGluIFNhZmFyaSxcbiAgICAgIC8vIGJlY2F1c2UgaXRcbiAgICAgIC8vIC0gZG9lcyBub3Qgc3VwcG9ydCBwcmVsb2FkaW5nIGlmcmFtZXNcbiAgICAgIC8vIC0gYW5kIHVzZXMgYSBkaWZmZXJlbnQgY2FjaGUgZm9yIGlmcmFtZXMgKHdoZW4gbG9hZGVkIHdpdGhvdXRcbiAgICAgIC8vICAgYXMgYXR0cmlidXRlKS5cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYW1wZG9jLndoZW5GaXJzdFZpc2libGUoKS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMucGVyZm9ybVByZWxvYWRfKHVybCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgYSBwcmVsb2FkIHVzaW5nIGA8bGluayByZWw9XCJwcmVsb2FkXCI+YC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcGVyZm9ybVByZWxvYWRfKHVybCkge1xuICAgIGNvbnN0IHByZWxvYWQgPSBodG1sRm9yKHRoaXMuZG9jdW1lbnRfKWBcbiAgICAgICAgPGxpbmsgcmVsPVwicHJlbG9hZFwiIHJlZmVycmVycG9saWN5PVwib3JpZ2luXCIgLz5gO1xuICAgIHByZWxvYWQuc2V0QXR0cmlidXRlKCdocmVmJywgdXJsKTtcbiAgICAvLyBEbyBub3Qgc2V0ICdhcycgYXR0cmlidXRlIHRvIGNvcnJlY3QgdmFsdWUgZm9yIG5vdywgZm9yIDIgcmVhc29uc1xuICAgIC8vIC0gZG9jdW1lbnQgdmFsdWUgaXMgbm90IHlldCBzdXBwb3J0ZWQgYW5kIGRyb3BwZWRcbiAgICAvLyAtIHNjcmlwdCBpcyBibG9ja2VkIGR1ZSB0byBDU1AuXG4gICAgLy8gRHVlIHRvIHNwZWMgY2hhbmdlIHdlIG5vdyBoYXZlIHRvIGFsc28gcHJlbG9hZCB3aXRoIHRoZSBcImFzXCJcbiAgICAvLyBiZWluZyBzZXQgdG8gYGZldGNoYCB3aGVuIGl0IHdvdWxkIHByZXZpb3VzbHkgd291bGQgYmUgZW1wdHkuXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS93M2MvcHJlbG9hZC9pc3N1ZXMvODBcbiAgICAvLyBmb3IgZGV0YWlscy5cbiAgICBpZiAodGhpcy5mZWF0dXJlc18ub25seVZhbGlkQXMpIHtcbiAgICAgIHByZWxvYWQuYXMgPSAnZmV0Y2gnO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmVsb2FkLmFzID0gJyc7XG4gICAgfVxuICAgIHRoaXMuaGVhZF8uYXBwZW5kQ2hpbGQocHJlbG9hZCk7XG4gICAgLy8gQXMgb3Bwb3NlZCB0byBwcmVjb25uZWN0IHdlIGRvIG5vdCBjbGVhbiB0aGlzIHRhZyB1cCwgYmVjYXVzZSB0aGVyZSBpc1xuICAgIC8vIG5vIGV4cGVjdGF0aW9uIGFzIHRvIGl0IGhhdmluZyBhbiBpbW1lZGlhdGUgZWZmZWN0LlxuICB9XG5cbiAgLyoqXG4gICAqIFNraXBzIG92ZXIgbm9uIEhUVFAvSFRUUFMgVVJMLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc0ludGVyZXN0aW5nVXJsXyh1cmwpIHtcbiAgICBpZiAodXJsLnN0YXJ0c1dpdGgoJ2h0dHBzOicpIHx8IHVybC5zdGFydHNXaXRoKCdodHRwOicpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhZmFyaSBkb2VzIG5vdCBzdXBwb3J0IHByZWNvbm5lY3RpbmcsIGJ1dCBkdWUgdG8gaXRzIHNpZ25pZmljYW50XG4gICAqIHBlcmZvcm1hbmNlIGJlbmVmaXRzIHdlIGltcGxlbWVudCB0aGlzIGNydWRlIHBvbHlmaWxsLlxuICAgKlxuICAgKiBXZSBtYWtlIGFuIGltYWdlIGNvbm5lY3Rpb24gdG8gYSBcIndlbGwta25vd25cIiBmaWxlIG9uIHRoZSBvcmlnaW4gYWRkaW5nXG4gICAqIGEgcmFuZG9tIHF1ZXJ5IHN0cmluZyB0byBidXN0IHRoZSBjYWNoZSAobm8gY2FjaGluZyBiZWNhdXNlIHdlIGRvIHdhbnQgdG9cbiAgICogYWN0dWFsbHkgb3BlbiB0aGUgY29ubmVjdGlvbikuXG4gICAqXG4gICAqIFRoaXMgc2hvdWxkIGdldCB1cyBhbiBvcGVuIFNTTCBjb25uZWN0aW9uIHRvIHRoZXNlIGhvc3RzIGFuZCBzaWduaWZpY2FudGx5XG4gICAqIHNwZWVkIHVwIHRoZSBuZXh0IGNvbm5lY3Rpb25zLlxuICAgKlxuICAgKiBUaGUgYWN0dWFsIFVSTCBpcyBleHBlY3RlZCB0byA0MDQuIElmIHlvdSBzZWUgZXJyb3JzIGZvclxuICAgKiBhbXBfcHJlY29ubmVjdF9wb2x5ZmlsbCBpbiB5b3VyIERldlRvb2xzIGNvbnNvbGUgb3Igc2VydmVyIGxvZzpcbiAgICogVGhpcyBpcyBleHBlY3RlZCBhbmQgZmluZSB0byBsZWF2ZSBhcyBpcy4gSXRzIGZpbmUgdG8gc2VuZCBhIG5vbiA0MDRcbiAgICogcmVzcG9uc2UsIGJ1dCBwbGVhc2UgbWFrZSBpdCBzbWFsbCA6KVxuICAgKlxuICAgKiBAcGFyYW0geyEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJlY29ubmVjdFBvbHlmaWxsXyhhbXBkb2MsIG9yaWdpbikge1xuICAgIC8vIFVuZm9ydHVuYXRlbHkgdGhlcmUgaXMgbm8gcmVsaWFibGUgd2F5IHRvIGZlYXR1cmUgZGV0ZWN0IHdoZXRoZXJcbiAgICAvLyBwcmVjb25uZWN0IGlzIHN1cHBvcnRlZCwgc28gd2UgZG8gdGhpcyBvbmx5IGluIFNhZmFyaSwgd2hpY2ggaXNcbiAgICAvLyB0aGUgbW9zdCBpbXBvcnRhbnQgYnJvd3NlciB3aXRob3V0IHN1cHBvcnQgZm9yIGl0LlxuICAgIGlmIChcbiAgICAgIHRoaXMuZmVhdHVyZXNfLnByZWNvbm5lY3QgfHxcbiAgICAgICEodGhpcy5wbGF0Zm9ybV8uaXNTYWZhcmkoKSB8fCB0aGlzLnBsYXRmb3JtXy5pc0lvcygpKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIERvbid0IGF0dGVtcHQgdG8gcHJlY29ubmVjdCBmb3IgQUNUSVZFX0NPTk5FQ1RJT05fVElNRU9VVF9NUyBzaW5jZVxuICAgIC8vIHdlIGVmZmVjdGl2ZWx5IGNyZWF0ZSBhbiBhY3RpdmUgY29ubmVjdGlvbi5cbiAgICAvLyBUT0RPKEBjcmFtZm9yY2UpOiBDb25maXJtIGFjdHVhbCBodHRwMiB0aW1lb3V0IGluIFNhZmFyaS5cbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMub3JpZ2luc19bb3JpZ2luXSA9IG5vdyArIEFDVElWRV9DT05ORUNUSU9OX1RJTUVPVVRfTVM7XG4gICAgLy8gTWFrZSB0aGUgVVJMIGNoYW5nZSB3aGVuZXZlciB3ZSB3YW50IHRvIG1ha2UgYSBuZXcgcmVxdWVzdCxcbiAgICAvLyBidXQgbWFrZSBpdCBzdGF5IHN0YWJsZSBpbiBiZXR3ZWVuLiBXaGlsZSBhIGdpdmVuIHBhZ2VcbiAgICAvLyB3b3VsZCBub3QgYWN0dWFsbHkgbWFrZSBhIG5ldyByZXF1ZXN0LCBhbm90aGVyIHBhZ2UgbWlnaHRcbiAgICAvLyBhbmQgd2l0aCB0aGlzIGl0IGhhcyB0aGUgc2FtZSBVUkwuIElmIChhbmQgdGhhdCBpcyBhIGJpZyBpZilcbiAgICAvLyB0aGUgc2VydmVyIHJlc3BvbmRzIHdpdGggYSBjYWNoZWFibGUgcmVzcG9uc2UsIHRoaXMgcmVkdWNlc1xuICAgIC8vIHJlcXVlc3RzIHdlIG1ha2UuIE1vcmUgaW1wb3J0YW50bHksIHRob3VnaCwgaXQgcmVkdWNlcyBVUkxcbiAgICAvLyBlbnRyb3B5IGFzIHNlZW4gYnkgc2VydmVycyBhbmQgdGh1cyBhbGxvd3MgcmV2ZXJzZSBwcm94aWVzXG4gICAgLy8gKHJlYWQgQ0ROcykgdG8gcmVzcG9uZCBtb3JlIGVmZmljaWVudGx5LlxuICAgIGNvbnN0IGNhY2hlQnVzdCA9IG5vdyAtIChub3cgJSBBQ1RJVkVfQ09OTkVDVElPTl9USU1FT1VUX01TKTtcbiAgICBjb25zdCB1cmwgPVxuICAgICAgb3JpZ2luICtcbiAgICAgICcvcm9ib3RzLnR4dD9fQU1QX3NhZmFyaV9wcmVjb25uZWN0X3BvbHlmaWxsX2NhY2hlYnVzdD0nICtcbiAgICAgIGNhY2hlQnVzdDtcbiAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub3BlbignSEVBRCcsIHVybCwgdHJ1ZSk7XG4gICAgLy8gV2Ugb25seSBzdXBwb3J0IGNyZWRlbnRpYWxlZCBwcmVjb25uZWN0IGZvciBub3cuXG4gICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG5cbiAgICB4aHIuc2VuZCgpO1xuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIHshV2luZG93fSB3aW5kb3dcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxQcmVjb25uZWN0U2VydmljZSh3aW5kb3cpIHtcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlcih3aW5kb3csICdwcmVjb25uZWN0JywgUHJlY29ubmVjdFNlcnZpY2UpO1xufVxuXG4vKipcbiAqIFByZWNvbm5lY3RzIHRvIHRoZSBzb3VyY2UgVVJMIGFuZCBjYW5vbmljYWwgZG9tYWlucyB0byBtYWtlIHN1cmVcbiAqIG91dGJvdW5kIG5hdmlnYXRpb25zIGFyZSBxdWljay4gV2FpdHMgZm9yIG9ubG9hZCB0byBhdm9pZCBibG9ja2luZ1xuICogbW9yZSBoaWdoIHByaW9yaXR5IGxvYWRzLlxuICogQHBhcmFtIHshRG9jdW1lbnR9IGRvY3VtZW50XG4gKiBAcmV0dXJuIHtQcm9taXNlfSBXaGVuIHdvcmsgaXMgZG9uZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByZWNvbm5lY3RUb09yaWdpbihkb2N1bWVudCkge1xuICByZXR1cm4gd2hlbkRvY3VtZW50Q29tcGxldGUoZG9jdW1lbnQpLnRoZW4oKCkgPT4ge1xuICAgIGNvbnN0IHdpbiA9IGRvY3VtZW50LmRlZmF1bHRWaWV3O1xuICAgIGlmICh3aW4pIHtcbiAgICAgIGNvbnN0IHByZWNvbm5lY3QgPSBTZXJ2aWNlcy5wcmVjb25uZWN0Rm9yKHdpbik7XG4gICAgICBjb25zdCBpbmZvID0gU2VydmljZXMuZG9jdW1lbnRJbmZvRm9yRG9jKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCk7XG4gICAgICBjb25zdCBhbXBkb2MgPSBTZXJ2aWNlcy5hbXBkb2MoZG9jdW1lbnQpO1xuICAgICAgcHJlY29ubmVjdC51cmwoYW1wZG9jLCBpbmZvLnNvdXJjZVVybCk7XG4gICAgICBwcmVjb25uZWN0LnVybChhbXBkb2MsIGluZm8uY2Fub25pY2FsVXJsKTtcbiAgICB9XG4gIH0pO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/preconnect.js