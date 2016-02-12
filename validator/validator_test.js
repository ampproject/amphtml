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
const ValidatorTestCase = function(ampHtmlFile, opt_ampUrl) {
  /** @type {!string} */
  this.name = ampHtmlFile;
  /** @type {!string} */
  this.ampHtmlFile = ampHtmlFile;
  /** @type {!string} */
  this.ampUrl = opt_ampUrl || ampHtmlFile;
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
  amp.validator.annotateWithErrorCategories(results);
  const observed = amp.validator.renderValidationResult(
      results, this.ampUrl).join('\n');
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

describe('ValidatorOutput', () => {
  // What's tested here is that if a URL with #development=1 is passed
  // (or any other hash), the validator output won't include the hash.
  it('produces expected output with hash in the URL', () => {
    const test = new ValidatorTestCase('feature_tests/no_custom_js.html',
        'http://google.com/foo.html#development=1');
    test.expectedOutputFile = null;
    test.expectedOutput =
        'FAIL\n' +
        'http://google.com/foo.html:28:3 The attribute \'src\' in tag ' +
        '\'amphtml engine v0.js script\' is set to the invalid value ' +
        '\'https://example.com/v0-not-allowed.js\'. ' +
        '(see https://github.com/ampproject/amphtml/blob/master/spec/' +
        'amp-html-format.md#scrpt) [CUSTOM_JAVASCRIPT_DISALLOWED]\n' +
        'http://google.com/foo.html:29:3 '+
        'The attribute \'custom-element\' ' +
        'in tag \'amp-access extension .js script\' is set to the invalid ' +
        'value \'amp-foo\'. ' +
        '(see https://github.com/ampproject/amphtml/blob/master/extensions/' +
        'amp-access/amp-access.md) [AMP_TAG_PROBLEM]';
    test.run();
  });
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
    test.run();
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
        'feature_tests/css_length.html:28:2 The author stylesheet specified ' +
        'in tag \'style\' is too long - we saw 50001 bytes whereas the ' +
        'limit is 50000 bytes. (see https://github.com/ampproject/amphtml/' +
        'blob/master/spec/amp-html-format.md#maximum-size) ' +
        '[AUTHOR_STYLESHEET_PROBLEM]';
    test.run();
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
        'feature_tests/css_length.html:28:2 The author stylesheet specified ' +
        'in tag \'style\' is too long - we saw 50002 bytes whereas the limit ' +
        'is 50000 bytes. (see https://github.com/ampproject/amphtml/blob/' +
        'master/spec/amp-html-format.md#maximum-size) ' +
        '[AUTHOR_STYLESHEET_PROBLEM]';
    test.run();
  });
});

describe('CssLengthAndUnit', () => {
  it('parses a basic example', () => {
    const parsed = new amp.validator.CssLengthAndUnit(
        '10.1em', /* allowAuto */ false);
    expect(parsed.isSet).toBe(true);
    expect(parsed.isValid).toBe(true);
    expect(parsed.unit).toEqual('em');
    expect(parsed.isAuto).toBe(false);
  });

  it('supports several units', () => {
    for (const allowedUnit of ['px', 'em', 'rem', 'vh', 'vmin', 'vmax']) {
      const example = '10' + allowedUnit;
      const parsed = new amp.validator.CssLengthAndUnit(
          example, /* allowAuto */ false);
      expect(parsed.isSet).toBe(true);
      expect(parsed.isValid).toBe(true);
      expect(parsed.unit).toEqual(allowedUnit);
      expect(parsed.isAuto).toBe(false);
    }
  });

  it('understands empty unit as "px"', () => {
    const parsed = new amp.validator.CssLengthAndUnit(
        '10', /* allowAuto */ false);
    expect(parsed.isSet).toBe(true);
    expect(parsed.isValid).toBe(true);
    expect(parsed.unit).toEqual('px');
    expect(parsed.isAuto).toBe(false);
  });

  it('understands undefined input as valid (means attr is not set)', () => {
    const parsed = new amp.validator.CssLengthAndUnit(
        undefined, /* allowAuto */ false);
    expect(parsed.isSet).toBe(false);
    expect(parsed.isValid).toBe(true);
    expect(parsed.unit).toEqual('px');
    expect(parsed.isAuto).toBe(false);
  });

  it('understands empty string as invalid (means attr value is empty)', () => {
    const parsed = new amp.validator.CssLengthAndUnit(
        "", /* allowAuto */ false);
    expect(parsed.isValid).toBe(false);
  });

  it('considers other garbage as invalid', () => {
    expect(new amp.validator.CssLengthAndUnit(
        '100%', /* allowAuto */ false).isValid).toBe(false);
    expect(new amp.validator.CssLengthAndUnit(
        'not a number', /* allowAuto */ false).isValid).toBe(false);
    expect(new amp.validator.CssLengthAndUnit(
        '1.1.1', /* allowAuto */ false).isValid).toBe(false);
    expect(new amp.validator.CssLengthAndUnit(
        '5 inches', /* allowAuto */ false).isValid).toBe(false);
    expect(new amp.validator.CssLengthAndUnit(
        'fahrenheit', /* allowAuto */ false).isValid).toBe(false);
    expect(new amp.validator.CssLengthAndUnit(
        'px', /* allowAuto */ false).isValid).toBe(false);
    expect(new amp.validator.CssLengthAndUnit(  // screen size in ancient Rome.
        'ix unciae', /* allowAuto */ false).isValid).toBe(false);
  });

  it('recongizes auto if allowed', () => {
    {  // allow_auto = false with input != auto
      const parsed = new amp.validator.CssLengthAndUnit(
          "1", /* allowAuto */ false);
      expect(parsed.isValid).toBe(true);
      expect(parsed.isAuto).toBe(false);
    }
    {  // allow_auto = true with input == auto
      const parsed = new amp.validator.CssLengthAndUnit(
          "1", /* allowAuto */ true);
      expect(parsed.isValid).toBe(true);
      expect(parsed.isAuto).toBe(false);
    }
    {  // allow_auto = false with input = auto
      const parsed = new amp.validator.CssLengthAndUnit(
          "auto", /* allowAuto */ false);
      expect(parsed.isValid).toBe(false);
    }
    {  // allow_auto = true with input = auto
      const parsed = new amp.validator.CssLengthAndUnit(
          "auto", /* allowAuto */ true);
      expect(parsed.isValid).toBe(true);
      expect(parsed.isAuto).toBe(true);
    }
  });
});
