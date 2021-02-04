/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {hasOwn} from '../../../src/utils/object';
import {parseLinker} from './linker';
import {parseQueryString} from '../../../src/url';
import {user} from '../../../src/log';

const TAG = 'amp-consent/linker-reader';

export class ConsentLinkerReader {
  /**
   * Creates an instance of ConsentLinkerReader.
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
      this.linkerParams_[name] = this.maybeParseQueryString_(name);
    }

    if (this.linkerParams_[name] && this.linkerParams_[name][id]) {
      return this.linkerParams_[name][id];
    }

    return null;
  }

  /**
   * Maybe parse the url if the key is found. Return the value
   * if found, null otherwise. Do no remove LINKER_PARAM from
   * window location.
   * @param {string} name
   * @return {?Object<string, string>}
   */
  maybeParseQueryString_(name) {
    const params = parseQueryString(this.win_.location.search);
    if (!hasOwn(params, name)) {
      // Linker param not found.
      return null;
    }
    const value = params[name];
    return parseLinker(value);
  }
}
