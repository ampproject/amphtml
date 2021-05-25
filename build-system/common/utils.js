/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
const experimentsConfig = require('../global-configs/experiments-config.json');
const fs = require('fs-extra');
const globby = require('globby');
const {clean} = require('../tasks/clean');
const {cyan, green, red, yellow} = require('./colors');
const {default: ignore} = require('ignore');
const {doBuild} = require('../tasks/build');
const {doDist} = require('../tasks/dist');
const {gitDiffNameOnlyMain} = require('./git');
const {log, logLocalDev} = require('./logging');

/**
 * Performs a clean build of the AMP runtime in testing mode.
 * Used by `amp e2e|integration|visual_diff`.
 *
 * @param {boolean} opt_compiled pass true to build the compiled runtime
 *   (`amp dist` instead of `amp build`). Otherwise uses the value of
 *   --compiled to determine which build to generate.
 */
async function buildRuntime(opt_compiled = false) {
  await clean();
  if (argv.compiled || opt_compiled === true) {
    await doDist({fortesting: true});
  } else {
    await doBuild({fortesting: true});
  }
}

/**
 * Extracts and validates the config for the given experiment.
 * @param {string} experiment
 * @return {?Object}
 */
function getExperimentConfig(experiment) {
  const config = experimentsConfig[experiment];
  const valid =
    config?.name &&
    config?.define_experiment_constant &&
    config?.expiration_date_utc &&
    new Number(new Date(config.expiration_date_utc)) >= Date.now();
  return valid ? config : null;
}

/**
 * Returns the names of all valid experiments.
 * @return {!Array<string>}
 */
function getValidExperiments() {
  return Object.keys(experimentsConfig).filter(getExperimentConfig);
}

/**
 * Gets the list of files changed on the current branch that match the given
 * array of glob patterns using the given options.
 *
 * @param {!Array<string>} globs
 * @param {!Object} options
 * @return {!Array<string>}
 */
function getFilesChanged(globs, options) {
  const allFiles = globby.sync(globs, options);
  return gitDiffNameOnlyMain().filter((changedFile) => {
    return fs.existsSync(changedFile) && allFiles.includes(changedFile);
  });
}

/**
 * Logs the list of files that will be checked and returns the list.
 *
 * @param {!Array<string>} files
 * @return {!Array<string>}
 */
function logFiles(files) {
  logLocalDev(green('INFO: ') + 'Checking the following files:');
  for (const file of files) {
    logLocalDev(cyan(file));
  }
  return files;
}

/**
 * Extracts the list of files from argv.files. Throws an error if no matching
 * files were found.
 *
 * @return {Array<string>}
 */
function getFilesFromArgv() {
  if (!argv.files) {
    return [];
  }
  // TODO(#30223): globby only takes posix globs. Find a Windows alternative.
  const toPosix = (str) => str.replace(/\\\\?/g, '/');
  const globs = Array.isArray(argv.files) ? argv.files : argv.files.split(',');
  const allFiles = [];
  for (const glob of globs) {
    const files = globby.sync(toPosix(glob.trim()));
    if (files.length == 0) {
      log(red('ERROR:'), 'Argument', cyan(glob), 'matched zero files.');
      throw new Error('Argument matched zero files.');
    }
    allFiles.push(...files);
  }
  return allFiles;
}

/**
 * Gets a list of files to be checked based on command line args and the given
 * file matching globs. Used by tasks like prettify, lint, check-links, etc.
 * Optionally takes in options for globbing and a file containing ignore rules.
 *
 * @param {!Array<string>} globs
 * @param {Object=} options
 * @param {string=} ignoreFile
 * @return {!Array<string>}
 */
function getFilesToCheck(globs, options = {}, ignoreFile = undefined) {
  const ignored = ignore();
  if (ignoreFile) {
    const ignoreRules = fs.readFileSync(ignoreFile, 'utf8');
    ignored.add(ignoreRules);
  }
  if (argv.files) {
    return logFiles(ignored.filter(getFilesFromArgv()));
  }
  if (argv.local_changes) {
    const filesChanged = ignored.filter(getFilesChanged(globs, options));
    if (filesChanged.length == 0) {
      log(green('INFO: ') + 'No files to check in this PR');
      return [];
    }
    return logFiles(filesChanged);
  }
  return ignored.filter(globby.sync(globs, options));
}

/**
 * Ensures that a target is only called with `--files` or `--local_changes`
 *
 * @param {string} taskName name of the amp task.
 * @return {boolean} if the use is valid.
 */
function usesFilesOrLocalChanges(taskName) {
  const validUsage = argv.files || argv.local_changes;
  if (!validUsage) {
    log(
      yellow('NOTE 1:'),
      'It is infeasible for',
      cyan(`amp ${taskName}`),
      'to check all files in the repo at once.'
    );
    log(
      yellow('NOTE 2:'),
      'Please run',
      cyan(`amp ${taskName}`),
      'with',
      cyan('--files'),
      'or',
      cyan('--local_changes') + '.'
    );
  }
  return validUsage;
}

module.exports = {
  buildRuntime,
  getExperimentConfig,
  getValidExperiments,
  getFilesFromArgv,
  getFilesToCheck,
  usesFilesOrLocalChanges,
};
