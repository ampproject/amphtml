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
const path = require('path');
const {cyan} = require('../common/colors');
const {log} = require('../common/logging');

const ROOT_DIR = path.resolve(__dirname, '../../');

/**
 * Cleans up various cache and output directories. Optionally cleans up inner
 * node_modules package directories, or excludes some directories from deletion.
 */
async function clean() {
  let pathsToDelete = [
    // Local cache directories
    // Keep this list in sync with .gitignore, .eslintignore, and .prettierignore
    '.babel-cache',
    '.css-cache',
    '.pre-closure-cache',

    // Output directories
    // Keep this list in sync with .gitignore, .eslintignore, and .prettierignore
    '.amp-dep-check',
    'build',
    'build-system/dist',
    'build-system/server/new-server/transforms/dist',
    'build-system/tasks/performance/cache',
    'build-system/tasks/performance/results.json',
    'build-system/global-configs/custom-config.json',
    'dist',
    'dist.3p',
    'dist.tools',
    'export',
    'examples/storybook',
    'extensions/**/dist',
    'release',
    'result-reports',
    'src/purifier/dist',
    'test/coverage',
    'test/coverage-e2e',
    'validator/**/dist',
    'validator/export',
  ];
  if (argv.include_subpackages) {
    pathsToDelete.push('**/node_modules', '!node_modules');
  }
  if (argv.exclude) {
    const excludes = argv.exclude.split(',');
    pathsToDelete = pathsToDelete.filter((path) => !excludes.includes(path));
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

clean.description = 'Cleans up various cache and output directories';
clean.flags = {
  'dry_run': 'Does a dry run without actually deleting anything',
  'include_subpackages':
    'Also cleans up inner node_modules package directories',
  'exclude': 'Comma separated list of directories to exclude from deletion',
};
