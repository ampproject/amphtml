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
goog.require('amp.validator.createRules');
goog.require('amp.validator.renderValidationResult');
goog.require('amp.validator.validateString');

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
 * Returns all html files underneath the testdata roots. This looks
 * both for feature_tests/*.html and for tests in extension directories.
 * E.g.: extensions/amp-accordion/0.1/test/*.html and
 *       testdata/feature_tests/amp_accordion.html.
 * @return {!Array<string>}
 */
function findHtmlFilesRelativeToTestdata() {
  const testSubdirs = [];
  for (const root of process.env['TESTDATA_ROOTS'].split(':')) {
    if (path.basename(root) === 'extensions') {
      for (const extension of readdir(root)) {
        const testPath = path.join(extension, '0.1', 'test');
        if (isdir(path.join(root, testPath))) {
          testSubdirs.push({root: root, subdir: testPath});
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
      fs.readFileSync(absolutePathFor(this.expectedOutputFile), 'utf8').trim();
};

/**
 * Runs the test, by executing the AMP Validator, then comparing its output
 * against the golden file content.
 */
ValidatorTestCase.prototype.run = function() {
  const results =
      amp.validator.validateString(this.ampHtmlFileContents, this.htmlFormat);
  amp.validator.annotateWithErrorCategories(results);
  const observed =
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

describe('ValidatorTestdata', () => {
  it('reports data-amp-report-test values', () => {
    const result = amp.validator.validateString(
        '<!doctype lemur data-amp-report-test="foo">');
    assertStrictEqual(
        result.status, amp.validator.ValidationResult.Status.FAIL);
    assertStrictEqual('foo', result.errors[0].dataAmpReportTestValue);
  });
});

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
    const test = new ValidatorTestCase(
        'feature_tests/no_custom_js.html',
        'http://google.com/foo.html#development=1');
    test.expectedOutputFile = null;
    test.expectedOutput = 'FAIL\n' +
        'http://google.com/foo.html:28:3 The tag \'script\' is disallowed ' +
        'except in specific forms. [CUSTOM_JAVASCRIPT_DISALLOWED]\n' +
        'http://google.com/foo.html:29:3 The tag \'script\' is disallowed ' +
        'except in specific forms. [CUSTOM_JAVASCRIPT_DISALLOWED]';
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
    test.expectedOutput = 'FAIL\n' +
        'feature_tests/css_length.html:28:2 The author stylesheet specified ' +
        'in tag \'style amp-custom\' is too long - we saw 50001 bytes ' +
        'whereas the limit is 50000 bytes. ' +
        '(see https://www.ampproject.org/docs/reference/spec.html' +
        '#maximum-size) [AUTHOR_STYLESHEET_PROBLEM]';
    test.run();
  });

  it('knows utf8 and rejects file w/ 50002 bytes but 49999 characters', () => {
    const multiByteSheet = Array(5000).join(validStyleBlob) + 'h {a: 😺}';
    assertStrictEqual(49999, multiByteSheet.length);  // character length
    const test = new ValidatorTestCase('feature_tests/css_length.html');
    test.ampHtmlFileContents =
        test.ampHtmlFileContents.replace('.replaceme {}', multiByteSheet);
    test.expectedOutputFile = null;
    test.expectedOutput = 'FAIL\n' +
        'feature_tests/css_length.html:28:2 The author stylesheet specified ' +
        'in tag \'style amp-custom\' is too long - we saw 50002 bytes ' +
        'whereas the limit is 50000 bytes. ' +
        '(see https://www.ampproject.org/docs/reference/spec.html' +
        '#maximum-size) [AUTHOR_STYLESHEET_PROBLEM]';
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

/**
 * Helper for ValidatorRulesMakeSense.
 * @param {!amp.validator.AttrSpec} attrSpec
 */
function attrRuleShouldMakeSense(attrSpec) {
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
  // blacklisted_value_regex
  if (attrSpec.blacklistedValueRegex !== null) {
    it('blacklisted_value_regex valid', () => {
      expect(isValidRegex(attrSpec.blacklistedValueRegex)).toBe(true);
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
    it('value or value_casei defined when dispatch_key is true', () => {
      expect((attrSpec.value !== null) || (attrSpec.valueCasei !== null))
          .toBe(true);
    });
    if (attrSpec.valueCasei !== null) {
      it('value_casei must be lower case when dispatch_key is true', () => {
        expect(attrSpec.valueCasei === attrSpec.valueCasei.toLowerCase())
            .toBe(true);
      });
    }
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
  it('attr_lists defined', () => {
    expect(rules.attrLists.length).toBeGreaterThan(0);
  });
  it('min_validator_revision_required defined', () => {
    expect(rules.minValidatorRevisionRequired).toBeGreaterThan(0);
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
      } else {
        expect(tagWithoutSpecNameIsUnique.hasOwnProperty(tagSpec.tagName))
            .toBe(false);
        tagWithoutSpecNameIsUnique[tagSpec.tagName] = 0;
      }
    });
    if (tagSpec.tagName./*OK*/ startsWith('AMP-')) {
      it('AMP- tags have html_format', () => {
        expect(tagSpec.htmlFormat.length).toBeGreaterThan(0);
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

    // attr_specs
    let seenDispatchKey = false;
    const attrNameIsUnique = {};
    for (const attrSpec of tagSpec.attrs) {
      attrRuleShouldMakeSense(attrSpec);
      // attr_name must be unique within tag_spec (no duplicates).
      it('unique attr_spec within tag_spec', () => {
        expect(attrSpec.name).toBeDefined();
        expect(attrNameIsUnique.hasOwnProperty(attrSpec.name)).toBe(false);
        attrNameIsUnique[attrSpec.name] = 0;
      });
      // Special check that every <script> tag with a src attribute has a
      // whitelist check on the attribute value.
      if (tagSpec.tagName === 'script' && attrSpec.name === 'src') {
        it('every <script> tag with a src attribute has a whitelist check',
           () => {
             expect(attrSpec.value || attrSpec.valueRegex).toBe(true);
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
      it('blacklisted_cdata_regex valid and error_message defined', () => {
        for (const blacklistedCdataRegex of
                 tagSpec.cdata.blacklistedCdataRegex) {
          usefulCdataSpec = true;
          expect(blacklistedCdataRegex.regex).toBeDefined();
          expect(isValidRegex(blacklistedCdataRegex.regex)).toBe(true);
          expect(blacklistedCdataRegex.errorMessage).toBeDefined();
        }
      });

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

      if (tagSpec.tagName === 'script' || tagSpec.tagName === 'style') {
        it('script and style tags must have cdata rules', () => {
          expect(
              (tagSpec.cdata.blacklistedCdataRegex.length > 0) ||
              tagSpec.cdata.cdataRegex !== null ||
              tagSpec.cdata.mandatoryCdata !== null)
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

      // reference_points
      it('reference_point defined', () => {
        for (const referencePoint of tagSpec.referencePoints) {
          expect(allReferencePoints.hasOwnProperty(referencePoint.tagSpecName))
              .toBe(true);
        }
      });
    }
  }

  // attr_lists
  const attrListNameIsUnique = {};
  for (const attrList of rules.attrLists) {
    it('unique attr_list name', () => {
      expect(attrListNameIsUnique.hasOwnProperty(attrList.name)).toBe(false);
      attrListNameIsUnique[attrList.name] = 0;
    });
    it('attr_list has attrs', () => {
      expect(attrList.attrs.length).toBeGreaterThan(0);
    });
    for (const attrSpec of attrList.attrs) {
      attrRuleShouldMakeSense(attrSpec);
    }
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
