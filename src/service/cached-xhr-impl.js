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

import {dev} from '../log';
import {fromClass} from '../service';
import {
  parseUrl,
  removeFragment,
} from '../url';
import {getPath, hasOwn} from '../utils/object';
import {isArray, isObject, isFormData} from '../types';
import {Cache} from '../utils/cache';
import {
  FetchInitDef,
  Xhr,
} from './xhr-impl';


/**
 * A service that polyfills Fetch API for use within AMP.
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
    this.fragmentCache_ = new Cache(cacheSize);
  }

  /**
   * Fetches and constructs JSON object based on the fetch polyfill.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
   *
   * See `fetchAmpCors_` for more detail.
   *
   * @param {string} input
   * @param {?FetchInitDef=} opt_init
   * @return {!Promise<!JSONType>}
   * @override
   */
  fetchJson(input, opt_init) {
    const init = this.setupInit_(opt_init, 'application/json');
    const parsedInput = parseUrl(input);
    const propertyPath = parsedInput.hash.slice(1); // remove # prefix
    const getResponseJson = response => response.json();

    if (init.method === 'POST' && !isFormData(init.body)) {
      // Assume JSON strict mode where only objects or arrays are allowed
      // as body.
      dev().assert(
        this.allowedJsonBodyTypes_.some(test => test(init.body)),
        'body must be of type object or array. %s',
        init.body
      );

      init.headers['Content-Type'] = 'application/json;charset=utf-8';
      init.body = JSON.stringify(init.body);
    }

    const isCacheable = (init.method === 'GET');
    if (isCacheable) {
      const getPropertyAtPath = getPath.bind(null, propertyPath);
      const cacheKey = this.getCacheKey_(input, opt_init);
      const cachedPromise = this.fragmentCache_.get(cacheKey);
      if (cachedPromise) {
        return cachedPromise.then(getPropertyAtPath);
      }

      const fetchPromise = this.fetch(input, init).then(getResponseJson);

      // Since a fragment is present, cache the full response promise, then
      // return a promise with just the value specified by the fragment.
      this.fragmentCache_.put(cacheKey, fetchPromise);
      return fetchPromise.then(getPropertyAtPath);
    } else {
      return this.fetch(input, init).then(getResponseJson);
    }
  }

  /**
   * Creates a cache key for a fetch.
   *
   * @param {string} url
   * @param {?FetchInitDef=} opt_init
   * @return {string}
   * @private
   */
  getCacheKey_(url, opt_init) {
    const serializedOptions = opt_init ? simpleSerialize(opt_init) : '';
    return removeFragment(url) + ';' + serializedOptions;
  }
}

/**
 * Deterministically traverse and serialize an object, array, or primitive.
 * @param {?} obj
 * @return {string}
 */
function simpleSerialize(obj) {
  if (isObject(obj) && !isArray(obj)) {
    const keys = Object.keys(obj).sort();
    const result = [];
    for (let i = 0; i < keys.length; i++) {
      if (hasOwn(obj, keys[i])) {
        result.push(`{${keys[i]}:${simpleSerialize(obj[keys[i]])}}`);
      }
    }
    return result.join(',');
  } else if (isArray(obj)) {
    return `[${obj.map(simpleSerialize).join(',')}]`;
  } else {
    return obj;
  }
}

/**
 * @param {!Window} window
 * @return {!Xhr}
 */
export function installCachedXhrService(window) {
  return fromClass(window, 'cached-xhr', CachedXhr);
};
