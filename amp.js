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
 * 1. Name of the amp task to be invoked
 *    Ex. `amp default`
 * 2. Name of the function in the source file
 *    Ex. `defaultTask()`
 *    Default: the task name in camelCase
 * 3. Basename of the source file in `build-system/tasks/`
 *    Ex. `build-system/tasks/default-task.js`
 *    Default: the file name is the same as the task name
 */
createTask('analytics-vendor-configs');
createTask('ava');
createTask('babel-plugin-tests');
createTask('build');
createTask('bundle-size');
createTask('caches-json');
createTask('check-analytics-vendors-list');
createTask('check-build-system');
createTask('check-exact-versions');
createTask('check-links');
createTask('check-owners');
createTask('check-renovate-config');
createTask('check-sourcemaps');
createTask('check-types');
createTask('check-video-interface-list');
createTask('cherry-pick');
createTask('clean');
createTask('codecov-upload');
createTask('compile-jison');
createTask('coverage-map');
createTask('css');
createTask('default', 'defaultTask', 'default-task');
createTask('dep-check');
createTask('dev-dashboard-tests');
createTask('dist');
createTask('e2e');
createTask('firebase');
createTask('get-zindex');
createTask('integration');
createTask('lint');
createTask('make-extension', 'makeExtension', 'extension-generator');
createTask('markdown-toc');
createTask('performance');
createTask('performance-urls');
createTask('pr-check', 'prCheck');
createTask('prepend-global');
createTask('presubmit', 'presubmit', 'presubmit-checks');
createTask('prettify');
createTask('release');
createTask('serve');
createTask('server-tests');
createTask('storybook');
createTask('sweep-experiments');
createTask('test-report-upload');
createTask('unit');
createTask('validator');
createTask('validator-cpp', 'validatorCpp', 'validator');
createTask('validator-webui', 'validatorWebui', 'validator');
createTask('visual-diff');

/**
 * Finalize the task runner after all tasks have been created.
 */
finalizeRunner();
