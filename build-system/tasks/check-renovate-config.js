/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview This file implements the `gulp check-renovate-config` task,
 * which validates the Renovate configuration file using Renovate's provided
 * config validator. The output of this built-in validator is shown below.
 *
 * Output on success:
 * ````
 * Validating .renovaterc.json
 * Validating config.js
 * OK
 * ````
 *
 * Output on invalid file (ex. invalid JSON):
 * ````
 * Validating .renovaterc.json
 * .renovaterc.json is not valid Renovate config
 * Validating config.js
 * ````
 *
 * Example output on invalid configuration (ex. illegal option):
 * ````
 * Validating .renovaterc.json
 * .renovaterc.json contains errors:
 *
 * [
 *   {
 *     "depName": "Configuration Error",
 *     "message": "Invalid configuration option: dependencies"
 *   }
 * ]
 * ````
 */

'use strict';

const log = require('fancy-log');
const {cyan, red, green} = require('ansi-colors');
const {getOutput} = require('../common/exec');

/**
 * Checks Renovate config for correctness using the validator provided by the
 * `renovate` package.
 * The cumulative result is returned to the `gulp` process via process.exitCode
 * so that all OWNERS files can be checked / fixed.
 */
async function checkRenovateConfig() {
  const {status, stdout} = getOutput(
    'node_modules/renovate/dist/config-validator.js'
  );
  const [configFile] = stdout.match(/(?<=Validating )\S+/);

  if (status === 0) {
    // Handle valid configuration.
    log(green('SUCCESS:'), 'No errors in', cyan(configFile));
    return;
  }

  process.exitCode = 1;
  if (stdout.search('is not valid Renovate config') > -1) {
    // Handle invalid configuration file.
    log(
      red('FAILURE'),
      'Configuration file',
      cyan(configFile),
      'cannot be read'
    );
  } else {
    // Handle valid file with configuration errors.
    const [errorInfo] = stdout.match(
      /(?<=contains errors:\s*)[\s\S]*(?=Validating config)/
    );

    try {
      JSON.parse(errorInfo).forEach(({depName, message}) => {
        log(red(`${depName}:`), message);
      });
    } catch {
      log(red('Configuration Error:'), errorInfo.trim());
    }
  }
}

module.exports = {
  checkRenovateConfig,
};

checkRenovateConfig.description =
  'Checks the Renovate config file for correctness';
