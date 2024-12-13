'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const {
  log,
  logLocalDev,
  logOnSameLine,
  logOnSameLineLocalDev,
} = require('../common/logging');
const {cyan, green, red, yellow} = require('kleur/colors');
const {ESLint} = require('eslint');
const {getFilesToCheck} = require('../common/utils');
const {lintGlobs} = require('../test-configs/config');

/** @type {ESLint.Options} */
const options = {
  fix: argv.fix,
  reportUnusedDisableDirectives: 'error',
};

/**
 * Runs the linter on the given set of files.
 * @param {Array<string>} filesToLint
 * @return {Promise<void>}
 */
async function runLinter(filesToLint) {
  logLocalDev(green('Starting linter...'));
  const eslint = new ESLint(options);
  const results = {
    errorCount: 0,
    warningCount: 0,
  };
  const fixedFiles = {};
  for (const file of filesToLint) {
    const text = fs.readFileSync(file, 'utf-8');
    const lintResult = await eslint.lintText(text, {filePath: file});
    const result = lintResult[0];
    if (!result) {
      continue; // File was ignored
    }
    results.errorCount += result.errorCount;
    results.warningCount += result.warningCount;
    const formatter = await eslint.loadFormatter('stylish');
    const resultText = (await formatter.format(lintResult))
      .replace(`${process.cwd()}/`, '')
      .trim();
    if (resultText.length) {
      logOnSameLine(resultText);
    }
    if (argv.fix) {
      await ESLint.outputFixes(lintResult);
    }
    logOnSameLineLocalDev(green('Linted: ') + file);
    if (options.fix && result.output) {
      const status =
        result.errorCount == 0 ? green('Fixed: ') : yellow('Partially fixed: ');
      logOnSameLine(status + cyan(file));
      fixedFiles[file] = status;
    }
  }
  summarizeResults(results, fixedFiles);
}

/**
 * Summarize the results of linting all files.
 * @param {object} results
 * @param {object} fixedFiles
 */
function summarizeResults(results, fixedFiles) {
  const {errorCount, warningCount} = results;
  if (errorCount == 0 && warningCount == 0) {
    logOnSameLineLocalDev(green('SUCCESS:'), 'No linter warnings or errors.');
  } else {
    const prefix = errorCount == 0 ? yellow('WARNING: ') : red('ERROR: ');
    logOnSameLine(
      prefix +
        'Found ' +
        errorCount +
        ' error(s) and ' +
        warningCount +
        ' warning(s).'
    );
    if (!options.fix) {
      log(
        yellow('NOTE 1:'),
        'You may be able to automatically fix some of these warnings ' +
          '/ errors by running',
        cyan('amp lint --local_changes --fix'),
        'from your local branch.'
      );
      log(
        yellow('NOTE 2:'),
        'Since this is a destructive operation (that edits your files',
        'in-place), make sure you commit before running the command.'
      );
      log(
        yellow('NOTE 3:'),
        'If you see any',
        cyan('prettier/prettier'),
        'errors, read',
        cyan(
          'https://github.com/ampproject/amphtml/blob/main/docs/getting-started-e2e.md#code-quality-and-style'
        )
      );
    }
    process.exitCode = 1;
  }
  if (options.fix && Object.keys(fixedFiles).length > 0) {
    log(green('INFO:'), 'Summary of fixes:');
    Object.keys(fixedFiles).forEach((file) => {
      log(fixedFiles[file] + cyan(file));
    });
  }
}

/**
 * Checks files for formatting (and optionally fixes them) with Eslint.
 * Explicitly makes sure the API doesn't check files in `.eslintignore`.
 * When local changes are linted (e.g. during CI), we also check if the list of
 * forbidden terms needs to be updated.
 * @return {Promise<void>}
 */
async function lint() {
  const filesToCheck = getFilesToCheck(lintGlobs, {}, '.eslintignore');
  if (filesToCheck.length == 0) {
    return;
  }
  const forbiddenTerms = 'build-system/test-configs/forbidden-terms.js';
  if (argv.local_changes && !filesToCheck.includes(forbiddenTerms)) {
    filesToCheck.push(forbiddenTerms);
  }
  await runLinter(filesToCheck);
}

module.exports = {
  lint,
};

lint.description = 'Run lint checks against JS files using eslint';
lint.flags = {
  'fix': 'Fix all errors that can be auto-fixed (e.g. spacing)',
  'files': 'Lint just the specified files',
  'local_changes': 'Lint just the files changed in the local branch',
};
