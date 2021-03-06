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

const babel = require('@babel/core');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Used to cache babel transforms done by esbuild.
 * @private @const {!Map<string, {hash: string, promise: Promise<{contents: string}>}>}
 */
const transformCache = new Map();

/**
 * Used to cache file reads done by esbuild, since it can issue multiple
 * "loads" per file. This batches consecutive reads into a single, and then
 * clears its cache item for the next load.
 * @private @const {!Map<string, Promise<{hash: string, contents: string}>>}
 */
const readCache = new Map();

/**
 * Creates a babel plugin for esbuild for the given caller. Optionally enables
 * caching to speed up transforms.
 * @param {string} callerName
 * @param {boolean} enableCache
 * @param {function()} preSetup
 * @param {function()} postLoad
 * @return {!Object}
 */
function getEsbuildBabelPlugin(
  callerName,
  enableCache,
  preSetup = () => {},
  postLoad = () => {}
) {
  function sha256(contents) {
    if (!enableCache) {
      return '';
    }
    const hash = crypto.createHash('sha256');
    hash.update(callerName);
    hash.update(contents);
    return hash.digest('hex');
  }

  function batchedRead(path) {
    let read = readCache.get(path);
    if (!read) {
      read = fs.promises
        .readFile(path)
        .then((contents) => {
          return {
            contents,
            hash: sha256(contents),
          };
        })
        .finally(() => {
          readCache.delete(path);
        });
      readCache.set(path, read);
    }
    return read;
  }

  function transformContents(filepath, contents, hash) {
    if (enableCache) {
      const cached = transformCache.get(filepath);
      if (cached && cached.hash === hash) {
        return cached.promise;
      }
    }

    const babelOptions =
      babel.loadOptions({
        caller: {name: callerName},
        filename: filepath,
        sourceFileName: path.basename(filepath),
      }) || undefined;
    const promise = babel
      .transformAsync(contents, babelOptions)
      .then((result) => {
        return {contents: result.code};
      });

    if (enableCache) {
      transformCache.set(filepath, {hash, promise});
    }

    return promise.finally(postLoad);
  }

  return {
    name: 'babel',
    async setup(build) {
      preSetup();

      build.onLoad({filter: /\.[cm]?js$/, namespace: ''}, async (file) => {
        const {path} = file;
        const {contents, hash} = await batchedRead(path);
        return transformContents(path, contents, hash);
      });
    },
  };
}

module.exports = {
  getEsbuildBabelPlugin,
};
