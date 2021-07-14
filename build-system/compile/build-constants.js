/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
const argv = require('minimist')(process.argv.slice(2));
const {VERSION} = require('./internal-version');

const testTasks = ['e2e', 'integration', 'visual-diff', 'unit', 'check-types'];
const isTestTask = testTasks.some((task) => argv._.includes(task));
const isForTesting = argv.fortesting || isTestTask;
const isMinified = argv._.includes('dist') || !!argv.compiled;

/**
 * Build time constants. Used by babel but hopefully one day directly by the bundlers..
 *
 * TODO: move constant replacement to bundlers once either https://github.com/google/closure-compiler/issues/1601
 *       is resolved, or we switch to using a different bundler.
 *
 * @type {Object<string, boolean|string>}
 */
const BUILD_CONSTANTS = {
  IS_FORTESTING: `${isForTesting}`,
  IS_MINIFIED: `${isMinified}`,
  INTERNAL_RUNTIME_VERSION: isTestTask
    ? '$internalRuntimeVersion$'
    : `'${VERSION}'`,

  // We build on the idea that SxG is an upgrade to the ESM build.
  // Therefore, all conditions set by ESM will also hold for SxG.
  // However, we will also need to introduce a separate IS_SxG flag
  // for conditions only true for SxG.
  IS_ESM: `${!!(argv.esm || argv.sxg)}`,
  IS_SXG: `${!!argv.sxg}`,
};

module.exports = {BUILD_CONSTANTS};
