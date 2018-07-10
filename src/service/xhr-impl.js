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

import {FetchInitDef} from '../fetch-polyfill.js';
import {XhrBase, assertSuccess, setupInit} from '../xhr-base';
import {dev, user} from '../log';
import {fetchPolyfill} from '../fetch-polyfill';
import {getService, registerServiceBuilder} from '../service';
import {isArray, isObject} from '../types';
import {isFormDataWrapper} from '../form-data-wrapper';
import {
  serializeQueryString,
} from '../url';

/**
 * Special case for fetchJson
 * @typedef {{
 *   body: (!JsonObject|!FormData|undefined),
 *   credentials: (string|undefined),
 *   headers: (!Object|undefined),
 *   method: (string|undefined),
 *   requireAmpResponseSourceOrigin: (boolean|undefined),
 *   ampCors: (boolean|undefined)
 * }}
 */
export let FetchInitJsonDef;

/** @private @const {!Array<function(*):boolean>} */
const allowedJsonBodyTypes_ = [isArray, isObject];

/**
 * A service that polyfills Fetch API for use within AMP.
 *
 * @package Visible for type.
 * @visibleForTesting
 */
export class Xhr extends XhrBase {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    super(win);

    /** @const {!Window} */
    this.win = win;
  }

  /**
   * We want to call `fetch_` unbound from any context since it could
   * be either the native fetch or our polyfill.
   * @override
   * @return {!Promise<!Response>}
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

          // Fallback to xhr polyfill since `fetch` api does not support
          // responseType = 'document'. We do this so we don't have to do any
          // parsing and document construction on the UI thread which would be
          // expensive.
          if (init.responseType == 'document') {
            return fetchPolyfill(input, init);
          }

          return (this.win.fetch || fetchPolyfill).apply(null, arguments);
        });
  }

  /**
   * Fetches a JSON response. Note this returns the response object, not the
   * response's JSON. #fetchJson merely sets up the request to accept JSON.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
   *
   * See `fetchAmpCors_` for more detail.
   *
   * @param {string} input
   * @param {?FetchInitJsonDef=} opt_init
   * @param {boolean=} opt_allowFailure Allows non-2XX status codes to fulfill.
   * @return {!Promise<!Response>}
   */
  fetchJson(input, opt_init, opt_allowFailure) {
    const init = setupInit(opt_init, 'application/json');
    if (init.method == 'POST' && !isFormDataWrapper(init.body)) {
      // Assume JSON strict mode where only objects or arrays are allowed
      // as body.
      dev().assert(
          allowedJsonBodyTypes_.some(test => test(init.body)),
          'body must be of type object or array. %s',
          init.body
      );

      // Content should be 'text/plain' to avoid CORS preflight.
      init.headers['Content-Type'] = init.headers['Content-Type'] ||
          'text/plain;charset=utf-8';
      const headerContentType = init.headers['Content-Type'];
      // Cast is valid, because we checked that it is not form data above.
      if (headerContentType === 'application/x-www-form-urlencoded') {
        init.body =
          serializeQueryString(/** @type {!JsonObject} */ (init.body));
      } else {
        init.body = JSON.stringify(/** @type {!JsonObject} */ (init.body));
      }
    }
    return this.fetch(input, init);
  }

  /**
   * Creates an XHR request with responseType=document
   * and returns a promise for the initialized `Document`.
   * Note this does not return a `Response`, since this is not a standard
   * Fetch response type.
   *
   * @param {string} input
   * @param {?FetchInitDef=} opt_init
   * @return {!Promise<!Document>}
   */
  fetchDocument(input, opt_init) {
    user().expectedError('xhr-impl',
        'fetchDocument is deprecated from xhr-impl.js,'
        + ' please use document-fetcher instead');
    const init = setupInit(opt_init, 'text/html');
    init.responseType = 'document';
    return this.fetch(input, init)
        .then(response => response.document_());
  }

  /**
   * Fetches a text response. Note this returns the response object, not the
   * response's text. #fetchText merely sets up the request to accept text.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
   *
   * See `fetchAmpCors_` for more detail.
   *
   * @param {string} input
   * @param {?FetchInitDef=} opt_init
   * @return {!Promise<!Response>}
   */
  fetchText(input, opt_init) {
    return this.fetch(input, setupInit(opt_init, 'text/plain'));
  }

  /**
   * @param {string} input URL
   * @param {?FetchInitDef=} opt_init Fetch options object.
   * @return {!Promise<!Response>}
   */
  fetch(input, opt_init) {
    const init = setupInit(opt_init);
    return this.fetchAmpCors_(input, init).then(res => {
      const response = /**@type {!Response} */ (res);
      return assertSuccess(response);
    });
  }

  /**
   * Sends the request, awaits result and confirms that it was successful.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
   *
   * See `fetchAmpCors_` for more detail.
   *
   * @param {string} input
   * @param {!FetchInitDef=} opt_init
   * @return {!Promise}
   */
  sendSignal(input, opt_init) {
    return this.fetchAmpCors_(input, opt_init)
        .then(res => {
          const response = /**@type {!Response} */ (res);
          return assertSuccess(response);
        });
  }

  /**
   * @return {!FetchResponse}
   * @override
   */
  fromStructuredCloneable_(response, responseType) {
    user().assert(isObject(response), 'Object expected: %s', response);

    dev().assert(responseType == 'document',
        'fromStructuredCloneable_ called with invalid document responseType');
    if (typeof this.win.Response === 'function') {
      // Use native `Response` type if available for performance. If response
      // type is `document`, we must fall back to `Response` polyfill
      // because callers would then rely on the `responseXML` property being
      // present, which is not supported by the Response type.
      return new this.win.Response(response['body'], response['init']);
    }
  }
}

/**
 * @param {!Window} window
 * @return {!Xhr}
 */
export function xhrServiceForTesting(window) {
  installXhrService(window);
  return getService(window, 'xhr');
}

/**
 * @param {!Window} window
 */
export function installXhrService(window) {
  registerServiceBuilder(window, 'xhr', Xhr);
}
