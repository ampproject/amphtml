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

const initTestsPath = ['test/_init_tests.js'];

const fixturesExamplesPaths = [
  'test-bin/test/fixtures/*.html',
  {
    pattern: 'test/fixtures/served/*.html',
    included: false,
    nocache: false,
    watched: true,
  },
  {
    pattern: 'examples/**/*',
    included: false,
    nocache: false,
    watched: true,
  },
];

const builtRuntimePaths = [
  {
    pattern: 'dist/**/*.js',
    included: false,
    nocache: false,
    watched: true,
  },
  {
    pattern: 'dist.3p/**/*',
    included: false,
    nocache: false,
    watched: true,
  },
  {
    pattern: 'dist.tools/**/*.js',
    included: false,
    nocache: false,
    watched: true,
  },
];

const commonUnitTestPaths = initTestsPath.concat(fixturesExamplesPaths);

const commonIntegrationTestPaths = initTestsPath.concat(
  fixturesExamplesPaths,
  builtRuntimePaths
);

const testPaths = commonIntegrationTestPaths.concat([
  'test/*/!(e2e)/**/*.js',
  'ads/**/test/test-*.js',
  'extensions/**/test/**/*.js',
]);

const a4aTestPaths = initTestsPath.concat([
  'extensions/amp-a4a/**/test/**/*.js',
  'extensions/amp-ad-network-*/**/test/**/*.js',
  'ads/google/a4a/test/*.js',
]);

const unitTestPaths = [
  'test/unit/**/*.js',
  'ads/**/test/test-*.js',
  'ads/**/test/unit/test-*.js',
  'extensions/**/test/*.js',
  'extensions/**/test/unit/*.js',
];

// TODO(rsimha, #28838): Refine this opt-in mechanism.
const unitTestCrossBrowserPaths = ['test/unit/test-error.js'];

const integrationTestPaths = [
  'test/integration/**/*.js',
  'extensions/**/test/integration/**/*.js',
];

const e2eTestPaths = ['test/e2e/*.js', 'extensions/**/test-e2e/*.js'];

const devDashboardTestPaths = ['build-system/server/app-index/test/**/*.js'];

const jisonPaths = ['extensions/**/*.jison'];

const lintGlobs = [
  '**/*.js',
  // To ignore a file / directory, add it to .eslintignore.
];

const presubmitGlobs = [
  '**/*.{css,js,go}',
  // This does match dist.3p/current, so we run presubmit checks on the
  // built 3p binary. This is done, so we make sure our special 3p checks
  // run against the entire transitive closure of deps.
  '!{node_modules,build,dist,dist.tools,' +
    'dist.3p/[0-9]*,dist.3p/current,dist.3p/current-min}/**/*.*',
  '!dist.3p/current/**/ampcontext-lib.js',
  '!dist.3p/current/**/iframe-transport-client-lib.js',
  '!out/**/*.*',
  '!validator/validator.pb.go',
  '!validator/dist/**/*.*',
  '!validator/htmlparser/**/*.*',
  '!validator/js/chromeextension/*.*',
  '!validator/js/nodejs/node_modules/**/*.*',
  '!validator/js/webui/dist/**/*.*',
  '!validator/js/webui/node_modules/**/*.*',
  '!validator/node_modules/**/*.*',
  '!build-system/server/new-server/transforms/dist/**/*.*',
  '!build-system/tasks/e2e/node_modules/**/*.*',
  '!build-system/tasks/performance/node_modules/**/*.*',
  '!build-system/tasks/performance/cache/**/*.*',
  '!build-system/tasks/presubmit-checks.js',
  '!build-system/runner/build/**/*.*',
  '!build-system/tasks/visual-diff/node_modules/**/*.*',
  '!build-system/tasks/visual-diff/snippets/*.js',
  '!build/polyfills.js',
  '!build/polyfills/*.js',
  '!third_party/**/*.*',
  '!src/purifier/node_modules/**/*.*',
  // Files in this testdata dir are machine-generated and are not part
  // of the AMP runtime, so shouldn't be checked.
  '!extensions/amp-a4a/*/test/testdata/*.js',
  '!examples/**/*',
  '!examples/visual-tests/**/*',
  '!test/coverage/**/*.*',
  '!firebase/**/*.*',
];

/**
 * List of non-JS files to be checked by `gulp prettify` (using prettier).
 * NOTE: When you add a new filename / glob to this list:
 * 1. Make sure its formatting options are specified in .prettierrc
 * 2. Make sure it is listed in .vscode/settings.json (for auto-fix-on-save)
 */
const prettifyGlobs = [
  '.codecov.yml',
  '.lando.yml',
  '.lgtm.yml',
  '.travis.yml',
  '.prettierrc',
  '.renovaterc.json',
  '.vscode/settings.json',
  '.github/workflows/continuous-integration-workflow.yml',
  '**/*.json',
  '**/OWNERS',
  '**/*.md',
  '!.github/ISSUE_TEMPLATE/**',
  '!**/{node_modules,build,dist,dist.3p,dist.tools,.karma-cache}/**',
];

/**
 * List of markdown files that may be checked by `gulp check-links` (using
 * markdown-link-check).
 */
const linkCheckGlobs = [
  '**/*.md',
  '!**/{examples,node_modules,build,dist,dist.3p,dist.tools,.karma-cache}/**',
];

/**
 * Array of 3p bootstrap urls
 * Defined by the following object schema:
 * basename: the name of the 3p frame without extension
 * max: the path of the readable html
 * min: the name of the minimized html
 */
const thirdPartyFrames = [
  {
    basename: 'frame',
    max: '3p/frame.max.html',
    min: 'frame.html',
  },
  {
    basename: 'nameframe',
    max: '3p/nameframe.max.html',
    min: 'nameframe.html',
  },
  {
    basename: 'recaptcha',
    max: '3p/recaptcha.max.html',
    min: 'recaptcha.html',
  },
];

/**
 * File types to ignore while auto-generating a changelog for a new release.
 */
const changelogIgnoreFileTypes = /\.md|\.json|\.yaml|LICENSE|CONTRIBUTORS$/;

/** @const  */
module.exports = {
  a4aTestPaths,
  changelogIgnoreFileTypes,
  commonIntegrationTestPaths,
  commonUnitTestPaths,
  devDashboardTestPaths,
  e2eTestPaths,
  integrationTestPaths,
  jisonPaths,
  linkCheckGlobs,
  lintGlobs,
  presubmitGlobs,
  prettifyGlobs,
  testPaths,
  thirdPartyFrames,
  unitTestCrossBrowserPaths,
  unitTestPaths,
};
