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
import {XhrBase, assertSuccess, setupInit} from './xhr-base';
import {dev, user} from './log';
import {isArray, isObject} from './types';
import {isFormDataWrapper} from './form-data-wrapper';
import {map} from './utils/object.js';

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
          'Document method not found, make sure you passed fetch'
          + ' polyfill before fetching a document');
      return response.document_();
    });
  }

  /**
   * @return {!FetchResponse} The deserialized regular response.
   * @override
   */
  fromStructuredCloneable_(response, responseType) {
    user().assert(isObject(response), 'Object expected: %s', response);

    dev().assert(responseType == 'document',
        'fromStructuredCloneable_ called with non-document responseType');

    const lowercasedHeaders = map();
    const data = {
      status: 200,
      statusText: 'OK',
      responseText: (response['body'] ? String(response['body']) : ''),
      /**
       * @param {string} name
       * @return {string}
       */
      getResponseHeader(name) {
        return lowercasedHeaders[String(name).toLowerCase()] || null;
      },
    };

    if (response['init']) {
      const init = response['init'];
      if (isArray(init.headers)) {
        init.headers.forEach(entry => {
          const headerName = entry[0];
          const headerValue = entry[1];
          lowercasedHeaders[String(headerName).toLowerCase()] =
              String(headerValue);
        });
      }
      if (init.status) {
        data.status = parseInt(init.status, 10);
      }
      if (init.statusText) {
        data.statusText = String(init.statusText);
      }
    }


    data.responseXML =
        new DOMParser().parseFromString(data.responseText, 'text/html');

    return new FetchResponse(data);
  }
}

/** @package @VisibleForTesting */
export function fetchResponseForTesting() {
  return FetchResponse;
}
