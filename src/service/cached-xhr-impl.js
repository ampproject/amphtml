/**
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

import {Cache} from '../utils/cache';
import {Xhr} from './xhr-impl';
import {getService, registerServiceBuilder} from '../service';
import {removeFragment} from '../url';


/**
 * A wrapper around the Xhr service which caches the result of GET requests
 *
 * @package Visible for type.
 * @visibleForTesting
 */
export class CachedXhr extends Xhr {

  /**
   * @param {!Window} win
   * @param {number=} cacheSize
   */
  constructor(win, cacheSize) {
    super(win);

    /** @const {!Cache} */
    this.cache_ = new Cache(cacheSize);
  }

  /**
   * Attempt to cache the result of a fetch.
   * @param {string} key The cache key
   * @param {!./xhr-impl.FetchInitDef} init Fetch options object
   * @param {!Promise<!JSONType>|!Promise<string>|!Promise<!Document>} fetch
   * @return {!Promise<!JSONType>|!Promise<string>|!Promise<!Document>}
   */
  cacheFetch_(key, init, fetch) {
    const isCacheable = (init.method === 'GET');
    if (isCacheable) {
      this.cache_.put(key, fetch);
    }
    return fetch;
  }

  /**
   * Attempt to retrieve a cached fetch.
   * @param {string} key The cache key
   * @return {?Promise<!JSONType>|?Promise<string>|?Promise<!Document>}
   */
  getCachedFetch_(key) {
    return this.cache_.get(key);
  }

  /**
   * Fetches and caches a JSON request.
   * @param {string} input URL
   * @param {!./xhr-impl.FetchInitDef} init
   * @return {!Promise<!JSONType>}
   * @override
   */
  fetchJson_(input, init) {
    const key = this.getCacheKey_(input, init);
    return this.getCachedFetch_(key) ||
        this.cacheFetch_(key, init, super.fetchJson_(input, init));
  }

  /**
   * Fetches and caches a text request.
   * @param {string} input
   * @param {!./xhr-impl.FetchInitDef} init
   * @return {!Promise<string>}
   * @override
   */
  fetchText_(input, init) {
    const key = this.getCacheKey_(input, init);
    return this.getCachedFetch_(key) ||
        this.cacheFetch_(key, init, super.fetchText_(input, init));
  }

  /**
   * Fetches and caches a document request.
   * @param {string} input
   * @param {!./xhr-impl.FetchInitDef} init
   * @return {!Promise<!Document>}
   * @override
   */
  fetchDocument_(input, init) {
    const key = this.getCacheKey_(input, init);
    return this.getCachedFetch_(key) ||
        this.cacheFetch_(key, init, super.fetchDocument_(input, init));
  }

  /**
   * Creates a cache key for a fetch.
   *
   * @param {string} input
   * @return {string}
   * @private
   */
  getCacheKey_(input, init) {
    const accept = init.headers['Accept'] || '';
    return removeFragment(input) + accept;
  }
}

/**
 * @param {!Window} window
 * @return {!CachedXhr}
 */
export function cachedXhrServiceForTesting(window) {
  installCachedXhrService(window);
  return getService(window, 'xhr');
}

/**
 * @param {!Window} window
 */
export function installCachedXhrService(window) {
  registerServiceBuilder(window, 'xhr', CachedXhr);
};
