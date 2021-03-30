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

/**
 * @type
 * Array<string | {
 *   pattern: string,
 *   included: boolean,
 *   nocache: boolean,
 *   watched: boolean
 * }>
 */
const initTestsPath = ['test/_init_tests.js'];

const karmaHtmlFixturesPath = 'test/fixtures/*.html';

const fixturesExamplesPaths = [
  karmaHtmlFixturesPath,
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
    pattern: 'dist/**/*.mjs',
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
  {
    pattern: 'dist.tools/**/*.mjs',
    included: false,
    nocache: false,
    watched: true,
  },
];

const karmaJsPaths = [
  'test/**/*.js',
  'ads/**/test/test-*.js',
  'extensions/**/test/**/*.js',
  'testing/**/*.js',
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

const jisonPath = 'extensions/**/*.jison';

const lintGlobs = [
  '**/*.js',
  // To ignore a file / directory, add it to .eslintignore.
];

/**
 * This should not include .js files, since those are handled by eslint:
 *  - required terms: notice/notice
 *  - forbidden terms: local/no-forbidden-terms
 */
const presubmitGlobs = [
  '**/*.{css,go}',
  '!{node_modules,build,dist,dist.tools,' +
    'dist.3p/[0-9]*,dist.3p/current,dist.3p/current-min}/**/*.*',
  '!out/**/*.*',
  '!validator/validator.pb.go',
  '!validator/dist/**/*.*',
  '!validator/htmlparser/**/*.*',
  '!build-system/tasks/performance/cache/**/*.*',
  '!build-system/runner/build/**/*.*',
  '!third_party/**/*.*',
  '!**/node_modules/**/*.*',
  '!extensions/**/dist/*',
  '!examples/**/*',
  '!examples/visual-tests/**/*',
  '!test/coverage/**/*.*',
  '!firebase/**/*.*',
];

/**
 * List of non-JS files to be checked by `amp prettify` (using prettier).
 * NOTE: When you add a new filename / glob to this list:
 * 1. Make sure its formatting options are specified in .prettierrc
 * 2. Make sure it is listed in .vscode/settings.json (for auto-fix-on-save)
 */
const prettifyGlobs = [
  '.circleci/config.yml',
  '.codecov.yml',
  '.lando.yml',
  '.lgtm.yml',
  '.prettierrc',
  '.renovaterc.json',
  '.circleci/config.yml',
  '.vscode/settings.json',
  '.github/workflows/continuous-integration-workflow.yml',
  '**/*.json',
  '**/OWNERS',
  '**/*.md',
];

/**
 * List of markdown files that may be checked by `amp check-links` (using
 * markdown-link-check).
 */
const linkCheckGlobs = [
  '**/*.md',
  '!**/{examples,node_modules,build,dist,dist.3p,dist.tools}/**',
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
  changelogIgnoreFileTypes,
  commonIntegrationTestPaths,
  commonUnitTestPaths,
  devDashboardTestPaths,
  e2eTestPaths,
  integrationTestPaths,
  jisonPath,
  karmaHtmlFixturesPath,
  karmaJsPaths,
  linkCheckGlobs,
  lintGlobs,
  presubmitGlobs,
  prettifyGlobs,
  testPaths,
  thirdPartyFrames,
  unitTestCrossBrowserPaths,
  unitTestPaths,
};
