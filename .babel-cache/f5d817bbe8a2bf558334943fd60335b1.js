'use strict';
/**
 * Constructs a ES6/Promises A+ Promise instance.
 *
 * @constructor
 * @param {function(function(*=), function (*=))} resolver
 */

function Promise(resolver) {
  if (!(this instanceof Promise)) {
    throw new TypeError('Constructor Promise requires `new`');
  }

  if (!isFunction(resolver)) {
    throw new TypeError('Must pass resolver function');
  }

  /**
   * @type {function(this:Promise,*=,function(*=),function(*=),Deferred):!Promise}
   * @private
   */
  this._state = PendingPromise;

  /**
   * @type {*}
   * @private
   */
  this._value = [];

  /**
   * @type {boolean}
   * @private
   */
  this._isChainEnd = true;
  doResolve(this, adopter(this, FulfilledPromise), adopter(this, RejectedPromise), {
    then: resolver
  });
}

/****************************
  Public Instance Methods
 ****************************/

/**
 * Creates a new promise instance that will receive the result of this promise
 * as inputs to the onFulfilled or onRejected callbacks.
 *
 * @param {function(*)} onFulfilled
 * @param {function(*)} onRejected
 */
Promise.prototype.then = function (onFulfilled, onRejected) {
  onFulfilled = isFunction(onFulfilled) ? onFulfilled : void 0;
  onRejected = isFunction(onRejected) ? onRejected : void 0;

  if (onFulfilled || onRejected) {
    this._isChainEnd = false;
  }

  return this._state(this._value, onFulfilled, onRejected);
};

/**
 * Creates a new promise that will handle the rejected state of this promise.
 *
 * @param {function(*)} onRejected
 * @returns {!Promise}
 */
Promise.prototype.catch = function (onRejected) {
  return this.then(void 0, onRejected);
};

/****************************
  Public Static Methods
 ****************************/

/**
 * Creates a fulfilled Promise of value. If value is itself a then-able,
 * resolves with the then-able's value.
 *
 * @this {!Promise}
 * @param {*=} value
 * @returns {!Promise}
 */
Promise.resolve = function (value) {
  var Constructor = this;
  var promise;

  if (isObject(value) && value instanceof this) {
    promise = value;
  } else {
    promise = new Constructor(function (resolve) {
      resolve(value);
    });
  }

  return (
    /** @type {!Promise} */
    promise
  );
};

/**
 * Creates a rejected Promise of reason.
 *
 * @this {!Promise}
 * @param {*=} reason
 * @returns {!Promise}
 */
Promise.reject = function (reason) {
  var Constructor = this;
  var promise = new Constructor(function (_, reject) {
    reject(reason);
  });
  return (
    /** @type {!Promise} */
    promise
  );
};

/**
 * Creates a Promise that will resolve with an array of the values of the
 * passed in promises. If any promise rejects, the returned promise will
 * reject.
 *
 * @this {!Promise}
 * @param {!Array<Promise|*>} promises
 * @returns {!Promise}
 */
Promise.all = function (promises) {
  var Constructor = this;
  var promise = new Constructor(function (resolve, reject) {
    var length = promises.length;
    var values = new Array(length);

    if (length === 0) {
      return resolve(values);
    }

    each(promises, function (promise, index) {
      Constructor.resolve(promise).then(function (value) {
        values[index] = value;

        if (--length === 0) {
          resolve(values);
        }
      }, reject);
    });
  });
  return (
    /** @type {!Promise} */
    promise
  );
};

/**
 * Creates a Promise that will resolve or reject based on the first
 * resolved or rejected promise.
 *
 * @this {!Promise}
 * @param {!Array<Promise|*>} promises
 * @returns {!Promise}
 */
Promise.race = function (promises) {
  var Constructor = this;
  var promise = new Constructor(function (resolve, reject) {
    for (var i = 0; i < promises.length; i++) {
      Constructor.resolve(promises[i]).then(resolve, reject);
    }
  });
  return (
    /** @type {!Promise} */
    promise
  );
};

var onPossiblyUnhandledRejection = function onPossiblyUnhandledRejection(reason, promise) {
  throw reason;
};

/**
 * An internal use static function.
 */
Promise._overrideUnhandledExceptionHandler = function (handler) {
  onPossiblyUnhandledRejection = handler;
};

/****************************
  Private functions
 ****************************/

/**
 * The Fulfilled Promise state. Calls onFulfilled with the resolved value of
 * this promise, creating a new promise.
 *
 * If there is no onFulfilled, returns the current promise to avoid a promise
 * instance.
 *
 * @this {!Promise} The current promise
 * @param {*=} value The current promise's resolved value.
 * @param {function(*=)=} onFulfilled
 * @param {function(*=)=} unused
 * @param {Deferred} deferred A deferred object that holds a promise and its
 *     resolve and reject functions. It IS NOT passed when called from
 *     Promise#then to save an object instance (since we may return the current
 *     promise). It IS passed in when adopting the Fulfilled state from the
 *     Pending state.
 * @returns {!Promise}
 */
function FulfilledPromise(value, onFulfilled, unused, deferred) {
  if (!onFulfilled) {
    deferredAdopt(deferred, FulfilledPromise, value);
    return this;
  }

  if (!deferred) {
    deferred = new Deferred(this.constructor);
  }

  defer(tryCatchDeferred(deferred, onFulfilled, value));
  return deferred.promise;
}

/**
 * The Rejected Promise state. Calls onRejected with the resolved value of
 * this promise, creating a new promise.
 *
 * If there is no onRejected, returns the current promise to avoid a promise
 * instance.
 *
 * @this {!Promise} The current promise
 * @param {*=} reason The current promise's rejection reason.
 * @param {function(*=)=} unused
 * @param {function(*=)=} onRejected
 * @param {Deferred} deferred A deferred object that holds a promise and its
 *     resolve and reject functions. It IS NOT passed when called from
 *     Promise#then to save an object instance (since we may return the current
 *     promise). It IS passed in when adopting the Rejected state from the
 *     Pending state.
 * @returns {!Promise}
 */
function RejectedPromise(reason, unused, onRejected, deferred) {
  if (!onRejected) {
    deferredAdopt(deferred, RejectedPromise, reason);
    return this;
  }

  if (!deferred) {
    deferred = new Deferred(this.constructor);
  }

  defer(tryCatchDeferred(deferred, onRejected, reason));
  return deferred.promise;
}

/**
 * The Pending Promise state. Eventually calls onFulfilled once the promise has
 * resolved, or onRejected once the promise rejects.
 *
 * If there is no onFulfilled and no onRejected, returns the current promise to
 * avoid a promise instance.
 *
 * @this {!Promise} The current promise
 * @param {*=} queue The current promise's pending promises queue.
 * @param {function(*=)=} onFulfilled
 * @param {function(*=)=} onRejected
 * @param {Deferred} deferred A deferred object that holds a promise and its
 *     resolve and reject functions. It IS NOT passed when called from
 *     Promise#then to save an object instance (since we may return the current
 *     promise). It IS passed in when adopting the Pending state from the
 *     Pending state of another promise.
 * @returns {!Promise}
 */
function PendingPromise(queue, onFulfilled, onRejected, deferred) {
  if (!deferred) {
    if (!onFulfilled && !onRejected) {
      return this;
    }

    deferred = new Deferred(this.constructor);
  }

  queue.push({
    deferred: deferred,
    onFulfilled: onFulfilled || deferred.resolve,
    onRejected: onRejected || deferred.reject
  });
  return deferred.promise;
}

/**
 * Constructs a deferred instance that holds a promise and its resolve and
 * reject functions.
 *
 * @constructor
 */
function Deferred(Promise) {
  var deferred = this;

  /** @type {!Promise} */
  this.promise = new Promise(function (resolve, reject) {
    /** @type {function(*=)} */
    deferred.resolve = resolve;

    /** @type {function(*=)} */
    deferred.reject = reject;
  });
  return deferred;
}

/**
 * Transitions the state of promise to another state. This is only ever called
 * on with a promise that is currently in the Pending state.
 *
 * @param {!Promise} promise
 * @param {function(this:Promise,*=,function(*=),function(*=),Deferred):!Promise} state
 * @param {*=} value
 */
function adopt(promise, state, value, adoptee) {
  var queue = promise._value;
  promise._state = state;
  promise._value = value;

  if (adoptee && state === PendingPromise) {
    adoptee._state(value, void 0, void 0, {
      promise: promise,
      resolve: void 0,
      reject: void 0
    });
  }

  for (var i = 0; i < queue.length; i++) {
    var next = queue[i];

    promise._state(value, next.onFulfilled, next.onRejected, next.deferred);
  }

  queue.length = 0;

  // If we're adopting another promise, it's not the end of the promise chain,
  // the new promise is.
  if (adoptee) {
    adoptee._isChainEnd = false;
  }

  // Determine if this rejected promise will be "handled".
  if (state === RejectedPromise && promise._isChainEnd) {
    setTimeout(function () {
      if (promise._isChainEnd) {
        onPossiblyUnhandledRejection(value, promise);
      }
    }, 0);
  }
}

/**
 * A partial application of adopt.
 *
 * @param {!Promise} promise
 * @param {function(this:Promise,*=,function(*=),function(*=),Deferred):!Promise} state
 * @returns {function(*=)}
 */
function adopter(promise, state) {
  return function (value) {
    adopt(promise, state, value);
  };
}

/**
 * Updates a deferred promises state. Necessary for updating an adopting
 * promise's state when the adoptee resolves.
 *
 * @param {?Deferred} deferred
 * @param {function(this:Promise,*=,function(*=),function(*=),Deferred):!Promise} state
 * @param {*=} value
 */
function deferredAdopt(deferred, state, value) {
  if (deferred) {
    var promise = deferred.promise;
    promise._state = state;
    promise._value = value;
  }
}

/**
 * A no-op function to prevent double resolving.
 */
function noop() {}

/**
 * Tests if fn is a Function
 *
 * @param {*} fn
 * @returns {boolean}
 */
function isFunction(fn) {
  return typeof fn === 'function';
}

/**
 * Tests if fn is an Object
 *
 * @param {*} obj
 * @returns {boolean}
 */
function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Iterates over each element of an array, calling the iterator with the
 * element and its index.
 *
 * @param {!Array} collection
 * @param {function(*=,number)} iterator
 */
function each(collection, iterator) {
  for (var i = 0; i < collection.length; i++) {
    iterator(collection[i], i);
  }
}

/**
 * Creates a function that will attempt to resolve the deferred with the return
 * of fn. If any error is raised, rejects instead.
 *
 * @param {!Deferred} deferred
 * @param {function(*=)} fn
 * @param {*} arg
 * @returns {function()}
 */
function tryCatchDeferred(deferred, fn, arg) {
  var promise = deferred.promise;
  var resolve = deferred.resolve;
  var reject = deferred.reject;
  return function () {
    try {
      var result = fn(arg);
      doResolve(promise, resolve, reject, result, result);
    } catch (e) {
      reject(e);
    }
  };
}

/**
 * Queues and executes multiple deferred functions on another run loop.
 */
var defer = function () {
  /**
   * Defers fn to another run loop.
   */
  var scheduleFlush;

  if (typeof window !== 'undefined' && window.postMessage) {
    window.addEventListener('message', flush);

    scheduleFlush = function scheduleFlush() {
      window.postMessage('macro-task', '*');
    };
  } else {
    scheduleFlush = function scheduleFlush() {
      setTimeout(flush, 0);
    };
  }

  var queue = new Array(16);
  var length = 0;

  function flush() {
    for (var i = 0; i < length; i++) {
      var fn = queue[i];
      queue[i] = null;
      fn();
    }

    length = 0;
  }

  /**
   * @param {function()} fn
   */
  function defer(fn) {
    if (length === 0) {
      scheduleFlush();
    }

    queue[length++] = fn;
  }

  return defer;
}();

/**
 * The Promise resolution procedure.
 * https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
 *
 * @param {!Promise} promise
 * @param {function(*=)} resolve
 * @param {function(*=)} reject
 * @param {*} value
 * @param {*=} context
 */
function doResolve(promise, resolve, reject, value, context) {
  var _reject2 = reject;
  var then;

  var _resolve2;

  try {
    if (value === promise) {
      throw new TypeError('Cannot fulfill promise with itself');
    }

    var isObj = isObject(value);

    if (isObj && value instanceof promise.constructor) {
      adopt(promise, value._state, value._value, value);
    } else if (isObj && (then = value.then) && isFunction(then)) {
      _resolve2 = function _resolve(value) {
        _resolve2 = _reject2 = noop;
        doResolve(promise, resolve, reject, value, value);
      };

      _reject2 = function _reject(reason) {
        _resolve2 = _reject2 = noop;
        reject(reason);
      };

      then.call(context, function (value) {
        _resolve2(value);
      }, function (reason) {
        _reject2(reason);
      });
    } else {
      resolve(value);
    }
  } catch (e) {
    _reject2(e);
  }
}

export default Promise;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByb21pc2UubWpzIl0sIm5hbWVzIjpbIlByb21pc2UiLCJyZXNvbHZlciIsIlR5cGVFcnJvciIsImlzRnVuY3Rpb24iLCJfc3RhdGUiLCJQZW5kaW5nUHJvbWlzZSIsIl92YWx1ZSIsIl9pc0NoYWluRW5kIiwiZG9SZXNvbHZlIiwiYWRvcHRlciIsIkZ1bGZpbGxlZFByb21pc2UiLCJSZWplY3RlZFByb21pc2UiLCJ0aGVuIiwicHJvdG90eXBlIiwib25GdWxmaWxsZWQiLCJvblJlamVjdGVkIiwiY2F0Y2giLCJyZXNvbHZlIiwidmFsdWUiLCJDb25zdHJ1Y3RvciIsInByb21pc2UiLCJpc09iamVjdCIsInJlamVjdCIsInJlYXNvbiIsIl8iLCJhbGwiLCJwcm9taXNlcyIsImxlbmd0aCIsInZhbHVlcyIsIkFycmF5IiwiZWFjaCIsImluZGV4IiwicmFjZSIsImkiLCJvblBvc3NpYmx5VW5oYW5kbGVkUmVqZWN0aW9uIiwiX292ZXJyaWRlVW5oYW5kbGVkRXhjZXB0aW9uSGFuZGxlciIsImhhbmRsZXIiLCJ1bnVzZWQiLCJkZWZlcnJlZCIsImRlZmVycmVkQWRvcHQiLCJEZWZlcnJlZCIsImNvbnN0cnVjdG9yIiwiZGVmZXIiLCJ0cnlDYXRjaERlZmVycmVkIiwicXVldWUiLCJwdXNoIiwiYWRvcHQiLCJzdGF0ZSIsImFkb3B0ZWUiLCJuZXh0Iiwic2V0VGltZW91dCIsIm5vb3AiLCJmbiIsIm9iaiIsIk9iamVjdCIsImNvbGxlY3Rpb24iLCJpdGVyYXRvciIsImFyZyIsInJlc3VsdCIsImUiLCJzY2hlZHVsZUZsdXNoIiwid2luZG93IiwicG9zdE1lc3NhZ2UiLCJhZGRFdmVudExpc3RlbmVyIiwiZmx1c2giLCJjb250ZXh0IiwiX3JlamVjdCIsIl9yZXNvbHZlIiwiaXNPYmoiLCJjYWxsIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFDQSxTQUFTQSxPQUFULENBQWlCQyxRQUFqQixFQUEyQjtBQUN6QixN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TUFBbkIsRUFBMkJKLEtBQTNCLEVBQWtDQSxLQUFsQyxDQUFUO0FBQ0QsT0FIRDs7QUFJQWdELE1BQUFBLFFBQU8sR0FBRyxpQkFBUzNDLE1BQVQsRUFBaUI7QUFDekI0QyxRQUFBQSxTQUFRLEdBQUdELFFBQU8sR0FBR2YsSUFBckI7QUFDQTdCLFFBQUFBLE1BQU0sQ0FBQ0MsTUFBRCxDQUFOO0FBQ0QsT0FIRDs7QUFJQVgsTUFBQUEsSUFBSSxDQUFDeUQsSUFBTCxDQUNFSixPQURGLEVBRUUsVUFBUy9DLEtBQVQsRUFBZ0I7QUFBRWlELFFBQUFBLFNBQVEsQ0FBQ2pELEtBQUQsQ0FBUjtBQUFrQixPQUZ0QyxFQUdFLFVBQVNLLE1BQVQsRUFBaUI7QUFBRTJDLFFBQUFBLFFBQU8sQ0FBQzNDLE1BQUQsQ0FBUDtBQUFrQixPQUh2QztBQUtELEtBZE0sTUFjQTtBQUNMTixNQUFBQSxPQUFPLENBQUNDLEtBQUQsQ0FBUDtBQUNEO0FBQ0YsR0F4QkQsQ0F3QkUsT0FBT3lDLENBQVAsRUFBVTtBQUNWTyxJQUFBQSxRQUFPLENBQUNQLENBQUQsQ0FBUDtBQUNEO0FBQ0Y7O0FBRUQsZUFBZTNELE9BQWYiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIEVTNi9Qcm9taXNlcyBBKyBQcm9taXNlIGluc3RhbmNlLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtmdW5jdGlvbihmdW5jdGlvbigqPSksIGZ1bmN0aW9uICgqPSkpfSByZXNvbHZlclxuICovXG5mdW5jdGlvbiBQcm9taXNlKHJlc29sdmVyKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBQcm9taXNlKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0NvbnN0cnVjdG9yIFByb21pc2UgcmVxdWlyZXMgYG5ld2AnKTtcbiAgfVxuICBpZiAoIWlzRnVuY3Rpb24ocmVzb2x2ZXIpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTXVzdCBwYXNzIHJlc29sdmVyIGZ1bmN0aW9uJyk7XG4gIH1cblxuICAvKipcbiAgICogQHR5cGUge2Z1bmN0aW9uKHRoaXM6UHJvbWlzZSwqPSxmdW5jdGlvbigqPSksZnVuY3Rpb24oKj0pLERlZmVycmVkKTohUHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHRoaXMuX3N0YXRlID0gUGVuZGluZ1Byb21pc2U7XG5cbiAgLyoqXG4gICAqIEB0eXBlIHsqfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdGhpcy5fdmFsdWUgPSBbXTtcblxuICAvKipcbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB0aGlzLl9pc0NoYWluRW5kID0gdHJ1ZTtcblxuICBkb1Jlc29sdmUoXG4gICAgdGhpcyxcbiAgICBhZG9wdGVyKHRoaXMsIEZ1bGZpbGxlZFByb21pc2UpLFxuICAgIGFkb3B0ZXIodGhpcywgUmVqZWN0ZWRQcm9taXNlKSxcbiAgICB7IHRoZW46IHJlc29sdmVyIH1cbiAgKTtcbn1cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgUHVibGljIEluc3RhbmNlIE1ldGhvZHNcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgcHJvbWlzZSBpbnN0YW5jZSB0aGF0IHdpbGwgcmVjZWl2ZSB0aGUgcmVzdWx0IG9mIHRoaXMgcHJvbWlzZVxuICogYXMgaW5wdXRzIHRvIHRoZSBvbkZ1bGZpbGxlZCBvciBvblJlamVjdGVkIGNhbGxiYWNrcy5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCopfSBvbkZ1bGZpbGxlZFxuICogQHBhcmFtIHtmdW5jdGlvbigqKX0gb25SZWplY3RlZFxuICovXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgb25GdWxmaWxsZWQgPSBpc0Z1bmN0aW9uKG9uRnVsZmlsbGVkKSA/IG9uRnVsZmlsbGVkIDogdm9pZCAwO1xuICBvblJlamVjdGVkID0gaXNGdW5jdGlvbihvblJlamVjdGVkKSA/IG9uUmVqZWN0ZWQgOiB2b2lkIDA7XG5cbiAgaWYgKG9uRnVsZmlsbGVkIHx8IG9uUmVqZWN0ZWQpIHtcbiAgICB0aGlzLl9pc0NoYWluRW5kID0gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdGhpcy5fc3RhdGUoXG4gICAgdGhpcy5fdmFsdWUsXG4gICAgb25GdWxmaWxsZWQsXG4gICAgb25SZWplY3RlZFxuICApO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHByb21pc2UgdGhhdCB3aWxsIGhhbmRsZSB0aGUgcmVqZWN0ZWQgc3RhdGUgb2YgdGhpcyBwcm9taXNlLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb24oKil9IG9uUmVqZWN0ZWRcbiAqIEByZXR1cm5zIHshUHJvbWlzZX1cbiAqL1xuUHJvbWlzZS5wcm90b3R5cGUuY2F0Y2ggPSBmdW5jdGlvbihvblJlamVjdGVkKSB7XG4gIHJldHVybiB0aGlzLnRoZW4odm9pZCAwLCBvblJlamVjdGVkKTtcbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gIFB1YmxpYyBTdGF0aWMgTWV0aG9kc1xuICoqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bGZpbGxlZCBQcm9taXNlIG9mIHZhbHVlLiBJZiB2YWx1ZSBpcyBpdHNlbGYgYSB0aGVuLWFibGUsXG4gKiByZXNvbHZlcyB3aXRoIHRoZSB0aGVuLWFibGUncyB2YWx1ZS5cbiAqXG4gKiBAdGhpcyB7IVByb21pc2V9XG4gKiBAcGFyYW0geyo9fSB2YWx1ZVxuICogQHJldHVybnMgeyFQcm9taXNlfVxuICovXG5Qcm9taXNlLnJlc29sdmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuICB2YXIgcHJvbWlzZTtcblxuICBpZiAoaXNPYmplY3QodmFsdWUpICYmIHZhbHVlIGluc3RhbmNlb2YgdGhpcykge1xuICAgIHByb21pc2UgPSB2YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIC8qKiBAdHlwZSB7IVByb21pc2V9ICovKHByb21pc2UpO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgcmVqZWN0ZWQgUHJvbWlzZSBvZiByZWFzb24uXG4gKlxuICogQHRoaXMgeyFQcm9taXNlfVxuICogQHBhcmFtIHsqPX0gcmVhc29uXG4gKiBAcmV0dXJucyB7IVByb21pc2V9XG4gKi9cblByb21pc2UucmVqZWN0ID0gZnVuY3Rpb24ocmVhc29uKSB7XG4gIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG4gIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKGZ1bmN0aW9uKF8sIHJlamVjdCkge1xuICAgIHJlamVjdChyZWFzb24pO1xuICB9KTtcblxuICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZX0gKi8ocHJvbWlzZSk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBQcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHdpdGggYW4gYXJyYXkgb2YgdGhlIHZhbHVlcyBvZiB0aGVcbiAqIHBhc3NlZCBpbiBwcm9taXNlcy4gSWYgYW55IHByb21pc2UgcmVqZWN0cywgdGhlIHJldHVybmVkIHByb21pc2Ugd2lsbFxuICogcmVqZWN0LlxuICpcbiAqIEB0aGlzIHshUHJvbWlzZX1cbiAqIEBwYXJhbSB7IUFycmF5PFByb21pc2V8Kj59IHByb21pc2VzXG4gKiBAcmV0dXJucyB7IVByb21pc2V9XG4gKi9cblByb21pc2UuYWxsID0gZnVuY3Rpb24ocHJvbWlzZXMpIHtcbiAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcbiAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3IoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIGxlbmd0aCA9IHByb21pc2VzLmxlbmd0aDtcbiAgICB2YXIgdmFsdWVzID0gbmV3IEFycmF5KGxlbmd0aCk7XG5cbiAgICBpZiAobGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZSh2YWx1ZXMpO1xuICAgIH1cblxuICAgIGVhY2gocHJvbWlzZXMsIGZ1bmN0aW9uKHByb21pc2UsIGluZGV4KSB7XG4gICAgICBDb25zdHJ1Y3Rvci5yZXNvbHZlKHByb21pc2UpLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdmFsdWVzW2luZGV4XSA9IHZhbHVlO1xuICAgICAgICBpZiAoLS1sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXNvbHZlKHZhbHVlcyk7XG4gICAgICAgIH1cbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiAvKiogQHR5cGUgeyFQcm9taXNlfSAqLyhwcm9taXNlKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIFByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgb3IgcmVqZWN0IGJhc2VkIG9uIHRoZSBmaXJzdFxuICogcmVzb2x2ZWQgb3IgcmVqZWN0ZWQgcHJvbWlzZS5cbiAqXG4gKiBAdGhpcyB7IVByb21pc2V9XG4gKiBAcGFyYW0geyFBcnJheTxQcm9taXNlfCo+fSBwcm9taXNlc1xuICogQHJldHVybnMgeyFQcm9taXNlfVxuICovXG5Qcm9taXNlLnJhY2UgPSBmdW5jdGlvbihwcm9taXNlcykge1xuICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcihmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb21pc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBDb25zdHJ1Y3Rvci5yZXNvbHZlKHByb21pc2VzW2ldKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZX0gKi8ocHJvbWlzZSk7XG59O1xuXG52YXIgb25Qb3NzaWJseVVuaGFuZGxlZFJlamVjdGlvbiA9IGZ1bmN0aW9uKHJlYXNvbiwgcHJvbWlzZSkge1xuICB0aHJvdyByZWFzb247XG59O1xuXG4vKipcbiAqIEFuIGludGVybmFsIHVzZSBzdGF0aWMgZnVuY3Rpb24uXG4gKi9cblByb21pc2UuX292ZXJyaWRlVW5oYW5kbGVkRXhjZXB0aW9uSGFuZGxlciA9IGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgb25Qb3NzaWJseVVuaGFuZGxlZFJlamVjdGlvbiA9IGhhbmRsZXI7XG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICBQcml2YXRlIGZ1bmN0aW9uc1xuICoqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8qKlxuICogVGhlIEZ1bGZpbGxlZCBQcm9taXNlIHN0YXRlLiBDYWxscyBvbkZ1bGZpbGxlZCB3aXRoIHRoZSByZXNvbHZlZCB2YWx1ZSBvZlxuICogdGhpcyBwcm9taXNlLCBjcmVhdGluZyBhIG5ldyBwcm9taXNlLlxuICpcbiAqIElmIHRoZXJlIGlzIG5vIG9uRnVsZmlsbGVkLCByZXR1cm5zIHRoZSBjdXJyZW50IHByb21pc2UgdG8gYXZvaWQgYSBwcm9taXNlXG4gKiBpbnN0YW5jZS5cbiAqXG4gKiBAdGhpcyB7IVByb21pc2V9IFRoZSBjdXJyZW50IHByb21pc2VcbiAqIEBwYXJhbSB7Kj19IHZhbHVlIFRoZSBjdXJyZW50IHByb21pc2UncyByZXNvbHZlZCB2YWx1ZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24oKj0pPX0gb25GdWxmaWxsZWRcbiAqIEBwYXJhbSB7ZnVuY3Rpb24oKj0pPX0gdW51c2VkXG4gKiBAcGFyYW0ge0RlZmVycmVkfSBkZWZlcnJlZCBBIGRlZmVycmVkIG9iamVjdCB0aGF0IGhvbGRzIGEgcHJvbWlzZSBhbmQgaXRzXG4gKiAgICAgcmVzb2x2ZSBhbmQgcmVqZWN0IGZ1bmN0aW9ucy4gSXQgSVMgTk9UIHBhc3NlZCB3aGVuIGNhbGxlZCBmcm9tXG4gKiAgICAgUHJvbWlzZSN0aGVuIHRvIHNhdmUgYW4gb2JqZWN0IGluc3RhbmNlIChzaW5jZSB3ZSBtYXkgcmV0dXJuIHRoZSBjdXJyZW50XG4gKiAgICAgcHJvbWlzZSkuIEl0IElTIHBhc3NlZCBpbiB3aGVuIGFkb3B0aW5nIHRoZSBGdWxmaWxsZWQgc3RhdGUgZnJvbSB0aGVcbiAqICAgICBQZW5kaW5nIHN0YXRlLlxuICogQHJldHVybnMgeyFQcm9taXNlfVxuICovXG5mdW5jdGlvbiBGdWxmaWxsZWRQcm9taXNlKHZhbHVlLCBvbkZ1bGZpbGxlZCwgdW51c2VkLCBkZWZlcnJlZCkge1xuICBpZiAoIW9uRnVsZmlsbGVkKSB7XG4gICAgZGVmZXJyZWRBZG9wdChkZWZlcnJlZCwgRnVsZmlsbGVkUHJvbWlzZSwgdmFsdWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIGlmICghZGVmZXJyZWQpIHtcbiAgICBkZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCh0aGlzLmNvbnN0cnVjdG9yKTtcbiAgfVxuICBkZWZlcih0cnlDYXRjaERlZmVycmVkKGRlZmVycmVkLCBvbkZ1bGZpbGxlZCwgdmFsdWUpKTtcbiAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cbi8qKlxuICogVGhlIFJlamVjdGVkIFByb21pc2Ugc3RhdGUuIENhbGxzIG9uUmVqZWN0ZWQgd2l0aCB0aGUgcmVzb2x2ZWQgdmFsdWUgb2ZcbiAqIHRoaXMgcHJvbWlzZSwgY3JlYXRpbmcgYSBuZXcgcHJvbWlzZS5cbiAqXG4gKiBJZiB0aGVyZSBpcyBubyBvblJlamVjdGVkLCByZXR1cm5zIHRoZSBjdXJyZW50IHByb21pc2UgdG8gYXZvaWQgYSBwcm9taXNlXG4gKiBpbnN0YW5jZS5cbiAqXG4gKiBAdGhpcyB7IVByb21pc2V9IFRoZSBjdXJyZW50IHByb21pc2VcbiAqIEBwYXJhbSB7Kj19IHJlYXNvbiBUaGUgY3VycmVudCBwcm9taXNlJ3MgcmVqZWN0aW9uIHJlYXNvbi5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24oKj0pPX0gdW51c2VkXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCo9KT19IG9uUmVqZWN0ZWRcbiAqIEBwYXJhbSB7RGVmZXJyZWR9IGRlZmVycmVkIEEgZGVmZXJyZWQgb2JqZWN0IHRoYXQgaG9sZHMgYSBwcm9taXNlIGFuZCBpdHNcbiAqICAgICByZXNvbHZlIGFuZCByZWplY3QgZnVuY3Rpb25zLiBJdCBJUyBOT1QgcGFzc2VkIHdoZW4gY2FsbGVkIGZyb21cbiAqICAgICBQcm9taXNlI3RoZW4gdG8gc2F2ZSBhbiBvYmplY3QgaW5zdGFuY2UgKHNpbmNlIHdlIG1heSByZXR1cm4gdGhlIGN1cnJlbnRcbiAqICAgICBwcm9taXNlKS4gSXQgSVMgcGFzc2VkIGluIHdoZW4gYWRvcHRpbmcgdGhlIFJlamVjdGVkIHN0YXRlIGZyb20gdGhlXG4gKiAgICAgUGVuZGluZyBzdGF0ZS5cbiAqIEByZXR1cm5zIHshUHJvbWlzZX1cbiAqL1xuZnVuY3Rpb24gUmVqZWN0ZWRQcm9taXNlKHJlYXNvbiwgdW51c2VkLCBvblJlamVjdGVkLCBkZWZlcnJlZCkge1xuICBpZiAoIW9uUmVqZWN0ZWQpIHtcbiAgICBkZWZlcnJlZEFkb3B0KGRlZmVycmVkLCBSZWplY3RlZFByb21pc2UsIHJlYXNvbik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgaWYgKCFkZWZlcnJlZCkge1xuICAgIGRlZmVycmVkID0gbmV3IERlZmVycmVkKHRoaXMuY29uc3RydWN0b3IpO1xuICB9XG4gIGRlZmVyKHRyeUNhdGNoRGVmZXJyZWQoZGVmZXJyZWQsIG9uUmVqZWN0ZWQsIHJlYXNvbikpO1xuICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxuLyoqXG4gKiBUaGUgUGVuZGluZyBQcm9taXNlIHN0YXRlLiBFdmVudHVhbGx5IGNhbGxzIG9uRnVsZmlsbGVkIG9uY2UgdGhlIHByb21pc2UgaGFzXG4gKiByZXNvbHZlZCwgb3Igb25SZWplY3RlZCBvbmNlIHRoZSBwcm9taXNlIHJlamVjdHMuXG4gKlxuICogSWYgdGhlcmUgaXMgbm8gb25GdWxmaWxsZWQgYW5kIG5vIG9uUmVqZWN0ZWQsIHJldHVybnMgdGhlIGN1cnJlbnQgcHJvbWlzZSB0b1xuICogYXZvaWQgYSBwcm9taXNlIGluc3RhbmNlLlxuICpcbiAqIEB0aGlzIHshUHJvbWlzZX0gVGhlIGN1cnJlbnQgcHJvbWlzZVxuICogQHBhcmFtIHsqPX0gcXVldWUgVGhlIGN1cnJlbnQgcHJvbWlzZSdzIHBlbmRpbmcgcHJvbWlzZXMgcXVldWUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCo9KT19IG9uRnVsZmlsbGVkXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCo9KT19IG9uUmVqZWN0ZWRcbiAqIEBwYXJhbSB7RGVmZXJyZWR9IGRlZmVycmVkIEEgZGVmZXJyZWQgb2JqZWN0IHRoYXQgaG9sZHMgYSBwcm9taXNlIGFuZCBpdHNcbiAqICAgICByZXNvbHZlIGFuZCByZWplY3QgZnVuY3Rpb25zLiBJdCBJUyBOT1QgcGFzc2VkIHdoZW4gY2FsbGVkIGZyb21cbiAqICAgICBQcm9taXNlI3RoZW4gdG8gc2F2ZSBhbiBvYmplY3QgaW5zdGFuY2UgKHNpbmNlIHdlIG1heSByZXR1cm4gdGhlIGN1cnJlbnRcbiAqICAgICBwcm9taXNlKS4gSXQgSVMgcGFzc2VkIGluIHdoZW4gYWRvcHRpbmcgdGhlIFBlbmRpbmcgc3RhdGUgZnJvbSB0aGVcbiAqICAgICBQZW5kaW5nIHN0YXRlIG9mIGFub3RoZXIgcHJvbWlzZS5cbiAqIEByZXR1cm5zIHshUHJvbWlzZX1cbiAqL1xuZnVuY3Rpb24gUGVuZGluZ1Byb21pc2UocXVldWUsIG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBkZWZlcnJlZCkge1xuICBpZiAoIWRlZmVycmVkKSB7XG4gICAgaWYgKCFvbkZ1bGZpbGxlZCAmJiAhb25SZWplY3RlZCkgeyByZXR1cm4gdGhpczsgfVxuICAgIGRlZmVycmVkID0gbmV3IERlZmVycmVkKHRoaXMuY29uc3RydWN0b3IpO1xuICB9XG4gIHF1ZXVlLnB1c2goe1xuICAgIGRlZmVycmVkOiBkZWZlcnJlZCxcbiAgICBvbkZ1bGZpbGxlZDogb25GdWxmaWxsZWQgfHwgZGVmZXJyZWQucmVzb2x2ZSxcbiAgICBvblJlamVjdGVkOiBvblJlamVjdGVkIHx8IGRlZmVycmVkLnJlamVjdFxuICB9KTtcbiAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIGRlZmVycmVkIGluc3RhbmNlIHRoYXQgaG9sZHMgYSBwcm9taXNlIGFuZCBpdHMgcmVzb2x2ZSBhbmRcbiAqIHJlamVjdCBmdW5jdGlvbnMuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIERlZmVycmVkKFByb21pc2UpIHtcbiAgdmFyIGRlZmVycmVkID0gdGhpcztcbiAgLyoqIEB0eXBlIHshUHJvbWlzZX0gKi9cbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgLyoqIEB0eXBlIHtmdW5jdGlvbigqPSl9ICovXG4gICAgZGVmZXJyZWQucmVzb2x2ZSA9IHJlc29sdmU7XG5cbiAgICAvKiogQHR5cGUge2Z1bmN0aW9uKCo9KX0gKi9cbiAgICBkZWZlcnJlZC5yZWplY3QgPSByZWplY3Q7XG4gIH0pO1xuICByZXR1cm4gZGVmZXJyZWQ7XG59XG5cbi8qKlxuICogVHJhbnNpdGlvbnMgdGhlIHN0YXRlIG9mIHByb21pc2UgdG8gYW5vdGhlciBzdGF0ZS4gVGhpcyBpcyBvbmx5IGV2ZXIgY2FsbGVkXG4gKiBvbiB3aXRoIGEgcHJvbWlzZSB0aGF0IGlzIGN1cnJlbnRseSBpbiB0aGUgUGVuZGluZyBzdGF0ZS5cbiAqXG4gKiBAcGFyYW0geyFQcm9taXNlfSBwcm9taXNlXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKHRoaXM6UHJvbWlzZSwqPSxmdW5jdGlvbigqPSksZnVuY3Rpb24oKj0pLERlZmVycmVkKTohUHJvbWlzZX0gc3RhdGVcbiAqIEBwYXJhbSB7Kj19IHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGFkb3B0KHByb21pc2UsIHN0YXRlLCB2YWx1ZSwgYWRvcHRlZSkge1xuICB2YXIgcXVldWUgPSBwcm9taXNlLl92YWx1ZTtcbiAgcHJvbWlzZS5fc3RhdGUgPSBzdGF0ZTtcbiAgcHJvbWlzZS5fdmFsdWUgPSB2YWx1ZTtcblxuICBpZiAoYWRvcHRlZSAmJiBzdGF0ZSA9PT0gUGVuZGluZ1Byb21pc2UpIHtcbiAgICBhZG9wdGVlLl9zdGF0ZSh2YWx1ZSwgdm9pZCAwLCB2b2lkIDAsIHtcbiAgICAgIHByb21pc2U6IHByb21pc2UsXG4gICAgICByZXNvbHZlOiB2b2lkIDAsXG4gICAgICByZWplY3Q6IHZvaWQgMFxuICAgIH0pO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBxdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBuZXh0ID0gcXVldWVbaV07XG4gICAgcHJvbWlzZS5fc3RhdGUoXG4gICAgICB2YWx1ZSxcbiAgICAgIG5leHQub25GdWxmaWxsZWQsXG4gICAgICBuZXh0Lm9uUmVqZWN0ZWQsXG4gICAgICBuZXh0LmRlZmVycmVkXG4gICAgKTtcbiAgfVxuICBxdWV1ZS5sZW5ndGggPSAwO1xuXG4gIC8vIElmIHdlJ3JlIGFkb3B0aW5nIGFub3RoZXIgcHJvbWlzZSwgaXQncyBub3QgdGhlIGVuZCBvZiB0aGUgcHJvbWlzZSBjaGFpbixcbiAgLy8gdGhlIG5ldyBwcm9taXNlIGlzLlxuICBpZiAoYWRvcHRlZSkge1xuICAgIGFkb3B0ZWUuX2lzQ2hhaW5FbmQgPSBmYWxzZTtcbiAgfVxuXG4gIC8vIERldGVybWluZSBpZiB0aGlzIHJlamVjdGVkIHByb21pc2Ugd2lsbCBiZSBcImhhbmRsZWRcIi5cbiAgaWYgKHN0YXRlID09PSBSZWplY3RlZFByb21pc2UgJiYgcHJvbWlzZS5faXNDaGFpbkVuZCkge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBpZiAocHJvbWlzZS5faXNDaGFpbkVuZCkge1xuICAgICAgICBvblBvc3NpYmx5VW5oYW5kbGVkUmVqZWN0aW9uKHZhbHVlLCBwcm9taXNlKTtcbiAgICAgIH1cbiAgICB9LCAwKTtcbiAgfVxufVxuXG4vKipcbiAqIEEgcGFydGlhbCBhcHBsaWNhdGlvbiBvZiBhZG9wdC5cbiAqXG4gKiBAcGFyYW0geyFQcm9taXNlfSBwcm9taXNlXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKHRoaXM6UHJvbWlzZSwqPSxmdW5jdGlvbigqPSksZnVuY3Rpb24oKj0pLERlZmVycmVkKTohUHJvbWlzZX0gc3RhdGVcbiAqIEByZXR1cm5zIHtmdW5jdGlvbigqPSl9XG4gKi9cbmZ1bmN0aW9uIGFkb3B0ZXIocHJvbWlzZSwgc3RhdGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgYWRvcHQocHJvbWlzZSwgc3RhdGUsIHZhbHVlKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBVcGRhdGVzIGEgZGVmZXJyZWQgcHJvbWlzZXMgc3RhdGUuIE5lY2Vzc2FyeSBmb3IgdXBkYXRpbmcgYW4gYWRvcHRpbmdcbiAqIHByb21pc2UncyBzdGF0ZSB3aGVuIHRoZSBhZG9wdGVlIHJlc29sdmVzLlxuICpcbiAqIEBwYXJhbSB7P0RlZmVycmVkfSBkZWZlcnJlZFxuICogQHBhcmFtIHtmdW5jdGlvbih0aGlzOlByb21pc2UsKj0sZnVuY3Rpb24oKj0pLGZ1bmN0aW9uKCo9KSxEZWZlcnJlZCk6IVByb21pc2V9IHN0YXRlXG4gKiBAcGFyYW0geyo9fSB2YWx1ZVxuICovXG5mdW5jdGlvbiBkZWZlcnJlZEFkb3B0KGRlZmVycmVkLCBzdGF0ZSwgdmFsdWUpIHtcbiAgaWYgKGRlZmVycmVkKSB7XG4gICAgdmFyIHByb21pc2UgPSBkZWZlcnJlZC5wcm9taXNlO1xuICAgIHByb21pc2UuX3N0YXRlID0gc3RhdGU7XG4gICAgcHJvbWlzZS5fdmFsdWUgPSB2YWx1ZTtcbiAgfVxufVxuXG4vKipcbiAqIEEgbm8tb3AgZnVuY3Rpb24gdG8gcHJldmVudCBkb3VibGUgcmVzb2x2aW5nLlxuICovXG5mdW5jdGlvbiBub29wKCkge31cblxuLyoqXG4gKiBUZXN0cyBpZiBmbiBpcyBhIEZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHsqfSBmblxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oZm4pIHtcbiAgcmV0dXJuIHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBUZXN0cyBpZiBmbiBpcyBhbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0geyp9IG9ialxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICByZXR1cm4gb2JqID09PSBPYmplY3Qob2JqKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlcyBvdmVyIGVhY2ggZWxlbWVudCBvZiBhbiBhcnJheSwgY2FsbGluZyB0aGUgaXRlcmF0b3Igd2l0aCB0aGVcbiAqIGVsZW1lbnQgYW5kIGl0cyBpbmRleC5cbiAqXG4gKiBAcGFyYW0geyFBcnJheX0gY29sbGVjdGlvblxuICogQHBhcmFtIHtmdW5jdGlvbigqPSxudW1iZXIpfSBpdGVyYXRvclxuICovXG5mdW5jdGlvbiBlYWNoKGNvbGxlY3Rpb24sIGl0ZXJhdG9yKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY29sbGVjdGlvbi5sZW5ndGg7IGkrKykge1xuICAgIGl0ZXJhdG9yKGNvbGxlY3Rpb25baV0sIGkpO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBhdHRlbXB0IHRvIHJlc29sdmUgdGhlIGRlZmVycmVkIHdpdGggdGhlIHJldHVyblxuICogb2YgZm4uIElmIGFueSBlcnJvciBpcyByYWlzZWQsIHJlamVjdHMgaW5zdGVhZC5cbiAqXG4gKiBAcGFyYW0geyFEZWZlcnJlZH0gZGVmZXJyZWRcbiAqIEBwYXJhbSB7ZnVuY3Rpb24oKj0pfSBmblxuICogQHBhcmFtIHsqfSBhcmdcbiAqIEByZXR1cm5zIHtmdW5jdGlvbigpfVxuICovXG5mdW5jdGlvbiB0cnlDYXRjaERlZmVycmVkKGRlZmVycmVkLCBmbiwgYXJnKSB7XG4gIHZhciBwcm9taXNlID0gZGVmZXJyZWQucHJvbWlzZTtcbiAgdmFyIHJlc29sdmUgPSBkZWZlcnJlZC5yZXNvbHZlO1xuICB2YXIgcmVqZWN0ID0gZGVmZXJyZWQucmVqZWN0O1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciByZXN1bHQgPSBmbihhcmcpO1xuICAgICAgZG9SZXNvbHZlKHByb21pc2UsIHJlc29sdmUsIHJlamVjdCwgcmVzdWx0LCByZXN1bHQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJlamVjdChlKTtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogUXVldWVzIGFuZCBleGVjdXRlcyBtdWx0aXBsZSBkZWZlcnJlZCBmdW5jdGlvbnMgb24gYW5vdGhlciBydW4gbG9vcC5cbiAqL1xudmFyIGRlZmVyID0gKGZ1bmN0aW9uKCkge1xuICAvKipcbiAgICogRGVmZXJzIGZuIHRvIGFub3RoZXIgcnVuIGxvb3AuXG4gICAqL1xuICB2YXIgc2NoZWR1bGVGbHVzaDtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5wb3N0TWVzc2FnZSkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZmx1c2gpO1xuICAgIHNjaGVkdWxlRmx1c2ggPSBmdW5jdGlvbigpIHtcbiAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgnbWFjcm8tdGFzaycsICcqJyk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBzY2hlZHVsZUZsdXNoID0gZnVuY3Rpb24oKSB7XG4gICAgICBzZXRUaW1lb3V0KGZsdXNoLCAwKTtcbiAgICB9O1xuICB9XG5cbiAgdmFyIHF1ZXVlID0gbmV3IEFycmF5KDE2KTtcbiAgdmFyIGxlbmd0aCA9IDA7XG5cbiAgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGZuID0gcXVldWVbaV07XG4gICAgICBxdWV1ZVtpXSA9IG51bGw7XG4gICAgICBmbigpO1xuICAgIH1cbiAgICBsZW5ndGggPSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gZm5cbiAgICovXG4gIGZ1bmN0aW9uIGRlZmVyKGZuKSB7XG4gICAgaWYgKGxlbmd0aCA9PT0gMCkgeyBzY2hlZHVsZUZsdXNoKCk7IH1cbiAgICBxdWV1ZVtsZW5ndGgrK10gPSBmbjtcbiAgfVxuXG4gIHJldHVybiBkZWZlcjtcbn0pKCk7XG5cbi8qKlxuICogVGhlIFByb21pc2UgcmVzb2x1dGlvbiBwcm9jZWR1cmUuXG4gKiBodHRwczovL2dpdGh1Yi5jb20vcHJvbWlzZXMtYXBsdXMvcHJvbWlzZXMtc3BlYyN0aGUtcHJvbWlzZS1yZXNvbHV0aW9uLXByb2NlZHVyZVxuICpcbiAqIEBwYXJhbSB7IVByb21pc2V9IHByb21pc2VcbiAqIEBwYXJhbSB7ZnVuY3Rpb24oKj0pfSByZXNvbHZlXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCo9KX0gcmVqZWN0XG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcGFyYW0geyo9fSBjb250ZXh0XG4gKi9cbmZ1bmN0aW9uIGRvUmVzb2x2ZShwcm9taXNlLCByZXNvbHZlLCByZWplY3QsIHZhbHVlLCBjb250ZXh0KSB7XG4gIHZhciBfcmVqZWN0ID0gcmVqZWN0O1xuICB2YXIgdGhlbjtcbiAgdmFyIF9yZXNvbHZlO1xuICB0cnkge1xuICAgIGlmICh2YWx1ZSA9PT0gcHJvbWlzZSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGZ1bGZpbGwgcHJvbWlzZSB3aXRoIGl0c2VsZicpO1xuICAgIH1cbiAgICB2YXIgaXNPYmogPSBpc09iamVjdCh2YWx1ZSk7XG4gICAgaWYgKGlzT2JqICYmIHZhbHVlIGluc3RhbmNlb2YgcHJvbWlzZS5jb25zdHJ1Y3Rvcikge1xuICAgICAgYWRvcHQocHJvbWlzZSwgdmFsdWUuX3N0YXRlLCB2YWx1ZS5fdmFsdWUsIHZhbHVlKTtcbiAgICB9IGVsc2UgaWYgKGlzT2JqICYmICh0aGVuID0gdmFsdWUudGhlbikgJiYgaXNGdW5jdGlvbih0aGVuKSkge1xuICAgICAgX3Jlc29sdmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBfcmVzb2x2ZSA9IF9yZWplY3QgPSBub29wO1xuICAgICAgICBkb1Jlc29sdmUocHJvbWlzZSwgcmVzb2x2ZSwgcmVqZWN0LCB2YWx1ZSwgdmFsdWUpO1xuICAgICAgfTtcbiAgICAgIF9yZWplY3QgPSBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgX3Jlc29sdmUgPSBfcmVqZWN0ID0gbm9vcDtcbiAgICAgICAgcmVqZWN0KHJlYXNvbik7XG4gICAgICB9O1xuICAgICAgdGhlbi5jYWxsKFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvbih2YWx1ZSkgeyBfcmVzb2x2ZSh2YWx1ZSk7IH0sXG4gICAgICAgIGZ1bmN0aW9uKHJlYXNvbikgeyBfcmVqZWN0KHJlYXNvbik7IH1cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIF9yZWplY3QoZSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUHJvbWlzZTtcbiJdfQ==
// /Users/mszylkowski/src/amphtml/node_modules/promise-pjs/promise.mjs