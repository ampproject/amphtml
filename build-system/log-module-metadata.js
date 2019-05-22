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

/** @fileoverview Definitions of logging methods for transforms and linting. */

/** @typedef {{variadic: boolean, messageArgPos: number}} */
let LogMethodMetadataDef;

const definitionFile = 'src/log.js';

/** Functions exposed as singleton getters for `Log`. */
const singletonFunctions = ['dev', 'user'];

/** Path to messages table output from transform. */
const messagesPath = 'dist/log-messages.json';

const assertAliases = singletonFunctions.map(prefix => `${prefix}Assert`);

/**
 * Known transformable logging methods.
 * @type {!Object<string, LogMethodMetadataDef>}
 */
const transformableMethods = {
  assert: {variadic: true, extractMessages: true, messageArgPos: 1},
  assertString: {variadic: false, extractMessages: true, messageArgPos: 1},
  assertNumber: {variadic: false, extractMessages: true, messageArgPos: 1},
  assertBoolean: {variadic: false, extractMessages: true, messageArgPos: 1},
  assertEnumValue: {variadic: false, extractMessages: false, messageArgPos: 2},
  assertElement: {variadic: false, extractMessages: true, messageArgPos: 1},
  fine: {variadic: true, extractMessages: true, messageArgPos: 1},
  info: {variadic: true, extractMessages: true, messageArgPos: 1},
  warn: {variadic: true, extractMessages: true, messageArgPos: 1},
  error: {variadic: true, extractMessages: true, messageArgPos: 1},
  createExpectedError: {
    variadic: true,
    extractMessages: true,
    messageArgPos: 0,
  },
  expectedError: {variadic: true, extractMessages: true, messageArgPos: 1},
  createError: {variadic: true, extractMessages: true, messageArgPos: 0},
};

module.exports = {
  assertAliases,
  definitionFile,
  messagesPath,
  singletonFunctions,
  transformableMethods,
};
