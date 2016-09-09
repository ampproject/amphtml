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
goog.provide('parse_css.A4aParseCssTest');

goog.require('json_testutil.makeJsonKeyCmpFn');
goog.require('json_testutil.renderJSON');
goog.require('parse_css.BlockType');
goog.require('parse_css.parseAStylesheet');
goog.require('parse_css.stripVendorPrefix');
goog.require('parse_css.tokenize');
goog.require('parse_css.validateA4aCss');

/**
 * A strict comparison between two values that does not truncate the
 * error messages and works well with the closure compiler.
 * @param {*} expected
 * @param {*} saw
 */
function assertStrictEqual(expected, saw) {
  assert.ok(expected === saw, 'expected: ' + expected + ' saw: ' + saw);
}

describe('stripVendorPrefix', () => {
  it('removes typical vendor prefixes', () => {
    assertStrictEqual('foo', parse_css.stripVendorPrefix('-moz-foo'));
    assertStrictEqual('foo', parse_css.stripVendorPrefix('foo'));
    assertStrictEqual('foo-foo', parse_css.stripVendorPrefix('foo-foo'));
    assertStrictEqual('foo-foo', parse_css.stripVendorPrefix('-d-foo-foo'));
    assertStrictEqual('-foo', parse_css.stripVendorPrefix('-foo'));
  });
});

/**
 * For emitting json output with keys in logical order for the CSS parser's AST.
 * @param {string} a
 * @param {string} b
 * @return {number}
 */
const jsonKeyCmp = json_testutil.makeJsonKeyCmpFn([
  'line', 'col', 'tokenType', 'name', 'prelude', 'declarations', 'rules',
  'errorType', 'msg', 'type', 'value', 'repr', 'unit', 'eof'
]);

/**
 * @param {!Object} left
 * @param {!Object} right
 */
function assertJSONEquals(left, right) {
  assertStrictEqual(
      json_testutil.renderJSON(left, jsonKeyCmp, /*offset=*/4),
      json_testutil.renderJSON(right, jsonKeyCmp, /*offset=*/4));
}

/** @type {!Object<string,parse_css.BlockType>} */
const a4aCssParsingSpec = {
  'font-face': parse_css.BlockType.PARSE_AS_DECLARATIONS,
  'media': parse_css.BlockType.PARSE_AS_RULES,
  'keyframes': parse_css.BlockType.PARSE_AS_RULES,
  '-webkit-keyframes': parse_css.BlockType.PARSE_AS_RULES,
  '-moz-keyframes': parse_css.BlockType.PARSE_AS_RULES,
  '-o-keyframes': parse_css.BlockType.PARSE_AS_RULES,
  '-ms-keyframes': parse_css.BlockType.PARSE_AS_RULES,
};

describe('validateA4aCss', () => {
  it('validates good amp-animate example', () => {
    const css = '.amp-animate .box { ' +
        '  transform: rotate(180deg); transition: transform 2s; ' +
        '}';
    const errors = [];
    const tokens = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokens, a4aCssParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE, errors);
    assertStrictEqual(0, errors.length);
    parse_css.validateA4aCss(sheet, errors);
    assertStrictEqual(0, errors.length);
  });
});
