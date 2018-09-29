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

import {getKeyValuePairs} from './linker';
import {user} from '../../../src/log';
import {removeParamsFromSearch} from '../../../src/url';
import {getService, registerServiceBuilder} from '../../../src/service';
import {hasOwn} from '../../../src/utils/object';
import {parseUrlDeprecated, parseQueryString} from '../../../src/url';


class LinkerReader {

  constructor(window) {
    this.win_ = window;

    this.linkerParams_ = {};

  }

  /**
   * Get the LINKER_PARAM(name, id) value from url and clean the value
   * @param {string} name
   * @param {string} id
   * @return {?string}
   */
  get(name, id) {
    if (!hasOwn(this.linkerParams_, name)) {
      this.linkerParams_[name] = this.parseAndCleanQueryString_(name);
    }

    if (this.linkerParams_[name] && this.linkerParams_[name][id]) {
      // Return the id value and remove the id from the object
      const value = this.linkerParams_[name][id];
      console.log('value is ', value);
      delete this.linkerParams_[name][id];
      return value;
    }

    return null;
  }

  parseAndCleanQueryString_(name) {
    const parsedUrl = parseUrlDeprecated(this.win_.location.href);
    const params = parseQueryString(parsedUrl.search);
    console.log('params are', params, name);
    if (!hasOwn(params, name)) {
      // Linker param not found.
      return null;
    }
    const value = params[name];
    console.log('value is ', value);

    this.removeLinkerParam_(parsedUrl, name);
    return getKeyValuePairs(value);
  }


  /**
   * Remove the linker param from the current url
   * @param {!Location} url
   * @param {string} name
   */
  removeLinkerParam_(url, name) {
    if (!this.win_.history.replaceState) {
      // Can't replace state. Ignore
      return;
    }
    const searchUrl = url.search;
    const removedLinkerParamSearchUrl = removeParamsFromSearch(searchUrl, name);
    console.log(url.origin, url.pathname, removedLinkerParamSearchUrl, url.hash);
    const newHref =
        url.origin + url.pathname + removedLinkerParamSearchUrl + url.hash || '';
    this.win_.history.replaceState(null, '', newHref);
  }
}


export function installLinkerReaderService(win) {
  registerServiceBuilder(win, 'amp-analyitcs-linker-reader',
      LinkerReader);
}

export function linkerReaderServiceFor(win) {
  return getService(win, 'amp-analyitcs-linker-reader');
}
