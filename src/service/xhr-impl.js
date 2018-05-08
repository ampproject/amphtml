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

import {Services} from '../services';
import {dev, user} from '../log';
import {dict, map} from '../utils/object';
import {fromIterator} from '../utils/array';
import {
  getCorsUrl,
  getSourceOrigin,
  getWinOrigin,
  parseUrl,
  serializeQueryString,
} from '../url';
import {getMode} from '../mode';
import {getService, registerServiceBuilder} from '../service';
import {isArray, isObject} from '../types';
import {isFormDataWrapper} from '../form-data-wrapper';
import {parseJson} from '../json';
import {utf8Encode} from '../utils/bytes';

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

/**
 * A record version of `XMLHttpRequest` that has all the necessary properties
 * and methods of `XMLHttpRequest` to construct a `FetchResponse` from a
 * serialized response returned by the viewer.
 * @typedef {{
 *   status: number,
 *   statusText: string,
 *   responseText: string,
 *   responseXML: ?Document,
 *   getResponseHeader: function(this:XMLHttpRequestDef, string): string,
 * }}
 */
let XMLHttpRequestDef;

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

    const ampdocService = Services.ampdocServiceFor(win);

    // The isSingleDoc check is required because if in shadow mode, this will
    // throw a console error because the shellShadowDoc_ is not set when
    // fetching the amp doc. So either the test-bind-impl or test pre setup in
    // shadow mode tests needs to be fixed or there is a bug in ampdoc impl
    // getAmpDoc.
    // TODO(alabiaga): This should be investigated and fixed
    /** @private {?./ampdoc-impl.AmpDoc} */
    this.ampdocSingle_ =
        ampdocService.isSingleDoc() ? ampdocService.getAmpDoc() : null;
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
    return this.maybeIntercept_(input, init)
        .then(interceptorResponse => {
          if (interceptorResponse) {
            return interceptorResponse;
          }
          // After this point, both the native `fetch` and the `fetch` polyfill will
          // expect a native `FormData` object in the `body` property, so the native
          // `FormData` object needs to be unwrapped.
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
   * Intercepts the XHR and proxies it through the viewer if necessary.
   *
   * XHRs are intercepted if all of the following are true:
   * - The AMP doc is in single doc mode
   * - The viewer has the `xhrInterceptor` capability
   * - The Viewer is a trusted viewer or AMP is currently in developement mode
   * - The AMP doc is opted-in for XHR interception (`<html>` tag has
   *   `allow-xhr-interception` attribute)
   *
   * @param {string} input The URL of the XHR which may get intercepted.
   * @param {!FetchInitDef} init The options of the XHR which may get
   *     intercepted.
   * @return {!Promise<!FetchResponse|!Response|undefined>}
   *     A response returned by the interceptor if XHR is intercepted or
   *     `Promise<undefined>` otherwise.
   * @private
   */
  maybeIntercept_(input, init) {
    if (!this.ampdocSingle_) {
      return Promise.resolve();
    }
    const viewer = Services.viewerForDoc(this.ampdocSingle_);
    const whenFirstVisible = viewer.whenFirstVisible();
    if (!viewer.hasCapability('xhrInterceptor')) {
      return whenFirstVisible;
    }
    const htmlElement = this.ampdocSingle_.getRootNode().documentElement;
    const docOptedIn = htmlElement.hasAttribute('allow-xhr-interception');
    const isDevMode = getMode(this.win).development;
    if (!docOptedIn) {
      return whenFirstVisible;
    }
    return whenFirstVisible.then(() => {
      return viewer.isTrustedViewer();
    }).then(viewerTrusted => {
      if (!viewerTrusted && !isDevMode) {
        return;
      }
      const messagePayload = dict({
        'originalRequest': this.toStructuredCloneable_(input, init),
      });
      return viewer.sendMessageAwaitResponse('xhr', messagePayload)
          .then(response =>
            this.fromStructuredCloneable_(response, init.responseType));
    });
  }

  /**
   * Serializes a fetch request so that it can be passed to `postMessage()`,
   * i.e., can be cloned using the
   * [structured clone algorithm](http://mdn.io/Structured_clone_algorithm).
   *
   * The request is serialized in the following way:
   *
   * 1. If the `init.body` is a `FormData`, set content-type header to
   * `multipart/form-data` and transform `init.body` into an
   * `!Array<!Array<string>>` holding the list of form entries, where each
   * element in the array is a form entry (key-value pair) represented as a
   * 2-element array.
   *
   * 2. Return a new object having properties `input` and the transformed
   * `init`.
   *
   * The serialized request is assumed to be de-serialized in the following way:
   *
   * 1.If content-type header starts with `multipart/form-data`
   * (case-insensitive), transform the entry array in `init.body` into a
   * `FormData` object.
   *
   * 2. Pass `input` and transformed `init` to `fetch` (or the constructor of
   * `Request`).
   *
   * Currently only `FormData` used in `init.body` is handled as it's the only
   * type being used in AMP runtime that needs serialization. The `Headers` type
   * also needs serialization, but callers should not be passing `Headers`
   * object in `init`, as that fails `fetchPolyfill` on browsers that don't
   * support fetch. Some serialization-needing types for `init.body` such as
   * `ArrayBuffer` and `Blob` are already supported by the structured clone
   * algorithm. Other serialization-needing types such as `URLSearchParams`
   * (which is not supported in IE and Safari) and `FederatedCredentials` are
   * not used in AMP runtime.
   *
   * @param {string} input The URL of the XHR to convert to structured
   *     cloneable.
   * @param {!FetchInitDef} init The options of the XHR to convert to structured
   *     cloneable.
   * @return {{input: string, init: !FetchInitDef}} The serialized structurally-
   *     cloneable request.
   * @private
   */
  toStructuredCloneable_(input, init) {
    const newInit = Object.assign({}, init);
    if (isFormDataWrapper(init.body)) {
      newInit.headers = newInit.headers || {};
      newInit.headers['Content-Type'] = 'multipart/form-data;charset=utf-8';
      newInit.body = fromIterator(init.body.entries());
    }
    return {input, init: newInit};
  }

  /**
   * De-serializes a fetch response that was made possible to be passed to
   * `postMessage()`, i.e., can be cloned using the
   * [structured clone algorithm](http://mdn.io/Structured_clone_algorithm).
   *
   * The response is assumed to be serialized in the following way:
   *
   * 1. Transform the entries in the headers of the response into an
   * `!Array<!Array<string>>` holding the list of header entries, where each
   * element in the array is a header entry (key-value pair) represented as a
   * 2-element array. The header key is case-insensitive.
   *
   * 2. Include the header entry list and `status` and `statusText` properties
   * of the response in as `headers`, `status` and `statusText` properties of
   * `init`.
   *
   * 3. Include the body of the response serialized as string in `body`.
   *
   * 4. Return a new object having properties `body` and `init`.
   *
   * The response is de-serialized in the following way:
   *
   * 1. If the `Response` type is supported and `responseType` is not
   * document, pass `body` and `init` directly to the constructor of `Response`.
   *
   * 2. Otherwise, populate a fake XHR object to pass to `FetchResponse` as if
   * the response is returned by the fetch polyfill.
   *
   * 3. If `responseType` is `document`, also parse the body and populate
   * `responseXML` as a `Document` type.
   *
   * @param {JsonObject|string|undefined} response The structurally-cloneable
   *     response to convert back to a regular Response.
   * @param {string|undefined} responseType The original response type used to
   *     initiate the XHR.
   * @return {!FetchResponse|!Response} The deserialized regular response.
   * @private
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
    const currentOrigin = getWinOrigin(this.win);
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
        user().assert(false, 'Response must contain the' +
            ` ${ALLOW_SOURCE_ORIGIN_HEADER} header`);
      }
      return response;
    }, reason => {
      throw user().createExpectedError('XHR', 'Failed fetching' +
          ` (${targetOrigin}/...):`, reason && reason.message);
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
