/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
'use strict';

const colors = require('ansi-colors');
const gulp = require('gulp');
const log = require('fancy-log');
const through2 = require('through2');

const expectedCaches = ['google'];

const cachesJsonPath = 'build-system/global-configs/caches.json';

/**
 * Fail if build-system/global-configs/caches.json is missing some expected
 * caches.
 * @return {!Promise}
 */
async function cachesJson() {
  return gulp.src([cachesJsonPath]).pipe(
    through2.obj(function (file) {
      let obj;
      try {
        obj = JSON.parse(file.contents.toString());
      } catch (e) {
        log(
          colors.yellow(
            `Could not parse ${cachesJsonPath}. ` +
              'This is most likely a fatal error that ' +
              'will be found by checkValidJson'
          )
        );
        return;
      }
      const foundCaches = [];
      for (const foundCache of obj.caches) {
        foundCaches.push(foundCache.id);
      }
      for (const cache of expectedCaches) {
        if (!foundCaches.includes(cache)) {
          log(
            colors.red(
              'Missing expected cache "' + cache + `" in ${cachesJsonPath}`
            )
          );
          process.exitCode = 1;
        }
      }
    })
  );
}

module.exports = {
  cachesJson,
};

cachesJson.description =
  'Check that some expected caches are included in caches.json.';
