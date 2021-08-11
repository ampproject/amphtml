function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
  text: 2 };


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
export function fetchPolyfill(input) {var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
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
      if (xhr.readyState < /* STATUS_RECEIVED */2) {
        return;
      }
      if (xhr.status < 100 || xhr.status > 599) {
        xhr.onreadystatechange = null;
        reject(user().createExpectedError("Unknown HTTP status ".concat(xhr.status)));
        return;
      }

      // TODO(dvoytenko): This is currently simplified: we will wait for the
      // whole document loading to complete. This is fine for the use cases
      // we have now, but may need to be reimplemented later.
      if (xhr.readyState == /* COMPLETE */4) {
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
 */var
FetchResponse = /*#__PURE__*/function () {
  /**
   * @param {!XMLHttpRequest|!XMLHttpRequestDef} xhr
   */
  function FetchResponse(xhr) {_classCallCheck(this, FetchResponse);
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
   */_createClass(FetchResponse, [{ key: "clone", value:
    function clone() {
      devAssert(!this.bodyUsed);
      return new FetchResponse(this.xhr_);
    }

    /**
     * Drains the response and returns the text.
     * @return {!Promise<string>}
     * @private
     */ }, { key: "drainText_", value:
    function drainText_() {
      devAssert(!this.bodyUsed);
      this.bodyUsed = true;
      return Promise.resolve(this.xhr_.responseText);
    }

    /**
     * Drains the response and returns a promise that resolves with the response
     * text.
     * @return {!Promise<string>}
     */ }, { key: "text", value:
    function text() {
      return this.drainText_();
    }

    /**
     * Drains the response and returns the JSON object.
     * @return {!Promise<!JsonObject>}
     */ }, { key: "json", value:
    function json() {
      return (/** @type {!Promise<!JsonObject>} */(
        this.drainText_().then(parseJson)));

    }

    /**
     * Drains the response and returns a promise that resolves with the response
     * ArrayBuffer.
     * @return {!Promise<!ArrayBuffer>}
     */ }, { key: "arrayBuffer", value:
    function arrayBuffer() {
      return (/** @type {!Promise<!ArrayBuffer>} */(
        this.drainText_().then(utf8Encode)));

    } }]);return FetchResponse;}();


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
  devAssert(
  allowedMethods.includes(method));




  return method;
}

/**
 * Provides access to the response headers as defined in the Fetch API.
 * @private Visible for testing.
 */var
FetchResponseHeaders = /*#__PURE__*/function () {
  /**
   * @param {!XMLHttpRequest|!XMLHttpRequestDef} xhr
   */
  function FetchResponseHeaders(xhr) {_classCallCheck(this, FetchResponseHeaders);
    /** @private @const {!XMLHttpRequest|!XMLHttpRequestDef} */
    this.xhr_ = xhr;
  }

  /**
   * @param {string} name
   * @return {string}
   */_createClass(FetchResponseHeaders, [{ key: "get", value:
    function get(name) {
      return this.xhr_.getResponseHeader(name);
    }

    /**
     * @param {string} name
     * @return {boolean}
     */ }, { key: "has", value:
    function has(name) {
      return this.xhr_.getResponseHeader(name) != null;
    } }]);return FetchResponseHeaders;}();


export var Response = /*#__PURE__*/function (_FetchResponse) {_inherits(Response, _FetchResponse);var _super = _createSuper(Response);
  /**
   * Returns instance of Response.
   * @param {?ResponseBodyInit=} body
   * @param {!ResponseInit=} init
   */
  function Response(body) {var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};_classCallCheck(this, Response);
    var lowercasedHeaders = map();
    var data = _objectSpread({
      status: 200,
      statusText: 'OK',
      responseText: body ? String(body) : '',
      getResponseHeader: function getResponseHeader(name) {
        var headerName = String(name).toLowerCase();
        return hasOwn(lowercasedHeaders, headerName) ?
        lowercasedHeaders[headerName] :
        null;
      } },
    init);


    data.status = init.status === undefined ? 200 : parseInt(init.status, 10);

    if (isArray(init.headers)) {
      /** @type {!Array} */(init.headers).forEach(function (entry) {
        var headerName = entry[0];
        var headerValue = entry[1];
        lowercasedHeaders[String(headerName).toLowerCase()] =
        String(headerValue);
      });
    } else if (isObject(init.headers)) {
      for (var key in init.headers) {
        lowercasedHeaders[String(key).toLowerCase()] = String(
        init.headers[key]);

      }
    }

    if (init.statusText) {
      data.statusText = String(init.statusText);
    }return _super.call(this,

    /** @type {XMLHttpRequestDef} */(data));
  }return Response;}(FetchResponse);


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
      configurable: true });

    Object.defineProperty(win, 'Response', {
      value: Response,
      writable: true,
      enumerable: false,
      configurable: true });

  }
}
// /Users/mszylkowski/src/amphtml/src/polyfills/fetch.js