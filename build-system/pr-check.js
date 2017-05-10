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

/**
 * @fileoverview This file is executed by Travis (configured via
 * .travis.yml in the root directory) and is the main driver script
 * for running tests.  Execution herein is entirely synchronous, that
 * is, commands are executed on after the other (see the exec
 * function). Should a command fail, this script will then also fail.
 * This script attempts to introduce some granularity for our
 * presubmit checking, via the determineBuildTargets method.
 */
const child_process = require('child_process');
const path = require('path');
const minimist = require('minimist');
const util = require('gulp-util');

const gulp = 'node_modules/gulp/bin/gulp.js';
const fileLogPrefix =
    '\x1b[33;1m' + 'pr-check.js' + '\x1b[0m: ';  // Yellow, bold.

/**
 * Starts a timer to measure the execution time of the given function.
 * @param {string} functionName
 * @return {DOMHighResTimeStamp}
 */
function startTimer(functionName) {
  const startTime = Date.now();
  console.log(
      '\n' + fileLogPrefix + 'Running ' + '\x1b[36m' +  // Cyan.
      functionName + '\x1b[0m' + '...');
  return startTime;
}

/**
 * Stops the timer for the given function and prints the execution time.
 * @param {string} functionName
 * @return {Number}
 */
function stopTimer(functionName, startTime) {
  const endTime = Date.now();
  const executionTime = new Date(endTime - startTime);
  const mins = executionTime.getMinutes();
  const secs = executionTime.getSeconds();
  console.log(
      fileLogPrefix + 'Done running ' +
      '\x1b[36m' + functionName + '\x1b[0m' +  // Cyan.
      '. ' + 'Total time: ' +
      '\x1b[32m' + mins + 'm ' + secs + 's.' + '\x1b[0m');  // Green.
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
 * Executes the provided command; terminates this program in case of failure.
 * @param {string} cmd
 */
function execOrDie(cmd) {
  const startTime = startTimer(cmd);
  const p =
      child_process.spawnSync('/bin/sh', ['-c', cmd], {'stdio': 'inherit'});
  if (p.status != 0) {
    console.error(`\n${fileLogPrefix}exiting due to failing command: ${cmd}`);
    stopTimer(cmd, startTime);
    process.exit(p.status)
  }
  stopTimer(cmd, startTime);
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
 * Determines whether the given file belongs to the Validator webui,
 * that is, the 'VALIDATOR_WEBUI' target.
 * @param {string} filePath
 * @return {boolean}
 */
function isValidatorWebuiFile(filePath) {
  return filePath.startsWith('validator/webui');
}

/**
 * Determines whether the given file belongs to the Validator webui,
 * that is, the 'BUILD_SYSTEM' target.
 * @param {string} filePath
 * @return {boolean}
 */
function isBuildSystemFile(filePath) {
  return filePath.startsWith('build-system') &&
      // Exclude textproto from build-system since we want it to trigger
      // tests and type check.
      path.extname(filePath) != '.textproto' &&
      // Exclude config files from build-system since we want it to trigger
      // the flag config check.
      !isFlagConfig(filePath);
}

/**
 * Determines whether the given file belongs to the validator,
 * that is, the 'VALIDATOR' target. This assumes (but does not
 * check) that the file is not part of 'VALIDATOR_WEBUI'.
 * @param {string} filePath
 * @return {boolean}
 */
function isValidatorFile(filePath) {
  if (filePath.startsWith('validator/')) return true;
  if (!path.dirname(filePath).endsWith('0.1') &&
      !path.dirname(filePath).endsWith('test'))
    return false;
  const name = path.basename(filePath);
  return name.startsWith('validator-') &&
      (name.endsWith('.out') || name.endsWith('.html') ||
       name.endsWith('.protoascii'));
}

/**
 * @param {string} filePath
 * @return {boolean}
 */
function isDocFile(filePath) {
  return path.extname(filePath) == '.md';
}

/**
 * Determines if the given file contains flag configurations, by comparing it
 * against the well-known json config filenames for prod and canary.
 * @param {string} filePath
 * @return {boolean}
 */
function isFlagConfig(filePath) {
  const filename = path.basename(filePath);
  return (filename == 'prod-config.json' || filename == 'canary-config.json');
}

/**
 * Determines the targets that will be executed by the main method of
 * this script. The order within this function matters.
 * @param {!Array<string>} filePaths
 * @returns {!Set<string>}
 */
function determineBuildTargets(filePaths) {
  if (filePaths.length == 0) {
    return new Set([
        'BUILD_SYSTEM',
        'VALIDATOR_WEBUI',
        'VALIDATOR',
        'RUNTIME',
        'DOCS',
        'FLAG_CONFIG']);
  }
  const targetSet = new Set();
  for (p of filePaths) {
    if (isBuildSystemFile(p)) {
      targetSet.add('BUILD_SYSTEM');
    } else if (isValidatorWebuiFile(p)) {
      targetSet.add('VALIDATOR_WEBUI');
    } else if (isValidatorFile(p)) {
      targetSet.add('VALIDATOR');
    } else if (isDocFile(p)) {
      targetSet.add('DOCS');
    } else if (isFlagConfig(p)) {
      targetSet.add('FLAG_CONFIG');
    } else {
      targetSet.add('RUNTIME');
    }
  }
  return targetSet;
}


const command = {
  testBuildSystem: function() {
    execOrDie('npm run ava');
  },
  testDocumentLinks: function(files) {
    let docFiles = files.filter(isDocFile);
    execOrDie(`${gulp} check-links --files ${docFiles.join(',')}`);
  },
  buildRuntime: function() {
    execOrDie(`${gulp} clean`);
    execOrDie(`${gulp} lint`);
    execOrDie(`${gulp} build`);
    execOrDie(`${gulp} check-types`);
    execOrDie(`${gulp} dist --fortesting`);
  },
  testRuntime: function() {
    // Visual diff tests
    execOrDie(`${gulp} visual-diff --files examples/amp-by-example.html`);
    // dep-check needs to occur after build since we rely on build to generate
    // the css files into js files.
    execOrDie(`${gulp} dep-check`);
    // Unit tests with Travis' default chromium
    execOrDie(`${gulp} test --nobuild --compiled`);
    // Integration tests with all saucelabs browsers
    execOrDie(`${gulp} test --nobuild --saucelabs --integration --compiled`);
    // All unit tests with an old chrome (best we can do right now to pass tests
    // and not start relying on new features).
    // Disabled because it regressed. Better to run the other saucelabs tests.
    // execOrDie(`${gulp} test --nobuild --saucelabs --oldchrome --compiled`);
  },
  presubmit: function() {
    execOrDie(`${gulp} presubmit`);
  },
  buildValidatorWebUI: function() {
    execOrDie('cd validator/webui && python build.py');
  },
  buildValidator: function() {
    execOrDie('cd validator && python build.py');
  },
};

function runAllCommands() {
  command.testBuildSystem();
  // Skip testDocumentLinks() during push builds.
  command.buildRuntime();
  command.presubmit();
  command.testRuntime();
  command.buildValidatorWebUI();
  command.buildValidator();
}

/**
 * The main method for the script execution which much like a C main function
 * receives the command line arguments and returns an exit status.
 * @param {!Array<string>} argv
 * @returns {number}
 */
function main(argv) {
  const startTime = startTimer('pr-check.js');
  // If $TRAVIS_PULL_REQUEST_SHA is empty then it is a push build and not a PR.
  if (!process.env.TRAVIS_PULL_REQUEST_SHA) {
    console.log('Running all commands on push build.');
    runAllCommands();
    stopTimer('pr-check.js', startTime);
    return 0;
  }
  const travisCommitRange = `master...${process.env.TRAVIS_PULL_REQUEST_SHA}`;
  const files = filesInPr(travisCommitRange);
  const buildTargets = determineBuildTargets(files);

  if (buildTargets.has('FLAG_CONFIG')) {
    files.forEach((file) => {
      if (!isFlagConfig(file)) {
        console.log(util.colors.red('ERROR'),
            'It appears that your PR contains a mix of flag-config files ' +
            '(*config.json) and non-flag-config files.');
        console.log('Please make your changes in separate pull requests.');
        console.log(util.colors.yellow(
            'NOTE: If you see a long list of unrelated files below, it is ' +
            'likely because your branch is significantly out of sync.'));
        console.log(util.colors.yellow(
            'A full sync to upstream/master should clear this error.'));
        console.log('\nFull list of files in this PR:');
        files.forEach((file) => { console.log('\t' + file); });
        stopTimer('pr-check.js', startTime);
        process.exit(1);
      }
    });
  }

  //if (files.includes('package.json') ?
        //!files.includes('yarn.lock') : files.includes('yarn.lock')) {
    //console.error('pr-check.js - any update to package.json or yarn.lock ' +
        //'must include the other file. Please update through yarn.');
    //process.exit(1);
  //}

  const sortedBuildTargets = [];
  for (const t of buildTargets) {
    sortedBuildTargets.push(t);
  }
  sortedBuildTargets.sort();

  console.log(
      '\npr-check.js: detected build targets: ' +
      sortedBuildTargets.join(', ') + '\n');

  if (buildTargets.has('BUILD_SYSTEM')) {
    command.testBuildSystem();
  }

  if (buildTargets.has('DOCS')) {
    command.testDocumentLinks(files);
  }

  if (buildTargets.has('RUNTIME')) {
    command.buildRuntime();
  }

  // Presubmit needs to run after `gulp dist` as some checks runs through the
  // dist/ folder.
  // Also presubmit always needs to run even for just docs to check for
  // copyright at the top.
  command.presubmit();

  if (buildTargets.has('RUNTIME')) {
    command.testRuntime();
  }

  if (buildTargets.has('VALIDATOR_WEBUI')) {
    command.buildValidatorWebUI();
  }

  if (buildTargets.has('VALIDATOR')) {
    command.buildValidator();
  }

  stopTimer('pr-check.js', startTime);
  return 0;
}

process.exit(main());
