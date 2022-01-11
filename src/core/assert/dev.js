import * as mode from '#core/mode';

import * as assertions from './base';

/**
 * @fileoverview This file provides the entrypoint for dev assertions. It's
 * designed so all functions are pure function calls to improve inlining. All
 * functions in this file get DCE'd away during compilation.
 */

/**
 * This will never execute regardless, but will be included on unminified builds
 * builds. It will be DCE'd away from minified builds, and so can be used to
 * validate that Babel is properly removing dev assertions in minified builds.
 */
function devAssertDceCheck() {
  if (self.__AMP_ASSERTION_CHECK) {
    console /*OK*/
      .log('__devAssert_sentinel__');
  }
}

/**
 * Throws an error if the first argument isn't trueish. Mirrors devAssert in
 * src/log.js.
 * @param {*} shouldBeTruthy
 * @param {string=} opt_message
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
 * @throws {Error} when shouldBeTruthy is not truthy.
 */
export function devAssert(
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
  if (mode.isMinified()) {
    return /** @type {void} */ (shouldBeTruthy);
  }
  devAssertDceCheck();

  return assertions.assert(
    '',
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
export function devAssertElement(shouldBeElement, opt_message) {
  if (mode.isMinified()) {
    return /** @type {void} */ (shouldBeElement);
  }
  devAssertDceCheck();

  return assertions.assertElement(
    /** @type {import('./base').AssertionFunctionDef} */ (devAssert),
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
export function devAssertString(shouldBeString, opt_message) {
  if (mode.isMinified()) {
    return /** @type {void} */ (shouldBeString);
  }
  devAssertDceCheck();

  return assertions.assertString(
    /** @type {import('./base').AssertionFunctionDef} */ (devAssert),
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
export function devAssertNumber(shouldBeNumber, opt_message) {
  if (mode.isMinified()) {
    return /** @type {void} */ (shouldBeNumber);
  }
  devAssertDceCheck();

  return assertions.assertNumber(
    /** @type {import('./base').AssertionFunctionDef} */ (devAssert),
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
 * @return {asserts shouldBeArray is Array}
 * @throws {Error} when shouldBeArray is not an Array
 */
export function devAssertArray(shouldBeArray, opt_message) {
  if (mode.isMinified()) {
    return /** @type {void} */ (shouldBeArray);
  }
  devAssertDceCheck();

  return assertions.assertArray(
    /** @type {import('./base').AssertionFunctionDef} */ (devAssert),
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
 * @return {asserts shouldBeBoolean is boolean}
 * @throws {Error} when shouldBeBoolean is not an Boolean
 */
export function devAssertBoolean(shouldBeBoolean, opt_message) {
  if (mode.isMinified()) {
    return /** @type {void} */ (shouldBeBoolean);
  }
  devAssertDceCheck();

  return assertions.assertBoolean(
    /** @type {import('./base').AssertionFunctionDef} */ (devAssert),
    shouldBeBoolean,
    opt_message
  );
}
