/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
 * Exports the substitution variables for access services.
 *
 * @interface
 */
export class AccessVars {
  /**
   * Returns the promise that will yield the access READER_ID.
   *
   * This is a restricted API.
   *
   * @return {?Promise<string>}
   */
  getAccessReaderId() {}

  /**
   * Returns the promise that will yield the value of the specified field from
   * the authorization response. This method will wait for the most recent
   * authorization request to complete. It will return null values for failed
   * requests with no fallback, but could be modified to block indefinitely.
   *
   * This is a restricted API.
   *
   * @param {string} unusedField
   * @return {?Promise<*|null>}
   */
  getAuthdataField(unusedField) {}
}
