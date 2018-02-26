/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

const colors = require('ansi-colors');
const exec = require('../exec').exec;
const fs = require('fs-extra');
const getStderr = require('../exec').getStderr;
const gulp = require('gulp-help')(require('gulp'));
const log = require('fancy-log');

/**
 * Patches Web Animations API by wrapping its body into `install` function.
 * This gives us an option to call polyfill directly on the main window
 * or a friendly iframe.
 */
function patchWebAnimations() {
  // Copies web-animations-js into a new file that has an export.
  const patchedName = 'node_modules/web-animations-js/' +
      'web-animations.install.js';
  if (fs.existsSync(patchedName)) {
    return;
  }
  let file = fs.readFileSync(
      'node_modules/web-animations-js/' +
      'web-animations.min.js').toString();
  // Wrap the contents inside the install function.
  file = 'exports.installWebAnimations = function(window) {\n' +
      'var document = window.document;\n' +
      file + '\n' +
      '}\n';
  fs.writeFileSync(patchedName, file);
  if (!process.env.TRAVIS) {
    log(colors.green('Patched'), colors.cyan(patchedName));
  }
}

/**
 * Does a yarn check on node_modules, and if it is outdated, runs yarn.
 * Follows it up with a call to patch web-animations-js if necessary.
 */
function updatePackages() {
  const integrityCmd = 'yarn check --integrity';
  if (getStderr(integrityCmd).trim() != '') {
    log(colors.yellow('WARNING:'), 'The packages in',
        colors.cyan('node_modules'), 'do not match',
        colors.cyan('package.json.'));
    const verifyTreeCmd = 'yarn check --verify-tree';
    exec(verifyTreeCmd);
    log('Running', colors.cyan('yarn'), 'to update packages...');
    const yarnCmd = 'yarn';
    exec(yarnCmd);
  } else {
    if (!process.env.TRAVIS) {
      log(colors.green('All packages in'),
          colors.cyan('node_modules'), colors.green('are up to date.'));
    }
  }
  patchWebAnimations();
}

gulp.task(
    'update-packages',
    'Runs yarn if node_modules is out of date, and patches web-animations-js',
    updatePackages
);
