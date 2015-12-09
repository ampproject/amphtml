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
let ServiceHolder;

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
  const services = getServices(win, id);
  let s = services[id];
  if (!s || !s.obj) {
    assert(opt_factory, 'Factory not given and service missing %s', id);
    if (!s) {
      s = services[id] = {};
    }
    s.obj = opt_factory(win);
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
 * @param {string} provideByElement Name of the custom element that provides
 *     the implementation of this service.
 * @return {!Promise<*>}
 */
export function getElementService(win, id, providedByElement) {
  assert(isElementScheduled(win, providedByElement),
      'Service %s was requested to be provided through %s, ' +
      'but %s is not loaded in the current page.',
      id, providedByElement, providedByElement);
  const services = getServices(win, id);
  const s = services[id];
  if (s) {
    // If we have a promise we return the promise
    if (s.promise) {
      return s.promise;
    }
    // If meanwhile an object was created, we make a promise from it
    // which we will return in future invocations.
    if (s.obj) {
      return s.promise = Promise.resolve(s.obj);
    }
  }
  // TODO(@cramforce): Add a check that if the element is eventually registered
  // that the service is actually provided and this promise resoles.
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
 * @param {!Window} win
 * @param {string} elementName Name of an extended custom element.
 * @return {boolean} Whether this element is scheduled to be loaded.
 */
function isElementScheduled(win, elementName) {
  assert(win.ampExtendedElements, 'win.ampExtendedElements not created yet');
  return !!win.ampExtendedElements[elementName];
}

/**
 * Returns the object that holds the services registered in a window.
 * @param {!Window} win
 * @return {!Object<string,!ServiceHolder>}
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
