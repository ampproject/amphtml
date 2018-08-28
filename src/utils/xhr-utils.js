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
import {dict, map} from './object';
import {fromIterator} from './array';
import {getCorsUrl, getSourceOrigin, getWinOrigin, isProxyOrigin, parseUrlDeprecated} from '../url';
import {getMode} from '../mode';
import {isArray, isObject} from '../types';
import {isFormDataWrapper} from '../form-data-wrapper';
import {parseJson} from '../json';
import {serializeQueryString} from '../url';
import {utf8Encode} from './bytes';

/** @private @const {!Array<string>} */
const allowedMethods_ = ['GET', 'POST'];

/** @private @const {string} */
const ALLOW_SOURCE_ORIGIN_HEADER = 'AMP-Access-Control-Allow-Source-Origin';

/** @private @const {!Array<function(*):boolean>} */
const allowedJsonBodyTypes_ = [isArray, isObject];

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
 *   headers: (!JsonObject|undefined),
 *   method: (string|undefined),
 *   requireAmpResponseSourceOrigin: (boolean|undefined),
 *   ampCors: (boolean|undefined)
 * }}
 */
export let FetchInitDef;

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
export function toStructuredCloneable(input, init) {
  const newInit = Object.assign({}, init);
  if (isFormDataWrapper(init.body)) {
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
export function fromStructuredCloneable(response, responseType) {
  user().assert(isObject(response), 'Object expected: %s', response);

  const isDocumentType = responseType == 'document';
  if (typeof Response === 'function' && !isDocumentType) {
    // Use native `Response` type if available for performance. If response
    // type is `document`, we must fall back to `FetchResponse` polyfill
    // because callers would then rely on the `responseXML` property being
    // present, which is not supported by the Response type.
    return new Response(response['body'], response['init']);
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

  // TODO(prateekbh): remove responseXML after everything is moved to polyfill
  // it's not used right now, but its tough to remove this due to typings.
  if (isDocumentType) {
    data.responseXML =
        new DOMParser().parseFromString(data.responseText, 'text/html');
  }

  return new FetchResponse(data);
}

/**
 * Intercepts the XHR and proxies it through the viewer if necessary.
 *
 * XHRs are intercepted if all of the following are true:
 * - The AMP doc is in single doc mode
 * - The requested resource is not a 1p request.
 * - The viewer has the `xhrInterceptor` capability
 * - The Viewer is a trusted viewer or AMP is currently in developement mode
 * - The AMP doc is opted-in for XHR interception (`<html>` tag has
 *   `allow-xhr-interception` attribute)
 *
 * @param {!Window} win
 * @param {?../service/ampdoc-impl.AmpDoc} ampdocSingle
 * @param {string} input The URL of the XHR which may get intercepted.
 * @param {!FetchInitDef} init The options of the XHR which may get
 *     intercepted.
 * @return {!Promise<!FetchResponse|!Response|undefined>}
 *     A response returned by the interceptor if XHR is intercepted or
 *     `Promise<undefined>` otherwise.
 * @private
 */
export function getViewerInterceptResponse(win, ampdocSingle, input, init) {
  if (!ampdocSingle) {
    return Promise.resolve();
  }
  const viewer = Services.viewerForDoc(ampdocSingle);
  const whenFirstVisible = viewer.whenFirstVisible();
  if (isProxyOrigin(input) || !viewer.hasCapability('xhrInterceptor')) {
    return whenFirstVisible;
  }
  const htmlElement = ampdocSingle.getRootNode().documentElement;
  const docOptedIn = htmlElement.hasAttribute('allow-xhr-interception');
  if (!docOptedIn) {
    return whenFirstVisible;
  }
  return whenFirstVisible.then(() => {
    return viewer.isTrustedViewer();
  }).then(viewerTrusted => {
    const isDevMode = getMode(win).development;
    if (!viewerTrusted && !isDevMode) {
      return;
    }
    const messagePayload = dict({
      'originalRequest': toStructuredCloneable(input, init),
    });
    return viewer.sendMessageAwaitResponse('xhr', messagePayload)
        .then(response =>
          fromStructuredCloneable(response, init.responseType));
  });
}

/**
 * Setsup URL based on ampCors
 * @param {!Window} win
 * @param {string} input
 * @param {!FetchInitDef} init The options of the XHR which may get
 * intercepted.
 */
export function setupInput(win, input, init) {
  dev().assert(typeof input == 'string', 'Only URL supported: %s', input);
  if (init.ampCors !== false) {
    input = getCorsUrl(win, input);
  }
  return input;
}

/**
 * Sets up and normalizes the FetchInitDef
 *
 * @param {?FetchInitDef=} opt_init Fetch options object.
 * @param {string=} opt_accept The HTTP Accept header value.
 * @return {!FetchInitDef}
 */
export function setupInit(opt_init, opt_accept) {
  const init = opt_init || {};

  // In particular, Firefox does not tolerate `null` values for
  // `credentials`.
  const creds = init.credentials;
  dev().assert(
      creds === undefined || creds == 'include' || creds == 'omit',
      'Only credentials=include|omit support: %s', creds);

  init.method = normalizeMethod_(init.method);
  init.headers = init.headers || dict({});
  if (opt_accept) {
    init.headers['Accept'] = opt_accept;
  }

  // In edge a `TypeMismatchError` is thrown when body is set to null.
  dev().assert(init.body !== null, 'fetch `body` can not be `null`');

  return init;
}

/**
 *
 * Sets up AMPSpecific CORS headers.
 * @param {!Window} win
 * @param {string} input
 * @param {?FetchInitDef=} init
 * @return {!FetchInitDef}
 */
export function setupAMPCors(win, input, init) {
  // Do not append __amp_source_origin if explicitly disabled.
  if (init.ampCors === false) {
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
  const currentOrigin = getWinOrigin(win);
  const targetOrigin = parseUrlDeprecated(input).origin;
  if (currentOrigin == targetOrigin) {
    init['headers'] = init['headers'] || {};
    init['headers']['AMP-Same-Origin'] = 'true';
  }

  return init;
}

/**
 * @param {?FetchInitJsonDef=} init
 * @return {!FetchInitJsonDef}
 */
export function setupJsonFetchInit(init) {
  const fetchInit = setupInit(init, 'application/json');
  if (fetchInit.method == 'POST' && !isFormDataWrapper(fetchInit.body)) {
    // Assume JSON strict mode where only objects or arrays are allowed
    // as body.
    dev().assert(
        allowedJsonBodyTypes_.some(test => test(fetchInit.body)),
        'body must be of type object or array. %s',
        fetchInit.body
    );

    // Content should be 'text/plain' to avoid CORS preflight.
    fetchInit.headers['Content-Type'] = fetchInit.headers['Content-Type'] ||
        'text/plain;charset=utf-8';
    const headerContentType = fetchInit.headers['Content-Type'];
    // Cast is valid, because we checked that it is not form data above.
    if (headerContentType === 'application/x-www-form-urlencoded') {
      fetchInit.body =
        serializeQueryString(/** @type {!JsonObject} */ (fetchInit.body));
    } else {
      fetchInit.body = JSON.stringify(/** @type {!JsonObject} */ (fetchInit.body));
    }
  }
  return fetchInit;
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
 * Verifies if response has the correct headers
 * @param {!Window} win
 * @param {!FetchResponse|!Response} response
 * @param {!FetchInitDef=} init
 * @return {!FetchResponse|!Response}
 */
export function verifyAmpCORSHeaders(win, response, init) {
  const allowSourceOriginHeader = response.headers.get(
      ALLOW_SOURCE_ORIGIN_HEADER);
  if (allowSourceOriginHeader) {
    const sourceOrigin = getSourceOrigin(win.location.href);
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
}

// TODO(prateekbh): move everything below this line into the polyfill
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

/** @private @enum {number} Allowed fetch responses. */
const allowedFetchTypes_ = {
  document: 1,
  text: 2,
};

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
      reject(user().createExpectedError('Request failure'));
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
 * @param {!FetchResponse|!Response} response
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
