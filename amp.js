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
createTask('analytics-vendor-configs', 'analyticsVendorConfigs'); // prettier-ignore
createTask('ava', 'ava');
createTask('babel-plugin-tests', 'babelPluginTests');
createTask('build', 'build');
createTask('bundle-size', 'bundleSize');
createTask('caches-json', 'cachesJson');
createTask('check-analytics-vendors-list', 'checkAnalyticsVendorsList'); // prettier-ignore
createTask('check-build-system', 'checkBuildSystem');
createTask('check-exact-versions', 'checkExactVersions'); // prettier-ignore
createTask('check-links', 'checkLinks');
createTask('check-owners', 'checkOwners');
createTask('check-renovate-config','checkRenovateConfig'); // prettier-ignore
createTask('check-sourcemaps', 'checkSourcemaps');
createTask('check-types', 'checkTypes');
createTask('check-video-interface-list', 'checkVideoInterfaceList'); // prettier-ignore
createTask('cherry-pick', 'cherryPick');
createTask('clean', 'clean');
createTask('codecov-upload', 'codecovUpload');
createTask('compile-jison', 'compileJison');
createTask('coverage-map', 'coverageMap');
createTask('css', 'css');
createTask('default', 'defaultTask', 'default-task');
createTask('dep-check', 'depCheck');
createTask('dev-dashboard-tests', 'devDashboardTests');
createTask('dist', 'dist');
createTask('e2e', 'e2e');
createTask('firebase', 'firebase');
createTask('get-zindex', 'getZindex');
createTask('integration', 'integration');
createTask('lint', 'lint');
createTask('make-extension', 'makeExtension', 'extension-generator');
createTask('markdown-toc', 'markdownToc');
createTask('performance', 'performance');
createTask('performance-urls', 'performanceUrls');
createTask('pr-check', 'prCheck');
createTask('prepend-global', 'prependGlobal');
createTask('presubmit', 'presubmit', 'presubmit-checks');
createTask('prettify', 'prettify');
createTask('release', 'release');
createTask('serve', 'serve');
createTask('server-tests', 'serverTests');
createTask('storybook', 'storybook');
createTask('sweep-experiments', 'sweepExperiments');
createTask('test-report-upload', 'testReportUpload');
createTask('unit', 'unit');
createTask('validator', 'validator');
createTask('validator-cpp', 'validatorCpp', 'validator');
createTask('validator-webui', 'validatorWebui', 'validator');
createTask('visual-diff', 'visualDiff');

/**
 * Finalize the task runner after all tasks have been created.
 */
finalizeRunner();
