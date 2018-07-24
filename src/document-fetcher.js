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

import {FetchInitDef, XhrBase, assertSuccess, setupInit} from './xhr-base';
import {dict} from './utils/object';
import {isFormDataWrapper} from './form-data-wrapper';
import {user} from './log';


export class DocumentFetcher extends XhrBase {
  /**
   * Creates an instance of DocumentFetcher.
   * @param {!Window} win
   */
  constructor(win) {
    super(win);

    /** @private {boolean} */
    this.viewerResponded_ = false;

    /** @private {!XMLHttpRequest} */
    this.xhr_ = new XMLHttpRequest();
  }

  /**
   * @override
   */
  fetchFromNetwork_(input, init) {
    this.viewerResponded_ = false;

    return this.maybeIntercept_(input, init)
        .then(interceptorResponse => {
          if (interceptorResponse) {
            this.viewerResponded_ = true;
            return interceptorResponse;
          }
          // After this point, both the native `fetch` and the `fetch` polyfill
          // will expect a native `FormData` object in the `body` property, so
          // the native `FormData` object needs to be unwrapped.
          if (isFormDataWrapper(init.body)) {
            init.body = init.body.getFormData();
          }

          return this.xhrRequest_(input, init);
        });
  }

  /**
   *
   *
   * @param {string} input
   * @param {!FetchInitDef} init
   * @private
   */
  xhrRequest_(input, init) {
    return new Promise((resolve, reject) => {
      this.xhr_.open(init.method || 'GET', input, true);
      if (init.credentials == 'include') {
        this.xhr_.withCredentials = true;
      }
      this.xhr_.responseType = 'document';
      if (init.headers) {
        for (const header in init.headers) {
          this.xhr_.setRequestHeader(header, init.headers[header]);
        }
      }
      this.xhr_.onreadystatechange = () => {
        if (this.xhr_.readyState < /* STATUS_RECEIVED */ 2) {
          return;
        }
        if (this.xhr_.status < 100 || this.xhr_.status > 599) {
          this.xhr_.onreadystatechange = null;
          reject(user().createExpectedError(
              `Unknown HTTP status ${this.xhr_.status}`));
          return;
        }

        // TODO(dvoytenko): This is currently simplified: we will wait for the
        // whole document loading to complete. This is fine for the use cases
        // we have now, but may need to be reimplemented later.
        if (this.xhr_.readyState == /* COMPLETE */ 4) {
          const options = {
            status: this.xhr_.status,
            statusText: this.xhr_.statusText,
            headers: parseHeaders(this.xhr_.getAllResponseHeaders()),
          };
          const body = 'response' in this.xhr_
            ? this.xhr_.response : this.xhr_.responseText;
          resolve(new Response(/** @type {string} */ (body || ''), /** @type {!ResponseInit} */ (options)));
        }
      };
      this.xhr_.onerror = () => {
        reject(user().createExpectedError('Network failure'));
      };
      this.xhr_.onabort = () => {
        reject(user().createExpectedError('Request aborted'));
      };
      if (init.method == 'POST') {
        this.xhr_.send(/** @type {!FormData} */ (init.body));
      } else {
        this.xhr_.send();
      }
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
    return this.fetchAmpCors_(input, init).then(response => {
      assertSuccess(/** @type {!Response} */(response));
      if (!this.viewerResponded_) {
        return this.xhr_.responseXML;
      }

      // Since this reponse is provided by viewer,
      // doing a DOMParser on main thread is our only option.
      return response.text().then(responseText =>
        new DOMParser().parseFromString(responseText, 'text/html'));
    });
  }
}

/**
 *
 * @param {string} rawHeaders
 * @return {JsonObject}
 */
function parseHeaders(rawHeaders) {
  const headers = dict({});
  // Replace instances of \r\n and \n followed by at least one
  // space or horizontal tab with a space
  // https://tools.ietf.org/html/rfc7230#section-3.2
  const preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
  preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
    const parts = line.split(':');
    const key = parts.shift().trim();
    if (key) {
      const value = parts.join(':').trim();
      headers[key] = value;
    }
  });
  return headers;
}
