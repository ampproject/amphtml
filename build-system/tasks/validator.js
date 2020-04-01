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
  execOrDie('python build.py' + validatorArgs, {cwd: 'validator'});
}

/**
 * Simple wrapper around the Java validator test suite.
 */
async function validatorJava() {
  const commands = [];
  if (argv.clean) {
    commands.append('bazel clean');
  }

  execOrDie(
    commands
      .concat([
        'echo travis_fold:start:java_validator_build',
        'bazel run //:fetchAMPResources',
        'bazel build //:amphtml_validator_java_proto_lib',
        'bazel run //:copyValidatorJavaSource',
        'bazel build //:amphtml_validator_lib',
        'echo travis_fold:end:java_validator_build',
        'bazel run //:amphtml_validator_test',
      ])
      .join(' && '),
    {cwd: 'validator/java'}
  );
}

/**
 * Simple wrapper around the python based validator webui build.
 */
async function validatorWebui() {
  execOrDie('python build.py' + validatorArgs, {cwd: 'validator/webui'});
}

module.exports = {
  validator,
  validatorJava,
  validatorWebui,
};

validator.description = 'Builds and tests the AMP validator.';
validator.flags = {
  'update_tests': '  Updates validation test output files',
};

validatorJava.description =
  'Builds and tests the AMP validator Java implementation.';
validatorJava.flags = {
  'clean':
    '  Cleans the build directories before running Java validator tests.',
};

validatorWebui.description = 'Builds and tests the AMP validator web UI.';
validatorWebui.flags = {
  'update_tests': '  Updates validation test output files',
};
