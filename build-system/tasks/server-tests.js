const assert = require('assert');
const fastGlob = require('fast-glob');
const fs = require('fs');
const path = require('path');
const posthtml = require('posthtml');
const {
  log,
  logWithoutTimestamp,
  logWithoutTimestampLocalDev,
} = require('../common/logging');
const {buildNewServer} = require('../server/typescript-compile');
const {cyan, green, red} = require('kleur/colors');

const transformsDir = path.resolve('build-system/server/new-server/transforms');
const inputPaths = [`${transformsDir}/**/input.html`];

let passed = 0;
let failed = 0;

/**
 * Extracts the input for a test from its input file.
 *
 * @param {string} inputFile
 * @return {Promise<string>}
 */
async function getInput(inputFile) {
  return fs.promises.readFile(inputFile, 'utf8');
}

/**
 * Computes the name of a test from its input file.
 *
 * @param {string} inputFile
 * @return {string}
 */
function getTestName(inputFile) {
  const transformName = path.basename(getTransformerDir(inputFile));
  const testSuffix = getTestPath(inputFile);
  return `${transformName} → ${testSuffix}`;
}

/**
 * Computes the directory of the transformer used in the test.
 *
 * @param {string} inputFile
 * @return {string}
 */
function getTransformerDir(inputFile) {
  // The prior assumption is that the transformer is in the parent directory.
  // However, with Jest (and to mimic Jest), this is not necessarily true.
  let transformerDir = inputFile;
  while (path.basename(path.dirname(transformerDir)) != 'transforms') {
    transformerDir = path.dirname(transformerDir);
  }
  return transformerDir;
}

/**
 * Computes the relative dirname of the input from the test directory.
 * For example, if the input is "test/foo/bar/input.html", we get "foo/bar".
 *
 * @param {string} inputFile
 * @return {string}
 */
function getTestPath(inputFile) {
  let testDir = inputFile;
  while (path.basename(testDir) != 'test') {
    testDir = path.dirname(testDir);
  }
  return path.dirname(path.relative(testDir, inputFile));
}

/**
 * Extracts the expected output for a test from its output file.
 *
 * @param {string} inputFile
 * @return {Promise<string>}
 */
async function getExpectedOutput(inputFile) {
  const expectedOutputFile = inputFile.replace('input.html', 'output.html');
  return fs.promises.readFile(expectedOutputFile, 'utf8');
}

/**
 * Extracts the JS transform for a test from its transform file.
 * @param {string} inputFile
 * @param {!Object} extraOptions
 * @return {Promise<string>}
 */
async function getTransform(inputFile, extraOptions) {
  const transformDir = getTransformerDir(inputFile);
  const parsed = path.parse(transformDir);
  const transformPath = path.join(parsed.dir, 'dist', parsed.base);
  const transformFile = (
    await fastGlob(path.resolve(transformPath, '*.js'))
  )[0];
  return (await import(transformFile)).default.default(extraOptions);
}

/**
 * Computes the output for a test from its transform and input.
 *
 * @param {string} transform
 * @param {string} input
 * @return {Promise<string>}
 */
async function getOutput(transform, input) {
  return (await posthtml(/** @type {*} */ (transform)).process(input)).html;
}

/**
 * Loads optional arguments residing in a options.json file, if any.
 *
 * @param {string} inputFile
 * @return {!Object}
 */
function loadOptions(inputFile) {
  const transformDir = path.dirname(inputFile);
  const optionsPath = path.join(transformDir, 'options.json');
  if (fs.existsSync(optionsPath)) {
    return require(optionsPath);
  }
  return {};
}

/**
 * Logs a test error
 *
 * @param {string} testName
 * @param {Error} err
 */
function logError(testName, err) {
  const {message} = err;
  logWithoutTimestamp(red('✖'), 'Failed', cyan(testName));
  console /*OK*/
    .group();
  logWithoutTimestamp(message.split('\n').splice(3).join('\n'));
  console /*OK*/
    .groupEnd();
}

/**
 * Reports total number of passing / failing tests
 */
function reportResult() {
  const result =
    `Ran ${cyan(passed + failed)} tests ` +
    `(${cyan(passed)} passed, ${cyan(failed)} failed).`;
  if (failed > 0) {
    log(red('ERROR:'), result);
    throw new Error('Tests failed');
  } else {
    log(green('SUCCESS:'), result);
  }
}

/**
 * Runs the test in a single input file
 *
 * @param {string} inputFile
 * @return {Promise<void>}
 */
async function runTest(inputFile) {
  const testName = getTestName(inputFile);
  const [input, expectedOutput, transform] = await Promise.all([
    getInput(inputFile),
    getExpectedOutput(inputFile),
    getTransform(inputFile, loadOptions(inputFile)),
  ]);
  const output = await getOutput(transform, input);
  try {
    assert.strictEqual(output, expectedOutput);
  } catch (err) {
    ++failed;
    logError(testName, err);
    return;
  }
  ++passed;
  logWithoutTimestampLocalDev(green('✔'), 'Passed', cyan(testName));
}

/**
 * Tests for AMP server custom transforms. Entry point for `amp server-tests`.
 * @return {Promise<void>}
 */
async function serverTests() {
  await buildNewServer();
  const inputFiles = await fastGlob(inputPaths);
  for (const inputFile of inputFiles) {
    await runTest(inputFile);
  }
  reportResult();
}

module.exports = {
  serverTests,
};

serverTests.description = "Run tests for the AMP server's custom transforms";
