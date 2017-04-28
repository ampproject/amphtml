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

/**
 * @param {!Object} config
 */
module.exports = {
  frameworks: [
    'fixture',
    'browserify',
    'mocha',
    'chai-as-promised',
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
    transform: ['babelify'],
    bundleDelay: 900,
  },

  reporters: [process.env.TRAVIS ? 'dots' : 'progress'],

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

  // Can't import Karma constants config.LOG_ERROR & config.LOG_WARN,
  // so we hard code the strings here. Hopefully they'll never change.
  logLevel: process.env.TRAVIS ? 'ERROR' : 'WARN',

  autoWatch: true,

  browsers: [
    process.env.TRAVIS ? 'Chrome_travis_ci' : 'Chrome_no_extensions',
  ],

  // Number of sauce tests to start in parallel
  concurrency: 6,

  customLaunchers: {
    /*eslint "google-camelcase/google-camelcase": 0*/
    Chrome_travis_ci: {
      base: 'Chrome',
      flags: ['--no-sandbox', '--disable-extensions'],
    },
    Chrome_no_extensions: {
      base: 'Chrome',
      // Dramatically speeds up iframe creation time.
      flags: ['--disable-extensions'],
    },
    // SauceLabs configurations.
    // New configurations can be created here:
    // https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
    SL_Chrome_android: {
      base: 'SauceLabs',
      browserName: 'android',
    },
    SL_Chrome_latest: {
      base: 'SauceLabs',
      browserName: 'chrome',
    },
    SL_Chrome_45: {
      base: 'SauceLabs',
      browserName: 'chrome',
      version: '45',
    },
    SL_iOS_8_4: {
      base: 'SauceLabs',
      browserName: 'iphone',
      version: '8.4',
    },
    SL_iOS_9_1: {
      base: 'SauceLabs',
      browserName: 'iphone',
      version: '9.1',
    },
    SL_iOS_10_0: {
      base: 'SauceLabs',
      browserName: 'iphone',
      version: '10.0',
    },
    SL_Firefox_latest: {
      base: 'SauceLabs',
      browserName: 'firefox',
    },
    SL_IE_11: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      version: 11,
    },
    SL_Edge_latest: {
      base: 'SauceLabs',
      browserName: 'microsoftedge',
    },
    SL_Safari_9: {
      base: 'SauceLabs',
      browserName: 'safari',
      version: 9,
    },
    SL_Safari_8: {
      base: 'SauceLabs',
      browserName: 'safari',
      version: 8,
    },
  },

  sauceLabs: {
    testName: 'AMP HTML on Sauce',
    tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
    startConnect: false,
    connectOptions: {
      port: 5757,
      logfile: 'sauce_connect.log',
    },
  },

  client: {
    mocha: {
      reporter: 'html',
      // Longer timeout on Travis; fail quickly at local.
      timeout: process.env.TRAVIS ? 10000 : 2000,
    },
    captureConsole: false,
  },

  singleRun: true,
  browserDisconnectTimeout: 10000,
  browserDisconnectTolerance: 2,
  browserNoActivityTimeout: 4 * 60 * 1000,
  captureTimeout: 4 * 60 * 1000,

  // Import our gulp webserver as a Karma server middleware
  // So we instantly have all the custom server endpoints available
  middleware: ['custom'],
  plugins: [
    'karma-browserify',
    'karma-chai',
    'karma-chai-as-promised',
    'karma-chrome-launcher',
    'karma-edge-launcher',
    'karma-firefox-launcher',
    'karma-fixture',
    'karma-html2js-preprocessor',
    'karma-mocha',
    'karma-safari-launcher',
    'karma-sauce-launcher',
    'karma-sinon-chai',
    {
      'middleware:custom': ['factory', function() {
        return require(require.resolve('../app.js'));
      }],
    },
  ],
};
