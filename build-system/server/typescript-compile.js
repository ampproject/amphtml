const esbuild = require('esbuild');
const fastGlob = require('fast-glob');
const path = require('path');
const {accessSync} = require('fs-extra');
const {cyan, green} = require('kleur/colors');
const {endBuildStep} = require('../tasks/helpers');
const {log} = require('../common/logging');

const SERVER_TRANSFORM_PATH = 'build-system/server/new-server/transforms';
const CONFIG_PATH = `${SERVER_TRANSFORM_PATH}/tsconfig.json`;

const outdir = path.join(SERVER_TRANSFORM_PATH, 'dist');
const esbuildOptions = /** @type {esbuild.BuildOptions} */ ({
  bundle: false,
  banner: {js: '// @ts-nocheck'},
  tsconfig: CONFIG_PATH,
  format: 'cjs',
});

/**
 * Builds the new server by converting typescript transforms to JS. This JS
 * output is not type-checked as part of `amp check-build-system`.
 * @return {Promise<void>}
 */
async function buildNewServer() {
  log(
    green('Building'),
    cyan('AMP Server'),
    green('at'),
    cyan(outdir) + green('...')
  );
  const entryPoints = await fastGlob(`${SERVER_TRANSFORM_PATH}/**/*.ts`);
  const startTime = Date.now();
  await esbuild.build({
    ...esbuildOptions,
    entryPoints,
    outdir,
  });
  endBuildStep('Built', 'AMP Server', startTime);
}

/**
 * Requires a module output from `./new-server/transforms`.
 * If all of `new-server` was built, this simply imports an existing module.
 * Otherwise, it builds the required module only, then imports it
 * @param {string} modulePath
 *   Path relative to `./new-server/transforms`, without extension.
 * @return {*}
 */
function requireNewServerModule(modulePath) {
  const builtPath = path.join(outdir, `${modulePath}.js`);
  try {
    accessSync(builtPath);
  } catch (_) {
    const startTime = Date.now();
    const sourcePath = path.join(SERVER_TRANSFORM_PATH, `${modulePath}.ts`);
    esbuild.buildSync({
      ...esbuildOptions,
      entryPoints: [sourcePath],
      outdir: path.dirname(builtPath),
    });
    endBuildStep('Built', builtPath, startTime);
  }
  return require(path.join(path.relative(__dirname, process.cwd()), builtPath));
}

module.exports = {
  buildNewServer,
  requireNewServerModule,
  SERVER_TRANSFORM_PATH,
};
