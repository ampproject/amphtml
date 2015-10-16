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

var testPaths = [
  'test/**/*.js',
  'extensions/**/test/**/*.js',
  'test/fixtures/**/*.html',
  {
    pattern: 'dist/**/*.js',
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
];

var karma = {
  default: {
    configFile: karmaConf,
    files: testPaths,
    singleRun: true,
    client: {
      captureConsole: false
    }
  },
  firefox: {
    configFile: karmaConf,
    files: testPaths,
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
    files: testPaths,
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
    files: testPaths,
    reporters: ['dots', 'saucelabs'],
    browsers: ['SL_Chrome'],
    singleRun: true,
    client: {
      captureConsole: false
    },
    browserDisconnectTimeout: 30000,
  }
};

/** @const  */
module.exports = {
  testPaths: testPaths,
  karma: karma,
  src: {
    exclude: '!{node_modules,build,dist,dist.3p}/**/*.*',
  },
  srcGlobs: [
    '**/*.{css,js,html,md}',
    '!{node_modules,build,dist,dist.3p}/**/*.*',
  ],
};
