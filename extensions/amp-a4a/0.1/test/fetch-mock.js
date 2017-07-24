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

/**
 * @typedef {(?string|{
 *     body: ?string,
 *     status: (number|undefined),
 *     headers: (!Object<string, string>|undefined),
 * })}
 */
export let MockResponseData;

/** @typedef {(!MockResponseData|!Promise<!MockResponseData>)} */
export let MockResponseTiming;

/** @typedef {(!MockResponseTiming|function(): !MockResponseTiming)} */
export let MockResponse;

export class FetchMock {

  /** @param {!Window} win */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;
    /** @private {function(!RequestInfo, !RequestInit=): !Promise<!Response>} */
    this.realFetch_ = win.fetch;
    /** @private {!Object<string, {response: !MockResponse, called: boolean}>} */
    this.routes_ = {};
    /** @private {!Object<string, {response: !MockResponse, called: boolean}>} */
    this.names_ = {};

    win.fetch = (input, init = undefined) => this.fetch_(input, init);
  }

  restore() {
    this.win_.fetch = this.realFetch_;
    this.routes_ = {};
  }

  /**
   * @param {string} url
   * @param {!MockResponse} response
   * @param {{name: string}=} options
   */
  getOnce(url, response, options) {
    if (url in this.routes_) {
      throw new Error('route already defined for ' + url);
    }
    this.routes_[url] = {response, called: false};
    if (options) {
      this.names_[options.name] = this.routes_[url];
    }
  }

  /**
   * @param {string} name
   * @return {boolean}
   */
  called(name) {
    if (!(name in this.names_)) {
      throw new Error('no route named ' + name);
    }
    return this.names_[name].called;
  }

  /**
   * @param {!RequestInfo} input
   * @param {(!RequestInit|undefined)} init
   * @return {!Promise<!Response>}
   */
  fetch_(input, init) {
    const url = new Request(input, init).url;
    const route = this.routes_[url];
    if (!route) {
      throw new Error('no route defined for ' + url);
    }
    if (route.called) {
      throw new Error('route called twice for ' + url);
    }
    route.called = true;
    return Promise.resolve(
        typeof route.response == 'function' ? route.response() :
                                                  route.response)
        .then(data => {
          if (data === null || typeof data == 'string') {
            return new Response(data);
          } else {
            const {body, status, headers} = data;
            return new Response(body, {status, headers});
          }
        });
  }
}

/**
 * Returns an error representing a network failure. To simulate such a failure,
 * use the return value from this function as the rejection value of a promise
 * and use that promise as the `response` in an item of `entries` passed to
 * `FetchMock.prototype.use`.
 *
 * @return {!Error}
 */
export function networkFailure() {
  return new TypeError('Failed to fetch');
}
