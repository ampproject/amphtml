const esbuild = require('esbuild');
const {endBuildStep} = require('../tasks/helpers');

/**
 * Builds the compiler.js binary.
 *
 * @return {Promise<void>}
 */
async function buildCompiler() {
  const startTime = Date.now();

  await esbuild.build({
    entryPoints: ['src/compiler/index.js'],
    // Use root-level tsconfig which has path configuration.
    tsconfig: 'tsconfig.json',
    outfile: 'dist/compiler.js',
    bundle: true,
    define: {
      IS_PROD: 'true',
      IS_MINIFIED: 'false',
      IS_ESM: 'false',
      IS_SXG: 'false',
      IS_SSR_CSS: 'false',
    },
  });
  endBuildStep('Compiled', 'compiler.js', startTime);
}
module.exports = {buildCompiler};
