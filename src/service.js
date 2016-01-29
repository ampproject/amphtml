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
import {assert} from './asserts';

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
 * viewportFor(win)) for type safety and because the factory should not be
 * passed around.
 * @param {!Window} win
 * @param {string} id of the service.
 * @param {function(!Window):!Object=} opt_factory Should create the service
 *     if it does not exist yet. If the factory is not given, it is an error
 *     if the service does not exist yet.
 * @return {*}
 */
export function getService(win, id, opt_factory) {
  const services = getServices(win);
  let s = services[id];
  if (!s) {
    s = services[id] = {
      obj: null,
      promise: null,
      resolve: null,
    };
  }

  if (!s.obj) {
    assert(opt_factory, 'Factory not given and service missing %s', id);
    s.obj = opt_factory(win);
    if (!s.promise) {
      s.promise = Promise.resolve(s.obj);
    }
    // The service may have been requested already, in which case we have a
    // pending promise we need to fulfill.
    if (s.resolve) {
      s.resolve(s.obj);
    }
  }
  return s.obj;
}

/**
 * Returns a promise for a service for the given id and window. Also expects
 * an element that has the actual implementation. The promise resolves when
 * the implementation loaded.
 * Users should typically wrap this as a special purpose function (e.g.
 * viewportFor(win)) for type safety and because the factory should not be
 * passed around.
 * @param {!Window} win
 * @param {string} id of the service.
 * @return {!Promise<*>}
 */
export function getServicePromise(win, id) {
  const services = getServices(win);
  const s = services[id];
  if (s) {
    return s.promise;
  }

  // TODO(@cramforce): Add a check that if the element is eventually registered
  // that the service is actually provided and this promise resolves.
  let resolve;
  const p = new Promise(r => {
    resolve = r;
  });
  services[id] = {
    obj: null,
    promise: p,
    resolve: resolve,
  };

  return p;
}

/**
 * Like getServicePromise but returns null if the service was never registered.
 * @param {!Window} win
 * @param {string} id of the service.
 * @return {?Promise<*>}
 */
export function getServicePromiseOrNull(win, id) {
  const services = getServices(win);
  if (services[id]) {
    return services[id].promise;
  }
  return null;
}

/**
 * Returns the object that holds the services registered in a window.
 * @param {!Window} win
 * @return {!Object<string,!ServiceHolderDef>}
 */
function getServices(win) {
  let services = win.services;
  if (!services) {
    services = win.services = {};
  }
  return services;
}

/**
 * Resets a single service, so it gets recreated on next getService invocation.
 * @param {!Window} win
 * @param {string} id of the service.
 */
export function resetServiceForTesting(win, id) {
  if (win.services) {
    win.services[id] = null;
  }
}
