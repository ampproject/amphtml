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
 * Triple zero width space.
 *
 * This is added to user error messages, so that we can later identify
 * them, when the only thing that we have is the message. This is the
 * case in many browsers when the global exception handler is invoked.
 *
 * @const {string}
 */
const USER_ERROR_SENTINEL = '\u200B\u200B\u200B';

/**
 * User error class for use in Preact. Use of sentinel string instead of a
 * boolean to check user errors because errors could be rethrown by some native
 * code as a new error, and only a message would survive. Mirrors errors
 * produced by `user().error()` in src/log.js.
 * @final
 * @public
 */
export class UserError extends Error {
  /** Builds the error, adding the user sentinel if not present. */
  constructor() {
    super(arguments);

    if (!this.message) {
      this.message = USER_ERROR_SENTINEL;
    } else if (this.message.indexOf(USER_ERROR_SENTINEL) == -1) {
      this.message += USER_ERROR_SENTINEL;
    }
  }
}
