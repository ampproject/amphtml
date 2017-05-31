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
const child_process = require('child_process');
const exec = require('./exec.js').exec;
const execOrDie = require('./exec.js').execOrDie;
const path = require('path');
const minimist = require('minimist');
const util = require('gulp-util');

const gulp = 'node_modules/gulp/bin/gulp.js';
const fileLogPrefix = util.colors.yellow.bold('pr-check.js:');

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
 * Executes the provided command, returning its stdout as an array of lines.
 * This will throw an exception if something goes wrong.
 * @param {string} cmd
 * @return {!Array<string>}
 */
function getStdout(cmd) {
  return child_process.execSync(cmd, {'encoding': 'utf-8'}).trim().split('\n');
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
 * For a provided commit range identifiying a pull request (PR),
 * yields the list of files.
 * @param {string} travisCommitRange
 * @return {!Array<string>}
 */
function filesInPr(travisCommitRange) {
  return getStdout(`git diff --name-only ${travisCommitRange}`);
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
    } else {
      targetSet.add('RUNTIME');
    }
  }
  return targetSet;
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
  runLintChecks: function() {
    timedExecOrDie(`${gulp} lint`);
  },
  buildRuntime: function() {
    timedExecOrDie(`${gulp} build`);
  },
  serveRuntime: function() {
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
    timedExecOrDie(
        `${gulp} test --nobuild --saucelabs --integration --compiled`);
  },
  runVisualDiffTests: function() {
    // This must only be run for push builds, since Travis hides the encrypted
    // environment variables required by Percy during pull request builds.
    // For now, this is warning-only.
    timedExec(`${gulp} visual-diff`);
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
    command.runLintChecks();
    command.runDepAndTypeChecks();
    command.runUnitTests();
    // command.testDocumentLinks() is skipped during push builds.
    command.buildValidatorWebUI();
    command.buildValidator();
  }
  if (process.env.BUILD_SHARD == "integration_tests") {
    command.cleanBuild();
    command.buildRuntime();
    command.serveRuntime();
    command.runPresubmitTests();  // Needs runtime to be built and served.
    command.runVisualDiffTests();  // Only called during push builds.
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
      util.colors.cyan(process.env.BUILD_SHARD));

  // If $TRAVIS_PULL_REQUEST_SHA is empty then it is a push build and not a PR.
  if (!process.env.TRAVIS_PULL_REQUEST_SHA) {
    console.log(fileLogPrefix, 'Running all commands on push build.');
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
        console.log(fileLogPrefix, util.colors.red('ERROR:'),
            'PRs may not include *config.json files and non-flag-config ' +
            'files. Please make the changes in separate PRs.');
        console.log(fileLogPrefix, util.colors.yellow('NOTE:'),
            'If you see a long list of unrelated files below, it is likely ' +
            'that your private branch is significantly out of sync.');
        console.log(fileLogPrefix,
            'A sync to upstream/master and a push to origin should clear' +
            ' this error. If a normal push doesn\'t work, try a force push:');
        console.log(util.colors.cyan('\t git fetch upstream master'));
        console.log(util.colors.cyan('\t git rebase upstream/master'));
        console.log(util.colors.cyan('\t git push origin --force'));
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

    if (buildTargets.has('RUNTIME')) {
      command.cleanBuild();
      command.buildRuntime();
      command.runLintChecks();
      command.runDepAndTypeChecks();
      command.runUnitTests();
      // Ideally, we'd run presubmit tests after `gulp dist`, as some checks run
      // through the dist/ folder. However, to speed up the Travis queue, we no
      // longer do a dist build for PRs, so this call won't cover dist/.
      // TODO(rsimha-amp): Move this once integration tests are enabled.
      command.runPresubmitTests();
    }
    if (buildTargets.has('VALIDATOR_WEBUI')) {
      command.buildValidatorWebUI();
    }
    if (buildTargets.has('VALIDATOR')) {
      command.buildValidator();
    }
  }

  if (process.env.BUILD_SHARD == "integration_tests") {
    // The integration_tests shard can be skipped for PRs.
    console.log(fileLogPrefix, 'Skipping integration_tests for PRs');
  }


  stopTimer('pr-check.js', startTime);
  return 0;
}

process.exit(main());
