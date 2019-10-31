/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
 * @param {function()} fn
 * @return {boolean}
 */
function isNative(fn) {
  return Object.toString.call(fn).includes('[native code]');
}

/**
 * Wraps promises in a special subclass that can detect unhandled rejections
 * and report them.
 *
 * Normally, `unhandledrejection` event would be used to do this, but it
 * doesn't work unless the script is requested as anonymous.
 *
 * @param {!Window} win
 * @param {function(err)} reportError
 */
export function wrapPromsies(win, reportError) {
  const {Promise} = win;
  const originalThen = Promise.prototype.then;
  const species =
    typeof win['Species'] !== 'undefined' && win['Species'].species;

  // If there's no species symbol, there's nothing we can do.
  if (!species) {
    return;
  }
  // If we using the polyfilled promise, there's no need to wrap it.
  if (!isNative(Promise)) {
    return;
  }

  // We sometimes need to allow creating a real native promise.  Eg,
  // `Promise.resolve().then(() => Promise.reject(1))`. In this case, we'll go
  // through the `wrappedResolve` call (not `wrappedReject`), so we have to cap
  // the return promise with a catch handler. But if we tried to construct a
  // new wrapped promise, we'd get an infinite loop.
  let allowNative = false;

  /**
   * Wraps the native Promise class!
   *
   * Why isn't this using class syntax? Because closure doesn't properly setup
   * the constructor's prototype chain (it only sets the
   * `constructor.prototype`'s prototype chain).
   *
   * @param {function(function(T|Promise<T>), function(Error))} executer
   * @return {!Promise<T>}
   * @template T
   */
  function NuclearPromises(executer) {
    const p = new Promise((resolve, reject) => {
      // The promises spec says that the `resolve` and `reject` functions may
      // only be called once. After that, they do nothing.
      let called = false;

      /**
       * We wrap the `resolve` function to make sure that "only called once" is
       * not violated. Because we have to wrap the `reject`, it wouldn't work
       * otherwise.
       *
       * @param {T} value
       */
      function wrappedResolve(value) {
        if (called) {
          return;
        }
        called = true;
        resolve(value);
      }

      /**
       * We wrap the `reject` function so that we can report the error if the
       * promise is the end of the chain.
       *
       * @param {!Error} err
       */
      function wrappedReject(err) {
        if (called) {
          return;
        }
        p._rejected = true;
        called = true;
        reject(err);
        maybeReport(err, p);
      }

      // Now call the user's executer with out wrapped `resolve` and `reject`!
      // Note that if the executer throws a synchronous error, it's the same as
      // calling `reject`.
      try {
        executer(wrappedResolve, wrappedReject);
      } catch (e) {
        wrappedReject(e);
      }
    });
    p._chainEnd = true;
    p._rejected = false;

    Object.setPrototypeOf(p, NuclearPromises.prototype);
    return p;
  }

  // Setup the wrapper's prototype chain. Both the constructor, and the
  // constructor.prototype must properly inherit.
  NuclearPromises.__proto__ = Promise;
  NuclearPromises.prototype.__proto__ = Promise.prototype;

  // Wrap the then method so that we can tell that this current promise is not
  // the end of a promise chain, it's the returned promise that's the end.
  NuclearPromises.prototype.then = function(f, r) {
    this._chainEnd = false;
    const p = originalThen.call(this, f, r);

    // If the promise did not sync reject, then there's a possibility that is
    // was resolved with a rejected promise. In this case, we need to cap the
    // promise chain to do the reporting.
    if (!this._rejected) {
      allowNative = true;
      originalThen.call(p, undefined, err => maybeReport(err, p));
      allowNative = false;
    }

    return p;
  };

  /**
   * After a delay, if this rejected promise hasn't had a promise chained off
   * of it, report it.
   *
   * @param {!Error} err
   * @param {!Promise} p
   */
  function maybeReport(err, p) {
    setTimeout(() => {
      if (p._chainEnd) {
        reportError(err);
        p._chainEnd = false;
      }
    }, 1);
  }

  /**
   * The species of a constructor function allows subclasses to share a base
   * methods. Whatever constructor is return by the speciesWraper will be used
   * to construct a new instance.
   *
   * Eg, having a `NuclearPromises` instance, then calling `w.then()` will
   * return a new instance of NuclearPromises, instead of Promise.
   *
   * @return {function()}
   */
  function speciesWraper() {
    return allowNative ? Promise : NuclearPromises;
  }
  Promise[species] = speciesWraper;

  // Finally, we need to force promises to use the think they are not the
  // Promise. This will make them always call the species' constructor.
  Promise.prototype.constructor = NuclearPromises;
  win.Promise = NuclearPromises;
}
