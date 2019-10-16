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

const gulp = require('gulp');
const log = require('fancy-log');
const tap = require('gulp-tap');
const {isTravisBuild} = require('../common/travis');

/**
 * Logs a message on the same line to indicate progress
 *
 * @param {string} message
 */
function logOnSameLine(message) {
  if (!isTravisBuild() && process.stdout.isTTY) {
    process.stdout.moveCursor(0, -1);
    process.stdout.cursorTo(0);
    process.stdout.clearLine();
  }
  log(message);
}

/**
 * Converts an array of globs to a list of matching files using gulp.src, which
 * can handle negative globs.
 *
 * @param {!Array<string>} globs
 * @return {!Array<string>}
 */
async function globsToFiles(globs) {
  return await new Promise(resolve => {
    const files = [];
    gulp
      .src(globs, {buffer: false, read: false})
      .pipe(
        tap(file => {
          files.push(file.path);
        })
      )
      .pipe(gulp.dest('.'))
      .on('end', () => {
        resolve(files);
      });
  });
}

module.exports = {
  logOnSameLine,
  globsToFiles,
};
