export default class SyncPromise {
  constructor(resolver) {
    if (!isFunction(resolver)) {
      throw new TypeError('Must pass resolver function');
    }

    this._state = PendingPromise;
    this._value = [];

    doResolve(
      this,
      adopter(this, FulfilledPromise),
      adopter(this, RejectedPromise),
      { then: resolver }
    );
  }

  then(onFulfilled, onRejected) {
    onFulfilled = isFunction(onFulfilled) ? onFulfilled : void 0;
    onRejected = isFunction(onRejected) ? onRejected : void 0;

    return this._state(
      this._value,
      onFulfilled,
      onRejected
    );
  }

  catch(onRejected) {
    return this.then(void 0, onRejected);
  }

  static resolve(value) {
    const Constructor = this;
    if (isObject(value) && value instanceof Constructor) {
      return value;
    }

    return new Constructor((resolve) => resolve(value));
  }

  static reject(reason) {
    const Constructor = this;
    return new Constructor((_, reject) => reject(reason));
  }

  static all(promises) {
    const Constructor = this;
    return new Constructor((resolve, reject) => {
      let length = promises.length;
      const values = new Array(length);

      if (length === 0) {
        resolve(values);
        return;
      }

      each(promises, (promise, index) => {
        Constructor.resolve(promise).then((value) => {
          values[index] = value;
          if (--length === 0) {
            resolve(values);
          }
        }, reject);
      });
    });
  }

  static race(promises) {
    const Constructor = this;
    return new Constructor((resolve, reject) => {
      for (let i = 0, l = promises.length; i < l; i++) {
        Constructor.resolve(promises[i]).then(resolve, reject);
      }
    });
  }
}

function FulfilledPromise(value, onFulfilled, unused, deferred) {
  if (!onFulfilled) { return this; }
  if (!deferred) {
    deferred = new Deferred(this.constructor);
  }
  tryCatchDeferred(deferred, onFulfilled, value);
  return deferred.promise;
}

function RejectedPromise(reason, unused, onRejected, deferred) {
  if (!onRejected) { return this; }
  if (!deferred) {
    deferred = new Deferred(this.constructor);
  }
  tryCatchDeferred(deferred, onRejected, reason);
  return deferred.promise;
}

function PendingPromise(queue, onFulfilled, onRejected, deferred) {
  if (!onFulfilled && !onRejected) { return this; }
  if (!deferred) {
    deferred = new Deferred(this.constructor);
  }
  queue.push({
    deferred,
    onFulfilled: onFulfilled || deferred.resolve,
    onRejected: onRejected || deferred.reject,
  });
  return deferred.promise;
}

function Deferred(SyncPromise) {
  const deferred = this;
  deferred.promise = new SyncPromise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
}

function adopt(promise, state, value) {
  const queue = promise._value;
  promise._state = state;
  promise._value = value;

  for (let i = 0; i < queue.length; i++) {
    const { onFulfilled, onRejected, deferred } = queue[i];
    promise._state(value, onFulfilled, onRejected, deferred);
  }
}

function adopter(promise, state) {
  return (value) => adopt(promise, state, value);
}

function noop() {}

function isFunction(fn) {
  return typeof fn === 'function';
}

function isObject(obj) {
  return obj === Object(obj);
}

function each(collection, iterator) {
  for (let i = 0; i < collection.length; i++) {
    iterator(collection[i], i);
  }
}

function tryCatchDeferred(deferred, fn, arg) {
  const { promise, resolve, reject } = deferred;
  try {
    const result = fn(arg);
    if (resolve === fn || reject === fn) {
      return;
    }
    doResolve(promise, resolve, reject, result, result);
  } catch (e) {
    reject(e);
  }
}

function doResolve(promise, resolve, reject, value, context) {
  let _reject = reject;
  let then;
  let _resolve;
  try {
    if (value === promise) {
      throw new TypeError('Cannot fulfill promise with itself');
    }
    const isObj = isObject(value);
    if (isObj && value instanceof promise.constructor) {
      adopt(promise, value._state, value._value);
    } else if (isObj && (then = value.then) && isFunction(then)) {
      _resolve = (value) => {
        _resolve = _reject = noop;
        doResolve(promise, resolve, reject, value, value);
      };
      _reject = (reason) => {
        _resolve = _reject = noop;
        reject(reason);
      };
      then.call(
        context,
        (value) => _resolve(value),
        (reason) => _reject(reason)
      );
    } else {
      resolve(value);
    }
  } catch (e) {
    _reject(e);
  }
}
