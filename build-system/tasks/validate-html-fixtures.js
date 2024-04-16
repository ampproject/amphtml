'using strict';

const argv = require('minimist')(process.argv.slice(2));
const posthtml = require('posthtml');
const {
  log,
  logLocalDev,
  logWithoutTimestamp,
  logWithoutTimestampLocalDev,
} = require('../common/logging');
const {cyan, green, red} = require('kleur/colors');
const {getFilesToCheck} = require('../common/utils');
const {getOutput} = require('../common/process');
const {htmlFixtureGlobs} = require('../test-configs/config');
const {pathExists, readFile} = require('fs-extra');

const defaultFormat = 'AMP';

// Note that the two lightning bolt emojis are encoded differently.
// https://github.com/ampproject/amphtml/issues/25990
const formatPrefixes = ['amp', '⚡️', '⚡'];
const formatSuffixes = ['4ads', '4email'];

/**
 * @param {posthtml.Node} tree
 * @return {string}
 */
function posthtmlGetAmpFormat(tree) {
  let format = defaultFormat;
  tree.match({tag: 'html'}, (node) => {
    for (const prefix of formatPrefixes) {
      for (const suffix of formatSuffixes) {
        const attrValue = node.attrs[prefix + suffix];
        if (attrValue === '' || attrValue === true) {
          format = 'AMP' + suffix.toUpperCase();
        }
      }
    }
    return node;
  });
  return format;
}

/**
 * Gets the AMP format type for the given HTML file by parsing its contents and
 * examining the root element.
 * @param {string} file
 * @return {Promise<string>}
 */
async function getAmpFormat(file) {
  const source = await readFile(file, 'utf8');
  if (!formatSuffixes.some((suffix) => source.includes(suffix))) {
    return defaultFormat;
  }
  const result = await posthtml([posthtmlGetAmpFormat]).process(source);
  return result.html.trim();
}

/**
 * Separates the list of files to check into groups based on their AMP formats.
 * @param {Array<string>} filesToCheck
 * @return {Promise<Object>}
 */
async function getFileGroups(filesToCheck) {
  logLocalDev(green('Sorting HTML fixtures into format groups...'));
  const fileGroups = {AMP4ADS: [], AMP4EMAIL: [], AMP: []};
  await Promise.all(
    filesToCheck.map(async (file) =>
      fileGroups[await getAmpFormat(file)].push(file)
    )
  );
  return fileGroups;
}

/**
 * Checks for the existence of a local wasm / js validator binary and returns
 * its location. Defaults to the wasm binary on the CDN.
 * @return {Promise<string>}
 */
async function getValidatorJs() {
  const localWasmValidatorPath =
    'validator/bazel-bin/cpp/engine/wasm/validator_js_bin.js';
  const localJsValidatorPath = 'validator/dist/validator_minified.js';
  if (await pathExists(localWasmValidatorPath)) {
    log('Using the', cyan('locally built wasm validator') + '...');
    return localWasmValidatorPath;
  }
  if (await pathExists(localJsValidatorPath)) {
    log('Using the', cyan('locally built js validator') + '...');
    return localJsValidatorPath;
  }
  log('Using the', cyan('wasm validator from the CDN') + '...');
  logLocalDev(
    '⤷ To use a locally built wasm or js validator,',
    'run the build command from',
    cyan('validator/README.md') + '.'
  );
  return 'https://cdn.ampproject.org/v0/validator_wasm.js'; // eslint-disable-line local/no-forbidden-terms
}

/**
 * Runs amphtml-validator on the given list of files and prints results.
 *
 * @param {Array<string>} filesToCheck
 * @return {Promise<void>}
 */
async function runCheck(filesToCheck) {
  const validatorJs = await getValidatorJs();
  const fileGroups = await getFileGroups(filesToCheck);
  const formats = Object.keys(fileGroups);
  let foundValidationErrors = false;
  for (const format of formats) {
    if (fileGroups[format].length == 0) {
      continue;
    }
    const files = fileGroups[format].sort().join(' ');
    logLocalDev(green('Validating'), cyan(format), green('fixtures...'));
    const validatorCmd = 'FORCE_COLOR=1 npx amphtml-validator';
    const validatorJsArg = `--validator_js ${validatorJs}`;
    const htmlFormatArg = `--html_format ${format}`;
    const validateFixturesCmd = `${validatorCmd} ${validatorJsArg} ${htmlFormatArg} ${files}`;
    const result = getOutput(validateFixturesCmd);
    logWithoutTimestampLocalDev(result.stdout);
    if (result.stderr) {
      logWithoutTimestamp(result.stderr);
      log(red('ERROR:'), 'Found errors in', cyan(format), 'fixtures.');
      foundValidationErrors = true;
    }
  }
  if (foundValidationErrors) {
    log('Please address the errors listed above.');
    throw new Error('Validation failed.');
  }
  log(green('SUCCESS:'), 'All HTML fixtures are valid.');
}

/**
 * Makes sure that HTML fixtures used during tests contain valid AMPHTML.
 * @return {Promise<void>}
 */
async function validateHtmlFixtures() {
  const globs = argv.include_skipped
    ? htmlFixtureGlobs.filter((glob) => !glob.startsWith('!'))
    : htmlFixtureGlobs;
  const filesToCheck = getFilesToCheck(globs, {}, '.gitignore');
  if (filesToCheck.length == 0) {
    return;
  }
  await runCheck(filesToCheck);
}

module.exports = {
  validateHtmlFixtures,
};

validateHtmlFixtures.description =
  'Make sure that HTML fixtures used during tests contain valid AMPHTML';

validateHtmlFixtures.flags = {
  'files': 'Check just the specified files',
  'include_skipped':
    'Include skipped files while validating (can be used with --local_changes)',
  'local_changes': 'Check just the files changed in the local branch',
};
