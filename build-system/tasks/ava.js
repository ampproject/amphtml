/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

const {exec} = require('../common/exec');

/**
 * Runs ava tests.
 * @param {function} cb
 */
function ava(cb) {
  const avaCli = 'node_modules/ava/cli.js';
  const testFiles = [
    require.resolve('./get-zindex/get-zindex.test.js'),
    require.resolve('./prepend-global/prepend-global.test.js'),
  ].join(' ');
  const {status} = exec(`${avaCli} ${testFiles} --color --fail-fast`);
  if (status) {
    const reason = new Error('Tests failed');
    reason.showStack = false;
    cb(reason);
  } else {
    cb();
  }
}

module.exports = {
  ava,
};

ava.description = "Runs ava tests for AMP's tasks";
