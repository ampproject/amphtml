const esbuild = require('esbuild');
const {BUILD_CONSTANTS} = require('./build-constants');
const {endBuildStep} = require('../tasks/helpers');

/**
 * Builds the compiler.js binary.
 *
 * @return {Promise<void>}
 */
async function buildCompiler() {
  const startTime = Date.now();

  // Build constants used to replace mode constants.
  const define = Object.fromEntries(
    Object.entries(BUILD_CONSTANTS)
      .filter(([unused, v]) => typeof v === 'boolean')
      .map(([k, v]) => {
        return [k, v.toString()];
      })
  );

  await esbuild.build({
    entryPoints: ['src/compiler/index.js'],
    outfile: 'dist/compiler.js',
    bundle: true,
    define,
  });
  endBuildStep('Compiled', 'compiler.js', startTime);
}
module.exports = {buildCompiler};
