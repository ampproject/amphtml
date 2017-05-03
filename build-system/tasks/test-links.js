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
 * Looks for dead links in the given list of files.
 */
function testFiles() {
  var files = '';
  if (argv.files) {
    files = argv.files;
  } else {
    console./*OK*/error(util.colors.red(
        'Must specify a list of files via --files'));
    process.exit(1);
  }
  util.log('Files: ', util.colors.magenta(files));
  files.split(',').forEach(function(file) {
    var filtered_file = filterLocalhostLinks(file);
    checkLinks(filtered_file);
  });
}

/**
 * Reads the raw contents in the given markdown file into a string, filters out
 * localhost links (because they do not resolve on Travis), and rewrites the
 * contents to a new file.
 *
 * @param {string} file Path of file, relative to src root.
 * @return {string} Path of the newly created file, relative to src root.
 */
function filterLocalhostLinks(file) {
  var contents = fs.readFileSync(file).toString();
  var filtered_contents = contents.replace(/http:\/\/localhost:8000\//g, '');
  var filtered_file = file + '_without_localhost_links';
  fs.writeFile(filtered_file, filtered_contents);
  return filtered_file;
}

/**
 * Tests the links in the given file.
 * @param {string} file Path of file, relative to src root.
 */
function checkLinks(file) {
  util.log('Filtered file: ', file);
  execOrDie('markdown-link-check ' + file);
}

gulp.task('test-links', 'Detects dead links in markdown files', testFiles, {
  options: {
    'files': '  CSV list of files in which to check links'
  }
});
