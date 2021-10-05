const path = require('path');
const Piscina = require('piscina');

let compileWorker = null;

/**
 * Initializes the worker instance if necessary.
 */
function maybeInitializeWorker() {
  if (!compileWorker) {
    compileWorker = new Piscina({
      filename: path.resolve(__dirname, 'compile-worker.js'),
      env: Object.assign(process.env, {'FORCE_COLOR': 1}),
      maxQueue: 'auto',
    });
  }
}

/**
 * Compiles AMP with the closure compiler. This is intended only for
 * production use. During development we intend to continue using
 * babel, as it has much faster incremental compilation.
 *
 * @param {string|string[]} entryModuleFilenames
 * @param {string} outputDir
 * @param {string} outputFilename
 * @param {!Object} options
 * @param {{startTime?: number}} timeInfo
 * @return {Promise<void>}
 */
async function closureCompile(
  entryModuleFilenames,
  outputDir,
  outputFilename,
  options,
  timeInfo
) {
  maybeInitializeWorker();
  if (timeInfo) {
    timeInfo.startTime = Date.now();
  }
  await compileWorker.run({
    entryModuleFilenames,
    options,
    outputDir,
    outputFilename,
  });
}

module.exports = {
  closureCompile,
};
