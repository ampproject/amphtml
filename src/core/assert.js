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

import {
  USER_ERROR_SENTINEL,
  elementStringOrPassThru,
} from './error-message-helpers';
import {isArray} from './types/array';
import {isMinifiedMode} from './minified-mode';

/**
 * Throws an error if the second argument isn't trueish.
 *
 * Supports argument substitution into the message via %s placeholders. It does
 * not yet support array-based "id"-contracted messages.
 *
 * Throws an error object that has one extra properties:
 * - messageArray: The elements of the substituted message as non-stringified
 *   elements in an array. When e.g. passed to console.error this applies the
 *   arguments to the format string.
 * @typedef {function} AssertionFunction
 * @param {string} opt_sentinel optional marker to indicate user errors
 * @param {T} shouldBeTruthy
 * @param {string} opt_message
 * @param {...*} var_args Arguments substituted into %s in the message
 * @return {T}
 * @template {T}
 * @throws {Error} when shouldBeTruthy is not truthy.
 * @closurePrimitive {asserts.truthy}
 */
export function baseAssert(
  opt_sentinel,
  shouldBeTruthy,
  opt_message = 'Assertion failed',
  var_args
) {
  if (shouldBeTruthy) {
    return shouldBeTruthy;
  }

  // Include the sentinel string if provided and not already present
  if (opt_sentinel && !opt_message.includes(opt_sentinel)) {
    opt_message += opt_sentinel;
  }

  // Substitute provided values into format string in message
  const messageArgs = Array.prototype.slice.call(arguments, 2);
  let i = 1;
  const message = opt_message.replace(/%s/g, () =>
    elementStringOrPassThru(messageArgs[i++])
  );

  const error = new Error(message);
  // This slice ensures inlined calls that pass multiple "undefined" values
  // don't get picked up in the resulting array.
  error.messageArray = messageArgs.slice(0, i);
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
 * @param {Array|string=} opt_message
 * @return {T}
 * @template {T}
 * @private
 */
function baseAssertType_(
  assertFn,
  subject,
  shouldBeTruthy,
  defaultMessage,
  opt_message
) {
  if (isArray(opt_message)) {
    assertFn(shouldBeTruthy, opt_message.concat(subject));
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
 * @param {!AssertionFunction} assertFn
 * @param {*} shouldBeElement
 * @param {Array|string=} opt_message The assertion message
 * @return {!Element} The value of shouldBeTrueish.
 * @throws {Error} when shouldBeElement is not an Element
 * @closurePrimitive {asserts.matchesReturn}
 */
export function baseAssertElement(assertFn, shouldBeElement, opt_message) {
  return baseAssertType_(
    assertFn,
    shouldBeElement,
    shouldBeElement?.nodeType == 1,
    'Element expected',
    opt_message
  );
}

/**
 * Throws an error if the first argument isn't a string. The string can
 * be empty.
 *
 * For more details see `assert`.
 *
 * @param {!AssertionFunction} assertFn
 * @param {*} shouldBeString
 * @param {Array|string=} opt_message The assertion message
 * @return {string} The string value. Can be an empty string.
 * @throws {Error} when shouldBeString is not an String
 * @closurePrimitive {asserts.matchesReturn}
 */
export function baseAssertString(assertFn, shouldBeString, opt_message) {
  return baseAssertType_(
    assertFn,
    shouldBeString,
    typeof shouldBeString == 'string',
    'String expected',
    opt_message
  );
}

/**
 * Throws an error if the first argument isn't a number. The allowed values
 * include `0` and `NaN`.
 *
 * For more details see `assert`.
 *
 * @param {!AssertionFunction} assertFn
 * @param {*} shouldBeNumber
 * @param {Array|string=} opt_message The assertion message
 * @return {number} The number value. The allowed values include `0`
 *   and `NaN`.
 * @throws {Error} when shouldBeNumber is not an Number
 * @closurePrimitive {asserts.matchesReturn}
 */
export function baseAssertNumber(assertFn, shouldBeNumber, opt_message) {
  return baseAssertType_(
    assertFn,
    shouldBeNumber,
    typeof shouldBeNumber == 'number',
    'Number expected',
    opt_message
  );
}

/**
 * Throws an error if the first argument is not an array.
 * The array can be empty.
 *
 * For more details see `assert`.
 *
 * @param {!AssertionFunction} assertFn
 * @param {*} shouldBeArray
 * @param {Array|string=} opt_message The assertion message
 * @return {!Array} The array value
 * @throws {Error} when shouldBeArray is not an Array
 * @closurePrimitive {asserts.matchesReturn}
 */
export function baseAssertArray(assertFn, shouldBeArray, opt_message) {
  return baseAssertType_(
    assertFn,
    shouldBeArray,
    isArray(shouldBeArray),
    'Array expected',
    opt_message
  );
}

/**
 * Throws an error if the first argument isn't a boolean.
 *
 * For more details see `assert`.
 *
 * @param {!AssertionFunction} assertFn
 * @param {*} shouldBeBoolean
 * @param {Array|string=} opt_message The assertion message
 * @return {boolean} The boolean value.
 * @throws {Error} when shouldBeBoolean is not an Boolean
 * @closurePrimitive {asserts.matchesReturn}
 */
export function baseAssertBoolean(assertFn, shouldBeBoolean, opt_message) {
  return baseAssertType_(
    assertFn,
    shouldBeBoolean,
    !!shouldBeBoolean === shouldBeBoolean,
    'Boolean expected',
    opt_message
  );
}

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
 * @throws {UserError} when shouldBeTruthy is not truthy.
 * @closurePrimitive {asserts.truthy}
 */
export function pureUserAssert(
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
  return baseAssert(
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
 * @throws {Error} when shouldBeTruthy is not truthy.
 * @closurePrimitive {asserts.truthy}
 */
export function pureDevAssert(
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

  return baseAssert(
    null,
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

export const userAsserts = {
  assert: pureUserAssert,
  assertElement: baseAssertElement.bind(null, pureUserAssert),
  assertString: baseAssertString.bind(null, pureUserAssert),
  assertNumber: baseAssertNumber.bind(null, pureUserAssert),
  assertArray: baseAssertArray.bind(null, pureUserAssert),
  assertBoolean: baseAssertBoolean.bind(null, pureUserAssert),
};
export const devAsserts = {
  assert: pureUserAssert,
  assertElement: baseAssertElement.bind(null, pureUserAssert),
  assertString: baseAssertString.bind(null, pureUserAssert),
  assertNumber: baseAssertNumber.bind(null, pureUserAssert),
  assertArray: baseAssertArray.bind(null, pureUserAssert),
  assertBoolean: baseAssertBoolean.bind(null, pureUserAssert),
};
