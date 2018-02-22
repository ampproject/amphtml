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
const crypto = require('crypto');

// Used to e.g. references the ads binary from the runtime to get
// version lock.
exports.VERSION = argv.version ?
  String(argv.version) : String(Date.now());

// A token that changes its value each time we release AMP. This is intended
// to verify that two iframes of AMP have the same version of AMP. It is
// also intended to make running iframes with custom software very unpleasant,
// so that we are more likely to have everybody on the same version.
exports.TOKEN = getToken();

function getToken() {
  const task = process.argv[2];
  // For tests build parent and child frame can get out of sync because
  // we do not version lock them. To fix this we use a fixed token.
  if (!task || task == 'build' || task == 'test') {
    return 'development--token';
  }
  // For every other build, most importantly `dist` we assume production.
  return crypto.createHmac(
      'sha256', crypto.randomBytes(16)).update(exports.VERSION)
      .digest('hex');
}
