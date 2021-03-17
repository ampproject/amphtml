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
const fs = require('fs-extra');
const path = require('path');

/**
 * Directory where the babel filecache lives.
 */
const CACHE_DIR = path.resolve(__dirname, '..', '..', '.babel-cache');

/**
 * Cache for storing transformed files on both memory and on disk.
 */
class BabelTransformCache {
  /** @type {Map<string, Promise<{contents: string}>>} */
  map = new Map();

  getKey_(hash) {
    return `${hash}.json`;
  }

  /**
   * @param {string} hash
   * @return {Promise<{contents: string}|void>}
   */
  async get(hash) {
    const key = this.getKey_(hash);
    const cached = this.map.get(key);
    if (cached) {
      return cached;
    }
    const isInFileCache = await fs.exists(path.join(CACHE_DIR, key));
    if (isInFileCache) {
      const transformedPromise = fs.readJson(path.join(CACHE_DIR, key));
      this.map.set(key, transformedPromise);
      return transformedPromise;
    }
  }

  /**
   * @param {string} hash
   * @param {Promise<{contents: string}>} transformPromise
   * @return {Promise}
   */
  async set(hash, transformPromise) {
    const key = this.getKey_(hash);
    if (this.map.has(key)) {
      return;
    }

    this.map.set(key, transformPromise);
    const transformed = await transformPromise;
    await fs.outputJson(path.join(CACHE_DIR, key), transformed);
  }
}

/**
 * Used to cache babel transforms done by esbuild.
 * @private @const {!Map<string, {hash: string, promise: Promise<{contents: string}>}>}
 */
const transformCache = new BabelTransformCache();

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

  async function transformContents(filepath, contents, hash) {
    if (enableCache) {
      const cached = await transformCache.get(hash);
      if (cached) {
        return cached;
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
      transformCache.set(hash, promise);
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
