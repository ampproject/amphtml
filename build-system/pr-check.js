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
const child_process = require('child_process');
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
 * Executes the provided command, returning its stdout as an array of lines.
 * This will throw an exception if something goes wrong.
 * @param {string} cmd
 * @return {!Array<string>}
 */
function exec(cmd) {
  return child_process.execSync(cmd, {'encoding': 'utf-8'}).trim().split('\n');
}

/**
 * For a provided commit range identifiying a pull request (PR),
 * yields the list of files.
 * @param {string} travisCommitRange
 * @return {!Array<string>}
 */
function filesInPr(travisCommitRange) {
  return exec(`git diff --name-only ${travisCommitRange}`);
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
 * Determines the targets that will be executed by the main method of
 * this script.
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

/**
 * @param {!Array<string>} argv
 * @returns {number}
 */
function main(argv) {
  if (argv.length <= 2) {
    console.error(`Usage: ${__filename} TRAVIS_COMMIT_RANGE`);
    return -1;
  }
  const travisCommitRange = argv[2];
  const buildTargets = determineBuildTargets(filesInPr(travisCommitRange));

  console.log('\npr-check.js: Executing COMMON steps.\n');
  exec('npm run ava');
  exec('gulp lint');
  exec('gulp build --css-only');
  exec('gulp check-types');
  exec('gulp dist --fortesting');
  exec('gulp presubmit');
  if (buildTargets.has('RUNTIME')) {
    console.log('\npr-check.js: Executing RUNTIME steps.\n');
    // dep-check needs to occur after build since we rely on build to generate
    // the css files into js files.
    exec('gulp dep-check');
    // Unit tests with Travis' default chromium
    exec('gulp test --nobuild --compiled');
    // Integration tests with all saucelabs browsers
    exec('gulp test --nobuild --saucelabs --integration --compiled');
    // All unit tests with an old chrome (best we can do right now to pass tests
    // and not start relying on new features).
    // Disabled because it regressed. Better to run the other saucelabs tests.
    exec('gulp test --saucelabs --oldchrome');
  }
  if (buildTargets.has('VALIDATOR_WEBUI')) {
    console.log('\npr-check.js: Executing VALIDATOR_WEBUI steps.\n');
    exec('cd validator/webui && python build.py');
  }
  if (buildTargets.has('VALIDATOR')) {
    console.log('\npr-check.js: Executing VALIDATOR steps.\n');
    exec('cd validator && python build.py');
  }
  return 0;
}

process.exit(main(process.argv));
