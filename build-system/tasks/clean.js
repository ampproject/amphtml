/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
const del = require('del');
const log = require('fancy-log');
const path = require('path');
const {cyan} = require('ansi-colors');

const ROOT_DIR = path.resolve(__dirname, '../../');

/**
 * Cleans up various build and test artifacts
 */
async function clean() {
  const pathsToDelete = [
    '.amp-build',
    '.karma-cache',
    'build',
    'build-system/server/new-server/transforms/dist',
    'deps.txt',
    'dist',
    'dist.3p',
    'dist.tools',
    'test-bin',
    'sxg',
  ];
  if (argv.include_subpackages) {
    pathsToDelete.push('**/node_modules', '!node_modules');
  }
  const deletedPaths = await del(pathsToDelete, {
    expandDirectories: false,
    dryRun: argv.dry_run,
  });
  if (deletedPaths.length > 0) {
    log(argv.dry_run ? "Paths that would've been deleted:" : 'Deleted paths:');
    deletedPaths.forEach((deletedPath) => {
      log('\t' + cyan(path.relative(ROOT_DIR, deletedPath)));
    });
  }
}

module.exports = {
  clean,
};

clean.description = 'Cleans up various build and test artifacts';
clean.flags = {
  'dry_run': '  Does a dry run without actually deleting anything',
  'include_subpackages':
    '  Also cleans up inner node_modules package directories',
};
