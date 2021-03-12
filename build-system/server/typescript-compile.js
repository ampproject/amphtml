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
const pathModule = require('path');
const {cyan, green} = require('kleur/colors');
const {endBuildStep} = require('../tasks/helpers');
const {exec} = require('../common/exec');
const {log} = require('../common/logging');

const SERVER_TRANSFORM_PATH = 'build-system/server/new-server/transforms';

/**
 * Builds the new server by converting typescript transforms to JS
 * @return {Promise}
 */
async function buildNewServer() {
  log(
    green('Building'),
    cyan('AMP Server'),
    green('at'),
    cyan(`${SERVER_TRANSFORM_PATH}/dist`) + green('...')
  );
  const entryPoints = globby.sync(
    path.join(SERVER_TRANSFORM_PATH, '**', '*.ts')
  );

  const startTime = Date.now();
  return esbuild
    .build({
      entryPoints,
      outdir: pathModule.join(SERVER_TRANSFORM_PATH, 'dist'),
      bundle: false,
      tsconfig: path.join(SERVER_TRANSFORM_PATH, 'tsconfig.json'),
      format: 'cjs',
    })
    .then(() => {
      endBuildStep('Built', 'AMP Server', startTime);
    });
}

function typecheckNewServer() {
  const result = exec(getTypeCheckCmd(), {
    'stdio': ['inherit', 'inherit', 'pipe'],
  });
  if (result.status != 0) {
    const err = new Error('Could not build AMP Server');
    // @ts-ignore
    err.showStack = false;
    throw err;
  }
}

/**
 * @return {string}
 */
function getTypeCheckCmd() {
  switch (process.platform) {
    case 'win32':
      return `node .\\node_modules\\typescript\\lib\\tsc.js --noEmit -p ${SERVER_TRANSFORM_PATH.split(
        '/'
      ).join(pathModule.sep)}${pathModule.sep}tsconfig.json`;

    default:
      return `./node_modules/typescript/bin/tsc --noEmit -p ${SERVER_TRANSFORM_PATH}/tsconfig.json`;
  }
}

module.exports = {
  buildNewServer,
  typecheckNewServer,
  SERVER_TRANSFORM_PATH,
};
