/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import sinon from 'sinon'; // eslint-disable-line local/no-import

/**
 * @fileoverview Provides functions that track unexpected console errors during
 * tests and prints warnings when they are detected.
 */

let consoleErrorSandbox;
let testRunner;
let testName;
let expectedAsyncErrors;
let consoleInfoLogWarnSandbox;
const originalConsoleError = console.error;

/**
 * Exposes the test name for use during error logging.
 * @param {string} name
 */
export function setTestName(name) {
  testName = name;
}

/**
 * Exposes the test runner object so that errors can be associated with it.
 * TODO(rsimha): Remove this after karma-runner/karma-mocha#236 is fixed.
 * @param {Object} runner
 */
export function setTestRunner(runner) {
  testRunner = runner;
}

/**
 * Resets all console logging stubs.
 */
export function restoreConsoleSandbox() {
  if (consoleInfoLogWarnSandbox) {
    consoleInfoLogWarnSandbox.restore();
  }
}

/**
 * Prints a warning when a console error is detected during a test.
 * @param {*} messages One or more error messages
 */
function printWarning(...messages) {
  const message = messages.join(' ');

  // Match equal strings.
  if (expectedAsyncErrors.includes(message)) {
    expectedAsyncErrors.splice(expectedAsyncErrors.indexOf(message), 1);
    return;
  }

  // Match regex.
  for (let i = 0; i < expectedAsyncErrors.length; i++) {
    const expectedError = expectedAsyncErrors[i];
    if (typeof expectedError != 'string') {
      if (expectedError.test(message)) {
        expectedAsyncErrors.splice(i, 1);
        return;
      }
    }
  }

  const errorMessage = message.split('\n', 1)[0]; // First line.
  const helpMessage =
    '    The test "' +
    testName +
    '"' +
    ' resulted in a call to console.error. (See above line.)\n' +
    '    ⤷ If the error is not expected, fix the code that generated ' +
    'the error.\n' +
    '    ⤷ If the error is expected (and synchronous), use the following ' +
    'pattern to wrap the test code that generated the error:\n' +
    "        'allowConsoleError(() => { <code that generated the " +
    "error> });'\n" +
    '    ⤷ If the error is expected (and asynchronous), use the ' +
    'following pattern at the top of the test:\n' +
    "        'expectAsyncConsoleError(<string or regex>[, <number of" +
    ' times the error message repeats>]);';
  originalConsoleError(errorMessage + "'\n" + helpMessage);
}

/**
 * Used during normal test execution, to detect unexpected console errors.
 */
export function warnForConsoleError() {
  expectedAsyncErrors = [];
  consoleErrorSandbox = sinon.createSandbox();
  const consoleErrorStub = consoleErrorSandbox
    .stub(console, 'error')
    .callsFake(printWarning);

  self.expectAsyncConsoleError = function (message, repeat = 1) {
    expectedAsyncErrors.push.apply(
      expectedAsyncErrors,
      Array(repeat).fill(message)
    );
  };
  self.allowConsoleError = function (func) {
    consoleErrorStub.reset();
    consoleErrorStub.callsFake(() => {});
    const result = func();
    try {
      expect(consoleErrorStub).to.have.been.called;
    } catch (e) {
      const helpMessage =
        'The test "' +
        testName +
        '" contains an "allowConsoleError" block ' +
        "that didn't result in a call to console.error.";
      originalConsoleError(helpMessage);
    } finally {
      consoleErrorStub.callsFake(printWarning);
    }
    return result;
  };
}

/**
 * Used to restore error level logging after each test.
 */
export function restoreConsoleError() {
  consoleErrorSandbox.restore();
  if (expectedAsyncErrors.length > 0) {
    const helpMessage =
      'The test "' +
      testName +
      '" called "expectAsyncConsoleError", ' +
      'but there were no call(s) to console.error with these message(s): ' +
      '"' +
      expectedAsyncErrors.join('", "') +
      '"';
    testRunner.test.error(new Error(helpMessage));
  }
  expectedAsyncErrors = [];
}

/**
 * Used to silence info, log, and warn level logging during each test, unless
 * verbose mode is enabled.
 */
export function maybeStubConsoleInfoLogWarn() {
  const {verboseLogging} = window.__karma__.config;
  if (!verboseLogging) {
    consoleInfoLogWarnSandbox = sinon.createSandbox();
    consoleInfoLogWarnSandbox.stub(console, 'info').callsFake(() => {});
    consoleInfoLogWarnSandbox.stub(console, 'log').callsFake(() => {});
    consoleInfoLogWarnSandbox.stub(console, 'warn').callsFake(() => {});
  }
}
