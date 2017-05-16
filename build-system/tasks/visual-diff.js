/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
var exec = require('../exec.js').exec;
var fs = require('fs-extra');
var gulp = require('gulp-help')(require('gulp'));
var util = require('gulp-util');

var percyCommand = 'percy snapshot';
var defaultWidths = [375, 411];  // CSS widths: iPhone: 375, Pixel: 411.
var percyProjectSeparator = '/';  // Standard format of repo slug: "foo/bar".
var percyTokenLength = 64;  // Standard Percy API key length.
var visualTestsFile = 'test/visual-diff/visual-tests.json';

/**
 * Extracts and verifies Percy project keys from the environment.
 *
 * @return {!Object} Object containing Percy project and token.
 */
function extractPercyKeys() {
  // Repo slug to which to upload snapshots. Same as the Github repo slug.
  if (!process.env.PERCY_PROJECT) {
    util.log(util.colors.red(
        'Error: PERCY_PROJECT must be specified as an environment variable'));
    process.exit(1);
  }
  var percyProject = process.env.PERCY_PROJECT;
  if (percyProject.indexOf(percyProjectSeparator) == -1) {
    util.log(util.colors.red(
        'Error: PERCY_PROJECT doesn\'t look like a valid repo slug'));
    process.exit(1);
  }
  util.log('Percy project: ', util.colors.magenta(percyProject));

  // Secret token for the percy project.
  if (!process.env.PERCY_TOKEN) {
    util.log(util.colors.red(
        'Error: PERCY_TOKEN must be specified as an environment variable'));
    process.exit(1);
  }
  var percyToken = process.env.PERCY_TOKEN;
  if (percyToken.length != percyTokenLength) {
    util.log(util.colors.red(
        'Error: PERCY_TOKEN doesn\'t look like a valid Percy API key'));
    process.exit(1);
  }
  util.log('Percy token: ', util.colors.magenta('<redacted>'));
  return {
    percyProject: percyProject,
    percyToken: percyToken,
  };
}

/**
 * Extracts Percy args from the command line.
 *
 * @return {!Object} Object containing extracted args.
 */
function extractPercyArgs() {
  // Webpage to snapshot. This is a path, relative to amphtml/. For automated
  // tests on Travis, this defaults to the set of test cases defined in
  var webpage = '';
  if (argv.webpage) {
    webpage = argv.webpage;
  } else {
    // Default to the amp-by-example page for test runs.
    // TODO(rsimha): Refactor this to support multiple webpages.
    var webpage = JSON.parse(fs.readFileSync(visualTestsFile)).webpage;
  }
  util.log('Webpage: ', util.colors.magenta(webpage));

  // Smartphone screen widths to snapshot.
  var widths = defaultWidths;
  if (argv.widths) {
    widths = argv.widths.split(',');
  }
  util.log('Widths: ', util.colors.magenta(widths.toString()));

  // TODO(rsimha): Separate out some test pages into directories, and then
  // add an arg to include the directory containing assets for those pages.

  return {
    webpage: webpage,
    widths: widths,
  };
}

/**
 * Constructs the Percy command line with various args.
 *
 * @param {!Object} percyKeys Object containing access keys for the Percy repo.
 * @return {string} Full command line to be executed.
 */
function constructCommandLine(percyKeys) {
  var commandLine = [];

  // Main snapshot command.
  commandLine.push(percyCommand);

  // Percy repo slug. This matches up exactly with the amphtml Github repo slug.
  commandLine.push('--repo ' + percyKeys.percyProject);

  // Percy args.
  var percyArgs = extractPercyArgs();
  commandLine.push('--baseurl /' + percyArgs.webpage);
  commandLine.push('--widths ' + percyArgs.widths);

  // Other args.
  commandLine.push('--enable_javascript');
  commandLine.push('--include_all');

  // The webpage being tested is typically the last arg.
  commandLine.push(percyArgs.webpage);

  util.log('Executing command line:');
  commandLine.forEach(function(command) {
    util.log('\t', util.colors.cyan(command));
  });

  return commandLine.join(' ');
}

/**
 * Run visual diff tests
 */
function runTests() {
  util.log(util.colors.yellow('Running visual diff tests...'));
  var percyKeys = extractPercyKeys();
  var commandLine = constructCommandLine(percyKeys);
  exec(commandLine);
}


gulp.task('visual-diff', 'Runs visual diff tests using Percy', runTests, {
  options: {
    'webpage': '  Path of the webpage being tested, relative to amphtml/.' +
        ' Used this as the baseurl while looking up snapshots on Percy.',
    'widths': '  CSV with the device CSS widths to test. Defaults to '
        + defaultWidths.toString() + ' (iPhone and Pixel).'
  }
});
