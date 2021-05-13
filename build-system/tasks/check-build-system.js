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
const {cyan, green} = require('../common/colors');
const {execOrThrow} = require('../common/exec');
const {log} = require('../common/logging');

/**
 * Performs type checking on the /build-system directory using TypeScript.
 * Configuration is defined in /build-system/tsconfig.json.
 */
function checkBuildSystem() {
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
