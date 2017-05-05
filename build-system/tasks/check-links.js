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
var markdownLinkCheck = require('markdown-link-check');
var path = require('path');
var util = require('gulp-util');

var resolve;
var fileCount;
var filesChecked = 0;

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
  var promise = new BBPromise(function (r) {
    resolve = r;
  });
  fileCount = markdownFiles.length;
  markdownFiles.forEach(runLinkChecker);
  return promise;
}

/**
 * Reads the raw contents in the given markdown file into a string, filters out
 * localhost links (because they do not resolve on Travis), and returns the
 * contents.
 *
 * @param {string} markdownFile Path of markdown file, relative to src root.
 * @return {string} Contents of markdown file after filtering localhost links.
 */
function filterLocalhostLinks(markdownFile) {
  var markdown = fs.readFileSync(markdownFile).toString();
  var filteredMarkdown = markdown.replace(/http:\/\/localhost:8000\//g, '');
  return filteredMarkdown;
}

/**
 * Checks the links in the given markdown.
 * @param {string} markdownFile Path of markdown file, relative to src root.
 */
function runLinkChecker(markdownFile) {
  var filteredMarkdown = filterLocalhostLinks(markdownFile);
  var opts = {
    baseUrl : 'file://' + path.dirname(path.resolve((markdownFile)))
  };

  markdownLinkCheck(filteredMarkdown, opts, function(error, results) {
    util.log('Checking links in', util.colors.magenta(markdownFile), '...');
    results.forEach(function (result) {
      if(result.status === 'dead') {
        error = true;
        util.log('[%s] %s', chalk.red('✖'), result.link);
      } else {
        util.log('[%s] %s', chalk.green('✓'), result.link);
      }
    });
    if(error) {
      util.log(
          util.colors.red('ERROR'), 'Dead links found in',
          util.colors.magenta(markdownFile), '(please update it).');
      process.exit(1);
    } else {
      util.log(
          util.colors.green('SUCCESS'), 'All links in',
          util.colors.magenta(markdownFile), 'are alive.');
    }
    if (++filesChecked == fileCount) {
      resolve();
    }
  });
}

gulp.task(
    'check-links',
    'Detects dead links in markdown files',
    checkLinks, {
    options: {
      'files': '  CSV list of files in which to check links'
    }
});
