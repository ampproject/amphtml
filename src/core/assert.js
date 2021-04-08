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
import {isMinifiedMode} from './minified-mode';

/**
 * Throws an error if the second argument isn't trueish.
 *
 * Supports argument substitution into the message via %s placeholders.
 *
 * Throws an error object that has two extra properties:
 * - associatedElement: This is the first element provided in the var args.
 *   It can be used for improved display of error messages.
 * - messageArray: The elements of the substituted message as non-stringified
 *   elements in an array. When e.g. passed to console.error this yields
 *   native displays of things like HTML elements.
 * @param {string} sentinel
 * @param {T} shouldBeTruthy
 * @param {string} opt_message
 * @param {...*} var_args Arguments substituted into %s in the message
 * @return {T}
 * @throws {Error} when shouldBeTruthy is not truthy.
 */
function assertion(
  sentinel,
  shouldBeTruthy,
  opt_message = 'Assertion failed',
  var_args
) {
  if (shouldBeTruthy) {
    return shouldBeTruthy;
  }

  // Include the sentinel string if provided and not already present
  if (sentinel && !opt_message.includes(sentinel)) {
    opt_message += sentinel;
  }

  // Skip the first 3 arguments to isolate format params
  // const messageArgs = Array.prototype.slice.call(arguments, 3);
  // Index at which message args start
  let i = 3;
  let firstElement;

  // Substitute provided values into format string in message
  const splitMessage = opt_message.split('%s');
  let message = splitMessage.shift();
  const messageArray = [message];

  while (splitMessage.length) {
    const subValue = arguments[i++];
    const nextConstant = splitMessage.shift();

    // If an element is provided, add it to the error object
    if (!firstElement && subValue?.tagName) {
      // Here we want the actual element
      firstElement = subValue;
    }

    message += elementStringOrPassThru(subValue) + nextConstant;
    messageArray.push(subValue, nextConstant.trim());
  }

  const error = new Error(message);
  error.messageArray = messageArray.filter((x) => x !== '');
  error.associatedElement = firstElement;
  throw error;
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
  return assertion(
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

  return assertion(
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
