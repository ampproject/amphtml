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

import {assert} from './asserts';
import {getService} from './service';
import {isArray, isObject} from './types';


/**
 * The "init" argument of the Fetch API. Currently, only "credentials: include"
 * is implemented.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
 *
 * @typedef {{
 *   body: (!Object|!Array|undefined),
 *   credentials: (string|undefined),
 *   headers: (!Object|undefined),
 *   method: (string|undefined)
 * }}
 */
let FetchInitDef;

/** @private @const {!Array<string>} */
const allowedMethods_ = ['GET', 'POST'];

/** @private @const {!Array<function:boolean>} */
const allowedBodyTypes_ = [isArray, isObject];


/**
 * A service that polyfills Fetch API for use within AMP.
 */
class Xhr {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /**
     * We want to call `fetch_` unbound from any context since it could
     * be either the native fetch or our polyfill.
     * @private @const {function(string, ?FetchInitDef=):!Promise<!FetchResponse>}
     */
    this.fetch_ = (win.fetch || fetchPolyfill).bind(null);
  }

  /**
   * Fetches and constructs JSON object based on the fetch polyfill.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
   *
   * @param {string} input
   * @param {?FetchInitDef=} opt_init
   * @return {!Promise<!JSONValue>}
   */
  fetchJson(input, opt_init) {
    const init = opt_init || {};
    init.method = normalizeMethod_(init.method);
    setupJson_(init);

    return this.fetch_(input, init).then(response => {
      return assertSuccess(response).json();
    });
  }

  /**
   * Sends the request, awaits result and confirms that it was successful.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
   *
   * @param {string} input
   * @param {?FetchInitDef=} opt_init
   * @return {!Promise}
   */
  sendSignal(input, opt_init) {
    return this.fetch_(input, opt_init).then(response => {
      assertSuccess(response);
    });
  }
}


/**
 * Normalized method name by uppercasing.
 * @param {string|undefined} method
 * @return {string}
 * @private
 */
export function normalizeMethod_(method) {
  if (method === undefined) {
    return 'GET';
  }
  method = method.toUpperCase();

  assert(
    allowedMethods_.indexOf(method) > -1,
    'Only one of %s is currently allowed. Got %s',
    allowedMethods_.join(', '),
    method
  );

  return method;
}

/**
* Initialize init object with headers and stringifies the body.
 * @param {!FetchInitDef} init
 * @private
 */
function setupJson_(init) {
  init.headers = {
    'Accept': 'application/json'
  };

  if (init.method == 'POST') {
    // Assume JSON strict mode where only objects or arrays are allowed
    // as body.
    assert(
      allowedBodyTypes_.some(test => test(init.body)),
      'body must be of type object or array. %s',
      init.body
    );

    init.headers['Content-Type'] = 'application/json;charset=utf-8';
    init.body = JSON.stringify(init.body);
  }
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
 * @param {!FetchInitDef=} opt_init
 * @return {!Promise<!FetchResponse>}
 * @private Visible for testing
 */
export function fetchPolyfill(input, opt_init) {
  assert(typeof input == 'string', 'Only URL supported: %s', input);
  const init = opt_init || {};
  assert(!init.credentials || init.credentials == 'include',
      'Only credentials=include support: %s', init.credentials);

  return new Promise(function(resolve, reject) {
    const xhr = createXhrRequest(init.method || 'GET', input, init);

    if (init.credentials == 'include') {
      xhr.withCredentials = true;
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState < /* STATUS_RECEIVED */ 2) {
        return;
      }
      if (xhr.status < 100 || xhr.status > 599) {
        xhr.onreadystatechange = null;
        reject(new Error(`Unknown HTTP status ${xhr.status}`));
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
      reject(new Error('Network failure'));
    };
    xhr.onabort = () => {
      reject(new Error('Request aborted'));
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
 * @param {!FetchInitDef} init
 * @return {!XMLHttpRequest}
 * @private
 */
function createXhrRequest(method, url, init) {
  let xhr = new XMLHttpRequest();
  if ('withCredentials' in xhr) {
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != 'undefined') {
    // IE-specific object.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    throw new Error('CORS is not supported');
  }

  if (init.headers) {
    Object.keys(init.headers).forEach(function(header) {
      xhr.setRequestHeader(header, init.headers[header]);
    });
  }
  return xhr;
}


/**
 * Returns the response if successful or otherwise throws an error.
 * @paran {!FetchResponse} response
 * @return {!FetchResponse}
 */
function assertSuccess(response) {
  if (response.status < 200 || response.status > 299) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return response;
}


/**
 * Response object in the Fetch API.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
 */
class FetchResponse {
  /**
   * @param {!XMLHttpRequest} xhr
   */
  constructor(xhr) {
    /** @private @const {!XMLHttpRequest} */
    this.xhr_ = xhr;

    /** @type {number} */
    this.status = this.xhr_.status;

    /** @type {boolean} */
    this.bodyUsed = false;
  }

  /**
   * Drains the response and returns the text.
   * @return {!Promise<string>}
   * @private
   */
  drainText_() {
    assert(!this.bodyUsed, 'Body already used');
    this.bodyUsed = true;
    return Promise.resolve(this.xhr_.responseText);
  }

  /**
   * Drains the response and returns the JSON object.
   * @return {!Promise<!JSONValue>}
   */
  json() {
    return this.drainText_().then(JSON.parse);
  }
}


/**
 * @param {!Window} window
 * @return {!Xhr}
 */
export function xhrFor(window) {
  return getService(window, 'xhr', () => {
    return new Xhr(window);
  });
};
