/**
 * @fileoverview This file implements the `amp prettify` task, which uses
 * prettier to check (and optionally fix) the formatting in a variety of
 * non-JS files in the repo. (JS files are separately checked by `amp lint`,
 * which uses eslint.)
 */
'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs-extra');
const path = require('path');
const prettier = require('prettier');
const tempy = require('tempy');
const {
  log,
  logLocalDev,
  logOnSameLine,
  logOnSameLineLocalDev,
  logWithoutTimestamp,
} = require('../common/logging');
const {cyan, green, red, yellow} = require('kleur/colors');
const {exec} = require('../common/exec');
const {getFilesToCheck} = require('../common/utils');
const {prettifyGlobs} = require('../test-configs/config');

const rootDir = path.dirname(path.dirname(__dirname));
const tempDir = tempy.directory();

/**
 * Checks files for formatting (and optionally fixes them) with Prettier.
 * Explicitly makes sure the API doesn't check files in `.prettierignore`.
 * @return {Promise<void>}
 */
async function prettify() {
  const filesToCheck = getFilesToCheck(
    prettifyGlobs,
    {dot: true},
    '.prettierignore'
  );
  if (filesToCheck.length == 0) {
    return;
  }
  await runPrettify(filesToCheck);
}

/**
 * Resolves the prettier config for the given file
 * @param {string} file
 * @return {Promise<Object>}
 */
async function getOptions(file) {
  const config = await prettier.resolveConfig(file);
  return {filepath: file, ...config};
}

/**
 * Prints an error message with recommended fixes (in diff form) for a file with
 * formatting errors.
 *
 * @param {string} file
 * @return {Promise<void>}
 */
async function printErrorWithSuggestedFixes(file) {
  logWithoutTimestamp('\n');
  log(`Suggested fixes for ${cyan(file)}:`);
  const options = await getOptions(file);
  const original = fs.readFileSync(file).toString();
  const fixed = await prettier.format(original, options);
  const fixedFile = `${tempDir}/${file}`;
  fs.ensureDirSync(path.dirname(fixedFile));
  fs.writeFileSync(fixedFile, fixed);
  const diffCmd = `git -c color.ui=always diff -U0 ${file} ${fixedFile} | tail -n +5`;
  exec(diffCmd);
}

/**
 * Prints instructions for how to auto-fix errors.
 */
function printFixMessages() {
  log(
    yellow('NOTE 1:'),
    "If you are using GitHub's web-UI to edit files,",
    'copy the suggested fixes printed above into your PR.'
  );
  log(
    yellow('NOTE 2:'),
    'If you are using the git command-line workflow, run',
    cyan('amp prettify --local_changes --fix'),
    'from your local branch.'
  );
  log(
    yellow('NOTE 3:'),
    'Since this is a destructive operation (that edits your files',
    'in-place), make sure you commit before running the command.'
  );
  log(
    yellow('NOTE 4:'),
    'For more information, read',
    cyan(
      'https://github.com/ampproject/amphtml/blob/main/docs/getting-started-e2e.md#code-quality-and-style\n'
    )
  );
}

/**
 * Prettifies on the given list of files.
 * @param {!Array<string>} filesToCheck
 * @return {Promise<void>}
 */
async function runPrettify(filesToCheck) {
  logLocalDev(green('Starting checks...'));
  const filesWithErrors = [];
  for (const file of filesToCheck) {
    const options = await getOptions(file);
    const original = fs.readFileSync(file).toString();
    if (argv.fix) {
      const fixed = await prettier.format(original, options);
      if (fixed != original) {
        fs.writeFileSync(file, fixed);
      }
      if (!prettier.check(fixed, options)) {
        filesWithErrors.push(file);
      }
    } else {
      if (!prettier.check(original, options)) {
        filesWithErrors.push(file);
      }
    }
    logOnSameLineLocalDev(green('Checked: ') + path.relative(rootDir, file));
  }
  if (filesWithErrors.length) {
    logOnSameLine(
      red('ERROR:'),
      'Found formatting errors in one or more files'
    );
    for (const file of filesWithErrors) {
      await printErrorWithSuggestedFixes(file);
    }
    printFixMessages();
    process.exitCode = 1;
  }
  logOnSameLineLocalDev('Checked ' + cyan(filesToCheck.length) + ' file(s)');
}

module.exports = {
  prettify,
};

prettify.description =
  'Check several non-JS files in the repo for formatting using prettier';
prettify.flags = {
  'files': 'Check only the specified files',
  'local_changes': 'Check just the files changed in the local branch',
  'fix': 'Fix all auto-fixable formatting errors',
};
