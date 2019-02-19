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
 * @fileoverview
 * This file runs tasks against the local workspace to mimic
 * the CI build as closely as possible.
 */
const argv = require('minimist')(process.argv.slice(2));
const colors = require('ansi-colors');
const {
  isYarnLockFileInSync,
  isYarnLockFileProperlyUpdated} = require('./pr-check/yarn-checks');
const {
  printChangeSummary,
  startTimer,
  stopTimer,
  timedExec,
  timedExecOrDie} = require('./pr-check/utils');

const FILENAME = 'pr-check.js';
const FILELOGPREFIX = colors.bold(colors.yellow(`${FILENAME}:`));

const command = {
  testBuildSystem: function() {
    timedExecOrDie('gulp ava');
    timedExecOrDie('node node_modules/jest/bin/jest.js');
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
    timedExecOrDie('gulp caches-json');
    timedExecOrDie('gulp json-syntax');
  },
  buildCss: function() {
    timedExecOrDie('gulp css');
  },
  buildRuntime: function() {
    timedExecOrDie('gulp build --fortesting');
  },
  buildRuntimeMinified: function(extensions) {
    let cmd = 'gulp dist --fortesting';
    if (!extensions) {
      cmd = cmd + ' --noextensions';
    }
    timedExecOrDie(cmd);
  },
  runBundleSizeCheck: function(action) {
    timedExecOrDie(`gulp bundle-size --on_${action}_build`);
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
    timedExecOrDie(cmd + ' --headless --coverage');
  },
  runUnitTestsOnLocalChanges: function() {
    timedExecOrDie('gulp test --nobuild --headless --local-changes');
  },
  runDevDashboardTests: function() {
    timedExecOrDie('gulp test --dev_dashboard --nobuild');
  },
  runIntegrationTests: function(compiled) {
    // Integration tests on chrome, or on all saucelabs browsers if set up
    let cmd = 'gulp test --integration --nobuild';
    if (argv.files) {
      cmd = cmd + ' --files ' + argv.files;
    }
    if (compiled) {
      cmd += ' --compiled';
    }
    timedExecOrDie(cmd + ' --headless');
  },
  runSinglePassCompiledIntegrationTests: function() {
    timedExecOrDie('rm -R dist');
    timedExecOrDie('gulp dist --fortesting --single_pass --pseudo_names');
    // TODO(choumx, #19658): --headless disabled for integration tests on
    // Travis until Chrome 72.
    timedExecOrDie('gulp test --integration --nobuild '
        + '--compiled --single_pass');
    timedExecOrDie('rm -R dist');
  },
  runVisualDiffTests: function(opt_mode) {
    if (!process.env.PERCY_PROJECT || !process.env.PERCY_TOKEN) {
      console.log(
          '\n' + FILELOGPREFIX, 'Could not find environment variables',
          colors.cyan('PERCY_PROJECT'), 'and',
          colors.cyan('PERCY_TOKEN') + '. Skipping visual diff tests.');
      return;
    }
    let cmd = 'gulp visual-diff --nobuild';
    if (opt_mode === 'empty') {
      cmd += ' --empty';
    } else if (opt_mode === 'master') {
      cmd += ' --master';
    }
    const {status} = timedExec(cmd);
    if (status != 0) {
      console.error(FILELOGPREFIX, colors.red('ERROR:'),
          'Found errors while running', colors.cyan(cmd));
    }
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
  updatePackages: function() {
    timedExecOrDie('gulp update-packages');
  },
};

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
    command.buildRuntimeMinified(/* extensions */ false);
  }

  // These tests need a build.
  command.runPresubmitTests();
  command.runVisualDiffTests();
  command.runUnitTests();
  command.runIntegrationTests(/* compiled */ false, /* coverage */ false);

  // Validator tests.
  command.buildValidatorWebUI();
  command.buildValidator();
}

/**
 * The main method for the script execution which much like a C main function
 * receives the command line arguments and returns an exit status.
 * @return {number}
 */
function main() {
  const startTime = startTimer(FILENAME, FILENAME);

  // Make sure package.json and yarn.lock are in sync and up-to-date.
  if (!isYarnLockFileInSync(FILENAME) ||
      !isYarnLockFileProperlyUpdated(FILENAME)) {
    return 1;
  }

  // Run the local version of all tests.
  process.env['LOCAL_PR_CHECK'] = true;
  printChangeSummary();
  console.log(FILELOGPREFIX, 'Running all pr-check commands locally.');
  runAllCommandsLocally();
  stopTimer(FILENAME, FILENAME, startTime);
  return 0;
}

process.exit(main());
