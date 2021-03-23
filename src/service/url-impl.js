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
  getSourceUrl,
  isProtocolValid,
  isProxyOrigin,
  isSecureUrlDeprecated,
  parseUrlWithA,
  resolveRelativeUrl,
} from '../url';
import {registerServiceBuilderForDoc} from '../service';
import {urls} from '../config';

const SERVICE = 'url';

/**
 */
export class Url {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    const root = ampdoc.getRootNode();
    const doc = root.ownerDocument || root;

    /** @private @const {!HTMLAnchorElement} */
    this.anchor_ = /** @type {!HTMLAnchorElement} */ (doc.createElement('a'));

    /** @private @const {?LruCache} */
    this.cache_ = IS_ESM ? null : new LruCache(100);
  }

  /**
   * Parses the URL in the context of the current document.
   *
   * @param {string} url
   * @param {boolean=} opt_nocache
   *   Cache is always ignored on ESM builds, see https://go.amp.dev/pr/31594
   * @return {!Location}
   */
  parse(url, opt_nocache) {
    return parseUrlWithA(
      this.anchor_,
      url,
      IS_ESM || opt_nocache ? null : this.cache_
    );
  }

  /**
   * @param {string|!Location} url
   * @return {!Location}
   * @private
   */
  parse_(url) {
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
    return getSourceOrigin(this.parse_(url));
  }

  /**
   * Returns the source URL of an AMP document for documents served
   * on a proxy origin or directly.
   * @param {string|!Location} url URL of an AMP document.
   * @return {string}
   */
  getSourceUrl(url) {
    return getSourceUrl(this.parse_(url));
  }

  /**
   * Returns absolute URL resolved based on the relative URL and the base.
   * @param {string} relativeUrlString
   * @param {string|!Location} baseUrl
   * @return {string}
   */
  resolveRelativeUrl(relativeUrlString, baseUrl) {
    return resolveRelativeUrl(relativeUrlString, this.parse_(baseUrl));
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
    return isProxyOrigin(this.parse_(url));
  }

  /**
   * Returns `true` if the URL is secure: either HTTPS or localhost (for
   * testing).
   * @param {string} url
   * @return {boolean}
   */
  isSecure(url) {
    return isSecureUrlDeprecated(this.parse_(url));
  }

  /**
   * Returns the correct origin for a given window.
   * @param {!Window} win
   * @return {string} origin
   */
  getWinOrigin(win) {
    return win.origin || this.parse_(win.location.href).origin;
  }

  /**
   * If the resource URL is referenced from the publisher's origin,
   * convert the URL to be referenced from the cache.
   * @param {string} resourceUrl The URL of the document to load
   * @return {string}
   */
  getCdnUrlOnOrigin(resourceUrl) {
    if (isProxyOrigin(resourceUrl)) {
      return resourceUrl;
    }

    const {host, hash, pathname, search} = this.parse_(resourceUrl);
    const encodedHost = encodeURIComponent(host);
    return `${urls.cdn}/c/${encodedHost}${pathname}${search}${hash}`;
  }
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installUrlForDoc(ampdoc) {
  registerServiceBuilderForDoc(
    ampdoc,
    SERVICE,
    Url,
    /* opt_instantiate */ true
  );
}
