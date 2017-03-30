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

// The postinstall invocation in package.json creates this temp file and on
// Windows installations, it won't delete it. We used to redirect to NUL
// but that doesn't work in Linux if the underlying filesystem is SMB
// (since in Windows NUL is special). So now we clean it up best-effort here.
if (fs.existsSync('postinstall.DELETEME')) {
  fs.unlinkSync('postinstall.DELETEME');
}

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
if (!fs.existsSync(validatorShimPath)) {
  // We exit here because postinstall-windows.js will be invoked for both
  // a local install and for a --global npm install. While both create a shim,
  // the local install would place this shim into node_modules/.bin, and to
  // determine which node_modules/.bin we'd need to reimplement the Node.js
  // mechanism that's described in https://docs.npmjs.com/files/folders.
  // So we punt here, because this is complex and a modified shim is mostly
  // useful in the global install case.
  console./*OK*/ log(
      'postinstall-windows.js: No amphtml-validator shim found to modify.');
  process.exit(0);
}

// Unfortunately the shim file that npm for Windows generates doesn't
// work. It will try to invoke the shell script that's part of this
// package, using /bin/sh as the interpreter - which we've already
// established won't work if this postinstall were to trigger (again,
// see the command line in package.json and imagine what happens if
// cmd.exe executes it). So, we detect this file and replace it with a
// shim that will likely work. We already know that the node command
// works (since this is how we were invoked from the command line in
// package.json), and we know that index.js is a sibling to
// index.sh. So, we can just invoke that.
var shimForWindows = '@ECHO OFF\r\n' +
    'node "%~dp0\\node_modules\\amphtml-validator\\index.js" %*';

var contents = fs.readFileSync(validatorShimPath, 'utf8');
// This check triggers specifically if amphtml-validator has been globally
// installed already and now we're performing a local install. This crude
// postinstall script will then nevertheless reach for the global installation
// which may already be patched up. But it's a good idea to be idempotent in
// general.
if (contents === shimForWindows) {
  console./*OK*/ log('postinstall-windows.js: amphtml-validator already fine.');
  process.exit(0);
}

// Before we write the modified shim we still check the contents of the file
// to make sure it's not something unexpected.
if (contents.indexOf('"%~dp0\\node_modules\\amphtml-validator\\index.sh"') ===
    -1) {
  console./*OK*/ error(
      'postinstall-windows.js: amphtml-validator not matched.');
  process.exit(1);
}

fs.writeFileSync(validatorShimPath, shimForWindows);
console./*OK*/ log(
    'postinstall-windows.js: Modified amphtml-validator for Windows.');
