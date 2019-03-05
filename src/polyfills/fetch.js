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
import {
  defineConfigurableWritableProperty,
} from './configurable-writable-property';
import {dev, devAssert, user} from '../log';
import {hasOwn, map} from '../utils/object';
import {isArray, isObject} from '../types';
import {parseJson} from '../json';
import {utf8Encode} from '../utils/bytes';

/** @enum {number} Allowed fetch responses. */
const allowedFetchTypes = {
  document: 1,
  text: 2,
};

/** @const {!Array<string>} */
const allowedMethods = ['GET', 'POST'];

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
let XMLHttpRequestDef;


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
export function fetchPolyfill(input, init = {}) {
  return new Promise(function(resolve, reject) {
    const requestMethod = normalizeMethod(init.method || 'GET');
    const xhr = createXhrRequest(requestMethod, input);

    if (init.credentials == 'include') {
      xhr.withCredentials = true;
    }

    if (init.responseType in allowedFetchTypes) {
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
  const xhr = new XMLHttpRequest();
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
class FetchResponse {
  /**
   * @param {!XMLHttpRequest|!XMLHttpRequestDef} xhr
   */
  constructor(xhr) {
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
  }

  /**
   * Create a copy of the response and return it.
   * @return {!FetchResponse}
   */
  clone() {
    devAssert(!this.bodyUsed, 'Body already used');
    return new FetchResponse(this.xhr_);
  }

  /**
   * Drains the response and returns the text.
   * @return {!Promise<string>}
   * @private
   */
  drainText_() {
    devAssert(!this.bodyUsed, 'Body already used');
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
      allowedMethods.includes(method),
      'Only one of %s is currently allowed. Got %s',
      allowedMethods.join(', '),
      method
  );
  return method;
}


/**
 * Provides access to the response headers as defined in the Fetch API.
 * @private Visible for testing.
 */
class FetchResponseHeaders {
  /**
   * @param {!XMLHttpRequest|!XMLHttpRequestDef} xhr
   */
  constructor(xhr) {
    /** @private @const {!XMLHttpRequest|!XMLHttpRequestDef} */
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

export class Response extends FetchResponse {
  /**
   * Returns instance of Response.
   * @param {?ResponseBodyInit=} body
   * @param {!ResponseInit=} init
   */
  constructor(body, init = {}) {
    const lowercasedHeaders = map();
    const data = Object.assign({
      status: 200,
      statusText: 'OK',
      responseText: (body ? String(body) : ''),
      /**
       * @param {string} name
       * @return {string}
       */
      getResponseHeader(name) {
        const headerName = String(name).toLowerCase();
        return hasOwn(lowercasedHeaders, headerName) ?
          lowercasedHeaders[headerName] : null;
      },
    }, init);

    data.status = (init.status === undefined) ? 200 :
      parseInt(init.status, 10);

    if (isArray(init.headers)) {
      init.headers.forEach(entry => {
        const headerName = entry[0];
        const headerValue = entry[1];
        lowercasedHeaders[String(headerName).toLowerCase()] =
            String(headerValue);
      });
    } else if (isObject(init.headers)) {
      for (const key in init.headers) {
        lowercasedHeaders[String(key).toLowerCase()] =
            String(init.headers[key]);
      }
    }

    if (init.statusText) {
      data.statusText = String(init.statusText);
    }

    super(/** @type {XMLHttpRequestDef} */(data));
  }
}

/**
 * Installs fetch and Response polyfill
 *
 * @export
 * @param {Window} win
 */
export function install(win) {
  if (!win.fetch) {
    defineConfigurableWritableProperty(win, win, 'fetch', fetchPolyfill,
        /* opt_enumerable */ true);
    defineConfigurableWritableProperty(win, win, 'Response', Response,
        /* opt_enumerable */ false);
  }
}
