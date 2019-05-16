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
 * @fileoverview
 * @deprecated Do not use this in new code. Use env.fetchMock instead. Its API
 *     is a superset of this one. TODO(@taymonbeal, #11066): Migrate all
 *     existing users and then delete this file.
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

/**
 * A stub for `window.fetch`, facilitating hermetic testing of code that uses
 * it. The window is stubbed when this class's constructor is called.
 */
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

  /**
   * Unstubs the window object and restores the real `window.fetch`.
   */
  restore() {
    this.win_.fetch = this.realFetch_;
    this.routes_ = {};
  }

  /**
   * Specifies that up to one GET request may be made to the given URL during
   * the current test, and defines the response to return.
   *
   * @param {string} url the URL that the request is made to
   * @param {!MockResponse} response the response to return
   * @param {{name: string}=} options if provided, specifies a name that the
   *     caller may later use with the `called` method
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
   * Returns whether a particular URL specified by an earlier call to `getOnce`
   * was ever actually used for a GET request.
   *
   * @param {string} name the name of the route passed in `options`
   * @return {boolean} whether a request has been made to the given route.
   */
  called(name) {
    if (!(name in this.names_)) {
      throw new Error('no route named ' + name);
    }
    return this.names_[name].called;
  }

  /**
   * Imitates the functionality of `window.fetch`.
   *
   * @param {!RequestInfo} input
   * @param {(!RequestInit|undefined)} init
   * @return {!Promise<!Response>}
   * @private
   */
  fetch_(input, init) {
    const {url} = new Request(input, init);
    const route = this.routes_[url];
    if (!route) {
      throw new Error('no route defined for ' + url);
    }
    if (route.called) {
      throw new Error('route called twice for ' + url);
    }
    route.called = true;
    return Promise.resolve(
      typeof route.response == 'function' ? route.response() : route.response
    ).then(data => {
      if (data === null || typeof data == 'string') {
        return new Response(data);
      } else {
        const {body, status, headers} = data;
        return new Response(
          body,
          /** @type {!ResponseInit} */ ({status, headers})
        );
      }
    });
  }
}

/**
 * Simulates a network connectivity or CORS failure.
 *
 * @return {!Error} an object that can be used as a rejection value
 */
export function networkFailure() {
  return new TypeError('Failed to fetch');
}
