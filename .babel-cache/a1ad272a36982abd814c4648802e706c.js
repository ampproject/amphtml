function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import { devAssert } from "../core/assert";
import { isArray, isObject } from "../core/types";
import { hasOwn, map } from "../core/types/object";
import { parseJson } from "../core/types/object/json";
import { utf8Encode } from "../core/types/string/bytes";
import { dev, user } from "../log";

/** @enum {number} Allowed fetch responses. */
var allowedFetchTypes = {
  document: 1,
  text: 2
};

/** @const {!Array<string>} */
var allowedMethods = ['GET', 'POST'];

/**
 * A record version of `XMLHttpRequest` that has all the necessary properties
 * and methods of `XMLHttpRequest` to construct a `FetchResponse` from a
 * serialized response returned by the viewer.
 * @typedef {{
 *   status: number,
 *   statusText: string,
 *   responseText: string,
 *   getResponseHeader: function(this:XMLHttpRequestDef, string): string,
 * }}
 */
var XMLHttpRequestDef;

/**
 * A minimal polyfill of Fetch API. It only polyfills what we currently use.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
 *
 * Notice that the "fetch" method itself is not exported as that would require
 * us to immediately support a much wide API.
 *
 * @param {string} input
 * @param {!Object|RequestInit=} init
 * @return {!Promise<!FetchResponse>}
 */
export function fetchPolyfill(input, init) {
  if (init === void 0) {
    init = {};
  }

  return new Promise(function (resolve, reject) {
    var requestMethod = normalizeMethod(init.method || 'GET');
    var xhr = createXhrRequest(requestMethod, input);

    if (init.credentials == 'include') {
      xhr.withCredentials = true;
    }

    if (init.responseType in allowedFetchTypes) {
      xhr.responseType = init.responseType;
    }

    if (init.headers) {
      Object.keys(init.headers).forEach(function (header) {
        xhr.setRequestHeader(header, init.headers[header]);
      });
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState <
      /* STATUS_RECEIVED */
      2) {
        return;
      }

      if (xhr.status < 100 || xhr.status > 599) {
        xhr.onreadystatechange = null;
        reject(user().createExpectedError("Unknown HTTP status " + xhr.status));
        return;
      }

      // TODO(dvoytenko): This is currently simplified: we will wait for the
      // whole document loading to complete. This is fine for the use cases
      // we have now, but may need to be reimplemented later.
      if (xhr.readyState ==
      /* COMPLETE */
      4) {
        resolve(new FetchResponse(xhr));
      }
    };

    xhr.onerror = function () {
      reject(user().createExpectedError('Network failure'));
    };

    xhr.onabort = function () {
      reject(user().createExpectedError('Request aborted'));
    };

    if (requestMethod == 'POST') {
      xhr.send(init.body);
    } else {
      xhr.send();
    }
  });
}

/**
 * @param {string} method
 * @param {string} url
 * @return {!XMLHttpRequest}
 */
function createXhrRequest(method, url) {
  var xhr = new XMLHttpRequest();

  if ('withCredentials' in xhr) {
    xhr.open(method, url, true);
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
var FetchResponse = /*#__PURE__*/function () {
  /**
   * @param {!XMLHttpRequest|!XMLHttpRequestDef} xhr
   */
  function FetchResponse(xhr) {
    _classCallCheck(this, FetchResponse);

    /** @private @const {!XMLHttpRequest|!XMLHttpRequestDef} */
    this.xhr_ = xhr;

    /** @const {number} */
    this.status = this.xhr_.status;

    /** @const {string} */
    this.statusText = this.xhr_.statusText;

    /** @const {boolean} */
    this.ok = this.status >= 200 && this.status < 300;

    /** @const {!FetchResponseHeaders} */
    this.headers = new FetchResponseHeaders(xhr);

    /** @type {boolean} */
    this.bodyUsed = false;

    /** @type {?ReadableStream} */
    this.body = null;

    /** @type {?string} */
    this.url = xhr.responseURL;
  }

  /**
   * Create a copy of the response and return it.
   * @return {!FetchResponse}
   */
  _createClass(FetchResponse, [{
    key: "clone",
    value: function clone() {
      devAssert(!this.bodyUsed, 'Body already used');
      return new FetchResponse(this.xhr_);
    }
    /**
     * Drains the response and returns the text.
     * @return {!Promise<string>}
     * @private
     */

  }, {
    key: "drainText_",
    value: function drainText_() {
      devAssert(!this.bodyUsed, 'Body already used');
      this.bodyUsed = true;
      return Promise.resolve(this.xhr_.responseText);
    }
    /**
     * Drains the response and returns a promise that resolves with the response
     * text.
     * @return {!Promise<string>}
     */

  }, {
    key: "text",
    value: function text() {
      return this.drainText_();
    }
    /**
     * Drains the response and returns the JSON object.
     * @return {!Promise<!JsonObject>}
     */

  }, {
    key: "json",
    value: function json() {
      return (
        /** @type {!Promise<!JsonObject>} */
        this.drainText_().then(parseJson)
      );
    }
    /**
     * Drains the response and returns a promise that resolves with the response
     * ArrayBuffer.
     * @return {!Promise<!ArrayBuffer>}
     */

  }, {
    key: "arrayBuffer",
    value: function arrayBuffer() {
      return (
        /** @type {!Promise<!ArrayBuffer>} */
        this.drainText_().then(utf8Encode)
      );
    }
  }]);

  return FetchResponse;
}();

/**
 * Normalized method name by uppercasing.
 * @param {string|undefined} method
 * @return {string}
 * @private
 */
function normalizeMethod(method) {
  if (method === undefined) {
    return 'GET';
  }

  method = method.toUpperCase();
  devAssert(allowedMethods.includes(method), 'Only one of %s is currently allowed. Got %s', allowedMethods.join(', '), method);
  return method;
}

/**
 * Provides access to the response headers as defined in the Fetch API.
 * @private Visible for testing.
 */
var FetchResponseHeaders = /*#__PURE__*/function () {
  /**
   * @param {!XMLHttpRequest|!XMLHttpRequestDef} xhr
   */
  function FetchResponseHeaders(xhr) {
    _classCallCheck(this, FetchResponseHeaders);

    /** @private @const {!XMLHttpRequest|!XMLHttpRequestDef} */
    this.xhr_ = xhr;
  }

  /**
   * @param {string} name
   * @return {string}
   */
  _createClass(FetchResponseHeaders, [{
    key: "get",
    value: function get(name) {
      return this.xhr_.getResponseHeader(name);
    }
    /**
     * @param {string} name
     * @return {boolean}
     */

  }, {
    key: "has",
    value: function has(name) {
      return this.xhr_.getResponseHeader(name) != null;
    }
  }]);

  return FetchResponseHeaders;
}();

export var Response = /*#__PURE__*/function (_FetchResponse) {
  _inherits(Response, _FetchResponse);

  var _super = _createSuper(Response);

  /**
   * Returns instance of Response.
   * @param {?ResponseBodyInit=} body
   * @param {!ResponseInit=} init
   */
  function Response(body, init) {
    if (init === void 0) {
      init = {};
    }

    _classCallCheck(this, Response);

    var lowercasedHeaders = map();

    var data = _extends({
      status: 200,
      statusText: 'OK',
      responseText: body ? String(body) : '',
      getResponseHeader: function getResponseHeader(name) {
        var headerName = String(name).toLowerCase();
        return hasOwn(lowercasedHeaders, headerName) ? lowercasedHeaders[headerName] : null;
      }
    }, init);

    data.status = init.status === undefined ? 200 : parseInt(init.status, 10);

    if (isArray(init.headers)) {
      /** @type {!Array} */
      init.headers.forEach(function (entry) {
        var headerName = entry[0];
        var headerValue = entry[1];
        lowercasedHeaders[String(headerName).toLowerCase()] = String(headerValue);
      });
    } else if (isObject(init.headers)) {
      for (var key in init.headers) {
        lowercasedHeaders[String(key).toLowerCase()] = String(init.headers[key]);
      }
    }

    if (init.statusText) {
      data.statusText = String(init.statusText);
    }

    return _super.call(this,
    /** @type {XMLHttpRequestDef} */
    data);
  }

  return Response;
}(FetchResponse);

/**
 * Installs fetch and Response polyfill
 * @param {Window} win
 */
export function install(win) {
  if (!win.fetch) {
    Object.defineProperty(win, 'fetch', {
      value: fetchPolyfill,
      writable: true,
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(win, 'Response', {
      value: Response,
      writable: true,
      enumerable: false,
      configurable: true
    });
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZldGNoLmpzIl0sIm5hbWVzIjpbImRldkFzc2VydCIsImlzQXJyYXkiLCJpc09iamVjdCIsImhhc093biIsIm1hcCIsInBhcnNlSnNvbiIsInV0ZjhFbmNvZGUiLCJkZXYiLCJ1c2VyIiwiYWxsb3dlZEZldGNoVHlwZXMiLCJkb2N1bWVudCIsInRleHQiLCJhbGxvd2VkTWV0aG9kcyIsIlhNTEh0dHBSZXF1ZXN0RGVmIiwiZmV0Y2hQb2x5ZmlsbCIsImlucHV0IiwiaW5pdCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwicmVxdWVzdE1ldGhvZCIsIm5vcm1hbGl6ZU1ldGhvZCIsIm1ldGhvZCIsInhociIsImNyZWF0ZVhoclJlcXVlc3QiLCJjcmVkZW50aWFscyIsIndpdGhDcmVkZW50aWFscyIsInJlc3BvbnNlVHlwZSIsImhlYWRlcnMiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsImhlYWRlciIsInNldFJlcXVlc3RIZWFkZXIiLCJvbnJlYWR5c3RhdGVjaGFuZ2UiLCJyZWFkeVN0YXRlIiwic3RhdHVzIiwiY3JlYXRlRXhwZWN0ZWRFcnJvciIsIkZldGNoUmVzcG9uc2UiLCJvbmVycm9yIiwib25hYm9ydCIsInNlbmQiLCJib2R5IiwidXJsIiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwieGhyXyIsInN0YXR1c1RleHQiLCJvayIsIkZldGNoUmVzcG9uc2VIZWFkZXJzIiwiYm9keVVzZWQiLCJyZXNwb25zZVVSTCIsInJlc3BvbnNlVGV4dCIsImRyYWluVGV4dF8iLCJ0aGVuIiwidW5kZWZpbmVkIiwidG9VcHBlckNhc2UiLCJpbmNsdWRlcyIsImpvaW4iLCJuYW1lIiwiZ2V0UmVzcG9uc2VIZWFkZXIiLCJSZXNwb25zZSIsImxvd2VyY2FzZWRIZWFkZXJzIiwiZGF0YSIsIlN0cmluZyIsImhlYWRlck5hbWUiLCJ0b0xvd2VyQ2FzZSIsInBhcnNlSW50IiwiZW50cnkiLCJoZWFkZXJWYWx1ZSIsImtleSIsImluc3RhbGwiLCJ3aW4iLCJmZXRjaCIsImRlZmluZVByb3BlcnR5IiwidmFsdWUiLCJ3cml0YWJsZSIsImVudW1lcmFibGUiLCJjb25maWd1cmFibGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFRQSxTQUFSO0FBQ0EsU0FBUUMsT0FBUixFQUFpQkMsUUFBakI7QUFDQSxTQUFRQyxNQUFSLEVBQWdCQyxHQUFoQjtBQUNBLFNBQVFDLFNBQVI7QUFDQSxTQUFRQyxVQUFSO0FBRUEsU0FBUUMsR0FBUixFQUFhQyxJQUFiOztBQUVBO0FBQ0EsSUFBTUMsaUJBQWlCLEdBQUc7QUFDeEJDLEVBQUFBLFFBQVEsRUFBRSxDQURjO0FBRXhCQyxFQUFBQSxJQUFJLEVBQUU7QUFGa0IsQ0FBMUI7O0FBS0E7QUFDQSxJQUFNQyxjQUFjLEdBQUcsQ0FBQyxLQUFELEVBQVEsTUFBUixDQUF2Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSUMsaUJBQUo7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyxhQUFULENBQXVCQyxLQUF2QixFQUE4QkMsSUFBOUIsRUFBeUM7QUFBQSxNQUFYQSxJQUFXO0FBQVhBLElBQUFBLElBQVcsR0FBSixFQUFJO0FBQUE7O0FBQzlDLFNBQU8sSUFBSUMsT0FBSixDQUFZLFVBQVVDLE9BQVYsRUFBbUJDLE1BQW5CLEVBQTJCO0FBQzVDLFFBQU1DLGFBQWEsR0FBR0MsZUFBZSxDQUFDTCxJQUFJLENBQUNNLE1BQUwsSUFBZSxLQUFoQixDQUFyQztBQUNBLFFBQU1DLEdBQUcsR0FBR0MsZ0JBQWdCLENBQUNKLGFBQUQsRUFBZ0JMLEtBQWhCLENBQTVCOztBQUVBLFFBQUlDLElBQUksQ0FBQ1Ms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QUFHRDtBQUNGOztBQUVELFFBQUl0RCxJQUFJLENBQUMrQixVQUFULEVBQXFCO0FBQ25CZ0IsTUFBQUEsSUFBSSxDQUFDaEIsVUFBTCxHQUFrQmlCLE1BQU0sQ0FBQ2hELElBQUksQ0FBQytCLFVBQU4sQ0FBeEI7QUFDRDs7QUFsQzBCO0FBb0NyQjtBQUFrQ2dCLElBQUFBLElBcENiO0FBcUM1Qjs7QUEzQ0g7QUFBQSxFQUE4QnpCLGFBQTlCOztBQThDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU2lDLE9BQVQsQ0FBaUJDLEdBQWpCLEVBQXNCO0FBQzNCLE1BQUksQ0FBQ0EsR0FBRyxDQUFDQyxLQUFULEVBQWdCO0FBQ2Q1QyxJQUFBQSxNQUFNLENBQUM2QyxjQUFQLENBQXNCRixHQUF0QixFQUEyQixPQUEzQixFQUFvQztBQUNsQ0csTUFBQUEsS0FBSyxFQUFFN0QsYUFEMkI7QUFFbEM4RCxNQUFBQSxRQUFRLEVBQUUsSUFGd0I7QUFHbENDLE1BQUFBLFVBQVUsRUFBRSxJQUhzQjtBQUlsQ0MsTUFBQUEsWUFBWSxFQUFFO0FBSm9CLEtBQXBDO0FBTUFqRCxJQUFBQSxNQUFNLENBQUM2QyxjQUFQLENBQXNCRixHQUF0QixFQUEyQixVQUEzQixFQUF1QztBQUNyQ0csTUFBQUEsS0FBSyxFQUFFZCxRQUQ4QjtBQUVyQ2UsTUFBQUEsUUFBUSxFQUFFLElBRjJCO0FBR3JDQyxNQUFBQSxVQUFVLEVBQUUsS0FIeUI7QUFJckNDLE1BQUFBLFlBQVksRUFBRTtBQUp1QixLQUF2QztBQU1EO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE2IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbmltcG9ydCB7ZGV2QXNzZXJ0fSBmcm9tICcjY29yZS9hc3NlcnQnO1xuaW1wb3J0IHtpc0FycmF5LCBpc09iamVjdH0gZnJvbSAnI2NvcmUvdHlwZXMnO1xuaW1wb3J0IHtoYXNPd24sIG1hcH0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcbmltcG9ydCB7cGFyc2VKc29ufSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QvanNvbic7XG5pbXBvcnQge3V0ZjhFbmNvZGV9IGZyb20gJyNjb3JlL3R5cGVzL3N0cmluZy9ieXRlcyc7XG5cbmltcG9ydCB7ZGV2LCB1c2VyfSBmcm9tICcuLi9sb2cnO1xuXG4vKiogQGVudW0ge251bWJlcn0gQWxsb3dlZCBmZXRjaCByZXNwb25zZXMuICovXG5jb25zdCBhbGxvd2VkRmV0Y2hUeXBlcyA9IHtcbiAgZG9jdW1lbnQ6IDEsXG4gIHRleHQ6IDIsXG59O1xuXG4vKiogQGNvbnN0IHshQXJyYXk8c3RyaW5nPn0gKi9cbmNvbnN0IGFsbG93ZWRNZXRob2RzID0gWydHRVQnLCAnUE9TVCddO1xuXG4vKipcbiAqIEEgcmVjb3JkIHZlcnNpb24gb2YgYFhNTEh0dHBSZXF1ZXN0YCB0aGF0IGhhcyBhbGwgdGhlIG5lY2Vzc2FyeSBwcm9wZXJ0aWVzXG4gKiBhbmQgbWV0aG9kcyBvZiBgWE1MSHR0cFJlcXVlc3RgIHRvIGNvbnN0cnVjdCBhIGBGZXRjaFJlc3BvbnNlYCBmcm9tIGFcbiAqIHNlcmlhbGl6ZWQgcmVzcG9uc2UgcmV0dXJuZWQgYnkgdGhlIHZpZXdlci5cbiAqIEB0eXBlZGVmIHt7XG4gKiAgIHN0YXR1czogbnVtYmVyLFxuICogICBzdGF0dXNUZXh0OiBzdHJpbmcsXG4gKiAgIHJlc3BvbnNlVGV4dDogc3RyaW5nLFxuICogICBnZXRSZXNwb25zZUhlYWRlcjogZnVuY3Rpb24odGhpczpYTUxIdHRwUmVxdWVzdERlZiwgc3RyaW5nKTogc3RyaW5nLFxuICogfX1cbiAqL1xubGV0IFhNTEh0dHBSZXF1ZXN0RGVmO1xuXG4vKipcbiAqIEEgbWluaW1hbCBwb2x5ZmlsbCBvZiBGZXRjaCBBUEkuIEl0IG9ubHkgcG9seWZpbGxzIHdoYXQgd2UgY3VycmVudGx5IHVzZS5cbiAqXG4gKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0dsb2JhbEZldGNoL2ZldGNoXG4gKlxuICogTm90aWNlIHRoYXQgdGhlIFwiZmV0Y2hcIiBtZXRob2QgaXRzZWxmIGlzIG5vdCBleHBvcnRlZCBhcyB0aGF0IHdvdWxkIHJlcXVpcmVcbiAqIHVzIHRvIGltbWVkaWF0ZWx5IHN1cHBvcnQgYSBtdWNoIHdpZGUgQVBJLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dFxuICogQHBhcmFtIHshT2JqZWN0fFJlcXVlc3RJbml0PX0gaW5pdFxuICogQHJldHVybiB7IVByb21pc2U8IUZldGNoUmVzcG9uc2U+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gZmV0Y2hQb2x5ZmlsbChpbnB1dCwgaW5pdCA9IHt9KSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgY29uc3QgcmVxdWVzdE1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChpbml0Lm1ldGhvZCB8fCAnR0VUJyk7XG4gICAgY29uc3QgeGhyID0gY3JlYXRlWGhyUmVxdWVzdChyZXF1ZXN0TWV0aG9kLCBpbnB1dCk7XG5cbiAgICBpZiAoaW5pdC5jcmVkZW50aWFscyA9PSAnaW5jbHVkZScpIHtcbiAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChpbml0LnJlc3BvbnNlVHlwZSBpbiBhbGxvd2VkRmV0Y2hUeXBlcykge1xuICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9IGluaXQucmVzcG9uc2VUeXBlO1xuICAgIH1cblxuICAgIGlmIChpbml0LmhlYWRlcnMpIHtcbiAgICAgIE9iamVjdC5rZXlzKGluaXQuaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbiAoaGVhZGVyKSB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGhlYWRlciwgaW5pdC5oZWFkZXJzW2hlYWRlcl0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9ICgpID0+IHtcbiAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA8IC8qIFNUQVRVU19SRUNFSVZFRCAqLyAyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICh4aHIuc3RhdHVzIDwgMTAwIHx8IHhoci5zdGF0dXMgPiA1OTkpIHtcbiAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICAgIHJlamVjdCh1c2VyKCkuY3JlYXRlRXhwZWN0ZWRFcnJvcihgVW5rbm93biBIVFRQIHN0YXR1cyAke3hoci5zdGF0dXN9YCkpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE8oZHZveXRlbmtvKTogVGhpcyBpcyBjdXJyZW50bHkgc2ltcGxpZmllZDogd2Ugd2lsbCB3YWl0IGZvciB0aGVcbiAgICAgIC8vIHdob2xlIGRvY3VtZW50IGxvYWRpbmcgdG8gY29tcGxldGUuIFRoaXMgaXMgZmluZSBmb3IgdGhlIHVzZSBjYXNlc1xuICAgICAgLy8gd2UgaGF2ZSBub3csIGJ1dCBtYXkgbmVlZCB0byBiZSByZWltcGxlbWVudGVkIGxhdGVyLlxuICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09IC8qIENPTVBMRVRFICovIDQpIHtcbiAgICAgICAgcmVzb2x2ZShuZXcgRmV0Y2hSZXNwb25zZSh4aHIpKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHhoci5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgcmVqZWN0KHVzZXIoKS5jcmVhdGVFeHBlY3RlZEVycm9yKCdOZXR3b3JrIGZhaWx1cmUnKSk7XG4gICAgfTtcbiAgICB4aHIub25hYm9ydCA9ICgpID0+IHtcbiAgICAgIHJlamVjdCh1c2VyKCkuY3JlYXRlRXhwZWN0ZWRFcnJvcignUmVxdWVzdCBhYm9ydGVkJykpO1xuICAgIH07XG5cbiAgICBpZiAocmVxdWVzdE1ldGhvZCA9PSAnUE9TVCcpIHtcbiAgICAgIHhoci5zZW5kKGluaXQuYm9keSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHhoci5zZW5kKCk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcmV0dXJuIHshWE1MSHR0cFJlcXVlc3R9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVhoclJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIGlmICgnd2l0aENyZWRlbnRpYWxzJyBpbiB4aHIpIHtcbiAgICB4aHIub3BlbihtZXRob2QsIHVybCwgdHJ1ZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgZGV2KCkuY3JlYXRlRXhwZWN0ZWRFcnJvcignQ09SUyBpcyBub3Qgc3VwcG9ydGVkJyk7XG4gIH1cbiAgcmV0dXJuIHhocjtcbn1cblxuLyoqXG4gKiBSZXNwb25zZSBvYmplY3QgaW4gdGhlIEZldGNoIEFQSS5cbiAqXG4gKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0dsb2JhbEZldGNoL2ZldGNoXG4gKi9cbmNsYXNzIEZldGNoUmVzcG9uc2Uge1xuICAvKipcbiAgICogQHBhcmFtIHshWE1MSHR0cFJlcXVlc3R8IVhNTEh0dHBSZXF1ZXN0RGVmfSB4aHJcbiAgICovXG4gIGNvbnN0cnVjdG9yKHhocikge1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFYTUxIdHRwUmVxdWVzdHwhWE1MSHR0cFJlcXVlc3REZWZ9ICovXG4gICAgdGhpcy54aHJfID0geGhyO1xuXG4gICAgLyoqIEBjb25zdCB7bnVtYmVyfSAqL1xuICAgIHRoaXMuc3RhdHVzID0gdGhpcy54aHJfLnN0YXR1cztcblxuICAgIC8qKiBAY29uc3Qge3N0cmluZ30gKi9cbiAgICB0aGlzLnN0YXR1c1RleHQgPSB0aGlzLnhocl8uc3RhdHVzVGV4dDtcblxuICAgIC8qKiBAY29uc3Qge2Jvb2xlYW59ICovXG4gICAgdGhpcy5vayA9IHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMDtcblxuICAgIC8qKiBAY29uc3QgeyFGZXRjaFJlc3BvbnNlSGVhZGVyc30gKi9cbiAgICB0aGlzLmhlYWRlcnMgPSBuZXcgRmV0Y2hSZXNwb25zZUhlYWRlcnMoeGhyKTtcblxuICAgIC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmJvZHlVc2VkID0gZmFsc2U7XG5cbiAgICAvKiogQHR5cGUgez9SZWFkYWJsZVN0cmVhbX0gKi9cbiAgICB0aGlzLmJvZHkgPSBudWxsO1xuXG4gICAgLyoqIEB0eXBlIHs/c3RyaW5nfSAqL1xuICAgIHRoaXMudXJsID0geGhyLnJlc3BvbnNlVVJMO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGNvcHkgb2YgdGhlIHJlc3BvbnNlIGFuZCByZXR1cm4gaXQuXG4gICAqIEByZXR1cm4geyFGZXRjaFJlc3BvbnNlfVxuICAgKi9cbiAgY2xvbmUoKSB7XG4gICAgZGV2QXNzZXJ0KCF0aGlzLmJvZHlVc2VkLCAnQm9keSBhbHJlYWR5IHVzZWQnKTtcbiAgICByZXR1cm4gbmV3IEZldGNoUmVzcG9uc2UodGhpcy54aHJfKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEcmFpbnMgdGhlIHJlc3BvbnNlIGFuZCByZXR1cm5zIHRoZSB0ZXh0LlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxzdHJpbmc+fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZHJhaW5UZXh0XygpIHtcbiAgICBkZXZBc3NlcnQoIXRoaXMuYm9keVVzZWQsICdCb2R5IGFscmVhZHkgdXNlZCcpO1xuICAgIHRoaXMuYm9keVVzZWQgPSB0cnVlO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy54aHJfLnJlc3BvbnNlVGV4dCk7XG4gIH1cblxuICAvKipcbiAgICogRHJhaW5zIHRoZSByZXNwb25zZSBhbmQgcmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSByZXNwb25zZVxuICAgKiB0ZXh0LlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxzdHJpbmc+fVxuICAgKi9cbiAgdGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5kcmFpblRleHRfKCk7XG4gIH1cblxuICAvKipcbiAgICogRHJhaW5zIHRoZSByZXNwb25zZSBhbmQgcmV0dXJucyB0aGUgSlNPTiBvYmplY3QuXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFKc29uT2JqZWN0Pn1cbiAgICovXG4gIGpzb24oKSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7IVByb21pc2U8IUpzb25PYmplY3Q+fSAqLyAoXG4gICAgICB0aGlzLmRyYWluVGV4dF8oKS50aGVuKHBhcnNlSnNvbilcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIERyYWlucyB0aGUgcmVzcG9uc2UgYW5kIHJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgcmVzcG9uc2VcbiAgICogQXJyYXlCdWZmZXIuXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFBcnJheUJ1ZmZlcj59XG4gICAqL1xuICBhcnJheUJ1ZmZlcigpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZTwhQXJyYXlCdWZmZXI+fSAqLyAoXG4gICAgICB0aGlzLmRyYWluVGV4dF8oKS50aGVuKHV0ZjhFbmNvZGUpXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIE5vcm1hbGl6ZWQgbWV0aG9kIG5hbWUgYnkgdXBwZXJjYXNpbmcuXG4gKiBAcGFyYW0ge3N0cmluZ3x1bmRlZmluZWR9IG1ldGhvZFxuICogQHJldHVybiB7c3RyaW5nfVxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplTWV0aG9kKG1ldGhvZCkge1xuICBpZiAobWV0aG9kID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gJ0dFVCc7XG4gIH1cbiAgbWV0aG9kID0gbWV0aG9kLnRvVXBwZXJDYXNlKCk7XG4gIGRldkFzc2VydChcbiAgICBhbGxvd2VkTWV0aG9kcy5pbmNsdWRlcyhtZXRob2QpLFxuICAgICdPbmx5IG9uZSBvZiAlcyBpcyBjdXJyZW50bHkgYWxsb3dlZC4gR290ICVzJyxcbiAgICBhbGxvd2VkTWV0aG9kcy5qb2luKCcsICcpLFxuICAgIG1ldGhvZFxuICApO1xuICByZXR1cm4gbWV0aG9kO1xufVxuXG4vKipcbiAqIFByb3ZpZGVzIGFjY2VzcyB0byB0aGUgcmVzcG9uc2UgaGVhZGVycyBhcyBkZWZpbmVkIGluIHRoZSBGZXRjaCBBUEkuXG4gKiBAcHJpdmF0ZSBWaXNpYmxlIGZvciB0ZXN0aW5nLlxuICovXG5jbGFzcyBGZXRjaFJlc3BvbnNlSGVhZGVycyB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFYTUxIdHRwUmVxdWVzdHwhWE1MSHR0cFJlcXVlc3REZWZ9IHhoclxuICAgKi9cbiAgY29uc3RydWN0b3IoeGhyKSB7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IVhNTEh0dHBSZXF1ZXN0fCFYTUxIdHRwUmVxdWVzdERlZn0gKi9cbiAgICB0aGlzLnhocl8gPSB4aHI7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZ2V0KG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy54aHJfLmdldFJlc3BvbnNlSGVhZGVyKG5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBoYXMobmFtZSkge1xuICAgIHJldHVybiB0aGlzLnhocl8uZ2V0UmVzcG9uc2VIZWFkZXIobmFtZSkgIT0gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVzcG9uc2UgZXh0ZW5kcyBGZXRjaFJlc3BvbnNlIHtcbiAgLyoqXG4gICAqIFJldHVybnMgaW5zdGFuY2Ugb2YgUmVzcG9uc2UuXG4gICAqIEBwYXJhbSB7P1Jlc3BvbnNlQm9keUluaXQ9fSBib2R5XG4gICAqIEBwYXJhbSB7IVJlc3BvbnNlSW5pdD19IGluaXRcbiAgICovXG4gIGNvbnN0cnVjdG9yKGJvZHksIGluaXQgPSB7fSkge1xuICAgIGNvbnN0IGxvd2VyY2FzZWRIZWFkZXJzID0gbWFwKCk7XG4gICAgY29uc3QgZGF0YSA9IHtcbiAgICAgIHN0YXR1czogMjAwLFxuICAgICAgc3RhdHVzVGV4dDogJ09LJyxcbiAgICAgIHJlc3BvbnNlVGV4dDogYm9keSA/IFN0cmluZyhib2R5KSA6ICcnLFxuICAgICAgZ2V0UmVzcG9uc2VIZWFkZXIobmFtZSkge1xuICAgICAgICBjb25zdCBoZWFkZXJOYW1lID0gU3RyaW5nKG5hbWUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHJldHVybiBoYXNPd24obG93ZXJjYXNlZEhlYWRlcnMsIGhlYWRlck5hbWUpXG4gICAgICAgICAgPyBsb3dlcmNhc2VkSGVhZGVyc1toZWFkZXJOYW1lXVxuICAgICAgICAgIDogbnVsbDtcbiAgICAgIH0sXG4gICAgICAuLi5pbml0LFxuICAgIH07XG5cbiAgICBkYXRhLnN0YXR1cyA9IGluaXQuc3RhdHVzID09PSB1bmRlZmluZWQgPyAyMDAgOiBwYXJzZUludChpbml0LnN0YXR1cywgMTApO1xuXG4gICAgaWYgKGlzQXJyYXkoaW5pdC5oZWFkZXJzKSkge1xuICAgICAgLyoqIEB0eXBlIHshQXJyYXl9ICovIChpbml0LmhlYWRlcnMpLmZvckVhY2goKGVudHJ5KSA9PiB7XG4gICAgICAgIGNvbnN0IGhlYWRlck5hbWUgPSBlbnRyeVswXTtcbiAgICAgICAgY29uc3QgaGVhZGVyVmFsdWUgPSBlbnRyeVsxXTtcbiAgICAgICAgbG93ZXJjYXNlZEhlYWRlcnNbU3RyaW5nKGhlYWRlck5hbWUpLnRvTG93ZXJDYXNlKCldID1cbiAgICAgICAgICBTdHJpbmcoaGVhZGVyVmFsdWUpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChpc09iamVjdChpbml0LmhlYWRlcnMpKSB7XG4gICAgICBmb3IgKGNvbnN0IGtleSBpbiBpbml0LmhlYWRlcnMpIHtcbiAgICAgICAgbG93ZXJjYXNlZEhlYWRlcnNbU3RyaW5nKGtleSkudG9Mb3dlckNhc2UoKV0gPSBTdHJpbmcoXG4gICAgICAgICAgaW5pdC5oZWFkZXJzW2tleV1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaW5pdC5zdGF0dXNUZXh0KSB7XG4gICAgICBkYXRhLnN0YXR1c1RleHQgPSBTdHJpbmcoaW5pdC5zdGF0dXNUZXh0KTtcbiAgICB9XG5cbiAgICBzdXBlcigvKiogQHR5cGUge1hNTEh0dHBSZXF1ZXN0RGVmfSAqLyAoZGF0YSkpO1xuICB9XG59XG5cbi8qKlxuICogSW5zdGFsbHMgZmV0Y2ggYW5kIFJlc3BvbnNlIHBvbHlmaWxsXG4gKiBAcGFyYW0ge1dpbmRvd30gd2luXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsKHdpbikge1xuICBpZiAoIXdpbi5mZXRjaCkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW4sICdmZXRjaCcsIHtcbiAgICAgIHZhbHVlOiBmZXRjaFBvbHlmaWxsLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW4sICdSZXNwb25zZScsIHtcbiAgICAgIHZhbHVlOiBSZXNwb25zZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/polyfills/fetch.js