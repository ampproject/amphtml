/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

const assert = require('assert');
const fs = require('fs');
const globby = require('globby');
const gulp = require('gulp');
const log = require('fancy-log');
const path = require('path');
const posthtml = require('posthtml');
const through = require('through2');
const {buildNewServer} = require('../server/typescript-compile');
const {cyan, green, red} = require('ansi-colors');
const {isTravisBuild} = require('../common/travis');

const transformsDir = path.resolve('build-system/server/new-server/transforms');
const inputPaths = [`${transformsDir}/**/*input.html`];

let passed = 0;
let failed = 0;

/**
 * Extracts the input for a test from its input file.
 *
 * @param {string} inputFile
 * @return {string}
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
  const testPath = path.relative(transformsDir, inputFile);
  const transformName = path.dirname(path.dirname(testPath));
  const testSuffix = path.basename(testPath).replace('-input.html', '');
  return `${transformName} → ${testSuffix}`;
}

/**
 * Extracts the expected output for a test from its output file.
 *
 * @param {string} inputFile
 * @return {string}
 */
async function getExpectedOutput(inputFile) {
  const expectedOutputFile = inputFile.replace('input.html', 'output.html');
  return fs.promises.readFile(expectedOutputFile, 'utf8');
}

/**
 * Extracts the JS transform for a test from its transform file.
 * @param {string} inputFile
 * @param {JSON} extraOptions
 * @return {string}
 */
async function getTransform(inputFile, extraOptions) {
  const transformDir = path.dirname(path.dirname(inputFile));
  const parsed = path.parse(transformDir);
  const transformPath = path.join(parsed.dir, 'dist', parsed.base);
  const transformFile = (await globby(path.resolve(transformPath, '*.js')))[0];
  // TODO(rsimha): Change require to import when node v14 is the active LTS.
  return require(transformFile).default(extraOptions);
}

/**
 * Computes the output for a test from its transform and input.
 *
 * @param {string} transform
 * @param {string} input
 * @return {string}
 */
async function getOutput(transform, input) {
  return (await posthtml(transform).process(input)).html;
}

/**
 * Loads optional arguments residing in a options.json file, if any.
 *
 * @param {strings} inputFile
 * @return {JSON}
 */
function loadOptions(inputFile) {
  const transformDir = path.dirname(path.dirname(inputFile));
  const optionsPath = path.join(transformDir, 'test/options.json');
  if (fs.existsSync(optionsPath)) {
    const optionsList = require(optionsPath);
    const testName = path.basename(inputFile).replace('-input.html', '');
    return optionsList[testName];
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
  console.log(red('✖'), 'Failed', cyan(testName));
  console.group();
  console.log(message.split('\n').splice(3).join('\n'));
  console.groupEnd();
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
    const err = new Error('Tests failed');
    err.showStack = false;
    throw err;
  } else {
    log(green('SUCCESS:'), result);
  }
}

/**
 * Runs the test in a single input file
 *
 * @return {!ReadableStream}
 */
function runTest() {
  return through.obj(async (file, enc, cb) => {
    const inputFile = file.path;
    const input = await getInput(inputFile);
    const testName = getTestName(inputFile);
    const expectedOutput = await getExpectedOutput(inputFile);
    const extraOptions = loadOptions(inputFile);
    const transform = await getTransform(inputFile, extraOptions);
    const output = await getOutput(transform, input);
    try {
      assert.strictEqual(output, expectedOutput);
    } catch (err) {
      ++failed;
      logError(testName, err);
      cb();
      return;
    }
    ++passed;
    if (!isTravisBuild()) {
      console.log(green('✔'), 'Passed', cyan(testName));
    }
    cb();
  });
}

/**
 * Tests for AMP server custom transforms. Entry point for `gulp server-tests`.
 *
 * @return {!Vinyl}
 */
function serverTests() {
  buildNewServer();
  return gulp.src(inputPaths).pipe(runTest()).on('end', reportResult);
}

module.exports = {
  serverTests,
};

serverTests.description = "Runs tests for the AMP server's custom transforms";
