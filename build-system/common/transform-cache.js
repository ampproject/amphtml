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

const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');

/**
 * Cache for storing transformed files on both memory and on disk.
 */
class TransformCache {
  constructor(cacheDir, fileExtension) {
    /** @type {string} */
    this.fileExtension = fileExtension;

    /** @type {string} */
    this.cacheDir = cacheDir;
    fs.ensureDirSync(cacheDir);

    /** @type {Map<string, Promise<Buffer|string>>} */
    this.transformMap = new Map();

    /** @type {Set<string>} */
    this.fsCache = new Set(fs.readdirSync(cacheDir));
  }

  /**
   * @param {string} hash
   * @return {null|Promise<Buffer|string>}
   */
  get(hash) {
    const cached = this.transformMap.get(hash);
    if (cached) {
      return cached;
    }
    const filename = hash + this.fileExtension;
    if (this.fsCache.has(filename)) {
      const transformedPromise = fs.readFile(
        path.join(this.cacheDir, filename)
      );
      this.transformMap.set(hash, transformedPromise);
      return transformedPromise;
    }
    return null;
  }

  /**
   * @param {string} hash
   * @param {Promise<string>} transformPromise
   */
  set(hash, transformPromise) {
    if (this.transformMap.has(hash)) {
      throw new Error(
        `Read race occured. Attempting to transform a file twice.`
      );
    }

    this.transformMap.set(hash, transformPromise);
    const filepath = path.join(this.cacheDir, hash) + this.fileExtension;
    transformPromise.then((contents) => {
      fs.outputFile(filepath, contents);
    });
  }
}

/**
 * Returns the md5 hash of provided args.
 *
 * @param {...(string|Buffer)} args
 * @return {string}
 */
function md5(...args) {
  const hash = crypto.createHash('md5');
  for (const a of args) {
    hash.update(a);
  }
  return hash.digest('hex');
}

/**
 * Used to cache file reads, since some (esbuild) will have multiple
 * "loads" per file. This batches consecutive reads into a single, and then
 * clears its cache item for the next load.
 * @private @const {!Map<string, Promise<{hash: string, contents: string}>>}
 */
const readCache = new Map();

/**
 * Returns the string contents and hash of the file at the specified path.
 * If multiple reads are requested for the same file before the first read has completed,
 * the result will be reused.
 *
 * @param {string} path
 * @param {string=} optionsHash
 * @return {{contents: string, hash: string}}
 */
function batchedRead(path, optionsHash) {
  let read = readCache.get(path);
  if (!read) {
    read = fs.promises
      .readFile(path)
      .then((contents) => ({
        contents,
        hash: md5(contents, optionsHash ?? ''),
      }))
      .finally(() => {
        readCache.delete(path);
      });
    readCache.set(path, read);
  }

  return read;
}

module.exports = {TransformCache, batchedRead, md5};
