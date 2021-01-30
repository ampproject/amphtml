/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

const browserifyPersistFs = require('browserify-persist-fs');
const crypto = require('crypto');
const fs = require('fs-extra');
const globby = require('globby');
const {dotWrappingWidth} = require('./logging');

/**
 * The hash object includes the repo package lockfile and various parts of the
 * build-system so that the cache is invalidated if any of them changes, and
 * files are retransformed.
 * @return {!Object}
 */
function getHashObject() {
  const createHash = (input) =>
    crypto.createHash('sha1').update(input).digest('hex');
  const hashObject = {
    deps: createHash(fs.readFileSync('./package-lock.json')),
    build: globby
      .sync([
        'build-system/**/*.js',
        '!build-system/eslint-rules',
        '!**/test/**',
      ])
      .map((f) => createHash(fs.readFileSync(f))),
  };
  return hashObject;
}

/**
 * Used for persistent babel caching during tests.
 * @return {function}
 */
function getPersistentBrowserifyCache() {
  let wrapCounter = 0;
  const logger = () => {
    process.stdout.write('.');
    if (++wrapCounter >= dotWrappingWidth) {
      wrapCounter = 0;
      process.stdout.write('\n');
    }
  };
  const cache = browserifyPersistFs('.karma-cache', getHashObject(), logger);
  cache.gc(
    {maxAge: 1000 * 60 * 60 * 24 * 7}, // Refresh cache if more than a week old
    () => {} // swallow errors
  );
  return cache;
}

module.exports = {
  getHashObject,
  getPersistentBrowserifyCache,
};
