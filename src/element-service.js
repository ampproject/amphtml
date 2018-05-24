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
import {stubbedElementNames} from './element-stub-data';
import {toWin} from './types';
import {user} from './log';

/**
 * Returns a promise for a service for the given id and window. Also expects
 * an element that has the actual implementation. The promise resolves when
 * the implementation loaded.
 * Users should typically wrap this as a special purpose function (e.g.
 * Services.viewportForDoc(...)) for type safety and because the factory should not be
 * passed around.
 * @param {!Window} win
 * @param {string} id of the service.
 * @param {string} extension Name of the custom extension that provides the
 *     implementation of this service.
 * @param {boolean=} opt_element Whether this service is provided by an
 *     element, not the extension.
 * @return {!Promise<*>}
 */
export function getElementService(win, id, extension, opt_element) {
  return getElementServiceIfAvailable(win, id, extension, opt_element).then(
      service => assertService(service, id, extension));
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
 * Returns a promise for a service for the given id and window. Also expects
 * an element that has the actual implementation. The promise resolves when
 * the implementation loaded.
 * Users should typically wrap this as a special purpose function (e.g.
 * Services.viewportForDoc(...)) for type safety and because the factory should not be
 * passed around.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @param {string} id of the service.
 * @param {string} extension Name of the custom extension that provides the
 *     implementation of this service.
 * @param {boolean=} opt_element Whether this service is provided by an
 *     element, not the extension.
 * @return {!Promise<*>}
 */
export function getElementServiceForDoc(nodeOrDoc, id, extension, opt_element) {
  return getElementServiceIfAvailableForDoc(
      nodeOrDoc, id, extension, opt_element)
      .then(service => assertService(service, id, extension));
}

/**
 * Same as getElementService but produces null if the given element is not
 * actually available on the current page.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @param {string} id of the service.
 * @param {string} extension Name of the custom extension that provides the
 *     implementation of this service.
 * @param {boolean=} opt_element Whether this service is provided by an
 *     element, not the extension.
 * @return {!Promise<?Object>}
 */
export function getElementServiceIfAvailableForDoc(
  nodeOrDoc, id, extension, opt_element) {
  const ampdoc = getAmpdoc(nodeOrDoc);
  const s = getServicePromiseOrNullForDoc(nodeOrDoc, id);
  if (s) {
    return /** @type {!Promise<?Object>} */ (s);
  }

  return ampdoc.whenBodyAvailable()
      .then(() => waitForExtensionIfStubbed(ampdoc.win, extension))
      .then(() => {
        // If this service is provided by an element, then we can't depend on the
        // service (they may not use the element).
        if (opt_element) {
          return getServicePromiseOrNullForDoc(nodeOrDoc, id);
        } else if (isElementScheduled(ampdoc.win, extension)) {
          return getServicePromiseForDoc(nodeOrDoc, id);
        }
        return null;
      });
}

/**
 * Returns a promise for service for the given id in the embed scope of
 * a given node, if it exists. Otherwise, falls back to ampdoc scope IFF
 * the given node is in the top-level window.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @param {string} id of the service.
 * @param {string} extension Name of the custom element that provides
 *     the implementation of this service.
 * @return {!Promise<?Object>}
 */
export function getElementServiceIfAvailableForDocInEmbedScope(
  nodeOrDoc, id, extension) {
  const s = getExistingServiceForDocInEmbedScope(nodeOrDoc, id);
  if (s) {
    return /** @type {!Promise<?Object>} */ (Promise.resolve(s));
  }
  // Return embed-scope element service promise if scheduled.
  if (nodeOrDoc.nodeType) {
    const win = toWin(/** @type {!Document} */ (
      nodeOrDoc.ownerDocument || nodeOrDoc).defaultView);
    const topWin = getTopWindow(win);
    // In embeds, doc-scope services are window-scope. But make sure to
    // only do this for embeds (not the top window), otherwise we'd grab
    // a promise from the wrong service holder which would never resolve.
    if (win !== topWin) {
      return getElementServicePromiseOrNull(win, id, extension);
    } else {
      // Fallback to ampdoc IFF the given node is _not_ FIE.
      return getElementServiceIfAvailableForDoc(nodeOrDoc, id, extension);
    }
  }
  return /** @type {!Promise<?Object>} */ (Promise.resolve(null));
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
  return /** @type {!Object} */ (user().assert(service,
      'Service %s was requested to be provided through %s, ' +
      'but %s is not loaded in the current page. To fix this ' +
      'problem load the JavaScript file for %s in this page.',
      id, extension, extension, extension));
}

/**
 * Waits for an extension if a stub is present
 * @param {!Window} win
 * @param {string} extension
 * @return {!Promise}
 * @private
 */
function waitForExtensionIfStubbed(win, extension) {
  /**
   * If there is (or was) a stubbed extension wait for it to load before trying
   * to get the service.  Prevents a race condition when everything but
   * the extensions is in cache.  If there is no stub then it's either loaded,
   * not present, or the service was defined by a test. In those cases
   * we don't wait around for an extension that may not exist.
   */
  if (stubbedElementNames.includes(extension)) {
    const extensions = getService(win, 'extensions');
    return /** @type {!Promise<?Object>} */ (
      extensions.waitForExtension(win, extension));
  }
  return Promise.resolve();
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
  return dom.waitForBodyPromise(win.document)
      .then(() => waitForExtensionIfStubbed(win, extension))
      .then(() => {
        // If this service is provided by an element, then we can't depend on the
        // service (they may not use the element).
        if (opt_element) {
          return getServicePromiseOrNull(win, id);
        } else if (isElementScheduled(win, extension)) {
          return getServicePromise(win, id);
        }
        return null;
      });
}
