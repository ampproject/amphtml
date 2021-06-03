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
const globby = require('globby');
const path = require('path');
const {cyan, green} = require('../common/colors');
const {execOrThrow} = require('../common/exec');
const {log} = require('../common/logging');
const {updateSubpackages} = require('../common/update-packages');

/**
 * Helper that updates build-system subpackages so their types can be verified.
 * Skips npm checks during CI (already done while running each task).
 */
function updateBuildSystemSubpackages() {
  const packageFiles = globby.sync('build-system/tasks/*/package.json');
  for (const packageFile of packageFiles) {
    const packageDir = path.dirname(packageFile);
    updateSubpackages(packageDir, /* skipNpmChecks */ true);
  }
}

/**
 * Performs type checking on the /build-system directory using TypeScript.
 * Configuration is defined in /build-system/tsconfig.json.
 */
function checkBuildSystem() {
  updateBuildSystemSubpackages();
  log('Checking types in', cyan('build-system') + '...');
  execOrThrow(
    'npx -p typescript tsc --project ./build-system/tsconfig.json',
    'Type checking failed'
  );
  log(green('SUCCESS:'), 'No type errors in', cyan('build-system') + '.');
}

checkBuildSystem.description =
  'Check source code in build-system/ for JS type errors.';

module.exports = {
  checkBuildSystem,
};
