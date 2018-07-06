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

import {FetchInitDef} from './service/xhr-impl';
import {dev, user} from './log';
import {getCorsUrl, getWinOrigin, parseUrlDeprecated} from './url';

/** @private @enum {number} Allowed fetch responses. */
const allowedFetchTypes_ = {
  document: 1,
};


export class DocumentFetcher {
  /**
   * Creates an instance of DocumentFetcher.
   * @param {!Window} win
   */
  constructor(win) {
    this.win_ = win;
  }

  /**
   * A minimal polyfill of Fetch API. It only polyfills what we currently use.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
   *
   * Notice that the "fetch" method itself is not exported as that would require
   * us to immediately support a much wide API.
   *
   * @param {Request|string} input
   * @param {!FetchInitDef} init
   * @return {!Promise<!Response>}
   */
  fetchDocument(input, init) {
    dev().assert(typeof input == 'string', 'Only URL supported: %s', input);
    return new Promise((resolve, reject) => {
      const xhr = this.createXhrRequest_(init.method || 'GET', input);

      if (init.credentials == 'include') {
        xhr.withCredentials = true;
      }

      if (init.ampCors !== false) {
        input = getCorsUrl(this.win_, input);
      }

      if (('responseType' in init) &&
        !(init.responseType in allowedFetchTypes_)) {
        throw new Error('Document fetcher should only be used for responseType=document, please use Services.xhr for any other use case.');
      } else {
        xhr.responseType = 'document';
      }

      init = this.sanitizeInit_(input, init);

      if (init.headers) {
        Object.keys(init.headers).forEach(function(header) {
          xhr.setRequestHeader(header, init.headers[header]);
        });
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState < /* STATUS_RECEIVED */ 2) {
          return;
        }
        if (xhr.status < 100 || xhr.status > 599) {
          xhr.onreadystatechange = null;
          reject(user().createExpectedError(`Unknown HTTP status ${xhr.status}`));
          return;
        }

        // TODO(dvoytenko): This is currently simplified: we will wait for the
        // whole document loading to complete. This is fine for the use cases
        // we have now, but may need to be reimplemented later.
        if (xhr.readyState == /* COMPLETE */ 4) {
          user().assert(xhr.responseXML,
              'responseXML should exist. Make sure to return ' +
              'Content-Type: text/html header.');
          const doc = /** @type {!Document} */(dev().assert(xhr.responseXML));
          return resolve(doc);
        }
      };
      xhr.onerror = () => {
        reject(user().createExpectedError('Network failure'));
      };
      xhr.onabort = () => {
        reject(user().createExpectedError('Request aborted'));
      };

      if (init.method == 'POST') {
        xhr.send(init.body);
      } else {
        xhr.send();
      }
    });
  }

  /**
   * @param {string} method
   * @param {string} url
   * @return {!XMLHttpRequest|!XDomainRequest}
   * @private
   */
  createXhrRequest_(method, url) {
    let xhr = new XMLHttpRequest();
    if ('withCredentials' in xhr) {
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest != 'undefined') {
      // IE-specific object.
      xhr = new XDomainRequest();
      xhr.open(method, url);
    } else {
      throw dev().createExpectedError('CORS is not supported');
    }
    return xhr;
  }

  /**
   * Sanitizes the init object for xhr's use.
   *
   * @param {string} input
   * @param {!FetchInitDef} init
   * @return {!FetchInitDef}
   * @private
   */
  sanitizeInit_(input, init) {
    init.headers = init.headers || {};
    init.headers['Accept'] = 'text/html';
    const currentOrigin = getWinOrigin(this.win_);
    const targetOrigin = parseUrlDeprecated(input).origin;
    if (currentOrigin == targetOrigin) {
      init['headers'] = init['headers'] || {};
      init['headers']['AMP-Same-Origin'] = 'true';
    }
    // In edge a `TypeMismatchError` is thrown when body is set to null.
    dev().assert(init.body !== null, 'fetch `body` can not be `null`');
    // In particular, Firefox does not tolerate `null` values for
    // `credentials`.
    const creds = init.credentials;
    dev().assert(
        creds === undefined || creds == 'include' || creds == 'omit',
        'Only credentials=include|omit support: %s', creds);
    return init;
  }
}
