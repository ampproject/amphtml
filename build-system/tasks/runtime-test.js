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
const gulp = require('gulp-help')(require('gulp'));
const glob = require('glob');
const Karma = require('karma').Server;
const config = require('../config');
const fs = require('fs');
const path = require('path');
const util = require('gulp-util');
const webserver = require('gulp-webserver');
const app = require('../test-server').app;
const karmaDefault = require('./karma.conf');
const shuffleSeed = require('shuffle-seed');


const green = util.colors.green;
const yellow = util.colors.yellow;
const cyan = util.colors.cyan;
const preTestTasks = argv.nobuild ? [] : (argv.unit ? ['css'] : ['build']);


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
  if (argv.saucelabs) {
    if (!process.env.SAUCE_USERNAME) {
      throw new Error('Missing SAUCE_USERNAME Env variable');
    }
    if (!process.env.SAUCE_ACCESS_KEY) {
      throw new Error('Missing SAUCE_ACCESS_KEY Env variable');
    }
    return Object.assign({}, karmaDefault, {
      reporters: ['super-dots', 'saucelabs', 'karmaSimpleReporter'],
      browsers: argv.oldchrome
          ? ['SL_Chrome_45']
          : [
            'SL_Chrome_android',
            'SL_Chrome_latest',
            'SL_Chrome_45',
            'SL_Firefox_latest',
            // 'SL_Safari_8' // Disabled due to flakiness and low market share
            'SL_Safari_9',
            'SL_Edge_latest',
            // 'SL_iOS_8_4', // Disabled due to flakiness and low market share
            'SL_iOS_9_1',
            'SL_iOS_10_0',
            'SL_iOS_11_0',
            'SL_IE_11',
          ],
    });
  }
  return karmaDefault;
}

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
  const adTypes = ['adsense', 'doubleclick'];

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
 * Prints help messages for args if tests are being run for local development.
 */
function printArgvMessages() {
  const argvMessages = {
    safari: 'Running tests on Safari.',
    firefox: 'Running tests on Firefox.',
    ie: 'Running tests on IE.',
    edge: 'Running tests on Edge.',
    saucelabs: 'Running tests on Sauce Labs.',
    nobuild: 'Skipping build.',
    watch: 'Enabling watch mode. Editing and saving a file will cause the' +
        ' tests for that file to be re-run in the same browser instance.',
    verbose: 'Enabling verbose mode. Expect lots of output!',
    testnames: 'Listing the names of all tests being run.',
    files: 'Running tests in the file(s): ' + cyan(argv.files),
    integration: 'Running only the integration tests. Requires ' +
        cyan('gulp build') + ' to have been run first.',
    unit: 'Running only the unit tests. Requires ' +
        cyan('gulp css') + ' to have been run first.',
    randomize: 'Randomizing the order in which tests are run.',
    a4a: 'Running only A4A tests.',
    seed: 'Randomizing test order with seed ' + cyan(argv.seed) + '.',
    compiled: 'Running tests against minified code.',
    grep: 'Only running tests that match the pattern "' +
        cyan(argv.grep) + '".',
  };
  if (!process.env.TRAVIS) {
    util.log(green('Run', cyan('gulp help'),
        'to see a list of all test flags. (Use', cyan('--nohelp'),
        'to silence these messages.)'));
    if (!argv.unit && !argv.integration && !argv.files) {
      util.log(green('Running all tests. Use',
          cyan('--unit'), 'or', cyan('--integration'),
          'to run just the unit tests or integration tests.'));
    }
    if (!argv.compiled) {
      util.log(green('Running tests against unminified code.'));
    }
    Object.keys(argv).forEach(arg => {
      const message = argvMessages[arg];
      if (message) {
        util.log(yellow('--' + arg + ':'), green(message));
      }
    });
  }
}


/**
 * Run tests.
 */
gulp.task('test', 'Runs tests', preTestTasks, function(done) {
  if (!argv.nohelp) {
    printArgvMessages();
  }

  if (!argv.integration && process.env.AMPSAUCE_REPO) {
    console./* OK*/info('Deactivated for ampsauce repo');
  }

  const c = getConfig();

  if (argv.watch || argv.w) {
    c.singleRun = false;
  }

  if (argv.verbose || argv.v) {
    c.client.captureConsole = true;
  }

  if (argv.testnames) {
    c.reporters = ['mocha'];
  }

  // Exclude chai-as-promised from sauce labs runs.
  // See test/chai-as-promised/chai-as-promised.js for why this is necessary.
  c.files = argv.saucelabs ? [] : config.chaiAsPromised;

  if (argv.files) {
    c.files = c.files.concat(config.commonTestPaths, argv.files);
    if (!argv.saucelabs) {
      c.reporters = ['mocha'];
    }
  } else if (argv.integration) {
    c.files = c.files.concat(config.integrationTestPaths);
  } else if (argv.unit) {
    c.files = c.files.concat(config.unitTestPaths);
  } else if (argv.randomize || argv.glob || argv.a4a) {
    const testPaths = argv.a4a ? config.a4aTestPaths : config.basicTestPaths;

    let testFiles = [];
    for (const index in testPaths) {
      testFiles = testFiles.concat(glob.sync(testPaths[index]));
    }

    if (argv.randomize || argv.a4a) {
      const seed = argv.seed || Math.random();
      util.log(
          util.colors.yellow('Randomizing:'),
          util.colors.cyan('Seeding with value', seed));
      util.log(
          util.colors.yellow('To rerun same ordering, append'),
          util.colors.cyan(`--seed=${seed}`),
          util.colors.yellow('to your invocation of'),
          util.colors.cyan('gulp test'));
      testFiles = shuffleSeed.shuffle(testFiles, seed);
    }

    testFiles.splice(testFiles.indexOf('test/_init_tests.js'), 1);
    c.files = c.files.concat(config.commonTestPaths.concat(testFiles));
  } else {
    c.files = c.files.concat(config.testPaths);
  }

  // Include a simple passing test for sauce labs runs. This is done because
  // running zero tests on a sauce labs browser throws an error. See #11494.
  if (argv.saucelabs) {
    c.files = c.files.concat(config.simpleTestPath);
  }

  // c.client is available in test browser via window.parent.karma.config
  c.client.amp = {
    useCompiledJs: !!argv.compiled,
    saucelabs: !!argv.saucelabs,
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
    util.log(util.colors.blue('Including code coverage tests'));
    c.browserify.transform.push(
        ['browserify-istanbul', {instrumenterConfig: {embedSource: true}}]);
    c.reporters = c.reporters.concat(['progress', 'coverage']);
    if (c.preprocessors['src/**/*.js']) {
      c.preprocessors['src/**/*.js'].push('coverage');
    }
    c.preprocessors['extensions/**/*.js'] &&
        c.preprocessors['extensions/**/*.js'].push('coverage');
    c.coverageReporter = {
      dir: 'test/coverage',
      reporters: [
        {type: 'html', subdir: 'report-html'},
        {type: 'lcov', subdir: 'report-lcov'},
        {type: 'lcovonly', subdir: '.', file: 'report-lcovonly.txt'},
        {type: 'text', subdir: '.', file: 'text.txt'},
        {type: 'text-summary', subdir: '.', file: 'text-summary.txt'},
      ],
      instrumenterOptions: {
        istanbul: {
          noCompact: true,
        },
      },
    };
    // TODO(jonkeller): Add c.coverageReporter.check as shown in
    // https://github.com/karma-runner/karma-coverage/blob/master/docs/configuration.md
  }

  // Run fake-server to test XHR responses.
  const server = gulp.src(process.cwd())
      .pipe(webserver({
        port: 31862,
        host: 'localhost',
        directoryListing: true,
        middleware: [app],
      })
      .on('kill', function() {
        util.log(yellow(
            'Shutting down test responses server on localhost:31862'));
        process.nextTick(function() {
          process.exit();
        });
      }));
  util.log(yellow(
      'Started test responses server on localhost:31862'));

  new Karma(c, function(exitCode) {
    server.emit('kill');
    if (exitCode) {
      util.log(
          util.colors.red('ERROR:'),
          yellow('Karma test failed with exit code', exitCode));
      process.exit(exitCode);
    } else {
      done();
    }
  }).on('run_start', function() {
    if (argv.saucelabs) {
      console./* OK*/log(green(
          'Running tests in parallel on', c.browsers.length, 'browsers...'));
    }
  }).on('browser_complete', function(browser) {
    if (argv.saucelabs) {
      const result = browser.lastResult;
      let message = '\n' + browser.name + ': ';
      message += 'Executed ' + (result.success + result.failed) +
          ' of ' + result.total + ' (Skipped ' + result.skipped + ') ';
      if (result.failed === 0) {
        message += util.colors.green('SUCCESS');
      } else {
        message += util.colors.red(result.failed + ' FAILED');
      }
      message += '\n';
      console./* OK*/log(message);
    }
  }).start();
}, {
  options: {
    'verbose': '  With logging enabled',
    'testnames': '  Lists the name of each test being run',
    'watch': '  Watches for changes in files, runs corresponding test(s)',
    'saucelabs': '  Runs test on saucelabs (requires setup)',
    'safari': '  Runs tests on Safari',
    'firefox': '  Runs tests on Firefox',
    'edge': '  Runs tests on Edge',
    'ie': '  Runs tests on IE',
    'unit': '  Run only unit tests.',
    'integration': '  Run only integration tests.',
    'compiled': '  Changes integration tests to use production JS ' +
        'binaries for execution',
    'oldchrome': '  Runs test with an old chrome. Saucelabs only.',
    'grep': '  Runs tests that match the pattern',
    'files': '  Runs tests for specific files',
    'randomize': '  Runs entire test suite in random order',
    'seed': '  Seeds the test order randomization. Use with --randomize ' +
        'or --a4a',
    'glob': '  Explicitly expands test paths using glob before passing ' +
        'to Karma',
    'nohelp': '  Silence help messages that are printed prior to test run',
    'a4a': '  Runs all A4A tests',
  },
});
