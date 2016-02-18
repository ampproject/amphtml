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
import {adopt} from '../src/runtime';

adopt(window);

// Make amp section in karma config readable by tests.
window.ampTestRuntimeConfig = parent.karma ? parent.karma.config.amp : {};


// Hack for skipping tests on Travis that don't work there.
// Get permission before use!
/**
 * @param {string} desc
 * @param {function()} fn
 */
it.skipOnTravis = function(desc, fn) {
  if (navigator.userAgent.match(/Chromium/)) {
    it.skip(desc, fn);
    return;
  }
  it(desc, fn);
};

// Hack for skipping tests on Travis that don't work there.
// Get permission before use!
/**
 * @param {string} desc
 * @param {function()} fn
 */
it.skipOnFirefox = function(desc, fn) {
  if (navigator.userAgent.match(/Firefox/)) {
    it.skip(desc, fn);
    return;
  }
  it(desc, fn);
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

// Global cleanup of tags added during tests. Cool to add more
// to selector.
afterEach(() => {
  const cleanup = document.querySelectorAll('link,meta');
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
  if (!/native/.test(window.setTimeout)) {
    throw new Error('You likely forgot to restore sinon timers ' +
        '(installed via sandbox.useFakeTimers).');
  }
  if (sandboxes.length > 0) {
    throw new Error('You forgot to restore your sandbox!');
  }
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

