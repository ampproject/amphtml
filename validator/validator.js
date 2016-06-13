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
goog.provide('amp.validator.CssLengthAndUnit');  // Only for testing.
goog.provide('amp.validator.ValidationHandler');
goog.provide('amp.validator.isSeverityWarning');
goog.require('amp.htmlparser.HtmlSaxHandlerWithLocation');
goog.require('amp.validator.AtRuleSpec');
goog.require('amp.validator.AtRuleSpec.BlockType');
goog.require('amp.validator.AttrList');
goog.require('amp.validator.CssSpec');
goog.require('amp.validator.GENERATE_DETAILED_ERRORS');
goog.require('amp.validator.RULES');
goog.require('amp.validator.TagSpec');
goog.require('amp.validator.ValidationError');
goog.require('amp.validator.ValidationError.Code');
goog.require('amp.validator.ValidationError.Severity');
goog.require('amp.validator.ValidationResult');
goog.require('amp.validator.ValidationResult.Status');
goog.require('amp.validator.ValidatorRules');
goog.require('goog.Uri');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.string');
goog.require('goog.structs.Map');
goog.require('goog.structs.Set');
goog.require('parse_css.BlockType');
goog.require('parse_css.ParsedCssUrl');
goog.require('parse_css.RuleVisitor');
goog.require('parse_css.extractUrls');
goog.require('parse_css.parseAStylesheet');
goog.require('parse_css.tokenize');
goog.require('parse_srcset.SrcsetParsingResult');
goog.require('parse_srcset.parseSrcset');

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
 * Copyies results from another ValidationResult.
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
   * @param {!number} line
   * @param {!number} col
   */
  constructor(line, col) {
    this.line_ = line;
    this.col_ = col;
  }

  /** @return {number} */
  getLine() { return this.line_; }

  /** @return {number} */
  getCol() { return this.col_; }
}

/**
 * Some tags have no end tags as per HTML5 spec. These were extracted
 * from the single page spec by looking for "no end tag" with CTRL+F.
 * @type {Object<string, number>}
 */
const TagsWithNoEndTags = function() {
  // TODO(johannes): Figure out how to prevent the Closure compiler from
  // renaming entries in a map. I wanted to do it the same way that
  // amp.htmlparser.HtmlParser.Elements is done (htmlparser.js), but it kept
  // renaming my keys causing lookup failures. :-(
  const tags = [
    'base', 'link', 'meta', 'hr', 'br', 'wbr', 'img', 'embed', 'param',
    'source', 'track', 'area', 'col', 'input', 'keygen'
  ];
  const dict = {};
  for (const tag of tags) {
    dict[tag] = 0;
  }
  return dict;
}();

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
     * @type {!number}
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
  setLineCol(lineCol) { this.lineCol_ = lineCol; }

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
      if (names.indexOf(tagName) == -1) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          const allowedNames = '[\'' + names.join('\', \'') + '\']';
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code.DISALLOWED_CHILD_TAG_NAME,
              context.getDocLocator(),
              /* params */
              [tagName, getTagSpecName(this.parentSpec_), allowedNames],
              this.parentSpec_.specUrl, result);
        } else {
          result.status = amp.validator.ValidationResult.Status.FAIL;
          return;
        }
      }
    }
    if (childTags.firstChildTagNameOneof.length > 0 &&
        (this.numChildTagsSeen_ - 1) == 0) {
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
              [tagName, getTagSpecName(this.parentSpec_), allowedNames],
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
    if (expected === null || expected === this.numChildTagsSeen_) {
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
 * @typedef {{ tagName: string,
 *             matcher: ?ChildTagMatcher,
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
   * @param {!string} tagName
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} result
   * @param {!Array<string>} encounteredAttrs Alternating key/value pairs.
   */
  enterTag(tagName, context, result, encounteredAttrs) {
    if (this.stack_.length > 0 &&
        TagsWithNoEndTags.hasOwnProperty(
            this.stack_[this.stack_.length - 1].tagName)) {
      this.popFromStack_(context, result);
    }
    let maybeDataAmpReportTestValue = null;
    for (let i = 0; i < encounteredAttrs.length; i += 2) {
      const attrName = encounteredAttrs[i];
      const attrValue = encounteredAttrs[i + 1];
      if (attrName === 'data-amp-report-test') {
        maybeDataAmpReportTestValue = attrValue;
        break;
      }
    }
    this.stack_.push({
      tagName: tagName,
      matcher: null,
      dataAmpReportTestValue: maybeDataAmpReportTestValue
    });
  }

  /**
   * Sets the tag matcher for the tag which is currently on the stack.
   * This gets called shortly after EnterTag for a given tag.
   * @param {!ChildTagMatcher} matcher
   */
  setChildTagMatcher(matcher) {
    this.stack_[this.stack_.length - 1].matcher = matcher;
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
   * @param {!string} tagName
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} result
   */
  exitTag(tagName, context, result) {
    // We look for tagName from the end. If we can find it, we pop
    // everything from thereon off the stack.
    for (let idx = this.stack_.length - 1; idx > 0; idx--) {
      if (this.stack_[idx].tagName === tagName) {
        while (this.stack_.length > idx) {
          this.popFromStack_(context, result);
        }
        return;
      }
    }
  }

  /**
   * This method is called when we're done with the
   * document. Normally, the parser should actually close the tags,
   * but just in case it doesn't this easy-enough method will take care of it.
   */
  exitRemainingTags(context, result) {
    while (this.stack_.length > 0) {
      this.popFromStack_(context, result);
    }
  }

  /**
   * The name of the current tag.
   * @return {!string}
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
   * @return {!string}
   */
  getParent() {
    if (this.stack_.length >= 2) {
      return this.stack_[this.stack_.length - 2].tagName;
    }
    return '$ROOT';
  }

  /**
   * Returns true if the current tag has ancestor with the given tag name.
   * @param {!string} ancestor
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

  /**
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} result
   * @private
   */
  popFromStack_(context, result) {
    const top = this.stack_.pop();
    if (top.matcher !== null) {
      top.matcher.exitTag(context, result);
    }
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
    goog.asserts.assert(atRuleSpec.name !== null);
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

    /** @private @type {!LineCol} */
    this.lineCol_ = new LineCol(1, 0);

    /**
     * @type {RegExp} cdataRegex
     * @private
     */
    this.cdataRegex_ = null;
    if (tagSpec.cdata && tagSpec.cdata.cdataRegex) {
      this.cdataRegex_ = new RegExp('^(' + tagSpec.cdata.cdataRegex + ')$');
    }

    /** @type {string} */
    var blacklistedCdataRegexStr = '';
    if (tagSpec.cdata) {
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
  hasCdataRegex() { return this.cdataRegex_ !== null; }

  /**
   * @return {RegExp} cdataRegex
   */
  getCdataRegex() { return this.cdataRegex_; }

  /**
   * @return {boolean}
   */
  hasBlacklistedCdataRegex() { return this.blacklistedCdataRegex_ !== null; }

  /**
   * @return {RegExp} blacklistedCdataRegex
   */
  getBlacklistedCdataRegex() { return this.blacklistedCdataRegex_; }

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
    if (cdataSpec.maxBytes !== null) {
      const bytes = byteLength(cdata);
      if (bytes > cdataSpec.maxBytes) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code.STYLESHEET_TOO_LONG,
              context.getDocLocator(),
              /* params */
              [getTagSpecName(this.tagSpec_), bytes, cdataSpec.maxBytes],
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
          cdata, this.getLineCol().getLine(), this.getLineCol().getCol(),
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
      if (!amp.validator.GENERATE_DETAILED_ERRORS && cssErrors.length > 0) {
        validationResult.status = amp.validator.ValidationResult.Status.FAIL;
        return;
      }
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
  setLineCol(lineCol) { this.lineCol_ = lineCol; }

  /** @return {!LineCol} */
  getLineCol() { return this.lineCol_; }
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
     * @type {!goog.structs.Set<string>}
     * @private
     */
    this.mandatoryAlternativesSatisfied_ = new goog.structs.Set();
    /**
     * DocLocator object from the parser which gives us line/col numbers.
     * @type {amp.htmlparser.DocLocator}
     * @private
     */
    this.docLocator_ = null;

    /**
     * @type {!CdataMatcher}
     * @private
     */
    this.cdataMatcher_ = new CdataMatcher(new amp.validator.TagSpec());

    /**
     * @type {!TagStack}
     * @private
     */
    this.tagStack_ = new TagStack();

    /**
     * @type {!goog.structs.Set<number>}
     * @private
     */
    this.tagspecsValidated_ = new goog.structs.Set();
  }

  /**
   * Callback before startDoc which gives us a document locator.
   * @param {!amp.htmlparser.DocLocator} locator
   */
  setDocLocator(locator) { this.docLocator_ = locator; }

  /** @return {amp.htmlparser.DocLocator} */
  getDocLocator() { return this.docLocator_; }

  /**
   * @param {!amp.validator.ValidationError.Severity} severity
   * @param {!amp.validator.ValidationError.Code} validationErrorCode Error code
   * @param {LineCol|amp.htmlparser.DocLocator} lineCol a line / column pair.
   * @param {!Array<!string>} params
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
   * Records a tag spec that's been validated. This method is only used by
   * ParsedValidatorRules, which by itself does not have any mutable state.
   * @param {number} tagSpecId id of tagSpec to record.
   * @return {boolean} whether or not the tag spec had been encountered before.
   */
  recordTagspecValidated(tagSpecId) {
    const duplicate = this.tagspecsValidated_.contains(tagSpecId);
    if (!duplicate) {
      this.tagspecsValidated_.add(tagSpecId);
    }
    return !duplicate;
  }

  /**
   * @return {!goog.structs.Set<number>}
   */
  getTagspecsValidated() { return this.tagspecsValidated_; }

  /**
   * For use by |ParsedValidatorRules|, which doesn't have any mutable state.
   * @param {string} alternative id of the validated alternative.
   */
  recordMandatoryAlternativeSatisfied(alternative) {
    this.mandatoryAlternativesSatisfied_.add(alternative);
  }

  /**
   * The mandatory alternatives that we've satisfied.
   * @return {!goog.structs.Set<string>}
   */
  getMandatoryAlternativesSatisfied() {
    return this.mandatoryAlternativesSatisfied_;
  }

  /** @return {CdataMatcher} */
  getCdataMatcher() { return this.cdataMatcher_; }

  /** @param {CdataMatcher} matcher */
  setCdataMatcher(matcher) {
    // We store away the position from when the matcher was created
    // so we can use it to generate error messages relating to the opening tag.
    matcher.setLineCol(
        new LineCol(this.docLocator_.getLine(), this.docLocator_.getCol()));
    this.cdataMatcher_ = matcher;
  }

  /** @return {!TagStack} */
  getTagStack() { return this.tagStack_; }

  /** @param {ChildTagMatcher} matcher */
  setChildTagMatcher(matcher) {
    matcher.setLineCol(
        new LineCol(this.docLocator_.getLine(), this.docLocator_.getCol()));
    this.tagStack_.setChildTagMatcher(matcher);
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
     * @type {!goog.structs.Set<string>}
     * @private
     */
    this.allowedProtocols_ = new goog.structs.Set();
    if (this.spec_ !== null) {
      for (const protocol of this.spec_.allowedProtocol) {
        this.allowedProtocols_.add(protocol);
      }
    }
  }

  /**
   * @param {!Context} context
   * @param {!string} attrName
   * @param {!string} url
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
   * @param {!string} url
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   */
  validateUrlAndProtocol(adapter, context, url, tagSpec, result) {
    if (url === '' &&
        (this.spec_.allowEmpty === null || this.spec_.allowEmpty === false)) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        adapter.missingUrl(context, tagSpec, result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      }
      return;
    }
    let uri;
    try {
      uri = goog.Uri.parse(url);
    } catch (ex) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        adapter.invalidUrl(context, url, tagSpec, result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      }
      return;
    }
    if (uri.hasScheme() &&
        !this.allowedProtocols_.contains(uri.getScheme().toLowerCase())) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        adapter.invalidUrlProtocol(
            context, uri.getScheme().toLowerCase(), tagSpec, result);
      } else {
        result.status = amp.validator.ValidationResult.Status.FAIL;
      }
      return;
    }
    if (!this.spec_.allowRelative && !uri.hasScheme()) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        adapter.disallowedRelativeUrl(context, url, tagSpec, result);
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
   * @param {!string} attrName
   */
  constructor(attrName) { this.attrName_ = attrName; }

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
   * @param {!string} url
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
   * @param {!string} protocol
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
   * @param {!string} url
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
   * @param {!number} line
   * @param {!number} col
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
   * @param {!string} url
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
   * @param {!string} protocol
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
   * @param {!string} url
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

    goog.asserts.assert(attrSpec.name != null);
    /**
     * @type {!string} attrName
     * @private
     */
    this.attrName_ = attrSpec.name;

    /**
     * @type {RegExp} ifValueRegex
     * @private
     */
    this.ifValueRegex_ = null;

    if (this.spec_ && this.spec_.ifValueRegex) {
      this.ifValueRegex_ = new RegExp('^(' + this.spec_.ifValueRegex + ')$');
    }
  }

  /**
   * @return {boolean}
   */
  hasIfValueRegex() { return this.ifValueRegex_ !== null; }

  /**
   * @return {RegExp} ifValueRegex
   */
  getIfValueRegex() { return this.ifValueRegex_; }

  /**
   * @return {!string} attrName
   */
  getAttrName() { return this.attrName_; }

  /**
   * @return {amp.validator.AttrTriggerSpec}
   */
  getSpec() { return this.spec_; }
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
    if (this.spec_.trigger) {
      this.triggerSpec_ = new ParsedAttrTriggerSpec(this.spec_);
    }
    /**
     * @type {!ParsedUrlSpec}
     * @private
     */
    this.valueUrlSpec_ = new ParsedUrlSpec(this.spec_.valueUrl);
    /**
     * @type {!goog.structs.Map<string, !amp.validator.PropertySpec>}
     * @private
     */
    this.valuePropertyByName_ = new goog.structs.Map();
    const mandatoryValuePropertyNames = [];
    if (this.spec_.valueProperties !== null) {
      for (const propertySpec of this.spec_.valueProperties.properties) {
        this.valuePropertyByName_.set(propertySpec.name, propertySpec);
        if (propertySpec.mandatory) {
          mandatoryValuePropertyNames.push(propertySpec.name);
        }
      }
    }
    /**
     * @type {!Array<!string>}
     * @private
     */
    this.mandatoryValuePropertyNames_ =
        sortAndUniquify(mandatoryValuePropertyNames);

    /**
     * @type {RegExp} valueRegex
     * @private
     */
    this.valueRegex_ = null;
    if (this.spec_ && this.spec_.valueRegex) {
      this.valueRegex_ = new RegExp('^(' + this.spec_.valueRegex + ')$');
    }

    /**
     * @type {RegExp} valueRegexCasei
     * @private
     */
    this.valueRegexCasei_ = null;
    if (this.spec_ && this.spec_.valueRegexCasei) {
      this.valueRegexCasei_ =
          new RegExp('^(' + this.spec_.valueRegexCasei + ')$', 'i');
    }

    /**
     * @type {RegExp} blacklistedValueRegex
     * @private
     */
    this.blacklistedValueRegex_ = null;
    if (this.spec_ && this.spec_.blacklistedValueRegex) {
      this.blacklistedValueRegex_ =
          new RegExp(this.spec_.blacklistedValueRegex, 'i');
    }
  }

  /**
   * @return {boolean}
   */
  hasValueRegex() { return this.valueRegex_ !== null; }

  /**
   * @return {RegExp} valueRegex
   */
  getValueRegex() { return this.valueRegex_; }

  /**
   * @return {boolean}
   */
  hasValueRegexCasei() { return this.valueRegexCasei_ !== null; }

  /**
   * @return {RegExp} valueRegex
   */
  getValueRegexCasei() { return this.valueRegexCasei_; }

  /**
   * @return {boolean}
   */
  hasBlacklistedValueRegex() { return this.blacklistedValueRegex_ !== null; }

  /**
   * @return {RegExp} blacklistedValueRegex
   */
  getBlacklistedValueRegex() { return this.blacklistedValueRegex_; }

  /**
   * @return {number} unique for this attr spec.
   */
  getId() { return this.id_; }

  /**
   * @return {!amp.validator.AttrSpec}
   */
  getSpec() { return this.spec_; }

  /**
   * @return {boolean}
   */
  hasTriggerSpec() { return this.triggerSpec_ !== null; }

  /**
   * @return {ParsedAttrTriggerSpec}
   */
  getTriggerSpec() { return this.triggerSpec_; }

  /**
   * @param {!Context} context
   * @param {!string} attrName
   * @param {!string} attrValue
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
      if (attrValue == this.spec_.value) {
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
   * @param {!string} attrName
   * @param {!string} attrValue
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   * @private
   */
  validateAttrValueUrl(context, attrName, attrValue, tagSpec, result) {
    /** @type {!Array<!string>} */
    let maybeUris = [];
    if (attrName != 'srcset') {
      maybeUris.push(goog.string.trim(attrValue));
    } else {
      let srcset = goog.string.trim(attrValue);
      if (srcset == '') {
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
      const parseResult = parse_srcset.parseSrcset(srcset);
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
   * @param {!string} attrName
   * @param {!string} attrValue
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {!amp.validator.ValidationResult} result
   * @private
   */
  validateAttrValueProperties(context, attrName, attrValue, tagSpec, result) {
    // TODO(johannes): Replace this hack with a parser.
    const segments = attrValue.split(',');
    const properties = new goog.structs.Map();
    for (const segment of segments) {
      const keyValue = segment.split('=');
      if (keyValue.length < 2) {
        continue;
      }
      properties.set(keyValue[0].trim().toLowerCase(), keyValue[1]);
    }
    // TODO(johannes): End hack.
    const names = properties.getKeys();
    goog.array.sort(names);
    for (const name of names) {
      const value = properties.get(name);
      if (!this.valuePropertyByName_.containsKey(name)) {
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
      const propertySpec = this.valuePropertyByName_.get(name);
      if (propertySpec.value !== null) {
        if (propertySpec.value != value.toLowerCase()) {
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
        if (parseFloat(value) != propertySpec.valueDouble) {
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
 * Collect the AttrSpec pointers for a given |tagspec|.
 * There are four ways to specify attributes:
 * (1) implicitly by a tag spec, if the tag spec has the amp_layout field
 * set - in this case, the AMP_LAYOUT_ATTRS are assumed;
 * (2) within a TagSpec::attrs;
 * (3) via TagSpec::attr_lists which references lists by key;
 * (4) within the $GLOBAL_ATTRS TagSpec::attr_list.
 * It's possible to provide multiple
 * specifications for the same attribute name, but for any given tag only one
 * such specification can be active. The precedence is (1), (2), (3), (4)
 * @param {!Object} tagSpec
 * @param {!goog.structs.Map<string, !amp.validator.AttrList>} rulesAttrMap
 * @return {!Array<!amp.validator.AttrSpec>} all of the AttrSpec pointers
 */
function GetAttrsFor(tagSpec, rulesAttrMap) {
  const attrs = [];
  const namesSeen = new goog.structs.Set();
  // (1) layout attrs.
  if (tagSpec.ampLayout !== null) {
    const layoutSpecs = rulesAttrMap.get('$AMP_LAYOUT_ATTRS');
    if (layoutSpecs) {
      for (const spec of layoutSpecs.attrs) {
        if (!namesSeen.contains(spec.name)) {
          namesSeen.add(spec.name);
          attrs.push(spec);
        }
      }
    }
  }
  // (2) attributes specified within |tagSpec|.
  for (const spec of tagSpec.attrs) {
    if (!namesSeen.contains(spec.name)) {
      namesSeen.add(spec.name);
      attrs.push(spec);
    }
  }
  // (3) attributes specified via reference to an attr_list.
  for (const tagSpecKey of tagSpec.attrLists) {
    const specs = rulesAttrMap.get(tagSpecKey);
    goog.asserts.assert(specs !== undefined);
    for (const spec of specs.attrs) {
      if (!namesSeen.contains(spec.name)) {
        namesSeen.add(spec.name);
        attrs.push(spec);
      }
    }
  }
  // (3) attributes specified in the global_attr list.
  const globalSpecs = rulesAttrMap.get('$GLOBAL_ATTRS');
  if (!globalSpecs) {
    return attrs;
  }
  for (const spec of globalSpecs.attrs) {
    if (!namesSeen.contains(spec.name)) {
      namesSeen.add(spec.name);
      attrs.push(spec);
    }
  }
  return attrs;
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
  if (tagSpec.specName !== null) {
    return tagSpec.specName;
  }
  goog.asserts.assert(tagSpec.tagName !== null);
  return tagSpec.tagName;
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
amp.validator.CssLengthAndUnit = class {
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
    const re = /^\d+(?:\.\d+)?(px|em|rem|vh|vw|vmin|vmax)?$/;
    const match = re.exec(input);
    if (match !== null) {
      this.isValid = true;
      this.unit = match[1] || 'px';
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
 * @param {!amp.validator.CssLengthAndUnit} inputWidth
 * @return {!amp.validator.CssLengthAndUnit}
 */
function CalculateWidth(spec, inputLayout, inputWidth) {
  if ((inputLayout === amp.validator.AmpLayout.Layout.UNKNOWN ||
       inputLayout === amp.validator.AmpLayout.Layout.FIXED) &&
      !inputWidth.isSet && spec.definesDefaultWidth) {
    return new amp.validator.CssLengthAndUnit('1px', /* allowAuto */ false);
  }
  return inputWidth;
}


/**
 * Calculates the effective height from input layout and input height.
 * @param {!amp.validator.AmpLayout} spec
 * @param {!amp.validator.AmpLayout.Layout} inputLayout
 * @param {!amp.validator.CssLengthAndUnit} inputHeight
 * @return {!amp.validator.CssLengthAndUnit}
 */
function CalculateHeight(spec, inputLayout, inputHeight) {
  if ((inputLayout === amp.validator.AmpLayout.Layout.UNKNOWN ||
       inputLayout === amp.validator.AmpLayout.Layout.FIXED ||
       inputLayout === amp.validator.AmpLayout.Layout.FIXED_HEIGHT) &&
      !inputHeight.isSet && spec.definesDefaultHeight) {
    return new amp.validator.CssLengthAndUnit('1px', /* allowAuto */ false);
  }
  return inputHeight;
}

/**
 * Calculates the layout; this depends on the width / height
 * calculation above. It happens last because web designers often make
 * fixed-sized mocks first and then the layout determines how things
 * will change for different viewports / devices / etc.
 * @param {!amp.validator.AmpLayout.Layout} inputLayout
 * @param {!amp.validator.CssLengthAndUnit} width
 * @param {!amp.validator.CssLengthAndUnit} height
 * @param {string?} sizesAttr
 * @param {string?} heightsAttr
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
 * @param {!goog.structs.Set<string>} tagSpecNamesToTrack
 * @return {!boolean}
 */
function shouldRecordTagspecValidated(tag, tagSpecNamesToTrack) {
  return tag.mandatory || tag.unique ||
      getTagSpecName(tag) != null &&
      tagSpecNamesToTrack.contains(getTagSpecName(tag));
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
 * @param {!string} attrName
 * @param {!string} attrValue
 * @param {!string} mandatoryParent may be set to "$NOPARENT"
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
   * @param {!string} templateSpecUrl
   * @param {!goog.structs.Map<string, !amp.validator.AttrList>} attrListsByName
   * @param {!goog.structs.Map<string, number>} tagspecIdsByTagSpecName
   * @param {!boolean} shouldRecordTagspecValidated
   * @param {!amp.validator.TagSpec} tagSpec
   * @param {number} tagId
   */
  constructor(
      templateSpecUrl, attrListsByName, tagspecIdsByTagSpecName,
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
     * ParsedAttributes in id order.
     * @type {!Array<!ParsedAttrSpec>}
     * @private
     */
    this.attrsById_ = [];
    /**
     * ParsedAttributes keyed by name.
     * @type {!goog.structs.Map<string, !ParsedAttrSpec>}
     * @private
     */
    this.attrsByName_ = new goog.structs.Map();
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
     * @type {!string}
     * @private
     */
    this.templateSpecUrl_ = templateSpecUrl;
    /**
     * @type {!boolean}
     * @private
     */
    this.shouldRecordTagspecValidated_ = shouldRecordTagspecValidated;
    /**
     * @type {!Array<number>}
     * @private
     */
    this.alsoRequiresTag_ = [];
    /**
     * @type {number}
     * @private
     */
    this.dispatchKeyAttrSpec_ = -1;
    /**
     * @type {!Array<number>}
     * @private
     */
    this.implicitAttrspecs_ = [];

    const attrs = GetAttrsFor(tagSpec, attrListsByName);
    for (let i = 0; i < attrs.length; ++i) {
      const parsedAttrSpec = new ParsedAttrSpec(attrs[i], i);
      this.attrsById_.push(parsedAttrSpec);
      this.attrsByName_.set(parsedAttrSpec.getSpec().name, parsedAttrSpec);
      if (parsedAttrSpec.getSpec().mandatory) {
        this.mandatoryAttrIds_.push(i);
      }
      const mandatoryOneof = parsedAttrSpec.getSpec().mandatoryOneof;
      if (mandatoryOneof !== null) {
        this.mandatoryOneofs_.push(mandatoryOneof);
      }
      const altNames = parsedAttrSpec.getSpec().alternativeNames;
      for (const altName of altNames) {
        this.attrsByName_.set(altName, parsedAttrSpec);
      }
      if (parsedAttrSpec.getSpec().dispatchKey) {
        this.dispatchKeyAttrSpec_ = i;
      }
      if (parsedAttrSpec.getSpec().implicit) {
        this.implicitAttrspecs_.push(i);
      }
    }
    this.mandatoryOneofs_ = sortAndUniquify(this.mandatoryOneofs_);

    for (const tagSpecName of tagSpec.alsoRequiresTag) {
      this.alsoRequiresTag_.push(tagspecIdsByTagSpecName.get(tagSpecName));
    }
  }

  /**
   * @return {number} unique id for this tag spec.
   */
  getId() { return this.id_; }

  /**
   * Return the original tag spec. This is the json object representation from
   * amp.validator.rules.
   * @return {!amp.validator.TagSpec}
   */
  getSpec() { return this.spec_; }

  /**
   * A dispatch key is a mandatory attribute name/value unique to this
   * TagSpec. If an encountered tag matches this dispatch key, it is
   * validated first against this TagSpec in order to improve validation
   * performance and error message selection. Not all TagSpecs have a
   * dispatch key.
   * @return {boolean}
   */
  hasDispatchKey() { return this.dispatchKeyAttrSpec_ !== -1; }

  /**
   * You must check hasDispatchKey before accessing
   * @return {string}
   */
  getDispatchKey() {
    goog.asserts.assert(this.hasDispatchKey());
    const parsedSpec = this.attrsById_[this.dispatchKeyAttrSpec_];
    var mandatoryParent =
        this.spec_.mandatoryParent === null ? '' : this.spec_.mandatoryParent;
    const attrName = parsedSpec.getSpec().name;
    goog.asserts.assert(attrName !== null);
    const attrValue = parsedSpec.getSpec().value;
    goog.asserts.assert(attrValue !== null);
    return makeDispatchKey(attrName, attrValue, mandatoryParent);
  }

  /**
   * A TagSpec may specify other tags to be required as well, when that
   * tag is used. This accessor returns the IDs for the tagspecs that
   * are also required if |this| tag occurs in the document.
   * @return {!Array<number>}
   */
  getAlsoRequiresTag() { return this.alsoRequiresTag_; }

  /**
   * Whether or not the tag should be recorded via
   * Context.recordTagspecValidated if it was validated
   * successfullly. For performance, this is only done for tags that are
   * mandatory, unique, or possibly required by some other tag.
   * @return {boolean}
   */
  shouldRecordTagspecValidated() { return this.shouldRecordTagspecValidated_; }

  /**
   * Returns true if |value| contains mustache template syntax.
   * @param {!string} value
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
   * @param {!string} value
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
   * @param {!string} value
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
   * @param {!goog.structs.Map<string, string>} attrsByKey
   * @param {!amp.validator.ValidationResult} result
   */
  validateLayout(context, attrsByKey, result) {
    goog.asserts.assert(this.spec_.ampLayout != null);

    const layoutAttr = attrsByKey.get('layout');
    const widthAttr = attrsByKey.get('width');
    const heightAttr = attrsByKey.get('height');
    const sizesAttr = attrsByKey.get('sizes');
    const heightsAttr = attrsByKey.get('heights');

    // We disable validating layout for tags where one of the layout attributes
    // contains mustache syntax.
    const hasTemplateAncestor = context.getTagStack().hasAncestor('template');
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
        new amp.validator.CssLengthAndUnit(widthAttr, /* allowAuto */ true);
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
        new amp.validator.CssLengthAndUnit(heightAttr, /* allowAuto */ true);
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
   * @param {!string} attrName
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
      if (attrName.indexOf('{{') != -1) {
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
   * @param {!string} attrName
   * @param {!string} attrValue
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
   * @param {!Array<string>} encounteredAttrs Alternating key/value pairs.
   * @param {!amp.validator.ValidationResult} result
   */
  validateAttributes(context, encounteredAttrs, result) {
    if (this.spec_.ampLayout !== null) {
      const attrsByKey = new goog.structs.Map();
      for (let i = 0; i < encounteredAttrs.length; i += 2) {
        attrsByKey.set(encounteredAttrs[i], encounteredAttrs[i + 1]);
      }
      this.validateLayout(context, attrsByKey, result);
      if (result.status === amp.validator.ValidationResult.Status.FAIL) {
        return;
      }
    }
    const hasTemplateAncestor = context.getTagStack().hasAncestor('template');
    let mandatoryAttrsSeen = [];
    /** @type {!goog.structs.Set<string>} */
    const mandatoryOneofsSeen = new goog.structs.Set();
    let parsedTriggerSpecs = [];
    /** If a tag has implicit attributes, we then add these attributes as
     * validated. E.g. tag 'a' has implicit attributes 'role' and 'tabindex'.
     * @type {!goog.structs.Set<number>}
     */
    const attrspecsValidated = new goog.structs.Set(this.implicitAttrspecs_);
    // Our html parser delivers attributes as an array of alternating keys and
    // values. We skip over this array 2 at a time to iterate over the keys.
    for (let i = 0; i < encounteredAttrs.length; i += 2) {
      const attrKey = encounteredAttrs[i];
      const attrName = attrKey.toLowerCase();
      let attrValue = encounteredAttrs[i + 1];

      const parsedSpec = this.attrsByName_.get(attrName);
      if (parsedSpec === undefined) {
        this.validateAttrNotFoundInSpec(context, attrName, result);
        if (result.status === amp.validator.ValidationResult.Status.FAIL) {
          return;
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
      if (parsedSpec.getSpec().deprecation !== null) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          context.addError(
              amp.validator.ValidationError.Severity.WARNING,
              amp.validator.ValidationError.Code.DEPRECATED_ATTR,
              context.getDocLocator(),
              /* params */
              [
                attrName, getTagSpecName(this.spec_),
                parsedSpec.getSpec().deprecation
              ],
              parsedSpec.getSpec().deprecationUrl, result);
        }
        // Deprecation is only a warning, so we don't return.
      }
      if (!hasTemplateAncestor ||
          !ParsedTagSpec.valueHasTemplateSyntax(attrValue)) {
        parsedSpec.validateNonTemplateAttrValueAgainstSpec(
            context, attrName, attrValue, this.spec_, result);
        if (result.status === amp.validator.ValidationResult.Status.FAIL) {
          return;
        }
      }
      if (parsedSpec.hasBlacklistedValueRegex()) {
        if (parsedSpec.getBlacklistedValueRegex().test(attrValue)) {
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
      if (parsedSpec.getSpec().mandatory) {
        mandatoryAttrsSeen.push(parsedSpec.getId());
      }
      // The "at most 1" part of mandatory_oneof: mandatory_oneof
      // wants exactly one of the alternatives, so here
      // we check whether we already saw another alternative
      if (parsedSpec.getSpec().mandatoryOneof &&
          mandatoryOneofsSeen.contains(parsedSpec.getSpec().mandatoryOneof)) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code.MUTUALLY_EXCLUSIVE_ATTRS,
              context.getDocLocator(),
              /* params */
              [getTagSpecName(this.spec_), parsedSpec.getSpec().mandatoryOneof],
              this.spec_.specUrl, result);
        } else {
          result.status = amp.validator.ValidationResult.Status.FAIL;
        }
        return;
      }
      mandatoryOneofsSeen.add(parsedSpec.getSpec().mandatoryOneof);
      if (parsedSpec.hasTriggerSpec() &&
          parsedSpec.getTriggerSpec().hasIfValueRegex()) {
        if (parsedSpec.getTriggerSpec().getIfValueRegex().test(attrValue)) {
          parsedTriggerSpecs.push(parsedSpec.getTriggerSpec());
        }
      }
      attrspecsValidated.add(parsedSpec.getId());
    }
    // The "at least 1" part of mandatory_oneof: If none of the
    // alternatives were present, we report that an attribute is missing.
    for (const mandatoryOneof of this.mandatoryOneofs_) {
      if (!mandatoryOneofsSeen.contains(mandatoryOneof)) {
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
        const parsedSpec = this.attrsByName_.get(alsoRequiresAttr);
        if (parsedSpec === undefined) {
          continue;
        }
        if (!attrspecsValidated.contains(parsedSpec.getId())) {
          if (amp.validator.GENERATE_DETAILED_ERRORS) {
            context.addError(
                amp.validator.ValidationError.Severity.ERROR,
                amp.validator.ValidationError.Code.ATTR_REQUIRED_BUT_MISSING,
                context.getDocLocator(),
                /* params */
                [
                  parsedSpec.getSpec().name, getTagSpecName(this.spec_),
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
            [this.attrsById_[diff].getSpec().name, getTagSpecName(this.spec_)],
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
              getTagSpecName(this.spec_), context.getTagStack().getParent(),
              this.spec_.mandatoryParent
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
                  this.spec_.tagName, mandatoryAncestor,
                  this.spec_.mandatoryAncestorSuggestedAlternative
                ],
                this.spec_.specUrl, validationResult);
          } else {
            context.addError(
                amp.validator.ValidationError.Severity.ERROR,
                amp.validator.ValidationError.Code.MANDATORY_TAG_ANCESTOR,
                context.getDocLocator(),
                /* params */[this.spec_.tagName, mandatoryAncestor],
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
              /* params */[this.spec_.tagName, disallowedAncestor],
              this.spec_.specUrl, validationResult);
        } else {
          validationResult.status = amp.validator.ValidationResult.Status.FAIL;
        }
        return;
      }
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
     * @type {!goog.structs.Map<!string, number>}
     * @private
     */
    this.tagSpecsByDispatch_ = new goog.structs.Map();
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
    goog.asserts.assert(
        this.tagSpecsByDispatch_.containsKey(dispatchKey) === false);
    this.tagSpecsByDispatch_.set(dispatchKey, tagSpecId);
  }

  /**
   * Registers a new non dispatch key tagspec id.
   * @param {!number} tagSpecId
   * @public
   */
  registerTagSpec(tagSpecId) { this.allTagSpecs_.push(tagSpecId); }

  /**
   * @return {boolean}
   */
  hasDispatchKeys() { return !this.tagSpecsByDispatch_.isEmpty(); }

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
    const match = this.tagSpecsByDispatch_.get(dispatchKey);
    if (match !== undefined) {
      return match;
    }

    // Try next to find a key with the *any* parent.
    const noParentKey =
        makeDispatchKey(attrName, attrValue, /*mandatoryParent*/ '');
    const noParentMatch = this.tagSpecsByDispatch_.get(noParentKey);
    if (noParentMatch !== undefined) {
      return noParentMatch;
    }

    // Special case for foo=foo. We consider this a match for a dispatch key of
    // foo="" or just <tag foo>.
    if (attrName == attrValue)
      return this.matchingDispatchKey(attrName, '', mandatoryParent);

    return -1;
  }

  /**
   * @return {boolean}
   */
  hasTagSpecs() { return this.allTagSpecs_.length > 0; }

  /**
   * @return {!Array<number>}
   */
  allTagSpecs() { return this.allTagSpecs_; }
}

/**
 * A higher number means |code| is more specific, meaning more
 * helpful. Used by maxSpecificity below.
 * @param {!amp.validator.ValidationError.Code} code
 * @return {number}
 */
function specificity(code) {
  switch (code) {
    case amp.validator.ValidationError.Code.UNKNOWN_CODE:
      return 0;
    case amp.validator.ValidationError.Code
        .MANDATORY_CDATA_MISSING_OR_INCORRECT:
      return 1;
    case amp.validator.ValidationError.Code.CDATA_VIOLATES_BLACKLIST:
      return 2;
    case amp.validator.ValidationError.Code.WRONG_PARENT_TAG:
      return 3;
    case amp.validator.ValidationError.Code.DISALLOWED_TAG_ANCESTOR:
      return 4;
    case amp.validator.ValidationError.Code.MANDATORY_TAG_ANCESTOR:
      return 5;
    case amp.validator.ValidationError.Code.MANDATORY_TAG_ANCESTOR_WITH_HINT:
      return 6;
    case amp.validator.ValidationError.Code.MANDATORY_TAG_MISSING:
      return 7;
    case amp.validator.ValidationError.Code.TAG_REQUIRED_BY_MISSING:
      return 8;
    case amp.validator.ValidationError.Code.ATTR_REQUIRED_BUT_MISSING:
      return 9;
    case amp.validator.ValidationError.Code.DISALLOWED_TAG:
      return 10;
    case amp.validator.ValidationError.Code.DISALLOWED_ATTR:
      return 11;
    case amp.validator.ValidationError.Code.INVALID_ATTR_VALUE:
      return 12;
    case amp.validator.ValidationError.Code.ATTR_VALUE_REQUIRED_BY_LAYOUT:
      return 13;
    case amp.validator.ValidationError.Code.MANDATORY_ATTR_MISSING:
      return 14;
    case amp.validator.ValidationError.Code.MANDATORY_ONEOF_ATTR_MISSING:
      return 15;
    case amp.validator.ValidationError.Code.DUPLICATE_UNIQUE_TAG:
      return 16;
    case amp.validator.ValidationError.Code.STYLESHEET_TOO_LONG_OLD_VARIANT:
      return 17;
    case amp.validator.ValidationError.Code.STYLESHEET_TOO_LONG:
      return 18;
    case amp.validator.ValidationError.Code.CSS_SYNTAX:
      return 19;
    case amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_AT_RULE:
      return 20;
    case amp.validator.ValidationError.Code
        .MANDATORY_PROPERTY_MISSING_FROM_ATTR_VALUE:
      return 21;
    case amp.validator.ValidationError.Code
        .INVALID_PROPERTY_VALUE_IN_ATTR_VALUE:
      return 22;
    case amp.validator.ValidationError.Code.DISALLOWED_PROPERTY_IN_ATTR_VALUE:
      return 23;
    case amp.validator.ValidationError.Code.MUTUALLY_EXCLUSIVE_ATTRS:
      return 24;
    case amp.validator.ValidationError.Code.UNESCAPED_TEMPLATE_IN_ATTR_VALUE:
      return 25;
    case amp.validator.ValidationError.Code.TEMPLATE_PARTIAL_IN_ATTR_VALUE:
      return 26;
    case amp.validator.ValidationError.Code.TEMPLATE_IN_ATTR_NAME:
      return 27;
    case amp.validator.ValidationError.Code
        .INCONSISTENT_UNITS_FOR_WIDTH_AND_HEIGHT:
      return 28;
    case amp.validator.ValidationError.Code.IMPLIED_LAYOUT_INVALID:
      return 29;
    case amp.validator.ValidationError.Code.SPECIFIED_LAYOUT_INVALID:
      return 30;
    case amp.validator.ValidationError.Code.DEV_MODE_ENABLED:
      return 31;
    case amp.validator.ValidationError.Code.ATTR_DISALLOWED_BY_IMPLIED_LAYOUT:
      return 32;
    case amp.validator.ValidationError.Code.ATTR_DISALLOWED_BY_SPECIFIED_LAYOUT:
      return 33;
    case amp.validator.ValidationError.Code.DUPLICATE_DIMENSION:
      return 34;
    case amp.validator.ValidationError.Code.DISALLOWED_RELATIVE_URL:
      return 35;
    case amp.validator.ValidationError.Code.MISSING_URL:
      return 36;
    case amp.validator.ValidationError.Code.INVALID_URL_PROTOCOL:
      return 37;
    case amp.validator.ValidationError.Code.INVALID_URL:
      return 38;
    case amp.validator.ValidationError.Code.CSS_SYNTAX_STRAY_TRAILING_BACKSLASH:
      return 39;
    case amp.validator.ValidationError.Code.CSS_SYNTAX_UNTERMINATED_COMMENT:
      return 40;
    case amp.validator.ValidationError.Code.CSS_SYNTAX_UNTERMINATED_STRING:
      return 41;
    case amp.validator.ValidationError.Code.CSS_SYNTAX_BAD_URL:
      return 42;
    case amp.validator.ValidationError.Code
        .CSS_SYNTAX_EOF_IN_PRELUDE_OF_QUALIFIED_RULE:
      return 43;
    case amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_DECLARATION:
      return 44;
    case amp.validator.ValidationError.Code.CSS_SYNTAX_INCOMPLETE_DECLARATION:
      return 45;
    case amp.validator.ValidationError.Code.CSS_SYNTAX_ERROR_IN_PSEUDO_SELECTOR:
      return 46;
    case amp.validator.ValidationError.Code.CSS_SYNTAX_MISSING_SELECTOR:
      return 47;
    case amp.validator.ValidationError.Code.CSS_SYNTAX_NOT_A_SELECTOR_START:
      return 48;
    case amp.validator.ValidationError.Code
        .CSS_SYNTAX_UNPARSED_INPUT_REMAINS_IN_SELECTOR:
      return 49;
    case amp.validator.ValidationError.Code.CSS_SYNTAX_MISSING_URL:
      return 50;
    case amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_URL:
      return 51;
    case amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_URL_PROTOCOL:
      return 52;
    case amp.validator.ValidationError.Code.CSS_SYNTAX_DISALLOWED_RELATIVE_URL:
      return 53;
    case amp.validator.ValidationError.Code.INCORRECT_NUM_CHILD_TAGS:
      return 54;
    case amp.validator.ValidationError.Code.DISALLOWED_CHILD_TAG_NAME:
      return 55;
    case amp.validator.ValidationError.Code.DISALLOWED_FIRST_CHILD_TAG_NAME:
      return 56;
    case amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_ATTR_SELECTOR:
      return 57;
    case amp.validator.ValidationError.Code.GENERAL_DISALLOWED_TAG:
      return 100;
    case amp.validator.ValidationError.Code.DEPRECATED_ATTR:
      return 101;
    case amp.validator.ValidationError.Code.DEPRECATED_TAG:
      return 102;
    default:
      goog.asserts.fail('Unrecognized Code: ' + code);
  }
}

/**
 * A helper function which allows us to compare two candidate results
 * in validateTag to report the results which have the most specific errors.
 * @param {!amp.validator.ValidationResult} validationResult
 * @return {number} maximum value of specificity found in all errors.
 */
amp.validator.maxSpecificity = function(validationResult) {
  let max = 0;
  for (const error of validationResult.errors) {
    goog.asserts.assert(error.code != null);
    const thisSpecificity = specificity(error.code);
    max = Math.max(thisSpecificity, max);
  }
  return max;
};


/**
 * This wrapper class provides access to the validation rules.
 * @private
 */
class ParsedValidatorRules {
  /** Creates a new instance and initializes it with
   * amp.validator.ValidatorRules. */
  constructor() {
    /**
     * ParsedTagSpecs in id order.
     * @type {!Array<!ParsedTagSpec>}
     * @private
     */
    this.tagSpecById_ = [];
    /**
     * ParsedTagSpecs keyed by name
     * @type {!goog.structs.Map<string, !TagSpecDispatch>}
     * @private
     */
    this.tagSpecByTagName_ = new goog.structs.Map();
    /**
     * Tag ids that are mandatory for a document to legally validate.
     * @type {!Array<number>}
     * @private
     */
    this.mandatoryTagSpecs_ = [];

    /** @type {!amp.validator.ValidatorRules} */
    const rules = amp.validator.RULES;

    /** @type {!goog.structs.Map<string, !amp.validator.AttrList>} */
    const attrListsByName = new goog.structs.Map();
    for (const attrList of rules.attrLists) {
      attrListsByName.set(attrList.name, attrList);
    }

    /** @type {!goog.structs.Map<string, number>} */
    const tagspecIdsByTagSpecName = new goog.structs.Map();
    /** @type {!goog.structs.Set<string>} */
    const tagSpecNamesToTrack = new goog.structs.Set();
    for (let i = 0; i < rules.tags.length; ++i) {
      const tag = rules.tags[i];
      goog.asserts.assert(
          !tagspecIdsByTagSpecName.containsKey(getTagSpecName(tag)));
      tagspecIdsByTagSpecName.set(getTagSpecName(tag), i);
      if (tag.alsoRequiresTag.length > 0) {
        tagSpecNamesToTrack.add(getTagSpecName(tag));
      }
      for (const alsoRequiresTag of tag.alsoRequiresTag) {
        tagSpecNamesToTrack.add(alsoRequiresTag);
      }
    }

    for (let i = 0; i < rules.tags.length; ++i) {
      const tag = rules.tags[i];
      goog.asserts.assert(rules.templateSpecUrl != null);
      const parsedTagSpec = new ParsedTagSpec(
          rules.templateSpecUrl, attrListsByName, tagspecIdsByTagSpecName,
          shouldRecordTagspecValidated(tag, tagSpecNamesToTrack), tag, i);
      this.tagSpecById_.push(parsedTagSpec);
      goog.asserts.assert(tag.tagName !== null);
      if (!this.tagSpecByTagName_.containsKey(tag.tagName)) {
        this.tagSpecByTagName_.set(tag.tagName, new TagSpecDispatch());
      }
      const tagnameDispatch = this.tagSpecByTagName_.get(tag.tagName);
      if (parsedTagSpec.hasDispatchKey()) {
        tagnameDispatch.registerDispatchKey(parsedTagSpec.getDispatchKey(), i);
      } else {
        tagnameDispatch.registerTagSpec(i);
      }
      if (tag.mandatory) this.mandatoryTagSpecs_.push(i);
    }
    if (amp.validator.GENERATE_DETAILED_ERRORS) {
      /** type {!goog.structs.Map<!amp.validator.ValidationError.Code, !string>}
       */
      this.formatByCode_ = new goog.structs.Map();
      for (let i = 0; i < rules.errorFormats.length; ++i) {
        const errorFormat = rules.errorFormats[i];
        goog.asserts.assert(errorFormat !== null);
        this.formatByCode_.set(errorFormat.code, errorFormat.format);
      }
    }
  }

  /**
   * @return {!goog.structs.Map<!amp.validator.ValidationError.Code, !string>}
   */
  getFormatByCode() { return this.formatByCode_; }

  /**
   * Validates the provided |tagName| with respect to the tag
   * specifications that are part of this instance. At least one
   * specification must validate. The ids for mandatory tag specs are
   * emitted via context.recordTagspecValidated().
   * @param {!Context} context
   * @param {string} tagName
   * @param {!Array<string>} encounteredAttrs Alternating key/value pairs.
   * @param {!amp.validator.ValidationResult} validationResult
   */
  validateTag(context, tagName, encounteredAttrs, validationResult) {
    const tagSpecDispatch = this.tagSpecByTagName_.get(tagName);
    if (tagSpecDispatch === undefined) {
      if (amp.validator.GENERATE_DETAILED_ERRORS) {
        context.addError(
            amp.validator.ValidationError.Severity.ERROR,
            amp.validator.ValidationError.Code.DISALLOWED_TAG,
            context.getDocLocator(),
            /* params */[tagName], /* specUrl */ '', validationResult);
      } else {
        validationResult.status = amp.validator.ValidationResult.Status.FAIL;
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
        if (attrName === attrValue) attrValue = '';
        attrName = attrName.toLowerCase();

        const maybeTagSpecId = tagSpecDispatch.matchingDispatchKey(
            attrName, attrValue, context.getTagStack().getParent());
        if (maybeTagSpecId !== -1) {
          const parsedSpec = this.tagSpecById_[maybeTagSpecId];
          goog.asserts.assert(parsedSpec !== undefined, '1');
          this.validateTagAgainstSpec(
              parsedSpec, context, encounteredAttrs, resultForBestAttempt);
          // Use the dispatched TagSpec validation results, success or fail.
          validationResult.mergeFrom(resultForBestAttempt);
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
          context.addError(
              amp.validator.ValidationError.Severity.ERROR,
              amp.validator.ValidationError.Code.GENERAL_DISALLOWED_TAG,
              context.getDocLocator(),
              /* params */[tagName], /* specUrl */ '', validationResult);
        } else {
          validationResult.status = amp.validator.ValidationResult.Status.FAIL;
        }
        return;
      }
    }
    // Validate against all tagspecs.
    for (const tagSpecId of tagSpecDispatch.allTagSpecs()) {
      const parsedSpec = this.tagSpecById_[tagSpecId];
      this.validateTagAgainstSpec(
          parsedSpec, context, encounteredAttrs, resultForBestAttempt);
      if (resultForBestAttempt.status !==
          amp.validator.ValidationResult.Status.FAIL) {
        break;  // Exit early on success
      }
    }
    validationResult.mergeFrom(resultForBestAttempt);
  }

  /**
   * Validates the provided |tagName| with respect to a single tag
   * specification.
   * @param {!ParsedTagSpec} parsedSpec
   * @param {!Context} context
   * @param {!Array<string>} encounteredAttrs Alternating key/value pairs.
   * @param {!amp.validator.ValidationResult} resultForBestAttempt
   */
  validateTagAgainstSpec(
      parsedSpec, context, encounteredAttrs, resultForBestAttempt) {
    let resultForAttempt = new amp.validator.ValidationResult();
    resultForAttempt.status = amp.validator.ValidationResult.Status.UNKNOWN;
    parsedSpec.validateAttributes(context, encounteredAttrs, resultForAttempt);
    parsedSpec.validateParentTag(context, resultForAttempt);
    parsedSpec.validateAncestorTags(context, resultForAttempt);

    if (resultForAttempt.status ===
        amp.validator.ValidationResult.Status.FAIL) {
      if (!amp.validator.GENERATE_DETAILED_ERRORS) {
        resultForBestAttempt.status =
            amp.validator.ValidationResult.Status.FAIL;
        return;
      }
      // If this is the first attempt, always use it.
      if (resultForBestAttempt.errors.length == 0) {
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
      if (amp.validator.maxSpecificity(resultForAttempt) >
          amp.validator.maxSpecificity(resultForBestAttempt)) {
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

    if (parsedSpec.shouldRecordTagspecValidated()) {
      const isUnique = context.recordTagspecValidated(parsedSpec.getId());
      // If a duplicate tag is encountered for a spec that's supposed
      // to be unique, we've found an error that we must report.
      if (spec.unique && !isUnique) {
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
      }
    }

    if (spec.mandatoryAlternatives !== null) {
      const satisfied = spec.mandatoryAlternatives;
      goog.asserts.assert(satisfied !== null);
      context.recordMandatoryAlternativeSatisfied(satisfied);
    }
    // (Re)set the cdata matcher to the expectations that this tag
    // brings with it.
    context.setCdataMatcher(new CdataMatcher(spec));
    context.setChildTagMatcher(new ChildTagMatcher(spec));
  }

  /**
   * Emits errors for tags that are specified to be mandatory.
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} validationResult
   */
  maybeEmitMandatoryTagValidationErrors(context, validationResult) {
    for (const tagspecId of this.mandatoryTagSpecs_) {
      if (!context.getTagspecsValidated().contains(tagspecId)) {
        if (amp.validator.GENERATE_DETAILED_ERRORS) {
          const spec = this.tagSpecById_[tagspecId].getSpec();
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
   * Emits errors for tags that specify that another tag is also required.
   * Returns false iff context.Progress(result).complete.
   * @param {!Context} context
   * @param {!amp.validator.ValidationResult} validationResult
   */
  maybeEmitAlsoRequiresTagValidationErrors(context, validationResult) {
    let tagspecsValidated = context.getTagspecsValidated().getValues();
    goog.array.sort(tagspecsValidated);
    for (const tagspecId of tagspecsValidated) {
      const spec = this.tagSpecById_[tagspecId];
      for (const alsoRequiresTagspecId of spec.getAlsoRequiresTag()) {
        if (!context.getTagspecsValidated().contains(alsoRequiresTagspecId)) {
          if (amp.validator.GENERATE_DETAILED_ERRORS) {
            const alsoRequiresTagspec =
                this.tagSpecById_[alsoRequiresTagspecId];
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
        if (!satisfied.contains(alternative)) {
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
}

const parsedValidatorRulesSingleton = new ParsedValidatorRules();

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
  /** Creates a new handler. */
  constructor() {
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
    this.rules_ = parsedValidatorRulesSingleton;

    /**
     * Set to true when we encounter a start <style> tag, false when we
     * encounter
     * an end <style> tag.
     * @type {boolean}
     * @private
     */
    this.inCssRegion_ = false;
  }

  /**
   * @return {!amp.validator.ValidationResult} Validation Result at the current
   *     step.
   */
  Result() { return this.validationResult_; }

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
    this.context_.setCdataMatcher(
        new CdataMatcher(new amp.validator.TagSpec()));
    this.rules_.maybeEmitGlobalTagValidationErrors(
        this.context_, this.validationResult_);
    if (this.validationResult_.status ===
        amp.validator.ValidationResult.Status.UNKNOWN) {
      this.validationResult_.status =
          amp.validator.ValidationResult.Status.PASS;
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
    this.context_.setCdataMatcher(
        new CdataMatcher(new amp.validator.TagSpec()));
    this.context_.getTagStack().enterTag(
        tagName, this.context_, this.validationResult_, attrs);
    this.rules_.validateTag(
        this.context_, tagName, attrs, this.validationResult_);
    this.context_.getTagStack().matchChildTagName(
        this.context_, this.validationResult_);
    if (tagName === 'style') {
      this.inCssRegion_ = true;
    }
  }

  /**
   * Callback for an end HTML tag.
   * @param {string} tagName ie: 'table'
   * @override
   */
  endTag(tagName) {
    this.context_.setCdataMatcher(
        new CdataMatcher(new amp.validator.TagSpec()));
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
    this.context_.getCdataMatcher().match(
        text, this.context_, this.validationResult_);
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
