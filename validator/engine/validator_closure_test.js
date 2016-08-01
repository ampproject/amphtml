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
 */
goog.require('amp.validator.Terminal');
goog.require('amp.validator.ValidationError');
goog.require('amp.validator.ValidationResult');
goog.require('goog.testing.jsunit');

/** @export */ function testPassYieldsSuccessMessage() {
  var result = new amp.validator.ValidationResult();
  result.status = amp.validator.ValidationResult.Status.PASS;
  var out = [];
  var terminal = new amp.validator.Terminal(out);
  result.outputToTerminal('http://test', terminal);
  assertEquals('I: AMP validation successful.', out.join('\n'));

  // The category filter makes no difference if the validation was successful.
  out = [];
  terminal = new amp.validator.Terminal(out);
  result.outputToTerminal(
      'http://test', terminal,
      /*opt_errorCategoryFilter*/ 'AMP_LAYOUT_PROBLEM');
  assertEquals('I: AMP validation successful.', out.join('\n'));
}

/** @return {!amp.validator.ValidationResult} */
function exampleValidationResult() {
  var result = new amp.validator.ValidationResult();
  result.status = amp.validator.ValidationResult.Status.FAIL;

  var error = new amp.validator.ValidationError();
  error.severity = amp.validator.ValidationError.Severity.ERROR;
  error.code = amp.validator.ValidationError.Code.DISALLOWED_TAG;
  error.line = 1;
  error.col = 0;
  error.params = ['disallowed-tag'];
  result.errors.push(error);

  error = new amp.validator.ValidationError();
  error.severity = amp.validator.ValidationError.Severity.WARNING;
  error.code = amp.validator.ValidationError.Code.DEPRECATED_TAG;
  error.line = 10;
  error.col = 4;
  error.params = ['old-tag', 'new-tag'];
  result.errors.push(error);

  error = new amp.validator.ValidationError();
  error.severity = amp.validator.ValidationError.Severity.ERROR;
  error.code = amp.validator.ValidationError.Code.STYLESHEET_TOO_LONG;
  error.line = 12;
  error.col = 4;
  error.params = ['author stylesheet', '60000', '50000'];
  result.errors.push(error);

  error = new amp.validator.ValidationError();
  error.severity = amp.validator.ValidationError.Severity.ERROR;
  error.code = amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_AT_RULE;
  error.line = 12;
  error.col = 4;
  error.params = ['author stylesheet', 'notallowed'];
  result.errors.push(error);
  return result;
}

/** @export */ function testWithErrorsAndWarnings() {
  var result = exampleValidationResult();
  var out = [];
  var terminal = new amp.validator.Terminal(out);
  result.outputToTerminal('http://test', terminal);
  assertEquals(
      'E: AMP validation had errors:\n' +
          'E: http://test:1:0 The tag \'disallowed-tag\' is disallowed.\n' +
          'W: http://test:10:4 The tag \'old-tag\' is deprecated - ' +
          'use \'new-tag\' instead.\n' +
          'E: http://test:12:4 The author stylesheet specified in tag ' +
          '\'author stylesheet\' is too long - we saw 60000 bytes whereas ' +
          'the limit is 50000 bytes.\n' +
          'E: http://test:12:4 CSS syntax error in tag \'author stylesheet\' - ' +
          'saw invalid at rule \'@notallowed\'.\n' +
          'I: See also https://validator.ampproject.org/#url=http%3A%2F%2Ftest',
      out.join('\n'));
}

/** @export */ function testWithErrorCategoryFilterSomethingMatches() {
  var result = exampleValidationResult();
  var out = [];
  var terminal = new amp.validator.Terminal(out);
  result.outputToTerminal(
      'http://test', terminal,
      /*opt_errorCategoryFilter*/ 'AUTHOR_STYLESHEET_PROBLEM');
  assertEquals(
      'E: AMP validation - displaying errors matching ' +
          'filter=AUTHOR_STYLESHEET_PROBLEM. To see all ' +
          'errors, visit http://test#development=1\n' +
          'E: http://test:12:4 The author stylesheet specified in tag ' +
          '\'author stylesheet\' is too long - we saw 60000 bytes whereas ' +
          'the limit is 50000 bytes.',
      out.join('\n'));
}


/** @export */ function testWithErrorCategoryFilterNothingMatches() {
  var result = exampleValidationResult();
  var out = [];
  var terminal = new amp.validator.Terminal(out);
  result.outputToTerminal(
      'http://test', terminal,
      /*opt_errorCategoryFilter*/ 'AMP_LAYOUT_PROBLEM');
  assertEquals(
      'E: AMP validation - no errors matching ' +
          'filter=AMP_LAYOUT_PROBLEM found. To see all ' +
          'errors, visit http://test#development=1',
      out.join('\n'));
}
