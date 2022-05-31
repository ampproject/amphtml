/**
 * Install "YieldIt" support to Mocha tests.
 * "YieldIt" allows you to wait for a promise to resolve before resuming your
 * test, so you can write asynchronous test in a synchronous way.
 * Check test-yield.js for how-to.
 */
export function installYieldIt(realIt) {
  it = enableYield.bind(null, realIt); // eslint-disable-line no-native-reassign
  it./*OK*/ only = enableYield.bind(null, realIt.only);
  it.skip = realIt.skip;
}

function enableYield(fn, message, runnable) {
  if (
    !runnable ||
    !runnable.constructor ||
    runnable.constructor.name !== 'GeneratorFunction'
  ) {
    return fn(message, runnable);
  }
  return fn(message, (done) => {
    const iterator = runnable();
    function step(method, result) {
      let state;
      try {
        state = iterator[method](result);
      } catch (e) {
        // catch any assertion errors and pass to `done`
        // otherwise the messages are swallowed
        return done(e);
      }
      if (state.done) {
        Promise.resolve(state.value).then(() => done(), done);
        return;
      }

      Promise.resolve(state.value).then(_next, _throw);
    }

    function _next(value) {
      step('next', value);
    }

    function _throw(error) {
      step('throw', error);
    }

    _next();
  });
}
