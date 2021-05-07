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
'using strict';

const argv = require('minimist')(process.argv.slice(2));
const {
  log,
  logLocalDev,
  logWithoutTimestamp,
  logWithoutTimestampLocalDev,
} = require('../common/logging');
const {cyan, green, red} = require('../common/colors');
const {getFilesToCheck} = require('../common/utils');
const {getOutput} = require('../common/process');
const {htmlFixtureGlobs} = require('../test-configs/config');
const {JSDOM} = require('jsdom');

/**
 * Gets the AMP format type for the given HTML file by parsing its contents and
 * examining the root element.
 * @param {string} file
 * @return {Promise<string>}
 */
async function getAmpFormat(file) {
  const jsdom = await JSDOM.fromFile(file);
  const {documentElement} = jsdom.window.document;
  const isAds = documentElement.hasAttribute('amp4ads');
  const isEmail = documentElement.hasAttribute('amp4email');
  return isAds ? 'AMP4ADS' : isEmail ? 'AMP4EMAIL' : 'AMP';
}

/**
 * Separates the list of files to check into groups based on their AMP formats.
 * @param {Array<string>} filesToCheck
 * @return {Promise<Object>}
 */
async function getFileGroups(filesToCheck) {
  logLocalDev(green('Sorting HTML fixtures into format groups...'));
  const fileGroups = {AMP4ADS: [], AMP4EMAIL: [], AMP: []};
  await Promise.all(
    filesToCheck.map(async (file) =>
      fileGroups[await getAmpFormat(file)].push(file)
    )
  );
  return fileGroups;
}

/**
 * Runs amphtml-validator on the given list of files and prints results.
 *
 * @param {Array<string>} filesToCheck
 * @return {Promise<void>}
 */
async function runCheck(filesToCheck) {
  const fileGroups = await getFileGroups(filesToCheck);
  const formats = Object.keys(fileGroups);
  let foundValidationErrors = false;
  for (const format of formats) {
    if (fileGroups[format].length == 0) {
      continue;
    }
    const files = fileGroups[format].sort().join(' ');
    logLocalDev(green('Validating'), cyan(format), green('fixtures...'));
    const validateFixturesCmd = `FORCE_COLOR=1 npx amphtml-validator --html_format ${format} ${files}`;
    const result = getOutput(validateFixturesCmd);
    logWithoutTimestampLocalDev(result.stdout);
    if (result.stderr) {
      logWithoutTimestamp(result.stderr);
      log(red('ERROR:'), 'Found errors in', cyan(format), 'fixtures.');
      foundValidationErrors = true;
    }
  }
  if (foundValidationErrors) {
    throw new Error('Please address the errors listed above.');
  }
  log(green('SUCCESS:'), 'All HTML fixtures are valid.');
}

/**
 * Makes sure that HTML fixtures used during tests contain valid AMPHTML.
 */
async function validateHtmlFixtures() {
  const globs = argv.include_skipped
    ? htmlFixtureGlobs.filter((glob) => !glob.startsWith('!'))
    : htmlFixtureGlobs;
  const filesToCheck = getFilesToCheck(globs, {}, '.gitignore');
  if (filesToCheck.length == 0) {
    return;
  }
  await runCheck(filesToCheck);
}

validateHtmlFixtures.description =
  'Makes sure that HTML fixtures used during tests contain valid AMPHTML.';
validateHtmlFixtures.flags = {
  'files': 'Checks just the specified files',
  'include_skipped':
    'Include skipped files while validating (can be used with --local_changes)',
  'local_changes': 'Checks just the files changed in the local branch',
};

module.exports = {
  validateHtmlFixtures,
};
