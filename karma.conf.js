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
module.exports = function(config) {

  var configuration = {
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
      'testing/**/*.js': ['browserify']
    },

    browserify: {
      watch: true,
      debug: true,
      transform: ['babelify'],
      bundleDelay: 900
    },

    reporters: ['progress'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_WARN,

    autoWatch: true,

    browsers: ['Chrome_no_extensions'],

    customLaunchers: {
      /*eslint "google-camelcase/google-camelcase": 0*/
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox', '--disable-extensions',],
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
      SL_Chrome_37: {
        base: 'SauceLabs',
        browserName: 'chrome',
        version: 37,
      },
      SL_iOS_9_1: {
        base: 'SauceLabs',
        browserName: 'iphone',
        version: '9.1'
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
        logfile: 'sauce_connect.log'
      }
    },

    // change Karma's debug.html to the mocha web reporter
    client: {
      mocha: {
        reporter: 'html',
      },
      captureConsole: false
    }
  };

  if (process.env.TRAVIS) {
    configuration.browsers = ['Chrome_travis_ci'];
  }

  config.set(configuration);
};
