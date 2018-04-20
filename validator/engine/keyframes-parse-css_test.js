/**
 * @license DEDUPE_ON_MINIFY
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
goog.provide('parse_css.KeyframesParseCssTest');

goog.require('json_testutil.makeJsonKeyCmpFn');
goog.require('json_testutil.renderJSON');
goog.require('parse_css.BlockType');
goog.require('parse_css.parseAStylesheet');
goog.require('parse_css.tokenize');
goog.require('parse_css.validateKeyframesCss');


/**
 * A strict comparison between two values that does not truncate the
 * error messages and works well with the closure compiler.
 * @param {*} expected
 * @param {*} saw
 */
function assertStrictEqual(expected, saw) {
  assert.ok(expected === saw, 'expected: ' + expected + ' saw: ' + saw);
}

/**
 * For emitting json output with keys in logical order for ErrorToken.
 * @param {string} a
 * @param {string} b
 * @return {number}
 */
const jsonKeyCmp = json_testutil.makeJsonKeyCmpFn(
    ['line', 'col', 'tokenType', 'code', 'params']);

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
const keyframesCssParsingSpec = {
  'keyframes': parse_css.BlockType.PARSE_AS_RULES,
  'media': parse_css.BlockType.PARSE_AS_RULES,
  'supports': parse_css.BlockType.PARSE_AS_RULES,
  '-moz-keyframes': parse_css.BlockType.PARSE_AS_RULES,
  '-o-keyframes': parse_css.BlockType.PARSE_AS_RULES,
  '-webkit-keyframes': parse_css.BlockType.PARSE_AS_RULES,
};

describe('validateKeyframesCss', () => {

  it('validates good keyframes example', () => {
    const css = '@keyframes anim1 {' +
        '0% {transform: translateX(-100%);}' +
        '100% {transform: translateX(100%);}' +
        '}' +
        '@-webkit-keyframes anim1 {' +
        '0% {transform: translateX(-100%);}' +
        '100% {transform: translateX(100%);}' +
        '}' +
        '@media (min-width: 300px) {' +
        '@keyframes anim1 {' +
        '0% {transform: translateX(-100%);}' +
        '100% {transform: translateX(100%);}' +
        '}' +
        '}' +
        '@supports (offset-distance: 0) {' +
        '@keyframes anim1 {' +
        '0% {offset-distance: 0}' +
        '100% {offset-distance: 100%}' +
        '}' +
        '}' +
        '@media (min-width: 300px) {' +
        '@supports (offset-distance: 0) {' +
        '@keyframes anim1 {' +
        '0% {offset-distance: 0}' +
        '100% {offset-distance: 100%}' +
        '}' +
        '}' +
        '}' +
        '@supports (offset-distance: 0) {' +
        '@media (min-width: 300px) {' +
        '@keyframes anim1 {' +
        '0% {transform: translateX(-100%);}' +
        '100% {transform: translateX(100%);}' +
        '}' +
        '}' +
        '}';
    const errors = [];
    const tokens = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokens, keyframesCssParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertJSONEquals([], errors);
    parse_css.validateKeyframesCss(sheet, errors);
    assertJSONEquals([], errors);
  });

  it('validates good allowed "@" rules', () => {
    const css = '@keyframes anim1 {}' +
        '@-webkit-keyframes anim1 {}' +
        '@media (min-width: 300px) {}' +
        '@supports (offset-distance: 0) {}' +
        '@media (min-width: 300px) {}' +
        '@supports (offset-distance: 0) {}';
    const errors = [];
    const tokens = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokens, keyframesCssParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertJSONEquals([], errors);
    parse_css.validateKeyframesCss(sheet, errors);
    assertJSONEquals([], errors);
  });

  it('validates bad not "@" rule', () => {
    const css = 'amp-img {}';
    const errors = [];
    const tokens = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokens, keyframesCssParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertJSONEquals([], errors);
    parse_css.validateKeyframesCss(sheet, errors);
    assertJSONEquals(
        [{
          'line': 1,
          'col': 0,
          'tokenType': 'ERROR',
          'code':
              'CSS_SYNTAX_DISALLOWED_QUALIFIED_RULE_MUST_BE_INSIDE_KEYFRAME',
          'params': ['style', 'amp-img']
        }],
        errors);
  });

  it('validates bad non keyframe with declarations', () => {
    const css = '@media (min-width: 300px) {' +
        '100% {offset-distance: 100%}' +
        '}';
    const errors = [];
    const tokens = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokens, keyframesCssParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertJSONEquals([], errors);
    parse_css.validateKeyframesCss(sheet, errors);
    assertJSONEquals(
        [{
          'line': 1,
          'col': 27,
          'tokenType': 'ERROR',
          'code':
              'CSS_SYNTAX_DISALLOWED_QUALIFIED_RULE_MUST_BE_INSIDE_KEYFRAME',
          'params': ['style', '100']
        }],
        errors);
  });

  it('validates correct prelude concatenation', () => {
    const css = 'a.underlined {}';
    const errors = [];
    const tokens = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokens, keyframesCssParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertJSONEquals([], errors);
    parse_css.validateKeyframesCss(sheet, errors);
    assertJSONEquals(
        [{
          'line': 1,
          'col': 0,
          'tokenType': 'ERROR',
          'code':
              'CSS_SYNTAX_DISALLOWED_QUALIFIED_RULE_MUST_BE_INSIDE_KEYFRAME',
          'params': ['style', 'a.underlined']
        }],
        errors);
  });

  it('validates bad qualified rule, not inside "@" rule', () => {
    const css = 'a { color: red }';
    const errors = [];
    const tokens = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokens, keyframesCssParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertJSONEquals([], errors);
    parse_css.validateKeyframesCss(sheet, errors);
    assertJSONEquals(
        [{
          'line': 1,
          'col': 0,
          'tokenType': 'ERROR',
          'code':
              'CSS_SYNTAX_DISALLOWED_QUALIFIED_RULE_MUST_BE_INSIDE_KEYFRAME',
          'params': ['style', 'a']
        }],
        errors);
  });

  it('validates bad qualified rule, keyframe inside keyframe', () => {
    const css = '@keyframes anim2 {' +
        '@keyframes anim1 {' +
        '100% {visibility: visible}' +
        '}' +
        '}';
    const errors = [];
    const tokens = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokens, keyframesCssParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertJSONEquals([], errors);
    parse_css.validateKeyframesCss(sheet, errors);
    assertJSONEquals(
        [{
          'line': 1,
          'col': 18,
          'tokenType': 'ERROR',
          'code': 'CSS_SYNTAX_DISALLOWED_KEYFRAME_INSIDE_KEYFRAME',
          'params': ['style']
        }],
        errors);
  });
});
