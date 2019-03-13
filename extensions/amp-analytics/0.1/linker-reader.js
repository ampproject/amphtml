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

import {getService, registerServiceBuilder} from '../../../src/service';
import {hasOwn} from '../../../src/utils/object';
import {parseLinker} from './linker';
import {
  parseQueryString,
  parseUrlDeprecated,
  removeParamsFromSearch,
} from '../../../src/url';

import {user} from '../../../src/log';

const TAG = 'amp-analytics/linker-reader';


class LinkerReader {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Object<string, ?Object<string, string>>} */
    this.linkerParams_ = {};
  }

  /**
   * Get the LINKER_PARAM(name, id) value from url and clean the value
   * @param {string} name
   * @param {string} id
   * @return {?string}
   */
  get(name, id) {
    if (!name || !id) {
      user().error(TAG, 'LINKER_PARAM requires two params, name and id');
      return null;
    }

    if (!hasOwn(this.linkerParams_, name)) {
      this.linkerParams_[name] = this.parseAndCleanQueryString_(name);
    }

    if (this.linkerParams_[name] && this.linkerParams_[name][id]) {
      return this.linkerParams_[name][id];
    }

    return null;
  }

  /**
   * Parse the url get the key value pair for the linker name
   * and remove the LINKER_PARAM from window location
   * @param {string} name
   * @return {?Object<string, string>}
   */
  parseAndCleanQueryString_(name) {
    const parsedUrl = parseUrlDeprecated(this.win_.location.href);
    const params = parseQueryString(parsedUrl.search);
    if (!hasOwn(params, name)) {
      // Linker param not found.
      return null;
    }
    const value = params[name];

    this.removeLinkerParam_(parsedUrl, name);
    return parseLinker(value);
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
    const newHref = url.origin + url.pathname +
        removedLinkerParamSearchUrl + (url.hash || '');
    this.win_.history.replaceState(null, '', newHref);
  }
}

/**
 * @param {!Window} win
 */
export function installLinkerReaderService(win) {
  registerServiceBuilder(win, 'amp-analytics-linker-reader',
      LinkerReader);
}

/**
 * @param {!Window} win
 * @return {!LinkerReader}
 */
export function linkerReaderServiceFor(win) {
  return getService(win, 'amp-analytics-linker-reader');
}
