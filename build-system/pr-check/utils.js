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

const colors = require('ansi-colors');
const {execOrDie, exec, getStdout} = require('../exec');
const {travisBuildNumber} = require('../travis');
const BUILD_OUTPUT_FILE = `amp_build_${travisBuildNumber()}.zip`;
const BUILD_OUTPUT_DIRS = 'build/ dist/ dist.3p/ EXTENSIONS_CSS_MAP';
const BUILD_OUTPUT_STORAGE_LOCATION = 'gs://amp-travis-builds';

/**
 * Starts connection to Sauce Labs after getting account credentials
 * @param {string} functionName
 */
function startSauceConnect(functionName) {
  process.env['SAUCE_USERNAME'] = 'amphtml';
  process.env['SAUCE_ACCESS_KEY'] = getStdout('curl --silent ' +
      'https://amphtml-sauce-token-dealer.appspot.com/getJwtToken').trim();
  const startScCmd = 'build-system/sauce_connect/start_sauce_connect.sh';
  const fileLogPrefix = colors.bold(colors.yellow(`${functionName}:`));
  console.log('\n' + fileLogPrefix,
      'Starting Sauce Connect Proxy:', colors.cyan(startScCmd));
  execOrDie(startScCmd);
}

/**
 * Stops connection to Sauce Labs
 * @param {string} functionName
 */
function stopSauceConnect(functionName) {
  const stopScCmd = 'build-system/sauce_connect/stop_sauce_connect.sh';
  const fileLogPrefix = colors.bold(colors.yellow(`${functionName}:`));
  console.log('\n' + fileLogPrefix,
      'Stopping Sauce Connect Proxy:', colors.cyan(stopScCmd));
  execOrDie(stopScCmd);
}

/**
 * Starts a timer to measure the execution time of the given function.
 * @param {string} functionName
 * @return {DOMHighResTimeStamp}
 */
function startTimer(functionName) {
  const startTime = Date.now();
  const fileLogPrefix = colors.bold(colors.yellow(`${functionName}:`));
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
  const fileLogPrefix = colors.bold(colors.yellow(`${functionName}:`));
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


function unzipBuildOutput() {
  timedExecOrDie('gsutil cp ' +
      `${BUILD_OUTPUT_STORAGE_LOCATION}/${BUILD_OUTPUT_FILE} ` +
      `${BUILD_OUTPUT_FILE}`);
  timedExecOrDie(`ls ${BUILD_OUTPUT_FILE}`);
  timedExecOrDie(
      `log="$(unzip -o ${BUILD_OUTPUT_FILE})" && ` +
      'echo travis_fold:start:unzip_results && echo ${log} && ' +
      'echo travis_fold:end:unzip_results');
  timedExecOrDie(
      `log="$(ls -la ${BUILD_OUTPUT_DIRS})" && ` +
      'echo travis_fold:start:verify_unzip_results && echo ${log} && ' +
      'echo travis_fold:end:verify_unzip_results');
}

function zipBuildOutput() {
  timedExecOrDie(
      `log="$(zip -r ${BUILD_OUTPUT_FILE} ${BUILD_OUTPUT_DIRS})" && ` +
      'echo travis_fold:start:zip_results && echo ${log} && ' +
      'echo travis_fold:end:zip_results');
  timedExecOrDie(`gsutil -m cp -r ${BUILD_OUTPUT_FILE} `
    + `${BUILD_OUTPUT_STORAGE_LOCATION}`);
}


module.exports = {
  startTimer,
  stopTimer,
  startSauceConnect,
  stopSauceConnect,
  timedExec,
  timedExecOrDie,
  unzipBuildOutput,
  zipBuildOutput,
};
