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
goog.require('amp.validator.HtmlFormat');
goog.require('amp.validator.ValidationError');
goog.require('amp.validator.annotateWithErrorCategories');
goog.require('amp.validator.createRules');
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
    return false;  // If there's neither a file nor a directory.
  }
}

/**
 * @param {null|string} regex
 * @return {boolean}
 */
function isValidRegex(regex) {
  var testRegex = null;
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
  var wordGroupRegex = new RegExp("\\\\w(?!\\\\p{L}\\\\p{N}_)");
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
  /** @type {string} */
  this.expectedOutput =
      fs.readFileSync(absolutePathFor(this.expectedOutputFile), 'utf8').trim();
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
      rendered += ' ';
    rendered += '^~~~~~~~~\n';
    rendered += renderErrorWithPosition(filename, error);
  }
  while (linesEmitted < lines.length) {
    rendered += '\n|  '+ lines[linesEmitted++];
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
    const expectedOutput = 'FAIL\n' +
        'http://google.com/foo.html:28:3 Only AMP runtime \'script\' tags ' +
        'are allowed, and only in the document head. (see ' +
        'https://www.ampproject.org/docs/reference/spec#html-tags) ' +
        '[CUSTOM_JAVASCRIPT_DISALLOWED]\n' +
        'http://google.com/foo.html:29:3 Only AMP runtime \'script\' tags ' +
        'are allowed, and only in the document head. (see ' +
        'https://www.ampproject.org/docs/reference/spec#html-tags) ' +
        '[CUSTOM_JAVASCRIPT_DISALLOWED]';
    if (observed !== expectedOutput)
      assert.fail(
          '', '', 'expected:\n' + expectedOutput + '\nsaw:\n' + observed, '');
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
    test.inlineOutput = false;
    test.ampHtmlFileContents =
        test.ampHtmlFileContents.replace('.replaceme {}', maxBytes);
    test.expectedOutput = 'PASS';
    test.run();
  });

  it('will not accept 50001 bytes in author stylesheet - one too many', () => {
    const oneTooMany = Array(5001).join(validStyleBlob) + ' ';
    assertStrictEqual(50001, oneTooMany.length);
    const test = new ValidatorTestCase('feature_tests/css_length.html');
    test.inlineOutput = false;
    test.ampHtmlFileContents =
        test.ampHtmlFileContents.replace('.replaceme {}', oneTooMany);
    test.expectedOutputFile = null;
    test.expectedOutput = 'FAIL\n' +
        'feature_tests/css_length.html:28:2 The author stylesheet specified ' +
        'in tag \'style amp-custom\' is too long - we saw 50001 bytes ' +
        'whereas the limit is 50000 bytes. ' +
        '(see https://www.ampproject.org/docs/reference/spec' +
        '#maximum-size) [AUTHOR_STYLESHEET_PROBLEM]';
    test.run();
  });

  it('knows utf8 and rejects file w/ 50002 bytes but 49999 characters', () => {
    const multiByteSheet = Array(5000).join(validStyleBlob) + 'h {a: 😺}';
    assertStrictEqual(49999, multiByteSheet.length);  // character length
    const test = new ValidatorTestCase('feature_tests/css_length.html');
    test.inlineOutput = false;
    test.ampHtmlFileContents =
        test.ampHtmlFileContents.replace('.replaceme {}', multiByteSheet);
    test.expectedOutputFile = null;
    test.expectedOutput = 'FAIL\n' +
        'feature_tests/css_length.html:28:2 The author stylesheet specified ' +
        'in tag \'style amp-custom\' is too long - we saw 50002 bytes ' +
        'whereas the limit is 50000 bytes. ' +
        '(see https://www.ampproject.org/docs/reference/spec' +
        '#maximum-size) [AUTHOR_STYLESHEET_PROBLEM]';
    test.run();
  });
});

describe('CssLength', () => {
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
               .CssLength(  // screen size in ancient Rome.
                   'ix unciae', /* allowAuto */ false, /* allowFluid */ false)
               .isValid)
        .toBe(false);
  });

  it('recognizes auto if allowed', () => {
    {  // allow_auto = false with input != auto
      const parsed = new amp.validator.CssLength(
          '1', /* allowAuto */ false, /* allowFluid */ false);
      expect(parsed.isValid).toBe(true);
      expect(parsed.isAuto).toBe(false);
    } {// allow_auto = true with input != auto
       const parsed = new amp.validator.CssLength(
           '1', /* allowAuto */ true, /* allowFluid */ false);
       expect(parsed.isValid).toBe(true);
       expect(parsed.isAuto)
           .toBe(false);} {  // allow_auto = false with input = auto
      const parsed = new amp.validator.CssLength(
          'auto', /* allowAuto */ false, /* allowFluid */ false);
      expect(parsed.isValid).toBe(false);
    } {// allow_auto = true with input = auto
       const parsed = new amp.validator.CssLength(
           'auto', /* allowAuto */ true, /* allowFluid */ false);
       expect(parsed.isValid).toBe(true); expect(parsed.isAuto).toBe(true);}
  });

  it('recognizes fluid if allowed', () => {
    {  // allow_fluid = false with input != fluid
      const parsed = new amp.validator.CssLength(
          '1', /* allowAuto */ false, /* allowFluid */ false);
      expect(parsed.isValid).toBe(true);
      expect(parsed.isFluid).toBe(false);
    } {// allow_fluid = true with input != fluid
       const parsed = new amp.validator.CssLength(
           '1', /* allowAuto */ false, /* allowFluid */ true);
       expect(parsed.isValid).toBe(true);
       expect(parsed.isFluid)
           .toBe(false);} {  // allow_fluid = false with input = fluid
      const parsed = new amp.validator.CssLength(
          'fluid', /* allowAuto */ false, /* allowFluid */ false);
      expect(parsed.isValid).toBe(false);
    } {// allow_fluid = true with input = fluid
       const parsed = new amp.validator.CssLength(
           'fluid', /* allowAuto */ false, /* allowFluid */ true);
       expect(parsed.isValid).toBe(true); expect(parsed.isFluid).toBe(true);}
  });
});

/**
 * Helper for ValidatorRulesMakeSense.
 * @param {!amp.validator.AttrSpec} attrSpec
 * @param {!amp.validator.ValidatorRules} rules
 */
function attrRuleShouldMakeSense(attrSpec, rules) {
  const attrSpecNameRegex = new RegExp('[^A-Z]+');
  // name
  it('attr_spec name defined', () => {
    expect(attrSpec.name).toBeDefined();
    // Attribute Spec names are matched against lowercased attributes,
    // so the rules *must* also be lower case or non-cased.
    expect(attrSpecNameRegex.test(attrSpec.name)).toBe(true);
  });
  if (attrSpec.valueUrl !== null) {
    const allowedProtocolRegex = new RegExp('[a-z-]+');
    // UrlSpec allowed_protocols are matched against lowercased protocol names
    // so the rules *must* also be lower case.
    it('allowed_protocol must be lower case', () => {
      for (const allowedProtocol of attrSpec.valueUrl.allowedProtocol) {
        expect(allowedProtocolRegex.test(allowedProtocol)).toBe(true);
      }
    });
    // If disallowed_domain is whatever.ampproject.org then
    // allow_relative must be false. Otherwise relative URLs would be
    // rejected for domain whatever.ampproject.org because that is
    // used as the base URL to parse the relative URL.
    if ((attrSpec.valueUrl.allowRelative !== null) &&
        attrSpec.valueUrl.allowRelative) {
      // allow_relative is true, check to see if whatever.ampproject.org is a
      // disallowed_domain.
      it('allow_relative can not be true if ' +
          'disallowed_domain is whatever.ampproject.org',
         () => {
           for (const disallowedDomain of attrSpec.valueUrl.disallowedDomain) {
             expect(disallowedDomain !== 'whatever.ampproject.org');
           }
         });
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
  if (attrSpec.blacklistedValueRegex !== null) {
    it('blacklisted_value_regex valid', () => {
      const regex = rules.internedStrings[-1 - attrSpec.blacklistedValueRegex];
      expect(isValidRegex(regex)).toBe(true);
    });
    it('blacklisted_value_regex must have unicode named groups', () => {
      const regex = rules.internedStrings[-1 - attrSpec.blacklistedValueRegex];
      expect(isMissingUnicodeGroup(regex)).toBe(false);
    });
  }
  // value_url must have at least one allowed protocol.
  if (attrSpec.valueUrl !== null) {
    it('value_url must have at least one allowed protocol', () => {
      expect(attrSpec.valueUrl.allowedProtocol.length).toBeGreaterThan(0);
    });
  }
  // only has one of value set.
  let numValues = 0;
  if (attrSpec.value !== null) numValues += 1;
  if (attrSpec.valueCasei !== null) numValues += 1;
  if (attrSpec.valueRegex !== null) numValues += 1;
  if (attrSpec.valueRegexCasei !== null) numValues += 1;
  if (attrSpec.valueUrl !== null) numValues += 1;
  if (attrSpec.valueProperties !== null) numValues += 1;
  it('attr_spec only has one value set', () => {
    expect(numValues).toBeLessThan(2);
  });
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
      expect(attrSpec.mandatory).toBeDefined();
      expect(attrSpec.mandatory).toBe(true);
    });
  }
  // Value property names must be unique.
  if (attrSpec.valueProperties !== null) {
    var seenPropertySpecNames = {};
    it('value_properties must be unique', () => {
      for (const propertySpec of attrSpec.valueProperties.properties) {
        expect(seenPropertySpecNames.hasOwnProperty(propertySpec.name))
            .toBe(false);
        seenPropertySpecNames[propertySpec.name] = 0;
      }
    });
  }
}

// Test which verifies some constraints on the rules file which the validator
// depends on, but which proto parser isn't robust enough to verify.
describe('ValidatorRulesMakeSense', () => {
  const rules = amp.validator.createRules();

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
  it('min_validator_revision_required defined', () => {
    expect(rules.minValidatorRevisionRequired).toBeGreaterThan(0);
  });
  it('template_spec_url is set', () => {
    expect(rules.templateSpecUrl === null).toBe(false);
  });

  // For verifying that all ReferencePoint::tag_spec_names will resolve to a
  // TagSpec that's marked REFERENCE_POINT.
  const allReferencePoints = {};
  for (const tagSpec of rules.tags) {
    if (tagSpec.tagName === '$REFERENCE_POINT') {
      allReferencePoints[tagSpec.specName] = 0;
    }
  }

  // tag_specs
  const specNameIsUnique = {};
  const tagWithoutSpecNameIsUnique = {};
  const tagNameRegex =
      new RegExp('(!DOCTYPE|O:P|[A-Z0-9-]+|\\$REFERENCE_POINT)');
  const mandatoryParentRegex = new RegExp('(!DOCTYPE|\\$ROOT|[A-Z0-9-]+)');
  const disallowedAncestorRegex = new RegExp('[A-Z0-9-]+');
  for (const tagSpec of rules.tags) {
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
        const specName = tagSpec.extensionSpec.name + ' extension .js script';
        expect(specNameIsUnique.hasOwnProperty(specName)).toBe(false);
        specNameIsUnique[specName] = 0;
      } else {
        expect(tagWithoutSpecNameIsUnique.hasOwnProperty(tagSpec.tagName))
            .toBe(false);
        tagWithoutSpecNameIsUnique[tagSpec.tagName] = 0;
      }
    });
    if ((tagSpec.tagName.indexOf('AMP-') === 0) &&
        ((tagSpec.htmlFormat.length === 0) ||
         (tagSpec.htmlFormat.indexOf(
              amp.validator.HtmlFormat.Code.AMP4ADS) !== -1))) {
      // AMP4ADS Creative Format document is the source of this whitelist.
      // https://github.com/ampproject/amphtml/blob/master/extensions/amp-a4a/amp-a4a-format.md#amp-extensions-and-builtins
      const whitelistedAmp4AdsExtensions = {
        'AMP-ACCORDION': 0,
        'AMP-AD-EXIT': 0,
        'AMP-ANALYTICS': 0,
        'AMP-ANIM': 0,
        'AMP-ANIMATION': 0,
        'AMP-AUDIO': 0,
        'AMP-CAROUSEL': 0,
        'AMP-FIT-TEXT': 0,
        'AMP-FONT': 0,
        'AMP-FORM': 0,
        'AMP-GWD-ANIMATION': 0,
        'AMP-IMG': 0,
        'AMP-LAYOUT': 0,
        'AMP-PIXEL': 0,
        'AMP-POSITION-OBSERVER': 0,
        'AMP-SOCIAL-SHARE': 0,
        'AMP-VIDEO': 0,
        'AMP-YOUTUBE': 0
      };
      it(tagSpec.tagName + ' has html_format either explicitly or implicitly' +
          ' set for AMP4ADS but ' + tagSpec.tagName + ' is not whitelisted' +
          ' for AMP4ADS', () => {
        expect(whitelistedAmp4AdsExtensions.hasOwnProperty(tagSpec.tagName))
            .toBe(true);
      });
    }
    // mandatory_parent
    if (tagSpec.mandatoryParent !== null) {
      it('mandatory parent tag name defined', () => {
        expect(mandatoryParentRegex.test(tagSpec.mandatoryParent)).toBe(true);
      });
    }
    // disallowed_ancestor must be a upper case alphabetic name.
    it('disallowed_ancestor defined and not equal to mandatory parent', () => {
      for (const disallowedAncestor of tagSpec.disallowedAncestor) {
        expect(disallowedAncestorRegex.test(disallowedAncestor)).toBe(true);
        // Can't disallow an ancestor and require the same parent.
        if (tagSpec.mandatoryParent !== null) {
          expect(disallowedAncestor !== tagSpec.mandatoryParent).toBe(true);
        }
      }
    });
    // Can't have unique and unique_warning at the same time.
    it('unique and unique_warning can not be defined at the same time', () => {
      expect(tagSpec.unique && tagSpec.uniqueWarning).toBe(false);
    });

    // attr_specs within tag.
    let seenDispatchKey = false;
    const attrNameIsUnique = {};
    for (const attrSpecId of tagSpec.attrs) {
      if (attrSpecId < 0) {
        it('unique attr_name within tag_spec (simple attrs)', () => {
          const attrName = rules.internedStrings[-1 - attrSpecId];
          expect(attrNameIsUnique.hasOwnProperty(attrName)).toBe(false);
          attrNameIsUnique[attrName] = 0;
        });
        continue;
      }
      const attrSpec = rules.attrs[attrSpecId];

      // attr_name must be unique within tag_spec (no duplicates).
      it('unique attr_spec within tag_spec', () => {
        expect(attrSpec.name).toBeDefined();
        expect(attrNameIsUnique.hasOwnProperty(attrSpec.name)).toBe(false);
        attrNameIsUnique[attrSpec.name] = 0;
      });
      // Special check that every <script> tag with a src attribute has a
      // whitelist check on the attribute value.
      if (tagSpec.tagName === 'SCRIPT' && attrSpec.name === 'src') {
        it('every <script> tag with a src attribute has a whitelist check',
           () => {
             expect(attrSpec.value !== null ||
                    attrSpec.valueRegex !== null).toBe(true);
           });
      }
      // TagSpecs with an ExtensionSpec are extensions. We have a few
      // additional checks for these.
      if (tagSpec.extensionSpec !== null) {
        const extensionSpec = tagSpec.extensionSpec;
        it('extension must have a name field value', () => {
          expect(extensionSpec.name).toBeDefined();
        });
        it('extension ' + extensionSpec.name + ' must have at least two ' +
               'allowed_versions, latest and a numeric version, e.g `1.0`',
           () => {
             expect(extensionSpec.allowedVersions).toBeGreaterThan(1);
           });
        it('extension ' + extensionSpec.name + ' versions must be `latest` ' +
               'or a numeric value',
           () => {
             for (const versionString of extensionSpec.allowedVersions) {
               expect(versionString).toMatch(/^(latest|[0-9.])$/);
             }
             for (const versionString of extensionSpec.deprecatedVersions) {
               expect(versionString).toMatch(/^(latest|[0-9.])$/);
             }
           });
        it('extension ' + extensionSpec.name + ' deprecated_versions must be ' +
               'subset of allowed_versions',
           () => {
             var allowedVersions = {};
             for (const versionString of extensionSpec.allowedVersions) {
               expect(versionString).toMatch(/^(latest|[0-9.])$/);
             }
             for (const versionString of extensionSpec.deprecatedVersions) {
               expect(allowedVersions.hasOwnProperty(versionString)).toBe(true);
             }
           });
        it('extension ' + extensionSpec.name + ' must include the ' +
               'attr_list: "common-extension-attrs"` attr_list ',
           () => {
             expect(tagSpec.attrLists.length).toEqual(1);
             expect(tagSpec.attrLists[0]).toEqual('common-extension-attrs');
           });
      }

      if (attrSpec.dispatchKey) {
        it('tag_spec can not have more than one dispatch_key', () => {
          expect(seenDispatchKey).toBe(false);
          seenDispatchKey = true;
        });
      }
    }

    // cdata
    if (tagSpec.cdata !== null) {
      let usefulCdataSpec = false;
      // max_bytes
      it('max_bytes are greater than or equal to -1', () => {
        expect(tagSpec.cdata.maxBytes).toBeGreaterThan(-2);
      });
      if (tagSpec.cdata.maxBytes >= 0) {
        usefulCdataSpec = true;
        it('max_bytes > 0 must have max_bytes_spec_url defined', () => {
          expect(tagSpec.cdata.maxBytesSpecUrl).toBeDefined();
        });
      }
      // blacklisted_cdata_regex
      for (const blacklistedCdataRegex of tagSpec.cdata.blacklistedCdataRegex) {
        it('blacklisted_cdata_regex valid and error_message defined', () => {
          usefulCdataSpec = true;
          expect(blacklistedCdataRegex.regex).toBeDefined();
          expect(isValidRegex(blacklistedCdataRegex.regex)).toBe(true);
          expect(blacklistedCdataRegex.errorMessage).toBeDefined();
        });
        it('blacklisted_cdata_regex must have unicode named groups', () => {
          const regex = rules.internedStrings[-1 - blacklistedCdataRegex.regex];
          expect(isMissingUnicodeGroup(regex)).toBe(false);
        });
      }

      // css_spec
      if (tagSpec.cdata.cssSpec !== null) {
        usefulCdataSpec = true;
        let hasDefaultAtRuleSpec = false;
        const atRuleSpecNameIsUnique = {};
        const atRuleSpecRegex = new RegExp('[a-z-_]*');
        for (const atRuleSpec of tagSpec.cdata.cssSpec.atRuleSpec) {
          if (atRuleSpec.name === '$DEFAULT') {
            hasDefaultAtRuleSpec = true;
          } else {
            // Must be a lower case alphabetic name.
            it('at_rule_spec must be lower case alphabetic', () => {
              expect(atRuleSpecRegex.test(atRuleSpec.name)).toBe(true);
            });
          }
          it('unique at_rule_spec name', () => {
            expect(atRuleSpecNameIsUnique.hasOwnProperty(atRuleSpec.name))
                .toBe(false);
            atRuleSpecNameIsUnique[atRuleSpec.name] = 0;
          });
          it('at_rule_spec must have type defined', () => {
            expect(atRuleSpec.type).toBeDefined();
          });
        }
        it('at_rule_spec has default defined', () => {
          expect(hasDefaultAtRuleSpec).toBe(true);
        });
        it('at_rule_spec has image_url_spec defined', () => {
          expect(tagSpec.cdata.cssSpec.imageUrlSpec).toBeDefined();
        });
        it('at_rule_spec has font_url_spec defined', () => {
          expect(tagSpec.cdata.cssSpec.fontUrlSpec).toBeDefined();
        });
      }

      if (tagSpec.tagName === 'SCRIPT' || tagSpec.tagName === 'STYLE') {
        it('script and style tags must have cdata rules', () => {
          expect(
              (tagSpec.cdata.blacklistedCdataRegex.length > 0) ||
              tagSpec.cdata.cdataRegex !== null ||
              tagSpec.cdata.mandatoryCdata !== null ||
              tagSpec.cdata.cssSpec.validateKeyframes)
              .toBe(true);
        });
      }
      // cdata_regex and mandatory_cdata
      if ((tagSpec.cdata.cdataRegex !== null) ||
          (tagSpec.cdata.mandatoryCdata !== null)) {
        usefulCdataSpec = true;
      }
      it('a cdata spec must be defined', () => {
        expect(usefulCdataSpec).toBe(true);
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
  }

  // satisfies and requires need to match up
  var allSatisfies = [];
  var allRequires = [];
  for (const tagSpec of rules.tags) {
    for (const condition of tagSpec.requires) {
      allRequires.push(condition);
    }
    for (const condition of tagSpec.satisfies)
      allSatisfies.push(condition);
  }
  sortAndUniquify(allSatisfies);
  sortAndUniquify(allRequires);
  it('all conditions are both required and satisfied', ()=> {
    expect(subtractDiff(allSatisfies, allRequires)).toEqual([]);
    expect(subtractDiff(allRequires, allSatisfies)).toEqual([]);
  });

  // attr_specs within rules.
  for (const attrSpec of rules.attrs) {
    attrRuleShouldMakeSense(attrSpec, rules);
  }

  // Verify that for every error code in our enum, we have exactly one format
  // and specificity value in the rules.
  let numValidCodes = 0;
  for (const code in amp.validator.ValidationError.Code) {
    numValidCodes += 1;
  }
  let numErrorSpecificity = 0;
  const errorSpecificityIsUnique = {};
  it('Two specificity rules found for same error code', () => {
    for (const errorSpecificity of rules.errorSpecificity) {
      expect(errorSpecificityIsUnique.hasOwnProperty(errorSpecificity.code))
          .toBe(false);
      errorSpecificityIsUnique[errorSpecificity.code] = 0;
      numErrorSpecificity += 1;
    }
  });
  it('Some error codes are missing specificity rules', () => {
    expect(numValidCodes == numErrorSpecificity).toBe(true);
  });
  let numErrorFormat = 0;
  const errorFormatIsUnique = {};
  it('Two error format string rules found for same error code', () => {
    for (const errorFormat of rules.errorFormats) {
      expect(errorFormatIsUnique.hasOwnProperty(errorFormat.code)).toBe(false);
      errorFormatIsUnique[errorFormat.code] = 0;
      numErrorFormat += 1;
    }
  });
  it('Some error codes are missing format strings', () => {
    expect(numValidCodes == numErrorFormat).toBe(true);
  });
});
