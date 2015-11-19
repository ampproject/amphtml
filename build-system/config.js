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
  'test/fixtures/**/*.html',
  {
    pattern: 'dist/**/*.js',
    included: false,
  },
  {
    pattern: 'dist.tools/**/*.js',
    included: false,
  },
  {
    pattern: 'build/**/*.js',
    included: false,
    served: true
  },
  {
    pattern: 'examples/**/*',
    included: false,
    served: true
  },
  {
    pattern: 'dist.3p/**/*',
    included: false,
    served: true
  }
]

var testPaths = commonTestPaths.concat([
  'test/**/*.js',
  'extensions/**/test/**/*.js',
]);

var integrationTestPaths = commonTestPaths.concat([
  'test/integration/**/*.js',
  'extensions/**/test/integration/**/*.js',
]);

var karma = {
  default: {
    configFile: karmaConf,
    singleRun: true,
    client: {
      captureConsole: false
    }
  },
  firefox: {
    configFile: karmaConf,
    singleRun: true,
    browsers: ['Firefox'],
    client: {
      mocha: {
        timeout: 10000
      },
      captureConsole: false
    }
  },
  safari: {
    configFile: karmaConf,
    singleRun: true,
    browsers: ['Safari'],
    client: {
      mocha: {
        timeout: 10000
      },
      captureConsole: false
    }
  },
  saucelabs: {
    configFile: karmaConf,
    reporters: ['dots', 'saucelabs'],
    browsers: [
      'SL_Chrome_android',
      'SL_Chrome_latest',
      'SL_Chrome_37',
      'SL_Firefox_latest',
      'SL_Safari_8',
      'SL_Safari_9',
      // TODO(#895) Enable these.
      //'SL_iOS_9_1',
      //'SL_IE_11',
      //'SL_Edge_latest',
    ],
    singleRun: true,
    client: {
      mocha: {
        timeout: 10000
      },
      captureConsole: false,
    },
    captureTimeout: 120000,
    browserDisconnectTimeout: 120000,
    browserNoActivityTimeout: 120000,
  }
};

/** @const  */
module.exports = {
  testPaths: testPaths,
  integrationTestPaths: integrationTestPaths,
  karma: karma,
  lintGlobs: [
    '**/*.js',
    '!{node_modules,build,dist,dist.3p,dist.tools,' +
        'third_party,build-system}/**/*.*',
    '!{testing,examples}/**/*.*',
    // TODO: temporary, remove when validator is up to date
    '!validator/**/*.*',
    '!gulpfile.js',
    '!karma.conf.js',
    '!**/local-amp-chrome-extension/background.js',
  ],
  presubmitGlobs: [
    '**/*.{css,js,go}',
    // This does match dist.3p/current, so we run presubmit checks on the
    // built 3p binary. This is done, so we make sure our special 3p checks
    // run against the entire transitive closure of deps.
    '!{node_modules,build,dist,dist.tools,' +
        'dist.3p/[0-9]*,dist.3p/current-min}/**/*.*',
    '!validator/node_modules/**/*.*',
    '!build-system/tasks/presubmit-checks.js',
    '!build/polyfills.js',
    '!gulpfile.js',
    '!third_party/**/*.*',
  ],
  changelogIgnoreFileTypes: /\.md|\.json|\.yaml|LICENSE|CONTRIBUTORS$/
};
