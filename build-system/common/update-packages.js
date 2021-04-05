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

const checkDependencies = require('check-dependencies');
const del = require('del');
const fs = require('fs-extra');
const path = require('path');
const {cyan, red} = require('kleur/colors');
const {execOrDie} = require('./exec');
const {getOutput} = require('./process');
const {isCiBuild} = require('./ci');
const {log, logLocalDev} = require('./logging');

/**
 * Writes the given contents to the patched file if updated
 * @param {string} patchedName Name of patched file
 * @param {string} file Contents to write
 */
function writeIfUpdated(patchedName, file) {
  if (!fs.existsSync(patchedName) || fs.readFileSync(patchedName) != file) {
    fs.writeFileSync(patchedName, file);
    logLocalDev('Patched', cyan(patchedName));
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
 * Patches Resize Observer polyfill by wrapping its body into `install`
 * function.
 * This gives us an option to control when and how the polyfill is installed.
 * The polyfill can only be installed on the root context.
 */
function patchResizeObserver() {
  // Copies intersection-observer into a new file that has an export.
  const patchedName =
    'node_modules/resize-observer-polyfill/ResizeObserver.install.js';
  let file = fs
    .readFileSync(
      'node_modules/resize-observer-polyfill/dist/ResizeObserver.js'
    )
    .toString();

  // Wrap the contents inside the install function.
  file = `export function installResizeObserver(global) {\n${file}\n}\n`
    // For some reason Closure fails on this three lines. Babel is fine.
    .replace(
      "typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :",
      ''
    )
    .replace(
      "typeof define === 'function' && define.amd ? define(factory) :",
      ''
    )
    .replace('}(this, (function () {', '}(global, (function () {');
  writeIfUpdated(patchedName, file);
}

/**
 * Patches Shadow DOM polyfill by wrapping its body into `install`
 * function.
 * This gives us an option to control when and how the polyfill is installed.
 * The polyfill can only be installed on the root context.
 */
function patchShadowDom() {
  // Copies webcomponents-sd into a new file that has an export.
  const patchedName =
    'node_modules/@webcomponents/webcomponentsjs/bundles/webcomponents-sd.install.js';

  let file = '(function() {';
  // HTMLElement is replaced, but the original needs to be used for the polyfill
  // since it manipulates "own" properties. See `src/polyfills/custom-element.js`.
  file += 'var HTMLElementOrig = window.HTMLElementOrig || window.HTMLElement;';
  file += 'window.HTMLElementOrig = HTMLElementOrig;';
  file += `
    (function() {
      var origContains = document.contains;
      if (origContains) {
        Object.defineProperty(document, '__shady_native_contains', {value: origContains});
      }
      Object.defineProperty(document, 'contains', {
        configurable: true,
        value: function(node) {
          if (node === this) {
            return true;
          }
          if (this.documentElement) {
            return this.documentElement.contains(node);
          }
          return false;
        }
      });
    })();
  `;

  /**
   * @param {string} file
   * @return {string}
   */
  function transformScript(file) {
    // Use the HTMLElement from above.
    file = file.replace(/\bHTMLElement\b/g, 'HTMLElementOrig');
    return file;
  }

  // Relevant DOM polyfills
  file += transformScript(
    fs
      .readFileSync(
        'node_modules/@webcomponents/webcomponentsjs/bundles/webcomponents-pf_dom.js'
      )
      .toString()
  );
  file += transformScript(
    fs
      .readFileSync(
        'node_modules/@webcomponents/webcomponentsjs/bundles/webcomponents-sd.js'
      )
      .toString()
  );
  file += '})();';

  // ESM binaries fail on this expression.
  file = file.replace(
    '"undefined"!=typeof window&&window===this?this:"undefined"!=typeof global&&null!=global?global:this',
    'window'
  );
  // Disable any integration with CE.
  file = file.replace(/window\.customElements/g, 'window.__customElements');

  writeIfUpdated(patchedName, file);
}

function patchPreact() {
  fs.ensureDirSync('node_modules/preact/dom');
  const file = `export { render, hydrate } from 'preact';`;
  writeIfUpdated('node_modules/preact/dom/index.js', file);
}

/**
 * Deletes the map file for rrule, which breaks closure compiler.
 * TODO(rsimha): Remove this workaround after a fix is merged for
 * https://github.com/google/closure-compiler/issues/3720.
 */
function removeRruleSourcemap() {
  const rruleMapFile = 'node_modules/rrule/dist/es5/rrule.js.map';
  if (fs.existsSync(rruleMapFile)) {
    del.sync(rruleMapFile);
    logLocalDev('Deleted', cyan(rruleMapFile));
  }
}

/**
 * Checks if all packages are current, and if not, runs `npm install`.
 */
function updateDeps() {
  const results = checkDependencies.sync({
    verbose: true,
    log: () => {},
    error: console.log,
  });
  if (results.depsWereOk) {
    logLocalDev('All packages in', cyan('node_modules'), 'are up to date.');
  } else {
    log('Running', cyan('npm install') + '...');
    execOrDie('npm install');
  }
}

/**
 * Updates `npm` packages and applies various custom patches when necessary.
 * Work is done only during first time install and soon after a repo sync.
 * At all other times, this function is a no-op and returns almost instantly.
 */
async function updatePackages() {
  updateDeps();
  patchWebAnimations();
  patchIntersectionObserver();
  patchResizeObserver();
  patchShadowDom();
  patchPreact();
  removeRruleSourcemap();
}

/**
 * Update packages in a given task directory. Some notes:
 * - During CI, do a clean install.
 * - During local development, do an incremental install if necessary.
 * - Since install scripts can be async, `await` the process object.
 * - Since script output is noisy, capture and print the stderr if needed.
 *
 * @param {string} dir
 * @return {Promise<void>}
 */
async function updateSubpackages(dir) {
  const results = checkDependencies.sync({packageDir: dir});
  const relativeDir = path.relative(process.cwd(), dir);
  if (results.depsWereOk) {
    const nodeModulesDir = path.join(relativeDir, 'node_modules');
    logLocalDev('All packages in', cyan(nodeModulesDir), 'are up to date.');
  } else {
    const installCmd = isCiBuild() ? 'npm ci' : 'npm install';
    log('Running', cyan(installCmd), 'in', cyan(relativeDir) + '...');
    const output = await getOutput(`${installCmd} --prefix ${dir}`);
    if (output.status !== 0) {
      log(red('ERROR:'), output.stderr);
      throw new Error('Installation failed');
    }
  }
}

module.exports = {
  updatePackages,
  updateSubpackages,
};
