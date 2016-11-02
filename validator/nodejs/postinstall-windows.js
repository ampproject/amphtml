/**
 * @license
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
 * limitations under the license.
 */

'use strict';

var path = require('path');
var fs = require('fs');

if (process.env.OS !== 'Windows_NT') {
  console./*OK*/ error(
      'postinstall-windows.js: This script is for Windows only.');
  process.exit(1);
}

// We only want to modify the .cmd shim - this is what would run on a
// normal Windows installation (not cygwin or similar). If we're on
// something close enough to a Unix/Linux system (even if this were to
// be Windows), we won't bother and this postinstall won't run because
// /bin/sh -c "exit 0" will succeed (see package.json).
var validatorShimPath =
    path.join(process.env.npm_config_prefix, 'amphtml-validator.cmd');
var stats = fs.statSync(validatorShimPath);
if (!stats.isFile()) {
  console./*OK*/ error('postinstall-windows.js: amphtml-validator not found.');
  process.exit(1);
}

// We take a quick look into the shim file that npm for Windows generates.
// This will try to invoke the shell script, using /bin/sh as the interpreter -
// which we already established won't work if this postinstall were to trigger
// (again, see the command line in package.json and imagine what happens if
// cmd.exe executes it).
var contents = fs.readFileSync(validatorShimPath, 'utf8');
if (contents.indexOf('"%~dp0\\node_modules\\amphtml-validator\\index.sh"') ===
    -1) {
  console./*OK*/ error(
      'postinstall-windows.js: amphtml-validator not matched.');
  process.exit(1);
}

// Now we write a shim file that will likely work. We already know that the
// node command works (since this is how we were invoked from the command line
// in package.json), and we know that index.js is a sibling to index.sh.
// So, we can just invoke that.
fs.writeFileSync(
    validatorShimPath, '@ECHO OFF\r\n' +
        'node "%~dp0\\node_modules\\amphtml-validator\\index.js" %*');
console./*OK*/ log(
    'postinstall-windows.js: Modified amphtml-validator for Windows.');
