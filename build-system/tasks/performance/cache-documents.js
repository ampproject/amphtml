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
const {startServer, stopServer} = require('../serve');
const HOST = 'localhost';
const PORT = 8000;

/**
 * Download sites specified in config in order to serve them
 * from the file system (to avoid measuring inconsistent
 * node server performance)
 *
 * @return {!Promise}
 * @param {!Array<string>} urls
 */
async function cacheDocuments(urls) {
  await startServer({host: HOST, port: PORT}, {quiet: true}, {compiled: true});

  await Promise.all(
    urls.flatMap((url) => [
      downloadToDisk(url, CONTROL),
      downloadToDisk(url, EXPERIMENT),
    ])
  );

  await stopServer();
}

module.exports = cacheDocuments;
