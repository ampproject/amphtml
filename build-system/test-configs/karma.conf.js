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
const {getPersistentBrowserifyCache} = require('../common/browserify-cache');
const {isCiBuild} = require('../common/ci');

const TEST_SERVER_PORT = 8081;
const COMMON_CHROME_FLAGS = [
  // Dramatically speeds up iframe creation time.
  '--disable-extensions',
  // Allows simulating user actions (e.g unmute) which otherwise will be denied.
  '--autoplay-policy=no-user-gesture-required',
  // Makes debugging easy by auto-opening devtools.
  argv.debug ? '--auto-open-devtools-for-tabs' : null,
].filter(Boolean);

/**
 * @param {!Object} config
 */
module.exports = {
  frameworks: [
    'fixture',
    'browserify',
    'mocha',
    'sinon-chai',
    'chai',
    'source-map-support',
  ],

  preprocessors: {
    // `test-bin` is the output directory of the postHTML transformation.
    './test-bin/test/fixtures/*.html': ['html2js'],
    './test/**/*.js': ['browserify'],
    './ads/**/test/test-*.js': ['browserify'],
    './extensions/**/test/**/*.js': ['browserify'],
    './testing/**/*.js': ['browserify'],
  },

  html2JsPreprocessor: {
    // Strip the test-bin/ prefix for the transformer destination so that the
    // change is transparent for users of the path.
    stripPrefix: 'test-bin/',
  },

  hostname: 'localhost',

  browserify: {
    watch: true,
    debug: true,
    fast: true,
    basedir: __dirname + '/../../',
    transform: [['babelify', {caller: {name: 'test'}, global: true}]],
    // Prevent "cannot find module" errors during CI. See #14166.
    bundleDelay: isCiBuild() ? 5000 : 1200,
    persistentCache: getPersistentBrowserifyCache(),
  },

  reporters: ['super-dots', 'karmaSimpleReporter'],

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

  // Import our gulp webserver as a Karma server middleware
  // So we instantly have all the custom server endpoints available
  beforeMiddleware: ['custom'],
  plugins: [
    '@chiragrupani/karma-chromium-edge-launcher',
    'karma-browserify',
    'karma-chai',
    'karma-chrome-launcher',
    'karma-firefox-launcher',
    'karma-fixture',
    'karma-html2js-preprocessor',
    'karma-ie-launcher',
    'karma-structured-json-reporter',
    'karma-mocha',
    'karma-mocha-reporter',
    'karma-safarinative-launcher',
    'karma-simple-reporter',
    'karma-sinon-chai',
    'karma-source-map-support',
    'karma-super-dots-reporter',
    {
      'middleware:custom': [
        'factory',
        function () {
          return require(require.resolve('../server/app.js'));
        },
      ],
    },
  ],
};
