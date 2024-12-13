/**
 * Allow expectations to await the expected value. Duck-type a real Promise.
 * This class, and its waitForValue member function, are necessary because
 * to behave like a Promise and to wait for the correct value from the
 * Browser Automation Framework, the onFulfilled chains need to propagate into
 * the new values that come from the browser.
 *
 * @template TYPE
 * @extends {Promise<?TYPE>}
 */
class ControllerPromise extends Promise {
  /**
   * @param {Promise<TYPE|null>|function(function(?TYPE):void, function(*):void):void} executorOrPromise
   * @param {undefined|function(TYPE,function(TYPE): ?TYPE): Promise<TYPE>} opt_waitForValue
   */
  constructor(executorOrPromise, opt_waitForValue) {
    if (executorOrPromise instanceof Promise) {
      super(executorOrPromise.then);
    } else {
      super(executorOrPromise);
    }
    this.promise_ =
      typeof executorOrPromise == 'function'
        ? new Promise(executorOrPromise)
        : executorOrPromise;

    /**
     * Returns a Promise that resolves when the given expected value fulfills
     * the given condition.
     * @type {undefined|function(TYPE,function(TYPE): ?TYPE): Promise<TYPE>}
     */
    this.waitForValue = opt_waitForValue;
  }

  /** @override */
  catch(onRejected) {
    return new ControllerPromise(
      this.promise_.catch(onRejected),
      this.waitForValue
    );
  }

  /** @override */
  finally(onFinally) {
    return new ControllerPromise(
      this.promise_.finally(onFinally),
      this.waitForValue
    );
  }

  /** @override */
  then(opt_onFulfilled, opt_onRejected) {
    // Allow this and future `then`s to update the wait value.
    let wrappedWait;
    if (this.waitForValue) {
      wrappedWait = wrapWait(this.waitForValue, opt_onFulfilled);
    }

    return new ControllerPromise(
      this.promise_.then(opt_onFulfilled, opt_onRejected),
      wrappedWait
    );
  }
}

/**
 * Wrap the given wait function with the given mutation function,
 * while still allowing it to be mutated again in the future by
 * the inner opt_mutate function.
 * @param {function(CONDITION, function(VALUE): ?DERIVED): Promise<RES>} wait
 * @param {function(VALUE): MUTANT} mutate
 * @return {function(CONDITION, function(MUTANT): ?DERIVED): Promise<RES>}
 * @template CONDITION
 * @template MUTANT
 * @template DERIVED
 * @template VALUE
 * @template RES
 */
function wrapWait(wait, mutate) {
  return (condition, opt_mutate) => {
    opt_mutate = opt_mutate || ((x) => /** @type {*} */ (x));
    return wait(condition, (value) => opt_mutate(mutate(value)));
  };
}

module.exports = {
  ControllerPromise,
};
