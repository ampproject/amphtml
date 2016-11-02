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
  console.error('postinstall-windows.js: This script is for Windows only.');
  process.exit(1);
}

var validatorShimPath =
    path.join(process.env.npm_config_prefix, 'amphtml-validator.cmd');
var stats = fs.statSync(validatorShimPath);
if (!stats.isFile()) {
  console.error('postinstall-windows.js: amphtml-validator not found.');
  process.exit(1);
}

var contents = fs.readFileSync(validatorShimPath, 'utf8');
if (contents.indexOf('"%~dp0\\node_modules\\amphtml-validator\\index.sh"') ===
    -1) {
  console.error('postinstall-windows.js: amphtml-validator not matched.');
  process.exit(1);
}

fs.writeFileSync(
    validatorShimPath, '@ECHO OFF\r\n' +
        'node "%~dp0\\node_modules\\amphtml-validator\\index.js" %*');
console.log('postinstall-windows.js: Modified amphtml-validator for Windows.');
