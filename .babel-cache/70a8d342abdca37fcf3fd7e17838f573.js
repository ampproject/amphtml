function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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

/**
 * @fileoverview Registration and getter functions for AMP services.
 *
 * Invariant: Service getters never return null for registered services.
 */
import { Deferred } from "./core/data-structures/promise";
import { toWin } from "./core/window";
import { dev, devAssert } from "./log";

/**
 * Holds info about a service.
 * - obj: Actual service implementation when available.
 * - promise: Promise for the obj.
 * - resolve: Function to resolve the promise with the object.
 * - context: Argument for ctor, either a window or an ampdoc.
 * - ctor: Function that constructs and returns the service.
 * @typedef {{
 *   obj: (?Object),
 *   promise: (?Promise),
 *   resolve: (?function(!Object)),
 *   reject: (?function((*))),
 *   context: (?Window|?./service/ampdoc-impl.AmpDoc),
 *   ctor: (function(new:Object, !Window)|
 *          function(new:Object, !./service/ampdoc-impl.AmpDoc)),
 * }}
 */
var ServiceHolderDef;

/**
 * This interface provides a `dispose` method that will be called by
 * runtime when a service needs to be disposed of.
 * @interface
 */
export var Disposable = /*#__PURE__*/function () {
  function Disposable() {
    _classCallCheck(this, Disposable);
  }

  _createClass(Disposable, [{
    key: "dispose",
    value:
    /**
     * Instructs the service to release any resources it might be holding. Can
     * be called only once in the lifecycle of a service.
     */
    function dispose() {}
  }]);

  return Disposable;
}();

/**
 * Installs a service override on amp-doc level.
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} id
 * @param {!Object} service The service.
 */
export function installServiceInEmbedDoc(ampdoc, id, service) {
  registerServiceInternal(getAmpdocServiceHolder(ampdoc), ampdoc, id, function () {
    return service;
  },
  /* override */
  true);
}

/**
 * Installs a service override in the scope of an embedded window.
 * @param {!Window} embedWin
 * @param {string} id
 * @param {function(new:Object, !Window)} constructor
 */
export function registerServiceBuilderInEmbedWin(embedWin, id, constructor) {
  registerServiceInternal(embedWin, embedWin, id, constructor,
  /* override */
  true);
}

/**
 * Registers a service given a class to be used as implementation.
 * @param {!Window} win
 * @param {string} id of the service.
 * @param {function(new:Object, !Window)} constructor
 * @param {boolean=} opt_instantiate Whether to immediately create the service
 */
export function registerServiceBuilder(win, id, constructor, opt_instantiate) {
  win = getTopWindow(win);
  registerServiceInternal(win, win, id, constructor);

  if (opt_instantiate) {
    getServiceInternal(win, id);
  }
}

/**
 * Returns a service and registers it given a class to be used as
 * implementation.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @param {string} id of the service.
 * @param {function(new:Object, !./service/ampdoc-impl.AmpDoc)} constructor
 * @param {boolean=} opt_instantiate Whether to immediately create the service
 */
export function registerServiceBuilderForDoc(nodeOrDoc, id, constructor, opt_instantiate) {
  var ampdoc = getAmpdoc(nodeOrDoc);
  var holder = getAmpdocServiceHolder(ampdoc);
  registerServiceInternal(holder, ampdoc, id, constructor);

  if (opt_instantiate) {
    getServiceInternal(holder, id);
  }
}

/**
 * Reject a service promise.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @param {string} id
 * @param {*} error
 */
export function rejectServicePromiseForDoc(nodeOrDoc, id, error) {
  var ampdoc = getAmpdoc(nodeOrDoc);
  var holder = getAmpdocServiceHolder(ampdoc);
  rejectServicePromiseInternal(holder, id, error);
}

/**
 * Returns a service for the given id and window (a per-window singleton). Users
 * should typically wrap this as a special purpose function (e.g.
 * `Services.vsyncFor(win)`) for type safety and because the factory should not
 * be passed around.
 * @param {!Window} win
 * @param {string} id of the service.
 * @template T
 * @return {T}
 */
export function getService(win, id) {
  win = getTopWindow(win);
  return getServiceInternal(win, id);
}

/**
 * Returns a service for the given id and window (a per-window singleton). But
 * it looks in the immediate window scope, not the top-level window.
 * @param {!Window} win
 * @param {string} id of the service.
 * @template T
 * @return {T}
 */
export function getServiceInEmbedWin(win, id) {
  return getServiceInternal(win, id);
}

/**
 * Returns a promise for a service for the given id and window. Also expects an
 * element that has the actual implementation. The promise resolves when the
 * implementation loaded. Users should typically wrap this as a special purpose
 * function (e.g. `Services.vsyncFor(win)`) for type safety and because the
 * factory should not be passed around.
 * @param {!Window} win
 * @param {string} id of the service.
 * @return {!Promise<!Object>}
 */
export function getServicePromise(win, id) {
  return getServicePromiseInternal(win, id);
}

/**
 * Returns a service or null with the given id.
 * @param {!Window} win
 * @param {string} id
 * @return {?Object} The service.
 */
export function getExistingServiceOrNull(win, id) {
  win = getTopWindow(win);

  if (isServiceRegistered(win, id)) {
    return getServiceInternal(win, id);
  } else {
    return null;
  }
}

/**
 * Like getServicePromise but returns null if the service was never registered.
 * @param {!Window} win
 * @param {string} id
 * @return {?Promise<!Object>}
 */
export function getServicePromiseOrNull(win, id) {
  return getServicePromiseOrNullInternal(win, id);
}

/**
 * Returns a service for the given id and ampdoc (a per-ampdoc singleton).
 * Expects service `id` to be registered.
 * @param {!Element|!ShadowRoot|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @param {string} id
 * @return {T}
 * @template T
 */
export function getServiceForDoc(elementOrAmpDoc, id) {
  var ampdoc = getAmpdoc(elementOrAmpDoc);
  var holder = getAmpdocServiceHolder(ampdoc);
  return getServiceInternal(holder, id);
}

/**
 * Returns a service for the given id and ampdoc (a per-ampdoc singleton).
 * If service `id` is not registered, returns null.
 * @param {!Element|!ShadowRoot|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @param {string} id
 * @return {?Object}
 */
export function getServiceForDocOrNull(elementOrAmpDoc, id) {
  var ampdoc = getAmpdoc(elementOrAmpDoc);
  var holder = getAmpdocServiceHolder(ampdoc);

  if (isServiceRegistered(holder, id)) {
    return getServiceInternal(holder, id);
  } else {
    return null;
  }
}

/**
 * Returns a promise for a service for the given id and ampdoc. Also expects
 * a service that has the actual implementation. The promise resolves when
 * the implementation loaded.
 * @param {!Element|!ShadowRoot|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @param {string} id
 * @return {!Promise<!Object>}
 */
export function getServicePromiseForDoc(elementOrAmpDoc, id) {
  return getServicePromiseInternal(getAmpdocServiceHolder(elementOrAmpDoc), id);
}

/**
 * Like getServicePromiseForDoc but returns null if the service was never
 * registered for this ampdoc.
 * @param {!Element|!ShadowRoot|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @param {string} id
 * @return {?Promise<!Object>}
 */
export function getServicePromiseOrNullForDoc(elementOrAmpDoc, id) {
  return getServicePromiseOrNullInternal(getAmpdocServiceHolder(elementOrAmpDoc), id);
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
  return win.__AMP_TOP || (win.__AMP_TOP = win);
}

/**
 * Returns the parent "friendly" iframe if the node belongs to a child window.
 * @param {!Node} node
 * @param {!Window=} opt_topWin
 * @return {?HTMLIFrameElement}
 */
export function getParentWindowFrameElement(node, opt_topWin) {
  var childWin = (node.ownerDocument || node).defaultView;
  var topWin = opt_topWin || getTopWindow(childWin);

  if (childWin && childWin != topWin && getTopWindow(childWin) == topWin) {
    try {
      return (
        /** @type {?HTMLIFrameElement} */
        childWin.frameElement
      );
    } catch (e) {// Ignore the error.
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
    var win = toWin(
    /** @type {!Document} */
    (nodeOrDoc.ownerDocument || nodeOrDoc).defaultView);
    return getAmpdocService(win).getAmpDoc(
    /** @type {!Node} */
    nodeOrDoc);
  }

  return (
    /** @type {!./service/ampdoc-impl.AmpDoc} */
    nodeOrDoc
  );
}

/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!./service/ampdoc-impl.AmpDoc|!Window}
 */
function getAmpdocServiceHolder(nodeOrDoc) {
  var ampdoc = getAmpdoc(nodeOrDoc);
  return ampdoc.isSingleDoc() ? ampdoc.win : ampdoc;
}

/**
 * This is essentially a duplicate of `ampdoc.js`, but necessary to avoid
 * circular dependencies.
 * @param {!Window} win
 * @return {!./service/ampdoc-impl.AmpDocService}
 */
function getAmpdocService(win) {
  return (
    /** @type {!./service/ampdoc-impl.AmpDocService} */
    getService(win, 'ampdoc')
  );
}

/**
 * Get service `id` from `holder`. Assumes the service
 * has already been registered.
 * @param {!Object} holder Object holding the service instance.
 * @param {string} id of the service.
 * @return {Object}
 */
function getServiceInternal(holder, id) {
  devAssert(isServiceRegistered(holder, id), "Expected service " + id + " to be registered");
  var services = getServices(holder);
  var s = services[id];

  if (!s.obj) {
    devAssert(s.ctor, "Service " + id + " registered without ctor nor impl.");
    devAssert(s.context, "Service " + id + " registered without context.");
    s.obj = new s.ctor(s.context);
    devAssert(s.obj, "Service " + id + " constructed to null.");
    s.context = null;

    // The service may have been requested already, in which case we have a
    // pending promise we need to fulfill.
    if (s.resolve) {
      s.resolve(s.obj);
    }
  }

  return s.obj;
}

/**
 * @param {!Object} holder Object holding the service instance.
 * @param {!Window|!./service/ampdoc-impl.AmpDoc} context Win or AmpDoc.
 * @param {string} id of the service.
 * @param {?function(new:Object, !Window)|?function(new:Object, !./service/ampdoc-impl.AmpDoc)} ctor Constructor function to new the service. Called with context.
 * @param {boolean=} opt_override
 * @param {boolean=} opt_sharedInstance
 */
function registerServiceInternal(holder, context, id, ctor, opt_override, opt_sharedInstance) {
  var services = getServices(holder);
  var s = services[id];

  if (!s) {
    s = services[id] = {
      obj: null,
      promise: null,
      resolve: null,
      reject: null,
      context: null,
      ctor: null,
      sharedInstance: opt_sharedInstance || false
    };
  }

  if (!opt_override && s.ctor) {
    // Service already registered.
    return;
  }

  s.ctor = ctor;
  s.context = context;
  s.sharedInstance = opt_sharedInstance || false;

  // The service may have been requested already, in which case there is a
  // pending promise that needs to fulfilled.
  if (s.resolve) {
    // getServiceInternal will resolve the promise.
    getServiceInternal(holder, id);
  }
}

/**
 * @param {!Object} holder
 * @param {string} id of the service.
 * @return {!Promise<!Object>}
 */
function getServicePromiseInternal(holder, id) {
  var cached = getServicePromiseOrNullInternal(holder, id);

  if (cached) {
    return cached;
  }

  // Service is not registered.
  // TODO(@cramforce): Add a check that if the element is eventually registered
  // that the service is actually provided and this promise resolves.
  var services = getServices(holder);
  services[id] = emptyServiceHolderWithPromise();
  return (
    /** @type {!Promise<!Object>} */
    services[id].promise
  );
}

/**
 * @param {!Object} holder
 * @param {string} id of the service.
 * @param {*} error
 */
function rejectServicePromiseInternal(holder, id, error) {
  var services = getServices(holder);
  var s = services[id];

  if (s) {
    if (s.reject) {
      s.reject(error);
    }

    return;
  }

  services[id] = emptyServiceHolderWithPromise();
  services[id].reject(error);
}

/**
 * Returns a promise for service `id` if the service has been registered
 * on `holder`.
 * @param {!Object} holder
 * @param {string} id of the service.
 * @return {?Promise<!Object>}
 */
function getServicePromiseOrNullInternal(holder, id) {
  var services = getServices(holder);
  var s = services[id];

  if (s) {
    if (s.promise) {
      return s.promise;
    } else {
      // Instantiate service if not already instantiated.
      getServiceInternal(holder, id);
      return s.promise = Promise.resolve(
      /** @type {!Object} */
      s.obj);
    }
  }

  return null;
}

/**
 * Returns the object that holds the services registered in a holder.
 * @param {!Object} holder
 * @return {!Object<string,!ServiceHolderDef>}
 */
function getServices(holder) {
  var services = holder.__AMP_SERVICES;

  if (!services) {
    services = holder.__AMP_SERVICES = {};
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
  devAssert(isDisposable(service), 'required to implement Disposable');
  return (
    /** @type {!Disposable} */
    service
  );
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
  var services = getServices(holder);

  var _loop = function _loop(id) {
    if (!Object.prototype.hasOwnProperty.call(services, id)) {
      return "continue";
    }

    var serviceHolder = services[id];

    if (serviceHolder.sharedInstance) {
      return "continue";
    }

    if (serviceHolder.obj) {
      disposeServiceInternal(id, serviceHolder.obj);
    } else if (serviceHolder.promise) {
      serviceHolder.promise.then(function (instance) {
        return disposeServiceInternal(id, instance);
      });
    }
  };

  for (var id in services) {
    var _ret = _loop(id);

    if (_ret === "continue") continue;
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
 * This adopts the service **instance** from the parent.
 *
 * This function is dangerous! Sharing an instance means data can leak to and
 * from a child ampdoc.
 *
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} id
 */
export function adoptServiceForEmbedDoc(ampdoc, id) {
  var service = getServiceInternal(getAmpdocServiceHolder(devAssert(ampdoc.getParent())), id);
  registerServiceInternal(getAmpdocServiceHolder(ampdoc), ampdoc, id, function () {
    return service;
  },
  /* override */
  false,
  /* sharedInstance */
  true);
}

/**
 * This adopts the service **factory** from the parent.
 *
 * This function is safer than sharing the service instance, since each ampdoc
 * will create its own instance of the factory (and each instance will have its
 * own instance data). Note that static data is still shared, so it's not 100%
 * foolproof.
 *
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} id
 */
export function adoptServiceFactoryForEmbedDoc(ampdoc, id) {
  var parentHolder = getAmpdocServiceHolder(devAssert(ampdoc.getParent()));
  devAssert(isServiceRegistered(parentHolder, id), "Expected service " + id + " to be registered");
  var service = getServices(parentHolder)[id];
  registerServiceInternal(getAmpdocServiceHolder(ampdoc), ampdoc, id, devAssert(service.ctor));
}

/**
 * Resets a single service, so it gets recreated on next getService invocation.
 * @param {!Object} holder
 * @param {string} id of the service.
 */
export function resetServiceForTesting(holder, id) {
  if (holder.__AMP_SERVICES) {
    holder.__AMP_SERVICES[id] = null;
  }
}

/**
 * @param {!Object} holder Object holding the service instance.
 * @param {string} id of the service.
 * @return {boolean}
 */
function isServiceRegistered(holder, id) {
  var service = holder.__AMP_SERVICES && holder.__AMP_SERVICES[id];
  // All registered services must have a constructor.
  return !!(service && service.ctor);
}

/** @return {!ServiceHolderDef} */
function emptyServiceHolderWithPromise() {
  var deferred = new Deferred();
  var promise = deferred.promise,
      reject = deferred.reject,
      resolve = deferred.resolve;
  promise.catch(function () {});
  // avoid uncaught exception when service gets rejected
  return {
    obj: null,
    promise: promise,
    resolve: resolve,
    reject: reject,
    context: null,
    ctor: null
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlcnZpY2UtaGVscGVycy5qcyJdLCJuYW1lcyI6WyJEZWZlcnJlZCIsInRvV2luIiwiZGV2IiwiZGV2QXNzZXJ0IiwiU2VydmljZUhvbGRlckRlZiIsIkRpc3Bvc2FibGUiLCJpbnN0YWxsU2VydmljZUluRW1iZWREb2MiLCJhbXBkb2MiLCJpZCIsInNlcnZpY2UiLCJyZWdpc3RlclNlcnZpY2VJbnRlcm5hbCIsImdldEFtcGRvY1NlcnZpY2VIb2xkZXIiLCJyZWdpc3RlclNlcnZpY2VCdWlsZGVySW5FbWJlZFdpbiIsImVtYmVkV2luIiwiY29uc3RydWN0b3IiLCJyZWdpc3RlclNlcnZpY2VCdWlsZGVyIiwid2luIiwib3B0X2luc3RhbnRpYXRlIiwiZ2V0VG9wV2luZG93IiwiZ2V0U2VydmljZUludGVybmFsIiwicmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyIsIm5vZGVPckRvYyIsImdldEFtcGRvYyIsImhvbGRlciIsInJlamVjdFNlcnZpY2VQcm9taXNlRm9yRG9jIiwiZXJyb3IiLCJyZWplY3RTZXJ2aWNlUHJvbWlzZUludGVybmFsIiwiZ2V0U2VydmljZSIsImdldFNlcnZpY2VJbkVtYmVkV2luIiwiZ2V0U2VydmljZVByb21pc2UiLCJnZXRTZXJ2aWNlUHJvbWlzZUludGVybmFsIiwiZ2V0RXhpc3RpbmdTZXJ2aWNlT3JOdWxsIiwiaXNTZXJ2aWNlUmVnaXN0ZXJlZCIsImdldFNlcnZpY2VQcm9taXNlT3JOdWxsIiwiZ2V0U2VydmljZVByb21pc2VPck51bGxJbnRlcm5hbCIsImdldFNlcnZpY2VGb3JEb2MiLCJlbGVtZW50T3JBbXBEb2MiLCJnZXRTZXJ2aWNlRm9yRG9jT3JOdWxsIiwiZ2V0U2VydmljZVByb21pc2VGb3JEb2MiLCJnZXRTZXJ2aWNlUHJvbWlzZU9yTnVsbEZvckRvYyIsInNldFBhcmVudFdpbmRvdyIsInBhcmVudFdpbiIsIl9fQU1QX1BBUkVOVCIsIl9fQU1QX1RPUCIsImdldFBhcmVudFdpbmRvdyIsImdldFBhcmVudFdpbmRvd0ZyYW1lRWxlbWVudCIsIm5vZGUiLCJvcHRfdG9wV2luIiwiY2hpbGRXaW4iLCJvd25lckRvY3VtZW50IiwiZGVmYXVsdFZpZXciLCJ0b3BXaW4iLCJmcmFtZUVsZW1lbnQiLCJlIiwibm9kZVR5cGUiLCJnZXRBbXBkb2NTZXJ2aWNlIiwiZ2V0QW1wRG9jIiwiaXNTaW5nbGVEb2MiLCJzZXJ2aWNlcyIsImdldFNlcnZpY2VzIiwicyIsIm9iaiIsImN0b3IiLCJjb250ZXh0IiwicmVzb2x2ZSIsIm9wdF9vdmVycmlkZSIsIm9wdF9zaGFyZWRJbnN0YW5jZSIsInByb21pc2UiLCJyZWplY3QiLCJzaGFyZWRJbnN0YW5jZSIsImNhY2hlZCIsImVtcHR5U2VydmljZUhvbGRlcldpdGhQcm9taXNlIiwiUHJvbWlzZSIsIl9fQU1QX1NFUlZJQ0VTIiwiaXNEaXNwb3NhYmxlIiwiZGlzcG9zZSIsImFzc2VydERpc3Bvc2FibGUiLCJkaXNwb3NlU2VydmljZXNGb3JEb2MiLCJkaXNwb3NlU2VydmljZXNJbnRlcm5hbCIsImRpc3Bvc2VTZXJ2aWNlc0ZvckVtYmVkIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwic2VydmljZUhvbGRlciIsImRpc3Bvc2VTZXJ2aWNlSW50ZXJuYWwiLCJ0aGVuIiwiaW5zdGFuY2UiLCJhZG9wdFNlcnZpY2VGb3JFbWJlZERvYyIsImdldFBhcmVudCIsImFkb3B0U2VydmljZUZhY3RvcnlGb3JFbWJlZERvYyIsInBhcmVudEhvbGRlciIsInJlc2V0U2VydmljZUZvclRlc3RpbmciLCJkZWZlcnJlZCIsImNhdGNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFFBQVI7QUFDQSxTQUFRQyxLQUFSO0FBQ0EsU0FBUUMsR0FBUixFQUFhQyxTQUFi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MUIsT0FBUDtBQUFBLE1BQWdCQyxNQUFoQixHQUFtQ3lCLFFBQW5DLENBQWdCekIsTUFBaEI7QUFBQSxNQUF3QkosT0FBeEIsR0FBbUM2QixRQUFuQyxDQUF3QjdCLE9BQXhCO0FBQ0FHLEVBQUFBLE9BQU8sQ0FBQzJCLEtBQVIsQ0FBYyxZQUFNLENBQUUsQ0FBdEI7QUFBeUI7QUFDekIsU0FBTztBQUNMakMsSUFBQUEsR0FBRyxFQUFFLElBREE7QUFFTE0sSUFBQUEsT0FBTyxFQUFQQSxPQUZLO0FBR0xILElBQUFBLE9BQU8sRUFBUEEsT0FISztBQUlMSSxJQUFBQSxNQUFNLEVBQU5BLE1BSks7QUFLTEwsSUFBQUEsT0FBTyxFQUFFLElBTEo7QUFNTEQsSUFBQUEsSUFBSSxFQUFFO0FBTkQsR0FBUDtBQVFEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBSZWdpc3RyYXRpb24gYW5kIGdldHRlciBmdW5jdGlvbnMgZm9yIEFNUCBzZXJ2aWNlcy5cbiAqXG4gKiBJbnZhcmlhbnQ6IFNlcnZpY2UgZ2V0dGVycyBuZXZlciByZXR1cm4gbnVsbCBmb3IgcmVnaXN0ZXJlZCBzZXJ2aWNlcy5cbiAqL1xuXG5pbXBvcnQge0RlZmVycmVkfSBmcm9tICcuL2NvcmUvZGF0YS1zdHJ1Y3R1cmVzL3Byb21pc2UnO1xuaW1wb3J0IHt0b1dpbn0gZnJvbSAnLi9jb3JlL3dpbmRvdyc7XG5pbXBvcnQge2RldiwgZGV2QXNzZXJ0fSBmcm9tICcuL2xvZyc7XG5cbi8qKlxuICogSG9sZHMgaW5mbyBhYm91dCBhIHNlcnZpY2UuXG4gKiAtIG9iajogQWN0dWFsIHNlcnZpY2UgaW1wbGVtZW50YXRpb24gd2hlbiBhdmFpbGFibGUuXG4gKiAtIHByb21pc2U6IFByb21pc2UgZm9yIHRoZSBvYmouXG4gKiAtIHJlc29sdmU6IEZ1bmN0aW9uIHRvIHJlc29sdmUgdGhlIHByb21pc2Ugd2l0aCB0aGUgb2JqZWN0LlxuICogLSBjb250ZXh0OiBBcmd1bWVudCBmb3IgY3RvciwgZWl0aGVyIGEgd2luZG93IG9yIGFuIGFtcGRvYy5cbiAqIC0gY3RvcjogRnVuY3Rpb24gdGhhdCBjb25zdHJ1Y3RzIGFuZCByZXR1cm5zIHRoZSBzZXJ2aWNlLlxuICogQHR5cGVkZWYge3tcbiAqICAgb2JqOiAoP09iamVjdCksXG4gKiAgIHByb21pc2U6ICg/UHJvbWlzZSksXG4gKiAgIHJlc29sdmU6ICg/ZnVuY3Rpb24oIU9iamVjdCkpLFxuICogICByZWplY3Q6ICg/ZnVuY3Rpb24oKCopKSksXG4gKiAgIGNvbnRleHQ6ICg/V2luZG93fD8uL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jKSxcbiAqICAgY3RvcjogKGZ1bmN0aW9uKG5ldzpPYmplY3QsICFXaW5kb3cpfFxuICogICAgICAgICAgZnVuY3Rpb24obmV3Ok9iamVjdCwgIS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2MpKSxcbiAqIH19XG4gKi9cbmxldCBTZXJ2aWNlSG9sZGVyRGVmO1xuXG4vKipcbiAqIFRoaXMgaW50ZXJmYWNlIHByb3ZpZGVzIGEgYGRpc3Bvc2VgIG1ldGhvZCB0aGF0IHdpbGwgYmUgY2FsbGVkIGJ5XG4gKiBydW50aW1lIHdoZW4gYSBzZXJ2aWNlIG5lZWRzIHRvIGJlIGRpc3Bvc2VkIG9mLlxuICogQGludGVyZmFjZVxuICovXG5leHBvcnQgY2xhc3MgRGlzcG9zYWJsZSB7XG4gIC8qKlxuICAgKiBJbnN0cnVjdHMgdGhlIHNlcnZpY2UgdG8gcmVsZWFzZSBhbnkgcmVzb3VyY2VzIGl0IG1pZ2h0IGJlIGhvbGRpbmcuIENhblxuICAgKiBiZSBjYWxsZWQgb25seSBvbmNlIGluIHRoZSBsaWZlY3ljbGUgb2YgYSBzZXJ2aWNlLlxuICAgKi9cbiAgZGlzcG9zZSgpIHt9XG59XG5cbi8qKlxuICogSW5zdGFsbHMgYSBzZXJ2aWNlIG92ZXJyaWRlIG9uIGFtcC1kb2MgbGV2ZWwuXG4gKiBAcGFyYW0geyEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICogQHBhcmFtIHshT2JqZWN0fSBzZXJ2aWNlIFRoZSBzZXJ2aWNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbFNlcnZpY2VJbkVtYmVkRG9jKGFtcGRvYywgaWQsIHNlcnZpY2UpIHtcbiAgcmVnaXN0ZXJTZXJ2aWNlSW50ZXJuYWwoXG4gICAgZ2V0QW1wZG9jU2VydmljZUhvbGRlcihhbXBkb2MpLFxuICAgIGFtcGRvYyxcbiAgICBpZCxcbiAgICBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gc2VydmljZTtcbiAgICB9LFxuICAgIC8qIG92ZXJyaWRlICovIHRydWVcbiAgKTtcbn1cblxuLyoqXG4gKiBJbnN0YWxscyBhIHNlcnZpY2Ugb3ZlcnJpZGUgaW4gdGhlIHNjb3BlIG9mIGFuIGVtYmVkZGVkIHdpbmRvdy5cbiAqIEBwYXJhbSB7IVdpbmRvd30gZW1iZWRXaW5cbiAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICogQHBhcmFtIHtmdW5jdGlvbihuZXc6T2JqZWN0LCAhV2luZG93KX0gY29uc3RydWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXJJbkVtYmVkV2luKGVtYmVkV2luLCBpZCwgY29uc3RydWN0b3IpIHtcbiAgcmVnaXN0ZXJTZXJ2aWNlSW50ZXJuYWwoXG4gICAgZW1iZWRXaW4sXG4gICAgZW1iZWRXaW4sXG4gICAgaWQsXG4gICAgY29uc3RydWN0b3IsXG4gICAgLyogb3ZlcnJpZGUgKi8gdHJ1ZVxuICApO1xufVxuXG4vKipcbiAqIFJlZ2lzdGVycyBhIHNlcnZpY2UgZ2l2ZW4gYSBjbGFzcyB0byBiZSB1c2VkIGFzIGltcGxlbWVudGF0aW9uLlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCBvZiB0aGUgc2VydmljZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24obmV3Ok9iamVjdCwgIVdpbmRvdyl9IGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfaW5zdGFudGlhdGUgV2hldGhlciB0byBpbW1lZGlhdGVseSBjcmVhdGUgdGhlIHNlcnZpY2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXIod2luLCBpZCwgY29uc3RydWN0b3IsIG9wdF9pbnN0YW50aWF0ZSkge1xuICB3aW4gPSBnZXRUb3BXaW5kb3cod2luKTtcbiAgcmVnaXN0ZXJTZXJ2aWNlSW50ZXJuYWwod2luLCB3aW4sIGlkLCBjb25zdHJ1Y3Rvcik7XG4gIGlmIChvcHRfaW5zdGFudGlhdGUpIHtcbiAgICBnZXRTZXJ2aWNlSW50ZXJuYWwod2luLCBpZCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgc2VydmljZSBhbmQgcmVnaXN0ZXJzIGl0IGdpdmVuIGEgY2xhc3MgdG8gYmUgdXNlZCBhc1xuICogaW1wbGVtZW50YXRpb24uXG4gKiBAcGFyYW0geyFOb2RlfCEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBub2RlT3JEb2NcbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCBvZiB0aGUgc2VydmljZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24obmV3Ok9iamVjdCwgIS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2MpfSBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtib29sZWFuPX0gb3B0X2luc3RhbnRpYXRlIFdoZXRoZXIgdG8gaW1tZWRpYXRlbHkgY3JlYXRlIHRoZSBzZXJ2aWNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jKFxuICBub2RlT3JEb2MsXG4gIGlkLFxuICBjb25zdHJ1Y3RvcixcbiAgb3B0X2luc3RhbnRpYXRlXG4pIHtcbiAgY29uc3QgYW1wZG9jID0gZ2V0QW1wZG9jKG5vZGVPckRvYyk7XG4gIGNvbnN0IGhvbGRlciA9IGdldEFtcGRvY1NlcnZpY2VIb2xkZXIoYW1wZG9jKTtcbiAgcmVnaXN0ZXJTZXJ2aWNlSW50ZXJuYWwoaG9sZGVyLCBhbXBkb2MsIGlkLCBjb25zdHJ1Y3Rvcik7XG4gIGlmIChvcHRfaW5zdGFudGlhdGUpIHtcbiAgICBnZXRTZXJ2aWNlSW50ZXJuYWwoaG9sZGVyLCBpZCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWplY3QgYSBzZXJ2aWNlIHByb21pc2UuXG4gKiBAcGFyYW0geyFOb2RlfCEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBub2RlT3JEb2NcbiAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICogQHBhcmFtIHsqfSBlcnJvclxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVqZWN0U2VydmljZVByb21pc2VGb3JEb2Mobm9kZU9yRG9jLCBpZCwgZXJyb3IpIHtcbiAgY29uc3QgYW1wZG9jID0gZ2V0QW1wZG9jKG5vZGVPckRvYyk7XG4gIGNvbnN0IGhvbGRlciA9IGdldEFtcGRvY1NlcnZpY2VIb2xkZXIoYW1wZG9jKTtcbiAgcmVqZWN0U2VydmljZVByb21pc2VJbnRlcm5hbChob2xkZXIsIGlkLCBlcnJvcik7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHNlcnZpY2UgZm9yIHRoZSBnaXZlbiBpZCBhbmQgd2luZG93IChhIHBlci13aW5kb3cgc2luZ2xldG9uKS4gVXNlcnNcbiAqIHNob3VsZCB0eXBpY2FsbHkgd3JhcCB0aGlzIGFzIGEgc3BlY2lhbCBwdXJwb3NlIGZ1bmN0aW9uIChlLmcuXG4gKiBgU2VydmljZXMudnN5bmNGb3Iod2luKWApIGZvciB0eXBlIHNhZmV0eSBhbmQgYmVjYXVzZSB0aGUgZmFjdG9yeSBzaG91bGQgbm90XG4gKiBiZSBwYXNzZWQgYXJvdW5kLlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCBvZiB0aGUgc2VydmljZS5cbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcmV0dXJuIHtUfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VydmljZSh3aW4sIGlkKSB7XG4gIHdpbiA9IGdldFRvcFdpbmRvdyh3aW4pO1xuICByZXR1cm4gZ2V0U2VydmljZUludGVybmFsKHdpbiwgaWQpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBzZXJ2aWNlIGZvciB0aGUgZ2l2ZW4gaWQgYW5kIHdpbmRvdyAoYSBwZXItd2luZG93IHNpbmdsZXRvbikuIEJ1dFxuICogaXQgbG9va3MgaW4gdGhlIGltbWVkaWF0ZSB3aW5kb3cgc2NvcGUsIG5vdCB0aGUgdG9wLWxldmVsIHdpbmRvdy5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0ge3N0cmluZ30gaWQgb2YgdGhlIHNlcnZpY2UuXG4gKiBAdGVtcGxhdGUgVFxuICogQHJldHVybiB7VH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNlcnZpY2VJbkVtYmVkV2luKHdpbiwgaWQpIHtcbiAgcmV0dXJuIGdldFNlcnZpY2VJbnRlcm5hbCh3aW4sIGlkKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSBmb3IgYSBzZXJ2aWNlIGZvciB0aGUgZ2l2ZW4gaWQgYW5kIHdpbmRvdy4gQWxzbyBleHBlY3RzIGFuXG4gKiBlbGVtZW50IHRoYXQgaGFzIHRoZSBhY3R1YWwgaW1wbGVtZW50YXRpb24uIFRoZSBwcm9taXNlIHJlc29sdmVzIHdoZW4gdGhlXG4gKiBpbXBsZW1lbnRhdGlvbiBsb2FkZWQuIFVzZXJzIHNob3VsZCB0eXBpY2FsbHkgd3JhcCB0aGlzIGFzIGEgc3BlY2lhbCBwdXJwb3NlXG4gKiBmdW5jdGlvbiAoZS5nLiBgU2VydmljZXMudnN5bmNGb3Iod2luKWApIGZvciB0eXBlIHNhZmV0eSBhbmQgYmVjYXVzZSB0aGVcbiAqIGZhY3Rvcnkgc2hvdWxkIG5vdCBiZSBwYXNzZWQgYXJvdW5kLlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCBvZiB0aGUgc2VydmljZS5cbiAqIEByZXR1cm4geyFQcm9taXNlPCFPYmplY3Q+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VydmljZVByb21pc2Uod2luLCBpZCkge1xuICByZXR1cm4gZ2V0U2VydmljZVByb21pc2VJbnRlcm5hbCh3aW4sIGlkKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgc2VydmljZSBvciBudWxsIHdpdGggdGhlIGdpdmVuIGlkLlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICogQHJldHVybiB7P09iamVjdH0gVGhlIHNlcnZpY2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFeGlzdGluZ1NlcnZpY2VPck51bGwod2luLCBpZCkge1xuICB3aW4gPSBnZXRUb3BXaW5kb3cod2luKTtcbiAgaWYgKGlzU2VydmljZVJlZ2lzdGVyZWQod2luLCBpZCkpIHtcbiAgICByZXR1cm4gZ2V0U2VydmljZUludGVybmFsKHdpbiwgaWQpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogTGlrZSBnZXRTZXJ2aWNlUHJvbWlzZSBidXQgcmV0dXJucyBudWxsIGlmIHRoZSBzZXJ2aWNlIHdhcyBuZXZlciByZWdpc3RlcmVkLlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICogQHJldHVybiB7P1Byb21pc2U8IU9iamVjdD59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZXJ2aWNlUHJvbWlzZU9yTnVsbCh3aW4sIGlkKSB7XG4gIHJldHVybiBnZXRTZXJ2aWNlUHJvbWlzZU9yTnVsbEludGVybmFsKHdpbiwgaWQpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBzZXJ2aWNlIGZvciB0aGUgZ2l2ZW4gaWQgYW5kIGFtcGRvYyAoYSBwZXItYW1wZG9jIHNpbmdsZXRvbikuXG4gKiBFeHBlY3RzIHNlcnZpY2UgYGlkYCB0byBiZSByZWdpc3RlcmVkLlxuICogQHBhcmFtIHshRWxlbWVudHwhU2hhZG93Um9vdHwhLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gZWxlbWVudE9yQW1wRG9jXG4gKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAqIEByZXR1cm4ge1R9XG4gKiBAdGVtcGxhdGUgVFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VydmljZUZvckRvYyhlbGVtZW50T3JBbXBEb2MsIGlkKSB7XG4gIGNvbnN0IGFtcGRvYyA9IGdldEFtcGRvYyhlbGVtZW50T3JBbXBEb2MpO1xuICBjb25zdCBob2xkZXIgPSBnZXRBbXBkb2NTZXJ2aWNlSG9sZGVyKGFtcGRvYyk7XG4gIHJldHVybiBnZXRTZXJ2aWNlSW50ZXJuYWwoaG9sZGVyLCBpZCk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHNlcnZpY2UgZm9yIHRoZSBnaXZlbiBpZCBhbmQgYW1wZG9jIChhIHBlci1hbXBkb2Mgc2luZ2xldG9uKS5cbiAqIElmIHNlcnZpY2UgYGlkYCBpcyBub3QgcmVnaXN0ZXJlZCwgcmV0dXJucyBudWxsLlxuICogQHBhcmFtIHshRWxlbWVudHwhU2hhZG93Um9vdHwhLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gZWxlbWVudE9yQW1wRG9jXG4gKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAqIEByZXR1cm4gez9PYmplY3R9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZXJ2aWNlRm9yRG9jT3JOdWxsKGVsZW1lbnRPckFtcERvYywgaWQpIHtcbiAgY29uc3QgYW1wZG9jID0gZ2V0QW1wZG9jKGVsZW1lbnRPckFtcERvYyk7XG4gIGNvbnN0IGhvbGRlciA9IGdldEFtcGRvY1NlcnZpY2VIb2xkZXIoYW1wZG9jKTtcbiAgaWYgKGlzU2VydmljZVJlZ2lzdGVyZWQoaG9sZGVyLCBpZCkpIHtcbiAgICByZXR1cm4gZ2V0U2VydmljZUludGVybmFsKGhvbGRlciwgaWQpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHByb21pc2UgZm9yIGEgc2VydmljZSBmb3IgdGhlIGdpdmVuIGlkIGFuZCBhbXBkb2MuIEFsc28gZXhwZWN0c1xuICogYSBzZXJ2aWNlIHRoYXQgaGFzIHRoZSBhY3R1YWwgaW1wbGVtZW50YXRpb24uIFRoZSBwcm9taXNlIHJlc29sdmVzIHdoZW5cbiAqIHRoZSBpbXBsZW1lbnRhdGlvbiBsb2FkZWQuXG4gKiBAcGFyYW0geyFFbGVtZW50fCFTaGFkb3dSb290fCEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBlbGVtZW50T3JBbXBEb2NcbiAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICogQHJldHVybiB7IVByb21pc2U8IU9iamVjdD59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZXJ2aWNlUHJvbWlzZUZvckRvYyhlbGVtZW50T3JBbXBEb2MsIGlkKSB7XG4gIHJldHVybiBnZXRTZXJ2aWNlUHJvbWlzZUludGVybmFsKGdldEFtcGRvY1NlcnZpY2VIb2xkZXIoZWxlbWVudE9yQW1wRG9jKSwgaWQpO1xufVxuXG4vKipcbiAqIExpa2UgZ2V0U2VydmljZVByb21pc2VGb3JEb2MgYnV0IHJldHVybnMgbnVsbCBpZiB0aGUgc2VydmljZSB3YXMgbmV2ZXJcbiAqIHJlZ2lzdGVyZWQgZm9yIHRoaXMgYW1wZG9jLlxuICogQHBhcmFtIHshRWxlbWVudHwhU2hhZG93Um9vdHwhLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gZWxlbWVudE9yQW1wRG9jXG4gKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAqIEByZXR1cm4gez9Qcm9taXNlPCFPYmplY3Q+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VydmljZVByb21pc2VPck51bGxGb3JEb2MoZWxlbWVudE9yQW1wRG9jLCBpZCkge1xuICByZXR1cm4gZ2V0U2VydmljZVByb21pc2VPck51bGxJbnRlcm5hbChcbiAgICBnZXRBbXBkb2NTZXJ2aWNlSG9sZGVyKGVsZW1lbnRPckFtcERvYyksXG4gICAgaWRcbiAgKTtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIHBhcmVudCBhbmQgdG9wIHdpbmRvd3Mgb24gYSBjaGlsZCB3aW5kb3cgKGZyaWVuZGx5IGlmcmFtZSkuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHshV2luZG93fSBwYXJlbnRXaW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFBhcmVudFdpbmRvdyh3aW4sIHBhcmVudFdpbikge1xuICB3aW4uX19BTVBfUEFSRU5UID0gcGFyZW50V2luO1xuICB3aW4uX19BTVBfVE9QID0gZ2V0VG9wV2luZG93KHBhcmVudFdpbik7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgcGFyZW50IHdpbmRvdyBmb3IgYSBjaGlsZCB3aW5kb3cgKGZyaWVuZGx5IGlmcmFtZSkuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHJldHVybiB7IVdpbmRvd31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFBhcmVudFdpbmRvdyh3aW4pIHtcbiAgcmV0dXJuIHdpbi5fX0FNUF9QQVJFTlQgfHwgd2luO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHRvcCB3aW5kb3cgd2hlcmUgQU1QIFJ1bnRpbWUgaXMgaW5zdGFsbGVkIGZvciBhIGNoaWxkIHdpbmRvd1xuICogKGZyaWVuZGx5IGlmcmFtZSkuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHJldHVybiB7IVdpbmRvd31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRvcFdpbmRvdyh3aW4pIHtcbiAgcmV0dXJuIHdpbi5fX0FNUF9UT1AgfHwgKHdpbi5fX0FNUF9UT1AgPSB3aW4pO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHBhcmVudCBcImZyaWVuZGx5XCIgaWZyYW1lIGlmIHRoZSBub2RlIGJlbG9uZ3MgdG8gYSBjaGlsZCB3aW5kb3cuXG4gKiBAcGFyYW0geyFOb2RlfSBub2RlXG4gKiBAcGFyYW0geyFXaW5kb3c9fSBvcHRfdG9wV2luXG4gKiBAcmV0dXJuIHs/SFRNTElGcmFtZUVsZW1lbnR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXJlbnRXaW5kb3dGcmFtZUVsZW1lbnQobm9kZSwgb3B0X3RvcFdpbikge1xuICBjb25zdCBjaGlsZFdpbiA9IChub2RlLm93bmVyRG9jdW1lbnQgfHwgbm9kZSkuZGVmYXVsdFZpZXc7XG4gIGNvbnN0IHRvcFdpbiA9IG9wdF90b3BXaW4gfHwgZ2V0VG9wV2luZG93KGNoaWxkV2luKTtcbiAgaWYgKGNoaWxkV2luICYmIGNoaWxkV2luICE9IHRvcFdpbiAmJiBnZXRUb3BXaW5kb3coY2hpbGRXaW4pID09IHRvcFdpbikge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHs/SFRNTElGcmFtZUVsZW1lbnR9ICovIChjaGlsZFdpbi5mcmFtZUVsZW1lbnQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIElnbm9yZSB0aGUgZXJyb3IuXG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IU5vZGV8IS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IG5vZGVPckRvY1xuICogQHJldHVybiB7IS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbXBkb2Mobm9kZU9yRG9jKSB7XG4gIGlmIChub2RlT3JEb2Mubm9kZVR5cGUpIHtcbiAgICBjb25zdCB3aW4gPSB0b1dpbihcbiAgICAgIC8qKiBAdHlwZSB7IURvY3VtZW50fSAqLyAobm9kZU9yRG9jLm93bmVyRG9jdW1lbnQgfHwgbm9kZU9yRG9jKVxuICAgICAgICAuZGVmYXVsdFZpZXdcbiAgICApO1xuICAgIHJldHVybiBnZXRBbXBkb2NTZXJ2aWNlKHdpbikuZ2V0QW1wRG9jKC8qKiBAdHlwZSB7IU5vZGV9ICovIChub2RlT3JEb2MpKTtcbiAgfVxuICByZXR1cm4gLyoqIEB0eXBlIHshLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gKi8gKG5vZGVPckRvYyk7XG59XG5cbi8qKlxuICogQHBhcmFtIHshTm9kZXwhLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gbm9kZU9yRG9jXG4gKiBAcmV0dXJuIHshLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY3whV2luZG93fVxuICovXG5mdW5jdGlvbiBnZXRBbXBkb2NTZXJ2aWNlSG9sZGVyKG5vZGVPckRvYykge1xuICBjb25zdCBhbXBkb2MgPSBnZXRBbXBkb2Mobm9kZU9yRG9jKTtcbiAgcmV0dXJuIGFtcGRvYy5pc1NpbmdsZURvYygpID8gYW1wZG9jLndpbiA6IGFtcGRvYztcbn1cblxuLyoqXG4gKiBUaGlzIGlzIGVzc2VudGlhbGx5IGEgZHVwbGljYXRlIG9mIGBhbXBkb2MuanNgLCBidXQgbmVjZXNzYXJ5IHRvIGF2b2lkXG4gKiBjaXJjdWxhciBkZXBlbmRlbmNpZXMuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHJldHVybiB7IS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2NTZXJ2aWNlfVxuICovXG5mdW5jdGlvbiBnZXRBbXBkb2NTZXJ2aWNlKHdpbikge1xuICByZXR1cm4gLyoqIEB0eXBlIHshLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY1NlcnZpY2V9ICovIChcbiAgICBnZXRTZXJ2aWNlKHdpbiwgJ2FtcGRvYycpXG4gICk7XG59XG5cbi8qKlxuICogR2V0IHNlcnZpY2UgYGlkYCBmcm9tIGBob2xkZXJgLiBBc3N1bWVzIHRoZSBzZXJ2aWNlXG4gKiBoYXMgYWxyZWFkeSBiZWVuIHJlZ2lzdGVyZWQuXG4gKiBAcGFyYW0geyFPYmplY3R9IGhvbGRlciBPYmplY3QgaG9sZGluZyB0aGUgc2VydmljZSBpbnN0YW5jZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCBvZiB0aGUgc2VydmljZS5cbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gZ2V0U2VydmljZUludGVybmFsKGhvbGRlciwgaWQpIHtcbiAgZGV2QXNzZXJ0KFxuICAgIGlzU2VydmljZVJlZ2lzdGVyZWQoaG9sZGVyLCBpZCksXG4gICAgYEV4cGVjdGVkIHNlcnZpY2UgJHtpZH0gdG8gYmUgcmVnaXN0ZXJlZGBcbiAgKTtcbiAgY29uc3Qgc2VydmljZXMgPSBnZXRTZXJ2aWNlcyhob2xkZXIpO1xuICBjb25zdCBzID0gc2VydmljZXNbaWRdO1xuICBpZiAoIXMub2JqKSB7XG4gICAgZGV2QXNzZXJ0KHMuY3RvciwgYFNlcnZpY2UgJHtpZH0gcmVnaXN0ZXJlZCB3aXRob3V0IGN0b3Igbm9yIGltcGwuYCk7XG4gICAgZGV2QXNzZXJ0KHMuY29udGV4dCwgYFNlcnZpY2UgJHtpZH0gcmVnaXN0ZXJlZCB3aXRob3V0IGNvbnRleHQuYCk7XG4gICAgcy5vYmogPSBuZXcgcy5jdG9yKHMuY29udGV4dCk7XG4gICAgZGV2QXNzZXJ0KHMub2JqLCBgU2VydmljZSAke2lkfSBjb25zdHJ1Y3RlZCB0byBudWxsLmApO1xuICAgIHMuY29udGV4dCA9IG51bGw7XG4gICAgLy8gVGhlIHNlcnZpY2UgbWF5IGhhdmUgYmVlbiByZXF1ZXN0ZWQgYWxyZWFkeSwgaW4gd2hpY2ggY2FzZSB3ZSBoYXZlIGFcbiAgICAvLyBwZW5kaW5nIHByb21pc2Ugd2UgbmVlZCB0byBmdWxmaWxsLlxuICAgIGlmIChzLnJlc29sdmUpIHtcbiAgICAgIHMucmVzb2x2ZShzLm9iaik7XG4gICAgfVxuICB9XG4gIHJldHVybiBzLm9iajtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFPYmplY3R9IGhvbGRlciBPYmplY3QgaG9sZGluZyB0aGUgc2VydmljZSBpbnN0YW5jZS5cbiAqIEBwYXJhbSB7IVdpbmRvd3whLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gY29udGV4dCBXaW4gb3IgQW1wRG9jLlxuICogQHBhcmFtIHtzdHJpbmd9IGlkIG9mIHRoZSBzZXJ2aWNlLlxuICogQHBhcmFtIHs/ZnVuY3Rpb24obmV3Ok9iamVjdCwgIVdpbmRvdyl8P2Z1bmN0aW9uKG5ldzpPYmplY3QsICEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jKX0gY3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB0byBuZXcgdGhlIHNlcnZpY2UuIENhbGxlZCB3aXRoIGNvbnRleHQuXG4gKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfb3ZlcnJpZGVcbiAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9zaGFyZWRJbnN0YW5jZVxuICovXG5mdW5jdGlvbiByZWdpc3RlclNlcnZpY2VJbnRlcm5hbChcbiAgaG9sZGVyLFxuICBjb250ZXh0LFxuICBpZCxcbiAgY3RvcixcbiAgb3B0X292ZXJyaWRlLFxuICBvcHRfc2hhcmVkSW5zdGFuY2Vcbikge1xuICBjb25zdCBzZXJ2aWNlcyA9IGdldFNlcnZpY2VzKGhvbGRlcik7XG4gIGxldCBzID0gc2VydmljZXNbaWRdO1xuXG4gIGlmICghcykge1xuICAgIHMgPSBzZXJ2aWNlc1tpZF0gPSB7XG4gICAgICBvYmo6IG51bGwsXG4gICAgICBwcm9taXNlOiBudWxsLFxuICAgICAgcmVzb2x2ZTogbnVsbCxcbiAgICAgIHJlamVjdDogbnVsbCxcbiAgICAgIGNvbnRleHQ6IG51bGwsXG4gICAgICBjdG9yOiBudWxsLFxuICAgICAgc2hhcmVkSW5zdGFuY2U6IG9wdF9zaGFyZWRJbnN0YW5jZSB8fCBmYWxzZSxcbiAgICB9O1xuICB9XG5cbiAgaWYgKCFvcHRfb3ZlcnJpZGUgJiYgcy5jdG9yKSB7XG4gICAgLy8gU2VydmljZSBhbHJlYWR5IHJlZ2lzdGVyZWQuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcy5jdG9yID0gY3RvcjtcbiAgcy5jb250ZXh0ID0gY29udGV4dDtcbiAgcy5zaGFyZWRJbnN0YW5jZSA9IG9wdF9zaGFyZWRJbnN0YW5jZSB8fCBmYWxzZTtcblxuICAvLyBUaGUgc2VydmljZSBtYXkgaGF2ZSBiZWVuIHJlcXVlc3RlZCBhbHJlYWR5LCBpbiB3aGljaCBjYXNlIHRoZXJlIGlzIGFcbiAgLy8gcGVuZGluZyBwcm9taXNlIHRoYXQgbmVlZHMgdG8gZnVsZmlsbGVkLlxuICBpZiAocy5yZXNvbHZlKSB7XG4gICAgLy8gZ2V0U2VydmljZUludGVybmFsIHdpbGwgcmVzb2x2ZSB0aGUgcHJvbWlzZS5cbiAgICBnZXRTZXJ2aWNlSW50ZXJuYWwoaG9sZGVyLCBpZCk7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0geyFPYmplY3R9IGhvbGRlclxuICogQHBhcmFtIHtzdHJpbmd9IGlkIG9mIHRoZSBzZXJ2aWNlLlxuICogQHJldHVybiB7IVByb21pc2U8IU9iamVjdD59XG4gKi9cbmZ1bmN0aW9uIGdldFNlcnZpY2VQcm9taXNlSW50ZXJuYWwoaG9sZGVyLCBpZCkge1xuICBjb25zdCBjYWNoZWQgPSBnZXRTZXJ2aWNlUHJvbWlzZU9yTnVsbEludGVybmFsKGhvbGRlciwgaWQpO1xuICBpZiAoY2FjaGVkKSB7XG4gICAgcmV0dXJuIGNhY2hlZDtcbiAgfVxuICAvLyBTZXJ2aWNlIGlzIG5vdCByZWdpc3RlcmVkLlxuXG4gIC8vIFRPRE8oQGNyYW1mb3JjZSk6IEFkZCBhIGNoZWNrIHRoYXQgaWYgdGhlIGVsZW1lbnQgaXMgZXZlbnR1YWxseSByZWdpc3RlcmVkXG4gIC8vIHRoYXQgdGhlIHNlcnZpY2UgaXMgYWN0dWFsbHkgcHJvdmlkZWQgYW5kIHRoaXMgcHJvbWlzZSByZXNvbHZlcy5cbiAgY29uc3Qgc2VydmljZXMgPSBnZXRTZXJ2aWNlcyhob2xkZXIpO1xuICBzZXJ2aWNlc1tpZF0gPSBlbXB0eVNlcnZpY2VIb2xkZXJXaXRoUHJvbWlzZSgpO1xuICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZTwhT2JqZWN0Pn0gKi8gKHNlcnZpY2VzW2lkXS5wcm9taXNlKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFPYmplY3R9IGhvbGRlclxuICogQHBhcmFtIHtzdHJpbmd9IGlkIG9mIHRoZSBzZXJ2aWNlLlxuICogQHBhcmFtIHsqfSBlcnJvclxuICovXG5mdW5jdGlvbiByZWplY3RTZXJ2aWNlUHJvbWlzZUludGVybmFsKGhvbGRlciwgaWQsIGVycm9yKSB7XG4gIGNvbnN0IHNlcnZpY2VzID0gZ2V0U2VydmljZXMoaG9sZGVyKTtcbiAgY29uc3QgcyA9IHNlcnZpY2VzW2lkXTtcbiAgaWYgKHMpIHtcbiAgICBpZiAocy5yZWplY3QpIHtcbiAgICAgIHMucmVqZWN0KGVycm9yKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgc2VydmljZXNbaWRdID0gZW1wdHlTZXJ2aWNlSG9sZGVyV2l0aFByb21pc2UoKTtcbiAgc2VydmljZXNbaWRdLnJlamVjdChlcnJvcik7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHByb21pc2UgZm9yIHNlcnZpY2UgYGlkYCBpZiB0aGUgc2VydmljZSBoYXMgYmVlbiByZWdpc3RlcmVkXG4gKiBvbiBgaG9sZGVyYC5cbiAqIEBwYXJhbSB7IU9iamVjdH0gaG9sZGVyXG4gKiBAcGFyYW0ge3N0cmluZ30gaWQgb2YgdGhlIHNlcnZpY2UuXG4gKiBAcmV0dXJuIHs/UHJvbWlzZTwhT2JqZWN0Pn1cbiAqL1xuZnVuY3Rpb24gZ2V0U2VydmljZVByb21pc2VPck51bGxJbnRlcm5hbChob2xkZXIsIGlkKSB7XG4gIGNvbnN0IHNlcnZpY2VzID0gZ2V0U2VydmljZXMoaG9sZGVyKTtcbiAgY29uc3QgcyA9IHNlcnZpY2VzW2lkXTtcbiAgaWYgKHMpIHtcbiAgICBpZiAocy5wcm9taXNlKSB7XG4gICAgICByZXR1cm4gcy5wcm9taXNlO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJbnN0YW50aWF0ZSBzZXJ2aWNlIGlmIG5vdCBhbHJlYWR5IGluc3RhbnRpYXRlZC5cbiAgICAgIGdldFNlcnZpY2VJbnRlcm5hbChob2xkZXIsIGlkKTtcbiAgICAgIHJldHVybiAocy5wcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKC8qKiBAdHlwZSB7IU9iamVjdH0gKi8gKHMub2JqKSkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBvYmplY3QgdGhhdCBob2xkcyB0aGUgc2VydmljZXMgcmVnaXN0ZXJlZCBpbiBhIGhvbGRlci5cbiAqIEBwYXJhbSB7IU9iamVjdH0gaG9sZGVyXG4gKiBAcmV0dXJuIHshT2JqZWN0PHN0cmluZywhU2VydmljZUhvbGRlckRlZj59XG4gKi9cbmZ1bmN0aW9uIGdldFNlcnZpY2VzKGhvbGRlcikge1xuICBsZXQgc2VydmljZXMgPSBob2xkZXIuX19BTVBfU0VSVklDRVM7XG4gIGlmICghc2VydmljZXMpIHtcbiAgICBzZXJ2aWNlcyA9IGhvbGRlci5fX0FNUF9TRVJWSUNFUyA9IHt9O1xuICB9XG4gIHJldHVybiBzZXJ2aWNlcztcbn1cblxuLyoqXG4gKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgc2VydmljZSBpbXBsZW1lbnRzIGBEaXNwb3NhYmxlYCBpbnRlcmZhY2UuXG4gKiBAcGFyYW0geyFPYmplY3R9IHNlcnZpY2VcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Rpc3Bvc2FibGUoc2VydmljZSkge1xuICByZXR1cm4gdHlwZW9mIHNlcnZpY2UuZGlzcG9zZSA9PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqIEFzc2VydHMgdGhhdCB0aGUgc3BlY2lmaWVkIHNlcnZpY2UgaW1wbGVtZW50cyBgRGlzcG9zYWJsZWAgaW50ZXJmYWNlIGFuZFxuICogdHlwZWNhc3RzIHRoZSBpbnN0YW5jZSB0byBgRGlzcG9zYWJsZWAuXG4gKiBAcGFyYW0geyFPYmplY3R9IHNlcnZpY2VcbiAqIEByZXR1cm4geyFEaXNwb3NhYmxlfVxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0RGlzcG9zYWJsZShzZXJ2aWNlKSB7XG4gIGRldkFzc2VydChpc0Rpc3Bvc2FibGUoc2VydmljZSksICdyZXF1aXJlZCB0byBpbXBsZW1lbnQgRGlzcG9zYWJsZScpO1xuICByZXR1cm4gLyoqIEB0eXBlIHshRGlzcG9zYWJsZX0gKi8gKHNlcnZpY2UpO1xufVxuXG4vKipcbiAqIERpc3Bvc2VzIGFsbCBkaXNwb3NhYmxlIChpbXBsZW1lbnRzIGBEaXNwb3NhYmxlYCBpbnRlcmZhY2UpIHNlcnZpY2VzIGluXG4gKiBhbXBkb2Mgc2NvcGUuXG4gKiBAcGFyYW0geyEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3Bvc2VTZXJ2aWNlc0ZvckRvYyhhbXBkb2MpIHtcbiAgZGlzcG9zZVNlcnZpY2VzSW50ZXJuYWwoYW1wZG9jKTtcbn1cblxuLyoqXG4gKiBEaXNwb3NlcyBhbGwgZGlzcG9zYWJsZSAoaW1wbGVtZW50cyBgRGlzcG9zYWJsZWAgaW50ZXJmYWNlKSBzZXJ2aWNlcyBpblxuICogZW1iZWQgc2NvcGUuXG4gKiBAcGFyYW0geyFXaW5kb3d9IGVtYmVkV2luXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNwb3NlU2VydmljZXNGb3JFbWJlZChlbWJlZFdpbikge1xuICBkaXNwb3NlU2VydmljZXNJbnRlcm5hbChlbWJlZFdpbik7XG59XG5cbi8qKlxuICogQHBhcmFtIHshT2JqZWN0fSBob2xkZXIgT2JqZWN0IGhvbGRpbmcgdGhlIHNlcnZpY2UgaW5zdGFuY2VzLlxuICovXG5mdW5jdGlvbiBkaXNwb3NlU2VydmljZXNJbnRlcm5hbChob2xkZXIpIHtcbiAgY29uc3Qgc2VydmljZXMgPSBnZXRTZXJ2aWNlcyhob2xkZXIpO1xuICBmb3IgKGNvbnN0IGlkIGluIHNlcnZpY2VzKSB7XG4gICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc2VydmljZXMsIGlkKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNvbnN0IHNlcnZpY2VIb2xkZXIgPSBzZXJ2aWNlc1tpZF07XG4gICAgaWYgKHNlcnZpY2VIb2xkZXIuc2hhcmVkSW5zdGFuY2UpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoc2VydmljZUhvbGRlci5vYmopIHtcbiAgICAgIGRpc3Bvc2VTZXJ2aWNlSW50ZXJuYWwoaWQsIHNlcnZpY2VIb2xkZXIub2JqKTtcbiAgICB9IGVsc2UgaWYgKHNlcnZpY2VIb2xkZXIucHJvbWlzZSkge1xuICAgICAgc2VydmljZUhvbGRlci5wcm9taXNlLnRoZW4oKGluc3RhbmNlKSA9PlxuICAgICAgICBkaXNwb3NlU2VydmljZUludGVybmFsKGlkLCBpbnN0YW5jZSlcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGlkXG4gKiBAcGFyYW0geyFPYmplY3R9IHNlcnZpY2VcbiAqL1xuZnVuY3Rpb24gZGlzcG9zZVNlcnZpY2VJbnRlcm5hbChpZCwgc2VydmljZSkge1xuICBpZiAoIWlzRGlzcG9zYWJsZShzZXJ2aWNlKSkge1xuICAgIHJldHVybjtcbiAgfVxuICB0cnkge1xuICAgIGFzc2VydERpc3Bvc2FibGUoc2VydmljZSkuZGlzcG9zZSgpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gRW5zdXJlIHRoYXQgYSBmYWlsdXJlIHRvIGRpc3Bvc2UgYSBzZXJ2aWNlIGRvZXMgbm90IGRpc3J1cHQgb3RoZXJcbiAgICAvLyBzZXJ2aWNlcy5cbiAgICBkZXYoKS5lcnJvcignU0VSVklDRScsICdmYWlsZWQgdG8gZGlzcG9zZSBzZXJ2aWNlJywgaWQsIGUpO1xuICB9XG59XG5cbi8qKlxuICogVGhpcyBhZG9wdHMgdGhlIHNlcnZpY2UgKippbnN0YW5jZSoqIGZyb20gdGhlIHBhcmVudC5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIGRhbmdlcm91cyEgU2hhcmluZyBhbiBpbnN0YW5jZSBtZWFucyBkYXRhIGNhbiBsZWFrIHRvIGFuZFxuICogZnJvbSBhIGNoaWxkIGFtcGRvYy5cbiAqXG4gKiBAcGFyYW0geyEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRvcHRTZXJ2aWNlRm9yRW1iZWREb2MoYW1wZG9jLCBpZCkge1xuICBjb25zdCBzZXJ2aWNlID0gZ2V0U2VydmljZUludGVybmFsKFxuICAgIGdldEFtcGRvY1NlcnZpY2VIb2xkZXIoZGV2QXNzZXJ0KGFtcGRvYy5nZXRQYXJlbnQoKSkpLFxuICAgIGlkXG4gICk7XG4gIHJlZ2lzdGVyU2VydmljZUludGVybmFsKFxuICAgIGdldEFtcGRvY1NlcnZpY2VIb2xkZXIoYW1wZG9jKSxcbiAgICBhbXBkb2MsXG4gICAgaWQsXG4gICAgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHNlcnZpY2U7XG4gICAgfSxcbiAgICAvKiBvdmVycmlkZSAqLyBmYWxzZSxcbiAgICAvKiBzaGFyZWRJbnN0YW5jZSAqLyB0cnVlXG4gICk7XG59XG5cbi8qKlxuICogVGhpcyBhZG9wdHMgdGhlIHNlcnZpY2UgKipmYWN0b3J5KiogZnJvbSB0aGUgcGFyZW50LlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gaXMgc2FmZXIgdGhhbiBzaGFyaW5nIHRoZSBzZXJ2aWNlIGluc3RhbmNlLCBzaW5jZSBlYWNoIGFtcGRvY1xuICogd2lsbCBjcmVhdGUgaXRzIG93biBpbnN0YW5jZSBvZiB0aGUgZmFjdG9yeSAoYW5kIGVhY2ggaW5zdGFuY2Ugd2lsbCBoYXZlIGl0c1xuICogb3duIGluc3RhbmNlIGRhdGEpLiBOb3RlIHRoYXQgc3RhdGljIGRhdGEgaXMgc3RpbGwgc2hhcmVkLCBzbyBpdCdzIG5vdCAxMDAlXG4gKiBmb29scHJvb2YuXG4gKlxuICogQHBhcmFtIHshLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkb3B0U2VydmljZUZhY3RvcnlGb3JFbWJlZERvYyhhbXBkb2MsIGlkKSB7XG4gIGNvbnN0IHBhcmVudEhvbGRlciA9IGdldEFtcGRvY1NlcnZpY2VIb2xkZXIoZGV2QXNzZXJ0KGFtcGRvYy5nZXRQYXJlbnQoKSkpO1xuICBkZXZBc3NlcnQoXG4gICAgaXNTZXJ2aWNlUmVnaXN0ZXJlZChwYXJlbnRIb2xkZXIsIGlkKSxcbiAgICBgRXhwZWN0ZWQgc2VydmljZSAke2lkfSB0byBiZSByZWdpc3RlcmVkYFxuICApO1xuICBjb25zdCBzZXJ2aWNlID0gZ2V0U2VydmljZXMocGFyZW50SG9sZGVyKVtpZF07XG4gIHJlZ2lzdGVyU2VydmljZUludGVybmFsKFxuICAgIGdldEFtcGRvY1NlcnZpY2VIb2xkZXIoYW1wZG9jKSxcbiAgICBhbXBkb2MsXG4gICAgaWQsXG4gICAgZGV2QXNzZXJ0KHNlcnZpY2UuY3RvcilcbiAgKTtcbn1cblxuLyoqXG4gKiBSZXNldHMgYSBzaW5nbGUgc2VydmljZSwgc28gaXQgZ2V0cyByZWNyZWF0ZWQgb24gbmV4dCBnZXRTZXJ2aWNlIGludm9jYXRpb24uXG4gKiBAcGFyYW0geyFPYmplY3R9IGhvbGRlclxuICogQHBhcmFtIHtzdHJpbmd9IGlkIG9mIHRoZSBzZXJ2aWNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRTZXJ2aWNlRm9yVGVzdGluZyhob2xkZXIsIGlkKSB7XG4gIGlmIChob2xkZXIuX19BTVBfU0VSVklDRVMpIHtcbiAgICBob2xkZXIuX19BTVBfU0VSVklDRVNbaWRdID0gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7IU9iamVjdH0gaG9sZGVyIE9iamVjdCBob2xkaW5nIHRoZSBzZXJ2aWNlIGluc3RhbmNlLlxuICogQHBhcmFtIHtzdHJpbmd9IGlkIG9mIHRoZSBzZXJ2aWNlLlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNTZXJ2aWNlUmVnaXN0ZXJlZChob2xkZXIsIGlkKSB7XG4gIGNvbnN0IHNlcnZpY2UgPSBob2xkZXIuX19BTVBfU0VSVklDRVMgJiYgaG9sZGVyLl9fQU1QX1NFUlZJQ0VTW2lkXTtcbiAgLy8gQWxsIHJlZ2lzdGVyZWQgc2VydmljZXMgbXVzdCBoYXZlIGEgY29uc3RydWN0b3IuXG4gIHJldHVybiAhIShzZXJ2aWNlICYmIHNlcnZpY2UuY3Rvcik7XG59XG5cbi8qKiBAcmV0dXJuIHshU2VydmljZUhvbGRlckRlZn0gKi9cbmZ1bmN0aW9uIGVtcHR5U2VydmljZUhvbGRlcldpdGhQcm9taXNlKCkge1xuICBjb25zdCBkZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xuICBjb25zdCB7cHJvbWlzZSwgcmVqZWN0LCByZXNvbHZlfSA9IGRlZmVycmVkO1xuICBwcm9taXNlLmNhdGNoKCgpID0+IHt9KTsgLy8gYXZvaWQgdW5jYXVnaHQgZXhjZXB0aW9uIHdoZW4gc2VydmljZSBnZXRzIHJlamVjdGVkXG4gIHJldHVybiB7XG4gICAgb2JqOiBudWxsLFxuICAgIHByb21pc2UsXG4gICAgcmVzb2x2ZSxcbiAgICByZWplY3QsXG4gICAgY29udGV4dDogbnVsbCxcbiAgICBjdG9yOiBudWxsLFxuICB9O1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/service-helpers.js