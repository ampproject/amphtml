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

const SW_PATH = '/build-system/tasks/e2e/driver/e2e-sw.js';

/**
 * Create a Deferred object. This file cannot access the existing
 * AMP framework Deferred, so it is reimplemented here.
 * @return {{
 *   promise: !Promise,
 *   resolve: function(*=),
 *   reject: function(*=)
 * }}
 */
function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {promise, resolve, reject};
}

const {serviceWorker} = window.navigator;

class RequestLoggingService {
  constructor() {
    /** @const */
    this.requests_ = [];

    this.ready_ = false;
  }

  /**
   * Install the service worker and listen for messages if needed after
   * the page loads, or immediately if the page has already loaded.
   * @return {!Promise}
   */
  install() {
    if (!serviceWorker) {
      return Promise.reject();
    }

    if (document.readyState === 'loading') {
      const {resolve, promise} = createDeferred();
      document.addEventListener('load', e => this.onLoad_(e).then(resolve));
      return promise;
    }

    return this.onLoad_();
  }

  /**
   * Register the service worker if it has not been registered already,
   * and listen for messages.
   * @return {!Promise}
   */
  onLoad_() {
    const register = serviceWorker.controller
      ? Promise.resolve()
      : serviceWorker
          .register(SW_PATH, {scope: '/'})
          .then(() => serviceWorker.ready);

    return register.then(() => {
      serviceWorker.addEventListener('message', e => this.onMessage_(e));
      this.ready_ = true;
    });
  }

  /**
   * Receive a message from the service worker.
   * @param {!Event} e
   */
  onMessage_(e) {
    this.requests_ = e.data;
  }

  /**
   * If string, matches any literal part of the URL.
   * If object, matches individual parts of the URL.
   * @param {!Location|string} matcher
   * @return {!./e2e-sw.RequestLogDef}
   */
  getRequest(matcher) {
    const matches = this.requests_.filter(req => req.url.includes(matcher));
    return matches[0] || {};
  }

  /**
   * Returns true when the service is ready to accept requests.
   * @return {boolean}
   */
  isReady() {
    return this.ready_;
  }
}

const service = new RequestLoggingService();
service.install().then(() => {
  window.requestService = service;
});
