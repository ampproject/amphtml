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

import {dev, user} from '../log';
import {registerServiceBuilder, getService} from '../service';
import {
  getSourceOrigin,
  getCorsUrl,
  parseUrl,
} from '../url';
import {isArray, isObject, isFormData} from '../types';
import {utf8EncodeSync} from '../utils/bytes';


/**
 * The "init" argument of the Fetch API. Currently, only "credentials: include"
 * is implemented.  Note ampCors with explicit false indicates that
 * __amp_source_origin should not be appended to the URL to allow for
 * potential caching or response across pages.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
 *
 * @typedef {{
 *   body: (!Object|!Array|undefined|string),
 *   credentials: (string|undefined),
 *   headers: (!Object|undefined),
 *   method: (string|undefined),
 *   requireAmpResponseSourceOrigin: (boolean|undefined),
 *   ampCors: (boolean|undefined)
 * }}
 */
export let FetchInitDef;

/**
 * A custom error that encapsulates an XHR error message
 * with the corresponding response data.
 */
export class FetchError {
  /**
   * @param {!Error} error
   * @param {!FetchResponse} response
   * @param {boolean=} opt_retriable
   * @param {?JSONType=} opt_responseJson
   */
  constructor(error, response, opt_retriable, opt_responseJson) {
    this.error = error;
    this.response = response;
    this.retriable = opt_retriable;
    this.responseJson = opt_responseJson;
  }
}


/** @private @const {!Array<string>} */
const allowedMethods_ = ['GET', 'POST'];

/** @private @const {!Array<function(*):boolean>} */
const allowedJsonBodyTypes_ = [isArray, isObject];

/** @private @enum {number} Allowed fetch responses. */
const allowedFetchTypes_ = {
  document: 1,
  text: 2,
};

/** @private @const {string} */
const ALLOW_SOURCE_ORIGIN_HEADER = 'AMP-Access-Control-Allow-Source-Origin';


/**
 * A service that polyfills Fetch API for use within AMP.
 *
 * @package Visible for type.
 * @visibleForTesting
 */
export class Xhr {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;
  }

  /**
   * We want to call `fetch_` unbound from any context since it could
   * be either the native fetch or our polyfill.
   *
   * @param {string} input
   * @param {!FetchInitDef} init
   * @return {!Promise<!FetchResponse>|!Promise<!Response>}
   * @private
   */
  fetch_(input, init) {
    dev().assert(typeof input == 'string', 'Only URL supported: %s', input);
    // In particular, Firefox does not tolerate `null` values for
    // `credentials`.
    const creds = init.credentials;
    dev().assert(
        creds === undefined || creds == 'include' || creds == 'omit',
        'Only credentials=include|omit support: %s', creds);
    // Fallback to xhr polyfill since `fetch` api does not support
    // responseType = 'document'. We do this so we don't have to do any parsing
    // and document construction on the UI thread which would be expensive.
    if (init.responseType == 'document') {
      return fetchPolyfill(input, init);
    }
    return (this.win.fetch || fetchPolyfill).apply(null, arguments);
  }

  /**
   * Performs the final initialization and requests the fetch. It does two
   * main things:
   * - It adds "__amp_source_origin" URL parameter with source origin
   * - It verifies "AMP-Access-Control-Allow-Source-Origin" in the response
   * USE WITH CAUTION: setting ampCors to false disables AMP source origin check
   * but allows for caching resources cross pages.
   *
   * Note: requireAmpResponseSourceOrigin is deprecated. It defaults to
   *   true. Use "ampCors: false" to disable AMP source origin check.
   *
   * @param {string} input
   * @param {!FetchInitDef=} init
   * @return {!Promise<!FetchResponse>}
   * @private
   */
  fetchAmpCors_(input, init = {}) {
    // Do not append __amp_source_origin if explicitly disabled.
    if (init.ampCors !== false) {
      input = this.getCorsUrl(this.win, input);
    } else {
      init.requireAmpResponseSourceOrigin = false;
    }
    if (init.requireAmpResponseSourceOrigin === true) {
      dev().error('XHR',
          'requireAmpResponseSourceOrigin is deprecated, use ampCors instead');
    }
    if (init.requireAmpResponseSourceOrigin === undefined) {
      init.requireAmpResponseSourceOrigin = true;
    }
    // For some same origin requests, add AMP-Same-Origin: true header to allow
    // publishers to validate that this request came from their own origin.
    const currentOrigin = parseUrl(this.win.location.href).origin;
    const targetOrigin = parseUrl(input).origin;
    if (currentOrigin == targetOrigin) {
      init['headers'] = init['headers'] || {};
      init['headers']['AMP-Same-Origin'] = 'true';
    }
    // In edge a `TypeMismatchError` is thrown when body is set to null.
    dev().assert(init.body !== null, 'fetch `body` can not be `null`');
    return this.fetch_(input, init).then(response => {
      const allowSourceOriginHeader = response.headers.get(
          ALLOW_SOURCE_ORIGIN_HEADER);
      if (allowSourceOriginHeader) {
        const sourceOrigin = getSourceOrigin(this.win.location.href);
        // If the `AMP-Access-Control-Allow-Source-Origin` header is returned,
        // ensure that it's equal to the current source origin.
        user().assert(allowSourceOriginHeader == sourceOrigin,
              `Returned ${ALLOW_SOURCE_ORIGIN_HEADER} is not` +
              ` equal to the current: ${allowSourceOriginHeader}` +
              ` vs ${sourceOrigin}`);
      } else if (init.requireAmpResponseSourceOrigin) {
        // If the `AMP-Access-Control-Allow-Source-Origin` header is not
        // returned but required, return error.
        user().assert(false, `Response must contain the` +
            ` ${ALLOW_SOURCE_ORIGIN_HEADER} header`);
      }
      return response;
    }, reason => {
      throw user().createExpectedError('XHR', `Failed fetching` +
          ` (${targetOrigin}/...):`, reason && reason.message);
    });
  }

  /**
   * Fetches and constructs JSON object based on the fetch polyfill.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
   *
   * See `fetchAmpCors_` for more detail.
   *
   * @param {string} input
   * @param {?FetchInitDef=} opt_init
   * @return {!Promise<!JSONType>}
   */
  fetchJson(input, opt_init) {
    const init = setupInit(opt_init, 'application/json');
    if (init.method == 'POST' && !isFormData(init.body)) {
      // Assume JSON strict mode where only objects or arrays are allowed
      // as body.
      dev().assert(
        allowedJsonBodyTypes_.some(test => test(init.body)),
        'body must be of type object or array. %s',
        init.body
      );

      init.headers['Content-Type'] = 'application/json;charset=utf-8';
      init.body = JSON.stringify(init.body);
    }
    return this.fetch(input, init)
        .then(response => response.json());
  }

  /**
   * Fetches text based on the fetch polyfill.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
   *
   * See `fetchAmpCors_` for more detail.
   *
   * @param {string} input
   * @param {?FetchInitDef=} opt_init
   * @return {!Promise<string>}
   */
  fetchText(input, opt_init) {
    const init = setupInit(opt_init, 'text/plain');
    return this.fetch(input, init)
        .then(response => response.text());
  }

  /**
   * Creates an XHR request with responseType=document
   * and returns the `FetchResponse` object.
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
    return this.fetchAmpCors_(input, init).then(response =>
        assertSuccess(response));
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
        .then(response => assertSuccess(response));
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
    xhr = new XDomainRequest();
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
  return new Promise((resolve, reject) => {
    const status = response.status;
    if (status < 200 || status >= 300) {
      const retriable = isRetriable(status);
      const err = new FetchError(
          user().createError(`HTTP error ${status}`), response, retriable);
      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.split(';')[0] == 'application/json') {
        response.json().then(json => {
          err.responseJson = json;
          reject(err);
        }, () => {
          // Ignore a failed json parsing and just throw the error without
          // setting responseJson.
          reject(err);
        });
      } else {
        reject(err);
      }
    } else {
      resolve(response);
    }
  });
}


/**
 * Response object in the Fetch API.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
 */
export class FetchResponse {
  /**
   * @param {!XMLHttpRequest|!XDomainRequest} xhr
   */
  constructor(xhr) {
    /** @private @const {!XMLHttpRequest|!XDomainRequest} */
    this.xhr_ = xhr;

    /** @type {number} */
    this.status = this.xhr_.status;

    /** @const {!FetchResponseHeaders} */
    this.headers = new FetchResponseHeaders(xhr);

    /** @type {boolean} */
    this.bodyUsed = false;
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
   * @return {!Promise<!JSONType>}
   */
  json() {
    return /** @type {!Promise<!JSONType>} */ (
        this.drainText_().then(JSON.parse.bind(JSON)));
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
    return /** @type {!Promise<!Document>} */ (
        Promise.resolve(dev().assert(this.xhr_.responseXML)));
  }

  /**
   * Drains the response and returns a promise that resolves with the response
   * ArrayBuffer.
   * @return {!Promise<!ArrayBuffer>}
   */
  arrayBuffer() {
    return /** @type {!Promise<!ArrayBuffer>} */ (
        this.drainText_().then(utf8EncodeSync));
  }
}


/**
 * Provides access to the response headers as defined in the Fetch API.
 * @private Visible for testing.
 */
export class FetchResponseHeaders {
  /**
   * @param {!XMLHttpRequest|!XDomainRequest} xhr
   */
  constructor(xhr) {
    /** @private @const {!XMLHttpRequest|!XDomainRequest} */
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
};
