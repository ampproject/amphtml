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

import {LruCache} from '../utils/lru-cache';
import {
  assertAbsoluteHttpOrHttpsUrl,
  assertHttpsUrl,
  getSourceOrigin,
  isProtocolValid,
  isProxyOrigin,
  isSecureUrlDeprecated,
  parseUrlWithA,
} from '../url';
import {
  installServiceInEmbedScope,
  registerServiceBuilderForDoc,
} from '../service';

const SERVICE = 'url';

/**
 * @implements {../service.EmbeddableService}
 */
export class Url {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {(!Document|!ShadowRoot)=} opt_rootNode
   */
  constructor(ampdoc, opt_rootNode) {
    const root = opt_rootNode || ampdoc.getRootNode();
    const doc = root.ownerDocument || root;

    /** @private @const {!HTMLAnchorElement} */
    this.anchor_ = /** @type {!HTMLAnchorElement} */(doc.createElement('a'));

    /** @private @const {!LruCache} */
    this.cache_ = new LruCache(100);
  }

  /** @override @nocollapse */
  static installInEmbedWindow(embedWin, ampdoc) {
    installServiceInEmbedScope(embedWin, SERVICE,
        new Url(ampdoc, embedWin.document));
  }

  /**
   * Parses the URL in the context of the current document.
   *
   * @param {string} url
   * @param {boolean=} opt_nocache
   * @return {!Location}
   */
  parse(url, opt_nocache) {
    return parseUrlWithA(this.anchor_, url, opt_nocache ? null : this.cache_);
  }

  /**
   * Returns whether the URL has valid protocol.
   * Deep link protocol is valid, but not javascript etc.
   * @param {string|!Location} url
   * @return {boolean}
   */
  isProtocolValid(url) {
    return isProtocolValid(url);
  }

  /**
   * Returns the source origin of an AMP document for documents served
   * on a proxy origin or directly.
   * @param {string|!Location} url URL of an AMP document.
   * @return {string} The source origin of the URL.
   */
  getSourceOrigin(url) {
    return getSourceOrigin(url);
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
  assertHttpsUrl(urlString, elementContext, sourceName = 'source') {
    return assertHttpsUrl(urlString, elementContext, sourceName);
  }

  /**
   * Asserts that a given url is an absolute HTTP or HTTPS URL.
   * @param {string} urlString
   * @return {string}
   */
  assertAbsoluteHttpOrHttpsUrl(urlString) {
    return assertAbsoluteHttpOrHttpsUrl(urlString);
  }

  /**
   * Returns whether the URL has the origin of a proxy.
   * @param {string|!Location} url URL of an AMP document.
   * @return {boolean}
   */
  isProxyOrigin(url) {
    return isProxyOrigin(url);
  }

  /**
   * Returns `true` if the URL is secure: either HTTPS or localhost (for
   * testing).
   * @param {string} url
   * @return {boolean}
   */
  isSecure(url) {
    return isSecureUrlDeprecated(this.parse(url));
  }

  /**
   * Returns the correct origin for a given window.
   * @param {!Window} win
   * @return {string} origin
   */
  getWinOrigin(win) {
    return win.origin || this.parse(win.location.href).origin;
  }

  /**
   * If the current location is on a CDN, then convert the given resource
   * URL to a path that resolves to the same resource served on the cache.
   * @param {!Location|string} currentLocation The URL of the window
   * @param {string} resourceUrl The URL of the document to load
   * @return {string}
   */
  getCdnUrlOnCdnOrigin(currentLocation, resourceUrl) {
    if (!isProxyOrigin(currentLocation)) {
      return resourceUrl;
    }

    const {host} = (typeof currentLocation == 'string' ?
      this.parse(currentLocation) :
      currentLocation);
    const {
      hash,
      pathname,
      search,
    } = this.parse(resourceUrl);

    return `https://${host}/c${pathname}${search}${hash}`;
  }
}


/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installUrlForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, SERVICE, Url,
      /* opt_instantiate */ true);
}
