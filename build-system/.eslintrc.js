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

module.exports = {
  'env': {
    'node': true,
  },
  'globals': {
    'require': false,
    'process': false,
    'exports': false,
    'it': false,
    'chai': false,
    'expect': false,
    'describe': false,
    'beforeEach': false,
    'afterEach': false,
    'before': false,
    'after': false,
    'assert': false,
    'describes': true,
    'Key': false,
  },
  'rules': {
    'local/no-array-destructuring': 0,
    'local/no-bigint': 0,
    'local/no-dynamic-import': 0,
    'local/no-export-side-effect': 0,
    'local/no-for-of-statement': 0,
    'local/no-function-async': 0,
    'local/no-function-generator': 0,
    'local/no-has-own-property-method': 0,
    'local/no-import-meta': 0,
    'local/no-module-exports': 0,
    'local/no-rest': 0,
    'local/no-spread': 0,
    'require-jsdoc': 0,
  },
};
