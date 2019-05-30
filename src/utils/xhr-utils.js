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
import {dev, devAssert, user, userAssert} from '../log';
import {dict, map} from './object';
import {fromIterator} from './array';
import {
  getCorsUrl,
  getSourceOrigin,
  getWinOrigin,
  isProxyOrigin,
  parseUrlDeprecated,
  serializeQueryString,
} from '../url';
import {getMode} from '../mode';
import {isArray, isObject} from '../types';
import {isFormDataWrapper} from '../form-data-wrapper';

/** @private @const {!Array<string>} */
const allowedMethods_ = ['GET', 'POST'];

/** @private @const {string} */
export const ALLOW_SOURCE_ORIGIN_HEADER =
  'AMP-Access-Control-Allow-Source-Origin';

/** @private @const {!Array<function(*):boolean>} */
const allowedJsonBodyTypes_ = [isArray, isObject];

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
    const wrapper = /** @type {!FormDataWrapperInterface} */ (init.body);
    newInit.headers['Content-Type'] = 'multipart/form-data;charset=utf-8';
    newInit.body = fromIterator(wrapper.entries());
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
 * 3. Include the body of the response serialized as string in `body` or as
 * JSON array in `response[body][json]`.
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
 * @return {!Response} The deserialized regular response.
 * @private
 */
export function fromStructuredCloneable(response, responseType) {
  userAssert(isObject(response), 'Object expected: %s', response);

  const isDocumentType = responseType == 'document';
  if (!isDocumentType) {
    let body = response['body'];
    // Handle JSON response.
    if (body && body['json']) {
      const init = {type: 'application/json'};
      body = new Blob([JSON.stringify(body['json'])], init);
    }

    // Use native `Response` type if available for performance. If response
    // type is `document`, we must fall back to `FetchResponse` polyfill
    // because callers would then rely on the `responseXML` property being
    // present, which is not supported by the Response type.
    return new Response(body, response['init']);
  }

  const lowercasedHeaders = map();
  const data = {
    status: 200,
    statusText: 'OK',
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
        lowercasedHeaders[String(headerName).toLowerCase()] = String(
          headerValue
        );
      });
    }
    if (init.status) {
      data.status = parseInt(init.status, 10);
    }
    if (init.statusText) {
      data.statusText = String(init.statusText);
    }
  }

  return new Response(response['body'] ? String(response['body']) : '', data);
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
 * @return {!Promise<!Response|undefined>}
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
  return whenFirstVisible
    .then(() => {
      return viewer.isTrustedViewer();
    })
    .then(viewerTrusted => {
      const isDevMode = getMode(win).development;
      if (!viewerTrusted && !isDevMode) {
        return;
      }
      const messagePayload = dict({
        'originalRequest': toStructuredCloneable(input, init),
      });
      return viewer
        .sendMessageAwaitResponse('xhr', messagePayload)
        .then(response => fromStructuredCloneable(response, init.responseType));
    });
}

/**
 * Sets up URL based on ampCors
 * @param {!Window} win
 * @param {string} input
 * @param {!FetchInitDef} init The options of the XHR which may get
 * intercepted.
 */
export function setupInput(win, input, init) {
  devAssert(typeof input == 'string', 'Only URL supported: %s', input);
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
  devAssert(
    creds === undefined || creds == 'include' || creds == 'omit',
    'Only credentials=include|omit support: %s',
    creds
  );

  init.method = normalizeMethod_(init.method);
  init.headers = init.headers || dict({});
  if (opt_accept) {
    init.headers['Accept'] = opt_accept;
  }

  // In edge a `TypeMismatchError` is thrown when body is set to null.
  devAssert(init.body !== null, 'fetch `body` can not be `null`');

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
    dev().error(
      'XHR',
      'requireAmpResponseSourceOrigin is deprecated, use ampCors instead'
    );
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
 * @param {?FetchInitDef=} init
 * @return {!FetchInitDef}
 */
export function setupJsonFetchInit(init) {
  const fetchInit = setupInit(init, 'application/json');
  if (fetchInit.method == 'POST' && !isFormDataWrapper(fetchInit.body)) {
    // Assume JSON strict mode where only objects or arrays are allowed
    // as body.
    devAssert(
      allowedJsonBodyTypes_.some(test => test(fetchInit.body)),
      'body must be of type object or array. %s',
      fetchInit.body
    );

    // Content should be 'text/plain' to avoid CORS preflight.
    fetchInit.headers['Content-Type'] =
      fetchInit.headers['Content-Type'] || 'text/plain;charset=utf-8';
    const headerContentType = fetchInit.headers['Content-Type'];
    // Cast is valid, because we checked that it is not form data above.
    if (headerContentType === 'application/x-www-form-urlencoded') {
      fetchInit.body = serializeQueryString(
        /** @type {!JsonObject} */ (fetchInit.body)
      );
    } else {
      fetchInit.body = JSON.stringify(
        /** @type {!JsonObject} */ (fetchInit.body)
      );
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
  devAssert(
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
 * @param {!Response} response
 * @param {!FetchInitDef=} init
 * @return {!Response}
 */
export function verifyAmpCORSHeaders(win, response, init) {
  const allowSourceOriginHeader = response.headers.get(
    ALLOW_SOURCE_ORIGIN_HEADER
  );
  if (allowSourceOriginHeader) {
    const sourceOrigin = getSourceOrigin(win.location.href);
    // If the `AMP-Access-Control-Allow-Source-Origin` header is returned,
    // ensure that it's equal to the current source origin.
    userAssert(
      allowSourceOriginHeader == sourceOrigin,
      `Returned ${ALLOW_SOURCE_ORIGIN_HEADER} is not` +
        ` equal to the current: ${allowSourceOriginHeader}` +
        ` vs ${sourceOrigin}`
    );
  } else if (init.requireAmpResponseSourceOrigin) {
    // If the `AMP-Access-Control-Allow-Source-Origin` header is not
    // returned but required, return error.
    userAssert(
      false,
      `Response must contain the ${ALLOW_SOURCE_ORIGIN_HEADER} header`
    );
  }
  return response;
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
 * @param {!Response} response
 * @return {!Promise<!Response>}
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
 * Returns a promise resolving to a string identity token if the element
 * contains the 'crossorigin' attribute and the amp-viewer-assistance extension
 * is present. Resolves to undefined otherwise.
 * @param {!Element} element
 * @return {!Promise<undefined>}
 */
export function getViewerAuthTokenIfAvailable(element) {
  const crossOriginAttr = element.getAttribute('crossorigin');
  if (
    crossOriginAttr &&
    crossOriginAttr.trim() === 'amp-viewer-auth-token-via-post'
  ) {
    return (
      Services.viewerAssistanceForDocOrNull(element)
        .then(va => {
          userAssert(
            va,
            'crossorigin="amp-viewer-auth-token-post" ' +
              'requires amp-viewer-assistance extension.'
          );
          return va.getIdTokenPromise();
        })
        // If crossorigin attr is present, resolve with token or empty string.
        .then(token => token || '')
        .catch(() => '')
    );
  }
  // If crossorigin attribute is missing, always resolve with undefined.
  return Promise.resolve(undefined);
}
