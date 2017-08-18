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
goog.provide('amp.validator.ValidatorTest');
goog.require('amp.htmlparser.HtmlParser');
goog.require('amp.validator.CssLength');
goog.require('amp.validator.ValidationHandler');

/**
 * Returns the absolute path for a given test file, that is, a file
 * underneath a testdata directory. E.g., 'foo/bar/testdata/baz.html' =>
 * 'baz.html'.
 * @param {string} testFile
 * @return {string}
 */
function absolutePathFor(testFile) {
  for (const dir of process.env['TESTDATA_ROOTS'].split(':')) {
    const candidate = path.join(dir, testFile);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  goog.asserts.fail('Could not find ' + testFile);
}

/**
 * @param {string} dir
 * @return {!Array<string>}
 */
function readdir(dir) {
  const files = fs.readdirSync(dir);
  goog.asserts.assert(files != null, 'problem reading ' + dir);
  return files;
}

/**
 * @param {string} dir
 * @return {boolean}
 */
function isdir(dir) {
  try {
    return fs.lstatSync(dir).isDirectory();
  } catch (e) {
    return false;  // If there's neither a file nor a directory.
  }
}

/**
 * Returns all html files underneath the testdata roots. This looks
 * both for feature_tests/*.html and for tests in extension directories.
 * E.g.: extensions/amp-accordion/0.1/test/*.html,
 *       extensions/amp-sidebar/1.0/test/*.html, and
 *       testdata/feature_tests/amp_accordion.html.
 * @return {!Array<string>}
 */
function findHtmlFilesRelativeToTestdata() {
  const testSubdirs = [];
  for (const root of process.env['TESTDATA_ROOTS'].split(':')) {
    if (path.basename(root) === 'extensions') {
      for (const extension of readdir(root)) {
        const extensionFolder = path.join(root, extension);
        if (!isdir(extensionFolder)) {
          // Skip if not a folder
          continue;
        }
        // Get all versions
        for (const possibleVersion of readdir(extensionFolder)) {
          const testPath = path.join(extension, possibleVersion, 'test');
          if (isdir(path.join(root, testPath))) {
            testSubdirs.push({root: root, subdir: testPath});
          }
        }
      }
    } else {
      for (const subdir of readdir(root)) {
        testSubdirs.push({root: root, subdir: subdir});
      }
    }
  }
  const testFiles = [];
  for (const entry of testSubdirs) {
    for (const candidate of readdir(path.join(entry.root, entry.subdir))) {
      // TODO(gregable): Remove this hack once the js validator knows how
      // to validate A4A documents.
      if (candidate.match(/^.*.html/g) &&
          !entry.subdir.match(/amp4ads_feature_tests/g)) {
        testFiles.push(path.join(entry.subdir, candidate));
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
  /** @type {string} */
  this.name = ampHtmlFile;
  /** @type {string} */
  this.ampHtmlFile = ampHtmlFile;
  /** @type {string} */
  this.ampUrl = opt_ampUrl || ampHtmlFile;
  /**
   * This field can be null, indicating that the expectedOutput did not
   * come from a file.
   * @type {?string}
   */
  this.expectedOutputFile = path.join(
      path.dirname(ampHtmlFile), path.basename(ampHtmlFile, '.html') + '.out');
  /** @type {string} */
  this.ampHtmlFileContents =
      fs.readFileSync(absolutePathFor(this.ampHtmlFile), 'utf8');
  /** @type {string} */
  this.expectedOutput =
      fs.readFileSync(absolutePathFor(this.expectedOutputFile), 'utf8')
          .split('\n')[0];
};

/**
 * Essentially a copy of amp.validator.validateString, which the
 * validator-light does not include. Testing domwalker.js will be done
 * in a different manner.
 * @param {string} inputDocContents
 * @return {!amp.validator.ValidationResult} Validation Result
 */
function validateString(inputDocContents) {
  goog.asserts.assertString(inputDocContents, 'Input doc is not a string');

  const handler = new amp.validator.ValidationHandler('AMP');
  const parser = new amp.htmlparser.HtmlParser();
  parser.parse(handler, inputDocContents);

  return handler.Result();
}

/**
 * Runs the test, by executing the AMP Validator, then comparing its output
 * against the golden file content.
 */
ValidatorTestCase.prototype.run = function() {
  const code = validateString(this.ampHtmlFileContents).status;
  const observedStatus =
      ['UNKNOWN', 'PASS', 'FAIL'][/** @type {number} */ (code)];
  if (observedStatus === this.expectedOutput) {
    return;
  }
  let message = '';
  if (this.expectedOutputFile != null) {
    message = '\n' + this.expectedOutputFile + ':1:0\n';
  }
  message += 'expected:\n' + this.expectedOutput + '\nsaw:\n' + observedStatus;
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
    test.ampHtmlFileContents =
        test.ampHtmlFileContents.replace('.replaceme {}', maxBytes);
    test.run();
  });

  it('will not accept 50001 bytes in author stylesheet - one too many', () => {
    const oneTooMany = Array(5001).join(validStyleBlob) + ' ';
    assertStrictEqual(50001, oneTooMany.length);
    const test = new ValidatorTestCase('feature_tests/css_length.html');
    test.ampHtmlFileContents =
        test.ampHtmlFileContents.replace('.replaceme {}', oneTooMany);
    test.expectedOutputFile = null;
    test.expectedOutput = 'FAIL';
    test.run();
  });

  it('knows utf8 and rejects file w/ 50002 bytes but 49999 characters', () => {
    const multiByteSheet = Array(5000).join(validStyleBlob) + 'h {a: 😺}';
    assertStrictEqual(49999, multiByteSheet.length);  // character length
    const test = new ValidatorTestCase('feature_tests/css_length.html');
    test.ampHtmlFileContents =
        test.ampHtmlFileContents.replace('.replaceme {}', multiByteSheet);
    test.expectedOutputFile = null;
    test.expectedOutput = 'FAIL';
    test.run();
  });
});

describe('CssLength', () => {
  it('parses a basic example', () => {
    const parsed =
        new amp.validator.CssLength('10.1em', /* allowAuto */ false);
    expect(parsed.isSet).toBe(true);
    expect(parsed.isValid).toBe(true);
    expect(parsed.numeral).toEqual(10.1);
    expect(parsed.unit).toEqual('em');
    expect(parsed.isAuto).toBe(false);
  });

  it('supports several units', () => {
    for (const allowedUnit of ['px', 'em', 'rem', 'vh', 'vmin', 'vmax']) {
      const example = '10' + allowedUnit;
      const parsed =
          new amp.validator.CssLength(example, /* allowAuto */ false);
      expect(parsed.isSet).toBe(true);
      expect(parsed.isValid).toBe(true);
      expect(parsed.numeral).toEqual(10);
      expect(parsed.unit).toEqual(allowedUnit);
      expect(parsed.isAuto).toBe(false);
    }
  });

  it('understands empty unit as "px"', () => {
    const parsed =
        new amp.validator.CssLength('10', /* allowAuto */ false);
    expect(parsed.isSet).toBe(true);
    expect(parsed.isValid).toBe(true);
    expect(parsed.numeral).toEqual(10);
    expect(parsed.unit).toEqual('px');
    expect(parsed.isAuto).toBe(false);
  });

  it('understands undefined input as valid (means attr is not set)', () => {
    const parsed =
        new amp.validator.CssLength(undefined, /* allowAuto */ false);
    expect(parsed.isSet).toBe(false);
    expect(parsed.isValid).toBe(true);
    expect(parsed.unit).toEqual('px');
    expect(parsed.isAuto).toBe(false);
  });

  it('understands empty string as invalid (means attr value is empty)', () => {
    const parsed =
        new amp.validator.CssLength('', /* allowAuto */ false);
    expect(parsed.isValid).toBe(false);
  });

  it('considers other garbage as invalid', () => {
    expect(new amp.validator.CssLength('100%', /* allowAuto */ false)
               .isValid)
        .toBe(false);
    expect(new amp.validator
               .CssLength('not a number', /* allowAuto */ false)
               .isValid)
        .toBe(false);
    expect(new amp.validator.CssLength('1.1.1', /* allowAuto */ false)
               .isValid)
        .toBe(false);
    expect(new amp.validator.CssLength('5 inches', /* allowAuto */ false)
               .isValid)
        .toBe(false);
    expect(
        new amp.validator.CssLength('fahrenheit', /* allowAuto */ false)
            .isValid)
        .toBe(false);
    expect(
        new amp.validator.CssLength('px', /* allowAuto */ false).isValid)
        .toBe(false);
    expect(new amp.validator
               .CssLength(  // screen size in ancient Rome.
                   'ix unciae', /* allowAuto */ false)
               .isValid)
        .toBe(false);
  });

  it('recongizes auto if allowed', () => {
    {// allow_auto = false with input != auto
     const parsed =
         new amp.validator.CssLength('1', /* allowAuto */ false);
     expect(parsed.isValid).toBe(true); expect(parsed.isAuto).toBe(false);} {
        // allow_auto = true with input == auto
        const parsed =
            new amp.validator.CssLength('1', /* allowAuto */ true);
        expect(parsed.isValid).toBe(true); expect(parsed.isAuto).toBe(false);} {
        // allow_auto = false with input = auto
        const parsed =
            new amp.validator.CssLength('auto', /* allowAuto */ false);
        expect(parsed.isValid).toBe(false);} {
        // allow_auto = true with input = auto
        const parsed =
            new amp.validator.CssLength('auto', /* allowAuto */ true);
        expect(parsed.isValid).toBe(true); expect(parsed.isAuto).toBe(true);}
  });
});
