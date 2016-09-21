/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
const BBPromise = require('bluebird');
const child_process = require('child_process');
const exec = BBPromise.promisify(child_process.exec);
const fs = BBPromise.promisifyAll(require('fs'));
const path = require('path');

/**
 * @param {string} str
 * @param {string? prefix
 * @return {boolean}
 */
function hasPrefix(str, prefix) {
  return str.indexOf(prefix) == 0;
}

/**
 * @param {string} str
 * @param {string? prefix
 * @return {boolean}
 */
function hasSuffix(str, suffix) {
  return str.lastIndexOf(suffix) == str.length - suffix.length;
}

/**
 * @param {string} travisCommitRange
 * @return {Promise<!Array<string>>}
 */
function filesInPr(travisCommitRange) {
  return exec(`git diff --name-only ${travisCommitRange}`)
      .then(output => output.trim().split('\n'));
}

/**
 * @param {string} filePath
 * @return {boolean}
 */
function isValidatorWebuiFile(filePath) {
  return hasPrefix(filePath, 'validator/webui');
}

/**
 * @param {string} filePath
 * @return {boolean}
 */
function isValidatorFile(filePath) {
  if (hasPrefix(filePath, 'validator/')) return true;
  if (!hasSuffix(path.dirname(filePath), '0.1') &&
      !hasSuffix(path.dirname(filePath), 'test'))
    return false;
  const name = path.basename(filePath);
  return hasPrefix(name, 'validator-') &&
      (hasSuffix(name, '.out') || hasSuffix(name, '.html') ||
       hasSuffix('.protoascii'));
}

/**
 * @param {!Array<string>} filePaths
 * @returns {!Set<string>}
 */
function determineBuildTargets(filePaths) {
  const targetSet = new Set();
  for (p of filePaths) {
    if (isValidatorWebuiFile(p)) {
      targetSet.add('VALIDATOR_WEBUI');
    } else if (isValidatorFile(p)) {
      targetSet.add('VALIDATOR');
    } else {
      targetSet.add('RUNTIME');
    }
  }
  return targetSet;
}

if (process.argv.length <= 2) {
  console.log(`Usage: ${__filename} TRAVIS_COMMIT_RANGE`);
  process.exit(-1);
}
const travisCommitRange = process.argv[2];
filesInPr(travisCommitRange).then(determineBuildTargets).then(buildTargets => {
  for (const target of buildTargets) {
    console.log('target detected: ' + target);
  }
  const steps = [];
  console.log('scheduling COMMON steps');
  steps.push(exec('npm run ava'));
  steps.push(exec('gulp lint'));
  steps.push(exec('gulp build --css-only'));
  steps.push(exec('gulp check-types'));
  steps.push(exec('gulp dist --fortesting'));
  steps.push(exec('gulp presubmit'));
  if (buildTargets.has('RUNTIME')) {
    console.log('scheduling RUNTIME steps');
    // dep-check needs to occur after build since we rely on build to generate
    // the css files into js files.
    steps.push(exec('gulp dep-check'));
    // Unit tests with Travis' default chromium
    steps.push(exec('gulp test --nobuild --compiled'));
    // Integration tests with all saucelabs browsers
    steps.push(
        exec('gulp test --nobuild --saucelabs --integration --compiled'));
    // All unit tests with an old chrome (best we can do right now to pass tests
    // and not start relying on new features).
    // Disabled because it regressed. Better to run the other saucelabs tests.
    steps.push(exec('gulp test --saucelabs --oldchrome'));
  }
  if (buildTargets.has('VALIDATOR_WEBUI')) {
    console.log('scheduling VALIDATOR_WEBUI steps');
    steps.push(exec('cd validator/webui && python build.py'));
  }
  if (buildTargets.has('VALIDATOR')) {
    console.log('scheduling VALIDATOR steps');
    steps.push(exec('cd validator && python build.py'));
  }
  return Promise.all(steps);
});
