/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

const fs = require('fs');
const {urlToCachePath} = require('./helpers');

const AD_SERVER_DOMAIN = 'securepubads.g.doubleclick.net';
const EXAMPLE_AD_URL =
  'http://localhost:8000/test/fixtures/performance/amp-ad/amphtml-ad.html';

/**
 * Handler that will intercept ads requests and return a locally cached ad
 * instead.
 * @param {!Array<function>} handlersList
 * @param {string} version
 * @return {boolean}
 */
function setupAdRequestHandler(handlersList, version) {
  handlersList.push((interceptedRequest) => {
    const url = interceptedRequest.url();
    // TODO(ccordry): allow dynamic ad response.
    if (url.includes(AD_SERVER_DOMAIN)) {
      const path = urlToCachePath(EXAMPLE_AD_URL, version);
      const body = fs.readFileSync(path);
      interceptedRequest.respond({
        status: 200,
        contentType: 'text/html; charset=UTF-8',
        body,
      });
      return true;
    }
    return false;
  });
}

module.exports = {
  setupAdRequestHandler,
};
