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
goog.module('amp.validator');
const VALIDATE_CSS = goog.require('amp.validator.VALIDATE_CSS');
const amp4ads = goog.require('amp.validator.validateAmp4AdsCss');
const asserts = goog.require('goog.asserts');
const createRules = goog.require('amp.validator.createRules');
const generated = goog.require('amp.validator.protogenerated');
const googArray = goog.require('goog.array');
const googString = goog.require('goog.string');
const htmlparser = goog.require('amp.htmlparser');
const keyframes = goog.require('amp.validator.keyframesParseCss');
const parse_css = goog.require('parse_css');
const parse_srcset = goog.require('parse_srcset');
const parse_url = goog.require('parse_url');
const parserInterface = goog.require('amp.htmlparser.interface');
const tokenize_css = goog.require('tokenize_css');
const uriUtils = goog.require('goog.uri.utils');

/**
 * Sorts and eliminates duplicates in |arrayValue|. Modifies the input in place.
 *
 * WARNING: This is exported; htmlparser changes may break downstream users like
 * https://www.npmjs.com/package/amphtml-validator and
 * https://validator.amp.dev/.
 *
 * @param {!Array<T>} arrayValue
 * @template T
 */
function sortAndUniquify(arrayValue) {
  if (arrayValue.length < 2) {
    return;
  }

  googArray.sort(arrayValue);
  let uniqIdx = 0;
  for (let i = 1; i < arrayValue.length; ++i) {
    if (arrayValue[i] === arrayValue[uniqIdx]) {
      continue;
    }
    uniqIdx++;
    if (uniqIdx !== i) {
      arrayValue[uniqIdx] = arrayValue[i];
    }
  }
  arrayValue.splice(uniqIdx + 1);
}
exports.sortAndUniquify = sortAndUniquify;

/**
 * Computes the difference set |left| - |right|, assuming |left| and
 * |right| are sorted and uniquified.
 *
 * WARNING: This is exported; htmlparser changes may break downstream users like
 * https://www.npmjs.com/package/amphtml-validator and
 * https://validator.amp.dev/.
 *
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
      asserts.assert(right[r] === left[l]);
      l++;
      r++;
    }
  }
  return diff;
}
exports.subtractDiff = subtractDiff;

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

/**
 * Construct a ValidationError object from the given argument list.
 * @param {!generated.ValidationError.Severity} severity
 * @param {!generated.ValidationError.Code} validationErrorCode Error code
 * @param {!LineCol} lineCol a line / column pair.
 * @param {!Array<string>} params
 * @param {?string} specUrl a link (URL) to the amphtml spec
 * @return {!generated.ValidationError}
 */
function populateError(
    severity, validationErrorCode, lineCol, params, specUrl) {
  const error = new generated.ValidationError();
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
   * @param {!generated.UrlSpec} spec
   */
  constructor(spec) {
    /**
     * @type {!generated.UrlSpec}
     * @private
     */
    this.spec_ = spec;

    /**
     * @type {!Object<string, number>}
     * @private
     */
    this.allowedProtocols_ = Object.create(null);
    if (this.spec_ !== null) {
      for (const protocol of this.spec_.protocol) {
        this.allowedProtocols_[protocol] = 0;
      }
    }
  }

  /** @return {!generated.UrlSpec} */
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
}

/** @private */
class ParsedValueProperties {
  /** @param {!generated.PropertySpecList} spec */
  constructor(spec) {
    /**
     * @type {!Object<string, !generated.PropertySpec>}
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
    googArray.sort(this.mandatoryValuePropertyNames_);
  }

  /** @return {!Object<string, !generated.PropertySpec>} */
  getValuePropertyByName() {
    return this.valuePropertyByName_;
  }

  /** @return {!Array<string>} */
  getMandatoryValuePropertyNames() {
    return this.mandatoryValuePropertyNames_;
  }
}

/**
 * This wrapper class provides access to an generated.AttrSpec and
 * an attribute id which is unique within its context
 * (e.g., it's unique within the ParsedTagSpec).
 * @private
 */
class ParsedAttrSpec {
  /**
   * @param {!generated.AttrSpec} attrSpec
   * @param {number} attrId
   */
  constructor(attrSpec, attrId) {
    /**
     * JSON Attribute Spec dictionary.
     * @type {!generated.AttrSpec}
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
     * @type {?ParsedUrlSpec}
     * @private
     */
    this.valueUrlSpec_ = null;

    /**
     * @type {?ParsedValueProperties}
     * @private
     */
    this.valueProperties_ = null;

    /**
     * @type {!Object<string, !generated.CssDeclaration>}
     * @private
     */
    this.cssDeclarationByName_ = Object.create(null);

    for (const cssDeclaration of attrSpec.cssDeclaration) {
      if (cssDeclaration.name) {
        this.cssDeclarationByName_[cssDeclaration.name] = cssDeclaration;
      }
    }
  }

  /**
   * @return {number} unique for this attr spec.
   */
  getId() {
    return this.id_;
  }

  /**
   * @return {!generated.AttrSpec}
   */
  getSpec() {
    return this.spec_;
  }

  /**
   * @return {!ParsedUrlSpec}
   */
  getValueUrlSpec() {
    if (this.valueUrlSpec_ === null) {
      this.valueUrlSpec_ = new ParsedUrlSpec(
          /** @type{!generated.UrlSpec} */ (this.spec_.valueUrl));
    }
    return this.valueUrlSpec_;
  }

  /**
   * @return {ParsedValueProperties}
   */
  getValuePropertiesOrNull() {
    if (this.spec_.valueProperties === null) {
      return null;
    }
    if (this.valueProperties_ === null) {
      this.valueProperties_ =
          new ParsedValueProperties(this.spec_.valueProperties);
    }
    return this.valueProperties_;
  }

  /**
   * @return {!Object<string, !generated.CssDeclaration>}
   */
  getCssDeclarationByName() {
    return this.cssDeclarationByName_;
  }

  /**
   * Returns true if this generated.AttrSpec should be used for the given type
   * identifiers based on the generated.AttrSpec's disabled_by or enabled_by
   * fields.
   * @param {!Array<string>} typeIdentifiers
   * @return {boolean}
   */
  isUsedForTypeIdentifiers(typeIdentifiers) {
    return isUsedForTypeIdentifiers(
        typeIdentifiers, this.spec_.enabledBy, this.spec_.disabledBy);
  }
}

/**
 * For uniquely identifying a tag spec, we either find the specName in the tag
 * spec or fall back to the tagName.
 * @param {!generated.TagSpec} tagSpec generated.TagSpec instance from the
 *   validator.protoscii file.
 * @return {string}
 * @private
 */
function getTagSpecName(tagSpec) {
  return (tagSpec.specName !== null) ? tagSpec.specName :
                                       tagSpec.tagName.toLowerCase();
}

/**
 * For creating error messages, we either find the descriptiveName in the tag
 * spec or fall back to the tagName.
 * @param {!generated.TagSpec} tagSpec generated.TagSpec instance from the
 *   validator.protoscii file.
 * @return {string}
 * @private
 */
function getTagDescriptiveName(tagSpec) {
  return (tagSpec.descriptiveName !== null) ? tagSpec.descriptiveName :
                                              tagSpec.tagName.toLowerCase();
}

/**
 * For creating error URLs, we either find the specUrl in the tag spec or fall
 * back to the extension spec URL if available.
 * @param {!generated.TagSpec|!ParsedTagSpec} tagSpec
 * @return {string}
 * @private
 */
function getTagSpecUrl(tagSpec) {
  // Handle a ParsedTagSpec as well as a tag spec.
  // TODO(gregable): This is a bit hacky, we should improve on this approach
  // in the future.
  if (tagSpec.getSpec !== undefined) {
    return getTagSpecUrl(tagSpec.getSpec());
  }

  if (tagSpec.specUrl !== null) {
    return tagSpec.specUrl;
  }

  const extensionSpecUrlPrefix = 'https://amp.dev/documentation/components/';
  if (tagSpec.extensionSpec !== null && tagSpec.extensionSpec.name !== null) {
    return extensionSpecUrlPrefix + tagSpec.extensionSpec.name;
  }
  if (tagSpec.requiresExtension.length > 0) {
    // Return the first |requires_extension|, which should be the most
    // representitive.
    return extensionSpecUrlPrefix + tagSpec.requiresExtension[0];
  }

  return '';
}

/**
 * Returns true if this spec should be used for the given type identifiers
 * based on the spec's disabled_by or enabled_by fields.
 * @param {!Array<string>} typeIdentifiers
 * @param {!Array<string>} enabledBys
 * @param {!Array<string>} disabledBys
 * @return {boolean}
 */
function isUsedForTypeIdentifiers(typeIdentifiers, enabledBys, disabledBys) {
  if (enabledBys.length > 0) {
    for (const enabledBy of enabledBys) {
      // Is enabled by a given type identifier, use.
      if (typeIdentifiers.includes(enabledBy)) {
        return true;
      }
    }
    // Is not enabled for these type identifiers, do not use.
    return false;
  } else if (disabledBys.length > 0) {
    for (const disabledBy of disabledBys) {
      // Is disabled by a given type identifier, do not use.
      if (typeIdentifiers.includes(disabledBy)) {
        return false;
      }
    }
    // Is not disabled for these type identifiers, use.
    return true;
  }
  // Is not enabled nor disabled for any type identifiers, use.
  return true;
}

/**
 * Holds the reference points for a particular parent tag spec, including
 * their resolved tagspec ids.
 * @private
 */
class ParsedReferencePoints {
  /**
   * @param {!generated.TagSpec} parentTagSpec
   */
  constructor(parentTagSpec) {
    /**
     * @type {!generated.TagSpec}
     * @private
     */
    this.parentTagSpec_ = parentTagSpec;
  }

  /** @return {!Array<!generated.ReferencePoint>} */
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
 * Wrapper around DocSpec.
 * @private
 */
class ParsedDocSpec {
  /**
   * @param {!generated.DocSpec} spec
   */
  constructor(spec) {
    /**
     * @type {!generated.DocSpec}
     * @private
     */
    this.spec_ = spec;
  }

  /** @return {!generated.DocSpec} */
  spec() {
    return this.spec_;
  }

  /** @return {!Array<string>} */
  disabledBy() {
    return this.spec_.disabledBy;
  }

  /** @return {!Array<string>} */
  enabledBy() {
    return this.spec_.enabledBy;
  }
}

/**
 * Wrapper around DocCssSpec.
 * @private
 */
class ParsedDocCssSpec {
  /**
   * @param {!generated.DocCssSpec} spec
   * @param {!Array<!generated.DeclarationList>} declLists
   */
  constructor(spec, declLists) {
    /**
     * @type {!generated.DocCssSpec}
     * @private
     */
    this.spec_ = spec;

    /**
     * @type {!Object<string, !generated.CssDeclaration>}
     * @private
     */
    this.cssDeclarationByName_ = Object.create(null);

    /**
     * @type {!Object<string, !generated.CssDeclaration>}
     * @private
     */
    this.cssDeclarationSvgByName_ = Object.create(null);

    for (const declaration of spec.declaration) {
      if (declaration.name === null) continue;
      this.cssDeclarationByName_[declaration.name] = declaration;
      this.cssDeclarationSvgByName_[declaration.name] = declaration;
    }
    for (const declaration of spec.declarationSvg) {
      if (declaration.name === null) continue;
      this.cssDeclarationSvgByName_[declaration.name] = declaration;
    }
    // Expand the list of declarations tracked by this spec by merging in any
    // declarations mentioned in declaration_lists referenced by this spec. This
    // mechanism reduces redundancy in the lists themselves, making rules more
    // readable.
    for (const declListName of spec.declarationList) {
      for (const declList of declLists) {
        if (declList.name === declListName) {
          for (const declaration of declList.declaration) {
            if (declaration.name !== null) {
              this.cssDeclarationByName_[declaration.name] = declaration;
              this.cssDeclarationSvgByName_[declaration.name] = declaration;
            }
          }
        }
      }
    }
    for (const declListName of spec.declarationListSvg) {
      for (const declList of declLists) {
        if (declList.name === declListName) {
          for (const declaration of declList.declaration) {
            if (declaration.name !== null)
              this.cssDeclarationSvgByName_[declaration.name] = declaration;
          }
        }
      }
    }

    /**
     * @type {!ParsedUrlSpec}
     * @private
     */
    this.parsedImageUrlSpec_ = new ParsedUrlSpec(
        /** @type{!generated.UrlSpec} */ (spec.imageUrlSpec));

    /**
     * @type {!ParsedUrlSpec}
     * @private
     */
    this.parsedFontUrlSpec_ = new ParsedUrlSpec(
        /** @type{!generated.UrlSpec} */ (spec.fontUrlSpec));
  }

  /** @return {!generated.DocCssSpec} */
  spec() {
    return this.spec_;
  }

  /** @return {!Array<string>} */
  disabledBy() {
    return this.spec_.disabledBy;
  }

  /** @return {!Array<string>} */
  enabledBy() {
    return this.spec_.enabledBy;
  }

  /**
   * @return {?generated.CssDeclaration}
   * @param {string} candidate
   * Returns the CssDeclaration rules for a matching css declaration name, if is
   * found, else null.
   */
  cssDeclarationByName(candidate) {
    let key = candidate.toLowerCase();
    if (this.spec_.expandVendorPrefixes) key = parse_css.stripVendorPrefix(key);
    const cssDeclaration = this.cssDeclarationByName_[key];
    if (cssDeclaration !== undefined) {
      return cssDeclaration;
    }
    return null;
  }

  /**
   * @return {?generated.CssDeclaration}
   * @param {string} candidate
   * Returns the CssDeclaration rules for a matching css declaration name, if is
   * found, else null.
   */
  cssDeclarationSvgByName(candidate) {
    let key = candidate.toLowerCase();
    if (this.spec_.expandVendorPrefixes) key = parse_css.stripVendorPrefix(key);
    const cssDeclaration = this.cssDeclarationSvgByName_[key];
    if (cssDeclaration !== undefined) {
      return cssDeclaration;
    }
    return null;
  }

  /** @return {!ParsedUrlSpec} */
  imageUrlSpec() {
    return this.parsedImageUrlSpec_;
  }

  /** @return {!ParsedUrlSpec} */
  fontUrlSpec() {
    return this.parsedFontUrlSpec_;
  }
}

/**
 * TagSpecs specify attributes that are valid for a particular tag.
 * They can also reference lists of attributes (AttrLists), thereby
 * sharing those definitions. This abstraction instantiates
 * ParsedAttrSpec for each generated.AttrSpec (from validator-*.protoascii,
 * our specification file) exactly once, and provides quick access to the attr
 * spec names as well, including for simple attr specs (those which only have
 * a name but no specification for their value).
 * @private
 */
class ParsedAttrSpecs {
  /**
   * @param {!generated.ValidatorRules} rules
   */
  constructor(rules) {
    /** @type {!Array<!Array<number>>} */
    this.attrLists = rules.directAttrLists;

    /** @type {!Array<number>} */
    this.globalAttrs = rules.globalAttrs;

    /** @type {!Array<number>} */
    this.ampLayoutAttrs = rules.ampLayoutAttrs;

    /**
     * The generated.AttrSpec instances, indexed by attr spec ids.
     * @private @type {!Array<!generated.AttrSpec>}
     */
    this.attrSpecs_ = rules.attrs;

    /**
     * @private @type {!Array<string>}
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
   * @return {string}
   */
  getNameByAttrSpecId(id) {
    if (id < 0) {
      return this.internedStrings_[-1 - id];
    }
    return this.attrSpecs_[id].name;
  }
}

/** @enum {string} */
const RecordValidated = {
  ALWAYS: 'ALWAYS',
  NEVER: 'NEVER',
  IF_PASSING: 'IF_PASSING'
};

/**
 * We only track (that is, add them to Context.RecordTagspecValidated)
 * validated tagspecs as necessary. That is, if it's needed for document scope
 * validation:
 * - Mandatory tags
 * - Unique tags
 * - Tags (identified by their TagSpecName() that are required by other tags.
 * @param {!generated.TagSpec} tag
 * @param {number} tagSpecId
 * @param {!Array<boolean>} tagSpecIdsToTrack
 * @return {!RecordValidated}
 */
function shouldRecordTagspecValidated(tag, tagSpecId, tagSpecIdsToTrack) {
  // Always update from TagSpec if the tag is passing. If it's failing we
  // typically want to update from the best match as it can satisfy
  // requirements which otherwise can confuse the user later. The exception is
  // tagspecs which introduce requirements but satisfy none, such as unique.
  // https://github.com/ampproject/amphtml/issues/24359

  // Mandatory and tagSpecIdsToTrack only satisfy requirements, making the
  // output less verbose even if the tag is failing.
  if (tag.mandatory || tagSpecIdsToTrack.hasOwnProperty(tagSpecId))
    return RecordValidated.ALWAYS;
  // Unique and similar can introduce requirements, ie: there cannot be
  // another such tag. We don't want to introduce requirements for failing
  // tags.
  if (tag.unique || tag.requires.length > 0 || tag.uniqueWarning)
    return RecordValidated.IF_PASSING;
  return RecordValidated.NEVER;
}

/**
 * This wrapper class provides access to a TagSpec and a tag id
 * which is unique within its context, the ParsedValidatorRules.
 * @private
 */
class ParsedTagSpec {
  /**
   * @param {!ParsedAttrSpecs} parsedAttrSpecs
   * @param {!RecordValidated} shouldRecordTagspecValidated
   * @param {!generated.TagSpec} tagSpec
   * @param {number} id
   */
  constructor(parsedAttrSpecs, shouldRecordTagspecValidated, tagSpec, id) {
    /**
     * @type {!generated.TagSpec}
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
    this.isTypeJson_ = false;
    /**
     * @type {!RecordValidated}
     * @private
     */
    this.shouldRecordTagspecValidated_ = shouldRecordTagspecValidated;
    /**
     * @type {boolean}
     * @private
     */
    this.attrsCanSatisfyExtension_ = false;
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
    this.mandatoryAnyofs_ = [];
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
    // If tagSpec.explicitAttrsOnly is true then only collect the attributes
    // from (2) and (3).

    // (1) layout attrs (except when explicitAttrsOnly is true).
    if (!tagSpec.explicitAttrsOnly && tagSpec.ampLayout !== null &&
        !this.isReferencePoint_) {
      this.mergeAttrs(parsedAttrSpecs.ampLayoutAttrs, parsedAttrSpecs);
    }
    // (2) attributes specified within |tagSpec|.
    this.mergeAttrs(tagSpec.attrs, parsedAttrSpecs);

    // (3) attributes specified via reference to an attr_list.
    for (const id of tagSpec.attrLists) {
      this.mergeAttrs(parsedAttrSpecs.attrLists[id], parsedAttrSpecs);
    }
    // (4) attributes specified in the global_attr list (except when
    // explicitAttrsOnly is true).
    if (!tagSpec.explicitAttrsOnly && !this.isReferencePoint_) {
      this.mergeAttrs(parsedAttrSpecs.globalAttrs, parsedAttrSpecs);
    }
    sortAndUniquify(this.mandatoryOneofs_);
    sortAndUniquify(this.mandatoryAnyofs_);
    sortAndUniquify(this.mandatoryAttrIds_);
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
      if (spec.mandatoryAnyof !== null) {
        this.mandatoryAnyofs_.push(spec.mandatoryAnyof);
      }
      for (const altName of spec.alternativeNames) {
        this.attrsByName_[altName] = attrId;
      }
      if (spec.implicit) {
        this.implicitAttrspecs_.push(attrId);
      }
      if (spec.name === 'type' && spec.valueCasei.length > 0) {
        for (const v of spec.valueCasei) {
          if ('application/json' === v) {
            this.isTypeJson_ = true;
            break;
          }
        }
      }
      if (spec.valueUrl) {
        this.containsUrl_ = true;
      }
      if (spec.requiresExtension.length > 0) {
        this.attrsCanSatisfyExtension_ = true;
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
   * amp.validator.createRules().
   * @return {!generated.TagSpec}
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
    if (this.spec_.cdata !== null) {
      return new CdataMatcher(this.spec_, lineCol);
    }
    return null;
  }

  /**
   * If tag has a child_tag spec, returns a ChildTagMatcher, else null.
   * @param {!LineCol} lineCol
   * @return {?ChildTagMatcher}
   */
  childTagMatcher(lineCol) {
    if (this.spec_.childTags !== null) {
      return new ChildTagMatcher(this.spec_, lineCol);
    }
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
    if (this.hasReferencePoints()) {
      return new ReferencePointMatcher(rules, this.referencePoints_, lineCol);
    }
    return null;
  }

  /**
   * Returns true if this tagSpec contains an attribute of name "type" and
   * value "application/json".
   * @return {boolean}
   */
  isTypeJson() {
    return this.isTypeJson_;
  }

  /**
   * Returns true if this tagSpec contains a value_url field.
   * @return {boolean}
   */
  containsUrl() {
    return this.containsUrl_;
  }

  /**
   * Returns true if this TagSpec should be used for the given type
   * identifiers based on the TagSpec's disabled_by or enabled_by fields.
   * @param {!Array<string>} typeIdentifiers
   * @return {boolean}
   */
  isUsedForTypeIdentifiers(typeIdentifiers) {
    return isUsedForTypeIdentifiers(
        typeIdentifiers, this.spec_.enabledBy, this.spec_.disabledBy);
  }

  /**
   * A TagSpec may specify other tags to be required as well, when that
   * tag is used. This accessor returns the IDs for the tagspecs that
   * are also required if |this| tag occurs in the document, but where
   * such requirement is currently only a warning.
   * @return {!Array<number>}
   */
  getAlsoRequiresTagWarning() {
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
   * @return {!RecordValidated}
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

  /** @return {boolean} */
  attrsCanSatisfyExtension() {
    return this.attrsCanSatisfyExtension_;
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
  getMandatoryAnyofs() {
    return this.mandatoryAnyofs_;
  }

  /**
   * @return {!Array<number>}
   */
  getMandatoryAttrIds() {
    return this.mandatoryAttrIds_;
  }
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
    // to applying this to every attribute that has a denylisted value
    // regex.
    decodedAttrValue = unescape(attrValue);
  }
  return decodedAttrValue;
}

/**
 * Merge results from another ValidationResult while dealing with the UNKNOWN
 *   status.
 * @this {!generated.ValidationResult}
 * @param {!generated.ValidationResult} other
 */
generated.ValidationResult.prototype.mergeFrom = function(other) {
  asserts.assert(this.status !== null);
  asserts.assert(other.status !== null);
  // Copy status only if fail. Failing is a terminal state.
  if (other.status === generated.ValidationResult.Status.FAIL) {
    this.status = generated.ValidationResult.Status.FAIL;
  }
  Array.prototype.push.apply(this.errors, other.errors);
};

/**
 * The child tag matcher evaluates ChildTagSpec. The constructor
 * provides the enclosing TagSpec for the parent tag so that we can
 * produce error messages mentioning the parent.
 * @private
 */
class ChildTagMatcher {
  /**
   * @param {!generated.TagSpec} parentSpec
   * @param {!LineCol} lineCol
   */
  constructor(parentSpec, lineCol) {
    /**
     * @type {!generated.TagSpec}
     * @private
     */
    this.parentSpec_ = parentSpec;

    /**
     * @type {!LineCol}
     * @private
     */
    this.lineCol_ = lineCol;

    asserts.assert(this.parentSpec_.childTags !== null);
  }

  /** @return {!LineCol} */
  getLineCol() {
    return this.lineCol_;
  }

  /**
   * @param {!parserInterface.ParsedHtmlTag} encounteredTag
   * @param {!Context} context
   * @param {!generated.ValidationResult} result
   */
  matchChildTagName(encounteredTag, context, result) {
    const {childTags} = this.parentSpec_;
    // Enforce child_tag_name_oneof: If at least one tag name is specified,
    // then the child tags of the parent tag must have one of the provided
    // tag names.
    if (childTags.childTagNameOneof.length > 0) {
      const names = childTags.childTagNameOneof;
      if (names.indexOf(encounteredTag.upperName()) === -1) {
        const allowedNames = '[\'' + names.join('\', \'') + '\']';
        context.addError(
            generated.ValidationError.Code.DISALLOWED_CHILD_TAG_NAME,
            context.getLineCol(),
            /* params */
            [
              encounteredTag.lowerName(),
              getTagDescriptiveName(this.parentSpec_),
              allowedNames.toLowerCase(),
            ],
            getTagSpecUrl(this.parentSpec_), result);
      }
    }
    // Enforce first_child_tag_name_oneof: If at least one tag name is
    // specified, then the first child of the parent tag must have one
    // of the provided tag names.
    if (childTags.firstChildTagNameOneof.length > 0 &&
        context.getTagStack().parentChildCount() === 0) {
      const names = childTags.firstChildTagNameOneof;
      if (names.indexOf(encounteredTag.upperName()) === -1) {
        const allowedNames = '[\'' + names.join('\', \'') + '\']';
        context.addError(
            generated.ValidationError.Code.DISALLOWED_FIRST_CHILD_TAG_NAME,
            context.getLineCol(),
            /* params */
            [
              encounteredTag.lowerName(),
              getTagDescriptiveName(this.parentSpec_),
              allowedNames.toLowerCase(),
            ],
            getTagSpecUrl(this.parentSpec_), result);
      }
    }
  }

  /**
   * @param {!Context} context
   * @param {!generated.ValidationResult} result
   */
  exitTag(context, result) {
    const expectedNumChildTags =
        this.parentSpec_.childTags.mandatoryNumChildTags;
    if (expectedNumChildTags !== -1 &&
        expectedNumChildTags !== context.getTagStack().parentChildCount()) {
      context.addError(
          generated.ValidationError.Code.INCORRECT_NUM_CHILD_TAGS,
          this.getLineCol(),
          /* params */
          [
            getTagDescriptiveName(this.parentSpec_),
            expectedNumChildTags.toString(),
            context.getTagStack().parentChildCount().toString(),
          ],
          getTagSpecUrl(this.parentSpec_), result);
      return;
    }

    const expectedMinNumChildTags =
        this.parentSpec_.childTags.mandatoryMinNumChildTags;
    if (expectedMinNumChildTags !== -1 &&
        context.getTagStack().parentChildCount() < expectedMinNumChildTags) {
      context.addError(
          generated.ValidationError.Code.INCORRECT_MIN_NUM_CHILD_TAGS,
          this.getLineCol(),
          /* params */
          [
            getTagDescriptiveName(this.parentSpec_),
            expectedMinNumChildTags.toString(),
            context.getTagStack().parentChildCount().toString(),
          ],
          getTagSpecUrl(this.parentSpec_), result);
      return;
    }
  }
}
/**
 * Return type tuple for ValidateTag.
 * @typedef {{ validationResult: !generated.ValidationResult,
 *             bestMatchTagSpec: ?ParsedTagSpec,
 *             devModeSuppress: (boolean|undefined),
 *             inlineStyleCssBytes: number }}
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

    /**
     * @type {!LineCol}
     * @private
     */
    this.lineCol_ = lineCol;

    /**
     * @type {!Array<number>}
     * @private
     */
    this.referencePointsMatched_ = [];

    // Assert that this is not an empty reference point matcher.
    asserts.assert(!parsedReferencePoints.empty());
  }

  /**
   * @return {!LineCol}
   */
  getLineCol() {
    return this.lineCol_;
  }

  /**
   * This method gets invoked when matching a child tag of the parent
   * that is specifying / requiring the reference points. So
   * effectively, this method will try through the specified reference
   * points and record them in this.referencePointsMatched_.
   * @param {!parserInterface.ParsedHtmlTag} tag
   * @param {!Context} context
   * @return {ValidateTagResult} result
   */
  validateTag(tag, context) {
    // Look for a matching reference point, if we find one, record and exit.
    /** @type {!ValidateTagResult} */
    let resultForBestAttempt = {
      validationResult: new generated.ValidationResult(),
      bestMatchTagSpec: null,
      inlineStyleCssBytes: 0,
    };
    resultForBestAttempt.validationResult.status =
        generated.ValidationResult.Status.UNKNOWN;
    for (const p of this.parsedReferencePoints_.iterate()) {
      // p.tagSpecName here is actually a number, which was replaced in
      // validator_gen_js.py from the name string, so this works.
      const parsedTagSpec = context.getRules().getByTagSpecId(
          /** @type {number} */ (p.tagSpecName));
      // Skip TagSpecs that aren't used for these type identifiers.
      if (!parsedTagSpec.isUsedForTypeIdentifiers(
              context.getTypeIdentifiers())) {
        continue;
      }
      const resultForAttempt = validateTagAgainstSpec(
          parsedTagSpec, /*bestMatchReferencePoint=*/ null, context, tag);
      if (context.getRules().betterValidationResultThan(
              resultForAttempt.validationResult,
              resultForBestAttempt.validationResult)) {
        resultForBestAttempt = resultForAttempt;
      }
      if (resultForBestAttempt.validationResult.status ===
          generated.ValidationResult.Status.PASS) {
        resultForBestAttempt.bestMatchTagSpec = parsedTagSpec;
        return resultForBestAttempt;
      }
    }
    // This check cannot fail as a successful validation above exits early.
    asserts.assert(
        resultForBestAttempt.validationResult.status ===
        generated.ValidationResult.Status.FAIL);
    // Special case: only one reference point defined - emit a singular
    // error message *and* merge in the errors from the best attempt above.
    if (this.parsedReferencePoints_.size() === 1) {
      context.addError(
          generated.ValidationError.Code
              .CHILD_TAG_DOES_NOT_SATISFY_REFERENCE_POINT_SINGULAR,
          context.getLineCol(),
          /*params*/
          [
            tag.lowerName(),
            this.parsedReferencePoints_.parentTagSpecName(),
            this.parsedValidatorRules_.getReferencePointName(
                this.parsedReferencePoints_.iterate()[0]),
          ],
          this.parsedReferencePoints_.parentSpecUrl(),
          resultForBestAttempt.validationResult);
      return resultForBestAttempt;
    }
    // General case: more than one reference point defined. Emit a plural
    // message with the acceptable reference points listed.
    const acceptable = [];
    for (const p of this.parsedReferencePoints_.iterate()) {
      acceptable.push(this.parsedValidatorRules_.getReferencePointName(p));
    }
    const resultForMultipleAttempts = new generated.ValidationResult();
    context.addError(
        generated.ValidationError.Code
            .CHILD_TAG_DOES_NOT_SATISFY_REFERENCE_POINT,
        context.getLineCol(),
        /*params*/
        [
          tag.lowerName(),
          this.parsedReferencePoints_.parentTagSpecName(),
          acceptable.join(', '),
        ],
        this.parsedReferencePoints_.parentSpecUrl(), resultForMultipleAttempts);
    return {
      validationResult: resultForMultipleAttempts,
      bestMatchTagSpec: null,
      inlineStyleCssBytes: 0,
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
   * @param {!generated.ValidationResult} result
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
        context.addError(
            generated.ValidationError.Code.MANDATORY_REFERENCE_POINT_MISSING,
            this.getLineCol(),
            /*params*/
            [
              this.parsedValidatorRules_.getReferencePointName(p),
              this.parsedReferencePoints_.parentTagSpecName(),
            ],
            this.parsedReferencePoints_.parentSpecUrl(), result);
      }
      if (p.unique && referencePointByCount.hasOwnProperty(RefPointTagSpecId) &&
          referencePointByCount[RefPointTagSpecId] !== 1) {
        context.addError(
            generated.ValidationError.Code.DUPLICATE_REFERENCE_POINT,
            this.getLineCol(),
            /*params*/
            [
              this.parsedValidatorRules_.getReferencePointName(p),
              this.parsedReferencePoints_.parentTagSpecName(),
            ],
            this.parsedReferencePoints_.parentSpecUrl(), result);
      }
    }
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
 *             referencePointMatcher: ?ReferencePointMatcher,
 *             devMode: boolean }}
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
      tagName,
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
      referencePointMatcher: null,
      devMode: false,
    };
  }

  /**
   * Enter a tag, opening a scope for child tags.
   * @param {string} tagName
   * @param {!ValidateTagResult} referencePointResult
   * @param {!ValidateTagResult} tagResult
   */
  enterTag(tagName, referencePointResult, tagResult) {
    const stackEntry = this.createNewTagStackEntry(tagName);
    stackEntry.referencePoint = referencePointResult.bestMatchTagSpec;
    stackEntry.tagSpec = tagResult.bestMatchTagSpec;
    this.stack_.push(stackEntry);
  }

  /**
   * Upon exiting a tag, validation for the current child tag matcher is
   * triggered, e.g. for checking that the tag had some specified number
   * of children.
   * @param {!Context} context
   * @param {!generated.ValidationResult} result
   */
  exitTag(context, result) {
    asserts.assert(this.stack_.length > 0, 'Exiting an empty tag stack.');

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
    if (result.devModeSuppress) this.setDevMode();
    if (result.bestMatchTagSpec === null) {
      return;
    }
    const parsedTagSpec = result.bestMatchTagSpec;

    this.setReferencePointMatcher(
        parsedTagSpec.referencePointMatcher(parsedRules, lineCol));

    // The following only add new constraints, not new allowances, so
    // only add the constraints if the validation passed.
    if (result.validationResult.status ===
        generated.ValidationResult.Status.PASS) {
      this.setChildTagMatcher(parsedTagSpec.childTagMatcher(lineCol));
      this.setCdataMatcher(parsedTagSpec.cdataMatcher(lineCol));
      this.setDescendantConstraintList(parsedTagSpec, parsedRules);
    }
  }

  /**
   * Update tagstack state after validating an encountered tag. Called with
   * the best matching specs, even if not a match.
   * @param {!parserInterface.ParsedHtmlTag} encounteredTag
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
      asserts.assert(this.parentReferencePointMatcher() !== null);
      this.parentReferencePointMatcher().recordMatch(
          /** @type{!ParsedTagSpec} */ (referencePointResult.bestMatchTagSpec));
    }

    // The following only add new constraints, not new allowances, so
    // only add the constraints if the validation passed.
    if (tagResult.validationResult.status ===
        generated.ValidationResult.Status.PASS) {
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
    asserts.assert(this.stack_.length > 0, 'Exiting an empty tag stack.');
    return this.stack_[this.stack_.length - 1];
  }


  /**
   * Sets the child tag matcher for the tag currently on the stack.
   * @param {?ChildTagMatcher} matcher
   */
  setChildTagMatcher(matcher) {
    if (matcher !== null) {
      this.back_().childTagMatcher = matcher;
    }
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
    if (matcher !== null) {
      this.back_().cdataMatcher = matcher;
    }
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
    if (matcher !== null) {
      this.back_().referencePointMatcher = matcher;
    }
  }

  /**
   * Records that tag currently on the stack is using data-ampdevmode.
   */
  setDevMode() {
    this.back_().devMode = true;
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
   * @param {!parserInterface.ParsedHtmlTag} encounteredTag
   * @param {!Context} context
   * @param {!generated.ValidationResult} result
   */
  matchChildTagName(encounteredTag, context, result) {
    const matcher = this.parentStackEntry_().childTagMatcher;
    if (matcher !== null) {
      matcher.matchChildTagName(encounteredTag, context, result);
    }
  }

  /**
   * The parent of the current stack entry.
   * @return {TagStackEntry}
   * @private
   */
  parentStackEntry_() {
    asserts.assert(
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
   * The spec_name of the parent of the current tag if one exists, otherwise
   * the tag_name.
   * @return {string}
   */
  parentTagSpecName() {
    if ((this.parentStackEntry_().tagSpec !== null) &&
        (this.parentStackEntry_().tagSpec.getSpec().specName !== null)) {
      return /** @type {string} */ (
          this.parentStackEntry_().tagSpec.getSpec().specName);
    }
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
   * True if the current stack leaf has dev mode set.
   * @return {boolean}
   */
  isDevMode() {
    return this.parentStackEntry_().devMode;
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
   * Tells the parent of the current stack entry that its last child must be
   * me (the current stack entry).
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
   * @return {boolean} true if this within <script type=application/json>.
   *     Else
   * false.
   */
  isScriptTypeJsonChild() {
    return (this.parentStackEntry_().tagName === 'SCRIPT') &&
        (this.parentStackEntry_().tagSpec !== null) &&
        this.parentStackEntry_().tagSpec.isTypeJson();
  }

  /**
   * @return {boolean} true iff the parent tagspec indicates that these bytes
   * should be counted against the document CSS byte limit.
   */
  countDocCssBytes() {
    const parentSpec = this.parentStackEntry_().tagSpec;
    return (parentSpec !== null) && (parentSpec.getSpec().cdata !== null) &&
        (parentSpec.getSpec().cdata.docCssBytes);
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
   * Returns true if the current tag has an ancestor which set the given
   * marker.
   * @param {!generated.AncestorMarker.Marker} query
   * @return {boolean}
   */
  hasAncestorMarker(query) {
    asserts.assert(query !== generated.AncestorMarker.Marker.UNKNOWN);
    // Skip the first element, which is "$ROOT".
    for (let i = 1; i < this.stack_.length; ++i) {
      if (this.stack_[i].tagSpec === null) {
        continue;
      }
      const spec = this.stack_[i].tagSpec.getSpec();
      if (spec.markDescendants === null) {
        continue;
      }
      for (const marker of spec.markDescendants.marker) {
        if (marker === query) {
          return true;
        }
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
    if (parsedTagSpec.getSpec().descendantTagList === null) {
      return;
    }

    const allowedDescendantsForThisTag = [];
    for (const descendantTagList of parsedRules.getDescendantTagLists()) {
      // Get the list matching this tag's descendant tag name.
      if (parsedTagSpec.getSpec().descendantTagList ===
          descendantTagList.name) {
        for (const tag of descendantTagList.tag) {
          allowedDescendantsForThisTag.push(tag);
        }
      }
    }

    this.allowedDescendantsList_.push({
      tagName: getTagSpecName(parsedTagSpec.getSpec()),
      allowedTags: allowedDescendantsForThisTag
    });
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
   * Updates the allowed descendants list if a tag introduced constraints.
   * This is called when exiting a tag.
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
 * @param {!generated.CssSpec} cssSpec
 * @param {string} atRuleName
 * @return {boolean}
 */
function isAtRuleValid(cssSpec, atRuleName) {
  for (const atRuleSpec of cssSpec.atRuleSpec) {
    if (atRuleSpec.name === parse_css.stripVendorPrefix(atRuleName)) {
      return true;
    }
  }
  return false;
}

/**
 * Returns true if the given Declaration is considered valid.
 * @param {!generated.CssSpec} cssSpec
 * @param {string} declarationName
 * @return {boolean}
 */
function IsDeclarationValid(cssSpec, declarationName) {
  if (cssSpec.declaration.length === 0) {
    return true;
  }
  return cssSpec.declaration.indexOf(
             parse_css.stripVendorPrefix(declarationName)) > -1;
}

/**
 * Returns a string of the allowed Declarations.
 * @param {!generated.CssSpec} cssSpec
 * @return {string}
 */
function AllowedDeclarationsString(cssSpec) {
  if (cssSpec.declaration.length > 5) {
    return '';
  }
  return '[\'' + cssSpec.declaration.join('\', \'') + '\']';
}

/** @private */
class InvalidRuleVisitor extends parse_css.RuleVisitor {
  /**
   * @param {!generated.TagSpec} tagSpec
   * @param {!generated.CssSpec} cssSpec
   * @param {!Context} context
   * @param {!generated.ValidationResult} result
   */
  constructor(tagSpec, cssSpec, context, result) {
    super();
    /** @type {!generated.TagSpec} */
    this.tagSpec = tagSpec;
    /** @type {!generated.CssSpec} */
    this.cssSpec = cssSpec;
    /** @type {!Context} */
    this.context = context;
    /** @type {!generated.ValidationResult} */
    this.result = result;
  }

  /** @inheritDoc */
  visitAtRule(atRule) {
    if (!isAtRuleValid(this.cssSpec, atRule.name)) {
      this.context.addError(
          generated.ValidationError.Code.CSS_SYNTAX_INVALID_AT_RULE,
          new LineCol(atRule.line, atRule.col),
          /* params */[getTagDescriptiveName(this.tagSpec), atRule.name],
          /* url */ '', this.result);
    }
  }

  /** @inheritDoc */
  visitDeclaration(declaration) {
    if (!IsDeclarationValid(this.cssSpec, declaration.name)) {
      const declarationsStr = AllowedDeclarationsString(this.cssSpec);
      if (declarationsStr === '') {
        this.context.addError(
            generated.ValidationError.Code.CSS_SYNTAX_INVALID_PROPERTY_NOLIST,
            new LineCol(declaration.line, declaration.col),
            /* params */[getTagDescriptiveName(this.tagSpec), declaration.name],
            /* url */ '', this.result);

      } else {
        this.context.addError(
            generated.ValidationError.Code.CSS_SYNTAX_INVALID_PROPERTY,
            new LineCol(declaration.line, declaration.col),
            /* params */
            [
              getTagDescriptiveName(this.tagSpec),
              declaration.name,
              AllowedDeclarationsString(this.cssSpec),
            ],
            /* url */ '', this.result);
      }
    }
  }
}

/** @private */
class InvalidDeclVisitor extends parse_css.RuleVisitor {
  /**
   * @param {!ParsedDocCssSpec} spec
   * @param {!Context} context
   * @param {!generated.ValidationResult} result
   */
  constructor(spec, context, result) {
    super();
    /** @type {!ParsedDocCssSpec} */
    this.spec = spec;
    /** @type {!Context} */
    this.context = context;
    /** @type {!generated.ValidationResult} */
    this.result = result;
  }

  /** @inheritDoc */
  visitDeclaration(declaration) {
    if (!this.spec.cssDeclarationByName(declaration.name)) {
      this.context.addError(
          generated.ValidationError.Code.CSS_SYNTAX_INVALID_PROPERTY_NOLIST,
          new LineCol(declaration.line, declaration.col),
          ['style amp-custom', declaration.name], this.spec.spec().specUrl,
          this.result);
    }
  }
}

/**
 * @typedef {{ atRuleSpec: !Object<string, parse_css.BlockType>,
 *             defaultSpec: !parse_css.BlockType }}
 */
let CssParsingConfig;

/**
 * Generates a CssParsingConfig.
 * @return {!CssParsingConfig}
 */
function GenCssParsingConfig() {
  /** @type {!Object<string, parse_css.BlockType>} */
  const ampAtRuleParsingSpec = Object.create(null);
  ampAtRuleParsingSpec['font-face'] = parse_css.BlockType.PARSE_AS_DECLARATIONS;
  ampAtRuleParsingSpec['keyframes'] = parse_css.BlockType.PARSE_AS_RULES;
  ampAtRuleParsingSpec['media'] = parse_css.BlockType.PARSE_AS_RULES;
  ampAtRuleParsingSpec['page'] = parse_css.BlockType.PARSE_AS_DECLARATIONS;
  ampAtRuleParsingSpec['supports'] = parse_css.BlockType.PARSE_AS_RULES;
  const config = {
    atRuleSpec: ampAtRuleParsingSpec,
    defaultSpec: parse_css.BlockType.PARSE_AS_IGNORE,
  };
  return config;
}
exports.GenCssParsingConfig = GenCssParsingConfig;

const SelectorSpecVisitor = class extends parse_css.SelectorVisitor {
  /**
   * @param {!generated.SelectorSpec} spec
   * @param {!Array<!tokenize_css.ErrorToken>} errorBuffer
   */
  constructor(spec, errorBuffer) {
    super(errorBuffer);
    /** @private {!generated.SelectorSpec} */
    this.selectorSpec_ = spec;

    /** @private {!Array<!tokenize_css.ErrorToken>} */
    this.errorBuffer_ = errorBuffer;
  }

  /**
   * @override
   * @param {!parse_css.AttrSelector} attrSelector
   */
  visitAttrSelector(attrSelector) {
    for (const allowedName of this.selectorSpec_.attributeName) {
      if (allowedName === '*' || allowedName === attrSelector.attrName) return;
    }
    const errorToken = new tokenize_css.ErrorToken(
        generated.ValidationError.Code.CSS_SYNTAX_DISALLOWED_ATTR_SELECTOR,
        ['', attrSelector.attrName]);
    attrSelector.copyPosTo(errorToken);
    this.errorBuffer_.push(errorToken);
  }

  /**
   * @override
   * @param {!parse_css.PseudoSelector} selector
   */
  visitPseudoSelector(selector) {
    if (selector.isClass) {  // pseudo-class
      for (const allowedPseudoClass of this.selectorSpec_.pseudoClass) {
        if (allowedPseudoClass === '*' || allowedPseudoClass === selector.name)
          return;
      }
      const errorToken = new tokenize_css.ErrorToken(
          generated.ValidationError.Code.CSS_SYNTAX_DISALLOWED_PSEUDO_CLASS,
          ['', selector.name]);
      selector.copyPosTo(errorToken);
      this.errorBuffer_.push(errorToken);
    } else {  // pseudo-element
      for (const allowedPseudoElement of this.selectorSpec_.pseudoElement) {
        if (allowedPseudoElement === '*' ||
            allowedPseudoElement === selector.name)
          return;
      }
      const errorToken = new tokenize_css.ErrorToken(
          generated.ValidationError.Code.CSS_SYNTAX_DISALLOWED_PSEUDO_ELEMENT,
          ['', selector.name]);
      selector.copyPosTo(errorToken);
      this.errorBuffer_.push(errorToken);
    }
  }
};

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
   * @param {!generated.TagSpec} tagSpec
   * @param {!LineCol} lineCol
   */
  constructor(tagSpec, lineCol) {
    /** @private @type {!generated.TagSpec} */
    this.tagSpec_ = tagSpec;

    // The CDataMatcher in Javascript also keeps track of the line/column
    // information from the context when it was created. This is necessary
    // because this code does not have control over the advancement of the
    // DocLocator instance (in Context) over the document, so by the time
    // we know that there's something wrong with the cdata for a tag,
    // we've advanced past the tag. This information gets filled in
    // by Context.setCdataMatcher_.

    /** @private @type {!LineCol} */
    this.lineCol_ = lineCol;
  }

  /**
   * Matches the provided cdata against what this CdataMatcher expects.
   * @param {string} cdata
   * @param {!Context} context
   * @param {!generated.ValidationResult} validationResult
   */
  match(cdata, context, validationResult) {
    const cdataSpec = this.tagSpec_.cdata;
    if (cdataSpec === null) {
      return;
    }
    let urlBytes = 0;
    // The mandatory_cdata, cdata_regex, and css_spec fields are treated
    // like a oneof, but we're not using oneof because it's a feature
    // that was added after protobuf 2.5.0 (which our open-source
    // version uses).
    // begin oneof {

    // Mandatory CDATA exact match
    if (cdataSpec.mandatoryCdata !== null) {
      if (cdataSpec.mandatoryCdata !== cdata) {
        context.addError(
            generated.ValidationError.Code.MANDATORY_CDATA_MISSING_OR_INCORRECT,
            context.getLineCol(),
            /* params */[getTagDescriptiveName(this.tagSpec_)],
            getTagSpecUrl(this.tagSpec_), validationResult);
      }
      // We return early if the cdata has an exact match rule. The
      // spec shouldn't have an exact match rule that doesn't validate.
      return;
    } else if (this.tagSpec_.cdata.cdataRegex !== null) {
      if (!context.getRules()
               .getFullMatchRegex(this.tagSpec_.cdata.cdataRegex)
               .test(cdata)) {
        context.addError(
            generated.ValidationError.Code.MANDATORY_CDATA_MISSING_OR_INCORRECT,
            context.getLineCol(),
            /* params */[getTagDescriptiveName(this.tagSpec_)],
            getTagSpecUrl(this.tagSpec_), validationResult);
        return;
      }
    } else if (cdataSpec.cssSpec !== null) {
      if (VALIDATE_CSS) {
        urlBytes =
            this.matchCss_(cdata, cdataSpec.cssSpec, context, validationResult);
      }
    } else if (cdataSpec.whitespaceOnly === true) {
      if (!(/^\s*$/.test(cdata))) {
        context.addError(
            generated.ValidationError.Code.NON_WHITESPACE_CDATA_ENCOUNTERED,
            context.getLineCol(),
            /* params */[getTagDescriptiveName(this.tagSpec_)],
            getTagSpecUrl(this.tagSpec_), validationResult);
      }
    }
    // } end oneof

    const maybeDocCssSpec = context.matchingDocCssSpec();

    /** @type {number} */
    let adjustedCdataLength = htmlparser.byteLength(cdata);
    if (maybeDocCssSpec !== null && !maybeDocCssSpec.spec().urlBytesIncluded) {
      adjustedCdataLength -= urlBytes;
    }

    // Max CDATA Byte Length, specific to this CDATA (not the document limit).
    if (cdataSpec.maxBytes !== -2 && adjustedCdataLength > cdataSpec.maxBytes) {
      context.addError(
          generated.ValidationError.Code.STYLESHEET_TOO_LONG,
          context.getLineCol(),
          /* params */
          [
            getTagDescriptiveName(this.tagSpec_),
            adjustedCdataLength.toString(),
            cdataSpec.maxBytes.toString(),
          ],
          cdataSpec.maxBytesSpecUrl, validationResult);
      return;
    }

    // Record <style amp-custom> byte size
    if (context.getTagStack().countDocCssBytes()) {
      context.addStyleTagByteSize(adjustedCdataLength);
    }

    // Disallowed CDATA Regular Expressions
    // We use a combined regex as a fast test. If it matches, we re-match
    // against each individual regex so that we can generate better error
    // messages.
    if (cdataSpec.combinedDenyListedCdataRegex === null) {
      return;
    }
    if (!context.getRules()
             .getPartialMatchCaseiRegex(cdataSpec.combinedDenyListedCdataRegex)
             .test(cdata)) {
      return;
    }
    for (const denylist of cdataSpec.disallowedCdataRegex) {
      const disallowedRegex = new RegExp(denylist.regex, 'i');
      if (disallowedRegex.test(cdata)) {
        context.addError(
            generated.ValidationError.Code.CDATA_VIOLATES_DENYLIST,
            context.getLineCol(),
            /* params */
            [getTagDescriptiveName(this.tagSpec_), denylist.errorMessage],
            getTagSpecUrl(this.tagSpec_), validationResult);
      }
    }
  }

  /**
   * Matches the provided stylesheet against a CSS media query specification.
   * @param {!parse_css.Stylesheet} stylesheet
   * @param {!generated.MediaQuerySpec} spec
   * @param {!Array<!tokenize_css.ErrorToken>} errorBuffer
   * @private
   */
  matchMediaQuery_(stylesheet, spec, errorBuffer) {
    /** @type{!Array<!tokenize_css.IdentToken>} */
    const seenMediaTypes = [];
    /** @type{!Array<!tokenize_css.IdentToken>} */
    const seenMediaFeatures = [];
    parse_css.parseMediaQueries(
        stylesheet, seenMediaTypes, seenMediaFeatures, errorBuffer);

    for (const token of seenMediaTypes) {
      /** @type{string} */
      const strippedMediaType =
          parse_css.stripVendorPrefix(token.value.toLowerCase());
      if (!spec.type.includes(strippedMediaType)) {
        const errorToken = new tokenize_css.ErrorToken(
            generated.ValidationError.Code.CSS_SYNTAX_DISALLOWED_MEDIA_TYPE,
            ['', token.value]);
        token.copyPosTo(errorToken);
        errorBuffer.push(errorToken);
      }
    }

    for (const token of seenMediaFeatures) {
      /** @type{string} */
      const strippedMediaFeature = parse_css.stripMinMax(
          parse_css.stripVendorPrefix(token.value.toLowerCase()));
      if (!spec.feature.includes(strippedMediaFeature)) {
        const errorToken = new tokenize_css.ErrorToken(
            generated.ValidationError.Code.CSS_SYNTAX_DISALLOWED_MEDIA_FEATURE,
            ['', token.value]);
        token.copyPosTo(errorToken);
        errorBuffer.push(errorToken);
      }
    }
  }

  /**
   * Matches the provided stylesheet against a SelectorSpec
   * @param {!parse_css.Stylesheet} stylesheet
   * @param {!generated.SelectorSpec} spec
   * @param {!Array<!tokenize_css.ErrorToken>} errorBuffer
   * @private
   */
  matchSelectors_(stylesheet, spec, errorBuffer) {
    let visitor = new SelectorSpecVisitor(spec, errorBuffer);
    stylesheet.accept(visitor);
  }

  /**
   * Matches the provided cdata against a CSS specification. Helper
   * routine for match (see above). The return value is the number of
   * bytes in the CSS string which were measured as URLs. In some
   * validation types, these bytes are not counted against byte limits.
   * @param {string} cdata
   * @param {!generated.CssSpec} cssSpec
   * @param {!Context} context
   * @param {!generated.ValidationResult} validationResult
   * @returns {number}
   * @private
   */
  matchCss_(cdata, cssSpec, context, validationResult) {
    /** @type {!Array<!tokenize_css.ErrorToken>} */
    const cssErrors = [];
    /** @type {!Array<!tokenize_css.ErrorToken>} */
    const cssWarnings = [];
    /** @type {!Array<!tokenize_css.Token>} */
    const tokenList = tokenize_css.tokenize(
        cdata, this.getLineCol().getLine(), this.getLineCol().getCol(),
        cssErrors);
    /** @type {!CssParsingConfig} */
    const cssParsingConfig = GenCssParsingConfig();
    /** @type {!parse_css.Stylesheet} */
    const stylesheet = parse_css.parseAStylesheet(
        tokenList, cssParsingConfig.atRuleSpec, cssParsingConfig.defaultSpec,
        cssErrors);

    const maybeDocCssSpec = context.matchingDocCssSpec();

    // We extract the urls from the stylesheet. As a side-effect, this can
    // generate errors for url(…) functions with invalid parameters.
    /** @type {!Array<!parse_css.ParsedCssUrl>} */
    const parsedUrls = [];
    parse_css.extractUrlsFromStylesheet(stylesheet, parsedUrls, cssErrors);
    // Similarly we extract query types and features from @media rules.
    for (const atRuleSpec of cssSpec.atRuleSpec) {
      if (atRuleSpec.mediaQuerySpec !== null) {
        asserts.assert(atRuleSpec.name === 'media');
        const {mediaQuerySpec} = atRuleSpec;
        const errorBuffer =
            mediaQuerySpec.issuesAsError ? cssErrors : cssWarnings;
        this.matchMediaQuery_(stylesheet, mediaQuerySpec, errorBuffer);
        // There will be at most @media atRuleSpec
        break;
      }
    }

    if (cssSpec.selectorSpec !== null)
      this.matchSelectors_(stylesheet, cssSpec.selectorSpec, cssErrors);

    if (cssSpec.validateAmp4Ads) {
      amp4ads.validateAmp4AdsCss(stylesheet, cssErrors);
    }

    if (cssSpec.validateKeyframes) {
      keyframes.validateKeyframesCss(stylesheet, cssErrors);
    }

    // Add errors then warnings:
    for (const errorToken of cssErrors) {
      // Override the first parameter with the name of this style tag.
      const {params} = errorToken;
      // Override the first parameter with the name of this style tag.
      params[0] = getTagDescriptiveName(this.tagSpec_);
      context.addError(
          errorToken.code, new LineCol(errorToken.line, errorToken.col), params,
          /* url */ '', validationResult);
    }
    for (const errorToken of cssWarnings) {
      // Override the first parameter with the name of this style tag.
      const {params} = errorToken;
      // Override the first parameter with the name of this style tag.
      params[0] = getTagDescriptiveName(this.tagSpec_);
      context.addError(
          errorToken.code, new LineCol(errorToken.line, errorToken.col), params,
          /* url */ '', validationResult);
    }

    // If `!important` is not allowed, record instances as errors.
    if (!cssSpec.allowImportant) {
      /** @type {!Array<!parse_css.Declaration>} */
      let important = [];
      parse_css.extractImportantDeclarations(stylesheet, important);
      for (const decl of important) {
        context.addError(
            generated.ValidationError.Code.CDATA_VIOLATES_DENYLIST,
            new LineCol(decl.important_line, decl.important_col),
            /* params */
            [getTagDescriptiveName(this.tagSpec_), 'CSS !important'],
            getTagSpecUrl(this.tagSpec_), validationResult);
      }
    }

    /** @type {number} */
    let urlBytes = 0;
    for (const url of parsedUrls) {
      // Some CSS specs can choose to not count URLs against the byte limit,
      // but data URLs are always counted (or in other words, they aren't
      // considered URLs).
      if (!isDataUrl(url.utf8Url)) {
        urlBytes += htmlparser.byteLength(url.utf8Url);
      }
      if (maybeDocCssSpec !== null) {
        const adapter = new UrlErrorInStylesheetAdapter(url.line, url.col);
        validateUrlAndProtocol(
            ((url.atRuleScope === 'font-face') ?
                 maybeDocCssSpec.fontUrlSpec() :
                 maybeDocCssSpec.imageUrlSpec()),
            adapter, context, url.utf8Url, this.tagSpec_, validationResult);
      }
    }
    // Validate the allowed CSS AT rules (eg: `@media`)
    const invalidRuleVisitor = new InvalidRuleVisitor(
        this.tagSpec_, cssSpec, context, validationResult);
    stylesheet.accept(invalidRuleVisitor);

    // Validate the allowed CSS declarations (eg: `background-color`)
    if (maybeDocCssSpec !== null &&
        !maybeDocCssSpec.spec().allowAllDeclarationInStyleTag) {
      const invalidDeclVisitor =
          new InvalidDeclVisitor(maybeDocCssSpec, context, validationResult);
      stylesheet.accept(invalidDeclVisitor);
    }

    return urlBytes;
  }

  /** @return {!LineCol} */
  getLineCol() {
    return this.lineCol_;
  }
}

/**
 * @typedef {{ missingExtension: string,
 *             maybeError: ?generated.ValidationError }}
 */
let ExtensionMissingError;

/**
 * The extensions context keeps track of the extensions that the validator has
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

    // AMP-AD is exempted to not require the respective extension
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

    /**
     * @type {!Array<ExtensionMissingError>}
     * @private
     */
    this.extensionMissingErrors_ = [];
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
    for (const requiredExtension of tagSpec.requiresExtension) {
      if (!this.isExtensionLoaded(requiredExtension)) {
        const error = new generated.ValidationError();
        error.severity = generated.ValidationError.Severity.ERROR;
        error.code = generated.ValidationError.Code.MISSING_REQUIRED_EXTENSION;
        error.params = [getTagDescriptiveName(tagSpec), requiredExtension];
        error.line = lineCol.getLine();
        error.col = lineCol.getCol();
        error.specUrl = getTagSpecUrl(tagSpec);

        this.extensionMissingErrors_.push(
            {missingExtension: requiredExtension, maybeError: error});
      }
    }
  }

  /**
   * Returns a list of errors accrued while processing the
   * <head> for tags requiring an extension which was not found.
   * @return {!Array<!generated.ValidationError>}
   */
  missingExtensionErrors() {
    const out = [];
    for (const err of this.extensionMissingErrors_) {
      if (!this.isExtensionLoaded(err.missingExtension)) {
        out.push(err.maybeError);
      }
    }

    return out;
  }

  /**
   * Records extensions that are used within the document.
   * @param {!Array<string>} extensions
   */
  recordUsedExtensions(extensions) {
    for (const extension of extensions) {
      this.extensionsUsed_[extension] = true;
    }
  }

  /**
   * Returns a list of unused extensions which produce validation errors
   * when unused.
   * @return {!Array<string>}
   */
  unusedExtensionsRequired() {
    // Compute Difference: extensionsUnusedRequired_ - extensionsUsed_
    const out = [];
    for (const extension of this.extensionsUnusedRequired_) {
      if (!(extension in this.extensionsUsed_)) {
        out.push(extension);
      }
    }
    out.sort();
    return out;
  }

  /**
   * Update ExtensionContext state when we encounter an amp extension or
   * tag using an extension.
   * @param {!ValidateTagResult} result
   */
  updateFromTagResult(result) {
    if (result.bestMatchTagSpec === null) {
      return;
    }
    const parsedTagSpec = result.bestMatchTagSpec;
    const tagSpec = parsedTagSpec.getSpec();

    // Keep track of which extensions are loaded.
    if (tagSpec.extensionSpec !== null) {
      const {extensionSpec} = tagSpec;
      // This is an always present field if extension spec is set.
      const extensionName = /** @type{string} */ (extensionSpec.name);

      // Record that we have encountered an extension 'load' tag. This will
      // look like <script custom-element=amp-foo ...> or similar.
      this.extensionsLoaded_[extensionName] = true;
      switch (extensionSpec.requiresUsage) {
        case generated.ExtensionSpec.ExtensionUsageRequirement
            .EXEMPTED:  // Fallthrough intended:
        case generated.ExtensionSpec.ExtensionUsageRequirement.NONE:
          // This extension does not have usage demonstrated by a tag, for
          // example: amp-dynamic-css-classes
          break;
        case generated.ExtensionSpec.ExtensionUsageRequirement.ERROR:
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
    this.recordUsedExtensions(tagSpec.requiresExtension);
  }
}

// If any script in the page uses LTS, all scripts must use LTS. This is used
// to record when a script is seen and validate following script tags.
/** @enum {string} */
const ScriptReleaseVersion = {
  UNKNOWN: 'UNKNOWN',
  STANDARD: 'STANDARD',
  LTS: 'LTS',
};

/**
 * Gets the name attribute for an extension script tag.
 * @param {!parserInterface.ParsedHtmlTag} tag
 * @return {string}
 */
function ExtensionScriptNameAttribute(tag) {
  if (tag.upperName() == 'SCRIPT') {
    for (const attribute
             of ['custom-element', 'custom-template', 'host-service']) {
      if (attribute in tag.attrsByKey()) {
        return attribute;
      }
    }
  }
  return '';
}

/**
 * Gets the extension name for an extension script tag.
 * @param {!parserInterface.ParsedHtmlTag} tag
 * @return {string}
 */
function ExtensionScriptName(tag) {
  const nameAttr = ExtensionScriptNameAttribute(tag);
  if (nameAttr) {
    // Extension script names are required to be in lowercase by the
    // validator, so we don't need to lowercase them here.
    return tag.attrsByKey()[nameAttr] || '';
  }
  return '';
}

/**
 * Tests if a tag is an extension script tag.
 * @param {!parserInterface.ParsedHtmlTag} tag
 * @return {boolean}
 */
function IsExtensionScript(tag) {
  return !!ExtensionScriptNameAttribute(tag);
}

/**
 * Tests if a tag is an async script tag.
 * @param {!parserInterface.ParsedHtmlTag} tag
 * @return {boolean}
 */
function IsAsyncScriptTag(tag) {
  return tag.upperName() == 'SCRIPT' && 'async' in tag.attrsByKey() &&
      'src' in tag.attrsByKey();
}

/**
 * Tests if a tag is the AMP runtime script tag.
 * @param {!parserInterface.ParsedHtmlTag} tag
 * @return {boolean}
 */
function IsAmpRuntimeScript(tag) {
  const src = tag.attrsByKey()['src'] || '';
  return IsAsyncScriptTag(tag) && !IsExtensionScript(tag) &&
      src.startsWith('https://cdn.ampproject.org/') && src.endsWith('/v0.js');
}

/**
 * Tests if a URL is for the LTS version of a script.
 * @param {string} url
 * @return {boolean}
 */
function IsLtsScriptUrl(url) {
  return url.startsWith('https://cdn.ampproject.org/lts/');
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
     * @type {?parserInterface.DocLocator}
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
     * Size of <style amp-custom>.
     * @type {number}
     * @private
     */
    this.styleTagByteSize_ = 0;

    /**
     * Size of all inline styles (style attribute) combined.
     * @type {number}
     * @private
     */
    this.inlineStyleByteSize_ = 0;

    /**
     * Set of type identifiers in this document.
     * @type {!Array<string>}
     * @private
     */
    this.typeIdentifiers_ = [];

    /**
     * All the value set provisions so far.
     * @type {!Set<string>}
     * @private
     */
    this.valueSetsProvided_ = new Set;

    /**
     * All the value set requirements so far.
     * @type {!Map<string, !Array<!generated.ValidationError>>}
     * @private
     */
    this.valueSetsRequired_ = new Map;

    /**
     * Set of conditions that we've satisfied.
     * @type {!Array<boolean>}
     * @private
     */
    this.conditionsSatisfied_ = [];

    /**
     * First tagspec seen (matched) which contains an URL.
     * @type {?generated.TagSpec}
     * @private
     */
    this.firstUrlSeenTag_ = null;

    /**
     * @type {?LineCol}
     * @private
     */
    this.encounteredBodyLineCol_ = null;

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

    /**
     * Flag for if the LTS runtime engine is present.
     * @type {!ScriptReleaseVersion}
     * @private
     */
    this.scriptReleaseVersion_ = ScriptReleaseVersion.UNKNOWN;
  }

  /** @return {!ParsedValidatorRules} */
  getRules() {
    return this.rules_;
  }

  /**
   * Callback before startDoc which gives us a document locator.
   * @param {!parserInterface.DocLocator} locator
   */
  setDocLocator(locator) {
    this.docLocator_ = locator;
  }

  /**
   * Returns the document size from the document locator.
   * @return {number}
   */
  getDocByteSize() {
    return this.docLocator_.getDocByteSize();
  }

  /** @return {!LineCol} */
  getLineCol() {
    return new LineCol(this.docLocator_.getLine(), this.docLocator_.getCol());
  }

  /**
   * @param {!generated.ValidationError} error
   * @param {!generated.ValidationResult} validationResult
   */
  addBuiltError(error, validationResult) {
    // If any of the errors amount to more than a WARNING, validation fails.
    if (error.severity !== generated.ValidationError.Severity.WARNING) {
      validationResult.status = generated.ValidationResult.Status.FAIL;
    }
    asserts.assert(validationResult.errors !== undefined);
    validationResult.errors.push(error);
  }

  /**
   * Add an error field to validationResult with severity WARNING.
   * @param {!generated.ValidationError.Code} validationErrorCode Error code
   * @param {!LineCol} lineCol a line / column pair.
   * @param {!Array<string>} params
   * @param {?string} specUrl a link (URL) to the amphtml spec
   * @param {!generated.ValidationResult} validationResult
   */
  addWarning(validationErrorCode, lineCol, params, specUrl, validationResult) {
    this.addBuiltError(
        populateError(
            generated.ValidationError.Severity.WARNING, validationErrorCode,
            lineCol, params, specUrl),
        validationResult);
  }

  /**
   * Add an error field to validationResult with severity ERROR.
   * @param {!generated.ValidationError.Code} validationErrorCode Error code
   * @param {!LineCol} lineCol a line / column pair.
   * @param {!Array<string>} params
   * @param {?string} specUrl a link (URL) to the amphtml spec
   * @param {!generated.ValidationResult} validationResult
   */
  addError(validationErrorCode, lineCol, params, specUrl, validationResult) {
    this.addBuiltError(
        populateError(
            generated.ValidationError.Severity.ERROR, validationErrorCode,
            lineCol, params, specUrl),
        validationResult);
    validationResult.status = generated.ValidationResult.Status.FAIL;
  }

  /**
   * Given a tag result, update the Context state to affect
   * later validation. Does not handle updating the tag stack.
   * @param {!ValidateTagResult} result
   * @private
   */
  updateFromTagResult_(result) {
    if (result.bestMatchTagSpec === null) {
      return;
    }
    const parsedTagSpec = result.bestMatchTagSpec;
    const isPassing =
        (result.validationResult.status ===
         generated.ValidationResult.Status.PASS);

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
    this.recordValidatedFromTagSpec_(isPassing, parsedTagSpec);

    const {validationResult} = result;
    for (const provision of validationResult.valueSetProvisions)
      this.valueSetsProvided_.add(this.keyFromValueSetProvision_(provision));
    for (const requirement of validationResult.valueSetRequirements) {
      if (!requirement.provision) continue;
      const key = this.keyFromValueSetProvision_(requirement.provision);
      let errors = this.valueSetsRequired_.get(key);
      if (!errors) {
        errors = [];
        this.valueSetsRequired_.set(key, errors);
      }
      errors.push(requirement.errorIfUnsatisfied);
    }

    if (isPassing) {
      // If the tag spec didn't match, we don't know that the tag actually
      // contained a URL, so no need to complain about it.
      this.markUrlSeenFromMatchingTagSpec_(parsedTagSpec);
    }
  }

  /**
   * Record if this document contains a tag requesting the LTS runtime engine.
   * @param {!parserInterface.ParsedHtmlTag} parsedTag
   * @param {!generated.ValidationResult} result
   * @private
   */
  recordScriptReleaseVersionFromTagResult_(parsedTag, result) {
    if (this.getScriptReleaseVersion() === ScriptReleaseVersion.UNKNOWN &&
        (IsExtensionScript(parsedTag) || IsAmpRuntimeScript(parsedTag))) {
      const src = parsedTag.attrsByKey()['src'] || '';
      this.scriptReleaseVersion_ = IsLtsScriptUrl(src) ?
          ScriptReleaseVersion.LTS :
          ScriptReleaseVersion.STANDARD;
    }
  }

  /**
   * @param {!generated.ValueSetProvision} provision
   * @return {string} A key for valueSetsProvided_ and valueSetsRequired_.
   * @private
   */
  keyFromValueSetProvision_(provision) {
    return (provision.set || '') + '>' + (provision.value || '');
  }

  /**
   * Given the tagResult from validating a single tag, update the overall
   * result as well as the Context state to affect later validation.
   * @param {!parserInterface.ParsedHtmlTag} encounteredTag
   * @param {!ValidateTagResult} referencePointResult
   * @param {!ValidateTagResult} tagResult
   */
  updateFromTagResults(encounteredTag, referencePointResult, tagResult) {
    this.tagStack_.updateFromTagResults(
        encounteredTag, referencePointResult, tagResult, this.getRules(),
        this.getLineCol());

    this.recordAttrRequiresExtension_(encounteredTag, referencePointResult);
    this.recordAttrRequiresExtension_(encounteredTag, tagResult);
    this.updateFromTagResult_(referencePointResult);
    this.updateFromTagResult_(tagResult);
    this.recordScriptReleaseVersionFromTagResult_(
        encounteredTag, tagResult.validationResult);
    this.addInlineStyleByteSize(tagResult.inlineStyleCssBytes);
  }

  /**
   * Record when an encountered tag's attribute that requires an extension
   * that it also satisfies that the requied extension is used.
   * @param {!parserInterface.ParsedHtmlTag} encounteredTag
   * @param {!ValidateTagResult} tagResult
   * @private
   */
  recordAttrRequiresExtension_(encounteredTag, tagResult) {
    if (tagResult.bestMatchTagSpec === null) {
      return;
    }
    const parsedTagSpec = tagResult.bestMatchTagSpec;
    if (!parsedTagSpec.attrsCanSatisfyExtension()) {
      return;
    }
    const attrsByName = parsedTagSpec.getAttrsByName();
    const extensionsCtx = this.extensions_;
    for (const attr of encounteredTag.attrs()) {
      if (attr.name in attrsByName) {
        const attrId = attrsByName[attr.name];
        // negative attr ids are simple attrs (only name set).
        if (attrId < 0) {
          continue;
        }
        const parsedAttrSpec =
            this.rules_.getParsedAttrSpecs().getByAttrSpecId(attrId);
        if (parsedAttrSpec.getSpec().requiresExtension.length > 0) {
          extensionsCtx.recordUsedExtensions(
              parsedAttrSpec.getSpec().requiresExtension);
        }
      }
    }
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
    if (!this.hasSeenUrl() && parsedTagSpec.containsUrl()) {
      this.firstUrlSeenTag_ = parsedTagSpec.getSpec();
    }
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
    return getTagSpecName(
        /** @type {!generated.TagSpec} */ (this.firstUrlSeenTag_));
  }

  /**
   * Records that this document contains a tag matching a particular tag spec.
   * @param {boolean} isPassing
   * @param {!ParsedTagSpec} parsedTagSpec
   * @private
   */
  recordValidatedFromTagSpec_(isPassing, parsedTagSpec) {
    const recordValidated = parsedTagSpec.shouldRecordTagspecValidated();
    if (recordValidated == RecordValidated.ALWAYS) {
      this.tagspecsValidated_[parsedTagSpec.id()] = true;
    } else if (isPassing && (recordValidated == RecordValidated.IF_PASSING)) {
      this.tagspecsValidated_[parsedTagSpec.id()] = true;
    }
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
   * Records how much of the document is used towards <style amp-custom>.
   * @param {number} byteSize
   */
  addStyleTagByteSize(byteSize) {
    this.styleTagByteSize_ += byteSize;
  }

  /**
   * Records how much of the document is used twoards inline style.
   * @param {number} byteSize
   */
  addInlineStyleByteSize(byteSize) {
    this.inlineStyleByteSize_ += byteSize;
  }

  /**
   * Returns the size of <style amp-custom>.
   * @return {number}
   */
  getStyleTagByteSize() {
    return this.styleTagByteSize_;
  }

  /**
   * Returns the size of inline styles.
   * @return {number}
   */
  getInlineStyleByteSize() {
    return this.inlineStyleByteSize_;
  }

  /**
   * Record the type identifier in this document.
   * @param {string} typeIdentifier
   */
  recordTypeIdentifier(typeIdentifier) {
    this.typeIdentifiers_.push(typeIdentifier);
  }

  /**
   * Returns the type identifiers in this document.
   * @return {!Array<string>}
   */
  getTypeIdentifiers() {
    return this.typeIdentifiers_;
  }

  /**
   * Returns true iff `spec` should be used for the type identifiers recorded
   * in this context, as seen in the document so far. If called before type
   * identifiers have been recorded, will always return false.
   * @param {!ParsedDocSpec} spec
   * @return {boolean}
   */
  isDocSpecValidForTypeIdentifiers(spec) {
    return isUsedForTypeIdentifiers(
        this.getTypeIdentifiers(), spec.enabledBy(), spec.disabledBy());
  }

  /**
   * Returns the first (there should be at most one) DocSpec which matches
   * both the html format and type identifiers recorded so far in this
   * context. If called before identifiers have been recorded, it may return
   * an incorrect selection.
   * @return {?ParsedDocSpec}
   */
  matchingDocSpec() {
    // The specs are usually already filtered by HTML format, so this loop
    // should be very short, often 1:
    for (const spec of this.rules_.getDoc()) {
      if (this.rules_.isDocSpecCorrectHtmlFormat_(spec.spec()) &&
          this.isDocSpecValidForTypeIdentifiers(spec)) {
        return spec;
      }
    }
    return null;
  }

  /**
   * Returns true iff `spec` should be used for the type identifiers recorded
   * in this context, as seen in the document so far. If called before type
   * identifiers have been recorded, will always return false.
   * @param {!ParsedDocCssSpec} spec
   * @return {boolean}
   */
  isDocCssSpecValidForTypeIdentifiers(spec) {
    return isUsedForTypeIdentifiers(
        this.getTypeIdentifiers(), spec.enabledBy(), spec.disabledBy());
  }

  /**
   * Returns the first (there should be at most one) DocCssSpec which matches
   * both the html format and type identifiers recorded so far in this
   * context. If called before identifiers have been recorded, it may return
   * an incorrect selection.
   * @return {?ParsedDocCssSpec}
   */
  matchingDocCssSpec() {
    // The specs are usually already filtered by HTML format, so this loop
    // should be very short, often 1:
    for (const spec of this.rules_.getCss()) {
      if (this.rules_.isDocCssSpecCorrectHtmlFormat_(spec.spec()) &&
          this.isDocCssSpecValidForTypeIdentifiers(spec)) {
        return spec;
      }
    }
    return null;
  }

  /**
   * Returns true iff "transformed" is a type identifier in this document.
   * @return {boolean}
   */
  isTransformed() {
    return this.typeIdentifiers_.includes('transformed');
  }

  /**
   * Returns true iff "data-ampdevmode" is a type identifier in this document.
   * @return {boolean}
   */
  isDevMode() {
    return this.typeIdentifiers_.includes('data-ampdevmode');
  }

  /**
   * Returns all the value set provisions so far, as a set of derived keys, as
   * computed by keyFromValueSetProvision_().
   * @return {!Set<string>}
   */
  valueSetsProvided() {
    return this.valueSetsProvided_;
  }

  /**
   * Returns all the value set requirements so far, keyed by derived keys, as
   * computed by getValueSetProvisionKey().
   * @return {!Map<string, !Array<!generated.ValidationError>>}
   */
  valueSetsRequired() {
    return this.valueSetsRequired_;
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
    this.encounteredBodyLineCol_ = this.getLineCol();
  }

  /** @return {?Array<!Object>} */
  getEncounteredBodyAttrs() {
    return this.encounteredBodyAttrs_;
  }

  /** @return {!LineCol} */
  getEncounteredBodyLineCol() {
    return /** @type {!LineCol} */ (this.encounteredBodyLineCol_);
  }

  /** @return {!ScriptReleaseVersion} */
  getScriptReleaseVersion() {
    return this.scriptReleaseVersion_;
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
   * @param {!generated.TagSpec} tagSpec
   * @param {!generated.ValidationResult} result
   */
  missingUrl(context, tagSpec, result) {
    context.addError(
        generated.ValidationError.Code.CSS_SYNTAX_MISSING_URL, this.lineCol_,
        /* params */[getTagDescriptiveName(tagSpec)], getTagSpecUrl(tagSpec),
        result);
  }

  /**
   * @param {!Context} context
   * @param {string} url
   * @param {!generated.TagSpec} tagSpec
   * @param {!generated.ValidationResult} result
   */
  invalidUrl(context, url, tagSpec, result) {
    context.addError(
        generated.ValidationError.Code.CSS_SYNTAX_INVALID_URL, this.lineCol_,
        /* params */[getTagDescriptiveName(tagSpec), url],
        getTagSpecUrl(tagSpec), result);
  }

  /**
   * @param {!Context} context
   * @param {string} protocol
   * @param {!generated.TagSpec} tagSpec
   * @param {!generated.ValidationResult} result
   */
  invalidUrlProtocol(context, protocol, tagSpec, result) {
    context.addError(
        generated.ValidationError.Code.CSS_SYNTAX_INVALID_URL_PROTOCOL,
        this.lineCol_,
        /* params */[getTagDescriptiveName(tagSpec), protocol],
        getTagSpecUrl(tagSpec), result);
  }

  /**
   * @param {!Context} context
   * @param {string} url
   * @param {!generated.TagSpec} tagSpec
   * @param {!generated.ValidationResult} result
   */
  disallowedRelativeUrl(context, url, tagSpec, result) {
    context.addError(
        generated.ValidationError.Code.CSS_SYNTAX_DISALLOWED_RELATIVE_URL,
        this.lineCol_,
        /* params */[getTagDescriptiveName(tagSpec), url],
        getTagSpecUrl(tagSpec), result);
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
   * @param {!generated.TagSpec} tagSpec
   * @param {!generated.ValidationResult} result
   */
  missingUrl(context, tagSpec, result) {
    context.addError(
        generated.ValidationError.Code.MISSING_URL, context.getLineCol(),
        /* params */[this.attrName_, getTagDescriptiveName(tagSpec)],
        getTagSpecUrl(tagSpec), result);
  }

  /**
   * @param {!Context} context
   * @param {string} url
   * @param {!generated.TagSpec} tagSpec
   * @param {!generated.ValidationResult} result
   */
  invalidUrl(context, url, tagSpec, result) {
    context.addError(
        generated.ValidationError.Code.INVALID_URL, context.getLineCol(),
        /* params */[this.attrName_, getTagDescriptiveName(tagSpec), url],
        getTagSpecUrl(tagSpec), result);
  }

  /**
   * @param {!Context} context
   * @param {string} protocol
   * @param {!generated.TagSpec} tagSpec
   * @param {!generated.ValidationResult} result
   */
  invalidUrlProtocol(context, protocol, tagSpec, result) {
    context.addError(
        generated.ValidationError.Code.INVALID_URL_PROTOCOL,
        context.getLineCol(),
        /* params */[this.attrName_, getTagDescriptiveName(tagSpec), protocol],
        getTagSpecUrl(tagSpec), result);
  }

  /**
   * @param {!Context} context
   * @param {string} url
   * @param {!generated.TagSpec} tagSpec
   * @param {!generated.ValidationResult} result
   */
  disallowedRelativeUrl(context, url, tagSpec, result) {
    context.addError(
        generated.ValidationError.Code.DISALLOWED_RELATIVE_URL,
        context.getLineCol(),
        /* params */[this.attrName_, getTagDescriptiveName(tagSpec), url],
        getTagSpecUrl(tagSpec), result);
  }
}

/**
 * Helper method for validateNonTemplateAttrValueAgainstSpec.
 * @param {ParsedAttrSpec} parsedAttrSpec
 * @param {!Context} context
 * @param {!parserInterface.ParsedAttr} attr
 * @param {!generated.TagSpec} tagSpec
 * @param {!generated.ValidationResult} result
 */
function validateAttrValueUrl(parsedAttrSpec, context, attr, tagSpec, result) {
  /** @type {!Array<string>} */
  const maybeUris = [];
  if (attr.name !== 'srcset') {
    maybeUris.push(attr.value);
  } else {
    if (attr.value === '') {
      context.addError(
          generated.ValidationError.Code.MISSING_URL, context.getLineCol(),
          /* params */[attr.name, getTagDescriptiveName(tagSpec)],
          getTagSpecUrl(tagSpec), result);
      return;
    }
    /** @type {!parse_srcset.SrcsetParsingResult} */
    const parseResult = parse_srcset.parseSrcset(attr.value);
    if (!parseResult.success) {
      // DUPLICATE_DIMENSION only needs two parameters, it does not report
      // on the attribute value.
      if (parseResult.errorCode ===
          generated.ValidationError.Code.DUPLICATE_DIMENSION) {
        context.addError(
            parseResult.errorCode, context.getLineCol(),
            /* params */[attr.name, getTagDescriptiveName(tagSpec)],
            getTagSpecUrl(tagSpec), result);
      } else {
        context.addError(
            parseResult.errorCode, context.getLineCol(),
            /* params */[attr.name, getTagDescriptiveName(tagSpec), attr.value],
            getTagSpecUrl(tagSpec), result);
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
    context.addError(
        generated.ValidationError.Code.MISSING_URL, context.getLineCol(),
        /* params */[attr.name, getTagDescriptiveName(tagSpec)],
        getTagSpecUrl(tagSpec), result);
    return;
  }
  sortAndUniquify(maybeUris);
  const adapter = new UrlErrorInAttrAdapter(attr.name);
  for (const maybeUri of maybeUris) {
    const unescapedMaybeUri = googString.unescapeEntities(maybeUri);
    validateUrlAndProtocol(
        parsedAttrSpec.getValueUrlSpec(), adapter, context, unescapedMaybeUri,
        tagSpec, result);
    if (result.status === generated.ValidationResult.Status.FAIL) {
      return;
    }
  }
}

/**
 * Returns the protocol of the input URL. Assumes https if relative. Accepts
 * both the original URL string and a parsed URL produced from it, to avoid
 * reparsing.
 * @param {string} urlStr original URL string
 * @param {!parse_url.URL} url parsed URL.
 * @return {string}
 */
function urlProtocol(urlStr, url) {
  // Technically, an URL such as "script :alert('foo')" is considered a
  // relative URL, similar to "./script%20:alert(%27foo%27)" since space is
  // not a legal character in a URL protocol. This is what URL will determine.
  // However, some very old browsers will ignore whitespace in URL protocols
  // and will treat this as javascript execution. We must be safe regardless
  // of the client. This RE is much more aggressive at extracting a protcol
  // than URL for this reason.
  const re = /^([^:\/?#.]+):.*$/;
  const match = re.exec(urlStr);
  let protocol = '';
  if (match !== null) {
    protocol = match[1];
    protocol = protocol.toLowerCase().trimLeft();
  } else {
    protocol = url.protocol;
  }
  return protocol;
}

/**
 * @param {!ParsedUrlSpec} parsedUrlSpec
 * @param {UrlErrorInAttrAdapter|UrlErrorInStylesheetAdapter} adapter
 * @param {!Context} context
 * @param {string} urlStr
 * @param {!generated.TagSpec} tagSpec
 * @param {!generated.ValidationResult} result
 */
function validateUrlAndProtocol(
    parsedUrlSpec, adapter, context, urlStr, tagSpec, result) {
  const spec = parsedUrlSpec.getSpec();
  const onlyWhitespaceRe = /^[\s\xa0]*$/;  // includes non-breaking space
  if (urlStr.match(onlyWhitespaceRe) !== null &&
      (spec.allowEmpty === null || spec.allowEmpty === false)) {
    adapter.missingUrl(context, tagSpec, result);
    return;
  }
  const url = new parse_url.URL(urlStr);
  if (!url.isValid) {
    adapter.invalidUrl(context, urlStr, tagSpec, result);
    return;
  }
  const protocol = urlProtocol(urlStr, url);
  if (protocol.length > 0 && !parsedUrlSpec.isAllowedProtocol(protocol)) {
    adapter.invalidUrlProtocol(context, protocol, tagSpec, result);
    return;
  }
  if (!spec.allowRelative && (!url.hasProtocol || url.protocol.length === 0)) {
    adapter.disallowedRelativeUrl(context, urlStr, tagSpec, result);
    return;
  }
}

/**
 * Returns true iff the passed in URL is a data: protocol URL.
 * @param {string} urlStr
 * @return {boolean}
 */
function isDataUrl(urlStr) {
  const url = new parse_url.URL(urlStr);
  return urlProtocol(urlStr, url) == 'data';
}

/**
 * Helper method for validateNonTemplateAttrValueAgainstSpec.
 * @param {ParsedValueProperties} parsedValueProperties
 * @param {!Context} context
 * @param {!parserInterface.ParsedAttr} attr
 * @param {!generated.TagSpec} tagSpec
 * @param {!generated.ValidationResult} result
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
      context.addError(
          generated.ValidationError.Code.DISALLOWED_PROPERTY_IN_ATTR_VALUE,
          context.getLineCol(),
          /* params */[name, attr.name, getTagDescriptiveName(tagSpec)],
          getTagSpecUrl(tagSpec), result);
      continue;
    }
    const propertySpec = valuePropertyByName[name];
    if (propertySpec.value !== null) {
      if (propertySpec.value !== value.trim().toLowerCase()) {
        context.addError(
            generated.ValidationError.Code.INVALID_PROPERTY_VALUE_IN_ATTR_VALUE,
            context.getLineCol(),
            /* params */
            [name, attr.name, getTagDescriptiveName(tagSpec), value],
            getTagSpecUrl(tagSpec), result);
      }
    } else if (propertySpec.valueDouble !== null) {
      if (parseFloat(value) !== propertySpec.valueDouble) {
        context.addError(
            generated.ValidationError.Code.INVALID_PROPERTY_VALUE_IN_ATTR_VALUE,
            context.getLineCol(),
            /* params */
            [name, attr.name, getTagDescriptiveName(tagSpec), value],
            getTagSpecUrl(tagSpec), result);
      }
    }
  }
  const notSeen = subtractDiff(
      parsedValueProperties.getMandatoryValuePropertyNames(), names);
  for (const name of notSeen) {
    context.addError(
        generated.ValidationError.Code
            .MANDATORY_PROPERTY_MISSING_FROM_ATTR_VALUE,
        context.getLineCol(),
        /* params */[name, attr.name, getTagDescriptiveName(tagSpec)],
        getTagSpecUrl(tagSpec), result);
  }
}

/**
 * This is the main validation procedure for attributes, operating with a
 * ParsedAttrSpec instance.
 * @param {ParsedAttrSpec} parsedAttrSpec
 * @param {!Context} context
 * @param {!parserInterface.ParsedAttr} attr
 * @param {!generated.TagSpec} tagSpec
 * @param {!generated.ValidationResult} result
 */
function validateNonTemplateAttrValueAgainstSpec(
    parsedAttrSpec, context, attr, tagSpec, result) {
  // The value, value_regex, value_url, and value_properties fields are
  // treated like a oneof, but we're not using oneof because it's a feature
  // that was added after protobuf 2.5.0 (which our open-source version uses).
  // begin oneof {
  const spec = parsedAttrSpec.getSpec();
  if (spec.addValueToSet !== null) {
    let provision = new generated.ValueSetProvision;
    provision.set = spec.addValueToSet;
    provision.value = attr.value;
    result.valueSetProvisions.push(provision);
  }
  if (spec.valueOneofSet !== null) {
    let requirement = new generated.ValueSetRequirement;
    requirement.provision = new generated.ValueSetProvision;
    requirement.provision.set = spec.valueOneofSet;
    requirement.provision.value = attr.value;
    requirement.errorIfUnsatisfied = populateError(
        generated.ValidationError.Severity.ERROR,
        generated.ValidationError.Code.VALUE_SET_MISMATCH, context.getLineCol(),
        /* params */[attr.name, getTagDescriptiveName(tagSpec)],
        getTagSpecUrl(tagSpec));
    result.valueSetRequirements.push(requirement);
  }
  if (spec.value.length > 0) {
    for (const value of spec.value) {
      if (attr.value === value) {
        return;
      }
    }
    context.addError(
        generated.ValidationError.Code.INVALID_ATTR_VALUE, context.getLineCol(),
        /* params */[attr.name, getTagDescriptiveName(tagSpec), attr.value],
        getTagSpecUrl(tagSpec), result);
  } else if (spec.valueCasei.length > 0) {
    for (const value of spec.valueCasei) {
      if (attr.value.toLowerCase() === value) {
        return;
      }
    }
    context.addError(
        generated.ValidationError.Code.INVALID_ATTR_VALUE, context.getLineCol(),
        /* params */[attr.name, getTagDescriptiveName(tagSpec), attr.value],
        getTagSpecUrl(tagSpec), result);
  } else if (spec.valueRegex !== null || spec.valueRegexCasei !== null) {
    const valueRegex = (spec.valueRegex !== null) ?
        context.getRules().getFullMatchRegex(spec.valueRegex) :
        context.getRules().getFullMatchCaseiRegex(
            /** @type {number} */ (spec.valueRegexCasei));
    if (!valueRegex.test(attr.value)) {
      context.addError(
          generated.ValidationError.Code.INVALID_ATTR_VALUE,
          context.getLineCol(),
          /* params */[attr.name, getTagDescriptiveName(tagSpec), attr.value],
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
 * @param {!generated.AmpLayout.Layout} layout
 * @return {string}
 */
function getLayoutClass(layout) {
  return 'i-amphtml-layout-' + getLayoutName(layout);
}

/**
 * @param {!generated.AmpLayout.Layout} layout
 * @return {string}
 */
function getLayoutName(layout) {
  const idx = generated.AmpLayout.Layout_ValuesByIndex.indexOf(layout);
  return generated.AmpLayout.Layout_NamesByIndex[idx].toLowerCase().replace(
      '_', '-');
}

/**
 * @return {string}
 */
function getLayoutSizeDefinedClass() {
  return 'i-amphtml-layout-size-defined';
}

/**
 * @param {!generated.AmpLayout.Layout} layout
 * @return {boolean}
 */
function isLayoutSizeDefined(layout) {
  return (
      layout === generated.AmpLayout.Layout.FILL ||
      layout === generated.AmpLayout.Layout.FIXED ||
      layout === generated.AmpLayout.Layout.FIXED_HEIGHT ||
      layout === generated.AmpLayout.Layout.FLEX_ITEM ||
      layout === generated.AmpLayout.Layout.FLUID ||
      layout === generated.AmpLayout.Layout.INTRINSIC ||
      layout === generated.AmpLayout.Layout.RESPONSIVE);
}

/**
 * @param {string} layout
 * @return {!generated.AmpLayout.Layout}
 */
function parseLayout(layout) {
  if (layout === undefined) {
    return generated.AmpLayout.Layout.UNKNOWN;
  }
  const normLayout = layout.toUpperCase().replace('-', '_');
  const idx = generated.AmpLayout.Layout_NamesByIndex.indexOf(normLayout);
  if (idx === -1) {
    return generated.AmpLayout.Layout.UNKNOWN;
  }
  return generated.AmpLayout.Layout_ValuesByIndex[idx];
}

/**
 * Parses a width or height layout attribute, for the determining the layout
 * of AMP tags (e.g. <amp-img width="42px" etc.).
 */
const CssLength = class {
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
exports.CssLength = CssLength;

/**
 * Calculates the effective width from the input layout, input width and tag.
 * For certain tags it uses explicit dimensions.
 * @param {!generated.AmpLayout.Layout} inputLayout
 * @param {!CssLength} inputWidth
 * @param {string} tagName
 * @return {!CssLength}
 */
function CalculateWidthForTag(inputLayout, inputWidth, tagName) {
  if ((inputLayout === generated.AmpLayout.Layout.UNKNOWN ||
       inputLayout === generated.AmpLayout.Layout.FIXED) &&
      !inputWidth.isSet) {
    if (tagName === 'AMP-ANALYTICS' || tagName === 'AMP-PIXEL') {
      return new CssLength(
          '1px', /* allowAuto */ false, /* allowFluid */ false);
    }
    if (tagName === 'AMP-SOCIAL-SHARE') {
      return new CssLength(
          '60px', /* allowAuto */ false, /* allowFluid */ false);
    }
  }
  return inputWidth;
}

/**
 * Calculates the effective width from the input layout and input width.
 * This involves considering that some elements, such as amp-audio and
 * amp-pixel, have natural dimensions (browser or implementation-specific
 * defaults for width / height).
 * @param {!generated.AmpLayout} spec
 * @param {!generated.AmpLayout.Layout} inputLayout
 * @param {!CssLength} inputWidth
 * @return {!CssLength}
 */
function CalculateWidth(spec, inputLayout, inputWidth) {
  if ((inputLayout === generated.AmpLayout.Layout.UNKNOWN ||
       inputLayout === generated.AmpLayout.Layout.FIXED) &&
      !inputWidth.isSet && spec.definesDefaultWidth) {
    return new CssLength('1px', /* allowAuto */ false, /* allowFluid */ false);
  }
  return inputWidth;
}

/**
 * Calculates the effective height from the input layout, input height and
 * tag. For certain tags it uses explicit dimensions.
 * @param {!generated.AmpLayout.Layout} inputLayout
 * @param {!CssLength} inputHeight
 * @param {string} tagName
 * @return {!CssLength}
 */
function CalculateHeightForTag(inputLayout, inputHeight, tagName) {
  if ((inputLayout === generated.AmpLayout.Layout.UNKNOWN ||
       inputLayout === generated.AmpLayout.Layout.FIXED ||
       inputLayout === generated.AmpLayout.Layout.FIXED_HEIGHT) &&
      !inputHeight.isSet) {
    if (tagName === 'AMP-ANALYTICS' || tagName === 'AMP-PIXEL') {
      return new CssLength(
          '1px', /* allowAuto */ false, /* allowFluid */ false);
    }
    if (tagName === 'AMP-SOCIAL-SHARE') {
      return new CssLength(
          '44px', /* allowAuto */ false, /* allowFluid */ false);
    }
  }
  return inputHeight;
}

/**
 * Calculates the effective height from input layout and input height.
 * @param {!generated.AmpLayout} spec
 * @param {!generated.AmpLayout.Layout} inputLayout
 * @param {!CssLength} inputHeight
 * @return {!CssLength}
 */
function CalculateHeight(spec, inputLayout, inputHeight) {
  if ((inputLayout === generated.AmpLayout.Layout.UNKNOWN ||
       inputLayout === generated.AmpLayout.Layout.FIXED ||
       inputLayout === generated.AmpLayout.Layout.FIXED_HEIGHT) &&
      !inputHeight.isSet && spec.definesDefaultHeight) {
    return new CssLength('1px', /* allowAuto */ false, /* allowFluid */ false);
  }
  return inputHeight;
}

/**
 * Calculates the layout; this depends on the width / height
 * calculation above. It happens last because web designers often make
 * fixed-sized mocks first and then the layout determines how things
 * will change for different viewports / devices / etc.
 * @param {!generated.AmpLayout.Layout} inputLayout
 * @param {!CssLength} width
 * @param {!CssLength} height
 * @param {?string} sizesAttr
 * @param {?string} heightsAttr
 * @return {!generated.AmpLayout.Layout}
 */
function CalculateLayout(inputLayout, width, height, sizesAttr, heightsAttr) {
  if (inputLayout !== generated.AmpLayout.Layout.UNKNOWN) {
    return inputLayout;
  } else if (!width.isSet && !height.isSet) {
    return generated.AmpLayout.Layout.CONTAINER;
  } else if (
      (height.isSet && height.isFluid) || (width.isSet && width.isFluid)) {
    return generated.AmpLayout.Layout.FLUID;
  } else if (height.isSet && (!width.isSet || width.isAuto)) {
    return generated.AmpLayout.Layout.FIXED_HEIGHT;
  } else if (
      height.isSet && width.isSet &&
      ((sizesAttr !== undefined && sizesAttr !== '') ||
       (heightsAttr !== undefined && heightsAttr !== ''))) {
    return generated.AmpLayout.Layout.RESPONSIVE;
  } else {
    return generated.AmpLayout.Layout.FIXED;
  }
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
 * @param {!generated.AttrSpec.DispatchKeyType} dispatchKeyType
 * @param {string} attrName
 * @param {string} attrValue
 * @param {string} mandatoryParent may be set to "$NOPARENT"
 * @return {string} dispatch key
 */
function makeDispatchKey(
    dispatchKeyType, attrName, attrValue, mandatoryParent) {
  switch (dispatchKeyType) {
    case generated.AttrSpec.DispatchKeyType.NAME_DISPATCH:
      return attrName;
    case generated.AttrSpec.DispatchKeyType.NAME_VALUE_DISPATCH:
      return attrName + '\0' + attrValue;
    case generated.AttrSpec.DispatchKeyType.NAME_VALUE_PARENT_DISPATCH:
      return attrName + '\0' + attrValue + '\0' + mandatoryParent;
    case generated.AttrSpec.DispatchKeyType.NONE_DISPATCH:
    default:
      asserts.assert(false);
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
 * @param {!generated.ValidationResult} validationResult
 */
function validateParentTag(parsedTagSpec, context, validationResult) {
  const spec = parsedTagSpec.getSpec();
  if (spec.mandatoryParent !== null &&
      (spec.mandatoryParent !== context.getTagStack().parentTagName()) &&
      (spec.mandatoryParent !== context.getTagStack().parentTagSpecName())) {
    // Output a parent/child error using CSS Child Selector syntax which is
    // both succinct and should be well understood by web developers.
    context.addError(
        generated.ValidationError.Code.WRONG_PARENT_TAG, context.getLineCol(),
        /* params */
        [
          getTagDescriptiveName(spec),
          context.getTagStack().parentTagName().toLowerCase(),
          spec.mandatoryParent.toLowerCase(),
        ],
        getTagSpecUrl(spec), validationResult);
  }
}

/**
 * Validates that this tag is an allowed descendant tag type.
 * Registers new descendent constraints if they are set.
 * @param {!parserInterface.ParsedHtmlTag} encounteredTag
 * @param {!ParsedTagSpec} parsedTagSpec
 * @param {!Context} context
 * @param {!generated.ValidationResult} validationResult
 */
function validateDescendantTags(
    encounteredTag, parsedTagSpec, context, validationResult) {
  const tagStack = context.getTagStack();

  for (let ii = 0; ii < tagStack.allowedDescendantsList().length; ++ii) {
    const allowedDescendantsList = tagStack.allowedDescendantsList()[ii];
    // If the tag we're validating is not allowlisted for a specific ancestor,
    // then throw an error.
    if (!allowedDescendantsList.allowedTags.includes(
            encounteredTag.upperName())) {
      context.addError(
          generated.ValidationError.Code.DISALLOWED_TAG_ANCESTOR,
          context.getLineCol(),
          /* params */
          [
            encounteredTag.lowerName(),
            allowedDescendantsList.tagName.toLowerCase(),
          ],
          getTagSpecUrl(parsedTagSpec), validationResult);
      return;
    }
  }
}

/**
 * Validates if the 'no siblings allowed' rule exists.
 * @param {!ParsedTagSpec} parsedTagSpec
 * @param {!Context} context
 * @param {!generated.ValidationResult} validationResult
 */
function validateNoSiblingsAllowedTags(
    parsedTagSpec, context, validationResult) {
  const spec = parsedTagSpec.getSpec();
  const tagStack = context.getTagStack();

  if (spec.siblingsDisallowed && tagStack.parentChildCount() > 0) {
    context.addError(
        generated.ValidationError.Code.TAG_NOT_ALLOWED_TO_HAVE_SIBLINGS,
        context.getLineCol(),
        /* params */
        [spec.tagName.toLowerCase(), tagStack.parentTagName().toLowerCase()],
        getTagSpecUrl(spec), validationResult);
  }

  if (tagStack.parentHasChildWithNoSiblingRule() &&
      tagStack.parentChildCount() > 0) {
    context.addError(
        generated.ValidationError.Code.TAG_NOT_ALLOWED_TO_HAVE_SIBLINGS,
        tagStack.parentOnlyChildErrorLineCol(),
        /* params */
        [
          tagStack.parentOnlyChildTagName().toLowerCase(),
          tagStack.parentTagName().toLowerCase(),
        ],
        getTagSpecUrl(spec), validationResult);
  }
}

/**
 * Validates if the 'last child' rule exists.
 * @param {!Context} context
 * @param {!generated.ValidationResult} validationResult
 */
function validateLastChildTags(context, validationResult) {
  const tagStack = context.getTagStack();

  if (tagStack.parentHasChildWithLastChildRule()) {
    context.addError(
        generated.ValidationError.Code.MANDATORY_LAST_CHILD_TAG,
        tagStack.parentLastChildErrorLineCol(),
        /* params */
        [
          tagStack.parentLastChildTagName().toLowerCase(),
          tagStack.parentTagName().toLowerCase(),
        ],
        tagStack.parentLastChildUrl(), validationResult);
  }
}

/**
 * If this tag requires an extension and we have processed all extensions,
 * report an error if that extension has not been loaded.
 * @param {!ParsedTagSpec} parsedTagSpec
 * @param {!Context} context
 * @param {!generated.ValidationResult} validationResult
 */
function validateRequiredExtensions(parsedTagSpec, context, validationResult) {
  const tagSpec = parsedTagSpec.getSpec();
  const extensionsCtx = context.getExtensions();
  for (const requiredExtension of tagSpec.requiresExtension) {
    if (!extensionsCtx.isExtensionLoaded(requiredExtension)) {
      context.addError(
          generated.ValidationError.Code.MISSING_REQUIRED_EXTENSION,
          context.getLineCol(),
          /* params */
          [getTagDescriptiveName(parsedTagSpec.getSpec()), requiredExtension],
          getTagSpecUrl(parsedTagSpec), validationResult);
    }
  }
}

/**
 * If this attribute requires an extension and we have processed all
 * extensions, report an error if that extension has not been loaded.
 * @param {!ParsedAttrSpec} parsedAttrSpec
 * @param {!Context} context
 * @param {!generated.ValidationResult} validationResult
 */
function validateAttrRequiredExtensions(
    parsedAttrSpec, context, validationResult) {
  const attrSpec = parsedAttrSpec.getSpec();
  const extensionsCtx = context.getExtensions();
  for (const requiredExtension of attrSpec.requiresExtension) {
    if (!extensionsCtx.isExtensionLoaded(requiredExtension)) {
      context.addError(
          generated.ValidationError.Code.ATTR_MISSING_REQUIRED_EXTENSION,
          context.getLineCol(),
          /* params */
          [attrSpec.name, requiredExtension],
          /* specUrl */ '', validationResult);
    }
  }
}

/**
 * Check for duplicates of tags that should be unique, reporting errors for
 * the second instance of each unique tag.
 * @param {!ParsedTagSpec} parsedTagSpec
 * @param {!Context} context
 * @param {!generated.ValidationResult} validationResult
 */
function validateUniqueness(parsedTagSpec, context, validationResult) {
  const tagSpec = parsedTagSpec.getSpec();
  if (tagSpec.unique &&
      context.getTagspecsValidated().hasOwnProperty(parsedTagSpec.id())) {
    context.addError(
        generated.ValidationError.Code.DUPLICATE_UNIQUE_TAG,
        context.getLineCol(),
        /* params */[getTagDescriptiveName(tagSpec)],
        getTagSpecUrl(parsedTagSpec), validationResult);
  }
}

/**
 * Considering that reference points could be defined by both reference
 * points and regular tag specs, check that we don't have matchers assigned
 * from both, there can be only one.
 * @param {?ParsedTagSpec} refPointSpec
 * @param {?ParsedTagSpec} tagSpec
 * @param {!Context} context
 * @param {!generated.ValidationResult} validationResult
 */
function checkForReferencePointCollision(
    refPointSpec, tagSpec, context, validationResult) {
  if (refPointSpec === null || !refPointSpec.hasReferencePoints()) {
    return;
  }
  if (tagSpec === null || !tagSpec.hasReferencePoints()) {
    return;
  }
  context.addError(
      generated.ValidationError.Code.TAG_REFERENCE_POINT_CONFLICT,
      context.getLineCol(),
      /* params */
      [
        getTagDescriptiveName(tagSpec.getSpec()),
        refPointSpec.getReferencePoints().parentTagSpecName(),
      ],
      refPointSpec.getReferencePoints().parentSpecUrl(), validationResult);
}

/**
 * Validates if the tag ancestors satisfied the spec.
 * @param {!ParsedTagSpec} parsedTagSpec
 * @param {!Context} context
 * @param {!generated.ValidationResult} validationResult
 */
function validateAncestorTags(parsedTagSpec, context, validationResult) {
  const spec = parsedTagSpec.getSpec();
  if (spec.mandatoryAncestor !== null) {
    const mandatoryAncestor = /** @type {string} */ (spec.mandatoryAncestor);
    if (!context.getTagStack().hasAncestor(mandatoryAncestor)) {
      if (spec.mandatoryAncestorSuggestedAlternative !== null) {
        context.addError(
            generated.ValidationError.Code.MANDATORY_TAG_ANCESTOR_WITH_HINT,
            context.getLineCol(),
            /* params */
            [
              getTagDescriptiveName(spec),
              mandatoryAncestor.toLowerCase(),
              spec.mandatoryAncestorSuggestedAlternative.toLowerCase(),
            ],
            getTagSpecUrl(spec), validationResult);
      } else {
        context.addError(
            generated.ValidationError.Code.MANDATORY_TAG_ANCESTOR,
            context.getLineCol(),
            /* params */
            [getTagDescriptiveName(spec), mandatoryAncestor.toLowerCase()],
            getTagSpecUrl(spec), validationResult);
      }
      return;
    }
  }
  for (const disallowedAncestor of spec.disallowedAncestor) {
    if (context.getTagStack().hasAncestor(disallowedAncestor)) {
      context.addError(
          generated.ValidationError.Code.DISALLOWED_TAG_ANCESTOR,
          context.getLineCol(),
          /* params */
          [getTagDescriptiveName(spec), disallowedAncestor.toLowerCase()],
          getTagSpecUrl(spec), validationResult);
      return;
    }
  }
}

/**
 * Helper method for validateLayout.
 * Validates the server-side rendering related attributes for the given
 * layout.
 * @param {!generated.TagSpec} spec
 * @param {!parserInterface.ParsedHtmlTag} encounteredTag
 * @param {!generated.AmpLayout.Layout} inputLayout
 * @param {!CssLength} inputWidth
 * @param {!CssLength} inputHeight
 * @param {string} sizesAttr
 * @param {string} heightsAttr
 * @param {!Context} context
 * @param {!generated.ValidationResult} result
 */
function validateSsrLayout(
    spec, encounteredTag, inputLayout, inputWidth, inputHeight, sizesAttr,
    heightsAttr, context, result) {
  // Only applies to transformed AMP and custom elements (<amp-...>).
  if (!context.isTransformed() ||
      !googString./*OK*/ startsWith(encounteredTag.lowerName(), 'amp-')) {
    return;
  }

  // calculate effective ssr layout
  const width =
      CalculateWidthForTag(inputLayout, inputWidth, encounteredTag.upperName());
  const height = CalculateHeightForTag(
      inputLayout, inputHeight, encounteredTag.upperName());
  const layout =
      CalculateLayout(inputLayout, width, height, sizesAttr, heightsAttr);

  const attrsByKey = encounteredTag.attrsByKey();

  // class attribute
  const classAttr = attrsByKey['class'];
  if (classAttr !== undefined) {
    // i-amphtml-layout-{layout_name}
    const validInternalClasses = Object.create(null);
    validInternalClasses[getLayoutClass(layout)] = 0;
    if (isLayoutSizeDefined(layout)) {
      // i-amphtml-layout-size-defined
      validInternalClasses[getLayoutSizeDefinedClass()] = 0;
    }
    const classes = classAttr.split(/[\s+]/);
    for (const classToken of classes) {
      if (googString./*OK*/ startsWith(classToken, 'i-amphtml-') &&
          !(classToken in validInternalClasses)) {
        context.addError(
            generated.ValidationError.Code.INVALID_ATTR_VALUE,
            context.getLineCol(),
            /* params */['class', getTagDescriptiveName(spec), classAttr],
            getTagSpecUrl(spec), result);
      }
    }
  }

  // i-amphtml-layout attribute
  const ssrAttr = attrsByKey['i-amphtml-layout'];
  if (ssrAttr !== undefined) {
    const layoutName = getLayoutName(layout);
    if (layoutName !== ssrAttr.toLowerCase()) {
      context.addError(
          generated.ValidationError.Code.ATTR_VALUE_REQUIRED_BY_LAYOUT,
          context.getLineCol(),
          /* params */
          [
            ssrAttr,
            'i-amphtml-layout',
            getTagDescriptiveName(spec),
            layoutName.toUpperCase(),
            layoutName,
          ],
          getTagSpecUrl(spec), result);
    }
  }
}

/**
 * Validates the layout for the given tag. This involves checking the
 * layout, width, height, sizes attributes with AMP specific logic.
 * @param {!ParsedTagSpec} parsedTagSpec
 * @param {!Context} context
 * @param {!parserInterface.ParsedHtmlTag} encounteredTag
 * @param {!generated.ValidationResult} result
 */
function validateLayout(parsedTagSpec, context, encounteredTag, result) {
  const spec = parsedTagSpec.getSpec();
  asserts.assert(spec.ampLayout !== null);

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
       attrValueHasTemplateSyntax(heightsAttr))) {
    return;
  }

  // Parse the input layout attributes which we found for this tag.
  const inputLayout = parseLayout(layoutAttr);
  if (layoutAttr !== undefined &&
      inputLayout === generated.AmpLayout.Layout.UNKNOWN) {
    context.addError(
        generated.ValidationError.Code.INVALID_ATTR_VALUE, context.getLineCol(),
        /* params */['layout', getTagDescriptiveName(spec), layoutAttr],
        getTagSpecUrl(spec), result);
    return;
  }
  const inputWidth = new CssLength(
      widthAttr, /* allowAuto */ true,
      /* allowFluid */ inputLayout === generated.AmpLayout.Layout.FLUID);
  if (!inputWidth.isValid) {
    context.addError(
        generated.ValidationError.Code.INVALID_ATTR_VALUE, context.getLineCol(),
        /* params */['width', getTagDescriptiveName(spec), widthAttr],
        getTagSpecUrl(spec), result);
    return;
  }
  const inputHeight = new CssLength(
      heightAttr, /* allowAuto */ true,
      /* allowFluid */ inputLayout === generated.AmpLayout.Layout.FLUID);
  if (!inputHeight.isValid) {
    context.addError(
        generated.ValidationError.Code.INVALID_ATTR_VALUE, context.getLineCol(),
        /* params */['height', getTagDescriptiveName(spec), heightAttr],
        getTagSpecUrl(spec), result);
    return;
  }

  // Now calculate the effective layout attributes.
  const width = CalculateWidth(spec.ampLayout, inputLayout, inputWidth);
  const height = CalculateHeight(spec.ampLayout, inputLayout, inputHeight);
  const layout =
      CalculateLayout(inputLayout, width, height, sizesAttr, heightsAttr);

  // Validate for transformed AMP the server-side rendering layout.
  validateSsrLayout(
      spec, encounteredTag, inputLayout, inputWidth, inputHeight, sizesAttr,
      heightsAttr, context, result);

  // Only FLEX_ITEM allows for height to be set to auto.
  if (height.isAuto && layout !== generated.AmpLayout.Layout.FLEX_ITEM) {
    context.addError(
        generated.ValidationError.Code.INVALID_ATTR_VALUE, context.getLineCol(),
        /* params */['height', getTagDescriptiveName(spec), heightAttr],
        getTagSpecUrl(spec), result);
    return;
  }

  // Does the tag support the computed layout?
  if (spec.ampLayout.supportedLayouts.indexOf(layout) === -1) {
    const code = layoutAttr === undefined ?
        generated.ValidationError.Code.IMPLIED_LAYOUT_INVALID :
        generated.ValidationError.Code.SPECIFIED_LAYOUT_INVALID;
    // Special case. If no layout related attributes were provided, this
    // implies the CONTAINER layout. However, telling the user that the
    // implied layout is unsupported for this tag is confusing if all they
    // need is to provide width and height in, for example, the common case of
    // creating an AMP-IMG without specifying dimensions. In this case, we
    // emit a less correct, but simpler error message that could be more
    // useful to the average user.
    if (code === generated.ValidationError.Code.IMPLIED_LAYOUT_INVALID &&
        layout == generated.AmpLayout.Layout.CONTAINER &&
        spec.ampLayout.supportedLayouts.indexOf(
            generated.AmpLayout.Layout.RESPONSIVE) !== -1) {
      context.addError(
          generated.ValidationError.Code.MISSING_LAYOUT_ATTRIBUTES,
          context.getLineCol(),
          /*params=*/[getTagDescriptiveName(spec)], getTagSpecUrl(spec),
          result);
      return;
    }
    context.addError(
        code, context.getLineCol(),
        /* params */[layout, getTagDescriptiveName(spec)], getTagSpecUrl(spec),
        result);
    return;
  }
  // FIXED, FIXED_HEIGHT, INTRINSIC, RESPONSIVE must have height set.
  if ((layout === generated.AmpLayout.Layout.FIXED ||
       layout === generated.AmpLayout.Layout.FIXED_HEIGHT ||
       layout === generated.AmpLayout.Layout.INTRINSIC ||
       layout === generated.AmpLayout.Layout.RESPONSIVE) &&
      !height.isSet) {
    context.addError(
        generated.ValidationError.Code.MANDATORY_ATTR_MISSING,
        context.getLineCol(),
        /* params */['height', getTagDescriptiveName(spec)],
        getTagSpecUrl(spec), result);
    return;
  }
  // For FIXED_HEIGHT if width is set it must be auto.
  if (layout === generated.AmpLayout.Layout.FIXED_HEIGHT && width.isSet &&
      !width.isAuto) {
    context.addError(
        generated.ValidationError.Code.ATTR_VALUE_REQUIRED_BY_LAYOUT,
        context.getLineCol(),
        /* params */
        [
          widthAttr, 'width', getTagDescriptiveName(spec), 'FIXED_HEIGHT',
          'auto'
        ],
        getTagSpecUrl(spec), result);
    return;
  }
  // FIXED, INTRINSIC, RESPONSIVE must have width set and not be auto.
  if (layout === generated.AmpLayout.Layout.FIXED ||
      layout === generated.AmpLayout.Layout.INTRINSIC ||
      layout === generated.AmpLayout.Layout.RESPONSIVE) {
    if (!width.isSet) {
      context.addError(
          generated.ValidationError.Code.MANDATORY_ATTR_MISSING,
          context.getLineCol(),
          /* params */['width', getTagDescriptiveName(spec)],
          getTagSpecUrl(spec), result);
      return;
    } else if (width.isAuto) {
      context.addError(
          generated.ValidationError.Code.INVALID_ATTR_VALUE,
          context.getLineCol(),
          /* params */['width', getTagDescriptiveName(spec), 'auto'],
          getTagSpecUrl(spec), result);
      return;
    }
  }
  // INTRINSIC, RESPONSIVE must have same units for height and width.
  if ((layout === generated.AmpLayout.Layout.INTRINSIC ||
       layout === generated.AmpLayout.Layout.RESPONSIVE) &&
      width.unit !== height.unit) {
    context.addError(
        generated.ValidationError.Code.INCONSISTENT_UNITS_FOR_WIDTH_AND_HEIGHT,
        context.getLineCol(),
        /* params */[getTagDescriptiveName(spec), width.unit, height.unit],
        getTagSpecUrl(spec), result);
    return;
  }
  // heights attribute is only allowed for RESPONSIVE layout.
  if (heightsAttr !== undefined &&
      layout !== generated.AmpLayout.Layout.RESPONSIVE) {
    const code = layoutAttr === undefined ?
        generated.ValidationError.Code.ATTR_DISALLOWED_BY_IMPLIED_LAYOUT :
        generated.ValidationError.Code.ATTR_DISALLOWED_BY_SPECIFIED_LAYOUT;
    context.addError(
        code, context.getLineCol(),
        /* params */['heights', getTagDescriptiveName(spec), layout],
        getTagSpecUrl(spec), result);
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
 * @param {!generated.ValidationResult} result
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
  // If explicitAttrsOnly is true then do not allow data- attributes by
  // default. They must be explicitly added to the tagSpec.
  const dataAttrRe = /^data-[A-Za-z0-9-_:.]*$/;
  if (!parsedTagSpec.getSpec().explicitAttrsOnly &&
      (attrName.match(dataAttrRe) !== null)) {
    return;
  }

  // At this point, it's an error either way, but we try to give a
  // more specific error in the case of Mustache template characters.
  if (attrName.indexOf('{{') !== -1) {
    context.addError(
        generated.ValidationError.Code.TEMPLATE_IN_ATTR_NAME,
        context.getLineCol(),
        /* params */[attrName, getTagDescriptiveName(parsedTagSpec.getSpec())],
        context.getRules().getTemplateSpecUrl(), result);
  } else {
    context.addError(
        generated.ValidationError.Code.DISALLOWED_ATTR, context.getLineCol(),
        /* params */[attrName, getTagDescriptiveName(parsedTagSpec.getSpec())],
        getTagSpecUrl(parsedTagSpec), result);
  }
}

/**
 * Specific checks for attribute values descending from a template tag.
 * @param {!ParsedTagSpec} parsedTagSpec
 * @param {!Context} context
 * @param {!parserInterface.ParsedAttr} attr
 * @param {!generated.ValidationResult} result
 */
function validateAttrValueBelowTemplateTag(
    parsedTagSpec, context, attr, result) {
  if (attrValueHasUnescapedTemplateSyntax(attr.value)) {
    const spec = parsedTagSpec.getSpec();
    context.addError(
        generated.ValidationError.Code.UNESCAPED_TEMPLATE_IN_ATTR_VALUE,
        context.getLineCol(),
        /* params */[attr.name, getTagDescriptiveName(spec), attr.value],
        context.getRules().getTemplateSpecUrl(), result);
  } else if (attrValueHasPartialsTemplateSyntax(attr.value)) {
    const spec = parsedTagSpec.getSpec();
    context.addError(
        generated.ValidationError.Code.TEMPLATE_PARTIAL_IN_ATTR_VALUE,
        context.getLineCol(),
        /* params */[attr.name, getTagDescriptiveName(spec), attr.value],
        context.getRules().getTemplateSpecUrl(), result);
  }
}

/**
 * Determines the name of the attribute where you find the name of this sort
 * of extension.  Typically, this will return 'custom-element'.
 *
 * @param {!generated.ExtensionSpec} extensionSpec
 * @return {string}
 */
function getExtensionNameAttribute(extensionSpec) {
  switch (extensionSpec.extensionType) {
    case generated.ExtensionSpec.ExtensionType.CUSTOM_TEMPLATE:
      return 'custom-template';
    case generated.ExtensionSpec.ExtensionType.HOST_SERVICE:
      return 'host-service';
    default:
      return 'custom-element';
  }
}

/**
 * Validates whether an encountered attribute is validated by an
 * generated.ExtensionSpec. ExtensionSpec's validate the 'custom-element',
 * 'custom-template', and 'src' attributes. If an error is found, it is added
 * to the |result|. The return value indicates whether or not the provided
 * attribute is explained by this validation function.
 * @param {!generated.TagSpec} tagSpec
 * @param {!Context} context
 * @param {!parserInterface.ParsedAttr} attr
 * @param {!generated.ValidationResult} result
 * @return {boolean}
 */
function validateAttributeInExtension(tagSpec, context, attr, result) {
  asserts.assert(tagSpec.extensionSpec !== null);

  const {extensionSpec} = tagSpec;
  // TagSpecs with extensions will only be evaluated if their dispatch_key
  // matches, which is based on this
  // custom-element/custom-template/host-service field attribute value. The
  // dispatch key matching is case-insensitive for faster lookups, so it still
  // possible for the attribute value to not match if it contains upper-case
  // letters.
  if (extensionSpec !== null &&
      getExtensionNameAttribute(extensionSpec) === attr.name) {
    if (extensionSpec.name !== attr.value) {
      asserts.assert(extensionSpec.name === attr.value.toLowerCase());
      return false;
    }
    return true;
  } else if (attr.name === 'src') {
    const srcUrlRe =
        /^https:\/\/cdn\.ampproject\.org(?:\/lts)?\/v0\/(amp-[a-z0-9-]*)-([a-z0-9.]*)\.js$/;
    const reResult = srcUrlRe.exec(attr.value);
    // If the src URL matches this regex and the base name of the file matches
    // the extension, look to see if the version matches.
    if (reResult !== null && reResult[1] === extensionSpec.name) {
      const encounteredVersion = reResult[2];
      if (extensionSpec.deprecatedVersion.indexOf(encounteredVersion) !== -1) {
        context.addWarning(
            generated.ValidationError.Code.WARNING_EXTENSION_DEPRECATED_VERSION,
            context.getLineCol(),
            /* params */[extensionSpec.name, encounteredVersion],
            getTagSpecUrl(tagSpec), result);
        return true;
      }
      if (extensionSpec.version.indexOf(encounteredVersion) !== -1) {
        return true;
      }
    }
    context.addError(
        generated.ValidationError.Code.INVALID_ATTR_VALUE, context.getLineCol(),
        /* params */[attr.name, getTagDescriptiveName(tagSpec), attr.value],
        getTagSpecUrl(tagSpec), result);
    return true;
  }
  return false;
}

/**
 * Validates that the reserved `i-amphtml-` prefix is not used in a class
 * token.
 * @param {!parserInterface.ParsedAttr} attr
 * @param {!generated.TagSpec} tagSpec
 * @param {!Context} context
 * @param {!generated.ValidationResult} result
 */
function validateClassAttr(attr, tagSpec, context, result) {
  const re = /(^|[\t\n\f\r ])i-amphtml-/;
  if (re.test(attr.value)) {
    context.addError(
        generated.ValidationError.Code.INVALID_ATTR_VALUE, context.getLineCol(),
        /* params */[attr.name, getTagDescriptiveName(tagSpec), attr.value],
        'https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/style_pages/#disallowed-styles',
        result);
  }
}

/**
 * Validates that LTS is used for either all script sources or none.
 * @param {!parserInterface.ParsedAttr} srcAttr
 * @param {!generated.TagSpec} tagSpec
 * @param {!Context} context
 * @param {!generated.ValidationResult} result
 */
function validateScriptSrcAttr(srcAttr, tagSpec, context, result) {
  if (context.getScriptReleaseVersion() === ScriptReleaseVersion.UNKNOWN)
    return;

  const scriptReleaseVersion = IsLtsScriptUrl(srcAttr.value) ?
      ScriptReleaseVersion.LTS :
      ScriptReleaseVersion.STANDARD;

  if (context.getScriptReleaseVersion() != scriptReleaseVersion) {
    const specName = tagSpec.extensionSpec !== null ?
        tagSpec.extensionSpec.name :
        tagSpec.specName;
    context.addError(
        scriptReleaseVersion == ScriptReleaseVersion.LTS ?
            generated.ValidationError.Code.LTS_SCRIPT_AFTER_NON_LTS :
            generated.ValidationError.Code.NON_LTS_SCRIPT_AFTER_LTS,
        context.getLineCol(),
        /*params=*/[specName],

        'https://amp.dev/documentation/guides-and-tutorials/learn/spec/' +
            'amphtml#required-markup',
        result);
  }
}

/**
 * Helper method for ValidateAttributes.
 * @param {!ParsedAttrSpec} parsedAttrSpec
 * @param {!Context} context
 * @param {!generated.TagSpec} tagSpec
 * @param {string} attrName
 * @param {string} attrValue
 * @param {!ValidateTagResult} result
 */
function validateAttrCss(
    parsedAttrSpec, context, tagSpec, attrName, attrValue, result) {
  /** @type {number} */
  const attrByteLen = htmlparser.byteLength(attrValue);
  // Track the number of CSS bytes. If this tagspec is selected as the best
  // match, this count will be added to the overall document inline style byte
  // count for determining if that byte count has been exceeded.
  /** @type {number} */
  result.inlineStyleCssBytes = attrByteLen;

  /** @type {!Array<!tokenize_css.ErrorToken>} */
  const cssErrors = [];
  // The line/col we are passing in here is not the actual start point in the
  // text for the attribute string. It's the start point for the tag. This
  // means that any line/col values for tokens are also similarly offset
  // incorrectly. For error messages, this means we just use the line/col of
  // the tag instead of the token so as to minimize confusion. This could be
  // improved further.
  // TODO(https://github.com/ampproject/amphtml/issues/27507): Compute
  // attribute offsets for use in CSS error messages.
  /** @type {!Array<!tokenize_css.Token>} */
  const tokenList = tokenize_css.tokenize(
      attrValue, context.getLineCol().getLine(), context.getLineCol().getCol(),
      cssErrors);

  /** @type {!Array<!parse_css.Declaration>} */
  const declarations = parse_css.parseInlineStyle(tokenList, cssErrors);

  for (const errorToken of cssErrors) {
    // Override the first parameter with the name of this style tag.
    const {params} = errorToken;
    // Override the first parameter with the name of this style tag.
    params[0] = getTagDescriptiveName(tagSpec);
    context.addError(
        errorToken.code, context.getLineCol(), params, /* url */ '',
        result.validationResult);
  }

  // If there were errors parsing, exit from validating further.
  if (cssErrors.length > 0) {
    return;
  }

  /** @type {?ParsedDocCssSpec} */
  const maybeSpec = context.matchingDocCssSpec();
  if (maybeSpec) {
    // Determine if we've exceeded the maximum bytes per inline style
    // requirements.
    if (maybeSpec.spec().maxBytesPerInlineStyle >= 0 &&
        attrByteLen > maybeSpec.spec().maxBytesPerInlineStyle) {
      if (maybeSpec.spec().maxBytesIsWarning) {
        context.addWarning(
            generated.ValidationError.Code.INLINE_STYLE_TOO_LONG,
            context.getLineCol(), /* params */
            [
              getTagDescriptiveName(tagSpec), attrByteLen.toString(),
              maybeSpec.spec().maxBytesPerInlineStyle.toString()
            ],
            maybeSpec.spec().maxBytesSpecUrl, result.validationResult);
      } else {
        context.addError(
            generated.ValidationError.Code.INLINE_STYLE_TOO_LONG,
            context.getLineCol(), /* params */
            [
              getTagDescriptiveName(tagSpec), attrByteLen.toString(),
              maybeSpec.spec().maxBytesPerInlineStyle.toString()
            ],
            maybeSpec.spec().maxBytesSpecUrl, result.validationResult);
      }
    }

    // Loop over the declarations found in the document, verify that they are
    // in the allowed list for this DocCssSpec, and have allowed values if
    // relevant.
    for (const declaration of declarations) {
      // Allowed declarations vary by context. SVG has its own set of CSS
      // declarations not supported generally in HTML.
      const cssDeclaration = parsedAttrSpec.getSpec().valueDocSvgCss === true ?
          maybeSpec.cssDeclarationSvgByName(declaration.name) :
          maybeSpec.cssDeclarationByName(declaration.name);
      // If there is no matching declaration in the rules, then this
      // declaration is not allowed.
      if (cssDeclaration === null) {
        context.addError(
            generated.ValidationError.Code.DISALLOWED_PROPERTY_IN_ATTR_VALUE,
            context.getLineCol(), /* params */
            [declaration.name, attrName, getTagDescriptiveName(tagSpec)],
            context.getRules().getStylesSpecUrl(), result.validationResult);
        // Don't emit additional errors for this declaration.
        continue;
      } else if (cssDeclaration.valueCasei.length > 0) {
        let hasValidValue = false;
        const firstIdent = declaration.firstIdent();
        for (const value of cssDeclaration.valueCasei) {
          if (firstIdent.toLowerCase() == value) {
            hasValidValue = true;
            break;
          }
        }
        if (!hasValidValue) {
          // Declaration value not allowed.
          context.addError(
              generated.ValidationError.Code
                  .CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE,
              context.getLineCol(), /* params */
              [getTagDescriptiveName(tagSpec), declaration.name, firstIdent],
              context.getRules().getStylesSpecUrl(), result.validationResult);
        }
      }
      if (!maybeSpec.spec().allowImportant) {
        if (declaration.important)
          // TODO(gregable): Use a more specific error message for
          // `!important` errors.
          context.addError(
              generated.ValidationError.Code.INVALID_ATTR_VALUE,
              context.getLineCol(),
              /* params */
              [attrName, getTagDescriptiveName(tagSpec), 'CSS !important'],
              context.getRules().getStylesSpecUrl(), result.validationResult);
      }
      /** @type {!Array<!tokenize_css.ErrorToken>} */
      let urlErrors = [];
      /** @type {!Array<!parse_css.ParsedCssUrl>} */
      let parsedUrls = [];
      parse_css.extractUrlsFromDeclaration(declaration, parsedUrls, urlErrors);
      for (const errorToken of urlErrors) {
        // Override the first parameter with the name of the tag.
        /** @type {!Array<string>} */
        let params = errorToken.params;
        params[0] = getTagDescriptiveName(tagSpec);
        context.addError(
            errorToken.code, context.getLineCol(), params, /* spec_url*/ '',
            result.validationResult);
      }
      if (urlErrors.length > 0) continue;
      for (const url of parsedUrls) {
        // Validate that the URL itself matches the spec.
        // Only image specs apply to inline styles. Fonts are only defined in
        // @font-face rules which we require a full stylesheet to define.
        if (maybeSpec.spec().imageUrlSpec !== null) {
          const adapter = new UrlErrorInStylesheetAdapter(
              context.getLineCol().getLine(), context.getLineCol().getCol());
          validateUrlAndProtocol(
              maybeSpec.imageUrlSpec(), adapter, context, url.utf8Url, tagSpec,
              result.validationResult);
        }
        // Subtract off URL lengths from doc-level inline style bytes, if
        // specified by the DocCssSpec.
        if (!maybeSpec.spec().urlBytesIncluded && !isDataUrl(url.utf8Url))
          result.inlineStyleCssBytes -= htmlparser.byteLength(url.utf8Url);
      }
    }
  }
}

/**
 * Helper method for ValidateAttributes.
 * @param {!ParsedAttrSpec} parsedAttrSpec
 * @param {!Context} context
 * @param {string} tagSpecName
 * @param {string} attrName
 * @param {string} attrValue
 * @param {!generated.ValidationResult} validationResult
 */
function validateAttrDeclaration(
    parsedAttrSpec, context, tagSpecName, attrName, attrValue,
    validationResult) {
  /** @type {!Array<!tokenize_css.ErrorToken>} */
  const cssErrors = [];
  // The line/col we are passing in here is not the actual start point in the
  // text for the attribute string. It's the start point for the tag. This
  // means that any line/col values for tokens are also similarly offset
  // incorrectly. For error messages, this means we just use the line/col of
  // the tag instead of the token so as to minimize confusion. This could be
  // improved further.
  // TODO(https://github.com/ampproject/amphtml/issues/27507): Compute
  // attribute offsets for use in CSS error messages.
  /** @type {!Array<!tokenize_css.Token>} */
  const tokenList = tokenize_css.tokenize(
      attrValue, context.getLineCol().getLine(), context.getLineCol().getCol(),
      cssErrors);

  /** @type {!Array<!parse_css.Declaration>} */
  const declarations = parse_css.parseInlineStyle(tokenList, cssErrors);

  for (const errorToken of cssErrors) {
    // Override the first parameter with the name of this style tag.
    const {params} = errorToken;
    // Override the first parameter with the name of this style tag.
    params[0] = tagSpecName;
    context.addError(
        errorToken.code, context.getLineCol(), params, /* url */ '',
        validationResult);
  }

  // If there were errors parsing, exit from validating further.
  if (cssErrors.length > 0) {
    return;
  }

  const cssDeclarationByName = parsedAttrSpec.getCssDeclarationByName();

  for (const declaration of declarations) {
    const declarationName =
        parse_css.stripVendorPrefix(declaration.name.toLowerCase());
    if (!(declarationName in cssDeclarationByName)) {
      // Declaration not allowed.
      context.addError(
          generated.ValidationError.Code.DISALLOWED_PROPERTY_IN_ATTR_VALUE,
          context.getLineCol(),
          /* params */[declaration.name, attrName, tagSpecName],
          context.getRules().getStylesSpecUrl(), validationResult);
    } else {
      const cssDeclaration = cssDeclarationByName[declarationName];
      if (cssDeclaration.valueCasei.length > 0) {
        let has_valid_value = false;
        const firstIdent = declaration.firstIdent();
        for (const value of cssDeclaration.valueCasei) {
          if (firstIdent.toLowerCase() === value) {
            has_valid_value = true;
            break;
          }
        }
        if (!has_valid_value) {
          // Declaration value not allowed.
          context.addError(
              generated.ValidationError.Code
                  .CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE,
              context.getLineCol(),
              /* params */[tagSpecName, declaration.name, firstIdent],
              context.getRules().getStylesSpecUrl(), validationResult);
        }
      }
    }
  }
}

/**
 * Returns true if errors reported on this tag should be suppressed, due to
 * data-ampdevmode annotations.
 * @param {!parserInterface.ParsedHtmlTag} encounteredTag
 * @param {!Context} context
 * @return {boolean}
 */
function ShouldSuppressDevModeErrors(encounteredTag, context) {
  if (!context.isDevMode()) return false;
  // Cannot suppress errors on HTML tag. The "data-ampdevmode" here is a
  // type identifier. Suppressing errors here would suppress all errors since
  // HTML is the root of the document.
  if (encounteredTag.upperName() === 'HTML') return false;
  for (const attr of encounteredTag.attrs()) {
    if (attr.name === 'data-ampdevmode') return true;
  }
  return context.getTagStack().isDevMode();
}

/**
 * Validates whether the attributes set on |encountered_tag| conform to this
 * tag specification. All mandatory attributes must appear. Only attributes
 * explicitly mentioned by this tag spec may appear.
 * Sets result->validation_result.status to FAIL if unsuccessful.
 * @param {!ParsedTagSpec} parsedTagSpec
 * @param {?ParsedTagSpec} bestMatchReferencePoint
 * @param {!Context} context
 * @param {!parserInterface.ParsedHtmlTag} encounteredTag
 * @param {!ValidateTagResult} result
 */
function validateAttributes(
    parsedTagSpec, bestMatchReferencePoint, context, encounteredTag, result) {
  const spec = parsedTagSpec.getSpec();
  if (spec.ampLayout !== null) {
    validateLayout(
        parsedTagSpec, context, encounteredTag, result.validationResult);
  }
  // For extension TagSpecs, we track if we've validated a src attribute.
  // We must have done so for the extension to be valid.
  let seenExtensionSrcAttr = false;
  const hasTemplateAncestor = context.getTagStack().hasAncestor('TEMPLATE');
  const isHtmlTag = encounteredTag.upperName() === 'HTML';
  /** @type {!Array<boolean>} */
  const mandatoryAttrsSeen = [];  // This is a set of attr ids.
  /** @type {!Array<number>} */
  const mandatoryOneofsSeen = [];  // This is small list of interned strings.
  /** @type {!Array<number>} */
  const mandatoryAnyofsSeen = [];  // This is small list of interned strings.
  /** @type {!Array<!generated.AttrSpec>} */
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
  for (const attr of encounteredTag.attrs()) {
    if (context.isTransformed()) {
      // For transformed AMP, `i-amphtml-layout` is handled within
      // validateSsrLayout, called by validateLayout above.
      if (attr.name === 'i-amphtml-layout') {
        continue;
      }
    } else if (attr.name === 'class') {
      // For non-transformed AMP, `class` must not contain 'i-amphtml-' prefix.
      validateClassAttr(attr, spec, context, result.validationResult);
    }

    // If |spec| is the runtime or an extension script, validate that LTS is
    // either used by all pages or no pages.
    if (attr.name == 'src' &&
        (IsExtensionScript(encounteredTag) ||
         IsAmpRuntimeScript(encounteredTag))) {
      validateScriptSrcAttr(attr, spec, context, result.validationResult);
    }

    if (!(attr.name in attrsByName)) {
      // The HTML tag specifies type identifiers which are validated in
      // validateHtmlTag(), so we skip them here.
      if (isHtmlTag && context.getRules().isTypeIdentifier(attr.name)) {
        continue;
      }
      // While validating a reference point, we skip attributes that
      // we don't have a spec for. They will be validated when the
      // TagSpec itself gets validated.
      if (parsedTagSpec.isReferencePoint()) {
        continue;
      }
      // On the other hand, if we did just validate a reference point for
      // this tag, we check whether that reference point covers the attribute.
      if (bestMatchReferencePoint !== null &&
          bestMatchReferencePoint.hasAttrWithName(attr.name)) {
        continue;
      }

      // If |spec| is an extension, then we ad-hoc validate 'custom-element',
      // 'custom-template', 'host-service', and 'src' attributes by calling
      // this method.  For 'src', we also keep track whether we validated it
      // this way, (seen_src_attr), since it's a mandatory attr.
      if (spec.extensionSpec !== null &&
          validateAttributeInExtension(
              spec, context, attr, result.validationResult)) {
        if (attr.name === 'src') {
          seenExtensionSrcAttr = true;
        }
        continue;
      }
      validateAttrNotFoundInSpec(
          parsedTagSpec, context, attr.name, result.validationResult);
      if (result.validationResult.status ===
          generated.ValidationResult.Status.FAIL) {
        continue;
      }
      if (hasTemplateAncestor) {
        validateAttrValueBelowTemplateTag(
            parsedTagSpec, context, attr, result.validationResult);
        if (result.validationResult.status ===
            generated.ValidationResult.Status.FAIL) {
          continue;
        }
      }
      continue;
    }
    if (hasTemplateAncestor) {
      validateAttrValueBelowTemplateTag(
          parsedTagSpec, context, attr, result.validationResult);
      if (result.validationResult.status ===
          generated.ValidationResult.Status.FAIL) {
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
    // If this attribute isn't used for these type identifiers, then error.
    if (!parsedAttrSpec.isUsedForTypeIdentifiers(
            context.getTypeIdentifiers())) {
      context.addError(
          generated.ValidationError.Code.DISALLOWED_ATTR, context.getLineCol(),
          /* params */[attr.name, getTagDescriptiveName(spec)],
          getTagSpecUrl(spec), result.validationResult);
      continue;
    }
    const attrSpec = parsedAttrSpec.getSpec();
    if (attrSpec.deprecation !== null) {
      context.addWarning(
          generated.ValidationError.Code.DEPRECATED_ATTR, context.getLineCol(),
          /* params */
          [attr.name, getTagDescriptiveName(spec), attrSpec.deprecation],
          attrSpec.deprecationUrl, result.validationResult);
      // Deprecation is only a warning, so we don't return.
    }
    if (attrSpec.requiresExtension.length > 0) {
      validateAttrRequiredExtensions(
          parsedAttrSpec, context, result.validationResult);
    }
    if (attrSpec.valueDocCss || attrSpec.valueDocSvgCss) {
      validateAttrCss(
          parsedAttrSpec, context, spec, attr.name, attr.value, result);
    } else if (attrSpec.cssDeclaration.length > 0) {
      validateAttrDeclaration(
          parsedAttrSpec, context, getTagDescriptiveName(spec), attr.name,
          attr.value, result.validationResult);
    }
    if (!hasTemplateAncestor || !attrValueHasTemplateSyntax(attr.value)) {
      validateNonTemplateAttrValueAgainstSpec(
          parsedAttrSpec, context, attr, spec, result.validationResult);
      if (result.validationResult.status ===
          generated.ValidationResult.Status.FAIL) {
        continue;
      }
    }
    if (attrSpec.disallowedValueRegex !== null) {
      const regex = context.getRules().getPartialMatchCaseiRegex(
          attrSpec.disallowedValueRegex);
      if (regex.test(attr.value)) {
        context.addError(
            generated.ValidationError.Code.INVALID_ATTR_VALUE,
            context.getLineCol(),
            /* params */[attr.name, getTagDescriptiveName(spec), attr.value],
            getTagSpecUrl(spec), result.validationResult);
        continue;
      }
    }
    if (attrSpec.mandatory) {
      mandatoryAttrsSeen[parsedAttrSpec.getId()] = true;
    }
    if (parsedTagSpec.getSpec().tagName === 'BASE' && attr.name === 'href' &&
        context.hasSeenUrl()) {
      context.addError(
          generated.ValidationError.Code.BASE_TAG_MUST_PRECEED_ALL_URLS,
          context.getLineCol(),
          /* params */[context.firstSeenUrlTagName()], getTagSpecUrl(spec),
          result.validationResult);
      continue;
    }
    const {mandatoryOneof} = attrSpec;
    if (mandatoryOneof !== null) {
      // The "at most 1" part of mandatory_oneof: mandatory_oneof
      // wants exactly one of the alternatives, so here
      // we check whether we already saw another alternative
      if (mandatoryOneofsSeen.indexOf(mandatoryOneof) !== -1) {
        context.addError(
            generated.ValidationError.Code.MUTUALLY_EXCLUSIVE_ATTRS,
            context.getLineCol(),
            /* params */
            [
              getTagDescriptiveName(spec),
              context.getRules().getInternedString(mandatoryOneof),
            ],
            getTagSpecUrl(spec), result.validationResult);
        continue;
      }
      mandatoryOneofsSeen.push(mandatoryOneof);
    }
    if (attrSpec.requiresAncestor !== null) {
      const markers = attrSpec.requiresAncestor.marker;
      let matchesMarker = false;
      for (const marker of markers) {
        if (context.getTagStack().hasAncestorMarker(marker)) {
          matchesMarker = true;
          break;
        }
      }
      if (!matchesMarker) {
        context.addError(
            generated.ValidationError.Code.DISALLOWED_ATTR,
            context.getLineCol(),
            /* params */
            [
              attr.name,
              getTagDescriptiveName(spec),
            ],
            getTagSpecUrl(spec), result.validationResult);
        continue;
      }
    }
    const {mandatoryAnyof} = attrSpec;
    if (mandatoryAnyof !== null) {
      mandatoryAnyofsSeen.push(mandatoryAnyof);
    }
    attrspecsValidated[parsedAttrSpec.getId()] = 0;
    // If the trigger does not have an if_value_regex, then proceed to add the
    // spec. If it does have an if_value_regex, then test the regex to see
    // if it should add the spec.
    if (attrSpec.trigger === null) {
      continue;
    }
    const {trigger} = attrSpec;
    if (trigger.ifValueRegex === null ||
        context.getRules()
            .getFullMatchRegex(trigger.ifValueRegex)
            .test(attr.value)) {
      triggersToCheck.push(attrSpec);
    }
  }
  if (result.validationResult.status ===
      generated.ValidationResult.Status.FAIL) {
    return;
  }
  // The "exactly 1" part of mandatory_oneof: If none of the
  // alternatives were present, we report that an attribute is missing.
  for (const mandatoryOneof of parsedTagSpec.getMandatoryOneofs()) {
    if (mandatoryOneofsSeen.indexOf(mandatoryOneof) === -1) {
      context.addError(
          generated.ValidationError.Code.MANDATORY_ONEOF_ATTR_MISSING,
          context.getLineCol(),
          /* params */
          [
            getTagDescriptiveName(spec),
            context.getRules().getInternedString(mandatoryOneof),
          ],
          getTagSpecUrl(spec), result.validationResult);
    }
  }
  // The "at least 1" part of mandatory_anyof: If none of the
  // alternatives were present, we report that an attribute is missing.
  for (const mandatoryAnyof of parsedTagSpec.getMandatoryAnyofs()) {
    if (mandatoryAnyofsSeen.indexOf(mandatoryAnyof) === -1) {
      context.addError(
          generated.ValidationError.Code.MANDATORY_ANYOF_ATTR_MISSING,
          context.getLineCol(),
          /* params */
          [
            getTagDescriptiveName(spec),
            context.getRules().getInternedString(mandatoryAnyof),
          ],
          getTagSpecUrl(spec), result.validationResult);
    }
  }
  for (const attrSpec of triggersToCheck) {
    for (const alsoRequiresAttr of attrSpec.trigger.alsoRequiresAttr) {
      if (!(alsoRequiresAttr in attrsByName)) {
        continue;
      }
      const attrId = attrsByName[alsoRequiresAttr];
      if (!attrspecsValidated.hasOwnProperty(attrId)) {
        context.addError(
            generated.ValidationError.Code.ATTR_REQUIRED_BUT_MISSING,
            context.getLineCol(),
            /* params */
            [
              context.getRules().getParsedAttrSpecs().getNameByAttrSpecId(
                  attrId),
              getTagDescriptiveName(spec),
              attrSpec.name,
            ],
            getTagSpecUrl(spec), result.validationResult);
      }
    }
  }
  const missingAttrs = [];
  for (const mandatory of parsedTagSpec.getMandatoryAttrIds()) {
    if (!mandatoryAttrsSeen.hasOwnProperty(mandatory)) {
      missingAttrs.push(
          context.getRules().getParsedAttrSpecs().getNameByAttrSpecId(
              mandatory));
    }
  }
  // Sort this list for stability across implementations.
  missingAttrs.sort();
  for (const missingAttr of missingAttrs) {
    context.addError(
        generated.ValidationError.Code.MANDATORY_ATTR_MISSING,
        context.getLineCol(),
        /* params */[missingAttr, getTagDescriptiveName(spec)],
        getTagSpecUrl(spec), result.validationResult);
  }
  // Extension specs mandate the 'src' attribute.
  if (spec.extensionSpec !== null && !seenExtensionSrcAttr) {
    context.addError(
        generated.ValidationError.Code.MANDATORY_ATTR_MISSING,
        context.getLineCol(),
        /* params */['src', getTagDescriptiveName(spec)], getTagSpecUrl(spec),
        result.validationResult);
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
     * @type {?Object<string, !Array<number>>}
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
    // Multiple TagSpecs may have the same dispatch key. These are added in
    // the order in which they are found.
    if (!(dispatchKey in this.tagSpecsByDispatch_)) {
      this.tagSpecsByDispatch_[dispatchKey] = [tagSpecId];
    } else {
      this.tagSpecsByDispatch_[dispatchKey].push(tagSpecId);
    }
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
   * corresponding tagSpecIds which are ordered by their specificity of match
   * (e.g. Name/Value/Parent, then Name/Value, and then Name).
   * @param {string} attrName
   * @param {string} attrValue
   * @param {string} mandatoryParent
   * @return {!Array<number>}
   */
  matchingDispatchKey(attrName, attrValue, mandatoryParent) {
    const tagSpecIds = [];
    if (!this.hasDispatchKeys()) {
      return tagSpecIds;
    }

    // Try first to find a key with the given parent.
    const dispatchKey = makeDispatchKey(
        generated.AttrSpec.DispatchKeyType.NAME_VALUE_PARENT_DISPATCH, attrName,
        attrValue, mandatoryParent);
    const match = this.tagSpecsByDispatch_[dispatchKey];
    if (match !== undefined) {
      tagSpecIds.push.apply(tagSpecIds, match);
    }

    // Try next to find a key that allows any parent.
    const noParentKey = makeDispatchKey(
        generated.AttrSpec.DispatchKeyType.NAME_VALUE_DISPATCH, attrName,
        attrValue, '');
    const noParentMatch = this.tagSpecsByDispatch_[noParentKey];
    if (noParentMatch !== undefined) {
      tagSpecIds.push.apply(tagSpecIds, noParentMatch);
    }

    // Try last to find a key that matches just this attribute name.
    const noValueKey = makeDispatchKey(
        generated.AttrSpec.DispatchKeyType.NAME_DISPATCH, attrName, '', '');
    const noValueMatch = this.tagSpecsByDispatch_[noValueKey];
    if (noValueMatch !== undefined) {
      tagSpecIds.push.apply(tagSpecIds, noValueMatch);
    }

    // Special case for foo=foo. We consider this a match for a dispatch key
    // of foo="" or just <tag foo>.
    if (attrName === attrValue) {
      tagSpecIds.push.apply(
          tagSpecIds, this.matchingDispatchKey(attrName, '', mandatoryParent));
    }

    return tagSpecIds;
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
 *
 * Validates the provided |tagName| with respect to a single tag
 * specification.
 * @param {!ParsedTagSpec} parsedTagSpec
 * @param {?ParsedTagSpec} bestMatchReferencePoint
 * @param {!Context} context
 * @param {!parserInterface.ParsedHtmlTag} encounteredTag
 * @return {!ValidateTagResult}
 */
function validateTagAgainstSpec(
    parsedTagSpec, bestMatchReferencePoint, context, encounteredTag) {
  /** @type {!ValidateTagResult} */
  const attempt = {
    validationResult: new generated.ValidationResult(),
    bestMatchTagSpec: null,
    inlineStyleCssBytes: 0,
  };
  attempt.validationResult.status = generated.ValidationResult.Status.PASS;
  validateParentTag(parsedTagSpec, context, attempt.validationResult);
  validateAncestorTags(parsedTagSpec, context, attempt.validationResult);
  // Some parent tag specs also define allowed child tag names for the first
  // child or all children. Validate that we aren't violating any of those
  // rules either.
  context.getTagStack().matchChildTagName(
      encounteredTag, context, attempt.validationResult);
  // Only validate attributes if we haven't yet found any errors. The
  // Parent/Ancestor errors are informative without adding additional errors
  // about attributes.
  if (attempt.validationResult.status ===
      generated.ValidationResult.Status.PASS) {
    validateAttributes(
        parsedTagSpec, bestMatchReferencePoint, context, encounteredTag,
        attempt);
  }
  // Only validate that this is a valid descendant if it's not already
  // invalid.
  if (attempt.validationResult.status ===
      generated.ValidationResult.Status.PASS) {
    validateDescendantTags(
        encounteredTag, parsedTagSpec, context, attempt.validationResult);
  }
  validateNoSiblingsAllowedTags(
      parsedTagSpec, context, attempt.validationResult);
  validateLastChildTags(context, attempt.validationResult);
  // If we haven't reached the body element yet, we may not have seen the
  // necessary extension. That case is handled elsewhere.
  if (context.getTagStack().hasAncestor('BODY')) {
    validateRequiredExtensions(
        parsedTagSpec, context, attempt.validationResult);
  }
  // Only validate uniqueness if we haven't yet found any errors, as it's
  // likely that this is not the correct tagspec if we have.
  if (attempt.validationResult.status ===
      generated.ValidationResult.Status.PASS) {
    validateUniqueness(parsedTagSpec, context, attempt.validationResult);
  }

  // Append some warnings, only if no errors.
  if (attempt.validationResult.status ===
      generated.ValidationResult.Status.PASS) {
    const tagSpec = parsedTagSpec.getSpec();
    if (tagSpec.deprecation !== null) {
      context.addWarning(
          generated.ValidationError.Code.DEPRECATED_TAG, context.getLineCol(),
          /* params */[getTagDescriptiveName(tagSpec), tagSpec.deprecation],
          tagSpec.deprecationUrl, attempt.validationResult);
    }
    if (tagSpec.uniqueWarning &&
        context.getTagspecsValidated().hasOwnProperty(parsedTagSpec.id())) {
      context.addWarning(
          generated.ValidationError.Code.DUPLICATE_UNIQUE_TAG_WARNING,
          context.getLineCol(),
          /* params */[getTagDescriptiveName(tagSpec)], getTagSpecUrl(tagSpec),
          attempt.validationResult);
    }
  }
  return attempt;
}

/**
 * Validates the provided |tagName| with respect to the tag
 * specifications in the validator's rules, resturning a ValidationResult
 * with errors for this tag and a PASS or FAIL status. At least one
 * specification must validate, or the result will have status FAIL.
 * Also passes back a reference to the tag spec which matched, if a match
 * was found.
 * Context is not mutated; instead, pending mutations are stored in the return
 * value, and are merged only if the tag spec is applied (pending some
 * reference point stuff).
 * @param {!parserInterface.ParsedHtmlTag} encounteredTag
 * @param {?ParsedTagSpec} bestMatchReferencePoint
 * @param {!Context} context
 * @return {ValidateTagResult}
 */
function validateTag(encounteredTag, bestMatchReferencePoint, context) {
  const tagSpecDispatch =
      context.getRules().dispatchForTagName(encounteredTag.upperName());
  // Filter TagSpecDispatch.AllTagSpecs by type identifiers.
  const filteredTagSpecs = [];
  if (tagSpecDispatch !== undefined) {
    for (const tagSpecId of tagSpecDispatch.allTagSpecs()) {
      const parsedTagSpec = context.getRules().getByTagSpecId(tagSpecId);
      // Keep TagSpecs that are used for these type identifiers.
      if (parsedTagSpec.isUsedForTypeIdentifiers(
              context.getTypeIdentifiers())) {
        filteredTagSpecs.push(parsedTagSpec);
      }
    }
  }
  // If there are no dispatch keys matching the tag name, ex: tag name is
  // "foo", set a disallowed tag error.
  if (tagSpecDispatch === undefined ||
      (!tagSpecDispatch.hasDispatchKeys() && filteredTagSpecs.length === 0)) {
    const result = new generated.ValidationResult();
    let specUrl = '';
    // Special case the spec_url for font tags to be slightly more useful.
    if (encounteredTag.upperName() === 'FONT') {
      specUrl = context.getRules().getStylesSpecUrl();
    }
    context.addError(
        generated.ValidationError.Code.DISALLOWED_TAG, context.getLineCol(),
        /* params */[encounteredTag.lowerName()], specUrl, result);
    return {
      validationResult: result,
      bestMatchTagSpec: null,
      inlineStyleCssBytes: 0
    };
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
  if (tagSpecDispatch.hasDispatchKeys()) {
    for (const attr of encounteredTag.attrs()) {
      const tagSpecIds = tagSpecDispatch.matchingDispatchKey(
          attr.name,
          // Attribute values are case-sensitive by default, but we
          // match dispatch keys in a case-insensitive manner and then
          // validate using whatever the tagspec requests.
          attr.value.toLowerCase(), context.getTagStack().parentTagName());
      let bestAttempt = {
        validationResult: new generated.ValidationResult(),
        bestMatchTagSpec: null,
        inlineStyleCssBytes: 0,
      };
      bestAttempt.validationResult.status =
          generated.ValidationResult.Status.UNKNOWN;
      for (const tagSpecId of tagSpecIds) {
        const parsedTagSpec = context.getRules().getByTagSpecId(tagSpecId);
        // Skip TagSpecs that aren't used for these type identifiers.
        if (!parsedTagSpec.isUsedForTypeIdentifiers(
                context.getTypeIdentifiers())) {
          continue;
        }
        let attempt = validateTagAgainstSpec(
            parsedTagSpec, bestMatchReferencePoint, context, encounteredTag);
        if (context.getRules().betterValidationResultThan(
                attempt.validationResult, bestAttempt.validationResult)) {
          bestAttempt = attempt;
          bestAttempt.bestMatchTagSpec = parsedTagSpec;
          // Exit early on success
          if (bestAttempt.validationResult.status ===
              generated.ValidationResult.Status.PASS) {
            return bestAttempt;
          }
        }
      }
      if (bestAttempt.validationResult.status !==
          generated.ValidationResult.Status.UNKNOWN) {
        return bestAttempt;
      }
    }
  }
  // None of the dispatch tagspecs matched and passed. If there are no
  // non-dispatch tagspecs, consider this a 'generally' disallowed tag,
  // which gives an error that reads "tag foo is disallowed except in
  // specific forms".
  if (filteredTagSpecs.length === 0) {
    const result = new generated.ValidationResult();
    if (encounteredTag.upperName() === 'SCRIPT') {
      // Special case for <script> tags to produce better error messages.
      context.addError(
          generated.ValidationError.Code.DISALLOWED_SCRIPT_TAG,
          context.getLineCol(),
          /* params */[], context.getRules().getScriptSpecUrl(), result);
    } else {
      context.addError(
          generated.ValidationError.Code.GENERAL_DISALLOWED_TAG,
          context.getLineCol(),
          /* params */[encounteredTag.lowerName()],
          /* specUrl */ '', result);
    }
    return {
      validationResult: result,
      bestMatchTagSpec: null,
      inlineStyleCssBytes: 0
    };
  }
  // Validate against all remaining tagspecs. Each tagspec will produce a
  // different set of errors. Even if none of them match, we only want to
  // return errors from a single tagspec, not all of them. We keep around
  // the 'best' attempt until we have found a matching TagSpec or have
  // tried them all.
  let bestAttempt = {
    validationResult: new generated.ValidationResult(),
    bestMatchTagSpec: null,
    inlineStyleCssBytes: 0,
  };
  bestAttempt.validationResult.status =
      generated.ValidationResult.Status.UNKNOWN;
  for (const parsedTagSpec of filteredTagSpecs) {
    const attempt = validateTagAgainstSpec(
        parsedTagSpec, bestMatchReferencePoint, context, encounteredTag);
    if (context.getRules().betterValidationResultThan(
            attempt.validationResult, bestAttempt.validationResult)) {
      bestAttempt = attempt;
      bestAttempt.bestMatchTagSpec = parsedTagSpec;
      // Exit early
      if (bestAttempt.validationResult.status ===
          generated.ValidationResult.Status.PASS) {
        return bestAttempt;
      }
    }
  }
  return bestAttempt;
}

/**
 * This wrapper class provides access to the validation rules.
 * @private
 */
class ParsedValidatorRules {
  /**
   * Creates a new instance and initializes it with
   * generated.ValidatorRules.
   * @param {string} htmlFormat
   */
  constructor(htmlFormat) {
    /** @private @type {!generated.ValidatorRules} */
    this.rules_ = createRules.createRules();

    /**
     * The HTML format
     * @type {string}
     * @private
     */
    this.htmlFormat_ = htmlFormat;

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
     * Sets type identifiers which are used to determine the set of validation
     * rules to be applied.
     * @type {!Object<string, number>}
     * @private
     */
    this.typeIdentifiers_ = Object.create(null);
    this.typeIdentifiers_['\u26a1'] = 0;
    this.typeIdentifiers_['\u26a1\ufe0f'] = 0;
    this.typeIdentifiers_['amp'] = 0;
    this.typeIdentifiers_['\u26a14ads'] = 0;
    this.typeIdentifiers_['\u26a1\ufe0f4ads'] = 0;
    this.typeIdentifiers_['amp4ads'] = 0;
    this.typeIdentifiers_['\u26a14email'] = 0;
    this.typeIdentifiers_['\u26a1\ufe0f4email'] = 0;
    this.typeIdentifiers_['amp4email'] = 0;
    this.typeIdentifiers_['actions'] = 0;
    this.typeIdentifiers_['transformed'] = 0;
    this.typeIdentifiers_['data-ampdevmode'] = 0;
    this.typeIdentifiers_['data-css-strict'] = 0;

    // For every tagspec that contains an ExtensionSpec, we add several
    // TagSpec fields corresponding to the data found in the ExtensionSpec.
    this.expandExtensionSpec_ = function() {
      const numTags = this.rules_.tags.length;
      for (let tagSpecId = 0; tagSpecId < numTags; ++tagSpecId) {
        let tagSpec = this.rules_.tags[tagSpecId];
        if (tagSpec.extensionSpec == null) continue;
        if (tagSpec.specName === null)
          tagSpec.specName =
              tagSpec.extensionSpec.name + ' extension .js script';
        if (tagSpec.descriptiveName === null)
          tagSpec.descriptiveName = tagSpec.specName;
        tagSpec.mandatoryParent = 'HEAD';
        if (tagSpec.extensionSpec.deprecatedAllowDuplicates)
          tagSpec.uniqueWarning = true;
        else
          tagSpec.unique = true;

        if (VALIDATE_CSS) {
          tagSpec.cdata = new generated.CdataSpec();
          tagSpec.cdata.whitespaceOnly = true;
        }
      }
    };
    this.expandExtensionSpec_();

    /**
     * Returns true if `tagSpec` is usable for the HTML format these rules are
     * built for.
     * @type {function(!generated.TagSpec) : boolean}
     * @private
     */
    this.isTagSpecCorrectHtmlFormat_ = function(tagSpec) {
      const castedHtmlFormat =
          /** @type {!generated.HtmlFormat.Code} */ (
              /** @type {*} */ (htmlFormat));
      return tagSpec.htmlFormat.indexOf(castedHtmlFormat) !== -1;
    };

    /**
     * Returns true if `spec` is usable for the HTML format these rules are
     * built for.
     * @type {function(!generated.DocSpec) : boolean}
     * @private
     */
    this.isDocSpecCorrectHtmlFormat_ = function(docSpec) {
      const castedHtmlFormat =
          /** @type {!generated.HtmlFormat.Code} */ (
              /** @type {*} */ (htmlFormat));
      return docSpec.htmlFormat == castedHtmlFormat;
    };

    /**
     * Returns true if `spec` is usable for the HTML format these rules are
     * built for.
     * @type {function(!generated.DocCssSpec) : boolean}
     * @private
     */
    this.isDocCssSpecCorrectHtmlFormat_ = function(docCssSpec) {
      const castedHtmlFormat =
          /** @type {!generated.HtmlFormat.Code} */ (
              /** @type {*} */ (htmlFormat));
      return docCssSpec.htmlFormat == castedHtmlFormat;
    };

    /**
     * @type {!ParsedAttrSpecs}
     * @private
     */
    this.parsedAttrSpecs_ = new ParsedAttrSpecs(this.rules_);

    /**
     * @type {!Array<!ParsedDocSpec>}
     * @private
     */
    this.parsedDoc_ = [];
    for (const docSpec of this.rules_.doc) {
      this.parsedDoc_.push(new ParsedDocSpec(docSpec));
    }

    /**
     * @type {!Array<!ParsedDocCssSpec>}
     * @private
     */
    this.parsedCss_ = [];
    for (const cssSpec of this.rules_.css) {
      this.parsedCss_.push(
          new ParsedDocCssSpec(cssSpec, this.rules_.declarationList));
    }

    /** @private @type {!Array<boolean>} */
    this.tagSpecIdsToTrack_ = [];
    const numTags = this.rules_.tags.length;
    for (let tagSpecId = 0; tagSpecId < numTags; ++tagSpecId) {
      const tag = this.rules_.tags[tagSpecId];
      if (!this.isTagSpecCorrectHtmlFormat_(tag)) {
        continue;
      }
      if (tag.alsoRequiresTagWarning.length > 0) {
        this.tagSpecIdsToTrack_[tagSpecId] = true;
      }
      for (const otherTag of tag.alsoRequiresTagWarning) {
        this.tagSpecIdsToTrack_[otherTag] = true;
      }
      if (tag.tagName !== '$REFERENCE_POINT') {
        if (!(tag.tagName in this.tagSpecByTagName_)) {
          this.tagSpecByTagName_[tag.tagName] = new TagSpecDispatch();
        }
        const tagnameDispatch = this.tagSpecByTagName_[tag.tagName];
        if (tag.extensionSpec !== null) {
          // This tag is an extension. Compute and register a dispatch key
          // for it.
          let dispatchKey;
          dispatchKey = makeDispatchKey(
              generated.AttrSpec.DispatchKeyType.NAME_VALUE_DISPATCH,
              getExtensionNameAttribute(tag.extensionSpec),
              /** @type {string} */ (tag.extensionSpec.name), '');
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
    }

    /**
     * @typedef {{ format: string, specificity: number }}
     */
    let ErrorCodeMetadata;

    /**
     * type {!Object<!generated.ValidationError.Code,
     *               ErrorCodeMetadata>}
     *  @private
     */
    this.errorCodes_ = Object.create(null);
    for (let i = 0; i < this.rules_.errorFormats.length; ++i) {
      const errorFormat = this.rules_.errorFormats[i];
      asserts.assert(errorFormat !== null);
      this.errorCodes_[errorFormat.code] = Object.create(null);
      this.errorCodes_[errorFormat.code].format = errorFormat.format;
    }
    for (let i = 0; i < this.rules_.errorSpecificity.length; ++i) {
      const errorSpecificity = this.rules_.errorSpecificity[i];
      asserts.assert(errorSpecificity !== null);
      this.errorCodes_[errorSpecificity.code].specificity =
          errorSpecificity.specificity;
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

  /** @return {!generated.ValidatorRules} */
  getRules() {
    return this.rules_;
  }

  /**
   * @param {!generated.ValidationError.Code} errorCode
   * @return {string}
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
   * @param {string} maybeTypeIdentifier
   * @return {boolean}
   */
  isTypeIdentifier(maybeTypeIdentifier) {
    return maybeTypeIdentifier in this.typeIdentifiers_;
  }

  /**
   * Validates type identifiers within a set of attributes, adding
   * ValidationErrors as necessary, and sets type identifiers on
   * ValidationResult.typeIdentifier.
   * @param {!Array<!parserInterface.ParsedAttr>} attrs
   * @param {!Array<string>} formatIdentifiers
   * @param {!Context} context
   * @param {!generated.ValidationResult} validationResult
   */
  validateTypeIdentifiers(attrs, formatIdentifiers, context, validationResult) {
    let hasMandatoryTypeIdentifier = false;
    const transformedValueRe = new RegExp(/^\w+;v=(\d+)$/);
    for (const attr of attrs) {
      // Verify this attribute is a type identifier. Other attributes are
      // validated in validateAttributes.
      if (this.isTypeIdentifier(attr.name)) {
        // Verify this type identifier is allowed for this format.
        if (formatIdentifiers.indexOf(attr.name) !== -1) {
          // Only add the type identifier once per representation. That is,
          // both "⚡" and "amp", which represent the same type identifier.
          const typeIdentifier =
              attr.name.replace('\u26a1\ufe0f', 'amp').replace('\u26a1', 'amp');
          if (validationResult.typeIdentifier.indexOf(typeIdentifier) === -1) {
            validationResult.typeIdentifier.push(typeIdentifier);
            context.recordTypeIdentifier(typeIdentifier);
          }
          // The type identifier "actions" and "transformed" are not
          // considered mandatory unlike other type identifiers.
          if (typeIdentifier !== 'actions' &&
              typeIdentifier !== 'transformed' &&
              typeIdentifier !== 'data-ampdevmode' &&
              typeIdentifier !== 'data-css-strict') {
            hasMandatoryTypeIdentifier = true;
          }
          // The type identifier "transformed" has restrictions on it's value.
          // It must be \w+;v=\d+ (e.g. google;v=1).
          if ((typeIdentifier === 'transformed') && (attr.value !== '')) {
            const reResult = transformedValueRe.exec(attr.value);
            if (reResult !== null) {
              validationResult.transformerVersion = parseInt(reResult[1], 10);
            } else {
              context.addError(
                  generated.ValidationError.Code.INVALID_ATTR_VALUE,
                  context.getLineCol(),
                  /*params=*/[attr.name, 'html', attr.value],
                  'https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#required-markup',
                  validationResult);
            }
          }
          if (typeIdentifier === 'data-ampdevmode') {
            // https://github.com/ampproject/amphtml/issues/20974
            // We always emit an error for this type identifier, but it
            // suppresses other errors later in the document.
            context.addError(
                generated.ValidationError.Code.DEV_MODE_ONLY,
                context.getLineCol(),
                /*params=*/[], /*url*/ '', validationResult);
          }
        } else {
          context.addError(
              generated.ValidationError.Code.DISALLOWED_ATTR,
              context.getLineCol(),
              /*params=*/[attr.name, 'html'],
              'https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#required-markup',
              validationResult);
        }
      }
    }
    if (!hasMandatoryTypeIdentifier) {
      // Missing mandatory type identifier (any AMP variant but "actions" or
      // "transformed").
      context.addError(
          generated.ValidationError.Code.MANDATORY_ATTR_MISSING,
          context.getLineCol(),
          /*params=*/[formatIdentifiers[0], 'html'],
          'https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#required-markup',
          validationResult);
    }
  }

  /**
   * Validates the HTML tag for type identifiers.
   * @param {!parserInterface.ParsedHtmlTag} htmlTag
   * @param {!Context} context
   * @param {!generated.ValidationResult} validationResult
   */
  validateHtmlTag(htmlTag, context, validationResult) {
    switch (this.htmlFormat_) {
      case 'AMP':
        this.validateTypeIdentifiers(
            htmlTag.attrs(),
            ['\u26a1', '\u26a1\ufe0f', 'amp', 'transformed', 'data-ampdevmode'],
            context, validationResult);
        break;
      case 'AMP4ADS':
        this.validateTypeIdentifiers(
            htmlTag.attrs(),
            ['\u26a14ads', '\u26a1\ufe0f4ads', 'amp4ads', 'data-ampdevmode'],
            context, validationResult);
        break;
      case 'AMP4EMAIL':
        this.validateTypeIdentifiers(
            htmlTag.attrs(),
            [
              '\u26a14email', '\u26a1\ufe0f4email', 'amp4email',
              'data-ampdevmode', 'data-css-strict'
            ],
            context, validationResult);
        break;
      case 'ACTIONS':
        this.validateTypeIdentifiers(
            htmlTag.attrs(),
            ['\u26a1', '\u26a1\ufe0f', 'amp', 'actions', 'data-ampdevmode'],
            context, validationResult);
        if (validationResult.typeIdentifier.indexOf('actions') === -1) {
          context.addError(
              generated.ValidationError.Code.MANDATORY_ATTR_MISSING,
              context.getLineCol(),
              /* params */['actions', 'html'],
              /* url */ '', validationResult);
        }
        break;
      default:
        // fallthrough
    }
  }

  /**
   * @param {!generated.ValidationError.Code} error_code
   * @return {number}
   */
  specificity(error_code) {
    return this.errorCodes_[error_code].specificity;
  }

  /**
   * A helper function which allows us to compare two candidate results
   * in validateTag to report the results which have the most specific errors.
   * @param {!Array<!generated.ValidationError>} errors
   * @return {number} maximum value of specificity found in all errors.
   */
  maxSpecificity(errors) {
    let max = 0;
    for (const error of errors) {
      asserts.assert(error.code !== null);
      max = Math.max(this.specificity(error.code), max);
    }
    return max;
  }

  /**
   * Returns true iff statusA is a better status than statusB
   * @param {?generated.ValidationResult.Status} statusA
   * @param {?generated.ValidationResult.Status} statusB
   * @return {boolean}
   * @private
   */
  betterValidationStatusThan_(statusA, statusB) {
    // Equal, so not better than.
    if (statusA === statusB) {
      return false;
    }

    // PASS > FAIL > UNKNOWN
    if (statusA === generated.ValidationResult.Status.PASS) {
      return true;
    }
    if (statusB === generated.ValidationResult.Status.PASS) {
      return false;
    }
    if (statusA === generated.ValidationResult.Status.FAIL) {
      return true;
    }
    asserts.assert(statusA === generated.ValidationResult.Status.UNKNOWN);
    return false;
  }

  /**
   * Returns true iff the error codes in errorsB are a subset of the error
   * codes in errorsA.
   * @param {!Array<!generated.ValidationError>} errorsA
   * @param {!Array<!generated.ValidationError>} errorsB
   * @return {boolean}
   * @private
   */
  isErrorSubset_(errorsA, errorsB) {
    let codesA = {};
    for (const error of errorsA) codesA[error.code] = 1;
    let codesB = {};
    for (const error of errorsB) {
      codesB[error.code] = 1;
      // If error is not in codesA, errorsB is not a subset of errorsA.
      if (!codesA.hasOwnProperty(error.code)) {
        return false;
      }
    }
    // Every code in B is also in A. If they are the same, not a subset.
    return Object.keys(codesA).length > Object.keys(codesB).length;
  }

  /**
   * Returns true iff resultA is a better result than resultB.
   * @param {!generated.ValidationResult} resultA
   * @param {!generated.ValidationResult} resultB
   * @return {boolean}
   */
  betterValidationResultThan(resultA, resultB) {
    if (resultA.status !== resultB.status) {
      return this.betterValidationStatusThan_(resultA.status, resultB.status);
    }

    // If one of the error sets by error.code is a subset of the other
    // error set's error.codes, use the subset one. It's essentially saying,
    // if you fix these errors that we both complain about, then you'd be
    // passing for my tagspec, but not the other one, regardless of
    // specificity.
    if (this.isErrorSubset_(resultB.errors, resultA.errors)) {
      return true;
    }
    if (this.isErrorSubset_(resultA.errors, resultB.errors)) {
      return false;
    }

    // Prefer the most specific error found in either set.
    if (this.maxSpecificity(resultA.errors) >
        this.maxSpecificity(resultB.errors)) {
      return true;
    }
    if (this.maxSpecificity(resultB.errors) >
        this.maxSpecificity(resultA.errors)) {
      return false;
    }

    // Prefer the attempt with the fewest errors if the most specific errors
    // are the same.
    if (resultA.errors.length < resultB.errors.length) {
      return true;
    }
    if (resultB.errors.length < resultA.errors.length) {
      return false;
    }

    // Equal, so not better than.
    return false;
  }

  /**
   * Emits errors for tags that are specified to be mandatory.
   * @param {!Context} context
   * @param {!generated.ValidationResult} validationResult
   */
  maybeEmitMandatoryTagValidationErrors(context, validationResult) {
    for (const tagSpecId of this.mandatoryTagSpecs_) {
      const parsedTagSpec = this.getByTagSpecId(tagSpecId);
      // Skip TagSpecs that aren't used for these type identifiers.
      if (!parsedTagSpec.isUsedForTypeIdentifiers(
              context.getTypeIdentifiers())) {
        continue;
      }
      if (!context.getTagspecsValidated().hasOwnProperty(tagSpecId)) {
        const spec = parsedTagSpec.getSpec();
        context.addError(
            generated.ValidationError.Code.MANDATORY_TAG_MISSING,
            context.getLineCol(),
            /* params */[getTagDescriptiveName(spec)], getTagSpecUrl(spec),
            validationResult);
      }
    }
  }

  /**
   * Emits errors for tags that specify that another tag is also required or
   * a condition is required to be satisfied.
   * Returns false iff context.Progress(result).complete.
   * @param {!Context} context
   * @param {!generated.ValidationResult} validationResult
   */
  maybeEmitAlsoRequiresTagValidationErrors(context, validationResult) {
    /** @type {!Array<number>} */
    const tagspecsValidated =
        Object.keys(context.getTagspecsValidated()).map(Number);
    googArray.sort(tagspecsValidated);
    for (const tagSpecId of tagspecsValidated) {
      const parsedTagSpec = this.getByTagSpecId(tagSpecId);
      // Skip TagSpecs that aren't used for these type identifiers.
      if (!parsedTagSpec.isUsedForTypeIdentifiers(
              context.getTypeIdentifiers())) {
        continue;
      }
      for (const condition of parsedTagSpec.requires()) {
        if (!context.satisfiesCondition(condition)) {
          context.addError(
              generated.ValidationError.Code.TAG_REQUIRED_BY_MISSING,
              context.getLineCol(),
              /* params */
              [
                context.getRules().getInternedString(condition),
                getTagDescriptiveName(parsedTagSpec.getSpec()),
              ],
              getTagSpecUrl(parsedTagSpec), validationResult);
        }
      }
      for (const condition of parsedTagSpec.excludes()) {
        if (context.satisfiesCondition(condition)) {
          context.addError(
              generated.ValidationError.Code.TAG_EXCLUDED_BY_TAG,
              context.getLineCol(),
              /* params */
              [
                getTagDescriptiveName(parsedTagSpec.getSpec()),
                context.getRules().getInternedString(condition),
              ],
              getTagSpecUrl(parsedTagSpec), validationResult);
        }
      }
      for (const tagspecId of parsedTagSpec.getAlsoRequiresTagWarning()) {
        if (!context.getTagspecsValidated().hasOwnProperty(tagspecId)) {
          const alsoRequiresTagspec = this.getByTagSpecId(tagspecId);
          context.addWarning(
              generated.ValidationError.Code.WARNING_TAG_REQUIRED_BY_MISSING,
              context.getLineCol(),
              /* params */
              [
                getTagDescriptiveName(alsoRequiresTagspec.getSpec()),
                getTagDescriptiveName(parsedTagSpec.getSpec()),
              ],
              getTagSpecUrl(parsedTagSpec), validationResult);
        }
      }
    }

    const extensionsCtx = context.getExtensions();
    const unusedRequired = extensionsCtx.unusedExtensionsRequired();
    for (const unusedExtensionName of unusedRequired) {
      context.addError(
          generated.ValidationError.Code.EXTENSION_UNUSED, context.getLineCol(),
          /* params */[unusedExtensionName],
          /* specUrl */ '', validationResult);
    }
  }

  /**
   * Emits errors for tags that are specified as mandatory alternatives.
   * Returns false iff context.Progress(result).complete.
   * @param {!Context} context
   * @param {!generated.ValidationResult} validationResult
   */
  maybeEmitMandatoryAlternativesSatisfiedErrors(context, validationResult) {
    const satisfied = context.getMandatoryAlternativesSatisfied();
    /** @type {!Array<string>} */
    const missing = [];
    const specUrlsByMissing = Object.create(null);
    for (const tagSpec of this.rules_.tags) {
      if (tagSpec.mandatoryAlternatives === null ||
          !this.isTagSpecCorrectHtmlFormat_(tagSpec)) {
        continue;
      }
      const alternative = tagSpec.mandatoryAlternatives;
      if (satisfied.indexOf(alternative) === -1) {
        const alternativeName =
            context.getRules().getInternedString(alternative);
        missing.push(alternativeName);
        specUrlsByMissing[alternativeName] = getTagSpecUrl(tagSpec);
      }
    }
    sortAndUniquify(missing);
    for (const tagMissing of missing) {
      context.addError(
          generated.ValidationError.Code.MANDATORY_TAG_MISSING,
          context.getLineCol(),
          /* params */[tagMissing],
          /* specUrl */ specUrlsByMissing[tagMissing], validationResult);
    }
  }

  /**
   * Emits errors for doc size limitations across entire document.
   * @param {!Context} context
   * @param {!generated.ValidationResult} validationResult
   */
  maybeEmitDocSizeErrors(context, validationResult) {
    const parsedDocSpec = context.matchingDocSpec();
    if (parsedDocSpec !== null) {
      const bytesUsed = context.getDocByteSize();
      /** @type {!generated.DocSpec} */
      const docSpec = parsedDocSpec.spec();
      if (docSpec.maxBytes !== -2 && bytesUsed > docSpec.maxBytes) {
        context.addError(
            generated.ValidationError.Code.DOCUMENT_SIZE_LIMIT_EXCEEDED,
            context.getLineCol(), /* params */
            [docSpec.maxBytes.toString(), bytesUsed.toString()],
            docSpec.maxBytesSpecUrl, validationResult);
      }
    }
  }

  /**
   * Emits errors for css size limitations across entire document.
   * @param {!Context} context
   * @param {!generated.ValidationResult} validationResult
   */
  maybeEmitCssLengthSpecErrors(context, validationResult) {
    const bytesUsed =
        context.getInlineStyleByteSize() + context.getStyleTagByteSize();

    const parsedCssSpec = context.matchingDocCssSpec();
    if (parsedCssSpec !== null) {
      /** @type {!generated.DocCssSpec} */
      const cssSpec = parsedCssSpec.spec();
      if (cssSpec.maxBytes !== -2 && bytesUsed > cssSpec.maxBytes) {
        if (cssSpec.maxBytesIsWarning) {
          context.addWarning(
              generated.ValidationError.Code
                  .STYLESHEET_AND_INLINE_STYLE_TOO_LONG,
              context.getLineCol(), /* params */
              [bytesUsed.toString(), cssSpec.maxBytes.toString()],
              cssSpec.maxBytesSpecUrl, validationResult);
        } else {
          context.addError(
              generated.ValidationError.Code
                  .STYLESHEET_AND_INLINE_STYLE_TOO_LONG,
              context.getLineCol(), /* params */
              [bytesUsed.toString(), cssSpec.maxBytes.toString()],
              cssSpec.maxBytesSpecUrl, validationResult);
        }
      }
    }
  }

  /**
   * Emits errors when there is a ValueSetRequirement with no matching
   * ValueSetProvision in the document.
   * @param {!Context} context
   * @param {!generated.ValidationResult} validationResult
   */
  maybeEmitValueSetMismatchErrors(context, validationResult) {
    const providedKeys = context.valueSetsProvided();
    for (const [requiredKey, errors] of context.valueSetsRequired()) {
      if (!providedKeys.has(/** @type {string} */ (requiredKey))) {
        for (const error of errors)
          context.addBuiltError(error, validationResult);
      }
    }
  }

  /**
   * Emits any validation errors which require a global view
   * (mandatory tags, tags required by other tags, mandatory alternatives).
   * @param {!Context} context
   * @param {!generated.ValidationResult} validationResult
   */
  maybeEmitGlobalTagValidationErrors(context, validationResult) {
    this.maybeEmitMandatoryTagValidationErrors(context, validationResult);
    this.maybeEmitAlsoRequiresTagValidationErrors(context, validationResult);
    this.maybeEmitMandatoryAlternativesSatisfiedErrors(
        context, validationResult);
    this.maybeEmitDocSizeErrors(context, validationResult);
    this.maybeEmitCssLengthSpecErrors(context, validationResult);
    this.maybeEmitValueSetMismatchErrors(context, validationResult);
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
    asserts.assert(tag !== undefined);
    parsed = new ParsedTagSpec(
        this.parsedAttrSpecs_,
        shouldRecordTagspecValidated(tag, id, this.tagSpecIdsToTrack_), tag,
        id);
    this.parsedTagSpecById_[id] = parsed;
    return parsed;
  }

  /**
   * @param {string} tagName
   * @return {!TagSpecDispatch|undefined}
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
   * @return {!Array<!generated.DescendantTagList>}
   */
  getDescendantTagLists() {
    return this.rules_.descendantTagList;
  }

  /**
   * @return {!Array<!ParsedDocSpec>}
   */
  getDoc() {
    return this.parsedDoc_;
  }

  /**
   * @return {!Array<!ParsedDocCssSpec>}
   */
  getCss() {
    return this.parsedCss_;
  }

  /**
   * Computes the name for a given reference point.
   * Used in generating error strings.
   * @param {!generated.ReferencePoint} referencePoint
   * @return {string}
   */
  getReferencePointName(referencePoint) {
    // tagSpecName here is actually a number, which was replaced in
    // validator_gen_js.py from the name string, so this works.
    const tagSpecId = /** @type {number} */ (referencePoint.tagSpecName);
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
 * Validation Handler which accepts callbacks from HTML Parser
 */
const ValidationHandler =
    class extends parserInterface.HtmlSaxHandlerWithLocation {
  /**
   * Creates a new handler.
   * @param {string} htmlFormat
   */
  constructor(htmlFormat) {
    super();

    this.validationResult_ = new generated.ValidationResult();
    this.validationResult_.status = generated.ValidationResult.Status.UNKNOWN;
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
   * @return {!generated.ValidationResult} Validation Result at the current
   *     step.
   */
  Result() {
    return this.validationResult_;
  }

  /**
   * Callback before startDoc which gives us a document locator.
   * @param {!parserInterface.DocLocator} locator
   * @override
   */
  setDocLocator(locator) {
    if (locator === null) {
      asserts.fail('Null DocLocator set');
    } else {
      this.context_.setDocLocator(locator);
    }
  }

  /**
   * Callback for the start of a new HTML document.
   * @override
   */
  startDoc() {
    this.validationResult_ = new generated.ValidationResult();
    this.validationResult_.status = generated.ValidationResult.Status.UNKNOWN;
  }

  /**
   * Callback for the attributes from all the body tags encountered
   * within the document.
   * @override
   */
  effectiveBodyTag(attributes) {
    const encounteredAttrs = this.context_.getEncounteredBodyAttrs();
    // If we never recorded a body tag with attributes, it was manufactured.
    // In which case we've already logged an error for that. Doing more here
    // would be confusing.
    if (encounteredAttrs === null) {
      return;
    }
    // So now we compare the attributes from the tag that we encountered
    // (htmlparser.HtmlParser sent us a startTag event for it earlier) with
    // the attributes from the effective body tag that we're just receiving
    // now, which contains all attributes on body tags within the doc. It's
    // correct to think of this synthetic tag simply as a concatenation -
    // there is in general no elimination of duplicate attributes or
    // overriding behavior. Thus, if the second body tag has any
    // attribute this will result in an error.
    let differenceSeen = attributes.length !== encounteredAttrs.length;
    if (!differenceSeen) {
      for (let ii = 0; ii < attributes.length; ii++) {
        if (attributes[ii] !== encounteredAttrs[ii]) {
          differenceSeen = true;
          break;
        }
      }
    }
    if (!differenceSeen) {
      return;
    }
    this.context_.addError(
        generated.ValidationError.Code.DUPLICATE_UNIQUE_TAG,
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
        generated.ValidationResult.Status.UNKNOWN) {
      this.validationResult_.status = generated.ValidationResult.Status.PASS;
    }
    // As some errors can be inserted out of order, sort errors at the
    // end based on their line/col numbers.
    googArray.stableSort(this.validationResult_.errors, function(lhs, rhs) {
      if (lhs.line != rhs.line) {
        return lhs.line - rhs.line;
      }
      return lhs.col - rhs.col;
    });
  }

  /**
   * Callback for informing that the parser is manufacturing a <body> tag not
   * actually found on the page. This will be followed by a startTag() with
   * the actual body tag in question.
   * @override
   */
  markManufacturedBody() {
    this.context_.addError(
        generated.ValidationError.Code.DISALLOWED_MANUFACTURED_BODY,
        this.context_.getLineCol(),
        /* params */[], /* url */ '', this.validationResult_);
  }

  /**
   * While parsing the document HEAD, we may accumulate errors which depend
   * on seeing later extension <script> tags.
   */
  emitMissingExtensionErrors() {
    const extensionsCtx = this.context_.getExtensions();
    for (const error of extensionsCtx.missingExtensionErrors()) {
      this.context_.addBuiltError(error, this.validationResult_);
    }
  }

  /**
   * Callback for a start HTML tag.
   * @param {!parserInterface.ParsedHtmlTag} encounteredTag
   * @override
   */
  startTag(encounteredTag) {
    if (encounteredTag.upperName() === 'HTML') {
      this.context_.getRules().validateHtmlTag(
          encounteredTag, this.context_, this.validationResult_);
    }
    /** @type {?string} */
    const maybeDuplicateAttrName = encounteredTag.hasDuplicateAttrs();
    if (maybeDuplicateAttrName !== null) {
      this.context_.addWarning(
          generated.ValidationError.Code.DUPLICATE_ATTRIBUTE,
          this.context_.getLineCol(),
          /* params */[encounteredTag.lowerName(), maybeDuplicateAttrName],
          /* specUrl */ '', this.validationResult_);
      encounteredTag.dedupeAttrs();
    }

    if ('BODY' === encounteredTag.upperName()) {
      this.context_.recordBodyTag(encounteredTag.attrs());
      this.emitMissingExtensionErrors();
    }

    /** @type {ValidateTagResult} */
    let resultForReferencePoint = {
      bestMatchTagSpec: null,
      validationResult: new generated.ValidationResult(),
      devModeSuppress: false,
      inlineStyleCssBytes: 0,
    };
    resultForReferencePoint.validationResult.status =
        generated.ValidationResult.Status.UNKNOWN;
    const referencePointMatcher =
        this.context_.getTagStack().parentReferencePointMatcher();
    // We must match the reference point before the TagSpec, as otherwise we
    // will end up with "unexplained" attributes during tagspec matching
    // which the reference point takes care of.
    if (referencePointMatcher !== null) {
      resultForReferencePoint =
          referencePointMatcher.validateTag(encounteredTag, this.context_);
    }

    const resultForTag = validateTag(
        encounteredTag, resultForReferencePoint.bestMatchTagSpec,
        this.context_);
    resultForTag.devModeSuppress =
        ShouldSuppressDevModeErrors(encounteredTag, this.context_);
    // Only merge in the reference point errors into the final result if the
    // tag otherwise passes one of the TagSpecs. Otherwise, we end up with
    // unnecessarily verbose errors.
    if (referencePointMatcher !== null &&
        resultForTag.validationResult.status ===
            generated.ValidationResult.Status.PASS &&
        !resultForTag.devModeSuppress) {
      this.validationResult_.mergeFrom(
          resultForReferencePoint.validationResult);
    }


    checkForReferencePointCollision(
        resultForReferencePoint.bestMatchTagSpec, resultForTag.bestMatchTagSpec,
        this.context_, resultForTag.validationResult);
    if (!resultForTag.devModeSuppress)
      this.validationResult_.mergeFrom(resultForTag.validationResult);

    this.context_.updateFromTagResults(
        encounteredTag, resultForReferencePoint, resultForTag);
  }

  /**
   * Callback for an end HTML tag.
   * @param {!parserInterface.ParsedHtmlTag} unused
   * @override
   */
  endTag(unused) {
    this.context_.getTagStack().exitTag(this.context_, this.validationResult_);
  }

  /**
   * Callback for pcdata. I'm not sure what this is supposed to include, but
   * it seems to be called for contents of <p> tags, looking at a few
   * examples.
   * @param {string} unused
   * @override
   */
  pcdata(unused) {}

  /**
   * Callback for rcdata text. rcdata text includes contents of title or
   * textarea
   * tags. The validator has no specific rules regarding these text blobs.
   * @param {string} unused
   * @override
   */
  rcdata(unused) {}

  /**
   * Callback for cdata.
   * @param {string} text
   * @override
   */
  cdata(text) {
    // Validate that JSON can be parsed.
    if (!this.context_.getTagStack().hasAncestor('TEMPLATE') &&
        this.context_.getTagStack().isScriptTypeJsonChild()) {
      try {
        JSON.parse(text);
      } catch (e) {
        this.context_.addWarning(
            generated.ValidationError.Code.INVALID_JSON_CDATA,
            this.context_.getLineCol(),
            /* params */[], '', this.validationResult_);
      }
    }
    const matcher = this.context_.getTagStack().cdataMatcher();
    if (matcher !== null) {
      matcher.match(text, this.context_, this.validationResult_);
    }
  }
};
exports.ValidationHandler = ValidationHandler;

/**
 * Convenience function which informs caller if given ValidationError is
 * severity warning.
 *
 * WARNING: This is exported; htmlparser changes may break downstream users
 * like https://www.npmjs.com/package/amphtml-validator and
 * https://validator.amp.dev/.
 *
 * @param {!generated.ValidationError} error
 * @return {boolean}
 */
const isSeverityWarning = function(error) {
  return error.severity === generated.ValidationError.Severity.WARNING;
};
exports.isSeverityWarning = isSeverityWarning;

/**
 * Validates a document input as a string.
 *
 * WARNING: This is exported; htmlparser changes may break downstream users
 * like https://www.npmjs.com/package/amphtml-validator and
 * https://validator.amp.dev/.
 *
 * @param {string} inputDocContents
 * @param {string=} opt_htmlFormat the allowed format. Defaults to 'AMP'.
 * @return {!generated.ValidationResult} Validation Result (status and
 *     errors)
 */
const validateString = function(inputDocContents, opt_htmlFormat) {
  asserts.assertString(inputDocContents, 'Input document is not a string');
  let htmlFormat = 'AMP';
  if (opt_htmlFormat) {
    htmlFormat = opt_htmlFormat.toUpperCase();
  }
  const handler = new ValidationHandler(htmlFormat);
  const parser = new htmlparser.HtmlParser();
  parser.parse(handler, inputDocContents);

  return handler.Result();
};
exports.validateString = validateString;

/**
 * The terminal is an abstraction for the window.console object which
 * accomodates differences between console implementations and provides
 * a convenient way to capture what's being emitted to the terminal
 * in a unittest. Pass the optional parameter to the constructor
 * to observe the calls that would have gone to window.console otherwise.
 */
const Terminal = class {
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
exports.Terminal = Terminal;

/**
 * Emits this validation result to the terminal, distinguishing warnings and
 *   errors.
 * @this {!generated.ValidationResult}
 * @param {string} url
 * @param {!Terminal=} opt_terminal
 */
generated.ValidationResult.prototype.outputToTerminal = function(
    url, opt_terminal) {
  const terminal = opt_terminal || new Terminal();

  const {status} = this;
  if (status === generated.ValidationResult.Status.PASS) {
    terminal.info('AMP validation successful.');
    terminal.info(
        'Review our \'publishing checklist\' to ensure ' +
        'successful AMP document distribution. See https://go.amp.dev/publishing-checklist');
    if (this.errors.length === 0) {
      return;
    }
  } else if (status !== generated.ValidationResult.Status.FAIL) {
    terminal.error(
        'AMP validation had unknown results. This indicates a validator ' +
        'bug. Please report at ' +
        'https://github.com/ampproject/amphtml/issues .');
    return;
  }
  let errors;
  if (status === generated.ValidationResult.Status.FAIL) {
    terminal.error('AMP validation had errors:');
  } else {
    terminal.warn('AMP validation had warnings:');
  }
  errors = this.errors;
  for (const error of errors) {
    if (error.severity === generated.ValidationError.Severity.ERROR) {
      terminal.error(errorLine(url, error));
    } else {
      terminal.warn(errorLine(url, error));
    }
  }
  if (errors.length !== 0) {
    terminal.info(
        'See also https://validator.amp.dev/#url=' +
        encodeURIComponent(uriUtils.removeFragment(url)));
  }
};

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
 * @param {!generated.ValidationError} error
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
 *
 * WARNING: This is exported; htmlparser changes may break downstream users
 * like https://www.npmjs.com/package/amphtml-validator and
 * https://validator.amp.dev/.
 *
 * @param {!generated.ValidationError} error
 * @return {string}
 */
const renderErrorMessage = function(error) {
  asserts.assert(error.code !== null);
  // TODO(powdercloud): It doesn't matter which ParsedValidatorRules
  // instance we access here - all of them have all error message
  // formats. We should probably refactor this a bit to keep the
  // error message formats seperately, to avoid initializing the
  // ParsedValidatorRules for AMP if we're really doing A4A.
  const format = getParsedValidatorRules('AMP').getFormatByCode(error.code);
  asserts.assert(format !== undefined);
  return applyFormat(format, error);
};
exports.renderErrorMessage = renderErrorMessage;

/**
 * Renders one line of error output.
 * @param {string} filenameOrUrl
 * @param {!generated.ValidationError} error
 * @return {string}
 */
function errorLine(filenameOrUrl, error) {
  const line = error.line || 1;
  const col = error.col || 0;

  let errorLine =
      uriUtils.removeFragment(filenameOrUrl) + ':' + line + ':' + col + ' ';
  errorLine += renderErrorMessage(error);
  if (error.specUrl) {
    errorLine += ' (see ' + error.specUrl + ')';
  }
  return errorLine;
}

/**
 * Renders the validation results into an array of human readable strings.
 * Careful when modifying this - it's called from
 * https://github.com/ampproject/amphtml/blob/master/test/integration/test-example-validation.js.
 *
 * WARNING: This is exported; htmlparser changes may break downstream users
 * like https://www.npmjs.com/package/amphtml-validator and
 * https://validator.amp.dev/.
 *
 * @param {!generated.ValidationResult} validationResult
 * @param {string} filename to use in rendering error messages.
 * @return {!Array<string>}
 */
const renderValidationResult = function(validationResult, filename) {
  const rendered = [];
  rendered.push(validationResult.status);
  for (const error of validationResult.errors) {
    rendered.push(errorLine(filename, error));
  }
  return rendered;
};
exports.renderValidationResult = renderValidationResult;

/**
 * Detects the author stylesheet based on the parameter name for it in
 * a ValidationError proto message.
 * @param {string} param
 * @return {boolean}
 */
function isAuthorStylesheet(param) {
  return googString./*OK*/ startsWith(param, 'style amp-custom');
}
exports.isAuthorStylesheet = isAuthorStylesheet;

/**
 * This function was removed in October 2019. Older versions of the nodejs
 * amphtml-validator library still call this function, so this stub is left
 * in place for now so as not to break them. TODO(#25188): Delete this
 * function after most usage had moved to a newer version of the
 * amphtml-validator lib.
 *
 * WARNING: This is exported; htmlparser changes may break downstream users
 * like https://www.npmjs.com/package/amphtml-validator and
 * https://validator.amp.dev/.
 *
 * @param {!generated.ValidationError} error
 * @return {!generated.ErrorCategory.Code}
 */
const categorizeError = function(error) {
  return generated.ErrorCategory.Code.UNKNOWN;
};
exports.categorizeError = categorizeError;

/**
 * Convenience function which calls |CategorizeError| for each error
 * in |result| and sets its category field accordingly.
 *
 * WARNING: This is exported; htmlparser changes may break downstream users
 * like https://www.npmjs.com/package/amphtml-validator and
 * https://validator.amp.dev/.
 *
 * @param {!generated.ValidationResult} result
 */
const annotateWithErrorCategories = function(result) {
  for (const error of result.errors) {
    error.category = categorizeError(error);
  }
};
exports.annotateWithErrorCategories = annotateWithErrorCategories;

// The following are globals we want exposed to callers that include the
// minified validator:
goog.exportSymbol(
    'amp.validator.ErrorCategory.Code', generated.ErrorCategory.Code);
goog.exportSymbol('amp.validator.HtmlFormat.Code', generated.HtmlFormat.Code);
goog.exportSymbol('amp.validator.validateString', validateString);
goog.exportSymbol('amp.validator.ValidationError', generated.ValidationError);
goog.exportSymbol(
    'amp.validator.ValidationError.Code', generated.ValidationError.Code);
goog.exportSymbol(
    'amp.validator.ValidationError.Severity',
    generated.ValidationError.Severity);
goog.exportSymbol('amp.validator.ValidationResult', generated.ValidationResult);
goog.exportSymbol(
    'amp.validator.ValidationResult.Status', generated.ValidationResult.Status);
goog.exportSymbol('amp.validator.renderErrorMessage', renderErrorMessage);
goog.exportSymbol(
    'amp.validator.renderValidationResult', renderValidationResult);
goog.exportSymbol('amp.validator.categorizeError', categorizeError);
goog.exportSymbol(
    'amp.validator.annotateWithErrorCategories', annotateWithErrorCategories);
goog.exportSymbol('amp.validator.isSeverityWarning', isSeverityWarning);
