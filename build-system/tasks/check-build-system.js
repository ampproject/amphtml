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
const {execOrThrow} = require('../common/exec');

/**
 * Performs type checking on the /build-system directory using TypeScript.
 * Configuration is defined in /build-system/tsconfig.json.
 */
function checkBuildSystem() {
  execOrThrow(
    'npx -p typescript tsc --project ./build-system/tsconfig.json',
    'TypeScript build failed'
  );
}

checkBuildSystem.description =
  'Check source code in build-system/ for JS type errors.';

module.exports = {
  checkBuildSystem,
};
