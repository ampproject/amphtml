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
const {cyan, green, red, yellow} = require('../../common/colors');
const {dotWrappingWidth} = require('../../common/logging');
const {getEsbuildBabelPlugin} = require('../../common/esbuild-babel');
const {getFilesFromArgv} = require('../../common/utils');
const {isCiBuild, isCircleciBuild} = require('../../common/ci');
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
 * Consumes {@link karmaConfig} and dynamically populates fields based on test
 * type and command line arguments.
 */
class RuntimeTestConfig {
  /** @type {Array<string|Record<string, [string, *]>>} */
  plugins = [];

  /**@type {Record<string, string|string[]>} */
  preprocessors = {};

  /** @type {string[]} */
  reporters = [];

  client = {};

  /**
   * @param {string} testType
   */
  constructor(testType) {
    this.testType = testType;
    /**
     * TypeScript is used for typechecking here and is unable to infer the type
     * after using Object.assign. This results in errors relating properties of
     * which can never be `null` being treated as though they could be.
     */
    Object.assign(this, karmaConfig);
    this.updateBrowsers();
    this.updateReporters();
    this.updateFiles();
    this.updatePreprocessors();
    this.updateEsbuildConfig();
    this.updateClient();
    this.updateMiddleware();
    this.updateCoverageSettings();
  }

  /**
   * Updates the set of preprocessors to run on HTML and JS files before testing.
   * Notes:
   * - The HTML transform is lazy-required because the server is built at startup.
   * - We must use babel on windows until esbuild can natively downconvert to ES5.
   */
  updatePreprocessors() {
    const createHtmlTransformer = function () {
      return function (content, _file, done) {
        if (!transform) {
          const outputDir = `../../../${SERVER_TRANSFORM_PATH}/dist/transform`;
          transform = require(outputDir).transformSync;
        }
        done(transform(content));
      };
    };
    createHtmlTransformer.$inject = [];
    this.plugins.push({
      'preprocessor:htmlTransformer': ['factory', createHtmlTransformer],
    });
    this.preprocessors[karmaHtmlFixturesPath] = ['htmlTransformer', 'html2js'];
    for (const karmaJsPath of karmaJsPaths) {
      this.preprocessors[karmaJsPath] = ['esbuild'];
    }
  }

  /**
   * Updates the browsers based off of the test type
   * being run (unit, integration, a4a) and test settings.
   * Defaults to Chrome if no matching settings are found.
   */
  updateBrowsers() {
    if (argv.edge) {
      Object.assign(this, {
        browsers: [argv.headless ? 'EdgeHeadless' : 'Edge'],
      });
      return;
    }

    if (argv.firefox) {
      Object.assign(this, {
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
      Object.assign(this, {
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
      Object.assign(this, {browsers: ['SafariNative']});
      return;
    }

    if (argv.chrome_canary) {
      Object.assign(this, {browsers: ['ChromeCanary']});
      return;
    }

    if (argv.chrome_flags) {
      const chromeFlags = [];
      argv.chrome_flags.split(',').forEach((flag) => {
        chromeFlags.push('--'.concat(flag));
      });
      Object.assign(this, {
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
      Object.assign(this, {browsers: ['Chrome_no_extensions_headless']});
      return;
    }

    // Default to Chrome.
    Object.assign(this, {
      browsers: [isCiBuild() ? 'Chrome_ci' : 'Chrome_no_extensions'],
    });
  }

  /**
   * Adds reporters to the default karma spec per test settings.
   * Overrides default reporters for verbose settings.
   */
  updateReporters() {
    if (
      (argv.testnames || argv.local_changes || argv.files || argv.verbose) &&
      !isCiBuild()
    ) {
      this.reporters = ['mocha'];
    }

    if (isCircleciBuild()) {
      this.reporters.push('junit');
      this.junitReporter = {
        outputFile: `result-reports/${this.testType}.xml`,
        useBrowserName: false,
      };
    }

    if (argv.coverage) {
      this.reporters.push('coverage-istanbul');
    }

    if (argv.report) {
      this.reporters.push('json-result');
      this.jsonResultReporter = {
        outputFile: `result-reports/${this.testType}.json`,
      };
    }
  }

  /**
   * Computes the set of files for Karma to load based on factors like test type,
   * target browser, and flags.
   */
  updateFiles() {
    switch (this.testType) {
      case 'unit':
        if (argv.files) {
          this.files = commonUnitTestPaths.concat(getFilesFromArgv());
          return;
        }
        if (argv.firefox || argv.safari || argv.edge) {
          this.files = commonUnitTestPaths.concat(unitTestCrossBrowserPaths);
          return;
        }
        if (argv.local_changes) {
          this.files = commonUnitTestPaths.concat(unitTestsToRun());
          return;
        }
        this.files = commonUnitTestPaths.concat(unitTestPaths);
        return;

      case 'integration':
        if (argv.files) {
          this.files = commonIntegrationTestPaths.concat(getFilesFromArgv());
          return;
        }
        this.files = commonIntegrationTestPaths.concat(integrationTestPaths);
        return;

      default:
        throw new Error(`Test type ${this.testType} was not recognized`);
    }
  }

  /**
   * Logs a message indicating the start of babel transforms.
   */
  logBabelStart() {
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
  printBabelDot() {
    process.stdout.write('.');
    if (++wrapCounter >= dotWrappingWidth) {
      wrapCounter = 0;
      process.stdout.write('\n');
    }
  }

  /**
   * Updates the esbuild config in the karma spec so esbuild can run with it.
   */
  updateEsbuildConfig() {
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
      /* preSetup */ this.logBabelStart,
      /* postLoad */ this.printBabelDot
    );
    this.esbuild = {
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
   */
  updateClient() {
    this.singleRun = !argv.watch;
    this.client.mocha.grep = !!argv.grep;
    this.client.verboseLogging = !!argv.verbose;
    this.client.captureConsole = !!argv.verbose || !!argv.files;
    this.client.amp = {
      useCompiledJs: !!argv.compiled,
      adTypes: getAdTypes(),
      mochaTimeout: this.client.mocha.timeout,
      testServerPort: this.client.testServerPort,
      isModuleBuild: !!argv.esm, // Used by skip matchers in _init_tests.js
    };
  }

  /**
   * Inserts the AMP dev server into the middleware used by the Karma server.
   */
  updateMiddleware() {
    const createDevServerMiddleware = function () {
      return require(require.resolve('../../server/app.js'));
    };
    this.plugins.push({
      'middleware:devServer': ['factory', createDevServerMiddleware],
    });
    this.beforeMiddleware = ['devServer'];
  }

  /**
   * Updates the Karma config to gather coverage info if coverage is enabled.
   */
  updateCoverageSettings() {
    if (argv.coverage) {
      this.plugins.push('karma-coverage-istanbul-reporter');
      this.coverageIstanbulReporter = {
        dir: 'test/coverage',
        reports: isCiBuild() ? ['lcovonly'] : ['html', 'text', 'text-summary'],
        'report-config': {lcovonly: {file: `lcov-${this.testType}.info`}},
      };
    }
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
    exitCtrlcHandler(/** @type {Map} */ (this.env).get('handlerProcess'));
    if (this.exitCode != 0) {
      const message = `Karma test failed with exit code ${this.exitCode}`;
      log(red('ERROR:'), yellow(message));
      throw new Error(message);
    }
  }
}

module.exports = {
  RuntimeTestRunner,
  RuntimeTestConfig,
};
