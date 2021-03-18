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

const path = require('path');
const {log, logLocalDev} = require('../common/logging');
const {red, green, cyan} = require('kleur/colors');

const expectedCaches = ['google', 'bing'];
const cachesJsonPath = '../global-configs/caches.json';

/**
 * Entry point for amp caches-jason.
 */
async function cachesJson() {
  const filename = path.basename(cachesJsonPath);
  let jsonContent;
  try {
    jsonContent = require(cachesJsonPath);
  } catch (e) {
    log(red('ERROR:'), 'Could not parse', cyan(filename));
    process.exitCode = 1;
    return;
  }
  const foundCaches = [];
  for (const foundCache of jsonContent.caches) {
    foundCaches.push(foundCache.id);
  }
  for (const cache of expectedCaches) {
    if (foundCaches.includes(cache)) {
      logLocalDev(green('✔'), 'Found', cyan(cache), 'in', cyan(filename));
    } else {
      log(red('✖'), 'Missing', cyan(cache), 'in', cyan(filename));
      process.exitCode = 1;
    }
  }
}

module.exports = {
  cachesJson,
};

cachesJson.description = 'Check that caches.json contains all expected caches.';
