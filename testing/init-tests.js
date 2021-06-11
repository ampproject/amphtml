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

// These two imports must precede all others.
import '#polyfills';
import './setup_chai_sinon';

import * as describes from './describes';
import {Services} from '#service';
import {TestConfig} from './test-config';
import {activateChunkingForTesting} from '../src/chunk';
import {adoptWithMultidocDeps} from '../src/runtime';
import {cancelTimersForTesting} from '#service/timer-impl';
import {configure as configureEnzyme} from 'enzyme';
import {
  installAmpdocServices,
  installRuntimeServices,
} from '#service/core-services';
import {installDocService} from '#service/ampdoc-impl';
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
import {removeElement} from '#core/dom';
import {resetAccumulatedErrorMessagesForTesting} from '../src/error-reporting';
import {resetEvtListenerOptsSupportForTesting} from '#core/dom/event-helper-listen';
import {resetExperimentTogglesForTesting} from '#experiments';
import {setDefaultBootstrapBaseUrlForTesting} from '../src/3p-frame';
import AMP_CONFIG from '../build-system/global-configs/prod-config.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import PreactEnzyme from 'enzyme-adapter-preact-pure';

/** @fileoverview
 * This file initializes AMP's Karma + Mocha based unit & integration tests.
 * TODO(wg-infra): Do a detailed inventory and remove unnecessary steps.
 */

// This is the entry point for all AMP unit and integration tests. It should be
// the only globally-invoked function in this file.
initializeTests();

/**
 * Initializes the global state required by all AMP unit and integration tests.
 */
function initializeTests() {
  initializeTestConstructs();
  exposeKarmaConfig();
  resetTestingState();
  overrideAmpExtensionInstaller();
}

/**
 * Exposes Karma's config constant for use during tests. The regular test runner
 * uses `karma`, while the debugger uses `__karma__ `.
 */
function exposeKarmaConfig() {
  if (parent.karma && !parent.__karma__) {
    parent.__karma__ = parent.karma;
  }
  window.ampTestRuntimeConfig = parent.__karma__
    ? parent.__karma__.config.amp
    : {};
}

/**
 * Initializes the constructs with which all test cases are authored.
 */
function initializeTestConstructs() {
  // Allow Mocha's it() to call yield and allow pending promises to resolve.
  installYieldIt(it);

  // Make Mocha's describe() and it() globally configurable.
  describe.configure = () => new TestConfig(describe);
  it.configure = () => new TestConfig(it);

  // Make AMP's custom describes() globally available.
  global.describes = describes;

  // Set up Mocha's global setup / clean up functions.
  before(overrideSkipTest);
  beforeEach(setupTestcase);
  afterEach(cleanupTestcase);
}

/**
 * Overrides AMP.extension() so that extension installation is buffered and
 * executed just when needed.
 */
function overrideAmpExtensionInstaller() {
  global.AMP.extension = (name, version, installer) =>
    describes.bufferExtension(`${name}:${version}`, installer);
}

/**
 * Overrides skipTest() with a more robust version of `this.skip()`. See #17245.
 */
function overrideSkipTest() {
  this.skipTest = function () {
    if (!this._runnable.title.startsWith('"before all" hook')) {
      throw new Error('skipTest() can only be called from within before()');
    }
    this.test.parent.pending = true; // Workaround for mochajs/mocha#2683.
    this.skip();
  };
}

/**
 * Sets up the initial state required by individual test cases.
 */
function setupTestcase() {
  resetTestingState();
  setTestName(this.currentTest.fullTitle());
  maybeStubConsoleInfoLogWarn();
  preventAsyncErrorThrows();
  warnForConsoleError();
}

/**
 * Resets AMP-specific state in the global window object.
 */
function resetWindowState() {
  window.localStorage.clear();
  window.ENABLE_LOG = false;
  window.AMP_CONFIG = AMP_CONFIG;
  window.AMP_DEV_MODE = false;
  window.context = undefined;
  window.__AMP_MODE = undefined;
  window.__AMP_TEST = true;
  delete window.document['__AMPDOC'];
}

/**
 * Resets the window's testing state. Used at the start by initializeTests() and
 * before each test case by setupTestcase().
 */
function resetTestingState() {
  activateChunkingForTesting();
  resetWindowState();
  installDocService(window, /* isSingleDoc */ true);
  const ampdoc = Services.ampdocServiceFor(window).getSingleDoc();
  installRuntimeServices(window);
  installAmpdocServices(ampdoc);
  Services.resourcesForDoc(ampdoc).ampInitComplete();
  adoptWithMultidocDeps(window);
  configureEnzyme({adapter: new PreactEnzyme()});
}

/**
 * Cleans up global state added during tests.
 */
function cleanupTestcase() {
  setTestRunner(this);
  restoreConsoleSandbox();
  restoreConsoleError();
  restoreAsyncErrorThrows();
  cleanupTestPageElements();
  resetWindowState();
  setDefaultBootstrapBaseUrlForTesting(null);
  resetAccumulatedErrorMessagesForTesting();
  resetExperimentTogglesForTesting(window);
  resetEvtListenerOptsSupportForTesting();
  cancelTimersForTesting();
}

/**
 * Cleans up any HTML elements that tests might have added to the document.
 */
function cleanupTestPageElements() {
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
}
