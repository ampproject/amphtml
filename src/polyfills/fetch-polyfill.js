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
import {dev, user} from '../log';
import {isArray} from '../types';
import {map} from '../utils/object';
import {parseJson} from '../json';
import {utf8Encode} from '../utils/bytes';

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
 * @param {!Object|RequestInit=} init
 * @return {!Promise<!FetchResponse>}
 * @private Visible for testing
 */
function fetchPolyfill(input, init) {
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
 * Response object in the Fetch API.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
 */
class FetchResponse {
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
class FetchResponseHeaders {
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
 * Returns instance of Response.
 * @param {?ResponseBodyInit=} body
 * @param {!ResponseInit=} init
 */
function Response(body, init = {}) {
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
      return lowercasedHeaders[String(name).toLowerCase()] || null;
    },
  }, init);

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

  return new FetchResponse(data);
}

/**
 * Installs fetch polyfill
 *
 * @export
 * @param {Window} win
 */
export function install(win) {
  if (!win.fetch) {
    win.fetch = fetchPolyfill;
    win.Response = Response;
  }
}
