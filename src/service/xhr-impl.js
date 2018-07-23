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

import {FetchInitDef, XhrBase, assertSuccess, setupInit} from '../xhr-base';
import {dev} from '../log';
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
  }

  /**
   * We want to call `fetch_` unbound from any context since it could
   * be either the native fetch or our polyfill.
   * @override
   * @return {!Promise<!Response>}
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

          return (this.win.fetch).apply(null, arguments);
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
   * Add "__amp_source_origin" query parameter to the URL. Ideally, we'd be
   * able to set a header (e.g. AMP-Source-Origin), but this will force
   * preflight request on all CORS request.
   * @param {!Window} win
   * @param {string} url
   * @return {string}
   */
  getCorsUrl(win, url) {
    return getCorsUrl(win, url);
  }
}

/**
 * Normalized method name by uppercasing.
 * @param {string|undefined} method
 * @return {string}
 * @private
 */
function normalizeMethod_(method) {
  if (method === undefined) {
    return 'GET';
  }
  method = method.toUpperCase();

  dev().assert(
      allowedMethods_.includes(method),
      'Only one of %s is currently allowed. Got %s',
      allowedMethods_.join(', '),
      method
  );

  return method;
}

/**
 * Sets up and normalizes the FetchInitDef
 *
 * @param {?FetchInitDef=} opt_init Fetch options object.
 * @param {string=} opt_accept The HTTP Accept header value.
 * @return {!FetchInitDef}
 */
function setupInit(opt_init, opt_accept) {
  const init = opt_init || {};
  init.method = normalizeMethod_(init.method);
  init.headers = init.headers || {};
  if (opt_accept) {
    init.headers['Accept'] = opt_accept;
  }
  return init;
}


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
    xhr = new XDomainRequest(); // eslint-disable-line no-undef
    xhr.open(method, url);
  } else {
    throw dev().createExpectedError('CORS is not supported');
  }
  return xhr;
}

/**
 * If 415 or in the 5xx range.
 * @param {number} status
 */
function isRetriable(status) {
  return status == 415 || (status >= 500 && status < 600);
}


/**
 * Returns the response if successful or otherwise throws an error.
 * @param {!FetchResponse} response
 * @return {!Promise<!FetchResponse>}
 * @private Visible for testing
 */
export function assertSuccess(response) {
  return new Promise(resolve => {
    if (response.ok) {
      return resolve(response);
    }

    const {status} = response;
    const err = user().createError(`HTTP error ${status}`);
    err.retriable = isRetriable(status);
    // TODO(@jridgewell, #9448): Callers who need the response should
    // skip processing.
    err.response = response;
    throw err;
  });
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
