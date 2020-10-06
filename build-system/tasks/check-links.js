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

const fs = require('fs-extra');
const log = require('fancy-log');
const markdownLinkCheck = require('markdown-link-check');
const path = require('path');
const {getFilesToCheck, usesFilesOrLocalChanges} = require('../common/utils');
const {gitDiffAddedNameOnlyMaster} = require('../common/git');
const {green, cyan, red, yellow} = require('ansi-colors');
const {isTravisBuild} = require('../common/travis');
const {linkCheckGlobs} = require('../test-configs/config');
const {maybeUpdatePackages} = require('./update-packages');

const LARGE_REFACTOR_THRESHOLD = 20;
const GITHUB_BASE_PATH = 'https://github.com/ampproject/amphtml/blob/master/';

let filesIntroducedByPr;

/**
 * Checks for dead links in .md files passed in via --files or --local_changes.
 */
async function checkLinks() {
  maybeUpdatePackages();
  if (!usesFilesOrLocalChanges('check-links')) {
    return;
  }
  const filesToCheck = getFilesToCheck(linkCheckGlobs);
  if (filesToCheck.length == 0) {
    return;
  }
  if (filesToCheck.length >= LARGE_REFACTOR_THRESHOLD) {
    log(green('INFO:'), 'Skipping check because this is a large refactor.');
    return;
  }
  if (!isTravisBuild()) {
    log(green('Starting checks...'));
  }
  filesIntroducedByPr = gitDiffAddedNameOnlyMaster();
  const results = await Promise.all(filesToCheck.map(checkLinksInFile));
  reportResults(results);
}

/**
 * Reports results after all markdown files have been checked.
 *
 * @param {!Array<string>} results
 */
function reportResults(results) {
  const filesWithDeadLinks = results
    .filter((result) => result.containsDeadLinks)
    .map((result) => result.file);
  if (filesWithDeadLinks.length > 0) {
    log(
      red('ERROR:'),
      'Please update the dead link(s) in these files:',
      cyan(filesWithDeadLinks.join(', '))
    );
    log(
      yellow('NOTE 1:'),
      "Valid links that don't resolve on Travis can be ignored via",
      cyan('ignorePatterns'),
      'in',
      cyan('build-system/tasks/check-links.js') + '.'
    );
    log(
      yellow('NOTE 2:'),
      "Links that aren't meant to resolve to a real webpage can be exempted",
      'from this check by surrounding them with backticks (`).'
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
  return filesIntroducedByPr.some((file) => {
    return file.length > 0 && link.includes(path.parse(file).base);
  });
}

/**
 * Checks a given markdown file for dead links.
 *
 * @param {string} file
 * @return {!Promise}
 */
function checkLinksInFile(file) {
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
    markdownLinkCheck(markdown, opts, (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      let containsDeadLinks = false;
      for (const result of results) {
        const {link, statusCode} = result;
        let {status} = result;
        // Skip links to files that were introduced by the PR.
        if (isLinkToFileIntroducedByPR(link) && status == 'dead') {
          // Log links with the correct github base as alive, otherwise flag deadlinks.
          const isValid = filesIntroducedByPr.some((file) => {
            return link === GITHUB_BASE_PATH + file;
          });
          if (isValid) {
            status = 'alive';
          }
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
            containsDeadLinks = true;
            log(`[${red('✖')}] ${link} (${red(statusCode)})`);
            break;
        }
      }
      if (containsDeadLinks) {
        log(red('ERROR:'), 'Possible dead link(s) found in', cyan(file));
      } else {
        log(green('SUCCESS:'), 'All links in', cyan(file), 'are alive.');
      }
      resolve({file, containsDeadLinks});
    });
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
