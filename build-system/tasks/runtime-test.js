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

var argv = require('minimist')(process.argv.slice(2));
var gulp = require('gulp-help')(require('gulp'));
var glob = require('glob');
var Karma = require('karma').Server;
var config = require('../config');
var read = require('file-reader');
var fs = require('fs');
var path = require('path');
var util = require('gulp-util');
var webserver = require('gulp-webserver');
var app = require('../test-server').app;
var karmaDefault = require('./karma.conf');

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

  if (argv.saucelabs) {
    if (!process.env.SAUCE_USERNAME) {
      throw new Error('Missing SAUCE_USERNAME Env variable');
    }
    if (!process.env.SAUCE_ACCESS_KEY) {
      throw new Error('Missing SAUCE_ACCESS_KEY Env variable');
    }
    return Object.assign({}, karmaDefault, {
      reporters: ['dots', 'saucelabs'],
      browsers: argv.oldchrome
          ? ['SL_Chrome_45']
          : [
            'SL_Chrome_android',
            'SL_Chrome_latest',
            'SL_Chrome_45',
            'SL_Firefox_latest',
            //'SL_Safari_8' // Disabled due to flakiness and low market share
            'SL_Safari_9',
            'SL_Edge_latest',
            //'SL_iOS_8_4', // Disabled due to flakiness and low market share
            'SL_iOS_9_1',
            'SL_iOS_10_0',
            //'SL_IE_11',
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
  for (var i = 0; i < files.length; i++) {
    if (path.extname(files[i]) == '.js'
        && files[i][0] != '_' && files[i] != 'ads.extern.js') {
      const adType = path.basename(files[i], '.js');
      const expanded = namingExceptions[adType];
      if (expanded) {
        for (var j = 0; j < expanded.length; j++) {
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
 * Run tests.
 */
gulp.task('test', 'Runs tests', argv.nobuild ? [] : ['build'], function(done) {
  if (argv.saucelabs && process.env.MAIN_REPO &&
      // Sauce Labs does not work on Pull Requests directly.
      // The @ampsauce bot builds these.
      process.env.TRAVIS_PULL_REQUEST != 'false') {
    console./*OK*/info('Deactivated for pull requests. ' +
        'The @ampsauce bots build eligible PRs.');
    return;
  }

  if (!argv.integration && process.env.AMPSAUCE_REPO) {
    console./*OK*/info('Deactivated for ampsauce repo')
  }

  var c = getConfig();

  if (argv.watch || argv.w) {
    c.singleRun = false;
  }

  if (argv.verbose || argv.v) {
    c.client.captureConsole = true;
  }

  if (argv.files) {
    c.files = [].concat(config.commonTestPaths, argv.files);
  } else if (argv.integration) {
    c.files = config.integrationTestPaths;
  } else if (argv.randomize || argv.glob) {
    /** Randomize the order of the test running */
    var testPaths = [
      'test/**/*.js',
      'ads/**/test/test-*.js',
      'extensions/**/test/**/*.js',
    ];

    var testFiles = [];

    for (index in testPaths) {
      testFiles = testFiles.concat(glob.sync(testPaths[index]));
    }

    if (argv.randomize) {
      testFiles = shuffleArray(testFiles);
    }
    // we need to replace the test init with something that won't match
    // any file. _init_tests gets added twice due to the regex matching.
    testFiles[testFiles.indexOf('test/_init_tests.js')] = '_WONTMATCH.qqq';
    c.files = config.commonTestPaths.concat(testFiles);

    util.log(util.colors.blue(JSON.stringify(c.files)));
    util.log(util.colors.yellow("Save the above files in a .json file to reuse"));

  } else if (argv.testlist) {
    var file = read.file(argv.testlist);
    util.log(file);
    c.files = file;

  } else {
    c.files = config.testPaths;
  }

  // c.client is available in test browser via window.parent.karma.config
  c.client.amp = {
    useCompiledJs: !!argv.compiled,
    saucelabs: !!argv.saucelabs,
    adTypes: getAdTypes(),
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

  // Run fake-server to test XHR responses.
  var server = gulp.src(process.cwd())
      .pipe(webserver({
        port: 31862,
        host: 'localhost',
        directoryListing: true,
        middleware: [app],
      }));
  util.log(util.colors.yellow(
      'Started test responses server on localhost:31862'));

  new Karma(c, function(exitCode) {
    util.log(util.colors.yellow(
        'Shutting down test responses server on localhost:31862'));
    server.emit('kill');
    var error = exitCode;
    if (exitCode && typeof exitCode !== 'Error') {
        error = new Error('Karma test failed (error code: ' + exitCode + ')');
        error.showStack = false;
    }
    done(error);
  }).start();
}, {
  options: {
    'verbose': '  With logging enabled',
    'watch': '  Watches for changes in files, runs corresponding test(s)',
    'saucelabs': '  Runs test on saucelabs (requires setup)',
    'safari': '  Runs tests in Safari',
    'firefox': '  Runs tests in Firefox',
    'edge': '  Runs tests in Edge',
    'integration': 'Run only integration tests.',
    'compiled': 'Changes integration tests to use production JS ' +
        'binaries for execution',
    'oldchrome': 'Runs test with an old chrome. Saucelabs only.',
    'grep': 'Runs tests that match the pattern',
    'files': 'Runs tests for specific files',
    'randomize': 'Runs entire test suite in random order',
    'testlist': 'Runs tests specified in JSON by supplied file',
    'glob': 'Explicility expands test paths using glob before passing' +
        'to Karma',
  }
});


function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
