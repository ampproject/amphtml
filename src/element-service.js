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

import * as dom from './dom';
import {
  getAmpdoc,
  getExistingServiceForDocInEmbedScope,
  getService,
  getServicePromise,
  getServicePromiseForDoc,
  getServicePromiseOrNull,
  getServicePromiseOrNullForDoc,
  getTopWindow,
} from './service';
import {toWin} from './types';
import {userAssert} from './log';

/**
 * Returns a promise for a service for the given id and window. Also expects an
 * element that has the actual implementation. The promise resolves when the
 * implementation loaded. Users should typically wrap this as a special purpose
 * function (e.g. Services.viewportForDoc(...)) for type safety and because the
 * factory should not be passed around.
 * @param {!Window} win
 * @param {string} id of the service.
 * @param {string} extension Name of the custom extension that provides the
 *     implementation of this service.
 * @param {boolean=} opt_element Whether this service is provided by an element,
 *     not the extension.
 * @return {!Promise<*>}
 */
export function getElementService(win, id, extension, opt_element) {
  return getElementServiceIfAvailable(win, id, extension, opt_element).then(
    service => assertService(service, id, extension)
  );
}

/**
 * Same as getElementService but produces null if the given element is not
 * actually available on the current page.
 * @param {!Window} win
 * @param {string} id of the service.
 * @param {string} extension Name of the custom extension that provides the
 *     implementation of this service.
 * @param {boolean=} opt_element Whether this service is provided by an
 *     element, not the extension.
 * @return {!Promise<?Object>}
 */
export function getElementServiceIfAvailable(win, id, extension, opt_element) {
  const s = getServicePromiseOrNull(win, id);
  if (s) {
    return /** @type {!Promise<?Object>} */ (s);
  }
  return getElementServicePromiseOrNull(win, id, extension, opt_element);
}

/**
 * @param {!Window} win
 * @param {string} elementName Name of an extended custom element.
 * @return {boolean} Whether this element is scheduled to be loaded.
 */
function isElementScheduled(win, elementName) {
  // Set in custom-element.js
  if (!win.ampExtendedElements) {
    return false;
  }
  return !!win.ampExtendedElements[elementName];
}

/**
 * Returns a promise for a service for the given id and window. Also expects an
 * element that has the actual implementation. The promise resolves when the
 * implementation loaded. Users should typically wrap this as a special purpose
 * function (e.g. Services.viewportForDoc(...)) for type safety and because the
 * factory should not be passed around.
 * @param {!Element|!ShadowRoot} element
 * @param {string} id of the service.
 * @param {string} extension Name of the custom extension that provides the
 *     implementation of this service.
 * @param {boolean=} opt_element Whether this service is provided by an element,
 *     not the extension.
 * @return {!Promise<*>}
 */
export function getElementServiceForDoc(element, id, extension, opt_element) {
  return getElementServiceIfAvailableForDoc(
    element,
    id,
    extension,
    opt_element
  ).then(service => assertService(service, id, extension));
}

/**
 * Same as getElementService but produces null if the given element is not
 * actually available on the current page.
 * @param {!Element|!ShadowRoot} element
 * @param {string} id of the service.
 * @param {string} extension Name of the custom extension that provides the
 *     implementation of this service.
 * @param {boolean=} opt_element Whether this service is provided by an
 *     element, not the extension.
 * @return {!Promise<?Object>}
 */
export function getElementServiceIfAvailableForDoc(
  element,
  id,
  extension,
  opt_element
) {
  const s = getServicePromiseOrNullForDoc(element, id);
  if (s) {
    return /** @type {!Promise<?Object>} */ (s);
  }
  const ampdoc = getAmpdoc(element);
  return ampdoc
    .whenBodyAvailable()
    .then(() =>
      waitForExtensionIfPresent(ampdoc.win, extension, ampdoc.win.document.head)
    )
    .then(() => {
      // If this service is provided by an element, then we can't depend on
      // the service (they may not use the element).
      if (opt_element) {
        return getServicePromiseOrNullForDoc(element, id);
      } else if (isElementScheduled(ampdoc.win, extension)) {
        return getServicePromiseForDoc(element, id);
      }
      return null;
    });
}

/**
 * Returns a promise for service for the given id in the embed scope of
 * a given element, if it exists. Falls back to ampdoc scope if the element
 * is not embedded.
 *
 * @param {!Element|!ShadowRoot} element
 * @param {string} id of the service.
 * @param {string} extension Name of the custom element that provides
 *     the implementation of this service.
 * @return {!Promise<?Object>}
 */
export function getElementServiceIfAvailableForDocInEmbedScope(
  element,
  id,
  extension
) {
  const s = getExistingServiceForDocInEmbedScope(element, id);
  if (s) {
    return /** @type {!Promise<?Object>} */ (Promise.resolve(s));
  }
  const win = toWin(element.ownerDocument.defaultView);
  const topWin = getTopWindow(win);
  // In embeds, doc services are stored on the embed window.
  if (win !== topWin) {
    return getElementServicePromiseOrNull(win, id, extension);
  } else {
    // Only fallback to element's ampdoc (top-level) if not embedded.
    return getElementServiceIfAvailableForDoc(element, id, extension);
  }
}

/**
 * Throws user error if `service` is null.
 * @param {Object} service
 * @param {string} id
 * @param {string} extension
 * @return {!Object}
 * @private
 */
function assertService(service, id, extension) {
  return /** @type {!Object} */ (userAssert(
    service,
    'Service %s was requested to be provided through %s, ' +
      'but %s is not loaded in the current page. To fix this ' +
      'problem load the JavaScript file for %s in this page.',
    id,
    extension,
    extension,
    extension
  ));
}

/**
 * Get list of all the extension JS files
 * @param {HTMLHeadElement|Element|ShadowRoot} head
 * @return {!Array<string>}
 */
export function extensionScriptsInNode(head) {
  // ampdoc.getHeadNode() can return null
  if (!head) {
    return [];
  }
  const scripts = [];
  const list = head.querySelectorAll('script[custom-element]');
  for (let i = 0; i < list.length; i++) {
    scripts.push(list[i].getAttribute('custom-element'));
  }
  return scripts;
}

/**
 * Waits for body to be present then verifies that an extension script is
 * present in head for installation.
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} extensionId
 * @return {!Promise<boolean>}
 */
export function isExtensionScriptInNode(ampdoc, extensionId) {
  return ampdoc.whenBodyAvailable().then(() => {
    return extensionScriptInNode(ampdoc.getHeadNode(), extensionId);
  });
}

/**
 * Verifies that an extension script is present in head for
 * installation.
 * @param {HTMLHeadElement|Element|ShadowRoot} head
 * @param {string} extensionId
 * @private
 */
function extensionScriptInNode(head, extensionId) {
  return extensionScriptsInNode(head).includes(extensionId);
}

/**
 * Waits for an extension if its script is present
 * @param {!Window} win
 * @param {string} extension
 * @param {HTMLHeadElement|Element|ShadowRoot} head
 * @return {!Promise}
 * @private
 */
function waitForExtensionIfPresent(win, extension, head) {
  /**
   * If there is an extension script wait for it to load before trying
   * to get the service. Prevents a race condition when everything but
   * the extensions is in cache. If there is no script then it's either
   * not present, or the service was defined by a test. In those cases
   * we don't wait around for an extension that does not exist.
   */

  // TODO(jpettitt) investigate registerExtension to short circuit
  // the dom call in extensionScriptsInNode()
  if (!extensionScriptInNode(head, extension)) {
    return Promise.resolve();
  }

  const extensions = getService(win, 'extensions');
  return /** @type {!Promise<?Object>} */ (extensions.waitForExtension(
    win,
    extension
  ));
}

/**
 * Returns the promise for service with `id` on the given window if available.
 * Otherwise, resolves with null (service was not registered).
 * @param {!Window} win
 * @param {string} id
 * @param {string} extension
 * @param {boolean=} opt_element
 * @return {!Promise<Object>}
 * @private
 */
function getElementServicePromiseOrNull(win, id, extension, opt_element) {
  return dom
    .waitForBodyPromise(win.document)
    .then(() => waitForExtensionIfPresent(win, extension, win.document.head))
    .then(() => {
      // If this service is provided by an element, then we can't depend on
      // the service (they may not use the element).
      if (opt_element) {
        return getServicePromiseOrNull(win, id);
      } else if (isElementScheduled(win, extension)) {
        return getServicePromise(win, id);
      }
      return null;
    });
}
