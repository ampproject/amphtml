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
    setTimeout(resolve, ms);
  });
}

/**
 * A convenient method so you can flush the event queue by doing
 * `yield macroTask()` in your test.
 * @return {Promise<void>}
 */
export function macroTask() {
  return sleep(0);
}

/**
 * Returns a Promise that resolves after the next browser frame has been rendered.
 * @param {Window=} win
 * @return {Promise<void>}
 */
export function afterRenderPromise(win = env_?.win) {
  const requestAnimationFrame =
    win?.requestAnimationFrame ??
    /** @type {(cb: () => void) => Promise<void>} */
    (
      async (cb) => {
        await macroTask();
        cb();
      }
    );
  return new Promise(async (resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
}

/**
 * Returns a Promise that resolves upon the next frame being rendered after ms have passed.
 * @param {number} ms
 * @return {Promise<void>}
 */
export async function awaitFrameAfter(ms) {
  await sleep(ms);
  await afterRenderPromise();
}
