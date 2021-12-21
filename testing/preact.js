import * as preact from /*OK*/ 'preact';

/**
 * This file introduces a helper for draining Preact's queue of renders and effects.
 * We use this as part of the afterEach() cleanup in unit tests, to ensure no effects are run
 * in subsequent tests.
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
  for (const raf of rafs) {
    raf(ts);
  }
  rafs.length = 0;
}

let pendingRender;

/**
 * @param {() => void} process
 * @return {Promise<void>}
 */
async function flushableRender(process) {
  pendingRender = () => {
    pendingRender = null;
    return process();
  };
  await Promise.resolve().then(pendingRender);
}

/**
 * Flushes Preact renders and effects.
 *
 * Effects may queue up further rerenders, etc. etc,
 * so this function will loop until everything to resolves.
 *
 * @return {Promise<void>}
 */
export async function flush() {
  flushRaf();
  while (pendingRender) {
    await pendingRender();
    flushRaf();
  }
}

preact.options.requestAnimationFrame = flushableRaf;
preact.options.debounceRendering = flushableRender;
