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
var chalk = require('chalk');
var fs = require('fs-extra');
var gulp = require('gulp-help')(require('gulp'));
var markdownLinkCheck = require('markdown-link-check');
var path = require('path');
var util = require('gulp-util');


/**
 * Parses the list of files in argv and checks for dead links.
 */
function checkLinks() {
  var files = '';
  if (argv.files) {
    files = argv.files;
  } else {
    console./*OK*/error(util.colors.red(
        'Must specify a list of files via --files'));
    process.exit(1);
  }
  var markdownFiles = files.split(',');
  checkLinksInFiles(markdownFiles);
}

/**
 * Checks for dead links in the given list of files.
 *
 * @param {string} markdownFiles CSV list of markdown files to check.
 */
function checkLinksInFiles(markdownFiles) {
  util.log('Checking links in', util.colors.magenta(markdownFiles), '...');
  markdownFiles.forEach(function(markdownFile) {
    runLinkChecker(markdownFile);
  });
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
  var opts = {};
  opts.baseUrl = 'file://' + path.dirname(path.resolve((markdownFile)));

  var filteredMarkdown = filterLocalhostLinks(markdownFile);
  markdownLinkCheck(filteredMarkdown, opts, function (error, results) {
    results.forEach(function (result) {
      if(result.status === 'dead') {
        error = true;
        console.log('[%s] %s', chalk.red('✖'), result.link);
      } else {
        console.log('[%s] %s', chalk.green('✓'), result.link);
      }
    });
    if(error) {
      console.error('\nERROR: dead links found!');
      process.exit(1);
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

exports.checkLinksInFiles = checkLinksInFiles;
