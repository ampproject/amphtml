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
const colors = require('ansi-colors');
const config = require('../config');
const deglob = require('globs-to-files');
const findImports = require('find-imports');
const fs = require('fs');
const gulp = require('gulp-help')(require('gulp'));
const Karma = require('karma').Server;
const karmaDefault = require('./karma.conf');
const log = require('fancy-log');
const minimatch = require('minimatch');
const opn = require('opn');
const path = require('path');
const webserver = require('gulp-webserver');
const {applyConfig, removeConfig} = require('./prepend-global/index.js');
const {app} = require('../test-server');
const {createCtrlcHandler, exitCtrlcHandler} = require('../ctrlcHandler');
const {exec} = require('../exec');
const {gitDiffNameOnlyMaster} = require('../git');

const {green, yellow, cyan, red, bold} = colors;

const preTestTasks = argv.nobuild ? [] : (
  (argv.unit || argv.a4a || argv['local-changes']) ? ['css'] : ['build']);
const ampConfig = (argv.config === 'canary') ? 'canary' : 'prod';
const tooManyTestsToFix = 15;
const extensionsCssMapPath = 'EXTENSIONS_CSS_MAP';

/**
 * Read in and process the configuration settings for karma
 * @return {!Object} Karma configuration
 */
function getConfig() {
  if (argv.safari) {
    return Object.assign({}, karmaDefault, {browsers: ['Safari']});
  }
  if (argv.firefox) {
    return Object.assign({}, karmaDefault, {browsers: ['Firefox']});
  }
  if (argv.edge) {
    return Object.assign({}, karmaDefault, {browsers: ['Edge']});
  }
  if (argv.ie) {
    return Object.assign({}, karmaDefault, {browsers: ['IE']});
  }
  if (argv.headless) {
    return Object.assign({}, karmaDefault,
        {browsers: ['Chrome_no_extensions_headless']});
  }
  if (argv.saucelabs || argv.saucelabs_lite) {
    if (!process.env.SAUCE_USERNAME) {
      throw new Error('Missing SAUCE_USERNAME Env variable');
    }
    if (!process.env.SAUCE_ACCESS_KEY) {
      throw new Error('Missing SAUCE_ACCESS_KEY Env variable');
    }
    return Object.assign({}, karmaDefault, {
      reporters: ['super-dots', 'saucelabs', 'karmaSimpleReporter'],
      browsers: argv.saucelabs ? [
        // With --saucelabs, integration tests are run on this set of browsers.
        'SL_Android_latest',
        'SL_Chrome_45',
        'SL_Chrome_android',
        'SL_Chrome_latest',
        'SL_Firefox_latest',
        'SL_Safari_latest',
        // TODO(rsimha, #15510): Enable these.
        // 'SL_iOS_latest',
        // 'SL_Edge_latest',
        // 'SL_IE_11',
      ] : [
        // With --saucelabs_lite, a subset of the unit tests are run.
        // Only browsers that support chai-as-promised may be included below.
        // TODO(rsimha-amp): Add more browsers to this list. #6039.
        'SL_Safari_latest',
      ],
    });
  }
  return karmaDefault;
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
    if (path.extname(files[i]) == '.js'
        && files[i][0] != '_' && files[i] != 'ads.extern.js') {
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
 * Mitigates https://github.com/karma-runner/karma-sauce-launcher/issues/117
 * by refreshing the wd cache so that Karma can launch without an error.
 */
function refreshKarmaWdCache() {
  exec('node ./node_modules/wd/scripts/build-browser-scripts.js');
}

/**
 * Prints help messages for args if tests are being run for local development.
 */
function printArgvMessages() {
  const argvMessages = {
    safari: 'Running tests on Safari.',
    firefox: 'Running tests on Firefox.',
    ie: 'Running tests on IE.',
    edge: 'Running tests on Edge.',
    saucelabs: 'Running integration tests on Sauce Labs browsers.',
    saucelabs_lite: 'Running tests on a subset of Sauce Labs browsers.', // eslint-disable-line google-camelcase/google-camelcase
    nobuild: 'Skipping build.',
    watch: 'Enabling watch mode. Editing and saving a file will cause the' +
        ' tests for that file to be re-run in the same browser instance.',
    verbose: 'Enabling verbose mode. Expect lots of output!',
    testnames: 'Listing the names of all tests being run.',
    files: 'Running tests in the file(s): ' + cyan(argv.files),
    integration: 'Running only the integration tests. Prerequisite: ' +
        cyan('gulp build'),
    unit: 'Running only the unit tests. Prerequisite: ' + cyan('gulp css'),
    a4a: 'Running only A4A tests.',
    compiled: 'Running tests against minified code.',
    grep: 'Only running tests that match the pattern "' +
        cyan(argv.grep) + '".',
    coverage: 'Running tests in code coverage mode.',
    headless: 'Running tests in a headless Chrome window.',
    'local-changes': 'Running unit tests directly affected by the files' +
        ' changed in the local branch.',
  };
  if (!process.env.TRAVIS) {
    log(green('Run'), cyan('gulp help'),
        green('to see a list of all test flags.'));
    log(green('⤷ Use'), cyan('--nohelp'),
        green('to silence these messages.'));
    if (!argv.unit && !argv.integration && !argv.files && !argv.a4a &&
        !argv['local-changes']) {
      log(green('Running all tests.'));
      log(green('⤷ Use'), cyan('--unit'), green('or'), cyan('--integration'),
          green('to run just the unit tests or integration tests.'));
      log(green('⤷ Use'), cyan('--local-changes'),
          green('to run unit tests from files commited to the local branch.'));
    }
    if (!argv.testnames && !argv.files && !argv['local-changes']) {
      log(green('⤷ Use'), cyan('--testnames'),
          green('to see the names of all tests being run.'));
    }
    if (!argv.headless) {
      log(green('⤷ Use'), cyan('--headless'),
          green('to run tests in a headless Chrome window.'));
    }
    if (!argv.compiled) {
      log(green('Running tests against unminified code.'));
    }
    Object.keys(argv).forEach(arg => {
      const message = argvMessages[arg];
      if (message) {
        log(yellow('--' + arg + ':'), green(message));
      }
    });
  }
}

/**
 * Applies the prod or canary AMP config to the AMP runtime.
 * @return {Promise}
 */
function applyAmpConfig() {
  if (argv.unit || argv.a4a) {
    return Promise.resolve();
  }
  if (!process.env.TRAVIS) {
    log(green('Setting the runtime\'s AMP config to'), cyan(ampConfig));
  }
  return writeConfig('dist/amp.js').then(() => {
    return writeConfig('dist/v0.js');
  });
}

/**
 * Writes the prod or canary AMP config to file.
 * @param {string} targetFile File to which the config is to be written.
 * @return {Promise}
 */
function writeConfig(targetFile) {
  const configFile =
      'build-system/global-configs/' + ampConfig + '-config.json';
  if (fs.existsSync(targetFile)) {
    return removeConfig(targetFile).then(() => {
      return applyConfig(
          ampConfig, targetFile, configFile,
          /* opt_localDev */ true, /* opt_localBranch */ true);
    });
  } else {
    return Promise.resolve();
  }
}

/**
 * Returns true if the given file is a unit test.
 *
 * @param {string} file
 * @return {boolean}
 */
function isUnitTest(file) {
  return config.unitTestPaths.some(pattern => {
    return minimatch(file, pattern);
  });
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
  const rootDir = path.dirname(path.dirname(__dirname));
  const jsFileDir = path.dirname(jsFile);
  imports.forEach(function(file) {
    const fullPath = path.resolve(jsFileDir, file) + '.js';
    if (fs.existsSync(fullPath)) {
      const relativePath = path.relative(rootDir, fullPath);
      files.push(relativePath);
    }
  });
  return files;
}

/**
 * Returns true if the test file should be run for any one of the source files.
 *
 * @param {string} testFile
 * @param {!Array<string>} srcFiles
 * @return {boolean}
 */
function shouldRunTest(testFile, srcFiles) {
  const filesImported = getImports(testFile);
  return filesImported.filter(function(file) {
    return srcFiles.includes(file);
  }).length > 0;
}

/**
 * Retrieves the set of unit tests that should be run for a set of source files.
 *
 * @param {!Array<string>} srcFiles
 * @return {!Array<string>}
 */
function getTestsFor(srcFiles) {
  const rootDir = path.dirname(path.dirname(__dirname));
  const allUnitTests = deglob.sync(config.unitTestPaths);
  return allUnitTests.filter(testFile => {
    return shouldRunTest(testFile, srcFiles);
  }).map(fullPath => path.relative(rootDir, fullPath));
}

/**
 * Adds an entry that maps a CSS file to a JS file
 *
 * @param {!Object} cssData
 * @param {string} cssBinaryName
 * @param {!Object<string, string>} cssJsFileMap
 */
function addCssJsEntry(cssData, cssBinaryName, cssJsFileMap) {
  const cssFilePath = 'extensions/' + cssData['name'] + '/' +
      cssData['version'] + '/' + cssBinaryName + '.css';
  const jsFilePath = 'build/' + cssBinaryName + '-' +
      cssData['version'] + '.css.js';
  cssJsFileMap[cssFilePath] = jsFilePath;
}

/**
 * Extracts a mapping from CSS files to JS files from a well known file
 * generated during `gulp css`.
 *
 * @return {!Object<string, string>}
 */
function extractCssJsFileMap() {
  if (!fs.existsSync(extensionsCssMapPath)) {
    log(red('ERROR:'), 'Could not find the file',
        cyan(extensionsCssMapPath) + '.');
    log('Make sure', cyan('gulp css'), 'was run prior to this.');
    process.exit();
  }
  const extensionsCssMap = fs.readFileSync(extensionsCssMapPath, 'utf8');
  const extensionsCssMapJson = JSON.parse(extensionsCssMap);
  const extensions = Object.keys(extensionsCssMapJson);
  const cssJsFileMap = {};
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
      const jsFilePath = cssFileDir + '/' + jsFile;
      if (getImports(jsFilePath).includes(cssJsFileMap[cssFile])) {
        jsFiles.push(jsFilePath);
      }
    });
  }
  return jsFiles;
}

/**
 * Extracts the list of unit tests to run based on the changes in the local
 * branch.
 *
 * @return {!Array<string>}
 */
function unitTestsToRun() {
  const cssJsFileMap = extractCssJsFileMap();
  const filesChanged = gitDiffNameOnlyMaster();
  const testsToRun = [];
  let srcFiles = [];
  filesChanged.forEach(file => {
    if (isUnitTest(file)) {
      testsToRun.push(file);
    } else if (path.extname(file) == '.js') {
      srcFiles = srcFiles.concat([file]);
    } else if (path.extname(file) == '.css') {
      srcFiles = srcFiles.concat(getJsFilesFor(file, cssJsFileMap));
    }
  });
  if (srcFiles.length > 0) {
    log(green('INFO: ') + 'Determining which unit tests to run...');
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
 * Runs all the tests.
 */
function runTests() {
  if (!argv.integration && process.env.AMPSAUCE_REPO) {
    console./* OK*/info('Deactivated for ampsauce repo');
  }

  if (argv.saucelabs && !argv.integration) {
    log(red('ERROR:'), 'Only integration tests may be run on the full set of ' +
        'Sauce Labs browsers');
    log('Use', cyan('--saucelabs'), 'with', cyan('--integration'));
    process.exit();
  }

  const c = getConfig();

  if (argv.watch || argv.w) {
    c.singleRun = false;
  }

  if (argv.verbose || argv.v) {
    c.client.captureConsole = true;
    c.client.verboseLogging = true;
  }

  if (!process.env.TRAVIS && (argv.testnames || argv['local-changes'])) {
    c.reporters = ['mocha'];
  }

  // Exclude chai-as-promised from runs on the full set of sauce labs browsers.
  // See test/chai-as-promised/chai-as-promised.js for why this is necessary.
  c.files = argv.saucelabs ? [] : config.chaiAsPromised;

  if (argv.files) {
    c.files = c.files.concat(config.commonIntegrationTestPaths, argv.files);
    if (!argv.saucelabs && !argv.saucelabs_lite) {
      c.reporters = ['mocha'];
    }
  } else if (argv['local-changes']) {
    const testsToRun = unitTestsToRun();
    if (testsToRun.length == 0) {
      log(green('INFO: ') +
          'No unit tests were directly affected by local changes.');
      return Promise.resolve();
    } else {
      log(green('INFO: ') + 'Running the following unit tests:');
      testsToRun.forEach(test => {
        log(cyan(test));
      });
    }
    c.files = c.files.concat(config.commonUnitTestPaths, testsToRun);
    if (testsToRun.length < tooManyTestsToFix) {
      c.client.failOnConsoleError = true;
    }
  } else if (argv.integration) {
    c.files = c.files.concat(
        config.commonIntegrationTestPaths, config.integrationTestPaths);
  } else if (argv.unit) {
    if (argv.saucelabs_lite) {
      c.files = c.files.concat(
          config.commonUnitTestPaths, config.unitTestOnSaucePaths);
    } else {
      c.files = c.files.concat(
          config.commonUnitTestPaths, config.unitTestPaths);
    }
  } else if (argv.a4a) {
    c.files = c.files.concat(config.a4aTestPaths);
  } else {
    c.files = c.files.concat(config.testPaths);
  }

  // c.client is available in test browser via window.parent.karma.config
  c.client.amp = {
    useCompiledJs: !!argv.compiled,
    saucelabs: (!!argv.saucelabs) || (!!argv.saucelabs_lite),
    adTypes: getAdTypes(),
    mochaTimeout: c.client.mocha.timeout,
  };

  if (argv.compiled) {
    process.env.SERVE_MODE = 'compiled';
  } else {
    process.env.SERVE_MODE = 'default';
  }

  if (argv.grep) {
    c.client.mocha = {
      'grep': argv.grep,
    };
  }

  if (argv.coverage) {
    c.browserify.transform.push(['browserify-istanbul']);
    c.plugins.push('karma-coverage-istanbul-reporter');
    c.reporters = c.reporters.concat(['coverage-istanbul']);
    c.coverageIstanbulReporter = {
      dir: 'test/coverage',
      reports: ['html', 'text', 'text-summary'],
    };
  }

  // Run fake-server to test XHR responses.
  const server = gulp.src(process.cwd(), {base: '.'}).pipe(webserver({
    port: 31862,
    host: 'localhost',
    directoryListing: true,
    middleware: [app],
  }).on('kill', function() {
    log(yellow('Shutting down test responses server on localhost:31862'));
  }));
  log(yellow(
      'Started test responses server on localhost:31862'));

  // Listen for Ctrl + C to cancel testing
  const handlerProcess = createCtrlcHandler('test');

  // Avoid Karma startup errors
  refreshKarmaWdCache();

  // On Travis, collapse the summary printed by the 'karmaSimpleReporter'
  // reporter for full unit test runs, since it likely contains copious amounts
  // of logs.
  const shouldCollapseSummary = process.env.TRAVIS &&
      c.reporters.includes('karmaSimpleReporter') && !argv['local-changes'];
  const sectionMarker =
      (argv.saucelabs || argv.saucelabs_lite) ? 'saucelabs' : 'local';

  let resolver;
  const deferred = new Promise(resolverIn => {resolver = resolverIn;});
  new Karma(c, function(exitCode) {
    if (shouldCollapseSummary) {
      console./* OK*/log('travis_fold:end:console_errors_' + sectionMarker);
    }
    server.emit('kill');
    if (exitCode) {
      log(
          red('ERROR:'),
          yellow('Karma test failed with exit code ' + exitCode));
    }
    if (argv.coverage) {
      const coverageReportUrl =
          'file://' + path.resolve('test/coverage/index.html');
      log(green('INFO: ') + 'Generated code coverage report at ' +
          cyan(coverageReportUrl));
      opn(coverageReportUrl, {wait: false});
    }
    // TODO(rsimha, 14814): Remove after Karma / Sauce ticket is resolved.
    if (process.env.TRAVIS) {
      setTimeout(() => {
        process.exit(exitCode);
      }, 5000);
    } else {
      process.exitCode = exitCode;
    }
    resolver();
  }).on('run_start', function() {
    if (argv.saucelabs || argv.saucelabs_lite) {
      log(green(
          'Running tests in parallel on ' + c.browsers.length +
          ' Sauce Labs browser(s)...'));
    } else {
      log(green('Running tests locally...'));
    }
  }).on('run_complete', function() {
    if (shouldCollapseSummary) {
      console./* OK*/log(bold(red('Console errors:')),
          'Expand this section and fix all errors printed by your tests.');
      console./* OK*/log('travis_fold:start:console_errors_' + sectionMarker);
    }
  }).on('browser_complete', function(browser) {
    if (shouldCollapseSummary) {
      const result = browser.lastResult;
      let message = browser.name + ': ';
      message += 'Executed ' + (result.success + result.failed) +
          ' of ' + result.total + ' (Skipped ' + result.skipped + ') ';
      if (result.failed === 0) {
        message += green('SUCCESS');
      } else {
        message += red(result.failed + ' FAILED');
      }
      message += '\n';
      console./* OK*/log('\n');
      log(message);
    }
  }).start();
  return deferred.then(() => exitCtrlcHandler(handlerProcess));
}

/**
 * Run tests after applying the prod / canary AMP config to the runtime.
 */
gulp.task('test', 'Runs tests', preTestTasks, function() {
  if (!argv.nohelp) {
    printArgvMessages();
  }

  return applyAmpConfig().then(() => {
    return runTests();
  });
}, {
  options: {
    'verbose': '  With logging enabled',
    'testnames': '  Lists the name of each test being run',
    'watch': '  Watches for changes in files, runs corresponding test(s)',
    'saucelabs': '  Runs integration tests on saucelabs (requires setup)',
    'saucelabs_lite': '  Runs tests on a subset of saucelabs browsers ' +
        '(requires setup)',
    'safari': '  Runs tests on Safari',
    'firefox': '  Runs tests on Firefox',
    'edge': '  Runs tests on Edge',
    'ie': '  Runs tests on IE',
    'unit': '  Run only unit tests.',
    'integration': '  Run only integration tests.',
    'compiled': '  Changes integration tests to use production JS ' +
        'binaries for execution',
    'grep': '  Runs tests that match the pattern',
    'files': '  Runs tests for specific files',
    'nohelp': '  Silence help messages that are printed prior to test run',
    'a4a': '  Runs all A4A tests',
    'config': '  Sets the runtime\'s AMP config to one of "prod" or "canary"',
    'coverage': '  Run tests in code coverage mode',
    'headless': '  Run tests in a headless Chrome window',
    'local-changes': '  Run unit tests directly affected by the files ' +
        'changed in the local branch',
  },
});
