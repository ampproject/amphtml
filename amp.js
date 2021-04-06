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
} = require('./build-system/tasks/amp-task-runner');

/**
 * All the AMP tasks. Keep this list alphabetized.
 *
 * The three params used below are:
 * 1. Name of the amp task to be invoked E.g. amp default
 * 2. Name of the function in the source file. E.g. defaultTask()
 * 3. Basename of the source file in build-system/tasks/. E.g. build-system/tasks/default-task.js
 */
createTask('analytics-vendor-configs', 'analyticsVendorConfigs', 'analytics-vendor-configs'); // prettier-ignore
createTask('ava', 'ava', 'ava');
createTask('babel-plugin-tests', 'babelPluginTests', 'babel-plugin-tests');
createTask('build', 'build', 'build');
createTask('bundle-size', 'bundleSize', 'bundle-size');
createTask('caches-json', 'cachesJson', 'caches-json');
createTask('check-analytics-vendors-list', 'checkAnalyticsVendorsList', 'check-analytics-vendors-list'); // prettier-ignore
createTask('check-asserts', 'checkAsserts', 'check-asserts'); // prettier-ignore
createTask('check-build-system', 'checkBuildSystem', 'check-build-system');
createTask('check-exact-versions', 'checkExactVersions','check-exact-versions'); // prettier-ignore
createTask('check-links', 'checkLinks', 'check-links');
createTask('check-owners', 'checkOwners', 'check-owners');
createTask('check-renovate-config','checkRenovateConfig','check-renovate-config'); // prettier-ignore
createTask('check-sourcemaps', 'checkSourcemaps', 'check-sourcemaps');
createTask('check-types', 'checkTypes', 'check-types');
createTask('check-video-interface-list', 'checkVideoInterfaceList', 'check-video-interface-list'); // prettier-ignore
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
createTask('markdown-toc', 'markdownToc', 'markdown-toc');
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
createTask('validator', 'validator', 'validator');
createTask('validator-cpp', 'validatorCpp', 'validator');
createTask('validator-webui', 'validatorWebui', 'validator');
createTask('visual-diff', 'visualDiff', 'visual-diff');

/**
 * Finalize the task runner after all tasks have been created.
 */
finalizeRunner();
