/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

var BBPromise = require('bluebird');
var argv = require('minimist')(process.argv.slice(2));
var child_process = require('child_process');
var exec = BBPromise.promisify(child_process.exec);
var fs = BBPromise.promisifyAll(require('fs'));
var gulp = require('gulp-help')(require('gulp'));
var util = require('gulp-util');


/**
 * @param {string} filename
 * @param {string=} opt_branch
 * @return {!Promise}
 */
function checkoutBranchConfigs(filename, opt_branch) {
  var branch = opt_branch || 'origin/master';
  // One bad path here will fail the whole operation.
  return exec(`git checkout ${branch} ${filename}`)
      .catch(function(e) {
        // This means the files don't exist in master. Assume that it exists
        // in the current branch.
        if (/did not match any file/.test(e.message)) {
          return;
        }
        throw e;
      });
}

/**
 * @param {string} configString
 * @param {string} fileString
 * @return {string}
 */
function prependConfig(configString, fileString) {
  return `window.AMP_CONFIG||(window.AMP_CONFIG=${configString});` +
    `/*AMP_CONFIG*/${fileString}`;
}

/**
 * @param {string} filename
 * @param {string} fileString
 * @param {boolean=} opt_dryrun
 * @return {!Promise}
 */
function writeTarget(filename, fileString, opt_dryrun) {
  if (opt_dryrun) {
    util.log(util.colors.blue(`overwriting: ${filename}`));
    util.log(fileString);
    return Promise.resolve();
  }
  return fs.writeFileAsync(filename, fileString);
}

/**
 * @param {string|boolean}
 * @param {string}
 * @return {string}
 */
function valueOrDefault(value, defaultValue) {
  if (typeof value == 'string') {
    return value;
  }
  return defaultValue;
}

function main() {
  if (!argv.target) {
    util.log(util.colors.red('Missing --target.'));
    return;
  }

  if (!(argv.prod || argv.canary)) {
    util.log(util.colors.red('One of --prod or --canary should be provided.'));
    return;
  }

  var globs = [].concat(argv.files).filter(x => typeof x == 'string');
  var branch = argv.branch;
  var target = argv.target;
  var filename = '';

  // Prod by default.
  if (argv.canary) {
    filename = valueOrDefault(argv.canary,
        'build-system/global-configs/canary-config.json');
  } else {
    filename = valueOrDefault(argv.prod,
        'build-system/global-configs/prod-config.json');
  }
  return checkoutBranchConfigs(filename, branch)
      .then(() => {
       return Promise.all([
         fs.readFileAsync(filename),
         fs.readFileAsync(target),
       ]);
      })
      .then(files => {
        var configFile;
        try {
          configFile = JSON.stringify(JSON.parse(files[0].toString()));
        } catch (e) {
          util.log(util.colors.red(`Error parsing config file: ${filename}`));
          throw e;
        }
        var targetFile = files[1].toString();
        return prependConfig(configFile, targetFile);
      })
      .then(fileString => {
        return writeTarget(target, fileString, argv.dryrun);
      });
}

gulp.task('prepend-global', 'Prepends a json config to a target file', main, {
  options: {
    'target': '  The file to prepend the json config to.',
    'canary': '  Prepend the default canary config. ' +
        'Takes in an optional value for a custom canary config source.',
    'prod': '  Prepend the default prod config. ' +
        'Takes in an optional value for a custom prod config source.',
    'branch': '  Switch to a git branch to get config source from. ' +
        'Uses master by default.',
  }
});

exports.checkoutBranchConfigs = checkoutBranchConfigs;
exports.prependConfig = prependConfig;
exports.writeTarget = writeTarget;
exports.valueOrDefault = valueOrDefault;
