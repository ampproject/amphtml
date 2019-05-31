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
const deglob = require('globs-to-files');
const findImports = require('find-imports');
const fs = require('fs');
const gulp = require('gulp');
const log = require('fancy-log');
const minimatch = require('minimatch');
const opn = require('opn');
const path = require('path');
const webserver = require('gulp-webserver');

const {
  reportTestErrored,
  reportTestFinished,
  reportTestSkipped,
  reportTestStarted,
} = require('../report-test-status');
const {app} = require('../../test-server');
const {exec} = require('../../exec');
const {gitDiffNameOnlyMaster} = require('../../git');
const {green, yellow, cyan, red} = require('ansi-colors');
const {isTravisBuild} = require('../../travis');
const {Server} = require('karma');

const BATCHSIZE = 4; // Number of Sauce Lab browsers
const EXTENSIONSCSSMAP = 'EXTENSIONS_CSS_MAP';
const LARGE_REFACTOR_THRESHOLD = 50;
const ROOT_DIR = path.resolve(__dirname, '../../../');

const CHROMEBASE = argv.chrome_canary ? 'ChromeCanary' : 'Chrome';
const chromeFlags = [];

/**
 * Extracts a mapping from CSS files to JS files from a well known file
 * generated during `gulp css`.
 *
 * @return {!Object<string, string>}
 */
function extractCssJsFileMap() {
  //TODO(estherkim): consolidate arg validation logic
  if (!fs.existsSync(EXTENSIONSCSSMAP)) {
    log(red('ERROR:'), 'Could not find the file', cyan(EXTENSIONSCSSMAP) + '.');
    log('Make sure', cyan('gulp css'), 'was run prior to this.');
    process.exit();
  }

  const extensionsCssMap = fs.readFileSync(EXTENSIONSCSSMAP, 'utf8');
  const extensionsCssMapJson = JSON.parse(extensionsCssMap);
  const extensions = Object.keys(extensionsCssMapJson);
  const cssJsFileMap = {};

  // Adds an entry that maps a CSS file to a JS file
  function addCssJsEntry(cssData, cssBinaryName, cssJsFileMap) {
    const cssFilePath =
      `extensions/${cssData['name']}/${cssData['version']}/` +
      `${cssBinaryName}.css`;
    const jsFilePath = `build/${cssBinaryName}-${cssData['version']}.css.js`;
    cssJsFileMap[cssFilePath] = jsFilePath;
  }

  extensions.forEach(extension => {
    const cssData = extensionsCssMapJson[extension];
    if (cssData['hasCss']) {
      addCssJsEntry(cssData, cssData['name'], cssJsFileMap);
      if (cssData.hasOwnProperty('cssBinaries')) {
        const cssBinaries = cssData['cssBinaries'];
        cssBinaries.forEach(cssBinary => {
          addCssJsEntry(cssData, cssBinary, cssJsFileMap);
        });
      }
    }
  });
  return cssJsFileMap;
}

/**
 * Returns an array of ad types.
 * @return {!Array<string>}
 */
function getAdTypes() {
  const namingExceptions = {
    // We recommend 3P ad networks use the same string for filename and type.
    // Write exceptions here in alphabetic order.
    // filename: [type1, type2, ... ]
    adblade: ['adblade', 'industrybrains'],
    mantis: ['mantis-display', 'mantis-recommend'],
    weborama: ['weborama-display'],
  };

  // Start with Google ad types
  const adTypes = ['adsense'];

  // Add all other ad types
  const files = fs.readdirSync('./ads/');
  for (let i = 0; i < files.length; i++) {
    if (
      path.extname(files[i]) == '.js' &&
      files[i][0] != '_' &&
      files[i] != 'ads.extern.js'
    ) {
      const adType = path.basename(files[i], '.js');
      const expanded = namingExceptions[adType];
      if (expanded) {
        for (let j = 0; j < expanded.length; j++) {
          adTypes.push(expanded[j]);
        }
      } else {
        adTypes.push(adType);
      }
    }
  }
  return adTypes;
}

/**
 * Returns the list of files imported by a JS file
 *
 * @param {string} jsFile
 * @return {!Array<string>}
 */
function getImports(jsFile) {
  const imports = findImports([jsFile], {
    flatten: true,
    packageImports: false,
    absoluteImports: true,
    relativeImports: true,
  });
  const files = [];
  const jsFileDir = path.dirname(jsFile);
  imports.forEach(function(file) {
    const fullPath = path.resolve(jsFileDir, `${file}.js`);
    if (fs.existsSync(fullPath)) {
      const relativePath = path.relative(ROOT_DIR, fullPath);
      files.push(relativePath);
    }
  });
  return files;
}

/**
 * Retrieves the set of JS source files that import the given CSS file.
 *
 * @param {string} cssFile
 * @param {!Object<string, string>} cssJsFileMap
 * @return {!Array<string>}
 */
function getJsFilesFor(cssFile, cssJsFileMap) {
  const jsFiles = [];
  if (cssJsFileMap.hasOwnProperty(cssFile)) {
    const cssFileDir = path.dirname(cssFile);
    const jsFilesInDir = fs.readdirSync(cssFileDir).filter(file => {
      return path.extname(file) == '.js';
    });
    jsFilesInDir.forEach(jsFile => {
      const jsFilePath = `${cssFileDir}/${jsFile}`;
      if (getImports(jsFilePath).includes(cssJsFileMap[cssFile])) {
        jsFiles.push(jsFilePath);
      }
    });
  }
  return jsFiles;
}

function getUnitTestsToRun(unitTestPaths) {
  if (isLargeRefactor()) {
    log(
      green('INFO:'),
      'Skipping tests on local changes because this is a large refactor.'
    );
    reportTestSkipped();
    return;
  }

  const tests = unitTestsToRun(unitTestPaths);
  if (tests.length == 0) {
    log(
      green('INFO:'),
      'No unit tests were directly affected by local changes.'
    );
    reportTestSkipped();
    return;
  }

  log(green('INFO:'), 'Running the following unit tests:');
  tests.forEach(test => {
    log(cyan(test));
  });

  return tests;
}

/**
 * Extracts the list of unit tests to run based on the changes in the local
 * branch.
 *
 * @param {!Array<string>} unitTestPaths
 * @return {!Array<string>}
 */
function unitTestsToRun(unitTestPaths) {
  const cssJsFileMap = extractCssJsFileMap();
  const filesChanged = gitDiffNameOnlyMaster();
  const testsToRun = [];
  let srcFiles = [];

  function isUnitTest(file) {
    return unitTestPaths.some(pattern => {
      return minimatch(file, pattern);
    });
  }

  function shouldRunTest(testFile, srcFiles) {
    const filesImported = getImports(testFile);
    return (
      filesImported.filter(function(file) {
        return srcFiles.includes(file);
      }).length > 0
    );
  }

  // Retrieves the set of unit tests that should be run
  // for a set of source files.
  function getTestsFor(srcFiles) {
    const allUnitTests = deglob.sync(unitTestPaths);
    return allUnitTests
      .filter(testFile => {
        return shouldRunTest(testFile, srcFiles);
      })
      .map(fullPath => path.relative(ROOT_DIR, fullPath));
  }

  filesChanged.forEach(file => {
    if (!fs.existsSync(file)) {
      if (!isTravisBuild()) {
        log(green('INFO:'), 'Skipping', cyan(file), 'because it was deleted');
      }
    } else if (isUnitTest(file)) {
      testsToRun.push(file);
    } else if (path.extname(file) == '.js') {
      srcFiles.push(file);
    } else if (path.extname(file) == '.css') {
      srcFiles = srcFiles.concat(getJsFilesFor(file, cssJsFileMap));
    }
  });

  if (srcFiles.length > 0) {
    log(green('INFO:'), 'Determining which unit tests to run...');
    const moreTestsToRun = getTestsFor(srcFiles);
    moreTestsToRun.forEach(test => {
      if (!testsToRun.includes(test)) {
        testsToRun.push(test);
      }
    });
  }
  return testsToRun;
}

/**
 * Mitigates https://github.com/karma-runner/karma-sauce-launcher/issues/117
 * by refreshing the wd cache so that Karma can launch without an error.
 */
function refreshKarmaWdCache() {
  exec('node ./node_modules/wd/scripts/build-browser-scripts.js');
}

/**
 * Returns true if the PR is a large refactor.
 * (Used to skip testing local changes.)
 * @return {boolean}
 */
function isLargeRefactor() {
  const filesChanged = gitDiffNameOnlyMaster();
  return filesChanged.length >= LARGE_REFACTOR_THRESHOLD;
}

function getBrowserConfig() {
  const chromeFlags = [];
  if (argv.chrome_flags) {
    argv.chrome_flags.split(',').forEach(flag => {
      chromeFlags.push('--'.concat(flag));
    });
  }

  const options = new Map();
  options
    .set('chrome_canary', {browsers: ['ChromeCanary']})
    .set('chrome_flags', {
      browsers: ['Chrome_flags'],
      customLaunchers: {
        // eslint-disable-next-line google-camelcase/google-camelcase
        Chrome_flags: {
          base: 'Chrome',
          flags: chromeFlags,
        },
      },
    })
    .set('edge', {browsers: ['Edge']})
    .set('firefox', {browsers: ['Firefox']})
    .set('headless', {browsers: ['Chrome_no_extensions_headless']})
    .set('ie', {
      browsers: ['IE'],
      customLaunchers: {
        IeNoAddOns: {
          base: 'IE',
          flags: ['-extoff'],
        },
      },
    })
    .set('safari', {browsers: ['Safari']})
    .set('saucelabs', {
      browsers: [
        'SL_Chrome',
        'SL_Firefox',
        'SL_Edge_17',
        'SL_Safari_12',
        'SL_IE_11',
        // TODO(amp-infra): Evaluate and add more platforms here.
        //'SL_Chrome_Android_7',
        //'SL_iOS_11',
        //'SL_iOS_12',
        'SL_Chrome_Beta',
        'SL_Firefox_Beta',
      ],
    })
    .set('saucelabs_lite', {browsers: ['SL_Safari_12', 'SL_Firefox']});

  for (const key of Array.from(options.keys())) {
    if (argv[key]) {
      return options.get(key);
    }
  }
}

/**
 * Prints help messages for args if tests are being run for local development.
 */
function maybePrintArgvMessages() {
  if (argv.nohelp) {
    return;
  }

  const argvMessages = {
    safari: 'Running tests on Safari.',
    firefox: 'Running tests on Firefox.',
    ie: 'Running tests on IE.',
    edge: 'Running tests on Edge.',
    'chrome_canary': 'Running tests on Chrome Canary.',
    saucelabs: 'Running integration tests on Sauce Labs browsers.',
    saucelabs_lite: 'Running tests on a subset of Sauce Labs browsers.', // eslint-disable-line google-camelcase/google-camelcase
    nobuild: 'Skipping build.',
    watch:
      'Enabling watch mode. Editing and saving a file will cause the' +
      ' tests for that file to be re-run in the same browser instance.',
    verbose: 'Enabling verbose mode. Expect lots of output!',
    testnames: 'Listing the names of all tests being run.',
    files: 'Running tests in the file(s): ' + cyan(argv.files),
    integration:
      'Running only the integration tests. Prerequisite: ' +
      cyan('gulp dist --fortesting'),
    unit: 'Running only the unit tests. Prerequisite: ' + cyan('gulp css'),
    a4a: 'Running only A4A tests.',
    compiled: 'Running tests against minified code.',
    grep:
      'Only running tests that match the pattern "' + cyan(argv.grep) + '".',
    coverage: 'Running tests in code coverage mode.',
    headless: 'Running tests in a headless Chrome window.',
    // eslint-disable-next-line google-camelcase/google-camelcase
    local_changes:
      'Running unit tests directly affected by the files' +
      ' changed in the local branch.',
  };
  if (argv.chrome_flags) {
    log(
      green('Launching'),
      cyan(CHROMEBASE),
      green('with flags'),
      cyan(chromeFlags)
    );
  }
  if (!isTravisBuild()) {
    log(
      green('Run'),
      cyan('gulp help'),
      green('to see a list of all test flags.')
    );
    log(green('⤷ Use'), cyan('--nohelp'), green('to silence these messages.'));
    if (
      !argv.unit &&
      !argv.integration &&
      !argv.files &&
      !argv.a4a &&
      !argv['local-changes']
    ) {
      log(green('Running all tests.'));
      log(
        green('⤷ Use'),
        cyan('--unit'),
        green('or'),
        cyan('--integration'),
        green('to run just the unit tests or integration tests.')
      );
      log(
        green('⤷ Use'),
        cyan('--local-changes'),
        green('to run unit tests from files commited to the local branch.')
      );
    }
    if (!argv.testnames && !argv.files && !argv.local_changes) {
      log(
        green('⤷ Use'),
        cyan('--testnames'),
        green('to see the names of all tests being run.')
      );
    }
    if (!argv.headless) {
      log(
        green('⤷ Use'),
        cyan('--headless'),
        green('to run tests in a headless Chrome window.')
      );
    }
    if (!argv.compiled) {
      log(green('Running tests against unminified code.'));
    }
    Object.keys(argv).forEach(arg => {
      const message = argvMessages[arg];
      if (message) {
        log(yellow(`--${arg}:`), green(message));
      }
    });
  }
}

function maybePrintCoverageMessage() {
  if (!argv.coverage || isTravisBuild()) {
    return;
  }

  const url = 'file://' + path.resolve('test/coverage/index.html');
  log(green('INFO:'), 'Generated code coverage report at', cyan(url));
  opn(url, {wait: false});
}

function maybeSetCoverageConfig(config, reportName) {
  if (!argv.coverage) {
    return;
  }

  config.plugins.push('karma-coverage-istanbul-reporter');
  config.coverageIstanbulReporter = {
    dir: 'test/coverage',
    reports: isTravisBuild() ? ['lcovonly'] : ['html', 'text', 'text-summary'],
    'report-config': {lcovonly: {file: reportName}},
  };

  config.browserify.transform = [
    [
      'babelify',
      {
        plugins: [
          [
            'istanbul',
            {
              exclude: [
                'ads/**/*.js',
                'third_party/**/*.js',
                'test/**/*.js',
                'extensions/**/test/**/*.js',
                'testing/**/*.js',
              ],
            },
          ],
        ],
      },
    ],
  ];
}

function karmaBrowserComplete(browser) {
  const result = browser.lastResult;
  // Prevent cases where Karma detects zero tests and still passes. #16851.
  if (result.total == 0) {
    log(red('ERROR: Zero tests detected by Karma.'));
    log(red(JSON.stringify(result)));
    reportTestErrored().finally(() => {
      if (!argv.watch) {
        process.exit(1);
      }
    });
  }
  // Print a summary for each browser as soon as tests complete.
  let message =
    `${browser.name}: Executed ` +
    `${result.success + result.failed} of ${result.total} ` +
    `(Skipped ${result.skipped}) `;
  if (result.failed === 0) {
    message += green('SUCCESS');
  } else {
    message += red(result.failed + ' FAILED');
  }
  message += '\n';
  console./*OK*/ log('\n');
  log(message);
}

function karmaBrowsersReady() {
  console./*OK*/ log('\n');
  log(green('Done. Running tests...'));
}

function karmaRunComplete(results) {
  if (results.error) {
    reportTestErrored();
  } else {
    reportTestFinished(results.success, results.failed);
  }
}

function karmaRunStart() {
  if (!argv.saucelabs && !argv.saucelabs_lite) {
    log(green('Running tests locally...'));
  }
  reportTestStarted();
}

function startTestServer(port) {
  const server = gulp.src(process.cwd(), {base: '.'}).pipe(
    webserver({
      port,
      host: 'localhost',
      directoryListing: true,
      middleware: [app],
    }).on('kill', function() {
      log(yellow(`Shutting down test responses server on localhost:${port}`));
    })
  );
  log(yellow(`Started test responses server on localhost:${port}`));

  return server;
}

/**
 * Runs tests in batches.
 *
 * Splits stable and beta browsers to separate batches. Test failures in any
 * of the stable browsers will return an exit code of 1, whereas test failures
 * in any of the beta browsers will only print error messages, but will return
 * an exit code of 0.
 *
 * @param {Object} config karma config
 * @return {number} exitCode
 */
async function runTestInBatches(config) {
  const browsers = {stable: [], beta: []};
  for (const browserId of config.browsers) {
    browsers[
      browserId.toLowerCase().endsWith('_beta') ? 'beta' : 'stable'
    ].push(browserId);
  }
  if (browsers.stable.length) {
    const allBatchesExitCodes = await runTestInBatchesWithBrowsers(
      'stable',
      browsers.stable,
      config
    );
    if (allBatchesExitCodes) {
      log(
        yellow('Some tests have failed on'),
        cyan('stable'),
        yellow('browsers, so skipping running them on'),
        cyan('beta'),
        yellow('browsers.')
      );
      return allBatchesExitCodes;
    }
  }

  if (browsers.beta.length) {
    const allBatchesExitCodes = await runTestInBatchesWithBrowsers(
      'beta',
      browsers.beta
    );
    if (allBatchesExitCodes) {
      log(
        yellow('Some tests have failed on'),
        cyan('beta'),
        yellow('browsers.')
      );
      log(
        yellow('This is not currently a fatal error, but will become an'),
        yellow('error once the beta browsers are released as next stable'),
        yellow('version!')
      );
    }
  }

  return 0;
}

/**
 * Runs tests in named batch(es), with the specified browsers.
 *
 * @param {string} batchName a human readable name for the batch.
 * @param {!Array{string}} browsers list of SauceLabs browsers as
 *     customLaunchers IDs.
 * @param {Object} config karma config
 * @return {number} processExitCode
 */
async function runTestInBatchesWithBrowsers(batchName, browsers, config) {
  let batch = 1;
  let startIndex = 0;
  let endIndex = BATCHSIZE;
  const batchExitCodes = [];

  log(
    green('Running tests on'),
    cyan(browsers.length),
    green('Sauce Labs'),
    cyan(batchName),
    green('browser(s)...')
  );
  while (startIndex < endIndex) {
    const configBatch = Object.assign({}, config);
    configBatch.browsers = browsers.slice(startIndex, endIndex);
    log(
      green('Batch'),
      cyan(`#${batch}`) + green(': Running tests on'),
      cyan(configBatch.browsers.length),
      green('Sauce Labs browser(s)...')
    );
    batchExitCodes.push(await createKarmaServer(configBatch));
    startIndex = batch * BATCHSIZE;
    batch++;
    endIndex = Math.min(batch * BATCHSIZE, browsers.length);
  }

  return batchExitCodes.every(exitCode => exitCode == 0) ? 0 : 1;
}

async function createKarmaServer(config) {
  let resolver;
  const deferred = new Promise(resolverIn => {
    resolver = resolverIn;
  });

  const karmaServer = new Server(config, exitCode => {
    maybePrintCoverageMessage();
    resolver(exitCode);
  });

  karmaServer
    .on('run_start', () => karmaRunStart())
    .on('browsers_ready', () => karmaBrowsersReady())
    .on('browser_complete', browser => karmaBrowserComplete(browser))
    .on('run_complete', (unusedBrowsers, results) => karmaRunComplete(results));

  karmaServer.start();

  return deferred;
}

module.exports = {
  createKarmaServer,
  getAdTypes,
  getBrowserConfig,
  getUnitTestsToRun,
  isLargeRefactor,
  maybeSetCoverageConfig,
  maybePrintArgvMessages,
  refreshKarmaWdCache,
  runTestInBatches,
  startTestServer,
  unitTestsToRun,
};
