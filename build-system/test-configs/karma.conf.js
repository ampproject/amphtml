'use strict';

const {dotWrappingWidth} = require('../common/logging');
const {isCiBuild} = require('../common/ci.mjs');

const TEST_SERVER_PORT = 8081;

module.exports = {
  frameworks: ['fixture', 'mocha', 'source-map-support'],

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
    'karma-chrome-launcher',
    'karma-esbuild',
    'karma-firefox-launcher',
    'karma-fixture',
    'karma-html2js-preprocessor',
    'karma-ie-launcher',
    'karma-structured-json-reporter',
    'karma-junit-reporter',
    'karma-mocha',
    'karma-mocha-reporter',
    'karma-safarinative-launcher',
    'karma-source-map-support',
    'karma-spec-reporter',
    'karma-super-dots-reporter',
  ],
};
