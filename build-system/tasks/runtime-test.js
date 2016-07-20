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

var argv = require('minimist')(process.argv.slice(2));
var gulp = require('gulp-help')(require('gulp'));
var Karma = require('karma').Server;
var config = require('../config');
var karmaConfig = config.karma;
var extend = require('util')._extend;

/**
 * Read in and process the configuration settings for karma
 * @return {!Object} Karma configuration
 */
function getConfig() {
  var obj = Object.create(null);
  if (argv.safari) {
    return extend(obj, karmaConfig.safari);
  }

  if (argv.firefox) {
    return extend(obj, karmaConfig.firefox);
  }

  if (argv.saucelabs) {
    if (!process.env.SAUCE_USERNAME) {
      throw new Error('Missing SAUCE_USERNAME Env variable');
    }
    if (!process.env.SAUCE_ACCESS_KEY) {
      throw new Error('Missing SAUCE_ACCESS_KEY Env variable');
    }
    const c = extend(obj, karmaConfig.saucelabs);
    if (argv.oldchrome) {
      c.browsers = ['SL_Chrome_37']
    }
  }

  return extend(obj, karmaConfig.default);
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
  var browsers = [];

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
  } else {
    c.files = config.testPaths;
  }

  c.client.amp = {
    useCompiledJs: !!argv.compiled,
    saucelabs: !!argv.saucelabs,
  };

  if (argv.grep) {
    c.client.mocha = {
      'grep': argv.grep,
    };
  }


  new Karma(c, done).start();
}, {
  options: {
    'verbose': '  With logging enabled',
    'watch': '  Watches for changes in files, runs corresponding test(s)',
    'saucelabs': '  Runs test on saucelabs (requires setup)',
    'safari': '  Runs tests in Safari',
    'firefox': '  Runs tests in Firefox',
    'integration': 'Run only integration tests.',
    'compiled': 'Changes integration tests to use production JS ' +
        'binaries for execution',
    'oldchrome': 'Runs test with an old chrome. Saucelabs only.',
    'grep': 'Runs tests that match the pattern',
    'files': 'Runs tests for specific files',
  }
});
