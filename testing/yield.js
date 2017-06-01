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
 * Install "yield" support to Mocha tests.
 * Check test-yield.js for how-to.
 */
export function installYieldIt(realIt) {
  it = enableYield.bind(null, realIt); // eslint-disable-line no-native-reassign, no-undef
  it./*OK*/only = enableYield.bind(null, realIt.only);
  it.skip = realIt.skip;
}

function enableYield(fn, message, runnable) {
  if (!runnable || !runnable.constructor
      || runnable.constructor.name !== 'GeneratorFunction') {
    return fn(message, runnable);
  }
  return fn(message, done => {
    const runner = (iterator, result) => {
      let state;
      try {
        state = iterator.next(result);
      } catch (e) {
        // catch any assertion errors and pass to `done`
        // otherwise the messages are swallowed
        return done(e);
      }
      if (state.done) {
        return done();
      }

      const _runner = runner.bind(null, iterator);
      if (isPromise(state.value)) {
        // With this, we can do: `const result = yield promise;`
        state.value.then(_runner).catch(done);
      } else {
        // With this, we can do: `yield 50;`, which blocks the test for 50ms
        // We should rarely need this in unit test, use with caution, as it
        // usually brings test flakiness.
        const timeout = (typeof state.value === 'number') ? state.value : 0;
        setTimeout(_runner, timeout);
      }
    };
    runner(runnable());
  });
}

function isPromise(subject) {
  if (subject === undefined || subject === null) {
    return false;
  }
  return typeof subject.then == 'function';
}
