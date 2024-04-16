'use strict';

const checkDependencies = require('check-dependencies');
const fs = require('fs-extra');
const path = require('path');
const {cyan, red} = require('kleur/colors');
const {execOrDie} = require('./exec');
const {getOutput} = require('./process');
const {isCiBuild} = require('./ci');
const {log, logLocalDev} = require('./logging');
const {runNpmChecks} = require('./npm-checks');

/**
 * Writes the given contents to the patched file if updated
 * @param {string} patchedName Name of patched file
 * @param {string} file Contents to write
 */
function writeIfUpdated(patchedName, file) {
  if (
    !fs.existsSync(patchedName) ||
    fs.readFileSync(patchedName, 'utf8') != file
  ) {
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
    log('All packages in', cyan('node_modules'), 'are up to date.');
  } else {
    log('Running', cyan('npm install') + '...');
    execOrDie('npm install');
  }
}

/**
 * This function updates repo root packages.
 *
 * 1. Update root-level packages if necessary.
 * 2. Apply various custom patches if not already applied.
 * 3. During CI, make sure that the root package files were correctly updated.
 *
 * During local development, work is done only during first time install and
 * soon after a repo sync. At all other times, this function is a no-op and
 * returns almost instantly.
 */
function updatePackages() {
  updateDeps();
  patchWebAnimations();
  patchIntersectionObserver();
  patchResizeObserver();
  patchShadowDom();
  if (isCiBuild()) {
    runNpmChecks();
  }
}

/**
 * This function updates the packages in a given task directory.
 *
 * 1. During CI, do a clean install.
 * 2. During local development, do an incremental install if necessary.
 * 3. Since script output is noisy, capture and print the stderr if needed.
 * 4. During CI, if not skipped, ensure package files were correctly updated.
 *
 * @param {string} dir
 * @param {boolean=} skipNpmChecks
 */
function updateSubpackages(dir, skipNpmChecks = false) {
  const results = checkDependencies.sync({packageDir: dir});
  const relativeDir = path.relative(process.cwd(), dir);
  if (results.depsWereOk) {
    const nodeModulesDir = path.join(relativeDir, 'node_modules');
    log('All packages in', cyan(nodeModulesDir), 'are up to date.');
  } else {
    const installCmd = isCiBuild() ? 'npm ci' : 'npm install';
    log('Running', cyan(installCmd), 'in', cyan(relativeDir) + '...');
    const output = getOutput(`${installCmd} --prefix ${dir}`);
    if (output.status !== 0) {
      log(red('ERROR:'), output.stderr);
      throw new Error('Installation failed');
    }
  }
  if (isCiBuild() && !skipNpmChecks) {
    runNpmChecks(dir);
  }
}

module.exports = {
  updatePackages,
  updateSubpackages,
};
