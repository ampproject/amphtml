/**
 * @fileoverview
 * Collects a cache of substrings that can be mangled in source.
 *
 * We run this as a pre-processing step since files are later processed by babel
 * in an unordered way. If we were to find mangleable substrings as we go, we
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
const {endBuildStep} = require('../tasks/helpers');
const {getStdout} = require('../common/process');
const {parse, traverse} = require('../common/acorn');

/**
 * We mangle `i-amphtml-story-*` instead of all internal substrings since
 * amp-story benefits particularly because it's very CSS-heavy. Mangling the
 * rest of the substrings present in source would be risky and not yield much
 * benefit.
 *
 * It's important that those creating amp-story specific substrings follow use
 * this prefix as a general practice.
 */
const prefix = 'i-amphtml-story-';
const outputPrefix = 'i-amphtml--';

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

// Use our own charset instead of base62 since HTML classsubstrings are case insensitive
const CHARSET = '0123456789abcdefghijklmnopqrstuvwxyz-'.split('');

/**
 * @param {number} int
 * @return {string}
 */
function encode(int) {
  if (int === 0) {
    return CHARSET[0];
  }
  const {length} = CHARSET;
  let res = '';
  while (int > 0) {
    res = CHARSET[int % length] + res;
    int = Math.floor(int / length);
  }
  return res;
}

const cacheFilename = `build/${basename(__filename).split('.', 1)[0]}.json`;

/**
 * @return {Promise}
 */
async function collectMangleableSubstrings() {
  if (pathExistsSync(cacheFilename)) {
    return;
  }
  const startTime = Date.now();
  const result = await collect();
  await outputJson(cacheFilename, result, {spaces: 2});
  endBuildStep('Wrote', cacheFilename, startTime);
}

/**
 * @return {Promise<[string, string][]>}
 */
async function collect() {
  const frequency = {};

  let pattern;
  /**
   * @param {string} value
   */
  function addAll(value) {
    if (!pattern) {
      pattern = new RegExp(`${prefix}[a-zA-Z0-9-]*[a-zA-Z0-9]`, 'g');
    }
    const matches = [
      ...value.matchAll(pattern),
      ...value.matchAll(specificPattern),
    ];
    for (const [name] of matches) {
      frequency[name] = frequency[name] || 0;
      frequency[name]++;
    }
  }

  const possibleFiles = globby.sync([
    'build/**/*.css.js',
    'extensions/**/*.js',
    '!extensions/**/build/**',
    '!extensions/**/test*/**',
  ]);

  const filesIncludingString = getStdout(
    `grep -irl "${prefix}" ${possibleFiles.join(' ')}`
  )
    .trim()
    .split('\n');

  await Promise.all(
    filesIncludingString.map(async (filename) => {
      let tree;
      try {
        const source = await readFile(filename, 'utf8');
        tree = parse(source);
      } catch (e) {
        e.message = `${filename}: ${e.message}`;
        throw e;
      }
      traverse(tree, (node) => {
        if (node.type === 'Literal' && typeof node.value === 'string') {
          addAll(node.value);
        } else if (node.type === 'TemplateElement' && node.value.cooked) {
          addAll(node.value.cooked);
        }
      });
    })
  );

  return (
    Object.keys(frequency)
      // We need the order to be stable, so we sort lexicographically first.
      .sort()
      // Then generate by frequency, so that the most frequent are the shortest.
      .sort((a, b) => frequency[b] - frequency[a])
      .map((substring, i) => {
        const mangled = `${outputPrefix}${encode(i)}`;
        return /** @type {[string, string]} */ ([substring, mangled]);
      })
      // Finally, output sorted by length to prevent replacing sub-substrings.
      .sort(([a], [b]) => b.length - a.length)
  );
}

let cache;

/**
 * Replaces mangled substrings.
 * Has to be sync due to babel.
 * @param {string} string
 * @return {string}
 */
function replaceMangledSubstrings(string) {
  if (!cache) {
    if (!pathExistsSync(cacheFilename)) {
      return string;
    }
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
  collectMangleableSubstrings,
  cacheFilename,
  replaceMangledSubstrings,
};
