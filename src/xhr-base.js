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

import {Services} from './services';
import {dev, user} from './log';
import {dict} from './utils/object';
import {fromIterator} from './utils/array';
import {
  getCorsUrl,
  getSourceOrigin,
  getWinOrigin,
  isProxyOrigin,
  parseUrlDeprecated,
} from './url';
import {getMode} from './mode';
import {isFormDataWrapper} from './form-data-wrapper';
import {isObject} from './types';

/** @private @const {string} */
export const ALLOW_SOURCE_ORIGIN_HEADER =
    'AMP-Access-Control-Allow-Source-Origin';

/** @private @const {!Array<string>} */
const allowedMethods_ = ['GET', 'POST'];

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

export class XhrBase {
  /**
   * Creates an instance of XHRUtils.
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
    /** @private {?./service/ampdoc-impl.AmpDoc} */

    this.ampdocSingle_ =
        ampdocService.isSingleDoc() ? ampdocService.getAmpDoc() : null;
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
   * @protected
   * @return {!Promise<*>}
   */
  fetchAmpCors_(input, init = {}) {
    dev().assert(typeof input == 'string', 'Only URL supported: %s', input);

    // In particular, Firefox does not tolerate `null` values for
    // `credentials`.
    const creds = init.credentials;

    dev().assert(
        creds === undefined || creds == 'include' || creds == 'omit',
        'Only credentials=include|omit support: %s', creds);
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
    const targetOrigin = parseUrlDeprecated(input).origin;
    if (currentOrigin == targetOrigin) {
      init['headers'] = init['headers'] || {};
      init['headers']['AMP-Same-Origin'] = 'true';
    }
    // In edge a `TypeMismatchError` is thrown when body is set to null.
    dev().assert(init.body !== null, 'fetch `body` can not be `null`');
    return this.fetchFromNetwork_(input, init).then(response => {
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
   *
   * @param {string} unusedInput
   * @param {!FetchInitDef} unusedInit
   * @return {!Promise}
   * @protected
   */
  fetchFromNetwork_(unusedInput, unusedInit) {
    throw new Error('Fetch from network not is not implemented');
  }

  /**
   * Intercepts the XHR and proxies it through the viewer if necessary.
   *
   * XHRs are intercepted if all of the following are true:
   * - The AMP doc is in single doc mode.
   * - The requested resource is not a 1p request.
   * - The viewer has the `xhrInterceptor` capability.
   * - The Viewer is a trusted viewer or AMP is currently in developement mode.
   * - The AMP doc is opted-in for XHR interception (`<html>` tag has
   *   `allow-xhr-interception` attribute).
   *
   * @param {string} input The URL of the XHR which may get intercepted.
   * @param {!FetchInitDef} init The options of the XHR which may get
   *     intercepted.
   * @protected
   * @return {!Promise<!Response|undefined>}
   *     A response returned by the interceptor if XHR is intercepted or
   *     `Promise<undefined>` otherwise.
   */
  maybeIntercept_(input, init) {
    if (!this.ampdocSingle_) {
      return Promise.resolve();
    }
    const viewer = Services.viewerForDoc(this.ampdocSingle_);
    const whenFirstVisible = viewer.whenFirstVisible();
    if (isProxyOrigin(input) || !viewer.hasCapability('xhrInterceptor')) {
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
            this.fromStructuredCloneable_(response));
    });
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
   * @return {*} The deserialized regular response.
   * @protected
   */
  fromStructuredCloneable_(response) {
    dev().assert(this.win.Response, 'Response object not present on window');
    user().assert(isObject(response), 'Object expected: %s', response);
    return new this.win.Response(response['body'], response['init']);
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
    return getCorsUrl(this.win, url);
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
  init.method = normalizeMethod(init.method);
  init.headers = init.headers || {};
  if (opt_accept) {
    init.headers['Accept'] = opt_accept;
  }
  return init;
}

/**
 * Normalized method name by uppercasing.
 * @param {string|undefined} method
 * @return {string}
 */
function normalizeMethod(method) {
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
 * If 415 or in the 5xx range.
 * @param {number} status
 */
function isRetriable(status) {
  return status == 415 || (status >= 500 && status < 600);
}

/**
 * Returns the response if successful or otherwise throws an error.
 * @param {!Response} response
 * @return {!Promise<*>}  TODO(prateekbh): change * to response after fetch polyfill.
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
