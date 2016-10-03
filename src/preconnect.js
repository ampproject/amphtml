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


import {fromClass} from './service';
import {parseUrl} from './url';
import {timerFor} from './timer';
import {platformFor} from './platform';
import {viewerForDoc} from './viewer';
import {dev} from './log';

const ACTIVE_CONNECTION_TIMEOUT_MS = 180 * 1000;
const PRECONNECT_TIMEOUT_MS = 10 * 1000;


/**
 * @typedef {{
 *   preload: (boolean|undefined),
 *   preconnect: (boolean|undefined)
 * }}
 */
let PreconnectFeaturesDef;

/** @private {?PreconnectFeaturesDef} */
let preconnectFeatures = null;

/**
 * Detect related features if feature detection is supported by the
 * browser. Even if this fails, the browser may support the feature.
 * @param {!Window} win
 * @return {!PreconnectFeaturesDef}
 */
function getPreconnectFeatures(win) {
  if (!preconnectFeatures) {
    const tokenList = win.document.createElement('link')['relList'];
    if (!tokenList || !tokenList.supports) {
      return {};
    }
    preconnectFeatures = {
      preconnect: tokenList.supports('preconnect'),
      preload: tokenList.supports('preload'),
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


class PreconnectService {

  /**
   * @param {!Window} win
   */
  constructor(win) {
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
    this.platform_ = platformFor(win);
    // Mark current origin as preconnected.
    this.origins_[parseUrl(win.location.href).origin] = true;

    /**
     * Detect support for the given resource hints.
     * Unfortunately not all browsers support this, so this can only
     * be used as an affirmative signal.
     * @private @const {!PreconnectFeaturesDef}
     */
    this.features_ = getPreconnectFeatures(win);

    /** @private @const {!./service/timer-impl.Timer} */
    this.timer_ = timerFor(win);
  }

  /**
   * Preconnects to a URL. Always also does a dns-prefetch because
   * browser support for that is better.
   * @param {!./service/viewer-impl.Viewer} viewer
   * @param {string} url
   * @param {boolean=} opt_alsoConnecting Set this flag if you also just
   *    did or are about to connect to this host. This is for the case
   *    where preconnect is issued immediate before or after actual connect
   *    and preconnect is used to flatten a deep HTTP request chain.
   *    E.g. when you preconnect to a host that an embed will connect to
   *    when it is more fully rendered, you already know that the connection
   *    will be used very soon.
   */
  url(viewer, url, opt_alsoConnecting) {
    if (!this.isInterestingUrl_(url)) {
      return;
    }
    const origin = parseUrl(url).origin;
    const now = Date.now();
    const lastPreconnectTimeout = this.origins_[origin];
    if (lastPreconnectTimeout && now < lastPreconnectTimeout) {
      if (opt_alsoConnecting) {
        this.origins_[origin] = now + ACTIVE_CONNECTION_TIMEOUT_MS ;
      }
      return;
    }
    // If we are about to use the connection, don't re-preconnect for
    // 180 seconds.
    const timeout = opt_alsoConnecting
        ? ACTIVE_CONNECTION_TIMEOUT_MS
        : PRECONNECT_TIMEOUT_MS;
    this.origins_[origin] = now + timeout;
    // If we know that preconnect is supported, there is no need to do
    // dedicated dns-prefetch.
    let dns;
    if (!this.features_.preconnect) {
      dns = this.document_.createElement('link');
      dns.setAttribute('rel', 'dns-prefetch');
      dns.setAttribute('href', origin);
      this.head_.appendChild(dns);
    }
    const preconnect = this.document_.createElement('link');
    preconnect.setAttribute('rel', 'preconnect');
    preconnect.setAttribute('href', origin);
    preconnect.setAttribute('referrerpolicy', 'origin');
    this.head_.appendChild(preconnect);

    // Remove the tags eventually to free up memory.
    this.timer_.delay(() => {
      if (dns && dns.parentNode) {
        dns.parentNode.removeChild(dns);
      }
      if (preconnect.parentNode) {
        preconnect.parentNode.removeChild(preconnect);
      }
    }, 10000);

    this.preconnectPolyfill_(viewer, origin);
  }

  /**
   * Asks the browser to preload a URL. Always also does a preconnect
   * because browser support for that is better.
   *
   * @param {!./service/viewer-impl.Viewer} viewer
   * @param {string} url
   * @param {string=} opt_preloadAs
   */
  preload(viewer, url, opt_preloadAs) {
    if (!this.isInterestingUrl_(url)) {
      return;
    }
    if (this.urls_[url]) {
      return;
    }
    const command = this.features_.preload ? 'preload' : 'prefetch';
    this.urls_[url] = true;
    this.url(viewer, url, /* opt_alsoConnecting */ true);
    viewer.whenFirstVisible().then(() => {
      const preload = this.document_.createElement('link');
      preload.setAttribute('rel', command);
      preload.setAttribute('href', url);
      preload.setAttribute('referrerpolicy', 'origin');
      // Do not set 'as' attribute for now, for 2 reasons
      // - document value is not yet supported and dropped
      // - script is blocked due to CSP.
      // if (opt_preloadAs) {
      //  preload.setAttribute('as', opt_preloadAs);
      // }
      this.head_.appendChild(preload);
      // As opposed to preconnect we do not clean this tag up, because there is
      // no expectation as to it having an immediate effect.
    });
  }

  /**
   * Skips over non HTTP/HTTPS URL.
   * @param {string} url
   * @return {boolean}
   */
  isInterestingUrl_(url) {
    if (url.indexOf('https:') == 0 || url.indexOf('http:') == 0) {
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
   * @param {!./service/viewer-impl.Viewer} viewer
   * @param {string} origin
   * @private
   */
  preconnectPolyfill_(viewer, origin) {
    // Unfortunately there is no reliable way to feature detect whether
    // preconnect is supported, so we do this only in Safari, which is
    // the most important browser without support for it.
    if (this.features_.preconnect || !this.platform_.isSafari()) {
      return;
    }

    viewer.whenFirstVisible().then(() => {
      // Don't attempt to preconnect for ACTIVE_CONNECTION_TIMEOUT_MS since
      // we effectively create an active connection.
      // TODO(@cramforce): Confirm actual http2 timeout in Safari.
      this.origins_[origin] = Date.now() + ACTIVE_CONNECTION_TIMEOUT_MS;
      const url = origin +
          '/amp_preconnect_polyfill_404_or_other_error_expected.' +
          '_Do_not_worry_about_it?' + Math.random();
      // We use an XHR without withCredentials(true), so we do not send cookies
      // to the host and the host cannot set cookies.
      const xhr = new XMLHttpRequest();
      xhr.open('HEAD', url, true);

      xhr.send();
    });
  }
}


export class Preconnect {
  /**
   * @param {!PreconnectService} preconnectService
   * @param {!Element} element
   */
  constructor(preconnectService, element) {
    /** @const @private {!PreconnectService} */
    this.preconnectService_ = preconnectService;

    /** @const @private {!Element} */
    this.element_ = element;

    /** @private {?./service/viewer-impl.Viewer} */
    this.viewer_ = null;
  }

  /**
   * @return {!./service/viewer-impl.Viewer}
   * @private
   */
  getViewer_() {
    if (!this.viewer_) {
      this.viewer_ = viewerForDoc(this.element_);
    }
    return this.viewer_;
  }

  /**
   * Preconnects to a URL. Always also does a dns-prefetch because
   * browser support for that is better.
   * @param {string} url
   * @param {boolean=} opt_alsoConnecting Set this flag if you also just
   *    did or are about to connect to this host. This is for the case
   *    where preconnect is issued immediate before or after actual connect
   *    and preconnect is used to flatten a deep HTTP request chain.
   *    E.g. when you preconnect to a host that an embed will connect to
   *    when it is more fully rendered, you already know that the connection
   *    will be used very soon.
   */
  url(url, opt_alsoConnecting) {
    this.preconnectService_.url(this.getViewer_(), url, opt_alsoConnecting);
  }

  /**
   * Asks the browser to preload a URL. Always also does a preconnect
   * because browser support for that is better.
   *
   * @param {string} url
   * @param {string=} opt_preloadAs
   */
  preload(url, opt_preloadAs) {
    this.preconnectService_.preload(this.getViewer_(), url, opt_preloadAs);
  }
}


/**
 * @param {!Window} window
 * @return {!PreconnectService}
 */
function preconnectFor(window) {
  return fromClass(window, 'preconnect', PreconnectService);
}


/**
 * @param {!Element} element
 * @return {!Preconnect}
 */
export function preconnectForElement(element) {
  const preconnectService = preconnectFor(element.ownerDocument.defaultView);
  return new Preconnect(preconnectService, element);
}
