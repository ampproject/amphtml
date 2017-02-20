/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {
  getServicePromise,
  getServicePromiseOrNull,
  getAmpdoc,
  getServicePromiseForDoc,
  getServicePromiseOrNullForDoc,
} from './service';
import {user} from './log';
import * as dom from './dom';

/**
 * Returns a promise for a service for the given id and window. Also expects
 * an element that has the actual implementation. The promise resolves when
 * the implementation loaded.
 * Users should typically wrap this as a special purpose function (e.g.
 * viewportForDoc(...)) for type safety and because the factory should not be
 * passed around.
 * @param {!Window} win
 * @param {string} id of the service.
 * @param {string} providedByElement Name of the custom element that provides
 *     the implementation of this service.
 * @return {!Promise<*>}
 */
export function getElementService(win, id, providedByElement) {
  return getElementServiceIfAvailable(win, id, providedByElement).then(
      service => {
        return user().assert(service,
            'Service %s was requested to be provided through %s, ' +
            'but %s is not loaded in the current page. To fix this ' +
            'problem load the JavaScript file for %s in this page.',
            id, providedByElement, providedByElement, providedByElement);
      });
}

/**
 * Same as getElementService but produces null if the given element is not
 * actually available on the current page.
 * @param {!Window} win
 * @param {string} id of the service.
 * @param {string} providedByElement Name of the custom element that provides
 *     the implementation of this service.
 * @return {!Promise<?Object>}
 */
export function getElementServiceIfAvailable(win, id, providedByElement) {
  const s = getServicePromiseOrNull(win, id);
  if (s) {
    return /** @type {!Promise<?Object>} */ (s);
  }
  // Microtask is necessary to ensure that window.ampExtendedElements has been
  // initialized.
  return Promise.resolve().then(() => {
    if (isElementScheduled(win, providedByElement)) {
      return getServicePromise(win, id);
    }
    // Wait for HEAD to fully form before denying access to the service.
    return dom.waitForBodyPromise(win.document).then(() => {
      if (isElementScheduled(win, providedByElement)) {
        return getServicePromise(win, id);
      }
      return null;
    });
  });
}

/**
 * @param {!Window} win
 * @param {string} elementName Name of an extended custom element.
 * @return {boolean} Whether this element is scheduled to be loaded.
 */
function isElementScheduled(win, elementName) {
  // Set in custom-element.js
  // TODO(@dvoytenko, #5454): Why hasn't this been created yet.
  if (!win.ampExtendedElements) {
    return false;
  }
  return !!win.ampExtendedElements[elementName];
}


/**
 * Returns a promise for a service for the given id and window. Also expects
 * an element that has the actual implementation. The promise resolves when
 * the implementation loaded.
 * Users should typically wrap this as a special purpose function (e.g.
 * viewportForDoc(...)) for type safety and because the factory should not be
 * passed around.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @param {string} id of the service.
 * @param {string} providedByElement Name of the custom element that provides
 *     the implementation of this service.
 * @return {!Promise<*>}
 */
export function getElementServiceForDoc(nodeOrDoc, id, providedByElement) {
  return getElementServiceIfAvailableForDoc(nodeOrDoc, id, providedByElement)
      .then(service => {
        return user().assert(service,
              'Service %s was requested to be provided through %s, ' +
              'but %s is not loaded in the current page. To fix this ' +
              'problem load the JavaScript file for %s in this page.',
              id, providedByElement, providedByElement, providedByElement);
      });
}

/**
 * Same as getElementService but produces null if the given element is not
 * actually available on the current page.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @param {string} id of the service.
 * @param {string} providedByElement Name of the custom element that provides
 *     the implementation of this service.
 * @return {!Promise<?Object>}
 */
export function getElementServiceIfAvailableForDoc(
    nodeOrDoc, id, providedByElement) {
  const ampdoc = getAmpdoc(nodeOrDoc);
  const s = getServicePromiseOrNullForDoc(nodeOrDoc, id);
  if (s) {
    return /** @type {!Promise<?Object>} */ (s);
  }
  // Microtask is necessary to ensure that window.ampExtendedElements has been
  // initialized.
  return Promise.resolve().then(() => {
    if (isElementScheduled(ampdoc.win, providedByElement)) {
      return getServicePromiseForDoc(nodeOrDoc, id);
    }
    // Wait for HEAD to fully form before denying access to the service.
    return ampdoc.whenBodyAvailable().then(() => {
      if (isElementScheduled(ampdoc.win, providedByElement)) {
        return getServicePromiseForDoc(nodeOrDoc, id);
      }
      return null;
    });
  });
}
