/**
 * @license
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
 * limitations under the license.
 */

// The routines in this files are very simple equivalents to the
// routines in validator-full.js. They preserve whether or not a document
// will validate, but they won't produce error messages etc.
// Testing is done via validator-light_test.js.

goog.provide('amp.validator.maxSpecificity');

/**
 * A helper function which allows us to compare two candidate results
 * in validateTag to report the results which have the most specific errors.
 * @param {!amp.validator.ValidationResult} validationResult
 * @return {number} maximum value of specificity found in all errors.
 */
amp.validator.maxSpecificity = function(validationResult) {
  return 0;
};
