/** @fileoverview Definitions of logging methods for transforms and linting. */

/**
 * @typedef {{
 *    variadic: boolean,
 *    messageArgPos: number,
 *    extractMessages: boolean
 * }} LogMethodMetadataDef
 */

const definitionFile = 'src/utils/log.js';

/** Functions exposed as singleton getters for `Log`. */
const singletonFunctions = ['dev', 'user'];

const assertAliases = singletonFunctions.map((prefix) => `${prefix}Assert`);

/**
 * Known transformable logging methods.
 * @type {!{[key: string]: LogMethodMetadataDef}}
 */
const transformableMethods = {
  assert: {variadic: true, extractMessages: true, messageArgPos: 1},
  assertString: {variadic: false, extractMessages: true, messageArgPos: 1},
  assertNumber: {variadic: false, extractMessages: true, messageArgPos: 1},
  assertBoolean: {variadic: false, extractMessages: true, messageArgPos: 1},
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
  singletonFunctions,
  transformableMethods,
};
