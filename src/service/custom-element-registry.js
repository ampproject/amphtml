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
import {extensionScriptsInNode} from '../element-service';
import {reportError} from '../error';
import {userAssert} from '../log';

/**
 * @param {!Window} win
 * @return {!Object<string, typeof ../base-element.BaseElement>}
 */
function getExtendedElements(win) {
  if (!win.__AMP_EXTENDED_ELEMENTS) {
    win.__AMP_EXTENDED_ELEMENTS = {};
  }
  return win.__AMP_EXTENDED_ELEMENTS;
}

/**
 * Registers an element. Upgrades it if has previously been stubbed.
 * @param {!Window} win
 * @param {string} name
 * @param {typeof ../base-element.BaseElement} toClass
 */
export function upgradeOrRegisterElement(win, name, toClass) {
  const knownElements = getExtendedElements(win);
  if (!knownElements[name]) {
    registerElement(win, name, toClass);
    return;
  }
  if (knownElements[name] == toClass) {
    // Already registered this instance.
    return;
  }
  userAssert(
    knownElements[name] == ElementStub,
    '%s is already registered. The script tag for ' +
      '%s is likely included twice in the page.',
    name,
    name
  );
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
    const {element} = stub;
    if (
      element.tagName.toLowerCase() == name &&
      element.ownerDocument.defaultView == win
    ) {
      tryUpgradeElement_(element, toClass);
      // Remove element from array.
      stubbedElements.splice(i--, 1);
    }
  }
}

/**
 * This method should not be inlined to prevent TryCatch deoptimization.
 * @param {Element} element
 * @param {typeof ../base-element.BaseElement} toClass
 * @private
 */
function tryUpgradeElement_(element, toClass) {
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
  const extensions = extensionScriptsInNode(ampdoc.getHeadNode());
  extensions.forEach((name) => {
    ampdoc.declareExtension(name);
    stubElementIfNotKnown(ampdoc.win, name);
  });
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
 * @param {typeof ../base-element.BaseElement} implementationClass
 */
export function registerElement(win, name, implementationClass) {
  const knownElements = getExtendedElements(win);
  knownElements[name] = implementationClass;
  const klass = createCustomElementClass(win);
  win['customElements'].define(name, klass);
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
  if (win.__AMP_EXTENDED_ELEMENTS) {
    delete win.__AMP_EXTENDED_ELEMENTS[elementName];
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
  const knownElements = win.__AMP_EXTENDED_ELEMENTS;
  return (knownElements && knownElements[elementName]) || null;
}
