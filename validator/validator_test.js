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
goog.require('amp.validator.validateString');
goog.require('amp.validator.renderValidationResult');
goog.provide('amp.validator.ValidatorTest');

/**
 * Returns the absolute path for a given test file, that is, a file
 * underneath a testdata directory. E.g., 'foo/bar/testdata/baz.html' =>
 * 'baz.html'.
 * @param {!string} testFile
 * @return {!string}
 */
function absolutePathFor(testFile) {
  for (const dir of process.env['TESTDATA_DIRS'].split(':')) {
    const candidate = path.join(dir, testFile);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  goog.asserts.fail('Could not find ' + testFile);
}

/**
 * Returns all html files underneath the testdata directories. This does
 * not traverse the directories recursively but only one level deep
 * (e.g., it will find the 'feature_tests' subdir and the .html files inside it.
 * @return {!Array<!string>}
 */
function findHtmlFilesRelativeToTestdata() {
  const testFiles = [];
  for (const dir of process.env['TESTDATA_DIRS'].split(':')) {
    for (const subdir of /** @type {!Array<!string>} */(
        fs.readdirSync(path.join(dir)))) {
      for (const candidate of /** @type {!Array<!string>} */(
          fs.readdirSync(path.join(dir, subdir)))) {
        if (candidate.match(/^.*.html/g)) {
          testFiles.push(path.join(subdir, candidate));
        }
      }
    }
  }
  return testFiles;
}

/**
 * An AMP Validator test case. This constructor will load the AMP HTML file
 * and also find the adjacent .out file.
 * @constructor
 */
const ValidatorTestCase = function(ampHtmlFile) {
  /** @type {!string} */
  this.name = ampHtmlFile;
  /** @type {!string} */
  this.ampHtmlFile = ampHtmlFile;
  /**
   * This field can be null, indicating that the expectedOutput did not
   * come from a file.
   * @type {?string}
   */
  this.expectedOutputFile = path.join(
      path.dirname(ampHtmlFile), path.basename(ampHtmlFile, '.html') + '.out');
  /** @type {!string} */
  this.ampHtmlFileContents = fs.readFileSync(
      absolutePathFor(this.ampHtmlFile), 'utf8');
  /** @type {!string} */
  this.expectedOutput = fs.readFileSync(
      absolutePathFor(this.expectedOutputFile), 'utf8').trim();
};

/**
 * Runs the test, by executing the AMP Validator, then comparing its output
 * against the golden file content.
 */
ValidatorTestCase.prototype.run = function() {
  const results = amp.validator.validateString(this.ampHtmlFileContents);
  const observed = amp.validator.renderValidationResult(
      results, this.ampHtmlFile).join('\n');
  if (observed === this.expectedOutput) {
    return;
  }
  let message = '';
  if (this.expectedOutputFile != null) {
    message = '\n' + this.expectedOutputFile + ':1:0\n';
  }
  message += 'expected:\n' + this.expectedOutput + '\nsaw:\n' + observed;
  assert.fail('', '', message, '');
};

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

describe('ValidatorFeatures', () => {
  for (const htmlFile of findHtmlFilesRelativeToTestdata()) {
    const test = new ValidatorTestCase(htmlFile);
    it(test.name, () => { test.run(); });
  }
});

describe('ValidatorCssLengthValidation', () => {
  // Rather than encoding some really long author stylesheets in
  // testcases, which would be difficult to read/verify that the
  // testcase is valid, we modify a valid testcase
  // (features/css_length.html) designed for this purpose in code.

  // We use a blob of length 10 (both bytes and chars) to make it easy to
  // construct stylesheets of any length that we want.
  const validStyleBlob = 'h1 {a: b}\n';
  assertStrictEqual(10, validStyleBlob.length);

  it('accepts max bytes with exactly 50000 bytes in author stylesheet', () => {
    const maxBytes = Array(5001).join(validStyleBlob);
    assertStrictEqual(50000, maxBytes.length);

    const test = new ValidatorTestCase('feature_tests/css_length.html');
    test.ampHtmlFileContents = test.ampHtmlFileContents.replace(
        '.replaceme {}', maxBytes);
  });

  it('will not accept 50001 bytes in author stylesheet - one too many', () => {
    const oneTooMany = Array(5001).join(validStyleBlob) + ' ';
    assertStrictEqual(50001, oneTooMany.length);
    const test = new ValidatorTestCase('feature_tests/css_length.html');
    test.ampHtmlFileContents = test.ampHtmlFileContents.replace(
        '.replaceme {}', oneTooMany);
    test.expectedOutputFile = null;
    test.expectedOutput =
        'FAIL\n' +
        'feature_tests/css_length.html:28:2 STYLESHEET_TOO_LONG ' +
        'seen: 50001 bytes, limit: 50000 bytes ' +
        '(see https://github.com/ampproject/amphtml/blob/master/spec/' +
        'amp-html-format.md#maximum-size)';
  });

  it('knows utf8 and rejects file w/ 50002 bytes but 49999 characters', () => {
    const multiByteSheet = Array(5000).join(validStyleBlob) + 'h {a: 😺}';
    assertStrictEqual(49999, multiByteSheet.length);  // character length
    const test = new ValidatorTestCase('feature_tests/css_length.html');
    test.ampHtmlFileContents = test.ampHtmlFileContents.replace(
        '.replaceme {}', multiByteSheet);
    test.expectedOutputFile = null;
    test.expectedOutput =
        'FAIL\n' +
        'feature_tests/css_length.html:28:2 STYLESHEET_TOO_LONG ' +
        'seen: 50002 bytes, limit: 50000 bytes ' +
        '(see https://github.com/ampproject/amphtml/blob/master/spec/' +
        'amp-html-format.md#maximum-size)';
  });
});
