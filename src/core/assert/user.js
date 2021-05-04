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

import * as assertions from './base';
import {USER_ERROR_SENTINEL} from '../error-message-helpers';

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
 * @return {T}
 * @template T
 * @throws {UserError} when shouldBeTruthy is not truthy.
 * @closurePrimitive {asserts.truthy}
 */
export function assert(
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
 * @param {!Array<*>|string=} opt_message The assertion message
 * @return {!Element} The value of shouldBeTrueish.
 * @throws {Error} when shouldBeElement is not an Element
 * @closurePrimitive {asserts.matchesReturn}
 */
export function assertElement(shouldBeElement, opt_message) {
  return assertions.assertElement(
    /** @type {!AssertionFunction} */ (assert),
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
 * @param {!Array<*>|string=} opt_message The assertion message
 * @return {string} The string value. Can be an empty string.
 * @throws {Error} when shouldBeString is not an String
 * @closurePrimitive {asserts.matchesReturn}
 */
export function assertString(shouldBeString, opt_message) {
  return assertions.assertString(
    /** @type {!AssertionFunction} */ (assert),
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
 * @param {!Array<*>|string=} opt_message The assertion message
 * @return {number} The number value. The allowed values include `0`
 *   and `NaN`.
 * @throws {Error} when shouldBeNumber is not an Number
 * @closurePrimitive {asserts.matchesReturn}
 */
export function assertNumber(shouldBeNumber, opt_message) {
  return assertions.assertNumber(
    /** @type {!AssertionFunction} */ (assert),
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
 * @param {!Array<*>|string=} opt_message The assertion message
 * @return {!Array} The array value
 * @throws {Error} when shouldBeArray is not an Array
 * @closurePrimitive {asserts.matchesReturn}
 */
export function assertArray(shouldBeArray, opt_message) {
  return assertions.assertArray(
    /** @type {!AssertionFunction} */ (assert),
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
 * @param {!Array<*>|string=} opt_message The assertion message
 * @return {boolean} The boolean value.
 * @throws {Error} when shouldBeBoolean is not an Boolean
 * @closurePrimitive {asserts.matchesReturn}
 */
export function assertBoolean(shouldBeBoolean, opt_message) {
  return assertions.assertBoolean(
    /** @type {!AssertionFunction} */ (assert),
    shouldBeBoolean,
    opt_message
  );
}

/**
 * Asserts and returns the enum value. If the enum doesn't contain such a
 * value, the error is thrown.
 *
 * @param {!Object<T>} enumObj
 * @param {*} shouldBeEnum
 * @param {string=} opt_enumName
 * @return {T}
 * @template T
 * @closurePrimitive {asserts.matchesReturn}
 */
export function assertEnumValue(enumObj, shouldBeEnum, opt_enumName) {
  return assertions.assertEnumValue(
    /** @type {!AssertionFunction} */ (assert),
    enumObj,
    shouldBeEnum,
    opt_enumName
  );
}
