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

const {BABELIFY_GLOBAL_TRANSFORM, BABELIFY_PLUGINS} = require('./helpers');
const {gitCommitterEmail} = require('../common/git');
const {isTravisBuild, travisJobNumber} = require('../common/travis');

const TEST_SERVER_PORT = 8081;

const COMMON_CHROME_FLAGS = [
  // Dramatically speeds up iframe creation time.
  '--disable-extensions',
  // Allows simulating user actions (e.g unmute) which otherwise will be denied.
  '--autoplay-policy=no-user-gesture-required',
];

// Reduces the odds of Sauce labs timing out during tests. See #16135 and #24286.
// Reference: https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options#TestConfigurationOptions-Timeouts
const SAUCE_TIMEOUT_CONFIG = {
  maxDuration: 10 * 60,
  commandTimeout: 10 * 60,
  idleTimeout: 10 * 60,
};

const BABELIFY_CONFIG = {
  ...BABELIFY_GLOBAL_TRANSFORM,
  ...BABELIFY_PLUGINS,
  sourceMapsAbsolute: true,
};

const preprocessors = ['browserify'];

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
    './test/fixtures/*.html': ['html2js'],
    './test/**/*.js': preprocessors,
    './ads/**/test/test-*.js': preprocessors,
    './extensions/**/test/**/*.js': preprocessors,
    './testing/**/*.js': preprocessors,
  },

  // TODO(rsimha, #15510): Sauce labs on Safari doesn't reliably support
  // 'localhost' addresses. See #14848 for more info.
  // Details: https://support.saucelabs.com/hc/en-us/articles/115010079868
  hostname: 'localhost',

  babelifyConfig: BABELIFY_CONFIG,

  browserify: {
    watch: true,
    debug: true,
    fast: true,
    basedir: __dirname + '/../../',
    transform: [['babelify', BABELIFY_CONFIG]],
    // Prevent "cannot find module" errors on Travis. See #14166.
    bundleDelay: isTravisBuild() ? 5000 : 1200,
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

  browsers: [isTravisBuild() ? 'Chrome_travis_ci' : 'Chrome_no_extensions'],

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
      flags: [
        // https://developers.google.com/web/updates/2017/04/headless-chrome#frontend
        '--no-sandbox',
        '--remote-debugging-port=9222',
        // https://github.com/karma-runner/karma-chrome-launcher/issues/175
        "--proxy-server='direct://'",
        '--proxy-bypass-list=*',
      ].concat(COMMON_CHROME_FLAGS),
    },
    // SauceLabs configurations.
    // New configurations can be created here:
    // https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
    SL_Chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 10',
      version: 'latest',
      ...SAUCE_TIMEOUT_CONFIG,
    },
    SL_Chrome_Beta: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 10',
      version: 'beta',
      ...SAUCE_TIMEOUT_CONFIG,
    },
    SL_Chrome_Android_7: {
      base: 'SauceLabs',
      appiumVersion: '1.8.1',
      deviceName: 'Android GoogleAPI Emulator',
      browserName: 'Chrome',
      platformName: 'Android',
      platformVersion: '7.1',
      ...SAUCE_TIMEOUT_CONFIG,
    },
    SL_iOS_12: {
      base: 'SauceLabs',
      appiumVersion: '1.9.1',
      deviceName: 'iPhone X Simulator',
      browserName: 'Safari',
      platformName: 'iOS',
      platformVersion: '12.0',
      ...SAUCE_TIMEOUT_CONFIG,
    },
    SL_iOS_11: {
      base: 'SauceLabs',
      appiumVersion: '1.9.1',
      deviceName: 'iPhone X Simulator',
      browserName: 'Safari',
      platformName: 'iOS',
      platformVersion: '11.3',
      ...SAUCE_TIMEOUT_CONFIG,
    },
    SL_Firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      platform: 'Windows 10',
      version: 'latest',
      ...SAUCE_TIMEOUT_CONFIG,
    },
    SL_Firefox_Beta: {
      base: 'SauceLabs',
      browserName: 'firefox',
      platform: 'Windows 10',
      version: 'beta',
      ...SAUCE_TIMEOUT_CONFIG,
    },
    SL_Safari_12: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'macOS 10.13',
      version: '12.1',
      ...SAUCE_TIMEOUT_CONFIG,
    },
    SL_Safari_11: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'macOS 10.13',
      version: '11.1',
      ...SAUCE_TIMEOUT_CONFIG,
    },
    SL_Edge: {
      base: 'SauceLabs',
      browserName: 'MicrosoftEdge',
      platform: 'Windows 10',
      ...SAUCE_TIMEOUT_CONFIG,
    },
    SL_IE: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 10',
      ...SAUCE_TIMEOUT_CONFIG,
    },
  },

  sauceLabs: {
    testName: 'AMP HTML on Sauce',
    // Identifier used in build-system/sauce_connect/start_sauce_connect.sh.
    tunnelIdentifier: isTravisBuild() ? travisJobNumber() : gitCommitterEmail(),
    startConnect: false,
    connectOptions: {
      noSslBumpDomains: 'all',
    },
  },

  client: {
    mocha: {
      reporter: 'html',
      // Longer timeout on Travis; fail quickly during local runs.
      timeout: isTravisBuild() ? 10000 : 2000,
      // Run tests up to 3 times before failing them on Travis.
      retries: isTravisBuild() ? 2 : 0,
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
  // on Travis before stalling out after 10 minutes.
  browserDisconnectTimeout: 2 * 60 * 1000,

  // If there's no message from the browser, make Karma wait 2 minutes
  // until it disconnects.
  browserNoActivityTimeout: 2 * 60 * 1000,

  // IF YOU CHANGE THIS, DEBUGGING WILL RANDOMLY KILL THE BROWSER
  browserDisconnectTolerance: isTravisBuild() ? 2 : 0,

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
    'karma-source-map-support',
    'karma-super-dots-reporter',
    {
      'middleware:custom': [
        'factory',
        function() {
          return require(require.resolve('../server/app.js'));
        },
      ],
    },
  ],
};
