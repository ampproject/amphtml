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

var argv = require('minimist')(process.argv.slice(2));
var BBPromise = require('bluebird');
var chalk = require('chalk');
var fs = require('fs-extra');
var gulp = require('gulp-help')(require('gulp'));
var markdownLinkCheck = BBPromise.promisify(require('markdown-link-check'));
var path = require('path');
var util = require('gulp-util');


/**
 * Parses the list of files in argv and checks for dead links.
 *
 * @return {Promise} Used to wait until all async link checkers finish.
 */
function checkLinks() {
  var files = argv.files;
  if (!files) {
    util.log(util.colors.red(
        'Error: A list of markdown files must be specified via --files'));
    process.exit(1);
  }

  var markdownFiles = files.split(',');
  var linkCheckers = markdownFiles.map(function(markdownFile) {
    return runLinkChecker(markdownFile);
  });
  return BBPromise.all(linkCheckers)
  .then(function(allResults) {
    var deadLinksFound = false;
    var filesWithDeadLinks = [];
    allResults.map(function(results, index) {
      var deadLinksFoundInFile = false;
      util.log(
          'Checking links in',
          util.colors.magenta(markdownFiles[index]), '...');
      results.forEach(function (result) {
        if(result.status === 'dead') {
          deadLinksFound = true;
          deadLinksFoundInFile = true;
          util.log('[%s] %s', chalk.red('✖'), result.link);
        } else {
          util.log('[%s] %s', chalk.green('✓'), result.link);
        }
      });
      if(deadLinksFoundInFile) {
        filesWithDeadLinks.push(markdownFiles[index]);
        util.log(
            util.colors.yellow('WARNING'),
            'Possible dead link(s) found in',
            util.colors.magenta(markdownFiles[index]),
            '(please update if necessary).');
      } else {
        util.log(
            util.colors.green('SUCCESS'),
            'All links in',
            util.colors.magenta(markdownFiles[index]), 'are alive.');
      }
    });
    if (deadLinksFound) {
        util.log(
            util.colors.yellow('WARNING'),
            'Possible dead link(s) found. Please update',
            util.colors.magenta(filesWithDeadLinks.join(',')),
            'if necessary.');
    } else {
        util.log(
            util.colors.green('SUCCESS'),
            'All links in all markdown files in this PR are alive.');
    }
  });
}

/**
 * Filters out markdown elements that contain localhost links.
 * TODO(rsimha-amp): Simplify this into a single regex.
 *
 * @param {string} markdown Original markdown.
 * @return {string} Markdown after filtering out localhost links.
 */
function filterLocalhostLinks(markdown) {
  var localhostPattern = 'http:\/\/localhost:8000';
  var parenLinks = new RegExp('\\('+ localhostPattern + '[^\\)]*\\)', 'g');
  var bracketLinks = new RegExp('\\['+ localhostPattern + '[^\\]]*\\]', 'g');
  var rawLinks = new RegExp(localhostPattern, 'g');

  var filteredMarkdown = markdown;
  filteredMarkdown = filteredMarkdown.replace(parenLinks, '');
  filteredMarkdown = filteredMarkdown.replace(bracketLinks, '');
  filteredMarkdown = filteredMarkdown.replace(rawLinks, '');
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
  var markdown = fs.readFileSync(markdownFile).toString();
  var filteredMarkdown = filterLocalhostLinks(markdown);
  var opts = {
    baseUrl : 'file://' + path.dirname(path.resolve((markdownFile)))
  };
  return markdownLinkCheck(filteredMarkdown, opts);
}

gulp.task(
    'check-links',
    'Detects dead links in markdown files',
    checkLinks, {
    options: {
      'files': '  CSV list of files in which to check links'
    }
});
