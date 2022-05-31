import {USER_ERROR_SENTINEL} from '#core/error/message-helpers';

import * as assertions from './base';

/**
 * @fileoverview This file provides the entrypoint for user assertions. It's
 * designed so all functions are pure function calls to improve inlining.
 */

/**
 * Throws a user error if the first argument isn't trueish. Mirrors userAssert
 * in src/log.js.
 * @param {T} shouldBeTruthy
 * @param {string} opt_message
 * @param {*=} opt_1 Optional argument (var arg as individual params for better
 * @param {*=} opt_2 Optional argument inlining)
 * @param {*=} opt_3 Optional argument
 * @param {*=} opt_4 Optional argument
 * @param {*=} opt_5 Optional argument
 * @param {*=} opt_6 Optional argument
 * @param {*=} opt_7 Optional argument
 * @param {*=} opt_8 Optional argument
 * @param {*=} opt_9 Optional argument
 * @return {asserts shouldBeTruthy}
 * @template T
 * @throws {UserError} when shouldBeTruthy is not truthy.
 */
export function userAssert(
  shouldBeTruthy,
  opt_message,
  opt_1,
  opt_2,
  opt_3,
  opt_4,
  opt_5,
  opt_6,
  opt_7,
  opt_8,
  opt_9
) {
  return assertions.assert(
    USER_ERROR_SENTINEL,
    shouldBeTruthy,
    opt_message,
    opt_1,
    opt_2,
    opt_3,
    opt_4,
    opt_5,
    opt_6,
    opt_7,
    opt_8,
    opt_9
  );
}

/**
 * Throws an error if the first argument isn't an Element.
 *
 * For more details see `assert`.
 *
 * @param {*} shouldBeElement
 * @param {Array<*>|string=} opt_message The assertion message
 * @return {asserts shouldBeElement is Element}
 * @throws {Error} when shouldBeElement is not an Element
 */
export function userAssertElement(shouldBeElement, opt_message) {
  return assertions.assertElement(
    /** @type {import('./base').AssertionFunctionDef} */ (userAssert),
    shouldBeElement,
    opt_message
  );
}

/**
 * Throws an error if the first argument isn't a string. The string can
 * be empty.
 *
 * For more details see `assert`.
 *
 * @param {*} shouldBeString
 * @param {Array<*>|string=} opt_message The assertion message
 * @return {asserts shouldBeString is string}
 * @throws {Error} when shouldBeString is not an String
 */
export function userAssertString(shouldBeString, opt_message) {
  return assertions.assertString(
    /** @type {import('./base').AssertionFunctionDef} */ (userAssert),
    shouldBeString,
    opt_message
  );
}

/**
 * Throws an error if the first argument isn't a number. The allowed values
 * include `0` and `NaN`.
 *
 * For more details see `assert`.
 *
 * @param {*} shouldBeNumber
 * @param {Array<*>|string=} opt_message The assertion message
 * @return {asserts shouldBeNumber is number}
 * @throws {Error} when shouldBeNumber is not an Number
 */
export function userAssertNumber(shouldBeNumber, opt_message) {
  return assertions.assertNumber(
    /** @type {import('./base').AssertionFunctionDef} */ (userAssert),
    shouldBeNumber,
    opt_message
  );
}

/**
 * Throws an error if the first argument is not an array.
 * The array can be empty.
 *
 * For more details see `assert`.
 *
 * @param {*} shouldBeArray
 * @param {Array<*>|string=} opt_message The assertion message
 * @return {asserts shouldBeArray is Array} The array value
 * @throws {Error} when shouldBeArray is not an Array
 */
export function userAssertArray(shouldBeArray, opt_message) {
  return assertions.assertArray(
    /** @type {import('./base').AssertionFunctionDef} */ (userAssert),
    shouldBeArray,
    opt_message
  );
}

/**
 * Throws an error if the first argument isn't a boolean.
 *
 * For more details see `assert`.
 *
 * @param {*} shouldBeBoolean
 * @param {Array<*>|string=} opt_message The assertion message
 * @return {asserts shouldBeBoolean is boolean} The boolean value.
 * @throws {Error} when shouldBeBoolean is not an Boolean
 */
export function userAssertBoolean(shouldBeBoolean, opt_message) {
  return assertions.assertBoolean(
    /** @type {import('./base').AssertionFunctionDef} */ (userAssert),
    shouldBeBoolean,
    opt_message
  );
}
