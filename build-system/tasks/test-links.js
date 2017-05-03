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
var child_process = require('child_process');
var gulp = require('gulp-help')(require('gulp'));
var util = require('gulp-util');

/**
 * Executes the provided command, returning its stdout as an array of lines.
 * This will throw an exception if something goes wrong.
 * TODO(rsimha-amp): Refactor this into a shared library. Issue #9038.
 * 
 * @param {string} cmd
 * @return {!Array<string>}
 */
function exec(cmd) {
  return child_process.execSync(cmd, {'encoding': 'utf-8'}).trim().split('\n');
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
  // files.split(',').forEach(testLinks);
}


/**
 * Tests the links in the given file after filtering out localhost links, since
 * they do not work on Travis.
 * @param {string} file Path of file name relative to src root.
 */
function testLinks() {
  console.log('Testing links in ' + util.colors.magenta(file) + '...');
  markdownLinkCheck('[example](http://example.com)', function (err, results) {
    console.log('Processing results');
    results.forEach(function (result) {
      console.log('Testing ' + result.link);
      if(result.link.startsWith('http://localhost:8000/')) {
        console.log('[?] %s (Cannot test localhost links.)', result.link);
        return;
      }
      if(result.status === 'dead') {
        error = true;
        console.log('[%s] %s', chalk.red('✖'), result.link);
      } else {
        console.log('[%s] %s', chalk.green('✓'), result.link);
      }
    });
    if(error) {
      console.error(chalk.red('\nERROR: dead links found!'));
      process.exit(1);
    }
  });
}

gulp.task('test-links', 'Detects dead links in markdown files', testFiles, {
  options: {
    'files': '  CSV list of files in which to check links'
  }
});
