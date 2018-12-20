/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @type {!Array<LogMethodMetadataDef>}
 */
exports.transformableMethods = [
  {name: 'assert', variadic: true, startPos: 1},
  {name: 'assertString', variadic: false, startPos: 1},
  {name: 'assertNumber', variadic: false, startPos: 1},
  {name: 'assertBoolean', variadic: false, startPos: 1},
  {name: 'assertEnumValue', variadic: false, startPos: 2},
  {name: 'assertElement', variadic: false, startPos: 1},
  {name: 'fine', variadic: true, startPos: 1},
  {name: 'info', variadic: true, startPos: 1},
  {name: 'warn', variadic: true, startPos: 1},
  // Disable any of the error methods linting for now since these methods
  // do a lot more work than just normal message logging.
  //{name: 'error', variadic: true, startPos: 1},
  //{name: 'createExpectedError', variadic: true, startPos: 0},
  //{name: 'expectedError', variadic: true, startPos: 1},
  //{name: 'createError', variadic: true, startPos: 0},
];
