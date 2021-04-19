#!/usr/bin/env node
/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

const {
  createTask,
  finalizeRunner,
} = require('./build-system/task-runner/amp-task-runner');

/**
 * All the AMP tasks. Keep this list alphabetized.
 *
 * The three params used below are:
 * 1. Name of the amp task to be invoked.
 *    E.g. amp default
 * 2. Name of the function in the source file.
 *    E.g. defaultTask()
 *    If not specified, this is assumed to be the same as the task name.
 * 3. Basename of the source file in build-system/tasks/.
 *    E.g. build-system/tasks/default-task.js
 *    If not specified, this is assumed to be the same as the task name.
 */
createTask('analytics-vendor-configs', 'analyticsVendorConfigs');
createTask('ava');
createTask('babel-plugin-tests', 'babelPluginTests');
createTask('build');
createTask('bundle-size', 'bundleSize');
createTask('caches-json', 'cachesJson');
createTask('check-analytics-vendors-list', 'checkAnalyticsVendorsList');
createTask('check-asserts', 'checkAsserts');
createTask('check-build-system', 'checkBuildSystem');
createTask('check-exact-versions', 'checkExactVersions');
createTask('check-links', 'checkLinks');
createTask('check-owners', 'checkOwners');
createTask('check-renovate-config', 'checkRenovateConfig');
createTask('check-sourcemaps', 'checkSourcemaps');
createTask('check-types', 'checkTypes');
createTask('check-video-interface-list', 'checkVideoInterfaceList');
createTask('cherry-pick', 'cherryPick');
createTask('clean');
createTask('codecov-upload', 'codecovUpload');
createTask('compile-jison', 'compileJison');
createTask('coverage-map', 'coverageMap');
createTask('css');
createTask('default', 'defaultTask', 'default-task');
createTask('dep-check', 'depCheck');
createTask('dev-dashboard-tests', 'devDashboardTests');
createTask('dist');
createTask('e2e');
createTask('firebase');
createTask('get-zindex', 'getZindex');
createTask('integration');
createTask('lint');
createTask('make-extension', 'makeExtension');
createTask('markdown-toc', 'markdownToc');
createTask('performance');
createTask('performance-urls', 'performanceUrls');
createTask('pr-check', 'prCheck');
createTask('prepend-global', 'prependGlobal');
createTask('presubmit', 'presubmit');
createTask('prettify');
createTask('release');
createTask('serve');
createTask('server-tests', 'serverTests');
createTask('storybook');
createTask('sweep-experiments', 'sweepExperiments');
createTask('test-report-upload', 'testReportUpload');
createTask('unit');
createTask('validator');
createTask('validator-cpp', 'validatorCpp', 'validator');
createTask('validator-webui', 'validatorWebui', 'validator');
createTask('visual-diff', 'visualDiff');

/**
 * Finalize the task runner after all tasks have been created.
 */
finalizeRunner();
