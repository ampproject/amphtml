/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
const {execOrDie, exec, getStdout} = require('./exec');
const fileLogPrefix = colors.bold(colors.yellow(fileName));
const fileName = 'command.js';
function startTimer(functionName) {
  const startTime = Date.now();
  console.log(
      '\n' + fileLogPrefix, 'Running', colors.cyan(functionName) + '...');
  return startTime;
}

/**
 * Stops the timer for the given function and prints the execution time.
 * @param {string} functionName
 * @param {DOMHighResTimeStamp} startTime
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
 * Executes the provided command and times it. Errors, if any, are printed.
 * @param {string} cmd
 * @return {<Object>} Process info.
 */
function timedExec(cmd) {
  const startTime = startTimer(cmd);
  const p = exec(cmd);
  stopTimer(cmd, startTime);
  return p;
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

function startSauceConnect() {
  process.env['SAUCE_USERNAME'] = 'amphtml';
  process.env['SAUCE_ACCESS_KEY'] = getStdout('curl --silent ' +
      'https://amphtml-sauce-token-dealer.appspot.com/getJwtToken').trim();
  const startScCmd = 'build-system/sauce_connect/start_sauce_connect.sh';
  console.log('\n' + fileLogPrefix,
      'Starting Sauce Connect Proxy:', colors.cyan(startScCmd));
  execOrDie(startScCmd);
}

function stopSauceConnect() {
  const stopScCmd = 'build-system/sauce_connect/stop_sauce_connect.sh';
  console.log('\n' + fileLogPrefix,
      'Stopping Sauce Connect Proxy:', colors.cyan(stopScCmd));
  execOrDie(stopScCmd);
}

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
    // Unit tests with Travis' default chromium in coverage mode.
    timedExecOrDie(cmd + ' --headless --coverage');

    cmd = cmd + ' --saucelabs_lite';
    startSauceConnect();
    timedExecOrDie(cmd);
    stopSauceConnect();
  },
  runUnitTestsOnLocalChanges: function() {
    timedExecOrDie('gulp test --nobuild --headless --local-changes');
  },
  runDevDashboardTests: function() {
    timedExecOrDie('gulp test --dev_dashboard --nobuild');
  },
  runIntegrationTests: function(compiled, coverage) {
    // Integration tests on chrome, or on all saucelabs browsers if set up
    let cmd = 'gulp test --integration --nobuild';
    if (argv.files) {
      cmd = cmd + ' --files ' + argv.files;
    }
    if (compiled) {
      cmd += ' --compiled';
    }

    if (coverage) {
      // TODO(choumx, #19658): --headless disabled for integration tests on
      // Travis until Chrome 72.
      timedExecOrDie(cmd + ' --coverage');
    } else {
      startSauceConnect();
      timedExecOrDie(cmd + ' --saucelabs');
      stopSauceConnect();
    }
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
    process.env['PERCY_TOKEN'] = atob(process.env.PERCY_TOKEN_ENCODED);
    let cmd = 'gulp visual-diff --nobuild';
    if (opt_mode === 'empty') {
      cmd += ' --empty';
    } else if (opt_mode === 'master') {
      cmd += ' --master';
    }
    const {status} = timedExec(cmd);
    if (status != 0) {
      console.error(fileLogPrefix, colors.red('ERROR:'),
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

module.exports = {
  command,
};
