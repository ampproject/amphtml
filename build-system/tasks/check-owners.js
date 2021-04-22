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

/**
 * @fileoverview This file implements the `amp check-owners` task, which checks
 * all OWNERS files in the repo for correctness, as determined by the parsing
 * API provided by the AMP owners bot.
 */

'use strict';

const fetch = require('node-fetch');
const fs = require('fs-extra');
const JSON5 = require('json5');
const {cyan, red, green} = require('kleur/colors');
const {getFilesToCheck, usesFilesOrLocalChanges} = require('../common/utils');
const {log, logLocalDev} = require('../common/logging');

const OWNERS_SYNTAX_CHECK_URI =
  'http://ampproject-owners-bot.appspot.com/v0/syntax';

/**
 * Checks OWNERS files for correctness using the owners bot API.
 * The cumulative result is returned to the `amp` process via process.exitCode
 * so that all OWNERS files can be checked / fixed.
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

    const {requestErrors, fileErrors, rules} = await response.json();

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

checkOwners.description = 'Checks all OWNERS files in the repo for correctness';
checkOwners.flags = {
  'files': 'Checks only the specified OWNERS files',
  'local_changes': 'Checks just the OWNERS files changed in the local branch',
};
