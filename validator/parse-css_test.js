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
goog.require('css_selectors.parseATypeSelector');
goog.require('json_testutil.renderJSON');
goog.require('parse_css.parseAStylesheet');
goog.require('parse_css.tokenize');

goog.provide('parse_css.ParseCssTest');

/**
 * A strict comparison between two values.
 * Note: Unfortunately assert.strictEqual has some drawbacks, including that
 * it truncates the provided arguments (and it's not configurable) and
 * with the Closure compiler, it requires a message argument to which
 * we'd always have to pass undefined. Too messy, so we roll our own.
 */
function assertStrictEqual(expected, saw) {
  assert.ok(expected === saw, 'expected: ' + expected + ' saw: ' + saw);
}

function errorsToString(errors) {
  const out = [];
  for (const error of errors) {
    out.push(error.toString());
  }
  return out.join('\n');
}

// Simple function which lets us sort the keys in json output from the parser
// in a way that makes the most logical sense for viewing in the output.
function jsonKeyCmp(a, b) {
  // Lower numbers will be displayed first in the rendered json output.
  const keyPriority = {
    'line': 0,
    'col': 1,
    'tokenType': 2,
    'name': 3,
    'prelude': 4,
    'declarations': 5,
    'rules': 6,
    'errorType': 7,
    'msg': 8,
    'type': 9,
    'value': 10,
    'repr': 11,
    'unit': 12,
    'eof': 13
  };

  // Handle cases where only only one of the two keys is recognized.
  // Unrecognized keys go last.
  if (keyPriority.hasOwnProperty(a) && !keyPriority.hasOwnProperty(b)) {
    return -1;
  }
  if (keyPriority.hasOwnProperty(b) && !keyPriority.hasOwnProperty(a)) {
    return 1;
  }

  // Handle case where both keys are recognized.
  if (keyPriority.hasOwnProperty(b) && keyPriority.hasOwnProperty(a)) {
    return keyPriority[a] - keyPriority[b];
  }

  return json_testutil.defaultCmpFn(a, b);
}

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
    assertStrictEqual(
        'IDENT(foo) WS { WS IDENT(bar) : WS IDENT(baz) ; WS } EOF_TOKEN',
        tokenlist.join(' '));
    assertStrictEqual(0, errors.length);
  });

  it('tokenizes with parse errors', () => {
    const css = ' "\n "';
    const errors = [];
    const tokenlist = parse_css.tokenize(css, 1, 0, errors);
    assertJSONEquals(
        [{'line': 1, 'col': 0, 'tokenType': 'WHITESPACE'},
         {'line': 1, 'col': 2, 'tokenType': 'WHITESPACE'},
         {'line': 2, 'col': 1, 'tokenType': 'STRING', 'value': ''},
         {'line': 2, 'col': 2, 'tokenType': 'EOF_TOKEN'}],
        tokenlist);
    assertJSONEquals(
        [{'line': 1, 'col': 1, 'tokenType': 'ERROR', 'errorType':
          'TOKENIZATION', 'msg': 'unterminated string'}], errors);
    assertStrictEqual(':1:1 TOKENIZATION - unterminated string',
                      errorsToString(errors));
  });

  it('provides errors with line col offsets', () => {
    const css =
        'line 1 "unterminated\n' +
        'line 2 "unterminated\n';
    let errors = [];
    parse_css.tokenize(css, 1, 0, errors);
    assertStrictEqual(':1:7 TOKENIZATION - unterminated string\n' +
        ':2:7 TOKENIZATION - unterminated string', errorsToString(errors));
    errors = [];
    parse_css.tokenize(css, 5, 5, errors);
    assertStrictEqual(':5:12 TOKENIZATION - unterminated string\n' +
        ':6:7 TOKENIZATION - unterminated string', errorsToString(errors));
    assertJSONEquals(
        [{'line': 5, 'col': 12, 'tokenType': 'ERROR', 'errorType':
          'TOKENIZATION', 'msg': 'unterminated string'},
         {'line': 6, 'col': 7, 'tokenType': 'ERROR', 'errorType':
          'TOKENIZATION', 'msg': 'unterminated string'}],
        errors);
  });

  it('deals w/ stray backslashes, unterminated comments and bad urls', () => {
    // Note that Javascript has its own escaping, so there's really just one '\'.
    let errors = [];
    parse_css.tokenize('a trailing \\\nbackslash', 1, 0, errors);
    assertStrictEqual(':1:11 TOKENIZATION - stray trailing backslash',
                      errorsToString(errors));

    errors = [];
    parse_css.tokenize('h1 {color: red; } /*', 1, 0, errors);
    assertStrictEqual(':1:17 TOKENIZATION - unterminated comment',
                      errorsToString(errors));

    errors = [];
    parse_css.tokenize('oh hi url(foo"bar)', 1, 0, errors);
    assertStrictEqual(':1:6 TOKENIZATION - bad url', errorsToString(errors));
  });
});

describe('parseAStylesheet', () => {
  it('parses rgb values', () => {
    const css = 'foo { bar: rgb(255, 0, 127); }';
    const errors = [];
    const tokenlist = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokenlist, ampAtRuleParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertJSONEquals(
        {'line': 1, 'col': 0, 'tokenType': 'STYLESHEET', 'rules':
         [{'line': 1, 'col': 0, 'tokenType': 'QUALIFIED_RULE', 'prelude':
           [{'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'foo'},
            {'line': 1, 'col': 3, 'tokenType': 'WHITESPACE'},
            {'line': 1, 'col': 4, 'tokenType': 'EOF_TOKEN'}], 'declarations':
           [{'line': 1, 'col': 6, 'tokenType': 'DECLARATION', 'name':
             'bar', 'value':
             [{'line': 1, 'col': 10, 'tokenType': 'WHITESPACE'},
              {'line': 1, 'col': 11, 'tokenType': 'FUNCTION_TOKEN',
               'value': 'rgb'},
              {'line': 1, 'col': 15, 'tokenType': 'NUMBER', 'type':
               'integer', 'value': 255, 'repr': '255'},
              {'line': 1, 'col': 18, 'tokenType': ','},
              {'line': 1, 'col': 19, 'tokenType': 'WHITESPACE'},
              {'line': 1, 'col': 20, 'tokenType': 'NUMBER', 'type':
               'integer', 'value': 0, 'repr': '0'},
              {'line': 1, 'col': 21, 'tokenType': ','},
              {'line': 1, 'col': 22, 'tokenType': 'WHITESPACE'},
              {'line': 1, 'col': 23, 'tokenType': 'NUMBER', 'type':
               'integer', 'value': 127, 'repr': '127'},
              {'line': 1, 'col': 26, 'tokenType': ')'},
              {'line': 1, 'col': 27, 'tokenType': 'EOF_TOKEN'}], 'important':
             false}]}], 'eof':
         {'line': 1, 'col': 30, 'tokenType': 'EOF_TOKEN'}},
        sheet);
  });

  it('parses a hash reference', () => {
    const css = '#foo {}';
    const errors = [];
    const tokenlist = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokenlist, ampAtRuleParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertJSONEquals(
        {'line': 1, 'col': 0, 'tokenType': 'STYLESHEET', 'rules':
         [{'line': 1, 'col': 0, 'tokenType': 'QUALIFIED_RULE', 'prelude':
           [{'line': 1, 'col': 0, 'tokenType': 'HASH', 'type': 'id',
             'value': 'foo'},
            {'line': 1, 'col': 4, 'tokenType': 'WHITESPACE'},
            {'line': 1, 'col': 5, 'tokenType': 'EOF_TOKEN'}], 'declarations':
           []}], 'eof':
         {'line': 1, 'col': 7, 'tokenType': 'EOF_TOKEN'}},
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
        {'line': 1, 'col': 0, 'tokenType': 'STYLESHEET', 'rules':
         [{'line': 1, 'col': 0, 'tokenType': 'AT_RULE', 'name': 'media',
           'prelude':
           [{'line': 1, 'col': 6, 'tokenType': 'WHITESPACE'},
            {'line': 1, 'col': 7, 'tokenType': 'EOF_TOKEN'}], 'declarations':
           [], 'rules':
           []}], 'eof':
         {'line': 1, 'col': 9, 'tokenType': 'EOF_TOKEN'}},
        sheet);
  });

  it('parses nested media rules and declarations', () => {
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
        [{'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'h1'},
         {'line': 1, 'col': 2, 'tokenType': 'WHITESPACE'},
         {'line': 1, 'col': 3, 'tokenType': '{'},
         {'line': 1, 'col': 4, 'tokenType': 'WHITESPACE'},
         {'line': 1, 'col': 5, 'tokenType': 'IDENT', 'value': 'color'},
         {'line': 1, 'col': 10, 'tokenType': ':'},
         {'line': 1, 'col': 11, 'tokenType': 'WHITESPACE'},
         {'line': 1, 'col': 12, 'tokenType': 'IDENT', 'value': 'red'},
         {'line': 1, 'col': 15, 'tokenType': ';'},
         {'line': 1, 'col': 16, 'tokenType': 'WHITESPACE'},
         {'line': 1, 'col': 17, 'tokenType': '}'},
         {'line': 1, 'col': 18, 'tokenType': 'WHITESPACE'},
         {'line': 2, 'col': 0, 'tokenType': 'AT-KEYWORD', 'value':
          'media'},
         {'line': 2, 'col': 6, 'tokenType': 'WHITESPACE'},
         {'line': 2, 'col': 7, 'tokenType': 'IDENT', 'value': 'print'},
         {'line': 2, 'col': 12, 'tokenType': 'WHITESPACE'},
         {'line': 2, 'col': 13, 'tokenType': '{'},
         {'line': 2, 'col': 14, 'tokenType': 'WHITESPACE'},
         {'line': 3, 'col': 2, 'tokenType': 'AT-KEYWORD', 'value':
          'media'},
         {'line': 3, 'col': 8, 'tokenType': 'WHITESPACE'},
         {'line': 3, 'col': 9, 'tokenType': 'IDENT', 'value': 'print'},
         {'line': 3, 'col': 14, 'tokenType': 'WHITESPACE'},
         {'line': 3, 'col': 15, 'tokenType': '{'},
         {'line': 3, 'col': 16, 'tokenType': 'WHITESPACE'},
         {'line': 4, 'col': 4, 'tokenType': 'IDENT', 'value': 'h2'},
         {'line': 4, 'col': 6, 'tokenType': 'DELIM', 'value': '.'},
         {'line': 4, 'col': 7, 'tokenType': 'IDENT', 'value': 'bar'},
         {'line': 4, 'col': 10, 'tokenType': 'WHITESPACE'},
         {'line': 4, 'col': 11, 'tokenType': '{'},
         {'line': 4, 'col': 12, 'tokenType': 'WHITESPACE'},
         {'line': 4, 'col': 13, 'tokenType': 'IDENT', 'value': 'size'},
         {'line': 4, 'col': 17, 'tokenType': ':'},
         {'line': 4, 'col': 18, 'tokenType': 'WHITESPACE'},
         {'line': 4, 'col': 19, 'tokenType': 'DIMENSION', 'type':
          'integer', 'value': 4, 'repr': '4', 'unit': 'px'},
         {'line': 4, 'col': 22, 'tokenType': ';'},
         {'line': 4, 'col': 23, 'tokenType': 'WHITESPACE'},
         {'line': 4, 'col': 24, 'tokenType': '}'},
         {'line': 4, 'col': 25, 'tokenType': 'WHITESPACE'},
         {'line': 5, 'col': 2, 'tokenType': '}'},
         {'line': 5, 'col': 3, 'tokenType': 'WHITESPACE'},
         {'line': 6, 'col': 0, 'tokenType': '}'},
         {'line': 6, 'col': 1, 'tokenType': 'WHITESPACE'},
         {'line': 7, 'col': 0, 'tokenType': 'AT-KEYWORD', 'value':
          'font-face'},
         {'line': 7, 'col': 10, 'tokenType': 'WHITESPACE'},
         {'line': 7, 'col': 11, 'tokenType': '{'},
         {'line': 7, 'col': 12, 'tokenType': 'WHITESPACE'},
         {'line': 8, 'col': 2, 'tokenType': 'IDENT', 'value': 'font-family'},
         {'line': 8, 'col': 13, 'tokenType': ':'},
         {'line': 8, 'col': 14, 'tokenType': 'WHITESPACE'},
         {'line': 8, 'col': 15, 'tokenType': 'STRING', 'value': 'MyFont'},
         {'line': 8, 'col': 23, 'tokenType': ';'},
         {'line': 8, 'col': 24, 'tokenType': 'WHITESPACE'},
         {'line': 9, 'col': 2, 'tokenType': 'IDENT', 'value': 'src'},
         {'line': 9, 'col': 5, 'tokenType': ':'},
         {'line': 9, 'col': 6, 'tokenType': 'WHITESPACE'},
         {'line': 9, 'col': 7, 'tokenType': 'FUNCTION_TOKEN', 'value':
          'url'},
         {'line': 9, 'col': 11, 'tokenType': 'STRING', 'value': 'foo.ttf'},
         {'line': 9, 'col': 20, 'tokenType': ')'},
         {'line': 9, 'col': 21, 'tokenType': ';'},
         {'line': 9, 'col': 22, 'tokenType': 'WHITESPACE'},
         {'line': 10, 'col': 0, 'tokenType': '}'},
         {'line': 10, 'col': 1, 'tokenType': 'EOF_TOKEN'}],
        tokenlist);
    const sheet = parse_css.parseAStylesheet(
        tokenlist, ampAtRuleParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertStrictEqual(0, errors.length);
    assertJSONEquals(
        {'line': 1, 'col': 0, 'tokenType': 'STYLESHEET', 'rules':
         [{'line': 1, 'col': 0, 'tokenType': 'QUALIFIED_RULE', 'prelude':
           [{'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'h1'},
            {'line': 1, 'col': 2, 'tokenType': 'WHITESPACE'},
            {'line': 1, 'col': 3, 'tokenType': 'EOF_TOKEN'}], 'declarations':
           [{'line': 1, 'col': 5, 'tokenType': 'DECLARATION', 'name':
             'color', 'value':
             [{'line': 1, 'col': 11, 'tokenType': 'WHITESPACE'},
              {'line': 1, 'col': 12, 'tokenType': 'IDENT', 'value':
               'red'},
              {'line': 1, 'col': 15, 'tokenType': 'EOF_TOKEN'}], 'important':
             false}]},
          {'line': 2, 'col': 0, 'tokenType': 'AT_RULE', 'name': 'media',
           'prelude':
           [{'line': 2, 'col': 6, 'tokenType': 'WHITESPACE'},
            {'line': 2, 'col': 7, 'tokenType': 'IDENT', 'value': 'print'},
            {'line': 2, 'col': 12, 'tokenType': 'WHITESPACE'},
            {'line': 2, 'col': 13, 'tokenType': 'EOF_TOKEN'}], 'declarations':
           [], 'rules':
           [{'line': 3, 'col': 2, 'tokenType': 'AT_RULE', 'name':
             'media', 'prelude':
             [{'line': 3, 'col': 8, 'tokenType': 'WHITESPACE'},
              {'line': 3, 'col': 9, 'tokenType': 'IDENT', 'value':
               'print'},
              {'line': 3, 'col': 14, 'tokenType': 'WHITESPACE'},
              {'line': 3, 'col': 15, 'tokenType': 'EOF_TOKEN'}], 'declarations':
             [], 'rules':
             [{'line': 4, 'col': 4, 'tokenType': 'QUALIFIED_RULE',
               'prelude':
               [{'line': 4, 'col': 4, 'tokenType': 'IDENT', 'value':
                 'h2'},
                {'line': 4, 'col': 6, 'tokenType': 'DELIM', 'value':
                 '.'},
                {'line': 4, 'col': 7, 'tokenType': 'IDENT', 'value':
                 'bar'},
                {'line': 4, 'col': 10, 'tokenType': 'WHITESPACE'},
                {'line': 4, 'col': 11, 'tokenType': 'EOF_TOKEN'}],
               'declarations':
               [{'line': 4, 'col': 13, 'tokenType': 'DECLARATION',
                 'name': 'size', 'value':
                 [{'line': 4, 'col': 18, 'tokenType': 'WHITESPACE'},
                  {'line': 4, 'col': 19, 'tokenType': 'DIMENSION',
                   'type': 'integer', 'value': 4, 'repr': '4', 'unit':
                   'px'},
                  {'line': 4, 'col': 22, 'tokenType': 'EOF_TOKEN'}],
                 'important': false}]}]}]},
          {'line': 7, 'col': 0, 'tokenType': 'AT_RULE', 'name': 'font-face',
           'prelude':
           [{'line': 7, 'col': 10, 'tokenType': 'WHITESPACE'},
            {'line': 7, 'col': 11, 'tokenType': 'EOF_TOKEN'}], 'declarations':
           [{'line': 8, 'col': 2, 'tokenType': 'DECLARATION', 'name':
             'font-family', 'value':
             [{'line': 8, 'col': 14, 'tokenType': 'WHITESPACE'},
              {'line': 8, 'col': 15, 'tokenType': 'STRING', 'value':
               'MyFont'},
              {'line': 8, 'col': 23, 'tokenType': 'EOF_TOKEN'}], 'important':
             false},
            {'line': 9, 'col': 2, 'tokenType': 'DECLARATION', 'name':
             'src', 'value':
             [{'line': 9, 'col': 6, 'tokenType': 'WHITESPACE'},
              {'line': 9, 'col': 7, 'tokenType': 'FUNCTION_TOKEN',
               'value': 'url'},
              {'line': 9, 'col': 11, 'tokenType': 'STRING', 'value':
               'foo.ttf'},
              {'line': 9, 'col': 20, 'tokenType': ')'},
              {'line': 9, 'col': 21, 'tokenType': 'EOF_TOKEN'}], 'important':
             false}], 'rules':
           []}], 'eof':
         {'line': 10, 'col': 1, 'tokenType': 'EOF_TOKEN'}},
        sheet);
  });

  it('generates errors not assertions for invalid css', () => {
    const css = '#foo { foo.bar {} }\n' +  // qual. rule inside declarations
    '@font-face { @media {} }\n' +  // @rule inside declarations
    '@media { @gregable }\n' +  // unrecognized @rule, ignored
    'color: red;\n';  // declaration outside qualified rule.
    const errors = [];
    const tokenlist = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokenlist, ampAtRuleParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);
    assertJSONEquals(
        [{'line': 1, 'col': 7, 'tokenType': 'ERROR', 'errorType':
          'PARSING', 'msg': 'Incomplete declaration'},
         {'line': 2, 'col': 13, 'tokenType': 'ERROR', 'errorType':
          'PARSING', 'msg': '@media found inside declaration'},
         {'line': 4, 'col': 0, 'tokenType': 'ERROR', 'errorType':
          'PARSING', 'msg':
          'Hit EOF when trying to parse the prelude of a ' +
              'qualified rule.'}],
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
        [{'line': 2, 'col': 5, 'tokenType': 'ERROR', 'errorType':
          'PARSING', 'msg': 'Incomplete declaration'}], errors);
    assertJSONEquals(
        {'line': 1, 'col': 0, 'tokenType': 'STYLESHEET', 'rules':
         [{'line': 1, 'col': 0, 'tokenType': 'AT_RULE', 'name': 'gregable',
           'prelude':
           [{'line': 1, 'col': 9, 'tokenType': 'WHITESPACE'},
            {'line': 1, 'col': 10, 'tokenType': 'EOF_TOKEN'}], 'declarations':
           [], 'rules':
           []},
          {'line': 2, 'col': 0, 'tokenType': 'QUALIFIED_RULE', 'prelude':
           [{'line': 2, 'col': 0, 'tokenType': 'DELIM', 'value': '.'},
            {'line': 2, 'col': 1, 'tokenType': 'IDENT', 'value': 'foo'},
            {'line': 2, 'col': 4, 'tokenType': 'EOF_TOKEN'}], 'declarations':
           []}], 'eof':
         {'line': 2, 'col': 10, 'tokenType': 'EOF_TOKEN'}},
        sheet);
  });

  it('handles a nested media rule with declarations', () => {
    const css =
        '@media print {\n' +
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
              {'line': 4, 'col': 7, 'tokenType': '('},
              {'line': 4, 'col': 8, 'tokenType': 'IDENT', 'value':
               'max-width'},
              {'line': 4, 'col': 17, 'tokenType': ':'},
              {'line': 4, 'col': 18, 'tokenType': 'WHITESPACE'},
              {'line': 4, 'col': 19, 'tokenType': 'DIMENSION', 'type':
               'integer', 'value': 12, 'repr': '12', 'unit': 'cm'},
              {'line': 4, 'col': 23, 'tokenType': ')'},
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
  });

  it('handles selectors but does not parse them in detail yet', () => {
    const css = ' h1 { color: blue; } ';
    const errors = [];
    const tokenlist = parse_css.tokenize(css, 1, 0, errors);
    const sheet = parse_css.parseAStylesheet(
        tokenlist, ampAtRuleParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
        errors);

    assertJSONEquals(
        {'line': 1, 'col': 0, 'tokenType': 'STYLESHEET', 'rules':
         [{'line': 1, 'col': 1, 'tokenType': 'QUALIFIED_RULE', 'prelude':
           [{'line': 1, 'col': 1, 'tokenType': 'IDENT', 'value': 'h1'},
            {'line': 1, 'col': 3, 'tokenType': 'WHITESPACE'},
            {'line': 1, 'col': 4, 'tokenType': 'EOF_TOKEN'}], 'declarations':
           [{'line': 1, 'col': 6, 'tokenType': 'DECLARATION', 'name':
             'color', 'value':
             [{'line': 1, 'col': 12, 'tokenType': 'WHITESPACE'},
              {'line': 1, 'col': 13, 'tokenType': 'IDENT', 'value':
               'blue'},
              {'line': 1, 'col': 17, 'tokenType': 'EOF_TOKEN'}], 'important':
             false}]}], 'eof':
         {'line': 1, 'col': 21, 'tokenType': 'EOF_TOKEN'}},
        sheet);
  });

  // The tests below are exploratory - they tell us what the css parser
  // currently produces for these selectors. For a list of selectors, see
  // http://www.w3.org/TR/css3-selectors/#selectors.
  //
  // TODO(johannes): Get complete coverage.

  it('handles simple selector example', () => {
    assertJSONEquals(
        [{'line': 1, 'col': 0, 'tokenType': 'DELIM', 'value': '*'},
         {'line': 1, 'col': 1, 'tokenType': 'EOF_TOKEN'}],
        parseSelectorForTest('*'));
  });

  it('handles another selector example', () => {
    assertJSONEquals(
        [{'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'E'},
         {'line': 1, 'col': 1, 'tokenType': 'EOF_TOKEN'}],
        parseSelectorForTest('E'));
  });

  it('handles selector example with square braces', () => {
    assertJSONEquals(
        [{'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'E'},
         {'line': 1, 'col': 1, 'tokenType': '['},
         {'line': 1, 'col': 2, 'tokenType': 'IDENT', 'value': 'foo'},
         {'line': 1, 'col': 5, 'tokenType': ']'},
         {'line': 1, 'col': 6, 'tokenType': 'EOF_TOKEN'}],
        parseSelectorForTest('E[foo]'));
  });

  it('handles selector example with string matching', () => {
    assertJSONEquals(
        [{'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'E'},
         {'line': 1, 'col': 1, 'tokenType': '['},
         {'line': 1, 'col': 2, 'tokenType': 'IDENT', 'value': 'foo'},
         {'line': 1, 'col': 5, 'tokenType': 'DELIM', 'value': '='},
         {'line': 1, 'col': 6, 'tokenType': 'STRING', 'value': 'bar'},
         {'line': 1, 'col': 11, 'tokenType': ']'},
         {'line': 1, 'col': 12, 'tokenType': 'EOF_TOKEN'}],
        parseSelectorForTest('E[foo="bar"]'));
  });
});

function parseSelectorForTest(selector) {
  const css = selector + '{}';
  const errors = [];
  const tokenlist = parse_css.tokenize(css, 1, 0, errors);
  const sheet = parse_css.parseAStylesheet(
      tokenlist, ampAtRuleParsingSpec, parse_css.BlockType.PARSE_AS_IGNORE,
      errors);
  return sheet['rules'][0].prelude;
}

//
// Below this line: unittests for css-selectors.js.
//
describe('css_selectors', () => {
  it('parses a type selector', () => {
    const tokens = parseSelectorForTest('*');
    assertJSONEquals(
        [{'line': 1, 'col': 0, 'tokenType': 'DELIM', 'value': '*'},
         {'line': 1, 'col': 1, 'tokenType': 'EOF_TOKEN'}], tokens);
    let tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    let typeSelector = css_selectors.parseATypeSelector(tokenStream);
    assertStrictEqual('*', typeSelector.toString());

    tokenStream = new parse_css.TokenStream(parseSelectorForTest('*|*'));
    tokenStream.consume();
    typeSelector = css_selectors.parseATypeSelector(tokenStream);
    assertStrictEqual('*|*', typeSelector.toString());

    tokenStream = new parse_css.TokenStream(parseSelectorForTest('*|E'));
    tokenStream.consume();
    typeSelector = css_selectors.parseATypeSelector(tokenStream);
    assertStrictEqual('*|E', typeSelector.toString());

    tokenStream = new parse_css.TokenStream(parseSelectorForTest('svg|E'));
    tokenStream.consume();
    typeSelector = css_selectors.parseATypeSelector(tokenStream);
    assertStrictEqual('svg|E', typeSelector.toString());

    tokenStream = new parse_css.TokenStream(parseSelectorForTest('svg|*'));
    tokenStream.consume();
    typeSelector = css_selectors.parseATypeSelector(tokenStream);
    assertStrictEqual('svg|*', typeSelector.toString());

    tokenStream = new parse_css.TokenStream(parseSelectorForTest('|E'));
    tokenStream.consume();
    typeSelector = css_selectors.parseATypeSelector(tokenStream);
    assertStrictEqual('|E', typeSelector.toString());
  });

  it('parses an id selector', () => {
    const tokens = parseSelectorForTest('#hello-world');
    assertJSONEquals(
        [{'line': 1, 'col': 0, 'tokenType': 'HASH', 'type': 'id',
          'value': 'hello-world'},
         {'line': 1, 'col': 12, 'tokenType': 'EOF_TOKEN'}], tokens);
    const tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    const idSelector = css_selectors.parseAnIdSelector(tokenStream);
    assertStrictEqual('#hello-world', idSelector.toString());
    assertStrictEqual(1, idSelector.line);
    assertStrictEqual(0, idSelector.col);
  });

  it('parses a class selectro', () => {
    const tokens = parseSelectorForTest('.hello-world');
    assertJSONEquals(
        [{'line': 1, 'col': 0, 'tokenType': 'DELIM', 'value': '.'},
         {'line': 1, 'col': 1, 'tokenType': 'IDENT', 'value': 'hello-world'},
         {'line': 1, 'col': 12, 'tokenType': 'EOF_TOKEN'}],
        tokens);
    const tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    const classSelector = css_selectors.parseAClassSelector(tokenStream);
    assertStrictEqual('.hello-world', classSelector.toString());
    assertStrictEqual(1, classSelector.line);
    assertStrictEqual(0, classSelector.col);
  });

  it('parses a simple selector sequence', () => {
    let tokens = parseSelectorForTest('a|b#c');
    assertJSONEquals(
        [{'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'a'},
         {'line': 1, 'col': 1, 'tokenType': 'DELIM', 'value': '|'},
         {'line': 1, 'col': 2, 'tokenType': 'IDENT', 'value': 'b'},
         {'line': 1, 'col': 3, 'tokenType': 'HASH', 'type': 'id',
          'value': 'c'},
         {'line': 1, 'col': 5, 'tokenType': 'EOF_TOKEN'}], tokens);
    let tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    let sequence = css_selectors.parseASimpleSelectorSequence(tokenStream);
    assertJSONEquals(
        {'line': 1, 'col': 0, 'node': 'SIMPLE_SELECTOR_SEQUENCE',
         'otherSelectors':
         [{'line': 1, 'col': 3, 'value': 'c', 'node': 'ID_SELECTOR'}],
         'typeSelector':
         {'line': 1, 'col': 0, 'elementName': 'b', 'namespacePrefix':
          'a', 'node': 'TYPE_SELECTOR'}},
        sequence);
    tokens = parseSelectorForTest('a|foo#bar.baz');
    tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    sequence = css_selectors.parseASimpleSelectorSequence(tokenStream);
    assertJSONEquals(
        {'line': 1, 'col': 0, 'node': 'SIMPLE_SELECTOR_SEQUENCE',
         'otherSelectors':
         [{'line': 1, 'col': 5, 'value': 'bar', 'node': 'ID_SELECTOR'},
          {'line': 1, 'col': 9, 'value': 'baz', 'node': 'CLASS_SELECTOR'}],
         'typeSelector':
         {'line': 1, 'col': 0, 'elementName': 'foo', 'namespacePrefix':
          'a', 'node': 'TYPE_SELECTOR'}},
        sequence);
  });

  it('parses a selector', () => {
    const tokens = parseSelectorForTest('foo bar \n baz');
    assertJSONEquals(
        [{'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'foo'},
         {'line': 1, 'col': 3, 'tokenType': 'WHITESPACE'},
         {'line': 1, 'col': 4, 'tokenType': 'IDENT', 'value': 'bar'},
         {'line': 1, 'col': 7, 'tokenType': 'WHITESPACE'},
         {'line': 2, 'col': 1, 'tokenType': 'IDENT', 'value': 'baz'},
         {'line': 2, 'col': 4, 'tokenType': 'EOF_TOKEN'}],
        tokens);
    const tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    const selector = css_selectors.parseASelector(tokenStream);
    assertJSONEquals(
        {'line': 1, 'col': 7, 'combinatorType': 'DESCENDANT', 'left':
         {'line': 1, 'col': 3, 'combinatorType': 'DESCENDANT', 'left':
          {'line': 1, 'col': 0, 'node': 'SIMPLE_SELECTOR_SEQUENCE',
           'otherSelectors':
           [], 'typeSelector':
           {'line': 1, 'col': 0, 'elementName': 'foo', 'namespacePrefix':
            null, 'node': 'TYPE_SELECTOR'}}, 'node': 'COMBINATOR',
          'right':
          {'line': 1, 'col': 4, 'node': 'SIMPLE_SELECTOR_SEQUENCE',
           'otherSelectors':
           [], 'typeSelector':
           {'line': 1, 'col': 4, 'elementName': 'bar', 'namespacePrefix':
            null, 'node': 'TYPE_SELECTOR'}}}, 'node': 'COMBINATOR',
         'right':
         {'line': 2, 'col': 1, 'node': 'SIMPLE_SELECTOR_SEQUENCE',
          'otherSelectors':
          [], 'typeSelector':
          {'line': 2, 'col': 1, 'elementName': 'baz', 'namespacePrefix':
           null, 'node': 'TYPE_SELECTOR'}}},
        selector);
  });

  it('parses a selectors group', () => {
    const tokens = parseSelectorForTest('foo, bar \n, baz');
    assertJSONEquals(
        [{'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'foo'},
         {'line': 1, 'col': 3, 'tokenType': ','},
         {'line': 1, 'col': 4, 'tokenType': 'WHITESPACE'},
         {'line': 1, 'col': 5, 'tokenType': 'IDENT', 'value': 'bar'},
         {'line': 1, 'col': 8, 'tokenType': 'WHITESPACE'},
         {'line': 2, 'col': 0, 'tokenType': ','},
         {'line': 2, 'col': 1, 'tokenType': 'WHITESPACE'},
         {'line': 2, 'col': 2, 'tokenType': 'IDENT', 'value': 'baz'},
         {'line': 2, 'col': 5, 'tokenType': 'EOF_TOKEN'}],
        tokens);
    const tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    const selector = css_selectors.parseASelectorsGroup(tokenStream);
    assertJSONEquals(
        {'line': 1, 'col': 0, 'elements':
         [{'line': 1, 'col': 0, 'node': 'SIMPLE_SELECTOR_SEQUENCE',
           'otherSelectors':
           [], 'typeSelector':
           {'line': 1, 'col': 0, 'elementName': 'foo', 'namespacePrefix':
            null, 'node': 'TYPE_SELECTOR'}},
          {'line': 1, 'col': 5, 'node': 'SIMPLE_SELECTOR_SEQUENCE',
           'otherSelectors':
           [], 'typeSelector':
           {'line': 1, 'col': 5, 'elementName': 'bar', 'namespacePrefix':
            null, 'node': 'TYPE_SELECTOR'}},
          {'line': 2, 'col': 2, 'node': 'SIMPLE_SELECTOR_SEQUENCE',
           'otherSelectors':
           [], 'typeSelector':
           {'line': 2, 'col': 2, 'elementName': 'baz', 'namespacePrefix':
            null, 'node': 'TYPE_SELECTOR'}}], 'node': 'SELECTORS_GROUP'},
        selector);
  });

  it('parses a selectors group with an attrib match', () => {
    const tokens = parseSelectorForTest('a[href="http://www.w3.org/"]');
    assertJSONEquals(
        [{'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'a'},
         {'line': 1, 'col': 1, 'tokenType': '['},
         {'line': 1, 'col': 2, 'tokenType': 'IDENT', 'value': 'href'},
         {'line': 1, 'col': 6, 'tokenType': 'DELIM', 'value': '='},
         {'line': 1, 'col': 7, 'tokenType': 'STRING',
          'value': 'http://www.w3.org/'},
         {'line': 1, 'col': 27, 'tokenType': ']'},
         {'line': 1, 'col': 28, 'tokenType': 'EOF_TOKEN'}], tokens);
    const tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    const selector = css_selectors.parseASelectorsGroup(tokenStream);
    assertJSONEquals(
        {'line': 1, 'col': 0, 'node': 'SIMPLE_SELECTOR_SEQUENCE',
         'otherSelectors':
         [{'line': 1, 'col': 1, 'value':
           [{'line': 1, 'col': 2, 'tokenType': 'IDENT', 'value': 'href'},
            {'line': 1, 'col': 6, 'tokenType': 'DELIM', 'value': '='},
            {'line': 1, 'col': 7, 'tokenType': 'STRING', 'value':
             'http://www.w3.org/'},
            {'line': 1, 'col': 27, 'tokenType': 'EOF_TOKEN'}], 'node':
           'ATTR_SELECTOR'}], 'typeSelector':
         {'line': 1, 'col': 0, 'elementName': 'a', 'namespacePrefix':
          null, 'node': 'TYPE_SELECTOR'}},
        selector);
  });

  it('parses a selectors group with a pseudo class', () => {
    const tokens = parseSelectorForTest('a::b:lang(fr-be)]');
    assertJSONEquals(
        [{'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'a'},
         {'line': 1, 'col': 1, 'tokenType': ':'},
         {'line': 1, 'col': 2, 'tokenType': ':'},
         {'line': 1, 'col': 3, 'tokenType': 'IDENT', 'value': 'b'},
         {'line': 1, 'col': 4, 'tokenType': ':'},
         {'line': 1, 'col': 5, 'tokenType': 'FUNCTION_TOKEN', 'value':
          'lang'},
         {'line': 1, 'col': 10, 'tokenType': 'IDENT', 'value': 'fr-be'},
         {'line': 1, 'col': 15, 'tokenType': ')'},
         {'line': 1, 'col': 16, 'tokenType': ']'},
         {'line': 1, 'col': 17, 'tokenType': 'EOF_TOKEN'}], tokens);
    const tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    const selector = css_selectors.parseASelectorsGroup(tokenStream);
    assertJSONEquals(
        {'line': 1, 'col': 0, 'node': 'SIMPLE_SELECTOR_SEQUENCE',
         'otherSelectors':
         [{'line': 1, 'col': 1, 'name': 'b', 'isClass': false, 'node':
           'PSEUDO_SELECTOR'},
          {'line': 1, 'col': 4, 'name': 'lang', 'func':
           [{'line': 1, 'col': 5, 'tokenType': 'FUNCTION_TOKEN', 'value':
             'lang'},
            {'line': 1, 'col': 10, 'tokenType': 'IDENT', 'value':
             'fr-be'},
            {'line': 1, 'col': 15, 'tokenType': 'EOF_TOKEN'}], 'isClass':
           true, 'node': 'PSEUDO_SELECTOR'}], 'typeSelector':
         {'line': 1, 'col': 0, 'elementName': 'a', 'namespacePrefix':
          null, 'node': 'TYPE_SELECTOR'}},
        selector);
  });

  it('parses a selectors group with a negation', () => {
    // This test records the status quo with respect to negation:
    // We allow it, but don't currently parse the inside of it, we just
    // mirror it over into the 'func' field of the pseudo selector.
    const tokens = parseSelectorForTest('html|*:not(:link):not(:visited)');
    const tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    const selector = css_selectors.parseASelectorsGroup(tokenStream);
    assertJSONEquals(
        {'line': 1, 'col': 0, 'node': 'SIMPLE_SELECTOR_SEQUENCE',
         'otherSelectors':
         [{'line': 1, 'col': 6, 'name': 'not', 'func':
           [{'line': 1, 'col': 7, 'tokenType': 'FUNCTION_TOKEN', 'value':
             'not'},
            {'line': 1, 'col': 11, 'tokenType': ':'},
            {'line': 1, 'col': 12, 'tokenType': 'IDENT', 'value':
             'link'},
            {'line': 1, 'col': 16, 'tokenType': 'EOF_TOKEN'}], 'isClass':
           true, 'node': 'PSEUDO_SELECTOR'}], 'typeSelector':
         {'line': 1, 'col': 0, 'elementName': '*', 'namespacePrefix':
          'html', 'node': 'TYPE_SELECTOR'}},
        selector);
  });

  it('reports error for unparsed remainder of input', () => {
    const tokens = parseSelectorForTest('foo bar .');
    assertJSONEquals(
        [{'line': 1, 'col': 0, 'tokenType': 'IDENT', 'value': 'foo'},
         {'line': 1, 'col': 3, 'tokenType': 'WHITESPACE'},
         {'line': 1, 'col': 4, 'tokenType': 'IDENT', 'value': 'bar'},
         {'line': 1, 'col': 7, 'tokenType': 'WHITESPACE'},
         {'line': 1, 'col': 8, 'tokenType': 'DELIM', 'value': '.'},
         {'line': 1, 'col': 9, 'tokenType': 'EOF_TOKEN'}], tokens);
    const tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    const errors = [];
    const selector = css_selectors.parse(tokenStream, errors);
    assertStrictEqual(null, selector);
    assertStrictEqual(
        ':1:8 SELECTORS - no selector found\n' +
            ':1:8 SELECTORS - unparsed input remains',
        errorsToString(errors));
  });

  it('implements visitor pattern', () => {
    class CollectCombinatorNodes extends css_selectors.NodeVisitor {
      constructor() {
        this.combinatorNodes = [];
      }

      /** @override */
      visitCombinator(combinator) {
        this.combinatorNodes.push(combinator);
      }
    }
    const tokens = parseSelectorForTest('a > b c + d ~ e');
    const tokenStream = new parse_css.TokenStream(tokens);
    tokenStream.consume();
    const errors = [];
    const maybeSelector = css_selectors.parse(tokenStream, errors);
    const visitor = new CollectCombinatorNodes();
    assertStrictEqual(false, maybeSelector === null);
    const selector =
        /** @type {!css_selectors.SelectorNode} */ (maybeSelector);
    css_selectors.traverse(selector, visitor);
    assertStrictEqual(4, visitor.combinatorNodes.length);
    assertStrictEqual('GENERAL_SIBLING',
                      visitor.combinatorNodes[0].combinatorType);
    assertStrictEqual(1, visitor.combinatorNodes[0].line);
    assertStrictEqual(12, visitor.combinatorNodes[0].col);

    // The combinator #2 is the (in)famous whitespace operator.
    assertJSONEquals(
        {'line': 1, 'col': 5, 'combinatorType': 'DESCENDANT', 'left':
         {'line': 1, 'col': 2, 'combinatorType': 'CHILD', 'left':
          {'line': 1, 'col': 0, 'node': 'SIMPLE_SELECTOR_SEQUENCE',
           'otherSelectors':
           [], 'typeSelector':
           {'line': 1, 'col': 0, 'elementName': 'a', 'namespacePrefix':
            null, 'node': 'TYPE_SELECTOR'}}, 'node': 'COMBINATOR',
          'right':
          {'line': 1, 'col': 4, 'node': 'SIMPLE_SELECTOR_SEQUENCE',
           'otherSelectors':
           [], 'typeSelector':
           {'line': 1, 'col': 4, 'elementName': 'b', 'namespacePrefix':
            null, 'node': 'TYPE_SELECTOR'}}}, 'node': 'COMBINATOR',
         'right':
         {'line': 1, 'col': 6, 'node': 'SIMPLE_SELECTOR_SEQUENCE',
          'otherSelectors':
          [], 'typeSelector':
          {'line': 1, 'col': 6, 'elementName': 'c', 'namespacePrefix':
           null, 'node': 'TYPE_SELECTOR'}}},
        visitor.combinatorNodes[2]);
  });
});
