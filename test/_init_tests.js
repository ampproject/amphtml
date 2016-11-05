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

// This must load before all other tests.
import '../third_party/babel/custom-babel-helpers';
import '../src/polyfills';
import {removeElement} from '../src/dom';
import {
  adopt,
  installAmpdocServices,
  installRuntimeServices,
} from '../src/runtime';
import {activateChunkingForTesting} from '../src/chunk';
import {installDocService} from '../src/service/ampdoc-impl';
import {platformFor} from '../src/platform';
import {setDefaultBootstrapBaseUrlForTesting} from '../src/3p-frame';
import {resetAccumulatedErrorMessagesForTesting} from '../src/error';
import * as describes from '../testing/describes';


// All exposed describes.
global.describes = describes;

// Increase the before/after each timeout since certain times they have timedout
// during the normal 2000 allowance.
const BEFORE_AFTER_TIMEOUT = 5000;

// Needs to be called before the custom elements are first made.
beforeTest();
adopt(window);

// Override AMP.extension to buffer extension installers.
/**
 * @param {string} name
 * @param {string} version
 * @param {function(!Object)} installer
 * @const
 */
global.AMP.extension = function(name, version, installer) {
  describes.bufferExtension(`${name}:${version}`, installer);
};


// Make amp section in karma config readable by tests.
window.ampTestRuntimeConfig = parent.karma ? parent.karma.config.amp : {};

/**
 * Helper class to skip or retry tests under specific environment.
 * Should be instantiated via describe.configure() or it.configure().
 * Get permission before use!
 *
 * Example usages:
 * describe.configure().skipFirefox().skipSafari().run('Bla bla ...', ... );
 * it.configure().skipEdge().run('Should ...', ...);
*/
class TestConfig {

  constructor(runner) {
    this.runner = runner;
    /**
     * List of predicate functions that are called before running each test
     * suite to check whether the suite should be skipped or not.
     * If any of the functions return 'true', the suite will be skipped.
     * @type {!Array<function():boolean>}
     */
    this.skipMatchers = [];
    /**
     * Called for each test suite (things created by `describe`).
     * @type {!Array<function(!TestSuite)>}
     */
    this.configTasks = [];
    this.platform_ = platformFor(window);
  }

  skipChrome() {
    return this.skip(this.platform_.isChrome.bind(this.platform_));
  }

  skipEdge() {
    return this.skip(this.platform_.isEdge.bind(this.platform_));
  }

  skipFirefox() {
    return this.skip(this.platform_.isFirefox.bind(this.platform_));
  }

  skipSafari() {
    return this.skip(this.platform_.isSafari.bind(this.platform_));
  }

  /**
   * @param {function():boolean} fn
   */
  skip(fn) {
    this.skipMatchers.push(fn);
    return this;
  }

  retryOnSaucelabs() {
    if (!window.ampTestRuntimeConfig.saucelabs) {
      return this;
    }
    this.configTasks.push(mocha => {
      mocha.retries(4);
    });
    return this;
  }

  /**
   * @param {string} desc
   * @param {function()} fn
   */
  run(desc, fn) {
    for (let i = 0; i < this.skipMatchers.length; i++) {
      if (this.skipMatchers[i]()) {
        this.runner.skip(desc, fn);
        return;
      }
    }

    const tasks = this.configTasks;
    this.runner(desc, function() {
      tasks.forEach(task => {
        task(this);
      });
      return fn.apply(this, arguments);
    });
  }
}

describe.configure = function() {
  return new TestConfig(describe);
};

it.configure = function() {
  return new TestConfig(it);
};

// Used to check if an unrestored sandbox exists
const sandboxes = [];
const create = sinon.sandbox.create;
sinon.sandbox.create = function(config) {
  const sandbox = create.call(sinon.sandbox, config);
  sandboxes.push(sandbox);

  const restore = sandbox.restore;
  sandbox.restore = function() {
    const i = sandboxes.indexOf(sandbox);
    if (i > -1) {
      sandboxes.splice(i, 1);
    }
    return restore.call(sandbox);
  };
  return sandbox;
};

beforeEach(function() {
  this.timeout(BEFORE_AFTER_TIMEOUT);
  beforeTest();
});

function beforeTest() {
  activateChunkingForTesting();
  window.AMP_MODE = null;
  window.AMP_CONFIG = {
    canary: 'testSentinel',
  };
  window.AMP_TEST = true;
  window.ampExtendedElements = {};
  const ampdocService = installDocService(window, true);
  const ampdoc = ampdocService.getAmpDoc(window.document);
  installRuntimeServices(window);
  installAmpdocServices(ampdoc);
}

// Global cleanup of tags added during tests. Cool to add more
// to selector.
afterEach(function() {
  this.timeout(BEFORE_AFTER_TIMEOUT);
  const cleanupTagNames = ['link', 'meta'];
  if (!platformFor(window).isSafari()) {
    // TODO(#3315): Removing test iframes break tests on Safari.
    cleanupTagNames.push('iframe');
  }
  const cleanup = document.querySelectorAll(cleanupTagNames.join(','));
  for (let i = 0; i < cleanup.length; i++) {
    try {
      const element = cleanup[i];
      removeElement(element);
    } catch (e) {
      // This sometimes fails for unknown reasons.
      console./*OK*/log(e);
    }
  }
  window.localStorage.clear();
  window.ampExtendedElements = {};
  window.ENABLE_LOG = false;
  window.AMP_DEV_MODE = false;
  window.context = undefined;
  const forgotGlobal = !!global.sandbox;
  if (forgotGlobal) {
    // The error will be thrown later to give possibly other sandboxes a
    // chance to restore themselves.
    delete global.sandbox;
  }
  if (sandboxes.length > 0) {
    sandboxes.splice(0, sandboxes.length).forEach(sb => sb.restore());
    throw new Error('You forgot to restore your sandbox!');
  }
  if (forgotGlobal) {
    throw new Error('You forgot to clear global sandbox!');
  }
  if (!/native/.test(window.setTimeout)) {
    throw new Error('You likely forgot to restore sinon timers ' +
        '(installed via sandbox.useFakeTimers).');
  }
  setDefaultBootstrapBaseUrlForTesting(null);
  resetAccumulatedErrorMessagesForTesting();
});

chai.Assertion.addMethod('attribute', function(attr) {
  const obj = this._obj;
  const tagName = obj.tagName.toLowerCase();
  this.assert(
    obj.hasAttribute(attr),
    'expected element \'' + tagName + '\' to have attribute #{exp}',
    'expected element \'' + tagName + '\' to not have attribute #{act}',
    attr,
    attr
  );
});

chai.Assertion.addMethod('class', function(className) {
  const obj = this._obj;
  const tagName = obj.tagName.toLowerCase();
  this.assert(
    obj.classList.contains(className),
    'expected element \'' + tagName + '\' to have class #{exp}',
    'expected element \'' + tagName + '\' to not have class #{act}',
    className,
    className
  );
});

chai.Assertion.addProperty('visible', function() {
  const obj = this._obj;
  const computedStyle = window.getComputedStyle(obj);
  const visibility = computedStyle.getPropertyValue('visibility');
  const opacity = computedStyle.getPropertyValue('opacity');
  const isOpaque = parseInt(opacity, 10) > 0;
  const tagName = obj.tagName.toLowerCase();
  this.assert(
      visibility === 'visible' && isOpaque,
      'expected element \'' +
      tagName + '\' to be #{exp}, got #{act}. with classes: ' + obj.className,
      'expected element \'' +
      tagName + '\' not to be #{exp}, got #{act}. with classes: ' +
      obj.className,
      'visible and opaque',
      `visibility = ${visibility} and opacity = ${opacity}`
  );
});

chai.Assertion.addProperty('hidden', function() {
  const obj = this._obj;
  const computedStyle = window.getComputedStyle(obj);
  const visibility = computedStyle.getPropertyValue('visibility');
  const opacity = computedStyle.getPropertyValue('opacity');
  const tagName = obj.tagName.toLowerCase();
  this.assert(
     visibility === 'hidden' || parseInt(opacity, 10) == 0,
    'expected element \'' +
        tagName + '\' to be #{exp}, got #{act}. with classes: ' + obj.className,
    'expected element \'' +
        tagName + '\' not to be #{act}. with classes: ' + obj.className,
    'hidden',
    visibility
  );
});

chai.Assertion.addMethod('display', function(display) {
  const obj = this._obj;
  const value = window.getComputedStyle(obj).getPropertyValue('display');
  const tagName = obj.tagName.toLowerCase();
  this.assert(
     value === display,
    'expected element \'' + tagName + '\' to be #{exp}, got #{act}.',
    'expected element \'' + tagName + '\' not to be #{act}.',
    display,
    value
  );
});

chai.Assertion.addMethod('jsonEqual', function(compare) {
  const obj = this._obj;
  const a = JSON.stringify(compare);
  const b = JSON.stringify(obj);
  this.assert(
    a == b,
    'expected JSON to be equal.\nExp: #{exp}\nAct: #{act}',
    'expected JSON to not be equal.\nExp: #{exp}\nAct: #{act}',
    a,
    b
  );
});

sinon = null;
