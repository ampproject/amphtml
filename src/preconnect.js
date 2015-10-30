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


import {getService} from './service';
import {parseUrl} from './url';
import {timer} from './timer';
import {platformFor} from './platform';


class Preconnect {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Element} */
    this.head_ = win.document.head;
    /** @private @const {!Object<string, boolean>}  */
    this.origins_ = {};
    /** @private @const {!Object<string, boolean>}  */
    this.urls_ = {};
    /** @private @const {!Platform}  */
    this.platform_ = platformFor(win);
    // Mark current origin as preconnected.
    this.origins_[parseUrl(win.location.href).origin] = true;
  }

  /**
   * Preconnects to a URL. Always also does a dns-prefetch because
   * browser support for that is better.
   * @param {string} url
   */
  url(url) {
    if (!this.isInterestingUrl_(url)) {
      return;
    }
    const origin = parseUrl(url).origin;
    if (this.origins_[origin]) {
      return;
    }
    this.origins_[origin] = true;
    const dns = document.createElement('link');
    dns.setAttribute('rel', 'dns-prefetch');
    dns.setAttribute('href', origin);
    const preconnect = document.createElement('link');
    preconnect.setAttribute('rel', 'preconnect');
    preconnect.setAttribute('href', origin);
    this.head_.appendChild(dns);
    this.head_.appendChild(preconnect);

    // Remove the tags eventually to free up memory.
    timer.delay(() => {
      if (dns.parentNode) {
        dns.parentNode.removeChild(dns);
      }
      if (preconnect.parentNode) {
        preconnect.parentNode.removeChild(preconnect);
      }
    }, 10000);

    this.preconnectPolyfill_(origin);
  }

  /**
   * Asks the browser to prefetch a URL. Always also does a preconnect
   * because browser support for that is better.
   * @param {string} url
   */
  prefetch(url) {
    if (!this.isInterestingUrl_(url)) {
      return;
    }
    if (this.urls_[url]) {
      return;
    }
    this.urls_[url] = true;
    this.url(url);
    const prefetch = document.createElement('link');
    prefetch.setAttribute('rel', 'prefetch');
    prefetch.setAttribute('href', url);
    this.head_.appendChild(prefetch);
    // As opposed to preconnect we do not clean this tag up, because there is
    // no expectation as to it having an immediate effect.
  }

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
   */
  preconnectPolyfill_(origin) {
    // Unfortunately there is no way to feature detect whether preconnect is
    // supported, so we do this only in Safari, which is the most important
    // browser without support for it. This needs to be removed should it
    // ever add support.
    if (!this.platform_.isSafari()) {
      return;
    }
    const url = origin + '/amp_preconnect_polyfill?' + Math.random();
    // We use an XHR without withCredentials(true), so we do not send cookies
    // to the host and the host cannot set cookies.
    const xhr = new XMLHttpRequest();
    xhr.open('HEAD', url, true);
    xhr.send();
  }
}

/**
 * @param {!Window} window
 * @return {!Preconnect}
 */
export function preconnectFor(window) {
  return getService(window, 'preconnect', () => {
    return new Preconnect(window);
  });
};
