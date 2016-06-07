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

import {dev, user} from '../log';
import {getService} from '../service';
import {
  addParamToUrl,
  getSourceOrigin,
  parseQueryString,
  parseUrl,
} from '../url';
import {isArray, isObject, isFormData} from '../types';


/**
 * The "init" argument of the Fetch API. Currently, only "credentials: include"
 * is implemented.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
 *
 * @typedef {{
 *   body: (!Object|!Array|undefined|string),
 *   credentials: (string|undefined),
 *   headers: (!Object|undefined),
 *   method: (string|undefined),
 *   requireAmpResponseSourceOrigin: (boolean|undefined)
 * }}
 */
let FetchInitDef;

/** @private @const {!Array<string>} */
const allowedMethods_ = ['GET', 'POST'];

/** @private @const {!Array<function(*):boolean>} */
const allowedJsonBodyTypes_ = [isArray, isObject];

/** @private @enum {number} Allowed fetch responses. */
const allowedFetchTypes_ = {
  document: 1,
  text: 2,
  arraybuffer: 3,
};

/** @private @const {string} */
const SOURCE_ORIGIN_PARAM = '__amp_source_origin';

/** @private @const {string} */
const ALLOW_SOURCE_ORIGIN_HEADER = 'AMP-Access-Control-Allow-Source-Origin';


/**
 * A service that polyfills Fetch API for use within AMP.
 *
 * @package Visible for type.
 * @visibleForTesting
 */
export class Xhr {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;
  }

  /**
   * We want to call `fetch_` unbound from any context since it could
   * be either the native fetch or our polyfill.
   *
   * @param {string} input
   * @param {?FetchInitDef=} opt_init
   * @return {!Promise<!FetchResponse>}
   * @private
   */
  fetch_(input, opt_init) {
    dev.assert(typeof input == 'string', 'Only URL supported: %s', input);
    if (opt_init && opt_init.credentials !== undefined) {
      // In particular, Firefox does not tolerate `null` values for
      // `credentials`.
      dev.assert(opt_init.credentials == 'include',
          'Only credentials=include support: %s', opt_init.credentials);
    }
    // Fallback to xhr polyfill since `fetch` api does not support
    // responseType = 'document'. We do this so we don't have to do any parsing
    // and document construction on the UI thread which would be expensive.
    if (opt_init && opt_init.responseType == 'document') {
      return fetchPolyfill.apply(null, arguments);
    }
    return (this.win.fetch || fetchPolyfill).apply(null, arguments);
  }

  /**
   * Performs the final initialization and requests the fetch. It does three
   * main things: (1) It adds "__amp_source_origin" URL parameter with source
   * origin; (2) It verifies "AMP-Access-Control-Allow-Source-Origin" if it's
   * returned in the response; and (3) It requires
   * "AMP-Access-Control-Allow-Source-Origin" to be present in the response
   * if the `init.requireAmpResponseSourceOrigin = true`.
   *
   * @param {string} input
   * @param {?FetchInitDef=} opt_init
   * @return {!Promise<!FetchResponse>}
   * @private
   */
  fetchAmpCors_(input, opt_init) {
    input = getCorsUrl(this.win, input);
    return this.fetch_(input, opt_init).catch(reason => {
      user.assert(false, 'Fetch failed %s: %s', input,
          reason && reason.message);
    }).then(response => {
      const allowSourceOriginHeader = response.headers.get(
          ALLOW_SOURCE_ORIGIN_HEADER);
      if (allowSourceOriginHeader) {
        // If the `AMP-Access-Control-Allow-Source-Origin` header is returned,
        // ensure that it's equal to the current source origin.
        user.assert(allowSourceOriginHeader == sourceOrigin,
              `Returned ${ALLOW_SOURCE_ORIGIN_HEADER} is not` +
              ` equal to the current: ${allowSourceOriginHeader}` +
              ` vs ${sourceOrigin}`);
      } else if (opt_init && opt_init.requireAmpResponseSourceOrigin) {
        // If the `AMP-Access-Control-Allow-Source-Origin` header is not
        // returned but required, return error.
        user.assert(false, `Response must contain the` +
            ` ${ALLOW_SOURCE_ORIGIN_HEADER} header`);
      }
      return response;
    });
  }

  /**
   * Fetches and constructs JSON object based on the fetch polyfill.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
   *
   * See `fetchAmpCors_` for more detail.
   *
   * @param {string} input
   * @param {?FetchInitDef=} opt_init
   * @return {!Promise<!JSONType>}
   */
  fetchJson(input, opt_init) {
    const init = opt_init || {};
    init.method = normalizeMethod_(init.method);
    setupJson_(init);

    return this.fetchAmpCors_(input, init).then(response => {
      return assertSuccess(response).json();
    });
  }

  /**
   * Creates an XHR request with responseType=document
   * and returns the `FetchResponse` object.
   *
   * @param {string} input
   * @param {?FetchInitDef=} opt_init
   * @return {!Promise<!HTMLDocument>}
   */
  fetchDocument(input, opt_init) {
    const init = opt_init || {};
    init.responseType = 'document';
    init.method = normalizeMethod_(init.method);
    init.headers = init.headers || {};
    init.headers['Accept'] = 'text/html';

    return this.fetchAmpCors_(input, init).then(response => {
      return assertSuccess(response).document_();
    });
  }

  /**
   * @param {!string} input URL
   * @param {Array<string>} opt_responseHeaderNames List of response headers to
   * extract and return.
   * @param {FetchInitDef} opt_init Fetch options object.
   * @return {!Promise<!FetchResponse>}
   */
  fetch(input, opt_init) {
    const init = opt_init || {};
    // The "real" fetch API does not specify the response type in the request.
    // The fetch response object lets you extract the body in any of the types.
    // Here, specify 'arraybuffer' in case we use the polyfill, since that is
    // what we will use when we use fetch.
    init.responseType = 'arraybuffer';
    init.method = normalizeMethod_(init.method);
    init.headers = init.headers || {};
    return this.fetchAmpCors_(input, init).then(response =>
      assertSuccess(response));
  }

  /**
   * Sends the request, awaits result and confirms that it was successful.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
   *
   * See `fetchAmpCors_` for more detail.
   *
   * @param {string} input
   * @param {?FetchInitDef=} opt_init
   * @return {!Promise}
   */
  sendSignal(input, opt_init) {
    return this.fetchAmpCors_(input, opt_init).then(response => {
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

  dev.assert(
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
  init.headers = init.headers || {};
  init.headers['Accept'] = 'application/json';

  if (init.method == 'POST' && !isFormData(init.body)) {
    // Assume JSON strict mode where only objects or arrays are allowed
    // as body.
    dev.assert(
      allowedJsonBodyTypes_.some(test => test(init.body)),
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
  /** @type {!FetchInitDef} */
  const init = opt_init || {};
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
 * Add "__amp_source_origin" query parameter to the URL. Ideally, we'd be
 * able to set a header (e.g. AMP-Source-Origin), but this will force
 * preflight request on all CORS request.
 * @param {!Window} win
 * @param {string} url
 * @return {string}
 */
export function getCorsUrl(win, url) {
  const sourceOrigin = getSourceOrigin(win.location.href);
  const parsedUrl = parseUrl(url);
  const query = parseQueryString(parsedUrl.search);
  user.assert(!(SOURCE_ORIGIN_PARAM in query),
      'Source origin is not allowed in %s', url);
  return addParamToUrl(url, SOURCE_ORIGIN_PARAM, sourceOrigin);
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
    throw new Error('CORS is not supported');
  }
  return xhr;
}

/**
 * If 415 or in the 5xx range.
 * @param {string} status
 */
function isRetriable(status) {
  return status == 415 || (status >= 500 && status < 600);
}


/**
 * Returns the response if successful or otherwise throws an error.
 * @paran {!FetchResponse} response
 * @return {!FetchResponse}
 */
function assertSuccess(response) {
  if (!(response.status >= 200 && response.status < 300)) {
    const err = user.createError(`HTTP error ${response.status}`);
    if (isRetriable(response.status)) {
      err.retriable = true;
    }
    throw err;
  }
  return response;
}


/**
 * Response object in the Fetch API.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
 */
export class FetchResponse {
  /**
   * @param {!XMLHttpRequest} xhr
   */
  constructor(xhr) {
    /** @private @const {!XMLHttpRequest} */
    this.xhr_ = xhr;

    /** @type {number} */
    this.status = this.xhr_.status;

    /** @private @const {!FetchResponseHeaders} */
    this.headers = new FetchResponseHeaders(xhr);

    /** @type {boolean} */
    this.bodyUsed = false;
  }

  /**
   * Drains the response and returns the text.
   * @return {!Promise<string>}
   * @private
   */
  drainText_() {
    dev.assert(!this.bodyUsed, 'Body already used');
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
   * @return {!Promise<!JSONType>}
   */
  json() {
    return this.drainText_().then(JSON.parse);
  }

  /**
   * Reads the xhr responseXML.
   * @return {!Promise<!HTMLDocument>}
   * @private
   */
  document_() {
    dev.assert(!this.bodyUsed, 'Body already used');
    this.bodyUsed = true;
    user.assert(this.xhr_.responseXML,
        'responseXML should exist. Make sure to return ' +
        'Content-Type: text/html header.');
    return Promise.resolve(this.xhr_.responseXML);
  }

  /**
   * Drains the response and returns a promise that resolves with the response
   * ArrayBuffer.
   * @return {!Promise<ArrayBuffer>}
   */
  arrayBuffer() {
    dev.assert(this.xhr_.responseType == 'arraybuffer',
               'responseType was not "arraybuffer"');
    dev.assert(!this.bodyUsed, 'Body already used');
    this.bodyUsed = true;
    return Promise.resolve(this.xhr_.response);
  }
}


/**
 * Provides access to the response headers as defined in the Fetch API.
 */
class FetchResponseHeaders {
  /**
   * @param {!XMLHttpRequest} xhr
   */
  constructor(xhr) {
    /** @private @const {!XMLHttpRequest} */
    this.xhr_ = xhr;
  }

  /**
   * @param {string} name
   * @return {*}
   */
  get(name) {
    return this.xhr_.getResponseHeader(name);
  }
}


/**
 * @param {!ArrayBuffer} bytes
 * @return {!Promise<string>}
 */
export function utf8FromArrayBuffer(bytes) {
  if (window.TextDecoder) {
    return Promise.resolve(new TextDecoder('utf-8').decode(bytes));
  }
  return new Promise(function(resolve, unusedReject) {
    const reader = new FileReader();
    reader.onloadend = function(unusedEvent) {
      resolve(reader.result);
    };
    reader.readAsText(new Blob([bytes]));
  });
}


/**
 * @param {!Window} window
 * @return {!Xhr}
 */
export function installXhrService(window) {
  return getService(window, 'xhr', () => {
    return new Xhr(window);
  });
};
