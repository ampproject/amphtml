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
const {VERSION: internalRuntimeVersion} = require('./internal-version');

const isCheckTypes = argv._.includes('check-types');
const version =
  process.env.JEST_WORKER_ID !== undefined
    ? 'transform-version-call'
    : internalRuntimeVersion;

/**
 * Build time constants. Used by babel but hopefully one day directly by the bundlers..
 * TODO: move to bundlers once https://github.com/google/closure-compiler/issues/1601 is resolved.
 *
 * @type {Object<string, boolean|string>}
 */
const BUILD_CONSTANTS = {
  IS_FORTESTING: !!(argv.fortesting || isCheckTypes),
  IS_MINIFIED: !!argv.compiled,
  VERSION: version,
  '$internalRuntimeVersion$': internalRuntimeVersion,

  // We build on the idea that SxG is an upgrade to the ESM build.
  // Therefore, all conditions set by ESM will also hold for SxG.
  // However, we will also need to introduce a separate IS_SxG flag
  // for conditions only true for SxG.
  IS_ESM: !!(argv.esm || argv.sxg),
  IS_SXG: !!argv.sxg,
};

module.exports = {BUILD_CONSTANTS};
