/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

/* global require, process */

const argv = require('minimist')(process.argv.slice(2));
const gulp = require('gulp');
const {cyan, red} = require('kleur/colors');
const {isCiBuild} = require('./build-system/common/ci');
const {log} = require('./build-system/common/logging');

/**
 * Helper that creates the tasks in AMP's toolchain based on what's being done:
 * - If `gulp --tasks` has been invoked, eagerly load all task functions so we
 *   can print detailed information about their names, flags, usage, etc.
 * - If a single gulp task has been invoked, create a wrapper that lazily loads
 *   individual task functions from their source files. After that, check the
 *   flag usage for the current task and load only those source file(s) used by
 *   the task that was invoked.
 * @param {string} taskName
 * @param {string} taskFuncName
 * @param {string} taskSourceFileName
 */
function createTask(taskName, taskFuncName, taskSourceFileName) {
  const isGulpTasks = argv._.length == 0 && argv.tasks == true; // gulp --tasks
  const taskSourceFilePath = `./build-system/tasks/${taskSourceFileName}`;
  if (isGulpTasks) {
    const taskFunc = require(taskSourceFilePath)[taskFuncName];
    gulp.task(taskName, taskFunc);
  } else {
    gulp.task(taskName, (callback) => {
      const taskFunc = require(taskSourceFilePath)[taskFuncName];
      checkFlags(taskName, taskFunc, callback);
      return taskFunc(callback);
    });
  }
}

/**
 * Checks if the flags passed in to a task are valid.
 * @param {string} name
 * @param {function} taskFunc
 * @param {function} callback
 */
function checkFlags(name, taskFunc, callback) {
  const validFlags = taskFunc.flags ? Object.keys(taskFunc.flags) : [];
  if (isCiBuild()) {
    validFlags.push('color'); // Used to enable log coloring during CI.
  }
  const usedFlags = Object.keys(argv).slice(1); // Skip the '_' argument
  const invalidFlags = [];
  usedFlags.forEach((flag) => {
    if (!validFlags.includes(flag)) {
      invalidFlags.push(`--${flag}`);
    }
  });
  if (invalidFlags.length > 0) {
    log(
      red('ERROR:'),
      'Found invalid flags for',
      cyan(`gulp ${name}`) + ':',
      cyan(invalidFlags.join(', '))
    );
    log('For detailed usage information, run', cyan('gulp --tasks') + '.');
    if (validFlags.length > 0) {
      log('Valid flags for', cyan(`gulp ${name}`) + ':');
      validFlags.forEach((key) => {
        log(cyan(`\t--${key}`) + `: ${taskFunc.flags[key]}`);
      });
    }
    const reason = new Error('Found invalid flags');
    reason.showStack = false;
    callback(reason);
  }
}

/**
 * All the gulp tasks. Keep this list alphabetized.
 *
 * The three params used below are:
 * 1. Name of the gulp task to be invoked E.g. gulp default
 * 2. Name of the function in the source file. E.g. defaultTask()
 * 3. Basename of the source file in build-system/tasks/. E.g. build-system/tasks/default-task.js
 */

createTask('analytics-vendor-configs','analyticsVendorConfigs','analytics-vendor-configs'); // prettier-ignore
createTask('ava', 'ava', 'ava');
createTask('babel-plugin-tests', 'babelPluginTests', 'babel-plugin-tests');
createTask('build', 'build', 'build');
createTask('bundle-size', 'bundleSize', 'bundle-size');
createTask('caches-json', 'cachesJson', 'caches-json');
createTask('check-exact-versions', 'checkExactVersions','check-exact-versions'); // prettier-ignore
createTask('check-links', 'checkLinks', 'check-links');
createTask('check-owners', 'checkOwners', 'check-owners');
createTask('check-renovate-config','checkRenovateConfig','check-renovate-config'); // prettier-ignore
createTask('check-sourcemaps', 'checkSourcemaps', 'check-sourcemaps');
createTask('check-types', 'checkTypes', 'check-types');
createTask('cherry-pick', 'cherryPick', 'cherry-pick');
createTask('clean', 'clean', 'clean');
createTask('codecov-upload', 'codecovUpload', 'codecov-upload');
createTask('compile-jison', 'compileJison', 'compile-jison');
createTask('coverage-map', 'coverageMap', 'coverage-map');
createTask('css', 'css', 'css');
createTask('default', 'defaultTask', 'default-task');
createTask('dep-check', 'depCheck', 'dep-check');
createTask('dev-dashboard-tests', 'devDashboardTests', 'dev-dashboard-tests');
createTask('dist', 'dist', 'dist');
createTask('e2e', 'e2e', 'e2e');
createTask('firebase', 'firebase', 'firebase');
createTask('get-zindex', 'getZindex', 'get-zindex');
createTask('integration', 'integration', 'integration');
createTask('lint', 'lint', 'lint');
createTask('make-extension', 'makeExtension', 'extension-generator');
createTask('performance', 'performance', 'performance');
createTask('performance-urls', 'performanceUrls', 'performance-urls');
createTask('pr-check', 'prCheck', 'pr-check');
createTask('prepend-global', 'prependGlobal', 'prepend-global');
createTask('presubmit', 'presubmit', 'presubmit-checks');
createTask('prettify', 'prettify', 'prettify');
createTask('release', 'release', 'release');
createTask('serve', 'serve', 'serve');
createTask('server-tests', 'serverTests', 'server-tests');
createTask('storybook', 'storybook', 'storybook');
createTask('sweep-experiments', 'sweepExperiments', 'sweep-experiments');
createTask('test-report-upload', 'testReportUpload', 'test-report-upload');
createTask('unit', 'unit', 'unit');
createTask('update-packages', 'updatePackages', 'update-packages');
createTask('validator', 'validator', 'validator');
createTask('validator-webui', 'validatorWebui', 'validator');
createTask('visual-diff', 'visualDiff', 'visual-diff');
