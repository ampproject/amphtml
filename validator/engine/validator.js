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
goog.require('amp.validator.AtRuleSpec');
goog.require('amp.validator.AtRuleSpec.BlockType');
goog.require('amp.validator.AttrList');
goog.require('amp.validator.CssSpec');
goog.require('amp.validator.GENERATE_DETAILED_ERRORS');
goog.require('amp.validator.ReferencePoint');
goog.require('amp.validator.TagSpec');
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
goog.require('parse_css.tokenize');
goog.require('parse_css.validateAmp4AdsCss');
goog.require('parse_srcset.SrcsetParsingResult');
goog.require('parse_srcset.parseSrcset');
goog.require('parse_url.URL');

/**
 * Determines if |n| is an integer.
 * @param {number} n
 * @return {boolean}
 */
function isInteger(n) {
  return (Number(n) === n) && (n % 1 === 0);
}

/**
 * Sorts and eliminates duplicates in |arrayValue|.
 * @param {!Array<T>} arrayValue
 * @return {!Array<T>}
 * @template T
 */
function sortAndUniquify(arrayValue) {
  const arrayCopy = arrayValue.slice(0);
  goog.array.sort(arrayCopy);
  const unique = [];
  for (const v of arrayCopy) {
    if (unique.length === 0 || unique[unique.length - 1] !== v) {
      unique.push(v);
    }
  }
  return unique;
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
 * Merge results from another ValidationResult while dealing with the UNKNOWN
 *   status.
 * @param {!amp.validator.ValidationResult} other
 */
amp.validator.ValidationResult.prototype.mergeFrom = function(other) {
  goog.asserts.assert(this.status !== null);
  goog.asserts.assert(other.status !== null);
  if (other.status !== amp.validator.ValidationResult.Status.UNKNOWN) {
    this.status = other.status;
  }
  if (amp.validator.GENERATE_DETAILED_ERRORS) {
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
  if (amp.validator.GENERATE_DETAILED_ERRORS) {
    this.errors = [];
    Array.prototype.push.apply(this.errors, other.errors);
  }
};

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
 * The child tag matcher evaluates ChildTagSpec. The constructor
 * provides the enclosing TagSpec for the parent tag so that we can
 * produce error messages mentioning the parent.
 * @private
 */
class ChildTagMatcher {
  /**
   * @param {amp.validator.TagSpec} parentSpec
   */
  constructor(parentSpec) {
    /**
     * @type {amp.validator.TagSpec}
     * @private
     */
    this.parentSpec_ = parentSpec;

    /**
     * @type {number}
     * @private
     */
    this.numChildTagsSeen_ = 0;

    /**
     * @type {!LineCol}
     * @private
     */
    this.lineCol_ = new LineCol(1, 0);
  }

  /**
   * @param {!LineCol} lineCol
   */
  setLineCol(lineCol) {
    this.lineCol_ = lineCol;
  }

  /**
   * @return {boolean}
   */
  isEnabled() {
    return this.parentSpec_ !== null && this.parentSpec_.childTags !== null;
  }

  /**
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} result
   */
  matchChildTagName(context, result) {
    if (!this.isEnabled()) {
      return;
    }
    const tagName = context.getTagStack().getCurrent();
    const childTags = this.parentSpec_.childTags;
    this.numChildTagsSeen_++;  // Increment this first to allow early exit.
    if (childTags.childTagNameOneof.length > 0) {
      const names = childTags.childTagNameOneof;
      if (names.indexOf(tagName) === -1) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          const allowedNames = '[\'' + names.join('\', \'') + '\']';
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code.DISALLOWED_CHILD_TAG_NAME,
              context.getDocLocator(),
              /* params */
              [
                tagName.toLowerCase(), getTagSpecName(this.parentSpec_),
                allowedNames.toLowerCase()
              ],
              this.parentSpec_.specUrl, result);
        } else {
          result.status = amp.validator.ValidationResult.Status.FAIL;
          return;
        }
      }
    }
    if (childTags.firstChildTagNameOneof.length > 0 &&
        (this.numChildTagsSeen_ - 1) === 0) {
      const names = childTags.firstChildTagNameOneof;
      if (names.indexOf(tagName) == -1) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          const allowedNames = '[\'' + names.join('\', \'') + '\']';
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code
                  .DISALLOWED_FIRST_CHILD_TAG_NAME,
              context.getDocLocator(),
              /* params */
              [
                tagName.toLowerCase(), getTagSpecName(this.parentSpec_),
                allowedNames.toLowerCase()
              ],
              this.parentSpec_.specUrl, result);
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
    if (!this.isEnabled()) {
      return;
    }
    const expected = this.parentSpec_.childTags.mandatoryNumChildTags;
    if (expected === -1 || expected === this.numChildTagsSeen_) {
      return;
    }
    if (amp.validator.GENERATE_DETAILED_ERRORS) {
      context.addError(
          amp.validator.ValidationError.Severity.ERROR,
          amp.validator.ValidationError.Code.INCORRECT_NUM_CHILD_TAGS,
          this.lineCol_,
          /* params */
          [
            getTagSpecName(this.parentSpec_), expected.toString(),
            this.numChildTagsSeen_.toString()
          ],
          this.parentSpec_.specUrl, result);
    } else {
      result.status = amp.validator.ValidationResult.Status.FAIL;
      return;
    }
  }
}

/**
 * @typedef {{ point: !amp.validator.ReferencePoint,
 *             tagSpecId: number }}
 */
let ParsedReferencePoint;

/**
 * Holds the reference points for a particular parent tag spec, including
 * their resolved tagspec ids. This class is a container of
 * |ParsedReferencePoint| for convenient iteration.
 * @private
 */
class ParsedReferencePoints {
  /**
   * @param {!amp.validator.TagSpec} parent
   * @param {!Object<string, number>} tagSpecIdsByTagSpecName
   */
  constructor(parent, tagSpecIdsByTagSpecName) {
    /**
     * @type {!amp.validator.TagSpec}
     * @private
     */
    this.parent_ = parent;

    /**
     * @type {!Array<ParsedReferencePoint>}
     * @private
     */
    this.parsed_ = [];
    for (const p of parent.referencePoints) {
      goog.asserts.assert(p.tagSpecName !== null);
      this.parsed_.push(
          {point: p, tagSpecId: tagSpecIdsByTagSpecName[p.tagSpecName]});
    }
  }

  /** @return {!Array<ParsedReferencePoint>} */
  iterate() {
    return this.parsed_;
  }

  /** @return {boolean} */
  empty() {
    return this.parsed_.length === 0;
  }

  /** @return {number} */
  size() {
    return this.parsed_.length;
  }

  /** @return {?string} */
  parentSpecUrl() {
    return this.parent_.specUrl;
  }

  /** @return {string} */
  parentTagSpecName() {
    return getTagSpecName(this.parent_);
  }
}

/**
 * @private
 */
class ReferencePointMatcher {
  /**
   * @param {!ParsedValidatorRules} parsedValidatorRules
   * @param {!ParsedReferencePoints} parsedReferencePoints
   */
  constructor(parsedValidatorRules, parsedReferencePoints) {
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
    this.lineCol_ = new LineCol(1, 0);

    /**
     * @type {!Array<number>}
     * @private
     */
    this.referencePointsMatched_ = [];
  }

  /**
   * @param {!LineCol} lineCol
   */
  setLineCol(lineCol) {
    this.lineCol_ = lineCol;
  }

  /**
   * This method gets invoked when matching a child tag of the parent
   * that is specifying / requiring the reference points. So
   * effectively, this method will try through the specified reference
   * points and record them in this.referencePointsMatched_.
   * @param {!Array<string>} attrs
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} result
   */
  match(attrs, context, result) {
    if (this.parsedReferencePoints_.empty()) return;
    const resultForBestAttempt = new amp.validator.ValidationResult();
    resultForBestAttempt.status = amp.validator.ValidationResult.Status.FAIL;
    for (const p of this.parsedReferencePoints_.iterate()) {
      const parsedSpec = this.parsedValidatorRules_.getTagSpec(p.tagSpecId);
      validateTagAgainstSpec(
          this.parsedValidatorRules_, parsedSpec, context, attrs,
          resultForBestAttempt);
      if (resultForBestAttempt.status !==
          amp.validator.ValidationResult.Status.FAIL) {
        this.referencePointsMatched_.push(parsedSpec.getId());
        return;
      }
    }
    this.referencePointsMatched_.push(-1);
    goog.asserts.assert(
        resultForBestAttempt.status ===
        amp.validator.ValidationResult.Status.FAIL);
    if (!amp.validator.GENERATE_DETAILED_ERRORS) {
      result.status = amp.validator.ValidationResult.Status.FAIL;
      return;
    }
    // Special case: only one reference point defined - emit a singular
    // error message *and* merge in the errors from the best attempt above.
    if (this.parsedReferencePoints_.size() === 1) {
      context.addError(
          amp.validator.ValidationError.Severity.ERROR,
          amp.validator.ValidationError.Code
              .CHILD_TAG_DOES_NOT_SATISFY_REFERENCE_POINT_SINGULAR,
          context.getDocLocator(),
          /*params*/
          [
            context.getTagStack().getCurrent(),
            this.parsedReferencePoints_.parentTagSpecName(),
            this.parsedReferencePoints_.iterate()[0].point.tagSpecName
          ],
          this.parsedReferencePoints_.parentSpecUrl(), result);
      result.mergeFrom(resultForBestAttempt);
      return;
    }
    // General case: more than one reference point defined. Emit a plural
    // message with the acceptable reference points listed.
    const acceptable = [];
    for (const p of this.parsedReferencePoints_.iterate()) {
      acceptable.push(p.point.tagSpecName);
    }
    context.addError(
        amp.validator.ValidationError.Severity.ERROR,
        amp.validator.ValidationError.Code
            .CHILD_TAG_DOES_NOT_SATISFY_REFERENCE_POINT,
        context.getDocLocator(),
        /*params*/
        [
          context.getTagStack().getCurrent(),
          this.parsedReferencePoints_.parentTagSpecName(), acceptable.join(', ')
        ],
        this.parsedReferencePoints_.parentSpecUrl(), result);
  }

  /**
   * This method gets invoked when we're done with processing all the
   * child tags, so now we can determine whether any reference points
   * remain unsatisfied or duplicate.
   * @param {!Context} context
   * @param {!Array<!ParsedTagSpec>} tagSpecById
   * @param {!amp.validator.ValidationResult} result
   */
  exitParentTag(context, tagSpecById, result) {
    if (this.parsedReferencePoints_.empty()) return;

    /** @type {!Object<number, number>} */
    const referencePointByCount = {};
    for (const r of this.referencePointsMatched_) {
      referencePointByCount[r] = referencePointByCount.hasOwnProperty(r) ?
          (referencePointByCount[r] + 1) :
          1;
    }
    for (const p of this.parsedReferencePoints_.iterate()) {
      if (p.point.mandatory &&
          !referencePointByCount.hasOwnProperty(p.tagSpecId)) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code
                  .MANDATORY_REFERENCE_POINT_MISSING,
              this.lineCol_,
              /*params*/
              [
                p.point.tagSpecName,
                this.parsedReferencePoints_.parentTagSpecName()
              ],
              this.parsedReferencePoints_.parentSpecUrl(), result);
        } else {
          result.status = amp.validator.ValidationResult.Status.FAIL;
          return;
        }
      }
      if (p.point.unique && referencePointByCount.hasOwnProperty(p.tagSpecId) &&
          referencePointByCount[p.tagSpecId] !== 1) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code.DUPLICATE_REFERENCE_POINT,
              this.lineCol_,
              /*params*/
              [
                p.point.tagSpecName,
                this.parsedReferencePoints_.parentTagSpecName()
              ],
              this.parsedReferencePoints_.parentSpecUrl(), result);
        } else {
          result.status = amp.validator.ValidationResult.Status.FAIL;
          return;
        }
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

/**
 * @typedef {{ tagName: string,
 *             matcher: ?ChildTagMatcher,
 *             referencePointMatcher: ?ReferencePointMatcher,
 *             dataAmpReportTestValue: ?string }}
 */
let TagStackEntry;

/**
 * This abstraction keeps track of the tag names and ChildTagMatchers
 * as we enter / exit tags in the document. Closing tags is tricky:
 * - For tags with no end tag per spec, we close them in EnterTag when
 *   another tag is encountered.
 * - In addition, we assume that all end tags are optional and we close,
 *   that is, pop off tags our stack, lazily as we encounter parent closing
 *   tags. This part differs slightly from the behavior per spec: instead of
 *   closing an <option> tag when a following <option> tag is seen, we close
 *   it when the parent closing tag (in practice <select>) is encountered.
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
  }

  /**
   * Enter a tag, opening a scope for child tags. Reason |context| and
   * |result| are provided is that entering a tag can close the previous
   * tag, which can trigger validation (e.g., the previous tag may be
   * required to have two child tags).
   * @param {string} tagName
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} result
   * @param {!Array<string>} encounteredAttrs Alternating key/value pairs.
   */
  enterTag(tagName, context, result, encounteredAttrs) {
    let maybeDataAmpReportTestValue = null;
    if (amp.validator.GENERATE_DETAILED_ERRORS) {
      for (let i = 0; i < encounteredAttrs.length; i += 2) {
        const attrName = encounteredAttrs[i];
        const attrValue = encounteredAttrs[i + 1];
        if (attrName === 'data-amp-report-test') {
          maybeDataAmpReportTestValue = attrValue;
          break;
        }
      }
    }
    this.stack_.push({
      tagName: tagName,
      matcher: null,
      referencePointMatcher: null,
      dataAmpReportTestValue: maybeDataAmpReportTestValue
    });
  }

  /**
   * Sets the tag matcher for the tag which is currently on the stack.
   * This gets called shortly after EnterTag for a given tag.
   * @param {?ChildTagMatcher} matcher
   */
  setChildTagMatcher(matcher) {
    this.stack_[this.stack_.length - 1].matcher = matcher;
  }

  /**
   * Sets the reference point matcher for the tag which is currently
   * on the stack. This gets called shortly after EnterTag for a given tag.
   * @param {?ReferencePointMatcher} matcher
   */
  setReferencePointMatcher(matcher) {
    this.stack_[this.stack_.length - 1].referencePointMatcher = matcher;
  }

  /**
   * @return {?ReferencePointMatcher}
   */
  currentReferencePointMatcher() {
    return this.stack_[this.stack_.length - 1].referencePointMatcher;
  }

  /**
   * @return {?ReferencePointMatcher}
   */
  parentReferencePointMatcher() {
    if (this.stack_.length < 2) {
      return null;
    }
    return this.stack_[this.stack_.length - 2].referencePointMatcher;
  }

  /**
   * This method is called as we're visiting a tag; so the matcher we
   * need here is the one provided/specified for the tag parent.
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} result
   */
  matchChildTagName(context, result) {
    if (this.stack_.length < 2) {
      return;
    }
    const matcher = this.stack_[this.stack_.length - 2].matcher;
    if (matcher !== null) {
      matcher.matchChildTagName(context, result);
    }
  }

  /**
   * Upon exiting a tag, validation for the current matcher is triggered,
   * e.g. for checking that the tag had some specified number of children.
   * @param {string} tagName
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} result
   */
  exitTag(tagName, context, result) {
    const top = this.stack_.pop();
    if (top.matcher !== null) {
      top.matcher.exitTag(context, result);
    }
  }

  /**
   * The name of the current tag.
   * @return {string}
   */
  getCurrent() {
    goog.asserts.assert(this.stack_.length > 0, 'Empty tag stack.');
    return this.stack_[this.stack_.length - 1].tagName;
  };

  /**
   * The value of the data-amp-report-test attribute for the current tag,
   * which may be null.
   * @return {?string}
   */
  getReportTestValue() {
    if (this.stack_.length > 0)
      return this.stack_[this.stack_.length - 1].dataAmpReportTestValue;
    return null;
  };

  /**
   * The name of the parent of the current tag.
   * @return {string}
   */
  getParent() {
    if (this.stack_.length >= 2) {
      return this.stack_[this.stack_.length - 2].tagName;
    }
    return '$ROOT';
  }

  /**
   * Returns true if the current tag has ancestor with the given tag name.
   * @param {string} ancestor
   * @return {boolean}
   */
  hasAncestor(ancestor) {
    // Skip the last element, which is the current tag.
    for (let i = 0; i < this.stack_.length - 1; ++i) {
      if (this.stack_[i].tagName === ancestor) {
        return true;
      }
    }
    return false;
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
    } else if (atRuleSpec.name === atRuleName) {
      return atRuleSpec.type !==
          amp.validator.AtRuleSpec.BlockType.PARSE_AS_ERROR;
    }
  }

  goog.asserts.assert(defaultType !== '');
  return defaultType !== amp.validator.AtRuleSpec.BlockType.PARSE_AS_ERROR;
}

/** @private */
class InvalidAtRuleVisitor extends parse_css.RuleVisitor {
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
    /** @type {boolean} */
    this.errorsSeen = false;
  }

  /** @inheritDoc */
  visitAtRule(atRule) {
    if (!isAtRuleValid(this.cssSpec, atRule.name)) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        this.context.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_AT_RULE,
            new LineCol(atRule.line, atRule.col),
            /* params */[getTagSpecName(this.tagSpec), atRule.name],
            /* url */ '', this.result);
      } else {
        this.result.status = amp.validator.ValidationResult.Status.FAIL;
      }
      this.errorsSeen = true;
    }
  }
}

/**
 * Generates an AT Rule Parsing Spec from a CssSpec.
 * @param {!amp.validator.CssSpec} cssSpec
 * @return {!Object<string, parse_css.BlockType>}
 */
function computeAtRuleParsingSpec(cssSpec) {
  /** @type {!Object<string, parse_css.BlockType>} */
  const ampAtRuleParsingSpec = {};
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
  return ampAtRuleParsingSpec;
}

/**
 * Returns the default AT rule parsing spec.
 * @param {!Object<string,parse_css.BlockType>} atRuleParsingSpec
 * @return {parse_css.BlockType}
 */
function computeAtRuleDefaultParsingSpec(atRuleParsingSpec) {
  const ret = atRuleParsingSpec['$DEFAULT'];
  goog.asserts.assert(ret !== undefined, 'No default atRuleSpec found');
  return ret;
}

/**
 * This matcher maintains a constraint to check which an opening tag
 * introduces: a tag's cdata matches constraints set by it's cdata
 * spec. Unfortunately we need to defer such checking and can't
 * handle it while the opening tag is being processed.
 * @private
 */
class CdataMatcher {
  /**
   * @param {!amp.validator.TagSpec} tagSpec
   */
  constructor(tagSpec) {
    /** @private @type {!amp.validator.TagSpec} */
    this.tagSpec_ = tagSpec;

    // The CDataMatcher in Javascript also keeps track of the line/column
    // information from the context when it was created. This is necessary
    // because this code does not have control over the advancement of the
    // DocLocator instance (in Context) over the document, so by the time
    // we know that there's something wrong with the cdata for a tag,
    // we've advanced past the tag. This information gets filled in
    // by Context.setCdataMatcher.

    if (!amp.validator.GENERATE_DETAILED_ERRORS) {
      /** @private @type {!LineCol} */
      this.lineCol_ = new LineCol(1, 0);
    }

    /**
     * @type {RegExp} cdataRegex
     * @private
     */
    this.cdataRegex_ = null;
    if (tagSpec.cdata !== null && tagSpec.cdata.cdataRegex !== null) {
      this.cdataRegex_ = new RegExp('^(' + tagSpec.cdata.cdataRegex + ')$');
    }

    /** @type {string} */
    var blacklistedCdataRegexStr = '';
    if (tagSpec.cdata !== null) {
      for (const blacklist of tagSpec.cdata.blacklistedCdataRegex) {
        blacklistedCdataRegexStr += blacklist + '|';
      }
    }
    /**
     * @type {RegExp} blacklistedCdataRegex
     * @private
     */
    this.blacklistedCdataRegex_ = null;
    if (blacklistedCdataRegexStr !== '') {
      this.blacklistedCdataRegex_ =
          new RegExp('(' + blacklistedCdataRegexStr + ')', 'i');
    }
  }

  /**
   * @return {boolean}
   */
  hasCdataRegex() {
    return this.cdataRegex_ !== null;
  }

  /**
   * @return {RegExp} cdataRegex
   */
  getCdataRegex() {
    return this.cdataRegex_;
  }

  /**
   * @return {boolean}
   */
  hasBlacklistedCdataRegex() {
    return this.blacklistedCdataRegex_ !== null;
  }

  /**
   * @return {RegExp} blacklistedCdataRegex
   */
  getBlacklistedCdataRegex() {
    return this.blacklistedCdataRegex_;
  }

  /**
   * Matches the provided cdata against what this matcher expects.
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
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code.STYLESHEET_TOO_LONG,
              context.getDocLocator(),
              /* params */
              [
                getTagSpecName(this.tagSpec_), bytes.toString(),
                cdataSpec.maxBytes.toString()
              ],
              cdataSpec.maxBytesSpecUrl, validationResult);
        } else {
          validationResult.status = amp.validator.ValidationResult.Status.FAIL;
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
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code
                  .MANDATORY_CDATA_MISSING_OR_INCORRECT,
              context.getDocLocator(),
              /* params */[getTagSpecName(this.tagSpec_)],
              this.tagSpec_.specUrl, validationResult);
        } else {
          validationResult.status = amp.validator.ValidationResult.Status.FAIL;
        }
      }
      // We return early if the cdata has an exact match rule. The
      // spec shouldn't have an exact match rule that doesn't validate.
      return;
    } else if (this.hasCdataRegex()) {
      if (!this.getCdataRegex().test(cdata)) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code
                  .MANDATORY_CDATA_MISSING_OR_INCORRECT,
              context.getDocLocator(),
              /* params */[getTagSpecName(this.tagSpec_)],
              this.tagSpec_.specUrl, validationResult);
        } else {
          validationResult.status = amp.validator.ValidationResult.Status.FAIL;
        }
        return;
      }
    } else if (cdataSpec.cssSpec !== null) {
      /** @type {!Array<!parse_css.ErrorToken>} */
      const cssErrors = [];
      /** @type {!Array<!parse_css.Token>} */
      const tokenList = parse_css.tokenize(
          cdata,
          amp.validator.GENERATE_DETAILED_ERRORS ? this.getLineCol().getLine() :
                                                   undefined,
          amp.validator.GENERATE_DETAILED_ERRORS ? this.getLineCol().getCol() :
                                                   undefined,
          cssErrors);
      if (!amp.validator.GENERATE_DETAILED_ERRORS && cssErrors.length > 0) {
        validationResult.status = amp.validator.ValidationResult.Status.FAIL;
        return;
      }
      /** @type {!Object<string,parse_css.BlockType>} */
      const atRuleParsingSpec = computeAtRuleParsingSpec(cdataSpec.cssSpec);
      /** @type {!parse_css.Stylesheet} */
      const sheet = parse_css.parseAStylesheet(
          tokenList, atRuleParsingSpec,
          computeAtRuleDefaultParsingSpec(atRuleParsingSpec), cssErrors);
      if (!amp.validator.GENERATE_DETAILED_ERRORS && cssErrors.length > 0) {
        validationResult.status = amp.validator.ValidationResult.Status.FAIL;
        return;
      }

      // We extract the urls from the stylesheet. As a side-effect, this can
      // generate errors for url(…) functions with invalid parameters.
      /** @type {!Array<!parse_css.ParsedCssUrl>} */
      const parsedUrls = [];
      parse_css.extractUrls(sheet, parsedUrls, cssErrors);
      if (cdataSpec.cssSpec.validateAmp4Ads) {
        parse_css.validateAmp4AdsCss(sheet, cssErrors);
      }

      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        for (const errorToken of cssErrors) {
          // Override the first parameter with the name of this style tag.
          let params = errorToken.params;
          // Override the first parameter with the name of this style tag.
          params[0] = getTagSpecName(this.tagSpec_);
          context.addError(
              amp.validator.ValidationError.Severity.ERROR, errorToken.code,
              new LineCol(errorToken.line, errorToken.col), params,
              /* url */ '', validationResult);
        }
      } else if (cssErrors.length > 0) {
        validationResult.status = amp.validator.ValidationResult.Status.FAIL;
        return;
      }
      const parsedFontUrlSpec =
          new ParsedUrlSpec(cdataSpec.cssSpec.fontUrlSpec);
      const parsedImageUrlSpec =
          new ParsedUrlSpec(cdataSpec.cssSpec.imageUrlSpec);
      for (const url of parsedUrls) {
        ((url.atRuleScope === 'font-face') ? parsedFontUrlSpec :
                                             parsedImageUrlSpec)
            .validateUrlAndProtocolInStylesheet(
                context, url, this.tagSpec_, validationResult);
      }
      const visitor = new InvalidAtRuleVisitor(
          this.tagSpec_, cdataSpec.cssSpec, context, validationResult);
      sheet.accept(visitor);

      // As a hack to not report some errors twice, both via the css parser
      // and via the regular expressions below, we return early if there
      // are parser errors and skip the regular expression errors.
      if (visitor.errorsSeen || cssErrors.length > 0) return;
    }
    // } end oneof

    // Blacklisted CDATA Regular Expressions
    // We use a combined regex as a fast test. If it matches, we re-match
    // against each individual regex so that we can generate better error
    // messages.
    if (this.hasBlacklistedCdataRegex() &&
        this.getBlacklistedCdataRegex().test(cdata)) {
      for (const blacklist of cdataSpec.blacklistedCdataRegex) {
        const blacklistRegex = new RegExp(blacklist.regex, 'i');
        if (blacklistRegex.test(cdata)) {
          if (amp.validator.GENERATE_DETAILED_ERRORS) {
            context.addError(
                amp.validator.ValidationError.Severity.ERROR,
                amp.validator.ValidationError.Code.CDATA_VIOLATES_BLACKLIST,
                context.getDocLocator(),
                /* params */
                [getTagSpecName(this.tagSpec_), blacklist.errorMessage],
                this.tagSpec_.specUrl, validationResult);
          } else {
            validationResult.status =
                amp.validator.ValidationResult.Status.FAIL;
            return;
          }
        }
      }
    }
  }

  /** @param {!LineCol} lineCol */
  setLineCol(lineCol) {
    this.lineCol_ = lineCol;
  }

  /** @return {!LineCol} */
  getLineCol() {
    return this.lineCol_;
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
  constructor() {
    /**
     * The mandatory alternatives that we've validated.
     * @type {!Object<string, ?>}
     * @private
     */
    this.mandatoryAlternativesSatisfied_ = {};
    /**
     * DocLocator object from the parser which gives us line/col numbers.
     * @type {amp.htmlparser.DocLocator}
     * @private
     */
    this.docLocator_ = null;

    /**
     * @type {?CdataMatcher}
     * @private
     */
    this.cdataMatcher_ = null;

    /**
     * @type {!TagStack}
     * @private
     */
    this.tagStack_ = new TagStack();

    /**
     * Maps from the tagspec id to the tagspec id.
     * @type {!Object<number, ?>}
     * @private
     */
    this.tagspecsValidated_ = {};

    /**
     * Set of conditions that we've satisfied.
     * @type {!Object<string, ?>}
     * @private
     */
    this.conditionsSatisfied_ = {};

    /**
     * First tagspec seen (matched) which contains an URL.
     * @type {?amp.validator.TagSpec}
     * @private
     */
    this.firstUrlSeenTag_ = null;
  }

  /**
   * Callback before startDoc which gives us a document locator.
   * @param {!amp.htmlparser.DocLocator} locator
   */
  setDocLocator(locator) {
    this.docLocator_ = locator;
  }

  /** @return {amp.htmlparser.DocLocator} */
  getDocLocator() {
    return this.docLocator_;
  }

  /**
   * @param {!amp.validator.ValidationError.Severity} severity
   * @param {!amp.validator.ValidationError.Code} validationErrorCode Error code
   * @param {LineCol|amp.htmlparser.DocLocator} lineCol a line / column pair.
   * @param {!Array<string>} params
   * @param {?string} specUrl a link (URL) to the amphtml spec
   * @param {!amp.validator.ValidationResult} validationResult
   */
  addError(
      severity, validationErrorCode, lineCol, params, specUrl,
      validationResult) {
    // If any of the errors amount to more than a WARNING, validation fails.
    if (severity !== amp.validator.ValidationError.Severity.WARNING) {
      validationResult.status = amp.validator.ValidationResult.Status.FAIL;
    }
    const error = new amp.validator.ValidationError();
    error.severity = severity;
    error.code = validationErrorCode;
    error.params = params;
    error.line = lineCol.getLine();
    error.col = lineCol.getCol();
    error.specUrl = (specUrl === null ? '' : specUrl);
    const reportTestValue = this.tagStack_.getReportTestValue();
    if (reportTestValue !== null)
      error.dataAmpReportTestValue = reportTestValue;
    goog.asserts.assert(validationResult.errors !== undefined);
    validationResult.errors.push(error);
  }

  /**
   * Records a condition that's been validated. Returns true iff
   * `condition` has not been seen before.
   * @param {string} condition
   * @return {boolean} whether or not condition has been seen before.
   */
  satisfyCondition(condition) {
    const duplicate = this.conditionsSatisfied_.hasOwnProperty(condition);
    if (!duplicate) {
      this.conditionsSatisfied_[condition] = 0;
    }
    return !duplicate;
  }

  /**
   * @return {!Object<number, ?>}
   */
  conditionsSatisfied() {
    return this.conditionsSatisfied_;
  }

  /**
   * Records that a Tag was seen which contains an URL. Used to note issues
   * with <base href> occurring in the document after an URL.
   * @param {amp.validator.TagSpec} tagSpec
   */
  markUrlSeen(tagSpec) {
    this.firstUrlSeenTag_ = tagSpec;
  }

  /**
   * Returns true iff the current context has observed a tag which contains
   * an URL. This is set by calling markUrlSeen above.
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
   * Records a tag spec that's been validated. This method is only used by
   * ParsedValidatorRules, which by itself does not have any mutable state.
   * @param {number} tagSpecId id of tagSpec to record.
   * @return {boolean} whether or not the tag spec had been encountered before.
   */
  recordTagspecValidated(tagSpecId) {
    const duplicate = this.tagspecsValidated_.hasOwnProperty(tagSpecId);
    if (!duplicate) {
      this.tagspecsValidated_[tagSpecId] = 0;
    }
    return !duplicate;
  }

  /**
   * @return {!Object<number, ?>}
   */
  getTagspecsValidated() {
    return this.tagspecsValidated_;
  }

  /**
   * For use by |ParsedValidatorRules|, which doesn't have any mutable state.
   * @param {string} alternative id of the validated alternative.
   */
  recordMandatoryAlternativeSatisfied(alternative) {
    this.mandatoryAlternativesSatisfied_[alternative] = 0;
  }

  /**
   * The mandatory alternatives that we've satisfied.
   * @return {!Object<string, ?>}
   */
  getMandatoryAlternativesSatisfied() {
    return this.mandatoryAlternativesSatisfied_;
  }

  /** @return {?CdataMatcher} */
  getCdataMatcher() {
    return this.cdataMatcher_;
  }

  /** @param {CdataMatcher} matcher */
  setCdataMatcher(matcher) {
    if (amp.validator.GENERATE_DETAILED_ERRORS && matcher !== null) {
      // We store away the position from when the matcher was created
      // so we can use it to generate error messages relating to the opening
      // tag.
      matcher.setLineCol(
          new LineCol(this.docLocator_.getLine(), this.docLocator_.getCol()));
    }
    this.cdataMatcher_ = matcher;
  }

  /** @return {!TagStack} */
  getTagStack() {
    return this.tagStack_;
  }

  /** @param {?ChildTagMatcher} matcher */
  setChildTagMatcher(matcher) {
    if (amp.validator.GENERATE_DETAILED_ERRORS && matcher !== null) {
      matcher.setLineCol(
          new LineCol(this.docLocator_.getLine(), this.docLocator_.getCol()));
    }
    this.tagStack_.setChildTagMatcher(matcher);
  }

  /** @param {?ReferencePointMatcher} matcher */
  setReferencePointMatcher(matcher) {
    if (amp.validator.GENERATE_DETAILED_ERRORS && matcher !== null) {
      matcher.setLineCol(
          new LineCol(this.docLocator_.getLine(), this.docLocator_.getCol()));
    }
    this.tagStack_.setReferencePointMatcher(matcher);
  }
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
    this.allowedProtocols_ = {};
    if (this.spec_ !== null) {
      for (const protocol of this.spec_.allowedProtocol) {
        this.allowedProtocols_[protocol] = 0;
      }
    }

    /**
     * @type {!Object<string, number>}
     * @private
     */
    this.disallowedDomains_ = {};
    if (this.spec_ !== null) {
      for (const domain of this.spec_.disallowedDomain) {
        this.disallowedDomains_[domain] = 0;
      }
    }
  }

  /**
   * @param {!Context} context
   * @param {string} attrName
   * @param {string} url
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  validateUrlAndProtocolInAttr(context, attrName, url, tagSpec, result) {
    this.validateUrlAndProtocol(
        new ParsedUrlSpec.AttrErrorAdapter_(attrName), context, url, tagSpec,
        result);
  }

  /**
   * @param {!Context} context
   * @param {!parse_css.ParsedCssUrl} url
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  validateUrlAndProtocolInStylesheet(context, url, tagSpec, result) {
    this.validateUrlAndProtocol(
        new ParsedUrlSpec.StylesheetErrorAdapter_(url.line, url.col), context,
        url.utf8Url, tagSpec, result);
  }

  /**
   * @param
   * {ParsedUrlSpec.AttrErrorAdapter_|ParsedUrlSpec.StylesheetErrorAdapter_}
   * adapter
   * @param {!Context} context
   * @param {string} urlStr
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  validateUrlAndProtocol(adapter, context, urlStr, tagSpec, result) {
    const onlyWhitespaceRe = /^[\s\xa0]*$/;  // includes non-breaking space
    if (urlStr.match(onlyWhitespaceRe) !== null &&
        (this.spec_.allowEmpty === null || this.spec_.allowEmpty === false)) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        adapter.missingUrl(context, tagSpec, result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      }
      return;
    }
    const url = new parse_url.URL(urlStr);
    if (!url.isValid) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        adapter.invalidUrl(context, urlStr, tagSpec, result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      }
      return;
    }
    // Technically, an URL such as "script :alert('foo')" is considered a
    // relative URL, similar to "./script%20:alert(%27foo%27)" since space is
    // not a legal character in a URL protocol. This is what parse_url.URL will
    // determine. However, some very old browsers will ignore whitespace in URL
    // protocols and will treat this as javascript execution. We must be safe
    // regardless of the client. This RE is much more aggressive at extracting
    // a protcol than parse_url.URL for this reason.
    const re = /^([^:\/?#.]+):.*$/;
    const match = re.exec(urlStr);
    let protocol = '';
    if (match !== null) {
      protocol = match[1];
      protocol = protocol.toLowerCase().trimLeft();
    } else {
      protocol = url.protocol;
    }
    if (protocol.length > 0 &&
        !this.allowedProtocols_.hasOwnProperty(protocol)) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        adapter.invalidUrlProtocol(context, protocol, tagSpec, result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      }
      return;
    }
    if (!this.spec_.allowRelative &&
        (!url.hasProtocol || url.protocol.length == 0)) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        adapter.disallowedRelativeUrl(context, urlStr, tagSpec, result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      }
      return;
    }
    const domain = url.host.toLowerCase();
    if (domain.length > 0 &&
        this.disallowedDomains_.hasOwnProperty(domain)) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        adapter.disallowedDomain(context, domain, tagSpec, result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      }
      return;
    }
  }
}

/**
 * @private
 */
ParsedUrlSpec.AttrErrorAdapter_ = class {
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
        amp.validator.ValidationError.Severity.ERROR,
        amp.validator.ValidationError.Code.MISSING_URL, context.getDocLocator(),
        /* params */[this.attrName_, getTagSpecName(tagSpec)], tagSpec.specUrl,
        result);
  }

  /**
   * @param {!Context} context
   * @param {string} url
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  invalidUrl(context, url, tagSpec, result) {
    context.addError(
        amp.validator.ValidationError.Severity.ERROR,
        amp.validator.ValidationError.Code.INVALID_URL, context.getDocLocator(),
        /* params */[this.attrName_, getTagSpecName(tagSpec), url],
        tagSpec.specUrl, result);
  }

  /**
   * @param {!Context} context
   * @param {string} protocol
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  invalidUrlProtocol(context, protocol, tagSpec, result) {
    context.addError(
        amp.validator.ValidationError.Severity.ERROR,
        amp.validator.ValidationError.Code.INVALID_URL_PROTOCOL,
        context.getDocLocator(),
        /* params */[this.attrName_, getTagSpecName(tagSpec), protocol],
        tagSpec.specUrl, result);
  }

  /**
   * @param {!Context} context
   * @param {string} domain
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  disallowedDomain(context, domain, tagSpec, result) {
    context.addError(
        amp.validator.ValidationError.Severity.ERROR,
        amp.validator.ValidationError.Code.DISALLOWED_DOMAIN,
        context.getDocLocator(),
        /* params */[this.attrName_, getTagSpecName(tagSpec), domain],
        tagSpec.specUrl, result);
  }

  /**
   * @param {!Context} context
   * @param {string} url
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  disallowedRelativeUrl(context, url, tagSpec, result) {
    context.addError(
        amp.validator.ValidationError.Severity.ERROR,
        amp.validator.ValidationError.Code.DISALLOWED_RELATIVE_URL,
        context.getDocLocator(),
        /* params */[this.attrName_, getTagSpecName(tagSpec), url],
        tagSpec.specUrl, result);
  }
};

/**
 * @private
 */
ParsedUrlSpec.StylesheetErrorAdapter_ = class {
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
        amp.validator.ValidationError.Severity.ERROR,
        amp.validator.ValidationError.Code.CSS_SYNTAX_MISSING_URL,
        this.lineCol_,
        /* params */[getTagSpecName(tagSpec)], tagSpec.specUrl, result);
  }

  /**
   * @param {!Context} context
   * @param {string} url
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  invalidUrl(context, url, tagSpec, result) {
    context.addError(
        amp.validator.ValidationError.Severity.ERROR,
        amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_URL,
        this.lineCol_,
        /* params */[getTagSpecName(tagSpec), url], tagSpec.specUrl, result);
  }

  /**
   * @param {!Context} context
   * @param {string} protocol
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  invalidUrlProtocol(context, protocol, tagSpec, result) {
    context.addError(
        amp.validator.ValidationError.Severity.ERROR,
        amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_URL_PROTOCOL,
        this.lineCol_,
        /* params */[getTagSpecName(tagSpec), protocol], tagSpec.specUrl,
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
        amp.validator.ValidationError.Severity.ERROR,
        amp.validator.ValidationError.Code.CSS_SYNTAX_DISALLOWED_DOMAIN,
        this.lineCol_,
        /* params */[getTagSpecName(tagSpec), domain], tagSpec.specUrl, result);
  }

  /**
   * @param {!Context} context
   * @param {string} url
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  disallowedRelativeUrl(context, url, tagSpec, result) {
    context.addError(
        amp.validator.ValidationError.Severity.ERROR,
        amp.validator.ValidationError.Code.CSS_SYNTAX_DISALLOWED_RELATIVE_URL,
        this.lineCol_,
        /* params */[getTagSpecName(tagSpec), url], tagSpec.specUrl, result);
  }
};

/**
 * ParsedAttrTriggerSpec is used by ParsedAttrSpec to determine which
 * attributes also require another attribute for some given set of
 * conditions.
 * (e.g. attr name: "on" if_value_regex: "tap:.*" also_require_attr: "role")
 * @private
 */
class ParsedAttrTriggerSpec {
  /**
   * @param {!amp.validator.AttrSpec} attrSpec
   */
  constructor(attrSpec) {
    /**
     * JSON Attribute Trigger Spec dictionary.
     * @type {amp.validator.AttrTriggerSpec}
     * @private
     */
    this.spec_ = attrSpec.trigger;

    /**
     * @type {string} attrName
     * @private
     */
    this.attrName_ = attrSpec.name;

    /**
     * @type {RegExp} ifValueRegex
     * @private
     */
    this.ifValueRegex_ = null;

    if (this.spec_ !== null && this.spec_.ifValueRegex !== null) {
      this.ifValueRegex_ = new RegExp('^(' + this.spec_.ifValueRegex + ')$');
    }
  }

  /**
   * @return {boolean}
   */
  hasIfValueRegex() {
    return this.ifValueRegex_ !== null;
  }

  /**
   * @return {RegExp} ifValueRegex
   */
  getIfValueRegex() {
    return this.ifValueRegex_;
  }

  /**
   * @return {string} attrName
   */
  getAttrName() {
    return this.attrName_;
  }

  /**
   * @return {amp.validator.AttrTriggerSpec}
   */
  getSpec() {
    return this.spec_;
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
     * @type {ParsedAttrTriggerSpec}
     * @private
     */
    this.triggerSpec_ = null;
    if (this.spec_.trigger !== null) {
      this.triggerSpec_ = new ParsedAttrTriggerSpec(this.spec_);
    }
    /**
     * @type {!ParsedUrlSpec}
     * @private
     */
    this.valueUrlSpec_ = new ParsedUrlSpec(this.spec_.valueUrl);
    /**
     * @type {!Object<string, !amp.validator.PropertySpec>}
     * @private
     */
    this.valuePropertyByName_ = {};
    const mandatoryValuePropertyNames = [];
    if (this.spec_.valueProperties !== null) {
      for (const propertySpec of this.spec_.valueProperties.properties) {
        this.valuePropertyByName_[propertySpec.name] = propertySpec;
        if (propertySpec.mandatory) {
          mandatoryValuePropertyNames.push(propertySpec.name);
        }
      }
    }
    /**
     * @type {!Array<string>}
     * @private
     */
    this.mandatoryValuePropertyNames_ =
        sortAndUniquify(mandatoryValuePropertyNames);

    /**
     * @type {RegExp} valueRegex
     * @private
     */
    this.valueRegex_ = null;
    if (this.spec_ !== null && this.spec_.valueRegex !== null) {
      this.valueRegex_ = new RegExp('^(' + this.spec_.valueRegex + ')$');
    }

    /**
     * @type {RegExp} valueRegexCasei
     * @private
     */
    this.valueRegexCasei_ = null;
    if (this.spec_ !== null && this.spec_.valueRegexCasei !== null) {
      this.valueRegexCasei_ =
          new RegExp('^(' + this.spec_.valueRegexCasei + ')$', 'i');
    }

    /**
     * @type {RegExp} blacklistedValueRegex
     * @private
     */
    this.blacklistedValueRegex_ = null;
    if (this.spec_ !== null && this.spec_.blacklistedValueRegex !== null) {
      this.blacklistedValueRegex_ =
          new RegExp(this.spec_.blacklistedValueRegex, 'i');
    }
  }

  /**
   * @return {boolean}
   */
  hasValueRegex() {
    return this.valueRegex_ !== null;
  }

  /**
   * @return {RegExp} valueRegex
   */
  getValueRegex() {
    return this.valueRegex_;
  }

  /**
   * @return {boolean}
   */
  hasValueRegexCasei() {
    return this.valueRegexCasei_ !== null;
  }

  /**
   * @return {RegExp} valueRegex
   */
  getValueRegexCasei() {
    return this.valueRegexCasei_;
  }

  /**
   * @return {boolean}
   */
  hasBlacklistedValueRegex() {
    return this.blacklistedValueRegex_ !== null;
  }

  /**
   * @return {RegExp} blacklistedValueRegex
   */
  getBlacklistedValueRegex() {
    return this.blacklistedValueRegex_;
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
   * @return {boolean}
   */
  hasTriggerSpec() {
    return this.triggerSpec_ !== null;
  }

  /**
   * @return {ParsedAttrTriggerSpec}
   */
  getTriggerSpec() {
    return this.triggerSpec_;
  }

  /**
   * @param {!Context} context
   * @param {string} attrName
   * @param {string} attrValue
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  validateNonTemplateAttrValueAgainstSpec(
      context, attrName, attrValue, tagSpec, result) {
    // The value, value_regex, value_url, and value_properties fields are
    // treated like a oneof, but we're not using oneof because it's
    // a feature that was added after protobuf 2.5.0 (which our
    // open-source version uses).
    // begin oneof {
    if (this.spec_.value !== null) {
      if (attrValue === this.spec_.value) {
        return;
      }
      // Allow spec's with value: "" to also be equal to their attribute
      // name (e.g. script's spec: async has value: "" so both
      // async and async="async" is okay in a script tag).
      if ((this.spec_.value == '') && (attrValue == attrName)) {
        return;
      }
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        context.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
            context.getDocLocator(),
            /* params */[attrName, getTagSpecName(tagSpec), attrValue],
            tagSpec.specUrl, result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
        return;
      }
    } else if (this.spec_.valueCasei !== null) {
      if (attrValue.toLowerCase() === this.spec_.valueCasei) {
        return;
      }
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        context.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
            context.getDocLocator(),
            /* params */[attrName, getTagSpecName(tagSpec), attrValue],
            tagSpec.specUrl, result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
        return;
      }
    } else if (this.hasValueRegex() || this.hasValueRegexCasei()) {
      let valueRegex;
      if (this.hasValueRegex()) {
        valueRegex = this.getValueRegex();
      } else {
        valueRegex = this.getValueRegexCasei();
      }
      if (!valueRegex.test(attrValue)) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
              context.getDocLocator(),
              /* params */[attrName, getTagSpecName(tagSpec), attrValue],
              tagSpec.specUrl, result);
        } else {
          result.status = amp.validator.ValidationResult.Status.FAIL;
          return;
        }
      }
    } else if (this.spec_.valueUrl !== null) {
      this.validateAttrValueUrl(context, attrName, attrValue, tagSpec, result);
    } else if (this.spec_.valueProperties !== null) {
      this.validateAttrValueProperties(
          context, attrName, attrValue, tagSpec, result);
    }
    // } end oneof
  }

  /**
   * @param {!Context} context
   * @param {string} attrName
   * @param {string} attrValue
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   * @private
   */
  validateAttrValueUrl(context, attrName, attrValue, tagSpec, result) {
    /** @type {!Array<string>} */
    let maybeUris = [];
    if (attrName !== 'srcset') {
      maybeUris.push(attrValue);
    } else {
      if (attrValue === '') {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code.MISSING_URL,
              context.getDocLocator(),
              /* params */[attrName, getTagSpecName(tagSpec)], tagSpec.specUrl,
              result);
        } else {
          result.status = amp.validator.ValidationResult.Status.FAIL;
        }
        return;
      }
      /** @type {!parse_srcset.SrcsetParsingResult} */
      const parseResult = parse_srcset.parseSrcset(attrValue);
      if (!parseResult.success) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              parseResult.errorCode, context.getDocLocator(),
              /* params */[attrName, getTagSpecName(tagSpec), attrValue],
              tagSpec.specUrl, result);
        } else {
          result.status = amp.validator.ValidationResult.Status.FAIL;
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
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        context.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code.MISSING_URL,
            context.getDocLocator(),
            /* params */[attrName, getTagSpecName(tagSpec)], tagSpec.specUrl,
            result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      }
      return;
    }
    maybeUris = sortAndUniquify(maybeUris);
    for (const maybeUri of maybeUris) {
      const unescapedMaybeUri = goog.string.unescapeEntities(maybeUri);
      this.valueUrlSpec_.validateUrlAndProtocolInAttr(
          context, attrName, unescapedMaybeUri, tagSpec, result);
      if (result.status === amp.validator.ValidationResult.Status.FAIL) {
        return;
      }
    }
  }

  /**
   * @param {!Context} context
   * @param {string} attrName
   * @param {string} attrValue
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   * @private
   */
  validateAttrValueProperties(context, attrName, attrValue, tagSpec, result) {
    // TODO(johannes): Replace this hack with a parser.
    const segments = attrValue.split(/[,;]/);
    /** @type {!Object<string, string>} */
    const properties = {};
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
      if (!this.valuePropertyByName_.hasOwnProperty(name)) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code
                  .DISALLOWED_PROPERTY_IN_ATTR_VALUE,
              context.getDocLocator(),
              /* params */[name, attrName, getTagSpecName(tagSpec)],
              tagSpec.specUrl, result);
          continue;
        } else {
          result.status = amp.validator.ValidationResult.Status.FAIL;
          return;
        }
      }
      const propertySpec = this.valuePropertyByName_[name];
      if (propertySpec.value !== null) {
        if (propertySpec.value !== value.toLowerCase()) {
          if (amp.validator.GENERATE_DETAILED_ERRORS) {
            context.addError(
                amp.validator.ValidationError.Severity.ERROR,
                amp.validator.ValidationError.Code
                    .INVALID_PROPERTY_VALUE_IN_ATTR_VALUE,
                context.getDocLocator(),
                /* params */[name, attrName, getTagSpecName(tagSpec), value],
                tagSpec.specUrl, result);
          } else {
            result.status = amp.validator.ValidationResult.Status.FAIL;
            return;
          }
        }
      } else if (propertySpec.valueDouble !== null) {
        if (parseFloat(value) !== propertySpec.valueDouble) {
          if (amp.validator.GENERATE_DETAILED_ERRORS) {
            context.addError(
                amp.validator.ValidationError.Severity.ERROR,
                amp.validator.ValidationError.Code
                    .INVALID_PROPERTY_VALUE_IN_ATTR_VALUE,
                context.getDocLocator(),
                /* params */[name, attrName, getTagSpecName(tagSpec), value],
                tagSpec.specUrl, result);
          } else {
            result.status = amp.validator.ValidationResult.Status.FAIL;
            return;
          }
        }
      }
    }
    const notSeen = subtractDiff(this.mandatoryValuePropertyNames_, names);
    if (amp.validator.GENERATE_DETAILED_ERRORS) {
      for (const name of notSeen) {
        context.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code
                .MANDATORY_PROPERTY_MISSING_FROM_ATTR_VALUE,
            context.getDocLocator(),
            /* params */[name, attrName, getTagSpecName(tagSpec)],
            tagSpec.specUrl, result);
      }
    } else {
      if (notSeen.length > 0) {
        result.status = amp.validator.ValidationResult.Status.FAIL;
        return;
      }
    }
  }
}

/**
 * TagSpecs specify attributes that are valid for a particular tag.
 * They can also reference lists of attributes (AttrLists), thereby
 * sharing those definitions. This abstraction instantiates
 * ParsedAttrSpec for each AttrSpec (from validator-*.protoascii, our
 * specification file) exactly once. To accomplish that, it keeps
 * around the attr lists with ParsedAttrSpec instances.
 * @private
 */
class ParsedAttrSpecs {
  /**
   * @param {!Array<!amp.validator.AttrList>} attrLists
   */
  constructor(attrLists) {
    /** @type {!Object<string, !Array<!ParsedAttrSpec>>} */
    this.attrListsByName = {};

    /** @private @type {!Array<!ParsedAttrSpec>} */
    this.parsedAttrSpecs_ = [];

    for (const attrList of attrLists) {
      /** @type {!Array<!ParsedAttrSpec>} */
      const parsedAttrList = [];
      for (const attrSpec of attrList.attrs) {
        const parsed =
            new ParsedAttrSpec(attrSpec, this.parsedAttrSpecs_.length);
        this.parsedAttrSpecs_.push(parsed);
        parsedAttrList.push(parsed);
      }
      this.attrListsByName[attrList.name] = parsedAttrList;
    }
  }

  /**
   * Collect the ParsedAttrSpec pointers for a given |tagspec|.
   * There are four ways to specify attributes:
   * (1) implicitly by a tag spec, if the tag spec has the amp_layout field
   * set - in this case, the AMP_LAYOUT_ATTRS are assumed;
   * (2) within a TagSpec::attrs;
   * (3) via TagSpec::attr_lists which references lists by key;
   * (4) within the $GLOBAL_ATTRS TagSpec::attr_list.
   * It's possible to provide multiple
   * specifications for the same attribute name, but for any given tag only one
   * such specification can be active. The precedence is (1), (2), (3), (4)
   * @param {!amp.validator.TagSpec} tagSpec
   * @return {!Array<!ParsedAttrSpec>} all of the ParsedAttrSpec pointers
   */
  getAttrsFor(tagSpec) {
    /** @type {!Array<!ParsedAttrSpec>} */
    const attrs = [];
    /** @type {!Object<string, ?>} */
    const namesSeen = {};
    // (1) layout attrs.
    if (tagSpec.ampLayout !== null && tagSpec.tagName !== '$REFERENCE_POINT') {
      const layoutSpecs = this.attrListsByName['$AMP_LAYOUT_ATTRS'];
      if (layoutSpecs !== undefined) {
        for (const spec of layoutSpecs) {
          const name = spec.getSpec().name;
          if (!namesSeen.hasOwnProperty(name)) {
            namesSeen[name] = 0;
            attrs.push(spec);
          }
        }
      }
    }
    // (2) attributes specified within |tagSpec|.
    for (const spec of tagSpec.attrs) {
      const name = spec.name;
      if (!namesSeen.hasOwnProperty(name)) {
        namesSeen[name] = 0;
        const parsed = new ParsedAttrSpec(spec, this.parsedAttrSpecs_.length);
        this.parsedAttrSpecs_.push(parsed);
        attrs.push(parsed);
      }
    }
    // (3) attributes specified via reference to an attr_list.
    for (const tagSpecKey of tagSpec.attrLists) {
      const specs = this.attrListsByName[tagSpecKey];
      goog.asserts.assert(specs !== undefined);
      for (const spec of specs) {
        const name = spec.getSpec().name;
        if (!namesSeen.hasOwnProperty(name)) {
          namesSeen[name] = 0;
          attrs.push(spec);
        }
      }
    }
    // (4) attributes specified in the global_attr list.
    if (tagSpec.tagName !== '$REFERENCE_POINT') {
      const globalSpecs = this.attrListsByName['$GLOBAL_ATTRS'];
      if (globalSpecs === undefined) {
        return attrs;
      }
      for (const spec of globalSpecs) {
        const name = spec.getSpec().name;
        if (!namesSeen.hasOwnProperty(name)) {
          namesSeen[name] = 0;
          attrs.push(spec);
        }
      }
    }
    return attrs;
  }

  /**
   * @param {number} id
   * @return {!ParsedAttrSpec}
   */
  getById(id) {
    return this.parsedAttrSpecs_[id];
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
 * @param {string} layout
 * @return {!amp.validator.AmpLayout.Layout}
 */
function parseLayout(layout) {
  if (layout === undefined) {
    return amp.validator.AmpLayout.Layout.UNKNOWN;
  }
  const normLayout = layout.toUpperCase().replace('-', '_');
  for (const k in amp.validator.AmpLayout.Layout) {
    if (amp.validator.AmpLayout.Layout[k] == normLayout) {
      return amp.validator.AmpLayout.Layout[k];
    }
  }
  return amp.validator.AmpLayout.Layout.UNKNOWN;
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
   */
  constructor(input, allowAuto) {
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
    }
    const re = /^(\d+(?:\.\d+)?)(px|em|rem|vh|vw|vmin|vmax)?$/;
    const match = re.exec(input);
    if (match !== null) {
      this.isValid = true;
      this.numeral = parseFloat(match[1]);
      this.unit = match[2] || 'px';
    }
  }
}

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
    return new amp.validator.CssLength('1px', /* allowAuto */ false);
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
    return new amp.validator.CssLength('1px', /* allowAuto */ false);
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
 * @param {!Object<string, ?>} tagSpecNamesToTrack
 * @return {boolean}
 */
function shouldRecordTagspecValidated(tag, tagSpecNamesToTrack) {
  return tag.mandatory || tag.unique || tag.uniqueWarning ||
      tagSpecNamesToTrack.hasOwnProperty(getTagSpecName(tag));
}

/**
 *  DispatchKey represents a tuple of either 2 or 3 strings:
 *    - attribute name
 *    - attribute value
 *    - mandatory parent html tag (optional)
 *  A Dispatch key can be generated from some validator TagSpecs. One dispatch
 *  key per attribute can be generated from any HTML tag. If one of the
 *  dispatch keys for an HTML tag match that of a a TagSpec, we validate that
 *  HTML tag against only this one TagSpec. Otherwise, this TagSpec is not
 *  eligible for validation against this HTML tag.
 * @param {string} attrName
 * @param {string} attrValue
 * @param {string} mandatoryParent may be set to "$NOPARENT"
 * @returns {string} dispatch key
 */
function makeDispatchKey(attrName, attrValue, mandatoryParent) {
  return attrName + '\0' + attrValue + '\0' + mandatoryParent;
}

/**
 * This wrapper class provides access to a TagSpec and a tag id
 * which is unique within its context, the ParsedValidatorRules.
 * @private
 */
class ParsedTagSpec {
  /**
   * @param {?string} templateSpecUrl
   * @param {!ParsedAttrSpecs} parsedAttrSpecs
   * @param {!Object<string, number>} tagSpecIdsByTagSpecName
   * @param {boolean} shouldRecordTagspecValidated
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {number} tagId
   */
  constructor(
      templateSpecUrl, parsedAttrSpecs, tagSpecIdsByTagSpecName,
      shouldRecordTagspecValidated, tagSpec, tagId) {
    /**
     * @type {!amp.validator.TagSpec}
     * @private
     */
    this.spec_ = tagSpec;
    /**
     * Globally unique attribute rule id.
     * @type {number}
     * @private
     */
    this.id_ = tagId;
    /**
     * @type {!ParsedReferencePoints}
     * @private
     */
    this.referencePoints_ =
        new ParsedReferencePoints(tagSpec, tagSpecIdsByTagSpecName);
    /**
     * @type {boolean}
     * @private
     */
    this.isReferencePoint_ = (tagSpec.tagName === '$REFERENCE_POINT');
    /**
     * ParsedAttributes keyed by name.
     * @type {!Object<string, !ParsedAttrSpec>}
     * @private
     */
    this.attrsByName_ = {};
    /**
     * Attribute ids that are mandatory for this tag to legally validate.
     * @type {!Array<number>}
     * @private
     */
    this.mandatoryAttrIds_ = [];
    /**
     * @type {!Array<string>}
     * @private
     */
    this.mandatoryOneofs_ = [];
    /**
     * @type {?string}
     * @private
     */
    this.templateSpecUrl_ = templateSpecUrl;
    /**
     * @type {!ParsedAttrSpecs}
     * @private
     */
    this.parsedAttrSpecs_ = parsedAttrSpecs;
    /**
     * @type {boolean}
     * @private
     */
    this.shouldRecordTagspecValidated_ = shouldRecordTagspecValidated;
    /**
     * @type {!Array<string>}
     * @private
     */
    this.requires_ = [];
    /**
     * @type {!Array<number>}
     * @private
     */
    this.alsoRequiresTag_ = [];
    /**
     * @type {!Array<number>}
     * @private
     */
    this.alsoRequiresTagWarning_ = [];
    /**
     * @type {ParsedAttrSpec}
     * @private
     */
    this.dispatchKeyAttrSpec_ = null;
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

    const parsedAttrs = parsedAttrSpecs.getAttrsFor(tagSpec);
    for (const parsedAttrSpec of parsedAttrs) {
      this.attrsByName_[parsedAttrSpec.getSpec().name] = parsedAttrSpec;
      if (parsedAttrSpec.getSpec().mandatory) {
        this.mandatoryAttrIds_.push(parsedAttrSpec.getId());
      }
      const mandatoryOneof = parsedAttrSpec.getSpec().mandatoryOneof;
      if (mandatoryOneof !== null) {
        this.mandatoryOneofs_.push(mandatoryOneof);
      }
      const altNames = parsedAttrSpec.getSpec().alternativeNames;
      for (const altName of altNames) {
        this.attrsByName_[altName] = parsedAttrSpec;
      }
      if (parsedAttrSpec.getSpec().dispatchKey) {
        this.dispatchKeyAttrSpec_ = parsedAttrSpec;
      }
      if (parsedAttrSpec.getSpec().implicit) {
        this.implicitAttrspecs_.push(parsedAttrSpec.getId());
      }
      if (parsedAttrSpec.getSpec().valueUrl) {
        this.containsUrl_ = true;
      }
    }
    this.mandatoryOneofs_ = sortAndUniquify(this.mandatoryOneofs_);

    for (const condition of tagSpec.requires) {
      this.requires_.push(condition);
    }
    for (const tagSpecName of tagSpec.alsoRequiresTag) {
      this.alsoRequiresTag_.push(tagSpecIdsByTagSpecName[tagSpecName]);
    }
    for (const tagSpecName of tagSpec.alsoRequiresTagWarning) {
      this.alsoRequiresTagWarning_.push(tagSpecIdsByTagSpecName[tagSpecName]);
    }
  }

  /**
   * @return {number} unique id for this tag spec.
   */
  getId() {
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
   * Returns true if this tagSpec contains a value_url field.
   * @return {boolean}
   */
  containsUrl() {
    return this.containsUrl_;
  }

  /**
   * A dispatch key is a mandatory attribute name/value unique to this
   * TagSpec. If an encountered tag matches this dispatch key, it is
   * validated first against this TagSpec in order to improve validation
   * performance and error message selection. Not all TagSpecs have a
   * dispatch key.
   * @return {boolean}
   */
  hasDispatchKey() {
    return this.dispatchKeyAttrSpec_ !== null;
  }

  /**
   * You must check hasDispatchKey before accessing
   * @return {string}
   */
  getDispatchKey() {
    goog.asserts.assert(this.hasDispatchKey());
    const parsedSpec = this.dispatchKeyAttrSpec_;
    var mandatoryParent =
        this.spec_.mandatoryParent === null ? '' : this.spec_.mandatoryParent;
    const attrName = parsedSpec.getSpec().name;
    const attrValue = parsedSpec.getSpec().value !== null ?
        parsedSpec.getSpec().value.toLowerCase() :
        parsedSpec.getSpec().valueCasei;
    goog.asserts.assert(attrValue !== null);
    return makeDispatchKey(attrName, attrValue, mandatoryParent);
  }

  /**
   * A TagSpec may specify other tags to be required as well, when that
   * tag is used. This accessor returns the IDs for the tagspecs that
   * are also required if |this| tag occurs in the document.
   * @return {!Array<number>}
   */
  getAlsoRequiresTag() {
    return this.alsoRequiresTag_;
  }

  /**
   * A TagSpec may specify other tags to be required as well, when that
   * tag is used. This accessor returns the IDs for the tagspecs that
   * are also required if |this| tag occurs in the document, but where
   * such requirement is currently only a warning.
   * @return {!Array<number>}
   */
  getAlsoRequiresTagWarning() {
    return this.alsoRequiresTagWarning_;
  }

  /**
   * A TagSpec may specify generic conditions which are required if the
   * tag is present. This accessor returns the list of those conditions.
   * @return {!Array<string>}
   */
  requires() {
    return this.requires_;
  }

  /**
   * Whether or not the tag should be recorded via
   * Context.recordTagspecValidated if it was validated
   * successfullly. For performance, this is only done for tags that are
   * mandatory, unique, or possibly required by some other tag.
   * @return {boolean}
   */
  shouldRecordTagspecValidated() {
    return this.shouldRecordTagspecValidated_;
  }

  /**
   * Returns true if |value| contains mustache template syntax.
   * @param {string} value
   * @return {boolean}
   */
  static valueHasTemplateSyntax(value) {
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
  static valueHasUnescapedTemplateSyntax(value) {
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
  static valueHasPartialsTemplateSyntax(value) {
    // Mustache (https://mustache.github.io/mustache.5.html), our template
    // system, supports 'partials' which include other Mustache templates
    // in the format of {{>partial}} and there can be whitespace after the {{.
    // We disallow partials in attribute values.
    const partialsTag = /{{\s*>/;
    return partialsTag.test(value);
  }

  /**
   * Validates the layout for the given tag. This involves checking the
   * layout, width, height, sizes attributes with AMP specific logic.
   * @param {!Context} context
   * @param {!Object<string, string>} attrsByKey
   * @param {!amp.validator.ValidationResult} result
   */
  validateLayout(context, attrsByKey, result) {
    goog.asserts.assert(this.spec_.ampLayout !== null);

    const layoutAttr = attrsByKey['layout'];
    const widthAttr = attrsByKey['width'];
    const heightAttr = attrsByKey['height'];
    const sizesAttr = attrsByKey['sizes'];
    const heightsAttr = attrsByKey['heights'];

    // We disable validating layout for tags where one of the layout attributes
    // contains mustache syntax.
    const hasTemplateAncestor = context.getTagStack().hasAncestor('TEMPLATE');
    if (hasTemplateAncestor &&
        (ParsedTagSpec.valueHasTemplateSyntax(layoutAttr) ||
         ParsedTagSpec.valueHasTemplateSyntax(widthAttr) ||
         ParsedTagSpec.valueHasTemplateSyntax(heightAttr) ||
         ParsedTagSpec.valueHasTemplateSyntax(sizesAttr) ||
         ParsedTagSpec.valueHasTemplateSyntax(heightsAttr)))
      return;

    // Parse the input layout attributes which we found for this tag.
    const inputLayout = parseLayout(layoutAttr);
    if (layoutAttr !== undefined &&
        inputLayout === amp.validator.AmpLayout.Layout.UNKNOWN) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        context.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
            context.getDocLocator(),
            /* params */['layout', getTagSpecName(this.spec_), layoutAttr],
            this.spec_.specUrl, result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      }
      return;
    }
    const inputWidth =
        new amp.validator.CssLength(widthAttr, /* allowAuto */ true);
    if (!inputWidth.isValid) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        context.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
            context.getDocLocator(),
            /* params */['width', getTagSpecName(this.spec_), widthAttr],
            this.spec_.specUrl, result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      }
      return;
    }
    const inputHeight =
        new amp.validator.CssLength(heightAttr, /* allowAuto */ true);
    if (!inputHeight.isValid) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        context.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
            context.getDocLocator(),
            /* params */['height', getTagSpecName(this.spec_), heightAttr],
            this.spec_.specUrl, result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      }
      return;
    }

    // Now calculate the effective layout attributes.
    const width = CalculateWidth(this.spec_.ampLayout, inputLayout, inputWidth);
    const height =
        CalculateHeight(this.spec_.ampLayout, inputLayout, inputHeight);
    const layout =
        CalculateLayout(inputLayout, width, height, sizesAttr, heightsAttr);

    // height="auto" is only allowed if the layout is FLEX_ITEM.
    if (height.isAuto && layout !== amp.validator.AmpLayout.Layout.FLEX_ITEM) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        context.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
            context.getDocLocator(),
            /* params */['height', getTagSpecName(this.spec_), heightAttr],
            this.spec_.specUrl, result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      }
      return;
    }

    // Does the tag support the computed layout?
    if (this.spec_.ampLayout.supportedLayouts.indexOf(layout) === -1) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        const code = layoutAttr === undefined ?
            amp.validator.ValidationError.Code.IMPLIED_LAYOUT_INVALID :
            amp.validator.ValidationError.Code.SPECIFIED_LAYOUT_INVALID;
        context.addError(
            amp.validator.ValidationError.Severity.ERROR, code,
            context.getDocLocator(),
            /* params */[layout, getTagSpecName(this.spec_)],
            this.spec_.specUrl, result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      }
      return;
    }
    // Check other constraints imposed by the particular layouts.
    if ((layout === amp.validator.AmpLayout.Layout.FIXED ||
         layout === amp.validator.AmpLayout.Layout.FIXED_HEIGHT ||
         layout === amp.validator.AmpLayout.Layout.RESPONSIVE) &&
        !height.isSet) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        context.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code.MANDATORY_ATTR_MISSING,
            context.getDocLocator(),
            /* params */['height', getTagSpecName(this.spec_)],
            this.spec_.specUrl, result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      }
      return;
    }
    if (layout === amp.validator.AmpLayout.Layout.FIXED_HEIGHT && width.isSet &&
        !width.isAuto) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        context.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code.ATTR_VALUE_REQUIRED_BY_LAYOUT,
            context.getDocLocator(),
            /* params */
            [
              widthAttr, 'width', getTagSpecName(this.spec_), 'FIXED_HEIGHT',
              'auto'
            ],
            this.spec_.specUrl, result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      }
      return;
    }
    if (layout === amp.validator.AmpLayout.Layout.FIXED ||
        layout === amp.validator.AmpLayout.Layout.RESPONSIVE) {
      if (!width.isSet) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code.MANDATORY_ATTR_MISSING,
              context.getDocLocator(),
              /* params */['width', getTagSpecName(this.spec_)],
              this.spec_.specUrl, result);
        } else {
          result.status = amp.validator.ValidationResult.Status.FAIL;
        }
        return;
      } else if (width.isAuto) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
              context.getDocLocator(),
              /* params */['width', getTagSpecName(this.spec_), 'auto'],
              this.spec_.specUrl, result);
        } else {
          result.status = amp.validator.ValidationResult.Status.FAIL;
        }
        return;
      }
    }
    if (layout === amp.validator.AmpLayout.Layout.RESPONSIVE &&
        width.unit !== height.unit) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        context.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code
                .INCONSISTENT_UNITS_FOR_WIDTH_AND_HEIGHT,
            context.getDocLocator(),
            /* params */[getTagSpecName(this.spec_), width.unit, height.unit],
            this.spec_.specUrl, result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      }
      return;
    }
    if (heightsAttr !== undefined &&
        layout !== amp.validator.AmpLayout.Layout.RESPONSIVE) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        const code = layoutAttr === undefined ?
            amp.validator.ValidationError.Code
                .ATTR_DISALLOWED_BY_IMPLIED_LAYOUT :
            amp.validator.ValidationError.Code
                .ATTR_DISALLOWED_BY_SPECIFIED_LAYOUT;
        context.addError(
            amp.validator.ValidationError.Severity.ERROR, code,
            context.getDocLocator(),
            /* params */['heights', getTagSpecName(this.spec_), layout],
            this.spec_.specUrl, result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      }
      return;
    }
  }

  /**
   * Helper method for ValidateAttributes, for when an attribute is
   * encountered which is not specified by the validator.protoascii
   * specification.
   * @param {!Context} context
   * @param {string} attrName
   * @param {!amp.validator.ValidationResult} result
   */
  validateAttrNotFoundInSpec(context, attrName, result) {
    // For now, we just skip data- attributes in the validator, because
    // our schema doesn't capture which ones would be ok or not. E.g.
    // in practice, some type of ad or perhaps other custom elements require
    // particular data attributes.
    // http://www.w3.org/TR/html5/single-page.html#attr-data-*
    // http://w3c.github.io/aria-in-html/
    // However, mostly to avoid confusion, we want to make sure that
    // nobody tries to make a Mustache template data attribute,
    // e.g. <div data-{{foo}}>, so we also exclude those characters.
    // We also don't allow slashes as they can be parsed differently by
    // different clients.
    if (goog.string./*OK*/ startsWith(attrName, 'data-') &&
        !goog.string.contains(attrName, '}') &&
        !goog.string.contains(attrName, '{') &&
        !goog.string.contains(attrName, '/') &&
        !goog.string.contains(attrName, '\\')) {
      return;
    }

    // At this point, it's an error either way, but we try to give a
    // more specific error in the case of Mustache template characters.
    if (amp.validator.GENERATE_DETAILED_ERRORS) {
      if (attrName.indexOf('{{') !== -1) {
        context.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code.TEMPLATE_IN_ATTR_NAME,
            context.getDocLocator(),
            /* params */[attrName, getTagSpecName(this.spec_)],
            this.templateSpecUrl_, result);
      } else {
        context.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code.DISALLOWED_ATTR,
            context.getDocLocator(),
            /* params */[attrName, getTagSpecName(this.spec_)],
            this.spec_.specUrl, result);
      }
    } else {
      result.status = amp.validator.ValidationResult.Status.FAIL;
    }
  }

  /**
   * Specific checks for attribute values descending from a template tag.
   * @param {!Context} context
   * @param {string} attrName
   * @param {string} attrValue
   * @param {!amp.validator.ValidationResult} result
   */
  validateAttrValueBelowTemplateTag(context, attrName, attrValue, result) {
    if (ParsedTagSpec.valueHasUnescapedTemplateSyntax(attrValue)) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        context.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code.UNESCAPED_TEMPLATE_IN_ATTR_VALUE,
            context.getDocLocator(),
            /* params */[attrName, getTagSpecName(this.spec_), attrValue],
            this.templateSpecUrl_, result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      }
    } else if (ParsedTagSpec.valueHasPartialsTemplateSyntax(attrValue)) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        context.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code.TEMPLATE_PARTIAL_IN_ATTR_VALUE,
            context.getDocLocator(),
            /* params */[attrName, getTagSpecName(this.spec_), attrValue],
            this.templateSpecUrl_, result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      }
    }
  }

  /**
   * Validates whether the attributes set on |encountered_tag| conform to this
   * tag specification. All mandatory attributes must appear. Only attributes
   * explicitly mentioned by this tag spec may appear.
   *  Returns true iff the validation is successful.
   * @param {!Context} context
   * @param {!ParsedTagSpec} parsedSpec
   * @param {!Array<string>} encounteredAttrs Alternating key/value pairs.
   * @param {!Array<!ParsedTagSpec>} tagSpecById
   * @param {!amp.validator.ValidationResult} result
   */
  validateAttributes(context, parsedSpec, encounteredAttrs, tagSpecById,
      result) {
    if (this.spec_.ampLayout !== null) {
      /** @type {!Object<string, string>} */
      const attrsByKey = {};
      // We iterate in reverse order because if a attribute name is repeated,
      // we want to use the value from the first instance seen in the tag rather
      // than later instances. This is the same behavior that browsers have.
      for (let i = encounteredAttrs.length - 2; i >= 0; i -= 2) {
        attrsByKey[encounteredAttrs[i]] = encounteredAttrs[i + 1];
      }
      this.validateLayout(context, attrsByKey, result);
      if (result.status === amp.validator.ValidationResult.Status.FAIL) {
        return;
      }
    }
    const hasTemplateAncestor = context.getTagStack().hasAncestor('TEMPLATE');
    let mandatoryAttrsSeen = [];
    /** @type {!Object<string, ?>} */
    const mandatoryOneofsSeen = {};
    let parsedTriggerSpecs = [];
    /** If a tag has implicit attributes, we then add these attributes as
     * validated. E.g. tag 'a' has implicit attributes 'role' and 'tabindex'.
     * @type {!Object<number, ?>}
     */
    const attrspecsValidated = {};
    for (const implicit of this.implicitAttrspecs_) {
      attrspecsValidated[implicit] = 0;
    }
    // Our html parser delivers attributes as an array of alternating keys and
    // values. We skip over this array 2 at a time to iterate over the keys.
    for (let i = 0; i < encounteredAttrs.length; i += 2) {
      const attrKey = encounteredAttrs[i];
      const attrName = attrKey.toLowerCase();
      let attrValue = encounteredAttrs[i + 1];

      let parsedAttrSpec;
      if (!this.attrsByName_.hasOwnProperty(attrName) ||
          (parsedAttrSpec = this.attrsByName_[attrName]) === undefined) {
        // While validating a reference point, we skip attributes that
        // we don't have a spec for. They will be validated when the
        // TagSpec itself gets validated.
        if (this.isReferencePoint_) continue;
        // On the other hand, if we did just validate a reference point for
        // this tag, we check whether that reference point covers the attribute.
        const matcher = context.getTagStack().parentReferencePointMatcher();
        if (matcher) {
          const matched = matcher.getReferencePointsMatched();
          if (matched.length > 0 && matched[matched.length - 1] != -1 &&
              tagSpecById[matched[matched.length - 1]].hasAttrWithName(
                  attrName)) {
            continue;
          }
        }

        this.validateAttrNotFoundInSpec(context, attrName, result);
        if (result.status === amp.validator.ValidationResult.Status.FAIL) {
          return;
        }
        if (hasTemplateAncestor) {
          this.validateAttrValueBelowTemplateTag(
              context, attrName, attrValue, result);
          if (result.status === amp.validator.ValidationResult.Status.FAIL) {
            return;
          }
        }
        continue;
      }
      if (hasTemplateAncestor) {
        this.validateAttrValueBelowTemplateTag(
            context, attrName, attrValue, result);
        if (result.status === amp.validator.ValidationResult.Status.FAIL) {
          return;
        }
      }
      if (parsedAttrSpec.getSpec().deprecation !== null) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          context.addError(
              amp.validator.ValidationError.Severity.WARNING,
              amp.validator.ValidationError.Code.DEPRECATED_ATTR,
              context.getDocLocator(),
              /* params */
              [
                attrName, getTagSpecName(this.spec_),
                parsedAttrSpec.getSpec().deprecation
              ],
              parsedAttrSpec.getSpec().deprecationUrl, result);
        }
        // Deprecation is only a warning, so we don't return.
      }
      if (!hasTemplateAncestor ||
          !ParsedTagSpec.valueHasTemplateSyntax(attrValue)) {
        parsedAttrSpec.validateNonTemplateAttrValueAgainstSpec(
            context, attrName, attrValue, this.spec_, result);
        if (result.status === amp.validator.ValidationResult.Status.FAIL) {
          return;
        }
      }
      if (parsedAttrSpec.hasBlacklistedValueRegex()) {
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
          // to applying this to every attribute htat has a blacklisted value
          // regex.
          decodedAttrValue = unescape(attrValue);
        }
        if (parsedAttrSpec.getBlacklistedValueRegex().test(attrValue) ||
            parsedAttrSpec.getBlacklistedValueRegex().test(decodedAttrValue)) {
          if (amp.validator.GENERATE_DETAILED_ERRORS) {
            context.addError(
                amp.validator.ValidationError.Severity.ERROR,
                amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
                context.getDocLocator(),
                /* params */[attrName, getTagSpecName(this.spec_), attrValue],
                this.spec_.specUrl, result);
          } else {
            result.status = amp.validator.ValidationResult.Status.FAIL;
          }
          return;
        }
      }
      if (parsedAttrSpec.getSpec().mandatory) {
        mandatoryAttrsSeen.push(parsedAttrSpec.getId());
      }
      if (parsedSpec.getSpec().tagName === "BASE" && attrName === "href" &&
          context.hasSeenUrl()) {
       if (amp.validator.GENERATE_DETAILED_ERRORS) {
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code.BASE_TAG_MUST_PRECEED_ALL_URLS,
              context.getDocLocator(),
              /* params */ [context.firstSeenUrlTagName()],
              this.spec_.specUrl, result);
        } else {
          result.status = amp.validator.ValidationResult.Status.FAIL;
        }
        return;
      }
      // The "at most 1" part of mandatory_oneof: mandatory_oneof
      // wants exactly one of the alternatives, so here
      // we check whether we already saw another alternative
      if (parsedAttrSpec.getSpec().mandatoryOneof &&
          mandatoryOneofsSeen.hasOwnProperty(
              parsedAttrSpec.getSpec().mandatoryOneof)) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code.MUTUALLY_EXCLUSIVE_ATTRS,
              context.getDocLocator(),
              /* params */
              [getTagSpecName(this.spec_),
               parsedAttrSpec.getSpec().mandatoryOneof],
              this.spec_.specUrl, result);
        } else {
          result.status = amp.validator.ValidationResult.Status.FAIL;
        }
        return;
      }
      const mandatoryOneof = parsedAttrSpec.getSpec().mandatoryOneof;
      if (mandatoryOneof !== null) {
        mandatoryOneofsSeen[mandatoryOneof] = 0;
      }
      // If the trigger does not have an if_value_regex, then proceed to add the
      // spec. If it does have an if_value_regex, then test the regex to see
      // if it should add the spec.
      if (parsedAttrSpec.hasTriggerSpec() &&
          (!parsedAttrSpec.getTriggerSpec().hasIfValueRegex() ||
           (parsedAttrSpec.getTriggerSpec().hasIfValueRegex() &&
            parsedAttrSpec.getTriggerSpec().getIfValueRegex().test(
                attrValue)))) {
        parsedTriggerSpecs.push(parsedAttrSpec.getTriggerSpec());
      }
      attrspecsValidated[parsedAttrSpec.getId()] = 0;
    }
    // The "at least 1" part of mandatory_oneof: If none of the
    // alternatives were present, we report that an attribute is missing.
    for (const mandatoryOneof of this.mandatoryOneofs_) {
      if (!mandatoryOneofsSeen.hasOwnProperty(mandatoryOneof)) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code.MANDATORY_ONEOF_ATTR_MISSING,
              context.getDocLocator(),
              /* params */[getTagSpecName(this.spec_), mandatoryOneof],
              this.spec_.specUrl, result);
        } else {
          result.status = amp.validator.ValidationResult.Status.FAIL;
        }
      }
    }
    for (const triggerSpec of parsedTriggerSpecs) {
      for (const alsoRequiresAttr of triggerSpec.getSpec().alsoRequiresAttr) {
        let parsedAttrSpec;
        if (!this.attrsByName_.hasOwnProperty(alsoRequiresAttr) ||
            (parsedAttrSpec = this.attrsByName_[alsoRequiresAttr]) ===
            undefined) {
          continue;
        }
        if (!attrspecsValidated.hasOwnProperty(parsedAttrSpec.getId())) {
          if (amp.validator.GENERATE_DETAILED_ERRORS) {
            context.addError(
                amp.validator.ValidationError.Severity.ERROR,
                amp.validator.ValidationError.Code.ATTR_REQUIRED_BUT_MISSING,
                context.getDocLocator(),
                /* params */
                [
                  parsedAttrSpec.getSpec().name, getTagSpecName(this.spec_),
                  triggerSpec.getAttrName()
                ],
                this.spec_.specUrl, result);
          } else {
            result.status = amp.validator.ValidationResult.Status.FAIL;
          }
        }
      }
    }
    mandatoryAttrsSeen = sortAndUniquify(mandatoryAttrsSeen);
    const diffs = subtractDiff(this.mandatoryAttrIds_, mandatoryAttrsSeen);
    if (amp.validator.GENERATE_DETAILED_ERRORS) {
      for (const diff of diffs) {
        context.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code.MANDATORY_ATTR_MISSING,
            context.getDocLocator(),
            /* params */
            [
              this.parsedAttrSpecs_.getById(diff).getSpec().name,
              getTagSpecName(this.spec_)
            ],
            this.spec_.specUrl, result);
      }
    } else {
      if (diffs.length > 0) {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      }
    }
  }

  /**
   * Validates whether the parent tag satisfied the spec (e.g., some
   * tags can only appear in head).
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} validationResult
   */
  validateParentTag(context, validationResult) {
    if (this.spec_.mandatoryParent !== null &&
        this.spec_.mandatoryParent !== context.getTagStack().getParent()) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        // Output a parent/child error using CSS Child Selector syntax which is
        // both succinct and should be well understood by web developers.
        context.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code.WRONG_PARENT_TAG,
            context.getDocLocator(),
            /* params */
            [
              getTagSpecName(this.spec_),
              context.getTagStack().getParent().toLowerCase(),
              this.spec_.mandatoryParent.toLowerCase()
            ],
            this.spec_.specUrl, validationResult);
      } else {
        validationResult.status = amp.validator.ValidationResult.Status.FAIL;
      }
    }
  }

  /**
   * Validates if the tag ancestors satisfied the spec.
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} validationResult
   */
  validateAncestorTags(context, validationResult) {
    if (this.spec_.mandatoryAncestor !== null) {
      const mandatoryAncestor = this.spec_.mandatoryAncestor;
      if (!context.getTagStack().hasAncestor(mandatoryAncestor)) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          if (this.spec_.mandatoryAncestorSuggestedAlternative !== null) {
            context.addError(
                amp.validator.ValidationError.Severity.ERROR,
                amp.validator.ValidationError.Code
                    .MANDATORY_TAG_ANCESTOR_WITH_HINT,
                context.getDocLocator(),
                /* params */
                [
                  this.spec_.tagName.toLowerCase(),
                  mandatoryAncestor.toLowerCase(),
                  this.spec_.mandatoryAncestorSuggestedAlternative.toLowerCase()
                ],
                this.spec_.specUrl, validationResult);
          } else {
            context.addError(
                amp.validator.ValidationError.Severity.ERROR,
                amp.validator.ValidationError.Code.MANDATORY_TAG_ANCESTOR,
                context.getDocLocator(),
                /* params */
                [
                  this.spec_.tagName.toLowerCase(),
                  mandatoryAncestor.toLowerCase()
                ],
                this.spec_.specUrl, validationResult);
          }
        } else {
          validationResult.status = amp.validator.ValidationResult.Status.FAIL;
        }
        return;
      }
    }
    for (const disallowedAncestor of this.spec_.disallowedAncestor) {
      if (context.getTagStack().hasAncestor(disallowedAncestor)) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code.DISALLOWED_TAG_ANCESTOR,
              context.getDocLocator(),
              /* params */
              [
                this.spec_.tagName.toLowerCase(),
                disallowedAncestor.toLowerCase()
              ],
              this.spec_.specUrl, validationResult);
        } else {
          validationResult.status = amp.validator.ValidationResult.Status.FAIL;
        }
        return;
      }
    }
  }

  /** @return {boolean} */
  isReferencePoint() {
    return this.isReferencePoint_;
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
    return this.attrsByName_.hasOwnProperty(name);
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
      this.tagSpecsByDispatch_ = {};
    }
    goog.asserts.assert(!this.tagSpecsByDispatch_.hasOwnProperty(dispatchKey));
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
    // Try first to find a key with the given parent.
    const dispatchKey = makeDispatchKey(attrName, attrValue, mandatoryParent);
    const match = this.tagSpecsByDispatch_[dispatchKey];
    if (match !== undefined) {
      return match;
    }

    // Try next to find a key with the *any* parent.
    const noParentKey =
        makeDispatchKey(attrName, attrValue, /*mandatoryParent*/ '');
    const noParentMatch = this.tagSpecsByDispatch_[noParentKey];
    if (noParentMatch !== undefined) {
      return noParentMatch;
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
 * @param {!ParsedValidatorRules} parsedRules
 * @param {!ParsedTagSpec} parsedSpec
 * @param {!Context} context
 * @param {!Array<string>} encounteredAttrs Alternating key/value pairs.
 * @param {!amp.validator.ValidationResult} resultForBestAttempt
 */
function validateTagAgainstSpec(
    parsedRules, parsedSpec, context, encounteredAttrs, resultForBestAttempt) {
  let resultForAttempt = new amp.validator.ValidationResult();
  resultForAttempt.status = amp.validator.ValidationResult.Status.UNKNOWN;
  parsedSpec.validateAttributes(
      context, parsedSpec, encounteredAttrs, parsedRules.getTagSpecById(),
      resultForAttempt);
  parsedSpec.validateParentTag(context, resultForAttempt);
  parsedSpec.validateAncestorTags(context, resultForAttempt);

  if (resultForAttempt.status === amp.validator.ValidationResult.Status.FAIL) {
    if (!amp.validator.GENERATE_DETAILED_ERRORS) {
      resultForBestAttempt.status = amp.validator.ValidationResult.Status.FAIL;
      return;
    }
    // If this is the first attempt, always use it.
    if (resultForBestAttempt.errors.length === 0) {
      resultForBestAttempt.copyFrom(resultForAttempt);
      return;
    }

    // Prefer the attempt with the fewest errors.
    if (resultForAttempt.errors.length < resultForBestAttempt.errors.length) {
      resultForBestAttempt.copyFrom(resultForAttempt);
      return;
    }
    if (resultForAttempt.errors.length > resultForBestAttempt.errors.length) {
      return;
    }

    // If the same number of errors, prefer the most specific error.
    if (parsedRules.maxSpecificity(resultForAttempt.errors) >
        parsedRules.maxSpecificity(resultForBestAttempt.errors)) {
      resultForBestAttempt.copyFrom(resultForAttempt);
    }

    return;
  }
  // This is the successful branch of the code: locally the tagspec matches.
  resultForBestAttempt.copyFrom(resultForAttempt);

  const spec = parsedSpec.getSpec();
  if (amp.validator.GENERATE_DETAILED_ERRORS) {
    if (spec.deprecation !== null) {
      context.addError(
          amp.validator.ValidationError.Severity.WARNING,
          amp.validator.ValidationError.Code.DEPRECATED_TAG,
          context.getDocLocator(),
          /* params */[getTagSpecName(spec), spec.deprecation],
          spec.deprecationUrl, resultForBestAttempt);
      // Deprecation is only a warning, so we don't return.
    }
  }

  for (const condition of spec.satisfies) {
    context.satisfyCondition(condition);
  }
  if (!context.hasSeenUrl() && parsedSpec.containsUrl()) {
    context.markUrlSeen(spec);
  }

  if (parsedSpec.shouldRecordTagspecValidated()) {
    const isUnique = context.recordTagspecValidated(parsedSpec.getId());
    // If a duplicate tag is encountered for a spec that's supposed
    // to be unique, we've found an error that we must report.
    if (!isUnique) {
      if (spec.unique) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code.DUPLICATE_UNIQUE_TAG,
              context.getDocLocator(),
              /* params */[getTagSpecName(spec)], spec.specUrl,
              resultForBestAttempt);
        } else {
          resultForBestAttempt.status =
              amp.validator.ValidationResult.Status.FAIL;
        }
        return;
      } else if (spec.uniqueWarning) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          context.addError(
              amp.validator.ValidationError.Severity.WARNING,
              amp.validator.ValidationError.Code.DUPLICATE_UNIQUE_TAG_WARNING,
              context.getDocLocator(),
              /* params */[getTagSpecName(spec)], spec.specUrl,
              resultForBestAttempt);
        }
      }
    }
  }

  if (spec.mandatoryAlternatives !== null) {
    const satisfied = spec.mandatoryAlternatives;
    goog.asserts.assert(satisfied !== null);
    context.recordMandatoryAlternativeSatisfied(satisfied);
  }
  // (Re)set the cdata matcher to the expectations that this tag
  // brings with it.
  if (spec.cdata !== null) context.setCdataMatcher(new CdataMatcher(spec));
  if (spec.childTags !== null)
    context.setChildTagMatcher(new ChildTagMatcher(spec));

  // Set the reference point matcher so it considers spec.reference_points(),
  // if present, considering that reference points could be defined by
  // both reference points and regular tag specs.
  if (parsedSpec.getReferencePoints().empty()) return;
  const currentMatcher = context.getTagStack().currentReferencePointMatcher();
  if (currentMatcher !== null &&
      !currentMatcher.getParsedReferencePoints().empty()) {
    if (amp.validator.GENERATE_DETAILED_ERRORS) {
      context.addError(
          amp.validator.ValidationError.Severity.ERROR,
          amp.validator.ValidationError.Code.TAG_REFERENCE_POINT_CONFLICT,
          context.getDocLocator(),
          /* params */
          [
            getTagSpecName(spec),
            currentMatcher.getParsedReferencePoints().parentTagSpecName()
          ],
          currentMatcher.getParsedReferencePoints().parentSpecUrl(),
          resultForBestAttempt);
    } else {
      resultForBestAttempt.status = amp.validator.ValidationResult.Status.FAIL;
    }
    return;
  }
  context.setReferencePointMatcher(
      new ReferencePointMatcher(parsedRules, parsedSpec.getReferencePoints()));
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
    /**
     * ParsedTagSpecs in id order.
     * @type {!Array<!ParsedTagSpec>}
     * @private
     */
    this.tagSpecById_ = [];
    /**
     * ParsedTagSpecs keyed by name
     * @type {!Object<string, !TagSpecDispatch>}
     * @private
     */
    this.tagSpecByTagName_ = {};
    /**
     * Tag ids that are mandatory for a document to legally validate.
     * @type {!Array<number>}
     * @private
     */
    this.mandatoryTagSpecs_ = [];

    /**
     * @type {!amp.validator.ValidatorRules}
     * @private
     */
    this.rules_ = this.filterRules(amp.validator.createRules(), htmlFormat);

    const parsedAttrSpecs = new ParsedAttrSpecs(this.rules_.attrLists);

    /** @type {!Object<string, number>} */
    const tagSpecIdsByTagSpecName = {};
    /** @type {!Object<string, boolean>} */
    const tagSpecNamesToTrack = {};
    for (let i = 0; i < this.rules_.tags.length; ++i) {
      const tag = this.rules_.tags[i];
      goog.asserts.assert(
          !tagSpecIdsByTagSpecName.hasOwnProperty(getTagSpecName(tag)));
      tagSpecIdsByTagSpecName[getTagSpecName(tag)] = i;
      if (tag.alsoRequiresTag.length > 0 ||
          tag.alsoRequiresTagWarning.length > 0) {
        tagSpecNamesToTrack[getTagSpecName(tag)] = true;
      }
      for (const alsoRequiresTag of tag.alsoRequiresTag) {
        tagSpecNamesToTrack[alsoRequiresTag] = true;
      }
      for (const alsoRequiresTagWarning of tag.alsoRequiresTagWarning) {
        tagSpecNamesToTrack[alsoRequiresTagWarning] = true;
      }
    }
    for (let i = 0; i < this.rules_.tags.length; ++i) {
      const tag = this.rules_.tags[i];
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        goog.asserts.assert(this.rules_.templateSpecUrl !== null);
      }
      const parsedTagSpec = new ParsedTagSpec(
          this.rules_.templateSpecUrl, parsedAttrSpecs, tagSpecIdsByTagSpecName,
          shouldRecordTagspecValidated(tag, tagSpecNamesToTrack), tag, i);
      this.tagSpecById_.push(parsedTagSpec);
      if (!parsedTagSpec.isReferencePoint()) {
        if (!this.tagSpecByTagName_.hasOwnProperty(tag.tagName)) {
          this.tagSpecByTagName_[tag.tagName] = new TagSpecDispatch();
        }
        const tagnameDispatch = this.tagSpecByTagName_[tag.tagName];
        if (parsedTagSpec.hasDispatchKey()) {
          tagnameDispatch.registerDispatchKey(
              parsedTagSpec.getDispatchKey(), i);
        } else {
          tagnameDispatch.registerTagSpec(i);
        }
      }
      if (tag.mandatory) {
        this.mandatoryTagSpecs_.push(i);
      }
    }
    if (amp.validator.GENERATE_DETAILED_ERRORS) {
      /**
       * @typedef {{ format: string, specificity: number }}
       */
      let ErrorCodeMetadata;

      /**
       * type {!Object<!amp.validator.ValidationError.Code,
       *               ErrorCodeMetadata>}
       *  @private
       */
      this.errorCodes_ = {};
      for (let i = 0; i < this.rules_.errorFormats.length; ++i) {
        const errorFormat = this.rules_.errorFormats[i];
        goog.asserts.assert(errorFormat !== null);
        this.errorCodes_[errorFormat.code] = {};
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
   * Filters the input rules so that only TagSpecs this validator needs are
   * returned.
   * @param {!amp.validator.ValidatorRules} allRules
   * @param {string} htmlFormat
   * @return {!amp.validator.ValidatorRules}
   */
  filterRules(allRules, htmlFormat) {
    let newRules = allRules;
    let filteredTags = [];
    for (let i = 0; i < allRules.tags.length; ++i) {
      if (this.isTagSpecCorrectHtmlFormat(allRules.tags[i], htmlFormat))
        filteredTags.push(allRules.tags[i]);
    }
    newRules.tags = filteredTags;
    return newRules;
  }

  /**
   * True iff tagspec's html_format matches the AMP html_format.
   * @param {amp.validator.TagSpec} tagSpec
   * @param {string} htmlFormat
   * @return {boolean}
   */
  isTagSpecCorrectHtmlFormat(tagSpec, htmlFormat) {
    // Empty html_format field implies tagspec applies to all docs.
    if (tagSpec.htmlFormat.length === 0) return true;

    for (let i = 0; i < tagSpec.htmlFormat.length; ++i) {
      if (tagSpec.htmlFormat[i] === htmlFormat) return true;
    }

    return false;
  }

  /**
   * @return {boolean}
   */
  isManufacturedBodyTagError() {
    return this.rules_.manufacturedBodyTagIsError;
  }

  /**
   * @return {null|string}
   */
  manufacturedBodySpecUrl() {
    return this.rules_.manufacturedBodySpecUrl;
  }

  /**
   * @param {amp.validator.ValidationError.Code} errorCode
   * @return {!string}
   */
  getFormatByCode(errorCode) {
    return this.errorCodes_[errorCode].format;
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
   * Emits errors for tags that are specified to be mandatory.
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} validationResult
   */
  maybeEmitMandatoryTagValidationErrors(context, validationResult) {
    for (const tagSpecId of this.mandatoryTagSpecs_) {
      if (!context.getTagspecsValidated().hasOwnProperty(tagSpecId)) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          const spec = this.tagSpecById_[tagSpecId].getSpec();
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code.MANDATORY_TAG_MISSING,
              context.getDocLocator(),
              /* params */[getTagSpecName(spec)], spec.specUrl,
              validationResult);
        } else {
          validationResult.status = amp.validator.ValidationResult.Status.FAIL;
          return;
        }
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
      const spec = this.tagSpecById_[tagSpecId];
      for (const condition of spec.requires()) {
        if (!context.conditionsSatisfied().hasOwnProperty(condition)) {
          if (amp.validator.GENERATE_DETAILED_ERRORS) {
            context.addError(
                amp.validator.ValidationError.Severity.ERROR,
                amp.validator.ValidationError.Code.TAG_REQUIRED_BY_MISSING,
                context.getDocLocator(),
                /* params */
                [
                  condition,
                  getTagSpecName(spec.getSpec())
                ],
                spec.getSpec().specUrl, validationResult);
          } else {
            validationResult.status =
                amp.validator.ValidationResult.Status.FAIL;
            return;
          }
        }
      }
      for (const tagspecId of spec.getAlsoRequiresTag()) {
        if (!context.getTagspecsValidated().hasOwnProperty(tagspecId)) {
          if (amp.validator.GENERATE_DETAILED_ERRORS) {
            const alsoRequiresTagspec = this.tagSpecById_[tagspecId];
            context.addError(
                amp.validator.ValidationError.Severity.ERROR,
                amp.validator.ValidationError.Code.TAG_REQUIRED_BY_MISSING,
                context.getDocLocator(),
                /* params */
                [
                  getTagSpecName(alsoRequiresTagspec.getSpec()),
                  getTagSpecName(spec.getSpec())
                ],
                spec.getSpec().specUrl, validationResult);
          } else {
            validationResult.status =
                amp.validator.ValidationResult.Status.FAIL;
            return;
          }
        }
      }
      for (const tagspecId of spec.getAlsoRequiresTagWarning()) {
        if (!context.getTagspecsValidated().hasOwnProperty(tagspecId)) {
          if (amp.validator.GENERATE_DETAILED_ERRORS) {
            const alsoRequiresTagspec = this.tagSpecById_[tagspecId];
            context.addError(
                amp.validator.ValidationError.Severity.WARNING,
                amp.validator.ValidationError.Code
                    .WARNING_TAG_REQUIRED_BY_MISSING,
                context.getDocLocator(),
                /* params */
                [
                  getTagSpecName(alsoRequiresTagspec.getSpec()),
                  getTagSpecName(spec.getSpec())
                ],
                spec.getSpec().specUrl, validationResult);
          }
        }
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
    const specUrlsByMissing = {};
    for (const tagSpec of this.tagSpecById_) {
      const spec = tagSpec.getSpec();
      if (spec.mandatoryAlternatives !== null) {
        const alternative = spec.mandatoryAlternatives;
        if (!satisfied.hasOwnProperty(alternative)) {
          if (amp.validator.GENERATE_DETAILED_ERRORS) {
            missing.push(alternative);
            specUrlsByMissing[alternative] = spec.specUrl;
          } else {
            validationResult.status =
                amp.validator.ValidationResult.Status.FAIL;
            return;
          }
        }
      }
    }
    if (amp.validator.GENERATE_DETAILED_ERRORS) {
      for (const tagMissing of sortAndUniquify(missing)) {
        context.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code.MANDATORY_TAG_MISSING,
            context.getDocLocator(),
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

  /** @return {!Array<!ParsedTagSpec>} */
  getTagSpecById() {
    return this.tagSpecById_;
  }

  /**
   * @param {number} id
   * @return {!ParsedTagSpec}
   */
  getTagSpec(id) {
    return this.tagSpecById_[id];
  }

  /**
   * @param {!string} tagName
   * @return {TagSpecDispatch|undefined}
   */
  dispatchForTagName(tagName) {
    if (!this.tagSpecByTagName_.hasOwnProperty(tagName)) return undefined;
    return this.tagSpecByTagName_[tagName];
  }
}

/** @type {!Object<string, !ParsedValidatorRules>} */
const parsedValidatorRulesByFormat = {};

/**
 * @param {string} htmlFormat
 * @return {!ParsedValidatorRules}
 */
function getParsedValidatorRules(htmlFormat) {
  if (!parsedValidatorRulesByFormat.hasOwnProperty(htmlFormat)) {
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
     * Validation Context.
     * @type {!Context}
     * @private
     */
    this.context_ = new Context();
    /**
     * Rules from parsed JSON configuration.
     * @type {!ParsedValidatorRules}
     * @private
     */
    this.rules_ = getParsedValidatorRules(htmlFormat);
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
    if (locator == null) {
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
   * Callback for the end of a new HTML document. Triggers validation of
   * mandatory
   * tag presence.
   */
  endDoc() {
    this.context_.setCdataMatcher(null);
    this.rules_.maybeEmitGlobalTagValidationErrors(
        this.context_, this.validationResult_);
    if (this.validationResult_.status ===
        amp.validator.ValidationResult.Status.UNKNOWN) {
      this.validationResult_.status =
          amp.validator.ValidationResult.Status.PASS;
    }
  }

  /**
   * Callback for informing that the parser is manufacturing a <body> tag not
   * actually found on the page. This will be followed by a startTag() with the
   * actual body tag in question.
   * @override
   */
  markManufacturedBody() {
    if (this.rules_.isManufacturedBodyTagError()) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        this.context_.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code.DISALLOWED_MANUFACTURED_BODY,
            this.context_.getDocLocator(),
            /* params */[], this.rules_.manufacturedBodySpecUrl(),
            this.validationResult_);
      } else {
        this.validationResult_.status =
            amp.validator.ValidationResult.Status.FAIL;
      }
    } else if (amp.validator.GENERATE_DETAILED_ERRORS) {
      this.context_.addError(
          amp.validator.ValidationError.Severity.WARNING,
          amp.validator.ValidationError.Code.DEPRECATED_MANUFACTURED_BODY,
          this.context_.getDocLocator(),
          /* params */[], this.rules_.manufacturedBodySpecUrl(),
          this.validationResult_);
    }
  }

  /**
   * Callback for a start HTML tag.
   * @param {string} tagName ie: 'table' (already lower-cased by htmlparser.js).
   * @param {Array<string>} attrs Alternating key/value pairs.
   * @override
   */
  startTag(tagName, attrs) {
    goog.asserts.assert(attrs !== null, 'Null attributes for tag: ' + tagName);
    this.context_.setCdataMatcher(null);
    this.context_.getTagStack().enterTag(
        tagName, this.context_, this.validationResult_, attrs);
    const matcher = this.context_.getTagStack().parentReferencePointMatcher();
    if (matcher !== null) {
      matcher.match(attrs, this.context_, this.validationResult_);
    }
    this.validateTag(tagName, attrs);
    this.context_.getTagStack().matchChildTagName(
        this.context_, this.validationResult_);
  }

  /**
   * Callback for an end HTML tag.
   * @param {string} tagName ie: 'table'
   * @override
   */
  endTag(tagName) {
    this.context_.setCdataMatcher(null);
    const matcher = this.context_.getTagStack().currentReferencePointMatcher();
    if (matcher !== null) {
      matcher.exitParentTag(
          this.context_, this.rules_.getTagSpecById(), this.validationResult_);
    }
    this.context_.getTagStack().exitTag(
        tagName, this.context_, this.validationResult_);
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
    const matcher = this.context_.getCdataMatcher();
    if (matcher !== null)
      matcher.match(text, this.context_, this.validationResult_);
  }

  /**
   * Validates the provided |tagName| with respect to the tag
   * specifications that are part of this instance. At least one
   * specification must validate. The ids for mandatory tag specs are
   * emitted via context.recordTagspecValidated().
   * @param {string} tagName
   * @param {!Array<string>} encounteredAttrs Alternating key/value pairs.
   */
  validateTag(tagName, encounteredAttrs) {
    let tagSpecDispatch = this.rules_.dispatchForTagName(tagName);
    if (tagSpecDispatch === undefined) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        this.context_.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code.DISALLOWED_TAG,
            this.context_.getDocLocator(),
            /* params */[tagName.toLowerCase()],
            /* specUrl */ '', this.validationResult_);
      } else {
        this.validationResult_.status =
            amp.validator.ValidationResult.Status.FAIL;
      }
      return;
    }
    // At this point, we have dispatch keys, tagspecs, or both.
    // The strategy is to look for a matching dispatch key first. A matching
    // dispatch key does not guarantee that the dispatched tagspec will also
    // match. If we find a matching dispatch key, we immediately return the
    // result for that tagspec, success or fail.
    // If we don't find a matching dispatch key, we must try all of the
    // tagspecs to see if any of them match. If there are no tagspecs, we want
    // to return a GENERAL_DISALLOWED_TAG error.
    let resultForBestAttempt = new amp.validator.ValidationResult();
    resultForBestAttempt.status = amp.validator.ValidationResult.Status.FAIL;
    // calling HasDispatchKeys here is only an optimization to skip the loop
    // over encountered attributes in the case where we have no dispatches.
    if (tagSpecDispatch.hasDispatchKeys()) {
      for (let i = 0; i < encounteredAttrs.length; i += 2) {
        let attrName = encounteredAttrs[i];
        let attrValue = encounteredAttrs[i + 1];
        // Our html parser repeats the key as the value if there is no value. We
        // replace the value with an empty string instead in this case.
        if (attrName === attrValue) {
          attrValue = '';
        }
        attrName = attrName.toLowerCase();

        const maybeTagSpecId = tagSpecDispatch.matchingDispatchKey(
            attrName,
            // Attribute values are case-sensitive by default, but we
            // match dispatch keys in a case-insensitive manner and then
            // validate using whatever the tagspec requests.
            attrValue.toLowerCase(),
            this.context_.getTagStack().getParent());
        if (maybeTagSpecId !== -1) {
          const parsedSpec = this.rules_.getTagSpec(maybeTagSpecId);
          goog.asserts.assert(parsedSpec !== undefined, '1');
          validateTagAgainstSpec(
              this.rules_, parsedSpec, this.context_, encounteredAttrs,
              resultForBestAttempt);
          // Use the dispatched TagSpec validation results, success or fail.
          this.validationResult_.mergeFrom(resultForBestAttempt);
          return;
        }
      }
      // If none of the dispatch tagspecs matched and passed and there are no
      // non-dispatch tagspecs, consider this a 'generally' disallowed tag,
      // which gives an error that reads "tag foo is disallowed except in
      // specific forms".
      if (!tagSpecDispatch.hasTagSpecs()) {
        // TODO(gregable): Determine a good way to source a specUrl in these
        // instances.
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          this.context_.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code.GENERAL_DISALLOWED_TAG,
              this.context_.getDocLocator(),
              /* params */[tagName.toLowerCase()],
              /* specUrl */ '', this.validationResult_);
        } else {
          this.validationResult_.status =
              amp.validator.ValidationResult.Status.FAIL;
        }
        return;
      }
    }
    // Validate against all tagspecs.
    for (const tagSpecId of tagSpecDispatch.allTagSpecs()) {
      const parsedSpec = this.rules_.getTagSpec(tagSpecId);
      validateTagAgainstSpec(
          this.rules_, parsedSpec, this.context_, encounteredAttrs,
          resultForBestAttempt);
      if (resultForBestAttempt.status !==
          amp.validator.ValidationResult.Status.FAIL) {
        break;  // Exit early on success
      }
    }
    this.validationResult_.mergeFrom(resultForBestAttempt);
  }
};

/**
 * Convenience function which informs caller if given ValidationError is
 * severity warning.
 * @param {!amp.validator.ValidationError} error
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
  if (!amp.validator.GENERATE_DETAILED_ERRORS) {
    throw 'not implemented';
  }
  goog.asserts.assertString(inputDocContents, 'Input document is not a string');

  const htmlFormat = opt_htmlFormat || 'AMP';
  const handler = new amp.validator.ValidationHandler(htmlFormat);
  const parser = new amp.htmlparser.HtmlParser();
  parser.parse(handler, inputDocContents);

  return handler.Result();
};

if (amp.validator.GENERATE_DETAILED_ERRORS) {
  /**
   * The terminal is an abstraction for the window.console object which
   * accomodates differences between console implementations and provides
   * a convenient way to capture what's being emitted to the terminal
   * in a unittest. Pass the optional parameter to the constructor
   * to observe the calls that would have gone to window.console otherwise.
   * @constructor
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

if (amp.validator.GENERATE_DETAILED_ERRORS) {
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
      if (status == amp.validator.ValidationResult.Status.FAIL) {
        terminal.error('AMP validation had errors:');
      } else {
        terminal.warn('AMP validation had warnings:');
      }
      errors = this.errors;
    } else {
      errors = [];
      for (const error of this.errors) {
        if (amp.validator.categorizeError(error) === errorCategoryFilter) {
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
  if (!amp.validator.GENERATE_DETAILED_ERRORS) {
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
  if (!amp.validator.GENERATE_DETAILED_ERRORS) {
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
  return param === 'style amp-custom' || param === 'style amp-custom (AMP4ADS)';
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
  if (!amp.validator.GENERATE_DETAILED_ERRORS) {
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
          amp.validator.ValidationError.Code.TAG_REFERENCE_POINT_CONFLICT) {
    return amp.validator.ErrorCategory.Code.AMP_TAG_PROBLEM;
  }
  // E.g. "The tag 'img' may only appear as a descendant of tag
  // 'noscript'. Did you mean 'amp-img'?"
  if (error.code === amp.validator.ValidationError.Code.DISALLOWED_TAG) {
    if (error.params[0] === 'img' || error.params[0] === 'video' ||
        error.params[0] === 'audio' || error.params[0] === 'iframe' ||
        error.params[0] === 'font') {
      return amp.validator.ErrorCategory.Code
          .DISALLOWED_HTML_WITH_AMP_EQUIVALENT;
    }
    // E.g. "The tag 'picture' is disallowed."
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
  if (error.code ==
      amp.validator.ValidationError.Code.INCORRECT_NUM_CHILD_TAGS) {
    if (goog.string./*OK*/ startsWith(error.params[0], 'amp-')) {
      return amp.validator.ErrorCategory.Code.AMP_TAG_PROBLEM;
    }
    return amp.validator.ErrorCategory.Code.DISALLOWED_HTML;
  }
  // e.g. "Tag 'div' is disallowed as first child of tag
  // 'amp-accordion > section'. Allowed first child tag names are
  // ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']."
  if (error.code ==
          amp.validator.ValidationError.Code.DISALLOWED_CHILD_TAG_NAME ||
      error.code ==
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
  // E.g. "CSS syntax error in tag 'style amp-custom' - Invalid Declaration."
  // TODO(powdercloud): Legacy generic css error code. Remove after
  // 2016-06-01.
  if (error.code === amp.validator.ValidationError.Code.CSS_SYNTAX &&
      isAuthorStylesheet(error.params[0])) {
    return amp.validator.ErrorCategory.Code.AUTHOR_STYLESHEET_PROBLEM;
  }
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
       error.code ==
           amp.validator.ValidationError.Code
               .CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE ||
       error.code ==
           amp.validator.ValidationError.Code
               .CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE_WITH_HINT ||
       error.code ==
           amp.validator.ValidationError.Code
               .CSS_SYNTAX_PROPERTY_DISALLOWED_WITHIN_AT_RULE ||
       error.code ==
           amp.validator.ValidationError.Code
               .CSS_SYNTAX_PROPERTY_DISALLOWED_TOGETHER_WITH ||
       error.code ==
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
          amp.validator.ValidationError.Code.DEPRECATED_MANUFACTURED_BODY ||
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
  // E.g. "The 'amp-image-lightbox extension .js script' tag is
  // missing or incorrect, but required by 'amp-image-lightbox'."
  if (error.code ===
          amp.validator.ValidationError.Code.TAG_REQUIRED_BY_MISSING &&
      (goog.string./*OK*/ startsWith(error.params[1], 'amp-') ||
       error.params[1] === 'template')) {
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
      (error.params[1] === 'template')) {
    return amp.validator.ErrorCategory.Code.AMP_HTML_TEMPLATE_PROBLEM;
  }
  // E.g. "Missing URL for attribute 'href' in tag 'a'."
  // E.g. "Invalid URL protocol 'http:' for attribute 'src' in tag
  // 'amp-iframe'." Note: Parameters in the format strings appear out
  // of order so that error.params(1) is the tag for all four of these.
  if (error.code == amp.validator.ValidationError.Code.MISSING_URL ||
      error.code == amp.validator.ValidationError.Code.INVALID_URL ||
      error.code == amp.validator.ValidationError.Code.INVALID_URL_PROTOCOL ||
      error.code == amp.validator.ValidationError.Code.DISALLOWED_DOMAIN ||
      error.code ==
          amp.validator.ValidationError.Code.DISALLOWED_RELATIVE_URL) {
    if (goog.string./*OK*/ startsWith(error.params[1], 'amp-')) {
      return amp.validator.ErrorCategory.Code.AMP_TAG_PROBLEM;
    }
    return amp.validator.ErrorCategory.Code.DISALLOWED_HTML;
  }
  // E.g. "The dimension '1x' in attribute 'srcset' appears more than once."
  if (error.code == amp.validator.ValidationError.Code.DUPLICATE_DIMENSION) {
    return amp.validator.ErrorCategory.Code.DISALLOWED_HTML;
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
  if (!amp.validator.GENERATE_DETAILED_ERRORS) {
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
  if (amp.validator.GENERATE_DETAILED_ERRORS) {
    throw 'not implemented';
  }
  // TODO(powdercloud): This needs additional logic to make sure
  // that markManufacturedBody / the start of the body tag is not
  // inserted in the wrong spot.
  const handler = new amp.validator.ValidationHandler(htmlFormat);
  for (const e of saxEvents) {
    switch (e[0]) {
      case 'startTag':
        e.shift();
        const tagName = e.shift();
        handler.startTag(tagName, e);
        break;
      case 'endTag':
        handler.endTag(e[1]);
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
