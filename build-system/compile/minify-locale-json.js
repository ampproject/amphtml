const globby = require('globby');
const {basename, dirname} = require('path');
const {endBuildStep} = require('../tasks/helpers');
const {outputJson, readJson} = require('fs-extra');

const pattern = ['extensions/**/_locales/*.json', '!**/build/**'];

// Replaces object containing a key `string` with the value of the keyed prop,
// otherwise pased through
// - {"string": "my string", "foo": "..."}
// + "my string"
const reformat = (value) => value?.string || value;

const getMinifiedLocaleJsonFilename = (filename) =>
  `${dirname(filename)}/build/${basename(filename)}`;

const isSourceLocaleJsonFilename = (filename) =>
  filename.includes('/_locales/') &&
  !filename.includes('/_locales/build/') &&
  filename.endsWith('.json');

/**
 * Minifies locale JSON files.
 * @return {Promise}
 */
async function minifyLocaleJson() {
  const startTime = Date.now();

  const reviver = (_, value) => reformat(value);
  const filenames = globby.sync(pattern);

  await Promise.all(
    filenames.map(async (filename) => {
      const compressed = await readJson(filename, {reviver});
      const outputFilename = getMinifiedLocaleJsonFilename(filename);
      await outputJson(outputFilename, compressed);
    })
  );

  endBuildStep('Minified', `${filenames.length} locale JSON files`, startTime);
}

module.exports = {
  isSourceLocaleJsonFilename,
  getMinifiedLocaleJsonFilename,
  minifyLocaleJson,
};
