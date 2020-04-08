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
const {CONTROL, EXPERIMENT, RESULTS_PATH} = require('./helpers');

/**
 * Writes measurements to ./results.json
 *
 * @param {Array<string>} urls
 * @param {Object} results
 */
function writeMetrics(urls, results) {
  try {
    fs.unlinkSync(RESULTS_PATH);
  } catch {} // file does not exist (first run)

  const writtenResults = {};
  urls.forEach((url) => {
    writtenResults[url] = {
      [CONTROL]: results[CONTROL][url],
      [EXPERIMENT]: results[EXPERIMENT][url],
    };
  });
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(writtenResults));
}

module.exports = writeMetrics;
