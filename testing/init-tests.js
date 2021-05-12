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

import * as describes from './describes';
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
import {installYieldIt} from './yield';
import {
  maybeStubConsoleInfoLogWarn,
  restoreConsoleError,
  restoreConsoleSandbox,
  setTestName,
  setTestRunner,
  warnForConsoleError,
} from './console-logging-setup';
import {preventAsyncErrorThrows} from './async-errors';
import {removeElement} from '../src/dom';
import {resetAccumulatedErrorMessagesForTesting} from '../src/error-reporting';
import {resetEvtListenerOptsSupportForTesting} from '../src/event-helper-listen';
import {resetExperimentTogglesForTesting} from '../src/experiments';
import {setDefaultBootstrapBaseUrlForTesting} from '../src/3p-frame';
import AMP_CONFIG from '../build-system/global-configs/prod-config.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import PreactEnzyme from 'enzyme-adapter-preact-pure';

/** @fileoverview
 * This file initializes AMP's Karma + Mocha based unit & integration tests.
 * TODO(wg-infra, #23837): Further refactor and clean up this file.
 */

// Used to clean up global state between tests.
let initialGlobalState;
let initialWindowState;

// Increase the before/after each timeout since certain times they have timedout
// during the normal 2000 allowance.
const BEFORE_AFTER_TIMEOUT = 5000;

// This is the entry point for all AMP unit and integration tests.
initializeTests();

/**
 * Initializes the global state required by all AMP unit and integration tests.
 */
function initializeTests() {
  // Allow it() tests to call yield and allow pending promises to resolve.
  installYieldIt(it);

  // Make describe() and it() globally configurable.
  describe.configure = () => new TestConfig(describe);
  it.configure = () => new TestConfig(it);

  // Make describes() globally available.
  global.describes = describes;

  // Make the `amp` section of the Karma config readable by tests.
  // The regular test runner uses `karma`, while the debugger uses `__karma__ `.
  if (parent.karma && !parent.__karma__) {
    parent.__karma__ = parent.karma;
  }
  window.ampTestRuntimeConfig = parent.__karma__
    ? parent.__karma__.config.amp
    : {};

  // These steps need to be run before any custom elements are initialized.
  resetTestingState();
  adoptWithMultidocDeps(window);
  configureEnzyme({adapter: new PreactEnzyme()});

  // Override AMP.extension to buffer extension installers.
  global.AMP.extension = (name, version, installer) =>
    describes.bufferExtension(`${name}:${version}`, installer);
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
  resetTestingState();
  setTestName(this.currentTest.fullTitle());
  maybeStubConsoleInfoLogWarn();
  preventAsyncErrorThrows();
  warnForConsoleError();
  initialGlobalState = Object.keys(global);
  initialWindowState = Object.keys(window);
});

function resetTestingState() {
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
  setTestRunner(this);
  const globalState = Object.keys(global);
  const windowState = Object.keys(window);
  restoreConsoleSandbox();
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
