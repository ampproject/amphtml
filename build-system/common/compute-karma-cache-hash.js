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

const fs = require('fs-extra');
const {getHashObject} = require('./browserify-cache');

/**
 * Writes the browserify hashObject representing all the test files we care
 * about to a file. Used during CI to determine when to refresh .karma-cache.
 */
function main() {
  const hashObject = getHashObject();
  fs.writeJSONSync('.karma-cache-hash', hashObject, {spaces: 2});
}

main();
