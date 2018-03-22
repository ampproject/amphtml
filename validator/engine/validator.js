/**
 * @license DEDUPE_ON_MINIFY
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
goog.provide('amp.validator.CssLength');  // Only for testing.
goog.provide('amp.validator.Terminal');
goog.provide('amp.validator.ValidationHandler');
goog.provide('amp.validator.annotateWithErrorCategories');
goog.provide('amp.validator.isSeverityWarning');
goog.provide('amp.validator.renderErrorMessage');
goog.provide('amp.validator.renderValidationResult');
goog.provide('amp.validator.validateSaxEvents');
goog.provide('amp.validator.validateString');
goog.require('amp.htmlparser.HtmlParser');
goog.require('amp.htmlparser.HtmlSaxHandlerWithLocation');
goog.require('amp.htmlparser.ParsedHtmlTag');
goog.require('amp.validator.AmpLayout');
goog.require('amp.validator.AtRuleSpec');
goog.require('amp.validator.AtRuleSpec.BlockType');
goog.require('amp.validator.AttrSpec');
goog.require('amp.validator.CdataSpec');
goog.require('amp.validator.CssSpec');
goog.require('amp.validator.ErrorCategory');
goog.require('amp.validator.ExtensionSpec');
goog.require('amp.validator.LIGHT');
goog.require('amp.validator.PropertySpecList');
goog.require('amp.validator.ReferencePoint');
goog.require('amp.validator.TagSpec');
goog.require('amp.validator.VALIDATE_CSS');
goog.require('amp.validator.ValidationError');
goog.require('amp.validator.ValidationError.Code');
goog.require('amp.validator.ValidationError.Severity');
goog.require('amp.validator.ValidationResult');
goog.require('amp.validator.ValidationResult.Status');
goog.require('amp.validator.ValidatorRules');
goog.require('amp.validator.createRules');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.string');
goog.require('goog.uri.utils');
goog.require('parse_css.BlockType');
goog.require('parse_css.ParsedCssUrl');
goog.require('parse_css.RuleVisitor');
goog.require('parse_css.extractUrls');
goog.require('parse_css.parseAStylesheet');
goog.require('parse_css.stripVendorPrefix');
goog.require('parse_css.tokenize');
goog.require('parse_css.validateAmp4AdsCss');
goog.require('parse_css.validateKeyframesCss');
goog.require('parse_srcset.SrcsetParsingResult');
goog.require('parse_srcset.parseSrcset');
goog.require('parse_url.URL');

/**
 * Sorts and eliminates duplicates in |arrayValue|. Modifies the input in place.
 * @param {!Array<T>} arrayValue
 * @template T
 */
function sortAndUniquify(arrayValue) {
  if (arrayValue.length < 2) return;

  goog.array.sort(arrayValue);
  var uniqIdx = 0;
  for (var i = 1; i < arrayValue.length; ++i) {
    if (arrayValue[i] === arrayValue[uniqIdx]) continue;
    uniqIdx++;
    if (uniqIdx !== i) arrayValue[uniqIdx] = arrayValue[i];
  }
  arrayValue.splice(uniqIdx + 1);
}

/**
 * Computes the difference set |left| - |right|, assuming |left| and
 * |right| are sorted and uniquified.
 * @param {!Array<T>} left
 * @param {!Array<T>} right
 * @return {!Array<T>} Computed difference of left - right.
 * @template T
 */
function subtractDiff(left, right) {
  let l = 0;
  let r = 0;
  const diff = [];
  while (l < left.length) {
    if (r >= right.length) {
      diff.push(left[l]);
      l++;
    } else if (right[r] > left[l]) {
      diff.push(left[l]);
      l++;
    } else if (right[r] < left[l]) {
      r++;
    } else {
      goog.asserts.assert(right[r] === left[l]);
      l++;
      r++;
    }
  }
  return diff;
}

/**
 * A line / column pair.
 * @private
 */
class LineCol {
  /**
   * @param {number} line
   * @param {number} col
   */
  constructor(line, col) {
    this.line_ = line;
    this.col_ = col;
  }

  /** @return {number} */
  getLine() {
    return this.line_;
  }

  /** @return {number} */
  getCol() {
    return this.col_;
  }
}

/** @type {!LineCol} */
const DOCUMENT_START = new LineCol(1, 0);

/**
 * Construct a ValidationError object from the given argument list.
 * @param {!amp.validator.ValidationError.Severity} severity
 * @param {!amp.validator.ValidationError.Code} validationErrorCode Error code
 * @param {!LineCol} lineCol a line / column pair.
 * @param {!Array<string>} params
 * @param {?string} specUrl a link (URL) to the amphtml spec
 * @return {!amp.validator.ValidationError}
 */
function populateError(
    severity, validationErrorCode, lineCol, params, specUrl) {
  const error = new amp.validator.ValidationError();
  error.severity = severity;
  error.code = validationErrorCode;
  error.params = params;
  error.line = lineCol.getLine();
  error.col = lineCol.getCol();
  error.specUrl = (specUrl === null ? '' : specUrl);
  return error;
}

/**
 * ParsedUrlSpec is used for both ParsedAttrSpec and ParsedCdataSpec, to
 * check URLs. The main logic is in ParsedUrlSpec.ValidateUrlAndProtocol,
 * which gets instantiated with two different adapter classes, which
 * emit errors either for URLs in attribute values or URLs in templates.
 * @private
 */
class ParsedUrlSpec {
  /**
   * Note that the spec can be null.
   * @param {amp.validator.UrlSpec} spec
   */
  constructor(spec) {
    /**
     * @type {amp.validator.UrlSpec}
     * @private
     */
    this.spec_ = spec;

    /**
     * @type {!Object<string, number>}
     * @private
     */
    this.allowedProtocols_ = Object.create(null);
    if (this.spec_ !== null) {
      for (const protocol of this.spec_.allowedProtocol) {
        this.allowedProtocols_[protocol] = 0;
      }
    }
  }

  /** @return {amp.validator.UrlSpec} */
  getSpec() {
    return this.spec_;
  }

  /**
   * @param {string} protocol
   * @return {boolean}
   */
  isAllowedProtocol(protocol) {
    return protocol in this.allowedProtocols_;
  }

  /**
   * @param {string} domain
   * @return {boolean}
   */
  isDisallowedDomain(domain) {
    for (const disallowedDomain of this.spec_.disallowedDomain) {
      if (goog.string./*OK*/ endsWith(domain, disallowedDomain)) {
        // If here, then we have three possibilities. For example purposes,
        // consider 'example.com' as the disallowedDomain.
        // 1) domain === 'example.com'      ->  isDisallowedDomain = true
        // 2) domain === 'www.example.com'  ->  isDisallowedDomain = true
        // 3) domain === 'someexample.com'  ->  isDisallowedDomain = false
        //
        // Case 1:
        if (domain === disallowedDomain) return true;

        // Case 2/3, determine if the character before the matching suffix
        // is a '.':
        return domain[domain.length - 1 - disallowedDomain.length] === '.';
      }
    }
    return false;
  }
}

/** @private */
class ParsedValueProperties {
  /** @param {!amp.validator.PropertySpecList} spec */
  constructor(spec) {
    /**
     * @type {!Object<string, !amp.validator.PropertySpec>}
     * @private
     */
    this.valuePropertyByName_ = Object.create(null);
    /**
     * @type {!Array<string>}
     * @private
     */
    this.mandatoryValuePropertyNames_ = [];

    for (const propertySpec of spec.properties) {
      this.valuePropertyByName_[propertySpec.name] = propertySpec;
      if (propertySpec.mandatory) {
        this.mandatoryValuePropertyNames_.push(propertySpec.name);
      }
    }
    goog.array.sort(this.mandatoryValuePropertyNames_);
  }

  /** @return {!Object<string, amp.validator.PropertySpec>} */
  getValuePropertyByName() {
    return this.valuePropertyByName_;
  }

  /** @return {!Array<string>} */
  getMandatoryValuePropertyNames() {
    return this.mandatoryValuePropertyNames_;
  }
}

/**
 * This wrapper class provides access to an AttrSpec and
 * an attribute id which is unique within its context
 * (e.g., it's unique within the ParsedTagSpec).
 * @private
 */
class ParsedAttrSpec {
  /**
   * @param {!amp.validator.AttrSpec} attrSpec
   * @param {number} attrId
   */
  constructor(attrSpec, attrId) {
    /**
     * JSON Attribute Spec dictionary.
     * @type {!amp.validator.AttrSpec}
     * @private
     */
    this.spec_ = attrSpec;

    /**
     * Globally unique attribute rule id.
     * @type {number}
     * @private
     */
    this.id_ = attrId;

    /**
     * @type {ParsedUrlSpec}
     * @private
     */
    this.valueUrlSpec_ = null;

    /**
     * @type {ParsedValueProperties}
     * @private
     */
    this.valueProperties_ = null;
  }

  /**
   * @return {number} unique for this attr spec.
   */
  getId() {
    return this.id_;
  }

  /**
   * @return {!amp.validator.AttrSpec}
   */
  getSpec() {
    return this.spec_;
  }

  /**
   * @return {!ParsedUrlSpec}
   */
  getValueUrlSpec() {
    if (this.valueUrlSpec_ === null) {
      this.valueUrlSpec_ = new ParsedUrlSpec(this.spec_.valueUrl);
    }
    return this.valueUrlSpec_;
  }

  /**
   * @return {ParsedValueProperties}
   */
  getValuePropertiesOrNull() {
    if (this.spec_.valueProperties === null) return null;
    if (this.valueProperties_ === null) {
      this.valueProperties_ =
          new ParsedValueProperties(this.spec_.valueProperties);
    }
    return this.valueProperties_;
  }
}

/**
 * For creating error messages, we either find the specName in the tag spec or
 * fall back to the tagName.
 * @param {amp.validator.TagSpec} tagSpec TagSpec instance from the
 *   validator.protoscii file.
 * @return {string}
 * @private
 */
function getTagSpecName(tagSpec) {
  return (tagSpec.specName !== null) ? tagSpec.specName :
                                       tagSpec.tagName.toLowerCase();
}

/**
 * For creating error URLs, we either find the specUrl in the tag spec or fall
 * back to the extension spec URL if available.
 * @param {amp.validator.TagSpec|ParsedTagSpec} tagSpec
 * @return {string}
 * @private
 */
function getTagSpecUrl(tagSpec) {
  // Handle a ParsedTagSpec as well as a tag spec.
  // TODO(gregable): This is a bit hacky, we should improve on this approach
  // in the future.
  if (tagSpec.getSpec !== undefined) return getTagSpecUrl(tagSpec.getSpec());

  if (tagSpec.specUrl !== null) return tagSpec.specUrl;

  const extensionSpecUrlPrefix =
      'https://www.ampproject.org/docs/reference/components/';
  if (tagSpec.extensionSpec !== null && tagSpec.extensionSpec.name !== null)
    return extensionSpecUrlPrefix + tagSpec.extensionSpec.name;
  if (tagSpec.requiresExtension.length > 0) {
    // Return the first |requires_extension|, which should be the most
    // representitive.
    return extensionSpecUrlPrefix + tagSpec.requiresExtension[0];
  }

  return '';
}

/**
 * Holds the reference points for a particular parent tag spec, including
 * their resolved tagspec ids.
 * @private
 */
class ParsedReferencePoints {
  /**
   * @param {!amp.validator.TagSpec} parentTagSpec
   */
  constructor(parentTagSpec) {
    /**
     * @type {!amp.validator.TagSpec}
     * @private
     */
    this.parentTagSpec_ = parentTagSpec;
  }

  /** @return {!Array<!amp.validator.ReferencePoint>} */
  iterate() {
    return this.parentTagSpec_.referencePoints;
  }

  /** @return {boolean} */
  empty() {
    return this.size() === 0;
  }

  /** @return {number} */
  size() {
    return this.parentTagSpec_.referencePoints.length;
  }

  /** @return {?string} */
  parentSpecUrl() {
    return getTagSpecUrl(this.parentTagSpec_);
  }

  /** @return {string} */
  parentTagSpecName() {
    return getTagSpecName(this.parentTagSpec_);
  }
}

/**
 * TagSpecs specify attributes that are valid for a particular tag.
 * They can also reference lists of attributes (AttrLists), thereby
 * sharing those definitions. This abstraction instantiates
 * ParsedAttrSpec for each AttrSpec (from validator-*.protoascii, our
 * specification file) exactly once, and provides quick access to the
 * attr spec names as well, including for simple attr specs (those
 * which only have a name but no specification for their value).
 * @private
 */
class ParsedAttrSpecs {
  /**
   * @param {!amp.validator.ValidatorRules} rules
   */
  constructor(rules) {
    /** @type {!Array<!Array<number>>} */
    this.attrLists = rules.directAttrLists;

    /** @type {!Array<number>} */
    this.globalAttrs = rules.globalAttrs;

    /** @type {!Array<number>} */
    this.ampLayoutAttrs = rules.ampLayoutAttrs;

    /**
     * The AttrSpec instances, indexed by attr spec ids.
     * @private @type {!Array<!amp.validator.AttrSpec>}
     */
    this.attrSpecs_ = rules.attrs;

    /**
     * @private @type {!Array<!string>}
     */
    this.internedStrings_ = rules.internedStrings;

    /**
     * The already instantiated ParsedAttrSpec instances, indexed by
     * attr spec ids.
     * @private @type {!Array<!ParsedAttrSpec>}
     */
    this.parsedAttrSpecs_ = new Array(rules.attrs.length);
  }

  /**
   * @param {number} id
   * @return {!ParsedAttrSpec}
   */
  getByAttrSpecId(id) {
    if (this.parsedAttrSpecs_.hasOwnProperty(id)) {
      return this.parsedAttrSpecs_[id];
    }
    const parsed = new ParsedAttrSpec(this.attrSpecs_[id], id);
    this.parsedAttrSpecs_[id] = parsed;
    return parsed;
  }

  /**
   * @param {number} id
   * @return {!string}
   */
  getNameByAttrSpecId(id) {
    if (id < 0) {
      return this.internedStrings_[-1 - id];
    }
    return this.attrSpecs_[id].name;
  }
}

/**
 * This wrapper class provides access to a TagSpec and a tag id
 * which is unique within its context, the ParsedValidatorRules.
 * @private
 */
class ParsedTagSpec {
  /**
   * @param {!ParsedAttrSpecs} parsedAttrSpecs
   * @param {boolean} shouldRecordTagspecValidated
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {number} id
   */
  constructor(parsedAttrSpecs, shouldRecordTagspecValidated, tagSpec, id) {
    /**
     * @type {!amp.validator.TagSpec}
     * @private
     */
    this.spec_ = tagSpec;
    /**
     * @type {number}
     * @private
     */
    this.id_ = id;
    /**
     * @type {!ParsedReferencePoints}
     * @private
     */
    this.referencePoints_ = new ParsedReferencePoints(tagSpec);
    /**
     * @type {boolean}
     * @private
     */
    this.isReferencePoint_ = (tagSpec.tagName === '$REFERENCE_POINT');
    /**
     * @type {boolean}
     * @private
     */
    this.shouldRecordTagspecValidated_ = shouldRecordTagspecValidated;
    /**
     * ParsedAttributes keyed by name.
     * @type {!Object<string, number>}
     * @private
     */
    this.attrsByName_ = Object.create(null);
    /**
     * Attribute ids that are mandatory for this tag to legally validate.
     * @type {!Array<number>}
     * @private
     */
    this.mandatoryAttrIds_ = [];
    /**
     * @type {!Array<number>}
     * @private
     */
    this.mandatoryOneofs_ = [];
    /**
     * @type {!Array<number>}
     * @private
     */
    this.implicitAttrspecs_ = [];
    /**
     * @type {boolean}
     * @private
     */
    this.containsUrl_ = false;

    // Collect the attr spec ids for a given |tagspec|.
    // There are four ways to specify attributes:
    // (1) implicitly by a tag spec, if the tag spec has the amp_layout field
    // set - in this case, the AMP_LAYOUT_ATTRS are assumed;
    // (2) within a TagSpec::attrs;
    // (3) via TagSpec::attr_lists which references lists by key;
    // (4) within the $GLOBAL_ATTRS TagSpec::attr_list.
    // It's possible to provide multiple specifications for the same attribute
    // name, but for any given tag only one such specification can be active.
    // The precedence is (1), (2), (3), (4)

    // (1) layout attrs.
    if (tagSpec.ampLayout !== null && !this.isReferencePoint_) {
      this.mergeAttrs(parsedAttrSpecs.ampLayoutAttrs, parsedAttrSpecs);
    }
    // (2) attributes specified within |tagSpec|.
    this.mergeAttrs(tagSpec.attrs, parsedAttrSpecs);

    // (3) attributes specified via reference to an attr_list.
    for (const id of tagSpec.attrLists) {
      this.mergeAttrs(parsedAttrSpecs.attrLists[id], parsedAttrSpecs);
    }
    // (4) attributes specified in the global_attr list.
    if (!this.isReferencePoint_) {
      this.mergeAttrs(parsedAttrSpecs.globalAttrs, parsedAttrSpecs);
    }
    sortAndUniquify(this.mandatoryOneofs_);

    if (tagSpec.extensionSpec !== null) {
      this.expandExtensionSpec();
    }
  }

  /**
   * Called on a TagSpec which contains an ExtensionSpec, expands several
   * fields in the tag spec.
   */
  expandExtensionSpec() {
    const extensionSpec = this.spec_.extensionSpec;
    if (this.spec_.specName === null)
      this.spec_.specName = extensionSpec.name + ' extension .js script';
    this.spec_.mandatoryParent = 'HEAD';
    if (this.spec_.extensionSpec.deprecatedAllowDuplicates)
      this.spec_.uniqueWarning = true;
    else
      this.spec_.unique = true;

    if (amp.validator.VALIDATE_CSS) {
      this.spec_.cdata = new amp.validator.CdataSpec();
      this.spec_.cdata.whitespaceOnly = true;
    }
  }

  /**
   * Merges the list of attrs into attrsByName, avoiding to merge in attrs
   * with names that are already in attrsByName.
   * @param {!Array<number>} attrs
   * @param {!ParsedAttrSpecs} parsedAttrSpecs
   */
  mergeAttrs(attrs, parsedAttrSpecs) {
    for (const attrId of attrs) {
      const name = parsedAttrSpecs.getNameByAttrSpecId(attrId);
      if (name in this.attrsByName_) {
        continue;
      }
      this.attrsByName_[name] = attrId;
      if (attrId < 0) {  // negative attr ids are simple attrs (only name set).
        continue;
      }
      const attr = parsedAttrSpecs.getByAttrSpecId(attrId);
      const spec = attr.getSpec();
      if (spec.mandatory) {
        this.mandatoryAttrIds_.push(attrId);
      }
      if (spec.mandatoryOneof !== null) {
        this.mandatoryOneofs_.push(spec.mandatoryOneof);
      }
      for (const altName of spec.alternativeNames) {
        this.attrsByName_[altName] = attrId;
      }
      if (spec.implicit) {
        this.implicitAttrspecs_.push(attrId);
      }
      if (spec.valueUrl) {
        this.containsUrl_ = true;
      }
    }
  }

  /**
   * Return the numerical id.
   * @return {number}
   */
  id() {
    return this.id_;
  }

  /**
   * Return the original tag spec. This is the json object representation from
   * amp.validator.rules_.
   * @return {!amp.validator.TagSpec}
   */
  getSpec() {
    return this.spec_;
  }

  /**
   * If tag has a cdata spec, returns a CdataMatcher, else null.
   * @param {!LineCol} lineCol
   * @return {?CdataMatcher}
   */
  cdataMatcher(lineCol) {
    if (this.spec_.cdata !== null) return new CdataMatcher(this.spec_, lineCol);
    return null;
  }

  /**
   * If tag has a child_tag spec, returns a ChildTagMatcher, else null.
   * @param {!LineCol} lineCol
   * @return {?ChildTagMatcher}
   */
  childTagMatcher(lineCol) {
    if (this.spec_.childTags !== null)
      return new ChildTagMatcher(this.spec_, lineCol);
    return null;
  }

  /**
   * If tag has a reference_point spec, returns a ReferencePointMatcher,
   * else null.
   * @param {!ParsedValidatorRules} rules
   * @param {!LineCol} lineCol
   * @return {?ReferencePointMatcher}
   */
  referencePointMatcher(rules, lineCol) {
    if (this.hasReferencePoints())
      return new ReferencePointMatcher(rules, this.referencePoints_, lineCol);
    return null;
  }

  /**
   * Returns true if this tagSpec contains a value_url field.
   * @return {boolean}
   */
  containsUrl() {
    return this.containsUrl_;
  }

  /**
   * A TagSpec may specify other tags to be required as well, when that
   * tag is used. This accessor returns the IDs for the tagspecs that
   * are also required if |this| tag occurs in the document, but where
   * such requirement is currently only a warning.
   * @return {!Array<number>}
   */
  getAlsoRequiresTagWarning() {
    if (amp.validator.LIGHT) {
      return [];
    }
    return this.spec_.alsoRequiresTagWarning;
  }

  /**
   * A TagSpec may specify generic conditions which are required if the
   * tag is present. This accessor returns the list of those conditions.
   * @return {!Array<number>}
   */
  requires() {
    return this.spec_.requires;
  }

  /**
   * A TagSpec may specify that another tag is excluded. This accessor returns
   * the list of those tags.
   * @return {!Array<number>}
   */
  excludes() {
    return this.spec_.excludes;
  }

  /**
   * Whether or not the tag should be recorded via
   * Context.recordTagspecValidated_ if it was validated
   * successfullly. For performance, this is only done for tags that are
   * mandatory, unique, or possibly required by some other tag.
   * @return {boolean}
   */
  shouldRecordTagspecValidated() {
    return this.shouldRecordTagspecValidated_;
  }

  /** @return {boolean} */
  isReferencePoint() {
    return this.isReferencePoint_;
  }

  /** @return {boolean} */
  hasReferencePoints() {
    return !this.referencePoints_.empty();
  }

  /** @return {!ParsedReferencePoints} */
  getReferencePoints() {
    return this.referencePoints_;
  }

  /**
   * @param {string} name
   * @return {boolean}
   */
  hasAttrWithName(name) {
    return name in this.attrsByName_;
  }

  /**
   * @return {!Array<number>}
   */
  getImplicitAttrspecs() {
    return this.implicitAttrspecs_;
  }

  /**
   * @return {!Object<string, number>}
   */
  getAttrsByName() {
    return this.attrsByName_;
  }

  /**
   * @return {!Array<number>}
   */
  getMandatoryOneofs() {
    return this.mandatoryOneofs_;
  }

  /**
   * @return {!Array<number>}
   */
  getMandatoryAttrIds() {
    return this.mandatoryAttrIds_;
  }
}

/**
 * Determines if |n| is an integer.
 * @param {number} n
 * @return {boolean}
 */
function isInteger(n) {
  return (Number(n) === n) && (n % 1 === 0);
}

/**
 * Attempts to URI decode an attribute value. If URI decoding fails, it falls
 * back to calling unescape. We want to minimize the scope of this try/catch
 * to allow v8 to optimize more code.
 * @param {string} attrValue
 * @return {string}
 */
function decodeAttrValue(attrValue) {
  let decodedAttrValue;
  try {
    decodedAttrValue = decodeURIComponent(attrValue);
  } catch (e) {
    // This branch is best effort, since unescape is deprecated.
    // However unescape appears to work even if the value is not a
    // properly encoded attribute.
    // TODO(powdercloud): We're currently using this to prohibit
    // __amp_source_origin for URLs. We may want to introduce a
    // global bad url functionality with patterns or similar, as opposed
    // to applying this to every attribute that has a blacklisted value
    // regex.
    decodedAttrValue = unescape(attrValue);
  }
  return decodedAttrValue;
}

/**
 * Merge results from another ValidationResult while dealing with the UNKNOWN
 *   status.
 * @param {!amp.validator.ValidationResult} other
 */
amp.validator.ValidationResult.prototype.mergeFrom = function(other) {
  goog.asserts.assert(this.status !== null);
  goog.asserts.assert(other.status !== null);
  // Copy status only if fail. Failing is a terminal state.
  if (other.status === amp.validator.ValidationResult.Status.FAIL)
    this.status = amp.validator.ValidationResult.Status.FAIL;
  if (!amp.validator.LIGHT) {
    Array.prototype.push.apply(this.errors, other.errors);
  }
};

/**
 * Copies results from another ValidationResult.
 * @param {!amp.validator.ValidationResult} other
 */
amp.validator.ValidationResult.prototype.copyFrom = function(other) {
  goog.asserts.assert(this.status !== null);
  goog.asserts.assert(other.status !== null);
  this.status = other.status;
  if (!amp.validator.LIGHT) {
    let newErrors = [];
    Array.prototype.push.apply(newErrors, other.errors);
    this.errors = newErrors;
  }
};


/**
 * The child tag matcher evaluates ChildTagSpec. The constructor
 * provides the enclosing TagSpec for the parent tag so that we can
 * produce error messages mentioning the parent.
 * @private
 */
class ChildTagMatcher {
  /**
   * @param {!amp.validator.TagSpec} parentSpec
   * @param {!LineCol} lineCol
   */
  constructor(parentSpec, lineCol) {
    /**
     * @type {amp.validator.TagSpec}
     * @private
     */
    this.parentSpec_ = parentSpec;

    if (!amp.validator.LIGHT) {
      /**
       * @type {!LineCol}
       * @private
       */
      this.lineCol_ = lineCol;
    }

    goog.asserts.assert(this.parentSpec_.childTags !== null);
  }

  /** @return {!LineCol} */
  getLineCol() {
    if (amp.validator.LIGHT) return DOCUMENT_START;
    return this.lineCol_;
  }

  /**
   * @param {!amp.htmlparser.ParsedHtmlTag} encounteredTag
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} result
   */
  matchChildTagName(encounteredTag, context, result) {
    const childTags = this.parentSpec_.childTags;
    // Enforce child_tag_name_oneof: If at least one tag name is specified,
    // then the child tags of the parent tag must have one of the provided
    // tag names.
    if (childTags.childTagNameOneof.length > 0) {
      const names = childTags.childTagNameOneof;
      if (names.indexOf(encounteredTag.upperName()) === -1) {
        if (!amp.validator.LIGHT) {
          const allowedNames = '[\'' + names.join('\', \'') + '\']';
          context.addError(
              amp.validator.ValidationError.Code.DISALLOWED_CHILD_TAG_NAME,
              context.getLineCol(),
              /* params */
              [
                encounteredTag.lowerName(), getTagSpecName(this.parentSpec_),
                allowedNames.toLowerCase()
              ],
              getTagSpecUrl(this.parentSpec_), result);
        } else {
          result.status = amp.validator.ValidationResult.Status.FAIL;
          return;
        }
      }
    }
    // Enforce first_child_tag_name_oneof: If at least one tag name is
    // specified, then the first child of the parent tag must have one
    // of the provided tag names.
    if (childTags.firstChildTagNameOneof.length > 0 &&
        context.getTagStack().parentChildCount() === 0) {
      const names = childTags.firstChildTagNameOneof;
      if (names.indexOf(encounteredTag.upperName()) === -1) {
        if (!amp.validator.LIGHT) {
          const allowedNames = '[\'' + names.join('\', \'') + '\']';
          context.addError(
              amp.validator.ValidationError.Code
                  .DISALLOWED_FIRST_CHILD_TAG_NAME,
              context.getLineCol(),
              /* params */
              [
                encounteredTag.lowerName(), getTagSpecName(this.parentSpec_),
                allowedNames.toLowerCase()
              ],
              getTagSpecUrl(this.parentSpec_), result);
        } else {
          result.status = amp.validator.ValidationResult.Status.FAIL;
          return;
        }
      }
    }
  }

  /**
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} result
   */
  exitTag(context, result) {
    const expectedNumChildTags =
        this.parentSpec_.childTags.mandatoryNumChildTags;
    if (expectedNumChildTags !== -1 &&
        expectedNumChildTags !== context.getTagStack().parentChildCount()) {
      if (amp.validator.LIGHT) {
        result.status = amp.validator.ValidationResult.Status.FAIL;
        return;
      } else {
        context.addError(
            amp.validator.ValidationError.Code.INCORRECT_NUM_CHILD_TAGS,
            this.getLineCol(),
            /* params */
            [
              getTagSpecName(this.parentSpec_), expectedNumChildTags.toString(),
              context.getTagStack().parentChildCount().toString()
            ],
            getTagSpecUrl(this.parentSpec_), result);
        return;
      }
    }

    const expectedMinNumChildTags =
        this.parentSpec_.childTags.mandatoryMinNumChildTags;
    if (expectedMinNumChildTags !== -1 &&
        context.getTagStack().parentChildCount() < expectedMinNumChildTags) {
      if (amp.validator.LIGHT) {
        result.status = amp.validator.ValidationResult.Status.FAIL;
        return;
      } else {
        context.addError(
            amp.validator.ValidationError.Code.INCORRECT_MIN_NUM_CHILD_TAGS,
            this.getLineCol(),
            /* params */
            [
              getTagSpecName(this.parentSpec_),
              expectedMinNumChildTags.toString(),
              context.getTagStack().parentChildCount().toString()
            ],
            getTagSpecUrl(this.parentSpec_), result);
        return;
      }
    }
  }
}
/**
 * Return type tuple for ValidateTag.
 * @typedef {{ validationResult: !amp.validator.ValidationResult,
 *             bestMatchTagSpec: ?ParsedTagSpec }}
 */
let ValidateTagResult;

/**
 * A tag may initialize this ReferencePointMatcher with its reference points.
 * Then, the matcher will be invoked for each child tag via ::Match,
 * and eventually it will be invoked upon exiting the parent tag.
 * @private
 */
class ReferencePointMatcher {
  /**
   * @param {!ParsedValidatorRules} parsedValidatorRules
   * @param {!ParsedReferencePoints} parsedReferencePoints
   * @param {!LineCol} lineCol
   */
  constructor(parsedValidatorRules, parsedReferencePoints, lineCol) {
    /**
     * @type {!ParsedValidatorRules}
     * @private
     */
    this.parsedValidatorRules_ = parsedValidatorRules;

    /**
     * @type {!ParsedReferencePoints}
     * @private
     */
    this.parsedReferencePoints_ = parsedReferencePoints;

    if (!amp.validator.LIGHT) {
      /**
       * @type {!LineCol}
       * @private
       */
      this.lineCol_ = lineCol;
    }

    /**
     * @type {!Array<number>}
     * @private
     */
    this.referencePointsMatched_ = [];

    // Assert that this is not an empty reference point matcher.
    goog.asserts.assert(!parsedReferencePoints.empty());
  }

  /**
   * @return {!LineCol}
   */
  getLineCol() {
    if (amp.validator.LIGHT) return DOCUMENT_START;
    return this.lineCol_;
  }

  /**
   * This method gets invoked when matching a child tag of the parent
   * that is specifying / requiring the reference points. So
   * effectively, this method will try through the specified reference
   * points and record them in this.referencePointsMatched_.
   * @param {!amp.htmlparser.ParsedHtmlTag} tag
   * @param {!Context} context
   * @return {ValidateTagResult} result
   */
  validateTag(tag, context) {
    // Look for a matching reference point, if we find one, record and exit.
    let resultForBestAttempt = new amp.validator.ValidationResult();
    resultForBestAttempt.status = amp.validator.ValidationResult.Status.UNKNOWN;
    for (const p of this.parsedReferencePoints_.iterate()) {
      // p.tagSpecName here is actually a number, which was replaced in
      // validator_gen_js.py from the name string, so this works.
      const parsedTagSpec = context.getRules().getByTagSpecId(
          /** @type {!number} */ (p.tagSpecName));
      const resultForAttempt = validateTagAgainstSpec(
          parsedTagSpec, /*bestMatchReferencePoint=*/null, context, tag);
      if (context.getRules().betterValidationResultThan(
              resultForAttempt, resultForBestAttempt))
        resultForBestAttempt.copyFrom(resultForAttempt);
      if (resultForBestAttempt.status ===
          amp.validator.ValidationResult.Status.PASS) {
        return {
          validationResult: resultForBestAttempt,
          bestMatchTagSpec: parsedTagSpec
        };
      }
    }
    // This check cannot fail as a successful validation above exits early.
    goog.asserts.assert(
        resultForBestAttempt.status ===
        amp.validator.ValidationResult.Status.FAIL);
    if (amp.validator.LIGHT) {
      return {validationResult: resultForBestAttempt, bestMatchTagSpec: null};
    }
    // Special case: only one reference point defined - emit a singular
    // error message *and* merge in the errors from the best attempt above.
    if (this.parsedReferencePoints_.size() === 1) {
      context.addError(
          amp.validator.ValidationError.Code
              .CHILD_TAG_DOES_NOT_SATISFY_REFERENCE_POINT_SINGULAR,
          context.getLineCol(),
          /*params*/
          [
            tag.lowerName(), this.parsedReferencePoints_.parentTagSpecName(),
            this.parsedValidatorRules_.getReferencePointName(
                this.parsedReferencePoints_.iterate()[0])
          ],
          this.parsedReferencePoints_.parentSpecUrl(), resultForBestAttempt);
      return {validationResult: resultForBestAttempt, bestMatchTagSpec: null};
    }
    // General case: more than one reference point defined. Emit a plural
    // message with the acceptable reference points listed.
    const acceptable = [];
    for (const p of this.parsedReferencePoints_.iterate()) {
      acceptable.push(this.parsedValidatorRules_.getReferencePointName(p));
    }
    let resultForMultipleAttempts = new amp.validator.ValidationResult();
    context.addError(
        amp.validator.ValidationError.Code
            .CHILD_TAG_DOES_NOT_SATISFY_REFERENCE_POINT,
        context.getLineCol(),
        /*params*/
        [
          tag.lowerName(), this.parsedReferencePoints_.parentTagSpecName(),
          acceptable.join(', ')
        ],
        this.parsedReferencePoints_.parentSpecUrl(), resultForMultipleAttempts);
    return {
      validationResult: resultForMultipleAttempts,
      bestMatchTagSpec: null
    };
  }

  /**
   * @param {!ParsedTagSpec} parsedTagSpec
   */
  recordMatch(parsedTagSpec) {
    this.referencePointsMatched_.push(parsedTagSpec.id());
  }

  /**
   * This method gets invoked when we're done with processing all the
   * child tags, so now we can determine whether any reference points
   * remain unsatisfied or duplicate.
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} result
   */
  exitParentTag(context, result) {
    /** @type {!Array<number>} */
    const referencePointByCount = [];
    for (const r of this.referencePointsMatched_) {
      referencePointByCount[r] = referencePointByCount.hasOwnProperty(r) ?
          (referencePointByCount[r] + 1) :
          1;
    }
    for (const p of this.parsedReferencePoints_.iterate()) {
      // p.tagSpecName here is actually a number, which was replaced in
      // validator_gen_js.py from the name string, so this works.
      const RefPointTagSpecId = /** @type {number} */ (p.tagSpecName);
      if (p.mandatory &&
          !referencePointByCount.hasOwnProperty(RefPointTagSpecId)) {
        if (amp.validator.LIGHT) {
          result.status = amp.validator.ValidationResult.Status.FAIL;
          return;
        }
        context.addError(
            amp.validator.ValidationError.Code
                .MANDATORY_REFERENCE_POINT_MISSING,
            this.getLineCol(),
            /*params*/
            [
              this.parsedValidatorRules_.getReferencePointName(p),
              this.parsedReferencePoints_.parentTagSpecName()
            ],
            this.parsedReferencePoints_.parentSpecUrl(), result);
      }
      if (p.unique && referencePointByCount.hasOwnProperty(RefPointTagSpecId) &&
          referencePointByCount[RefPointTagSpecId] !== 1) {
        if (amp.validator.LIGHT) {
          result.status = amp.validator.ValidationResult.Status.FAIL;
          return;
        }
        context.addError(
            amp.validator.ValidationError.Code.DUPLICATE_REFERENCE_POINT,
            this.getLineCol(),
            /*params*/
            [
              this.parsedValidatorRules_.getReferencePointName(p),
              this.parsedReferencePoints_.parentTagSpecName()
            ],
            this.parsedReferencePoints_.parentSpecUrl(), result);
      }
    }
  }

  /**
   * @return {!Array<number>}
   */
  getReferencePointsMatched() {
    return this.referencePointsMatched_;
  }

  /**
   * @return {!ParsedReferencePoints}
   */
  getParsedReferencePoints() {
    return this.parsedReferencePoints_;
  }
}

// Instances of this class specify which tag names (|allowedTags|)
// are allowed as descendent tags of a particular tag (|tagName|).
/**
 * @typedef {{ tagName: string,
 *             allowedTags: !Array<string>}}
 */
let DescendantConstraints;

/**
 * tagSpec and referencePoint are the ParsedTagSpecs that best matched the
 * stack entry. May be null. May not fully match.
 * @typedef {{ tagName: string,
 *             tagSpec: ?ParsedTagSpec,
 *             referencePoint: ?ParsedTagSpec,
 *             hasDescendantConstraintLists: boolean,
 *             numChildren: number,
 *             onlyChildTagName: string,
 *             onlyChildErrorLineCol: LineCol,
 *             lastChildTagName: string,
 *             lastChildUrl: string,
 *             lastChildErrorLineCol: LineCol,
 *             cdataMatcher: ?CdataMatcher,
 *             childTagMatcher: ?ChildTagMatcher,
 *             referencePointMatcher: ?ReferencePointMatcher }}
 */
let TagStackEntry;

/**
 * This abstraction keeps track of the tag names and ChildTagMatchers
 * as we enter / exit tags in the document. Closing tags is tricky:
 * - We assume that all end tags are optional and we close, that is, pop off
 *   tags our stack, lazily as we encounter parent closing tags. This part
 *   differs slightly from the behavior per spec: instead of closing an
 *   <option> tag when a following <option> tag is seen, we close it when the
 *   parent closing tag (in practice <select>) is encountered.
 * @private
 */
class TagStack {
  /** Creates an empty instance. */
  constructor() {
    /**
     * The current tag name and its parents.
     * @type {!Array<TagStackEntry>}
     * @private
     */
    this.stack_ = [];

    // // We always have one element on the stack. This simplifies certain
    // checks, for example, allowing us to guarantee we can always return a
    // value for parent().
    this.stack_.push(this.createNewTagStackEntry('$ROOT'));

    /**
     * @type {!Array<DescendantConstraints>}
     * @private
     */
    this.allowedDescendantsList_ = [];
  }

  /**
   * @param {string} tagName
   * @return {TagStackEntry} a new TagStackEntry.
   */
  createNewTagStackEntry(tagName) {
    return {
      tagName: tagName,
      tagSpec: null,
      referencePoint: null,
      hasDescendantConstraintLists: false,
      numChildren: 0,
      onlyChildTagName: '',
      onlyChildErrorLineCol: null,
      lastChildSiblingCount: 0,
      lastChildTagName: '',
      lastChildUrl: '',
      lastChildErrorLineCol: null,
      cdataMatcher: null,
      childTagMatcher: null,
      referencePointMatcher: null
    };
  }

  /**
   * Enter a tag, opening a scope for child tags.
   * @param {string} tagName
   * @param {!ValidateTagResult} referencePointResult
   * @param {!ValidateTagResult} tagResult
   */
  enterTag(tagName, referencePointResult, tagResult) {
    let stackEntry = this.createNewTagStackEntry(tagName);
    stackEntry.referencePoint = referencePointResult.bestMatchTagSpec;
    stackEntry.tagSpec = tagResult.bestMatchTagSpec;
    this.stack_.push(stackEntry);
  }

  /**
   * Upon exiting a tag, validation for the current child tag matcher is
   * triggered, e.g. for checking that the tag had some specified number
   * of children.
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} result
   */
  exitTag(context, result) {
    goog.asserts.assert(this.stack_.length > 0, 'Exiting an empty tag stack.');

    this.unSetDescendantConstraintList();
    const topStackEntry = this.back_();
    if (topStackEntry.childTagMatcher !== null) {
      topStackEntry.childTagMatcher.exitTag(context, result);
    }
    if (topStackEntry.referencePointMatcher !== null) {
      topStackEntry.referencePointMatcher.exitParentTag(context, result);
    }
    this.stack_.pop();

  }

  /**
   * Given a ValidateTagResult, update the tag stack entry at the top of the
   * tag stack to add any constraints from the spec.
   * @param {!ValidateTagResult} result
   * @param {!ParsedValidatorRules} parsedRules
   * @param {!LineCol} lineCol
   * @private
   */
  updateStackEntryFromTagResult_(result, parsedRules, lineCol) {
    if (result.bestMatchTagSpec === null) return;
    const parsedTagSpec = result.bestMatchTagSpec;

    this.setReferencePointMatcher(
        parsedTagSpec.referencePointMatcher(parsedRules, lineCol));

    // The following only add new constraints, not new allowances, so
    // only add the constraints if the validation passed.
    if (result.validationResult.status ===
        amp.validator.ValidationResult.Status.PASS) {
      this.setChildTagMatcher(parsedTagSpec.childTagMatcher(lineCol));
      this.setCdataMatcher(parsedTagSpec.cdataMatcher(lineCol));
      this.setDescendantConstraintList(parsedTagSpec, parsedRules);
    }
  }

  /**
   * Update tagstack state after validating an encountered tag. Called with the
   * best matching specs, even if not a match.
   * @param {!amp.htmlparser.ParsedHtmlTag} encounteredTag
   * @param {!ValidateTagResult} referencePointResult
   * @param {!ValidateTagResult} tagResult
   * @param {!ParsedValidatorRules} parsedRules
   * @param {!LineCol} lineCol
   */
  updateFromTagResults(
      encounteredTag, referencePointResult, tagResult, parsedRules, lineCol) {
    // Keep track of the number of direct children this tag has, even as we
    // pop in and out of them on the stack.
    this.parentStackEntry_().numChildren++;

    // Record in the parent element that a reference point has been satisfied,
    // even if the reference point didn't match completely.
    if (referencePointResult.bestMatchTagSpec !== null) {
      goog.asserts.assert(this.parentReferencePointMatcher() !== null);
      this.parentReferencePointMatcher().recordMatch(
          /** @type{!ParsedTagSpec} */ (referencePointResult.bestMatchTagSpec));
    }

    // The following only add new constraints, not new allowances, so
    // only add the constraints if the validation passed.
    if (tagResult.validationResult.status ===
        amp.validator.ValidationResult.Status.PASS) {
      const parsedTagSpec = tagResult.bestMatchTagSpec;
      const tagSpec = parsedTagSpec.getSpec();
      // Record that this tag must not have any siblings.
      if (tagSpec.siblingsDisallowed) {
        this.tellParentNoSiblingsAllowed(tagSpec.tagName, lineCol);
      }

      // Record that this tag must be the last child of it's parent.
      if (tagSpec.mandatoryLastChild) {
        this.tellParentImTheLastChild(
            getTagSpecName(tagSpec), getTagSpecUrl(tagSpec), lineCol);
      }
    }

    // Add the tag to the stack, and then update the stack entry.
    this.enterTag(encounteredTag.upperName(), referencePointResult, tagResult);

    this.updateStackEntryFromTagResult_(
        referencePointResult, parsedRules, lineCol);
    this.updateStackEntryFromTagResult_(tagResult, parsedRules, lineCol);
  }

  /**
   * Alias to the last element on the tag stack.
   * @return {TagStackEntry}
   * @private
   */
  back_() {
    goog.asserts.assert(this.stack_.length > 0, 'Exiting an empty tag stack.');
    return this.stack_[this.stack_.length - 1];
  }


  /**
   * Sets the child tag matcher for the tag currently on the stack.
   * @param {?ChildTagMatcher} matcher
   */
  setChildTagMatcher(matcher) {
    if (matcher !== null) this.back_().childTagMatcher = matcher;
  }

  /**
   * @param {boolean} value
   */
  setHasDescendantConstraintLists(value) {
    this.back_().hasDescendantConstraintLists = value;
  }

  /**
   * Sets the cdata matcher for the tag currently on the stack.
   * @param {?CdataMatcher} matcher
   */
  setCdataMatcher(matcher) {
    if (matcher !== null) this.back_().cdataMatcher = matcher;
  }

  /**
   * Returns the cdata matcher for the tag currently on the stack. If there
   * is no cdata matcher, returns null.
   * @return {?CdataMatcher}
   */
  cdataMatcher() {
    return this.back_().cdataMatcher;
  }

  /**
   * Sets the reference point matcher for the tag currently on the stack.
   * @param {?ReferencePointMatcher} matcher
   */
  setReferencePointMatcher(matcher) {
    if (matcher !== null) this.back_().referencePointMatcher = matcher;
  }

  /**
   * @return {?ReferencePointMatcher}
   */
  parentReferencePointMatcher() {
    return this.parentStackEntry_().referencePointMatcher;
  }

  /**
   * This method is called as we're visiting a tag; so the matcher we
   * need here is the one provided/specified for the tag parent.
   * @param {!amp.htmlparser.ParsedHtmlTag} encounteredTag
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} result
   */
  matchChildTagName(encounteredTag, context, result) {
    const matcher = this.parentStackEntry_().childTagMatcher;
    if (matcher !== null)
      matcher.matchChildTagName(encounteredTag, context, result);
  }

  /**
   * The parent of the current stack entry.
   * @return {TagStackEntry}
   * @private
   */
  parentStackEntry_() {
    goog.asserts.assert(
        this.stack_.length >= 1, 'Parent of empty $ROOT tag requested.');
    return this.back_();
  }

  /**
   * The name of the parent of the current tag.
   * @return {string}
   */
  parentTagName() {
    return this.parentStackEntry_().tagName;
  }

  /**
   * The number of children that have been discovered up to now by traversing
   * the stack.
   * @return {number}
   */
  parentChildCount() {
    return this.parentStackEntry_().numChildren;
  }

  /**
   * Tells the parent of the current stack entry that it can only have 1 child
   * and that child must be me (the current stack entry).
   * @param {string} tagName The current stack entry's tag name.
   * @param {!LineCol} lineCol
   */
  tellParentNoSiblingsAllowed(tagName, lineCol) {
    this.parentStackEntry_().onlyChildTagName = tagName;
    this.parentStackEntry_().onlyChildErrorLineCol = lineCol;
  }

  /**
   * @return {!LineCol} The LineCol of the tag that set the rule.
   */
  parentOnlyChildErrorLineCol() {
    return /** @type {!LineCol} */ (
        this.parentStackEntry_().onlyChildErrorLineCol);
  }

  /**
   * @return {string} The name of the tag that set the 'no siblings allowed'
   * rule.
   */
  parentOnlyChildTagName() {
    return this.parentStackEntry_().onlyChildTagName;
  }

  /**
   * @return {boolean} true if this tag's parent has a child with 'no siblings
   * allowed' rule. Else false.
   */
  parentHasChildWithNoSiblingRule() {
    return this.parentOnlyChildTagName().length > 0;
  }

  /**
   * Tells the parent of the current stack entry that its last child must be me
   * (the current stack entry).
   * @param {string} tagName The current stack entry's tag name.
   * @param {string} url The current stack entry's spec url.
   * @param {!LineCol} lineCol
   */
  tellParentImTheLastChild(tagName, url, lineCol) {
    this.parentStackEntry_().lastChildTagName = tagName;
    this.parentStackEntry_().lastChildErrorLineCol = lineCol;
    this.parentStackEntry_().lastChildUrl = url;
  }

  /**
   * @return {!LineCol} The LineCol of the tag that set the 'last child' rule.
   */
  parentLastChildErrorLineCol() {
    return /** @type {!LineCol} */ (
        this.parentStackEntry_().lastChildErrorLineCol);
  }

  /**
   * @return {string} The name of the tag with the 'last child' rule.
   */
  parentLastChildTagName() {
    return this.parentStackEntry_().lastChildTagName;
  }

  /**
   * @return {string} The spec url of the last child.
   */
  parentLastChildUrl() {
    return this.parentStackEntry_().lastChildUrl;
  }

  /**
   * @return {boolean} true if this tag's parent has a child with 'last child'
   * rule. Else false.
   */
  parentHasChildWithLastChildRule() {
    return this.parentLastChildTagName().length > 0;
  }

  /**
   * Returns true if the current tag has ancestor with the given tag name or
   * specName.
   * @param {string} ancestor
   * @return {boolean}
   */
  hasAncestor(ancestor) {
    // Skip the first element, which is "$ROOT".
    for (let i = 1; i < this.stack_.length; ++i) {
      if (this.stack_[i].tagName === ancestor) {
        return true;
      }
      if ((this.stack_[i].tagSpec !== null) &&
          (this.stack_[i].tagSpec.getSpec().specName === ancestor)) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param {!ParsedTagSpec} parsedTagSpec
   * @param {!ParsedValidatorRules} parsedRules
   * tagName.
   */
  setDescendantConstraintList(parsedTagSpec, parsedRules) {
    if (parsedTagSpec.getSpec().descendantTagList === null) return;

    let allowedDescendantsForThisTag = [];
    for (const descendantTagList of parsedRules.getDescendantTagLists()) {
      // Get the list matching this tag's descendant tag name.
      if (parsedTagSpec.getSpec().descendantTagList ===
          descendantTagList.name) {
        for (const tag of descendantTagList.allowedTags) {
          allowedDescendantsForThisTag.push(tag);
        }
      }
    }

    this.allowedDescendantsList_.push(
        {tagName: getTagSpecName(parsedTagSpec.getSpec()),
         allowedTags: allowedDescendantsForThisTag});
    this.setHasDescendantConstraintLists(true);
  }

  /**
   * @return {boolean} true if the tag introduced descendant constraints.
   * Else false.
   */
  hasDescendantConstraintLists() {
    return this.back_().hasDescendantConstraintLists;
  }

  /**
   * Updates the allowed descendants list if a tag introduced constraints. This
   * is called when exiting a tag.
   */
  unSetDescendantConstraintList() {
    if (this.hasDescendantConstraintLists()) {
      this.allowedDescendantsList_.pop();
      this.setHasDescendantConstraintLists(false);
    }
  }

  /**
   * @return {!Array<DescendantConstraints>}
   */
  allowedDescendantsList() {
    return this.allowedDescendantsList_;
  }
}

/**
 * Returns true if the given AT rule is considered valid.
 * @param {!amp.validator.CssSpec} cssSpec
 * @param {string} atRuleName
 * @return {boolean}
 */
function isAtRuleValid(cssSpec, atRuleName) {
  let defaultType = '';

  for (const atRuleSpec of cssSpec.atRuleSpec) {
    if (atRuleSpec.name === '$DEFAULT') {
      defaultType = atRuleSpec.type;
    } else if (atRuleSpec.name === parse_css.stripVendorPrefix(atRuleName)) {
      return atRuleSpec.type !==
          amp.validator.AtRuleSpec.BlockType.PARSE_AS_ERROR;
    }
  }

  goog.asserts.assert(defaultType !== '');
  return defaultType !== amp.validator.AtRuleSpec.BlockType.PARSE_AS_ERROR;
}

/**
 * Returns true if the given Declaration is considered valid.
 * @param {!amp.validator.CssSpec} cssSpec
 * @param {string} declarationName
 * @return {boolean}
 */
function IsDeclarationValid(cssSpec, declarationName) {
  if (cssSpec.allowedDeclarations.length === 0) return true;
  return cssSpec.allowedDeclarations.indexOf(
             parse_css.stripVendorPrefix(declarationName)) > -1;
}

/**
 * Returns a string of the allowed Declarations.
 * @param {!amp.validator.CssSpec} cssSpec
 * @return {string}
 */
function AllowedDeclarationsString(cssSpec) {
  if (cssSpec.allowedDeclarations.length > 5) return '';
  return '[\'' + cssSpec.allowedDeclarations.join('\', \'') + '\']';
}

/** @private */
class InvalidRuleVisitor extends parse_css.RuleVisitor {
  /**
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.CssSpec} cssSpec
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} result
   */
  constructor(tagSpec, cssSpec, context, result) {
    super();
    /** @type {!amp.validator.TagSpec} */
    this.tagSpec = tagSpec;
    /** @type {!amp.validator.CssSpec} */
    this.cssSpec = cssSpec;
    /** @type {!Context} */
    this.context = context;
    /** @type {!amp.validator.ValidationResult} */
    this.result = result;
  }

  /** @inheritDoc */
  visitAtRule(atRule) {
    if (!isAtRuleValid(this.cssSpec, atRule.name)) {
      if (amp.validator.LIGHT) {
        this.result.status = amp.validator.ValidationResult.Status.FAIL;
      } else {
        this.context.addError(
            amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_AT_RULE,
            new LineCol(atRule.line, atRule.col),
            /* params */[getTagSpecName(this.tagSpec), atRule.name],
            /* url */ '', this.result);
      }
    }
  }

  /** @inheritDoc */
  visitDeclaration(declaration) {
    if (!IsDeclarationValid(this.cssSpec, declaration.name)) {
      if (amp.validator.LIGHT) {
        this.result.status = amp.validator.ValidationResult.Status.FAIL;
      } else {
        const allowedDeclarationsStr = AllowedDeclarationsString(this.cssSpec);
        if (allowedDeclarationsStr === '') {
          this.context.addError(
              amp.validator.ValidationError.Code
                  .CSS_SYNTAX_INVALID_PROPERTY_NOLIST,
              new LineCol(declaration.line, declaration.col),
              /* params */[getTagSpecName(this.tagSpec), declaration.name],
              /* url */ '', this.result);

        } else {
          this.context.addError(
              amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_PROPERTY,
              new LineCol(declaration.line, declaration.col),
              /* params */
              [
                getTagSpecName(this.tagSpec), declaration.name,
                AllowedDeclarationsString(this.cssSpec)
              ],
              /* url */ '', this.result);
        }
      }
    }
  }
}

/**
 * @typedef {{ atRuleSpec: !Object<string, parse_css.BlockType>,
 *             defaultSpec: parse_css.BlockType }}
 */
let CssParsingConfig;

/**
 * Generates a CssParsingConfig from a CssSpec.
 * @param {!amp.validator.CssSpec} cssSpec
 * @return {!CssParsingConfig}
 */
function computeCssParsingConfig(cssSpec) {
  /** @type {!Object<string, parse_css.BlockType>} */
  const ampAtRuleParsingSpec = Object.create(null);
  for (const atRuleSpec of cssSpec.atRuleSpec) {
    if (atRuleSpec.type === amp.validator.AtRuleSpec.BlockType.PARSE_AS_ERROR ||
        atRuleSpec.type ===
            amp.validator.AtRuleSpec.BlockType.PARSE_AS_IGNORE) {
      ampAtRuleParsingSpec[atRuleSpec.name] =
          parse_css.BlockType.PARSE_AS_IGNORE;
    } else if (
        atRuleSpec.type === amp.validator.AtRuleSpec.BlockType.PARSE_AS_RULES) {
      ampAtRuleParsingSpec[atRuleSpec.name] =
          parse_css.BlockType.PARSE_AS_RULES;
    } else if (
        atRuleSpec.type ===
        amp.validator.AtRuleSpec.BlockType.PARSE_AS_DECLARATIONS) {
      ampAtRuleParsingSpec[atRuleSpec.name] =
          parse_css.BlockType.PARSE_AS_DECLARATIONS;
    } else {
      goog.asserts.fail('Unrecognized atRuleSpec type: ' + atRuleSpec.type);
    }
  }
  const config = {
    atRuleSpec: ampAtRuleParsingSpec,
    defaultSpec: parse_css.BlockType.PARSE_AS_IGNORE
  };
  if (cssSpec.atRuleSpec.length > 0) {
    config.defaultSpec = ampAtRuleParsingSpec['$DEFAULT'];
  }
  return config;
}

/**
 * CdataMatcher maintains a constraint to check which an opening tag
 * introduces: a tag's cdata matches constraints set by it's cdata
 * spec. Unfortunately we need to defer such checking and can't
 * handle it while the opening tag is being processed.
 * TODO(powdercloud): Separate out a ParsedCdataSpec class.
 * @private
 */
class CdataMatcher {
  /**
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!LineCol} lineCol
   */
  constructor(tagSpec, lineCol) {
    /** @private @type {!amp.validator.TagSpec} */
    this.tagSpec_ = tagSpec;

    // The CDataMatcher in Javascript also keeps track of the line/column
    // information from the context when it was created. This is necessary
    // because this code does not have control over the advancement of the
    // DocLocator instance (in Context) over the document, so by the time
    // we know that there's something wrong with the cdata for a tag,
    // we've advanced past the tag. This information gets filled in
    // by Context.setCdataMatcher_.

    if (!amp.validator.LIGHT) {
      /** @private @type {!LineCol} */
      this.lineCol_ = lineCol;
    }
  }

  /**
   * Matches the provided cdata against what this CdataMatcher expects.
   * @param {string} cdata
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} validationResult
   */
  match(cdata, context, validationResult) {
    const cdataSpec = this.tagSpec_.cdata;
    if (cdataSpec === null) {
      return;
    }
    // Max CDATA Byte Length
    if (cdataSpec.maxBytes !== -1) {
      const bytes = byteLength(cdata);
      if (bytes > cdataSpec.maxBytes) {
        if (amp.validator.LIGHT) {
          validationResult.status = amp.validator.ValidationResult.Status.FAIL;
        } else {
          context.addError(
              amp.validator.ValidationError.Code.STYLESHEET_TOO_LONG,
              context.getLineCol(),
              /* params */
              [
                getTagSpecName(this.tagSpec_), bytes.toString(),
                cdataSpec.maxBytes.toString()
              ],
              cdataSpec.maxBytesSpecUrl, validationResult);
        }
        // We return early if the byte length is violated as parsing
        // really long stylesheets is slow and not worth our time.
        return;
      }
    }

    // The mandatory_cdata, cdata_regex, and css_spec fields are treated
    // like a oneof, but we're not using oneof because it's a feature
    // that was added after protobuf 2.5.0 (which our open-source
    // version uses).
    // begin oneof {

    // Mandatory CDATA exact match
    if (cdataSpec.mandatoryCdata !== null) {
      if (cdataSpec.mandatoryCdata !== cdata) {
        if (amp.validator.LIGHT) {
          validationResult.status = amp.validator.ValidationResult.Status.FAIL;
        }
        context.addError(
            amp.validator.ValidationError.Code
                .MANDATORY_CDATA_MISSING_OR_INCORRECT,
            context.getLineCol(),
            /* params */[getTagSpecName(this.tagSpec_)],
            getTagSpecUrl(this.tagSpec_), validationResult);
      }
      // We return early if the cdata has an exact match rule. The
      // spec shouldn't have an exact match rule that doesn't validate.
      return;
    } else if (this.tagSpec_.cdata.cdataRegex !== null) {
      if (!context.getRules()
               .getFullMatchRegex(this.tagSpec_.cdata.cdataRegex)
               .test(cdata)) {
        if (amp.validator.LIGHT) {
          validationResult.status = amp.validator.ValidationResult.Status.FAIL;
        } else {
          context.addError(
              amp.validator.ValidationError.Code
                  .MANDATORY_CDATA_MISSING_OR_INCORRECT,
              context.getLineCol(),
              /* params */[getTagSpecName(this.tagSpec_)],
              getTagSpecUrl(this.tagSpec_), validationResult);
        }
        return;
      }
    } else if (cdataSpec.cssSpec !== null) {
      if (amp.validator.VALIDATE_CSS) {
        this.matchCss_(cdata, cdataSpec.cssSpec, context, validationResult);
        if (amp.validator.LIGHT &&
            validationResult.status ===
                amp.validator.ValidationResult.Status.FAIL) {
          return;
        }
      }
    } else if (cdataSpec.whitespaceOnly === true) {
      if (!(/^\s*$/.test(cdata))) {
        if (amp.validator.LIGHT) {
          validationResult.status = amp.validator.ValidationResult.Status.FAIL;
          return;
        }
        context.addError(
            amp.validator.ValidationError.Code.NON_WHITESPACE_CDATA_ENCOUNTERED,
            context.getLineCol(),
            /* params */[getTagSpecName(this.tagSpec_)],
            getTagSpecUrl(this.tagSpec_), validationResult);
      }
    }
    // } end oneof

    // Blacklisted CDATA Regular Expressions
    // We use a combined regex as a fast test. If it matches, we re-match
    // against each individual regex so that we can generate better error
    // messages.
    if (cdataSpec.combinedBlacklistedCdataRegex === null) return;
    if (!context.getRules()
             .getPartialMatchCaseiRegex(cdataSpec.combinedBlacklistedCdataRegex)
             .test(cdata))
      return;
    if (amp.validator.LIGHT) {
      validationResult.status = amp.validator.ValidationResult.Status.FAIL;
      return;
    }
    for (const blacklist of cdataSpec.blacklistedCdataRegex) {
      const blacklistRegex = new RegExp(blacklist.regex, 'i');
      if (blacklistRegex.test(cdata)) {
        context.addError(
            amp.validator.ValidationError.Code.CDATA_VIOLATES_BLACKLIST,
            context.getLineCol(),
            /* params */
            [getTagSpecName(this.tagSpec_), blacklist.errorMessage],
            getTagSpecUrl(this.tagSpec_), validationResult);
      }
    }
  }

  /**
   * Matches the provided cdata against a CSS specification. Helper
   * routine for match (see above).
   * @param {string} cdata
   * @param {!amp.validator.CssSpec} cssSpec
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} validationResult
   * @private
   */
  matchCss_(cdata, cssSpec, context, validationResult) {
    /** @type {!Array<!parse_css.ErrorToken>} */
    const cssErrors = [];
    /** @type {!Array<!parse_css.Token>} */
    const tokenList = parse_css.tokenize(
        cdata, amp.validator.LIGHT ? undefined : this.getLineCol().getLine(),
        amp.validator.LIGHT ? undefined : this.getLineCol().getCol(),
        cssErrors);
    if (amp.validator.LIGHT && cssErrors.length > 0) {
      validationResult.status = amp.validator.ValidationResult.Status.FAIL;
      return;
    }
    /** @type {!CssParsingConfig} */
    const cssParsingConfig = computeCssParsingConfig(cssSpec);
    /** @type {!parse_css.Stylesheet} */
    const sheet = parse_css.parseAStylesheet(
        tokenList, cssParsingConfig.atRuleSpec, cssParsingConfig.defaultSpec,
        cssErrors);
    if (amp.validator.LIGHT && cssErrors.length > 0) {
      validationResult.status = amp.validator.ValidationResult.Status.FAIL;
      return;
    }

    // We extract the urls from the stylesheet. As a side-effect, this can
    // generate errors for url(…) functions with invalid parameters.
    /** @type {!Array<!parse_css.ParsedCssUrl>} */
    const parsedUrls = [];
    parse_css.extractUrls(sheet, parsedUrls, cssErrors);
    if (cssSpec.validateAmp4Ads) {
      parse_css.validateAmp4AdsCss(sheet, cssErrors);
    }

    if (cssSpec.validateKeyframes) {
      parse_css.validateKeyframesCss(sheet, cssErrors);
    }

    if (amp.validator.LIGHT) {
      if (cssErrors.length > 0) {
        validationResult.status = amp.validator.ValidationResult.Status.FAIL;
        return;
      }
    } else {
      for (const errorToken of cssErrors) {
        // Override the first parameter with the name of this style tag.
        let params = errorToken.params;
        // Override the first parameter with the name of this style tag.
        params[0] = getTagSpecName(this.tagSpec_);
        context.addError(
            errorToken.code, new LineCol(errorToken.line, errorToken.col),
            params, /* url */ '', validationResult);
      }
    }
    const parsedFontUrlSpec = new ParsedUrlSpec(cssSpec.fontUrlSpec);
    const parsedImageUrlSpec = new ParsedUrlSpec(cssSpec.imageUrlSpec);
    for (const url of parsedUrls) {
      const adapter = amp.validator.LIGHT ?
          null :
          new UrlErrorInStylesheetAdapter(url.line, url.col);
      validateUrlAndProtocol(
          ((url.atRuleScope === 'font-face') ? parsedFontUrlSpec :
                                               parsedImageUrlSpec),
          adapter, context, url.utf8Url, this.tagSpec_, validationResult);
    }
    const visitor = new InvalidRuleVisitor(
        this.tagSpec_, cssSpec, context, validationResult);
    sheet.accept(visitor);
  }

  /** @return {!LineCol} */
  getLineCol() {
    if (amp.validator.LIGHT) return DOCUMENT_START;
    return this.lineCol_;
  }
}

/**
 * @typedef {{ missingExtension: string,
 *             maybeError: ?amp.validator.ValidationError }}
 */
let ExtensionMissingError;

/**
 * The extensions context keeys track of the extensions that the validator has
 * seen, as well as which have been used, which are required to be used, etc.
 * @private
 */
class ExtensionsContext {
  constructor() {
    // |extensionsLoaded_| tracks the valid <script> tags loading
    // amp extensions which were seen in the document's head. Most extensions
    // are also added to |extensionsUnusedRequired_| when encountered in the
    // head. When a tag is seen later in the document which makes use of an
    // extension, that extension is recorded in |extensionsUsed_|.

    /**
     * Used as a set, based on key names.
     * @type {!Object<string, boolean>}
     * @private
     */
    this.extensionsLoaded_ = Object.create(null);

    // AMP-AD is grandfathered in to not require the respective extension
    // javascript file for historical reasons. We still need to mark that
    // the extension is used if we see the tags.
    this.extensionsLoaded_['amp-ad'] = true;

    /**
     * @type {!Array<string>}
     * @private
     */
    this.extensionsUnusedRequired_ = [];

    /**
     * Used as a set, based on key names.
     * @type {!Object<string, boolean>}
     * @private
     */
    this.extensionsUsed_ = Object.create(null);

    if (!amp.validator.LIGHT) {
      /**
       * @type {!Array<ExtensionMissingError>}
       * @private
       */
      this.extensionMissingErrors_ = [];
    }

    /**
     * @type {!Array<string>}
     * @private
     */
    this.extensionMissingFailures_ = [];
  }

  /**
   * Returns false if the named extension has not yet been loaded. Note that
   * this assumes that all extensions will be loaded in the document earlier
   * than their first usage. This is true for <amp-foo> tags, since the
   * extension must be loaded in the head and <amp-foo> tags are not supported
   * in the head as per HTML spec.
   * @param {string} extension
   * @return {boolean}
   */
  isExtensionLoaded(extension) {
    return extension in this.extensionsLoaded_;
  }

  /**
   * Record a possible error to report once we have collected all
   * extensions in the document. If the given extension is missing,
   * then report the given error.
   * @param {!ParsedTagSpec} parsedTagSpec
   * @param {!LineCol} lineCol
   */
  recordFutureErrorsIfMissing(parsedTagSpec, lineCol) {
    const tagSpec = parsedTagSpec.getSpec();
    for (let requiredExtension of tagSpec.requiresExtension) {
      if (!this.isExtensionLoaded(requiredExtension)) {
        // Record a possible failure once we have collected all extensions
        // in the document. If the given extension is missing, then report
        // a failure. This is used only in the LIGHT validator.
        if (!amp.validator.LIGHT) {
          let error = new amp.validator.ValidationError();
          error.severity = amp.validator.ValidationError.Severity.ERROR;
          error.code =
              amp.validator.ValidationError.Code.MISSING_REQUIRED_EXTENSION;
          error.params = [getTagSpecName(tagSpec), requiredExtension];
          error.line = lineCol.getLine();
          error.col = lineCol.getCol();
          error.specUrl = getTagSpecUrl(tagSpec);

          this.extensionMissingErrors_.push(
              {missingExtension: requiredExtension, maybeError: error});
        } else {  // amp.validator.LIGHT
          this.extensionMissingFailures_.push(requiredExtension);
        }
      }
    }
  }

  /**
   * Returns a list of errors accrued while processing the
   * <head> for tags requiring an extension which was not found.
   * @return {!Array<!amp.validator.ValidationError>}
   */
  missingExtensionErrors() {
    var out = [];
    for (const err of this.extensionMissingErrors_) {
      if (!this.isExtensionLoaded(err.missingExtension))
        out.push(err.maybeError);
    }

    return out;
  }

  /**
   * Determines if any extensions were missing while processing the <head>
   * for tags requiring an extension. Only called for LIGHT validator.
   * @return {boolean}
   */
  hasMissingExtensionFailures() {
    for (const missingExtension of this.extensionMissingFailures_) {
      if (!this.isExtensionLoaded(missingExtension)) return true;
    }
    return false;
  }

  /**
   * Returns a list of unused extensions which produce validation errors
   * when unused.
   * @return {!Array<string>}
   */
  unusedExtensionsRequired() {
    // Compute Difference: extensionsUnusedRequired_ - extensionsUsed_
    var out = [];
    for (const extension of this.extensionsUnusedRequired_)
      if (!(extension in this.extensionsUsed_)) out.push(extension);
    out.sort();
    return out;
  }

  /**
   * Update ExtensionContext state when we encounter an amp extension or
   * tag using an extension.
   * @param {!ValidateTagResult} result
   */
  updateFromTagResult(result) {
    if (result.bestMatchTagSpec === null) return;
    const parsedTagSpec = result.bestMatchTagSpec;
    const tagSpec = parsedTagSpec.getSpec();

    // Keep track of which extensions are loaded.
    if (tagSpec.extensionSpec !== null) {
      const extensionSpec = tagSpec.extensionSpec;
      // This is an always present field if extension spec is set.
      const extensionName = /** @type{string} */ (extensionSpec.name);

      // Record that we have encountered an extension 'load' tag. This will
      // look like <script custom-element=amp-foo ...> or similar.
      this.extensionsLoaded_[extensionName] = true;
      switch (extensionSpec.requiresUsage) {
        case amp.validator.ExtensionSpec.ExtensionUsageRequirement
            .GRANDFATHERED:  // Fallthrough intended:
        case amp.validator.ExtensionSpec.ExtensionUsageRequirement.NONE:
          // This extension does not have usage demonstrated by a tag, for
          // example: amp-dynamic-css-classes
          break;
        case amp.validator.ExtensionSpec.ExtensionUsageRequirement.ERROR:
        // TODO(powdercloud): Make enum proto defaults work in generated
        // javascript.
        default:  // Default is error
          // Record that a loaded extension indicates a new requirement:
          // namely that some tag must make use of this extension.
          this.extensionsUnusedRequired_.push(extensionName);
          break;
      }
    }

    // Record presence of a tag, such as <amp-foo> which requires the usage
    // of an amp extension.
    for (let requiredExtension of tagSpec.requiresExtension)
      this.extensionsUsed_[requiredExtension] = true;
  }
}

/**
 * The Context keeps track of the line / column that the validator is
 * in, as well as the mandatory tag specs that have already been validated.
 * So, this constitutes the mutable state for the validator except for
 * the validation result itself.
 * @private
 */
class Context {
  /**
   * @param {!ParsedValidatorRules} parsedRules
   */
  constructor(parsedRules) {
    /**
     * @type {!ParsedValidatorRules}
     * @private
     */
    this.rules_ = parsedRules;
    /**
     * The mandatory alternatives that we've validated (a small list of ids).
     * @type {!Array<number>}
     * @private
     */
    this.mandatoryAlternativesSatisfied_ = [];
    /**
     * DocLocator object from the parser which gives us line/col numbers.
     * @type {amp.htmlparser.DocLocator}
     * @private
     */
    this.docLocator_ = null;

    /**
     * @type {!TagStack}
     * @private
     */
    this.tagStack_ = new TagStack();

    /**
     * Set of tagSpec ids that have been validated.
     * @type {!Array<boolean>}
     * @private
     */
    this.tagspecsValidated_ = [];

    /**
     * Set of conditions that we've satisfied.
     * @type {!Array<boolean>}
     * @private
     */
    this.conditionsSatisfied_ = [];

    /**
     * First tagspec seen (matched) which contains an URL.
     * @type {?amp.validator.TagSpec}
     * @private
     */
    this.firstUrlSeenTag_ = null;

    if (!amp.validator.LIGHT) {
      /**
       * @type {?LineCol}
       * @private
       */
      this.encounteredBodyLineCol_ = null;
    }

    /**
     * @type {?Array<!Object>}
     * @private
     */
    this.encounteredBodyAttrs_ = null;

    /**
     * Extension-specific context.
     * @type {!ExtensionsContext}
     * @private
     */
    this.extensions_ = new ExtensionsContext();
  }

  /** @return {!ParsedValidatorRules} */
  getRules() {
    return this.rules_;
  }

  /**
   * Callback before startDoc which gives us a document locator.
   * @param {!amp.htmlparser.DocLocator} locator
   */
  setDocLocator(locator) {
    this.docLocator_ = locator;
  }

  /** @return {!LineCol} */
  getLineCol() {
    return new LineCol(this.docLocator_.getLine(), this.docLocator_.getCol());
  }

  /**
   * @param {!amp.validator.ValidationError} error
   * @param {!amp.validator.ValidationResult} validationResult
   */
  addBuiltError(error, validationResult) {
    // If any of the errors amount to more than a WARNING, validation fails.
    if (error.severity !== amp.validator.ValidationError.Severity.WARNING) {
      validationResult.status = amp.validator.ValidationResult.Status.FAIL;
    }
    goog.asserts.assert(validationResult.errors !== undefined);
    validationResult.errors.push(error);
  }

  /**
   * Add an error field to validationResult with severity WARNING.
   * @param {!amp.validator.ValidationError.Code} validationErrorCode Error code
   * @param {!LineCol} lineCol a line / column pair.
   * @param {!Array<string>} params
   * @param {?string} specUrl a link (URL) to the amphtml spec
   * @param {!amp.validator.ValidationResult} validationResult
   */
  addWarning(validationErrorCode, lineCol, params, specUrl, validationResult) {
    this.addBuiltError(
        populateError(
            amp.validator.ValidationError.Severity.WARNING, validationErrorCode,
            lineCol, params, specUrl),
        validationResult);
  }

  /**
   * Add an error field to validationResult with severity ERROR.
   * @param {!amp.validator.ValidationError.Code} validationErrorCode Error code
   * @param {!LineCol} lineCol a line / column pair.
   * @param {!Array<string>} params
   * @param {?string} specUrl a link (URL) to the amphtml spec
   * @param {!amp.validator.ValidationResult} validationResult
   */
  addError(validationErrorCode, lineCol, params, specUrl, validationResult) {
    this.addBuiltError(
        populateError(
            amp.validator.ValidationError.Severity.ERROR, validationErrorCode,
            lineCol, params, specUrl),
        validationResult);
    validationResult.status = amp.validator.ValidationResult.Status.FAIL;
  }

  /**
   * Given a tag result, update the Context state to affect
   * later validation. Does not handle updating the tag stack.
   * @param {!ValidateTagResult} result
   * @private
   */
  updateFromTagResult_(result) {
    if (result.bestMatchTagSpec === null) return;
    const parsedTagSpec = result.bestMatchTagSpec;

    this.extensions_.updateFromTagResult(result);
    // If this requires an extension and we are still in the document head,
    // record that we may still need to emit a missing extension error at
    // the end of the document head. We do this even for a tag failing
    // validation since extensions are based on the tag name, and we're still
    // pretty confident the user forgot to include the extension.
    if (this.tagStack_.hasAncestor('HEAD')) {
      this.extensions_.recordFutureErrorsIfMissing(
          parsedTagSpec, this.getLineCol());
    }
    // We also want to satisfy conditions, to reduce errors seen elsewhere in
    // the document.
    this.satisfyConditionsFromTagSpec_(parsedTagSpec);
    this.satisfyMandatoryAlternativesFromTagSpec_(parsedTagSpec);
    this.recordValidatedFromTagSpec_(parsedTagSpec);

    if (result.validationResult.status ===
        amp.validator.ValidationResult.Status.PASS) {
      // If the tag spec didn't match, we don't know that the tag actually
      // contained a URL, so no need to complain about it.
      this.markUrlSeenFromMatchingTagSpec_(parsedTagSpec);
    }
  }

  /**
   * Given the tagResult from validating a single tag, update the overall
   * result as well as the Context state to affect later validation.
   * @param {!amp.htmlparser.ParsedHtmlTag} encounteredTag
   * @param {!ValidateTagResult} referencePointResult
   * @param {!ValidateTagResult} tagResult
   */
  updateFromTagResults(encounteredTag, referencePointResult, tagResult) {
    this.tagStack_.updateFromTagResults(
        encounteredTag, referencePointResult, tagResult, this.getRules(),
        this.getLineCol());

    this.updateFromTagResult_(referencePointResult);
    this.updateFromTagResult_(tagResult);
  }

  /**
   * Record document-level conditions which have been satisfied.
   * @param {!ParsedTagSpec} parsedTagSpec
   * @private
   */
  satisfyConditionsFromTagSpec_(parsedTagSpec) {
    for (const condition of parsedTagSpec.getSpec().satisfies) {
      this.conditionsSatisfied_[condition] = true;
    }
  }

  /**
   * @param {number} condition
   * @return {boolean}
   */
  satisfiesCondition(condition) {
    return this.conditionsSatisfied_.hasOwnProperty(condition);
  }

  /**
   * Records that a Tag was seen which contains an URL. Used to note issues
   * with <base href> occurring in the document after an URL.
   * @param {!ParsedTagSpec} parsedTagSpec
   * @private
   */
  markUrlSeenFromMatchingTagSpec_(parsedTagSpec) {
    if (!this.hasSeenUrl() && parsedTagSpec.containsUrl())
      this.firstUrlSeenTag_ = parsedTagSpec.getSpec();
  }

  /**
   * Returns true iff the current context has observed a tag which contains
   * an URL. This is set by calling markUrlSeen_ above.
   * @return {boolean}
   */
  hasSeenUrl() {
    return this.firstUrlSeenTag_ !== null;
  }

  /**
   * The TagSpecName of the first seen URL. Do not call unless HasSeenUrl
   * returns true.
   * @return {string}
   */
  firstSeenUrlTagName() {
    return getTagSpecName(this.firstUrlSeenTag_);
  }

  /**
   * Records that this document contains a tag matching a particular tag spec.
   * @param {!ParsedTagSpec} parsedTagSpec
   * @private
   */
  recordValidatedFromTagSpec_(parsedTagSpec) {
    if (!this.tagspecsValidated_.hasOwnProperty(parsedTagSpec.id()))
      this.tagspecsValidated_[parsedTagSpec.id()] = true;
  }

  /**
   * Returns the tag spec ids that have been validated. The return object
   * should be treated as a set (the object keys), and the value should be
   * ignored.
   * @return {!Array<boolean>}
   */
  getTagspecsValidated() {
    return this.tagspecsValidated_;
  }

  /**
   * Record that this document contains a tag which is a member of a list
   * of mandatory alternatives.
   * @param {!ParsedTagSpec} parsedTagSpec
   * @private
   */
  satisfyMandatoryAlternativesFromTagSpec_(parsedTagSpec) {
    const tagSpec = parsedTagSpec.getSpec();
    if (tagSpec.mandatoryAlternatives !== null) {
      this.mandatoryAlternativesSatisfied_.push(tagSpec.mandatoryAlternatives);
    }
  }

  /**
   * The mandatory alternatives that we've satisfied. This may contain
   * duplicates (we'd have to filter them in record... above if we cared).
   * @return {!Array<number>}
   */
  getMandatoryAlternativesSatisfied() {
    return this.mandatoryAlternativesSatisfied_;
  }

  /** @return {!TagStack} */
  getTagStack() {
    return this.tagStack_;
  }

  /** @return {!ExtensionsContext} */
  getExtensions() {
    return this.extensions_;
  }

  /** @param {!Array<!Object>} attrs */
  recordBodyTag(attrs) {
    // Must copy because parser reuses the attrs array.
    this.encounteredBodyAttrs_ = attrs.slice();
    if (!amp.validator.LIGHT) {
      this.encounteredBodyLineCol_ = this.getLineCol();
    }
  }

  /** @return {?Array<!Object>} */
  getEncounteredBodyAttrs() {
    return this.encounteredBodyAttrs_;
  }

  /** @return {!LineCol} */
  getEncounteredBodyLineCol() {
    return /** @type {!LineCol} */ (this.encounteredBodyLineCol_);
  }
}

/**
 * @private
 */
class UrlErrorInStylesheetAdapter {
  /**
   * @param {number} line
   * @param {number} col
   */
  constructor(line, col) {
    /**
     * @type {!LineCol}
     * @private
     */
    this.lineCol_ = new LineCol(line, col);
  }

  /**
   * @param {!Context} context
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  missingUrl(context, tagSpec, result) {
    context.addError(
        amp.validator.ValidationError.Code.CSS_SYNTAX_MISSING_URL,
        this.lineCol_,
        /* params */[getTagSpecName(tagSpec)], getTagSpecUrl(tagSpec), result);
  }

  /**
   * @param {!Context} context
   * @param {string} url
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  invalidUrl(context, url, tagSpec, result) {
    context.addError(
        amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_URL,
        this.lineCol_,
        /* params */[getTagSpecName(tagSpec), url], getTagSpecUrl(tagSpec),
        result);
  }

  /**
   * @param {!Context} context
   * @param {string} protocol
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  invalidUrlProtocol(context, protocol, tagSpec, result) {
    context.addError(
        amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_URL_PROTOCOL,
        this.lineCol_,
        /* params */[getTagSpecName(tagSpec), protocol], getTagSpecUrl(tagSpec),
        result);
  }

  /**
   * @param {!Context} context
   * @param {string} domain
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  disallowedDomain(context, domain, tagSpec, result) {
    context.addError(
        amp.validator.ValidationError.Code.CSS_SYNTAX_DISALLOWED_DOMAIN,
        this.lineCol_,
        /* params */[getTagSpecName(tagSpec), domain], getTagSpecUrl(tagSpec),
        result);
  }

  /**
   * @param {!Context} context
   * @param {string} url
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  disallowedRelativeUrl(context, url, tagSpec, result) {
    context.addError(
        amp.validator.ValidationError.Code.CSS_SYNTAX_DISALLOWED_RELATIVE_URL,
        this.lineCol_,
        /* params */[getTagSpecName(tagSpec), url], getTagSpecUrl(tagSpec),
        result);
  }
}

/** @private */
class UrlErrorInAttrAdapter {
  /**
   * @param {string} attrName
   */
  constructor(attrName) {
    this.attrName_ = attrName;
  }

  /**
   * @param {!Context} context
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  missingUrl(context, tagSpec, result) {
    context.addError(
        amp.validator.ValidationError.Code.MISSING_URL, context.getLineCol(),
        /* params */[this.attrName_, getTagSpecName(tagSpec)],
        getTagSpecUrl(tagSpec), result);
  }

  /**
   * @param {!Context} context
   * @param {string} url
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  invalidUrl(context, url, tagSpec, result) {
    context.addError(
        amp.validator.ValidationError.Code.INVALID_URL, context.getLineCol(),
        /* params */[this.attrName_, getTagSpecName(tagSpec), url],
        getTagSpecUrl(tagSpec), result);
  }

  /**
   * @param {!Context} context
   * @param {string} protocol
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  invalidUrlProtocol(context, protocol, tagSpec, result) {
    context.addError(
        amp.validator.ValidationError.Code.INVALID_URL_PROTOCOL,
        context.getLineCol(),
        /* params */[this.attrName_, getTagSpecName(tagSpec), protocol],
        getTagSpecUrl(tagSpec), result);
  }

  /**
   * @param {!Context} context
   * @param {string} domain
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  disallowedDomain(context, domain, tagSpec, result) {
    context.addError(
        amp.validator.ValidationError.Code.DISALLOWED_DOMAIN,
        context.getLineCol(),
        /* params */[this.attrName_, getTagSpecName(tagSpec), domain],
        getTagSpecUrl(tagSpec), result);
  }

  /**
   * @param {!Context} context
   * @param {string} url
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  disallowedRelativeUrl(context, url, tagSpec, result) {
    context.addError(
        amp.validator.ValidationError.Code.DISALLOWED_RELATIVE_URL,
        context.getLineCol(),
        /* params */[this.attrName_, getTagSpecName(tagSpec), url],
        getTagSpecUrl(tagSpec), result);
  }
}

/**
 * Helper method for validateNonTemplateAttrValueAgainstSpec.
 * @param {ParsedAttrSpec} parsedAttrSpec
 * @param {!Context} context
 * @param {!Object} attr
 * @param {!amp.validator.TagSpec} tagSpec
 * @param {!amp.validator.ValidationResult} result
 */
function validateAttrValueUrl(parsedAttrSpec, context, attr, tagSpec, result) {
  /** @type {!Array<string>} */
  let maybeUris = [];
  if (attr.name !== 'srcset') {
    maybeUris.push(attr.value);
  } else {
    if (attr.value === '') {
      if (amp.validator.LIGHT) {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      } else {
        context.addError(
            amp.validator.ValidationError.Code.MISSING_URL,
            context.getLineCol(),
            /* params */[attr.name, getTagSpecName(tagSpec)],
            getTagSpecUrl(tagSpec), result);
      }
      return;
    }
    /** @type {!parse_srcset.SrcsetParsingResult} */
    const parseResult = parse_srcset.parseSrcset(attr.value);
    if (!parseResult.success) {
      if (amp.validator.LIGHT) {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      } else {
        // DUPLICATE_DIMENSION only needs two parameters, it does not report
        // on the attribute value.
        if (parseResult.errorCode ===
            amp.validator.ValidationError.Code.DUPLICATE_DIMENSION) {
          context.addError(
              parseResult.errorCode, context.getLineCol(),
              /* params */[attr.name, getTagSpecName(tagSpec)],
              getTagSpecUrl(tagSpec), result);
        } else {
          context.addError(
              parseResult.errorCode, context.getLineCol(),
              /* params */[attr.name, getTagSpecName(tagSpec), attr.value],
              getTagSpecUrl(tagSpec), result);
        }
      }
      return;
    }
    if (parseResult.srcsetImages !== null) {
      for (const image of parseResult.srcsetImages) {
        maybeUris.push(image.url);
      }
    }
  }
  if (maybeUris.length === 0) {
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
    } else {
      context.addError(
          amp.validator.ValidationError.Code.MISSING_URL, context.getLineCol(),
          /* params */[attr.name, getTagSpecName(tagSpec)],
          getTagSpecUrl(tagSpec), result);
    }
    return;
  }
  sortAndUniquify(maybeUris);
  const adapter =
      amp.validator.LIGHT ? null : new UrlErrorInAttrAdapter(attr.name);
  for (const maybeUri of maybeUris) {
    const unescapedMaybeUri = goog.string.unescapeEntities(maybeUri);
    validateUrlAndProtocol(
        parsedAttrSpec.getValueUrlSpec(), adapter, context, unescapedMaybeUri,
        tagSpec, result);
    if (result.status === amp.validator.ValidationResult.Status.FAIL) {
      return;
    }
  }
}

/**
 * @param {!ParsedUrlSpec} parsedUrlSpec
 * @param {UrlErrorInAttrAdapter|UrlErrorInStylesheetAdapter} adapter
 * @param {!Context} context
 * @param {string} urlStr
 * @param {!amp.validator.TagSpec} tagSpec
 * @param {!amp.validator.ValidationResult} result
 */
function validateUrlAndProtocol(
    parsedUrlSpec, adapter, context, urlStr, tagSpec, result) {
  const spec = parsedUrlSpec.getSpec();
  const onlyWhitespaceRe = /^[\s\xa0]*$/;  // includes non-breaking space
  if (urlStr.match(onlyWhitespaceRe) !== null &&
      (spec.allowEmpty === null || spec.allowEmpty === false)) {
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
    } else {
      adapter.missingUrl(context, tagSpec, result);
    }
    return;
  }
  const url = new parse_url.URL(urlStr);
  if (!url.isValid) {
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
    } else {
      adapter.invalidUrl(context, urlStr, tagSpec, result);
    }
    return;
  }
  // Technically, an URL such as "script :alert('foo')" is considered a relative
  // URL, similar to "./script%20:alert(%27foo%27)" since space is not a legal
  // character in a URL protocol. This is what parse_url.URL will determine.
  // However, some very old browsers will ignore whitespace in URL protocols and
  // will treat this as javascript execution. We must be safe regardless of the
  // client. This RE is much more aggressive at extracting a protcol than
  // parse_url.URL for this reason.
  const re = /^([^:\/?#.]+):.*$/;
  const match = re.exec(urlStr);
  let protocol = '';
  if (match !== null) {
    protocol = match[1];
    protocol = protocol.toLowerCase().trimLeft();
  } else {
    protocol = url.protocol;
  }
  if (protocol.length > 0 && !parsedUrlSpec.isAllowedProtocol(protocol)) {
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
    } else {
      adapter.invalidUrlProtocol(context, protocol, tagSpec, result);
    }
    return;
  }
  if (!spec.allowRelative && (!url.hasProtocol || url.protocol.length === 0)) {
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
    } else {
      adapter.disallowedRelativeUrl(context, urlStr, tagSpec, result);
    }
    return;
  }
  const domain = url.host.toLowerCase();
  if (domain.length > 0 && parsedUrlSpec.isDisallowedDomain(domain)) {
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
    } else {
      adapter.disallowedDomain(context, domain, tagSpec, result);
    }
    return;
  }
}

/**
 * Helper method for validateNonTemplateAttrValueAgainstSpec.
 * @param {ParsedValueProperties} parsedValueProperties
 * @param {!Context} context
 * @param {!Object} attr
 * @param {!amp.validator.TagSpec} tagSpec
 * @param {!amp.validator.ValidationResult} result
 */
function validateAttrValueProperties(
    parsedValueProperties, context, attr, tagSpec, result) {
  // TODO(johannes): Replace this hack with a parser.
  const segments = attr.value.split(/[,;]/);
  /** @type {!Object<string, string>} */
  const properties = Object.create(null);
  for (const segment of segments) {
    const keyValue = segment.split('=');
    if (keyValue.length < 2) {
      continue;
    }
    properties[keyValue[0].trim().toLowerCase()] = keyValue[1];
  }
  // TODO(johannes): End hack.
  const names = Object.keys(properties).sort();
  for (const name of names) {
    const value = properties[name];
    const valuePropertyByName = parsedValueProperties.getValuePropertyByName();
    if (!(name in valuePropertyByName)) {
      if (amp.validator.LIGHT) {
        result.status = amp.validator.ValidationResult.Status.FAIL;
        return;
      }
      context.addError(
          amp.validator.ValidationError.Code.DISALLOWED_PROPERTY_IN_ATTR_VALUE,
          context.getLineCol(),
          /* params */[name, attr.name, getTagSpecName(tagSpec)],
          getTagSpecUrl(tagSpec), result);
      continue;
    }
    const propertySpec = valuePropertyByName[name];
    if (propertySpec.value !== null) {
      if (propertySpec.value !== value.toLowerCase()) {
        if (amp.validator.LIGHT) {
          result.status = amp.validator.ValidationResult.Status.FAIL;
          return;
        }
        context.addError(
            amp.validator.ValidationError.Code
                .INVALID_PROPERTY_VALUE_IN_ATTR_VALUE,
            context.getLineCol(),
            /* params */[name, attr.name, getTagSpecName(tagSpec), value],
            getTagSpecUrl(tagSpec), result);
      }
    } else if (propertySpec.valueDouble !== null) {
      if (parseFloat(value) !== propertySpec.valueDouble) {
        if (amp.validator.LIGHT) {
          result.status = amp.validator.ValidationResult.Status.FAIL;
          return;
        }
        context.addError(
            amp.validator.ValidationError.Code
                .INVALID_PROPERTY_VALUE_IN_ATTR_VALUE,
            context.getLineCol(),
            /* params */[name, attr.name, getTagSpecName(tagSpec), value],
            getTagSpecUrl(tagSpec), result);
      }
    }
  }
  const notSeen = subtractDiff(
      parsedValueProperties.getMandatoryValuePropertyNames(), names);
  if (amp.validator.LIGHT) {
    if (notSeen.length > 0) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
      return;
    }
  } else {
    for (const name of notSeen) {
      context.addError(
          amp.validator.ValidationError.Code
              .MANDATORY_PROPERTY_MISSING_FROM_ATTR_VALUE,
          context.getLineCol(),
          /* params */[name, attr.name, getTagSpecName(tagSpec)],
          getTagSpecUrl(tagSpec), result);
    }
  }
}

/**
 * This is the main validation procedure for attributes, operating with a
 * ParsedAttrSpec instance.
 * @param {ParsedAttrSpec} parsedAttrSpec
 * @param {!Context} context
 * @param {!Object} attr
 * @param {!amp.validator.TagSpec} tagSpec
 * @param {!amp.validator.ValidationResult} result
 */
function validateNonTemplateAttrValueAgainstSpec(
    parsedAttrSpec, context, attr, tagSpec, result) {
  // The value, value_regex, value_url, and value_properties fields are treated
  // like a oneof, but we're not using oneof because it's a feature that was
  // added after protobuf 2.5.0 (which our open-source version uses).
  // begin oneof {
  const spec = parsedAttrSpec.getSpec();
  if (spec.value !== null) {
    if (attr.value === spec.value) {
      return;
    }
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
      return;
    }
    context.addError(
        amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
        context.getLineCol(),
        /* params */[attr.name, getTagSpecName(tagSpec), attr.value],
        getTagSpecUrl(tagSpec), result);
  } else if (spec.valueCasei !== null) {
    if (attr.value.toLowerCase() === spec.valueCasei) {
      return;
    }
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
      return;
    }
    context.addError(
        amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
        context.getLineCol(),
        /* params */[attr.name, getTagSpecName(tagSpec), attr.value],
        getTagSpecUrl(tagSpec), result);
  } else if (spec.valueRegex !== null || spec.valueRegexCasei !== null) {
    const valueRegex = (spec.valueRegex !== null) ?
        context.getRules().getFullMatchRegex(spec.valueRegex) :
        context.getRules().getFullMatchCaseiRegex(
            /** @type {number} */ (spec.valueRegexCasei));
    if (!valueRegex.test(attr.value)) {
      if (amp.validator.LIGHT) {
        result.status = amp.validator.ValidationResult.Status.FAIL;
        return;
      }
      context.addError(
          amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
          context.getLineCol(),
          /* params */[attr.name, getTagSpecName(tagSpec), attr.value],
          getTagSpecUrl(tagSpec), result);
    }
  } else if (spec.valueUrl !== null) {
    validateAttrValueUrl(parsedAttrSpec, context, attr, tagSpec, result);
  } else {
    const valueProperties = parsedAttrSpec.getValuePropertiesOrNull();
    if (valueProperties !== null) {
      validateAttrValueProperties(
          valueProperties, context, attr, tagSpec, result);
    }
  }
  // } end oneof
}

/**
 * @param {string} layout
 * @return {!amp.validator.AmpLayout.Layout}
 */
function parseLayout(layout) {
  if (layout === undefined) {
    return amp.validator.AmpLayout.Layout.UNKNOWN;
  }
  const normLayout = layout.toUpperCase().replace('-', '_');
  const idx = amp.validator.AmpLayout.Layout_NamesByIndex.indexOf(normLayout);
  if (idx === -1) {
    return amp.validator.AmpLayout.Layout.UNKNOWN;
  }
  return amp.validator.AmpLayout.Layout_ValuesByIndex[idx];
}

/**
 * Parses a width or height layout attribute, for the determining the layout
 * of AMP tags (e.g. <amp-img width="42px" etc.).
 */
amp.validator.CssLength = class {
  /**
   * @param {string|undefined} input The input attribute value to be parsed.
   * @param {boolean} allowAuto Whether or not to allow the 'auto' value as
   *    a value.
   * @param {boolean} allowFluid whether or not to allow the 'fluid' value
   *   as a value.
   */
  constructor(input, allowAuto, allowFluid) {
    /**
     * Whether the value or unit is invalid. Note that passing
     * undefined as |input| is considered valid.
     * @type {boolean}
     */
    this.isValid = false;
    /**
     * Whether the attribute value is set.
     * @type {boolean}
     */
    this.isSet = false;
    /**
     * Whether the attribute value is 'auto'. This is a special value that
     * indicates that the value gets derived from the context. In practice
     * that's only ever the case for a width.
     * @type {boolean}
     */
    this.isAuto = false;
    /**
     * Whether the attribute value is 'fluid'
     * @type {boolean}
     */
    this.isFluid = false;
    /**
     * The numeric value.
     * @type {number}
     */
    this.numeral = Number.NaN;
    /**
     * The unit, 'px' being the default in case it's absent.
     * @type {string}
     */
    this.unit = 'px';

    if (input === undefined) {
      this.isValid = true;
      return;
    }
    this.isSet = true;
    if (input === 'auto') {
      this.isAuto = true;
      this.isValid = allowAuto;
      return;
    } else if (input === 'fluid') {
      this.isFluid = true;
      this.isValid = allowFluid;
    }
    const re = /^(\d+(?:\.\d+)?)(px|em|rem|vh|vw|vmin|vmax)?$/;
    const match = re.exec(input);
    if (match !== null) {
      this.isValid = true;
      this.numeral = parseFloat(match[1]);
      this.unit = match[2] || 'px';
    }
  }
};

/**
 * Calculates the effective width from the input layout and width.
 * This involves considering that some elements, such as amp-audio and
 * amp-pixel, have natural dimensions (browser or implementation-specific
 * defaults for width / height).
 * @param {!amp.validator.AmpLayout} spec
 * @param {!amp.validator.AmpLayout.Layout} inputLayout
 * @param {!amp.validator.CssLength} inputWidth
 * @return {!amp.validator.CssLength}
 */
function CalculateWidth(spec, inputLayout, inputWidth) {
  if ((inputLayout === amp.validator.AmpLayout.Layout.UNKNOWN ||
       inputLayout === amp.validator.AmpLayout.Layout.FIXED) &&
      !inputWidth.isSet && spec.definesDefaultWidth) {
    return new amp.validator.CssLength(
        '1px', /* allowAuto */ false, /* allowFluid */ false);
  }
  return inputWidth;
}

/**
 * Calculates the effective height from input layout and input height.
 * @param {!amp.validator.AmpLayout} spec
 * @param {!amp.validator.AmpLayout.Layout} inputLayout
 * @param {!amp.validator.CssLength} inputHeight
 * @return {!amp.validator.CssLength}
 */
function CalculateHeight(spec, inputLayout, inputHeight) {
  if ((inputLayout === amp.validator.AmpLayout.Layout.UNKNOWN ||
       inputLayout === amp.validator.AmpLayout.Layout.FIXED ||
       inputLayout === amp.validator.AmpLayout.Layout.FIXED_HEIGHT) &&
      !inputHeight.isSet && spec.definesDefaultHeight) {
    return new amp.validator.CssLength(
        '1px', /* allowAuto */ false, /* allowFluid */ false);
  }
  return inputHeight;
}

/**
 * Calculates the layout; this depends on the width / height
 * calculation above. It happens last because web designers often make
 * fixed-sized mocks first and then the layout determines how things
 * will change for different viewports / devices / etc.
 * @param {!amp.validator.AmpLayout.Layout} inputLayout
 * @param {!amp.validator.CssLength} width
 * @param {!amp.validator.CssLength} height
 * @param {?string} sizesAttr
 * @param {?string} heightsAttr
 * @return {!amp.validator.AmpLayout.Layout}
 */
function CalculateLayout(inputLayout, width, height, sizesAttr, heightsAttr) {
  if (inputLayout !== amp.validator.AmpLayout.Layout.UNKNOWN) {
    return inputLayout;
  } else if (!width.isSet && !height.isSet) {
    return amp.validator.AmpLayout.Layout.CONTAINER;
  } else if (height.isFluid) {
    return amp.validator.AmpLayout.Layout.FLUID;
  } else if (height.isSet && (!width.isSet || width.isAuto)) {
    return amp.validator.AmpLayout.Layout.FIXED_HEIGHT;
  } else if (
      height.isSet && width.isSet &&
      (sizesAttr !== undefined || heightsAttr !== undefined)) {
    return amp.validator.AmpLayout.Layout.RESPONSIVE;
  } else {
    return amp.validator.AmpLayout.Layout.FIXED;
  }
}

/**
 * We only track (that is, add them to Context.RecordTagspecValidated) validated
 * tagspecs as necessary. That is, if it's needed for document scope validation:
 * - Mandatory tags
 * - Unique tags
 * - Tags (identified by their TagSpecName() that are required by other tags.
 * @param {!amp.validator.TagSpec} tag
 * @param {number} tagSpecId
 * @param {!Array<boolean>} tagSpecIdsToTrack
 * @return {boolean}
 */
function shouldRecordTagspecValidated(tag, tagSpecId, tagSpecIdsToTrack) {
  return tag.mandatory || tag.unique || tag.requires.length > 0 ||
      tagSpecIdsToTrack.hasOwnProperty(tagSpecId) ||
      (!amp.validator.LIGHT && tag.uniqueWarning);
}

/**
 *  DispatchKey represents a tuple of either 1-3 strings:
 *    - attribute name
 *    - attribute value (optional)
 *    - mandatory parent html tag (optional)
 *  A Dispatch key can be generated from some validator TagSpecs. One dispatch
 *  key per attribute can be generated from any HTML tag. If one of the
 *  dispatch keys for an HTML tag match that of a a TagSpec, we validate that
 *  HTML tag against only this one TagSpec. Otherwise, this TagSpec is not
 *  eligible for validation against this HTML tag.
 * @param {!amp.validator.AttrSpec.DispatchKeyType} dispatchKeyType
 * @param {string} attrName
 * @param {string} attrValue
 * @param {string} mandatoryParent may be set to "$NOPARENT"
 * @returns {string} dispatch key
 */
function makeDispatchKey(
    dispatchKeyType, attrName, attrValue, mandatoryParent) {
  switch (dispatchKeyType) {
    case amp.validator.AttrSpec.DispatchKeyType.NAME_DISPATCH:
      return attrName;
    case amp.validator.AttrSpec.DispatchKeyType.NAME_VALUE_DISPATCH:
      return attrName + '\0' + attrValue;
    case amp.validator.AttrSpec.DispatchKeyType.NAME_VALUE_PARENT_DISPATCH:
      return attrName + '\0' + attrValue + '\0' + mandatoryParent;
    case amp.validator.AttrSpec.DispatchKeyType.NONE_DISPATCH:
    default:
      goog.asserts.assert(false);
  }
  return '';  // To make closure happy.
}

/**
 * Returns true if |value| contains mustache template syntax.
 * @param {string} value
 * @return {boolean}
 */
function attrValueHasTemplateSyntax(value) {
  // Mustache (https://mustache.github.io/mustache.5.html), our template
  // system, supports replacement tags that start with {{ and end with }}.
  // We relax attribute value rules if the value contains this syntax as we
  // will validate the post-processed tag instead.
  const mustacheTag = /{{.*}}/;
  return mustacheTag.test(value);
}

/**
 * Returns true if |value| contains a mustache unescaped template syntax.
 * @param {string} value
 * @return {boolean}
 */
function attrValueHasUnescapedTemplateSyntax(value) {
  // Mustache (https://mustache.github.io/mustache.5.html), our template
  // system, supports {{{unescaped}}} or {{{&unescaped}}} and there can
  // be whitespace after the 2nd '{'. We disallow these in attribute Values.
  const unescapedOpenTag = /{{\s*[&{]/;
  return unescapedOpenTag.test(value);
}

/**
 * Returns true if |value| contains a mustache partials template syntax.
 * @param {string} value
 * @return {boolean}
 */
function attrValueHasPartialsTemplateSyntax(value) {
  // Mustache (https://mustache.github.io/mustache.5.html), our template
  // system, supports 'partials' which include other Mustache templates
  // in the format of {{>partial}} and there can be whitespace after the {{.
  // We disallow partials in attribute values.
  const partialsTag = /{{\s*>/;
  return partialsTag.test(value);
}

/**
 * Validates whether the parent tag satisfied the spec (e.g., some
 * tags can only appear in head).
 * @param {!ParsedTagSpec} parsedTagSpec
 * @param {!Context} context
 * @param {!amp.validator.ValidationResult} validationResult
 */
function validateParentTag(parsedTagSpec, context, validationResult) {
  const spec = parsedTagSpec.getSpec();
  if (spec.mandatoryParent !== null &&
      spec.mandatoryParent !== context.getTagStack().parentTagName()) {
    if (amp.validator.LIGHT) {
      validationResult.status = amp.validator.ValidationResult.Status.FAIL;
      return;
    }
    // Output a parent/child error using CSS Child Selector syntax which is
    // both succinct and should be well understood by web developers.
    context.addError(
        amp.validator.ValidationError.Code.WRONG_PARENT_TAG,
        context.getLineCol(),
        /* params */
        [
          getTagSpecName(spec),
          context.getTagStack().parentTagName().toLowerCase(),
          spec.mandatoryParent.toLowerCase()
        ],
        getTagSpecUrl(spec), validationResult);
  }
}

/**
 * Validates that this tag is an allowed descendant tag type.
 * Registers new descendent constraints if they are set.
 * @param {!amp.htmlparser.ParsedHtmlTag} encounteredTag
 * @param {!ParsedTagSpec} parsedTagSpec
 * @param {!Context} context
 * @param {!amp.validator.ValidationResult} validationResult
 */
function validateDescendantTags(
    encounteredTag, parsedTagSpec, context, validationResult) {
  const tagStack = context.getTagStack();

  for (var ii = 0; ii < tagStack.allowedDescendantsList().length; ++ii) {
    const allowedDescendantsList = tagStack.allowedDescendantsList()[ii];
    // If the tag we're validating is not whitelisted for a specific ancestor,
    // then throw an error.
    if (!allowedDescendantsList.allowedTags.includes(
            encounteredTag.upperName())) {
      if (amp.validator.LIGHT) {
        validationResult.status = amp.validator.ValidationResult.Status.FAIL;
        return;
      } else {
        context.addError(
            amp.validator.ValidationError.Code.DISALLOWED_TAG_ANCESTOR,
            context.getLineCol(),
            /* params */
            [
              encounteredTag.lowerName(),
              allowedDescendantsList.tagName.toLowerCase()
            ],
            getTagSpecUrl(parsedTagSpec), validationResult);
        return;
      }
    }
  }
}

/**
 * Validates if the 'no siblings allowed' rule exists.
 * @param {!ParsedTagSpec} parsedTagSpec
 * @param {!Context} context
 * @param {!amp.validator.ValidationResult} validationResult
 */
function validateNoSiblingsAllowedTags(
    parsedTagSpec, context, validationResult) {
  const spec = parsedTagSpec.getSpec();
  const tagStack = context.getTagStack();

  if (spec.siblingsDisallowed && tagStack.parentChildCount() > 0) {
    if (amp.validator.LIGHT) {
      validationResult.status = amp.validator.ValidationResult.Status.FAIL;
      return;
    } else {
      context.addError(
          amp.validator.ValidationError.Code.TAG_NOT_ALLOWED_TO_HAVE_SIBLINGS,
          context.getLineCol(),
          /* params */
          [spec.tagName.toLowerCase(), tagStack.parentTagName().toLowerCase()],
          getTagSpecUrl(spec), validationResult);
    }
  }

  if (tagStack.parentHasChildWithNoSiblingRule() &&
      tagStack.parentChildCount() > 0) {
    if (amp.validator.LIGHT) {
      validationResult.status = amp.validator.ValidationResult.Status.FAIL;
      return;
    } else {
      context.addError(
          amp.validator.ValidationError.Code.TAG_NOT_ALLOWED_TO_HAVE_SIBLINGS,
          tagStack.parentOnlyChildErrorLineCol(),
          /* params */
          [
            tagStack.parentOnlyChildTagName().toLowerCase(),
            tagStack.parentTagName().toLowerCase()
          ],
          getTagSpecUrl(spec), validationResult);
    }
  }
}

/**
 * Validates if the 'last child' rule exists.
 * @param {!Context} context
 * @param {!amp.validator.ValidationResult} validationResult
 */
function validateLastChildTags(context, validationResult) {
  const tagStack = context.getTagStack();

  if (tagStack.parentHasChildWithLastChildRule()) {
    if (amp.validator.LIGHT) {
      validationResult.status = amp.validator.ValidationResult.Status.FAIL;
      return;
    } else {
      context.addError(
          amp.validator.ValidationError.Code.MANDATORY_LAST_CHILD_TAG,
          tagStack.parentLastChildErrorLineCol(),
          /* params */
          [
            tagStack.parentLastChildTagName().toLowerCase(),
            tagStack.parentTagName().toLowerCase()
          ],
          tagStack.parentLastChildUrl(), validationResult);
    }
  }
}

/**
 * If this tag requires an extension and we have processed all extensions,
 * report an error if that extension has not been loaded.
 * @param {!ParsedTagSpec} parsedTagSpec
 * @param {!Context} context
 * @param {!amp.validator.ValidationResult} validationResult
 */
function validateRequiredExtensions(parsedTagSpec, context, validationResult) {
  const tagSpec = parsedTagSpec.getSpec();
  const extensionsCtx = context.getExtensions();
  for (let requiredExtension of tagSpec.requiresExtension) {
    if (!extensionsCtx.isExtensionLoaded(requiredExtension)) {
      if (amp.validator.LIGHT) {
        validationResult.status = amp.validator.ValidationResult.Status.FAIL;
        return;
      } else {
        context.addError(
            amp.validator.ValidationError.Code.MISSING_REQUIRED_EXTENSION,
            context.getLineCol(),
            /* params */
            [getTagSpecName(parsedTagSpec.getSpec()), requiredExtension],
            getTagSpecUrl(parsedTagSpec), validationResult);
      }
    }
  }
}

/**
 * If this attribute requires an extension and we have processed all extensions,
 * report an error if that extension has not been loaded.
 * @param {!ParsedAttrSpec} parsedAttrSpec
 * @param {!Context} context
 * @param {!amp.validator.ValidationResult} validationResult
 */
function validateAttrRequiredExtensions(
    parsedAttrSpec, context, validationResult) {
  const attrSpec = parsedAttrSpec.getSpec();
  const extensionsCtx = context.getExtensions();
  for (let requiredExtension of attrSpec.requiresExtension) {
    if (!extensionsCtx.isExtensionLoaded(requiredExtension)) {
      if (amp.validator.LIGHT) {
        validationResult.status = amp.validator.ValidationResult.Status.FAIL;
        return;
      } else {
        context.addError(
            amp.validator.ValidationError.Code.ATTR_MISSING_REQUIRED_EXTENSION,
            context.getLineCol(),
            /* params */
            [attrSpec.name, requiredExtension],
            /* specUrl */ '', validationResult);
      }
    }
  }
}

/**
 * Check for duplicates of tags that should be unique, reporting errors for
 * the second instance of each unique tag.
 * @param {!ParsedTagSpec} parsedTagSpec
 * @param {!Context} context
 * @param {!amp.validator.ValidationResult} validationResult
 */
function validateUniqueness(parsedTagSpec, context, validationResult) {
  const tagSpec = parsedTagSpec.getSpec();
  if (tagSpec.unique &&
      context.getTagspecsValidated().hasOwnProperty(parsedTagSpec.id())) {
    if (amp.validator.LIGHT) {
      validationResult.status = amp.validator.ValidationResult.Status.FAIL;
      return;
    } else {
      context.addError(
          amp.validator.ValidationError.Code.DUPLICATE_UNIQUE_TAG,
          context.getLineCol(),
          /* params */[getTagSpecName(tagSpec)], getTagSpecUrl(parsedTagSpec),
          validationResult);
    }
  }
}

/**
 * Considering that reference points could be defined by both reference
 * points and regular tag specs, check that we don't have matchers assigned
 * from both, there can be only one.
 * @param {?ParsedTagSpec} refPointSpec
 * @param {?ParsedTagSpec} tagSpec
 * @param {!Context} context
 * @param {!amp.validator.ValidationResult} validationResult
 */
function checkForReferencePointCollision(
    refPointSpec, tagSpec, context, validationResult) {
  if (refPointSpec === null || !refPointSpec.hasReferencePoints()) return;
  if (tagSpec === null || !tagSpec.hasReferencePoints()) return;

  if (amp.validator.LIGHT) {
    validationResult.status = amp.validator.ValidationResult.Status.FAIL;
  } else {
    context.addError(
        amp.validator.ValidationError.Code.TAG_REFERENCE_POINT_CONFLICT,
        context.getLineCol(),
        /* params */
        [
          getTagSpecName(tagSpec.getSpec()),
          refPointSpec.getReferencePoints().parentTagSpecName()
        ],
        refPointSpec.getReferencePoints().parentSpecUrl(), validationResult);
  }
}

/**
 * Validates if the tag ancestors satisfied the spec.
 * @param {!ParsedTagSpec} parsedTagSpec
 * @param {!Context} context
 * @param {!amp.validator.ValidationResult} validationResult
 */
function validateAncestorTags(parsedTagSpec, context, validationResult) {
  const spec = parsedTagSpec.getSpec();
  if (spec.mandatoryAncestor !== null) {
    const mandatoryAncestor = spec.mandatoryAncestor;
    if (!context.getTagStack().hasAncestor(mandatoryAncestor)) {
      if (amp.validator.LIGHT) {
        validationResult.status = amp.validator.ValidationResult.Status.FAIL;
      } else {
        if (spec.mandatoryAncestorSuggestedAlternative !== null) {
          context.addError(
              amp.validator.ValidationError.Code
                  .MANDATORY_TAG_ANCESTOR_WITH_HINT,
              context.getLineCol(),
              /* params */
              [
                getTagSpecName(spec), mandatoryAncestor.toLowerCase(),
                spec.mandatoryAncestorSuggestedAlternative.toLowerCase()
              ],
              getTagSpecUrl(spec), validationResult);
        } else {
          context.addError(
              amp.validator.ValidationError.Code.MANDATORY_TAG_ANCESTOR,
              context.getLineCol(),
              /* params */
              [getTagSpecName(spec), mandatoryAncestor.toLowerCase()],
              getTagSpecUrl(spec), validationResult);
        }
      }
      return;
    }
  }
  for (const disallowedAncestor of spec.disallowedAncestor) {
    if (context.getTagStack().hasAncestor(disallowedAncestor)) {
      if (amp.validator.LIGHT) {
        validationResult.status = amp.validator.ValidationResult.Status.FAIL;
      } else {
        context.addError(
            amp.validator.ValidationError.Code.DISALLOWED_TAG_ANCESTOR,
            context.getLineCol(),
            /* params */
            [getTagSpecName(spec), disallowedAncestor.toLowerCase()],
            getTagSpecUrl(spec), validationResult);
      }
      return;
    }
  }
}

/**
 * Validates the layout for the given tag. This involves checking the
 * layout, width, height, sizes attributes with AMP specific logic.
 * @param {!ParsedTagSpec} parsedTagSpec
 * @param {!Context} context
 * @param {!amp.htmlparser.ParsedHtmlTag} encounteredTag
 * @param {!amp.validator.ValidationResult} result
 */
function validateLayout(parsedTagSpec, context, encounteredTag, result) {
  const spec = parsedTagSpec.getSpec();
  goog.asserts.assert(spec.ampLayout !== null);

  const attrsByKey = encounteredTag.attrsByKey();
  const layoutAttr = attrsByKey['layout'];
  const widthAttr = attrsByKey['width'];
  const heightAttr = attrsByKey['height'];
  const sizesAttr = attrsByKey['sizes'];
  const heightsAttr = attrsByKey['heights'];

  // We disable validating layout for tags where one of the layout attributes
  // contains mustache syntax.
  const hasTemplateAncestor = context.getTagStack().hasAncestor('TEMPLATE');
  if (hasTemplateAncestor &&
      (attrValueHasTemplateSyntax(layoutAttr) ||
       attrValueHasTemplateSyntax(widthAttr) ||
       attrValueHasTemplateSyntax(heightAttr) ||
       attrValueHasTemplateSyntax(sizesAttr) ||
       attrValueHasTemplateSyntax(heightsAttr)))
    return;

  // Parse the input layout attributes which we found for this tag.
  const inputLayout = parseLayout(layoutAttr);
  if (layoutAttr !== undefined &&
      inputLayout === amp.validator.AmpLayout.Layout.UNKNOWN) {
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
    } else {
      context.addError(
          amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
          context.getLineCol(),
          /* params */['layout', getTagSpecName(spec), layoutAttr],
          getTagSpecUrl(spec), result);
    }
    return;
  }
  const inputWidth = new amp.validator.CssLength(
      widthAttr, /* allowAuto */ true, /* allowFluid */ false);
  if (!inputWidth.isValid) {
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
    } else {
      context.addError(
          amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
          context.getLineCol(),
          /* params */['width', getTagSpecName(spec), widthAttr],
          getTagSpecUrl(spec), result);
    }
    return;
  }
  const inputHeight = new amp.validator.CssLength(
      heightAttr, /* allowAuto */ true,
      /* allowFluid */ inputLayout === amp.validator.AmpLayout.Layout.FLUID);
  if (!inputHeight.isValid) {
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
    } else {
      context.addError(
          amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
          context.getLineCol(),
          /* params */['height', getTagSpecName(spec), heightAttr],
          getTagSpecUrl(spec), result);
    }
    return;
  }

  // Now calculate the effective layout attributes.
  const width = CalculateWidth(spec.ampLayout, inputLayout, inputWidth);
  const height = CalculateHeight(spec.ampLayout, inputLayout, inputHeight);
  const layout =
      CalculateLayout(inputLayout, width, height, sizesAttr, heightsAttr);

  // Only FLEX_ITEM allows for height to be set to auto.
  if (height.isAuto && layout !== amp.validator.AmpLayout.Layout.FLEX_ITEM) {
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
    } else {
      context.addError(
          amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
          context.getLineCol(),
          /* params */['height', getTagSpecName(spec), heightAttr],
          getTagSpecUrl(spec), result);
    }
    return;
  }

  // Does the tag support the computed layout?
  if (spec.ampLayout.supportedLayouts.indexOf(layout) === -1) {
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
    } else {
      const code = layoutAttr === undefined ?
          amp.validator.ValidationError.Code.IMPLIED_LAYOUT_INVALID :
          amp.validator.ValidationError.Code.SPECIFIED_LAYOUT_INVALID;
      context.addError(
          code, context.getLineCol(),
          /* params */[layout, getTagSpecName(spec)], getTagSpecUrl(spec),
          result);
    }
    return;
  }
  // FIXED, FIXED_HEIGHT, FLUID, INTRINSIC, RESPONSIVE must have height set.
  if ((layout === amp.validator.AmpLayout.Layout.FIXED ||
       layout === amp.validator.AmpLayout.Layout.FIXED_HEIGHT ||
       layout === amp.validator.AmpLayout.Layout.FLUID ||
       layout === amp.validator.AmpLayout.Layout.INTRINSIC ||
       layout === amp.validator.AmpLayout.Layout.RESPONSIVE) &&
      !height.isSet) {
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
    } else {
      context.addError(
          amp.validator.ValidationError.Code.MANDATORY_ATTR_MISSING,
          context.getLineCol(),
          /* params */['height', getTagSpecName(spec)], getTagSpecUrl(spec),
          result);
    }
    return;
  }
  // For FIXED_HEIGHT if width is set it must be auto.
  if (layout === amp.validator.AmpLayout.Layout.FIXED_HEIGHT && width.isSet &&
      !width.isAuto) {
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
    } else {
      context.addError(
          amp.validator.ValidationError.Code.ATTR_VALUE_REQUIRED_BY_LAYOUT,
          context.getLineCol(),
          /* params */
          [widthAttr, 'width', getTagSpecName(spec), 'FIXED_HEIGHT', 'auto'],
          getTagSpecUrl(spec), result);
    }
    return;
  }
  // FIXED, FLUID, INTRINSIC, RESPONSIVE must have width set and not be auto.
  if (layout === amp.validator.AmpLayout.Layout.FIXED ||
      layout === amp.validator.AmpLayout.Layout.FLUID ||
      layout === amp.validator.AmpLayout.Layout.INTRINSIC ||
      layout === amp.validator.AmpLayout.Layout.RESPONSIVE) {
    if (!width.isSet) {
      if (amp.validator.LIGHT) {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      } else {
        context.addError(
            amp.validator.ValidationError.Code.MANDATORY_ATTR_MISSING,
            context.getLineCol(),
            /* params */['width', getTagSpecName(spec)], getTagSpecUrl(spec),
            result);
      }
      return;
    } else if (width.isAuto) {
      if (amp.validator.LIGHT) {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      } else {
        context.addError(
            amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
            context.getLineCol(),
            /* params */['width', getTagSpecName(spec), 'auto'],
            getTagSpecUrl(spec), result);
      }
      return;
    }
  }
  // INTRINSIC, RESPONSIVE must have same units for height and width.
  if ((layout === amp.validator.AmpLayout.Layout.INTRINSIC ||
       layout === amp.validator.AmpLayout.Layout.RESPONSIVE) &&
      width.unit !== height.unit) {
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
    } else {
      context.addError(
          amp.validator.ValidationError.Code
              .INCONSISTENT_UNITS_FOR_WIDTH_AND_HEIGHT,
          context.getLineCol(),
          /* params */[getTagSpecName(spec), width.unit, height.unit],
          getTagSpecUrl(spec), result);
    }
    return;
  }
  // RESPONSIVE only allows heights attribute.
  if (heightsAttr !== undefined &&
      layout !== amp.validator.AmpLayout.Layout.RESPONSIVE) {
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
    } else {
      const code = layoutAttr === undefined ?
          amp.validator.ValidationError.Code.ATTR_DISALLOWED_BY_IMPLIED_LAYOUT :
          amp.validator.ValidationError.Code
              .ATTR_DISALLOWED_BY_SPECIFIED_LAYOUT;
      context.addError(
          code, context.getLineCol(),
          /* params */['heights', getTagSpecName(spec), layout],
          getTagSpecUrl(spec), result);
    }
    return;
  }
}

/**
 * Helper method for validateAttributes, for when an attribute is
 * encountered which is not specified by the validator.protoascii
 * specification.
 * @param {!ParsedTagSpec} parsedTagSpec
 * @param {!Context} context
 * @param {string} attrName
 * @param {!amp.validator.ValidationResult} result
 */
function validateAttrNotFoundInSpec(parsedTagSpec, context, attrName, result) {
  // For now, we just skip data- attributes in the validator, because
  // our schema doesn't capture which ones would be ok or not. E.g.
  // in practice, some type of ad or perhaps other custom elements require
  // particular data attributes.
  // http://www.w3.org/TR/html5/single-page.html#attr-data-*
  // http://w3c.github.io/aria-in-html/
  // However, to avoid parsing differences, we restrict the set of allowed
  // characters in the document.
  const dataAttrRe = /^data-[A-Za-z0-9-_:.]*$/;
  if (attrName.match(dataAttrRe) !== null) return;

  // At this point, it's an error either way, but we try to give a
  // more specific error in the case of Mustache template characters.
  if (amp.validator.LIGHT) {
    result.status = amp.validator.ValidationResult.Status.FAIL;
    return;
  }
  if (attrName.indexOf('{{') !== -1) {
    context.addError(
        amp.validator.ValidationError.Code.TEMPLATE_IN_ATTR_NAME,
        context.getLineCol(),
        /* params */[attrName, getTagSpecName(parsedTagSpec.getSpec())],
        context.getRules().getTemplateSpecUrl(), result);
  } else if (attrName === 'style') {
    context.addError(
        amp.validator.ValidationError.Code.DISALLOWED_STYLE_ATTR,
        context.getLineCol(), /* params */[],
        context.getRules().getStylesSpecUrl(), result);
  } else {
    context.addError(
        amp.validator.ValidationError.Code.DISALLOWED_ATTR,
        context.getLineCol(),
        /* params */[attrName, getTagSpecName(parsedTagSpec.getSpec())],
        getTagSpecUrl(parsedTagSpec), result);
  }
}

/**
 * Specific checks for attribute values descending from a template tag.
 * @param {!ParsedTagSpec} parsedTagSpec
 * @param {!Context} context
 * @param {!Object} attr
 * @param {!amp.validator.ValidationResult} result
 */
function validateAttrValueBelowTemplateTag(
    parsedTagSpec, context, attr, result) {
  if (attrValueHasUnescapedTemplateSyntax(attr.value)) {
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
    } else {
      const spec = parsedTagSpec.getSpec();
      context.addError(
          amp.validator.ValidationError.Code.UNESCAPED_TEMPLATE_IN_ATTR_VALUE,
          context.getLineCol(),
          /* params */[attr.name, getTagSpecName(spec), attr.value],
          context.getRules().getTemplateSpecUrl(), result);
    }
  } else if (attrValueHasPartialsTemplateSyntax(attr.value)) {
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
    } else {
      const spec = parsedTagSpec.getSpec();
      context.addError(
          amp.validator.ValidationError.Code.TEMPLATE_PARTIAL_IN_ATTR_VALUE,
          context.getLineCol(),
          /* params */[attr.name, getTagSpecName(spec), attr.value],
          context.getRules().getTemplateSpecUrl(), result);
    }
  }
}

/**
 * Validates whether an encountered attribute is validated by an ExtensionSpec.
 * ExtensionSpec's validate the 'custom-element', 'custom-template', and 'src'
 * attributes. If an error is found, it is added to the |result|. The return
 * value indicates whether or not the provided attribute is explained by this
 * validation function.
 * @param {!amp.validator.TagSpec} tagSpec
 * @param {!Context} context
 * @param {!Object} attr
 * @param {!amp.validator.ValidationResult} result
 * @return {boolean}
 */
function validateAttributeInExtension(tagSpec, context, attr, result) {
  goog.asserts.assert(tagSpec.extensionSpec !== null);

  const extensionSpec = tagSpec.extensionSpec;
  // TagSpecs with extensions will only be evaluated if their dispatch_key
  // matches, which is based on this custom-element/custom-template field
  // attribute value. The dispatch key matching is case-insensitive for
  // faster lookups, so it still possible for the attribute value to not
  // match if it contains upper-case letters.
  if (!extensionSpec.isCustomTemplate && attr.name === 'custom-element') {
    if (extensionSpec.name !== attr.value) {
      goog.asserts.assert(extensionSpec.name === attr.value.toLowerCase());
      return false;
    }
    return true;
  } else if (
      extensionSpec.isCustomTemplate && attr.name === 'custom-template') {
    if (extensionSpec.name !== attr.value) {
      goog.asserts.assert(extensionSpec.name === attr.value.toLowerCase());
      return false;
    }
    return true;
  } else if (attr.name === 'src') {
    const srcUrlRe =
        /^https:\/\/cdn\.ampproject\.org\/v0\/(amp-[a-z0-9-]*)-([a-z0-9.]*)\.js$/;
    let reResult = srcUrlRe.exec(attr.value);
    // If the src URL matches this regex and the base name of the file matches
    // the extension, look to see if the version matches.
    if (reResult !== null && reResult[1] === extensionSpec.name) {
      const encounteredVersion = reResult[2];
      if (!amp.validator.LIGHT) {
        if (extensionSpec.deprecatedVersions.indexOf(encounteredVersion) !==
            -1) {
          context.addWarning(
              amp.validator.ValidationError.Code
                  .WARNING_EXTENSION_DEPRECATED_VERSION,
              context.getLineCol(),
              /* params */[extensionSpec.name, encounteredVersion],
              getTagSpecUrl(tagSpec), result);
          return true;
        }
      }
      if (extensionSpec.allowedVersions.indexOf(encounteredVersion) !== -1)
        return true;
    }
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
    } else {
      context.addError(
          amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
          context.getLineCol(),
          /* params */[attr.name, getTagSpecName(tagSpec), attr.value],
          getTagSpecUrl(tagSpec), result);
    }
    return true;
  }
  return false;
}

/**
 * Validates whether the attributes set on |encountered_tag| conform to this
 * tag specification. All mandatory attributes must appear. Only attributes
 * explicitly mentioned by this tag spec may appear.
 * Returns true iff the validation is successful.
 * @param {!ParsedTagSpec} parsedTagSpec
 * @param {?ParsedTagSpec} bestMatchReferencePoint
 * @param {!Context} context
 * @param {!amp.htmlparser.ParsedHtmlTag} encounteredTag
 * @param {!amp.validator.ValidationResult} result
 */
function validateAttributes(
    parsedTagSpec, bestMatchReferencePoint, context, encounteredTag, result) {
  const spec = parsedTagSpec.getSpec();
  if (spec.ampLayout !== null) {
    validateLayout(parsedTagSpec, context, encounteredTag, result);
    if (result.status === amp.validator.ValidationResult.Status.FAIL &&
        amp.validator.LIGHT) {
      return;
    }
  }
  // For extension TagSpecs, we track if we've validated a src attribute.
  // We must have done so for the extension to be valid.
  let seenExtensionSrcAttr = false;
  const hasTemplateAncestor = context.getTagStack().hasAncestor('TEMPLATE');
  /** @type {!Array<boolean>} */
  let mandatoryAttrsSeen = [];  // This is a set of attr ids.
  /** @type {!Array<number>} */
  const mandatoryOneofsSeen = [];  // This is small list of interned strings.
  /** @type {!Array<!amp.validator.AttrSpec>} */
  const triggersToCheck = [];
  /**
   * If a tag has implicit attributes, we then add these attributes as
   * validated. E.g. tag 'a' has implicit attributes 'role' and 'tabindex'.
   * @type {!Array<?>}
   */
  const attrspecsValidated = [];
  for (const implicit of parsedTagSpec.getImplicitAttrspecs()) {
    attrspecsValidated[implicit] = 0;
  }
  // Our html parser delivers attributes as an array of alternating keys and
  // values. We skip over this array 2 at a time to iterate over the keys.
  const attrsByName = parsedTagSpec.getAttrsByName();
  for (let attr of encounteredTag.attrs()) {
    if (!(attr.name in attrsByName)) {
      // While validating a reference point, we skip attributes that
      // we don't have a spec for. They will be validated when the
      // TagSpec itself gets validated.
      if (parsedTagSpec.isReferencePoint()) continue;
      // On the other hand, if we did just validate a reference point for
      // this tag, we check whether that reference point covers the attribute.
      if (bestMatchReferencePoint !== null &&
          bestMatchReferencePoint.hasAttrWithName(attr.name))
        continue;

      // If |spec| is an extension, then we ad-hoc validate 'custom-element',
      // 'custom-templa'te, and 'src' attributes by calling this method.
      // For 'src', we also keep track whether we validated it this way,
      // (seen_src_attr), since it's a mandatory attr.
      if (spec.extensionSpec !== null &&
          validateAttributeInExtension(spec, context, attr, result)) {
        if (attr.name === 'src') seenExtensionSrcAttr = true;
        continue;
      }
      validateAttrNotFoundInSpec(parsedTagSpec, context, attr.name, result);
      if (result.status === amp.validator.ValidationResult.Status.FAIL) {
        if (amp.validator.LIGHT)
          return;
        else
          continue;
      }
      if (hasTemplateAncestor) {
        validateAttrValueBelowTemplateTag(parsedTagSpec, context, attr, result);
        if (result.status === amp.validator.ValidationResult.Status.FAIL) {
          if (amp.validator.LIGHT)
            return;
          else
            continue;
        }
      }
      continue;
    }
    if (hasTemplateAncestor) {
      validateAttrValueBelowTemplateTag(parsedTagSpec, context, attr, result);
      if (result.status === amp.validator.ValidationResult.Status.FAIL) {
        if (amp.validator.LIGHT)
          return;
        else
          continue;
      }
    }
    const attrId = attrsByName[attr.name];
    if (attrId < 0) {
      attrspecsValidated[attrId] = 0;
      continue;
    }
    const parsedAttrSpec =
        context.getRules().getParsedAttrSpecs().getByAttrSpecId(attrId);
    const attrSpec = parsedAttrSpec.getSpec();
    if (!amp.validator.LIGHT && attrSpec.deprecation !== null) {
      context.addWarning(
          amp.validator.ValidationError.Code.DEPRECATED_ATTR,
          context.getLineCol(),
          /* params */
          [attr.name, getTagSpecName(spec), attrSpec.deprecation],
          attrSpec.deprecationUrl, result);
      // Deprecation is only a warning, so we don't return.
    }
    if (attrSpec.requiresExtension.length > 0) {
      validateAttrRequiredExtensions(parsedAttrSpec, context, result);
    }
    if (!hasTemplateAncestor || !attrValueHasTemplateSyntax(attr.value)) {
      validateNonTemplateAttrValueAgainstSpec(
          parsedAttrSpec, context, attr, spec, result);
      if (result.status === amp.validator.ValidationResult.Status.FAIL) {
        if (amp.validator.LIGHT)
          return;
        else
          continue;
      }
    }
    if (attrSpec.blacklistedValueRegex !== null) {
      const decodedAttrValue = decodeAttrValue(attr.value);
      const regex = context.getRules().getPartialMatchCaseiRegex(
          attrSpec.blacklistedValueRegex);
      if (regex.test(attr.value) || regex.test(decodedAttrValue)) {
        if (amp.validator.LIGHT) {
          result.status = amp.validator.ValidationResult.Status.FAIL;
          return;
        } else {
          context.addError(
              amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
              context.getLineCol(),
              /* params */[attr.name, getTagSpecName(spec), attr.value],
              getTagSpecUrl(spec), result);
          continue;
        }
      }
    }
    if (attrSpec.mandatory) {
      mandatoryAttrsSeen[parsedAttrSpec.getId()] = true;
    }
    if (parsedTagSpec.getSpec().tagName === 'BASE' && attr.name === 'href' &&
        context.hasSeenUrl()) {
      if (amp.validator.LIGHT) {
        result.status = amp.validator.ValidationResult.Status.FAIL;
        return;
      } else {
        context.addError(
            amp.validator.ValidationError.Code.BASE_TAG_MUST_PRECEED_ALL_URLS,
            context.getLineCol(),
            /* params */[context.firstSeenUrlTagName()], getTagSpecUrl(spec),
            result);
        continue;
      }
    }
    const mandatoryOneof = attrSpec.mandatoryOneof;
    if (mandatoryOneof !== null) {
      // The "at most 1" part of mandatory_oneof: mandatory_oneof
      // wants exactly one of the alternatives, so here
      // we check whether we already saw another alternative
      if (mandatoryOneofsSeen.indexOf(mandatoryOneof) !== -1) {
        if (amp.validator.LIGHT) {
          result.status = amp.validator.ValidationResult.Status.FAIL;
          return;
        } else {
          context.addError(
              amp.validator.ValidationError.Code.MUTUALLY_EXCLUSIVE_ATTRS,
              context.getLineCol(),
              /* params */
              [
                getTagSpecName(spec),
                context.getRules().getInternedString(mandatoryOneof)
              ],
              getTagSpecUrl(spec), result);
          continue;
        }
      }
      mandatoryOneofsSeen.push(mandatoryOneof);
    }
    attrspecsValidated[parsedAttrSpec.getId()] = 0;
    // If the trigger does not have an if_value_regex, then proceed to add the
    // spec. If it does have an if_value_regex, then test the regex to see
    // if it should add the spec.
    if (attrSpec.trigger === null) continue;
    const trigger = attrSpec.trigger;
    if (trigger.ifValueRegex === null ||
        context.getRules()
            .getFullMatchRegex(trigger.ifValueRegex)
            .test(attr.value)) {
      triggersToCheck.push(attrSpec);
    }
  }
  if (result.status === amp.validator.ValidationResult.Status.FAIL) return;
  // The "at least 1" part of mandatory_oneof: If none of the
  // alternatives were present, we report that an attribute is missing.
  for (const mandatoryOneof of parsedTagSpec.getMandatoryOneofs()) {
    if (mandatoryOneofsSeen.indexOf(mandatoryOneof) === -1) {
      if (amp.validator.LIGHT) {
        result.status = amp.validator.ValidationResult.Status.FAIL;
        return;
      } else {
        context.addError(
            amp.validator.ValidationError.Code.MANDATORY_ONEOF_ATTR_MISSING,
            context.getLineCol(),
            /* params */
            [
              getTagSpecName(spec),
              context.getRules().getInternedString(mandatoryOneof)
            ],
            getTagSpecUrl(spec), result);
      }
    }
  }
  for (const attrSpec of triggersToCheck) {
    for (const alsoRequiresAttr of attrSpec.trigger.alsoRequiresAttr) {
      if (!(alsoRequiresAttr in attrsByName)) {
        continue;
      }
      const attrId = attrsByName[alsoRequiresAttr];
      if (!attrspecsValidated.hasOwnProperty(attrId)) {
        if (amp.validator.LIGHT) {
          result.status = amp.validator.ValidationResult.Status.FAIL;
        } else {
          context.addError(
              amp.validator.ValidationError.Code.ATTR_REQUIRED_BUT_MISSING,
              context.getLineCol(),
              /* params */
              [
                context.getRules().getParsedAttrSpecs().getNameByAttrSpecId(
                    attrId),
                getTagSpecName(spec), attrSpec.name
              ],
              getTagSpecUrl(spec), result);
        }
      }
    }
  }
  for (const mandatory of parsedTagSpec.getMandatoryAttrIds()) {
    if (!mandatoryAttrsSeen.hasOwnProperty(mandatory)) {
      if (amp.validator.LIGHT) {
        result.status = amp.validator.ValidationResult.Status.FAIL;
        break;
      } else {
        context.addError(
            amp.validator.ValidationError.Code.MANDATORY_ATTR_MISSING,
            context.getLineCol(),
            /* params */
            [
              context.getRules().getParsedAttrSpecs().getNameByAttrSpecId(
                  mandatory),
              getTagSpecName(spec)
            ],
            getTagSpecUrl(spec), result);
      }
    }
  }
  // Extension specs mandate the 'src' attribute.
  if (spec.extensionSpec !== null && !seenExtensionSrcAttr) {
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
    } else {
      context.addError(
          amp.validator.ValidationError.Code.MANDATORY_ATTR_MISSING,
          context.getLineCol(),
          /* params */['src', getTagSpecName(spec)], getTagSpecUrl(spec),
          result);
    }
  }
}

/**
 * This small class (struct) stores the dispatch rules for all TagSpecs
 * with the same tag name.
 * @private
 */
class TagSpecDispatch {
  /** Creates an empty instance. */
  constructor() {
    /**
     * TagSpec ids for a specific attribute dispatch key.
     * @type {Object<string, number>}
     * @private
     */
    this.tagSpecsByDispatch_ = null;
    /**
     * @type {!Array<number>}
     * @private
     */
    this.allTagSpecs_ = [];
  }

  /**
   * Registers a new dispatch key to match a tagspec id
   * @param {string} dispatchKey
   * @param {number} tagSpecId
   * @public
   */
  registerDispatchKey(dispatchKey, tagSpecId) {
    if (this.tagSpecsByDispatch_ === null) {
      this.tagSpecsByDispatch_ = Object.create(null);
    }
    goog.asserts.assert(!(dispatchKey in this.tagSpecsByDispatch_));
    this.tagSpecsByDispatch_[dispatchKey] = tagSpecId;
  }

  /**
   * Registers a new non dispatch key tagspec id.
   * @param {number} tagSpecId
   * @public
   */
  registerTagSpec(tagSpecId) {
    this.allTagSpecs_.push(tagSpecId);
  }

  /**
   * @return {boolean}
   */
  empty() {
    return !this.hasDispatchKeys() && !this.hasTagSpecs();
  }

  /**
   * @return {boolean}
   */
  hasDispatchKeys() {
    return this.tagSpecsByDispatch_ !== null;
  }

  /**
   * Looks up a dispatch key as previously registered, returning the
   * corresponding tagSpecId or -1 if none.
   * @param {string} attrName
   * @param {string} attrValue
   * @param {string} mandatoryParent
   * @return {number}
   */
  matchingDispatchKey(attrName, attrValue, mandatoryParent) {
    if (!this.hasDispatchKeys()) return -1;

    // Try first to find a key with the given parent.
    const dispatchKey = makeDispatchKey(
        amp.validator.AttrSpec.DispatchKeyType.NAME_VALUE_PARENT_DISPATCH,
        attrName, attrValue, mandatoryParent);
    const match = this.tagSpecsByDispatch_[dispatchKey];
    if (match !== undefined) {
      return match;
    }

    // Try next to find a key that allows any parent.
    const noParentKey = makeDispatchKey(
        amp.validator.AttrSpec.DispatchKeyType.NAME_VALUE_DISPATCH, attrName,
        attrValue, '');
    const noParentMatch = this.tagSpecsByDispatch_[noParentKey];
    if (noParentMatch !== undefined) {
      return noParentMatch;
    }

    // Try last to find a key that matches just this attribute name.
    const noValueKey = makeDispatchKey(
        amp.validator.AttrSpec.DispatchKeyType.NAME_DISPATCH, attrName, '', '');
    const noValueMatch = this.tagSpecsByDispatch_[noValueKey];
    if (noValueMatch !== undefined) {
      return noValueMatch;
    }

    // Special case for foo=foo. We consider this a match for a dispatch key of
    // foo="" or just <tag foo>.
    if (attrName === attrValue)
      return this.matchingDispatchKey(attrName, '', mandatoryParent);

    return -1;
  }

  /**
   * @return {boolean}
   */
  hasTagSpecs() {
    return this.allTagSpecs_.length > 0;
  }

  /**
   * @return {!Array<number>}
   */
  allTagSpecs() {
    return this.allTagSpecs_;
  }
}

/**
 * Validates the provided |tagName| with respect to a single tag
 * specification.
 * @param {!ParsedTagSpec} parsedTagSpec
 * @param {?ParsedTagSpec} bestMatchReferencePoint
 * @param {!Context} context
 * @param {!amp.htmlparser.ParsedHtmlTag} encounteredTag
 * @return {!amp.validator.ValidationResult}
 */
function validateTagAgainstSpec(
    parsedTagSpec, bestMatchReferencePoint, context, encounteredTag) {
  let resultForAttempt = new amp.validator.ValidationResult();
  resultForAttempt.status = amp.validator.ValidationResult.Status.PASS;
  validateParentTag(parsedTagSpec, context, resultForAttempt);
  validateAncestorTags(parsedTagSpec, context, resultForAttempt);
  // Some parent tag specs also define allowed child tag names for the first
  // child or all children. Validate that we aren't violating any of those
  // rules either.
  context.getTagStack().matchChildTagName(
      encounteredTag, context, resultForAttempt);
  // Only validate attributes if we haven't yet found any errors. The
  // Parent/Ancestor errors are informative without adding additional errors
  // about attributes.
  if (resultForAttempt.status === amp.validator.ValidationResult.Status.PASS) {
    validateAttributes(
        parsedTagSpec, bestMatchReferencePoint, context, encounteredTag,
        resultForAttempt);
  }
  validateDescendantTags(
      encounteredTag, parsedTagSpec, context, resultForAttempt);
  validateNoSiblingsAllowedTags(parsedTagSpec, context, resultForAttempt);
  validateLastChildTags(context, resultForAttempt);
  // If we haven't reached the body element yet, we may not have seen the
  // necessary extension. That case is handled elsewhere.
  if (context.getTagStack().hasAncestor('BODY')) {
    validateRequiredExtensions(parsedTagSpec, context, resultForAttempt);
  }
  // Only validate uniqueness if we haven't yet found any errors, as it's
  // likely that this is not the correct tagspec if we have.
  if (resultForAttempt.status === amp.validator.ValidationResult.Status.PASS) {
    validateUniqueness(parsedTagSpec, context, resultForAttempt);
  }

  // Append some warnings, only if no errors.
  if (!amp.validator.LIGHT &&
      resultForAttempt.status === amp.validator.ValidationResult.Status.PASS) {
    const tagSpec = parsedTagSpec.getSpec();
    if (tagSpec.deprecation !== null) {
      context.addWarning(
          amp.validator.ValidationError.Code.DEPRECATED_TAG,
          context.getLineCol(),
          /* params */[getTagSpecName(tagSpec), tagSpec.deprecation],
          tagSpec.deprecationUrl, resultForAttempt);
    }
    if (tagSpec.uniqueWarning &&
        context.getTagspecsValidated().hasOwnProperty(parsedTagSpec.id())) {
      context.addWarning(
          amp.validator.ValidationError.Code.DUPLICATE_UNIQUE_TAG_WARNING,
          context.getLineCol(),
          /* params */[getTagSpecName(tagSpec)], getTagSpecUrl(tagSpec),
          resultForAttempt);
    }
  }
  return resultForAttempt;
}

/**
 * Validates the provided |tagName| with respect to the tag
 * specifications in the validator's rules, resturning a ValidationResult
 * with errors for this tag and a PASS or FAIL status. At least one
 * specification must validate, or the result will have status FAIL.
 * Also passes back a reference to the tag spec which matched, if a match
 * was found.
 * @param {!amp.htmlparser.ParsedHtmlTag} encounteredTag
 * @param {?ParsedTagSpec} bestMatchReferencePoint
 * @param {!Context} context
 * @return {ValidateTagResult}
 */
function validateTag(encounteredTag, bestMatchReferencePoint, context) {
  let tagSpecDispatch =
      context.getRules().dispatchForTagName(encounteredTag.upperName());
  // If there are no dispatch keys matching the tag name, ex: tag name is
  // "foo", set a disallowed tag error.
  if (tagSpecDispatch === undefined) {
    let result = new amp.validator.ValidationResult();
    if (amp.validator.LIGHT) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
    } else {
      let specUrl = '';
      // Special case the spec_url for font tags to be slightly more useful.
      if (encounteredTag.upperName() === 'FONT')
        specUrl = context.getRules().getStylesSpecUrl();
      context.addError(
          amp.validator.ValidationError.Code.DISALLOWED_TAG,
          context.getLineCol(),
          /* params */[encounteredTag.lowerName()], specUrl, result);
    }
    return {validationResult: result, bestMatchTagSpec: null};
  }

  // At this point, we have dispatch keys, tagspecs, or both.
  // The strategy is to look for a matching dispatch key first. A matching
  // dispatch key does not guarantee that the dispatched tagspec will also
  // match. If we find a matching dispatch key, we immediately return the
  // result for that tagspec, success or fail.
  // If we don't find a matching dispatch key, we must try all of the
  // tagspecs to see if any of them match. If there are no tagspecs, we want
  // to return a GENERAL_DISALLOWED_TAG error.
  // calling HasDispatchKeys here is only an optimization to skip the loop
  // over encountered attributes in the case where we have no dispatches.
  let bestMatchTagSpec = null;
  if (tagSpecDispatch.hasDispatchKeys()) {
    for (let attr of encounteredTag.attrs()) {
      const maybeTagSpecId = tagSpecDispatch.matchingDispatchKey(
          attr.name,
          // Attribute values are case-sensitive by default, but we
          // match dispatch keys in a case-insensitive manner and then
          // validate using whatever the tagspec requests.
          attr.value.toLowerCase(), context.getTagStack().parentTagName());
      if (maybeTagSpecId !== -1) {
        bestMatchTagSpec = context.getRules().getByTagSpecId(maybeTagSpecId);
        return {
          bestMatchTagSpec: bestMatchTagSpec,
          validationResult: validateTagAgainstSpec(
              bestMatchTagSpec, bestMatchReferencePoint, context,
              encounteredTag)
        };
      }
    }
    // If none of the dispatch tagspecs matched and passed and there are no
    // non-dispatch tagspecs, consider this a 'generally' disallowed tag,
    // which gives an error that reads "tag foo is disallowed except in
    // specific forms".
    if (!tagSpecDispatch.hasTagSpecs()) {
      let result = new amp.validator.ValidationResult();
      if (amp.validator.LIGHT) {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      } else if (encounteredTag.upperName() === 'SCRIPT') {
        // Special case for <script> tags to produce better error messages.
        context.addError(
            amp.validator.ValidationError.Code.DISALLOWED_SCRIPT_TAG,
            context.getLineCol(),
            /* params */[], context.getRules().getScriptSpecUrl(), result);
      } else {
        context.addError(
            amp.validator.ValidationError.Code.GENERAL_DISALLOWED_TAG,
            context.getLineCol(),
            /* params */[encounteredTag.lowerName()],
            /* specUrl */ '', result);
      }
      return {validationResult: result, bestMatchTagSpec: null};
    }
  }
  // Validate against all remaining tagspecs. Each tagspec will produce a
  // different set of errors. Even if none of them match, we only want to
  // return errors from a single tagspec, not all of them. We keep around
  // the 'best' attempt until we have found a matching TagSpec or have
  // tried them all.
  let resultForBestAttempt = new amp.validator.ValidationResult();
  resultForBestAttempt.status = amp.validator.ValidationResult.Status.UNKNOWN;
  for (const tagSpecId of tagSpecDispatch.allTagSpecs()) {
    const parsedTagSpec = context.getRules().getByTagSpecId(tagSpecId);
    const resultForAttempt = validateTagAgainstSpec(
        parsedTagSpec, bestMatchReferencePoint, context, encounteredTag);
    if (context.getRules().betterValidationResultThan(
            resultForAttempt, resultForBestAttempt)) {
      resultForBestAttempt.copyFrom(resultForAttempt);
      bestMatchTagSpec = parsedTagSpec;
      if (resultForBestAttempt.status ===
          amp.validator.ValidationResult.Status.PASS) {
        return {
          bestMatchTagSpec: bestMatchTagSpec,
          validationResult: resultForBestAttempt
        };
      }
    }
  }
  return {
    bestMatchTagSpec: bestMatchTagSpec,
    validationResult: resultForBestAttempt
  };
}

/**
 * This wrapper class provides access to the validation rules.
 * @private
 */
class ParsedValidatorRules {
  /**
   * Creates a new instance and initializes it with
   * amp.validator.ValidatorRules.
   * @param {string} htmlFormat
   */
  constructor(htmlFormat) {
    /** @private @type {!amp.validator.ValidatorRules} */
    this.rules_ = amp.validator.createRules();

    /**
     * ParsedTagSpecs in id order.
     * @type {!Array<!ParsedTagSpec>}
     * @private
     */
    this.parsedTagSpecById_ = new Array(this.rules_.tags.length);
    /**
     * ParsedTagSpecs keyed by name
     * @type {!Object<string, !TagSpecDispatch>}
     * @private
     */
    this.tagSpecByTagName_ = Object.create(null);
    /**
     * Tag ids that are mandatory for a document to legally validate.
     * @type {!Array<number>}
     * @private
     */
    this.mandatoryTagSpecs_ = [];

    /**
     * A cache for regex istantiations.
     * @type {!Array<!RegExp>}
     * @private
     */
    this.fullMatchRegexes_ = [];
    /**
     * A cache for regex istantiations.
     * @type {!Array<!RegExp>}
     * @private
     */
    this.fullMatchCaseiRegexes_ = [];
    /**
     * A cache for regex istantiations.
     * @type {!Array<!RegExp>}
     * @private
     */
    this.partialMatchCaseiRegexes_ = [];

    /**
     * A tuple of ('amp-form', 'form') would indicate that 'form' is an example
     * tag name that uses of the extension 'amp-form'.
     * @type {!Object<string, string>}
     * @private
     */
    this.exampleUsageByExtension_ = {};

    if (!amp.validator.LIGHT) {
      /**
       * @type {!function(!amp.validator.TagSpec) : boolean}
       * @private
       */
      this.isTagSpecCorrectHtmlFormat_ = function(tagSpec) {
        const castedHtmlFormat =
            /** @type {amp.validator.HtmlFormat.Code<string>} */ (
                /** @type {*} */ (htmlFormat));
        return tagSpec.htmlFormat.length === 0 ||
            tagSpec.htmlFormat.indexOf(castedHtmlFormat) !== -1;
      };
    }

    /**
     * @type {!ParsedAttrSpecs}
     * @private
     */
    this.parsedAttrSpecs_ = new ParsedAttrSpecs(this.rules_);

    /** @private @type {!Array<boolean>} */
    this.tagSpecIdsToTrack_ = [];
    var numTags = this.rules_.tags.length;
    for (var tagSpecId = 0; tagSpecId < numTags; ++tagSpecId) {
      const tag = this.rules_.tags[tagSpecId];
      if (!amp.validator.LIGHT) {
        if (!this.isTagSpecCorrectHtmlFormat_(tag)) {
          continue;
        }
        if (tag.alsoRequiresTagWarning.length > 0) {
          this.tagSpecIdsToTrack_[tagSpecId] = true;
        }
        for (const otherTag of tag.alsoRequiresTagWarning) {
          this.tagSpecIdsToTrack_[otherTag] = true;
        }
      }
      if (tag.tagName !== '$REFERENCE_POINT') {
        if (!(tag.tagName in this.tagSpecByTagName_)) {
          this.tagSpecByTagName_[tag.tagName] = new TagSpecDispatch();
        }
        const tagnameDispatch = this.tagSpecByTagName_[tag.tagName];
        if (tag.extensionSpec !== null) {
          // This tag is an extension. Compute and register a dispatch key
          // for it.
          var dispatchKey;
          var attrName = tag.extensionSpec.isCustomTemplate ?
              'custom-template' :
              'custom-element';
          dispatchKey = makeDispatchKey(
              amp.validator.AttrSpec.DispatchKeyType.NAME_VALUE_DISPATCH,
              attrName, /** @type {string} */ (tag.extensionSpec.name), '');
          tagnameDispatch.registerDispatchKey(dispatchKey, tagSpecId);
        } else {
          const dispatchKey = this.rules_.dispatchKeyByTagSpecId[tagSpecId];
          if (dispatchKey === undefined) {
            tagnameDispatch.registerTagSpec(tagSpecId);
          } else {
            tagnameDispatch.registerDispatchKey(dispatchKey, tagSpecId);
          }
        }
      }
      if (tag.mandatory) {
        this.mandatoryTagSpecs_.push(tagSpecId);
      }
      // Produce a mapping from every extension to an example tag which
      // requires that extension.
      for (let i = 0; i < tag.requiresExtension.length; ++i) {
        const extension = tag.requiresExtension[i];
        // Some extensions have multiple tags that require them. Some tags
        // require multiple extensions. If we have two tags requiring an
        // extension, we prefer to use the one that lists the extension first
        // (i === 0) as an example of that extension.
        if (!this.exampleUsageByExtension_.hasOwnProperty(extension) || i === 0)
          this.exampleUsageByExtension_[extension] = getTagSpecName(tag);
      }
    }
    // The amp-ad tag doesn't require amp-ad javascript for historical
    // reasons. We still want to warn if you include the code but don't
    // use it.
    this.exampleUsageByExtension_['amp-ad'] = 'amp-ad';

    if (!amp.validator.LIGHT) {
      /**
       * @typedef {{ format: string, specificity: number }}
       */
      let ErrorCodeMetadata;

      /**
       * type {!Object<!amp.validator.ValidationError.Code,
       *               ErrorCodeMetadata>}
       *  @private
       */
      this.errorCodes_ = Object.create(null);
      for (let i = 0; i < this.rules_.errorFormats.length; ++i) {
        const errorFormat = this.rules_.errorFormats[i];
        goog.asserts.assert(errorFormat !== null);
        this.errorCodes_[errorFormat.code] = Object.create(null);
        this.errorCodes_[errorFormat.code].format = errorFormat.format;
      }
      for (let i = 0; i < this.rules_.errorSpecificity.length; ++i) {
        const errorSpecificity = this.rules_.errorSpecificity[i];
        goog.asserts.assert(errorSpecificity !== null);
        this.errorCodes_[errorSpecificity.code].specificity =
            errorSpecificity.specificity;
      }
    }
  }

  /**
   * @param {number} internedStringId
   * @return {!RegExp}
   */
  getFullMatchRegex(internedStringId) {
    const idx = -1 - internedStringId;
    if (this.fullMatchRegexes_.hasOwnProperty(idx)) {
      return this.fullMatchRegexes_[idx];
    }
    const re = new RegExp('^(' + this.rules_.internedStrings[idx] + ')$');
    this.fullMatchRegexes_[idx] = re;
    return re;
  }

  /**
   * @param {number} internedStringId
   * @return {!RegExp}
   */
  getFullMatchCaseiRegex(internedStringId) {
    const idx = -1 - internedStringId;
    if (this.fullMatchCaseiRegexes_.hasOwnProperty(idx)) {
      return this.fullMatchCaseiRegexes_[idx];
    }
    const re = new RegExp('^(' + this.rules_.internedStrings[idx] + ')$', 'i');
    this.fullMatchCaseiRegexes_[idx] = re;
    return re;
  }

  /**
   * @param {number} internedStringId
   * @return {!RegExp}
   */
  getPartialMatchCaseiRegex(internedStringId) {
    const idx = -1 - internedStringId;
    if (this.partialMatchCaseiRegexes_.hasOwnProperty(idx)) {
      return this.partialMatchCaseiRegexes_[idx];
    }
    const re = new RegExp(this.rules_.internedStrings[idx], 'i');
    this.partialMatchCaseiRegexes_[idx] = re;
    return re;
  }

  /**
   * @param {number} id
   * @return {string}
   */
  getInternedString(id) {
    return this.rules_.internedStrings[-1 - id];
  }

  /** @return {!amp.validator.ValidatorRules} */
  getRules() {
    return this.rules_;
  }

  /**
   * @param {amp.validator.ValidationError.Code} errorCode
   * @return {!string}
   */
  getFormatByCode(errorCode) {
    return this.errorCodes_[errorCode].format;
  }

  /** @return {?string} */
  getTemplateSpecUrl() {
    return this.rules_.templateSpecUrl;
  }

  /** @return {?string} */
  getStylesSpecUrl() {
    return this.rules_.stylesSpecUrl;
  }

  /** @return {?string} */
  getScriptSpecUrl() {
    return this.rules_.scriptSpecUrl;
  }

  /**
   * @param {amp.validator.ValidationError.Code} error_code
   * @return {number}
   */
  specificity(error_code) {
    return this.errorCodes_[error_code].specificity;
  }

  /**
   * A helper function which allows us to compare two candidate results
   * in validateTag to report the results which have the most specific errors.
   * @param {!Array<amp.validator.ValidationError>} errors
   * @return {number} maximum value of specificity found in all errors.
   */
  maxSpecificity(errors) {
    let max = 0;
    for (const error of errors) {
      goog.asserts.assert(error.code !== null);
      max = Math.max(this.specificity(error.code), max);
    }
    return max;
  };

  /**
   * Returns true iff statusA is a better status than statusB
   * @param {?amp.validator.ValidationResult.Status} statusA
   * @param {?amp.validator.ValidationResult.Status} statusB
   * @return {boolean}
   * @private
   */
  betterValidationStatusThan_(statusA, statusB) {
    // Equal, so not better than.
    if (statusA === statusB) return false;

    // PASS > FAIL > UNKNOWN
    if (statusA === amp.validator.ValidationResult.Status.PASS) return true;
    if (statusB === amp.validator.ValidationResult.Status.PASS) return false;
    if (statusA === amp.validator.ValidationResult.Status.FAIL) return true;
    goog.asserts.assert(
        statusA === amp.validator.ValidationResult.Status.UNKNOWN);
    return false;
  }

  /**
   * Returns true iff resultA is a better result than resultB.
   * @param {!amp.validator.ValidationResult} resultA
   * @param {!amp.validator.ValidationResult} resultB
   * @return {boolean}
   */
  betterValidationResultThan(resultA, resultB) {
    if (resultA.status !== resultB.status)
      return this.betterValidationStatusThan_(resultA.status, resultB.status);

    // In the light mode, we only have status values.
    if (!amp.validator.LIGHT) {
      // Prefer the most specific error found in either set.
      if (this.maxSpecificity(resultA.errors) >
          this.maxSpecificity(resultB.errors))
        return true;
      if (this.maxSpecificity(resultB.errors) >
          this.maxSpecificity(resultA.errors))
        return false;

      // Prefer the attempt with the fewest errors if the most specific errors
      // are the same.
      if (resultA.errors.length < resultB.errors.length) return true;
      if (resultB.errors.length < resultA.errors.length) return false;
    }

    // Equal, so not better than.
    return false;
  }

  /**
   * Returns an example tag which uses a given extension, or empty
   * string if none.
   * @param {string} extensionName
   * @return {string}
   */
  exampleTagForExtension(extensionName) {
    return this.exampleUsageByExtension_.hasOwnProperty(extensionName) ?
        this.exampleUsageByExtension_[extensionName] :
        '';
  }

  /**
   * Emits errors for tags that are specified to be mandatory.
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} validationResult
   */
  maybeEmitMandatoryTagValidationErrors(context, validationResult) {
    for (const tagSpecId of this.mandatoryTagSpecs_) {
      if (!context.getTagspecsValidated().hasOwnProperty(tagSpecId)) {
        if (amp.validator.LIGHT) {
          validationResult.status = amp.validator.ValidationResult.Status.FAIL;
          return;
        }
        const spec = this.getByTagSpecId(tagSpecId).getSpec();
        context.addError(
            amp.validator.ValidationError.Code.MANDATORY_TAG_MISSING,
            context.getLineCol(),
            /* params */[getTagSpecName(spec)], getTagSpecUrl(spec),
            validationResult);
      }
    }
  }

  /**
   * Emits errors for tags that specify that another tag is also required or
   * a condition is required to be satisfied.
   * Returns false iff context.Progress(result).complete.
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} validationResult
   */
  maybeEmitAlsoRequiresTagValidationErrors(context, validationResult) {
    /** @type {!Array<number>} */
    const tagspecsValidated =
        Object.keys(context.getTagspecsValidated()).map(Number);
    goog.array.sort(tagspecsValidated);
    for (const tagSpecId of tagspecsValidated) {
      const spec = this.getByTagSpecId(tagSpecId);
      for (const condition of spec.requires()) {
        if (!context.satisfiesCondition(condition)) {
          if (amp.validator.LIGHT) {
            validationResult.status =
                amp.validator.ValidationResult.Status.FAIL;
            return;
          }
          context.addError(
              amp.validator.ValidationError.Code.TAG_REQUIRED_BY_MISSING,
              context.getLineCol(),
              /* params */
              [
                context.getRules().getInternedString(condition),
                getTagSpecName(spec.getSpec())
              ],
              getTagSpecUrl(spec), validationResult);
        }
      }
      for (const condition of spec.excludes()) {
       if (context.satisfiesCondition(condition)) {
          if (amp.validator.LIGHT) {
            validationResult.status =
                amp.validator.ValidationResult.Status.FAIL;
            return;
          }
          context.addError(
              amp.validator.ValidationError.Code.TAG_EXCLUDED_BY_TAG,
              context.getLineCol(),
              /* params */
              [
                getTagSpecName(spec.getSpec()),
                context.getRules().getInternedString(condition)
              ],
              getTagSpecUrl(spec), validationResult);
        }
      }
      if (!amp.validator.LIGHT) {
        for (const tagspecId of spec.getAlsoRequiresTagWarning()) {
          if (!context.getTagspecsValidated().hasOwnProperty(tagspecId)) {
            const alsoRequiresTagspec = this.getByTagSpecId(tagspecId);
            context.addWarning(
                amp.validator.ValidationError.Code
                    .WARNING_TAG_REQUIRED_BY_MISSING,
                context.getLineCol(),
                /* params */
                [
                  getTagSpecName(alsoRequiresTagspec.getSpec()),
                  getTagSpecName(spec.getSpec())
                ],
                getTagSpecUrl(spec), validationResult);
          }
        }
      }
    }

    var extensionsCtx = context.getExtensions();
    let unusedRequired = extensionsCtx.unusedExtensionsRequired();
    for (const unusedExtensionName of unusedRequired) {
      if (amp.validator.LIGHT) {
        validationResult.status = amp.validator.ValidationResult.Status.FAIL;
        return;
      } else {  // !amp.validator.LIGHT
        context.addError(
            amp.validator.ValidationError.Code.EXTENSION_UNUSED,
            context.getLineCol(),
            /* params */[unusedExtensionName],
            /* specUrl */ '', validationResult);
      }
    }
  }

  /**
   * Emits errors for tags that are specified as mandatory alternatives.
   * Returns false iff context.Progress(result).complete.
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} validationResult
   */
  maybeEmitMandatoryAlternativesSatisfiedErrors(context, validationResult) {
    const satisfied = context.getMandatoryAlternativesSatisfied();
    /** @type {!Array<string>} */
    let missing = [];
    const specUrlsByMissing = Object.create(null);
    for (const tagSpec of this.rules_.tags) {
      if (tagSpec.mandatoryAlternatives === null ||
          !amp.validator.LIGHT && !this.isTagSpecCorrectHtmlFormat_(tagSpec)) {
        continue;
      }
      const alternative = tagSpec.mandatoryAlternatives;
      if (satisfied.indexOf(alternative) === -1) {
        if (amp.validator.LIGHT) {
          validationResult.status = amp.validator.ValidationResult.Status.FAIL;
          return;
        }
        const alternativeName =
            context.getRules().getInternedString(alternative);
        missing.push(alternativeName);
        specUrlsByMissing[alternativeName] = getTagSpecUrl(tagSpec);
      }
    }
    if (!amp.validator.LIGHT) {
      sortAndUniquify(missing);
      for (const tagMissing of missing) {
        context.addError(
            amp.validator.ValidationError.Code.MANDATORY_TAG_MISSING,
            context.getLineCol(),
            /* params */[tagMissing],
            /* specUrl */ specUrlsByMissing[tagMissing], validationResult);
      }
    }
  }

  /**
   * Emits any validation errors which require a global view
   * (mandatory tags, tags required by other tags, mandatory alternatives).
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} validationResult
   */
  maybeEmitGlobalTagValidationErrors(context, validationResult) {
    this.maybeEmitMandatoryTagValidationErrors(context, validationResult);
    this.maybeEmitAlsoRequiresTagValidationErrors(context, validationResult);
    this.maybeEmitMandatoryAlternativesSatisfiedErrors(
        context, validationResult);
  }

  /**
   * @param {number} id
   * @return {!ParsedTagSpec}
   */
  getByTagSpecId(id) {
    let parsed = this.parsedTagSpecById_[id];
    if (parsed !== undefined) {
      return parsed;
    }
    const tag = this.rules_.tags[id];
    goog.asserts.assert(tag !== undefined);
    parsed = new ParsedTagSpec(
        this.parsedAttrSpecs_,
        shouldRecordTagspecValidated(tag, id, this.tagSpecIdsToTrack_), tag,
        id);
    this.parsedTagSpecById_[id] = parsed;
    return parsed;
  }

  /**
   * @param {!string} tagName
   * @return {TagSpecDispatch|undefined}
   */
  dispatchForTagName(tagName) {
    return this.tagSpecByTagName_[tagName];
  }

  /**
   * @return {!ParsedAttrSpecs}
   */
  getParsedAttrSpecs() {
    return this.parsedAttrSpecs_;
  }

  /**
   * @return {!Array<amp.validator.DescendantTagList>}
   */
  getDescendantTagLists() {
    return this.rules_.descendantTagList;
  }

  /**
   * Computes the name for a given reference point.
   * Used in generating error strings.
   * @param {!amp.validator.ReferencePoint} referencePoint
   * @return {string}
   */
  getReferencePointName(referencePoint) {
    // tagSpecName here is actually a number, which was replaced in
    // validator_gen_js.py from the name string, so this works.
    const tagSpecId = /** @type {!number} */ (referencePoint.tagSpecName);
    const refPointSpec = this.getByTagSpecId(tagSpecId);
    return getTagSpecName(refPointSpec.getSpec());
  }
}

/** @type {!Object<string, !ParsedValidatorRules>} */
const parsedValidatorRulesByFormat = Object.create(null);

/**
 * @param {string} htmlFormat
 * @return {!ParsedValidatorRules}
 */
function getParsedValidatorRules(htmlFormat) {
  if (!(htmlFormat in parsedValidatorRulesByFormat)) {
    const rules = new ParsedValidatorRules(htmlFormat);
    parsedValidatorRulesByFormat[htmlFormat] = rules;
    return rules;
  }
  return parsedValidatorRulesByFormat[htmlFormat];
}

/**
 * Computes the byte length, rather than character length, of a utf8 string.
 * https://en.wikipedia.org/wiki/UTF-8
 * @param {string} utf8Str
 * @return {number}
 */
function byteLength(utf8Str) {
  // To figure out which characters are multi-byte we can abuse
  // encodeURIComponent which will escape those specific characters.
  const multiByteEscapedChars = encodeURIComponent(utf8Str).match(/%[89ABab]/g);
  if (multiByteEscapedChars === null) {
    return utf8Str.length;
  } else {
    return utf8Str.length + multiByteEscapedChars.length;
  }
}

/**
 * Validation Handler which accepts callbacks from HTML Parser
 */
amp.validator.ValidationHandler =
    class extends amp.htmlparser.HtmlSaxHandlerWithLocation {
  /**
   * Creates a new handler.
   * @param {string} htmlFormat
   */
  constructor(htmlFormat) {
    super();

    this.validationResult_ = new amp.validator.ValidationResult();
    this.validationResult_.status =
        amp.validator.ValidationResult.Status.UNKNOWN;
    /**
     * Rules from parsed JSON configuration.
     * @type {!ParsedValidatorRules}
     * @private
     */
    this.rules_ = getParsedValidatorRules(htmlFormat);
    /**
     * Validation Context.
     * @type {!Context}
     * @private
     */
    this.context_ = new Context(this.rules_);
  }

  /**
   * @return {!amp.validator.ValidationResult} Validation Result at the current
   *     step.
   */
  Result() {
    return this.validationResult_;
  }

  /**
   * Callback before startDoc which gives us a document locator.
   * @param {amp.htmlparser.DocLocator} locator
   * @override
   */
  setDocLocator(locator) {
    if (locator === null) {
      goog.asserts.fail('Null DocLocator set');
    } else {
      this.context_.setDocLocator(locator);
    }
  }

  /**
   * Callback for the start of a new HTML document.
   * @override
   */
  startDoc() {
    this.validationResult_ = new amp.validator.ValidationResult();
    this.validationResult_.status =
        amp.validator.ValidationResult.Status.UNKNOWN;
  }

  /**
   * Callback for the attributes from all the body tags encountered
   * within the document.
   * @override
   */
  effectiveBodyTag(attributes) {
    var encounteredAttrs = this.context_.getEncounteredBodyAttrs();
    // If we never recorded a body tag with attributes, it was manufactured.
    // In which case we've already logged an error for that. Doing more here
    // would be confusing.
    if (encounteredAttrs === null) return;
    // So now we compare the attributes from the tag that we encountered
    // (HtmlParser sent us a startTag event for it earlier) with the attributes
    // from the effective body tag that we're just receiving now, which contains
    // all attributes on body tags within the doc. It's correct to think of this
    // synthetic tag simply as a concatenation - there is in general no
    // elimination of duplicate attributes or overriding behavior. Thus, if the
    // second body tag has any attribute this will result in an error.
    var differenceSeen = attributes.length !== encounteredAttrs.length;
    if (!differenceSeen) {
      for (var ii = 0; ii < attributes.length; ii++) {
        if (attributes[ii] !== encounteredAttrs[ii]) {
          differenceSeen = true;
          break;
        }
      }
    }
    if (!differenceSeen) return;
    if (amp.validator.LIGHT) {
      this.validationResult_.status =
          amp.validator.ValidationResult.Status.FAIL;
      return;
    }
    this.context_.addError(
        amp.validator.ValidationError.Code.DUPLICATE_UNIQUE_TAG,
        this.context_.getEncounteredBodyLineCol(),
        /* params */['BODY'], /* url */ '', this.validationResult_);
  }

  /**
   * Callback for the end of a new HTML document. Triggers validation of
   * mandatory
   * tag presence.
   */
  endDoc() {
    this.rules_.maybeEmitGlobalTagValidationErrors(
        this.context_, this.validationResult_);
    if (this.validationResult_.status ===
        amp.validator.ValidationResult.Status.UNKNOWN) {
      this.validationResult_.status =
          amp.validator.ValidationResult.Status.PASS;
    }
    // As some errors can be inserted out of order, sort errors at the
    // end based on their line/col numbers.
    if (!amp.validator.LIGHT) {
      goog.array.stableSort(this.validationResult_.errors, function(lhs, rhs) {
        if (lhs.line != rhs.line) return lhs.line - rhs.line;
        return lhs.col - rhs.col;
      });
    }
  }

  /**
   * Callback for informing that the parser is manufacturing a <body> tag not
   * actually found on the page. This will be followed by a startTag() with the
   * actual body tag in question.
   * @override
   */
  markManufacturedBody() {
    if (amp.validator.LIGHT) {
      this.validationResult_.status =
          amp.validator.ValidationResult.Status.FAIL;
      return;
    }
    this.context_.addError(
        amp.validator.ValidationError.Code.DISALLOWED_MANUFACTURED_BODY,
        this.context_.getLineCol(),
        /* params */[], /* url */ '', this.validationResult_);
  }

  /**
   * While parsing the document HEAD, we may accumulate errors which depend
   * on seeing later extension <script> tags.
   */
  emitMissingExtensionErrors() {
    let extensionsCtx = this.context_.getExtensions();
    if (amp.validator.LIGHT) {
      if (extensionsCtx.hasMissingExtensionFailures()) {
        this.validationResult_.status =
            amp.validator.ValidationResult.Status.FAIL;
        return;
      }
    } else {  // !amp.validator.LIGHT
      for (const error of extensionsCtx.missingExtensionErrors())
        this.context_.addBuiltError(error, this.validationResult_);
    }
  }

  /**
   * Callback for a start HTML tag.
   * @param {!amp.htmlparser.ParsedHtmlTag} encounteredTag
   * @override
   */
  startTag(encounteredTag) {
    /** @type {?string} */
    let maybeDuplicateAttrName = encounteredTag.hasDuplicateAttrs();
    if (maybeDuplicateAttrName !== null) {
      if (!amp.validator.LIGHT) {
        this.context_.addWarning(
            amp.validator.ValidationError.Code.DUPLICATE_ATTRIBUTE,
            this.context_.getLineCol(),
            /* params */[encounteredTag.lowerName(), maybeDuplicateAttrName],
            /* specUrl */ '', this.validationResult_);
      }
      encounteredTag.dedupeAttrs();
    }

    if ('BODY' === encounteredTag.upperName()) {
      this.context_.recordBodyTag(encounteredTag.attrs());
      this.emitMissingExtensionErrors();
    }

    /** @type {ValidateTagResult} */
    let resultForReferencePoint = {
      bestMatchTagSpec: null,
      validationResult: new amp.validator.ValidationResult()
    };
    resultForReferencePoint.validationResult.status =
        amp.validator.ValidationResult.Status.UNKNOWN;
    const referencePointMatcher =
        this.context_.getTagStack().parentReferencePointMatcher();
    if (referencePointMatcher !== null) {
      resultForReferencePoint =
          referencePointMatcher.validateTag(encounteredTag, this.context_);
      this.validationResult_.mergeFrom(
          resultForReferencePoint.validationResult);
    }

    const resultForTag = validateTag(
        encounteredTag, resultForReferencePoint.bestMatchTagSpec,
        this.context_);
    checkForReferencePointCollision(
        resultForReferencePoint.bestMatchTagSpec, resultForTag.bestMatchTagSpec,
        this.context_, resultForTag.validationResult);
    this.validationResult_.mergeFrom(resultForTag.validationResult);

    this.context_.updateFromTagResults(
        encounteredTag, resultForReferencePoint, resultForTag);
  }

  /**
   * Callback for an end HTML tag.
   * @param {!amp.htmlparser.ParsedHtmlTag} tag
   * @override
   */
  endTag(tag) {
    this.context_.getTagStack().exitTag(this.context_, this.validationResult_);
  };

  /**
   * Callback for pcdata. I'm not sure what this is supposed to include, but it
   * seems to be called for contents of <p> tags, looking at a few examples.
   * @param {string} text
   * @override
   */
  pcdata(text) {}

  /**
   * Callback for rcdata text. rcdata text includes contents of title or
   * textarea
   * tags. The validator has no specific rules regarding these text blobs.
   * @param {string} text
   * @override
   */
  rcdata(text) {}

  /**
   * Callback for cdata.
   * @param {string} text
   * @override
   */
  cdata(text) {
    const matcher = this.context_.getTagStack().cdataMatcher();
    if (matcher !== null)
      matcher.match(text, this.context_, this.validationResult_);
  }
};

/**
 * Convenience function which informs caller if given ValidationError is
 * severity warning.
 * @param {!amp.validator.ValidationError} error
 * @return {boolean}
 * @export
 */
amp.validator.isSeverityWarning = function(error) {
  return error.severity === amp.validator.ValidationError.Severity.WARNING;
};

/**
 * Validates a document input as a string.
 * @param {string} inputDocContents
 * @param {string=} opt_htmlFormat the allowed format. Defaults to 'AMP'.
 * @return {!amp.validator.ValidationResult} Validation Result (status and
 *     errors)
 * @export
 */
amp.validator.validateString = function(inputDocContents, opt_htmlFormat) {
  if (amp.validator.LIGHT) {
    throw 'not implemented';
  }
  goog.asserts.assertString(inputDocContents, 'Input document is not a string');

  const htmlFormat = opt_htmlFormat || 'AMP';
  const handler = new amp.validator.ValidationHandler(htmlFormat);
  const parser = new amp.htmlparser.HtmlParser();
  parser.parse(handler, inputDocContents);

  return handler.Result();
};

if (!amp.validator.LIGHT) {
  /**
   * The terminal is an abstraction for the window.console object which
   * accomodates differences between console implementations and provides
   * a convenient way to capture what's being emitted to the terminal
   * in a unittest. Pass the optional parameter to the constructor
   * to observe the calls that would have gone to window.console otherwise.
   */
  amp.validator.Terminal = class {
    /**
     * @param {!Array<string>=} opt_out an array into which the terminal will
     *     emit one string per info / warn / error calls.
     */
    constructor(opt_out) {
      this.out_ = opt_out || null;
    }

    /** @param {string} msg */
    info(msg) {
      if (this.out_) {
        this.out_.push('I: ' + msg);
      } else {
        (console.info || console.log).call(console, msg);
      }
    }

    /** @param {string} msg */
    warn(msg) {
      if (this.out_) {
        this.out_.push('W: ' + msg);
      } else if (console.warn) {
        console.warn(msg);
      } else {
        console.log('WARNING: ' + msg);
      }
    }

    /** @param {string} msg */
    error(msg) {
      if (this.out_) {
        this.out_.push('E: ' + msg);
      } else if (console.error) {
        console.error(msg);
      } else {
        console.log('ERROR: ' + msg);
      }
    }
  };
}

if (!amp.validator.LIGHT) {
  /**
   * Emits this validation result to the terminal, distinguishing warnings and
   *   errors.
   * @param {string} url
   * @param {!amp.validator.Terminal=} opt_terminal
   * @param {string=} opt_errorCategoryFilter
   */
  amp.validator.ValidationResult.prototype.outputToTerminal = function(
      url, opt_terminal, opt_errorCategoryFilter) {

    const terminal = opt_terminal || new amp.validator.Terminal();
    const errorCategoryFilter = opt_errorCategoryFilter || null;

    const status = this.status;
    if (status === amp.validator.ValidationResult.Status.PASS) {
      terminal.info('AMP validation successful.');
      if (this.errors.length === 0) return;
    } else if (status !== amp.validator.ValidationResult.Status.FAIL) {
      terminal.error(
          'AMP validation had unknown results. This indicates a validator ' +
          'bug. Please report at ' +
          'https://github.com/ampproject/amphtml/issues .');
      return;
    }
    let errors;
    if (errorCategoryFilter === null) {
      if (status === amp.validator.ValidationResult.Status.FAIL) {
        terminal.error('AMP validation had errors:');
      } else {
        terminal.warn('AMP validation had warnings:');
      }
      errors = this.errors;
    } else {
      errors = [];
      for (const error of this.errors) {
        if (('' + amp.validator.categorizeError(error)) ===
            errorCategoryFilter) {
          errors.push(error);
        }
      }
      const urlWithoutFilter =
          goog.uri.utils.removeFragment(url) + '#development=1';
      if (errors.length === 0) {
        terminal.error(
            'AMP validation - no errors matching ' +
            'filter=' + errorCategoryFilter + ' found. ' +
            'To see all errors, visit ' + urlWithoutFilter);
      } else {
        terminal.error(
            'AMP validation - displaying errors matching ' +
            'filter=' + errorCategoryFilter + '. ' +
            'To see all errors, visit ' + urlWithoutFilter);
      }
    }
    for (const error of errors) {
      if (error.severity === amp.validator.ValidationError.Severity.ERROR) {
        terminal.error(errorLine(url, error));
      } else {
        terminal.warn(errorLine(url, error));
      }
    }
    if (errorCategoryFilter === null && errors.length !== 0) {
      terminal.info(
          'See also https://validator.ampproject.org/#url=' +
          encodeURIComponent(goog.uri.utils.removeFragment(url)));
    }
  };
}

/**
 * A regex for replacing any adjacent characters that are whitespace
 * with a single space (' ').
 * @private
 * @type {RegExp}
 */
const matchWhitespaceRE = /\s+/g;

/**
 * Applies the format to render the params in the provided error.
 * @param {string} format
 * @param {!amp.validator.ValidationError} error
 * @return {string}
 */
function applyFormat(format, error) {
  let message = format;
  for (let param = 1; param <= error.params.length; ++param) {
    const value = error.params[param - 1].replace(matchWhitespaceRE, ' ');
    message = message.replace(new RegExp('%' + param, 'g'), value);
  }
  return message.replace(new RegExp('%%', 'g'), '%');
}

/**
 * Renders the error message for a single error.
 * @param {!amp.validator.ValidationError} error
 * @return {string}
 * @export
 */
amp.validator.renderErrorMessage = function(error) {
  if (amp.validator.LIGHT) {
    throw 'not implemented';
  }
  goog.asserts.assert(error.code !== null);
  // TODO(powdercloud): It doesn't matter which ParsedValidatorRules
  // instance we access here - all of them have all error message
  // formats. We should probably refactor this a bit to keep the
  // error message formats seperately, to avoid initializing the
  // ParsedValidatorRules for AMP if we're really doing A4A.
  const format = getParsedValidatorRules('AMP').getFormatByCode(error.code);
  goog.asserts.assert(format !== undefined);
  return applyFormat(format, error);
};

/**
 * Renders one line of error output.
 * @param {string} filenameOrUrl
 * @param {!amp.validator.ValidationError} error
 * @return {string}
 */
function errorLine(filenameOrUrl, error) {
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
 * Renders the validation results into an array of human readable strings.
 * Careful when modifying this - it's called from
 * https://github.com/ampproject/amphtml/blob/master/test/integration/test-example-validation.js.
 * @param {!Object} validationResult
 * @param {string} filename to use in rendering error messages.
 * @return {!Array<string>}
 * @export
 */
amp.validator.renderValidationResult = function(validationResult, filename) {
  if (amp.validator.LIGHT) {
    throw 'not implemented';
  }
  const rendered = [];
  rendered.push(validationResult.status);
  for (const error of validationResult.errors) {
    rendered.push(errorLine(filename, error));
  }
  return rendered;
};

/**
 * Detects the author stylesheet based on the parameter name for it in
 * a ValidationError proto message.
 * @param {string} param
 * @return {boolean}
 */
function isAuthorStylesheet(param) {
  return goog.string./*OK*/ startsWith(param, 'style amp-custom');
}

/**
 * Computes the validation category for this |error|. This is a higher
 * level classification that distinguishes layout problems, problems
 * with specific tags, etc. The category is determined with heuristics,
 * just based on the information in |error|. We consider
 * ValidationError::Code, ValidationError::params (including suffix /
 * prefix matches.
 * @param {!amp.validator.ValidationError} error
 * @return {!amp.validator.ErrorCategory.Code}
 * @export
 */
amp.validator.categorizeError = function(error) {
  if (amp.validator.LIGHT) {
    throw 'not implemented';
  }
  // This shouldn't happen in practice. UNKNOWN_CODE would indicate that the
  // field wasn't populated.
  if (error.code === amp.validator.ValidationError.Code.UNKNOWN_CODE ||
      error.code === null) {
    return amp.validator.ErrorCategory.Code.UNKNOWN;
  }
  // E.g. "The tag 'UL', a child tag of 'amp-live-list', does not
  // satisfy one of the acceptable reference points: AMP-LIVE-LIST
  // [update], AMP-LIVE-LIST [items], AMP-LIVE-LIST [pagination]."
  if (error.code ===
          amp.validator.ValidationError.Code
              .CHILD_TAG_DOES_NOT_SATISFY_REFERENCE_POINT ||
      error.code ===
          amp.validator.ValidationError.Code
              .MANDATORY_REFERENCE_POINT_MISSING ||
      error.code ===
          amp.validator.ValidationError.Code.DUPLICATE_REFERENCE_POINT ||
      error.code ===
          amp.validator.ValidationError.Code.TAG_REFERENCE_POINT_CONFLICT ||
      error.code ===
          amp.validator.ValidationError.Code.TAG_NOT_ALLOWED_TO_HAVE_SIBLINGS ||
      error.code ===
          amp.validator.ValidationError.Code.MANDATORY_LAST_CHILD_TAG) {
    return amp.validator.ErrorCategory.Code.AMP_TAG_PROBLEM;
  }
  // E.g. "The tag 'picture' is disallowed."
  if (error.code === amp.validator.ValidationError.Code.DISALLOWED_TAG) {
    if (error.params[0] === 'font')
      return amp.validator.ErrorCategory.Code.AUTHOR_STYLESHEET_PROBLEM;
    return amp.validator.ErrorCategory.Code.DISALLOWED_HTML;
  }
  // E.g. The tag 'div' contains the attribute 'width' repeated multiple times.
  if (error.code == amp.validator.ValidationError.Code.DUPLICATE_ATTRIBUTE) {
    return amp.validator.ErrorCategory.Code.DISALLOWED_HTML;
  }
  // E.g. "tag 'img' may only appear as a descendant of tag
  // 'noscript'. Did you mean 'amp-img'?"
  if (error.code ===
      amp.validator.ValidationError.Code.MANDATORY_TAG_ANCESTOR_WITH_HINT) {
    return amp.validator.ErrorCategory.Code.DISALLOWED_HTML_WITH_AMP_EQUIVALENT;
  }
  if (error.code ===
      amp.validator.ValidationError.Code.DISALLOWED_MANUFACTURED_BODY) {
    return amp.validator.ErrorCategory.Code.DISALLOWED_HTML;
  }
  // At the moment it's not possible to get this particular error since
  // all mandatory tag ancestors have hints except for noscript, but
  // usually when noscript fails then it reports an error for mandatory_parent
  // (since there is such a TagSpec as well, for the head).
  if (error.code ===
      amp.validator.ValidationError.Code.MANDATORY_TAG_ANCESTOR) {
    if (goog.string./*OK*/ startsWith(error.params[0], 'amp-') ||
        goog.string./*OK*/ startsWith(error.params[1], 'amp-')) {
      return amp.validator.ErrorCategory.Code.AMP_TAG_PROBLEM;
    }
    return amp.validator.ErrorCategory.Code.DISALLOWED_HTML;
  }
  // E.g. "Tag 'amp-accordion > section' must have 2 child tags - saw
  // 3 child tags."
  if (error.code ===
      amp.validator.ValidationError.Code.INCORRECT_NUM_CHILD_TAGS) {
    if (goog.string./*OK*/ startsWith(error.params[0], 'amp-')) {
      return amp.validator.ErrorCategory.Code.AMP_TAG_PROBLEM;
    }
    return amp.validator.ErrorCategory.Code.DISALLOWED_HTML;
  }
  // e.g. "Tag 'div' is disallowed as first child of tag
  // 'amp-accordion > section'. Allowed first child tag names are
  // ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']."
  if (error.code ===
          amp.validator.ValidationError.Code.DISALLOWED_CHILD_TAG_NAME ||
      error.code ===
          amp.validator.ValidationError.Code.DISALLOWED_FIRST_CHILD_TAG_NAME) {
    if (goog.string./*OK*/ startsWith(error.params[0], 'amp-') ||
        goog.string./*OK*/ startsWith(error.params[1], 'amp-')) {
      return amp.validator.ErrorCategory.Code.AMP_TAG_PROBLEM;
    }
    return amp.validator.ErrorCategory.Code.DISALLOWED_HTML;
  }
  // E.g. "The text (CDATA) inside tag 'style amp-custom' matches
  // 'CSS !important', which is disallowed."
  if (error.code === amp.validator.ValidationError.Code.STYLESHEET_TOO_LONG ||
      (error.code ===
           amp.validator.ValidationError.Code.CDATA_VIOLATES_BLACKLIST &&
       isAuthorStylesheet(error.params[0]))) {
    return amp.validator.ErrorCategory.Code.AUTHOR_STYLESHEET_PROBLEM;
  }

  // The tag 'amp-hulu extension .js script' contains non-whitespace text
  // (CDATA), which is disallowed.
  if (error.code ===
          amp.validator.ValidationError.Code.CDATA_VIOLATES_BLACKLIST ||
      error.code ===
          amp.validator.ValidationError.Code.NON_WHITESPACE_CDATA_ENCOUNTERED) {
    return amp.validator.ErrorCategory.Code.DISALLOWED_HTML;
  }

  // E.g. "CSS syntax error in tag 'style amp-custom' - Invalid Declaration."
  // TODO(powdercloud): Legacy generic css error code. Remove after
  // 2016-06-01.
  if (error.code === amp.validator.ValidationError.Code.CSS_SYNTAX &&
      isAuthorStylesheet(error.params[0])) {
    return amp.validator.ErrorCategory.Code.AUTHOR_STYLESHEET_PROBLEM;
  }

  // E.g. "The inline 'style' attribute is not allowed in AMP documents. Use
  // 'style amp-custom' tag instead."
  if (error.code === amp.validator.ValidationError.Code.DISALLOWED_STYLE_ATTR)
    return amp.validator.ErrorCategory.Code.AUTHOR_STYLESHEET_PROBLEM;

  // E.g. "CSS syntax error in tag 'style amp-custom' - unterminated string."
  if ((error.code ===
           amp.validator.ValidationError.Code
               .CSS_SYNTAX_STRAY_TRAILING_BACKSLASH ||
       error.code ===
           amp.validator.ValidationError.Code.CSS_SYNTAX_UNTERMINATED_COMMENT ||
       error.code ===
           amp.validator.ValidationError.Code.CSS_SYNTAX_UNTERMINATED_STRING ||
       error.code === amp.validator.ValidationError.Code.CSS_SYNTAX_BAD_URL ||
       error.code ===
           amp.validator.ValidationError.Code
               .CSS_SYNTAX_EOF_IN_PRELUDE_OF_QUALIFIED_RULE ||
       error.code ===
           amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_DECLARATION ||
       error.code ===
           amp.validator.ValidationError.Code
               .CSS_SYNTAX_INCOMPLETE_DECLARATION ||
       error.code ===
           amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_AT_RULE ||
       error.code ===
           amp.validator.ValidationError.Code
               .CSS_SYNTAX_ERROR_IN_PSEUDO_SELECTOR ||
       error.code ===
           amp.validator.ValidationError.Code.CSS_SYNTAX_MISSING_SELECTOR ||
       error.code ===
           amp.validator.ValidationError.Code.CSS_SYNTAX_NOT_A_SELECTOR_START ||
       error.code ===
           amp.validator.ValidationError.Code
               .CSS_SYNTAX_UNPARSED_INPUT_REMAINS_IN_SELECTOR ||
       error.code ===
           amp.validator.ValidationError.Code.CSS_SYNTAX_MISSING_URL ||
       error.code ===
           amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_URL ||
       error.code ===
           amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_URL_PROTOCOL ||
       error.code ===
           amp.validator.ValidationError.Code.CSS_SYNTAX_DISALLOWED_DOMAIN ||
       error.code ===
           amp.validator.ValidationError.Code
               .CSS_SYNTAX_DISALLOWED_RELATIVE_URL ||
       error.code ===
           amp.validator.ValidationError.Code
               .CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE ||
       error.code ===
           amp.validator.ValidationError.Code
               .CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE_WITH_HINT ||
       error.code ===
           amp.validator.ValidationError.Code
               .CSS_SYNTAX_PROPERTY_DISALLOWED_WITHIN_AT_RULE ||
       error.code ===
           amp.validator.ValidationError.Code
               .CSS_SYNTAX_PROPERTY_DISALLOWED_TOGETHER_WITH ||
       error.code ===
           amp.validator.ValidationError.Code
               .CSS_SYNTAX_PROPERTY_REQUIRES_QUALIFICATION) &&
      isAuthorStylesheet(error.params[0])) {
    return amp.validator.ErrorCategory.Code.AUTHOR_STYLESHEET_PROBLEM;
  }
  // E.g. "The mandatory tag 'boilerplate (noscript)' is missing or
  // incorrect."
  if (error.code === amp.validator.ValidationError.Code.MANDATORY_TAG_MISSING ||
      (error.code ===
           amp.validator.ValidationError.Code.MANDATORY_ATTR_MISSING &&
       error.params[0] === '⚡') ||
      (error.code ===
           amp.validator.ValidationError.Code
               .MANDATORY_CDATA_MISSING_OR_INCORRECT &&
       (goog.string./*OK*/ startsWith(
            error.params[0], 'head > style[amp-boilerplate]') ||
        goog.string./*OK*/ startsWith(
            error.params[0], 'noscript > style[amp-boilerplate]')))) {
    return amp.validator.ErrorCategory.Code
        .MANDATORY_AMP_TAG_MISSING_OR_INCORRECT;
  }
  // E.g. "The mandatory tag 'meta name=viewport' is missing or
  // incorrect."
  if ((error.code ===
           amp.validator.ValidationError.Code
               .DISALLOWED_PROPERTY_IN_ATTR_VALUE ||
       error.code ===
           amp.validator.ValidationError.Code
               .INVALID_PROPERTY_VALUE_IN_ATTR_VALUE ||
       error.code ===
           amp.validator.ValidationError.Code
               .MANDATORY_PROPERTY_MISSING_FROM_ATTR_VALUE) &&
      error.params[2] === 'meta name=viewport') {
    return amp.validator.ErrorCategory.Code
        .MANDATORY_AMP_TAG_MISSING_OR_INCORRECT;
  }
  // E.g. "The mandatory attribute 'height' is missing in tag 'amp-img'."
  if (error.code ===
          amp.validator.ValidationError.Code.ATTR_VALUE_REQUIRED_BY_LAYOUT ||
      error.code ===
          amp.validator.ValidationError.Code.IMPLIED_LAYOUT_INVALID ||
      error.code ===
          amp.validator.ValidationError.Code.SPECIFIED_LAYOUT_INVALID ||
      (error.code ===
       amp.validator.ValidationError.Code
           .INCONSISTENT_UNITS_FOR_WIDTH_AND_HEIGHT) ||
      ((error.code === amp.validator.ValidationError.Code.INVALID_ATTR_VALUE ||
        error.code ===
            amp.validator.ValidationError.Code.MANDATORY_ATTR_MISSING) &&
       (error.params[0] === 'width' || error.params[0] === 'height' ||
        error.params[0] === 'layout'))) {
    return amp.validator.ErrorCategory.Code.AMP_LAYOUT_PROBLEM;
  }
  if (error.code ===
          amp.validator.ValidationError.Code
              .ATTR_DISALLOWED_BY_IMPLIED_LAYOUT ||
      error.code ===
          amp.validator.ValidationError.Code
              .ATTR_DISALLOWED_BY_SPECIFIED_LAYOUT) {
    return amp.validator.ErrorCategory.Code.AMP_LAYOUT_PROBLEM;
  }
  // E.g. "The attribute 'src' in tag 'amphtml engine v0.js script'
  // is set to the invalid value
  // '//static.breakingnews.com/ads/gptLoader.js'."
  if (error.code === amp.validator.ValidationError.Code.INVALID_ATTR_VALUE &&
      error.params[0] === 'src' &&
      goog.string./*OK*/ endsWith(error.params[1], 'script')) {
    return amp.validator.ErrorCategory.Code.CUSTOM_JAVASCRIPT_DISALLOWED;
  }
  // E.g. "The tag 'script' is disallowed except in specific forms."
  if (error.code ===
          amp.validator.ValidationError.Code.GENERAL_DISALLOWED_TAG &&
      error.params[0] === 'script') {
    return amp.validator.ErrorCategory.Code.CUSTOM_JAVASCRIPT_DISALLOWED;
  }
  // E.g. "Only AMP runtime 'script' tags are allowed, and only in the document
  // head."
  if (error.code === amp.validator.ValidationError.Code.DISALLOWED_SCRIPT_TAG) {
    return amp.validator.ErrorCategory.Code.CUSTOM_JAVASCRIPT_DISALLOWED;
  }
  // E.g.: "The attribute 'type' in tag 'script type=application/ld+json'
  // is set to the invalid value 'text/javascript'."
  if (error.code === amp.validator.ValidationError.Code.INVALID_ATTR_VALUE &&
      goog.string./*OK*/ startsWith(error.params[1], 'script') &&
      error.params[0] === 'type') {
    return amp.validator.ErrorCategory.Code.CUSTOM_JAVASCRIPT_DISALLOWED;
  }
  // E.g. "The attribute 'srcset' may not appear in tag 'amp-audio >
  // source'."
  if ((error.code === amp.validator.ValidationError.Code.INVALID_ATTR_VALUE ||
       error.code === amp.validator.ValidationError.Code.DISALLOWED_ATTR ||
       error.code ===
           amp.validator.ValidationError.Code.MANDATORY_ATTR_MISSING)) {
    if (goog.string./*OK*/ startsWith(error.params[1], 'amp-')) {
      return amp.validator.ErrorCategory.Code.AMP_TAG_PROBLEM;
    }
    if (goog.string./*OK*/ startsWith(error.params[1], 'on')) {
      return amp.validator.ErrorCategory.Code.CUSTOM_JAVASCRIPT_DISALLOWED;
    }
    if (error.params[1] === 'style' ||
        error.params[1] === 'link rel=stylesheet for fonts') {
      return amp.validator.ErrorCategory.Code.AUTHOR_STYLESHEET_PROBLEM;
    }
    // E.g. "The attribute 'async' may not appear in tag 'link
    // rel=stylesheet for fonts'."
    return amp.validator.ErrorCategory.Code.DISALLOWED_HTML;
  }
  // Like the previous example but the tag is params[0] here. This
  // error should always be for AMP elements thus far, so we don't
  // check for params[0].
  if (error.code ===
      amp.validator.ValidationError.Code.MANDATORY_ONEOF_ATTR_MISSING) {
    return amp.validator.ErrorCategory.Code.AMP_TAG_PROBLEM;
  }
  // E.g. "The attribute 'shortcode' in tag 'amp-instagram' is deprecated -
  // use 'data-shortcode' instead."
  if (error.code === amp.validator.ValidationError.Code.DEPRECATED_ATTR ||
      error.code === amp.validator.ValidationError.Code.DEPRECATED_TAG ||
      error.code ===
          amp.validator.ValidationError.Code
              .WARNING_EXTENSION_DEPRECATED_VERSION ||

      error.code ===
          amp.validator.ValidationError.Code.WARNING_TAG_REQUIRED_BY_MISSING) {
    return amp.validator.ErrorCategory.Code.DEPRECATION;
  }
  // E.g. "The parent tag of tag 'source' is 'picture', but it can
  // only be 'amp-audio'."
  if (error.code === amp.validator.ValidationError.Code.WRONG_PARENT_TAG) {
    if (goog.string./*OK*/ startsWith(error.params[0], 'amp-') ||
        goog.string./*OK*/ startsWith(error.params[1], 'amp-') ||
        goog.string./*OK*/ startsWith(error.params[2], 'amp-')) {
      return amp.validator.ErrorCategory.Code.AMP_TAG_PROBLEM;
    }
    // E.g. "The parent tag of tag 'script' is 'body', but it can only
    // be 'head'".
    return amp.validator.ErrorCategory.Code.DISALLOWED_HTML;
  }
  // E.g. The tag 'amp-analytics' requires loading the 'amp-analytics' extension
  // javascript or the attribute 'amp-fx' requires loading the
  // 'amp-fx-collection' extension javascript..
  if (error.code ===
          amp.validator.ValidationError.Code.MISSING_REQUIRED_EXTENSION ||
      error.code ===
          amp.validator.ValidationError.Code.ATTR_MISSING_REQUIRED_EXTENSION) {
    return amp.validator.ErrorCategory.Code
        .MANDATORY_AMP_TAG_MISSING_OR_INCORRECT;
  }
  // E.g. The extension 'amp-analytics' was found on this page, but is unused.
  // Please remove this extension."
  if (error.code == amp.validator.ValidationError.Code.EXTENSION_UNUSED) {
    return amp.validator.ErrorCategory.Code.AMP_TAG_PROBLEM;
  }
  // E.g. "The 'amp-image-lightbox extension .js script' tag is
  // missing or incorrect, but required by 'amp-image-lightbox'."
  if (error.code ===
          amp.validator.ValidationError.Code.TAG_REQUIRED_BY_MISSING &&
      (goog.string./*OK*/ startsWith(error.params[1], 'amp-') ||
       error.params[1] === 'template')) {
    return amp.validator.ErrorCategory.Code.AMP_TAG_PROBLEM;
  }
  // E.g. "The tag 'amp-access extension .json script' is present, but
  // is excluded by the presence of 'amp-subscriptions extension .json script'."
  if (error.code ===
          amp.validator.ValidationError.Code.TAG_EXCLUDED_BY_TAG) {
    return amp.validator.ErrorCategory.Code.AMP_TAG_PROBLEM;
  }
  // E.g. "The attribute 'role' in tag 'amp-img' is missing or incorrect,
  // but required by attribute 'on'."
  if (error.code ===
      amp.validator.ValidationError.Code.ATTR_REQUIRED_BUT_MISSING) {
    return amp.validator.ErrorCategory.Code.DISALLOWED_HTML;
  }
  // E.g. "Mutually exclusive attributes encountered in tag
  // 'amp-youtube' - pick one of ['src', 'data-videoid']."
  if (error.code ===
          amp.validator.ValidationError.Code.MUTUALLY_EXCLUSIVE_ATTRS &&
      goog.string./*OK*/ startsWith(error.params[0], 'amp-')) {
    return amp.validator.ErrorCategory.Code.AMP_TAG_PROBLEM;
  }
  // E.g. "The tag 'boilerplate (noscript) - old variant' appears
  // more than once in the document."
  if (error.code === amp.validator.ValidationError.Code.DUPLICATE_UNIQUE_TAG ||
      error.code ===
          amp.validator.ValidationError.Code.DUPLICATE_UNIQUE_TAG_WARNING) {
    return amp.validator.ErrorCategory.Code
        .MANDATORY_AMP_TAG_MISSING_OR_INCORRECT;
  }
  // E.g. "Mustache template syntax in attribute name
  // 'data-{{&notallowed}}' in tag 'p'."
  if (error.code ===
          amp.validator.ValidationError.Code.UNESCAPED_TEMPLATE_IN_ATTR_VALUE ||
      error.code ===
          amp.validator.ValidationError.Code.TEMPLATE_PARTIAL_IN_ATTR_VALUE ||
      error.code === amp.validator.ValidationError.Code.TEMPLATE_IN_ATTR_NAME) {
    return amp.validator.ErrorCategory.Code.AMP_HTML_TEMPLATE_PROBLEM;
  }
  // E.g. "The tag 'amp-ad' may not appear as a descendant of tag
  // 'amp-sidebar'.
  if (error.code ===
          amp.validator.ValidationError.Code.DISALLOWED_TAG_ANCESTOR &&
      (goog.string./*OK*/ startsWith(error.params[1], 'amp-'))) {
    return amp.validator.ErrorCategory.Code.AMP_TAG_PROBLEM;
  }
  if (error.code ===
          amp.validator.ValidationError.Code.DISALLOWED_TAG_ANCESTOR &&
      ((error.params[0] === 'template') || (error.params[1] === 'template'))) {
    return amp.validator.ErrorCategory.Code.AMP_HTML_TEMPLATE_PROBLEM;
  }
  if (error.code ===
      amp.validator.ValidationError.Code
          .CHILD_TAG_DOES_NOT_SATISFY_REFERENCE_POINT_SINGULAR) {
    return amp.validator.ErrorCategory.Code.AMP_TAG_PROBLEM;
  }
  // E.g. "Missing URL for attribute 'href' in tag 'a'."
  // E.g. "Invalid URL protocol 'http:' for attribute 'src' in tag
  // 'amp-iframe'." Note: Parameters in the format strings appear out
  // of order so that error.params(1) is the tag for all four of these.
  if (error.code === amp.validator.ValidationError.Code.MISSING_URL ||
      error.code === amp.validator.ValidationError.Code.INVALID_URL ||
      error.code === amp.validator.ValidationError.Code.INVALID_URL_PROTOCOL ||
      error.code === amp.validator.ValidationError.Code.DISALLOWED_DOMAIN ||
      error.code ===
          amp.validator.ValidationError.Code.DISALLOWED_RELATIVE_URL) {
    if (goog.string./*OK*/ startsWith(error.params[1], 'amp-')) {
      return amp.validator.ErrorCategory.Code.AMP_TAG_PROBLEM;
    }
    return amp.validator.ErrorCategory.Code.DISALLOWED_HTML;
  }
  // E.g. "The dimension '1x' in attribute 'srcset' appears more than once."
  if (error.code === amp.validator.ValidationError.Code.DUPLICATE_DIMENSION) {
    return amp.validator.ErrorCategory.Code.DISALLOWED_HTML;
  }

  // E.g. "CSS syntax error in tag style[amp-keyframes]- invalid property
  // opacityyyy. The only allowed properties are [opacity, transform].
  if (error.code ===
          amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_PROPERTY ||
      error.code ===
          amp.validator.ValidationError.Code
              .CSS_SYNTAX_QUALIFIED_RULE_HAS_NO_DECLARATIONS ||
      error.code ===
          amp.validator.ValidationError.Code
              .CSS_SYNTAX_DISALLOWED_QUALIFIED_RULE_MUST_BE_INSIDE_KEYFRAME ||
      error.code ===
          amp.validator.ValidationError.Code
              .CSS_SYNTAX_DISALLOWED_KEYFRAME_INSIDE_KEYFRAME ||
      error.code ===
          amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_AT_RULE) {
    return amp.validator.ErrorCategory.Code.AUTHOR_STYLESHEET_PROBLEM;
  }
  return amp.validator.ErrorCategory.Code.GENERIC;
};

/**
 * Convenience function which calls |CategorizeError| for each error
 * in |result| and sets its category field accordingly.
 * @param {!amp.validator.ValidationResult} result
 * @export
 */
amp.validator.annotateWithErrorCategories = function(result) {
  if (amp.validator.LIGHT) {
    throw 'not implemented';
  }
  for (const error of result.errors) {
    error.category = amp.validator.categorizeError(error);
  }
};

/**
 * Validates a document based on SAX events.
 * EXPERIMENTAL: Do not rely on this API for now, it is still a work in
 * progress. It will change and/or go away without notice.
 * @param {!Array<!Array<string>>} saxEvents
 * @param {string} htmlFormat
 * @return {!amp.validator.ValidationResult}
 * @export
 */
amp.validator.validateSaxEvents = function(saxEvents, htmlFormat) {
  if (!amp.validator.LIGHT) {
    throw 'not implemented';
  }
  // TODO(powdercloud): This needs additional logic to make sure
  // that markManufacturedBody / the start of the body tag is not
  // inserted in the wrong spot.
  const handler = new amp.validator.ValidationHandler(htmlFormat);
  for (const e of saxEvents) {
    switch (e[0]) {
      case 'startTag':
        handler.startTag(new amp.htmlparser.ParsedHtmlTag(e[1], e.slice(2)));
        break;
      case 'endTag':
        handler.endTag(new amp.htmlparser.ParsedHtmlTag(e[1]));
        break;
      case 'pcdata':
        handler.pcdata(e[1]);
        break;
      case 'rcdata':
        handler.rcdata(e[1]);
        break;
      case 'cdata':
        handler.cdata(e[1]);
        break;
      case 'startDoc':
        handler.startDoc();
        break;
      case 'endDoc':
        handler.endDoc();
        break;
      case 'markManufacturedBody':
        handler.markManufacturedBody();
        break;
    }
  }
  return handler.Result();
};
