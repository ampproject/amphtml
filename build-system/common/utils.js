const argv = require('minimist')(process.argv.slice(2));
const experimentsConfig = require('../global-configs/experiments-config.json');
const fastGlob = require('fast-glob');
const fs = require('fs-extra');
const {clean} = require('../tasks/clean');
const {cyan, green, red, yellow} = require('kleur/colors');
const {default: ignore} = require('ignore');
const {execOrDie} = require('./exec');
const {gitDiffNameOnlyMain} = require('./git');
const {log, logLocalDev} = require('./logging');

/**
 * Performs a clean build of the AMP runtime in testing mode.
 * Used by `amp e2e|integration|visual-diff`.
 *
 * @param {boolean} opt_minified builds the minified runtime
 * @return {Promise<void>}
 */
async function buildRuntime(opt_minified = false) {
  await clean();
  if (argv.minified || opt_minified === true) {
    execOrDie(`amp dist --fortesting`);
  } else {
    execOrDie(`amp build --fortesting`);
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
 * Gets the list of files changed on the current branch that match the given
 * array of glob patterns using the given options.
 *
 * @param {!Array<string>} globs
 * @param {!Object} options
 * @return {!Array<string>}
 */
function getFilesChanged(globs, options) {
  const allFiles = fastGlob.sync(globs, options).map(String);
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
  const toPosix = (str) => str.replace(/\\\\?/g, '/');
  const globs = Array.isArray(argv.files) ? argv.files : argv.files.split(',');
  const allFiles = [];
  for (const glob of globs) {
    const files = fastGlob.sync(toPosix(glob.trim()));
    if (files.length == 0) {
      log(red('ERROR:'), 'Argument', cyan(glob), 'matched zero files.');
      throw new Error('Argument matched zero files.');
    }
    allFiles.push(...files);
  }
  return allFiles;
}

/**
 * Returns list of files in the comma-separated file named at --filelist.
 *
 * @return {Array<string>}
 */
function getFilesFromFileList() {
  if (!argv.filelist) {
    return [];
  }
  return fs.readFileSync(argv.filelist, 'utf8').trim().split(',');
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
  return ignored.filter(fastGlob.sync(globs, options).map(String));
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
  getFilesFromArgv,
  getFilesFromFileList,
  getFilesToCheck,
  usesFilesOrLocalChanges,
};
