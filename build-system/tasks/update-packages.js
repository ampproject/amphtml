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
const log = require('fancy-log');
const {exec, execOrDie, getStderr} = require('../common/exec');
const {isTravisBuild} = require('../common/travis');

const yarnExecutable = 'npx yarn';

/**
 * Writes the given contents to the patched file if updated
 * @param {string} patchedName Name of patched file
 * @param {string} file Contents to write
 */
function writeIfUpdated(patchedName, file) {
  if (!fs.existsSync(patchedName) || fs.readFileSync(patchedName) != file) {
    fs.writeFileSync(patchedName, file);
    if (!isTravisBuild()) {
      log(colors.green('Patched'), colors.cyan(patchedName));
    }
  }
}

/**
 * Patches Web Animations polyfill by wrapping its body into `install` function.
 * This gives us an option to call polyfill directly on the main window
 * or a friendly iframe.
 */
function patchWebAnimations() {
  // Copies web-animations-js into a new file that has an export.
  const patchedName =
    'node_modules/web-animations-js/web-animations.install.js';
  let file = fs
    .readFileSync('node_modules/web-animations-js/web-animations.min.js')
    .toString();
  // Replace |requestAnimationFrame| with |window|.
  file = file.replace(/requestAnimationFrame/g, function (a, b) {
    if (file.charAt(b - 1) == '.') {
      return a;
    }
    return 'window.' + a;
  });
  // Fix web-animations-js code that violates strict mode.
  // See https://github.com/ampproject/amphtml/issues/18612 and
  // https://github.com/web-animations/web-animations-js/issues/46
  file = file.replace(/b.true=a/g, 'b?b.true=a:true');

  // Fix web-animations-js code that attempts to write a read-only property.
  // See https://github.com/ampproject/amphtml/issues/19783 and
  // https://github.com/web-animations/web-animations-js/issues/160
  file = file.replace(/this\._isFinished\s*=\s*\!0,/, '');

  // Wrap the contents inside the install function.
  file =
    'export function installWebAnimations(window) {\n' +
    'var document = window.document;\n' +
    file +
    '\n' +
    '}\n';
  writeIfUpdated(patchedName, file);
}

/**
 * Patches Intersection Observer polyfill by wrapping its body into `install`
 * function.
 * This gives us an option to control when and how the polyfill is installed.
 * The polyfill can only be installed on the root context.
 */
function patchIntersectionObserver() {
  // Copies intersection-observer into a new file that has an export.
  const patchedName =
    'node_modules/intersection-observer/intersection-observer.install.js';
  let file = fs
    .readFileSync('node_modules/intersection-observer/intersection-observer.js')
    .toString();

  // Wrap the contents inside the install function.
  file = `export function installIntersectionObserver() {\n${file}\n}\n`;
  writeIfUpdated(patchedName, file);
}

/**
 * TODO(samouri): remove this patch when a better fix is upstreamed (https://github.com/jakubroztocil/rrule/pull/410).
 *
 * Patches rrule to remove references to luxon. Even though rrule marks luxon as an optional dependency,
 * it is used as if it's a required one (static import). rrule relies on its consumers either
 * installing luxon or adding it as a webpack-style external. We don't want the former and
 * can't yet do the latter.
 *
 * This function replaces the reference to luxon with a mock that throws (which the code handles well).
 */
function patchRRule() {
  const path = 'node_modules/rrule/dist/es5/rrule.min.js';
  const patchedContents = fs
    .readFileSync(path)
    .toString()
    .replace(
      /require\("luxon"\)/g,
      `{ DateTime: { fromJSDate() { throw TypeError() } } }`
    );

  writeIfUpdated(path, patchedContents);
}

/**
 * Does a yarn check on node_modules, and if it is outdated, runs yarn.
 */
function runYarnCheck() {
  const integrityCmd = yarnExecutable + ' check --integrity';
  if (getStderr(integrityCmd).trim() != '') {
    log(
      colors.yellow('WARNING:'),
      'The packages in',
      colors.cyan('node_modules'),
      'do not match',
      colors.cyan('package.json.')
    );
    const verifyTreeCmd = yarnExecutable + ' check --verify-tree';
    exec(verifyTreeCmd);
    log('Running', colors.cyan('yarn'), 'to update packages...');
    /**
     * NOTE: executing yarn with --production=false prevents having
     * NODE_ENV=production variable set which forces yarn to not install
     * devDependencies. This usually breaks gulp for example.
     */
    execOrDie(`${yarnExecutable} install --production=false`); // Stop execution when Ctrl + C is detected.
  } else {
    log(
      colors.green('All packages in'),
      colors.cyan('node_modules'),
      colors.green('are up to date.')
    );
  }
}

/**
 * Used as a pre-requisite by several gulp tasks.
 */
function maybeUpdatePackages() {
  if (!isTravisBuild()) {
    updatePackages();
  }
}

/**
 * Installs custom lint rules, updates node_modules (for local dev), and patches
 * polyfills if necessary.
 */
async function updatePackages() {
  if (!isTravisBuild()) {
    runYarnCheck();
  }
  patchWebAnimations();
  patchIntersectionObserver();
  patchRRule();
}

module.exports = {
  maybeUpdatePackages,
  updatePackages,
};

updatePackages.description =
  'Runs yarn if node_modules is out of date, and applies custom patches';
