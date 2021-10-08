import * as preact from /*OK*/ 'preact';

import {isTest} from '#core/mode';

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

let flushInternal;

/**
 * @param {*} process
 */
function flushableRender(process) {
  process.__completed = false;
  flushInternal = process;
  Promise.resolve().then(() => {
    if (process.__completed) {
      return;
    }
    process.__completed = true;
    flushInternal = null;
    return process();
  });
}

if (isTest()) {
  preact.options.requestAnimationFrame = flushableRaf;
  preact.options.debounceRendering = flushableRender;
}

/**
 * Flushes all of Preact renders and effects
 * that have been queued up.
 *
 * @return {Promise<void>}
 */
export async function flush() {
  await flushInternal?.();
  rafs.forEach((fn) => fn());
  rafs.length = 0;
}
