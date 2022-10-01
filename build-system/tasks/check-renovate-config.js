/**
 * @fileoverview This file implements the `amp check-renovate-config` task,
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

const {cyan, green, red} = require('kleur/colors');
const {getOutput} = require('../common/process');
const {log} = require('../common/logging');

/**
 * Checks Renovate config for correctness using the validator provided by the
 * `renovate` package.
 * The cumulative result is returned to the `amp` process via process.exitCode
 * so that all OWNERS files can be checked / fixed.
 * @return {Promise<void>}
 */
async function checkRenovateConfig() {
  const {status, stdout} = getOutput(
    'npx -q -p renovate renovate-config-validator'
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
  'Check the Renovate config file for correctness';
