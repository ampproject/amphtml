#!/usr/bin/env node

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
createTask('check-analytics-vendors-list', 'checkAnalyticsVendorsList');
createTask('check-asserts', 'checkAsserts');
createTask('check-build-system', 'checkBuildSystem');
createTask('check-exact-versions', 'checkExactVersions');
createTask('check-ignore-lists', 'checkIgnoreLists');
createTask('check-invalid-whitespaces', 'checkInvalidWhitespaces');
createTask('check-json-schemas', 'checkJsonSchemas');
createTask('check-links', 'checkLinks');
createTask('check-owners', 'checkOwners');
createTask('check-renovate-config', 'checkRenovateConfig');
createTask('check-sourcemaps', 'checkSourcemaps');
createTask('check-types', 'checkTypes');
createTask('check-video-interface-list', 'checkVideoInterfaceList');
createTask('clean');
createTask('compile-jison', 'compileJison');
createTask('css');
createTask('default', 'defaultTask', 'default-task');
createTask('dep-check', 'depCheck');
createTask('dist');
createTask('e2e');
createTask('firebase');
createTask('get-zindex', 'getZindex');
createTask('integration');
createTask('lint');
createTask('make-extension', 'makeExtension');
createTask('markdown-toc', 'markdownToc');
createTask('pr-check', 'prCheck');
createTask('prepend-global', 'prependGlobal');
createTask('presubmit', 'presubmit');
createTask('prettify');
createTask('release');
createTask('serve');
createTask('server-tests', 'serverTests');
createTask('storybook');
createTask('sweep-experiments', 'sweepExperiments');
createTask('unit');
createTask('validate-html-fixtures', 'validateHtmlFixtures');
createTask('validator');
createTask('validator-cpp', 'validatorCpp', 'validator');
createTask('validator-webui', 'validatorWebui', 'validator');
createTask('visual-diff', 'visualDiff');

/**
 * Finalize the task runner after all tasks have been created.
 */
finalizeRunner();
