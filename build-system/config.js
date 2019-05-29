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
  'test/fixtures/*.html',
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

const chaiAsPromised = ['test/chai-as-promised/chai-as-promised.js'];

const unitTestPaths = [
  'test/unit/**/*.js',
  'ads/**/test/test-*.js',
  'extensions/**/test/*.js',
];

const unitTestOnSaucePaths = ['test/unit/**/*.js', 'ads/**/test/test-*.js'];

const integrationTestPaths = [
  'test/integration/**/*.js',
  'extensions/**/test/integration/**/*.js',
];

const e2eTestPaths = ['test/e2e/*.js', 'extensions/**/test-e2e/*.js'];

const devDashboardTestPaths = ['build-system/app-index/test/**/*.js'];

const lintGlobs = [
  '**/*.js',
  // To ignore a file / directory, add it to .eslintignore.
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

/** @const  */
module.exports = {
  testPaths,
  a4aTestPaths,
  chaiAsPromised,
  commonUnitTestPaths,
  commonIntegrationTestPaths,
  unitTestPaths,
  unitTestOnSaucePaths,
  integrationTestPaths,
  e2eTestPaths,
  lintGlobs,
  devDashboardTestPaths,
  thirdPartyFrames,
  jsonGlobs: [
    '**/*.json',
    '!{node_modules,build,dist,dist.3p,dist.tools,' +
      'third_party,build-system}/**/*.*',
  ],
  presubmitGlobs: [
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
    '!validator/node_modules/**/*.*',
    '!validator/nodejs/node_modules/**/*.*',
    '!validator/webui/dist/**/*.*',
    '!validator/webui/node_modules/**/*.*',
    '!build-system/tasks/e2e/node_modules/**/*.*',
    '!build-system/tasks/presubmit-checks.js',
    '!build-system/runner/build/**/*.*',
    '!build-system/tasks/visual-diff/node_modules/**/*.*',
    '!build-system/tasks/visual-diff/snippets/*.js',
    '!build/polyfills.js',
    '!build/polyfills/*.js',
    '!third_party/**/*.*',
    '!validator/chromeextension/*.*',
    // Files in this testdata dir are machine-generated and are not part
    // of the AMP runtime, so shouldn't be checked.
    '!extensions/amp-a4a/*/test/testdata/*.js',
    '!examples/**/*',
    '!examples/visual-tests/**/*',
    '!test/coverage/**/*.*',
    '!firebase/**/*.*',
  ],
  changelogIgnoreFileTypes: /\.md|\.json|\.yaml|LICENSE|CONTRIBUTORS$/,
};
