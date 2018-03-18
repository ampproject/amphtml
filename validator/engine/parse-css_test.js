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
goog.provide('parse_css.ParseCssTest');

goog.require('goog.asserts');
goog.require('json_testutil.makeJsonKeyCmpFn');
goog.require('json_testutil.renderJSON');
goog.require('parse_css.BlockType');
goog.require('parse_css.QualifiedRule');
goog.require('parse_css.RuleVisitor');
goog.require('parse_css.Selector');
goog.require('parse_css.SelectorVisitor');
goog.require('parse_css.TokenStream');
goog.require('parse_css.extractUrls');
goog.require('parse_css.parseAClassSelector');
goog.require('parse_css.parseASelector');
goog.require('parse_css.parseASelectorsGroup');
goog.require('parse_css.parseASimpleSelectorSequence');
goog.require('parse_css.parseAStylesheet');
goog.require('parse_css.parseATypeSelector');
goog.require('parse_css.parseAnIdSelector');
goog.require('parse_css.parseMediaQueries');
goog.require('parse_css.stripVendorPrefix');
goog.require('parse_css.tokenize');
goog.require('parse_css.traverseSelectors');

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
    assertStrictEqual('foo', parse_css.stripVendorPrefix('-ms-foo'));
    assertStrictEqual('foo', parse_css.stripVendorPrefix('-o-foo'));
    assertStrictEqual('foo', parse_css.stripVendorPrefix('-webkit-foo'));
    assertStrictEqual('foo', parse_css.stripVendorPrefix('foo'));
    assertStrictEqual('foo-foo', parse_css.stripVendorPrefix('foo-foo'));
    assertStrictEqual('-d-foo-foo', parse_css.stripVendorPrefix('-d-foo-foo'));
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
const ampAtRuleParsingSpec = {
  'font-face': parse_css.BlockType.PARSE_AS_DECLARATIONS,
  'media': parse_css.BlockType.PARSE_AS_RULES
};

describe('tokenize', () => {
  it('generates tokens for simple example', () => {
    const css = 'foo { bar: baz; }';
    const errors = [];
    const tokenlist = parse_css.tokenize(css, 1, 0, errors);
    assertJSONEquals(
        [
          {'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'foo'},
          {'line': 1, 'col': 3, 'tokenType': 'WHITESPACE'},
          {'line': 1, 'col': 4, 'tokenType': 'OPEN_CURLY'},
          {'line': 1, 'col': 5, 'tokenType': 'WHITESPACE'},
          {'line': 1, 'col': 6, 'tokenType': 'IDENT', 'value': 'bar'},
          {'line': 1, 'col': 9, 'tokenType': 'COLON'},
          {'line': 1, 'col': 10, 'tokenType': 'WHITESPACE'},
          {'line': 1, 'col': 11, 'tokenType': 'IDENT', 'value': 'baz'},
          {'line': 1, 'col': 14, 'tokenType': 'SEMICOLON'},
          {'line': 1, 'col': 15, 'tokenType': 'WHITESPACE'},
          {'line': 1, 'col': 16, 'tokenType': 'CLOSE_CURLY'},
          {'line': 1, 'col': 17, 'tokenType': 'EOF_TOKEN'}
        ],
        tokenlist);
    assertStrictEqual(0, errors.length);
  });

  it('tokenizes with parse errors', () => {
    const css = ' "\n "';
    const errors = [];
    const tokenlist = parse_css.tokenize(css, 1, 0, errors);
    assertJSONEquals(
        [
          {'line': 1, 'col': 0, 'tokenType': 'WHITESPACE'},
          {'line': 1, 'col': 2, 'tokenType': 'WHITESPACE'},
          {'line': 2, 'col': 1, 'tokenType': 'STRING', 'value': ''},
          {'line': 2, 'col': 2, 'tokenType': 'EOF_TOKEN'}
        ],
        tokenlist);
    assertJSONEquals(
        [{
          'line': 1,
          'col': 1,
          'tokenType': 'ERROR',
          'code': 'CSS_SYNTAX_UNTERMINATED_STRING',
          'params': ['style']
        }],
        errors);
  });

  it('provides errors with line col offsets', () => {
    const css = 'line 1 "unterminated\n' +
        'line 2 "unterminated\n';
    let errors = [];
    parse_css.tokenize(css, 1, 0, errors);
    assertJSONEquals(
        [
          {
            'line': 1,
            'col': 7,
            'tokenType': 'ERROR',
            'code': 'CSS_SYNTAX_UNTERMINATED_STRING',
            'params': ['style']
          },
          {
            'line': 2,
            'col': 7,
            'tokenType': 'ERROR',
            'code': 'CSS_SYNTAX_UNTERMINATED_STRING',
            'params': ['style']
          }
        ],
        errors);
    errors = [];
    parse_css.tokenize(css, 5, 5, errors);
    assertJSONEquals(
        [
          {
            'line': 5,
            'col': 12,
            'tokenType': 'ERROR',
            'code': 'CSS_SYNTAX_UNTERMINATED_STRING',
            'params': ['style']
          },
          {
            'line': 6,
            'col': 7,
            'tokenType': 'ERROR',
            'code': 'CSS_SYNTAX_UNTERMINATED_STRING',
            'params': ['style']
          }
        ],
        errors);
  });

  it('deals w/ stray backslashes, unterminated comments and bad urls', () => {
    // Note that Javascript has its own escaping, so there's really just one
    // '\'.
    let errors = [];
    parse_css.tokenize('a trailing \\\nbackslash', 1, 0, errors);
    assertJSONEquals(
        [{
          'line': 1,
          'col': 11,
          'tokenType': 'ERROR',
          'code': 'CSS_SYNTAX_STRAY_TRAILING_BACKSLASH',
          'params': ['style']
        }],
        errors);

    errors = [];
    parse_css.tokenize('h1 {color: red; } /*', 1, 0, errors);
    assertJSONEquals(
        [{
          'line': 1,
          'col': 17,
          'tokenType': 'ERROR',
          'code': 'CSS_SYNTAX_UNTERMINATED_COMMENT',
          'params': ['style']
        }],
        errors);

    errors = [];
    parse_css.tokenize('oh hi url(foo"bar)', 1, 0, errors);
    assertJSONEquals(
        [{
          'line': 1,
          'col': 6,
          'tokenType': 'ERROR',
          'code': 'CSS_SYNTAX_BAD_URL',
          'params': ['style']
        }],
        errors);
  });
});

/**
 * @param {parse_css.Rule} rule
 * @return {string}
 */
function getPos(rule) {
  return '(' + rule.line + ',' + rule.col + ')';
}

/** @private */
class LogRulePositions extends parse_css.RuleVisitor {
  constructor() {
    super();
    /** @type {!Array<string>} */
    this.out = [];
  }

  /** @inheritDoc */
  visitStylesheet(stylesheet) {
    this.out.push('Stylesheet ', getPos(stylesheet), '\n');
  }

  /** @inheritDoc */
  leaveStylesheet(stylesheet) {
    this.out.push('Leaving Stylesheet ', getPos(stylesheet), '\n');
  }

  /** @inheritDoc */
  visitAtRule(atRule) {
    this.out.push('AtRule name=', atRule.name, ' ', getPos(atRule), '\n');
  }

  /** @inheritDoc */
  leaveAtRule(atRule) {
    this.out.push('Leaving AtRule name=', atRule.name, ' ', getPos(atRule), '\n');
  }

  /** @inheritDoc */
  visitQualifiedRule(qualifiedRule) {
    this.out.push('QualifiedRule ', getPos(qualifiedRule), '\n');
  }

  /** @inheritDoc */
  leaveQualifiedRule(qualifiedRule) {
    this.out.push('Leaving QualifiedRule ', getPos(qualifiedRule), '\n');
  }

  /** @inheritDoc */
  visitDeclaration(declaration) {
    this.out.push('Declaration ', getPos(declaration), '\n');
  }

  /** @inheritDoc */
  leaveDeclaration(declaration) {
    this.out.push('Leaving Declaration ', getPos(declaration), '\n');
  }
}

describe('parseAStylesheet', () => {
  it('parses rgb values', () => {
    const css = 'foo { bar: rgb(255, 0, 127); }';
    const errors = [];
    const tokenlist = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokenlist, ampAtRuleParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertJSONEquals(
        {
          'line': 1,
          'col': 0,
          'tokenType': 'STYLESHEET',
          'rules': [{
            'line': 1,
            'col': 0,
            'tokenType': 'QUALIFIED_RULE',
            'prelude': [
              {'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'foo'},
              {'line': 1, 'col': 3, 'tokenType': 'WHITESPACE'},
              {'line': 1, 'col': 4, 'tokenType': 'EOF_TOKEN'}
            ],
            'declarations': [{
              'line': 1,
              'col': 6,
              'tokenType': 'DECLARATION',
              'name': 'bar',
              'value': [
                {'line': 1, 'col': 10, 'tokenType': 'WHITESPACE'}, {
                  'line': 1,
                  'col': 11,
                  'tokenType': 'FUNCTION_TOKEN',
                  'value': 'rgb'
                },
                {
                  'line': 1,
                  'col': 15,
                  'tokenType': 'NUMBER',
                  'type': 'integer',
                  'value': 255,
                  'repr': '255'
                },
                {'line': 1, 'col': 18, 'tokenType': 'COMMA'},
                {'line': 1, 'col': 19, 'tokenType': 'WHITESPACE'}, {
                  'line': 1,
                  'col': 20,
                  'tokenType': 'NUMBER',
                  'type': 'integer',
                  'value': 0,
                  'repr': '0'
                },
                {'line': 1, 'col': 21, 'tokenType': 'COMMA'},
                {'line': 1, 'col': 22, 'tokenType': 'WHITESPACE'}, {
                  'line': 1,
                  'col': 23,
                  'tokenType': 'NUMBER',
                  'type': 'integer',
                  'value': 127,
                  'repr': '127'
                },
                {'line': 1, 'col': 26, 'tokenType': 'CLOSE_PAREN'},
                {'line': 1, 'col': 27, 'tokenType': 'EOF_TOKEN'}
              ],
              'important': false
            }]
          }],
          'eof': {'line': 1, 'col': 30, 'tokenType': 'EOF_TOKEN'}
        },
        sheet);
    // Some assertions about the line/cols of nodes, which we use to test the
    // visitor pattern implementation.
    const visitor = new LogRulePositions();
    sheet.accept(visitor);
    assertStrictEqual(
        'Stylesheet (1,0)\n' +
        'QualifiedRule (1,0)\n' +
        'Declaration (1,6)\n' +
        'Leaving Declaration (1,6)\n' +
        'Leaving QualifiedRule (1,0)\n' +
        'Leaving Stylesheet (1,0)\n', visitor.out.join(''));
  });

  it('parses a hash reference', () => {
    const css = '#foo {}';
    const errors = [];
    const tokenlist = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokenlist, ampAtRuleParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertJSONEquals(
        {
          'line': 1,
          'col': 0,
          'tokenType': 'STYLESHEET',
          'rules': [{
            'line': 1,
            'col': 0,
            'tokenType': 'QUALIFIED_RULE',
            'prelude': [
              {
                'line': 1,
                'col': 0,
                'tokenType': 'HASH',
                'type': 'id',
                'value': 'foo'
              },
              {'line': 1, 'col': 4, 'tokenType': 'WHITESPACE'},
              {'line': 1, 'col': 5, 'tokenType': 'EOF_TOKEN'}
            ],
            'declarations': []
          }],
          'eof': {'line': 1, 'col': 7, 'tokenType': 'EOF_TOKEN'}
        },
        sheet);
  });

  it('parses an @media rule', () => {
    const css = '@media {}';
    const errors = [];
    const tokenlist = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokenlist, ampAtRuleParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertJSONEquals(
        {
          'line': 1,
          'col': 0,
          'tokenType': 'STYLESHEET',
          'rules': [{
            'line': 1,
            'col': 0,
            'tokenType': 'AT_RULE',
            'name': 'media',
            'prelude': [
              {'line': 1, 'col': 6, 'tokenType': 'WHITESPACE'},
              {'line': 1, 'col': 7, 'tokenType': 'EOF_TOKEN'}
            ],
            'declarations': [],
            'rules': []
          }],
          'eof': {'line': 1, 'col': 9, 'tokenType': 'EOF_TOKEN'}
        },
        sheet);
  });

  it('parses nested media rules and declarations',
     () => {
       const css = 'h1 { color: red; }\n' +
           '@media print {\n' +
           '  @media print {\n' +
           '    h2.bar { size: 4px; }\n' +
           '  }\n' +
           '}\n' +
           '@font-face {\n' +
           '  font-family: \'MyFont\';\n' +
           '  src: url(\'foo.ttf\');\n' +
           '}';
       const errors = [];
       const tokenlist = parse_css.tokenize(css, 1, 0, errors);
       assertJSONEquals(
           [
             {'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'h1'},
             {'line': 1, 'col': 2, 'tokenType': 'WHITESPACE'},
             {'line': 1, 'col': 3, 'tokenType': 'OPEN_CURLY'},
             {'line': 1, 'col': 4, 'tokenType': 'WHITESPACE'},
             {'line': 1, 'col': 5, 'tokenType': 'IDENT', 'value': 'color'},
             {'line': 1, 'col': 10, 'tokenType': 'COLON'},
             {'line': 1, 'col': 11, 'tokenType': 'WHITESPACE'},
             {'line': 1, 'col': 12, 'tokenType': 'IDENT', 'value': 'red'},
             {'line': 1, 'col': 15, 'tokenType': 'SEMICOLON'},
             {'line': 1, 'col': 16, 'tokenType': 'WHITESPACE'},
             {'line': 1, 'col': 17, 'tokenType': 'CLOSE_CURLY'},
             {'line': 1, 'col': 18, 'tokenType': 'WHITESPACE'},
             {'line': 2, 'col': 0, 'tokenType': 'AT_KEYWORD', 'value': 'media'},
             {'line': 2, 'col': 6, 'tokenType': 'WHITESPACE'},
             {'line': 2, 'col': 7, 'tokenType': 'IDENT', 'value': 'print'},
             {'line': 2, 'col': 12, 'tokenType': 'WHITESPACE'},
             {'line': 2, 'col': 13, 'tokenType': 'OPEN_CURLY'},
             {'line': 2, 'col': 14, 'tokenType': 'WHITESPACE'},
             {'line': 3, 'col': 2, 'tokenType': 'AT_KEYWORD', 'value': 'media'},
             {'line': 3, 'col': 8, 'tokenType': 'WHITESPACE'},
             {'line': 3, 'col': 9, 'tokenType': 'IDENT', 'value': 'print'},
             {'line': 3, 'col': 14, 'tokenType': 'WHITESPACE'},
             {'line': 3, 'col': 15, 'tokenType': 'OPEN_CURLY'},
             {'line': 3, 'col': 16, 'tokenType': 'WHITESPACE'},
             {'line': 4, 'col': 4, 'tokenType': 'IDENT', 'value': 'h2'},
             {'line': 4, 'col': 6, 'tokenType': 'DELIM', 'value': '.'},
             {'line': 4, 'col': 7, 'tokenType': 'IDENT', 'value': 'bar'},
             {'line': 4, 'col': 10, 'tokenType': 'WHITESPACE'},
             {'line': 4, 'col': 11, 'tokenType': 'OPEN_CURLY'},
             {'line': 4, 'col': 12, 'tokenType': 'WHITESPACE'},
             {'line': 4, 'col': 13, 'tokenType': 'IDENT', 'value': 'size'},
             {'line': 4, 'col': 17, 'tokenType': 'COLON'},
             {'line': 4, 'col': 18, 'tokenType': 'WHITESPACE'},
             {
               'line': 4,
               'col': 19,
               'tokenType': 'DIMENSION',
               'type': 'integer',
               'value': 4,
               'repr': '4',
               'unit': 'px'
             },
             {'line': 4, 'col': 22, 'tokenType': 'SEMICOLON'},
             {'line': 4, 'col': 23, 'tokenType': 'WHITESPACE'},
             {'line': 4, 'col': 24, 'tokenType': 'CLOSE_CURLY'},
             {'line': 4, 'col': 25, 'tokenType': 'WHITESPACE'},
             {'line': 5, 'col': 2, 'tokenType': 'CLOSE_CURLY'},
             {'line': 5, 'col': 3, 'tokenType': 'WHITESPACE'},
             {'line': 6, 'col': 0, 'tokenType': 'CLOSE_CURLY'},
             {'line': 6, 'col': 1, 'tokenType': 'WHITESPACE'},
             {
               'line': 7,
               'col': 0,
               'tokenType': 'AT_KEYWORD',
               'value': 'font-face'
             },
             {'line': 7, 'col': 10, 'tokenType': 'WHITESPACE'},
             {'line': 7, 'col': 11, 'tokenType': 'OPEN_CURLY'},
             {'line': 7, 'col': 12, 'tokenType': 'WHITESPACE'},
             {
               'line': 8,
               'col': 2,
               'tokenType': 'IDENT',
               'value': 'font-family'
             },
             {'line': 8, 'col': 13, 'tokenType': 'COLON'},
             {'line': 8, 'col': 14, 'tokenType': 'WHITESPACE'},
             {'line': 8, 'col': 15, 'tokenType': 'STRING', 'value': 'MyFont'},
             {'line': 8, 'col': 23, 'tokenType': 'SEMICOLON'},
             {'line': 8, 'col': 24, 'tokenType': 'WHITESPACE'},
             {'line': 9, 'col': 2, 'tokenType': 'IDENT', 'value': 'src'},
             {'line': 9, 'col': 5, 'tokenType': 'COLON'},
             {'line': 9, 'col': 6, 'tokenType': 'WHITESPACE'},
             {
               'line': 9,
               'col': 7,
               'tokenType': 'FUNCTION_TOKEN',
               'value': 'url'
             },
             {'line': 9, 'col': 11, 'tokenType': 'STRING', 'value': 'foo.ttf'},
             {'line': 9, 'col': 20, 'tokenType': 'CLOSE_PAREN'},
             {'line': 9, 'col': 21, 'tokenType': 'SEMICOLON'},
             {'line': 9, 'col': 22, 'tokenType': 'WHITESPACE'},
             {'line': 10, 'col': 0, 'tokenType': 'CLOSE_CURLY'},
             {'line': 10, 'col': 1, 'tokenType': 'EOF_TOKEN'}
           ],
           tokenlist);
       const sheet = parse_css.parseAStylesheet(
           tokenlist, ampAtRuleParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
           errors);
       assertStrictEqual(0, errors.length);
       assertJSONEquals(
        {
          'line': 1,
          'col': 0,
          'tokenType': 'STYLESHEET',
          'rules': [
            {
              'line': 1,
              'col': 0,
              'tokenType': 'QUALIFIED_RULE',
              'prelude': [
                {'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'h1'},
                {'line': 1, 'col': 2, 'tokenType': 'WHITESPACE'},
                {'line': 1, 'col': 3, 'tokenType': 'EOF_TOKEN'}
              ],
              'declarations': [{
                'line': 1,
                'col': 5,
                'tokenType': 'DECLARATION',
                'name': 'color',
                'value': [
                  {'line': 1, 'col': 11, 'tokenType': 'WHITESPACE'},
                  {'line': 1, 'col': 12, 'tokenType': 'IDENT', 'value': 'red'},
                  {'line': 1, 'col': 15, 'tokenType': 'EOF_TOKEN'}
                ],
                'important': false
              }]
            },
            {
              'line': 2,
              'col': 0,
              'tokenType': 'AT_RULE',
              'name': 'media',
              'prelude': [
                {'line': 2, 'col': 6, 'tokenType': 'WHITESPACE'},
                {'line': 2, 'col': 7, 'tokenType': 'IDENT', 'value': 'print'},
                {'line': 2, 'col': 12, 'tokenType': 'WHITESPACE'},
                {'line': 2, 'col': 13, 'tokenType': 'EOF_TOKEN'}
              ],
              'declarations': [],
              'rules': [{
                'line': 3,
                'col': 2,
                'tokenType': 'AT_RULE',
                'name': 'media',
                'prelude': [
                  {'line': 3, 'col': 8, 'tokenType': 'WHITESPACE'},
                  {'line': 3, 'col': 9, 'tokenType': 'IDENT', 'value': 'print'},
                  {'line': 3, 'col': 14, 'tokenType': 'WHITESPACE'},
                  {'line': 3, 'col': 15, 'tokenType': 'EOF_TOKEN'}
                ],
                'declarations': [],
                'rules': [{
                  'line': 4,
                  'col': 4,
                  'tokenType': 'QUALIFIED_RULE',
                  'prelude': [
                    {'line': 4, 'col': 4, 'tokenType': 'IDENT', 'value': 'h2'},
                    {'line': 4, 'col': 6, 'tokenType': 'DELIM', 'value': '.'},
                    {'line': 4, 'col': 7, 'tokenType': 'IDENT', 'value': 'bar'},
                    {'line': 4, 'col': 10, 'tokenType': 'WHITESPACE'},
                    {'line': 4, 'col': 11, 'tokenType': 'EOF_TOKEN'}
                  ],
                  'declarations': [{
                    'line': 4,
                    'col': 13,
                    'tokenType': 'DECLARATION',
                    'name': 'size',
                    'value': [
                      {'line': 4, 'col': 18, 'tokenType': 'WHITESPACE'}, {
                        'line': 4,
                        'col': 19,
                        'tokenType': 'DIMENSION',
                        'type': 'integer',
                        'value': 4,
                        'repr': '4',
                        'unit': 'px'
                      },
                      {'line': 4, 'col': 22, 'tokenType': 'EOF_TOKEN'}
                    ],
                    'important': false
                  }]
                }]
              }]
            },
            {
              'line': 7,
              'col': 0,
              'tokenType': 'AT_RULE',
              'name': 'font-face',
              'prelude': [
                {'line': 7, 'col': 10, 'tokenType': 'WHITESPACE'},
                {'line': 7, 'col': 11, 'tokenType': 'EOF_TOKEN'}
              ],
              'declarations': [
                {
                  'line': 8,
                  'col': 2,
                  'tokenType': 'DECLARATION',
                  'name': 'font-family',
                  'value': [
                    {'line': 8, 'col': 14, 'tokenType': 'WHITESPACE'}, {
                      'line': 8,
                      'col': 15,
                      'tokenType': 'STRING',
                      'value': 'MyFont'
                    },
                    {'line': 8, 'col': 23, 'tokenType': 'EOF_TOKEN'}
                  ],
                  'important': false
                },
                {
                  'line': 9,
                  'col': 2,
                  'tokenType': 'DECLARATION',
                  'name': 'src',
                  'value': [
                    {'line': 9, 'col': 6, 'tokenType': 'WHITESPACE'}, {
                      'line': 9,
                      'col': 7,
                      'tokenType': 'FUNCTION_TOKEN',
                      'value': 'url'
                    },
                    {
                      'line': 9,
                      'col': 11,
                      'tokenType': 'STRING',
                      'value': 'foo.ttf'
                    },
                    {'line': 9, 'col': 20, 'tokenType': 'CLOSE_PAREN'},
                    {'line': 9, 'col': 21, 'tokenType': 'EOF_TOKEN'}
                  ],
                  'important': false
                }
              ],
              'rules': []
            }
          ],
          'eof': {'line': 10, 'col': 1, 'tokenType': 'EOF_TOKEN'}
        },
        sheet);
     });

  it('generates errors not assertions for invalid css', () => {
    const css = '#foo { foo.bar {} }\n' +  // qual. rule inside declarations
        '@font-face { @media {} }\n' +     // @rule inside declarations
        '@media { @gregable }\n' +         // unrecognized @rule, ignored
        'color: red;\n';  // declaration outside qualified rule.
    const errors = [];
    const tokenlist = parse_css.tokenize(css, 1, 0, errors);
    parse_css.parseAStylesheet(
        tokenlist, ampAtRuleParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertJSONEquals(
        [
          {
            'line': 1,
            'col': 7,
            'tokenType': 'ERROR',
            'code': 'CSS_SYNTAX_INCOMPLETE_DECLARATION',
            'params': ['style']
          },
          {
            'line': 2,
            'col': 13,
            'tokenType': 'ERROR',
            'code': 'CSS_SYNTAX_INVALID_AT_RULE',
            'params': ['style', 'media']
          },
          {
            'line': 4,
            'col': 0,
            'tokenType': 'ERROR',
            'code': 'CSS_SYNTAX_EOF_IN_PRELUDE_OF_QUALIFIED_RULE',
            'params': ['style']
          }
        ],
        errors);
  });

  it('generates errors based on the grammar', () => {
    // @gregable is not supported by the grammar.
    const css = '@gregable {}\n.foo{prop}';
    const errors = [];
    const tokenlist = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokenlist, ampAtRuleParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertJSONEquals(
        [{
          'line': 2,
          'col': 5,
          'tokenType': 'ERROR',
          'code': 'CSS_SYNTAX_INCOMPLETE_DECLARATION',
          'params': ['style']
        }],
        errors);
    assertJSONEquals(
        {
          'line': 1,
          'col': 0,
          'tokenType': 'STYLESHEET',
          'rules': [
            {
              'line': 1,
              'col': 0,
              'tokenType': 'AT_RULE',
              'name': 'gregable',
              'prelude': [
                {'line': 1, 'col': 9, 'tokenType': 'WHITESPACE'},
                {'line': 1, 'col': 10, 'tokenType': 'EOF_TOKEN'}
              ],
              'declarations': [],
              'rules': []
            },
            {
              'line': 2,
              'col': 0,
              'tokenType': 'QUALIFIED_RULE',
              'prelude': [
                {'line': 2, 'col': 0, 'tokenType': 'DELIM', 'value': '.'},
                {'line': 2, 'col': 1, 'tokenType': 'IDENT', 'value': 'foo'},
                {'line': 2, 'col': 4, 'tokenType': 'EOF_TOKEN'}
              ],
              'declarations': []
            }
          ],
          'eof': {'line': 2, 'col': 10, 'tokenType': 'EOF_TOKEN'}
        },
        sheet);
  });

  it('handles a nested media rule with declarations', () => {
    const css = '@media print {\n' +
        '/* hide navigation controls when printing */\n' +
        '#navigation { display: none }\n' +
        '@media (max-width: 12cm) {\n' +
        '  /* keep notes in flow when printing to narrow pages */\n' +
        '  .note { float: none }\n' +
        '}';
    const errors = [];
    const tokenlist = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokenlist, ampAtRuleParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);

    assertJSONEquals(
        {'line': 1, 'col': 0, 'tokenType': 'STYLESHEET', 'rules':
         [{'line': 1, 'col': 0, 'tokenType': 'AT_RULE', 'name': 'media',
           'prelude':
           [{'line': 1, 'col': 6, 'tokenType': 'WHITESPACE'},
            {'line': 1, 'col': 7, 'tokenType': 'IDENT', 'value': 'print'},
            {'line': 1, 'col': 12, 'tokenType': 'WHITESPACE'},
            {'line': 1, 'col': 13, 'tokenType': 'EOF_TOKEN'}], 'declarations':
           [], 'rules':
           [{'line': 3, 'col': 0, 'tokenType': 'QUALIFIED_RULE', 'prelude':
             [{'line': 3, 'col': 0, 'tokenType': 'HASH', 'type': 'id',
               'value': 'navigation'},
              {'line': 3, 'col': 11, 'tokenType': 'WHITESPACE'},
              {'line': 3, 'col': 12, 'tokenType': 'EOF_TOKEN'}],
             'declarations':
             [{'line': 3, 'col': 14, 'tokenType': 'DECLARATION', 'name':
               'display', 'value':
               [{'line': 3, 'col': 22, 'tokenType': 'WHITESPACE'},
                {'line': 3, 'col': 23, 'tokenType': 'IDENT', 'value':
                 'none'},
                {'line': 3, 'col': 27, 'tokenType': 'WHITESPACE'},
                {'line': 3, 'col': 28, 'tokenType': 'EOF_TOKEN'}],
               'important': false}]},
            {'line': 4, 'col': 0, 'tokenType': 'AT_RULE', 'name':
             'media', 'prelude':
             [{'line': 4, 'col': 6, 'tokenType': 'WHITESPACE'},
              {'line': 4, 'col': 7, 'tokenType': 'OPEN_PAREN'},
              {'line': 4, 'col': 8, 'tokenType': 'IDENT', 'value':
               'max-width'},
              {'line': 4, 'col': 17, 'tokenType': 'COLON'},
              {'line': 4, 'col': 18, 'tokenType': 'WHITESPACE'},
              {'line': 4, 'col': 19, 'tokenType': 'DIMENSION', 'type':
               'integer', 'value': 12, 'repr': '12', 'unit': 'cm'},
              {'line': 4, 'col': 23, 'tokenType': 'CLOSE_PAREN'},
              {'line': 4, 'col': 24, 'tokenType': 'WHITESPACE'},
              {'line': 4, 'col': 25, 'tokenType': 'EOF_TOKEN'}],
             'declarations': [], 'rules':
             [{'line': 6, 'col': 2, 'tokenType': 'QUALIFIED_RULE',
               'prelude':
               [{'line': 6, 'col': 2, 'tokenType': 'DELIM', 'value':
                 '.'},
                {'line': 6, 'col': 3, 'tokenType': 'IDENT', 'value':
                 'note'},
                {'line': 6, 'col': 7, 'tokenType': 'WHITESPACE'},
                {'line': 6, 'col': 8, 'tokenType': 'EOF_TOKEN'}],
               'declarations':
               [{'line': 6, 'col': 10, 'tokenType': 'DECLARATION',
                 'name': 'float', 'value':
                 [{'line': 6, 'col': 16, 'tokenType': 'WHITESPACE'},
                  {'line': 6, 'col': 17, 'tokenType': 'IDENT', 'value':
                   'none'},
                  {'line': 6, 'col': 21, 'tokenType': 'WHITESPACE'},
                  {'line': 6, 'col': 22, 'tokenType': 'EOF_TOKEN'}],
                 'important': false}]}]}]}], 'eof':
         {'line': 7, 'col': 1, 'tokenType': 'EOF_TOKEN'}},
        sheet);
    assertStrictEqual(0, errors.length);
  });

  it('handles selectors but does not parse them in detail yet', () => {
    const css = ' h1 { color: blue; } ';
    const errors = [];
    const tokenlist = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokenlist, ampAtRuleParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);

    assertJSONEquals(
        {
          'line': 1,
          'col': 0,
          'tokenType': 'STYLESHEET',
          'rules': [{
            'line': 1,
            'col': 1,
            'tokenType': 'QUALIFIED_RULE',
            'prelude': [
              {'line': 1, 'col': 1, 'tokenType': 'IDENT', 'value': 'h1'},
              {'line': 1, 'col': 3, 'tokenType': 'WHITESPACE'},
              {'line': 1, 'col': 4, 'tokenType': 'EOF_TOKEN'}
            ],
            'declarations': [{
              'line': 1,
              'col': 6,
              'tokenType': 'DECLARATION',
              'name': 'color',
              'value': [
                {'line': 1, 'col': 12, 'tokenType': 'WHITESPACE'},
                {'line': 1, 'col': 13, 'tokenType': 'IDENT', 'value': 'blue'},
                {'line': 1, 'col': 17, 'tokenType': 'EOF_TOKEN'}
              ],
              'important': false
            }]
          }],
          'eof': {'line': 1, 'col': 21, 'tokenType': 'EOF_TOKEN'}
        },
        sheet);
    assertStrictEqual(0, errors.length);
  });

  // The tests below are exploratory - they tell us what the css parser
  // currently produces for these selectors. For a list of selectors, see
  // http://www.w3.org/TR/css3-selectors/#selectors.
  // Note also that css-selectors.js contains a parser for selectors
  // which is covered in this unittest below.

  it('handles simple selector example', () => {
    assertJSONEquals(
        [
          {'line': 1, 'col': 0, 'tokenType': 'DELIM', 'value': '*'},
          {'line': 1, 'col': 1, 'tokenType': 'EOF_TOKEN'}
        ],
        parseSelectorForTest('*'));
  });

  it('handles another selector example', () => {
    assertJSONEquals(
        [
          {'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'E'},
          {'line': 1, 'col': 1, 'tokenType': 'EOF_TOKEN'}
        ],
        parseSelectorForTest('E'));
  });

  it('handles selector example with square braces', () => {
    assertJSONEquals(
        [
          {'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'E'},
          {'line': 1, 'col': 1, 'tokenType': 'OPEN_SQUARE'},
          {'line': 1, 'col': 2, 'tokenType': 'IDENT', 'value': 'foo'},
          {'line': 1, 'col': 5, 'tokenType': 'CLOSE_SQUARE'},
          {'line': 1, 'col': 6, 'tokenType': 'EOF_TOKEN'}
        ],
        parseSelectorForTest('E[foo]'));
  });

  it('handles selector example with string matching', () => {
    assertJSONEquals(
        [
          {'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'E'},
          {'line': 1, 'col': 1, 'tokenType': 'OPEN_SQUARE'},
          {'line': 1, 'col': 2, 'tokenType': 'IDENT', 'value': 'foo'},
          {'line': 1, 'col': 5, 'tokenType': 'DELIM', 'value': '='},
          {'line': 1, 'col': 6, 'tokenType': 'STRING', 'value': 'bar'},
          {'line': 1, 'col': 11, 'tokenType': 'CLOSE_SQUARE'},
          {'line': 1, 'col': 12, 'tokenType': 'EOF_TOKEN'}
        ],
        parseSelectorForTest('E[foo="bar"]'));
  });
});

describe('extractUrls', () => {

  // Tests that font urls are parsed with font-face atRuleScope.
  it('finds font in font-face', () => {
    const css =
        '@font-face {font-family: \'Foo\'; src: url(\'http://foo.com/bar.ttf\');}';
    const errors = [];
    const tokenList = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokenList, ampAtRuleParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    const parsedUrls = [];
    parse_css.extractUrls(sheet, parsedUrls, errors);
    assertJSONEquals([], errors);
    assertJSONEquals(
        [{
          'line': 1,
          'col': 37,
          'tokenType': 'PARSED_CSS_URL',
          'atRuleScope': 'font-face',
          'utf8Url': 'http://foo.com/bar.ttf'
        }],
        parsedUrls);
  });

  // Tests that image URLs are parsed with empty atRuleScope; also tests
  // that unicode escapes (in this case \000026) within the URL are decoded.
  it('supports image url with unicode', () => {
    const css =
        'body{background-image: url(\'http://a.com/b/c=d\\000026e=f_g*h\');}';
    const errors = [];
    const tokenList = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokenList, ampAtRuleParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    const parsedUrls = [];
    parse_css.extractUrls(sheet, parsedUrls, errors);
    assertJSONEquals([], errors);
    assertJSONEquals(
        [{
          'line': 1,
          'col': 23,
          'tokenType': 'PARSED_CSS_URL',
          'atRuleScope': '',
          'utf8Url': 'http://a.com/b/c=d&e=f_g*h'
        }],
        parsedUrls);
  });

  // This example contains both image urls, other urls (fonts) and
  // segments in between.
  it('handles longer example', () => {
    const css = '.a { color:red; background-image:url(4.png) }' +
        '.b { color:black; background-image:url(\'http://a.com/b.png\') } ' +
        '@font-face {font-family: \'Medium\';src: url(\'http://a.com/1.woff\') ' +
        'format(\'woff\'),url(\'http://b.com/1.ttf\') format(\'truetype\'),' +
        'src:url(\'\') format(\'embedded-opentype\');}';
    const errors = [];
    const tokenList = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokenList, ampAtRuleParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    const parsedUrls = [];
    parse_css.extractUrls(sheet, parsedUrls, errors);
    assertJSONEquals([], errors);
    assertJSONEquals(
        [
          {
            'line': 1,
            'col': 33,
            'tokenType': 'PARSED_CSS_URL',
            'atRuleScope': '',
            'utf8Url': '4.png'
          },
          {
            'line': 1,
            'col': 80,
            'tokenType': 'PARSED_CSS_URL',
            'atRuleScope': '',
            'utf8Url': 'http://a.com/b.png'
          },
          {
            'line': 1,
            'col': 147,
            'tokenType': 'PARSED_CSS_URL',
            'atRuleScope': 'font-face',
            'utf8Url': 'http://a.com/1.woff'
          },
          {
            'line': 1,
            'col': 189,
            'tokenType': 'PARSED_CSS_URL',
            'atRuleScope': 'font-face',
            'utf8Url': 'http://b.com/1.ttf'
          },
          {
            'line': 1,
            'col': 238,
            'tokenType': 'PARSED_CSS_URL',
            'atRuleScope': 'font-face',
            'utf8Url': ''
          }
        ],
        parsedUrls);
  });

  // Windows newlines present extra challenges for position information.
  it('handles windows newlines', () => {
    const css = '.a \r\n{ color:red; background-image:url(4.png) }\r\n' +
        '.b { color:black; \r\nbackground-image:url(\'http://a.com/b.png\') }';
    const errors = [];
    const tokenList = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokenList, ampAtRuleParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    const parsedUrls = [];
    parse_css.extractUrls(sheet, parsedUrls, errors);
    assertJSONEquals([], errors);
    assertJSONEquals(
        [
          {
            'line': 2,
            'col': 30,
            'tokenType': 'PARSED_CSS_URL',
            'atRuleScope': '',
            'utf8Url': '4.png'
          },
          {
            'line': 4,
            'col': 17,
            'tokenType': 'PARSED_CSS_URL',
            'atRuleScope': '',
            'utf8Url': 'http://a.com/b.png'
          }
        ],
        parsedUrls);
  });

  // This example parses as CSS without errors, however once the URL
  // with parameters is extracted, we recognize that the arguments to
  // the url function are invalid.
  it('invalid arguments inside url function yields error', () => {
    const css = '\n' +
        '    @font-face {\n' +
        '      font-family: \'Roboto\', sans-serif;\n' +
        '      src: url(\'<link href=\'https://fonts.googleapis.com/css' +
        '?family=Roboto:300,400,500,700\' ' +
        'rel=\'stylesheet\' type=\'text/css\'>\');\n' +
        '    }\n';
    const errors = [];
    const tokenList = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokenList, ampAtRuleParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    const parsedUrls = [];
    parse_css.extractUrls(sheet, parsedUrls, errors);
    assertJSONEquals(
        [{
          'line': 4,
          'col': 11,
          'tokenType': 'ERROR',
          'code': 'CSS_SYNTAX_BAD_URL',
          'params': ['style']
        }],
        errors);
    assertJSONEquals([], parsedUrls);
  });
});

/**
 * Helper function for parseMediaQueries tests.
 * @param {string} mediaQuery
 * @return  {!parse_css.Stylesheet}
 */
function mediaQueryStylesheet(mediaQuery) {
  const css = '@media ' + mediaQuery + ' {}';
  const errors = [];
  const tokenList = parse_css.tokenize(css, 1, 0, errors);
  const sheet = parse_css.parseAStylesheet(
      tokenList, ampAtRuleParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
      errors);
  assertJSONEquals([], errors);
  return sheet;
}

describe('parseMediaQueries', () => {
  // Tests demonstrates the error position reported for a simple error media
  // query. Note that the position is actually the @media AT rule.
  it('identifies error position', () => {
    const sheet = mediaQueryStylesheet('screen,');
    const errors = [];
    const mediaTypes = [];
    const mediaFeatures = [];
    parse_css.parseMediaQueries(sheet, mediaTypes, mediaFeatures, errors);
    assertJSONEquals(
        [{
          'line': 1,
          'col': 0,
          'code': 'CSS_SYNTAX_MALFORMED_MEDIA_QUERY',
          'params': ['style'],
          'tokenType': 'ERROR'
        }],
        errors);
  });

  // Tests demonstrates a series of media queries which are expected to produce
  // errors.
  it('fails on error queries', () => {
    const cases = [
      'screen, ',
      'screen and',
      'screen (',
      '((min-width:500px)',
      '(min-width:500px))',
      '((min-width:500px))',
      'not only screen and (color)',
      '(example, all), speech',
      '&test, screen',
      'all and(color)',
    ];

    for (const testcase of cases) {
      const sheet = mediaQueryStylesheet(testcase);
      const errors = [];
      const mediaTypes = [];
      const mediaFeatures = [];
      parse_css.parseMediaQueries(sheet, mediaTypes, mediaFeatures, errors);
      assertStrictEqual(1, errors.length);
    }
  });

  // Tests demonstrates a series of media queries which are expected to not
  // produce errors.
  it('succeeds on non-error queries', () => {
    const cases = [
      'screen, braille, hologram, greetingcard',
      'screen and (color), projection and (color)',
      'all and (min-width:500px)',
      'all and (min-width: 500px)',
      '(min-width:500px)',
      'not screen and (color)',
      'only screen and (color)',
      'NOT screen AND (color)',
      'screen \t \n , \t \n braille',
    ];

    for (const testcase of cases) {
      const sheet = mediaQueryStylesheet(testcase);
      const errors = [];
      const mediaTypes = [];
      const mediaFeatures = [];
      parse_css.parseMediaQueries(sheet, mediaTypes, mediaFeatures, errors);
      assertStrictEqual(0, errors.length);
    }
  });

  // Tests demonstrates that media type and media feature extraction.
  it('extracts media types and features', () => {
    const cases = [
      // Query,              Types,    Features
      ['screen and (color)', 'screen', 'color'],
      ['screen and (color), braille', 'screen,braille', 'color'],
      [
        'screen and (min-width: 50px) and (max-width:51px)', 'screen',
        'min-width,max-width'
      ],
      ['(color) and (max-width:abc)', '', 'color,max-width'],
      ['only screen', 'screen', ''],
      ['not screen', 'screen', ''],
      ['screen, not braille', 'screen,braille', ''],
      ['SCREEN AND (COLOR)', 'SCREEN', 'COLOR'],
    ];

    for (const testcase of cases) {
      assertStrictEqual(3, testcase.length);
      const query = testcase[0];
      const expectedTypes = testcase[1];
      const expectedFeatures = testcase[2];

      const sheet = mediaQueryStylesheet(query);
      const errors = [];
      const mediaTypes = [];
      const mediaFeatures = [];
      parse_css.parseMediaQueries(sheet, mediaTypes, mediaFeatures, errors);
      assertStrictEqual(0, errors.length);

      let seenTypes = '';
      for (const token of mediaTypes) {
        if (seenTypes !== '') seenTypes += ',';
        seenTypes += token.value;
      }
      let seenFeatures = '';
      for (const token of mediaFeatures) {
        if (seenFeatures !== '') seenFeatures += ',';
        seenFeatures += token.value;
      }

      assertStrictEqual(expectedTypes, seenTypes);
      assertStrictEqual(expectedFeatures, seenFeatures);
    }
  });
});  // describe('parseMediaQueries')

/**
 * @param {string} selector
 * @returns {!Array<parse_css.Token>}
 */
function parseSelectorForTest(selector) {
  const css = selector + '{}';
  const errors = [];
  const tokenlist = parse_css.tokenize(css, 1, 0, errors);
  const sheet = parse_css.parseAStylesheet(
      tokenlist, ampAtRuleParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
      errors);
  return goog.asserts.assertInstanceof(sheet.rules[0], parse_css.QualifiedRule)
      .prelude;
}

//
// Below this line: unittests for css-selectors.js.
//
describe('css_selectors', () => {
  it('parses a type selector', () => {
    const tokens = parseSelectorForTest('*');
    assertJSONEquals(
        [
          {'line': 1, 'col': 0, 'tokenType': 'DELIM', 'value': '*'},
          {'line': 1, 'col': 1, 'tokenType': 'EOF_TOKEN'}
        ],
        tokens);
    let tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    let typeSelector = parse_css.parseATypeSelector(tokenStream);
    assertStrictEqual('*', typeSelector.toString());

    tokenStream = new parse_css.TokenStream(parseSelectorForTest('*|*'));
    tokenStream.consume();
    typeSelector = parse_css.parseATypeSelector(tokenStream);
    assertStrictEqual('*|*', typeSelector.toString());

    tokenStream = new parse_css.TokenStream(parseSelectorForTest('*|E'));
    tokenStream.consume();
    typeSelector = parse_css.parseATypeSelector(tokenStream);
    assertStrictEqual('*|E', typeSelector.toString());

    tokenStream = new parse_css.TokenStream(parseSelectorForTest('svg|E'));
    tokenStream.consume();
    typeSelector = parse_css.parseATypeSelector(tokenStream);
    assertStrictEqual('svg|E', typeSelector.toString());

    tokenStream = new parse_css.TokenStream(parseSelectorForTest('svg|*'));
    tokenStream.consume();
    typeSelector = parse_css.parseATypeSelector(tokenStream);
    assertStrictEqual('svg|*', typeSelector.toString());

    tokenStream = new parse_css.TokenStream(parseSelectorForTest('|E'));
    tokenStream.consume();
    typeSelector = parse_css.parseATypeSelector(tokenStream);
    assertStrictEqual('|E', typeSelector.toString());
  });

  it('parses an id selector', () => {
    const tokens = parseSelectorForTest('#hello-world');
    assertJSONEquals(
        [
          {
            'line': 1,
            'col': 0,
            'tokenType': 'HASH',
            'type': 'id',
            'value': 'hello-world'
          },
          {'line': 1, 'col': 12, 'tokenType': 'EOF_TOKEN'}
        ],
        tokens);
    const tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    const idSelector = parse_css.parseAnIdSelector(tokenStream);
    assertStrictEqual('#hello-world', idSelector.toString());
    assertStrictEqual(1, idSelector.line);
    assertStrictEqual(0, idSelector.col);
  });

  it('parses a class selector', () => {
    const tokens = parseSelectorForTest('.hello-world');
    assertJSONEquals(
        [
          {'line': 1, 'col': 0, 'tokenType': 'DELIM', 'value': '.'},
          {'line': 1, 'col': 1, 'tokenType': 'IDENT', 'value': 'hello-world'},
          {'line': 1, 'col': 12, 'tokenType': 'EOF_TOKEN'}
        ],
        tokens);
    const tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    const classSelector = parse_css.parseAClassSelector(tokenStream);
    assertStrictEqual('.hello-world', classSelector.toString());
    assertStrictEqual(1, classSelector.line);
    assertStrictEqual(0, classSelector.col);
  });

  it('parses a simple selector sequence', () => {
    let tokens = parseSelectorForTest('a|b#c');
    assertJSONEquals(
        [
          {'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'a'},
          {'line': 1, 'col': 1, 'tokenType': 'DELIM', 'value': '|'},
          {'line': 1, 'col': 2, 'tokenType': 'IDENT', 'value': 'b'}, {
            'line': 1,
            'col': 3,
            'tokenType': 'HASH',
            'type': 'id',
            'value': 'c'
          },
          {'line': 1, 'col': 5, 'tokenType': 'EOF_TOKEN'}
        ],
        tokens);
    let tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    let sequence = parse_css.parseASimpleSelectorSequence(tokenStream);
    assertJSONEquals(
        {
          'line': 1,
          'col': 0,
          'tokenType': 'SIMPLE_SELECTOR_SEQUENCE',
          'otherSelectors':
              [{'line': 1, 'col': 3, 'value': 'c', 'tokenType': 'ID_SELECTOR'}],
          'typeSelector': {
            'line': 1,
            'col': 0,
            'elementName': 'b',
            'namespacePrefix': 'a',
            'tokenType': 'TYPE_SELECTOR'
          }
        },
        sequence);
    tokens = parseSelectorForTest('a|foo#bar.baz');
    tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    sequence = parse_css.parseASimpleSelectorSequence(tokenStream);
    assertJSONEquals(
        {
          'line': 1,
          'col': 0,
          'tokenType': 'SIMPLE_SELECTOR_SEQUENCE',
          'otherSelectors': [
            {'line': 1, 'col': 5, 'value': 'bar', 'tokenType': 'ID_SELECTOR'}, {
              'line': 1,
              'col': 9,
              'value': 'baz',
              'tokenType': 'CLASS_SELECTOR'
            }
          ],
          'typeSelector': {
            'line': 1,
            'col': 0,
            'elementName': 'foo',
            'namespacePrefix': 'a',
            'tokenType': 'TYPE_SELECTOR'
          }
        },
        sequence);
  });

  it('parses a selector', () => {
    const tokens = parseSelectorForTest('foo bar \n baz');
    assertJSONEquals(
        [
          {'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'foo'},
          {'line': 1, 'col': 3, 'tokenType': 'WHITESPACE'},
          {'line': 1, 'col': 4, 'tokenType': 'IDENT', 'value': 'bar'},
          {'line': 1, 'col': 7, 'tokenType': 'WHITESPACE'},
          {'line': 2, 'col': 1, 'tokenType': 'IDENT', 'value': 'baz'},
          {'line': 2, 'col': 4, 'tokenType': 'EOF_TOKEN'}
        ],
        tokens);
    const tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    const selector = parse_css.parseASelector(tokenStream);
    assertJSONEquals(
        {
          'line': 1,
          'col': 7,
          'combinatorType': 'DESCENDANT',
          'left': {
            'line': 1,
            'col': 3,
            'combinatorType': 'DESCENDANT',
            'left': {
              'line': 1,
              'col': 0,
              'tokenType': 'SIMPLE_SELECTOR_SEQUENCE',
              'otherSelectors': [],
              'typeSelector': {
                'line': 1,
                'col': 0,
                'elementName': 'foo',
                'namespacePrefix': null,
                'tokenType': 'TYPE_SELECTOR'
              }
            },
            'tokenType': 'COMBINATOR',
            'right': {
              'line': 1,
              'col': 4,
              'tokenType': 'SIMPLE_SELECTOR_SEQUENCE',
              'otherSelectors': [],
              'typeSelector': {
                'line': 1,
                'col': 4,
                'elementName': 'bar',
                'namespacePrefix': null,
                'tokenType': 'TYPE_SELECTOR'
              }
            }
          },
          'tokenType': 'COMBINATOR',
          'right': {
            'line': 2,
            'col': 1,
            'tokenType': 'SIMPLE_SELECTOR_SEQUENCE',
            'otherSelectors': [],
            'typeSelector': {
              'line': 2,
              'col': 1,
              'elementName': 'baz',
              'namespacePrefix': null,
              'tokenType': 'TYPE_SELECTOR'
            }
          }
        },
        selector);
  });

  it('parses a selectors group', () => {
    const tokens = parseSelectorForTest('foo, bar \n, baz');
    assertJSONEquals(
        [
          {'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'foo'},
          {'line': 1, 'col': 3, 'tokenType': 'COMMA'},
          {'line': 1, 'col': 4, 'tokenType': 'WHITESPACE'},
          {'line': 1, 'col': 5, 'tokenType': 'IDENT', 'value': 'bar'},
          {'line': 1, 'col': 8, 'tokenType': 'WHITESPACE'},
          {'line': 2, 'col': 0, 'tokenType': 'COMMA'},
          {'line': 2, 'col': 1, 'tokenType': 'WHITESPACE'},
          {'line': 2, 'col': 2, 'tokenType': 'IDENT', 'value': 'baz'},
          {'line': 2, 'col': 5, 'tokenType': 'EOF_TOKEN'}
        ],
        tokens);
    const tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    const selector = parse_css.parseASelectorsGroup(tokenStream);
    assertJSONEquals(
        {
          'line': 1,
          'col': 0,
          'elements': [
            {
              'line': 1,
              'col': 0,
              'tokenType': 'SIMPLE_SELECTOR_SEQUENCE',
              'otherSelectors': [],
              'typeSelector': {
                'line': 1,
                'col': 0,
                'elementName': 'foo',
                'namespacePrefix': null,
                'tokenType': 'TYPE_SELECTOR'
              }
            },
            {
              'line': 1,
              'col': 5,
              'tokenType': 'SIMPLE_SELECTOR_SEQUENCE',
              'otherSelectors': [],
              'typeSelector': {
                'line': 1,
                'col': 5,
                'elementName': 'bar',
                'namespacePrefix': null,
                'tokenType': 'TYPE_SELECTOR'
              }
            },
            {
              'line': 2,
              'col': 2,
              'tokenType': 'SIMPLE_SELECTOR_SEQUENCE',
              'otherSelectors': [],
              'typeSelector': {
                'line': 2,
                'col': 2,
                'elementName': 'baz',
                'namespacePrefix': null,
                'tokenType': 'TYPE_SELECTOR'
              }
            }
          ],
          'tokenType': 'SELECTORS_GROUP'
        },
        selector);
  });

  it('parses a selectors group with an attrib match', () => {
    const tokens = parseSelectorForTest('a[href="http://www.w3.org/"]');
    assertJSONEquals(
        [
          {'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'a'},
          {'line': 1, 'col': 1, 'tokenType': 'OPEN_SQUARE'},
          {'line': 1, 'col': 2, 'tokenType': 'IDENT', 'value': 'href'},
          {'line': 1, 'col': 6, 'tokenType': 'DELIM', 'value': '='}, {
            'line': 1,
            'col': 7,
            'tokenType': 'STRING',
            'value': 'http://www.w3.org/'
          },
          {'line': 1, 'col': 27, 'tokenType': 'CLOSE_SQUARE'},
          {'line': 1, 'col': 28, 'tokenType': 'EOF_TOKEN'}
        ],
        tokens);
    const tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    const selector = parse_css.parseASelectorsGroup(tokenStream);
    assertJSONEquals(
        {
          'line': 1,
          'col': 0,
          'tokenType': 'SIMPLE_SELECTOR_SEQUENCE',
          'otherSelectors': [{
            'line': 1,
            'col': 1,
            'tokenType': 'ATTR_SELECTOR',
            'value': 'http://www.w3.org/',
            'attrName': 'href',
            'matchOperator': '=',
            'namespacePrefix': null
          }],
          'typeSelector': {
            'line': 1,
            'col': 0,
            'elementName': 'a',
            'namespacePrefix': null,
            'tokenType': 'TYPE_SELECTOR'
          }
        },
        selector);
  });

  it('parses a selectors group with more attrib matches', () => {
    const tokens = parseSelectorForTest(
        'elem[attr1="v1"][attr2=value2\n]' +
        '[attr3~="foo"][attr4|="bar"][attr5|= "baz"][attr6 $=boo]' +
        '[ attr7*=bang ][attr8]');
    const tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    const selector = parse_css.parseASelectorsGroup(tokenStream);
    assertJSONEquals(
        {
          'line': 1,
          'col': 0,
          'tokenType': 'SIMPLE_SELECTOR_SEQUENCE',
          'otherSelectors': [
            {
              'line': 1,
              'col': 4,
              'tokenType': 'ATTR_SELECTOR',
              'value': 'v1',
              'attrName': 'attr1',
              'matchOperator': '=',
              'namespacePrefix': null
            },
            {
              'line': 1,
              'col': 16,
              'tokenType': 'ATTR_SELECTOR',
              'value': 'value2',
              'attrName': 'attr2',
              'matchOperator': '=',
              'namespacePrefix': null
            },
            {
              'line': 2,
              'col': 1,
              'tokenType': 'ATTR_SELECTOR',
              'value': 'foo',
              'attrName': 'attr3',
              'matchOperator': '~=',
              'namespacePrefix': null
            },
            {
              'line': 2,
              'col': 15,
              'tokenType': 'ATTR_SELECTOR',
              'value': 'bar',
              'attrName': 'attr4',
              'matchOperator': '|=',
              'namespacePrefix': null
            },
            {
              'line': 2,
              'col': 29,
              'tokenType': 'ATTR_SELECTOR',
              'value': 'baz',
              'attrName': 'attr5',
              'matchOperator': '|=',
              'namespacePrefix': null
            },
            {
              'line': 2,
              'col': 44,
              'tokenType': 'ATTR_SELECTOR',
              'value': 'boo',
              'attrName': 'attr6',
              'matchOperator': '$=',
              'namespacePrefix': null
            },
            {
              'line': 2,
              'col': 57,
              'tokenType': 'ATTR_SELECTOR',
              'value': 'bang',
              'attrName': 'attr7',
              'matchOperator': '*=',
              'namespacePrefix': null
            },
            {
              'line': 2,
              'col': 72,
              'tokenType': 'ATTR_SELECTOR',
              'value': '',
              'attrName': 'attr8',
              'matchOperator': '',
              'namespacePrefix': null
            }
          ],
          'typeSelector': {
            'line': 1,
            'col': 0,
            'tokenType': 'TYPE_SELECTOR',
            'elementName': 'elem',
            'namespacePrefix': null
          }
        },
        selector);
  });

  it('parses a selectors group with a pseudo class', () => {
    const tokens = parseSelectorForTest('a::b:lang(fr-be)');
    assertJSONEquals(
        [
          {'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'a'},
          {'line': 1, 'col': 1, 'tokenType': 'COLON'},
          {'line': 1, 'col': 2, 'tokenType': 'COLON'},
          {'line': 1, 'col': 3, 'tokenType': 'IDENT', 'value': 'b'},
          {'line': 1, 'col': 4, 'tokenType': 'COLON'},
          {'line': 1, 'col': 5, 'tokenType': 'FUNCTION_TOKEN', 'value': 'lang'},
          {'line': 1, 'col': 10, 'tokenType': 'IDENT', 'value': 'fr-be'},
          {'line': 1, 'col': 15, 'tokenType': 'CLOSE_PAREN'},
          {'line': 1, 'col': 16, 'tokenType': 'EOF_TOKEN'}
        ],
        tokens);
    const tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    const selector = parse_css.parseASelectorsGroup(tokenStream);
    assertJSONEquals(
        {
          'line': 1,
          'col': 0,
          'tokenType': 'SIMPLE_SELECTOR_SEQUENCE',
          'otherSelectors': [
            {
              'line': 1,
              'col': 1,
              'name': 'b',
              'isClass': false,
              'tokenType': 'PSEUDO_SELECTOR'
            },
            {
              'line': 1,
              'col': 4,
              'name': 'lang',
              'func': [
                {
                  'line': 1,
                  'col': 5,
                  'tokenType': 'FUNCTION_TOKEN',
                  'value': 'lang'
                },
                {'line': 1, 'col': 10, 'tokenType': 'IDENT', 'value': 'fr-be'},
                {'line': 1, 'col': 15, 'tokenType': 'EOF_TOKEN'}
              ],
              'isClass': true,
              'tokenType': 'PSEUDO_SELECTOR'
            }
          ],
          'typeSelector': {
            'line': 1,
            'col': 0,
            'elementName': 'a',
            'namespacePrefix': null,
            'tokenType': 'TYPE_SELECTOR'
          }
        },
        selector);
  });

  it('parses a selectors group with a negation', () => {
    // This test records the status quo with respect to negation:
    // We allow it, but don't currently parse the inside of it, we just
    // mirror it over into the 'func' field of the pseudo selector.
    const tokens = parseSelectorForTest('html|*:not(:link):not(:visited)');
    const tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    const selector = parse_css.parseASelectorsGroup(tokenStream);
    assertJSONEquals(
        {
          'line': 1,
          'col': 0,
          'tokenType': 'SIMPLE_SELECTOR_SEQUENCE',
          'otherSelectors': [
            {
              'line': 1,
              'col': 6,
              'tokenType': 'PSEUDO_SELECTOR',
              'name': 'not',
              'func': [
                {
                  'line': 1,
                  'col': 7,
                  'tokenType': 'FUNCTION_TOKEN',
                  'value': 'not'
                },
                {'line': 1, 'col': 11, 'tokenType': 'COLON'},
                {'line': 1, 'col': 12, 'tokenType': 'IDENT', 'value': 'link'},
                {'line': 1, 'col': 16, 'tokenType': 'EOF_TOKEN'}
              ],
              'isClass': true
            },
            {
              'line': 1,
              'col': 17,
              'tokenType': 'PSEUDO_SELECTOR',
              'name': 'not',
              'func': [
                {
                  'line': 1,
                  'col': 18,
                  'tokenType': 'FUNCTION_TOKEN',
                  'value': 'not'
                },
                {'line': 1, 'col': 22, 'tokenType': 'COLON'}, {
                  'line': 1,
                  'col': 23,
                  'tokenType': 'IDENT',
                  'value': 'visited'
                },
                {'line': 1, 'col': 30, 'tokenType': 'EOF_TOKEN'}
              ],
              'isClass': true
            }
          ],
          'typeSelector': {
            'line': 1,
            'col': 0,
            'tokenType': 'TYPE_SELECTOR',
            'elementName': '*',
            'namespacePrefix': 'html'
          }
        },
        selector);
  });

  it('reports error for unparsed remainder of input', () => {
    const tokens = parseSelectorForTest('foo bar 9');
    const tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    const selector = parse_css.parseASelectorsGroup(tokenStream);
    assertJSONEquals(
        {
          'code': 'CSS_SYNTAX_UNPARSED_INPUT_REMAINS_IN_SELECTOR',
          'col': 8,
          'line': 1,
          'params': ['style'],
          'tokenType': 'ERROR'
        },
        selector);
  });

  it('implements visitor pattern', () => {
    class CollectCombinatorNodes extends parse_css.SelectorVisitor {
      constructor() {
        super();
        this.combinatorNodes = [];
      }

      /** @override */
      visitCombinator(combinator) { this.combinatorNodes.push(combinator); }
    }
    const tokens = parseSelectorForTest('a > b c + d ~ e');
    const tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    const maybe_selector = parse_css.parseASelectorsGroup(tokenStream);
    const selector =
        goog.asserts.assertInstanceof(maybe_selector, parse_css.Selector);
    const visitor = new CollectCombinatorNodes();
    parse_css.traverseSelectors(selector, visitor);
    assertStrictEqual(4, visitor.combinatorNodes.length);
    assertStrictEqual(
        'GENERAL_SIBLING', visitor.combinatorNodes[0].combinatorType);
    assertStrictEqual(1, visitor.combinatorNodes[0].line);
    assertStrictEqual(12, visitor.combinatorNodes[0].col);

    // The combinator #2 is the (in)famous whitespace operator.
    assertJSONEquals(
        {
          'line': 1,
          'col': 5,
          'combinatorType': 'DESCENDANT',
          'left': {
            'line': 1,
            'col': 2,
            'combinatorType': 'CHILD',
            'left': {
              'line': 1,
              'col': 0,
              'tokenType': 'SIMPLE_SELECTOR_SEQUENCE',
              'otherSelectors': [],
              'typeSelector': {
                'line': 1,
                'col': 0,
                'elementName': 'a',
                'namespacePrefix': null,
                'tokenType': 'TYPE_SELECTOR'
              }
            },
            'tokenType': 'COMBINATOR',
            'right': {
              'line': 1,
              'col': 4,
              'tokenType': 'SIMPLE_SELECTOR_SEQUENCE',
              'otherSelectors': [],
              'typeSelector': {
                'line': 1,
                'col': 4,
                'elementName': 'b',
                'namespacePrefix': null,
                'tokenType': 'TYPE_SELECTOR'
              }
            }
          },
          'tokenType': 'COMBINATOR',
          'right': {
            'line': 1,
            'col': 6,
            'tokenType': 'SIMPLE_SELECTOR_SEQUENCE',
            'otherSelectors': [],
            'typeSelector': {
              'line': 1,
              'col': 6,
              'elementName': 'c',
              'namespacePrefix': null,
              'tokenType': 'TYPE_SELECTOR'
            }
          }
        },
        visitor.combinatorNodes[2]);
  });
});
