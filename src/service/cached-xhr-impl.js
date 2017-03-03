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
   * Fetch and attempt to cache, or get an already cached fetch,
   * then clone and return the response.
   *
   * @param {string} input URL
   * @param {?./xhr-impl.FetchInitDef=} opt_init Fetch options object.
   * @return {!Promise<!./xhr-impl.FetchResponse>}
   * @override
   */
  fetch(input, opt_init) {
    const accept =
        (opt_init && opt_init.headers && opt_init.headers['Accept']) || '';
    const key = this.getCacheKey_(input, accept);
    return this.getCachedFetch_(key) ||
        this.cacheFetch_(key, super.fetch(input, opt_init), opt_init);
  }

  /**
   * Creates a cache key for a fetch.
   *
   * @param {string} input URL
   * @param {string} responseType
   * @return {string}
   * @private
   */
  getCacheKey_(input, responseType) {
    return removeFragment(input) + responseType;
  }

  /**
   * Attempt to retrieve a cached fetch.
   *
   * @param {string} key The cache key
   * @return {?Promise<!./xhr-impl.FetchResponse>}
   */
  getCachedFetch_(key) {
    const fetch = this.cache_.get(key);
    return fetch && fetch.then(response => response.clone());
  }

  /**
   * Attempt to cache the result of a fetch.
   *
   * @param {string} key The cache key
   * @param {!Promise<!./xhr-impl.FetchResponse>} fetch
   * @param {?./xhr-impl.FetchInitDef=} opt_init Fetch options object
   * @return {!Promise<!./xhr-impl.FetchResponse>}
   */
  cacheFetch_(key, fetch, opt_init) {
    // A fetch is cachable if it's implicitly or explicitly a GET
    const isCacheable =
        (!opt_init || !opt_init.method || opt_init.method === 'GET');
    if (isCacheable) {
      this.cache_.put(key, fetch);
      return fetch.then(response => response.clone());
    } else {
      return fetch;
    }
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
