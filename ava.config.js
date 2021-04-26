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

export default {
  // These files need equivalents for CI in build-system/pr-check/build-targets.js
  // (see targetMatchers[Targets.AVA])
  files: [
    'build-system/tasks/get-zindex/get-zindex.test.js',
    'build-system/tasks/make-extension/test/test.js',
    'build-system/tasks/markdown-toc/test/test.js',
    'build-system/tasks/prepend-global/prepend-global.test.js',
  ],
  ignoredByWatcher: [
    '.*-cache/**',
    'build-system/compile/*.json',
    '**/build/**',
    '**/dist/**',
    '3p/**',
    'ads/**',
    'examples/**',
    'extensions/**',
    'src/**',
    'test/**',
    'validator/**',
  ],
};
