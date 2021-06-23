/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
const esbuild = require('esbuild');
const globby = require('globby');
const path = require('path');
const {accessSync} = require('fs-extra');
const {cyan, green} = require('../common/colors');
const {endBuildStep} = require('../tasks/helpers');
const {exec} = require('../common/exec');
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
  const entryPoints = globby.sync(`${SERVER_TRANSFORM_PATH}/**/*.ts`);
  const startTime = Date.now();
  await esbuild.build({
    ...esbuildOptions,
    entryPoints,
    outdir,
  });
  endBuildStep('Built', 'AMP Server', startTime);
}

/**
 * Checks all types in the generated output after running server transforms.
 */
function typecheckNewServer() {
  const cmd = `npx -p typescript tsc --noEmit -p ${CONFIG_PATH}`;
  const result = exec(cmd, {'stdio': ['inherit', 'inherit', 'pipe']});

  if (result.status != 0) {
    throw new Error(`Typechecking AMP Server failed.`);
  }
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
  typecheckNewServer,
  requireNewServerModule,
  SERVER_TRANSFORM_PATH,
};
