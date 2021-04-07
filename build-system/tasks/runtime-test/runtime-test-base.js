/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
const karmaConfig = require('../../test-configs/karma.conf');
const {
  commonIntegrationTestPaths,
  commonUnitTestPaths,
  integrationTestPaths,
  karmaHtmlFixturesPath,
  karmaJsPaths,
  unitTestCrossBrowserPaths,
  unitTestPaths,
} = require('../../test-configs/config');
const {
  createCtrlcHandler,
  exitCtrlcHandler,
} = require('../../common/ctrlcHandler');
const {app} = require('../../server/test-server');
const {createKarmaServer, getAdTypes} = require('./helpers');
const {cyan, green, red, yellow} = require('kleur/colors');
const {dotWrappingWidth} = require('../../common/logging');
const {getEsbuildBabelPlugin} = require('../../common/esbuild-babel');
const {getFilesFromArgv} = require('../../common/utils');
const {isCiBuild} = require('../../common/ci');
const {log} = require('../../common/logging');
const {reportTestStarted} = require('../report-test-status');
const {SERVER_TRANSFORM_PATH} = require('../../server/typescript-compile');
const {startServer, stopServer} = require('../serve');
const {unitTestsToRun} = require('./helpers-unit');

/**
 * Used to print dots during esbuild + babel transforms
 */
let wrapCounter = 0;

/**
 * Used to lazy-require the HTML transformer function after the server is built.
 */
let transform;

/**
 * Updates the set of preprocessors to run on HTML and JS files before testing.
 * Notes:
 * - The HTML transform is lazy-required because the server is built at startup.
 * - We must use babel on windows until esbuild can natively downconvert to ES5.
 * @param {!RuntimeTestConfig} config
 */
function updatePreprocessors(config) {
  const createHtmlTransformer = function () {
    return function (content, file, done) {
      if (!transform) {
        const outputDir = `../../../${SERVER_TRANSFORM_PATH}/dist/transform`;
        transform = require(outputDir).transformSync;
      }
      done(transform(content));
    };
  };
  createHtmlTransformer.$inject = [];
  config.plugins.push({
    'preprocessor:htmlTransformer': ['factory', createHtmlTransformer],
  });
  config.preprocessors[karmaHtmlFixturesPath] = ['htmlTransformer', 'html2js'];
  for (const karmaJsPath of karmaJsPaths) {
    config.preprocessors[karmaJsPath] = ['esbuild'];
  }
}

/**
 * Updates the browsers based off of the test type
 * being run (unit, integration, a4a) and test settings.
 * Defaults to Chrome if no matching settings are found.
 * @param {!RuntimeTestConfig} config
 */
function updateBrowsers(config) {
  if (argv.edge) {
    Object.assign(config, {
      browsers: [argv.headless ? 'EdgeHeadless' : 'Edge'],
    });
    return;
  }

  if (argv.firefox) {
    Object.assign(config, {
      browsers: ['Firefox_flags'],
      customLaunchers: {
        // eslint-disable-next-line
        Firefox_flags: {
          base: 'Firefox',
          flags: argv.headless ? ['-headless'] : [],
        },
      },
    });
    return;
  }

  if (argv.ie) {
    Object.assign(config, {
      browsers: ['IE'],
      customLaunchers: {
        IeNoAddOns: {
          base: 'IE',
          flags: ['-extoff'],
        },
      },
    });
    return;
  }

  if (argv.safari) {
    Object.assign(config, {browsers: ['SafariNative']});
    return;
  }

  if (argv.chrome_canary) {
    Object.assign(config, {browsers: ['ChromeCanary']});
    return;
  }

  if (argv.chrome_flags) {
    const chromeFlags = [];
    argv.chrome_flags.split(',').forEach((flag) => {
      chromeFlags.push('--'.concat(flag));
    });
    Object.assign(config, {
      browsers: ['Chrome_flags'],
      customLaunchers: {
        // eslint-disable-next-line
        Chrome_flags: {
          base: 'Chrome',
          flags: chromeFlags,
        },
      },
    });
    return;
  }

  if (argv.headless) {
    Object.assign(config, {browsers: ['Chrome_no_extensions_headless']});
    return;
  }

  // Default to Chrome.
  Object.assign(config, {
    browsers: [isCiBuild() ? 'Chrome_ci' : 'Chrome_no_extensions'],
  });
}

/**
 * Adds reporters to the default karma spec per test settings.
 * Overrides default reporters for verbose settings.
 * @param {!RuntimeTestConfig} config
 */
function updateReporters(config) {
  if (
    (argv.testnames || argv.local_changes || argv.files || argv.verbose) &&
    !isCiBuild()
  ) {
    config.reporters = ['mocha'];
  }

  if (argv.coverage) {
    config.reporters.push('coverage-istanbul');
  }

  if (argv.report) {
    config.reporters.push('json-result');
    config.jsonResultReporter = {
      outputFile: `result-reports/${config.testType}.json`,
    };
  }
}

/**
 * Computes the set of files for Karma to load based on factors like test type,
 * target browser, and flags.
 * @param {!RuntimeTestConfig} config
 */
function updateFiles(config) {
  switch (config.testType) {
    case 'unit':
      if (argv.files) {
        config.files = commonUnitTestPaths.concat(getFilesFromArgv());
        return;
      }
      if (argv.firefox || argv.safari || argv.edge) {
        config.files = commonUnitTestPaths.concat(unitTestCrossBrowserPaths);
        return;
      }
      if (argv.local_changes) {
        config.files = commonUnitTestPaths.concat(unitTestsToRun());
        return;
      }
      config.files = commonUnitTestPaths.concat(unitTestPaths);
      return;

    case 'integration':
      if (argv.files) {
        config.files = commonIntegrationTestPaths.concat(getFilesFromArgv());
        return;
      }
      config.files = commonIntegrationTestPaths.concat(integrationTestPaths);
      return;

    default:
      throw new Error(`Test type ${config.testType} was not recognized`);
  }
}

/**
 * Logs a message indicating the start of babel transforms.
 */
function logBabelStart() {
  wrapCounter = 0;
  log(
    green('Transforming tests with'),
    cyan('esbuild'),
    green('and'),
    cyan('babel') + green('...')
  );
}

/**
 * Prints a dot for every babel transform, with wrapping if needed.
 */
function printBabelDot() {
  process.stdout.write('.');
  if (++wrapCounter >= dotWrappingWidth) {
    wrapCounter = 0;
    process.stdout.write('\n');
  }
}

/**
 * Updates the esbuild config in the karma spec so esbuild can run with it.
 * @param {!RuntimeTestConfig} config
 */
function updateEsbuildConfig(config) {
  const importPathPlugin = {
    name: 'import-path',
    setup(build) {
      build.onResolve({filter: /^[\w-]+$/}, (file) => {
        if (file.path === 'stream') {
          return {path: require.resolve('stream-browserify'), namespace: ''};
        }
      });
    },
  };
  const babelPlugin = getEsbuildBabelPlugin(
    /* callerName */ 'test',
    /* enableCache */ true,
    /* preSetup */ logBabelStart,
    /* postLoad */ printBabelDot
  );
  config.esbuild = {
    target: 'es5',
    define: {
      'process.env.NODE_DEBUG': 'false',
      'process.env.NODE_ENV': '"test"',
    },
    plugins: [importPathPlugin, babelPlugin],
    sourcemap: 'inline',
  };
}

/**
 * Updates the client so that tests can access karma state. This is available in
 * the browser via window.parent.karma.config.
 * @param {!RuntimeTestConfig} config
 */
function updateClient(config) {
  config.singleRun = !argv.watch;
  config.client.mocha.grep = !!argv.grep;
  config.client.verboseLogging = !!argv.verbose;
  config.client.captureConsole = !!argv.verbose || !!argv.files;
  config.client.amp = {
    useCompiledJs: !!argv.compiled,
    adTypes: getAdTypes(),
    mochaTimeout: config.client.mocha.timeout,
    testServerPort: config.client.testServerPort,
    isModuleBuild: !!argv.esm, // Used by skip matchers in _init_tests.js
  };
}

/**
 * Inserts the AMP dev server into the middleware used by the Karma server.
 * @param {!RuntimeTestConfig} config
 */
function updateMiddleware(config) {
  const createDevServerMiddleware = function () {
    return require(require.resolve('../../server/app.js'));
  };
  config.plugins.push({
    'middleware:devServer': ['factory', createDevServerMiddleware],
  });
  config.beforeMiddleware = ['devServer'];
}

/**
 * Updates the Karma config to gather coverage info if coverage is enabled.
 * @param {!RuntimeTestConfig} config
 */
function updateCoverageSettings(config) {
  if (argv.coverage) {
    config.plugins.push('karma-coverage-istanbul-reporter');
    config.coverageIstanbulReporter = {
      dir: 'test/coverage',
      reports: isCiBuild() ? ['lcovonly'] : ['html', 'text', 'text-summary'],
      'report-config': {lcovonly: {file: `lcov-${config.testType}.info`}},
    };
  }
}

class RuntimeTestConfig {
  /**
   * @param {string} testType
   */
  constructor(testType) {
    this.testType = testType;
    Object.assign(this, karmaConfig);
    updateBrowsers(this);
    updateReporters(this);
    updateFiles(this);
    updatePreprocessors(this);
    updateEsbuildConfig(this);
    updateClient(this);
    updateMiddleware(this);
    updateCoverageSettings(this);
  }
}

class RuntimeTestRunner {
  /**
   *
   * @param {RuntimeTestConfig} config
   */
  constructor(config) {
    this.config = config;
    this.env = null;
    this.exitCode = 0;
  }

  /**
   * @return {Promise<void>}
   */
  async maybeBuild() {
    throw new Error('maybeBuild method must be overridden');
  }

  /**
   * @return {Promise<void>}
   */
  async setup() {
    await this.maybeBuild();
    await startServer({
      name: 'AMP Test Server',
      host: 'localhost',
      port: this.config.client.testServerPort,
      middleware: () => [app],
    });
    const handlerProcess = createCtrlcHandler(`amp ${this.config.testType}`);
    this.env = new Map().set('handlerProcess', handlerProcess);
  }

  /**
   * @return {Promise<void>}
   */
  async run() {
    await reportTestStarted();
    this.exitCode = await createKarmaServer(this.config);
  }

  /**
   * @return {Promise<void>}
   */
  async teardown() {
    await stopServer();
    exitCtrlcHandler(this.env.get('handlerProcess'));
    if (this.exitCode != 0) {
      log(
        red('ERROR:'),
        yellow(`Karma test failed with exit code ${this.exitCode}`)
      );
      process.exitCode = this.exitCode;
    }
  }
}

module.exports = {
  RuntimeTestRunner,
  RuntimeTestConfig,
};
