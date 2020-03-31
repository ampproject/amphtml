/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

const config = require('../test-configs/config');
const globby = require('globby');
const Mocha = require('mocha');
const {isTravisBuild} = require('../common/travis');

/**
 * Run all the dev dashboard tests
 * @return {!Promise}
 */
async function devDashboardTests() {
  const mocha = new Mocha({
    reporter: isTravisBuild() ? 'mocha-silent-reporter' : 'spec',
  });

  // Add our files
  const allDevDashboardTests = globby.sync(config.devDashboardTestPaths);
  allDevDashboardTests.forEach((file) => {
    mocha.addFile(file);
  });

  // Create our deffered
  let resolver;
  const deferred = new Promise((resolverIn) => {
    resolver = resolverIn;
  });

  // Run the tests.
  mocha.run(function (failures) {
    if (failures) {
      process.exitCode = 1;
    }
    resolver();
  });
  return deferred;
}

module.exports = {
  devDashboardTests,
};

devDashboardTests.description = 'Runs all the dev dashboard tests';
