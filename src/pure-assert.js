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

/** @fileoverview Dependency-free assertion helpers for use in Preact. */

/**
 * Triple zero width space.
 *
 * This is added to user error messages, so that we can later identify
 * them, when the only thing that we have is the message. This is the
 * case in many browsers when the global exception handler is invoked.
 *
 * @const {string}
 */
export const USER_ERROR_SENTINEL = '\u200B\u200B\u200B';

/**
 * User error class for use in Preact. Use of sentinel string instead of a
 * boolean to check user errors because errors could be rethrown by some native
 * code as a new error, and only a message would survive. Mirrors errors
 * produced by `user().error()` in src/log.js.
 * @final
 * @public
 */
export class UserError extends Error {
  /**
   * Builds the error, adding the user sentinel if not present.
   * @param {string} message
   */
  constructor(message) {
    if (!message) {
      message = USER_ERROR_SENTINEL;
    } else if (message.indexOf(USER_ERROR_SENTINEL) == -1) {
      message += USER_ERROR_SENTINEL;
    }

    super(message);
  }
}

/**
 * Throws a provided error if the second argument isn't trueish.
 * @param {Object} errorCls
 * @param {T} shouldBeTruthy
 * @param {string} message
 * @return {T}
 * @throws {Error} when attribute values are missing or invalid.
 */
function pureAssertion(errorCls, shouldBeTruthy, message) {
  // TODO: Support format strings.
  if (!shouldBeTruthy) {
    throw new errorCls(message);
  }
  return shouldBeTruthy;
}

/**
 * Throws a user error if the first argument isn't trueish. Mirrors userAssert
 * in src/log.js.
 * @param {T} shouldBeTruthy
 * @param {string} message
 * @return {T}
 * @throws {UserError} when attribute values are missing or invalid.
 * @closurePrimitive {asserts.truthy}
 */
export function pureUserAssert(shouldBeTruthy, message) {
  return pureAssertion(UserError, shouldBeTruthy, message);
}

/**
 * Throws an error if the first argument isn't trueish. Mirrors devAssert in
 * src/log.js.
 * @param {T} shouldBeTruthy
 * @param {string} message
 * @return {T}
 * @throws {Error} when attribute values are missing or invalid.
 * @closurePrimitive {asserts.truthy}
 */
export function pureDevAssert(shouldBeTruthy, message) {
  return pureAssertion(Error, shouldBeTruthy, message);
}
