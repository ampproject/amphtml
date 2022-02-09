const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');

/**
 * Used to bust caches when the TransformCache makes a breaking change to the API.
 */
const API_VERSION = 2;

/**
 * Cache for storing transformed files on both memory and on disk.
 * @template T
 */
class TransformCache {
  /**
   * @param {string} cacheName
   */
  constructor(cacheName) {
    /** @type {string} */
    this.cacheDir = path.resolve(__dirname, '..', '..', cacheName);
    fs.ensureDirSync(this.cacheDir);

    /** @type {Map<string, Promise<T>>} */
    this.transformMap = new Map();

    /** @type {Set<string>} */
    this.fsCache = new Set(fs.readdirSync(this.cacheDir));
  }

  /**
   * @param {string} hash
   * @return {null|Promise<T>}
   */
  get(hash) {
    const cached = this.transformMap.get(hash);
    if (cached) {
      return cached;
    }

    const filename = this.key_(hash);
    if (this.fsCache.has(filename)) {
      const persisted = fs.readJson(path.join(this.cacheDir, filename));
      this.transformMap.set(hash, persisted);
      return persisted;
    }

    return null;
  }

  /**
   * @param {string} hash
   * @param {Promise<T>} transformPromise
   */
  set(hash, transformPromise) {
    if (this.transformMap.has(hash)) {
      throw new Error(`Read race: Attempting to transform ${hash} file twice.`);
    }
    this.transformMap.set(hash, transformPromise);

    const filepath = path.join(this.cacheDir, this.key_(hash));
    transformPromise.then((contents) => fs.outputJson(filepath, contents));
  }

  /**
   * @param {string} hash
   * @return {string}
   * @private
   */
  key_(hash) {
    return `${API_VERSION}_${hash}.json`;
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
 * @typedef {{hash: string, contents: string}} ReadResult
 */

/**
 * Used to cache file reads, since some (esbuild) will have multiple "loads" per
 * file. This batches consecutive reads into a single, and then clears its cache
 * item for the next load.
 * @private @const {!Map<string, Promise<ReadResult>>}
 */
const readCache = new Map();

/**
 * Returns the string contents and hash of the file at the specified path. If
 * multiple reads are requested for the same file before the first read has
 * completed, the result will be reused.
 *
 * @param {string} path
 * @return {Promise<ReadResult>}
 */
function batchedRead(path) {
  let read = readCache.get(path);
  if (!read) {
    read = fs
      .readFile(path)
      .then((contents) => ({
        contents,
        hash: md5(contents),
      }))
      .finally(() => {
        readCache.delete(path);
      });
    readCache.set(path, read);
  }

  return read;
}

module.exports = {
  batchedRead,
  md5,
  TransformCache,
};
