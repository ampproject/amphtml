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

// Simplified error reporting for errors in service workers.

import {urls} from '../config';
import {exponentialBackoff} from '../exponential-backoff';

/**
 * Exponential backoff for error reports to avoid any given
 * ServiceWorker from generating a very large number of errors.
 * @const {function(function()): number}
 */
const backoff = exponentialBackoff(1.5);

self.addEventListener('unhandledrejection', event => {
  backoff(() => report(event.reason));
});

self.addEventListener('error', event => {
  backoff(() => report(event.error));
});

/**
 * Report error to AMP's error reporting frontend.
 *
 * @param {*} e
 */
function report(e) {
  if (urls.localhostRegex.test(self.location.origin)) {
    return;
  }
  if (!(e instanceof Error)) {
    e = new Error(e);
  }
  const config = self.AMP_CONFIG || {};
  const url = urls.errorReporting +
      // sw=1 tags request as coming from the service worker.
      '?sw=1&v=' + encodeURIComponent(config.v) +
      '&m=' + encodeURIComponent(e.message) +
      '&ca=' + (config.canary ? 1 : 0) +
      '&s=' + encodeURIComponent(e.stack || '');
  fetch(url, /** @type {!RequestInit} */ ({
    // We don't care about the response.
    mode: 'no-cors',
  })).catch(reason => {
    console./*OK*/error(reason);
  });
}
