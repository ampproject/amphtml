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
<<<<<<< HEAD
import {adopt} from '../src/runtime';
import {platform} from '../src/platform';
import {setModeForTesting} from '../src/mode';
=======
import {
  adopt,
  installAmpdocServices,
  installRuntimeServices,
} from '../src/runtime';
import {installDocService} from '../src/service/ampdoc-impl';
import {platformFor} from '../src/platform';
>>>>>>> ampproject/master
import {setDefaultBootstrapBaseUrlForTesting} from '../src/3p-frame';

// Needs to be called before the custom elements are first made.
beforeTest();
adopt(window);

// Make amp section in karma config readable by tests.
window.ampTestRuntimeConfig = parent.karma ? parent.karma.config.amp : {};

/**
<<<<<<< HEAD
 * Helper class to skip tests under specific environment.
 * Should be instantiated via describe.skipper() or it.skipper().
 * Get permission before use!
 *
 * Example usages:
 * describe.skipper().skipFirefox().skipSafari().run('Bla bla ...', ... );
 * it.skipper().skipEdge().run('Should ...', ...);
*/
class TestSkipper {

  constructor(runner) {
    this.runner = runner;
    this.skippedUserAgents = [];
  }

  skipOnTravis() {
    this.skippedUserAgents.push('Chromium');
    return this;
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  }

  skipChrome() {
    this.skippedUserAgents.push('Chrome');
    return this;
  }

  skipEdge() {
    this.skippedUserAgents.push('Edge');
    return this;
  }

=======
  }

  skipChrome() {
    this.skippedUserAgents.push('Chrome');
    return this;
  }

=======
  }

  skipChrome() {
    this.skippedUserAgents.push('Chrome');
    return this;
  }

>>>>>>> ampproject/master
  skipEdge() {
    this.skippedUserAgents.push('Edge');
    return this;
  }

<<<<<<< HEAD
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
  skipFirefox() {
    this.skippedUserAgents.push('Firefox');
=======
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
    this.skipMatchers.push(this.platform_.isChrome.bind(this.platform_));
    return this;
  }

  skipEdge() {
    this.skipMatchers.push(this.platform_.isEdge.bind(this.platform_));
    return this;
  }

  skipFirefox() {
    this.skipMatchers.push(this.platform_.isFirefox.bind(this.platform_));
>>>>>>> ampproject/master
    return this;
  }

  skipSafari() {
<<<<<<< HEAD
    this.skippedUserAgents.push('Safari');
    return this;
  }

  /**
   * @param {string} desc
   * @param {function()} fn
   */
  run(desc, fn) {
    for (let i = 0; i < this.skippedUserAgents.length; i++) {
      if (navigator.userAgent.indexOf(this.skippedUserAgents[i]) >= 0) {
        this.runner.skip(desc, fn);
        return;
      }
    }
    this.runner(desc, fn);
  }
=======
  }

  skipChrome() {
    this.skippedUserAgents.push('Chrome');
    return this;
  }

  skipEdge() {
    this.skippedUserAgents.push('Edge');
    return this;
  }

  skipFirefox() {
    this.skippedUserAgents.push('Firefox');
    return this;
  }

  skipSafari() {
    this.skippedUserAgents.push('Safari');
=======
    this.skipMatchers.push(this.platform_.isSafari.bind(this.platform_));
    return this;
  }

  retryOnSaucelabs() {
    if (!window.ampTestRuntimeConfig.saucelabs) {
      return this;
    }
    this.configTasks.push(mocha => {
      mocha.retries(4);
    });
>>>>>>> ampproject/master
    return this;
  }

  /**
   * @param {string} desc
   * @param {function()} fn
   */
  run(desc, fn) {
<<<<<<< HEAD
    for (let i = 0; i < this.skippedUserAgents.length; i++) {
      if (navigator.userAgent.indexOf(this.skippedUserAgents[i]) >= 0) {
=======
    for (let i = 0; i < this.skipMatchers.length; i++) {
      if (this.skipMatchers[i]()) {
>>>>>>> ampproject/master
        this.runner.skip(desc, fn);
        return;
      }
    }
<<<<<<< HEAD
    this.runner(desc, fn);
  }
>>>>>>> ampproject/master
}

describe.skipper = function() {
  return new TestSkipper(describe);
};

it.skipper = function() {
  return new TestSkipper(it);
=======

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
>>>>>>> ampproject/master
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

beforeEach(beforeTest);

function beforeTest() {
<<<<<<< HEAD
  setModeForTesting(null);
  window.AMP_TEST = true;
=======
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
>>>>>>> ampproject/master
}

// Global cleanup of tags added during tests. Cool to add more
// to selector.
afterEach(() => {
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
  if (sandboxes.length > 0) {
    sandboxes.splice(0, sandboxes.length).forEach(sb => sb.restore());
    throw new Error('You forgot to restore your sandbox!');
  }
  if (!/native/.test(window.setTimeout)) {
    throw new Error('You likely forgot to restore sinon timers ' +
        '(installed via sandbox.useFakeTimers).');
  }
  setDefaultBootstrapBaseUrlForTesting(null);
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
  const tagName = obj.tagName.toLowerCase();
  this.assert(
    visibility === 'visible' || parseInt(opacity, 10) > 0,
    'expected element \'' +
        tagName + '\' to be #{exp}, got #{act}. with classes: ' + obj.className,
    'expected element \'' +
        tagName + '\' not to be #{act}. with classes: ' + obj.className,
    'visible',
    visibility
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
