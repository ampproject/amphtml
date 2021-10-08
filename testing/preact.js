import * as preact from /*OK*/ 'preact';

/**
 * This file introduces a helper for draining Preact's queue of renders and effects to run.
 * We use this as part of the afterEach() cleanup in unit tests, to ensure no effects are run
 * subsequent tests.
 *
 * There is still a test isolation issue in that an effect can asynchronously schedule work
 * which cannot be guarded from at this layer. For that we'd likely need to refresh the window
 * in between each test run.
 *
 * We should be able to remove this file if this feature lands in Preact.
 * @fileoverview
 */

const rafs = [];
/**
 * @param {(ts: (DOMHighResTimeStamp) => number)} cb
 * @return {number}
 */
function flushableRaf(cb) {
  rafs.push(cb);
  return requestAnimationFrame(flushRaf);
}

function flushRaf(ts = performance.now()) {
  // rafs.forEach((fn) => fn(ts));
  // rafs.length = 0;
  while (rafs.length > 0) {
    rafs.shift()(ts);
  }
}

let pendingRender;

/**
 * @param {() => void} process
 * @return {Promise<void>}
 */
function flushableRender(process) {
  pendingRender = () => {
    pendingRender = null;
    return process();
  };
  return Promise.resolve().then(pendingRender);
}

/**
 * Flushes all of Preact renders and effects
 * that have been queued up.
 *
 * Effects may queue up further rerenders, etc. etc,
 * so this function will wait for everything to resolve.
 *
 * @return {Promise<void>}
 */
export async function flush() {
  await flushRaf();
  while (pendingRender) {
    await pendingRender();
    await flushRaf();
  }
}

preact.options.requestAnimationFrame = flushableRaf;
preact.options.debounceRendering = flushableRender;
