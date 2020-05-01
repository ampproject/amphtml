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

const colors = require('ansi-colors');
const fs = require('fs');
const gulp = require('gulp');
const log = require('fancy-log');
const path = require('path');
const through2 = require('through2');

const CONFIG_PATH = 'build-system/tasks/performance/config.json';
const LOCAL_HOST_URL = 'http://localhost:8000/';

/**
 * Throws an error with the given message. Duplicate function
 * located in check-sourcemaps.js
 *
 * @param {string} message
 */
function throwError(message) {
  const err = new Error(message);
  err.showStack = false;
  throw err;
}

/**
 * Entry point for 'gulp performance-urls'
 * Check if all localhost urls in performance/config.json exist
 * @return {!Promise}
 */
async function performanceUrls() {
  return gulp.src([CONFIG_PATH]).pipe(
    through2.obj(function (file) {
      let obj;
      try {
        obj = JSON.parse(file.contents.toString());
      } catch (e) {
        log(colors.yellow(`Could not parse ${CONFIG_PATH}. `));
        throwError(`Could not parse ${CONFIG_PATH}. `);
        return;
      }
      const filepaths = obj.handlers.flatMap((handler) =>
        handler.urls
          .filter((url) => url.startsWith(LOCAL_HOST_URL))
          .map((url) =>
            path.join(__dirname, '../../', url.split(LOCAL_HOST_URL)[1])
          )
      );
      for (const filepath of filepaths) {
        if (!fs.existsSync(filepath)) {
          log(colors.red(filepath + ' does not exist.'));
          throwError(`${filepath} does not exist.`);
          return;
        }
      }
      log(
        colors.green('SUCCESS:'),
        'All local performance task urls are valid.'
      );
    })
  );
}

module.exports = {
  performanceUrls,
};

performanceUrls.description =
  "Check validity of performance task config's urls";
