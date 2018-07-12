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

import {
  FetchInitDef,
  XMLHttpRequestDef,
  XhrBase,
  assertSuccess,
  setupInit,
} from '../xhr-base';
import {dev, user} from '../log';
import {getService, registerServiceBuilder} from '../service';
import {isArray, isObject} from '../types';
import {isFormDataWrapper} from '../form-data-wrapper';
import {map} from '../utils/object';
import {parseJson} from '../json';
import {
  serializeQueryString,
} from '../url';
import {utf8Encode} from '../utils/bytes';

/** @private @enum {number} Allowed fetch responses. */
const allowedFetchTypes_ = {
  document: 1,
  text: 2,
};

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
  }

  /**
   * We want to call `fetch_` unbound from any context since it could
   * be either the native fetch or our polyfill.
   * @override
   * @return {!Promise<!FetchResponse>|!Promise<!Response>}
   */
  fetchFromNetwork_(input, init) {
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
   * @return {!Promise<!FetchResponse>}
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
   * Fetches a text response. Note this returns the response object, not the
   * response's text. #fetchText merely sets up the request to accept text.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
   *
   * See `fetchAmpCors_` for more detail.
   *
   * @param {string} input
   * @param {?FetchInitDef=} opt_init
   * @return {!Promise<!FetchResponse>}
   */
  fetchText(input, opt_init) {
    return this.fetch(input, setupInit(opt_init, 'text/plain'));
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
    const init = setupInit(opt_init, 'text/html');
    init.responseType = 'document';
    return this.fetch(input, init)
        .then(response => response.document_());
  }

  /**
   * @param {string} input URL
   * @param {?FetchInitDef=} opt_init Fetch options object.
   * @return {!Promise<!FetchResponse>}
   */
  fetch(input, opt_init) {
    const init = setupInit(opt_init);
    return this.fetchAmpCors_(input, init).then(res => {
      const response = /**@type {!Response} */ (res);
      return /** @type{!Promise<!FetchResponse>} */ (assertSuccess(response));
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
   * @override
   */
  fromStructuredCloneable_(response, responseType) {
    user().assert(isObject(response), 'Object expected: %s', response);

    const isDocumentType = responseType == 'document';
    if (typeof this.win.Response === 'function' && !isDocumentType) {
      // Use native `Response` type if available for performance. If response
      // type is `document`, we must fall back to `FetchResponse` polyfill
      // because callers would then rely on the `responseXML` property being
      // present, which is not supported by the Response type.
      return new this.win.Response(response['body'], response['init']);
    }

    // TODO(prateekbh): shift below loginc into document-fetch
    // after fetch-polyfill.
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

    if (isDocumentType) {
      data.responseXML =
          new DOMParser().parseFromString(data.responseText, 'text/html');
    }

    return new FetchResponse(data);
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

// TODO(prateekbh): remove everything below this line after fetch polyfill.

/**
 * A minimal polyfill of Fetch API. It only polyfills what we currently use.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
 *
 * Notice that the "fetch" method itself is not exported as that would require
 * us to immediately support a much wide API.
 *
 * @param {string} input
 * @param {!FetchInitDef} init
 * @return {!Promise<!FetchResponse>}
 * @private Visible for testing
 */
export function fetchPolyfill(input, init) {
  return new Promise(function(resolve, reject) {
    const xhr = createXhrRequest(init.method || 'GET', input);

    if (init.credentials == 'include') {
      xhr.withCredentials = true;
    }

    if (init.responseType in allowedFetchTypes_) {
      xhr.responseType = init.responseType;
    }

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
        resolve(new FetchResponse(xhr));
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
function createXhrRequest(method, url) {
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
 * Response object in the Fetch API.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
 */
export class FetchResponse {
  /**
   * @param {!XMLHttpRequest|!XDomainRequest|!XMLHttpRequestDef} xhr
   */
  constructor(xhr) {
    /** @private @const {!XMLHttpRequest|!XDomainRequest|!XMLHttpRequestDef} */
    this.xhr_ = xhr;

    /** @const {number} */
    this.status = this.xhr_.status;

    /** @const {boolean} */
    this.ok = this.status >= 200 && this.status < 300;

    /** @const {!FetchResponseHeaders} */
    this.headers = new FetchResponseHeaders(xhr);

    /** @type {boolean} */
    this.bodyUsed = false;

    /** @type {?ReadableStream} */
    this.body = null;
  }

  /**
   * Create a copy of the response and return it.
   * @return {!FetchResponse}
   */
  clone() {
    dev().assert(!this.bodyUsed, 'Body already used');
    return new FetchResponse(this.xhr_);
  }

  /**
   * Drains the response and returns the text.
   * @return {!Promise<string>}
   * @private
   */
  drainText_() {
    dev().assert(!this.bodyUsed, 'Body already used');
    this.bodyUsed = true;
    return Promise.resolve(this.xhr_.responseText);
  }

  /**
   * Drains the response and returns a promise that resolves with the response
   * text.
   * @return {!Promise<string>}
   */
  text() {
    return this.drainText_();
  }

  /**
   * Drains the response and returns the JSON object.
   * @return {!Promise<!JsonObject>}
   */
  json() {
    return /** @type {!Promise<!JsonObject>} */ (
      this.drainText_().then(parseJson));
  }

  /**
   * Reads the xhr responseXML.
   * @return {!Promise<!Document>}
   * @private
   */
  document_() {
    dev().assert(!this.bodyUsed, 'Body already used');
    this.bodyUsed = true;
    user().assert(this.xhr_.responseXML,
        'responseXML should exist. Make sure to return ' +
        'Content-Type: text/html header.');
    const doc = /** @type {!Document} */(dev().assert(this.xhr_.responseXML));
    return Promise.resolve(doc);
  }

  /**
   * Drains the response and returns a promise that resolves with the response
   * ArrayBuffer.
   * @return {!Promise<!ArrayBuffer>}
   */
  arrayBuffer() {
    return /** @type {!Promise<!ArrayBuffer>} */ (
      this.drainText_().then(utf8Encode));
  }
}


/**
 * Provides access to the response headers as defined in the Fetch API.
 * @private Visible for testing.
 */
export class FetchResponseHeaders {
  /**
   * @param {!XMLHttpRequest|!XDomainRequest|!XMLHttpRequestDef} xhr
   */
  constructor(xhr) {
    /** @private @const {!XMLHttpRequest|!XDomainRequest|!XMLHttpRequestDef} */
    this.xhr_ = xhr;
  }

  /**
   * @param {string} name
   * @return {string}
   */
  get(name) {
    return this.xhr_.getResponseHeader(name);
  }

  /**
   * @param {string} name
   * @return {boolean}
   */
  has(name) {
    return this.xhr_.getResponseHeader(name) != null;
  }
}
