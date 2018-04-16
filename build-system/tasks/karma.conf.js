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
    'test/fixtures/*.html': ['html2js'],
    'src/**/*.js': ['browserify'],
    'test/**/*.js': ['browserify'],
    'ads/**/test/test-*.js': ['browserify'],
    'extensions/**/test/**/*.js': ['browserify'],
    'testing/**/*.js': ['browserify'],
  },

  browserify: {
    watch: true,
    debug: true,
    transform: [
      ['babelify'],
    ],
    bundleDelay: 900,
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
      flags: ['--no-sandbox', '--disable-extensions'],
    },
    Chrome_no_extensions: {
      base: 'Chrome',
      // Dramatically speeds up iframe creation time.
      flags: ['--disable-extensions'],
    },
    Chrome_no_extensions_headless: {
      base: 'ChromeHeadless',
      flags: ['--disable-extensions'],
    },
    // SauceLabs configurations.
    // New configurations can be created here:
    // https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
    SL_Chrome_android: {
      base: 'SauceLabs',
      browserName: 'android',
      version: 'latest',
    },
    SL_Chrome_latest: {
      base: 'SauceLabs',
      browserName: 'chrome',
      version: 'latest',
    },
    SL_Chrome_45: {
      base: 'SauceLabs',
      browserName: 'chrome',
      version: '45',
    },
    SL_iOS_latest: {
      base: 'SauceLabs',
      browserName: 'iphone',
      version: 'latest',
    },
    SL_iOS_10_0: {
      base: 'SauceLabs',
      browserName: 'iphone',
      version: '10.0',
    },
    SL_Firefox_latest: {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: 'latest',
    },
    SL_Safari_latest: {
      base: 'SauceLabs',
      browserName: 'safari',
      version: 'latest',
    },
    SL_Safari_10: {
      base: 'SauceLabs',
      browserName: 'safari',
      version: 10,
    },
    SL_Safari_9: {
      base: 'SauceLabs',
      browserName: 'safari',
      version: 9,
    },
    SL_Edge_latest: {
      base: 'SauceLabs',
      browserName: 'microsoftedge',
      version: 'latest',
    },
    SL_IE_11: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      version: 'latest',
    },
  },

  sauceLabs: {
    testName: 'AMP HTML on Sauce',
    tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
    startConnect: false,
  },

  client: {
    mocha: {
      reporter: 'html',
      // Longer timeout on Travis; fail quickly at local.
      timeout: process.env.TRAVIS ? 10000 : 2000,
    },
    // TODO(rsimha, #14432): Set to false after all tests are fixed.
    captureConsole: true,
  },

  singleRun: true,
  browserDisconnectTimeout: 10000,
  browserDisconnectTolerance: 2,
  browserNoActivityTimeout: 4 * 60 * 1000,
  captureTimeout: 4 * 60 * 1000,

  // Import our gulp webserver as a Karma server middleware
  // So we instantly have all the custom server endpoints available
  beforeMiddleware: ['custom'],
  plugins: [
    'karma-browserify',
    'karma-chai',
    'karma-chrome-launcher',
    'karma-coverage',
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
