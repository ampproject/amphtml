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
const {cyan, green} = require('kleur/colors');
const {endBuildStep} = require('../tasks/helpers');
const {exec} = require('../common/exec');
const {log} = require('../common/logging');

const SERVER_TRANSFORM_PATH = 'build-system/server/new-server/transforms';
const CONFIG_PATH = `${SERVER_TRANSFORM_PATH}/tsconfig.json`;

/**
 * Builds the new server by converting typescript transforms to JS
 * @return {Promise<void>}
 */
async function buildNewServer() {
  log(
    green('Building'),
    cyan('AMP Server'),
    green('at'),
    cyan(`${SERVER_TRANSFORM_PATH}/dist`) + green('...')
  );
  const entryPoints = globby.sync(`${SERVER_TRANSFORM_PATH}/**/*.ts`);
  const startTime = Date.now();
  await esbuild.build({
    entryPoints,
    outdir: path.join(SERVER_TRANSFORM_PATH, 'dist'),
    bundle: false,
    tsconfig: CONFIG_PATH,
    format: 'cjs',
  });
  endBuildStep('Built', 'AMP Server', startTime);
}

function typecheckNewServer() {
  const cmd = `npx -p typescript tsc --noEmit -p ${CONFIG_PATH}`;
  const result = exec(cmd, {'stdio': ['inherit', 'inherit', 'pipe']});

  if (result.status != 0) {
    throw new Error(`Typechecking AMP Server failed.`);
  }
}

module.exports = {
  buildNewServer,
  typecheckNewServer,
  SERVER_TRANSFORM_PATH,
};
