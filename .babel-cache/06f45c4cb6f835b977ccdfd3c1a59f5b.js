var _template = ["<link rel=preload referrerpolicy=origin>"];function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
      onlyValidAs: linkTag.as != 'invalid-value' };

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
  function PreconnectService(win) {_classCallCheck(this, PreconnectService);
    /** @private @const {!Document} */
    this.document_ = win.document;

    /** @private @const {!Element} */
    this.head_ = /** @type {!Element} */(win.document.head);
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
   */_createClass(PreconnectService, [{ key: "url", value:
    function url(ampdoc, _url, opt_alsoConnecting) {var _this = this;
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
     */ }, { key: "url_", value:
    function url_(ampdoc, url, opt_alsoConnecting) {
      if (!this.isInterestingUrl_(url)) {
        return;
      }
      var _parseUrlDeprecated = parseUrlDeprecated(url),origin = _parseUrlDeprecated.origin;
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
      var timeout = opt_alsoConnecting ?
      ACTIVE_CONNECTION_TIMEOUT_MS :
      PRECONNECT_TIMEOUT_MS;
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
     */ }, { key: "preload", value:
    function preload(ampdoc, url, opt_preloadAs) {var _this2 = this;
      if (!this.isInterestingUrl_(url)) {
        return;
      }
      if (this.urls_[url]) {
        return;
      }
      this.urls_[url] = true;
      this.url(ampdoc, url, /* opt_alsoConnecting */true);
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
     */ }, { key: "performPreload_", value:
    function performPreload_(url) {
      var preload = htmlFor(this.document_)(_template);

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
     */ }, { key: "isInterestingUrl_", value:
    function isInterestingUrl_(url) {
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
     */ }, { key: "preconnectPolyfill_", value:
    function preconnectPolyfill_(ampdoc, origin) {
      // Unfortunately there is no reliable way to feature detect whether
      // preconnect is supported, so we do this only in Safari, which is
      // the most important browser without support for it.
      if (
      this.features_.preconnect ||
      !(this.platform_.isSafari() || this.platform_.isIos()))
      {
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
      var cacheBust = now - (now % ACTIVE_CONNECTION_TIMEOUT_MS);
      var url =
      origin +
      '/robots.txt?_AMP_safari_preconnect_polyfill_cachebust=' +
      cacheBust;
      var xhr = new XMLHttpRequest();
      xhr.open('HEAD', url, true);
      // We only support credentialed preconnect for now.
      xhr.withCredentials = true;

      xhr.send();
    } }]);return PreconnectService;}();


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
// /Users/mszylkowski/src/amphtml/src/preconnect.js