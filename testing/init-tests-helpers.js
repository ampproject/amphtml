'use strict';

// These two imports must precede all others.
import '#polyfills';
import './setup_chai_sinon';

import {configure as configureEnzyme} from 'enzyme';
import PreactEnzyme from 'enzyme-adapter-preact-pure';

import {removeElement} from '#core/dom';
import {resetEvtListenerOptsSupportForTesting} from '#core/dom/event-helper-listen';

import {resetExperimentTogglesForTesting} from '#experiments';

import {Services} from '#service';
import {installDocService} from '#service/ampdoc-impl';
import {
  installAmpdocServices,
  installRuntimeServices,
} from '#service/core-services';
import {cancelTimersForTesting} from '#service/timer-impl';

import {preventAsyncErrorThrows} from './async-errors';
import {
  maybeStubConsoleInfoLogWarn,
  restoreConsoleError,
  restoreConsoleSandbox,
  restoreLogger,
  setTestName,
  setTestRunner,
  stubLogger,
  warnForConsoleError,
} from './console-logging-setup';
import * as describes from './describes';
import {flush as flushPreactEffects} from './preact';
import {TestConfig} from './test-config';
import {installYieldIt} from './yield';

import AMP_CONFIG from '../build-system/global-configs/prod-config.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import {setDefaultBootstrapBaseUrlForTesting} from '../src/3p-frame';
import {activateChunkingForTesting} from '../src/chunk';
import {resetAccumulatedErrorMessagesForTesting} from '../src/error-reporting';
import {adoptWithMultidocDeps} from '../src/runtime';

/** @fileoverview
 * This file initializes AMP's Karma + Mocha based unit & integration tests.
 * TODO(wg-infra): Do a detailed inventory and remove unnecessary steps.
 */

/**
 * Initializes the global state required by all AMP unit and integration tests.
 */
export function initializeTests() {
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
  stubLogger();
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
 * @return {Promise<void>}
 */
async function cleanupTestcase() {
  await flushPreactEffects();
  setTestRunner(this);
  restoreConsoleSandbox();
  restoreAsyncErrorThrows();
  restoreConsoleError();
  restoreLogger();
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
