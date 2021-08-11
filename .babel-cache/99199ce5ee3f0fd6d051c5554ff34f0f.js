import { resolvedPromise as _resolvedPromise2 } from "./../core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../core/data-structures/promise";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

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
import { devAssert, userAssert } from "../core/assert";
import { fromIterator, isArray } from "../core/types/array";
import { dict, isObject, map } from "../core/types/object";
import { isExperimentOn } from "../experiments";
import { Services } from "../service";
import { isFormDataWrapper } from "../form-data-wrapper";
import { user } from "../log";
import { getMode } from "../mode";
import { getCorsUrl, getWinOrigin, isProxyOrigin, parseUrlDeprecated, serializeQueryString } from "../url";

/** @private @const {!Array<string>} */
var allowedMethods_ = ['GET', 'POST'];

/** @private @const {!Array<function(*):boolean>} */
var allowedJsonBodyTypes_ = [isArray, isObject];

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
 */
export function toStructuredCloneable(input, init) {
  var newInit =
  /** @type {!FetchInitDef} */
  _extends({}, init);

  if (isFormDataWrapper(init.body)) {
    var wrapper =
    /** @type {!FormDataWrapperInterface} */
    init.body;
    newInit.headers['Content-Type'] = 'multipart/form-data;charset=utf-8';
    newInit.body = fromIterator(wrapper.entries());
  }

  return {
    input: input,
    init: newInit
  };
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
  var isDocumentType = responseType == 'document';

  if (!isDocumentType) {
    // Use native `Response` type if available for performance. If response
    // type is `document`, we must fall back to `FetchResponse` polyfill
    // because callers would then rely on the `responseXML` property being
    // present, which is not supported by the Response type.
    return new Response(response['body'], response['init']);
  }

  var lowercasedHeaders = map();
  var data = {
    status: 200,
    statusText: 'OK',

    /**
     * @param {string} name
     * @return {string}
     */
    getResponseHeader: function getResponseHeader(name) {
      return lowercasedHeaders[String(name).toLowerCase()] || null;
    }
  };

  if (response['init']) {
    var init = response['init'];

    if (isArray(init.headers)) {
      /** @type {!Array} */
      init.headers.forEach(function (entry) {
        var headerName = entry[0];
        var headerValue = entry[1];
        lowercasedHeaders[String(headerName).toLowerCase()] = String(headerValue);
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
    return _resolvedPromise();
  }

  var whenUnblocked = init.prerenderSafe ? _resolvedPromise2() : ampdocSingle.whenFirstVisible();
  var viewer = Services.viewerForDoc(ampdocSingle);
  var urlIsProxy = isProxyOrigin(input);
  var viewerCanIntercept = viewer.hasCapability('xhrInterceptor');
  var interceptorDisabledForLocalDev = init.bypassInterceptorForDev && getMode(win).localDev;

  if (urlIsProxy || !viewerCanIntercept || interceptorDisabledForLocalDev) {
    return whenUnblocked;
  }

  var htmlElement = ampdocSingle.getRootNode().documentElement;
  var docOptedIn = htmlElement.hasAttribute('allow-xhr-interception');

  if (!docOptedIn) {
    return whenUnblocked;
  }

  return whenUnblocked.then(function () {
    return viewer.isTrustedViewer();
  }).then(function (viewerTrusted) {
    if (!(viewerTrusted || getMode(win).localDev || isExperimentOn(win, 'untrusted-xhr-interception'))) {
      return;
    }

    var messagePayload = dict({
      'originalRequest': toStructuredCloneable(input, init)
    });
    return viewer.sendMessageAwaitResponse('xhr', messagePayload).then(function (response) {
      return fromStructuredCloneable(response, init.responseType);
    });
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
  var init = opt_init || {};
  // In particular, Firefox does not tolerate `null` values for
  // `credentials`.
  var creds = init.credentials;
  devAssert(creds === undefined || creds == 'include' || creds == 'omit', 'Only credentials=include|omit support: %s', creds);
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
  init = init || {};
  // For some same origin requests, add AMP-Same-Origin: true header to allow
  // publishers to validate that this request came from their own origin.
  var currentOrigin = getWinOrigin(win);
  var targetOrigin = parseUrlDeprecated(input).origin;

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
  var fetchInit = setupInit(init, 'application/json');

  if (fetchInit.method == 'POST' && !isFormDataWrapper(fetchInit.body)) {
    // Assume JSON strict mode where only objects or arrays are allowed
    // as body.
    devAssert(allowedJsonBodyTypes_.some(function (test) {
      return test(fetchInit.body);
    }), 'body must be of type object or array. %s', fetchInit.body);
    // Content should be 'text/plain' to avoid CORS preflight.
    fetchInit.headers['Content-Type'] = fetchInit.headers['Content-Type'] || 'text/plain;charset=utf-8';
    var headerContentType = fetchInit.headers['Content-Type'];

    // Cast is valid, because we checked that it is not form data above.
    if (headerContentType === 'application/x-www-form-urlencoded') {
      fetchInit.body = serializeQueryString(
      /** @type {!JsonObject} */
      fetchInit.body);
    } else {
      fetchInit.body = JSON.stringify(
      /** @type {!JsonObject} */
      fetchInit.body);
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
  devAssert(allowedMethods_.includes(method), 'Only one of %s is currently allowed. Got %s', allowedMethods_.join(', '), method);
  return method;
}

/**
 * If 415 or in the 5xx range.
 * @param {number} status
 * @return {boolean}
 */
function isRetriable(status) {
  return status == 415 || status >= 500 && status < 600;
}

/**
 * Returns the response if successful or otherwise throws an error.
 * @param {!Response} response
 * @return {!Promise<!Response>}
 */
export function assertSuccess(response) {
  return new Promise(function (resolve) {
    if (response.ok) {
      return resolve(response);
    }

    var status = response.status;
    var err = user().createError("HTTP error " + status);
    err['retriable'] = isRetriable(status);
    // TODO(@jridgewell, #9448): Callers who need the response should
    // skip processing.
    err['response'] = response;
    throw err;
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInhoci11dGlscy5qcyJdLCJuYW1lcyI6WyJkZXZBc3NlcnQiLCJ1c2VyQXNzZXJ0IiwiZnJvbUl0ZXJhdG9yIiwiaXNBcnJheSIsImRpY3QiLCJpc09iamVjdCIsIm1hcCIsImlzRXhwZXJpbWVudE9uIiwiU2VydmljZXMiLCJpc0Zvcm1EYXRhV3JhcHBlciIsInVzZXIiLCJnZXRNb2RlIiwiZ2V0Q29yc1VybCIsImdldFdpbk9yaWdpbiIsImlzUHJveHlPcmlnaW4iLCJwYXJzZVVybERlcHJlY2F0ZWQiLCJzZXJpYWxpemVRdWVyeVN0cmluZyIsImFsbG93ZWRNZXRob2RzXyIsImFsbG93ZWRKc29uQm9keVR5cGVzXyIsInRvU3RydWN0dXJlZENsb25lYWJsZSIsImlucHV0IiwiaW5pdCIsIm5ld0luaXQiLCJib2R5Iiwid3JhcHBlciIsImhlYWRlcnMiLCJlbnRyaWVzIiwiZnJvbVN0cnVjdHVyZWRDbG9uZWFibGUiLCJyZXNwb25zZSIsInJlc3BvbnNlVHlwZSIsImlzRG9jdW1lbnRUeXBlIiwiUmVzcG9uc2UiLCJsb3dlcmNhc2VkSGVhZGVycyIsImRhdGEiLCJzdGF0dXMiLCJzdGF0dXNUZXh0IiwiZ2V0UmVzcG9uc2VIZWFkZXIiLCJuYW1lIiwiU3RyaW5nIiwidG9Mb3dlckNhc2UiLCJmb3JFYWNoIiwiZW50cnkiLCJoZWFkZXJOYW1lIiwiaGVhZGVyVmFsdWUiLCJwYXJzZUludCIsImdldFZpZXdlckludGVyY2VwdFJlc3BvbnNlIiwid2luIiwiYW1wZG9jU2luZ2xlIiwid2hlblVuYmxvY2tlZCIsInByZXJlbmRlclNhZmUiLCJ3aGVuRmlyc3RWaXNpYmxlIiwidmlld2VyIiwidmlld2VyRm9yRG9jIiwidXJsSXNQcm94eSIsInZpZXdlckNhbkludGVyY2VwdCIsImhhc0NhcGFiaWxpdHkiLCJpbnRlcmNlcHRvckRpc2FibGVkRm9yTG9jYWxEZXYiLCJieXBhc3NJbnRlcmNlcHRvckZvckRldiIsImxvY2FsRGV2IiwiaHRtbEVsZW1lbnQiLCJnZXRSb290Tm9kZSIsImRvY3VtZW50RWxlbWVudCIsImRvY09wdGVkSW4iLCJoYXNBdHRyaWJ1dGUiLCJ0aGVuIiwiaXNUcnVzdGVkVmlld2VyIiwidmlld2VyVHJ1c3RlZCIsIm1lc3NhZ2VQYXlsb2FkIiwic2VuZE1lc3NhZ2VBd2FpdFJlc3BvbnNlIiwic2V0dXBJbnB1dCIsImFtcENvcnMiLCJzZXR1cEluaXQiLCJvcHRfaW5pdCIsIm9wdF9hY2NlcHQiLCJjcmVkcyIsImNyZWRlbnRpYWxzIiwidW5kZWZpbmVkIiwibWV0aG9kIiwibm9ybWFsaXplTWV0aG9kXyIsInNldHVwQU1QQ29ycyIsImN1cnJlbnRPcmlnaW4iLCJ0YXJnZXRPcmlnaW4iLCJvcmlnaW4iLCJzZXR1cEpzb25GZXRjaEluaXQiLCJmZXRjaEluaXQiLCJzb21lIiwidGVzdCIsImhlYWRlckNvbnRlbnRUeXBlIiwiSlNPTiIsInN0cmluZ2lmeSIsInRvVXBwZXJDYXNlIiwiaW5jbHVkZXMiLCJqb2luIiwiaXNSZXRyaWFibGUiLCJhc3NlcnRTdWNjZXNzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJvayIsImVyciIsImNyZWF0ZUVycm9yIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFNBQVIsRUFBbUJDLFVBQW5CO0FBQ0EsU0FBUUMsWUFBUixFQUFzQkMsT0FBdEI7QUFDQSxTQUFRQyxJQUFSLEVBQWNDLFFBQWQsRUFBd0JDLEdBQXhCO0FBRUEsU0FBUUMsY0FBUjtBQUVBLFNBQVFDLFFBQVI7QUFFQSxTQUFRQyxpQkFBUjtBQUNBLFNBQVFDLElBQVI7QUFDQSxTQUFRQyxPQUFSO0FBQ0EsU0FDRUMsVUFERixFQUVFQyxZQUZGLEVBR0VDLGFBSEYsRUFJRUMsa0JBSkYsRUFLRUMsb0JBTEY7O0FBUUE7QUFDQSxJQUFNQyxlQUFlLEdBQUcsQ0FBQyxLQUFELEVBQVEsTUFBUixDQUF4Qjs7QUFFQTtBQUNBLElBQU1DLHFCQUFxQixHQUFHLENBQUNmLE9BQUQsRUFBVUUsUUFBVixDQUE5Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNjLHFCQUFULENBQStCQyxLQUEvQixFQUFzQ0MsSUFBdEMsRUFBNEM7QUFDakQsTUFBTUMsT0FBTztBQUFHO0FBQUgsZUFBcUNELElBQXJDLENBQWI7O0FBQ0EsTUFBSVosaUJBQWlCLENBQUNZLElBQUksQ0FBQ0UsSUFBTixDQUFyQixFQUFrQztBQUNoQyxRQUFNQyxPQUFPO0FBQUc7QUFBMENILElBQUFBLElBQUksQ0FBQ0UsSUFBL0Q7QUFDQUQsSUFBQUEsT0FBTyxDQUFDRyxPQUFSLENBQWdCLGNBQWhCLElBQWtDLG1DQUFsQztBQUNBSCxJQUFBQSxPQUFPLENBQUNDLElBQVIsR0FBZXJCLFlBQVksQ0FBQ3NCLE9BQU8sQ0FBQ0UsT0FBUixFQUFELENBQTNCO0FBQ0Q7O0FBQ0QsU0FBTztBQUFDTixJQUFBQSxLQUFLLEVBQUxBLEtBQUQ7QUFBUUMsSUFBQUEsSUFBSSxFQUFFQztBQUFkLEdBQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTSyx1QkFBVCxDQUFpQ0MsUUFBakMsRUFBMkNDLFlBQTNDLEVBQXlEO0FBQzlENUIsRUFBQUEsVUFBVSxDQUFDSSxRQUFRLENBQUN1QixRQUFELENBQVQsRUFBcUIscUJBQXJCLEVBQTRDQSxRQUE1QyxDQUFWO0FBRUEsTUFBTUUsY0FBYyxHQUFHRCxZQUFZLElBQUksVUFBdkM7O0FBQ0EsTUFBSSxDQUFDQyxjQUFMLEVBQXFCO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBTyxJQUFJQyxRQUFKLENBQWFILFFBQVEsQ0FBQyxNQUFELENBQXJCLEVBQStCQSxRQUFRLENBQUMsTUFBRCxDQUF2QyxDQUFQO0FBQ0Q7O0FBRUQsTUFBTUksaUJBQWlCLEdBQUcxQixHQUFHLEVBQTdCO0FBQ0EsTUFBTTJCLElBQUksR0FBRztBQUNYQyxJQUFBQSxNQUFNLEVBQUUsR0FERztBQUVYQyxJQUFBQSxVQUFVLEVBQUUsSUFGRDs7QUFHWDtBQUNKO0FBQ0E7QUFDQTtBQUNJQyxJQUFBQSxpQkFQVyw2QkFPT0MsSUFQUCxFQU9hO0FBQ3RCLGFBQU9MLGlCQUFpQixDQUFDTSxNQUFNLENBQUNELElBQUQsQ0FBTixDQUFhRSxXQUFiLEVBQUQsQ0FBakIsSUFBaUQsSUFBeEQ7QUFDRDtBQVRVLEdBQWI7O0FBWUEsTUFBSVgsUUFBUSxDQUFDLE1BQUQsQ0FBWixFQUFzQjtBQUNwQixRQUFNUCxJQUFJLEdBQUdPLFFBQVEsQ0FBQyxNQUFELENBQXJCOztBQUNBLFFBQUl6QixPQUFPLENBQUNrQixJQUFJLENBQUNJLE9BQU4sQ0FBWCxFQUEyQjtBQUN6QjtBQUF1QkosTUFBQUEsSUFBSSxDQUFDSSxPQUFOLENBQWVlLE9BQWYsQ0FBdUIsVUFBQ0MsS0FBRCxFQUFXO0FBQ3RELFlBQU1DLFVBQVUsR0FBR0QsS0FBSyxDQUFDLENBQUQsQ0FBeEI7QUFDQSxZQUFNRSxXQUFXLEdBQUdGLEtBQUssQ0FBQyxDQUFELENBQXpCO0FBQ0FULFFBQUFBLGlCQUFpQixDQUFDTSxNQUFNLENBQUNJLFVBQUQsQ0FBTixDQUFtQkgsV0FBbkIsRUFBRCxDQUFqQixHQUNFRCxNQUFNLENBQUNLLFdBQUQsQ0FEUjtBQUVELE9BTHFCO0FBTXZCOztBQUNELFFBQUl0QixJQUFJLENBQUNhLE1BQVQsRUFBaUI7QUFDZkQsTUFBQUEsSUFBSSxDQUFDQyxNQUFMLEdBQWNVLFFBQVEsQ0FBQ3ZCLElBQUksQ0FBQ2EsTUFBTixFQUFjLEVBQWQsQ0FBdEI7QUFDRDs7QUFDRCxRQUFJYixJQUFJLENBQUNjLFVBQVQsRUFBcUI7QUFDbkJGLE1BQUFBLElBQUksQ0FBQ0UsVUFBTCxHQUFrQkcsTUFBTSxDQUFDakIsSUFBSSxDQUFDYyxVQUFOLENBQXhCO0FBQ0Q7QUFDRjs7QUFFRCxTQUFPLElBQUlKLFFBQUosQ0FBYUgsUUFBUSxDQUFDLE1BQUQsQ0FBUixHQUFtQlUsTUFBTSxDQUFDVixRQUFRLENBQUMsTUFBRCxDQUFULENBQXpCLEdBQThDLEVBQTNELEVBQStESyxJQUEvRCxDQUFQO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU1ksMEJBQVQsQ0FBb0NDLEdBQXBDLEVBQXlDQyxZQUF6QyxFQUF1RDNCLEtBQXZELEVBQThEQyxJQUE5RCxFQUFvRTtBQUN6RSxNQUFJLENBQUMwQixZQUFMLEVBQW1CO0FBQ2pCLFdBQU8sa0JBQVA7QUFDRDs7QUFFRCxNQUFNQyxhQUFhLEdBQUczQixJQUFJLENBQUM0QixhQUFMLEdBQ2xCLG1CQURrQixHQUVsQkYsWUFBWSxDQUFDRyxnQkFBYixFQUZKO0FBR0EsTUFBTUMsTUFBTSxHQUFHM0MsUUFBUSxDQUFDNEMsWUFBVCxDQUFzQkwsWUFBdEIsQ0FBZjtBQUNBLE1BQU1NLFVBQVUsR0FBR3ZDLGFBQWEsQ0FBQ00sS0FBRCxDQUFoQztBQUNBLE1BQU1rQyxrQkFBa0IsR0FBR0gsTUFBTSxDQUFDSSxhQUFQLENBQXFCLGdCQUFyQixDQUEzQjtBQUNBLE1BQU1DLDhCQUE4QixHQUNsQ25DLElBQUksQ0FBQ29DLHVCQUFMLElBQWdDOUMsT0FBTyxDQUFDbUMsR0FBRCxDQUFQLENBQWFZLFFBRC9DOztBQUVBLE1BQUlMLFVBQVUsSUFBSSxDQUFDQyxrQkFBZixJQUFxQ0UsOEJBQXpDLEVBQXlFO0FBQ3ZFLFdBQU9SLGFBQVA7QUFDRDs7QUFFRCxNQUFNVyxXQUFXLEdBQUdaLFlBQVksQ0FBQ2EsV0FBYixHQUEyQkMsZUFBL0M7QUFDQSxNQUFNQyxVQUFVLEdBQUdILFdBQVcsQ0FBQ0ksWUFBWixDQUF5Qix3QkFBekIsQ0FBbkI7O0FBQ0EsTUFBSSxDQUFDRCxVQUFMLEVBQWlCO0FBQ2YsV0FBT2QsYUFBUDtBQUNEOztBQUVELFNBQU9BLGFBQWEsQ0FDakJnQixJQURJLENBQ0M7QUFBQSxXQUFNYixNQUFNLENBQUNjLGVBQVAsRUFBTjtBQUFBLEdBREQsRUFFSkQsSUFGSSxDQUVDLFVBQUNFLGFBQUQsRUFBbUI7QUFDdkIsUUFDRSxFQUNFQSxhQUFhLElBQ2J2RCxPQUFPLENBQUNtQyxHQUFELENBQVAsQ0FBYVksUUFEYixJQUVBbkQsY0FBYyxDQUFDdUMsR0FBRCxFQUFNLDRCQUFOLENBSGhCLENBREYsRUFNRTtBQUNBO0FBQ0Q7O0FBQ0QsUUFBTXFCLGNBQWMsR0FBRy9ELElBQUksQ0FBQztBQUMxQix5QkFBbUJlLHFCQUFxQixDQUFDQyxLQUFELEVBQVFDLElBQVI7QUFEZCxLQUFELENBQTNCO0FBR0EsV0FBTzhCLE1BQU0sQ0FDVmlCLHdCQURJLENBQ3FCLEtBRHJCLEVBQzRCRCxjQUQ1QixFQUVKSCxJQUZJLENBRUMsVUFBQ3BDLFFBQUQ7QUFBQSxhQUNKRCx1QkFBdUIsQ0FBQ0MsUUFBRCxFQUFXUCxJQUFJLENBQUNRLFlBQWhCLENBRG5CO0FBQUEsS0FGRCxDQUFQO0FBS0QsR0FwQkksQ0FBUDtBQXFCRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTd0MsVUFBVCxDQUFvQnZCLEdBQXBCLEVBQXlCMUIsS0FBekIsRUFBZ0NDLElBQWhDLEVBQXNDO0FBQzNDckIsRUFBQUEsU0FBUyxDQUFDLE9BQU9vQixLQUFQLElBQWdCLFFBQWpCLEVBQTJCLHdCQUEzQixFQUFxREEsS0FBckQsQ0FBVDs7QUFDQSxNQUFJQyxJQUFJLENBQUNpRCxPQUFMLEtBQWlCLEtBQXJCLEVBQTRCO0FBQzFCbEQsSUFBQUEsS0FBSyxHQUFHUixVQUFVLENBQUNrQyxHQUFELEVBQU0xQixLQUFOLENBQWxCO0FBQ0Q7O0FBQ0QsU0FBT0EsS0FBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTbUQsU0FBVCxDQUFtQkMsUUFBbkIsRUFBNkJDLFVBQTdCLEVBQXlDO0FBQzlDLE1BQU1wRCxJQUFJLEdBQUdtRCxRQUFRLElBQUksRUFBekI7QUFFQTtBQUNBO0FBQ0EsTUFBTUUsS0FBSyxHQUFHckQsSUFBSSxDQUFDc0QsV0FBbkI7QUFDQTNFLEVBQUFBLFNBQVMsQ0FDUDBFLEtBQUssS0FBS0UsU0FBVixJQUF1QkYsS0FBSyxJQUFJLFNBQWhDLElBQTZDQSxLQUFLLElBQUksTUFEL0MsRUFFUCwyQ0FGTyxFQUdQQSxLQUhPLENBQVQ7QUFNQXJELEVBQUFBLElBQUksQ0FBQ3dELE1BQUwsR0FBY0MsZ0JBQWdCLENBQUN6RCxJQUFJLENBQUN3RCxNQUFOLENBQTlCO0FBQ0F4RCxFQUFBQSxJQUFJLENBQUNJLE9BQUwsR0FBZUosSUFBSSxDQUFDSSxPQUFMLElBQWdCckIsSUFBSSxDQUFDLEVBQUQsQ0FBbkM7O0FBQ0EsTUFBSXFFLFVBQUosRUFBZ0I7QUFDZHBELElBQUFBLElBQUksQ0FBQ0ksT0FBTCxDQUFhLFFBQWIsSUFBeUJnRCxVQUF6QjtBQUNEOztBQUVEO0FBQ0F6RSxFQUFBQSxTQUFTLENBQUNxQixJQUFJLENBQUNFLElBQUwsS0FBYyxJQUFmLEVBQXFCLGdDQUFyQixDQUFUO0FBRUEsU0FBT0YsSUFBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVMwRCxZQUFULENBQXNCakMsR0FBdEIsRUFBMkIxQixLQUEzQixFQUFrQ0MsSUFBbEMsRUFBd0M7QUFDN0NBLEVBQUFBLElBQUksR0FBR0EsSUFBSSxJQUFJLEVBQWY7QUFDQTtBQUNBO0FBQ0EsTUFBTTJELGFBQWEsR0FBR25FLFlBQVksQ0FBQ2lDLEdBQUQsQ0FBbEM7QUFDQSxNQUFNbUMsWUFBWSxHQUFHbEUsa0JBQWtCLENBQUNLLEtBQUQsQ0FBbEIsQ0FBMEI4RCxNQUEvQzs7QUFDQSxNQUFJRixhQUFhLElBQUlDLFlBQXJCLEVBQW1DO0FBQ2pDNUQsSUFBQUEsSUFBSSxDQUFDLFNBQUQsQ0FBSixHQUFrQkEsSUFBSSxDQUFDLFNBQUQsQ0FBSixJQUFtQixFQUFyQztBQUNBQSxJQUFBQSxJQUFJLENBQUMsU0FBRCxDQUFKLENBQWdCLGlCQUFoQixJQUFxQyxNQUFyQztBQUNEOztBQUNELFNBQU9BLElBQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBUzhELGtCQUFULENBQTRCOUQsSUFBNUIsRUFBa0M7QUFDdkMsTUFBTStELFNBQVMsR0FBR2IsU0FBUyxDQUFDbEQsSUFBRCxFQUFPLGtCQUFQLENBQTNCOztBQUNBLE1BQUkrRCxTQUFTLENBQUNQLE1BQVYsSUFBb0IsTUFBcEIsSUFBOEIsQ0FBQ3BFLGlCQUFpQixDQUFDMkUsU0FBUyxDQUFDN0QsSUFBWCxDQUFwRCxFQUFzRTtBQUNwRTtBQUNBO0FBQ0F2QixJQUFBQSxTQUFTLENBQ1BrQixxQkFBcUIsQ0FBQ21FLElBQXRCLENBQTJCLFVBQUNDLElBQUQ7QUFBQSxhQUFVQSxJQUFJLENBQUNGLFNBQVMsQ0FBQzdELElBQVgsQ0FBZDtBQUFBLEtBQTNCLENBRE8sRUFFUCwwQ0FGTyxFQUdQNkQsU0FBUyxDQUFDN0QsSUFISCxDQUFUO0FBTUE7QUFDQTZELElBQUFBLFNBQVMsQ0FBQzNELE9BQVYsQ0FBa0IsY0FBbEIsSUFDRTJELFNBQVMsQ0FBQzNELE9BQVYsQ0FBa0IsY0FBbEIsS0FBcUMsMEJBRHZDO0FBRUEsUUFBTThELGlCQUFpQixHQUFHSCxTQUFTLENBQUMzRCxPQUFWLENBQWtCLGNBQWxCLENBQTFCOztBQUNBO0FBQ0EsUUFBSThELGlCQUFpQixLQUFLLG1DQUExQixFQUErRDtBQUM3REgsTUFBQUEsU0FBUyxDQUFDN0QsSUFBVixHQUFpQlAsb0JBQW9CO0FBQ25DO0FBQTRCb0UsTUFBQUEsU0FBUyxDQUFDN0QsSUFESCxDQUFyQztBQUdELEtBSkQsTUFJTztBQUNMNkQsTUFBQUEsU0FBUyxDQUFDN0QsSUFBVixHQUFpQmlFLElBQUksQ0FBQ0MsU0FBTDtBQUNmO0FBQTRCTCxNQUFBQSxTQUFTLENBQUM3RCxJQUR2QixDQUFqQjtBQUdEO0FBQ0Y7O0FBQ0QsU0FBTzZELFNBQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTTixnQkFBVCxDQUEwQkQsTUFBMUIsRUFBa0M7QUFDaEMsTUFBSUEsTUFBTSxLQUFLRCxTQUFmLEVBQTBCO0FBQ3hCLFdBQU8sS0FBUDtBQUNEOztBQUNEQyxFQUFBQSxNQUFNLEdBQUdBLE1BQU0sQ0FBQ2EsV0FBUCxFQUFUO0FBQ0ExRixFQUFBQSxTQUFTLENBQ1BpQixlQUFlLENBQUMwRSxRQUFoQixDQUF5QmQsTUFBekIsQ0FETyxFQUVQLDZDQUZPLEVBR1A1RCxlQUFlLENBQUMyRSxJQUFoQixDQUFxQixJQUFyQixDQUhPLEVBSVBmLE1BSk8sQ0FBVDtBQU1BLFNBQU9BLE1BQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU2dCLFdBQVQsQ0FBcUIzRCxNQUFyQixFQUE2QjtBQUMzQixTQUFPQSxNQUFNLElBQUksR0FBVixJQUFrQkEsTUFBTSxJQUFJLEdBQVYsSUFBaUJBLE1BQU0sR0FBRyxHQUFuRDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVM0RCxhQUFULENBQXVCbEUsUUFBdkIsRUFBaUM7QUFDdEMsU0FBTyxJQUFJbUUsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBYTtBQUM5QixRQUFJcEUsUUFBUSxDQUFDcUUsRUFBYixFQUFpQjtBQUNmLGFBQU9ELE9BQU8sQ0FBQ3BFLFFBQUQsQ0FBZDtBQUNEOztBQUVELFFBQU9NLE1BQVAsR0FBaUJOLFFBQWpCLENBQU9NLE1BQVA7QUFDQSxRQUFNZ0UsR0FBRyxHQUFHeEYsSUFBSSxHQUFHeUYsV0FBUCxpQkFBaUNqRSxNQUFqQyxDQUFaO0FBQ0FnRSxJQUFBQSxHQUFHLENBQUMsV0FBRCxDQUFILEdBQW1CTCxXQUFXLENBQUMzRCxNQUFELENBQTlCO0FBQ0E7QUFDQTtBQUNBZ0UsSUFBQUEsR0FBRyxDQUFDLFVBQUQsQ0FBSCxHQUFrQnRFLFFBQWxCO0FBQ0EsVUFBTXNFLEdBQU47QUFDRCxHQVpNLENBQVA7QUFhRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTUgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge2RldkFzc2VydCwgdXNlckFzc2VydH0gZnJvbSAnI2NvcmUvYXNzZXJ0JztcbmltcG9ydCB7ZnJvbUl0ZXJhdG9yLCBpc0FycmF5fSBmcm9tICcjY29yZS90eXBlcy9hcnJheSc7XG5pbXBvcnQge2RpY3QsIGlzT2JqZWN0LCBtYXB9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5cbmltcG9ydCB7aXNFeHBlcmltZW50T259IGZyb20gJyNleHBlcmltZW50cyc7XG5cbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcblxuaW1wb3J0IHtpc0Zvcm1EYXRhV3JhcHBlcn0gZnJvbSAnLi4vZm9ybS1kYXRhLXdyYXBwZXInO1xuaW1wb3J0IHt1c2VyfSBmcm9tICcuLi9sb2cnO1xuaW1wb3J0IHtnZXRNb2RlfSBmcm9tICcuLi9tb2RlJztcbmltcG9ydCB7XG4gIGdldENvcnNVcmwsXG4gIGdldFdpbk9yaWdpbixcbiAgaXNQcm94eU9yaWdpbixcbiAgcGFyc2VVcmxEZXByZWNhdGVkLFxuICBzZXJpYWxpemVRdWVyeVN0cmluZyxcbn0gZnJvbSAnLi4vdXJsJztcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7IUFycmF5PHN0cmluZz59ICovXG5jb25zdCBhbGxvd2VkTWV0aG9kc18gPSBbJ0dFVCcsICdQT1NUJ107XG5cbi8qKiBAcHJpdmF0ZSBAY29uc3QgeyFBcnJheTxmdW5jdGlvbigqKTpib29sZWFuPn0gKi9cbmNvbnN0IGFsbG93ZWRKc29uQm9keVR5cGVzXyA9IFtpc0FycmF5LCBpc09iamVjdF07XG5cbi8qKlxuICogU2VyaWFsaXplcyBhIGZldGNoIHJlcXVlc3Qgc28gdGhhdCBpdCBjYW4gYmUgcGFzc2VkIHRvIGBwb3N0TWVzc2FnZSgpYCxcbiAqIGkuZS4sIGNhbiBiZSBjbG9uZWQgdXNpbmcgdGhlXG4gKiBbc3RydWN0dXJlZCBjbG9uZSBhbGdvcml0aG1dKGh0dHA6Ly9tZG4uaW8vU3RydWN0dXJlZF9jbG9uZV9hbGdvcml0aG0pLlxuICpcbiAqIFRoZSByZXF1ZXN0IGlzIHNlcmlhbGl6ZWQgaW4gdGhlIGZvbGxvd2luZyB3YXk6XG4gKlxuICogMS4gSWYgdGhlIGBpbml0LmJvZHlgIGlzIGEgYEZvcm1EYXRhYCwgc2V0IGNvbnRlbnQtdHlwZSBoZWFkZXIgdG9cbiAqIGBtdWx0aXBhcnQvZm9ybS1kYXRhYCBhbmQgdHJhbnNmb3JtIGBpbml0LmJvZHlgIGludG8gYW5cbiAqIGAhQXJyYXk8IUFycmF5PHN0cmluZz4+YCBob2xkaW5nIHRoZSBsaXN0IG9mIGZvcm0gZW50cmllcywgd2hlcmUgZWFjaFxuICogZWxlbWVudCBpbiB0aGUgYXJyYXkgaXMgYSBmb3JtIGVudHJ5IChrZXktdmFsdWUgcGFpcikgcmVwcmVzZW50ZWQgYXMgYVxuICogMi1lbGVtZW50IGFycmF5LlxuICpcbiAqIDIuIFJldHVybiBhIG5ldyBvYmplY3QgaGF2aW5nIHByb3BlcnRpZXMgYGlucHV0YCBhbmQgdGhlIHRyYW5zZm9ybWVkXG4gKiBgaW5pdGAuXG4gKlxuICogVGhlIHNlcmlhbGl6ZWQgcmVxdWVzdCBpcyBhc3N1bWVkIHRvIGJlIGRlLXNlcmlhbGl6ZWQgaW4gdGhlIGZvbGxvd2luZyB3YXk6XG4gKlxuICogMS5JZiBjb250ZW50LXR5cGUgaGVhZGVyIHN0YXJ0cyB3aXRoIGBtdWx0aXBhcnQvZm9ybS1kYXRhYFxuICogKGNhc2UtaW5zZW5zaXRpdmUpLCB0cmFuc2Zvcm0gdGhlIGVudHJ5IGFycmF5IGluIGBpbml0LmJvZHlgIGludG8gYVxuICogYEZvcm1EYXRhYCBvYmplY3QuXG4gKlxuICogMi4gUGFzcyBgaW5wdXRgIGFuZCB0cmFuc2Zvcm1lZCBgaW5pdGAgdG8gYGZldGNoYCAob3IgdGhlIGNvbnN0cnVjdG9yIG9mXG4gKiBgUmVxdWVzdGApLlxuICpcbiAqIEN1cnJlbnRseSBvbmx5IGBGb3JtRGF0YWAgdXNlZCBpbiBgaW5pdC5ib2R5YCBpcyBoYW5kbGVkIGFzIGl0J3MgdGhlIG9ubHlcbiAqIHR5cGUgYmVpbmcgdXNlZCBpbiBBTVAgcnVudGltZSB0aGF0IG5lZWRzIHNlcmlhbGl6YXRpb24uIFRoZSBgSGVhZGVyc2AgdHlwZVxuICogYWxzbyBuZWVkcyBzZXJpYWxpemF0aW9uLCBidXQgY2FsbGVycyBzaG91bGQgbm90IGJlIHBhc3NpbmcgYEhlYWRlcnNgXG4gKiBvYmplY3QgaW4gYGluaXRgLCBhcyB0aGF0IGZhaWxzIGBmZXRjaFBvbHlmaWxsYCBvbiBicm93c2VycyB0aGF0IGRvbid0XG4gKiBzdXBwb3J0IGZldGNoLiBTb21lIHNlcmlhbGl6YXRpb24tbmVlZGluZyB0eXBlcyBmb3IgYGluaXQuYm9keWAgc3VjaCBhc1xuICogYEFycmF5QnVmZmVyYCBhbmQgYEJsb2JgIGFyZSBhbHJlYWR5IHN1cHBvcnRlZCBieSB0aGUgc3RydWN0dXJlZCBjbG9uZVxuICogYWxnb3JpdGhtLiBPdGhlciBzZXJpYWxpemF0aW9uLW5lZWRpbmcgdHlwZXMgc3VjaCBhcyBgVVJMU2VhcmNoUGFyYW1zYFxuICogKHdoaWNoIGlzIG5vdCBzdXBwb3J0ZWQgaW4gSUUgYW5kIFNhZmFyaSkgYW5kIGBGZWRlcmF0ZWRDcmVkZW50aWFsc2AgYXJlXG4gKiBub3QgdXNlZCBpbiBBTVAgcnVudGltZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXQgVGhlIFVSTCBvZiB0aGUgWEhSIHRvIGNvbnZlcnQgdG8gc3RydWN0dXJlZFxuICogICAgIGNsb25lYWJsZS5cbiAqIEBwYXJhbSB7IUZldGNoSW5pdERlZn0gaW5pdCBUaGUgb3B0aW9ucyBvZiB0aGUgWEhSIHRvIGNvbnZlcnQgdG8gc3RydWN0dXJlZFxuICogICAgIGNsb25lYWJsZS5cbiAqIEByZXR1cm4ge3tpbnB1dDogc3RyaW5nLCBpbml0OiAhRmV0Y2hJbml0RGVmfX0gVGhlIHNlcmlhbGl6ZWQgc3RydWN0dXJhbGx5LVxuICogICAgIGNsb25lYWJsZSByZXF1ZXN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9TdHJ1Y3R1cmVkQ2xvbmVhYmxlKGlucHV0LCBpbml0KSB7XG4gIGNvbnN0IG5ld0luaXQgPSAvKiogQHR5cGUgeyFGZXRjaEluaXREZWZ9ICovICh7Li4uaW5pdH0pO1xuICBpZiAoaXNGb3JtRGF0YVdyYXBwZXIoaW5pdC5ib2R5KSkge1xuICAgIGNvbnN0IHdyYXBwZXIgPSAvKiogQHR5cGUgeyFGb3JtRGF0YVdyYXBwZXJJbnRlcmZhY2V9ICovIChpbml0LmJvZHkpO1xuICAgIG5ld0luaXQuaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSAnbXVsdGlwYXJ0L2Zvcm0tZGF0YTtjaGFyc2V0PXV0Zi04JztcbiAgICBuZXdJbml0LmJvZHkgPSBmcm9tSXRlcmF0b3Iod3JhcHBlci5lbnRyaWVzKCkpO1xuICB9XG4gIHJldHVybiB7aW5wdXQsIGluaXQ6IG5ld0luaXR9O1xufVxuXG4vKipcbiAqIERlLXNlcmlhbGl6ZXMgYSBmZXRjaCByZXNwb25zZSB0aGF0IHdhcyBtYWRlIHBvc3NpYmxlIHRvIGJlIHBhc3NlZCB0b1xuICogYHBvc3RNZXNzYWdlKClgLCBpLmUuLCBjYW4gYmUgY2xvbmVkIHVzaW5nIHRoZVxuICogW3N0cnVjdHVyZWQgY2xvbmUgYWxnb3JpdGhtXShodHRwOi8vbWRuLmlvL1N0cnVjdHVyZWRfY2xvbmVfYWxnb3JpdGhtKS5cbiAqXG4gKiBUaGUgcmVzcG9uc2UgaXMgYXNzdW1lZCB0byBiZSBzZXJpYWxpemVkIGluIHRoZSBmb2xsb3dpbmcgd2F5OlxuICpcbiAqIDEuIFRyYW5zZm9ybSB0aGUgZW50cmllcyBpbiB0aGUgaGVhZGVycyBvZiB0aGUgcmVzcG9uc2UgaW50byBhblxuICogYCFBcnJheTwhQXJyYXk8c3RyaW5nPj5gIGhvbGRpbmcgdGhlIGxpc3Qgb2YgaGVhZGVyIGVudHJpZXMsIHdoZXJlIGVhY2hcbiAqIGVsZW1lbnQgaW4gdGhlIGFycmF5IGlzIGEgaGVhZGVyIGVudHJ5IChrZXktdmFsdWUgcGFpcikgcmVwcmVzZW50ZWQgYXMgYVxuICogMi1lbGVtZW50IGFycmF5LiBUaGUgaGVhZGVyIGtleSBpcyBjYXNlLWluc2Vuc2l0aXZlLlxuICpcbiAqIDIuIEluY2x1ZGUgdGhlIGhlYWRlciBlbnRyeSBsaXN0IGFuZCBgc3RhdHVzYCBhbmQgYHN0YXR1c1RleHRgIHByb3BlcnRpZXNcbiAqIG9mIHRoZSByZXNwb25zZSBpbiBhcyBgaGVhZGVyc2AsIGBzdGF0dXNgIGFuZCBgc3RhdHVzVGV4dGAgcHJvcGVydGllcyBvZlxuICogYGluaXRgLlxuICpcbiAqIDMuIEluY2x1ZGUgdGhlIGJvZHkgb2YgdGhlIHJlc3BvbnNlIHNlcmlhbGl6ZWQgYXMgc3RyaW5nIGluIGBib2R5YC5cbiAqXG4gKiA0LiBSZXR1cm4gYSBuZXcgb2JqZWN0IGhhdmluZyBwcm9wZXJ0aWVzIGBib2R5YCBhbmQgYGluaXRgLlxuICpcbiAqIFRoZSByZXNwb25zZSBpcyBkZS1zZXJpYWxpemVkIGluIHRoZSBmb2xsb3dpbmcgd2F5OlxuICpcbiAqIDEuIElmIHRoZSBgUmVzcG9uc2VgIHR5cGUgaXMgc3VwcG9ydGVkIGFuZCBgcmVzcG9uc2VUeXBlYCBpcyBub3RcbiAqIGRvY3VtZW50LCBwYXNzIGBib2R5YCBhbmQgYGluaXRgIGRpcmVjdGx5IHRvIHRoZSBjb25zdHJ1Y3RvciBvZiBgUmVzcG9uc2VgLlxuICpcbiAqIDIuIE90aGVyd2lzZSwgcG9wdWxhdGUgYSBmYWtlIFhIUiBvYmplY3QgdG8gcGFzcyB0byBgRmV0Y2hSZXNwb25zZWAgYXMgaWZcbiAqIHRoZSByZXNwb25zZSBpcyByZXR1cm5lZCBieSB0aGUgZmV0Y2ggcG9seWZpbGwuXG4gKlxuICogMy4gSWYgYHJlc3BvbnNlVHlwZWAgaXMgYGRvY3VtZW50YCwgYWxzbyBwYXJzZSB0aGUgYm9keSBhbmQgcG9wdWxhdGVcbiAqIGByZXNwb25zZVhNTGAgYXMgYSBgRG9jdW1lbnRgIHR5cGUuXG4gKlxuICogQHBhcmFtIHtKc29uT2JqZWN0fHN0cmluZ3x1bmRlZmluZWR9IHJlc3BvbnNlIFRoZSBzdHJ1Y3R1cmFsbHktY2xvbmVhYmxlXG4gKiAgICAgcmVzcG9uc2UgdG8gY29udmVydCBiYWNrIHRvIGEgcmVndWxhciBSZXNwb25zZS5cbiAqIEBwYXJhbSB7c3RyaW5nfHVuZGVmaW5lZH0gcmVzcG9uc2VUeXBlIFRoZSBvcmlnaW5hbCByZXNwb25zZSB0eXBlIHVzZWQgdG9cbiAqICAgICBpbml0aWF0ZSB0aGUgWEhSLlxuICogQHJldHVybiB7IVJlc3BvbnNlfSBUaGUgZGVzZXJpYWxpemVkIHJlZ3VsYXIgcmVzcG9uc2UuXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVN0cnVjdHVyZWRDbG9uZWFibGUocmVzcG9uc2UsIHJlc3BvbnNlVHlwZSkge1xuICB1c2VyQXNzZXJ0KGlzT2JqZWN0KHJlc3BvbnNlKSwgJ09iamVjdCBleHBlY3RlZDogJXMnLCByZXNwb25zZSk7XG5cbiAgY29uc3QgaXNEb2N1bWVudFR5cGUgPSByZXNwb25zZVR5cGUgPT0gJ2RvY3VtZW50JztcbiAgaWYgKCFpc0RvY3VtZW50VHlwZSkge1xuICAgIC8vIFVzZSBuYXRpdmUgYFJlc3BvbnNlYCB0eXBlIGlmIGF2YWlsYWJsZSBmb3IgcGVyZm9ybWFuY2UuIElmIHJlc3BvbnNlXG4gICAgLy8gdHlwZSBpcyBgZG9jdW1lbnRgLCB3ZSBtdXN0IGZhbGwgYmFjayB0byBgRmV0Y2hSZXNwb25zZWAgcG9seWZpbGxcbiAgICAvLyBiZWNhdXNlIGNhbGxlcnMgd291bGQgdGhlbiByZWx5IG9uIHRoZSBgcmVzcG9uc2VYTUxgIHByb3BlcnR5IGJlaW5nXG4gICAgLy8gcHJlc2VudCwgd2hpY2ggaXMgbm90IHN1cHBvcnRlZCBieSB0aGUgUmVzcG9uc2UgdHlwZS5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKHJlc3BvbnNlWydib2R5J10sIHJlc3BvbnNlWydpbml0J10pO1xuICB9XG5cbiAgY29uc3QgbG93ZXJjYXNlZEhlYWRlcnMgPSBtYXAoKTtcbiAgY29uc3QgZGF0YSA9IHtcbiAgICBzdGF0dXM6IDIwMCxcbiAgICBzdGF0dXNUZXh0OiAnT0snLFxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldFJlc3BvbnNlSGVhZGVyKG5hbWUpIHtcbiAgICAgIHJldHVybiBsb3dlcmNhc2VkSGVhZGVyc1tTdHJpbmcobmFtZSkudG9Mb3dlckNhc2UoKV0gfHwgbnVsbDtcbiAgICB9LFxuICB9O1xuXG4gIGlmIChyZXNwb25zZVsnaW5pdCddKSB7XG4gICAgY29uc3QgaW5pdCA9IHJlc3BvbnNlWydpbml0J107XG4gICAgaWYgKGlzQXJyYXkoaW5pdC5oZWFkZXJzKSkge1xuICAgICAgLyoqIEB0eXBlIHshQXJyYXl9ICovIChpbml0LmhlYWRlcnMpLmZvckVhY2goKGVudHJ5KSA9PiB7XG4gICAgICAgIGNvbnN0IGhlYWRlck5hbWUgPSBlbnRyeVswXTtcbiAgICAgICAgY29uc3QgaGVhZGVyVmFsdWUgPSBlbnRyeVsxXTtcbiAgICAgICAgbG93ZXJjYXNlZEhlYWRlcnNbU3RyaW5nKGhlYWRlck5hbWUpLnRvTG93ZXJDYXNlKCldID1cbiAgICAgICAgICBTdHJpbmcoaGVhZGVyVmFsdWUpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChpbml0LnN0YXR1cykge1xuICAgICAgZGF0YS5zdGF0dXMgPSBwYXJzZUludChpbml0LnN0YXR1cywgMTApO1xuICAgIH1cbiAgICBpZiAoaW5pdC5zdGF0dXNUZXh0KSB7XG4gICAgICBkYXRhLnN0YXR1c1RleHQgPSBTdHJpbmcoaW5pdC5zdGF0dXNUZXh0KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFJlc3BvbnNlKHJlc3BvbnNlWydib2R5J10gPyBTdHJpbmcocmVzcG9uc2VbJ2JvZHknXSkgOiAnJywgZGF0YSk7XG59XG5cbi8qKlxuICogSW50ZXJjZXB0cyB0aGUgWEhSIGFuZCBwcm94aWVzIGl0IHRocm91Z2ggdGhlIHZpZXdlciBpZiBuZWNlc3NhcnkuXG4gKlxuICogWEhScyBhcmUgaW50ZXJjZXB0ZWQgaWYgYWxsIG9mIHRoZSBmb2xsb3dpbmcgYXJlIHRydWU6XG4gKiAtIFRoZSBBTVAgZG9jIGlzIGluIHNpbmdsZSBkb2MgbW9kZVxuICogLSBUaGUgcmVxdWVzdGVkIHJlc291cmNlIGlzIG5vdCBhIDFwIHJlcXVlc3QuXG4gKiAtIFRoZSB2aWV3ZXIgaGFzIHRoZSBgeGhySW50ZXJjZXB0b3JgIGNhcGFiaWxpdHlcbiAqIC0gVGhlIFZpZXdlciBpcyBhIHRydXN0ZWQgdmlld2VyIG9yIEFNUCBpcyBjdXJyZW50bHkgaW4gZGV2ZWxvcGVtZW50IG1vZGVcbiAqIC0gVGhlIEFNUCBkb2MgaXMgb3B0ZWQtaW4gZm9yIFhIUiBpbnRlcmNlcHRpb24gKGA8aHRtbD5gIHRhZyBoYXNcbiAqICAgYGFsbG93LXhoci1pbnRlcmNlcHRpb25gIGF0dHJpYnV0ZSlcbiAqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHs/Li4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1NpbmdsZVxuICogQHBhcmFtIHtzdHJpbmd9IGlucHV0IFRoZSBVUkwgb2YgdGhlIFhIUiB3aGljaCBtYXkgZ2V0IGludGVyY2VwdGVkLlxuICogQHBhcmFtIHshRmV0Y2hJbml0RGVmfSBpbml0IFRoZSBvcHRpb25zIG9mIHRoZSBYSFIgd2hpY2ggbWF5IGdldFxuICogICAgIGludGVyY2VwdGVkLlxuICogQHJldHVybiB7IVByb21pc2U8IVJlc3BvbnNlfHVuZGVmaW5lZD59XG4gKiAgICAgQSByZXNwb25zZSByZXR1cm5lZCBieSB0aGUgaW50ZXJjZXB0b3IgaWYgWEhSIGlzIGludGVyY2VwdGVkIG9yXG4gKiAgICAgYFByb21pc2U8dW5kZWZpbmVkPmAgb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Vmlld2VySW50ZXJjZXB0UmVzcG9uc2Uod2luLCBhbXBkb2NTaW5nbGUsIGlucHV0LCBpbml0KSB7XG4gIGlmICghYW1wZG9jU2luZ2xlKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgY29uc3Qgd2hlblVuYmxvY2tlZCA9IGluaXQucHJlcmVuZGVyU2FmZVxuICAgID8gUHJvbWlzZS5yZXNvbHZlKClcbiAgICA6IGFtcGRvY1NpbmdsZS53aGVuRmlyc3RWaXNpYmxlKCk7XG4gIGNvbnN0IHZpZXdlciA9IFNlcnZpY2VzLnZpZXdlckZvckRvYyhhbXBkb2NTaW5nbGUpO1xuICBjb25zdCB1cmxJc1Byb3h5ID0gaXNQcm94eU9yaWdpbihpbnB1dCk7XG4gIGNvbnN0IHZpZXdlckNhbkludGVyY2VwdCA9IHZpZXdlci5oYXNDYXBhYmlsaXR5KCd4aHJJbnRlcmNlcHRvcicpO1xuICBjb25zdCBpbnRlcmNlcHRvckRpc2FibGVkRm9yTG9jYWxEZXYgPVxuICAgIGluaXQuYnlwYXNzSW50ZXJjZXB0b3JGb3JEZXYgJiYgZ2V0TW9kZSh3aW4pLmxvY2FsRGV2O1xuICBpZiAodXJsSXNQcm94eSB8fCAhdmlld2VyQ2FuSW50ZXJjZXB0IHx8IGludGVyY2VwdG9yRGlzYWJsZWRGb3JMb2NhbERldikge1xuICAgIHJldHVybiB3aGVuVW5ibG9ja2VkO1xuICB9XG5cbiAgY29uc3QgaHRtbEVsZW1lbnQgPSBhbXBkb2NTaW5nbGUuZ2V0Um9vdE5vZGUoKS5kb2N1bWVudEVsZW1lbnQ7XG4gIGNvbnN0IGRvY09wdGVkSW4gPSBodG1sRWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2FsbG93LXhoci1pbnRlcmNlcHRpb24nKTtcbiAgaWYgKCFkb2NPcHRlZEluKSB7XG4gICAgcmV0dXJuIHdoZW5VbmJsb2NrZWQ7XG4gIH1cblxuICByZXR1cm4gd2hlblVuYmxvY2tlZFxuICAgIC50aGVuKCgpID0+IHZpZXdlci5pc1RydXN0ZWRWaWV3ZXIoKSlcbiAgICAudGhlbigodmlld2VyVHJ1c3RlZCkgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICAhKFxuICAgICAgICAgIHZpZXdlclRydXN0ZWQgfHxcbiAgICAgICAgICBnZXRNb2RlKHdpbikubG9jYWxEZXYgfHxcbiAgICAgICAgICBpc0V4cGVyaW1lbnRPbih3aW4sICd1bnRydXN0ZWQteGhyLWludGVyY2VwdGlvbicpXG4gICAgICAgIClcbiAgICAgICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBtZXNzYWdlUGF5bG9hZCA9IGRpY3Qoe1xuICAgICAgICAnb3JpZ2luYWxSZXF1ZXN0JzogdG9TdHJ1Y3R1cmVkQ2xvbmVhYmxlKGlucHV0LCBpbml0KSxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHZpZXdlclxuICAgICAgICAuc2VuZE1lc3NhZ2VBd2FpdFJlc3BvbnNlKCd4aHInLCBtZXNzYWdlUGF5bG9hZClcbiAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PlxuICAgICAgICAgIGZyb21TdHJ1Y3R1cmVkQ2xvbmVhYmxlKHJlc3BvbnNlLCBpbml0LnJlc3BvbnNlVHlwZSlcbiAgICAgICAgKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBTZXRzIHVwIFVSTCBiYXNlZCBvbiBhbXBDb3JzXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHtzdHJpbmd9IGlucHV0XG4gKiBAcGFyYW0geyFGZXRjaEluaXREZWZ9IGluaXQgVGhlIG9wdGlvbnMgb2YgdGhlIFhIUiB3aGljaCBtYXkgZ2V0XG4gKiBpbnRlcmNlcHRlZC5cbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldHVwSW5wdXQod2luLCBpbnB1dCwgaW5pdCkge1xuICBkZXZBc3NlcnQodHlwZW9mIGlucHV0ID09ICdzdHJpbmcnLCAnT25seSBVUkwgc3VwcG9ydGVkOiAlcycsIGlucHV0KTtcbiAgaWYgKGluaXQuYW1wQ29ycyAhPT0gZmFsc2UpIHtcbiAgICBpbnB1dCA9IGdldENvcnNVcmwod2luLCBpbnB1dCk7XG4gIH1cbiAgcmV0dXJuIGlucHV0O1xufVxuXG4vKipcbiAqIFNldHMgdXAgYW5kIG5vcm1hbGl6ZXMgdGhlIEZldGNoSW5pdERlZlxuICpcbiAqIEBwYXJhbSB7P0ZldGNoSW5pdERlZj19IG9wdF9pbml0IEZldGNoIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtzdHJpbmc9fSBvcHRfYWNjZXB0IFRoZSBIVFRQIEFjY2VwdCBoZWFkZXIgdmFsdWUuXG4gKiBAcmV0dXJuIHshRmV0Y2hJbml0RGVmfVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBJbml0KG9wdF9pbml0LCBvcHRfYWNjZXB0KSB7XG4gIGNvbnN0IGluaXQgPSBvcHRfaW5pdCB8fCB7fTtcblxuICAvLyBJbiBwYXJ0aWN1bGFyLCBGaXJlZm94IGRvZXMgbm90IHRvbGVyYXRlIGBudWxsYCB2YWx1ZXMgZm9yXG4gIC8vIGBjcmVkZW50aWFsc2AuXG4gIGNvbnN0IGNyZWRzID0gaW5pdC5jcmVkZW50aWFscztcbiAgZGV2QXNzZXJ0KFxuICAgIGNyZWRzID09PSB1bmRlZmluZWQgfHwgY3JlZHMgPT0gJ2luY2x1ZGUnIHx8IGNyZWRzID09ICdvbWl0JyxcbiAgICAnT25seSBjcmVkZW50aWFscz1pbmNsdWRlfG9taXQgc3VwcG9ydDogJXMnLFxuICAgIGNyZWRzXG4gICk7XG5cbiAgaW5pdC5tZXRob2QgPSBub3JtYWxpemVNZXRob2RfKGluaXQubWV0aG9kKTtcbiAgaW5pdC5oZWFkZXJzID0gaW5pdC5oZWFkZXJzIHx8IGRpY3Qoe30pO1xuICBpZiAob3B0X2FjY2VwdCkge1xuICAgIGluaXQuaGVhZGVyc1snQWNjZXB0J10gPSBvcHRfYWNjZXB0O1xuICB9XG5cbiAgLy8gSW4gZWRnZSBhIGBUeXBlTWlzbWF0Y2hFcnJvcmAgaXMgdGhyb3duIHdoZW4gYm9keSBpcyBzZXQgdG8gbnVsbC5cbiAgZGV2QXNzZXJ0KGluaXQuYm9keSAhPT0gbnVsbCwgJ2ZldGNoIGBib2R5YCBjYW4gbm90IGJlIGBudWxsYCcpO1xuXG4gIHJldHVybiBpbml0O1xufVxuXG4vKipcbiAqXG4gKiBTZXRzIHVwIEFNUFNwZWNpZmljIENPUlMgaGVhZGVycy5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXRcbiAqIEBwYXJhbSB7P0ZldGNoSW5pdERlZj19IGluaXRcbiAqIEByZXR1cm4geyFGZXRjaEluaXREZWZ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cEFNUENvcnMod2luLCBpbnB1dCwgaW5pdCkge1xuICBpbml0ID0gaW5pdCB8fCB7fTtcbiAgLy8gRm9yIHNvbWUgc2FtZSBvcmlnaW4gcmVxdWVzdHMsIGFkZCBBTVAtU2FtZS1PcmlnaW46IHRydWUgaGVhZGVyIHRvIGFsbG93XG4gIC8vIHB1Ymxpc2hlcnMgdG8gdmFsaWRhdGUgdGhhdCB0aGlzIHJlcXVlc3QgY2FtZSBmcm9tIHRoZWlyIG93biBvcmlnaW4uXG4gIGNvbnN0IGN1cnJlbnRPcmlnaW4gPSBnZXRXaW5PcmlnaW4od2luKTtcbiAgY29uc3QgdGFyZ2V0T3JpZ2luID0gcGFyc2VVcmxEZXByZWNhdGVkKGlucHV0KS5vcmlnaW47XG4gIGlmIChjdXJyZW50T3JpZ2luID09IHRhcmdldE9yaWdpbikge1xuICAgIGluaXRbJ2hlYWRlcnMnXSA9IGluaXRbJ2hlYWRlcnMnXSB8fCB7fTtcbiAgICBpbml0WydoZWFkZXJzJ11bJ0FNUC1TYW1lLU9yaWdpbiddID0gJ3RydWUnO1xuICB9XG4gIHJldHVybiBpbml0O1xufVxuXG4vKipcbiAqIEBwYXJhbSB7P0ZldGNoSW5pdERlZj19IGluaXRcbiAqIEByZXR1cm4geyFGZXRjaEluaXREZWZ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cEpzb25GZXRjaEluaXQoaW5pdCkge1xuICBjb25zdCBmZXRjaEluaXQgPSBzZXR1cEluaXQoaW5pdCwgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgaWYgKGZldGNoSW5pdC5tZXRob2QgPT0gJ1BPU1QnICYmICFpc0Zvcm1EYXRhV3JhcHBlcihmZXRjaEluaXQuYm9keSkpIHtcbiAgICAvLyBBc3N1bWUgSlNPTiBzdHJpY3QgbW9kZSB3aGVyZSBvbmx5IG9iamVjdHMgb3IgYXJyYXlzIGFyZSBhbGxvd2VkXG4gICAgLy8gYXMgYm9keS5cbiAgICBkZXZBc3NlcnQoXG4gICAgICBhbGxvd2VkSnNvbkJvZHlUeXBlc18uc29tZSgodGVzdCkgPT4gdGVzdChmZXRjaEluaXQuYm9keSkpLFxuICAgICAgJ2JvZHkgbXVzdCBiZSBvZiB0eXBlIG9iamVjdCBvciBhcnJheS4gJXMnLFxuICAgICAgZmV0Y2hJbml0LmJvZHlcbiAgICApO1xuXG4gICAgLy8gQ29udGVudCBzaG91bGQgYmUgJ3RleHQvcGxhaW4nIHRvIGF2b2lkIENPUlMgcHJlZmxpZ2h0LlxuICAgIGZldGNoSW5pdC5oZWFkZXJzWydDb250ZW50LVR5cGUnXSA9XG4gICAgICBmZXRjaEluaXQuaGVhZGVyc1snQ29udGVudC1UeXBlJ10gfHwgJ3RleHQvcGxhaW47Y2hhcnNldD11dGYtOCc7XG4gICAgY29uc3QgaGVhZGVyQ29udGVudFR5cGUgPSBmZXRjaEluaXQuaGVhZGVyc1snQ29udGVudC1UeXBlJ107XG4gICAgLy8gQ2FzdCBpcyB2YWxpZCwgYmVjYXVzZSB3ZSBjaGVja2VkIHRoYXQgaXQgaXMgbm90IGZvcm0gZGF0YSBhYm92ZS5cbiAgICBpZiAoaGVhZGVyQ29udGVudFR5cGUgPT09ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKSB7XG4gICAgICBmZXRjaEluaXQuYm9keSA9IHNlcmlhbGl6ZVF1ZXJ5U3RyaW5nKFxuICAgICAgICAvKiogQHR5cGUgeyFKc29uT2JqZWN0fSAqLyAoZmV0Y2hJbml0LmJvZHkpXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBmZXRjaEluaXQuYm9keSA9IEpTT04uc3RyaW5naWZ5KFxuICAgICAgICAvKiogQHR5cGUgeyFKc29uT2JqZWN0fSAqLyAoZmV0Y2hJbml0LmJvZHkpXG4gICAgICApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmV0Y2hJbml0O1xufVxuXG4vKipcbiAqIE5vcm1hbGl6ZWQgbWV0aG9kIG5hbWUgYnkgdXBwZXJjYXNpbmcuXG4gKiBAcGFyYW0ge3N0cmluZ3x1bmRlZmluZWR9IG1ldGhvZFxuICogQHJldHVybiB7c3RyaW5nfVxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplTWV0aG9kXyhtZXRob2QpIHtcbiAgaWYgKG1ldGhvZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuICdHRVQnO1xuICB9XG4gIG1ldGhvZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpO1xuICBkZXZBc3NlcnQoXG4gICAgYWxsb3dlZE1ldGhvZHNfLmluY2x1ZGVzKG1ldGhvZCksXG4gICAgJ09ubHkgb25lIG9mICVzIGlzIGN1cnJlbnRseSBhbGxvd2VkLiBHb3QgJXMnLFxuICAgIGFsbG93ZWRNZXRob2RzXy5qb2luKCcsICcpLFxuICAgIG1ldGhvZFxuICApO1xuICByZXR1cm4gbWV0aG9kO1xufVxuXG4vKipcbiAqIElmIDQxNSBvciBpbiB0aGUgNXh4IHJhbmdlLlxuICogQHBhcmFtIHtudW1iZXJ9IHN0YXR1c1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNSZXRyaWFibGUoc3RhdHVzKSB7XG4gIHJldHVybiBzdGF0dXMgPT0gNDE1IHx8IChzdGF0dXMgPj0gNTAwICYmIHN0YXR1cyA8IDYwMCk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgcmVzcG9uc2UgaWYgc3VjY2Vzc2Z1bCBvciBvdGhlcndpc2UgdGhyb3dzIGFuIGVycm9yLlxuICogQHBhcmFtIHshUmVzcG9uc2V9IHJlc3BvbnNlXG4gKiBAcmV0dXJuIHshUHJvbWlzZTwhUmVzcG9uc2U+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0U3VjY2VzcyhyZXNwb25zZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBpZiAocmVzcG9uc2Uub2spIHtcbiAgICAgIHJldHVybiByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICB9XG5cbiAgICBjb25zdCB7c3RhdHVzfSA9IHJlc3BvbnNlO1xuICAgIGNvbnN0IGVyciA9IHVzZXIoKS5jcmVhdGVFcnJvcihgSFRUUCBlcnJvciAke3N0YXR1c31gKTtcbiAgICBlcnJbJ3JldHJpYWJsZSddID0gaXNSZXRyaWFibGUoc3RhdHVzKTtcbiAgICAvLyBUT0RPKEBqcmlkZ2V3ZWxsLCAjOTQ0OCk6IENhbGxlcnMgd2hvIG5lZWQgdGhlIHJlc3BvbnNlIHNob3VsZFxuICAgIC8vIHNraXAgcHJvY2Vzc2luZy5cbiAgICBlcnJbJ3Jlc3BvbnNlJ10gPSByZXNwb25zZTtcbiAgICB0aHJvdyBlcnI7XG4gIH0pO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/utils/xhr-utils.js