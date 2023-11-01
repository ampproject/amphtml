'use strict';

const argv = require('minimist')(process.argv.slice(2));
const {execOrDie} = require('../common/exec');

let validatorArgs = '';
if (argv.update_tests) {
  validatorArgs += ' --update_tests';
}

/**
 * Simple wrapper around the python based validator tests.
 * @return {Promise<void>}
 */
async function validator() {
  execOrDie('python3 build.py' + validatorArgs, {
    cwd: 'validator',
    stdio: 'inherit',
  });
}

/**
 * Simple wrapper around the bazel based C++ validator tests.
 * @return {Promise<void>}
 */
async function validatorCpp() {
  const bazelCmd = [
    'bazel-5.4.0 test',
    '--repo_env=CC=clang',
    "--cxxopt='-std=c++17'",
    '--discard_analysis_cache',
    '--notrack_incremental_state',
    '--nokeep_state_after_build',
    '--test_output=errors',
    '--ui_event_filters=INFO',
    '--noshow_progress',
    '--noshow_loading_progress',
    '--test_summary=detailed',
    '--verbose_failures',
    'cpp/engine:validator_test',
  ].join(' ');
  execOrDie(bazelCmd, {
    cwd: 'validator',
    stdio: 'inherit',
  });
}

/**
 * Simple wrapper around the python based validator webui tests.
 * @return {Promise<void>}
 */
async function validatorWebui() {
  execOrDie('python3 build.py' + validatorArgs, {
    cwd: 'validator/js/webui',
    stdio: 'inherit',
  });
}

module.exports = {
  validator,
  validatorCpp,
  validatorWebui,
};

validator.description = 'Build and tests the AMP validator';
validator.flags = {
  'update_tests': 'Update validation test output files',
};

validatorCpp.description = 'Build and tests the AMP C++ validator';
// TODO(antiphoton): Add the ability to update validation test output files.

validatorWebui.description = 'Build and test the AMP validator web UI';
validatorWebui.flags = {
  'update_tests': 'Update validator web UI test output files',
};
