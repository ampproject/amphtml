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

import {BaseElement} from './base-element';
import {assert} from './asserts';
import {getMode} from './mode';
import {installStyles} from './styles';
import {registerElement} from './custom-element';
import {registerExtendedElement} from './extended-element';
import {resourcesFor} from './resources';
import {viewerFor} from './viewer';
import {viewportFor} from './viewport';

/** @type {!Array} */
const elementsForTesting = [];

/**
 * Applies the runtime to a given global scope.
 * Multi frame support is currently incomplete.
 * @param {!Window} global Global scope to adopt.
 */
export function adopt(global) {
  // Tests can adopt the same window twice. sigh.
  if (global.AMP_TAG) {
    return;
  }
  global.AMP_TAG = true;
  // If there is already a global AMP object we assume it is an array
  // of functions
  let preregisteredElements = global.AMP || [];

  global.AMP = {};
  /**
   * Registers an extended element and installs its styles.
   * @param {string} name
   * @param {!Function} implementationClass
   * @param {string=} opt_css Optional CSS to install with the component. Use
   *     the special variable $CSS$ in your code. It will be replaced with the
   *     CSS file associated with the element.
   */
  global.AMP.registerElement = function(name, implementationClass, opt_css) {
    var register = function() {
      registerExtendedElement(global, name, implementationClass);
      elementsForTesting.push(
          {name: name, implementationClass: implementationClass});
    };
    if (opt_css) {
      installStyles(global.document, opt_css, register);
    } else {
      register();
    }

  };

  /** @const */
  global.AMP.BaseElement = BaseElement;

  /** @const */
  global.AMP.assert = assert;

  let viewer = viewerFor(global);

  /** @const */
  global.AMP.viewer = viewer;

  if (getMode().development) {
    /** @const */
    global.AMP.toggleRuntime = viewer.toggleRuntime.bind(viewer);
    /** @const */
    global.AMP.resources = resourcesFor(global);
  }

  let viewport = viewportFor(global);

  /** @const */
  global.AMP.viewport = {};
  global.AMP.viewport.getScrollLeft = viewport.getScrollLeft.bind(viewport);
  global.AMP.viewport.getScrollWidth = viewport.getScrollWidth.bind(viewport);
  global.AMP.viewport.getWidth = viewport.getWidth.bind(viewport);

  /**
   * Registers a new custom element.
   * @param {GlobalAmp} fn
   */
  global.AMP.push = function(fn) {
    preregisteredElements.push(fn);
    fn(global.AMP);
  };

  // Execute asynchronously scheduled elements.
  for (let i = 0; i < preregisteredElements.length; i++) {
    let fn = preregisteredElements[i];
    fn(global.AMP);
  }
}

/**
 * Registers all extended elements as normal elements in the given
 * window.
 * Make sure to call `adopt(window)` in your unit test as well and
 * then call this on the generated iframe.
 * @param {!Window} win
 */
export function registerForUnitTest(win) {
  for (let i = 0; i < elementsForTesting.length; i++) {
    let element = elementsForTesting[i];
    registerElement(win, element.name, element.implementationClass);
  }
}
