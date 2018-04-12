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
const colors = require('ansi-colors');
const fs = require('fs-extra');
const getStdout = require('../exec').getStdout;
const gulp = require('gulp-help')(require('gulp'));
const log = require('fancy-log');
const markdownLinkCheck = BBPromise.promisify(require('markdown-link-check'));
const path = require('path');


/**
 * Parses the list of files in argv, or extracts it from the commit log.
 *
 * @return {!Array<string>}
 */
function getMarkdownFiles() {
  if (!!argv.files) {
    return argv.files.split(',');
  }
  const filesInPr =
        getStdout('git diff --name-only master...HEAD').trim().split('\n');
  return filesInPr.filter(function(file) {
    return path.extname(file) == '.md' && !file.startsWith('examples/');
  });
}

/**
 * Parses the list of files in argv and checks for dead links.
 *
 * @return {Promise} Used to wait until all async link checkers finish.
 */
function checkLinks() {
  const markdownFiles = getMarkdownFiles();
  const linkCheckers = markdownFiles.map(function(markdownFile) {
    return runLinkChecker(markdownFile);
  });
  return BBPromise.all(linkCheckers)
      .then(function(allResults) {
        let deadLinksFound = false;
        const filesWithDeadLinks = [];
        allResults.map(function(results, index) {
          // Skip files that were deleted by the PR.
          if (!fs.existsSync(markdownFiles[index])) {
            return;
          }
          let deadLinksFoundInFile = false;
          results.forEach(function(result) {
            // Skip links to files that were introduced by the PR.
            if (isLinkToFileIntroducedByPR(result.link)) {
              return;
            }
            if (result.status === 'dead') {
              deadLinksFound = true;
              deadLinksFoundInFile = true;
              log('[%s] %s', colors.red('✖'), result.link);
            } else if (!process.env.TRAVIS) {
              log('[%s] %s', colors.green('✔'), result.link);
            }
          });
          if (deadLinksFoundInFile) {
            filesWithDeadLinks.push(markdownFiles[index]);
            log(
                colors.red('ERROR'),
                'Possible dead link(s) found in',
                colors.magenta(markdownFiles[index]));
          } else {
            log(
                colors.green('SUCCESS'),
                'All links in',
                colors.magenta(markdownFiles[index]), 'are alive.');
          }
        });
        if (deadLinksFound) {
          log(
              colors.red('ERROR'),
              'Please update dead link(s) in',
              colors.magenta(filesWithDeadLinks.join(',')),
              'or whitelist them in build-system/tasks/check-links.js');
          log(
              colors.yellow('NOTE'),
              'If the link(s) above are not meant to resolve to a real webpage',
              'surrounding them with backticks will exempt them from the link',
              'checker.');
          process.exit(1);
        } else {
          log(
              colors.green('SUCCESS'),
              'All links in all markdown files in this branch are alive.');
        }
      });
}

/**
 * Determines if a link points to a file added, copied, or renamed in the PR.
 *
 * @param {string} link Link being tested.
 * @return {boolean} True if the link points to a file introduced by the PR.
 */
function isLinkToFileIntroducedByPR(link) {
  const filesAdded =
      getStdout('git diff --name-only --diff-filter=ARC master...HEAD')
          .trim().split('\n');
  return filesAdded.some(function(file) {
    return (file.length > 0 && link.includes(path.parse(file).base));
  });
}

/**
 * Filters out whitelisted links before running the link checker.
 *
 * @param {string} markdown Original markdown.
 * @return {string} Markdown after filtering out whitelisted links.
 */
function filterWhitelistedLinks(markdown) {
  let filteredMarkdown = markdown;

  // localhost links optionally preceded by ( or [ (not served on Travis)
  filteredMarkdown =
      filteredMarkdown.replace(/(\(|\[)?http:\/\/localhost:8000/g, '');

  // Links in script tags (illustrative, and not always valid)
  filteredMarkdown = filteredMarkdown.replace(/src="http.*?"/g, '');

  // Links inside a <code> block (illustrative, and not always valid)
  filteredMarkdown = filteredMarkdown.replace(/<code>(.*?)<\/code>/gs, '');
  
  // Links inside a <pre> block (illustrative, and not always valid)
  filteredMarkdown = filteredMarkdown.replace(/<pre>(.*?)<\/pre>/gs, '');

  // The heroku nightly build page is not always acccessible by the checker.
  filteredMarkdown = filteredMarkdown.replace(
      /\(http:\/\/amphtml-nightly.herokuapp.com\/\)/g, '');

  // After all whitelisting is done, clean up any remaining empty blocks bounded
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
  // Skip files that were deleted by the PR.
  if (!fs.existsSync(markdownFile)) {
    return Promise.resolve();
  }
  const markdown = fs.readFileSync(markdownFile).toString();
  const filteredMarkdown = filterWhitelistedLinks(markdown);
  const opts = {
    baseUrl: 'file://' + path.dirname(path.resolve((markdownFile))),
  };
  return markdownLinkCheck(filteredMarkdown, opts);
}

gulp.task(
    'check-links',
    'Detects dead links in markdown files',
    ['update-packages'],
    checkLinks,
    {
      options: {
        'files': '  CSV list of files in which to check links',
      },
    }
);
