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
  constructor() {
    fs.ensureDirSync(CACHE_DIR);

    /** @type {Map<string, Promise<Buffer|string>>} */
    this.map = new Map();

    /** @type {Set<string>} */
    this.fsCache = new Set(fs.readdirSync(CACHE_DIR));
  }

  /**
   * @param {string} hash
   * @return {null|Promise<Buffer|string>}
   */
  get(hash) {
    const cached = this.map.get(hash);
    if (cached) {
      return cached;
    }
    if (this.fsCache.has(hash)) {
      const transformedPromise = fs.readFile(path.join(CACHE_DIR, hash));
      this.map.set(hash, transformedPromise);
      return transformedPromise;
    }
    return null;
  }

  /**
   * @param {string} hash
   * @param {Promise<string>} transformPromise
   */
  set(hash, transformPromise) {
    if (this.map.has(hash)) {
      throw new Error(
        `Read race occured. Attempting to transform a file twice.`
      );
    }

    this.map.set(hash, transformPromise);
    transformPromise.then((contents) => {
      fs.outputFile(path.join(CACHE_DIR, hash), contents);
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
  function md5(...args) {
    if (!enableCache) {
      return '';
    }
    const hash = crypto.createHash('md5');
    for (const a of args) {
      hash.update(a);
    }
    return hash.digest('hex');
  }

  /**
   * @param {string} path
   * @param {string} optionsHash
   * @return {{contents: string, hash: string}}
   */
  function batchedRead(path, optionsHash) {
    let read = readCache.get(path);
    if (!read) {
      read = fs.promises
        .readFile(path)
        .then((contents) => ({
          contents,
          hash: md5(contents, optionsHash),
        }))
        .finally(() => {
          readCache.delete(path);
        });
      readCache.set(path, read);
    }

    return read;
  }

  function transformContents(contents, hash, babelOptions) {
    if (enableCache) {
      const cached = transformCache.get(hash);
      if (cached) {
        return cached;
      }
    }

    const promise = babel
      .transformAsync(contents, babelOptions)
      .then((result) => result.code);

    if (enableCache) {
      transformCache.set(hash, promise);
    }

    return promise.finally(postLoad);
  }

  return {
    name: 'babel',

    async setup(build) {
      preSetup();

      const babelOptions =
        babel.loadOptions({caller: {name: callerName}}) || {};
      const optionsHash = md5(
        JSON.stringify({babelOptions, argv: process.argv.slice(2)})
      );

      build.onLoad({filter: /\.[cm]?js$/, namespace: ''}, async (file) => {
        const filename = file.path;
        const {contents, hash} = await batchedRead(filename, optionsHash);
        const transformed = await transformContents(contents, hash, {
          ...babelOptions,
          filename,
          filenameRelative: path.basename(filename),
        });
        return {contents: transformed};
      });
    },
  };
}

module.exports = {
  getEsbuildBabelPlugin,
};
