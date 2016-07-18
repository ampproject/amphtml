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
 * Returns a service for the given id and window (a per-window singleton).
 * If the service is not yet available the factory function is invoked and
 * expected to return the service.
 * Users should typically wrap this as a special purpose function (e.g.
 * `viewportFor(win)`) for type safety and because the factory should not be
 * passed around.
 * @param {!Window} win
 * @param {string} id of the service.
 * @param {function(!Window):!Object=} opt_factory Should create the service
 *     if it does not exist yet. If the factory is not given, it is an error
 *     if the service does not exist yet.
 * @return {*}
 */
export function getService(win, id, opt_factory) {
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
  return getServiceInternal(win, win, id, undefined, constructor);
}

/**
 * Returns a promise for a service for the given id and window. Also expects
 * an element that has the actual implementation. The promise resolves when
 * the implementation loaded.
 * Users should typically wrap this as a special purpose function (e.g.
 * `viewportFor(win)`) for type safety and because the factory should not be
 * passed around.
 * @param {!Window} win
 * @param {string} id of the service.
 * @return {!Promise<*>}
 */
export function getServicePromise(win, id) {
  return getServicePromiseInternal(win, id);
}

/**
 * Like getServicePromise but returns null if the service was never registered.
 * @param {!Window} win
 * @param {string} id of the service.
 * @return {?Promise<*>}
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
 * @param {function(!AmpDoc):!Object=} opt_factory Should create the service
 *     if it does not exist yet. If the factory is not given, it is an error
 *     if the service does not exist yet.
 * @return {*}
 */
export function getServiceForDoc(nodeOrDoc, id, opt_factory) {
  const ampdoc = getAmpdoc(nodeOrDoc);
  return getServiceInternal(
      ampdoc.isSingleDoc() ? ampdoc.getWin() : ampdoc,
      ampdoc,
      id,
      opt_factory);
}

/**
 * Returns a service and registers it given a class to be used as
 * implementation.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} win
 * @param {string} id of the service.
 * @param {function(new:T, !./service/ampdoc-impl.AmpDoc)} constructor
 * @return {T}
 * @template T
 */
export function fromClassForDoc(nodeOrDoc, id, constructor) {
  const ampdoc = getAmpdoc(nodeOrDoc);
  return getServiceInternal(
      ampdoc.isSingleDoc() ? ampdoc.getWin() : ampdoc,
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
 * @return {!Promise<*>}
 */
export function getServicePromiseForDoc(nodeOrDoc, id) {
  const ampdoc = getAmpdoc(nodeOrDoc);
  return getServicePromiseInternal(
      ampdoc.isSingleDoc() ? ampdoc.getWin() : ampdoc,
      id);
}

/**
 * Like getServicePromiseForDoc but returns null if the service was never
 * registered for this ampdoc.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @param {string} id of the service.
 * @return {?Promise<*>}
 */
export function getServicePromiseOrNullForDoc(nodeOrDoc, id) {
  const ampdoc = getAmpdoc(nodeOrDoc);
  return getServicePromiseOrNullInternal(
      ampdoc.isSingleDoc() ? ampdoc.getWin() : ampdoc,
      id);
}

/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!./service/ampdoc-impl.AmpDoc}
 */
function getAmpdoc(nodeOrDoc) {
  if (nodeOrDoc.nodeType) {
    return getAmpdocService(nodeOrDoc.ownerDocument.defaultView).getAmpDoc(
        nodeOrDoc);
  }
  return /** @type {!./service/ampdoc-impl.AmpDoc} */ (nodeOrDoc);
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
 * @param {!Object} context Win or AmpDoc.
 * @param {string} id of the service.
 * @param {!Function=} opt_factory Should create the service
 *     if it does not exist yet. If the factory is not given, it is an error
 *     if the service does not exist yet. Called with context.
 * @param {!Function} opt_constructor Constructor function to new the service.
 *     Called with context.
 * @return {*}
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
    dev.assert(opt_factory || opt_constructor,
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
 * @return {!Promise<*>}
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
 * @return {?Promise<*>}
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
    dev.assert(false, 'Expected object or promise to be present');
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
 * Resets a single service, so it gets recreated on next getService invocation.
 * @param {!Object} holder
 * @param {string} id of the service.
 */
export function resetServiceForTesting(holder, id) {
  if (holder.services) {
    holder.services[id] = null;
  }
}
