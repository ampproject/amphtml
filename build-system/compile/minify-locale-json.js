const globby = require('globby');
const {basename, dirname} = require('path');
const {endBuildStep} = require('../tasks/helpers');
const {outputJson, readJson} = require('fs-extra');

const pattern = ['extensions/**/_locales/*.json', '!**/build/**'];

// Replaces object containing a key `string` with the value of the keyed prop,
// otherwise pased through
// - {"string": "my string", "foo": "..."}
// + "my string"
const reformat = (value) =>
  // Always default to original `value` since `reformat()` is called for any
  // property pair, including the higher-level containing object.
  value?.string || value;

const getMinifiedLocaleJsonFilename = (filename) =>
  `${dirname(filename)}/build/${basename(filename)}`;

const isSourceLocaleJsonFilename = (filename) =>
  filename.includes('/_locales/') &&
  !filename.includes('/_locales/build/') &&
  filename.endsWith('.json');

/**
 * @param {string} filename
 * @return {Promise}
 */
async function minifyLocaleJsonFile(filename) {
  const reviver = (_, value) => reformat(value);
  const output = await readJson(filename, {reviver});
  const outputFilename = getMinifiedLocaleJsonFilename(filename);
  await outputJson(outputFilename, output);
}

/**
 * Minifies all locale JSON files.
 * @return {Promise}
 */
async function minifyLocaleJson() {
  const startTime = Date.now();
  const filenames = globby.sync(pattern);
  await Promise.all(filenames.map(minifyLocaleJsonFile));
  endBuildStep('Minified', `${filenames.length} locale JSON files`, startTime);
}

module.exports = {
  isSourceLocaleJsonFilename,
  getMinifiedLocaleJsonFilename,
  minifyLocaleJson,
};
