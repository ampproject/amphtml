/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
 * A private encapsulation of the test env variable.
 */
let env_;

/**
 * Sets up the helper environment.
 * @param {*} env
 */
export function configureHelpers(env) {
  env_ = env;
}

/**
 * Returns a Promise that resolves after the specified number of milliseconds.
 * @param {number} ms
 * @return {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

/**
 * Returns a Promise that resolves after the next browser frame has been rendered.
 * @param {Window=} win
 * @return {Promise<void>}
 */
export function afterRenderPromise(win = env_?.win) {
  return /** @type {Promise<void>} */ (
    new Promise((resolve) => {
      const requestAnimationFrame = win
        ? win.requestAnimationFrame
        : async (cb) => {
            await sleep(1);
            cb();
          };

      requestAnimationFrame(() => {
        setTimeout(resolve);
      });
    })
  );
}

/**
 * Returns a Promise that resolves after n frames have been rendered.
 * @param {number} n
 */
export function awaitNFrames(n) {
  return /** @type {Promise<void>} */ (
    new Promise(async (resolve) => {
      for (let i = 0; i < n; i++) {
        await afterRenderPromise();
      }
      resolve();
    })
  );
}

/**
 * Returns a Promise that resolves upon the next frame being rendered after ms have passed.
 * @param {number} ms
 * @return {Promise<void>}
 */
export function awaitFrameAfter(ms) {
  return new Promise(async (resolve) => {
    const start = Date.now();
    while (Date.now() - start < ms) {
      await afterRenderPromise();
    }
    resolve();
  });
}
