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
const argv = require('minimist')(process.argv.slice(2));
const atob = require('atob');
const colors = require('ansi-colors');
const execOrDie = require('./exec').execOrDie;
const getStderr = require('./exec').getStderr;
const getStdout = require('./exec').getStdout;
const path = require('path');

const fileLogPrefix = colors.bold(colors.yellow('pr-check.js:'));

/**
 * Starts a timer to measure the execution time of the given function.
 * @param {string} functionName
 * @return {DOMHighResTimeStamp}
 */
function startTimer(functionName) {
  const startTime = Date.now();
  console.log(
      '\n' + fileLogPrefix, 'Running', colors.cyan(functionName) + '...');
  return startTime;
}

/**
 * Stops the timer for the given function and prints the execution time.
 * @param {string} functionName
 * @return {number}
 */
function stopTimer(functionName, startTime) {
  const endTime = Date.now();
  const executionTime = new Date(endTime - startTime);
  const mins = executionTime.getMinutes();
  const secs = executionTime.getSeconds();
  console.log(
      fileLogPrefix, 'Done running', colors.cyan(functionName),
      'Total time:', colors.green(mins + 'm ' + secs + 's'));
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
      getStdout('git diff --name-only master...HEAD').trim().split('\n');
  const changeSummary =
      getStdout('git -c color.ui=always diff --stat master...HEAD');
  console.log(fileLogPrefix,
      'Testing the following changes at commit',
      colors.cyan(process.env.TRAVIS_PULL_REQUEST_SHA));
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
  return (filePath.startsWith('build-system') &&
      // Exclude textproto from build-system since we want it to trigger
      // tests and type check.
      path.extname(filePath) != '.textproto' &&
      // Exclude config files from build-system since we want it to trigger
      // the flag config check.
      !isFlagConfig(filePath) &&
      // Exclude visual diff files from build-system since we want it to trigger
      // visual diff tests.
      !isVisualDiffFile(filePath))
      // OWNERS.yaml files should trigger build system to run tests
      || isOwnersFile(filePath);
}

/**
 * Determines whether the given file belongs to the validator,
 * that is, the 'VALIDATOR' target. This assumes (but does not
 * check) that the file is not part of 'VALIDATOR_WEBUI'.
 * @param {string} filePath
 * @return {boolean}
 */
function isValidatorFile(filePath) {
  if (filePath.startsWith('validator/')) {
    return true;
  }

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
 * Determines if the given path has a OWNERS.yaml basename.
 * @param {string} filePath
 * @return {boolean}
 */
function isOwnersFile(filePath) {
  return path.basename(filePath) === 'OWNERS.yaml';
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
 * Determines if the given file is related to the visual diff tests.
 * @param {string} filePath
 * @return {boolean}
 */
function isVisualDiffFile(filePath) {
  const filename = path.basename(filePath);
  return (filename == 'visual-diff.rb' ||
          filename == 'visual-tests.json' ||
          filePath.startsWith('examples/visual-tests/'));
}

/**
 * Determines if the given file is an integration test.
 * @param {string} filePath
 * @return {boolean}
 */
function isIntegrationTest(filePath) {
  return filePath.includes('test/integration/');
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
      'FLAG_CONFIG',
      'VISUAL_DIFF']);
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
    } else if (isVisualDiffFile(p)) {
      targetSet.add('VISUAL_DIFF');
    } else {
      targetSet.add('RUNTIME');
    }
  }
  return targetSet;
}


const command = {
  testBuildSystem: function() {
    timedExecOrDie('gulp ava');
  },
  testDocumentLinks: function() {
    timedExecOrDie('gulp check-links');
  },
  cleanBuild: function() {
    timedExecOrDie('gulp clean');
  },
  runLintCheck: function() {
    timedExecOrDie('gulp lint');
  },
  runJsonCheck: function() {
    timedExecOrDie('gulp json-syntax');
  },
  buildCss: function() {
    timedExecOrDie('gulp css');
  },
  buildRuntime: function() {
    timedExecOrDie('gulp build');
  },
  buildRuntimeMinified: function() {
    timedExecOrDie('gulp dist --fortesting');
  },
  runDepAndTypeChecks: function() {
    timedExecOrDie('gulp dep-check');
    timedExecOrDie('gulp check-types');
  },
  runUnitTests: function() {
    let cmd = 'gulp test --unit --nobuild';
    if (argv.files) {
      cmd = cmd + ' --files ' + argv.files;
    }
    // Unit tests with Travis' default chromium
    timedExecOrDie(cmd);
    if (!!process.env.SAUCE_USERNAME && !!process.env.SAUCE_ACCESS_KEY) {
      // A subset of unit tests on other browsers via sauce labs
      cmd = cmd + ' --saucelabs_lite';
      timedExecOrDie(cmd);
    }
  },
  runIntegrationTests: function(compiled) {
    // Integration tests on chrome, or on all saucelabs browsers if set up
    let cmd = 'gulp test --nobuild --integration';
    if (argv.files) {
      cmd = cmd + ' --files ' + argv.files;
    }
    if (compiled) {
      cmd += ' --compiled';
    }
    if (!!process.env.SAUCE_USERNAME && !!process.env.SAUCE_ACCESS_KEY) {
      cmd += ' --saucelabs';
    }
    timedExecOrDie(cmd);
  },
  runVisualDiffTests: function(opt_mode) {
    if (process.env.TRAVIS) {
      process.env['PERCY_TOKEN'] = atob(process.env.PERCY_TOKEN_ENCODED);
    } else if (!process.env.PERCY_PROJECT || !process.env.PERCY_TOKEN) {
      console.log(
          '\n' + fileLogPrefix, 'Could not find environment variables',
          colors.cyan('PERCY_PROJECT'), 'and',
          colors.cyan('PERCY_TOKEN') + '. Skipping visual diff tests.');
      return;
    }
    let cmd = 'gulp visual-diff --headless';
    if (opt_mode === 'skip') {
      cmd += ' --skip';
    } else if (opt_mode === 'master') {
      cmd += ' --master';
    }
    timedExecOrDie(cmd);
  },
  verifyVisualDiffTests: function() {
    if (!process.env.PERCY_PROJECT || !process.env.PERCY_TOKEN) {
      console.log(
          '\n' + fileLogPrefix, 'Could not find environment variables',
          colors.cyan('PERCY_PROJECT'), 'and',
          colors.cyan('PERCY_TOKEN') +
          '. Skipping verification of visual diff tests.');
      return;
    }
    timedExecOrDie('gulp visual-diff --verify');
  },
  runPresubmitTests: function() {
    timedExecOrDie('gulp presubmit');
  },
  buildValidatorWebUI: function() {
    timedExecOrDie('gulp validator-webui');
  },
  buildValidator: function() {
    timedExecOrDie('gulp validator');
  },
};

function runAllCommands() {
  // Run different sets of independent tasks in parallel to reduce build time.
  if (process.env.BUILD_SHARD == 'unit_tests') {
    command.testBuildSystem();
    command.cleanBuild();
    command.buildRuntime();
    command.runVisualDiffTests(/* opt_mode */ 'master');
    command.runLintCheck();
    command.runJsonCheck();
    command.runDepAndTypeChecks();
    command.runUnitTests();
    command.verifyVisualDiffTests();
    // command.testDocumentLinks() is skipped during push builds.
    command.buildValidatorWebUI();
    command.buildValidator();
  }
  if (process.env.BUILD_SHARD == 'integration_tests') {
    command.cleanBuild();
    command.buildRuntimeMinified();
    command.runPresubmitTests();
    command.runIntegrationTests(/* compiled */ true);
  }
}

function runAllCommandsLocally() {
  // These tasks don't need a build. Run them first and fail early.
  command.testBuildSystem();
  command.runLintCheck();
  command.runJsonCheck();
  command.runDepAndTypeChecks();
  command.testDocumentLinks();

  // Build if required.
  if (!argv.nobuild) {
    command.cleanBuild();
    command.buildRuntime();
  }

  // These tests need a build.
  command.runPresubmitTests();
  command.runVisualDiffTests();
  command.runUnitTests();
  command.runIntegrationTests(/* compiled */ false);
  command.verifyVisualDiffTests();

  // Validator tests.
  command.buildValidatorWebUI();
  command.buildValidator();
}

/**
 * Makes sure package.json and yarn.lock are in sync.
 */
function runYarnIntegrityCheck() {
  const yarnIntegrityCheck = getStderr('yarn check --integrity').trim();
  if (yarnIntegrityCheck.includes('error')) {
    console.error(fileLogPrefix, colors.red('ERROR:'),
        'Found the following', colors.cyan('yarn'), 'errors:\n' +
        colors.cyan(yarnIntegrityCheck));
    console.error(fileLogPrefix, colors.red('ERROR:'),
        'Updates to', colors.cyan('package.json'),
        'must be accompanied by a corresponding update to',
        colors.cyan('yarn.lock'));
    console.error(fileLogPrefix, colors.yellow('NOTE:'),
        'To update', colors.cyan('yarn.lock'), 'after changing',
        colors.cyan('package.json') + ',', 'run',
        '"' + colors.cyan('yarn install') + '"',
        'and include the updated', colors.cyan('yarn.lock'),
        'in your PR.');
    process.exit(1);
  }
}

/**
 * Makes sure that yarn.lock was properly updated.
 */
function runYarnLockfileCheck() {
  const yarnLockfileCheck = getStdout('git -c color.ui=always diff').trim();
  if (yarnLockfileCheck.includes('yarn.lock')) {
    console.error(fileLogPrefix, colors.red('ERROR:'),
        'This PR did not properly update', colors.cyan('yarn.lock') + '.');
    console.error(fileLogPrefix, colors.yellow('NOTE:'),
        'To fix this, sync your branch to', colors.cyan('upstream/master') +
        ', run', colors.cyan('gulp update-packages') +
        ', and push a new commit containing the changes.');
    console.error(fileLogPrefix, 'Expected changes:');
    console.log(yarnLockfileCheck);
    process.exit(1);
  }
}

/**
 * Returns true if this is a PR build for a greenkeeper branch.
 */
function isGreenkeeperPrBuild() {
  return (process.env.TRAVIS_EVENT_TYPE == 'pull_request') &&
      (process.env.TRAVIS_PULL_REQUEST_BRANCH.startsWith('greenkeeper/'));
}

/**
 * Returns true if this is a push build for a greenkeeper branch.
 */
function isGreenkeeperPushBuild() {
  return (process.env.TRAVIS_EVENT_TYPE == 'push') &&
      (process.env.TRAVIS_BRANCH.startsWith('greenkeeper/'));
}

/**
 * Returns true if this is a push build for a lockfile update on a greenkeeper
 * branch.
 */
function isGreenkeeperLockfilePushBuild() {
  return isGreenkeeperPushBuild() &&
      (process.env.TRAVIS_COMMIT_MESSAGE.startsWith(
          'chore(package): update lockfile'));
}

/**
 * The main method for the script execution which much like a C main function
 * receives the command line arguments and returns an exit status.
 * @returns {number}
 */
function main() {
  const startTime = startTimer('pr-check.js');

  // Eliminate unnecessary testing on greenkeeper branches by running tests only
  // on the push build that contains the lockfile update.
  if (isGreenkeeperPrBuild() ||
      (isGreenkeeperPushBuild() && !isGreenkeeperLockfilePushBuild())) {
    console.log(fileLogPrefix,
        'Skipping unnecessary testing on greenkeeper branches. ' +
        'Tests will only be run for the push build with the lockfile update.');
    stopTimer('pr-check.js', startTime);
    return 0;
  }

  // Make sure package.json and yarn.lock are in sync and up-to-date.
  runYarnIntegrityCheck();
  runYarnLockfileCheck();

  // Run the local version of all tests.
  if (!process.env.TRAVIS) {
    console.log(fileLogPrefix, 'Running all pr-check commands locally.');
    runAllCommandsLocally();
    stopTimer('pr-check.js', startTime);
    return 0;
  }

  console.log(
      fileLogPrefix, 'Running build shard',
      colors.cyan(process.env.BUILD_SHARD),
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
    console.log(fileLogPrefix, colors.red('ERROR:'),
        'Looks like your PR contains',
        colors.cyan('{prod|canary}-config.json'),
        'in addition to some other files');
    const nonFlagConfigFiles = files.filter(file => !isFlagConfig(file));
    console.log(fileLogPrefix, colors.red('ERROR:'),
        'Please move these files to a separate PR:',
        colors.cyan(nonFlagConfigFiles.join(', ')));
    stopTimer('pr-check.js', startTime);
    process.exit(1);
  }

  console.log(
      fileLogPrefix, 'Detected build targets:',
      colors.cyan(Array.from(buildTargets).sort().join(', ')));

  // Run different sets of independent tasks in parallel to reduce build time.
  if (process.env.BUILD_SHARD == 'unit_tests') {
    if (buildTargets.has('BUILD_SYSTEM') ||
        buildTargets.has('RUNTIME')) {
      command.testBuildSystem();
    }
    command.runLintCheck();
    if (buildTargets.has('DOCS')) {
      command.testDocumentLinks();
    }
    if (buildTargets.has('RUNTIME') ||
        buildTargets.has('INTEGRATION_TEST')) {
      command.cleanBuild();
      command.buildCss();
      command.runJsonCheck();
      command.runDepAndTypeChecks();
      // Run unit tests only if the PR contains runtime changes.
      if (buildTargets.has('RUNTIME')) {
        command.runUnitTests();
      }
    }
  }

  if (process.env.BUILD_SHARD == 'integration_tests') {
    if (buildTargets.has('INTEGRATION_TEST') ||
        buildTargets.has('RUNTIME') ||
        buildTargets.has('VISUAL_DIFF')) {
      command.cleanBuild();
      command.buildRuntime();
      command.runVisualDiffTests();
    }
    command.runPresubmitTests();
    if (buildTargets.has('INTEGRATION_TEST') ||
        buildTargets.has('RUNTIME')) {
      command.runIntegrationTests(/* compiled */ false);
    }
    if (buildTargets.has('INTEGRATION_TEST') ||
        buildTargets.has('RUNTIME') ||
        buildTargets.has('VISUAL_DIFF')) {
      command.verifyVisualDiffTests();
    } else {
      // Generates a blank Percy build to satisfy the required Github check.
      command.runVisualDiffTests(/* opt_mode */ 'skip');
    }
    if (buildTargets.has('VALIDATOR_WEBUI')) {
      command.buildValidatorWebUI();
    }
    if (buildTargets.has('VALIDATOR')) {
      command.buildValidator();
    }
  }

  stopTimer('pr-check.js', startTime);
  return 0;
}

process.exit(main());
