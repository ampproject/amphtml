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
 * Patches Web Animations API by wrapping its body into `install` function.
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
  file = file.replace(/requestAnimationFrame/g, function(a, b) {
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

function patchPreact() {
  const filePath = 'node_modules/preact/dist/preact.module.js';
  const patchedPath = 'node_modules/preact/dist/preact.module.patched.js';
  const pkgPath = 'node_modules/preact/package.json';
  let contents = fs.readFileSync(filePath, 'utf8');

  /*
  export {
    E as render,
    H as hydrate,
    h as createElement,
    h,
    y as Fragment,
    p as createRef,
    l as isValidElement,
    d as Component,
    I as cloneElement,
    L as createContext,
    b as toChildArray,
    A as _unmount,
    n as options
  };
  */
  const typings = new Map([
    [
      /function h\((\w),(\w),(\w)\)/g,
      `/**
        * preact.createElement
        * @param {!preact.FunctionalComponent|string} $1
        * @param {(!Object|null)=} $2
        * @param {...*} $3
        * @return {!preact.VNode}
        */
       function h($1,$2,$3)`,
    ],
    [
      /function E\((\w),(\w),(\w)\)/g,
      `/**
        * preact.render
        * @param {!preact.VNode} $1
        * @param {Node} $2
        * @param {*} $3
        */
        function E($1,$2,$3)`,
    ],
    [
      /function y\((\w)\)/g,
      `/**
        * preact.Fragment
        * @param {!JsonObject} $1
        * @return {!preact.VNode|null}
        */
        function y($1)`,
    ],
    [
      /function L\((\w)\)/g,
      `/**
        * preact.createContext
        * @param {!Object} $1
        * @return {!preact.Context}
        */
        function L($1)`,
    ],
  ]);

  for (const [search, replacement] of typings) {
    if (!search.test(contents)) {
      throw new Error(`Failed to find ${search} in preact module`);
    }
    if (search.test(contents)) {
      throw new Error(`Found multiple ${search} in preact module`);
    }

    contents = contents.replace(search, replacement);
  }

  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkgJson.module = 'dist/preact.module.patched.js';

  writeIfUpdated(patchedPath, contents);
  writeIfUpdated(pkgPath, JSON.stringify(pkgJson, null, 4));
}

function patchPreactHooks() {
  const filePath = 'node_modules/preact/hooks/dist/hooks.module.js';
  const patchedPath = 'node_modules/preact/hooks/dist/hooks.module.patched.js';
  const pkgPath = 'node_modules/preact/hooks/package.json';
  let contents = fs.readFileSync(filePath, 'utf8');

  /*
  export {
    v as useState,
    m as useReducer,
    p as useEffect,
    l as useLayoutEffect,
    d as useRef,
    s as useImperativeHandle,
    y as useMemo,
    T as useCallback,
    w as useContext,
    A as useDebugValue,
    F as useErrorBoundary
  };
  */
  const typings = new Map([
    [
      /function d\((\w)\)/g,
      `/**
        * hooks.useRef
        * @param {*=} $1
        * @return {{current: *}}
        */
       function d($1)`,
    ],
    [
      /function p\((\w),(\w)\)/g,
      `/**
        * hooks.useEffect
        * @param {function():(function()|undefined)} $1
        * @param {!Array<*>=} $2
        */
       function p($1,$2)`,
    ],
    [
      /function l\((\w),(\w)\)/g,
      `/**
        * hooks.useLayoutEffect
        * @param {function():(function()|undefined)} $1
        * @param {!Array<*>=} $2
        */
       function l($1,$2)`,
    ],
  ]);

  for (const [search, replacement] of typings) {
    if (!search.test(contents)) {
      throw new Error(`Failed to find ${search} in preact/hooks module`);
    }
    if (search.test(contents)) {
      throw new Error(`Found multiple ${search} in preact/hooks module`);
    }

    contents = contents.replace(search, replacement);
  }

  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkgJson.module = 'dist/hooks.module.patched.js';

  writeIfUpdated(patchedPath, contents);
  writeIfUpdated(pkgPath, JSON.stringify(pkgJson, null, 4));
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
 * web-animations-js if necessary.
 */
async function updatePackages() {
  if (!isTravisBuild()) {
    runYarnCheck();
  }
  patchWebAnimations();
  patchPreact();
  patchPreactHooks();
}

module.exports = {
  maybeUpdatePackages,
  updatePackages,
};

updatePackages.description =
  'Runs yarn if node_modules is out of date, and applies custom patches';
