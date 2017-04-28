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

const argv = require('minimist')(process.argv.slice(2));
const child_process = require('child_process');
const gulp = require('gulp-help')(require('gulp'));
const util = require('gulp-util');

const percyCommand = 'percy snapshot';
const defaultWidths = [750, 1080];  // iPhone: 750. Pixel: 1080.

/**
 * Executes the provided command; terminates this program in case of failure.
 * Copied from pr-check.js.
 * TODO(rsimha-amp): Refactor this into a shared library. Issue #9038.
 *
 * @param {string} cmd
 */
function execOrDie(cmd) {
  const p =
      child_process.spawnSync('/bin/sh', ['-c', cmd], {'stdio': 'inherit'});
  if (p.status != 0) {
    console/*OK*/.log(
        `\n${fileLogPrefix}exiting due to failing command: ${cmd}`);
    process.exit(p.status)
  }
}

/**
 * Extracts Percy project keys from the environment.
 *
 * @return {!Object} Object containing Percy project and token.
 */
function extractPercyKeys() {
  // Repo slug to which to upload snapshots. Same as the Github repo slug.
  let percyProject = '';
  if (process.env.PERCY_PROJECT) {
    percyProject = process.env.PERCY_PROJECT;
  } else {
    util.log(util.colors.red(
        'PERCY_PROJECT must be specified as an environment variable'));
    done();
  }
  util.log('Percy project: ', util.colors.magenta(percyProject));

  // Secret token for the percy project.
  let percyToken = '';
  if (process.env.PERCY_TOKEN) {
    percyToken = process.env.PERCY_TOKEN;
  } else {
    util.log(util.colors.red(
        'PERCY_TOKEN must be specified as an environment variable'));
    done();
  }
  util.log('Percy token: ', util.colors.magenta(percyToken));
  return {
    percyProject: percyProject,
    percyToken: percyToken
  };
}

/**
 * Extracts Percy args from the command line.
 *
 * @return {!Object} Object containing extracted args.
 */
function extractPercyArgs() {
  // Webpage to snapshot. This is a path, relative to amphtml/.
  let webpage = '';
  if (argv.webpage) {
    webpage = argv.webpage;
  } else {
    console./*OK*/error(util.colors.red(
        'Must specify a webpage to diff via --webpage'));
    process.exit(1);
  }
  util.log('Webpage: ', util.colors.magenta(webpage));

  // Smartphone screen widths to snapshot.
  let widths = defaultWidths;
  if (argv.widths) {
    widths = JSON.parse("[" + argv.widths + "]");
  }
  util.log('Widths: ', util.colors.magenta(widths.toString()));

  // TODO(rsimha): Separate out some test pages into directories, and then
  // add an arg to include the directory containing assets for those pages.

  return {
    webpage: webpage,
    widths: widths
  };
}

/**
 * Constructs the Percy command line with various args.
 *
 * @param {!Object} percyKeys Object containing access keys for the Percy repo.
 * @return {String} Full command line to be executed.
 */
function constructCommandLine(percyKeys) {
  let commandLine = [];

  // Percy project keys.
  commandLine.push('PERCY_PROJECT=' + percyKeys.percyProject);
  commandLine.push('PERCY_TOKEN=' + percyKeys.percyToken);

  // Main snapshot command.
  commandLine.push(percyCommand);

  // Percy repo slug. This matches up exactly with the amphtml Github repo slug.
  commandLine.push('--repo ' + percyKeys.percyProject);

  // Percy args.
  const percyArgs = extractPercyArgs();
  commandLine.push('--baseurl /' + percyArgs.webpage);
  commandLine.push('--widths ' + percyArgs.widths);

  // The webpage being tested is typically the last arg.
  commandLine.push(percyArgs.webpage);

  util.log('Executing command line:');
  commandLine.forEach((command) => {
    util.log('\t', util.colors.cyan(command));
  });
  return commandLine.join(' ');
}

/**
 * Run visual diff tests
 */
function runTests() {
  util.log(util.colors.yellow('Running visual diff tests...'));
  const percyKeys = extractPercyKeys();
  const commandLine = constructCommandLine(percyKeys);
  execOrDie(commandLine);
}


gulp.task('visual-diff', 'Runs visual diff tests using Percy', runTests, {
  options: {
    'webpage': '  Path of the webpage being tested, relative to amphtml/.' +
        ' Used this as the baseurl while looking up snapshots on Percy.',
    'widths': '  CSV with the widths to test. Defaults to '
        + defaultWidths.toString() + '.'
  }
});
