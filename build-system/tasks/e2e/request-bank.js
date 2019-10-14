/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import requestPromise from 'request-promise';

/**
 * A server side temporary request storage which is useful for testing
 * browser sent HTTP requests. This class is expected to be ran in NodeJS.
 * See testing/test-helper.js for the implementation for running within Karma.
 */
export class RequestBankE2E {
  /**
   * @param {string} homeUrl The URL of the dev server.
   * @param {?string} bankId The unique identifier of a specific instance to
   * prevent interference between tests.
   */
  constructor(homeUrl, bankId) {
    /** @private {string} */
    this.homeUrl_ = homeUrl || 'http://localhost:8000';

    /** @private {string} */
    this.bankId_ = bankId || (Date.now() + Math.random()).toString(32);
  }

  /**
   * Returns the URL for depositing a request.
   *
   * @param {number|string|undefined} requestId
   * @return {string}
   */
  getUrl(requestId) {
    return `${this.homeUrl_}/amp4test/request-bank/${this.bankId_}/deposit/${requestId}/`;
  }

  /**
   * Returns a Promise that resolves when the request of given ID is deposited.
   * The returned promise resolves to an JsonObject contains the request info:
   * {
   *   url: string
   *   headers: JsonObject
   *   body: string
   * }
   * @param {number|string|undefined} requestId
   * @return {Promise<JsonObject>}
   */
  withdraw(requestId) {
    const url = `${this.homeUrl_}/amp4test/request-bank/${this.bankId_}/withdraw/${requestId}/`;
    return this.fetch_(url).then(body => JSON.parse(body));
  }

  /**
   * @return {Promise<JsonObject>}
   */
  tearDown() {
    const url = `${this.homeUrl_}/amp4test/request-bank/${this.bankId_}/teardown/`;
    return this.fetch_(url);
  }

  /**
   * @param {string} url
   * @return {Promise<JsonObject>}
   */
  fetch_(url) {
    return requestPromise.get({
      url,
      timeout: 15000,
    });
  }
}
