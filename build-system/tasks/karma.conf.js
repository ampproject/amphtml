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

const COMMON_CHROME_FLAGS = [
  // Dramatically speeds up iframe creation time.
  '--disable-extensions',
  // Allows simulating user actions (e.g unmute) which otherwise will be denied.
  '--autoplay-policy=no-user-gesture-required',
];

// Reduces the odds of Sauce labs timing out during tests. See #16135.
// Reference: https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options#TestConfigurationOptions-Timeouts
const SAUCE_TIMEOUT_CONFIG = {
  maxDuration: 10 * 60,
  commandTimeout: 10 * 60,
  idleTimeout: 5 * 60,
};

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
  ],

  preprocessors: {
    './test/fixtures/*.html': ['html2js'],
    './test/**/*.js': ['browserify'],
    './ads/**/test/test-*.js': ['browserify'],
    './extensions/**/test/**/*.js': ['browserify'],
    './testing/**/*.js': ['browserify'],
  },

  // TODO(rsimha, #15510): Sauce labs on Safari doesn't reliably support
  // 'localhost' addresses. See #14848 for more info.
  // Details: https://support.saucelabs.com/hc/en-us/articles/115010079868
  hostname: 'localhost',

  browserify: {
    watch: true,
    debug: true,
    basedir: __dirname + '/../../',
    transform: [
      ['babelify', {compact: false}],
    ],
    bundleDelay: 1200,
  },

  reporters: ['super-dots', 'karmaSimpleReporter'],

  superDotsReporter: {
    nbDotsPerLine: 100000,
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

  browsers: [
    process.env.TRAVIS ? 'Chrome_travis_ci' : 'Chrome_no_extensions',
  ],

  // Number of sauce tests to start in parallel
  concurrency: 6,

  customLaunchers: {
    /* eslint "google-camelcase/google-camelcase": 0*/
    Chrome_travis_ci: {
      base: 'Chrome',
      flags: ['--no-sandbox'].concat(COMMON_CHROME_FLAGS),
    },
    Chrome_no_extensions: {
      base: 'Chrome',
      flags: COMMON_CHROME_FLAGS,
    },
    Chrome_no_extensions_headless: {
      base: 'ChromeHeadless',
      flags: ['--no-sandbox'].concat(COMMON_CHROME_FLAGS),
    },
    // SauceLabs configurations.
    // New configurations can be created here:
    // https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
    SL_Chrome_latest: Object.assign({
      base: 'SauceLabs',
      browserName: 'chrome',
      version: 'latest',
    }, SAUCE_TIMEOUT_CONFIG),
    SL_Chrome_android: Object.assign({
      base: 'SauceLabs',
      browserName: 'android',
      version: 'latest',
    }, SAUCE_TIMEOUT_CONFIG),
    SL_Chrome_45: Object.assign({
      base: 'SauceLabs',
      browserName: 'chrome',
      version: '45',
    }, SAUCE_TIMEOUT_CONFIG),
    SL_Android_latest: Object.assign({
      base: 'SauceLabs',
      device: 'Android Emulator',
      browserName: 'android',
      platform: 'android',
      version: 'latest',
    }, SAUCE_TIMEOUT_CONFIG),
    SL_iOS_latest: Object.assign({
      base: 'SauceLabs',
      device: 'iPhone Simulator',
      browserName: 'iphone',
      platform: 'iOS',
      version: 'latest',
    }, SAUCE_TIMEOUT_CONFIG),
    SL_Firefox_latest: Object.assign({
      base: 'SauceLabs',
      browserName: 'firefox',
      version: 'latest',
    }, SAUCE_TIMEOUT_CONFIG),
    SL_Safari_latest: Object.assign({
      base: 'SauceLabs',
      browserName: 'safari',
      version: 'latest',
    }, SAUCE_TIMEOUT_CONFIG),
    SL_Edge_latest: Object.assign({
      base: 'SauceLabs',
      browserName: 'microsoftedge',
      version: 'latest',
    }, SAUCE_TIMEOUT_CONFIG),
    SL_IE_11: Object.assign({
      base: 'SauceLabs',
      browserName: 'internet explorer',
      version: 'latest',
    }, SAUCE_TIMEOUT_CONFIG),
  },

  sauceLabs: {
    testName: 'AMP HTML on Sauce',
    tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
    startConnect: false,
    connectOptions: {
      noSslBumpDomains: 'all',
    },
  },

  client: {
    mocha: {
      reporter: 'html',
      // Longer timeout on Travis; fail quickly at local.
      timeout: process.env.TRAVIS ? 10000 : 2000,
    },
    // TODO(rsimha, #14406): Remove this after all tests are fixed.
    failOnConsoleError: !process.env.TRAVIS && !process.env.LOCAL_PR_CHECK,
    // TODO(rsimha, #14432): Set to false after all tests are fixed.
    captureConsole: true,
    verboseLogging: false,
  },

  singleRun: true,
  browserDisconnectTimeout: 10000,
  browserDisconnectTolerance: 2,
  browserNoActivityTimeout: 4 * 60 * 1000,
  captureTimeout: 4 * 60 * 1000,
  failOnEmptyTestSuite: false,

  // Import our gulp webserver as a Karma server middleware
  // So we instantly have all the custom server endpoints available
  beforeMiddleware: ['custom'],
  plugins: [
    'karma-browserify',
    'karma-chai',
    'karma-chrome-launcher',
    'karma-edge-launcher',
    'karma-firefox-launcher',
    'karma-fixture',
    'karma-html2js-preprocessor',
    'karma-ie-launcher',
    'karma-mocha',
    'karma-mocha-reporter',
    'karma-safari-launcher',
    'karma-sauce-launcher',
    'karma-simple-reporter',
    'karma-sinon-chai',
    'karma-super-dots-reporter',
    {
      'middleware:custom': ['factory', function() {
        return require(require.resolve('../app.js'));
      }],
    },
  ],
};
