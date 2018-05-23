/**
 * @license
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
goog.provide('amp.validator.ValidatorRulesTest');

goog.require('amp.validator.HtmlFormat');
goog.require('amp.validator.ValidationError');
goog.require('amp.validator.createRules');

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
 * Helper for sorting attributes.
 * @param {string} a
 * @param {string} b
 * @return {number}
 */
function compareAttrNames(a, b) {
  // amp-bind attributes (e.g. "[name]") should be after other attributes.
  if (a.startsWith('[') && !b.startsWith('[')) {return 1;}
  if (!a.startsWith('[') && b.startsWith('[')) {return -1;}
  if (a < b) {return -1;}
  if (a > b) {return 1;}
  return 0;
}


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
    // If allowed_protocol is http then allow_relative should not be false
    // except for `data-` attributes.
    if (!attrSpec.name.startsWith('data-')) {
      for (const allowedProtocol of attrSpec.valueUrl.allowedProtocol) {
        if ((allowedProtocol === 'http') &&
            (attrSpec.valueUrl.allowRelative !== null)) {
          it('allow_relative can not be false if allowed_protocol is http: ' +
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
  if (attrSpec.value !== null) {numValues += 1;}
  if (attrSpec.valueCasei !== null) {numValues += 1;}
  if (attrSpec.valueRegex !== null) {numValues += 1;}
  if (attrSpec.valueRegexCasei !== null) {numValues += 1;}
  if (attrSpec.valueUrl !== null) {numValues += 1;}
  if (attrSpec.valueProperties !== null) {numValues += 1;}
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
    const seenPropertySpecNames = {};
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
  if (process.env['UPDATE_VALIDATOR_TEST'] === '1') { return; }
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

  // Verify at most one css_length_spec defined per html_format and that the
  // html_format is never UNKNOWN_CODE.
  const cssLengthSpecs = {};
  for (const cssLengthSpec of rules.cssLengthSpec) {
    it('html_format should never be set to UNKNOWN_CODE', () => {
      expect(
          cssLengthSpec.htmlFormat ===
          amp.validator.HtmlFormat.Code.UNKNOWN_CODE)
          .toBe(false);
    });
    it('css_length_spec defined only at most once per html_format', () => {
      expect(cssLengthSpecs.hasOwnProperty(cssLengthSpec.htmlFormat))
          .toBe(false);
      cssLengthSpecs[cssLengthSpec.htmlFormat] = 0;
    });
  }

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
    // Helper for message output, set a tagspec_name in this order:
    // 1. tagSpec.specName, 2. tagSpec.tagName, 3. UNKNOWN_TAGSPEC.
    const tagSpecName =
        tagSpec.specName || tagSpec.tagName || 'UNKNOWN_TAGSPEC';

    // html_format is never UNKNOWN_CODE.
    it('html_format should never be set to UNKNOWN_CODE', () => {
      expect(
          tagSpec.htmlFormat.indexOf(
              amp.validator.HtmlFormat.Code.UNKNOWN_CODE) === -1)
          .toBe(true);
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
        const specName = tagSpec.extensionSpec.name + ' extension .js script';

        expect(specNameIsUnique.hasOwnProperty(specName)).toBe(false);
        specNameIsUnique[specName] = 0;
      } else {
        expect(tagWithoutSpecNameIsUnique.hasOwnProperty(tagSpec.tagName))
            .toBe(false);
        tagWithoutSpecNameIsUnique[tagSpec.tagName] = 0;
      }
    });
    // Verify AMP4ADS extensions are whitelisted.
    if ((tagSpec.tagName.indexOf('SCRIPT') === 0) && tagSpec.extensionSpec &&
        ((tagSpec.htmlFormat.length === 0) ||
         (tagSpec.htmlFormat.indexOf(
             amp.validator.HtmlFormat.Code.AMP4ADS) !== -1))) {
      // AMP4ADS Creative Format document is the source of this whitelist.
      // https://github.com/ampproject/amphtml/blob/master/extensions/amp-a4a/amp-a4a-format.md#amp-extensions-and-builtins
      const whitelistedAmp4AdsExtensions = {
        'amp-accordion': 0,
        'amp-ad-exit': 0,
        'amp-analytics': 0,
        'amp-anim': 0,
        'amp-animation': 0,
        'amp-audio': 0,
        'amp-bind': 0,
        'amp-carousel': 0,
        'amp-fit-text': 0,
        'amp-font': 0,
        'amp-form': 0,
        'amp-gwd-animation': 0,
        'amp-img': 0,
        'amp-layout': 0,
        'amp-mustache': 0,
        'amp-pixel': 0,
        'amp-position-observer': 0,
        'amp-social-share': 0,
        'amp-video': 0,
        'amp-youtube': 0,
      };
      const extension = tagSpec.extensionSpec.name;
      it(extension + ' has html_format either explicitly or implicitly' +
          ' set for AMP4ADS but ' + extension + ' is not whitelisted' +
          ' for AMP4ADS', () => {
        expect(whitelistedAmp4AdsExtensions.hasOwnProperty(extension))
            .toBe(true);
      });
    }
    // Verify AMP4EMAIL extensions are whitelisted.
    if ((tagSpec.tagName.indexOf('AMP-') === 0) &&
        ((tagSpec.htmlFormat.length === 0) ||
         (tagSpec.htmlFormat.indexOf(
             amp.validator.HtmlFormat.Code.AMP4EMAIL) !== -1))) {
      // AMP4EMAIL format is the source of this whitelist.
      const whitelistedAmp4EmailExtensions = {
        'AMP-ACCORDION': 0,
        'AMP-ANIM': 0,
        'AMP-CAROUSEL': 0,
        'AMP-FIT-TEXT': 0,
        'AMP-IMG': 0,
        'AMP-IMAGE-LIGHTBOX': 0,
        'AMP-LIGHTBOX': 0,
        'AMP-LIST': 0,
        'AMP-SELECTOR': 0,
        'AMP-SIDEBAR': 0,
        'AMP-STATE': 0,
        'AMP-TIMEAGO': 0,
      };
      it(tagSpec.tagName + ' has html_format either explicitly or implicitly' +
             ' set for AMP4EMAIL but ' + tagSpec.tagName +
             ' is not whitelisted' +
             ' for AMP4EMAIL',
      () => {
        expect(
            whitelistedAmp4EmailExtensions.hasOwnProperty(tagSpec.tagName))
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
        it('unique attr_name within tag_spec \'' + tagSpecName + '\'', () => {
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
        const {extensionSpec} = tagSpec;
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
          const allowedVersions = {};
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
        it('tag_spec ' + tagSpecName + ' can not have more than one dispatch_key', () => {
          expect(seenDispatchKey).toBe(false);
          seenDispatchKey = true;
        });
      }
    }

    it('\'' + tagSpecName + '\' has attrs not sorted alphabetically by name', () => {
      const sortedAttrs = Object.keys(attrNameIsUnique).sort(compareAttrNames);

      expect(Object.keys(attrNameIsUnique)).toEqual(sortedAttrs);
    });

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
  sortAndUniquify(allSatisfies);
  sortAndUniquify(allRequiresAndExcludes);
  it('all conditions are both required and satisfied', () => {
    expect(subtractDiff(allSatisfies, allRequiresAndExcludes)).toEqual([]);
    expect(subtractDiff(allRequiresAndExcludes, allSatisfies)).toEqual([]);
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
