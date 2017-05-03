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
var child_process = require('child_process');
var fs = require('fs-extra');
var gulp = require('gulp-help')(require('gulp'));
var markdownLinkCheck = require('markdown-link-check');
var path = require('path');
var util = require('gulp-util');

/**
 * Executes the provided command; terminates this program in case of failure.
 * Copied from pr-check.js.
 * TODO(rsimha-amp): Refactor this into a shared library. Issue #9038.
 *
 * @param {string} cmd
 */
function execOrDie(cmd) {
  var p =
      child_process.spawnSync('/bin/sh', ['-c', cmd], {'stdio': 'inherit'});
  if (p.status != 0) {
    console/*OK*/.log('\nExiting due to failing command: ' + cmd);
    process.exit(p.status)
  }
}

/**
 * Checks for dead links in the list of files.
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
  util.log('Files: ', util.colors.magenta(files));
  var markdownFiles = files.split(',');
  markdownFiles.forEach(function(markdownFile) {
    var filteredMarkdownFile = filterLocalhostLinks(markdownFile);
    runLinkChecker(filteredMarkdownFile);
  });
}

/**
 * Reads the raw contents in the given markdown file into a string, filters out
 * localhost links (because they do not resolve on Travis), and rewrites the
 * contents to a new file.
 *
 * @param {string} markdownFile Path of markdown file, relative to src root.
 * @return {string} Path of the newly created file, relative to src root.
 */
function filterLocalhostLinks(markdownFile) {
  var contents = fs.readFileSync(markdownFile).toString();
  var filteredontents = contents.replace(/http:\/\/localhost:8000\//g, '');
  var filteredMarkdownFile = markdownFile + '_without_localhost_links';
  fs.writeFile(filteredMarkdownFile, filteredontents);
  return filteredMarkdownFile;
}

/**
 * Tests the links in the given file, after localhost links have been removed.
 * @param {string} filteredMarkdownFile Path of file, relative to src root.
 */
function runLinkChecker(filteredMarkdownFile) {
  execOrDie('markdown-link-check ' + filteredMarkdownFile);
}

gulp.task('check-links', 'Detects dead links in markdown files', checkLinks, {
  options: {
    'files': '  CSV list of files in which to check links'
  }
});
