// @ts-nocheck

/**
 * @fileoverview Registration and getter functions for AMP services.
 *
 * Invariant: Service getters never return null for registered services.
 */

import {Deferred} from '#core/data-structures/promise';
import {getWin} from '#core/window';

import {dev, devAssert} from '#utils/log';

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
 * Installs a service override on amp-doc level.
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} id
 * @param {!Object} service The service.
 */
export function installServiceInEmbedDoc(ampdoc, id, service) {
  registerServiceInternal(
    getAmpdocServiceHolder(ampdoc),
    ampdoc,
    id,
    function () {
      return service;
    },
    /* override */ true
  );
}

/**
 * Installs a service override in the scope of an embedded window.
 * @param {!Window} embedWin
 * @param {string} id
 * @param {function(new:Object, !Window)} constructor
 */
export function registerServiceBuilderInEmbedWin(embedWin, id, constructor) {
  registerServiceInternal(
    embedWin,
    embedWin,
    id,
    constructor,
    /* override */ true
  );
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
export function registerServiceBuilderForDoc(
  nodeOrDoc,
  id,
  constructor,
  opt_instantiate
) {
  const ampdoc = getAmpdoc(nodeOrDoc);
  const holder = getAmpdocServiceHolder(ampdoc);
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
  const ampdoc = getAmpdoc(nodeOrDoc);
  const holder = getAmpdocServiceHolder(ampdoc);
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
  const ampdoc = getAmpdoc(elementOrAmpDoc);
  const holder = getAmpdocServiceHolder(ampdoc);
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
  const ampdoc = getAmpdoc(elementOrAmpDoc);
  const holder = getAmpdocServiceHolder(ampdoc);
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
  return getServicePromiseOrNullInternal(
    getAmpdocServiceHolder(elementOrAmpDoc),
    id
  );
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
  const childWin = (node.ownerDocument || node).defaultView;
  const topWin = opt_topWin || getTopWindow(childWin);
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
    const win = getWin(nodeOrDoc);
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
    getService(win, 'ampdoc')
  );
}

/**
 * Get service `id` from `holder`. Assumes the service
 * has already been registered.
 * @param {!Object} holder Object holding the service instance.
 * @param {string} id of the service.
 * @return {object}
 */
function getServiceInternal(holder, id) {
  devAssert(
    isServiceRegistered(holder, id),
    `Expected service ${id} to be registered`
  );
  const services = getServices(holder);
  const s = services[id];
  if (!s.obj) {
    devAssert(s.ctor, `Service ${id} registered without ctor nor impl.`);
    devAssert(s.context, `Service ${id} registered without context.`);
    s.obj = new s.ctor(s.context);
    devAssert(s.obj, `Service ${id} constructed to null.`);
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
function registerServiceInternal(
  holder,
  context,
  id,
  ctor,
  opt_override,
  opt_sharedInstance
) {
  const services = getServices(holder);
  let s = services[id];

  if (!s) {
    s = services[id] = {
      obj: null,
      promise: null,
      resolve: null,
      reject: null,
      context: null,
      ctor: null,
      sharedInstance: opt_sharedInstance || false,
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
  const cached = getServicePromiseOrNullInternal(holder, id);
  if (cached) {
    return cached;
  }
  // Service is not registered.

  // TODO(@cramforce): Add a check that if the element is eventually registered
  // that the service is actually provided and this promise resolves.
  const services = getServices(holder);
  services[id] = emptyServiceHolderWithPromise();
  return /** @type {!Promise<!Object>} */ (services[id].promise);
}

/**
 * @param {!Object} holder
 * @param {string} id of the service.
 * @param {*} error
 */
function rejectServicePromiseInternal(holder, id, error) {
  const services = getServices(holder);
  const s = services[id];
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
  const services = getServices(holder);
  const s = services[id];
  if (s) {
    if (s.promise) {
      return s.promise;
    } else {
      // Instantiate service if not already instantiated.
      getServiceInternal(holder, id);
      return (s.promise = Promise.resolve(/** @type {!Object} */ (s.obj)));
    }
  }
  return null;
}

/**
 * Returns the object that holds the services registered in a holder.
 * @param {!Object} holder
 * @return {!{[key: string]: !ServiceHolderDef}}
 */
function getServices(holder) {
  let services = holder.__AMP_SERVICES;
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
  const services = getServices(holder);
  for (const id in services) {
    if (!Object.prototype.hasOwnProperty.call(services, id)) {
      continue;
    }
    const serviceHolder = services[id];
    if (serviceHolder.sharedInstance) {
      continue;
    }
    if (serviceHolder.obj) {
      disposeServiceInternal(id, serviceHolder.obj);
    } else if (serviceHolder.promise) {
      serviceHolder.promise.then((instance) =>
        disposeServiceInternal(id, instance)
      );
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
 * This adopts the service **instance** from the parent.
 *
 * This function is dangerous! Sharing an instance means data can leak to and
 * from a child ampdoc.
 *
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} id
 */
export function adoptServiceForEmbedDoc(ampdoc, id) {
  const service = getServiceInternal(
    getAmpdocServiceHolder(devAssert(ampdoc.getParent())),
    id
  );
  registerServiceInternal(
    getAmpdocServiceHolder(ampdoc),
    ampdoc,
    id,
    function () {
      return service;
    },
    /* override */ false,
    /* sharedInstance */ true
  );
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
  const parentHolder = getAmpdocServiceHolder(devAssert(ampdoc.getParent()));
  devAssert(
    isServiceRegistered(parentHolder, id),
    `Expected service ${id} to be registered`
  );
  const service = getServices(parentHolder)[id];
  registerServiceInternal(
    getAmpdocServiceHolder(ampdoc),
    ampdoc,
    id,
    devAssert(service.ctor)
  );
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
  const service = holder.__AMP_SERVICES && holder.__AMP_SERVICES[id];
  // All registered services must have a constructor.
  return !!(service && service.ctor);
}

/** @return {!ServiceHolderDef} */
function emptyServiceHolderWithPromise() {
  const deferred = new Deferred();
  const {promise, reject, resolve} = deferred;
  promise.catch(() => {}); // avoid uncaught exception when service gets rejected
  return {
    obj: null,
    promise,
    resolve,
    reject,
    context: null,
    ctor: null,
  };
}
