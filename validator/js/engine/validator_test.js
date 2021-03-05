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
goog.module('amp.validator.ValidatorTest');

const asserts = goog.require('goog.asserts');
const createRules = goog.require('amp.validator.createRules');
const generated = goog.require('amp.validator.protogenerated');
const htmlparser = goog.require('amp.htmlparser');
const uriUtils = goog.require('goog.uri.utils');
const validator = goog.require('amp.validator');

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
  asserts.fail('Could not find ' + testFile);
}

/**
 * @param {string} dir
 * @return {!Array<string>}
 */
function readdir(dir) {
  const files = fs.readdirSync(dir);
  asserts.assert(files != null, 'problem reading ' + dir);
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
 * @param {null|string} regex
 * @return {boolean}
 */
function isValidRegex(regex) {
  let testRegex = null;
  try {
    testRegex = new RegExp(regex);
  } catch (e) {
  }
  return testRegex != null;
}

/**
 * Returns true if the regex has a group but is missing the corresponding
 * Unicode group. For now this tests only for word character group (\\w) which
 * must be followed by the Unicode equivalent group (\\p{L}\\p{N}_).
 * @param {null|string} regex
 * @return {boolean}
 */
function isMissingUnicodeGroup(regex) {
  const wordGroupRegex = new RegExp('\\\\w(?!\\\\p{L}\\\\p{N}_)');
  return wordGroupRegex.test(regex);
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
        if (!isdir(extensionFolder) || extension[0] === '.') {
          // Skip if not a folder or if hidden folder
          continue;
        }
        // Get all versions
        for (const possibleVersion of readdir(extensionFolder)) {
          const testPath = path.join(extension, possibleVersion, 'test');
          // Skip if not a folder or if hidden folder
          if (isdir(path.join(root, testPath)) && testPath[0] !== '.') {
            testSubdirs.push({root, subdir: testPath});
          }
        }
      }
    } else {
      for (const subdir of readdir(root)) {
        // Skip if not a folder or if hidden folder
        if (isdir(path.join(root, subdir)) && subdir[0] !== '.') {
          testSubdirs.push({root, subdir});
        }
      }
    }
  }
  const testFiles = [];
  for (const entry of testSubdirs) {
    for (const candidate of readdir(path.join(entry.root, entry.subdir))) {
      if (candidate.match(/\.html$/)) {
        testFiles.push(path.join(entry.subdir, candidate));
      }
    }
  }
  return testFiles;
}

/**
 * An AMP Validator test case. This constructor will load the AMP HTML file
 * and also find the adjacent .out file.
 * TODO(alabiaga): rid of htmlFormat property based on directory path as it
 * should be read from the ampHtmlFile. Also address nodejs validator changes.
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
  // Reading in the file with BOM characters appears to strip them. Add them
  // back.
  if (this.ampHtmlFile === 'feature_tests/unprintable_chars.html') {
    this.ampHtmlFileContents = '\ufeff\ufeff\ufeff' + this.ampHtmlFileContents;
  }

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
 * @param {!generated.ValidationError} error
 * @return {string}
 */
function renderErrorWithPosition(filenameOrUrl, error) {
  const line = error.line || 1;
  const col = error.col || 0;

  let errorLine =
      uriUtils.removeFragment(filenameOrUrl) + ':' + line + ':' + col + ' ';
  errorLine += validator.renderErrorMessage(error);
  if (error.specUrl) {
    errorLine += ' (see ' + error.specUrl + ')';
  }
  return errorLine;
}

/**
 * Like validator.renderValidationResult, except inlines any error messages
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
    // prefixed with '|  ' (or just '|' if the line is empty).
    while (linesEmitted < error.line && linesEmitted < lines.length) {
      rendered += '\n|';
      if (lines[linesEmitted] !== '') {
        rendered += '  ' + lines[linesEmitted];
      }
      linesEmitted++;
    }
    // Emit a carat showing the column of the following error.
    rendered += '\n>>';
    for (let i = 0; i < error.col + 1; ++i) {
      rendered += ' ';
    }
    rendered += '^~~~~~~~~\n';
    rendered += renderErrorWithPosition(filename, error);
  }
  while (linesEmitted < lines.length) {
    rendered += '\n|';
    if (lines[linesEmitted] !== '') {
      rendered += '  ' + lines[linesEmitted];
    }
    linesEmitted++;
  }
  return rendered;
}

/**
 * Runs the test, by executing the AMP Validator, then comparing its output
 * against the golden file content.
 */
ValidatorTestCase.prototype.run = function() {
  const results =
      validator.validateString(this.ampHtmlFileContents, this.htmlFormat);
  const observed = this.inlineOutput ?
      renderInlineResult(results, this.ampUrl, this.ampHtmlFileContents) :
      validator.renderValidationResult(results, this.ampUrl).join('\n');

  if (observed === this.expectedOutput) {
    return;
  }
  if (process.env['UPDATE_VALIDATOR_TEST'] === '1') {
    if (this.expectedOutputFile !== null) {
      console /*OK*/.log('Updating ' + this.expectedOutputFile + ' ...');
      fs.writeFileSync(absolutePathFor(this.expectedOutputFile), observed);
    }
    return;
  }
  let message = '';
  if (this.expectedOutputFile !== null) {
    message = '\n' + this.expectedOutputFile + ':1:0\n';
  }
  message += 'expected:\n' + this.expectedOutput + '\nsaw:\n' + observed;
  if (this.expectedOutputFile !== null) {
    message += '\n\nIf validator/' + absolutePathFor(this.expectedOutputFile) +
        ' is incorrect, please run `gulp validator --update_tests` to ' +
        'regenerate it based on its corresponding .html file.';
  }
  asserts.fail(message);
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
    it(test.name, () => {
      test.run();
    });
  }
});

describe('ValidatorOutput', () => {
  if (process.env['UPDATE_VALIDATOR_TEST'] === '1') {
    return;
  }
  // What's tested here is that if a URL with #development=1 is passed
  // (or any other hash), the validator output won't include the hash.
  it('produces expected output with hash in the URL', () => {
    const test = new ValidatorTestCase(
        'feature_tests/no_custom_js.html',
        'http://google.com/foo.html#development=1');
    const results = validator.validateString(test.ampHtmlFileContents);
    const observed =
        validator.renderValidationResult(results, test.ampUrl).join('\n');
    const expectedSubstr = 'http://google.com/foo.html:28:3';
    if (observed.indexOf(expectedSubstr) === -1) {
      asserts.fail(
          'expectedSubstr:\n' + expectedSubstr + '\nsaw:\n' + observed);
    }
  });

  it('validate amp format', () => {
    const results = validator.validateString(
        '<!doctype html><html ⚡><head><meta charset="utf-8">' +
            '<link rel="canonical" href="self.html" />' +
            '<meta name="viewport" content="width=device-width,minimum-scale=1">' +
            '<style amp-boilerplate>body{-webkit-animation:-amp-start 8s ' +
            'steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,' +
            'end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 ' +
            'normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@' +
            '-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:' +
            'visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visib' +
            'ility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{' +
            'visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}' +
            'to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}' +
            'to{visibility:visible}}</style><noscript><style amp-boilerplate>body' +
            '{-webkit-animation:none;-moz-animation:none;-ms-animation:none;' +
            'animation:none}</style></noscript>' +
            '<script async src="https://cdn.ampproject.org/v0.js"></script>' +
            '</head><body>Hello, AMP world.</body></html>',
        'amp');
    assertStrictEqual(results.status, 'PASS');
  });

  it('default to validating the amp format', () => {
    const results = validator.validateString(
        '<!doctype html><html ⚡><head><meta charset="utf-8">' +
        '<link rel="canonical" href="self.html" />' +
        '<meta name="viewport" content="width=device-width,minimum-scale=1">' +
        '<style amp-boilerplate>body{-webkit-animation:-amp-start 8s ' +
        'steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,' +
        'end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 ' +
        'normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@' +
        '-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:' +
        'visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visib' +
        'ility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{' +
        'visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}' +
        'to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}' +
        'to{visibility:visible}}</style><noscript><style amp-boilerplate>body' +
        '{-webkit-animation:none;-moz-animation:none;-ms-animation:none;' +
        'animation:none}</style></noscript>' +
        '<script async src="https://cdn.ampproject.org/v0.js"></script>' +
        '</head><body>Hello, AMP world.</body></html>');
    assertStrictEqual(results.status, 'PASS');
  });

  it('validate amp4email format', () => {
    const results = validator.validateString(
        '<!doctype html><html ⚡4email data-css-strict><head>' +
            '<meta charset="utf-8">' +
            '<script async src="https://cdn.ampproject.org/v0.js"></script>' +
            '<style amp4email-boilerplate>body{visibility:hidden}</style>' +
            '</head><body>Hello, AMP4EMAIL world.</body></html>',
        'amp4email');
    assertStrictEqual(results.status, 'PASS');
  });

  it('validate amp4email format with error', () => {
    const results = validator.validateString(
        '<!doctype html><html ⚡4email data-css-strict><head>' +
            '<meta charset="utf-8">' +
            '<script async src="https://cdn.ampproject.org/v0.js"></script>' +
            '</head><body>Hello, AMP4EMAIL world.</body></html>',
        'amp4email');
    assertStrictEqual(results.status, 'FAIL');
    assertStrictEqual(
        results.errors[0].params.toString(),
        'head > style[amp4email-boilerplate]');
    assertStrictEqual(results.errors.length, 1);
  });

  it('validate amp4ads format', () => {
    const results = validator.validateString(
        '<!doctype html><html data-some-attribute ⚡4ads>' +
            '<head><meta charset="utf-8">' +
            '<meta name="viewport" content="width=device-width,minimum-scale=1">' +
            '<style amp4ads-boilerplate>body{visibility:hidden}</style>' +
            '<script async src="https://cdn.ampproject.org/amp4ads-v0.js">' +
            '</script></head><body>Hello, AMP4ADS world.</body></html>',
        'amp4ads');
    assertStrictEqual(results.status, 'PASS');
  });
});

describe('ValidationResultTransformerVersion', () => {
  if (process.env['UPDATE_VALIDATOR_TEST'] === '1') {
    return;
  }
  // Confirm that the transformer version in attribute "transformed" is
  // set to ValidationResult.transformer_version.
  it('produces expected output with hash in the URL', () => {
    const test = new ValidatorTestCase(
        'transformed_feature_tests/minimum_valid_amp.html');
    const result =
        validator.validateString(test.ampHtmlFileContents, test.htmlFormat);
    assertStrictEqual(1, result.transformerVersion);
  });
});

describe('Validator.DocSizeAmpEmail', () => {
  if (process.env['UPDATE_VALIDATOR_TEST'] === '1') {
    return;
  }
  // Rather than encoding some really long body in testcases, which would be
  // difficult to read/verify that the testcase is valid, we modify a valid
  // testcase (amp4email_feature_tests/doc_size.html) designed for this
  // purpose in code.

  // We use a blob of length 20 (both bytes and chars) to make it easy to
  // construct body of any length that we want.
  const validBlob = '<b>Hello, World</b>\n';
  assertStrictEqual(20, validBlob.length);

  it('accepts 200000 bytes in the test document', () => {
    const body = Array(9945).join(validBlob);
    const test = new ValidatorTestCase('amp4email_feature_tests/doc_size.html');
    test.ampHtmlFileContents =
        test.ampHtmlFileContents.replace('replace_body', body);
    assertStrictEqual(200000, htmlparser.byteLength(test.ampHtmlFileContents));
    test.inlineOutput = false;
    test.expectedOutput = 'PASS';
    test.run();
  });

  it('will not accept 200001 bytes in the test document', () => {
    const body = Array(9945).join(validBlob) + ' ';
    const test = new ValidatorTestCase('amp4email_feature_tests/doc_size.html');
    test.ampHtmlFileContents =
        test.ampHtmlFileContents.replace('replace_body', body);
    assertStrictEqual(200001, htmlparser.byteLength(test.ampHtmlFileContents));
    test.inlineOutput = false;
    test.expectedOutputFile = null;
    test.expectedOutput = 'FAIL\n' +
        'amp4email_feature_tests/doc_size.html:9977:6 ' +
        'Document exceeded 200000 bytes limit. Actual size 200001 bytes. ' +
        '(see https://amp.dev/documentation/guides-and-tutorials/learn/' +
        'email-spec/amp-email-format/?format=email)';
    test.run();
  });
});

describe('Validator.ScriptLength', () => {
  if (process.env['UPDATE_VALIDATOR_TEST'] === '1') {
    return;
  }
  // This string is 10 bytes of inline script.
  const inlineScriptBlob = 'alert(\'\');';
  assertStrictEqual(10, inlineScriptBlob.length);

  it('accepts 10000 bytes of inline style', () => {
    const inlineScript = Array(1001).join(inlineScriptBlob);
    assertStrictEqual(10000, inlineScript.length);
    const test =
        new ValidatorTestCase('feature_tests/inline_script_length.html');
    test.inlineOutput = false;
    test.ampHtmlFileContents =
        test.ampHtmlFileContents.replace('replace_inline_script', inlineScript);
    test.expectedOutput = 'PASS';
    test.run();
  });

  it('will not accept 10010 bytes in inline script', () => {
    const inlineScript = Array(1001).join(inlineScriptBlob) + ' ';
    assertStrictEqual(10001, inlineScript.length);
    const test =
        new ValidatorTestCase('feature_tests/inline_script_length.html');
    test.inlineOutput = false;
    test.ampHtmlFileContents =
        test.ampHtmlFileContents.replace('replace_inline_script', inlineScript);
    test.expectedOutputFile = null;
    test.expectedOutput = 'FAIL\n' +
        'feature_tests/inline_script_length.html:35:2 The inline script ' +
        'is 10001 bytes, which exceeds the limit of 10000 bytes. ' +
        '(see https://amp.dev/documentation/components/amp-script/#faq)';
    test.run();
  });
});

describe('Validator.CssLength', () => {
  if (process.env['UPDATE_VALIDATOR_TEST'] === '1') {
    return;
  }
  // Rather than encoding some really long author stylesheets in
  // testcases, which would be difficult to read/verify that the
  // testcase is valid, we modify a valid testcase
  // (feature_tests/css_length.html) designed for this purpose in code.

  // We use a blob of length 10 (both bytes and chars) to make it easy to
  // construct stylesheets of any length that we want.
  const validStyleBlob = 'h1{top:0}\n';
  assertStrictEqual(10, validStyleBlob.length);
  const validInlineStyleBlob = '<b style=\'width:1px;\'></b>';

  it('accepts 75000 bytes in author stylesheet and 0 bytes in inline style',
     () => {
       const stylesheet = Array(7501).join(validStyleBlob);
       assertStrictEqual(75000, stylesheet.length);
       const test = new ValidatorTestCase('feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents
               .replace('.replace_amp_custom {}', stylesheet)
               .replace('replace_inline_style', '');
       test.expectedOutput = 'PASS';
       test.run();
     });

  it('will not accept 75001 bytes in author stylesheet and 0 bytes in ' +
         'inline style',
     () => {
       const stylesheet = Array(7501).join(validStyleBlob) + ' ';
       assertStrictEqual(75001, stylesheet.length);
       const test = new ValidatorTestCase('feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents
               .replace('.replace_amp_custom {}', stylesheet)
               .replace('replace_inline_style', '');
       test.expectedOutputFile = null;
       test.expectedOutput = 'FAIL\n' +
           'feature_tests/css_length.html:28:2 The author stylesheet ' +
           'specified in tag \'style amp-custom\' is too long - document ' +
           'contains 75001 bytes whereas the limit is 75000 bytes. ' +
           '(see https://amp.dev/documentation/guides-and-tutorials/' +
           'learn/spec/amphtml/#maximum-size)';
       test.run();
     });

  it('knows utf8 and rejects file with 75002 bytes but 74999 characters ' +
         'and 0 bytes in inline style',
     () => {
       const stylesheet = Array(7500).join(validStyleBlob) + 'h {a: 😺}';
       assertStrictEqual(74999, stylesheet.length);  // character length
       const test = new ValidatorTestCase('feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents
               .replace('.replace_amp_custom {}', stylesheet)
               .replace('replace_inline_style', '');
       test.expectedOutputFile = null;
       test.expectedOutput = 'FAIL\n' +
           'feature_tests/css_length.html:28:2 The author stylesheet ' +
           'specified in tag \'style amp-custom\' is too long - document ' +
           'contains 75002 bytes whereas the limit is 75000 bytes. ' +
           '(see https://amp.dev/documentation/guides-and-tutorials/' +
           'learn/spec/amphtml/#maximum-size)';
       test.run();
     });

  it('allows 0 bytes in author stylesheet and 75000 bytes in inline style',
     () => {
       const inlineStyle = Array(7501).join(validInlineStyleBlob);
       const test = new ValidatorTestCase('feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents.replace('.replace_amp_custom {}', '')
               .replace('replace_inline_style', inlineStyle);
       test.expectedOutput = 'PASS';
       test.run();
     });

  it('will not accept 0 bytes in author stylesheet and 75010 bytes in ' +
         'inline style',
     () => {
       const inlineStyle = Array(7502).join(validInlineStyleBlob);
       const test = new ValidatorTestCase('feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents.replace('.replace_amp_custom {}', '')
               .replace('replace_inline_style', inlineStyle);
       test.expectedOutputFile = null;
       test.expectedOutput =
           'FAIL\nfeature_tests/css_length.html:36:6 The author stylesheet specified in tag \'style amp-custom\' and the combined inline styles is too large - document contains 75010 bytes whereas the limit is 75000 bytes. (see https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml/#maximum-size)';
       test.run();
     });

  it('will not accept 75000 bytes in author stylesheet and 14 bytes in ' +
         'inline style',
     () => {
       const stylesheet = Array(7501).join(validStyleBlob);
       assertStrictEqual(75000, stylesheet.length);
       const test = new ValidatorTestCase('feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents
               .replace('.replace_amp_custom {}', stylesheet)
               .replace('replace_inline_style', '<b style=display:block;></b>');
       test.expectedOutput =
           'FAIL\nfeature_tests/css_length.html:7536:6 The author stylesheet specified in tag \'style amp-custom\' and the combined inline styles is too large - document contains 75014 bytes whereas the limit is 75000 bytes. (see https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml/#maximum-size)';
       test.run();
     });
});

describe('Validator.CssLengthAmpEmail', () => {
  if (process.env['UPDATE_VALIDATOR_TEST'] === '1') {
    return;
  }
  // Rather than encoding some really long author stylesheets in
  // testcases, which would be difficult to read/verify that the
  // testcase is valid, we modify a valid testcase
  // (feature_tests/css_length.html) designed for this purpose in code.

  // We use a blob of length 10 (both bytes and chars) to make it easy to
  // construct stylesheets of any length that we want.
  const validStyleBlob = 'h1{top:0}\n';
  assertStrictEqual(10, validStyleBlob.length);
  const validInlineStyleBlob = '<b style="width:1px;"></b>';

  it('accepts 75000 bytes in author stylesheet and 0 bytes in inline style',
     () => {
       const stylesheet = Array(7501).join(validStyleBlob);
       assertStrictEqual(75000, htmlparser.byteLength(stylesheet));
       const test =
           new ValidatorTestCase('amp4email_feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents
               .replace('.replace_amp_custom {}', stylesheet)
               .replace('replace_inline_style', '');
       test.expectedOutput = 'PASS\n' +
           'amp4email_feature_tests/css_length.html:23:0 Tag \'html\' ' +
           'marked with attribute \'amp4email\' is missing the corresponding ' +
           'attribute \'data-css-strict\' for enabling strict CSS ' +
           'validation. This may become an error in the future. ' +
           '(see https://github.com/ampproject/amphtml/issues/32587)';
       test.run();
     });

  it('will not accept 75001 bytes in author stylesheet and 0 bytes in ' +
         'inline style',
     () => {
       const stylesheet = Array(7501).join(validStyleBlob) + ' ';
       assertStrictEqual(75001, stylesheet.length);
       const test =
           new ValidatorTestCase('amp4email_feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents
               .replace('.replace_amp_custom {}', stylesheet)
               .replace('replace_inline_style', '');
       test.expectedOutputFile = null;
       test.expectedOutput = 'FAIL\n' +
           'amp4email_feature_tests/css_length.html:23:0 Tag \'html\' ' +
           'marked with attribute \'amp4email\' is missing the corresponding ' +
           'attribute \'data-css-strict\' for enabling strict CSS ' +
           'validation. This may become an error in the future. ' +
           '(see https://github.com/ampproject/amphtml/issues/32587)\n' +
           'amp4email_feature_tests/css_length.html:28:2 The author stylesheet ' +
           'specified in tag \'style amp-custom\' is too long - document ' +
           'contains 75001 bytes whereas the limit is 75000 bytes. ' +
           '(see https://amp.dev/documentation/guides-and-tutorials/' +
           'learn/spec/amphtml/#maximum-size)';
       test.run();
     });

  it('knows utf8 and rejects file with 75002 bytes but 74999 characters ' +
         'and 0 bytes in inline style',
     () => {
       const stylesheet = Array(7500).join(validStyleBlob) + 'h {a: 😺}';
       assertStrictEqual(74999, stylesheet.length);  // character length
       const test =
           new ValidatorTestCase('amp4email_feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents
               .replace('.replace_amp_custom {}', stylesheet)
               .replace('replace_inline_style', '');
       test.expectedOutputFile = null;
       test.expectedOutput = 'FAIL\n' +
           'amp4email_feature_tests/css_length.html:23:0 Tag \'html\' ' +
           'marked with attribute \'amp4email\' is missing the corresponding ' +
           'attribute \'data-css-strict\' for enabling strict CSS ' +
           'validation. This may become an error in the future. ' +
           '(see https://github.com/ampproject/amphtml/issues/32587)\n' +
           'amp4email_feature_tests/css_length.html:28:2 The author ' +
           'stylesheet specified in tag \'style amp-custom\' is ' +
           'too long - document contains 75002 bytes whereas the limit is ' +
           '75000 bytes. (see ' +
           'https://amp.dev/documentation/guides-and-tutorials/' +
           'learn/spec/amphtml/#maximum-size)';
       test.run();
     });

  it('allows 0 bytes in author stylesheet and 75000 bytes in inline style',
     () => {
       const inlineStyle = Array(7501).join(validInlineStyleBlob);
       const test =
           new ValidatorTestCase('amp4email_feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents.replace('.replace_amp_custom {}', '')
               .replace('replace_inline_style', inlineStyle);
       test.expectedOutput = 'PASS\n' +
           'amp4email_feature_tests/css_length.html:23:0 Tag \'html\' ' +
           'marked with attribute \'amp4email\' is missing the corresponding ' +
           'attribute \'data-css-strict\' for enabling strict CSS ' +
           'validation. This may become an error in the future. ' +
           '(see https://github.com/ampproject/amphtml/issues/32587)';
       test.run();
     });

  it('will not accept 0 bytes in author stylesheet and 75010 bytes in ' +
         'inline style',
     () => {
       const inlineStyle = Array(7502).join(validInlineStyleBlob);
       const test =
           new ValidatorTestCase('amp4email_feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents.replace('.replace_amp_custom {}', '')
               .replace('replace_inline_style', inlineStyle);
       test.expectedOutputFile = null;
       // TODO(gregable): This should not pass for the case when there are more
       // than 75,000 bytes of inline style.
       test.expectedOutput = 'PASS\n' +
           'amp4email_feature_tests/css_length.html:23:0 Tag \'html\' ' +
           'marked with attribute \'amp4email\' is missing the corresponding ' +
           'attribute \'data-css-strict\' for enabling strict CSS ' +
           'validation. This may become an error in the future. ' +
           '(see https://github.com/ampproject/amphtml/issues/32587)\n' +
           'amp4email_feature_tests/css_length.html:34:6 The author ' +
           'stylesheet specified in tag \'style amp-custom\' and the ' +
           'combined inline styles is too large - document contains 75010 ' +
           'bytes whereas the limit is 75000 bytes. ' +
           '(see https://amp.dev/documentation/guides-and-tutorials/learn/' +
           'spec/amphtml/#maximum-size)';
       test.run();
     });

  it('will not accept 75000 bytes in author stylesheet and 14 bytes in ' +
         'inline style',
     () => {
       const stylesheet = Array(7501).join(validStyleBlob);
       assertStrictEqual(75000, stylesheet.length);
       const test =
           new ValidatorTestCase('amp4email_feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents
               .replace('.replace_amp_custom {}', stylesheet)
               .replace('replace_inline_style', '<b style=display:block;></b>');
       // TODO(gregable): This should not pass, as we have more than 75,000
       // bytes of total style.
       test.expectedOutput = 'PASS\n' +
           'amp4email_feature_tests/css_length.html:23:0 Tag \'html\' ' +
           'marked with attribute \'amp4email\' is missing the corresponding ' +
           'attribute \'data-css-strict\' for enabling strict CSS ' +
           'validation. This may become an error in the future. ' +
           '(see https://github.com/ampproject/amphtml/issues/32587)\n' +
           'amp4email_feature_tests/css_length.html:7534:6 The author ' +
           'stylesheet specified in tag \'style amp-custom\' and the ' +
           'combined inline styles is too large - document contains 75014 ' +
           'bytes whereas the limit is 75000 bytes. (see https://amp.dev/' +
           'documentation/guides-and-tutorials/learn/spec/amphtml/' +
           '#maximum-size)';
       test.run();
     });
});

// Similar to ValidatorTransformedAmpvalidator.CssLengthWithUrls, but for
// non-transformed AMP, to show that behavior should differ from non-transformed
// in that URLs are not counted towards the URL length, unless they are data:
// urls.
describe('Validator.CssLengthWithUrls', () => {
  if (process.env['UPDATE_VALIDATOR_TEST'] === '1') {
    return;
  }
  // Rather than encoding some really long author stylesheets in
  // testcases, which would be difficult to read/verify that the
  // testcase is valid, we modify a valid testcase
  // (feature_tests/css_length.html) designed for this purpose in code.

  // We use a blob of length 10 (both bytes and chars) to make it easy to
  // construct stylesheets of any length that we want.
  const validStyleBlob = 'h1{top:0}\n';
  assertStrictEqual(10, validStyleBlob.length);

  it('will accept 75010 bytes in author stylesheet that includes an URL ' +
         'of 19 bytes',
     () => {
       const url = 'http://example.com/';
       assertStrictEqual(19, url.length);
       const cssWithUrl = 'a{b:url(\'' + url + '\')';
       assertStrictEqual(30, cssWithUrl.length);
       const stylesheet = Array(7499).join(validStyleBlob) + cssWithUrl;
       // 10 bytes over limit, 19 of which are the URL.
       assertStrictEqual(75010, stylesheet.length);
       const test = new ValidatorTestCase('feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents
               .replace('.replace_amp_custom {}', stylesheet)
               .replace('replace_inline_style', '');
       test.expectedOutputFile = null;
       test.expectedOutput = 'FAIL\n' +
           'feature_tests/css_length.html:28:2 The author stylesheet ' +
           'specified in tag \'style amp-custom\' is too long - document ' +
           'contains 75010 bytes whereas the limit is 75000 bytes. ' +
           '(see https://amp.dev/documentation/guides-and-tutorials/' +
           'learn/spec/amphtml/#maximum-size)';
       test.run();
     });

  it('will accept 75010 bytes in stylesheet that includes a relative URL ' +
         'of 19 bytes',
     () => {
       const url = 'a-relative-url.html';
       assertStrictEqual(19, url.length);
       const cssWithUrl = 'a{b:url(\'' + url + '\')';
       assertStrictEqual(30, cssWithUrl.length);
       const stylesheet = Array(7499).join(validStyleBlob) + cssWithUrl;
       // 10 bytes over limit, 19 of which are the URL.
       assertStrictEqual(75010, stylesheet.length);
       const test = new ValidatorTestCase('feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents
               .replace('.replace_amp_custom {}', stylesheet)
               .replace('replace_inline_style', '');
       test.expectedOutputFile = null;
       test.expectedOutput = 'FAIL\n' +
           'feature_tests/css_length.html:28:2 The author stylesheet ' +
           'specified in tag \'style amp-custom\' is too long - document ' +
           'contains 75010 bytes whereas the limit is 75000 bytes. ' +
           '(see https://amp.dev/documentation/guides-and-tutorials/' +
           'learn/spec/amphtml/#maximum-size)';
       test.run();
     });

  it('will accept 75010 bytes in stylesheet that includes a data URL ' +
         'of 19 bytes',
     () => {
       const url = 'data:nineteen-bytes';
       assertStrictEqual(19, url.length);
       const cssWithUrl = 'a{b:url(\'' + url + '\')';
       assertStrictEqual(30, cssWithUrl.length);
       const stylesheet = Array(7499).join(validStyleBlob) + cssWithUrl;
       // 10 bytes over limit, 19 of which are the URL.
       assertStrictEqual(75010, stylesheet.length);
       const test = new ValidatorTestCase('feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents
               .replace('.replace_amp_custom {}', stylesheet)
               .replace('replace_inline_style', '');
       test.expectedOutputFile = null;
       test.expectedOutput = 'FAIL\n' +
           'feature_tests/css_length.html:28:2 The author stylesheet ' +
           'specified in tag \'style amp-custom\' is too long - document ' +
           'contains 75010 bytes whereas the limit is 75000 bytes. ' +
           '(see https://amp.dev/documentation/guides-and-tutorials/' +
           'learn/spec/amphtml/#maximum-size)';
       test.run();
     });

  it(`will reject exactly 0 bytes in stylesheet and 75009 bytes inline style, including a relative URL of 19 bytes`,
     () => {
       // This string is 33 bytes of inline style inside a B tag.
       const inline33Bytes =
           '<b style="color: url(\'a-relative-url.html\')"></b>';
       // 2273 x 33 = 75009
       const inlineStyle = Array(2274).join(inline33Bytes);
       const test = new ValidatorTestCase('feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents.replace('.replace_amp_custom {}', '')
               .replace('replace_inline_style', inlineStyle);
       test.expectedOutputFile = null;
       test.expectedOutput = 'FAIL\n' +
           'feature_tests/css_length.html:36:6 The author stylesheet specified in tag \'style amp-custom\' and the combined inline styles is too large - document contains 75009 bytes whereas the limit is 75000 bytes. (see https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml/#maximum-size)';
       test.run();
     });

  it(`will reject exactly 0 bytes in stylesheet and 75009 bytes inline style, including a data URL of 19 bytes`,
     () => {
       // This string is 33 bytes of inline style inside a B tag.
       const inline33Bytes =
           '<b style="color: url(\'data:nineteen-bytes\')"></b>';
       // 2273 x 33 = 75009
       const inlineStyle = Array(2274).join(inline33Bytes);
       const test = new ValidatorTestCase('feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents.replace('.replace_amp_custom {}', '')
               .replace('replace_inline_style', inlineStyle);
       test.expectedOutputFile = null;
       test.expectedOutput = 'FAIL\n' +
           'feature_tests/css_length.html:36:6 The author stylesheet specified in tag \'style amp-custom\' and the combined inline styles is too large - document contains 75009 bytes whereas the limit is 75000 bytes. (see https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml/#maximum-size)';
       test.run();
     });
});

describe('ValidatorTransformedAmp.CssLengthWithUrls', () => {
  if (process.env['UPDATE_VALIDATOR_TEST'] === '1') {
    return;
  }
  // Rather than encoding some really long author stylesheets in
  // testcases, which would be difficult to read/verify that the
  // testcase is valid, we modify a valid testcase
  // (transformed_feature_tests/css_length.html) designed for this
  // purpose in code.

  // We use a blob of length 10 (both bytes and chars) to make it easy to
  // construct stylesheets of any length that we want.
  const validStyleBlob = 'h1{top:0}\n';
  assertStrictEqual(10, validStyleBlob.length);

  it('will accept 75010 bytes in author stylesheet that includes an URL ' +
         'of 19 bytes',
     () => {
       const url = 'http://example.com/';
       assertStrictEqual(19, url.length);
       const cssWithUrl = 'a{b:url(\'' + url + '\')';
       assertStrictEqual(30, cssWithUrl.length);
       const stylesheet = Array(7499).join(validStyleBlob) + cssWithUrl;
       // 10 bytes over limit, 19 of which are the URL.
       assertStrictEqual(75010, stylesheet.length);
       const test =
           new ValidatorTestCase('transformed_feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents
               .replace('.replace_amp_custom {}', stylesheet)
               .replace('replace_inline_style', '');
       test.expectedOutputFile = null;
       test.expectedOutput = 'PASS';
       test.run();
     });

  it('will accept 75010 bytes in stylesheet that includes a relative URL ' +
         'of 19 bytes',
     () => {
       const url = 'a-relative-url.html';
       assertStrictEqual(19, url.length);
       const cssWithUrl = 'a{b:url(\'' + url + '\')';
       assertStrictEqual(30, cssWithUrl.length);
       const stylesheet = Array(7499).join(validStyleBlob) + cssWithUrl;
       // 10 bytes over limit, 19 of which are the URL.
       assertStrictEqual(75010, stylesheet.length);
       const test =
           new ValidatorTestCase('transformed_feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents
               .replace('.replace_amp_custom {}', stylesheet)
               .replace('replace_inline_style', '');
       test.expectedOutputFile = null;
       test.expectedOutput = 'PASS';
       test.run();
     });

  it('will accept 75010 bytes in stylesheet that includes a data URL ' +
         'of 19 bytes',
     () => {
       const url = 'data:nineteen-bytes';
       assertStrictEqual(19, url.length);
       const cssWithUrl = 'a{b:url(\'' + url + '\')';
       assertStrictEqual(30, cssWithUrl.length);
       const stylesheet = Array(7499).join(validStyleBlob) + cssWithUrl;
       // 10 bytes over limit, 19 of which are the URL.
       assertStrictEqual(75010, stylesheet.length);
       const test =
           new ValidatorTestCase('transformed_feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents
               .replace('.replace_amp_custom {}', stylesheet)
               .replace('replace_inline_style', '');
       test.expectedOutputFile = null;
       test.expectedOutput = 'FAIL\n' +
           'transformed_feature_tests/css_length.html:29:2 The author ' +
           'stylesheet specified in tag \'style amp-custom\' ' +
           'is too long - document contains 75010 bytes whereas the limit ' +
           'is 75000 bytes. ' +
           '(see https://amp.dev/documentation/guides-and-tutorials/' +
           'learn/spec/amphtml/#maximum-size)';
       test.run();
     });

  it(`will reject exactly 0 bytes in stylesheet and 75009 bytes inline style, including a relative URL of 19 bytes`,
     () => {
       // This string is 33 bytes of inline style inside a B tag.
       const inline33Bytes =
           '<b style="color: url(\'a-relative-url.html\')"></b>';
       // 2273 x 33 = 75009
       const inlineStyle = Array(2274).join(inline33Bytes);
       const test = new ValidatorTestCase('feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents.replace('.replace_amp_custom {}', '')
               .replace('replace_inline_style', inlineStyle);
       test.expectedOutputFile = null;
       test.expectedOutput = 'FAIL\n' +
           'feature_tests/css_length.html:36:6 The author stylesheet specified in tag \'style amp-custom\' and the combined inline styles is too large - document contains 75009 bytes whereas the limit is 75000 bytes. (see https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml/#maximum-size)';
       test.run();
     });

  it(`will reject exactly 0 bytes in stylesheet and 75009 bytes inline style, including a data URL of 19 bytes`,
     () => {
       // This string is 33 bytes of inline style inside a B tag.
       const inline33Bytes =
           '<b style="color: url(\'data:nineteen-bytes\')"></b>';
       // 2273 x 33 = 75009
       const inlineStyle = Array(2274).join(inline33Bytes);
       const test = new ValidatorTestCase('feature_tests/css_length.html');
       test.inlineOutput = false;
       test.ampHtmlFileContents =
           test.ampHtmlFileContents.replace('.replace_amp_custom {}', '')
               .replace('replace_inline_style', inlineStyle);
       test.expectedOutputFile = null;
       test.expectedOutput = 'FAIL\n' +
           'feature_tests/css_length.html:36:6 The author stylesheet specified in tag \'style amp-custom\' and the combined inline styles is too large - document contains 75009 bytes whereas the limit is 75000 bytes. (see https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml/#maximum-size)';
       test.run();
     });
});

describe('validator.CssLength', () => {
  if (process.env['UPDATE_VALIDATOR_TEST'] === '1') {
    return;
  }
  it('parses a basic example', () => {
    const parsed = new validator.CssLength(
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
      const parsed = new validator.CssLength(
          example, /* allowAuto */ false, /* allowFluid */ false);

      expect(parsed.isSet).toBe(true);
      expect(parsed.isValid).toBe(true);
      expect(parsed.numeral).toEqual(10);
      expect(parsed.unit).toEqual(allowedUnit);
      expect(parsed.isAuto).toBe(false);
    }
  });

  it('understands empty unit as "px"', () => {
    const parsed = new validator.CssLength(
        '10', /* allowAuto */ false, /* allowFluid */ false);

    expect(parsed.isSet).toBe(true);
    expect(parsed.isValid).toBe(true);
    expect(parsed.numeral).toEqual(10);
    expect(parsed.unit).toEqual('px');
    expect(parsed.isAuto).toBe(false);
  });

  it('understands undefined input as valid (means attr is not set)', () => {
    const parsed = new validator.CssLength(
        undefined, /* allowAuto */ false, /* allowFluid */ false);

    expect(parsed.isSet).toBe(false);
    expect(parsed.isValid).toBe(true);
    expect(parsed.unit).toEqual('px');
    expect(parsed.isAuto).toBe(false);
  });

  it('understands empty string as invalid (means attr value is empty)', () => {
    const parsed = new validator.CssLength(
        '', /* allowAuto */ false, /* allowFluid */ false);

    expect(parsed.isValid).toBe(false);
  });

  it('considers other garbage as invalid', () => {
    expect(new validator
               .CssLength('100%', /* allowAuto */ false, /* allowFluid */ false)
               .isValid)
        .toBe(false);

    expect(
        new validator
            .CssLength(
                'not a number', /* allowAuto */ false, /* allowFluid */ false)
            .isValid)
        .toBe(false);

    expect(
        new validator
            .CssLength('1.1.1', /* allowAuto */ false, /* allowFluid */ false)
            .isValid)
        .toBe(false);

    expect(new validator
               .CssLength(
                   '5 inches', /* allowAuto */ false, /* allowFluid */ false)
               .isValid)
        .toBe(false);

    expect(new validator
               .CssLength(
                   'fahrenheit', /* allowAuto */ false, /* allowFluid */ false)
               .isValid)
        .toBe(false);

    expect(new validator
               .CssLength('px', /* allowAuto */ false, /* allowFluid */ false)
               .isValid)
        .toBe(false);

    expect(new validator
               .CssLength(  // screen size in ancient Rome.
                   'ix unciae', /* allowAuto */ false, /* allowFluid */ false)
               .isValid)
        .toBe(false);
  });

  it('recognizes auto if allowed', () => {
    {  // allow_auto = false with input != auto
      const parsed = new validator.CssLength(
          '1', /* allowAuto */ false, /* allowFluid */ false);

      expect(parsed.isValid).toBe(true);
      expect(parsed.isAuto).toBe(false);
    } {// allow_auto = true with input != auto
       const parsed = new validator.CssLength(
           '1', /* allowAuto */ true, /* allowFluid */ false);

       expect(parsed.isValid).toBe(true);
       expect(parsed.isAuto)
           .toBe(false);} {  // allow_auto = false with input = auto
      const parsed = new validator.CssLength(
          'auto', /* allowAuto */ false, /* allowFluid */ false);

      expect(parsed.isValid).toBe(false);
    } {// allow_auto = true with input = auto
       const parsed = new validator.CssLength(
           'auto', /* allowAuto */ true, /* allowFluid */ false);

       expect(parsed.isValid).toBe(true); expect(parsed.isAuto).toBe(true);}
  });

  it('recognizes fluid if allowed', () => {
    {  // allow_fluid = false with input != fluid
      const parsed = new validator.CssLength(
          '1', /* allowAuto */ false, /* allowFluid */ false);

      expect(parsed.isValid).toBe(true);
      expect(parsed.isFluid).toBe(false);
    } {// allow_fluid = true with input != fluid
       const parsed = new validator.CssLength(
           '1', /* allowAuto */ false, /* allowFluid */ true);

       expect(parsed.isValid).toBe(true);
       expect(parsed.isFluid)
           .toBe(false);} {  // allow_fluid = false with input = fluid
      const parsed = new validator.CssLength(
          'fluid', /* allowAuto */ false, /* allowFluid */ false);

      expect(parsed.isValid).toBe(false);
    } {// allow_fluid = true with input = fluid
       const parsed = new validator.CssLength(
           'fluid', /* allowAuto */ false, /* allowFluid */ true);

       expect(parsed.isValid).toBe(true); expect(parsed.isFluid).toBe(true);}
  });
});

/**
 * Helper for ValidatorRulesMakeSense.
 * @param {!generated.AttrSpec} attrSpec
 * @param {!generated.TagSpec} tagSpec
 * @param {!generated.ValidatorRules} rules
 */
function attrRuleShouldMakeSense(attrSpec, tagSpec, rules) {
  // name
  it('attr_spec name defined', () => {
    expect(attrSpec.name).toBeDefined();
  });
  it('attr_spec name is lower case', () => {
    // Attribute Spec names are matched against lowercased attributes,
    // so the rules *must* also be lower case or non-cased.
    const attrSpecNameRegex = new RegExp('^[^A-Z]+$');

    expect(attrSpecNameRegex.test(attrSpec.name)).toBe(true);
  });
  it('attr_spec name can not be [style]', () => {
    expect(attrSpec.name).not.toEqual('[style]');
  });
  if (attrSpec.valueUrl !== null) {
    const protocolRegex = new RegExp('[a-z-]+');
    // UrlSpec protocol is matched against lowercased protocol names
    // so the rules *must* also be lower case.
    it('protocol must be lower case', () => {
      for (const protocol of attrSpec.valueUrl.protocol) {
        expect(protocolRegex.test(protocol)).toBe(true);
      }
    });
    // If protocol is http then allow_relative should not be false
    // except for `data-` attributes and email spec.
    if (!attrSpec.name.startsWith('data-') &&
        !tagSpec.htmlFormat.includes(generated.HtmlFormat.Code.AMP4EMAIL)) {
      for (const protocol of attrSpec.valueUrl.protocol) {
        if ((protocol === 'http') &&
            (attrSpec.valueUrl.allowRelative !== null)) {
          it('allow_relative can not be false if protocol is http: ' +
                 attrSpec.name,
             () => {
               expect(attrSpec.valueUrl.allowRelative).toEqual(true);
             });
        }
      }
    }
  }
  if (attrSpec.valueRegex !== null) {
    it('value_regex valid', () => {
      const regex = rules.internedStrings[-1 - attrSpec.valueRegex];

      expect(isValidRegex(regex)).toBe(true);
    });
    it('value_regex must have unicode named groups', () => {
      const regex = rules.internedStrings[-1 - attrSpec.valueRegex];

      expect(isMissingUnicodeGroup(regex)).toBe(false);
    });
  }
  if (attrSpec.valueRegexCasei !== null) {
    it('value_regex_casei valid', () => {
      const regex = rules.internedStrings[-1 - attrSpec.valueRegexCasei];

      expect(isValidRegex(regex)).toBe(true);
    });
    it('value_regex_casei must have unicode named groups', () => {
      const regex = rules.internedStrings[-1 - attrSpec.valueRegexCasei];

      expect(isMissingUnicodeGroup(regex)).toBe(false);
    });
  }
  if (attrSpec.disallowedValueRegex !== null) {
    it('disallowed_value_regex valid', () => {
      const regex = rules.internedStrings[-1 - attrSpec.disallowedValueRegex];

      expect(isValidRegex(regex)).toBe(true);
    });
    it('disallowed_value_regex must have unicode named groups', () => {
      const regex = rules.internedStrings[-1 - attrSpec.disallowedValueRegex];

      expect(isMissingUnicodeGroup(regex)).toBe(false);
    });
  }
  // value_url must have at least one allowed protocol.
  if (attrSpec.valueUrl !== null) {
    it('value_url must have at least one protocol', () => {
      expect(attrSpec.valueUrl.protocol.length).toBeGreaterThan(0);
    });
  }
  // only has one of value set.
  let numValues = 0;
  if (attrSpec.value.length > 0) {
    numValues += 1;
  }
  if (attrSpec.valueCasei.length > 0) {
    numValues += 1;
  }
  if (attrSpec.valueRegex !== null) {
    numValues += 1;
  }
  if (attrSpec.valueRegexCasei !== null) {
    numValues += 1;
  }
  if (attrSpec.valueUrl !== null) {
    numValues += 1;
  }
  if (attrSpec.valueProperties !== null) {
    numValues += 1;
  }
  it('attr_spec only has one value set', () => {
    expect(numValues).toBeLessThan(2);
  });
  // `id` attribute must have disallowed_value_regex set if no explicit values.
  if ((attrSpec.name === 'id') && (numValues === 0)) {
    it('"id" attribute must have disallowed_value_regex set', () => {
      expect(attrSpec.disallowedValueRegex !== null).toBe(true);
    });
  }
  // `name` attribute must have disallowed_value_regex set if no explicit
  // values.
  if ((attrSpec.name === 'name') && (numValues === 0)) {
    it('"name" attribute must have disallowed_value_regex set', () => {
      expect(attrSpec.disallowedValueRegex !== null).toBe(true);
    });
  }
  // deprecation
  if ((attrSpec.deprecation !== null) || (attrSpec.deprecationUrl !== null)) {
    it('deprecation and deprecation_url must both be defined if one is defined',
       () => {
         expect(attrSpec.deprecation).toBeDefined();
         expect(attrSpec.deprecationUrl).toBeDefined();
       });
  }
  // dispatch_key
  if (attrSpec.dispatchKey !== null && attrSpec.dispatchKey) {
    it('mandatory must be true when dispatch_key is true', () => {
      expect(attrSpec.mandatory === true || attrSpec.mandatoryOneof !== null)
          .toBe(true);
    });
  }
  // Value property names must be unique.
  if (attrSpec.valueProperties !== null) {
    const seenPropertySpecNames = {};
    it('value_properties must be unique', () => {
      for (const propertySpec of attrSpec.valueProperties.properties) {
        expect(seenPropertySpecNames.hasOwnProperty(propertySpec.name))
            .toBe(false);
        seenPropertySpecNames[propertySpec.name] = 0;
      }
    });
  }
  // Transformed AMP does not allow `nonce` attributes, so it must have
  // disabled_by: "transformed".
  if ((attrSpec.name === 'nonce') &&
      tagSpec.htmlFormat.includes(generated.HtmlFormat.Code.AMP)) {
    it('nonce attributes must have `disabled_by: "transformed"`', () => {
      expect(attrSpec.disabledBy.includes('transformed')).toBe(true);
    });
  }
}

/**
 * Helper for typeIdentifiersShouldMakeSense.
 * @param {!Object<string, number>} typeIdentifiers
 * @param {!Array<string>} specTypeIdentifiers
 * @param {string} fieldName
 * @param {string} specType
 * @param {string} specName
 */
function typeIdentifiersAreValidAndUnique(
    typeIdentifiers, specTypeIdentifiers, fieldName, specType, specName) {
  const encounteredTypeIdentifiers = {};
  for (const typeIdentifier of specTypeIdentifiers) {
    it(specType + ' \'' + specName + '\' has ' + fieldName +
           ' set to an invalid type identifier: \'' + typeIdentifier + '\'',
       () => {
         expect(typeIdentifiers.hasOwnProperty(typeIdentifier)).toBe(true);
       });
    it(specType + ' \'' + specName + '\' has duplicate ' + fieldName + ': \'' +
           typeIdentifier + '\'.',
       () => {
         expect(encounteredTypeIdentifiers.hasOwnProperty(typeIdentifier))
             .toBe(false);
         encounteredTypeIdentifiers[typeIdentifier] = 0;
       });
  }
}

/**
 * Helper for ValidatorRulesMakeSense.
 * @param {!generated.TagSpec|!generated.AttrSpec} spec
 * @param {string} specType
 * @param {string} specName
 */
function typeIdentifiersShouldMakeSense(spec, specType, specName) {
  const typeIdentifiers = {
    'amp': 0,
    'amp4ads': 0,
    'amp4email': 0,
    'transformed': 0,
    'data-css-strict': 0
  };
  // both enabled_by and disabled_by must not be set on the same spec.
  it(specType + ' \'' + specName + '\' has both enabled_by and disabled_by' +
         ' set and it must be one or the other, not both.',
     () => {
       expect((spec.enabledBy.length > 0) && (spec.disabledBy.length > 0))
           .toBe(false);
     });
  // enabled_by must be a valid type identifier and each type identifier
  // listed at most once.
  typeIdentifiersAreValidAndUnique(
      typeIdentifiers, spec.enabledBy, 'enabled_by', specType, specName);
  // disabled_by must be a valid type identifier and each type identifier
  // listed at most once.
  typeIdentifiersAreValidAndUnique(
      typeIdentifiers, spec.disabledBy, 'disabled_by', specType, specName);
}

// Test which verifies some constraints on the rules file which the validator
// depends on, but which proto parser isn't robust enough to verify.
describe('ValidatorRulesMakeSense', () => {
  if (process.env['UPDATE_VALIDATOR_TEST'] === '1') {
    return;
  }
  const rules = createRules.createRules();

  // None of these should be empty.
  it('tags defined', () => {
    expect(rules.tags.length).toBeGreaterThan(0);
  });

  it('direct_attr_lists defined', () => {
    expect(rules.directAttrLists.length).toBeGreaterThan(0);
  });

  it('global_attrs defined', () => {
    expect(rules.globalAttrs.length).toBeGreaterThan(0);
  });

  it('amp_layout_attrs defined', () => {
    expect(rules.ampLayoutAttrs.length).toBeGreaterThan(0);
  });

  for (const list of rules.directAttrLists) {
    for (const index of list) {
      if (index < 0) {
        it('attr_spec name can not be [style]', () => {
          expect(rules.internedStrings[-1 - index]).not.toEqual('[style]');
        });
      } else {
        it('attr_spec name can not be [style]', () => {
          expect(rules.attrs[index].name).not.toEqual('[style]');
        });
      }
    }
  }

  for (const index of rules.globalAttrs) {
    it('attr_spec name can not be [style]', () => {
      expect(rules.internedStrings[-1 - index]).not.toEqual('[style]');
    });
  }

  for (const index of rules.ampLayoutAttrs) {
    it('attr_spec name can not be [style]', () => {
      expect(rules.internedStrings[-1 - index]).not.toEqual('[style]');
    });
  }

  it('min_validator_revision_required defined', () => {
    expect(rules.minValidatorRevisionRequired).toBeGreaterThan(0);
  });

  it('template_spec_url is set', () => {
    expect(rules.templateSpecUrl).not.toEqual(null);
  });

  // For verifying that all ReferencePoint::tag_spec_names will resolve to a
  // generated.TagSpec that's marked REFERENCE_POINT.
  const allReferencePoints = {};
  for (const tagSpec of rules.tags) {
    if (tagSpec.tagName === '$REFERENCE_POINT') {
      allReferencePoints[tagSpec.specName] = 0;
    }
  }

  // tag_specs
  const specNameIsUnique = {};
  const namedIdIsUnique = {};
  const tagWithoutSpecNameIsUnique = {};
  const tagNameRegex =
      new RegExp('(!DOCTYPE|O:P|[A-Z0-9-]+|\\$REFERENCE_POINT)');
  const disallowedAncestorRegex = new RegExp('[A-Z0-9-]+');
  for (const tagSpec of rules.tags) {
    // Helper for message output, set a tagspec_name in this order:
    // 1. tagSpec.specName, 2. tagSpec.tagName, 3. UNKNOWN_TAGSPEC.
    const tagSpecName =
        tagSpec.specName || tagSpec.tagName || 'UNKNOWN_TAGSPEC';

    // html_format must be set.
    it('\'' + tagSpecName + '\' must have at least one htmlFormat set', () => {
      expect(tagSpec.htmlFormat.length).toBeGreaterThan(0);
    });
    // html_format is never UNKNOWN_CODE.
    it('tagSpec.htmlFormat should never contain UNKNOWN_CODE', () => {
      expect(tagSpec.htmlFormat.indexOf(generated.HtmlFormat.Code.UNKNOWN_CODE))
          .toEqual(-1);
    });
    // name
    it('tag_name defined', () => {
      expect(tagSpec.tagName).toBeDefined();
      expect(tagNameRegex.test(tagSpec.tagName)).toBe(true);
    });
    // spec_name can't be empty and must be unique.
    it('unique spec_name or if none then unique tag_name', () => {
      if (tagSpec.specName !== null) {
        expect(specNameIsUnique.hasOwnProperty(tagSpec.specName)).toBe(false);
        specNameIsUnique[tagSpec.specName] = 0;
      } else if (tagSpec.extensionSpec !== null) {
        const specName = tagSpec.extensionSpec.name + ' extension script';

        expect(specNameIsUnique.hasOwnProperty(specName)).toBe(false);
        specNameIsUnique[specName] = 0;
      } else {
        expect(tagWithoutSpecNameIsUnique.hasOwnProperty(tagSpec.tagName))
            .toBe(false);
        tagWithoutSpecNameIsUnique[tagSpec.tagName] = 0;
      }
    });
    it('reference points must set descriptive_name', () => {
      if (tagSpec.tagName == '$REFERENCE_POINT') {
        expect(tagSpec.descriptiveName !== null);
      }
    });
    if ((tagSpec.enabledBy.length > 0) || (tagSpec.disabledBy.length > 0)) {
      typeIdentifiersShouldMakeSense(tagSpec, 'tag_spec', tagSpecName);
    }
    it('unique named_id if present', () => {
      if (tagSpec.namedId !== null &&
          tagSpec.namedId !== generated.TagSpec.NamedId.NOT_SET) {
        expect(namedIdIsUnique.hasOwnProperty(tagSpec.namedId)).toBe(false);
        namedIdIsUnique[tagSpec.namedId] = 0;
      }
    });
    // Verify AMP4ADS extensions are approved.
    if ((tagSpec.tagName.indexOf('SCRIPT') === 0) && tagSpec.extensionSpec &&
        (tagSpec.htmlFormat.indexOf(generated.HtmlFormat.Code.AMP4ADS) !==
         -1)) {
      // AMP4ADS format lists approved extensions.
      // https://github.com/ampproject/amphtml/blob/master/extensions/amp-a4a/amp-a4a-format.md#amp-extensions-and-builtins
      // Changes to the following map must be approved by the Ads Working
      // Group, @wg-monetization.
      const approvedAmp4AdsExtensions = {
        'amp-accordion': ['0.1', 'latest'],
        'amp-ad-exit': ['0.1', 'latest'],
        'amp-analytics': ['0.1', 'latest'],
        'amp-anim': ['0.1', 'latest'],
        'amp-animation': ['0.1', 'latest'],
        'amp-audio': ['0.1', 'latest'],
        'amp-bind': ['0.1', 'latest'],
        'amp-carousel': ['0.1', '0.2', 'latest'],
        'amp-fit-text': ['0.1', 'latest'],
        'amp-font': ['0.1', 'latest'],
        'amp-form': ['0.1', 'latest'],
        'amp-gwd-animation': ['0.1', 'latest'],
        'amp-img': ['0.1', 'latest'],
        'amp-layout': ['0.1', 'latest'],
        'amp-lightbox': ['0.1', 'latest'],
        'amp-mraid': ['0.1', 'latest'],
        'amp-mustache': ['0.1', '0.2', 'latest'],
        'amp-pixel': ['0.1', 'latest'],
        'amp-position-observer': ['0.1', 'latest'],
        'amp-selector': ['0.1', 'latest'],
        'amp-social-share': ['0.1', 'latest'],
        'amp-video': ['0.1', 'latest'],
      };
      // Verify extension is approved.
      const extension = tagSpec.extensionSpec.name;
      it(extension + ' has html_format either explicitly or implicitly' +
             ' set for AMP4ADS but ' + extension + ' is not approved' +
             ' for AMP4ADS',
         () => {
           expect(approvedAmp4AdsExtensions.hasOwnProperty(extension))
               .toBe(true);
         });
      // Extension is approved. Verify extension version is approved.
      if (approvedAmp4AdsExtensions.hasOwnProperty(extension)) {
        for (const version of tagSpec.extensionSpec.version) {
          it(extension + ' has html_format either explicitly or implicitly' +
                 ' set for AMP4ADS but ' + extension + ' version ' + version +
                 ' is not approved for AMP4ADS. If this version is intended' +
                 ' for AMP4ADS please get approval from @wg-monetization and then' +
                 ' update this test. Otherwise remove the version for' +
                 ' AMP4ADS from the tagspec',
             () => {
               expect(approvedAmp4AdsExtensions[extension].indexOf(version))
                   .toBeGreaterThan(-1);
             });
        }
      }
    }
    // Verify AMP4EMAIL extensions and their usage are approved.
    if ((tagSpec.tagName.indexOf('AMP-') === 0) &&
        (tagSpec.htmlFormat.indexOf(generated.HtmlFormat.Code.AMP4EMAIL) !==
         -1)) {
      // AMP4EMAIL format lists approved extensions.
      // Changes to the following map must be approved by the AMP4Email
      // Working Group, @wg-amp4email.
      const approvedAmp4EmailExtensions = {
        'AMP-ACCORDION': ['0.1'],
        'AMP-AUTOCOMPLETE': ['0.1'],
        'AMP-ANIM': ['0.1'],
        'AMP-BIND-MACRO': ['0.1'],
        'AMP-CAROUSEL': ['0.1'],
        'AMP-FIT-TEXT': ['0.1'],
        'AMP-IMG': ['0.1'],
        'AMP-IMAGE-LIGHTBOX': ['0.1'],
        'AMP-LAYOUT': ['0.1'],
        'AMP-LIGHTBOX': ['0.1'],
        'AMP-LIST': ['0.1'],
        'AMP-SELECTOR': ['0.1'],
        'AMP-SIDEBAR': ['0.1'],
        'AMP-STATE': ['0.1'],
        'AMP-TIMEAGO': ['0.1'],
      };
      // Verify extension and it's usage is approved.
      it(tagSpec.tagName + ' has html_format either explicitly or implicitly' +
             ' set for AMP4EMAIL but ' + tagSpec.tagName +
             ' is not approved for AMP4EMAIL',
         () => {
           expect(approvedAmp4EmailExtensions.hasOwnProperty(tagSpec.tagName))
               .toBe(true);
         });
      // Extension is approved. Verify extension version is approved.
      // Only care about SCRIPT tags since only those are versioned.
      if ((tagSpec.tagName.indexOf('SCRIPT') === 0) && tagSpec.extensionSpec &&
          approvedAmp4EmailExtensions.hasOwnProperty(
              tagSpec.extensionSpec.name)) {
        const extension = tagSpec.extensionSpec.name;
        for (const version of tagSpec.extensionSpec.version) {
          it(extension + ' has html_format either explicitly or implicitly' +
                 ' set for AMP4EMAIL but ' + extension + ' version ' + version +
                 ' is not approved for AMP4EMAIL. If this version is intended' +
                 ' for AMP4EMAIL please get approval from @wg-amp4email and' +
                 ' then update this test. Otherwise remove the version for' +
                 ' AMP4EMAIL from the tagspec',
             () => {
               expect(approvedAmp4EmailExtensions[extension].indexOf(version))
                   .toBeGreaterThan(-1);
             });
        }
      }
    }
    // disallowed_ancestor must be a upper case alphabetic name.
    it('disallowed_ancestor defined and not equal to mandatory parent', () => {
      for (const disallowedAncestor of tagSpec.disallowedAncestor) {
        expect(disallowedAncestorRegex.test(disallowedAncestor)).toBe(true);
        // Can't disallow an ancestor and require the same parent.
        if (tagSpec.mandatoryParent !== null) {
          expect(disallowedAncestor).not.toEqual(tagSpec.mandatoryParent);
        }
      }
    });
    // Can't have unique and unique_warning at the same time.
    it('unique and unique_warning can not be defined at the same time', () => {
      expect(tagSpec.unique && tagSpec.uniqueWarning).toBe(false);
    });

    // When explicit_attrs_only is true, then amp_layout must not be set.
    if (tagSpec.explicitAttrsOnly) {
      it('\'' + tagSpecName + '\' has explicit_attrs_only set to true ' +
             'and must not have any amp_layouts',
         () => {
           expect(tagSpec.ampLayout === null).toBe(true);
         });
    }

    // attr_specs within tag.
    const attrNameIsUnique = {};
    for (const attrSpecId of tagSpec.attrs) {
      if (attrSpecId < 0) {
        const attrName = rules.internedStrings[-1 - attrSpecId];
        it('unique attr_name within tag_spec \'' + tagSpecName + '\'', () => {
          expect(attrNameIsUnique.hasOwnProperty(attrName)).toBe(false);
          attrNameIsUnique[attrName] = 0;
        });
        // Transformed AMP does not allow `nonce` attributes, so it must have
        // disabled_by: "transformed" on the attrSpec or the tagSpec. Since this
        // attribute does not have an attrSpec then it must be on the tagSpec.
        // Verify that it is set on the tagSpec.
        if ((attrName === 'nonce') &&
            tagSpec.htmlFormat.includes(generated.HtmlFormat.Code.AMP)) {
          it('nonce attributes must have `disabled_by: "transformed"`', () => {
            expect(tagSpec.disabledBy.includes('transformed')).toBe(true);
          });
        }
        continue;
      }
      const attrSpec = rules.attrs[attrSpecId];

      // attr_name must be unique within tag_spec (no duplicates).
      it('unique attr_spec within tag_spec', () => {
        expect(attrSpec.name).toBeDefined();
        expect(attrNameIsUnique.hasOwnProperty(attrSpec.name)).toBe(false);
        attrNameIsUnique[attrSpec.name] = 0;
      });
      if ((attrSpec.enabledBy.length > 0) || (attrSpec.disabledBy.length > 0)) {
        typeIdentifiersShouldMakeSense(attrSpec, 'attr_spec', attrSpec.name);
      }
      // Special check that every <script> tag with a src attribute has a
      // allowlist check on the attribute value.
      if (tagSpec.tagName === 'SCRIPT' && attrSpec.name === 'src') {
        it('every <script> tag with a src attribute has a allowlist check',
           () => {
             expect(attrSpec.value.length > 0 || attrSpec.valueRegex !== null)
                 .toBe(true);
           });
      }
    }

    // generated.TagSpecs with an ExtensionSpec are extensions. We have a few
    // additional checks for these.
    if (tagSpec.extensionSpec !== null) {
      const {extensionSpec} = tagSpec;
      const versionRegexp = /^(latest|[0-9]+[.][0-9]+)$/;
      it('extension must have a name field value', () => {
        expect(extensionSpec.name).toBeDefined();
      });
      // AMP4EMAIL extensions must support at least one version.
      if (tagSpec.htmlFormat.includes(generated.HtmlFormat.Code.AMP4EMAIL)) {
        it('extension ' + extensionSpec.name + ' must have at least one ' +
               'version',
           () => {
             expect(extensionSpec.version.length).toBeGreaterThan(0);
           });
      }
      it('extension ' + extensionSpec.name + ' versions must be `latest` ' +
             'or a numeric value',
         () => {
           for (const versionString of extensionSpec.version) {
             expect(versionString).toMatch(versionRegexp);
           }
           for (const versionString of extensionSpec.deprecatedVersion) {
             expect(versionString).toMatch(versionRegexp);
           }
         });
      it('extension ' + extensionSpec.name + ' deprecated_version must be ' +
             'subset of version',
         () => {
           for (const versionString of extensionSpec.deprecatedVersion) {
             expect(extensionSpec.version).toContain(versionString);
           }
         });
      it('extension ' + extensionSpec.name + ' must include the ' +
             'attr_list: "common-extension-attrs"` attr_list ',
         () => {
           expect(tagSpec.attrLists.length).toEqual(1);
           // TODO: what we'd like to verify here is that this AttrList is named
           // 'common-extension-attrs'.  Unfortunately that information isn't
           // available to us: we just have an index into
           // Context.rules_.parsedAttrSpecs_.
           // getNameByAttrSpecId() looks like it would do what we want, but
           // it's sufficiently wrapped in private context inside the validator
           // that I don't see a way to call it.  For now just gold the current
           // index.
           expect(tagSpec.attrLists[0]).toEqual(15);
         });
    }

    // cdata
    if (tagSpec.cdata !== null) {
      let usefulCdataSpec = false;
      // max_bytes
      it('max_bytes are greater than or equal to -2', () => {
        expect(tagSpec.cdata.maxBytes).toBeGreaterThan(-3);
      });
      if (tagSpec.cdata.maxBytes >= 0) {
        usefulCdataSpec = true;
        it('max_bytes > 0 must have max_bytes_spec_url defined', () => {
          expect(tagSpec.cdata.maxBytesSpecUrl).toBeDefined();
        });
      }
      // disallowed_cdata_regex
      for (const disallowedCdataRegex of tagSpec.cdata.disallowedCdataRegex) {
        it('disallowed_cdata_regex valid and error_message defined', () => {
          usefulCdataSpec = true;

          expect(disallowedCdataRegex.regex).toBeDefined();
          expect(isValidRegex(disallowedCdataRegex.regex)).toBe(true);
          expect(disallowedCdataRegex.errorMessage).toBeDefined();
        });
        it('disallowed_cdata_regex must have unicode named groups', () => {
          const regex = rules.internedStrings[-1 - disallowedCdataRegex.regex];

          expect(isMissingUnicodeGroup(regex)).toBe(false);
        });
      }

      // css_spec
      if (tagSpec.cdata.cssSpec !== null) {
        usefulCdataSpec = true;
        const atRuleSpecNameIsUnique = {};
        const atRuleSpecRegex = new RegExp('[a-z-_]*');
        const parsingSpec = validator.GenCssParsingConfig().atRuleSpec;
        for (const atRuleSpec of tagSpec.cdata.cssSpec.atRuleSpec) {
          // Must be a lower case alphabetic name.
          it('at_rule_spec must be lower case alphabetic', () => {
            expect(atRuleSpecRegex.test(atRuleSpec.name)).toBe(true);
          });
          it('at_rule_spec must have matching css parsing spec', () => {
            // If this fails, you probably need to update the mapping in
            // GenCssParsingConfig to add support for your new at rule.
            expect(parsingSpec[atRuleSpec.name]).toBeDefined();
          });
          if (atRuleSpec.mediaQuerySpec !== null) {
            it('only media atrule contains mediaQuerySpec', () => {
              expect(atRuleSpec.name === 'media');
            });
          }
          it('unique at_rule_spec name', () => {
            expect(atRuleSpecNameIsUnique.hasOwnProperty(atRuleSpec.name))
                .toBe(false);
            atRuleSpecNameIsUnique[atRuleSpec.name] = 0;
          });
        }
      }

      if (tagSpec.tagName === 'SCRIPT' || tagSpec.tagName === 'STYLE') {
        it('script and style tags must have cdata rules', () => {
          expect(
              (tagSpec.cdata.disallowedCdataRegex.length > 0) ||
              tagSpec.cdata.cdataRegex !== null ||
              tagSpec.cdata.mandatoryCdata !== null ||
              tagSpec.cdata.maxBytes === -1 ||
              tagSpec.cdata.whitespaceOnly !== null ||
              tagSpec.cdata.cssSpec.validateKeyframes)
              .toBe(true);
        });
      }
      // We want to be certain not to allow SCRIPT tagspecs which don't either
      // define a src attribute OR define a JSON, OCTET-STREAM, or TEXT/PLAIN
      // type. Note that OCTET-STREAM scripts can only be used during SwG
      // Encryption (go/swg-encryption).
      if (tagSpec.tagName === 'SCRIPT') {
        let hasSrc = false;
        let hasJson = false;
        let hasTextPlain = false;
        let hasOctetStream = false;
        let hasCiphertext = false;
        let hasAmpOnerror = false;
        for (const attrSpecId of tagSpec.attrs) {
          if (attrSpecId < 0) {
            continue;
          }
          const attrSpec = rules.attrs[attrSpecId];
          if (attrSpec.name === 'src') {
            hasSrc = true;
          }
          if (attrSpec.name === 'ciphertext') {
            hasCiphertext = true;
          }
          if (attrSpec.name === 'type' && attrSpec.valueCasei.length > 0) {
            for (const value of attrSpec.valueCasei) {
              if (value === 'application/ld+json' ||
                  value === 'application/json') {
                hasJson = true;
              }
              if (value === 'application/octet-stream') {
                hasOctetStream = true;
              }
              if (value == 'text/plain') {
                hasTextPlain = true;
              }
            }
          }
          if (attrSpec.name === 'amp-onerror') {
            hasAmpOnerror = true;
          }
        }
        it('script tags must have either a src attribute or type json, ' +
               'octet-stream (during SwG encryption), or text/plain',
           () => {
             expect(
                 hasSrc || hasJson || hasTextPlain ||
                 (hasOctetStream && hasCiphertext) ||
                 hasAmpOnerror).toBe(true);
           });
      }
      // cdata_regex and mandatory_cdata
      if ((tagSpec.cdata.cdataRegex !== null) ||
          (tagSpec.cdata.mandatoryCdata !== null)) {
        usefulCdataSpec = true;
      }
      it('a cdata spec must be defined', () => {
        expect(usefulCdataSpec).toBeDefined();
      });
      it('cdata_regex must have unicode named groups', () => {
        const regex = rules.internedStrings[-1 - tagSpec.cdata.cdataRegex];

        expect(isMissingUnicodeGroup(regex)).toBe(false);
      });

      // reference_points
      it('reference_point defined', () => {
        for (const referencePoint of tagSpec.referencePoints) {
          expect(allReferencePoints.hasOwnProperty(referencePoint.tagSpecName))
              .toBe(true);
        }
      });
    }
    // attr_specs within each tag_spec within rules.
    for (const attrSpecId of tagSpec.attrs) {
      if (attrSpecId < 0) {
        continue;
      }
      const attrSpec = rules.attrs[attrSpecId];
      attrRuleShouldMakeSense(attrSpec, tagSpec, rules);
    }
  }

  // satisfies needs to match up with requires and excludes
  const allSatisfies = [];
  const allRequiresAndExcludes = [];
  for (const tagSpec of rules.tags) {
    for (const condition of tagSpec.requires) {
      allRequiresAndExcludes.push(condition);
    }
    for (const condition of tagSpec.excludes) {
      allRequiresAndExcludes.push(condition);
    }
    for (const condition of tagSpec.satisfies) {
      allSatisfies.push(condition);
    }
  }
  validator.sortAndUniquify(allSatisfies);
  validator.sortAndUniquify(allRequiresAndExcludes);
  it('all conditions are both required and satisfied', () => {
    expect(validator.subtractDiff(allSatisfies, allRequiresAndExcludes))
        .toEqual([]);
    expect(validator.subtractDiff(allRequiresAndExcludes, allSatisfies))
        .toEqual([]);
  });

  // Verify that for every error code in our enum, we have exactly one format
  // and specificity value in the rules.
  const errorSpecificityIsUnique = {};
  it('Two specificity rules found for same error code', () => {
    for (const errorSpecificity of rules.errorSpecificity) {
      expect(errorSpecificityIsUnique.hasOwnProperty(errorSpecificity.code))
          .toBe(false);
      errorSpecificityIsUnique[errorSpecificity.code] = 0;
    }
  });

  const errorFormatIsUnique = {};
  it('Two error format string rules found for same error code', () => {
    for (const errorFormat of rules.errorFormats) {
      expect(errorFormatIsUnique.hasOwnProperty(errorFormat.code)).toBe(false);
      errorFormatIsUnique[errorFormat.code] = 0;
    }
  });
});
