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

// Requires polyfills in immediate side effect.
import './polyfills';
import {dev} from './log';


/**
 * Holds info about a service.
 * - obj: Actual service implementation when available.
 * - promise: Promise for the obj.
 * - resolve: Function to resolve the promise with the object.
 * @typedef {{
 *   obj: (?Object),
 *   promise: (?Promise|undefined),
 *   resolve: (?function(!Object)|undefined),
 * }}
 */
let ServiceHolderDef;


/**
 * This interface provides a `dispose` method that will be called by
 * runtime when a service needs to be disposed of.
 * @interface
 */
export class Disposable {

  /**
   * Instructs the service to release any resources it might be holding. Can
   * be called only once in the lifecycle of a service.
   */
  dispose() {}
}


/**
 * This interface provides a `adoptEmbedWindow` method that will be called by
 * runtime for a new embed window.
 * @interface
 */
export class EmbeddableService {

  /**
   * Instructs the service to adopt the embed window and add any necessary
   * listeners and resources.
   * @param {!Window} unusedEmbedWin
   */
  adoptEmbedWindow(unusedEmbedWin) {}
}


/**
 * Returns a service with the given id. Assumes that it has been constructed
 * already.
 * @param {!Window} win
 * @param {string} id
 * @return {!Object} The service.
 */
export function getExistingServiceForWindow(win, id) {
  win = getTopWindow(win);
  const exists = win.services && win.services[id] && win.services[id].obj;
  return dev().assert(exists, `${id} service not found. Make sure it is ` +
      `installed.`);
}


/**
 * Returns a service with the given id. Assumes that it has been constructed
 * already.
 * @param {!Window} win
 * @param {string} id
 * @return {!Object} The service.
 */
export function getExistingServiceForWindowInEmbedScope(win, id) {
  // First, try to resolve via local (embed) window.
  const local = getLocalExistingServiceForEmbedWinOrNull(win, id);
  if (local) {
    return local;
  }
  // Fallback to top-level window.
  return getExistingServiceForWindow(win, id);
}


/**
 * Returns a service with the given id. Assumes that it has been constructed
 * already.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @param {string} id
 * @return {!Object} The service.
 */
export function getExistingServiceForDoc(nodeOrDoc, id) {
  const serviceHolder = getAmpdocServiceHolder(nodeOrDoc);
  const exists = serviceHolder && serviceHolder.services &&
      serviceHolder.services[id] && serviceHolder.services[id].obj;
  return dev().assert(exists, `${id} doc service not found. Make sure it is ` +
      `installed.`);
}


/**
 * Returns a service with the given id. Assumes that it has been constructed
 * already.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @param {string} id
 * @return {!Object} The service.
 */
export function getExistingServiceForDocInEmbedScope(nodeOrDoc, id) {
  // First, try to resolve via local (embed) window.
  if (nodeOrDoc.nodeType) {
    // If a node is passed, try to resolve via this node.
    const win = /** @type {!Document} */ (
        nodeOrDoc.ownerDocument || nodeOrDoc).defaultView;
    const local = getLocalExistingServiceForEmbedWinOrNull(win, id);
    if (local) {
      return local;
    }
  }
  // Fallback to ampdoc.
  return getExistingServiceForDoc(nodeOrDoc, id);
}


/**
 * Installs a service override on amp-doc level.
 * @param {!Window} embedWin
 * @param {string} id
 * @param {!Object} service The service.
 */
export function installServiceInEmbedScope(embedWin, id, service) {
  const topWin = getTopWindow(embedWin);
  dev().assert(embedWin != topWin,
      'Service override can only be installed in embed window: %s', id);
  dev().assert(!getLocalExistingServiceForEmbedWinOrNull(embedWin, id),
      'Service override has already been installed: %s', id);
  getServiceInternal(embedWin, embedWin, id, () => service);
}


/**
 * @param {!Window} embedWin
 * @param {string} id
 * @return {?Object}
 */
function getLocalExistingServiceForEmbedWinOrNull(embedWin, id) {
  // Note that this method currently only resolves against the given window.
  // It does not try to go all the way up the parent window chain. We can change
  // this in the future, but for now this gives us a better performance.
  const topWin = getTopWindow(embedWin);
  if (embedWin != topWin &&
          embedWin.services &&
          embedWin.services[id] &&
          embedWin.services[id].obj) {
    return embedWin.services[id].obj;
  }
  return null;
}


/**
 * Returns a service for the given id and window (a per-window singleton).
 * If the service is not yet available the factory function is invoked and
 * expected to return the service.
 * Users should typically wrap this as a special purpose function (e.g.
 * `vsyncFor(win)`) for type safety and because the factory should not be
 * passed around.
 * @param {!Window} win
 * @param {string} id of the service.
 * @param {function(!Window):T=} opt_factory Should create the service
 *     if it does not exist yet. If the factory is not given, it is an error
 *     if the service does not exist yet.
 * @template T
 * @return {T}
 */
export function getService(win, id, opt_factory) {
  win = getTopWindow(win);
  return getServiceInternal(win, win, id,
      opt_factory ? opt_factory : undefined);
}


/**
 * Returns a service and registers it given a class to be used as
 * implementation.
 * @param {!Window} win
 * @param {string} id of the service.
 * @param {function(new:T, !Window)} constructor
 * @return {T}
 * @template T
 */
export function fromClass(win, id, constructor) {
  win = getTopWindow(win);
  return getServiceInternal(win, win, id, undefined, constructor);
}


/**
 * Returns a promise for a service for the given id and window. Also expects
 * an element that has the actual implementation. The promise resolves when
 * the implementation loaded.
 * Users should typically wrap this as a special purpose function (e.g.
 * `vsyncFor(win)`) for type safety and because the factory should not be
 * passed around.
 * @param {!Window} win
 * @param {string} id of the service.
 * @return {!Promise<!Object>}
 */
export function getServicePromise(win, id) {
  return getServicePromiseInternal(win, id);
}


/**
 * Like getServicePromise but returns null if the service was never registered.
 * @param {!Window} win
 * @param {string} id of the service.
 * @return {?Promise<!Object>}
 */
export function getServicePromiseOrNull(win, id) {
  return getServicePromiseOrNullInternal(win, id);
}


/**
 * Returns a service for the given id and ampdoc (a per-ampdoc singleton).
 * If the service is not yet available the factory function is invoked and
 * expected to return the service.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @param {string} id of the service.
 * @param {function(!./service/ampdoc-impl.AmpDoc):T=} opt_factory
 *     Should create the service if it does not exist yet. If the factory is
 *     not given, it is an error if the service does not exist yet.
 * @return {T}
 * @template T
 */
export function getServiceForDoc(nodeOrDoc, id, opt_factory) {
  const ampdoc = getAmpdoc(nodeOrDoc);
  return getServiceInternal(
      getAmpdocServiceHolder(ampdoc),
      ampdoc,
      id,
      opt_factory);
}


/**
 * Returns a service and registers it given a class to be used as
 * implementation.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @param {string} id of the service.
 * @param {function(new:T, !./service/ampdoc-impl.AmpDoc)} constructor
 * @return {T}
 * @template T
 */
export function fromClassForDoc(nodeOrDoc, id, constructor) {
  const ampdoc = getAmpdoc(nodeOrDoc);
  return getServiceInternal(
      getAmpdocServiceHolder(ampdoc),
      ampdoc,
      id,
      undefined,
      constructor);
}


/**
 * Returns a promise for a service for the given id and ampdoc. Also expects
 * a service that has the actual implementation. The promise resolves when
 * the implementation loaded.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @param {string} id of the service.
 * @return {!Promise<!Object>}
 */
export function getServicePromiseForDoc(nodeOrDoc, id) {
  return getServicePromiseInternal(
      getAmpdocServiceHolder(nodeOrDoc),
      id);
}


/**
 * Like getServicePromiseForDoc but returns null if the service was never
 * registered for this ampdoc.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @param {string} id of the service.
 * @return {?Promise<!Object>}
 */
export function getServicePromiseOrNullForDoc(nodeOrDoc, id) {
  return getServicePromiseOrNullInternal(
      getAmpdocServiceHolder(nodeOrDoc),
      id);
}


/**
 * Set the parent and top windows on a child window (friendly iframe).
 * @param {!Window} win
 * @param {!Window} parentWin
 */
export function setParentWindow(win, parentWin) {
  win.__AMP_PARENT = parentWin;
  win.__AMP_TOP = getTopWindow(parentWin);
}


/**
 * Returns the parent window for a child window (friendly iframe).
 * @param {!Window} win
 * @return {!Window}
 */
export function getParentWindow(win) {
  return win.__AMP_PARENT || win;
}


/**
 * Returns the top window where AMP Runtime is installed for a child window
 * (friendly iframe).
 * @param {!Window} win
 * @return {!Window}
 */
export function getTopWindow(win) {
  return win.__AMP_TOP || win;
}


/**
 * Returns the parent "friendly" iframe if the node belongs to a child window.
 * @param {!Node} node
 * @param {!Window} topWin
 * @return {?HTMLIFrameElement}
 */
export function getParentWindowFrameElement(node, topWin) {
  const childWin = (node.ownerDocument || node).defaultView;
  if (childWin && childWin != topWin && getTopWindow(childWin) == topWin) {
    try {
      return /** @type {?HTMLIFrameElement} */ (childWin.frameElement);
    } catch (e) {
      // Ignore the error.
    }
  }
  return null;
}


/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!./service/ampdoc-impl.AmpDoc}
 */
export function getAmpdoc(nodeOrDoc) {
  if (nodeOrDoc.nodeType) {
    const win = /** @type {!Document} */ (
        nodeOrDoc.ownerDocument || nodeOrDoc).defaultView;
    return getAmpdocService(win).getAmpDoc(/** @type {!Node} */ (nodeOrDoc));
  }
  return /** @type {!./service/ampdoc-impl.AmpDoc} */ (nodeOrDoc);
}


/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!./service/ampdoc-impl.AmpDoc|!Window}
 */
function getAmpdocServiceHolder(nodeOrDoc) {
  const ampdoc = getAmpdoc(nodeOrDoc);
  return ampdoc.isSingleDoc() ? ampdoc.win : ampdoc;
}


/**
 * This is essentially a duplicate of `ampdoc.js`, but necessary to avoid
 * circular dependencies.
 * @param {!Window} win
 * @return {!./service/ampdoc-impl.AmpDocService}
 */
function getAmpdocService(win) {
  return /** @type {!./service/ampdoc-impl.AmpDocService} */ (
      getService(win, 'ampdoc'));
}


/**
 * @param {!Object} holder Object holding the service instance.
 * @param {!Window|!./service/ampdoc-impl.AmpDoc} context Win or AmpDoc.
 * @param {string} id of the service.
 * @param {function(?):T=} opt_factory
 *     Should create the service if it does not exist yet. If the factory
 *     is not given, it is an error if the service does not exist yet.
 *     Called with context.
 * @param {function(new:T, ?)=} opt_constructor
 *     Constructor function to new the service. Called with context.
 * @return {*}
 * @template T
 */
function getServiceInternal(holder, context, id, opt_factory,
    opt_constructor) {
  const services = getServices(holder);
  let s = services[id];
  if (!s) {
    s = services[id] = {
      obj: null,
      promise: null,
      resolve: null,
    };
  }

  if (!s.obj) {
    dev().assert(opt_factory || opt_constructor,
        'Factory or class not given and service missing %s', id);
    s.obj = opt_constructor
        ? new opt_constructor(context)
        : opt_factory(context);
    // The service may have been requested already, in which case we have a
    // pending promise we need to fulfill.
    if (s.resolve) {
      s.resolve(s.obj);
    }
  }
  return s.obj;
}


/**
 * @param {!Object} holder
 * @param {string} id of the service.
 * @return {!Promise<!Object>}
 */
function getServicePromiseInternal(holder, id) {
  const cached = getServicePromiseOrNullInternal(holder, id);
  if (cached) {
    return cached;
  }
  const services = getServices(holder);

  // TODO(@cramforce): Add a check that if the element is eventually registered
  // that the service is actually provided and this promise resolves.
  let resolve;
  const p = new Promise(r => {
    resolve = r;
  });
  services[id] = {
    obj: null,
    promise: p,
    resolve,
  };

  return p;
}


/**
 * @param {!Object} holder
 * @param {string} id of the service.
 * @return {?Promise<!Object>}
 */
function getServicePromiseOrNullInternal(holder, id) {
  const services = getServices(holder);
  const s = services[id];
  if (s) {
    const p = s.promise;
    if (p) {
      return p;
    }
    if (s.obj) {
      return s.promise = Promise.resolve(s.obj);
    }
    dev().assert(false, 'Expected object or promise to be present');
  }
  return null;
}


/**
 * Returns the object that holds the services registered in a holder.
 * @param {!Object} holder
 * @return {!Object<string,!ServiceHolderDef>}
 */
function getServices(holder) {
  let services = holder.services;
  if (!services) {
    services = holder.services = {};
  }
  return services;
}


/**
 * Whether the specified service implements `Disposable` interface.
 * @param {!Object} service
 * @return {boolean}
 */
export function isDisposable(service) {
  return typeof service.dispose == 'function';
}


/**
 * Asserts that the specified service implements `Disposable` interface and
 * typecasts the instance to `Disposable`.
 * @param {!Object} service
 * @return {!Disposable}
 */
export function assertDisposable(service) {
  dev().assert(isDisposable(service), 'required to implement Disposable');
  return /** @type {!Disposable} */ (service);
}


/**
 * Disposes all disposable (implements `Disposable` interface) services in
 * ampdoc scope.
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 */
export function disposeServicesForDoc(ampdoc) {
  disposeServicesInternal(ampdoc);
}


/**
 * Disposes all disposable (implements `Disposable` interface) services in
 * embed scope.
 * @param {!Window} embedWin
 */
export function disposeServicesForEmbed(embedWin) {
  disposeServicesInternal(embedWin);
}


/**
 * @param {!Object} holder Object holding the service instances.
 */
function disposeServicesInternal(holder) {
  // TODO(dvoytenko): Consider marking holder as destroyed for later-arriving
  // service to be canceled automatically.
  const services = getServices(holder);
  for (const id in services) {
    if (!Object.prototype.hasOwnProperty.call(services, id)) {
      continue;
    }
    const serviceHolder = services[id];
    if (serviceHolder.obj) {
      disposeServiceInternal(id, serviceHolder.obj);
    } else if (serviceHolder.promise) {
      serviceHolder.promise.then(
          instance => disposeServiceInternal(id, instance));
    }
  }
}


/**
 * @param {string} id
 * @param {!Object} service
 */
function disposeServiceInternal(id, service) {
  if (!isDisposable(service)) {
    return;
  }
  try {
    assertDisposable(service).dispose();
  } catch (e) {
    // Ensure that a failure to dispose a service does not disrupt other
    // services.
    dev().error('SERVICE', 'failed to dispose service', id, e);
  }
}


/**
 * Whether the specified service implements `EmbeddableService` interface.
 * @param {!Object} service
 * @return {boolean}
 */
export function isEmbeddable(service) {
  return typeof service.adoptEmbedWindow == 'function';
}


/**
 * Asserts that the specified service implements `EmbeddableService` interface
 * and typecasts the instance to `EmbeddableService`.
 * @param {!Object} service
 * @return {!EmbeddableService}
 */
export function assertEmbeddable(service) {
  dev().assert(isEmbeddable(service),
      'required to implement EmbeddableService');
  return /** @type {!EmbeddableService} */ (service);
}


/**
 * Adopts an embeddable (implements `EmbeddableService` interface) service
 * in embed scope.
 * @param {!Window} embedWin
 * @param {string} serviceId
 */
export function adoptServiceForEmbed(embedWin, serviceId) {
  const frameElement = /** @type {!Node} */ (dev().assert(
      embedWin.frameElement,
      'frameElement not found for embed'));
  const service = getExistingServiceForDoc(frameElement, serviceId);
  assertEmbeddable(service).adoptEmbedWindow(embedWin);
}


/**
 * Resets a single service, so it gets recreated on next getService invocation.
 * @param {!Object} holder
 * @param {string} id of the service.
 */
export function resetServiceForTesting(holder, id) {
  if (holder.services) {
    holder.services[id] = null;
  }
}
