#!/usr/bin/env node

import {
  createTask,
  finalizeRunner,
} from './build-system/task-runner/amp-task-runner.mjs';

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
await createTask('analytics-vendor-configs', 'analyticsVendorConfigs');
await createTask('ava');
await createTask('babel-plugin-tests', 'babelPluginTests');
await createTask('build');
await createTask('bundle-size', 'bundleSize');
await createTask('caches-json', 'cachesJson');
await createTask('check-analytics-vendors-list', 'checkAnalyticsVendorsList');
await createTask('check-asserts', 'checkAsserts');
await createTask('check-build-system', 'checkBuildSystem');
await createTask('check-exact-versions', 'checkExactVersions');
await createTask('check-invalid-whitespaces', 'checkInvalidWhitespaces');
await createTask('check-links', 'checkLinks');
await createTask('check-owners', 'checkOwners');
await createTask('check-renovate-config', 'checkRenovateConfig');
await createTask('check-sourcemaps', 'checkSourcemaps');
await createTask('check-types', 'checkTypes');
await createTask('check-video-interface-list', 'checkVideoInterfaceList');
await createTask('cherry-pick', 'cherryPick');
await createTask('clean');
await createTask('codecov-upload', 'codecovUpload');
await createTask('compile-jison', 'compileJison');
await createTask('css');
await createTask('default', 'defaultTask', 'default-task');
await createTask('dep-check', 'depCheck');
await createTask('dist');
await createTask('e2e');
await createTask('firebase');
await createTask('get-zindex', 'getZindex');
await createTask('integration');
await createTask('lint');
await createTask('make-extension', 'makeExtension');
await createTask('markdown-toc', 'markdownToc');
await createTask('performance');
await createTask('performance-urls', 'performanceUrls');
await createTask('pr-check', 'prCheck');
await createTask('prepend-global', 'prependGlobal');
await createTask('presubmit', 'presubmit');
await createTask('prettify');
await createTask('release');
await createTask('serve');
await createTask('server-tests', 'serverTests');
await createTask('storybook');
await createTask('sweep-experiments', 'sweepExperiments');
await createTask('test-report-upload', 'testReportUpload');
await createTask('unit');
await createTask('validate-html-fixtures', 'validateHtmlFixtures');
await createTask('validator');
await createTask('validator-cpp', 'validatorCpp', 'validator');
await createTask('validator-webui', 'validatorWebui', 'validator');
await createTask('visual-diff', 'visualDiff');

/**
 * Finalize the task runner after all tasks have been created.
 */
finalizeRunner();
