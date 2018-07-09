/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {FetchInitDef, FetchResponse, fetchPolyfill} from './fetch-polyfill.js';
import {XhrBase, assertSuccess, setupInit} from './service/xhr-base';
import {dev} from './log';
import {isFormDataWrapper} from './form-data-wrapper';

export class DocumentFetcher extends XhrBase {
  /**
   * Creates an instance of DocumentFetcher.
   * @param {!Window} win
   */
  constructor(win) {
    super(win);
  }

  /**
   * @override
   */
  fetch_(input, init) {
    dev().assert(typeof input == 'string', 'Only URL supported: %s', input);

    return this.maybeIntercept_(input, init)
        .then(interceptorResponse => {
          if (interceptorResponse) {
            return interceptorResponse;
          }
          // After this point, both the native `fetch` and the `fetch` polyfill
          // will expect a native `FormData` object in the `body` property, so
          // the native `FormData` object needs to be unwrapped.
          if (isFormDataWrapper(init.body)) {
            init.body = init.body.getFormData();
          }
          return (fetchPolyfill).apply(null, arguments);
        });
  }

  /**
   *
   *
   * @param {string} input
   * @param {?FetchInitDef=} opt_init
   * @return {!Promise<!Document>}
   * @ignore
   */
  fetchDocument(input, opt_init) {
    const init = setupInit(opt_init, 'text/html');
    init.responseType = 'document';
    return this.fetchAmpCors_(input, init).then(res => {
      const response = /**@type {!Response} */ (res);
      return assertSuccess(response);
    }).then(res => {
      const response = /** @type {!FetchResponse} */ (res);
      dev().assert(response.document_,
          'Document method not found, make sure you passed fetch polyfill before fetching a document');
      return response.document_();
    });
  }
}

/** @package @VisibleForTesting */
export function fetchResponseForTesting() {
  return FetchResponse;
}
