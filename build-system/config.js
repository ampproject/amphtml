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

const initTestsPath = [
  'test/_init_tests.js',
];

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

const commonTestPaths =
    initTestsPath.concat(fixturesExamplesPaths, builtRuntimePaths);

const coveragePaths = [
  {
    pattern: 'test/coverage/**/*',
    included: false,
    nocache: false,
    watched: false,
  },
];

const simpleTestPath = [
  'test/simple-test.js',
];

const testPaths = commonTestPaths.concat([
  'test/**/*.js',
  'ads/**/test/test-*.js',
  'extensions/**/test/**/*.js',
]);

const a4aTestPaths = initTestsPath.concat([
  'extensions/amp-a4a/**/test/**/*.js',
  'extensions/amp-ad-network-*/**/test/**/*.js',
  'ads/google/a4a/test/*.js',
]);

const chaiAsPromised = [
  'test/chai-as-promised/chai-as-promised.js',
];

const unitTestPaths = initTestsPath.concat(fixturesExamplesPaths, [
  'test/functional/**/*.js',
  'ads/**/test/test-*.js',
  'extensions/**/test/*.js',
]);

const unitTestOnSaucePaths = initTestsPath.concat(fixturesExamplesPaths, [
  'test/functional/**/*.js',
  'ads/**/test/test-*.js',
]);

const integrationTestPaths = commonTestPaths.concat([
  'test/integration/**/*.js',
  'test/functional/test-error.js',
  'extensions/**/test/integration/**/*.js',
]);

/** @const  */
module.exports = {
  commonTestPaths,
  simpleTestPath,
  testPaths,
  a4aTestPaths,
  chaiAsPromised,
  unitTestPaths,
  unitTestOnSaucePaths,
  integrationTestPaths,
  coveragePaths,
  lintGlobs: [
    '**/*.js',
    '!**/*.extern.js',
    '!{node_modules,build,dist,dist.3p,dist.tools,' +
        'third_party}/**/*.*',
    '!{testing,examples}/**/*.*',
    // TODO: temporary, remove when validator is up to date
    '!validator/**/*.*',
    '!eslint-rules/**/*.*',
    '!karma.conf.js',
    '!**/local-amp-chrome-extension/background.js',
    '!extensions/amp-access/0.1/access-expr-impl.js',
    '!extensions/amp-animation/0.1/css-expr-impl.js',
    '!extensions/amp-bind/0.1/bind-expr-impl.js',
    '!test/coverage/**/*.*',
  ],
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
    '!validator/dist/**/*.*',
    '!validator/node_modules/**/*.*',
    '!validator/nodejs/node_modules/**/*.*',
    '!validator/webui/dist/**/*.*',
    '!validator/webui/node_modules/**/*.*',
    '!build-system/tasks/presubmit-checks.js',
    '!build/polyfills.js',
    '!build/polyfills/*.js',
    '!third_party/**/*.*',
    '!validator/chromeextension/*.*',
    // Files in this testdata dir are machine-generated and are not part
    // of the AMP runtime, so shouldn't be checked.
    '!extensions/amp-a4a/*/test/testdata/*.js',
    '!examples/*.js',
    '!examples/visual-tests/**/*',
    '!test/coverage/**/*.*',
  ],
  changelogIgnoreFileTypes: /\.md|\.json|\.yaml|LICENSE|CONTRIBUTORS$/,
};
