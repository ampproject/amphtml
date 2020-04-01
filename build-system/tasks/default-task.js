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
const {bootstrapThirdPartyFrames, printConfigHelp} = require('./helpers');
const {compileCss} = require('./css');
const {compileJison} = require('./compile-jison');
const {copyCss, copyParsers} = require('./dist');
const {createCtrlcHandler} = require('../common/ctrlcHandler');
const {cyan, green} = require('ansi-colors');
const {doServe} = require('./serve');
const {maybeUpdatePackages} = require('./update-packages');
const {parseExtensionFlags} = require('./extension-helpers');

const argv = require('minimist')(process.argv.slice(2));

/**
 * Prints a useful help message prior to the default gulp task
 */
function printDefaultTaskHelp() {
  log(green('Running the default ') + cyan('gulp ') + green('task.'));
  log(
    green(
      '⤷ JS and extensions will be lazily built when requested from the server.'
    )
  );
}

/**
 * The default task run when `gulp` is executed
 *
 * @return {!Promise}
 */
async function defaultTask() {
  maybeUpdatePackages();
  createCtrlcHandler('gulp');
  process.env.NODE_ENV = 'development';
  printConfigHelp('gulp');
  printDefaultTaskHelp();
  parseExtensionFlags(/* preBuild */ true);
  await compileCss(/* watch */ true);
  await compileJison();
  if (argv.compiled) {
    await copyCss();
    await copyParsers();
  }
  await bootstrapThirdPartyFrames(/* watch */ true);
  await doServe(/* lazyBuild */ true);
  log(green('JS and extensions will be lazily built when requested...'));
}

module.exports = {
  defaultTask,
};

/* eslint "google-camelcase/google-camelcase": 0 */

defaultTask.description =
  'Starts the dev server, lazily builds JS and extensions when requested, and watches them for changes';
defaultTask.flags = {
  compiled: '  Compiles and serves minified binaries',
  config: '  Sets the runtime\'s AMP_CONFIG to one of "prod" or "canary"',
  closure_concurrency: '  Sets the number of concurrent invocations of closure',
  extensions: '  Pre-builds the given extensions, lazily builds the rest.',
  extensions_from:
    '  Pre-builds the extensions used by the provided example page.',
  version_override: '  Overrides the version written to AMP_CONFIG',
  custom_version_mark: '  Set final digit (0-9) on auto-generated version',
};
