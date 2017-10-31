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
'use strict';

const BBPromise = require('bluebird');
const argv = require('minimist')(process.argv.slice(2));
const childProcess = require('child_process');
const exec = BBPromise.promisify(childProcess.exec);
const fs = BBPromise.promisifyAll(require('fs'));
const gulp = require('gulp-help')(require('gulp'));
const util = require('gulp-util');


/**
 * Returns the number of AMP_CONFIG matches in the given config string.
 *
 * @param {string} str
 * @return {number}
 */
function numConfigs(str) {
  const re = /\/\*AMP_CONFIG\*\//g;
  const matches = str.match(re);
  return matches == null ? 0 : matches.length;
}

/**
 * Checks that only 1 AMP_CONFIG should exist after append.
 *
 * @param {string} str
 */
function sanityCheck(str) {
  const numMatches = numConfigs(str);
  if (numMatches != 1) {
    throw new Error(
      'Found ' + numMatches + ' AMP_CONFIG(s) before write. Aborting!');
  }
}

/**
 * @param {string} filename
 * @param {string} opt_local
 * @param {string=} opt_branch
 * @return {!Promise}
 */
function checkoutBranchConfigs(filename, opt_local, opt_branch) {
  if (opt_local) {
    return Promise.resolve();
  }
  const branch = opt_branch || 'origin/master';
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
  return `self.AMP_CONFIG||(self.AMP_CONFIG=${configString});` +
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
  if (typeof value === 'string') {
    return value;
  }
  return defaultValue;
}

/**
 * @param {string} config
 * @param {string} target
 * @param {string} filename
 * @param {string} opt_local
 * @param {string} opt_branch
 * @return {!Promise}
 */
function applyConfig(config, target, filename, opt_local, opt_branch) {
  return checkoutBranchConfigs(filename, opt_local, opt_branch)
      .then(() => {
        return Promise.all([
          fs.readFileAsync(filename),
          fs.readFileAsync(target),
        ]);
      })
      .then(files => {
        let configFile;
        try {
          configFile = JSON.stringify(JSON.parse(files[0].toString()));
        } catch (e) {
          util.log(util.colors.red(`Error parsing config file: ${filename}`));
          throw e;
        }
        const targetFile = files[1].toString();
        return prependConfig(configFile, targetFile);
      })
      .then(fileString => {
        sanityCheck(fileString);
        return writeTarget(target, fileString, argv.dryrun);
      })
      .then(() => {
        if (!process.env.TRAVIS) {
          util.log('Wrote', util.colors.cyan(config), 'AMP config to',
              util.colors.cyan(target));
        }
      });
}

/**
 * @param {string} target
 * @return {!Promise}
 */
function removeConfig(target) {
  return fs.readFileAsync(target)
      .then(file => {
        let contents = file.toString();
        if (numConfigs(contents) == 0) {
          util.log('No configs found in', util.colors.cyan(target));
          return Promise.resolve();
        }
        sanityCheck(contents);
        const config =
        /self\.AMP_CONFIG\|\|\(self\.AMP_CONFIG=.*?\/\*AMP_CONFIG\*\//;
        contents = contents.replace(config, '');
        return writeTarget(target, contents, argv.dryrun).then(() => {
          if (!process.env.TRAVIS) {
            util.log('Removed existing config from', util.colors.cyan(target));
          }
        });
      });
}

function main() {
  const TESTING_HOST = process.env.AMP_TESTING_HOST;
  const target = argv.target || TESTING_HOST;

  if (!target) {
    util.log(util.colors.red('Missing --target.'));
    return;
  }

  if (argv.remove) {
    return removeConfig(target);
  }

  if (!(argv.prod || argv.canary)) {
    util.log(util.colors.red('One of --prod or --canary should be provided.'));
    return;
  }

  const branch = argv.branch;
  let filename = '';

  // Prod by default.
  const config = argv.canary ? 'canary' : 'prod';
  if (argv.canary) {
    filename = valueOrDefault(argv.canary,
        'build-system/global-configs/canary-config.json');
  } else {
    filename = valueOrDefault(argv.prod,
        'build-system/global-configs/prod-config.json');
  }
  return removeConfig(target).then(() => {
    return applyConfig(config, target, filename, argv.local, branch);
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
    'local': '  Don\'t switch branches and use local config',
    'remove': '  Removes previously prepended json config from the target ' +
        'file (if present).',
  },
});

exports.checkoutBranchConfigs = checkoutBranchConfigs;
exports.prependConfig = prependConfig;
exports.writeTarget = writeTarget;
exports.valueOrDefault = valueOrDefault;
exports.sanityCheck = sanityCheck;
exports.numConfigs = numConfigs;
exports.removeConfig = removeConfig;
exports.applyConfig = applyConfig;
