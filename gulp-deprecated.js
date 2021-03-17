#!/usr/bin/env node
/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

const {cyan, yellow} = require('kleur/colors');
const {log} = require('./build-system/common/logging');

/**
 * Prints a deprecation notice for the gulp task runner.
 */
function printGulpDeprecationNotice() {
  log(yellow('=*='.repeat(25)));
  log(yellow('DEPRECATION NOTICE:'));
  log(
    'All',
    cyan('gulp'),
    'tasks have been replaced by an identical set of',
    cyan('amp'),
    'tasks.'
  );
  log('⤷ Run', cyan('amp --help'), 'for a full list of tasks.');
  log('⤷ Run', cyan('amp <command> --help'), 'for help with a specific task.');
  log(
    '⤷ See',
    cyan('contributing/TESTING.md#testing-commands'),
    'for more info.'
  );
  log(yellow('=*='.repeat(25)));
}

// Print a deprecation notice and fall back to the amp task runner.
printGulpDeprecationNotice();
require('./amp');
