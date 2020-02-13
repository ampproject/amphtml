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

const {CONTROL, downloadToDisk, EXPERIMENT} = require('./helpers');

/**
 * Download sites specified in config in order to serve them locally
 * for measurement (to avoid measuring network latency).
 *
 * @return {!Promise}
 * @param {!Array<string>} urls
 */
function cacheDocuments(urls) {
  return Promise.all(
    urls.flatMap(url => [
      downloadToDisk(url, CONTROL),
      downloadToDisk(url, EXPERIMENT),
    ])
  );
}

module.exports = cacheDocuments;
