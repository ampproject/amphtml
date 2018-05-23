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
goog.provide('amp.validator.ValidatorTest');

goog.require('amp.validator.CssLength');
goog.require('amp.validator.ValidationError');
goog.require('amp.validator.annotateWithErrorCategories');
goog.require('amp.validator.renderErrorMessage');
goog.require('amp.validator.renderValidationResult');
goog.require('amp.validator.validateString');
goog.require('goog.uri.utils');

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
    return false; // If there's neither a file nor a directory.
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
            testSubdirs.push({root, subdir: testPath});
          }
        }
      }
    } else {
      for (const subdir of readdir(root)) {
        testSubdirs.push({root, subdir});
      }
    }
  }
  const testFiles = [];
  for (const entry of testSubdirs) {
    for (const candidate of readdir(path.join(entry.root, entry.subdir))) {
      if (candidate.match(/^.*.html/g)) {
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
 * @param {string} ampHtmlFile
 * @param {string=} opt_ampUrl
 */
const ValidatorTestCase = function(ampHtmlFile, opt_ampUrl) {
  /** @type {string} */
  this.name = ampHtmlFile;
  /** @type {string} */
  this.ampHtmlFile = ampHtmlFile;
  /** @type {string} */
  this.ampUrl = opt_ampUrl || ampHtmlFile;
  /** @type {string} */
  this.htmlFormat = 'AMP';
  if (this.ampHtmlFile.indexOf('amp4ads_feature_tests/') != -1 ||
      this.ampHtmlFile.indexOf('/validator-amp4ads-') != -1) {
    this.htmlFormat = 'AMP4ADS';
  }
  if (this.ampHtmlFile.indexOf('amp4email_feature_tests/') != -1 ||
      this.ampHtmlFile.indexOf('/validator-amp4email-') != -1) {
    this.htmlFormat = 'AMP4EMAIL';
  }
  /**
   * If set to false, output will be generated without inlining the input
   * document.
   * @type {boolean}
   */
  this.inlineOutput = true;
  /**
   * This field can be null, indicating that the expectedOutput did not
   * come from a file.
   * @type {?string}
   */
  this.expectedOutputFile = path.join(
      path.dirname(ampHtmlFile), path.basename(ampHtmlFile, '.html') + '.out');
  /** @type {string} */
  this.ampHtmlFileContents =
      fs.readFileSync(absolutePathFor(this.ampHtmlFile), 'utf8').trim();

  // In the update_tests case, this file may not exist.
  const fullOutputFile = path.join(
      path.dirname(absolutePathFor(this.ampHtmlFile)),
      path.basename(ampHtmlFile, '.html') + '.out');
  /** @type {string} */
  this.expectedOutput;
  try {
    this.expectedOutput = fs.readFileSync(fullOutputFile, 'utf8').trim();
  } catch (err) {
    // If the file doesn't exist and we're trying to update the file, create it.
    if (process.env['UPDATE_VALIDATOR_TEST'] === '1') {
      fs.writeFileSync(fullOutputFile, '');
    } else {
      throw err;
    }
  }
};

/**
 * Renders one line of error output.
 * @param {string} filenameOrUrl
 * @param {!amp.validator.ValidationError} error
 * @return {string}
 */
function renderErrorWithPosition(filenameOrUrl, error) {
  const line = error.line || 1;
  const col = error.col || 0;

  let errorLine = goog.uri.utils.removeFragment(filenameOrUrl) + ':' + line +
      ':' + col + ' ';
  errorLine += amp.validator.renderErrorMessage(error);
  if (error.specUrl) {
    errorLine += ' (see ' + error.specUrl + ')';
  }
  if (error.category !== null) {
    errorLine += ' [' + error.category + ']';
  }
  return errorLine;
}

/**
 * Like amp.validator.renderValidationResult, except inlines any error messages
 * into the input document.
 * @param {!Object} validationResult
 * @param {string} filename to use in rendering error messages.
 * @param {string} filecontents
 * @return {string}
 */
function renderInlineResult(validationResult, filename, filecontents) {
  let rendered = '';
  rendered += validationResult.status;

  const lines = filecontents.split('\n');
  let linesEmitted = 0;
  for (const error of validationResult.errors) {
    // Emit all input lines up to and including the line containing the error,
    // prefixed with '|  '.
    while (linesEmitted < error.line && linesEmitted < lines.length) {
      rendered += '\n|  ' + lines[linesEmitted++];
    }
    // Emit a carat showing the column of the following error.
    rendered += '\n>>';
    for (let i = 0; i < error.col + 1; ++i)
    {rendered += ' ';}
    rendered += '^~~~~~~~~\n';
    rendered += renderErrorWithPosition(filename, error);
  }
  while (linesEmitted < lines.length) {
    rendered += '\n|  ' + lines[linesEmitted++];
  }
  return rendered;
}

/**
 * Runs the test, by executing the AMP Validator, then comparing its output
 * against the golden file content.
 */
ValidatorTestCase.prototype.run = function() {
  const results =
      amp.validator.validateString(this.ampHtmlFileContents, this.htmlFormat);
  amp.validator.annotateWithErrorCategories(results);
  const observed = this.inlineOutput ?
    renderInlineResult(results, this.ampUrl, this.ampHtmlFileContents) :
    amp.validator.renderValidationResult(results, this.ampUrl).join('\n');

  if (observed === this.expectedOutput) {
    return;
  }
  if (process.env['UPDATE_VALIDATOR_TEST'] === '1') {
    if (this.expectedOutputFile !== null) {
      console/*OK*/.log('Updating ' + this.expectedOutputFile + ' ...');
      fs.writeFileSync(absolutePathFor(this.expectedOutputFile), observed);
    }
    return;
  }
  let message = '';
  if (this.expectedOutputFile !== null) {
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
 * @param {*} expected
 * @param {*} saw
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
  if (process.env['UPDATE_VALIDATOR_TEST'] === '1') { return; }
  // What's tested here is that if a URL with #development=1 is passed
  // (or any other hash), the validator output won't include the hash.
  it('produces expected output with hash in the URL', () => {
    const test = new ValidatorTestCase(
        'feature_tests/no_custom_js.html',
        'http://google.com/foo.html#development=1');
    const results =
        amp.validator.validateString(test.ampHtmlFileContents, test.htmlFormat);
    amp.validator.annotateWithErrorCategories(results);
    const observed =
        amp.validator.renderValidationResult(results, test.ampUrl).join('\n');
    const expectedSubstr = 'http://google.com/foo.html:28:3';
    if (observed.indexOf(expectedSubstr) === -1)
    {assert.fail(
        '', '', 'expectedSubstr:\n' + expectedSubstr +
          '\nsaw:\n' + observed, '');}
  });
});

describe('ValidatorCssLengthValidation', () => {
  if (process.env['UPDATE_VALIDATOR_TEST'] === '1') { return; }
  // Rather than encoding some really long author stylesheets in
  // testcases, which would be difficult to read/verify that the
  // testcase is valid, we modify a valid testcase
  // (features/css_length.html) designed for this purpose in code.

  // We use a blob of length 10 (both bytes and chars) to make it easy to
  // construct stylesheets of any length that we want.
  const validStyleBlob = 'h1 {a: b}\n';
  assertStrictEqual(10, validStyleBlob.length);
  const validInlineStyleBlob = 'width:1px;';
  assertStrictEqual(10, validInlineStyleBlob.length);

  it('accepts 50000 bytes in author stylesheet and 0 bytes in inline style', () => {
    const stylesheet = Array(5001).join(validStyleBlob);
    assertStrictEqual(50000, stylesheet.length);
    const test = new ValidatorTestCase('feature_tests/css_length.html');
    test.inlineOutput = false;
    test.ampHtmlFileContents =
        test.ampHtmlFileContents.replace('.replace_amp_custom {}', stylesheet)
            .replace('replace_inline_style', '');
    // TODO(honeybadgerdontcare): Once inline style is allowed, update test.
    test.expectedOutput = 'FAIL\n' +
        'feature_tests/css_length.html:5034:0 The inline \'style\' attribute ' +
        'is not allowed in AMP documents. Use \'style amp-custom\' tag ' +
        'instead. (see https://www.ampproject.org/docs/guides/author-develop/' +
        'responsive/style_pages) [AUTHOR_STYLESHEET_PROBLEM]';
    test.run();
  });

  it('will not accept 50001 bytes in author stylesheet and 0 bytes in inline style',
      () => {
        const stylesheet = Array(5001).join(validStyleBlob) + ' ';
        assertStrictEqual(50001, stylesheet.length);
        const test = new ValidatorTestCase('feature_tests/css_length.html');
        test.inlineOutput = false;
        test.ampHtmlFileContents =
           test.ampHtmlFileContents
               .replace('.replace_amp_custom {}', stylesheet)
               .replace('replace_inline_style', '');
        test.expectedOutputFile = null;
        // TODO(honeybadgerdontcare): Once inline style is allowed, update test.
        test.expectedOutput = 'FAIL\n' +
           'feature_tests/css_length.html:28:2 The author stylesheet ' +
           'specified in tag \'style amp-custom\' is too long - we saw ' +
           '50001 bytes whereas the limit is 50000 bytes. ' +
           '(see https://www.ampproject.org/docs/reference/spec' +
           '#maximum-size) [AUTHOR_STYLESHEET_PROBLEM]\n' +
           'feature_tests/css_length.html:5034:0 The inline \'style\' ' +
           'attribute is not allowed in AMP documents. Use \'style ' +
           'amp-custom\' tag instead. (see https://www.ampproject.org/' +
           'docs/guides/author-develop/responsive/style_pages) ' +
           '[AUTHOR_STYLESHEET_PROBLEM]';
        test.run();
      });

  it('knows utf8 and rejects file with 50002 bytes but 49999 characters and 0 bytes in inline style',
      () => {
        const stylesheet = Array(5000).join(validStyleBlob) + 'h {a: 😺}';
        assertStrictEqual(49999, stylesheet.length); // character length
        const test = new ValidatorTestCase('feature_tests/css_length.html');
        test.inlineOutput = false;
        test.ampHtmlFileContents =
           test.ampHtmlFileContents
               .replace('.replace_amp_custom {}', stylesheet)
               .replace('replace_inline_style', '');
        test.expectedOutputFile = null;
        // TODO(honeybadgerdontcare): Once inline style is allowed, update test.
        test.expectedOutput = 'FAIL\n' +
           'feature_tests/css_length.html:28:2 The author stylesheet ' +
           'specified in tag \'style amp-custom\' is too long - we saw ' +
           '50002 bytes whereas the limit is 50000 bytes. ' +
           '(see https://www.ampproject.org/docs/reference/spec' +
           '#maximum-size) [AUTHOR_STYLESHEET_PROBLEM]\n' +
           'feature_tests/css_length.html:5033:0 The inline \'style\' ' +
           'attribute is not allowed in AMP documents. Use \'style ' +
           'amp-custom\' tag instead. (see https://www.ampproject.org/' +
           'docs/guides/author-develop/responsive/style_pages) ' +
           '[AUTHOR_STYLESHEET_PROBLEM]';
        test.run();
      });

  it('accepts 0 bytes in author stylesheet and 50000 bytes in inline style',
      () => {
        const inlineStyle = Array(5001).join(validInlineStyleBlob);
        assertStrictEqual(50000, inlineStyle.length);
        const test = new ValidatorTestCase('feature_tests/css_length.html');
        test.inlineOutput = false;
        test.ampHtmlFileContents =
           test.ampHtmlFileContents.replace('.replace_amp_custom {}', '')
               .replace('replace_inline_style', inlineStyle);
        // TODO(honeybadgerdontcare): Once inline style is allowed, update test.
        test.expectedOutput = 'FAIL\n' +
           'feature_tests/css_length.html:34:0 The inline \'style\' ' +
           'attribute is not allowed in AMP documents. Use \'style ' +
           'amp-custom\' tag instead. (see https://www.ampproject.org/' +
           'docs/guides/author-develop/responsive/style_pages) ' +
           '[AUTHOR_STYLESHEET_PROBLEM]';
        test.run();
      });

  it('will not accept 0 bytes in author stylesheet and 50001 bytes in inline style',
      () => {
        const inlineStyle = Array(5001).join(validInlineStyleBlob) + ' ';
        assertStrictEqual(50001, inlineStyle.length);
        const test = new ValidatorTestCase('feature_tests/css_length.html');
        test.inlineOutput = false;
        test.ampHtmlFileContents =
           test.ampHtmlFileContents.replace('.replace_amp_custom {}', '')
               .replace('replace_inline_style', inlineStyle);
        test.expectedOutputFile = null;
        // TODO(honeybadgerdontcare): Once inline style is allowed, update test.
        test.expectedOutput = 'FAIL\n' +
           'feature_tests/css_length.html:34:0 The inline \'style\' ' +
           'attribute is not allowed in AMP documents. Use \'style ' +
           'amp-custom\' tag instead. (see https://www.ampproject.org/' +
           'docs/guides/author-develop/responsive/style_pages) ' +
           '[AUTHOR_STYLESHEET_PROBLEM]\n' +
           'feature_tests/css_length.html:36:6 The author stylesheet ' +
           'specified in tag \'style amp-custom\' and the combined inline ' +
           'styles is too large - we saw 50001 bytes whereas the limit is ' +
           '50000 bytes. (see https://www.ampproject.org/docs/guides/' +
           'author-develop/responsive/style_pages) [AUTHOR_STYLESHEET_PROBLEM]';
        test.run();
      });

  it('will not accept 50000 bytes in author stylesheet and 14 bytes in inline style',
      () => {
        const stylesheet = Array(5001).join(validStyleBlob);
        assertStrictEqual(50000, stylesheet.length);
        const test = new ValidatorTestCase('feature_tests/css_length.html');
        test.inlineOutput = false;
        test.ampHtmlFileContents =
           test.ampHtmlFileContents
               .replace('.replace_amp_custom {}', stylesheet)
               .replace('replace_inline_style', 'display:block;');
        // TODO(honeybadgerdontcare): Once inline style is allowed, update test.
        test.expectedOutput = 'FAIL\n' +
           'feature_tests/css_length.html:5034:0 The inline \'style\' ' +
           'attribute is not allowed in AMP documents. Use \'style ' +
           'amp-custom\' tag instead. (see https://www.ampproject.org/' +
           'docs/guides/author-develop/responsive/style_pages) ' +
           '[AUTHOR_STYLESHEET_PROBLEM]\n' +
           'feature_tests/css_length.html:5036:6 The author stylesheet ' +
           'specified in tag \'style amp-custom\' and the combined inline ' +
           'styles is too large - we saw 50014 bytes whereas the limit is ' +
           '50000 bytes. (see https://www.ampproject.org/docs/guides/' +
           'author-develop/responsive/style_pages) [AUTHOR_STYLESHEET_PROBLEM]';
        test.run();
      });
});

describe('CssLength', () => {
  if (process.env['UPDATE_VALIDATOR_TEST'] === '1') { return; }
  it('parses a basic example', () => {
    const parsed = new amp.validator.CssLength(
        '10.1em', /* allowAuto */ false, /* allowFluid */ false);

    expect(parsed.isSet).toBe(true);
    expect(parsed.isValid).toBe(true);
    expect(parsed.numeral).toEqual(10.1);
    expect(parsed.unit).toEqual('em');
    expect(parsed.isAuto).toBe(false);
  });

  it('supports several units', () => {
    for (const allowedUnit of ['px', 'em', 'rem', 'vh', 'vmin', 'vmax']) {
      const example = '10' + allowedUnit;
      const parsed = new amp.validator.CssLength(
          example, /* allowAuto */ false, /* allowFluid */ false);

      expect(parsed.isSet).toBe(true);
      expect(parsed.isValid).toBe(true);
      expect(parsed.numeral).toEqual(10);
      expect(parsed.unit).toEqual(allowedUnit);
      expect(parsed.isAuto).toBe(false);
    }
  });

  it('understands empty unit as "px"', () => {
    const parsed = new amp.validator.CssLength(
        '10', /* allowAuto */ false, /* allowFluid */ false);

    expect(parsed.isSet).toBe(true);
    expect(parsed.isValid).toBe(true);
    expect(parsed.numeral).toEqual(10);
    expect(parsed.unit).toEqual('px');
    expect(parsed.isAuto).toBe(false);
  });

  it('understands undefined input as valid (means attr is not set)', () => {
    const parsed = new amp.validator.CssLength(
        undefined, /* allowAuto */ false, /* allowFluid */ false);

    expect(parsed.isSet).toBe(false);
    expect(parsed.isValid).toBe(true);
    expect(parsed.unit).toEqual('px');
    expect(parsed.isAuto).toBe(false);
  });

  it('understands empty string as invalid (means attr value is empty)', () => {
    const parsed = new amp.validator.CssLength(
        '', /* allowAuto */ false, /* allowFluid */ false);

    expect(parsed.isValid).toBe(false);
  });

  it('considers other garbage as invalid', () => {
    expect(new amp.validator
        .CssLength('100%', /* allowAuto */ false, /* allowFluid */ false)
        .isValid)
        .toBe(false);

    expect(
        new amp.validator
            .CssLength(
                'not a number', /* allowAuto */ false, /* allowFluid */ false)
            .isValid)
        .toBe(false);

    expect(
        new amp.validator
            .CssLength('1.1.1', /* allowAuto */ false, /* allowFluid */ false)
            .isValid)
        .toBe(false);

    expect(new amp.validator
        .CssLength(
            '5 inches', /* allowAuto */ false, /* allowFluid */ false)
        .isValid)
        .toBe(false);

    expect(new amp.validator
        .CssLength(
            'fahrenheit', /* allowAuto */ false, /* allowFluid */ false)
        .isValid)
        .toBe(false);

    expect(new amp.validator
        .CssLength('px', /* allowAuto */ false, /* allowFluid */ false)
        .isValid)
        .toBe(false);

    expect(new amp.validator
        .CssLength( // screen size in ancient Rome.
            'ix unciae', /* allowAuto */ false, /* allowFluid */ false)
        .isValid)
        .toBe(false);
  });

  it('recognizes auto if allowed', () => {
    { // allow_auto = false with input != auto
      const parsed = new amp.validator.CssLength(
          '1', /* allowAuto */ false, /* allowFluid */ false);

      expect(parsed.isValid).toBe(true);
      expect(parsed.isAuto).toBe(false);
    } {// allow_auto = true with input != auto
      const parsed = new amp.validator.CssLength(
          '1', /* allowAuto */ true, /* allowFluid */ false);

      expect(parsed.isValid).toBe(true);
      expect(parsed.isAuto)
          .toBe(false);} { // allow_auto = false with input = auto
      const parsed = new amp.validator.CssLength(
          'auto', /* allowAuto */ false, /* allowFluid */ false);

      expect(parsed.isValid).toBe(false);
    } {// allow_auto = true with input = auto
      const parsed = new amp.validator.CssLength(
          'auto', /* allowAuto */ true, /* allowFluid */ false);

      expect(parsed.isValid).toBe(true); expect(parsed.isAuto).toBe(true);}
  });

  it('recognizes fluid if allowed', () => {
    { // allow_fluid = false with input != fluid
      const parsed = new amp.validator.CssLength(
          '1', /* allowAuto */ false, /* allowFluid */ false);

      expect(parsed.isValid).toBe(true);
      expect(parsed.isFluid).toBe(false);
    } {// allow_fluid = true with input != fluid
      const parsed = new amp.validator.CssLength(
          '1', /* allowAuto */ false, /* allowFluid */ true);

      expect(parsed.isValid).toBe(true);
      expect(parsed.isFluid)
          .toBe(false);} { // allow_fluid = false with input = fluid
      const parsed = new amp.validator.CssLength(
          'fluid', /* allowAuto */ false, /* allowFluid */ false);

      expect(parsed.isValid).toBe(false);
    } {// allow_fluid = true with input = fluid
      const parsed = new amp.validator.CssLength(
          'fluid', /* allowAuto */ false, /* allowFluid */ true);

      expect(parsed.isValid).toBe(true); expect(parsed.isFluid).toBe(true);}
  });
});

