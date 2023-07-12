/**
 * @fileoverview This file implements the `amp check-owners` task, which checks
 * all OWNERS files in the repo for correctness, as determined by the parsing
 * API provided by the AMP owners bot.
 */

'use strict';

const fs = require('fs-extra');
const JSON5 = require('json5');
const {cyan, green, red} = require('kleur/colors');
const {getFilesToCheck, usesFilesOrLocalChanges} = require('../common/utils');
const {log, logLocalDev} = require('../common/logging');

const OWNERS_SYNTAX_CHECK_URI =
  'http://ampproject-owners-bot.appspot.com/v0/syntax';

/**
 * Checks OWNERS files for correctness using the owners bot API.
 * The cumulative result is returned to the `amp` process via process.exitCode
 * so that all OWNERS files can be checked / fixed.
 * @return {Promise<void>}
 */
async function checkOwners() {
  if (!usesFilesOrLocalChanges('check-owners')) {
    return;
  }
  const filesToCheck = getFilesToCheck(['**/OWNERS']);
  for (const file of filesToCheck) {
    await checkFile(file);
  }
}

/**
 * Checks a single OWNERS file using the owners bot API.
 * @param {string} file
 * @return {Promise<void>}
 */
async function checkFile(file) {
  if (!file.endsWith('OWNERS')) {
    log(red('ERROR:'), cyan(file), 'is not an', cyan('OWNERS'), 'file.');
    process.exitCode = 1;
    return;
  }

  const contents = fs.readFileSync(file, 'utf8').toString();
  try {
    JSON5.parse(contents);
    logLocalDev(green('SUCCESS:'), 'No errors in', cyan(file));
  } catch {
    log(red('FAILURE:'), 'Found errors in', cyan(file));
    process.exitCode = 1;
  }

  try {
    const response = await fetch(OWNERS_SYNTAX_CHECK_URI, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({path: file, contents}),
    });

    if (!response.ok) {
      log(red('ERROR:'), 'Could not reach the owners syntax check API');
      throw new Error(
        `${response.status} ${response.statusText}: ${await response.text()}`
      );
    }

    const {fileErrors, requestErrors, rules} = await response.json();

    if (requestErrors) {
      requestErrors.forEach((err) => log(red(err)));
      throw new Error('Could not reach the owners syntax check API');
    } else if (fileErrors && fileErrors.length) {
      fileErrors.forEach((err) => log(red(err)));
      throw new Error(`Errors encountered parsing "${file}"`);
    }

    log(
      green('SUCCESS:'),
      'Parsed',
      cyan(file),
      'successfully; produced',
      cyan(rules.length),
      'rule(s).'
    );
  } catch (error) {
    log(red('FAILURE:'), error);
    process.exitCode = 1;
  }
}

module.exports = {
  checkOwners,
};

checkOwners.description = 'Check all OWNERS files in the repo for correctness';
checkOwners.flags = {
  'files': 'Check only the specified OWNERS files',
  'local_changes': 'Check just the OWNERS files changed in the local branch',
};
