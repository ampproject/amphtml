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
'use strict';
const argv = require('minimist')(process.argv.slice(2));
const colors = require('ansi-colors');
const fs = require('fs');
const log = require('fancy-log');
const path = require('path');
const tempy = require('tempy');

const logFile = path.resolve(process.cwd(), 'dist', 'debug-compilation.log');

const pad = (value, length) =>
  (value.length > length ? value.slice(value.length - length) : value).padEnd(
    length
  );

const LIFECYCLES = {
  'pre-babel': 'pre-babel',
  'pre-closure': 'pre-closure',
  'closured-pre-babel': 'closured-pre-babel',
  'closured-pre-terser': 'closured-pre-terser',
  'complete': 'complete',
};

/**
 * Output debugging information when developing changes in this functionality.
 *
 * @param {string} lifecycle
 * @param {string} fullpath
 * @param {Buffer} content
 * @param {Object} sourcemap
 */
function debug(lifecycle, fullpath, content, sourcemap) {
  if (argv.debug && Object.keys(LIFECYCLES).includes(lifecycle)) {
    const contentsPath = tempy.writeSync(content);
    if (sourcemap) {
      fs.writeFileSync(
        `${contentsPath}.map`,
        JSON.stringify(sourcemap, null, 4)
      );
    }
    fs.appendFileSync(
      logFile,
      `${pad(lifecycle, 20)}: ${pad(
        path.basename(fullpath),
        30
      )} ${contentsPath}\n`
    );
  }
}

function displayLifecycleDebugging() {
  if (argv.debug) {
    log(colors.white('Debug Lifecycles: ') + colors.red(logFile));
  }
}

module.exports = {
  displayLifecycleDebugging,
  debug,
  CompilationLifecycles: LIFECYCLES,
};
