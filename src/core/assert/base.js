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

import {elementStringOrPassThru} from '@amp/core/error-message-helpers';
import {includes} from '@amp/core/types/string';
import {isArray, isElement, isEnumValue, isString} from '@amp/core/types';
import {remove} from '@amp/core/types/array';

/**
 * @fileoverview This file provides the base implementation for assertion
 * functions. Most files should never import from this; instead, import from
 * `dev` or `user`. It is also used by the Log class for its assertions.
 */

/**
 * Throws an error if the second argument isn't trueish.
 *
 * Supports argument substitution into the message via %s placeholders.
 *
 * Throws an error object that has two extra properties:
 * - messageArray: The elements of the substituted message as non-stringified
 *   elements in an array. When e.g. passed to console.error this yields
 *   native displays of things like HTML elements.
 * @param {?string} sentinel
 * @param {T} shouldBeTruthy
 * @param {string} opt_message
 * @param {...*} var_args Arguments substituted into %s in the message
 * @return {T}
 * @template T
 * @throws {Error} when shouldBeTruthy is not truthy.
 */
export function assert(
  sentinel,
  shouldBeTruthy,
  opt_message = 'Assertion failed',
  var_args
) {
  if (shouldBeTruthy) {
    return shouldBeTruthy;
  }

  // Include the sentinel string if provided and not already present
  if (sentinel && !includes(opt_message, sentinel)) {
    opt_message += sentinel;
  }

  // Skip the first 3 arguments to isolate format params
  // const messageArgs = Array.prototype.slice.call(arguments, 3);
  // Index at which message args start
  let i = 3;

  // Substitute provided values into format string in message
  const splitMessage = opt_message.split('%s');
  let message = splitMessage.shift();
  const messageArray = [message];

  while (splitMessage.length) {
    const subValue = arguments[i++];
    const nextConstant = splitMessage.shift();

    message += elementStringOrPassThru(subValue) + nextConstant;
    messageArray.push(subValue, nextConstant.trim());
  }

  const error = new Error(message);
  error.messageArray = remove(messageArray, (x) => x !== '');
  // __AMP_REPORT_ERROR is installed globally per window in the entry point in
  // AMP documents. It may not be present for Bento/Preact elements on non-AMP
  // pages.
  if (self.__AMP_REPORT_ERROR) {
    self.__AMP_REPORT_ERROR(error);
  }
  throw error;
}

/**
 * Asserts types, backbone of `assertNumber`, `assertString`, etc.
 *
 * It understands array-based "id"-contracted messages.
 *
 * Otherwise creates a sprintf syntax string containing the optional message or the
 * default. The `subject` of the assertion is added at the end.
 *
 * @param {!AssertionFunction} assertFn underlying assertion function to call
 * @param {T} subject
 * @param {*} shouldBeTruthy
 * @param {string} defaultMessage
 * @param {!Array<*>|string=} opt_message
 * @return {T}
 * @template T
 * @private
 */
function assertType_(
  assertFn,
  subject,
  shouldBeTruthy,
  defaultMessage,
  opt_message
) {
  if (isArray(opt_message)) {
    assertFn(
      shouldBeTruthy,
      /** @type {!Array} */ (opt_message).concat([subject])
    );
  } else {
    assertFn(shouldBeTruthy, `${opt_message || defaultMessage}: %s`, subject);
  }

  return subject;
}

/**
 * Throws an error if the first argument isn't an Element.
 *
 * For more details see `assert`.
 *
 * @param {!AssertionFunction} assertFn underlying assertion function to call
 * @param {*} shouldBeElement
 * @param {!Array<*>|string=} opt_message The assertion message
 * @return {!Element} The value of shouldBeTrueish.
 * @throws {Error} when shouldBeElement is not an Element
 * @closurePrimitive {asserts.matchesReturn}
 */
export function assertElement(assertFn, shouldBeElement, opt_message) {
  return /** @type {!Element} */ (assertType_(
    assertFn,
    shouldBeElement,
    isElement(shouldBeElement),
    'Element expected',
    opt_message
  ));
}

/**
 * Throws an error if the first argument isn't a string. The string can
 * be empty.
 *
 * For more details see `assert`.
 *
 * @param {!AssertionFunction} assertFn underlying assertion function to call
 * @param {*} shouldBeString
 * @param {!Array<*>|string=} opt_message The assertion message
 * @return {string} The string value. Can be an empty string.
 * @throws {Error} when shouldBeString is not an String
 * @closurePrimitive {asserts.matchesReturn}
 */
export function assertString(assertFn, shouldBeString, opt_message) {
  return /** @type {string} */ (assertType_(
    assertFn,
    shouldBeString,
    isString(shouldBeString),
    'String expected',
    opt_message
  ));
}

/**
 * Throws an error if the first argument isn't a number. The allowed values
 * include `0` and `NaN`.
 *
 * For more details see `assert`.
 *
 * @param {!AssertionFunction} assertFn underlying assertion function to call
 * @param {*} shouldBeNumber
 * @param {!Array<*>|string=} opt_message The assertion message
 * @return {number} The number value. The allowed values include `0`
 *   and `NaN`.
 * @throws {Error} when shouldBeNumber is not an Number
 * @closurePrimitive {asserts.matchesReturn}
 */
export function assertNumber(assertFn, shouldBeNumber, opt_message) {
  return /** @type {number} */ (assertType_(
    assertFn,
    shouldBeNumber,
    typeof shouldBeNumber == 'number',
    'Number expected',
    opt_message
  ));
}

/**
 * Throws an error if the first argument is not an array.
 * The array can be empty.
 *
 * For more details see `assert`.
 *
 * @param {!AssertionFunction} assertFn underlying assertion function to call
 * @param {*} shouldBeArray
 * @param {!Array<*>|string=} opt_message The assertion message
 * @return {!Array} The array value
 * @throws {Error} when shouldBeArray is not an Array
 * @closurePrimitive {asserts.matchesReturn}
 */
export function assertArray(assertFn, shouldBeArray, opt_message) {
  return /** @type {!Array} */ (assertType_(
    assertFn,
    shouldBeArray,
    isArray(shouldBeArray),
    'Array expected',
    opt_message
  ));
}

/**
 * Throws an error if the first argument isn't a boolean.
 *
 * For more details see `assert`.
 *
 * @param {!AssertionFunction} assertFn underlying assertion function to call
 * @param {*} shouldBeBoolean
 * @param {!Array<*>|string=} opt_message The assertion message
 * @return {boolean} The boolean value.
 * @throws {Error} when shouldBeBoolean is not an Boolean
 * @closurePrimitive {asserts.matchesReturn}
 */
export function assertBoolean(assertFn, shouldBeBoolean, opt_message) {
  return /** @type {boolean} */ (assertType_(
    assertFn,
    shouldBeBoolean,
    !!shouldBeBoolean === shouldBeBoolean,
    'Boolean expected',
    opt_message
  ));
}

/**
 * Asserts and returns the enum value. If the enum doesn't contain such a
 * value, the error is thrown.
 *
 * @param {!AssertionFunction} assertFn underlying assertion function to call
 * @param {!Object<T>} enumObj
 * @param {*} shouldBeEnum
 * @param {string=} opt_enumName
 * @return {T}
 * @template T
 * @closurePrimitive {asserts.matchesReturn}
 */
export function assertEnumValue(
  assertFn,
  enumObj,
  shouldBeEnum,
  opt_enumName = 'enum'
) {
  return assertType_(
    assertFn,
    shouldBeEnum,
    isEnumValue(enumObj, shouldBeEnum),
    `Unknown ${opt_enumName} value: "${shouldBeEnum}"`
  );
}
