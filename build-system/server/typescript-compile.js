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
const log = require('fancy-log');
const {cyan, green} = require('ansi-colors');
const {exec} = require('../common/exec');

const SERVER_TRANSFORM_PATH = 'build-system/server/new-server/transforms';

// Used by new server implementation
const typescriptBinary = './node_modules/typescript/bin/tsc';

/**
 * Builds the new server by converting typescript transforms to JS
 */
function buildNewServer() {
  const buildCmd = `${typescriptBinary} -p ${SERVER_TRANSFORM_PATH}/tsconfig.json`;
  log(
    green('Building'),
    cyan('AMP Dev Server'),
    green('at'),
    cyan(`${SERVER_TRANSFORM_PATH}/dist`) + green('...')
  );
  const result = exec(buildCmd, {'stdio': ['inherit', 'inherit', 'pipe']});
  if (result.status != 0) {
    const err = new Error('Could not build AMP Dev Server');
    err.showStack = false;
    throw err;
  }
}

module.exports = {
  buildNewServer,
  SERVER_TRANSFORM_PATH,
};
