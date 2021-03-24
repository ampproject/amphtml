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

const argv = require('minimist')(process.argv.slice(2));
const {execOrDie} = require('../common/exec');

let validatorArgs = '';
if (argv.update_tests) {
  validatorArgs += ' --update_tests';
}

/**
 * Simple wrapper around the python based validator build.
 */
async function validator() {
  execOrDie('python3 build.py' + validatorArgs, {
    cwd: 'validator',
    stdio: 'inherit',
  });
}

/**
 * Simple wrapper around the C++ validator tests
 */
async function validatorCpp() {
  execOrDie(
    `bazel test --repo_env=CC=clang --cxxopt='-std=c++17' validator_test`,
    {
      cwd: 'validator/cpp/engine',
      stdio: 'inherit',
    }
  );
}

/**
 * Simple wrapper around the python based validator webui build.
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

validator.description = 'Builds and tests the AMP validator.';
validator.flags = {
  'update_tests': 'Updates validation test output files',
};

validatorCpp.description = 'Builds and tests the AMP C++ validator.';
// TODO(antiphoton): Add the ability to update validation test output files.

validatorWebui.description = 'Builds and tests the AMP validator web UI.';
validatorWebui.flags = {
  'update_tests': 'Updates validation test output files',
};
