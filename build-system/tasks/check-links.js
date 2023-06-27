'use strict';

const fs = require('fs-extra');
const markdownLinkCheck = require('markdown-link-check');
const path = require('path');
const {cyan, green, red, yellow} = require('kleur/colors');
const {getFilesToCheck, usesFilesOrLocalChanges} = require('../common/utils');
const {gitDiffAddedNameOnlyMain} = require('../common/git');
const {linkCheckGlobs} = require('../test-configs/config');
const {log, logLocalDev} = require('../common/logging');

const LARGE_REFACTOR_THRESHOLD = 20;
const GITHUB_BASE_PATH = 'https://github.com/ampproject/amphtml/blob/main/';

let filesIntroducedByPr;

/**
 * Checks for dead links in .md files passed in via --files or --local_changes.
 * @return {Promise<void>}
 */
async function checkLinks() {
  if (!usesFilesOrLocalChanges('check-links')) {
    return;
  }
  const filesToCheck = getFilesToCheck(linkCheckGlobs, {dot: true});
  if (filesToCheck.length == 0) {
    return;
  }
  if (filesToCheck.length >= LARGE_REFACTOR_THRESHOLD) {
    log(green('INFO:'), 'Skipping check because this is a large refactor.');
    return;
  }
  logLocalDev(green('Starting checks...'));
  filesIntroducedByPr = gitDiffAddedNameOnlyMain();
  const results = await Promise.all(filesToCheck.map(checkLinksInFile));
  reportResults(results);
}

/**
 * Reports results after all markdown files have been checked.
 *
 * @param {!Array<{file: string, containsDeadLinks: boolean}>} results
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
      "Valid links that don't resolve during CI can be ignored via",
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
 * @return {!Promise<{file: string, containsDeadLinks: boolean}>}
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
      // Please note: This list is for links that are present many times in the repository.
      // If a single link is failing, you can remove it directly using a surrounding
      // comment directive markdown-link-check-disable / markdown-link-check-enable.

      // Localhost links don't work unless a `amp` server is running.
      {pattern: /localhost/},
      // codepen returns a 503 for these link checks
      {pattern: /https:\/\/codepen.*/},
      // developers.google.com links are assumed to exist
      {pattern: /https:\/\/developers.google.com\/.*/},
      // anchor links should be ignored
      {pattern: /^#/},
      // GitHub PRs and Issues can be assumed to exist
      {pattern: /https:\/\/github.com\/ampproject\/amphtml\/(pull|issue)\/.*/},
      // Templated links are merely used to generate other markdown files.
      {pattern: /\$\{[a-z]*\}/},
      {pattern: /https:.*?__component_name\w*__/},
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
            logLocalDev(`[${green('✔')}] ${link}`);
            break;
          case 'ignored':
            logLocalDev(`[${yellow('•')}] ${link}`);
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

checkLinks.description = 'Check markdown files for dead links';
checkLinks.flags = {
  'files': 'Check only the specified files',
  'local_changes': 'Check just the files changed in the local branch',
};
