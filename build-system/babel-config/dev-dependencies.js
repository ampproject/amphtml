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

const packageJson = require('../../package.json');

/**
 * Gets relative paths to all the devDependencies defined in package.json.
 *
 * @return {!Array<string>}
 */
function getDevDependencies() {
  return Object.keys(packageJson.devDependencies).map(
    (dependency) => `./node_modules/${dependency}`
  );
}

module.exports = {
  getDevDependencies,
};
