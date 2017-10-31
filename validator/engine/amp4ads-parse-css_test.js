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
goog.provide('parse_css.Amp4AdsParseCssTest');

goog.require('json_testutil.makeJsonKeyCmpFn');
goog.require('json_testutil.renderJSON');
goog.require('parse_css.BlockType');
goog.require('parse_css.parseAStylesheet');
goog.require('parse_css.stripVendorPrefix');
goog.require('parse_css.tokenize');
goog.require('parse_css.validateAmp4AdsCss');

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
const amp4AdsCssParsingSpec = {
  'font-face': parse_css.BlockType.PARSE_AS_DECLARATIONS,
  'media': parse_css.BlockType.PARSE_AS_RULES,
  'keyframes': parse_css.BlockType.PARSE_AS_RULES,
  '-webkit-keyframes': parse_css.BlockType.PARSE_AS_RULES,
  '-moz-keyframes': parse_css.BlockType.PARSE_AS_RULES,
  '-o-keyframes': parse_css.BlockType.PARSE_AS_RULES,
  '-ms-keyframes': parse_css.BlockType.PARSE_AS_RULES,
};

describe('validateAmp4AdsCss', () => {
  it('validates good amp-animate example', () => {
    const css = '.amp-animate .box { ' +
        '  transform: rotate(180deg); transition: transform 2s; ' +
        '}';
    const errors = [];
    const tokens = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokens, amp4AdsCssParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertJSONEquals([], errors);
    parse_css.validateAmp4AdsCss(sheet, errors);
    assertJSONEquals([], errors);
  });

  it('validates good amp-animate example with vendor prefixes', () => {
    const css = '.amp-animate .box { ' +
        '  -moz-transform: rotate(180deg); ' +
        '  -webkit-transition: -o-transform 2s; ' +
        '}';
    const errors = [];
    const tokens = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokens, amp4AdsCssParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertJSONEquals([], errors);
    parse_css.validateAmp4AdsCss(sheet, errors);
    assertJSONEquals([], errors);
  });

  it('reports that position fixed and position sticky are disallowed', () => {
    const css = '.box { position: fixed; position:sticky; }';
    const errors = [];
    const tokens = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokens, amp4AdsCssParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertJSONEquals([], errors);
    parse_css.validateAmp4AdsCss(sheet, errors);
    assertJSONEquals(
        [
          {
            'line': 1,
            'col': 7,
            'tokenType': 'ERROR',
            'code': 'CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE',
            'params': ['style', 'position', 'fixed']
          },
          {
            'line': 1,
            'col': 24,
            'tokenType': 'ERROR',
            'code': 'CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE',
            'params': ['style', 'position', 'sticky']
          }
        ],
        errors);
  });

  it('reports non-animation properties in animation selectors', () => {
    // The non-animation property (in this case color) is not allowed in an
    // animation selector.
    const css = '.amp-animate .box { ' +
        '    color: red; ' +
        '    transform: rotate(180deg);' +
        '    transition: transform 2s;' +
        '}';
    const errors = [];
    const tokens = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokens, amp4AdsCssParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertJSONEquals([], errors);
    parse_css.validateAmp4AdsCss(sheet, errors);
    assertJSONEquals(
        [{
          'line': 1,
          'col': 24,
          'tokenType': 'ERROR',
          'params': [
            'style', 'color', 'transition',
            '[\'animation\', \'opacity\', \'transform\', \'transition\', ' +
                '\'visibility\']'
          ],
          'code': 'CSS_SYNTAX_PROPERTY_DISALLOWED_TOGETHER_WITH'
        }],
        errors);
  });

  it('reports non-animation properties in animation selectors (vendor prefixed)',
     () => {
       // The non-animation property (in this case color) is not allowed in an
       // animation selector.
       const css = '.amp-animate .box { ' +
           '    color: red; ' +
           '    -o-transform: rotate(180deg);' +
           '    -ms-transition: -webkit-transform 2s;' +
           '}';
       const errors = [];
       const tokens = parse_css.tokenize(css, 1, 0, errors);
       const sheet = parse_css.parseAStylesheet(
           tokens, amp4AdsCssParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
           errors);
       assertJSONEquals([], errors);
       parse_css.validateAmp4AdsCss(sheet, errors);
       assertJSONEquals(
           [{
             'line': 1,
             'col': 24,
             'tokenType': 'ERROR',
             'params': [
               'style', 'color', '-ms-transition',
               '[\'animation\', \'opacity\', \'transform\', \'transition\', ' +
                   '\'visibility\']'
             ],
             'code': 'CSS_SYNTAX_PROPERTY_DISALLOWED_TOGETHER_WITH'
           }],
           errors);
     });

  it('reports when .amp-animate is missing', () => {
    const css = '.box { ' +
        '    transform: rotate(180deg); ' +
        '    transition: transform 2s; ' +
        '}';
    const errors = [];
    const tokens = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokens, amp4AdsCssParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertJSONEquals([], errors);
    parse_css.validateAmp4AdsCss(sheet, errors);
    assertJSONEquals(
        [{
          'line': 1,
          'col': 0,
          'tokenType': 'ERROR',
          'code': 'CSS_SYNTAX_PROPERTY_REQUIRES_QUALIFICATION',
          'params': ['style', 'transition', '.amp-animate']
        }],
        errors);
  });

  it('allows only opacity and transform to be transitioned', () => {
       const css = '.amp-animate .box { ' +
           '    transition: background-color 2s; ' +
           '}';
       const errors = [];
       const tokens = parse_css.tokenize(css, 1, 0, errors);
       const sheet = parse_css.parseAStylesheet(
           tokens, amp4AdsCssParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
           errors);
       assertJSONEquals([], errors);
       parse_css.validateAmp4AdsCss(sheet, errors);
       assertJSONEquals(
           [{
             'line': 1,
             'col': 24,
             'tokenType': 'ERROR',
             'code': 'CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE_WITH_HINT',
             'params': [
               'style', 'transition', 'background-color',
               '[\'opacity\', \'transform\']'
             ]
           }],
           errors);
     });

  it('allows keyframes as a mechanism for transitions', () => {
    const css = '@keyframes turn { ' +
        '  from { transform: rotate(180deg); } ' +
        '  to { transform: rotate(90deg); } ' +
        '}';
    const errors = [];
    const tokens = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokens, amp4AdsCssParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertJSONEquals([], errors);
    parse_css.validateAmp4AdsCss(sheet, errors);
    assertJSONEquals([], errors);
  });

  it('allows keyframes as a mechanism for transitions (vendor prefixed)',
     () => {
       const css = '@-moz-keyframes turn { ' +
           '  from { -webkit-transform: rotate(180deg); } ' +
           '  to { -o-transform: rotate(90deg); } ' +
           '}';
       const errors = [];
       const tokens = parse_css.tokenize(css, 1, 0, errors);
       const sheet = parse_css.parseAStylesheet(
           tokens, amp4AdsCssParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
           errors);
       assertJSONEquals([], errors);
       parse_css.validateAmp4AdsCss(sheet, errors);
       assertJSONEquals([], errors);
     });

  it('allows animation-timing-function within keyframes',
     () => {
       const css = '@-moz-keyframes turn { ' +
           '  from { transform: rotate(180deg); ' +
           '         animation-timing-function: linear; } ' +
           '  to { transform: rotate(90deg); } ' +
           '}';
       const errors = [];
       const tokens = parse_css.tokenize(css, 1, 0, errors);
       const sheet = parse_css.parseAStylesheet(
           tokens, amp4AdsCssParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
           errors);
       assertJSONEquals([], errors);
       parse_css.validateAmp4AdsCss(sheet, errors);
       assertJSONEquals([], errors);
     });

  it('allows only animation-timing-function, opacity, ' +
     'transform in keyframe transitions',
     () => {
       const css = '@keyframes slidein { ' +
           '  from { margin-left:100%; width:300%; } ' +
           '  to { margin-left:0%; width:100%; } ' +
           '}';
       const errors = [];
       const tokens = parse_css.tokenize(css, 1, 0, errors);
       const sheet = parse_css.parseAStylesheet(
           tokens, amp4AdsCssParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
           errors);
       assertJSONEquals([], errors);
       parse_css.validateAmp4AdsCss(sheet, errors);
       assertJSONEquals(
           [
             {
               'line': 1,
               'col': 30,
               'tokenType': 'ERROR',
               'code': 'CSS_SYNTAX_PROPERTY_DISALLOWED_WITHIN_AT_RULE',
               'params': [
                 'style', 'margin-left', 'keyframes',
                 '[\'animation-timing-function\', \'opacity\', \'transform\']'
               ]
             },
             {
               'line': 1,
               'col': 48,
               'tokenType': 'ERROR',
               'code': 'CSS_SYNTAX_PROPERTY_DISALLOWED_WITHIN_AT_RULE',
               'params': [
                 'style', 'width', 'keyframes',
                 '[\'animation-timing-function\', \'opacity\', \'transform\']'
               ]
             },
             {
               'line': 1,
               'col': 69,
               'tokenType': 'ERROR',
               'code': 'CSS_SYNTAX_PROPERTY_DISALLOWED_WITHIN_AT_RULE',
               'params': [
                 'style', 'margin-left', 'keyframes',
                 '[\'animation-timing-function\', \'opacity\', \'transform\']'
               ]
             },
             {
               'line': 1,
               'col': 85,
               'tokenType': 'ERROR',
               'code': 'CSS_SYNTAX_PROPERTY_DISALLOWED_WITHIN_AT_RULE',
               'params': [
                 'style', 'width', 'keyframes',
                 '[\'animation-timing-function\', \'opacity\', \'transform\']'
               ]
             }
           ],
           errors);
     });

  it('allows only opacity, transform in keyframe transitions (vendor prefixed)',
     () => {
       const css = '@-moz-keyframes slidein { ' +
           '  from { margin-left:100%; width:300%; } ' +
           '  to { margin-left:0%; width:100%; } ' +
           '}';
       const errors = [];
       const tokens = parse_css.tokenize(css, 1, 0, errors);
       const sheet = parse_css.parseAStylesheet(
           tokens, amp4AdsCssParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
           errors);
       assertJSONEquals([], errors);
       parse_css.validateAmp4AdsCss(sheet, errors);
       assertJSONEquals(
           [
             {
               'line': 1,
               'col': 35,
               'tokenType': 'ERROR',
               'code': 'CSS_SYNTAX_PROPERTY_DISALLOWED_WITHIN_AT_RULE',
               'params': [
                 'style', 'margin-left', '-moz-keyframes',
                 '[\'animation-timing-function\', \'opacity\', \'transform\']'
               ]
             },
             {
               'line': 1,
               'col': 53,
               'tokenType': 'ERROR',
               'code': 'CSS_SYNTAX_PROPERTY_DISALLOWED_WITHIN_AT_RULE',
               'params': [
                 'style', 'width', '-moz-keyframes',
                 '[\'animation-timing-function\', \'opacity\', \'transform\']'
               ]
             },
             {
               'line': 1,
               'col': 74,
               'tokenType': 'ERROR',
               'code': 'CSS_SYNTAX_PROPERTY_DISALLOWED_WITHIN_AT_RULE',
               'params': [
                 'style', 'margin-left', '-moz-keyframes',
                 '[\'animation-timing-function\', \'opacity\', \'transform\']'
               ]
             },
             {
               'line': 1,
               'col': 90,
               'tokenType': 'ERROR',
               'code': 'CSS_SYNTAX_PROPERTY_DISALLOWED_WITHIN_AT_RULE',
               'params': [
                 'style', 'width', '-moz-keyframes',
                 '[\'animation-timing-function\', \'opacity\', \'transform\']'
               ]
             }
           ],
           errors);
     });
});
