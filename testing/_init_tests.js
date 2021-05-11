/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

// These must load before all other tests.
import '../src/polyfills';
import './setup_chai_sinon';

import * as coreError from '../src/core/error';
import * as describes from '../testing/describes';
import {Services} from '../src/services';
import {TestConfig} from './test-config';
import {activateChunkingForTesting} from '../src/chunk';
import {adoptWithMultidocDeps} from '../src/runtime';
import {cancelTimersForTesting} from '../src/service/timer-impl';
import {configure as configureEnzyme} from 'enzyme';
import {
  installAmpdocServices,
  installRuntimeServices,
} from '../src/service/core-services';
import {installDocService} from '../src/service/ampdoc-impl';
import {installYieldIt} from '../testing/yield';
import {removeElement} from '../src/dom';
import {
  reportError,
  resetAccumulatedErrorMessagesForTesting,
} from '../src/error-reporting';
import {resetEvtListenerOptsSupportForTesting} from '../src/event-helper-listen';
import {resetExperimentTogglesForTesting} from '../src/experiments';
import {setDefaultBootstrapBaseUrlForTesting} from '../src/3p-frame';
import {setReportError} from '../src/log';
import AMP_CONFIG from '../build-system/global-configs/prod-config.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import PreactEnzyme from 'enzyme-adapter-preact-pure';
import sinon from 'sinon'; // eslint-disable-line local/no-import

/** @fileoverview
 * This file initializes AMP's Karma + Mocha based unit & integration tests.
 * TODO(wg-infra, #23837): Further refactor and clean up this file.
 */

// Used to print warnings for unexpected console errors.
let that;
let consoleErrorSandbox;
let testName;
let expectedAsyncErrors;
let rethrowAsyncSandbox;
let consoleInfoLogWarnSandbox;
const originalConsoleError = console /*OK*/.error;

// Used to clean up global state between tests.
let initialGlobalState;
let initialWindowState;

// All exposed describes.
global.describes = describes;

// Increase the before/after each timeout since certain times they have timedout
// during the normal 2000 allowance.
const BEFORE_AFTER_TIMEOUT = 5000;

// Needs to be called before the custom elements are first made.
beforeTest();
adoptWithMultidocDeps(window);
configureEnzyme({adapter: new PreactEnzyme()});

// Override AMP.extension to buffer extension installers.
/**
 * @param {string} name
 * @param {string} version
 * @param {function(!Object)} installer
 * @const
 */
global.AMP.extension = function (name, version, installer) {
  describes.bufferExtension(`${name}:${version}`, installer);
};

// Make amp section in karma config readable by tests.
if (parent.karma && !parent.__karma__) {
  parent.__karma__ = parent.karma;
}
window.ampTestRuntimeConfig = parent.__karma__
  ? parent.__karma__.config.amp
  : {};

describe.configure = function () {
  return new TestConfig(describe);
};

installYieldIt(it);

it.configure = function () {
  return new TestConfig(it);
};

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
function warnForConsoleError() {
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
function restoreConsoleError() {
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
    that.test.error(new Error(helpMessage));
  }
  expectedAsyncErrors = [];
}

/**
 * Used to silence info, log, and warn level logging during each test, unless
 * verbose mode is enabled.
 */
function maybeStubConsoleInfoLogWarn() {
  const {verboseLogging} = window.__karma__.config;
  if (!verboseLogging) {
    consoleInfoLogWarnSandbox = sinon.createSandbox();
    consoleInfoLogWarnSandbox.stub(console, 'info').callsFake(() => {});
    consoleInfoLogWarnSandbox.stub(console, 'log').callsFake(() => {});
    consoleInfoLogWarnSandbox.stub(console, 'warn').callsFake(() => {});
  }
}

/**
 * Used to precent asynchronous throwing of errors during each test.
 */
function preventAsyncErrorThrows() {
  self.stubAsyncErrorThrows = function () {
    rethrowAsyncSandbox = sinon.createSandbox();
    rethrowAsyncSandbox.stub(coreError, 'rethrowAsync').callsFake((...args) => {
      const error = coreError.createErrorVargs.apply(null, args);
      self.__AMP_REPORT_ERROR(error);
      throw error;
    });
  };
  self.restoreAsyncErrorThrows = function () {
    rethrowAsyncSandbox.restore();
  };
  setReportError(reportError);
  stubAsyncErrorThrows();
}

before(function () {
  // This is a more robust version of `this.skip()`. See #17245.
  this.skipTest = function () {
    if (!this._runnable.title.startsWith('"before all" hook')) {
      throw new Error('skipTest() can only be called from within before()');
    }
    this.test.parent.pending = true; // Workaround for mochajs/mocha#2683.
    this.skip();
  };
});

beforeEach(function () {
  this.timeout(BEFORE_AFTER_TIMEOUT);
  beforeTest();
  testName = this.currentTest.fullTitle();
  window.sandbox = sinon.createSandbox();
  maybeStubConsoleInfoLogWarn();
  preventAsyncErrorThrows();
  warnForConsoleError();
  initialGlobalState = Object.keys(global);
  initialWindowState = Object.keys(window);
});

function beforeTest() {
  activateChunkingForTesting();
  window.__AMP_MODE = undefined;
  window.context = undefined;
  window.AMP_CONFIG = AMP_CONFIG;
  window.__AMP_TEST = true;
  installDocService(window, /* isSingleDoc */ true);
  const ampdoc = Services.ampdocServiceFor(window).getSingleDoc();
  installRuntimeServices(window);
  installAmpdocServices(ampdoc);
  Services.resourcesForDoc(ampdoc).ampInitComplete();
}

/**
 * Global cleanup of tags added during tests. Cool to add more to selector.
 */
afterEach(function () {
  that = this;
  const globalState = Object.keys(global);
  const windowState = Object.keys(window);
  if (consoleInfoLogWarnSandbox) {
    consoleInfoLogWarnSandbox.restore();
  }
  window.sandbox.restore();
  restoreConsoleError();
  restoreAsyncErrorThrows();
  this.timeout(BEFORE_AFTER_TIMEOUT);
  const cleanupTagNames = ['link', 'meta', 'iframe'];
  const cleanup = document.querySelectorAll(cleanupTagNames.join(','));
  for (let i = 0; i < cleanup.length; i++) {
    try {
      const element = cleanup[i];
      removeElement(element);
    } catch (e) {
      // This sometimes fails for unknown reasons.
      console./*OK*/ log(e);
    }
  }
  window.localStorage.clear();
  window.ENABLE_LOG = false;
  window.AMP_DEV_MODE = false;
  window.context = undefined;
  window.__AMP_MODE = undefined;
  delete window.document['__AMPDOC'];

  if (windowState.length != initialWindowState.length) {
    for (let i = initialWindowState.length; i < windowState.length; ++i) {
      if (window[windowState[i]]) {
        delete window[windowState[i]];
      }
    }
  }

  if (initialGlobalState.length != globalState.length) {
    for (let i = initialGlobalState.length; i < globalState.length; ++i) {
      if (global[globalState[i]]) {
        delete global[globalState[i]];
      }
    }
  }
  if (!/native/.test(window.setTimeout)) {
    throw new Error(
      'You likely forgot to restore sinon timers ' +
        '(installed via sandbox.useFakeTimers).'
    );
  }
  setDefaultBootstrapBaseUrlForTesting(null);
  resetAccumulatedErrorMessagesForTesting();
  resetExperimentTogglesForTesting(window);
  resetEvtListenerOptsSupportForTesting();
  cancelTimersForTesting();
});
