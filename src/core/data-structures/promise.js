/** @type {undefined|Promise<void>}| */
let resolved;

/**
 * Returns a cached resolved promise.
 * Babel converts direct calls to Promise.resolve() (with no arguments) into
 * calls to this.
 *
 * @return {Promise<void>}
 */
export function resolvedPromise() {
  if (resolved) {
    return resolved;
  }

  // It's important that we call with `undefined` here, to prevent a transform
  // recursion. If we didn't pass an arg, then the transformer would replace
  // this callsite with a call to `resolvedPromise()`.
  resolved = Promise.resolve(undefined);
  return resolved;
}

/**
 * Returns a Deferred struct, which holds a pending promise and its associated
 * resolve and reject functions.
 *
 * This is preferred instead of creating a Promise instance to extract the
 * resolve/reject functions yourself:
 *
 * ```
 * // Avoid doing
 * let resolve;
 * const promise = new Promise(res => {
 *   resolve = res;
 * });
 *
 * // Good
 * const deferred = new Deferred();
 * const { promise, resolve } = deferred;
 * ```
 *
 * @template T
 */
export class Deferred {
  /** Constructor. */
  constructor() {
    /** @const {Promise<T>} */
    this.promise = new /*OK*/ Promise((res, rej) => {
      /** @const {function(T=)} */
      this.resolve = res;
      /** @const {function(*=)} */
      this.reject = rej;
    });
  }
}

/**
 * Creates a promise resolved to the return value of fn.
 * If fn sync throws, it will cause the promise to reject.
 *
 * @param {function():(T|Promise<T>)} fn
 * @return {Promise<T>}
 * @template T
 */
export function tryResolve(fn) {
  return new Promise((resolve) => {
    resolve(fn());
  });
}

/**
 * Resolves with the result of the last promise added.
 * @implements {PromiseLike<T>}
 * @template T
 */
export class LastAddedResolver {
  /**
   * @param {Array<PromiseLike<T>>=} opt_promises
   */
  constructor(opt_promises) {
    /** @private @const {Deferred<T>} */
    this.deferred_ = new Deferred();

    /** @private */
    this.count_ = 0;

    if (opt_promises) {
      for (const promise of opt_promises) {
        this.add(promise);
      }
    }
  }

  /**
   * Add a promise to possibly be resolved.
   * @param {PromiseLike<T>} promise
   * @return {Promise<T>}
   */
  add(promise) {
    const countAtAdd = ++this.count_;
    promise.then(
      (result) => {
        if (this.count_ === countAtAdd) {
          this.deferred_.resolve(result);
        }
      },
      (error) => {
        // Don't follow behavior of Promise.all and Promise.race error so that
        // this will only reject when most recently added promise fails.
        if (this.count_ === countAtAdd) {
          this.deferred_.reject(error);
        }
      }
    );
    return this.deferred_.promise;
  }

  /**
   * Bind handlers for when the last added promise resolves/rejects.
   * @param {function(T):?} [opt_resolve]
   * @param {function(?):?} [opt_reject]
   * @return {Promise<?>}
   */
  then(opt_resolve, opt_reject) {
    return this.deferred_.promise.then(opt_resolve, opt_reject);
  }
}
