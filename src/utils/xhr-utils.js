import {devAssert, userAssert} from '#core/assert';
import {fromIterator, isArray} from '#core/types/array';
import {isObject, map} from '#core/types/object';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {user} from '#utils/log';

import {isFormDataWrapper} from '../form-data-wrapper';
import {getMode} from '../mode';
import {
  getCorsUrl,
  getWinOrigin,
  isProxyOrigin,
  parseUrlDeprecated,
  serializeQueryString,
} from '../url';

/** @private @const {!Array<string>} */
const allowedMethods_ = ['GET', 'POST'];

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
 * not used in AMP runtime. `init.body` can also be a string
 * (application/x-www-form-urlencoded) but that doesn't require serialization.
 *
 * @param {string} input The URL of the XHR to convert to structured
 *     cloneable.
 * @param {!FetchInitDef} init The options of the XHR to convert to structured
 *     cloneable.
 * @return {{input: string, init: !FetchInitDef}} The serialized structurally-
 *     cloneable request.
 */
export function toStructuredCloneable(input, init) {
  const newInit = /** @type {!FetchInitDef} */ ({...init});
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
 * @return {!Response} The deserialized regular response.
 * @private
 */
export function fromStructuredCloneable(response, responseType) {
  userAssert(isObject(response), 'Object expected: %s', response);

  const isDocumentType = responseType == 'document';
  if (!isDocumentType) {
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
      /** @type {!Array} */ (init.headers).forEach((entry) => {
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
 */
export function getViewerInterceptResponse(win, ampdocSingle, input, init) {
  if (!ampdocSingle) {
    return Promise.resolve();
  }

  const whenUnblocked = init.prerenderSafe
    ? Promise.resolve()
    : ampdocSingle.whenFirstVisible();
  const viewer = Services.viewerForDoc(ampdocSingle);
  const urlIsProxy = isProxyOrigin(input);
  const viewerCanIntercept = viewer.hasCapability('xhrInterceptor');
  const interceptorDisabledForLocalDev =
    init.bypassInterceptorForDev && getMode(win).localDev;
  if (urlIsProxy || !viewerCanIntercept || interceptorDisabledForLocalDev) {
    return whenUnblocked;
  }

  const htmlElement = ampdocSingle.getRootNode().documentElement;
  const docOptedIn = htmlElement.hasAttribute('allow-xhr-interception');
  if (!docOptedIn) {
    return whenUnblocked;
  }

  return whenUnblocked
    .then(() => viewer.isTrustedViewer())
    .then((viewerTrusted) => {
      if (
        !(
          viewerTrusted ||
          getMode(win).localDev ||
          isExperimentOn(win, 'untrusted-xhr-interception')
        )
      ) {
        return;
      }
      const messagePayload = {
        'originalRequest': toStructuredCloneable(input, init),
      };
      return viewer
        .sendMessageAwaitResponse('xhr', messagePayload)
        .then((response) =>
          fromStructuredCloneable(response, init.responseType)
        );
    });
}

/**
 * Sets up URL based on ampCors
 * @param {!Window} win
 * @param {string} input
 * @param {!FetchInitDef} init The options of the XHR which may get
 * intercepted.
 * @return {string}
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
  init.headers = init.headers || {};
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
  init = init || {};
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
      allowedJsonBodyTypes_.some((test) => test(fetchInit.body)),
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
 * If 415 or in the 5xx range.
 * @param {number} status
 * @return {boolean}
 */
function isRetriable(status) {
  return status == 415 || (status >= 500 && status < 600);
}

/**
 * Returns the response if successful or otherwise throws an error.
 * @param {!Response} response
 * @return {!Promise<!Response>}
 */
export function assertSuccess(response) {
  return new Promise((resolve) => {
    if (response.ok) {
      return resolve(response);
    }

    const {status} = response;
    const err = user().createError(`HTTP error ${status}`);
    err['retriable'] = isRetriable(status);
    // TODO(@jridgewell, #9448): Callers who need the response should
    // skip processing.
    err['response'] = response;
    throw err;
  });
}
