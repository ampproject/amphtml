import * as dom from '#core/dom';

import {extensionScriptInNode} from '#service/extension-script';

import {userAssert} from '#utils/log';

import {
  getAmpdoc,
  getService,
  getServiceForDocOrNull,
  getServicePromise,
  getServicePromiseForDoc,
  getServicePromiseOrNull,
  getServicePromiseOrNullForDoc,
} from './service-helpers';

/**
 * Same as getElementService but produces null if the given element is not
 * actually available on the current page.
 * @param {!Window} win
 * @param {string} id of the service.
 * @param {string} extension Name of the custom extension that provides the
 *     implementation of this service.
 * @param {string} version The extension version.
 * @param {boolean=} opt_element Whether this service is provided by an
 *     element, not the extension.
 * @return {!Promise<?Object>}
 */
export function getElementServiceIfAvailable(
  win,
  id,
  extension,
  version,
  opt_element
) {
  const s = getServicePromiseOrNull(win, id);
  if (s) {
    return /** @type {!Promise<?Object>} */ (s);
  }
  return getElementServicePromiseOrNull(
    win,
    id,
    extension,
    version,
    opt_element
  );
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
  ).then((service) => assertService(service, id, extension));
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
    .whenExtensionsKnown()
    .then(() => {
      const version = ampdoc.getExtensionVersion(extension);
      if (!version) {
        return null;
      }
      const extensions = getService(ampdoc.win, 'extensions');
      return extensions.waitForExtension(extension, version);
    })
    .then((ext) => {
      if (!ext) {
        return null;
      }
      // If this service is provided by an element, then we can't depend on
      // the service (they may not use the element).
      if (opt_element) {
        return getServicePromiseOrNullForDoc(element, id);
      }
      return getServicePromiseForDoc(element, id);
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
  const s = getServiceForDocOrNull(element, id);
  if (s) {
    return /** @type {!Promise<?Object>} */ (Promise.resolve(s));
  }
  return getElementServiceIfAvailableForDoc(element, id, extension);
}

/**
 * Throws user error if `service` is null.
 * @param {object} service
 * @param {string} id
 * @param {string} extension
 * @return {!Object}
 * @private
 * @closurePrimitive {asserts.matchesReturn}
 */
function assertService(service, id, extension) {
  return /** @type {!Object} */ (
    userAssert(
      service,
      'Service %s was requested to be provided through %s, ' +
        'but %s is not loaded in the current page. To fix this ' +
        'problem load the JavaScript file for %s in this page.',
      id,
      extension,
      extension,
      extension
    )
  );
}

/**
 * Returns the promise for service with `id` on the given window if available.
 * Otherwise, resolves with null (service was not registered).
 * @param {!Window} win
 * @param {string} id
 * @param {string} extension
 * @param {string} version
 * @param {boolean=} opt_element
 * @return {!Promise<Object>}
 * @private
 */
function getElementServicePromiseOrNull(
  win,
  id,
  extension,
  version,
  opt_element
) {
  return dom
    .waitForBodyOpenPromise(win.document)
    .then(() => {
      // If there is an extension script wait for it to load before trying
      // to get the service. Prevents a race condition when everything but
      // the extensions is in cache. If there is no script then it's either
      // not present, or the service was defined by a test. In those cases
      // we don't wait around for an extension that does not exist.
      const extensions = getService(win, 'extensions');

      // TODO(jpettitt) investigate registerExtension to short circuit
      // the dom call in extensionScriptsInNode()
      if (!extensionScriptInNode(extensions.win, extension, version)) {
        return null;
      }
      return extensions.waitForExtension(extension, version);
    })
    .then((ext) => {
      if (!ext) {
        return null;
      }
      // If this service is provided by an element, then we can't depend on
      // the service (they may not use the element).
      if (opt_element) {
        return getServicePromiseOrNull(win, id);
      }
      return getServicePromise(win, id);
    });
}
