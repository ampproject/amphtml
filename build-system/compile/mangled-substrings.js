/**
 * @fileoverview
 * Collects a cache of substrings that can be mangled in source.
 *
 * We run this as a pre-processing step since files are later processed by babel
 * in an unordered way. If we were to find mangled substrings as we go, we
 * would cause the compressed size to be unstable due to frequency of substrings.
 *
 * Additionally, this allows us to optimize the compressed output size by using
 * the shortest mangled substrings as the most frequent.
 */
const dedent = require('dedent');
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
const {parse, traverse} = require('../common/acorn');

/**
 * We mangle `i-amphtml-story-*` instead of all internal substrings.
 * amp-story benefits particularly because it's very CSS-heavy. Mangling the
 * rest of the substrings in source would be risky and not yield much benefit.
 *
 * It's important that those creating substrings specific to amp-story use this
 * prefix as a general practice.
 */
const prefix = 'i-amphtml-story-';
const outputPrefix = 'i-amphtml-_';

// TODO(alanorozco): These should be prefixed on source. They're a ~250 B delta.
const specificPattern = new RegExp(
  dedent(`
    i-amphtml-tooltip-action-icon-launch
    i-amphtml-tooltip-action-icon-expand
    i-amphtml-embed-id
    i-amphtml-expanded-mode
    i-amphtml-expanded-view-close-button
    i-amphtml-expanded-component
    i-amphtml-tooltip-arrow-on-top
    i-amphtml-tooltip-text
    i-amphtml-tooltip-action-icon
    i-amphtml-outlink-cta-background-color
    i-amphtml-outlink-cta-text-color
    i-amphtml-embedded-component
    i-amphtml-orig-tabindex
    i-amphtml-current-page-has-audio
    i-amphtml-message-container
    i-amphtml-paused-display
    i-amphtml-first-page-active
    i-amphtml-last-page-active
    i-amphtml-overlay-container
    i-amphtml-gear-icon
    i-amphtml-continue-button
    i-amphtml-advance-to
    i-amphtml-return-to
    i-amphtml-visited
    i-amphtml-experiment-story-load-inactive-outside-viewport
    i-amphtml-vertical
    i-amphtml-animate-progress
    i-amphtml-progress-bar-overflow
    i-amphtml-ad-progress-exp
  `)
    .trim()
    .split('\n')
    .sort((a, b) => b.length - a.length)
    .join('|'),
  'g'
);

// Use our own charset instead since HTML classsubstrings are case insensitive
const charset = indexCharset('0123456789abcdefghijklmnopqrstuvwxyz_');

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
    pattern = new RegExp(`${prefix}[a-zA-Z0-9-]*[a-zA-Z0-9]`, 'g');
  }
  const matches = [
    ...value.matchAll(pattern),
    ...value.matchAll(specificPattern),
  ];
  for (const [substring] of matches) {
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
  if (!source.includes(prefix)) {
    return;
  }
  if (!filename.endsWith('.js')) {
    countAll(source, count);
    return;
  }
  const tree = parse(source);
  traverse(tree, (node) => {
    if (node.type === 'Literal' && typeof node.value === 'string') {
      countAll(node.value, count);
    } else if (node.type === 'TemplateElement' && node.value.cooked) {
      countAll(node.value.cooked, count);
    }
  });
}

/**
 * @return {Promise<[string, string][]>}
 */
async function collect() {
  /** @type {{[string: string]: number}} */
  const count = {};

  const filenames = await globby([
    'extensions/**/*.js',
    'extensions/**/*.css',
    '!**/build/**',
    '!**/test*/**',
  ]);

  await Promise.all(
    filenames.map(async (filename) => {
      try {
        await countInFile(filename, count);
      } catch (e) {
        e.message = `${filename}: ${e.message}`;
        throw e;
      }
    })
  );

  return (
    Object.keys(count)
      // Sort lexicographically to stabilize.
      // Otherwise, compression would result in random deltas.
      .sort()
      // Prioritize mangling by count, so that the most frequent are the shortest.
      .sort((a, b) => count[b] - count[a])
      .map((substring, i) => {
        const mangled = `${outputPrefix}${encode(i, charset)}`;
        return /** @type {[string, string]} */ ([substring, mangled]);
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
