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

import {Services} from '../../../src/services';
import {getValueForExpr} from '../../../src/json';

export class UrlBuilder {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!Promise<string>} readerIdPromise
   */
  constructor(ampdoc, readerIdPromise) {
    const headNode = ampdoc.getHeadNode();

    /** @private @const {!../../../src/service/url-replacements-impl.UrlReplacements} */
    this.urlReplacements_ = Services.urlReplacementsForDoc(headNode);

    /** @private @const {!Promise<string>} */
    this.readerIdPromise_ = readerIdPromise;

    /** @private {?JsonObject} */
    this.authResponse_ = null;
  }

  /**
   * @param {!JsonObject} authResponse
   */
  setAuthResponse(authResponse) {
    this.authResponse_ = authResponse;
  }

  /**
   * @param {string} url
   * @param {boolean} useAuthData Allows `AUTH(field)` URL var substitutions.
   * @return {!Promise<string>}
   */
  buildUrl(url, useAuthData) {
    return this.prepareUrlVars_(useAuthData).then(vars => {
      return this.urlReplacements_.expandUrlAsync(url, vars);
    });
  }

  /**
   * @param {string} url
   * @param {boolean} useAuthData Allows `AUTH(field)` URL var substitutions.
   * @return {!Promise<!Object<string, *>>}
   */
  collectUrlVars(url, useAuthData) {
    return this.prepareUrlVars_(useAuthData).then(vars => {
      return this.urlReplacements_.collectVars(url, vars);
    });
  }

  /**
   * @param {boolean} useAuthData Allows `AUTH(field)` URL var substitutions.
   * @return {!Promise<!Object<string, *>>}
   * @private
   */
  prepareUrlVars_(useAuthData) {
    return this.readerIdPromise_.then(readerId => {
      const vars = {
        'READER_ID': readerId,
        'ACCESS_READER_ID': readerId, // A synonym.
      };
      if (useAuthData) {
        vars['AUTHDATA'] = field => {
          if (this.authResponse_) {
            return getValueForExpr(this.authResponse_, field);
          }
          return undefined;
        };
      }
      return vars;
    });
  }
}
