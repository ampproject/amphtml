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
const BBPromise = require('bluebird');
const fs = require('fs-extra');
const log = require('fancy-log');
const markdownLinkCheck = BBPromise.promisify(require('markdown-link-check'));
const path = require('path');
const {
  gitDiffAddedNameOnlyMaster,
  gitDiffNameOnlyMaster,
} = require('../common/git');
const {green, magenta, red, yellow} = require('ansi-colors');
const {isTravisBuild} = require('../common/travis');
const {maybeUpdatePackages} = require('./update-packages');

/**
 * Parses the list of files in argv, or extracts it from the commit log.
 *
 * @return {!Array<string>}
 */
function getMarkdownFiles() {
  if (!!argv.files) {
    return argv.files.split(',');
  }
  return gitDiffNameOnlyMaster().filter(function(file) {
    return path.extname(file) == '.md' && !file.startsWith('examples/');
  });
}

/**
 * Parses the list of files in argv and checks for dead links.
 *
 * @return {Promise} Used to wait until all async link checkers finish.
 */
async function checkLinks() {
  maybeUpdatePackages();
  const markdownFiles = getMarkdownFiles();
  const allResults = await Promise.all(markdownFiles.map(runLinkChecker));

  const filesWithDeadLinks = allResults
    .map((results, index) => {
      // Some files were ignored and have no results.
      if (!results) {
        return;
      }
      let deadLinksFoundInFile = false;
      for (const {link, status, statusCode} of results) {
        // Skip links to files that were introduced by the PR.
        if (isLinkToFileIntroducedByPR(link)) {
          continue;
        }
        if (status === 'dead') {
          deadLinksFoundInFile = true;
          log(`[${red('✖')}] ${link} (${red(statusCode)})`);
        } else if (!isTravisBuild()) {
          log(`[${green('✔')}] ${link}`);
        }
      }
      const filename = markdownFiles[index];
      if (deadLinksFoundInFile) {
        log(red('ERROR'), 'Possible dead link(s) found in', magenta(filename));
        return filename;
      }
      log(green('SUCCESS'), 'All links in', magenta(filename), 'are alive.');
    })
    .filter(filenameOrUndef => filenameOrUndef);

  if (filesWithDeadLinks.length > 0) {
    log(
      red('ERROR'),
      'Please update dead link(s) in',
      magenta(filesWithDeadLinks.join(',')),
      'or add them to allow-list in build-system/tasks/check-links.js'
    );
    log(
      yellow('NOTE'),
      'If the link(s) above are not meant to resolve to a real webpage,',
      'surrounding them with backticks will exempt them from the link checker.'
    );
    process.exitCode = 1;
    return;
  }
  log(
    green('SUCCESS'),
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
  return gitDiffAddedNameOnlyMaster().some(function(file) {
    return file.length > 0 && link.includes(path.parse(file).base);
  });
}

/**
 * Filters out links in allow-list before running the link checker.
 *
 * @param {string} markdown Original markdown.
 * @return {string} Markdown after filtering out allowed links.
 */
function filterAllowedLinks(markdown) {
  let filteredMarkdown = markdown;

  // localhost links optionally preceded by ( or [ (not served on Travis)
  filteredMarkdown = filteredMarkdown.replace(
    /(\(|\[)?http:\/\/localhost:8000/g,
    ''
  );

  // Links in script tags (illustrative, and not always valid)
  filteredMarkdown = filteredMarkdown.replace(/src="http.*?"/g, '');

  // Links inside a <code> block (illustrative, and not always valid)
  filteredMarkdown = filteredMarkdown.replace(/<code>([^]*?)<\/code>/g, '');

  // Links inside a <pre> block (illustrative, and not always valid)
  filteredMarkdown = filteredMarkdown.replace(/<pre>([^]*?)<\/pre>/g, '');

  // After allow-listing is done, clean up any remaining empty blocks bounded
  // by backticks. Otherwise, `` will be treated as the start of a code block
  // and confuse the link extractor.
  filteredMarkdown = filteredMarkdown.replace(/\ \`\`\ /g, '');

  return filteredMarkdown;
}

/**
 * Reads the raw contents in the given markdown file, filters out localhost
 * links (because they do not resolve on Travis), and checks for dead links.
 *
 * @param {string} markdownFile Path of markdown file, relative to src root.
 * @return {Promise} Used to wait until the async link checker is done.
 */
function runLinkChecker(markdownFile) {
  // `.template.md` is a common suffix for files that may have interpolation
  // tokens, possibly as part of their links. So we skip them.
  if (path.basename(markdownFile).endsWith('.template.md')) {
    return Promise.resolve();
  }
  // Skip files that were deleted by the PR.
  if (!fs.existsSync(markdownFile)) {
    return Promise.resolve();
  }
  const markdown = fs.readFileSync(markdownFile).toString();
  const filteredMarkdown = filterAllowedLinks(markdown);
  const opts = {
    baseUrl: 'file://' + path.dirname(path.resolve(markdownFile)),
  };
  return markdownLinkCheck(filteredMarkdown, opts);
}

module.exports = {
  checkLinks,
};

checkLinks.description = 'Detects dead links in markdown files';
checkLinks.flags = {
  'files': '  CSV list of files in which to check links',
};
