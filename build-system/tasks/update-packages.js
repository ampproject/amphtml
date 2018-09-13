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
const fs = require('fs-extra');
const gulp = require('gulp-help')(require('gulp'));
const log = require('fancy-log');
const {exec, execOrDie, getStderr} = require('../exec');

const yarnExecutable = 'npx yarn';

/**
 * Writes the given contents to the patched file if updated
 * @param {string} patchedName Name of patched file
 * @param {string} file Contents to write
 */
function writeIfUpdated(patchedName, file) {
  if (!fs.existsSync(patchedName) ||
      fs.readFileSync(patchedName) != file) {
    fs.writeFileSync(patchedName, file);
    if (!process.env.TRAVIS) {
      log(colors.green('Patched'), colors.cyan(patchedName));
    }
  }
}

/**
 * Patches Web Animations API by wrapping its body into `install` function.
 * This gives us an option to call polyfill directly on the main window
 * or a friendly iframe.
 */
function patchWebAnimations() {
  // Copies web-animations-js into a new file that has an export.
  const patchedName = 'node_modules/web-animations-js/' +
      'web-animations.install.js';
  let file = fs.readFileSync(
      'node_modules/web-animations-js/' +
      'web-animations.min.js').toString();
  // Wrap the contents inside the install function.
  file = 'exports.installWebAnimations = function(window) {\n' +
      'var document = window.document;\n' +
      file.replace(/requestAnimationFrame/g, function(a, b) {
        if (file.charAt(b - 1) == '.') {
          return a;
        }
        return 'window.' + a;
      }) +
      '\n' +
      '}\n';
  writeIfUpdated(patchedName, file);
}

/**
 * Creates a version of document-register-element that can be installed
 * without side effects.
 */
function patchRegisterElement() {
  let file;
  // Copies document-register-element into a new file that has an export.
  // This works around a bug in closure compiler, where without the
  // export this module does not generate a goog.provide which fails
  // compilation.
  // Details https://github.com/google/closure-compiler/issues/1831
  const patchedName = 'node_modules/document-register-element' +
      '/build/document-register-element.patched.js';
  file = fs.readFileSync(
      'node_modules/document-register-element/build/' +
      'document-register-element.node.js').toString();
  // Eliminate the immediate side effect.
  if (!/installCustomElements\(global\);/.test(file)) {
    throw new Error('Expected "installCustomElements(global);" ' +
        'to appear in document-register-element');
  }
  file = file.replace('installCustomElements(global);', '');
  // Closure Compiler does not generate a `default` property even though
  // to interop CommonJS and ES6 modules. This is the same issue typescript
  // ran into here https://github.com/Microsoft/TypeScript/issues/2719
  if (!/module.exports = installCustomElements;/.test(file)) {
    throw new Error('Expected "module.exports = installCustomElements;" ' +
        'to appear in document-register-element');
  }
  file = file.replace('module.exports = installCustomElements;',
      'exports.installCustomElements = installCustomElements;');
  writeIfUpdated(patchedName, file);
}

/**
 * Installs custom lint rules from build-system/eslint-rules to node_modules.
 */
function installCustomEslintRules() {
  const customRuleDir = 'build-system/eslint-rules';
  const customRuleName = 'eslint-plugin-amphtml-internal';
  exec(yarnExecutable + ' unlink', {'stdio': 'ignore', 'cwd': customRuleDir});
  exec(yarnExecutable + ' link', {'stdio': 'ignore', 'cwd': customRuleDir});
  exec(yarnExecutable + ' unlink ' + customRuleName, {'stdio': 'ignore'});
  exec(yarnExecutable + ' link ' + customRuleName, {'stdio': 'ignore'});
  if (!process.env.TRAVIS) {
    log(colors.green('Installed lint rules from'), colors.cyan(customRuleDir));
  }
}

/**
 * Does a yarn check on node_modules, and if it is outdated, runs yarn.
 */
function runYarnCheck() {
  const integrityCmd = yarnExecutable + ' check --integrity';
  if (getStderr(integrityCmd).trim() != '') {
    log(colors.yellow('WARNING:'), 'The packages in',
        colors.cyan('node_modules'), 'do not match',
        colors.cyan('package.json.'));
    const verifyTreeCmd = yarnExecutable + ' check --verify-tree';
    exec(verifyTreeCmd);
    log('Running', colors.cyan('yarn'), 'to update packages...');
    execOrDie(yarnExecutable); // Stop execution when Ctrl + C is detected.
  } else {
    log(colors.green('All packages in'),
        colors.cyan('node_modules'), colors.green('are up to date.'));
  }
}

/**
 * Installs custom lint rules, updates node_modules (for local dev), and patches
 * web-animations-js and document-register-element if necessary.
 */
function updatePackages() {
  installCustomEslintRules();
  if (!process.env.TRAVIS) {
    runYarnCheck();
  }
  patchWebAnimations();
  patchRegisterElement();
}

gulp.task(
    'update-packages',
    'Runs yarn if node_modules is out of date, and patches web-animations-js',
    updatePackages
);
