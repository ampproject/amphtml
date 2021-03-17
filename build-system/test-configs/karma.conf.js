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

const argv = require('minimist')(process.argv.slice(2));
const {dotWrappingWidth} = require('../common/logging');
const {isCiBuild} = require('../common/ci');

const TEST_SERVER_PORT = 8081;
const COMMON_CHROME_FLAGS = [
  // Dramatically speeds up iframe creation time.
  '--disable-extensions',
  // Allows simulating user actions (e.g unmute) which otherwise will be denied.
  '--autoplay-policy=no-user-gesture-required',
];
// Makes debugging easy by auto-opening devtools.
if (argv.debug) {
  COMMON_CHROME_FLAGS.push('--auto-open-devtools-for-tabs');
}

/**
 * @param {!Object} config
 */
module.exports = {
  frameworks: ['fixture', 'mocha', 'sinon-chai', 'chai', 'source-map-support'],

  preprocessors: {}, // Dynamically populated based on tests being run.

  hostname: 'localhost',

  reporters: ['super-dots', 'spec'],

  superDotsReporter: {
    nbDotsPerLine: dotWrappingWidth,
    color: {
      success: 'green',
      failure: 'red',
      ignore: 'yellow',
    },
    icon: {
      success: '●',
      failure: '●',
      ignore: '○',
    },
  },

  specReporter: {
    suppressPassed: true,
    suppressSkipped: true,
    suppressFailed: false,
    suppressErrorSummary: true,
    maxLogLines: 20,
  },

  mochaReporter: {
    output: 'full',
    divider: false,
    colors: {
      success: 'green',
      error: 'red',
      info: 'yellow',
    },
    symbols: {
      success: '●',
      error: '●',
      info: '○',
    },
  },

  port: 9876,

  colors: true,

  proxies: {
    '/ads/': '/base/ads/',
    '/dist/': '/base/dist/',
    '/dist.3p/': '/base/dist.3p/',
    '/examples/': '/base/examples/',
    '/extensions/': '/base/extensions/',
    '/src/': '/base/src/',
    '/test/': '/base/test/',
  },

  // Can't import the Karma constant config.LOG_ERROR, so we hard code it here.
  // Hopefully it'll never change.
  logLevel: 'ERROR',

  autoWatch: true,

  customLaunchers: {
    /* eslint "google-camelcase/google-camelcase": 0*/
    Chrome_ci: {
      base: 'Chrome',
      flags: ['--no-sandbox'].concat(COMMON_CHROME_FLAGS),
    },
    Chrome_no_extensions: {
      base: 'Chrome',
      flags: COMMON_CHROME_FLAGS,
    },
    Chrome_no_extensions_headless: {
      base: 'ChromeHeadless',
      flags: [
        // https://developers.google.com/web/updates/2017/04/headless-chrome#frontend
        '--no-sandbox',
        '--remote-debugging-port=9222',
        // https://github.com/karma-runner/karma-chrome-launcher/issues/175
        "--proxy-server='direct://'",
        '--proxy-bypass-list=*',
      ].concat(COMMON_CHROME_FLAGS),
    },
  },

  client: {
    mocha: {
      reporter: 'html',
      // Longer timeout during CI; fail quickly during local runs.
      timeout: isCiBuild() ? 10000 : 2000,
      // Run tests up to 3 times before failing them during CI.
      retries: isCiBuild() ? 2 : 0,
    },
    captureConsole: false,
    verboseLogging: false,
    testServerPort: TEST_SERVER_PORT,
  },

  singleRun: true,
  captureTimeout: 4 * 60 * 1000,
  failOnEmptyTestSuite: false,

  // Give a disconnected browser 2 minutes to reconnect with Karma.
  // This allows a browser to retry 2 times per `browserDisconnectTolerance`
  // during CI before stalling out after 10 minutes.
  browserDisconnectTimeout: 2 * 60 * 1000,

  // If there's no message from the browser, make Karma wait 2 minutes
  // until it disconnects.
  browserNoActivityTimeout: 2 * 60 * 1000,

  // IF YOU CHANGE THIS, DEBUGGING WILL RANDOMLY KILL THE BROWSER
  browserDisconnectTolerance: isCiBuild() ? 2 : 0,

  plugins: [
    '@chiragrupani/karma-chromium-edge-launcher',
    'karma-chai',
    'karma-chrome-launcher',
    'karma-esbuild',
    'karma-firefox-launcher',
    'karma-fixture',
    'karma-html2js-preprocessor',
    'karma-ie-launcher',
    'karma-structured-json-reporter',
    'karma-mocha',
    'karma-mocha-reporter',
    'karma-safarinative-launcher',
    'karma-sinon-chai',
    'karma-source-map-support',
    'karma-spec-reporter',
    'karma-super-dots-reporter',
  ],
};
