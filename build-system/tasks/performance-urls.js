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
const path = require('path');
const {green, red, cyan} = require('kleur/colors');
const {log} = require('../common/logging');

const CONFIG_PATH = './performance/config.json';
const LOCAL_HOST_URL = 'http://localhost:8000/';

/**
 * Entry point for 'amp performance-urls'
 * Check if all localhost urls in performance/config.json exist
 */
async function performanceUrls() {
  let jsonContent;
  try {
    jsonContent = require(CONFIG_PATH);
  } catch (e) {
    log(red('ERROR:'), 'Could not parse', cyan(CONFIG_PATH));
    process.exitCode = 1;
    return;
  }
  const filepaths = jsonContent.handlers.flatMap((handler) =>
    handler.urls
      .filter((url) => url.startsWith(LOCAL_HOST_URL))
      .map((url) =>
        path.join(__dirname, '../../', url.split(LOCAL_HOST_URL)[1])
      )
  );
  for (const filepath of filepaths) {
    if (!fs.existsSync(filepath)) {
      log(red('ERROR:'), cyan(filepath), 'does not exist');
      process.exitCode = 1;
      return;
    }
  }
  log(green('SUCCESS:'), 'All local performance task urls are valid.');
}

module.exports = {
  performanceUrls,
};

performanceUrls.description =
  "Check validity of performance task config's urls";
