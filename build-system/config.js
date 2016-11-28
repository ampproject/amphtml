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

var path = require('path');

var karmaConf = path.resolve('karma.conf.js');

var commonTestPaths = [
  'test/_init_tests.js',
  'test/fixtures/*.html',
  {
    pattern: 'test/fixtures/served/*.html',
    included: false,
    nocache: false,
    watched: true,
  },
  {
    pattern: 'dist/**/*.js',
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
    pattern: 'examples/**/*',
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
];

var testPaths = commonTestPaths.concat([
  'test/**/*.js',
  'ads/**/test/test-*.js',
  'extensions/**/test/**/*.js',
]);

var integrationTestPaths = commonTestPaths.concat([
  'test/integration/**/*.js',
  'extensions/**/test/integration/**/*.js',
]);

var karmaDefault = {
  configFile: karmaConf,
  singleRun: true,
  client: {
    mocha: {
      // Longer timeout on Travis; fail quickly at local.
      timeout: process.env.TRAVIS ? 10000 : 2000
    },
    captureConsole: false,
  },
  browserDisconnectTimeout: 10000,
  browserDisconnectTolerance: 2,
  browserNoActivityTimeout: 4 * 60 * 1000,
  captureTimeout: 4 * 60 * 1000,
};

var karma = {
  default: karmaDefault,
  firefox: extend(karmaDefault, {browsers: ['Firefox']}),
  safari: extend(karmaDefault, {browsers: ['Safari']}),
  saucelabs: extend(karmaDefault, {
    reporters: ['dots', 'saucelabs'],
    browsers: [
      'SL_Chrome_android',
      'SL_Chrome_latest',
      'SL_Chrome_45',
      'SL_Firefox_latest',
      'SL_Safari_8',
      'SL_Safari_9',
      'SL_Edge_latest',
      'SL_iOS_8_4',
      'SL_iOS_9_1',
      'SL_iOS_10_0',
      //'SL_IE_11',
    ],
  })
};

/** @const  */
module.exports = {
  commonTestPaths: commonTestPaths,
  testPaths: testPaths,
  integrationTestPaths: integrationTestPaths,
  karma: karma,
  lintGlobs: [
    '**/*.js',
    '!**/*.extern.js',
    '!{node_modules,build,dist,dist.3p,dist.tools,' +
        'third_party,build-system}/**/*.*',
    '!{testing,examples}/**/*.*',
    // TODO: temporary, remove when validator is up to date
    '!validator/**/*.*',
    '!eslint-rules/**/*.*',
    '!gulpfile.js',
    '!karma.conf.js',
    '!**/local-amp-chrome-extension/background.js',
    '!extensions/amp-access/0.1/access-expr-impl.js',
  ],
  presubmitGlobs: [
    '**/*.{css,js,go}',
    // This does match dist.3p/current, so we run presubmit checks on the
    // built 3p binary. This is done, so we make sure our special 3p checks
    // run against the entire transitive closure of deps.
    '!{node_modules,build,dist,dist.tools,' +
        'dist.3p/[0-9]*,dist.3p/current-min}/**/*.*',
    '!validator/dist/**/*.*',
    '!validator/node_modules/**/*.*',
    '!validator/nodejs/node_modules/**/*.*',
    '!build-system/tasks/presubmit-checks.js',
    '!build/polyfills.js',
    '!build/polyfills/*.js',
    '!gulpfile.js',
    '!third_party/**/*.*',
    '!validator/chromeextension/*.*',
    // Files in this testdata dir are machine-generated and are not part
    // of the AMP runtime, so shouldn't be checked.
    '!extensions/amp-a4a/*/test/testdata/*.js',
    '!examples/*.js',
  ],
  changelogIgnoreFileTypes: /\.md|\.json|\.yaml|LICENSE|CONTRIBUTORS$/
};

function extend(orig, add) {
  return Object.assign({}, orig, add);
}
