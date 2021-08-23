import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = fileURLToPath(path.dirname(import.meta.url));

/**
 * Cache for storing transformed files on both memory and on disk.
 */
export class TransformCache {
  /**
   * @param {string} cacheName
   * @param {string} fileExtension
   */
  constructor(cacheName, fileExtension) {
    /** @type {string} */
    this.fileExtension = fileExtension;

    /** @type {string} */
    this.cacheDir = path.resolve(__dirname, '..', '..', cacheName);
    fs.ensureDirSync(this.cacheDir);

    /** @type {Map<string, Promise<Buffer|string>>} */
    this.transformMap = new Map();

    /** @type {Set<string>} */
    this.fsCache = new Set(fs.readdirSync(this.cacheDir));
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
      throw new Error('Read race: Attempting to transform a file twice.');
    }
    this.transformMap.set(hash, transformPromise);
    const filepath = path.join(this.cacheDir, hash) + this.fileExtension;
    transformPromise.then((contents) => fs.outputFile(filepath, contents));
  }
}

/**
 * Returns the md5 hash of provided args.
 *
 * @param {...(string|Buffer)} args
 * @return {string}
 */
export function md5(...args) {
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
 * @param {string=} optionsHash
 * @return {Promise<ReadResult>}
 */
export function batchedRead(path, optionsHash) {
  let read = readCache.get(path);
  if (!read) {
    read = fs
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
