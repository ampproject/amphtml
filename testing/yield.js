/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
 * Install "YieldIt" support to Mocha tests.
 * "YieldIt" allows you to wait for a promise to resolve before resuming your
 * test, so you can write asynchronous test in a synchronous way.
 * Check test-yield.js for how-to.
 */
export function installYieldIt(realIt) {
  it = enableYield.bind(null, realIt); // eslint-disable-line no-native-reassign, no-undef
  it./*OK*/only = enableYield.bind(null, realIt.only);
  it.skip = realIt.skip;
}

/**
 * A convenient method so you can flush the event queue by doing
 * `yield macroTask()` in your test.
 * @returns {Promise}
 */
export function macroTask() {
  return new Promise(setTimeout);
}

function enableYield(fn, message, runnable) {
  if (!runnable || !runnable.constructor
      || runnable.constructor.name !== 'GeneratorFunction') {
    return fn(message, runnable);
  }
  return fn(message, done => {
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
