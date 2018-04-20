/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {ElementStub, stubbedElements} from '../element-stub';
import {createCustomElementClass} from '../custom-element';
import {declareExtension} from './ampdoc-impl';
import {reportError} from '../error';
import {user} from '../log';


/**
 * @param {!Window} win
 * @return {!Object<string, function(new:../base-element.BaseElement, !Element)>}
 */
function getExtendedElements(win) {
  if (!win.ampExtendedElements) {
    win.ampExtendedElements = {};
  }
  return win.ampExtendedElements;
}


/**
 * Registers an element. Upgrades it if has previously been stubbed.
 * @param {!Window} win
 * @param {string} name
 * @param {function(new:../base-element.BaseElement, !Element)} toClass
 */
export function upgradeOrRegisterElement(win, name, toClass) {
  const knownElements = getExtendedElements(win);
  if (!knownElements[name]) {
    registerElement(win, name, /** @type {!Function} */ (toClass));
    return;
  }
  if (knownElements[name] == toClass) {
    // Already registered this instance.
    return;
  }
  user().assert(knownElements[name] == ElementStub,
      '%s is already registered. The script tag for ' +
      '%s is likely included twice in the page.', name, name);
  knownElements[name] = toClass;
  for (let i = 0; i < stubbedElements.length; i++) {
    const stub = stubbedElements[i];
    // There are 3 possible states here:
    // 1. We never made the stub because the extended impl. loaded first.
    //    In that case the element won't be in the array.
    // 2. We made a stub but the browser didn't attach it yet. In
    //    that case we don't need to upgrade but simply switch to the new
    //    implementation.
    // 3. A stub was attached. We upgrade which means we replay the
    //    implementation.
    const element = stub.element;
    if (element.tagName.toLowerCase() == name &&
            element.ownerDocument.defaultView == win) {
      tryUpgradeElementNoInline(element, toClass);
      // Remove element from array.
      stubbedElements.splice(i--, 1);
    }
  }
}


/**
 * This method should not be inlined to prevent TryCatch deoptimization.
 * NoInline keyword at the end of function name also prevents Closure compiler
 * from inlining the function.
 * @private
 */
function tryUpgradeElementNoInline(element, toClass) {
  try {
    element.upgrade(toClass);
  } catch (e) {
    reportError(e, element);
  }
}


/**
 * Stub extended elements missing an implementation. It can be called multiple
 * times and on partial document in order to start stubbing as early as
 * possible.
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function stubElementsForDoc(ampdoc) {
  const list = ampdoc.getHeadNode().querySelectorAll('script[custom-element]');
  for (let i = 0; i < list.length; i++) {
    const name = list[i].getAttribute('custom-element');
    declareExtension(ampdoc, name);
    stubElementIfNotKnown(ampdoc.win, name);
  }
}


/**
 * Stub element if not yet known.
 * @param {!Window} win
 * @param {string} name
 */
export function stubElementIfNotKnown(win, name) {
  const knownElements = getExtendedElements(win);
  if (!knownElements[name]) {
    registerElement(win, name, ElementStub);
  }
}


/**
 * Copies the specified element to child window (friendly iframe). This way
 * all implementations of the AMP elements are shared between all friendly
 * frames.
 * @param {!Window} parentWin
 * @param {!Window} childWin
 * @param {string} name
 */
export function copyElementToChildWindow(parentWin, childWin, name) {
  const toClass = getExtendedElements(parentWin)[name];
  registerElement(childWin, name, toClass || ElementStub);
}


/**
 * Registers a new custom element with its implementation class.
 * @param {!Window} win The window in which to register the elements.
 * @param {string} name Name of the custom element
 * @param {function(new:../base-element.BaseElement, !Element)} implementationClass
 */
export function registerElement(win, name, implementationClass) {
  const knownElements = getExtendedElements(win);
  knownElements[name] = implementationClass;
  const klass = createCustomElementClass(win, name);

  const supportsCustomElementsV1 = 'customElements' in win;
  if (supportsCustomElementsV1) {
    win['customElements'].define(name, klass);
  } else {
    win.document.registerElement(name, {
      prototype: klass.prototype,
    });
  }
}


/**
 * In order to provide better error messages we only allow to retrieve
 * services from other elements if those elements are loaded in the page.
 * This makes it possible to mark an element as loaded in a test.
 * @param {!Window} win
 * @param {string} elementName Name of an extended custom element.
 * @visibleForTesting
 */
export function markElementScheduledForTesting(win, elementName) {
  const knownElements = getExtendedElements(win);
  if (!knownElements[elementName]) {
    knownElements[elementName] = ElementStub;
  }
}


/**
 * Resets our scheduled elements.
 * @param {!Window} win
 * @param {string} elementName Name of an extended custom element.
 * @visibleForTesting
 */
export function resetScheduledElementForTesting(win, elementName) {
  if (win.ampExtendedElements) {
    delete win.ampExtendedElements[elementName];
  }
}


/**
 * Returns a currently registered element class.
 * @param {!Window} win
 * @param {string} elementName Name of an extended custom element.
 * @return {?function()}
 * @visibleForTesting
 */
export function getElementClassForTesting(win, elementName) {
  const knownElements = win.ampExtendedElements;
  return knownElements && knownElements[elementName] || null;
}
