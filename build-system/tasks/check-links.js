/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
const fs = require('fs-extra');
const log = require('fancy-log');
const markdownLinkCheck = require('markdown-link-check');
const path = require('path');
const {getFilesToCheck} = require('../common/utils');
const {gitDiffAddedNameOnlyMaster} = require('../common/git');
const {green, cyan, red, yellow} = require('ansi-colors');
const {isTravisBuild} = require('../common/travis');
const {linkCheckGlobs} = require('../test-configs/config');
const {maybeUpdatePackages} = require('./update-packages');

let filesIntroducedByPr;

/**
 * Checks for dead links in .md files passed in via --files or --local_changes.
 */
async function checkLinks() {
  maybeUpdatePackages();
  if (!isValidUsage()) {
    return;
  }
  const filesToCheck = getFilesToCheck(linkCheckGlobs);
  if (filesToCheck.length == 0) {
    return;
  }
  if (!isTravisBuild()) {
    log(green('Starting checks...'));
  }
  filesIntroducedByPr = gitDiffAddedNameOnlyMaster();
  const filesWithDeadLinks = [];
  await Promise.all(
    filesToCheck.map(file => checkLinksInFile(file, filesWithDeadLinks))
  );
  reportFinalResults(filesWithDeadLinks);
}

/**
 * Checks if the correct arguments were passed in
 *
 * @return {boolean}
 */
function isValidUsage() {
  const validUsage = argv.files || argv.local_changes;
  if (!validUsage) {
    log(
      yellow('NOTE 1:'),
      'It is infeasible for',
      cyan('gulp check-links'),
      'to check for dead links in all markdown files in the repo at once.'
    );
    log(
      yellow('NOTE 2:'),
      'Please run',
      cyan('gulp check-links'),
      'with',
      cyan('--files'),
      'or',
      cyan('--local_changes') + '.'
    );
  }
  return validUsage;
}

/**
 * Reports final results after having checked all markdown files.
 *
 * @param {!Array<string>} filesWithDeadLinks
 */
function reportFinalResults(filesWithDeadLinks) {
  if (filesWithDeadLinks.length > 0) {
    log(
      red('ERROR:'),
      'Please update dead link(s) in',
      cyan(filesWithDeadLinks.join(',')),
      'or add them to',
      cyan('ignorePatterns'),
      'in',
      cyan('build-system/tasks/check-links.js')
    );
    log(
      yellow('NOTE:'),
      'If any of the link(s) above are not meant to resolve to a real webpage,',
      'surrounding them with backticks will exempt them from the link checker.'
    );
    process.exitCode = 1;
    return;
  }
  log(
    green('SUCCESS:'),
    'All links in all markdown files in this branch are alive.'
  );
}

/**
 * Determines if a link points to a file added, copied, or renamed in the PR.
 *
 * @param {string} link Link being tested.
 * @return {boolean} True if the link points to a file introduced by the PR.
 */
function isLinkToFileIntroducedByPR(link) {
  return filesIntroducedByPr.some(function(file) {
    return file.length > 0 && link.includes(path.parse(file).base);
  });
}

/**
 * Checks a given markdown file for dead links.
 *
 * @param {string} file
 * @param {!Array<string>} filesWithDeadLinks
 * @return {!Promise}
 */
function checkLinksInFile(file, filesWithDeadLinks) {
  let markdown = fs.readFileSync(file).toString();

  // Links inside <code> blocks are illustrative and not always valid. Must be
  // removed because markdownLinkCheck() does not ignore them like <pre> blocks.
  markdown = markdown.replace(/<code>([^]*?)<\/code>/g, '');

  const opts = {
    // Relative links start at the markdown file's path.
    baseUrl: 'file://' + path.dirname(path.resolve(file)),
    ignorePatterns: [
      // Localhost links don't work unless a `gulp` server is running.
      {pattern: /localhost/},
      // Templated links are merely used to generate other markdown files.
      {pattern: /\$\{[a-z]*\}/},
    ],
  };

  return new Promise((resolve, reject) => {
    const callback = (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      let deadLinksFoundInFile = false;
      for (const {link, status, statusCode} of results) {
        // Skip links to files that were introduced by the PR.
        if (isLinkToFileIntroducedByPR(link)) {
          continue;
        }
        switch (status) {
          case 'alive':
            if (!isTravisBuild()) {
              log(`[${green('✔')}] ${link}`);
            }
            break;
          case 'ignored':
            if (!isTravisBuild()) {
              log(`[${yellow('•')}] ${link}`);
            }
            break;
          case 'dead':
            deadLinksFoundInFile = true;
            log(`[${red('✖')}] ${link} (${red(statusCode)})`);
            break;
        }
      }
      if (deadLinksFoundInFile) {
        log(red('ERROR:'), 'Possible dead link(s) found in', cyan(file));
        filesWithDeadLinks.push(file);
      } else {
        log(green('SUCCESS:'), 'All links in', cyan(file), 'are alive.');
      }
      resolve(file);
    };
    markdownLinkCheck(markdown, opts, callback);
  });
}

module.exports = {
  checkLinks,
};

checkLinks.description = 'Detects dead links in markdown files';
checkLinks.flags = {
  'files': '  Checks only the specified files',
  'local_changes': '  Checks just the files changed in the local branch',
};
