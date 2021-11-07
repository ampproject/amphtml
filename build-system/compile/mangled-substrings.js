/**
 * @fileoverview
 * Collects a cache of substrings that can be mangled in source.
 *
 * We run this as a pre-processing step since files are later processed by babel
 * in an unordered way. If we were to find mangled substrings as we go, we
 * would cause the compressed size to be unstable due to frequency of substrings.
 */
const globby = require('globby');
const {
  outputJson,
  pathExistsSync,
  readFile,
  readJsonSync,
} = require('fs-extra');
const {basename} = require('path');
const {encode, indexCharset} = require('base62/lib/custom');
const {endBuildStep} = require('../tasks/helpers');

const prefix = 'i-amphtml-';

/**
 * We mangle names found exclusively in `extensions/amp-story*`.
 * amp-story benefits particularly because it's very CSS-heavy. Mangling the
 * rest of the substrings in source would be risky and not yield much benefit.
 */
const exclusivelyFilenamesIncluding = 'extensions/amp-story';

const sourceGlob = [
  'css/**/*.css',
  'extensions/**/*.js',
  'extensions/**/*.css',
  'src/**/*.js',
  'src/**/*.css',
  '3p/**/*.js',
  '3p/**/*.css',
  '!**/build/**',
  '!**/test*/**',
];

// Use our own charset instead since HTML classsubstrings are case insensitive
const charset = indexCharset('0123456789abcdefghijklmnopqrstuvwxyz_');

// Add underscore at the end to prevent collisions by convention.
const mangle = (i) => `${prefix}${encode(i, charset)}_`;

const realCacheFilename = `build/${basename(__filename).split('.', 1)[0]}.json`;

/**
 * @return {Promise}
 */
async function collectMangledSubstrings() {
  if (pathExistsSync(realCacheFilename)) {
    return;
  }
  const startTime = Date.now();
  const result = await collect();
  await outputJson(realCacheFilename, result, {spaces: 2});
  endBuildStep('Wrote', realCacheFilename, startTime);
}

let pattern;

/**
 * @param {string} value
 * @param {{[string: string]: number}} count
 */
function countAll(value, count) {
  if (!pattern) {
    pattern = new RegExp(
      // We avoid ending dashes in first match to ignore compound/generated
      // classnames. Require end or special character around match in order to
      // delimit an ident.
      `([^-a-zA-Z0-9]|^)(${prefix}[a-zA-Z0-9-]*[a-zA-Z0-9])([^-a-zA-Z0-9]|$)`,
      'g'
    );
  }
  const matches = value.matchAll(pattern);
  for (const [, , substring] of matches) {
    count[substring] = count[substring] || 0;
    count[substring]++;
  }
}

/**
 * @param {string} filename
 * @param {{[string: string]: number}} count
 * @return {Promise<void>}
 */
async function countInFile(filename, count) {
  const source = await readFile(filename, 'utf8');
  if (source.includes(prefix)) {
    countAll(source, count);
  }
}

/**
 * @return {Promise<[string, string][]>}
 */
async function collect() {
  /** @type {{[string: string]: number}} */
  const includeCount = {};

  /** @type {{[string: string]: number}} */
  const excludeCount = {};

  const filenames = await globby(sourceGlob);

  await Promise.all(
    filenames.map(async (filename) => {
      try {
        await countInFile(
          filename,
          filename.includes(exclusivelyFilenamesIncluding)
            ? includeCount
            : excludeCount
        );
      } catch (e) {
        e.message = `${filename}: ${e.message}`;
        throw e;
      }
    })
  );

  for (const substring in excludeCount) {
    delete includeCount[substring];
  }

  return (
    Object.keys(includeCount)
      // Sort lexicographically to stabilize.
      // Otherwise, compression would result in random deltas.
      .sort()
      // Prioritize mangling by count, so that the most frequent are the shortest.
      .sort((a, b) => includeCount[b] - includeCount[a])
      .map((substring, i) => {
        return /** @type {[string, string]} */ ([substring, mangle(i)]);
      })
      // Finally, sort by longest first to prevent replacing sub-substrings.
      .sort(([a], [b]) => b.length - a.length)
  );
}

let cache;
let resolvedCachedFilename;

/**
 * Replaces mangled substrings.
 * Has to be sync due to babel.
 * @param {string} string
 * @param {string} cacheFilename
 * @return {string}
 */
function replaceMangledSubstrings(string, cacheFilename = realCacheFilename) {
  if (!cache || resolvedCachedFilename !== cacheFilename) {
    if (!pathExistsSync(cacheFilename)) {
      return string;
    }
    resolvedCachedFilename = cacheFilename;
    cache = readJsonSync(cacheFilename).map(([key, value]) => [
      new RegExp(key, 'g'),
      value,
    ]);
  }
  for (const [from, to] of cache) {
    string = string.replace(from, to);
  }
  return string;
}

module.exports = {
  collectMangledSubstrings,
  replaceMangledSubstrings,
};
