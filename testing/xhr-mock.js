/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {user} from '../src/log';
import {xhrFor} from '../src/services';
import {
  assertAbsoluteHttpOrHttpsUrl,
  parseUrl,
  resolveRelativeUrl,
  serializeQueryString,
} from '../src/url';

export class XhrMock {

  /** @param {!Window} win */
  constructor(win) {
    /** @private {!Xhr} */
    this.xhr_ = xhrFor(win);
    /** @private {function(this:Xhr, string, !FetchInitDef): !Promise<!FetchResponse>} */
    this.realFetchImpl_ = this.xhr_.fetchImpl;
    /** @private {?MockFetch} */
    this.mockFetch_ = null;
  }

  /**
   * Mocks the `Xhr` service for the current window to make mock network
   * requests instead of real ones. After this method returns, the next time a
   * network request would be initiated via `Xhr`, instead the `request`
   * callback of the first `MockEntry` in `entries` is called. This function can
   * contain assertions on the characteristic of that request. Assuming
   * `request` returns successfully, the `Xhr` method returns as though the
   * server had sent a response as described by the `response` of the current
   * `MockEntry`. A promise that resolves or rejects at a later time may be used
   * to simulate a delay in the server's response. The next `Xhr`-initiated
   * network request uses the next `MockEntry` in `entries`, and so forth. If no
   * more `entries` remain, an `AssertionError` is thrown.
   *
   * @param {string} origin the security origin that requests will be considered
   *     to have come from. Used to mock CORS behavior.
   * @param {!Array<!MockEntry>} entries the entries for all requests that are
   *     expected to be made in this test
   * @throws {Error} if this window's `Xhr` has already been mocked with this
   *     method
   */
  use(origin, entries) {
    if (this.mockFetch_) {
      throw new Error('XhrMock is already in use');
    }
    this.mockFetch_ = new MockFetch(origin, entries);
    this.xhr_.fetchImpl = (input, init) =>
        this.mockFetch_.handleRequest(input, init);
  }

  /**
   * If the current window's `Xhr` service is not currently mocked with `use`,
   * does nothing. If it is currently mocked, asserts that all `entries` that
   * were passed to `mockXhr` have been used. Also restores `Xhr` to its
   * unmocked state, regardless of whether the assertion succeeds. Test suites
   * that use this class should pass this function to `afterEach`.
   *
   * @throws {Error} if unused `entries` remain from `mockXhr`
   */
  verifyAndRestore() {
    if (this.mockFetch_) {
      try {
        this.mockFetch_.assertComplete();
      } finally {
        this.xhr_.fetchImpl = this.realFetchImpl_;
        this.mockFetch_ = null;
      }
    }
  }
}

/**
 * Returns an error representing a network failure. To simulate such a failure,
 * use the return value from this function as the rejection value of a promise
 * and use that promise as the `response` in an item of `entries` passed to
 * `XhrMock.prototype.use`.
 *
 * @return {!Error}
 */
export function networkFailure() {
  return new TypeError('Failed to fetch');
}

/**
 * @typedef {{
 *   request: function(!MockRequest),
 *   response: !Promise<!MockResponse>,
 * }}
 */
export let MockEntry;

/**
 * @typedef {{
 *   method: string,
 *   url: string,
 *   headers: !Object<string, string>,
 *   body: string,
 * }}
 */
export let MockRequest;

/**
 * @typedef {{
 *   status: number,
 *   headers: !Object<string, string>,
 *   body: string,
 * }}
 */
export let MockResponse;

/** Tracks state of the XHR mock expectations and handles requests. */
class MockFetch {
  /**
   * @param {string|!Location} baseUrl
   * @param {!Array<!MockEntry>}
   */
  constructor(baseUrl, entries) {
    /** @private {!Location} */
    this.baseUrl_ = typeof baseUrl == 'string' ?
        parseUrl(assertAbsoluteHttpOrHttpsUrl(baseUrl)) :
        baseUrl;
    /** @private {!Array<!MockEntry>} */
    this.entries_ = entries.slice();
  }

  /**
   * @param {string} input
   * @param {!FetchInitDef} init
   * @return !Promise<!MockFetchResponse>
   */
  handleRequest(input, init) {
    if (!this.entries_.length) {
      throw new Error(
          'fetch attempted after all XhrMock entries had been used');
    }
    const {expectRequest, responsePromise} = this.entries_.shift();
    expectRequest({
      method: init.method || 'GET',
      url: resolveRelativeUrl(input, this.baseUrl_),
      headers: Object.assign({}, init.headers),
      body: init.body ? serializeQueryString(init.body) : '',
    });
    return responsePromise.then(
        ({status, headers, body}) => new MockFetchResponse(
            status, new MockFetchResponseHeaders(headers), body));
  }

  assertComplete() {
    const length = this.entries_.length;
    if (length) {
      throw new Error(`XhrMock has ${length} unused entries`);
    }
  }
}

/**
 * Response object from the mocked-out `XMLHttpRequest`.
 *
 * @implements {FetchResponse}
 */
class MockFetchResponse {
  constructor(status, headers, body) {
    this.status = status;
    this.headers = headers;
    this.bodyUsed = false;
    /** @private {string} */
    this.body_ = body;
  }

  /** @override */
  clone() {
    dev().assert(!this.bodyUsed, 'Body already used');
    return new MockFetchResponse(this.status, this.headers, this.body_);
  }

  /** @override */
  text() {
    dev().assert(!this.bodyUsed, 'Body already used');
    this.bodyUsed = true;
    return Promise.resolve(this.body_);
  }

  /** @override */
  json() {
    return /** @type {!Promise<!JSONType>} */ (
        this.text().then(JSON.parse.bind(JSON)));
  }

  /** @override */
  arrayBuffer() {
    return /** @type {!Promise<!ArrayBuffer>} */ (
        this.text().then(utf8EncodeSync));
  }
}

/**
 * Headers object from the mocked-out `XMLHttpRequest`.
 *
 * @implements {FetchResponseHeaders}
 */
class MockFetchResponseHeaders {
  /**
   * @param {!Object<string, string>} headers
   */
  constructor(headers) {
    /** @private {!Object<string, string>} */
    this.headers_ = Object.assign({}, headers);
  }

  /** @override */
  get(name) {
    return this.headers_[name];
  }

  /** @override */
  has(name) {
    return this.headers_[name] != undefined;
  }
}
