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
'use strict';

/**
 * @fileoverview This file is executed by Travis (configured via
 * .travis.yml in the root directory) and is the main driver script
 * for running tests.  Execution herein is entirely synchronous, that
 * is, commands are executed on after the other (see the exec
 * function). Should a command fail, this script will then also fail.
 * This script attempts to introduce some granularity for our
 * presubmit checking, via the determineBuildTargets method.
 */
const atob = require('atob');
const exec = require('./exec.js').exec;
const execOrDie = require('./exec.js').execOrDie;
const fs = require('fs');
const getStdout = require('./exec.js').getStdout;
const minimist = require('minimist');
const path = require('path');
const util = require('gulp-util');

const gulp = 'node_modules/gulp/bin/gulp.js';
const fileLogPrefix = util.colors.yellow.bold('pr-check.js:');
const sauceCredsFile = path.resolve('build-system/sauce-credentials.json');

/**
 * Starts a timer to measure the execution time of the given function.
 * @param {string} functionName
 * @return {DOMHighResTimeStamp}
 */
function startTimer(functionName) {
  const startTime = Date.now();
  console.log(
      '\n' + fileLogPrefix, 'Running', util.colors.cyan(functionName), '...');
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
      fileLogPrefix, 'Done running', util.colors.cyan(functionName),
      'Total time:', util.colors.green(mins + 'm ' + secs + 's'));
}

/**
 * Executes the provided command and times it.
 * @param {string} cmd
 */
function timedExec(cmd) {
  const startTime = startTimer(cmd);
  exec(cmd);
  stopTimer(cmd, startTime);
}

/**
 * Executes the provided command and times it. The program terminates in case of
 * failure.
 * @param {string} cmd
 */
function timedExecOrDie(cmd) {
  const startTime = startTimer(cmd);
  execOrDie(cmd);
  stopTimer(cmd, startTime);
}

/**
 * Returns a list of files in the commit range within this pull request (PR)
 * after filtering out commits to master from other PRs.
 * @return {!Array<string>}
 */
function filesInPr() {
  const files =
      getStdout(`git diff --name-only master...HEAD`).trim().split('\n');
  const changeSummary =
      getStdout(`git -c color.ui=always diff --stat master...HEAD`);
  console.log(fileLogPrefix,
      'Testing the following changes at commit',
      util.colors.cyan(process.env.TRAVIS_PULL_REQUEST_SHA));
  console.log(changeSummary);
  return files;
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

  // validator files for each extension
  if (!filePath.startsWith('extensions/')) {
    return false;
  }

  const pathArray = path.dirname(filePath).split(path.sep);
  if (pathArray.length < 2) {
    // At least 2 with ['extensions', '{$name}']
    return false;
  }

  // Validator files take the form of validator-.*\.(html|out|protoascii)
  const name = path.basename(filePath);
  return name.startsWith('validator-') &&
      (name.endsWith('.out') || name.endsWith('.html') ||
       name.endsWith('.protoascii'));
}

/**
 * Determines if the given file is a markdown file containing documentation.
 * @param {string} filePath
 * @return {boolean}
 */
function isDocFile(filePath) {
  return path.extname(filePath) == '.md';
}

/**
 * Determines if the given file is an integration test.
 * @param {string} filePath
 * @return {boolean}
 */
function isIntegrationTest(filePath) {
  return filePath.startsWith('test/integration/');
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
        'INTEGRATION_TEST',
        'DOCS',
        'FLAG_CONFIG']);
  }
  const targetSet = new Set();
  for (let i = 0; i < filePaths.length; i++) {
    const p = filePaths[i];
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
    } else if (isIntegrationTest(p)) {
      targetSet.add('INTEGRATION_TEST');
    } else {
      targetSet.add('RUNTIME');
    }
  }
  return targetSet;
}

/**
 * Connect to sauce labs using per-user credentials if available, and amphtml
 * credentials if not available.
 */
function connectToSauceLabs() {
  const startTime = startTimer('connectToSauceLabs');
  let committer = getStdout(`git log -1 --pretty=format:'%ae'`).trim();
  let credentials = JSON.parse(fs.readFileSync(sauceCredsFile)).credentials;
  if (credentials === null) {
    console.log(fileLogPrefix, util.colors.red('ERROR:'),
        'Could not load Sauce labs credentials from',
        util.colors.cyan(sauceCredsFile));
    process.exit(1);
  }

  let sauceUser = 'amphtml';
  if (credentials[committer]) {
    sauceUser = committer;
  }
  let username = credentials[sauceUser].username;
  let access_key = atob(credentials[sauceUser].access_key_encoded);
  console.log(fileLogPrefix,
      'Using Sauce credentials for user', util.colors.cyan(sauceUser),
      'with Sauce username', util.colors.cyan(username));
  process.env['SAUCE_USERNAME'] = username;
  process.env['SAUCE_ACCESS_KEY'] = access_key;
  execOrDie('travis_start_sauce_connect');
  stopTimer('connectToSauceLabs', startTime);
}

const command = {
  testBuildSystem: function() {
    timedExecOrDie('npm run ava');
  },
  testDocumentLinks: function(files) {
    let docFiles = files.filter(isDocFile);
    timedExecOrDie(`${gulp} check-links --files ${docFiles.join(',')}`);
  },
  cleanBuild: function() {
    timedExecOrDie(`${gulp} clean`);
  },
  runJsonAndLintChecks: function() {
    timedExecOrDie(`${gulp} json-syntax`);
    timedExecOrDie(`${gulp} lint`);
  },
  buildRuntime: function() {
    timedExecOrDie(`${gulp} build`);
  },
  buildRuntimeMinified: function() {
    timedExecOrDie(`${gulp} dist --fortesting`);
  },
  runDepAndTypeChecks: function() {
    timedExecOrDie(`${gulp} dep-check`);
    timedExecOrDie(`${gulp} check-types`);
  },
  runUnitTests: function() {
    // Unit tests with Travis' default chromium
    timedExecOrDie(`${gulp} test --nobuild`);
    // All unit tests with an old chrome (best we can do right now to pass tests
    // and not start relying on new features).
    // Disabled because it regressed. Better to run the other saucelabs tests.
    // timedExecOrDie(
    //     `${gulp} test --nobuild --saucelabs --oldchrome --compiled`);
  },
  runIntegrationTests: function() {
    // Integration tests with all saucelabs browsers
    connectToSauceLabs();
    timedExecOrDie(
        `${gulp} test --nobuild --saucelabs --integration --compiled`);
  },
  runVisualDiffTests: function() {
    process.env['PERCY_TOKEN'] = atob(process.env.PERCY_TOKEN_ENCODED);
    timedExec(`ruby ${path.resolve('build-system/tasks/visual-diff.rb')}`);
  },
  runPresubmitTests: function() {
    timedExecOrDie(`${gulp} presubmit`);
  },
  buildValidatorWebUI: function() {
    timedExecOrDie('cd validator/webui && python build.py');
  },
  buildValidator: function() {
    timedExecOrDie('cd validator && python build.py');
  },
};

function runAllCommands() {
  // Run different sets of independent tasks in parallel to reduce build time.
  if (process.env.BUILD_SHARD == "pre_build_checks_and_unit_tests") {
    command.testBuildSystem();
    command.cleanBuild();
    command.buildRuntime();
    command.runVisualDiffTests();
    command.runJsonAndLintChecks();
    command.runDepAndTypeChecks();
    command.runUnitTests();
    // command.testDocumentLinks() is skipped during push builds.
    command.buildValidatorWebUI();
    command.buildValidator();
  }
  if (process.env.BUILD_SHARD == "integration_tests") {
    command.cleanBuild();
    command.buildRuntimeMinified();
    command.runPresubmitTests();  // Needs runtime to be built and served.
    command.runIntegrationTests();
  }
}

/**
 * The main method for the script execution which much like a C main function
 * receives the command line arguments and returns an exit status.
 * @param {!Array<string>} argv
 * @returns {number}
 */
function main(argv) {
  const startTime = startTimer('pr-check.js');
  console.log(
      fileLogPrefix, 'Running build shard',
      util.colors.cyan(process.env.BUILD_SHARD),
      '\n');

  // If $TRAVIS_PULL_REQUEST_SHA is empty then it is a push build and not a PR.
  if (!process.env.TRAVIS_PULL_REQUEST_SHA) {
    console.log(fileLogPrefix, 'Running all commands on push build.');
    runAllCommands();
    stopTimer('pr-check.js', startTime);
    return 0;
  }
  const files = filesInPr();
  const buildTargets = determineBuildTargets(files);

  // Exit early if flag-config files are mixed with non-flag-config files.
  if (buildTargets.has('FLAG_CONFIG') && buildTargets.size !== 1) {
    console.log(fileLogPrefix, util.colors.red('ERROR:'),
        'Looks like your PR contains',
        util.colors.cyan('{prod|canary}-config.json'),
        'in addition to some other files');
    const nonFlagConfigFiles = files.filter(file => !isFlagConfig(file));
    console.log(fileLogPrefix, util.colors.red('ERROR:'),
        'Please move these files to a separate PR:',
        util.colors.cyan(nonFlagConfigFiles.join(', ')));
    stopTimer('pr-check.js', startTime);
    process.exit(1);
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
      fileLogPrefix, 'Detected build targets:',
      util.colors.cyan(sortedBuildTargets.join(', ')));

  // Run different sets of independent tasks in parallel to reduce build time.
  if (process.env.BUILD_SHARD == "pre_build_checks_and_unit_tests") {
    if (buildTargets.has('BUILD_SYSTEM')) {
      command.testBuildSystem();
    }

    if (buildTargets.has('DOCS')) {
      command.testDocumentLinks(files);
    }

    if (buildTargets.has('RUNTIME') || buildTargets.has('INTEGRATION_TEST')) {
      command.cleanBuild();
      command.buildRuntime();
      command.runVisualDiffTests();
      // Ideally, we'd run presubmit tests after `gulp dist`, as some checks run
      // through the dist/ folder. However, to speed up the Travis queue, we no
      // longer do a dist build for PRs, so this call won't cover dist/.
      // TODO(rsimha-amp): Move this once integration tests are enabled.
      command.runPresubmitTests();
      command.runJsonAndLintChecks();
      command.runDepAndTypeChecks();
      // Skip unit tests if the PR only contains changes to integration tests.
      if (buildTargets.has('RUNTIME')) {
        command.runUnitTests();
      }
    }
    if (buildTargets.has('VALIDATOR_WEBUI')) {
      command.buildValidatorWebUI();
    }
    if (buildTargets.has('VALIDATOR')) {
      command.buildValidator();
    }
  }

  if (process.env.BUILD_SHARD == "integration_tests") {
    // Run the integration_tests shard for a PR only if it is modifying an
    // integration test. Otherwise, the shard can be skipped.
    if (buildTargets.has('INTEGRATION_TEST')) {
      console.log(fileLogPrefix,
          'Running the',
          util.colors.cyan('integration_tests'),
          'build shard since this PR touches',
          util.colors.cyan('test/integration'));
      command.cleanBuild();
      command.buildRuntimeMinified();
      command.runIntegrationTests();
    } else {
      console.log(fileLogPrefix,
          'Skipping the',
          util.colors.cyan('integration_tests'),
          'build shard for this PR');
    }
  }

  stopTimer('pr-check.js', startTime);
  return 0;
}

process.exit(main());
