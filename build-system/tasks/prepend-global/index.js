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

const argv = require('minimist')(process.argv.slice(2));
const BBPromise = require('bluebird');
const childProcess = require('child_process');
const exec = BBPromise.promisify(childProcess.exec);
const colors = require('ansi-colors');
const fs = BBPromise.promisifyAll(require('fs'));
const log = require('fancy-log');
const path = require('path');
const {isTravisBuild} = require('../../travis');

const {red, cyan} = colors;

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
 * @param {string} filename File containing the config
 * @param {string=} opt_localBranch Whether to use the local branch version
 * @param {string=} opt_branch If not the local branch, which branch to use
 * @return {!Promise}
 */
function checkoutBranchConfigs(filename, opt_localBranch, opt_branch) {
  if (opt_localBranch) {
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
 * @param {string} configString String containing the AMP config
 * @param {string} fileString String containing the AMP runtime
 * @return {string}
 */
function prependConfig(configString, fileString) {
  return `self.AMP_CONFIG||(self.AMP_CONFIG=${configString});` +
    `/*AMP_CONFIG*/${fileString}`;
}

/**
 * @param {string} filename Destination filename
 * @param {string} fileString String to write
 * @param {boolean=} opt_dryrun If true, print the contents without writing them
 * @return {!Promise}
 */
function writeTarget(filename, fileString, opt_dryrun) {
  if (opt_dryrun) {
    log(cyan(`overwriting: ${filename}`));
    log(fileString);
    return Promise.resolve();
  }
  return fs.writeFileAsync(filename, fileString);
}

/**
 * @param {string|boolean} value
 * @param {string} defaultValue
 * @return {string}
 */
function valueOrDefault(value, defaultValue) {
  if (typeof value === 'string') {
    return value;
  }
  return defaultValue;
}

/**
 * @param {string} config Prod or canary
 * @param {string} target File containing the AMP runtime (amp.js or v0.js)
 * @param {string} filename File containing the (prod or canary) config
 * @param {boolean=} opt_localDev Whether to enable local development
 * @param {boolean=} opt_localBranch Whether to use the local branch version
 * @param {string=} opt_branch If not the local branch, which branch to use
 * @param {boolean=} opt_fortesting Whether to force getMode().test to be true
 * @return {!Promise}
 */
function applyConfig(
  config, target, filename, opt_localDev, opt_localBranch, opt_branch,
  opt_fortesting) {
  return checkoutBranchConfigs(filename, opt_localBranch, opt_branch)
      .then(() => {
        return Promise.all([
          fs.readFileAsync(filename),
          fs.readFileAsync(target),
        ]);
      })
      .then(files => {
        let configJson;
        try {
          configJson = JSON.parse(files[0].toString());
        } catch (e) {
          log(red(`Error parsing config file: ${filename}`));
          throw e;
        }
        if (opt_localDev) {
          configJson = enableLocalDev(config, target, configJson);
        }
        if (opt_fortesting) {
          configJson = Object.assign({test: true}, configJson);
        }
        const targetString = files[1].toString();
        const configString = JSON.stringify(configJson);
        return prependConfig(configString, targetString);
      })
      .then(fileString => {
        sanityCheck(fileString);
        return writeTarget(target, fileString, argv.dryrun);
      })
      .then(() => {
        if (!isTravisBuild()) {
          const details = '(' + cyan(config) +
              (opt_localDev ? ', ' + cyan('localDev') : '') +
              (opt_fortesting ? ', ' + cyan('test') : '') + ')';
          log('Applied AMP config', details, 'to', cyan(path.basename(target)));
        }
      });
}

/**
 * @param {string} config Prod or canary
 * @param {string} target File containing the AMP runtime (amp.js or v0.js)
 * @param {string} configJson The json object in which to enable local dev
 * @return {string}
 */
function enableLocalDev(config, target, configJson) {
  let LOCAL_DEV_AMP_CONFIG = {localDev: true};
  const TESTING_HOST = process.env.AMP_TESTING_HOST;
  if (typeof TESTING_HOST == 'string') {
    const TESTING_HOST_FULL_URL = TESTING_HOST.match(/^https?:\/\//) ?
      TESTING_HOST : 'http://' + TESTING_HOST;
    const TESTING_HOST_NO_PROTOCOL =
      TESTING_HOST.replace(/^https?:\/\//, '');

    LOCAL_DEV_AMP_CONFIG = Object.assign(LOCAL_DEV_AMP_CONFIG, {
      thirdPartyUrl: TESTING_HOST_FULL_URL,
      thirdPartyFrameHost: TESTING_HOST_NO_PROTOCOL,
      thirdPartyFrameRegex: TESTING_HOST_NO_PROTOCOL,
    });
    if (!isTravisBuild()) {
      log('Set', cyan('TESTING_HOST'), 'to', cyan(TESTING_HOST),
          'in', cyan(target));
    }
  }
  return Object.assign(LOCAL_DEV_AMP_CONFIG, configJson);
}

/**
 * @param {string} target Target file from which to remove the AMP config
 * @return {!Promise}
 */
function removeConfig(target) {
  return fs.readFileAsync(target)
      .then(file => {
        let contents = file.toString();
        if (numConfigs(contents) == 0) {
          return Promise.resolve();
        }
        sanityCheck(contents);
        const config =
        /self\.AMP_CONFIG\|\|\(self\.AMP_CONFIG=.*?\/\*AMP_CONFIG\*\//;
        contents = contents.replace(config, '');
        return writeTarget(target, contents, argv.dryrun).then(() => {
          if (!isTravisBuild()) {
            log('Removed existing config from', cyan(target));
          }
        });
      });
}

async function prependGlobal() {
  const TESTING_HOST = process.env.AMP_TESTING_HOST;
  const target = argv.target || TESTING_HOST;

  if (!target) {
    log(red('Missing --target.'));
    return;
  }

  if (argv.remove) {
    return removeConfig(target);
  }

  if (!(argv.prod || argv.canary)) {
    log(red('One of --prod or --canary should be provided.'));
    return;
  }

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
    return applyConfig(
        config, target, filename,
        argv.local_dev, argv.local_branch, argv.branch, argv.fortesting);
  });
}

module.exports = {
  applyConfig,
  checkoutBranchConfigs,
  numConfigs,
  prependConfig,
  prependGlobal,
  removeConfig,
  sanityCheck,
  valueOrDefault,
  writeTarget,
};

prependGlobal.description = 'Prepends a json config to a target file';
prependGlobal.flags = {
  'target': '  The file to prepend the json config to.',
  'canary': '  Prepend the default canary config. ' +
      'Takes in an optional value for a custom canary config source.',
  'prod': '  Prepend the default prod config. ' +
      'Takes in an optional value for a custom prod config source.',
  'local_dev': '  Enables runtime to be used for local development.',
  'branch': '  Switch to a git branch to get config source from. ' +
      'Uses master by default.',
  'local_branch': '  Don\'t switch branches and use the config from the ' +
      'local branch.',
  'fortesting': '  Force the config to return true for getMode().test',
  'remove': '  Removes previously prepended json config from the target ' +
      'file (if present).',
};
