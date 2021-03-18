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

let totalTimeHashing = 0;
let totalTimeTransforming = 0;
let totalTimeReadingFromFsCache = 0;
let totalTimeReadingFromRAMCache = 0;
let filesRead = 0;
let filesReadFromMem = 0;
let filesReadFromFsCache = 0;
let timeReading = 0;

function printStats() {
  console.log(`Hashing: ${totalTimeHashing}ms`);
  console.log(`Transforming: ${totalTimeTransforming}ms`);
  console.log(`BatchRead ${filesRead} files in ${timeReading}ms.`);
  console.log(
    `Read ${filesReadFromFsCache} files from fs cache: ${totalTimeReadingFromFsCache}ms`
  );
  console.log(
    `Read ${filesReadFromMem} files from mem cache: ${totalTimeReadingFromRAMCache}ms.`
  );
}

/**
 * Directory where the babel filecache lives.
 */
const CACHE_DIR = path.resolve(__dirname, '..', '..', '.babel-cache');

/**
 * Cache for storing transformed files on both memory and on disk.
 */
class BabelTransformCache {
  constructor() {
    fs.ensureDirSync(CACHE_DIR);

    /** @type {Map<string, Promise<{contents: string}>>} */
    this.map = new Map();

    /** @type {Set<string>} */
    this.fsCache = new Set(fs.readdirSync(CACHE_DIR));
  }

  getKey_(hash) {
    return `${hash}.json`;
  }

  /**
   * @param {string} hash
   * @return {null|Promise<{contents: string}>}
   */
  get(hash) {
    const start = Date.now();
    const key = this.getKey_(hash);
    const cached = this.map.get(key);
    if (cached) {
      filesReadFromMem++;
      cached.finally(() => {
        totalTimeReadingFromRAMCache += Date.now() - start;
      });
      return cached;
    }
    if (this.fsCache.has(key)) {
      filesReadFromFsCache++;
      const transformedPromise = fs.readJson(path.join(CACHE_DIR, key));
      this.map.set(key, transformedPromise);
      transformedPromise.finally(() => {
        totalTimeReadingFromFsCache += Date.now() - start;
      });
      return transformedPromise;
    }
    return null;
  }

  /**
   * @param {string} hash
   * @param {Promise<{contents: string}>} transformPromise
   */
  set(hash, transformPromise) {
    const key = this.getKey_(hash);
    if (this.map.has(key)) {
      throw new Error(
        `Read race occured. Attempting to transform a file twice.`
      );
    }

    this.map.set(key, transformPromise);
    transformPromise.then((contents) => {
      fs.outputJson(path.join(CACHE_DIR, key), contents);
    });
  }
}

/**
 * Used to cache babel transforms done by esbuild.
 * @const {!BabelTransformCache}
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
  function md5(obj) {
    if (!enableCache) {
      return '';
    }
    const startTime = Date.now();
    let h = crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex');
    totalTimeHashing += Date.now() - startTime;
    return h;
  }

  /**
   * @param {string} path
   * @param {string} optionsHash
   * @returns {{contents: string, hash: string}}
   */
  function batchedRead(path, optionsHash) {
    const start = Date.now();
    let read = readCache.get(path);
    if (!read) {
      filesRead++;
      read = fs.promises
        .readFile(path, 'utf8')
        .then((contents) => ({
          contents,
          hash: md5({contents, optionsHash}),
        }))
        .finally(() => {
          readCache.delete(path);
        });
      readCache.set(path, read);
    }
    read.finally(() => {
      timeReading += Date.now() - start;
    });
    return read;
  }

  function transformContents(contents, hash, babelOptions) {
    let start = Date.now();
    if (enableCache) {
      const cached = transformCache.get(hash);
      if (cached) {
        return cached;
      }
    }

    const promise = babel
      .transformAsync(contents, babelOptions)
      .then((result) => {
        return {contents: result.code};
      });

    if (enableCache) {
      transformCache.set(hash, promise);
    }
    promise.finally(() => {
      totalTimeTransforming += Date.now() - start;
    });

    return promise.finally(postLoad);
  }

  return {
    name: 'babel',

    async setup(build) {
      const start = Date.now();
      preSetup();

      const babelOptions =
        babel.loadOptions({caller: {name: callerName}}) || {};
      const optionsHash = md5(babelOptions);

      build.onLoad({filter: /\.[cm]?js$/, namespace: ''}, async (file) => {
        const filename = file.path;
        const {contents, hash} = await batchedRead(filename, optionsHash);
        return transformContents(contents, hash, {
          ...babelOptions,
          filename,
          filenameRelative: path.basename(filename),
        });
      });

      console.log(`Time in setup(): ${Date.now() - start}ms`);
    },
  };
}

module.exports = {
  getEsbuildBabelPlugin,
  printStats,
};
