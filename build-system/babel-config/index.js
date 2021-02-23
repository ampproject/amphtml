/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

const fs = require('fs');

/**
 * Populates a single object with the babel configs from all the *-config.js
 * files in this directory.
 *
 * @return {!Object}
 */
function getAllBabelConfigs() {
  const babelConfigFiles = fs
    .readdirSync(__dirname)
    .filter((file) => file.includes('-config.js'));
  const babelConfigs = babelConfigFiles.map((file) => require(`./${file}`));
  return Object.assign({}, ...babelConfigs);
}

module.exports = getAllBabelConfigs();
