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

const {Base} = require('mocha').reporters;
const {inherits} = require('mocha').utils;
const {symbols} = require('./karma.conf').mochaReporter;

/**
 * Custom Mocha reporter for CI builds.
 * Mimics the style of the Karma reporter on Travis.
 * @param {*} runner
 */
function ciReporter(runner) {
  Base.call(this, runner);
  const self = this;

  runner.on('pass', function() {
    process.stdout.write(Base.color('green', symbols.success));
  });

  runner.on('pending', function() {
    process.stdout.write(Base.color('bright yellow', symbols.info));
  });

  runner.on('fail', function() {
    process.stdout.write(Base.color('fail', symbols.error));
  });

  runner.on('end', function() {
    epilogue();
  });

  function epilogue() {
    const {failures, stats} = self;
    Base.list(failures);
    process.stdout.write(
      `Executed ${stats.failures + stats.passes} of ${stats.tests} ` +
        `(Skipped ${stats.pending}) `
    );
    if (stats.failures == 0) {
      process.stdout.write(Base.color('green', 'SUCCESS \n'));
    } else {
      process.stdout.write(Base.color('fail', `${stats.failures} FAILED \n`));
    }
  }
}

inherits(ciReporter, Base);
module.exports = ciReporter;
