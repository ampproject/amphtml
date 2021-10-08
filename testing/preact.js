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
 * @param {*} cb
 * @return {number}
 */
function flushableRaf(cb) {
  cb.__completed = false;
  rafs.push(cb);
  return requestAnimationFrame((ts) => {
    if (cb.__completed) {
      return;
    }
    cb.__completed = true;
    cb(ts);
  });
}

let flushRender;

/**
 * Set to ensure a render is only called once.
 * @type {WeakSet<() => void>}
 */
const flushedRenderSet = new WeakSet();

/**
 * @param {() => voic} process
 */
function flushableRender(process) {
  flushRender = process;
  Promise.resolve().then(() => {
    if (flushedRenderSet.has(process)) {
      return;
    }
    flushedRenderSet.add(process);
    flushRender = null;
    return process();
  });
}

/**
 * Flushes all of Preact renders and effects
 * that have been queued up.
 *
 * @return {Promise<void>}
 */
export async function flush() {
  await flushRender?.();
  rafs.forEach((fn) => fn());
  rafs.length = 0;
}

preact.options.requestAnimationFrame = flushableRaf;
preact.options.debounceRendering = flushableRender;
