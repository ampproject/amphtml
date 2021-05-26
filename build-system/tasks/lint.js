/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const globby = require('globby');
const {
  log,
  logLocalDev,
  logOnSameLine,
  logOnSameLineLocalDev,
} = require('../common/logging');
const {cyan, green, red, yellow} = require('../common/colors');
const {default: ignore} = require('ignore');
const {ESLint} = require('eslint');
const {getFilesToCheck} = require('../common/utils');
const {gitDiffNameOnlyMain} = require('../common/git');
const {isCiBuild} = require('../common/ci');
const {lintGlobs} = require('../test-configs/config');

/** @type {ESLint.Options} */
const options = {
  fix: argv.fix,
  reportUnusedDisableDirectives: 'error',
};

/**
 * Runs the linter on the given set of files.
 * @param {Array<string>} filesToLint
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
    const resultText = formatter
      .format(lintResult)
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
 * @param {Object} results
 * @param {Object} fixedFiles
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
 * Computes the set of files to lint based on command line args / changed files.
 * - If lint rules were changed or if packages were upgraded, lint all files.
 * - Otherwise, use the `getFilesToCheck()` util to parse command line args.
 * @return {!Array<string>}
 */
function getFilesToLint() {
  const options = {gitignore: true};
  const filesChanged = gitDiffNameOnlyMain();
  const ruleChangeOrPackageUpgrade = filesChanged.some(
    (file) => file.endsWith('.eslintrc.js') || file == 'package.json'
  );
  const overrideLocalChanges =
    isCiBuild() && argv.local_changes && ruleChangeOrPackageUpgrade;
  if (overrideLocalChanges) {
    log(
      green('INFO:'),
      'Detected changes to lint rules / packages. Linting all files...'
    );
    return ignore().filter(globby.sync(lintGlobs, options));
  }
  return getFilesToCheck(lintGlobs, options, '.eslintignore');
}

/**
 * Checks files for formatting (and optionally fixes them) with Eslint.
 * Explicitly makes sure the API doesn't check files in `.eslintignore`.
 */
async function lint() {
  const filesToLint = getFilesToLint();
  if (filesToLint.length == 0) {
    return;
  }
  await runLinter(filesToLint);
}

module.exports = {
  lint,
};

lint.description = 'Runs eslint checks against JS files';
lint.flags = {
  'fix': 'Fixes simple lint errors (spacing etc)',
  'files': 'Lints just the specified files',
  'local_changes': 'Lints just the files changed in the local branch',
};
