/**
 * @license
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
 *
 * Credits:
 *   This original version of this file was derived from
 *   https://github.com/tabatkins/parse-css by Tab Atkins,
 *   licensed under the CC0 license
 *   (http://creativecommons.org/publicdomain/zero/1.0/).
 */

goog.provide('parse_css.stripVendorPrefix');
goog.provide('parse_css.validateA4aCss');

goog.require('parse_css.ErrorToken');
goog.require('parse_css.Stylesheet');

/**
 * Strips vendor prefixes from identifiers, e.g. property names or names
 * of at rules. E.g., "-moz-keyframes" -> "keyframes".
 * TODO(powdercloud): Revisit which vendor prefixes to cover.
 * @param {string} identifier
 * @return {string}
 */
parse_css.stripVendorPrefix = function(identifier) {
  return identifier.replace(/^-[a-z]+-/, '');
};

/**
 * @param {!parse_css.Stylesheet} styleSheet
 * @param {!Array<!parse_css.ErrorToken>} errors
 */
parse_css.validateA4aCss = function(styleSheet, errors) {
  // TODO(powdercloud): Implement this.
};
