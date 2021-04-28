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
import {isMinifiedMode} from '../minified-mode';

const DEV_SENTINEL = '';

/**
 * Throws an error if the first argument isn't trueish. Mirrors devAssert in
 * src/log.js.
 * @param {T} shouldBeTruthy
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
 * @return {T}
 * @template T
 * @throws {Error} when shouldBeTruthy is not truthy.
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
  if (isMinifiedMode()) {
    return shouldBeTruthy;
  }

  if (self.__AMP_ASSERTION_CHECK) {
    // This will never execute regardless, but will be included on unminified
    // builds. It will be DCE'd away from minified builds, and so can be used to
    // validate that Babel is properly removing dev assertions in minified
    // builds.
    console /*OK*/
      .log('__devAssert_sentinel__');
  }

  return assertions.assert(
    DEV_SENTINEL,
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
 * @param {?string} sentinel
 * @param {*} shouldBeElement
 * @param {Array|string=} opt_message The assertion message
 * @return {!Element} The value of shouldBeTrueish.
 * @throws {Error} when shouldBeElement is not an Element
 * @closurePrimitive {asserts.matchesReturn}
 */
export function assertElement(sentinel, shouldBeElement, opt_message) {
  return assertions.assertElement(DEV_SENTINEL, shouldBeElement, opt_message);
}

/**
 * Throws an error if the first argument isn't a string. The string can
 * be empty.
 *
 * For more details see `assert`.
 *
 * @param {?string} sentinel
 * @param {*} shouldBeString
 * @param {Array|string=} opt_message The assertion message
 * @return {string} The string value. Can be an empty string.
 * @throws {Error} when shouldBeString is not an String
 * @closurePrimitive {asserts.matchesReturn}
 */
export function assertString(sentinel, shouldBeString, opt_message) {
  return assertions.assertString(DEV_SENTINEL, shouldBeString, opt_message);
}

/**
 * Throws an error if the first argument isn't a number. The allowed values
 * include `0` and `NaN`.
 *
 * For more details see `assert`.
 *
 * @param {?string} sentinel
 * @param {*} shouldBeNumber
 * @param {Array|string=} opt_message The assertion message
 * @return {number} The number value. The allowed values include `0`
 *   and `NaN`.
 * @throws {Error} when shouldBeNumber is not an Number
 * @closurePrimitive {asserts.matchesReturn}
 */
export function assertNumber(sentinel, shouldBeNumber, opt_message) {
  return assertions.assertNumber(DEV_SENTINEL, shouldBeNumber, opt_message);
}

/**
 * Throws an error if the first argument is not an array.
 * The array can be empty.
 *
 * For more details see `assert`.
 *
 * @param {?string} sentinel
 * @param {*} shouldBeArray
 * @param {Array|string=} opt_message The assertion message
 * @return {!Array} The array value
 * @throws {Error} when shouldBeArray is not an Array
 * @closurePrimitive {asserts.matchesReturn}
 */
export function assertArray(sentinel, shouldBeArray, opt_message) {
  return assertions.assertArray(DEV_SENTINEL, shouldBeArray, opt_message);
}

/**
 * Throws an error if the first argument isn't a boolean.
 *
 * For more details see `assert`.
 *
 * @param {?string} sentinel
 * @param {*} shouldBeBoolean
 * @param {Array|string=} opt_message The assertion message
 * @return {boolean} The boolean value.
 * @throws {Error} when shouldBeBoolean is not an Boolean
 * @closurePrimitive {asserts.matchesReturn}
 */
export function assertBoolean(sentinel, shouldBeBoolean, opt_message) {
  return assertions.assertBoolean(DEV_SENTINEL, shouldBeBoolean, opt_message);
}

/**
 * Asserts and returns the enum value. If the enum doesn't contain such a
 * value, the error is thrown.
 *
 * @param {?string} sentinel
 * @param {*} shouldBeEnum
 * @param {!Object<T>} enumObj
 * @param {string=} opt_enumName
 * @return {T}
 * @template T
 * @closurePrimitive {asserts.matchesReturn}
 */
export function assertEnumValue(sentinel, shouldBeEnum, enumObj, opt_enumName) {
  return assertions.assertEnumValue(
    DEV_SENTINEL,
    shouldBeEnum,
    enumObj,
    opt_enumName
  );
}
