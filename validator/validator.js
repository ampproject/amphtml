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
goog.require('amp.htmlparser.HtmlParser');
goog.require('amp.htmlparser.HtmlParser.EFlags');
goog.require('amp.htmlparser.HtmlParser.Elements');
goog.require('amp.htmlparser.HtmlParser.Entities');
goog.require('amp.htmlparser.HtmlSaxHandlerWithLocation');
goog.require('amp.validator.AtRuleSpec');
goog.require('amp.validator.AtRuleSpec.BlockType');
goog.require('amp.validator.AttrList');
goog.require('amp.validator.AttrSpec');
goog.require('amp.validator.BlackListedCDataRegex');
goog.require('amp.validator.CdataSpec');
goog.require('amp.validator.CssRuleSpec');
goog.require('amp.validator.CssSpec');
goog.require('amp.validator.PropertySpec');
goog.require('amp.validator.PropertySpecList');
goog.require('amp.validator.RULES');
goog.require('amp.validator.TagSpec');
goog.require('amp.validator.ValidationError');
goog.require('amp.validator.ValidationError.Code');
goog.require('amp.validator.ValidationError.Severity');
goog.require('amp.validator.ValidationResult');
goog.require('amp.validator.ValidationResult.Status');
goog.require('amp.validator.ValidatorInfo');
goog.require('amp.validator.ValidatorRules');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.string');
goog.require('goog.structs.Map');
goog.require('goog.structs.Set');
goog.require('parse_css.BlockType');
goog.require('parse_css.parseAStylesheet');
goog.require('parse_css.tokenize');

goog.provide('amp.validator.Terminal');
goog.provide('amp.validator.renderValidationResult');
goog.provide('amp.validator.validateString');

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
 * A higher number means |code| is more specific, meaning more
 * helpful. Used by maxSpecificity below.
 * @param {!amp.validator.ValidationError.Code} code
 * @return {number}
 */
function specificity(code) {
  switch (code) {
    case amp.validator.ValidationError.Code.UNKNOWN_CODE:
      return 0;
    case amp.validator.ValidationError.Code.
        MANDATORY_CDATA_MISSING_OR_INCORRECT:
      return 1;
    case amp.validator.ValidationError.Code.WRONG_PARENT_TAG:
      return 2;
    case amp.validator.ValidationError.Code.MANDATORY_TAG_MISSING:
      return 3;
    case amp.validator.ValidationError.Code.DISALLOWED_TAG:
      return 4;
    case amp.validator.ValidationError.Code.DISALLOWED_ATTR:
      return 5;
    case amp.validator.ValidationError.Code.INVALID_ATTR_VALUE:
      return 6;
    case amp.validator.ValidationError.Code.MANDATORY_ATTR_MISSING:
      return 7;
    case amp.validator.ValidationError.Code.DUPLICATE_UNIQUE_TAG:
      return 8;
    case amp.validator.ValidationError.Code.STYLESHEET_TOO_LONG:
      return 9;
    case amp.validator.ValidationError.Code.CSS_SYNTAX:
      return 10;
    case amp.validator.ValidationError.Code.
        MANDATORY_PROPERTY_MISSING_FROM_ATTR_VALUE:
      return 11;
    case amp.validator.ValidationError.Code.
        INVALID_PROPERTY_VALUE_IN_ATTR_VALUE:
      return 12;
    case amp.validator.ValidationError.Code.DISALLOWED_PROPERTY_IN_ATTR_VALUE:
      return 13;
    case amp.validator.ValidationError.Code.MUTUALLY_EXCLUSIVE_ATTRS:
      return 14;
    case amp.validator.ValidationError.Code.DEV_MODE_ENABLED:
      return 15;
    case amp.validator.ValidationError.Code.DEPRECATED_ATTR:
      return 16;
    case amp.validator.ValidationError.Code.DEPRECATED_TAG:
      return 17;
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
function maxSpecificity(validationResult) {
  let max = 0;
  for (const error of validationResult.errors) {
    goog.asserts.assert(error.code != null);
    const thisSpecificity = specificity(error.code);
    max = Math.max(thisSpecificity, max);
  }
  return max;
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
  Array.prototype.push.apply(this.errors, other.errors);
};

/**
 * The terminal is an abstraction for the window.console object which
 * accomodates differences between console implementations and provides
 * a convenient way to capture what's being emitted to the terminal
 * in a unittest. Pass the optional parameter to the constructor
 * to observe the calls that would have gone to window.console otherwise.
 * @param {!Array<string>=} opt_out an array into which the terminal will
 *     emit one string per info / warn / error calls.
 * @constructor
 */
amp.validator.Terminal = function(opt_out) {
  this.out_ = opt_out || null;
  return this;
};

/** @param {!string} msg */
amp.validator.Terminal.prototype.info = function(msg) {
  if (this.out_) {
    this.out_.push('I: ' + msg);
  } else {
    (console.info || console.log).call(console, msg);
  }
};

/** @param {!string} msg */
amp.validator.Terminal.prototype.warn = function(msg) {
  if (this.out_) {
    this.out_.push('W: ' + msg);
  } else if (console.warn) {
    console.warn(msg);
  } else {
    console.log('WARNING: ' + msg);
  }
};

/** @param {!string} msg */
amp.validator.Terminal.prototype.error = function(msg) {
  if (this.out_) {
    this.out_.push('E: ' + msg);
  } else if (console.error) {
    console.error(msg);
  } else {
    console.log('ERROR: ' + msg);
  }
};

/**
 * Renders one line of error output.
 * @param {!string} filenameOrUrl
 * @param {!amp.validator.ValidationError} error
 * @return {!string}
 */
function errorLine(filenameOrUrl, error) {
  const line = error.line || 1;
  const col = error.col || 0;
  let errorLine = filenameOrUrl + ':' + line + ':' + col + ' ' +
      error.code + ' ' + error.detail;
  if (error.specUrl) {
    errorLine += ' (see ' + error.specUrl + ')';
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
  const rendered = [];
  rendered.push(validationResult.status);
  for (const error of validationResult.errors) {
    rendered.push(errorLine(filename, error));
  }
  return rendered;
};

/**
 * Emits this validation result to the terminal, distinguishing warnings and
 *   errors.
 * @param {string} url
 * @param {!amp.validator.Terminal=} opt_terminal
 */
amp.validator.ValidationResult.prototype.outputToTerminal =
    function(url, opt_terminal) {

  const terminal = opt_terminal || new amp.validator.Terminal();
  const status = this.status;
  if (status === amp.validator.ValidationResult.Status.PASS) {
    terminal.info('AMP validation successful.');
  } else if (status === amp.validator.ValidationResult.Status.FAIL) {
    terminal.error('AMP validation had errors:');
  } else {
    terminal.error(
        'AMP validation had unknown results. This should not happen.');
  }
  for (const error of this.errors) {
    if (error.severity ===
        amp.validator.ValidationError.Severity.ERROR) {
      terminal.error(errorLine(url, error));
    } else {
      terminal.warn(errorLine(url, error));
    }
  }
};

/**
 * A line / column pair.
 * @param {!number} line
 * @param {!number} col
 * @constructor
 */
const LineCol = function(line, col) {
  this.line_ = line;
  this.col_ = col;
};

/** @return {number} */
LineCol.prototype.getLine = function() {
  return this.line_;
};

/** @return {number} */
LineCol.prototype.getCol = function() {
  return this.col_;
};


/**
 * This abstraction keeps track of the tag names as we enter / exit
 * tags in the document. Closing tags is tricky:
 * - For tags with no end tag per spec, we close them in EnterTag when
 *   another tag is encountered.
 * - In addition, we assume that all end tags are optional and we close,
 *   that is, pop off tags our stack, lazily as we encounter parent closing
 *   tags. This part differs slightly from the behavior per spec: instead of
 *   closing an <option> tag when a following <option> tag is seen, we close
 *   it when the parent closing tag (in practice <select>) is encountered.
 * @constructor
 */
const TagNameStack = function TagNameStack() {
  /**
   * The current tag name and its parents.
   * @type {!Array<string>}
   * @private
   */
  this.stack_ = [];
};

/**
 * Some tags have no end tags as per HTML5 spec. These were extracted
 * from the single page spec by looking for "no end tag" with CTRL+F.
 * @type {Object<string,number>}
 */
TagNameStack.TagsWithNoEndTags = function() {
  // TODO(johannes): Figure out how to prevent the Closure compiler from
  // renaming entries in a map. I wanted to do it the same way that
  // amp.htmlparser.HtmlParser.Elements is done (htmlparser.js), but it kept
  // renaming my keys causing lookup failures. :-(
  const tags = ['base', 'link', 'meta', 'hr', 'br', 'wbr', 'img', 'embed',
              'param', 'source', 'track', 'area', 'col', 'input', 'keygen'];
  const dict = {};
  for (const tag of tags) {
    dict[tag] = 0;
  }
  return dict;
}();

/**
 * We enter a tag, and if the previously entered tag doesn't come with an
 * end tag (per spec), we exit that.
 * @param {!string} tagName
 */
TagNameStack.prototype.enterTag = function(tagName) {
  if (this.stack_.length > 0 &&
      TagNameStack.TagsWithNoEndTags.hasOwnProperty(
          this.stack_[this.stack_.length - 1])) {
    this.stack_.pop();
  }
  this.stack_.push(tagName);
};

/**
 * We exit a tag.
 * @param {!string} tagName
 */
TagNameStack.prototype.exitTag = function(tagName) {
  // We look for ragName from the end. If we can find it, we pop
  // everything from thereon off the stack.
  const idx = this.stack_.lastIndexOf(tagName);
  if (idx !== -1) {
    this.stack_ = this.stack_.slice(0, idx);
  }
};

/**
 * The name of the current tag.
 * @return {!string}
 */
TagNameStack.prototype.getCurrent = function() {
  goog.asserts.assert(this.stack_.length > 0, 'Empty tag stack.');
  return this.stack_[this.stack_.length - 1];
};

/**
 * The name of the parent of the current tag.
 * @return {!string}
 */
TagNameStack.prototype.getParent = function() {
  if (this.stack_.length >= 2)
    return this.stack_[this.stack_.length - 2];
  return '$ROOT';
};


/**
 * This matcher maintains a constraint to check which an opening tag
 * introduces: a tag's cdata matches constraints set by it's cdata
 * spec. Unfortunately we need to defer such checking and can't
 * handle it while the opening tag is being processed.
 * @param {!amp.validator.TagSpec} tagSpec
 * @constructor
 */
const CdataMatcher = function CdataMatcher(tagSpec) {
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
};

/**
 * Generates an AT Rule Parsing Spec from a CssSpec.
 * @param {!amp.validator.CssSpec} cssSpec
 * @return {!Object<string,parse_css.BlockType>}
 */
CdataMatcher.prototype.atRuleParsingSpec = function(cssSpec) {
  /** @type {!Object<string,parse_css.BlockType>} */
  const ampAtRuleParsingSpec = {};
  for (const atRuleSpec of cssSpec.atRuleSpec) {
    goog.asserts.assert(atRuleSpec.name !== null);
    if (atRuleSpec.type === amp.validator.AtRuleSpec.BlockType.PARSE_AS_ERROR ||
        atRuleSpec.type ===
        amp.validator.AtRuleSpec.BlockType.PARSE_AS_IGNORE) {
      ampAtRuleParsingSpec[atRuleSpec.name] =
          parse_css.BlockType.PARSE_AS_IGNORE;
    } else if (atRuleSpec.type ===
        amp.validator.AtRuleSpec.BlockType.PARSE_AS_RULES) {
      ampAtRuleParsingSpec[atRuleSpec.name] =
          parse_css.BlockType.PARSE_AS_RULES;
    } else if (atRuleSpec.type ===
        amp.validator.AtRuleSpec.BlockType.PARSE_AS_DECLARATIONS) {
      ampAtRuleParsingSpec[atRuleSpec.name] =
          parse_css.BlockType.PARSE_AS_DECLARATIONS;
    } else {
      goog.asserts.fail('Unrecognized atRuleSpec type: ' + atRuleSpec.type);
    }
  }
  return ampAtRuleParsingSpec;
};

/**
 * Returns the default AT rule parsing spec.
 * @param {!Object} atRuleParsingSpec
 * @return {parse_css.BlockType}
 */
CdataMatcher.prototype.atRuleDefaultParsingSpec = function(atRuleParsingSpec) {
  const ret = atRuleParsingSpec['$DEFAULT'];
  goog.asserts.assert(ret !== undefined, 'No default atRuleSpec found');
  return ret;
};

/**
 * Returns true if the given AT rule is considered valid.
 * @param {!amp.validator.CssSpec} cssSpec
 * @param {string} atRuleName
 * @return {boolean}
 */
CdataMatcher.prototype.isAtRuleValid = function(cssSpec, atRuleName) {
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
};

/**
 * Matches the provided cdata against what this matcher expects.
 * @param {string} cdata
 * @param {!Context} context
 * @param {!amp.validator.ValidationResult} validationResult
 */
CdataMatcher.prototype.match = function(cdata, context, validationResult) {
  const cdataSpec = this.tagSpec_.cdata;
  if (cdataSpec === null)
    return;
  if (context.getProgress(validationResult).complete)
    return;

  // Max CDATA Byte Length
  if (cdataSpec.maxBytes !== null) {
    const bytes = byteLength(cdata);
    if (bytes > cdataSpec.maxBytes) {
      context.addError(amp.validator.ValidationError.Code.STYLESHEET_TOO_LONG,
                       'seen: ' + bytes + ' bytes, limit: ' +
                       cdataSpec.maxBytes + ' bytes',
                       cdataSpec.maxBytesSpecUrl, validationResult);
      // We return early if the byte length is violated as parsing
      // really long stylesheets is slow and not worth our time.
      return;
    }
  }
  if (context.getProgress(validationResult).complete)
    return;

  // Mandatory CDATA exact match
  // TODO(johannes): This feature is no longer used in validator.protoascii,
  // remove or make a test for it.
  if (cdataSpec.mandatoryCdata !== null) {
    if (cdataSpec.mandatoryCdata !== cdata) {
      context.addError(
          amp.validator.ValidationError.Code.
              MANDATORY_CDATA_MISSING_OR_INCORRECT,
          getDetailOrName(this.tagSpec_),
          this.tagSpec_.specUrl, validationResult);
    }
    // We return early if the cdata has an exact match rule. The
    // spec shouldn't have an exact match rule that doesn't validate.
    return;
  }
  if (cdataSpec.cdataRegex !== null) {
    const cdataRegex = new RegExp(cdataSpec.cdataRegex, 'g');
    if (!cdataRegex.test(cdata)) {
      context.addError(
          amp.validator.ValidationError.Code.
              MANDATORY_CDATA_MISSING_OR_INCORRECT,
          getDetailOrName(this.tagSpec_),
          this.tagSpec_.specUrl, validationResult);
      return;
    }
  }

  if (cdataSpec.cssSpec !== null) {
    /** @type {!Array<!parse_css.ErrorToken>} */
    const cssErrors = [];
    /** @type {!Array<!parse_css.CSSParserToken>} */
    const tokenList = parse_css.tokenize(cdata,
                                       this.getLineCol().getLine(),
                                       this.getLineCol().getCol(),
                                       cssErrors);
    /** @type {!Object} */
    const atRuleParsingSpec = this.atRuleParsingSpec(cdataSpec.cssSpec);
    /** @type {!parse_css.Stylesheet} */
    const sheet = parse_css.parseAStylesheet(
        tokenList, atRuleParsingSpec,
        this.atRuleDefaultParsingSpec(atRuleParsingSpec),
        cssErrors);
    let reportCdataRegexpErrors = (cssErrors.length == 0);
    for (const errorToken of cssErrors) {
      const lineCol = new LineCol(errorToken.line, errorToken.col);
      context.addErrorWithLineCol(
          lineCol, amp.validator.ValidationError.Code.CSS_SYNTAX,
          errorToken.msg, /*url=*/'', validationResult);
    }

    // TODO: This needs improvement to validate all fields recursively. For now,
    // it's just doing one layer of fields to demonstrate the idea and keep
    // tests passing
    for (const cssRule of sheet.rules) {
      if (cssRule.tokenType === 'AT_RULE') {
        if (!this.isAtRuleValid(cdataSpec.cssSpec, cssRule.name)) {
          reportCdataRegexpErrors = false;
          const lineCol = new LineCol(cssRule.line, cssRule.col);
          context.addErrorWithLineCol(
              lineCol, amp.validator.ValidationError.Code.CSS_SYNTAX,
              'Invalid CSS rule of type: @' + cssRule.name,
              /*url=*/'', validationResult);
        }
      }
    }

    // As a hack to not report some errors twice, both via the css parser
    // and via the regular expressions below, we return early if there
    // are parser errors and skip the regular expression errors.
    if (!reportCdataRegexpErrors)
      return;
  }

  // Blacklisted CDATA Regular Expressions
  for (const blacklist of cdataSpec.blacklistedCdataRegex) {
    if (context.getProgress(validationResult).complete) {
      return;
    }
    const blacklistRegex = new RegExp(blacklist.regex, 'gi');
    if (blacklistRegex.test(cdata)) {
      context.addError(
          amp.validator.ValidationError.Code.
              MANDATORY_CDATA_MISSING_OR_INCORRECT,
          blacklist.errorMessage, this.tagSpec_.specUrl, validationResult);
    }
  }
};

/** @param {!LineCol} lineCol */
CdataMatcher.prototype.setLineCol = function(lineCol) {
  this.lineCol_ = lineCol;
};

/** @return {!LineCol} */
CdataMatcher.prototype.getLineCol = function() {
  return this.lineCol_;
};


/**
 * @param {amp.validator.ValidationError.Code} code
 * @return {amp.validator.ValidationError.Severity}
 */
function SeverityFor(code) {
  if (code === amp.validator.ValidationError.Code.DEPRECATED_TAG) {
    return amp.validator.ValidationError.Severity.WARNING;
  } else if (code === amp.validator.ValidationError.Code.DEPRECATED_ATTR) {
    return amp.validator.ValidationError.Severity.WARNING;
  }
  return amp.validator.ValidationError.Severity.ERROR;
}


/**
 * The Context keeps track of the line / column that the validator is
 * in, as well as the mandatory tag specs that have already been validated.
 * So, this constitutes the mutable state for the validator except for
 * the validation result itself.
 * @param {number} maxErrors Maximum number of errors to output. -1 means all.
 * @constructor
 */
const Context = function Context(maxErrors) {
  goog.asserts.assert(isInteger(maxErrors),
      'Unrecognized value for maxErrors.');
  goog.asserts.assert(maxErrors >= -1, 'Unrecognized value for maxErrors.');
  /**
   * Maximum number of errors to return.
   * @type {number}
   * @private
   */
  this.maxErrors_ = maxErrors;
  /**
   * The mandatory tagspec ids that we've validated.
   * @type {!Array<number>}
   * @private
   */
  this.mandatoryTagSpecsValidated_ = [];
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

  this.tagNames_ = new TagNameStack();

  this.cdataMatcher_ = new CdataMatcher(new amp.validator.TagSpec());

  /**
   * @private
   */
  this.uniqueTagspecsValidated_ = new goog.structs.Set();
};

/**
 * Callback before startDoc which gives us a document locator.
 * @param {!amp.htmlparser.DocLocator} locator
 */
Context.prototype.setDocLocator = function(locator) {
  this.docLocator_ = locator;
};

/** @return {amp.htmlparser.DocLocator} */
Context.prototype.getDocLocator = function() {
  return this.docLocator_;
};

/**
 * Returns the TagNameStack instance associated with this context.
 * @return {!TagNameStack}
 */
Context.prototype.getTagNames = function() {
  return this.tagNames_;
};

/**
 * Returns an object with two fields, complete and wantsMoreErrors. When
 * complete is true, we can exit the validator. This happens only at the end of
 * the document or if the validation has FAILED. wantsMoreErrors returns true
 * if we we haven't hit the required number of errors.
 * @param {!amp.validator.ValidationResult} validationResult
 * @return {!Object<string, boolean>} progress tuple
 */
Context.prototype.getProgress = function(validationResult) {
  // If maxErrors is set to -1, it means that we want to keep going no
  // matter what, because there may be more errors.
  if (this.maxErrors_ === -1)
    return { complete: false,
             wantsMoreErrors: true };

  // For maxErrors set to 0, if the status is FAIL then we know that
  // we are done. Otherwise, we are forced to keep going. This is
  // because in practice, the validator uses PASS as a default value.
  if (this.maxErrors_ === 0)
    return { complete: validationResult.status ===
                       amp.validator.ValidationResult.Status.FAIL,
             wantsMoreErrors: false };

  // For maxErrors > 0, we want to keep going if we haven't seen maxErrors
  // errors yet.
  const wantsMoreErrors = validationResult.errors.length < this.maxErrors_;
  return { complete: !wantsMoreErrors,
           wantsMoreErrors: wantsMoreErrors };
};

/**
 * Returns true if the result was changed; false otherwise.
 * @param {LineCol|amp.htmlparser.DocLocator} lineCol a line / column pair.
 * @param {!amp.validator.ValidationError.Code} validationErrorCode Error code
 * @param {string} validationErrorDetail Error detail
 * @param {string} specUrl a link (URL) to the amphtml spec
 * @param {!amp.validator.ValidationResult} validationResult
 * @return {boolean}
 */
Context.prototype.addErrorWithLineCol = function(
    lineCol, validationErrorCode, validationErrorDetail, specUrl,
    validationResult) {
  const progress = this.getProgress(validationResult);
  if (progress.complete) {
    goog.asserts.assert(
        validationResult.status === amp.validator.ValidationResult.Status.FAIL,
        'Early PASS exit without full verification.');
    return false;
  }
  const severity = SeverityFor(validationErrorCode);

  // If any of the errors amount to more than a WARNING, validation fails.
  if (severity !== amp.validator.ValidationError.Severity.WARNING) {
    validationResult.status = amp.validator.ValidationResult.Status.FAIL;
  }
  if (progress.wantsMoreErrors) {
    const error = new amp.validator.ValidationError();
    error.severity = severity;
    error.code = validationErrorCode;
    error.detail = validationErrorDetail;
    error.line = lineCol.getLine();
    error.col = lineCol.getCol();
    error.specUrl = specUrl;
    validationResult.errors.push(error);
  }
  return true;
};

/**
 * Returns true if the result was changed; false otherwise.
 * @param {!amp.validator.ValidationError.Code} validationErrorCode Error code
 * @param {?string} validationErrorDetail Error detail
 * @param {?string} specUrl a link (URL) to the amphtml spec
 * @param {!amp.validator.ValidationResult} validationResult
 * @return {boolean}
 */
Context.prototype.addError = function(
    validationErrorCode, validationErrorDetail, specUrl, validationResult) {
  if (validationErrorDetail === null) {
    validationErrorDetail = '';
  }
  if (specUrl === null) {
    specUrl = '';
  }
  return this.addErrorWithLineCol(
      this.docLocator_, validationErrorCode, validationErrorDetail, specUrl,
      validationResult);
};

/**
 * recordValidatedMandatoryTagSpec and mandatoryTagSpecsValidated
 * are used *only* by |ParsedValidatorRules|, which by itself does
 * not have any mutable state.
 * @param {number} tagSpecId id of recorded tagSpec
 */
Context.prototype.recordValidatedMandatoryTagSpec = function(tagSpecId) {
  this.mandatoryTagSpecsValidated_.push(tagSpecId);
};

/**
 * For use by |ParsedValidatorRules|, which doesn't have any mutable state.
 * @param {string} alternative id of the validated alternative.
 */
Context.prototype.recordMandatoryAlternativeSatisfied = function(alternative) {
  this.mandatoryAlternativesSatisfied_.add(alternative);
};

/**
 * The mandatory alternatives that we've satisfied.
 * @return {!goog.structs.Set<string>}
 */
Context.prototype.getMandatoryAlternativesSatisfied = function() {
  return this.mandatoryAlternativesSatisfied_;
};

/**
 * Records a unique tag spec that's been validated.
 * @param {number} tagSpecId id of tagSpec to record.
 * @return {boolean} whether or not the tag spec had been encountered before.
 */
Context.prototype.recordUniqueTagspecValidated = function(tagSpecId) {
  const duplicate = this.uniqueTagspecsValidated_.contains(tagSpecId);
  if (!duplicate) {
    this.uniqueTagspecsValidated_.add(tagSpecId);
  }
  return !duplicate;
};

/**
 * Returns all validated mandatory tagSpec ids.
 * @return {!Array<number>} all validated mandatory tagSpec ids.
 */
Context.prototype.mandatoryTagSpecsValidated = function() {
  this.mandatoryTagSpecsValidated_ = sortAndUniquify(
      this.mandatoryTagSpecsValidated_);
  return this.mandatoryTagSpecsValidated_;
};

/** @return {CdataMatcher} */
Context.prototype.getCdataMatcher = function() {
  return this.cdataMatcher_;
};

/** @param {CdataMatcher} matcher */
Context.prototype.setCdataMatcher = function(matcher) {
  // We store away the position from when the matcher was created
  // so we can use it to generate error messages relating to the opening tag.
  matcher.setLineCol(
      new LineCol(this.docLocator_.getLine(), this.docLocator_.getCol()));
  this.cdataMatcher_ = matcher;
};


/**
 * This wrapper class provides access to an AttrSpec and
 * an attribute id which is unique within its context
 * (e.g., it's unique within the ParsedTagSpec).
 * @param {!Object} attrSpec
 * @param {number} attrId
 * @constructor
 */
const ParsedAttrSpec = function ParsedAttrSpec(attrSpec, attrId) {
  /**
   * JSON Attribute Spec dictionary.
   * @type {!Object}
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
   * @type {!goog.structs.Map<string, !Object>}
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
};

/**
 * @return {number} unique for this attr spec.
 */
ParsedAttrSpec.prototype.getId = function() {
  return this.id_;
};

/**
 * @return {!Object} AttrSpec from rules json library.
 */
ParsedAttrSpec.prototype.getSpec = function() {
  return this.spec_;
};

/**
 * @param {!Context} context
 * @param {!string} attrName
 * @param {!string} attrValue
 * @param {!string} specUrl
 * @param {!amp.validator.ValidationResult} result
 */
ParsedAttrSpec.prototype.validateAttrValueProperties = function(
    context, attrName, attrValue, specUrl, result) {
  // TODO(johannes): Replace this hack with a parser.
  const segments = attrValue.split(',');
  const properties = new goog.structs.Map();
  for (const segment of segments) {
    const key_value = segment.split('=');
    if (key_value.length < 2) {
      continue;
    }
    properties.set(key_value[0].trim().toLowerCase(), key_value[1]);
  }
  // TODO(johannes): End hack.
  const names = properties.getKeys();
  goog.array.sort(names);
  for (const name of names) {
    const value = properties.get(name);
    if (!this.valuePropertyByName_.containsKey(name)) {
      context.addError(
          amp.validator.ValidationError.Code.DISALLOWED_PROPERTY_IN_ATTR_VALUE,
          attrName + '="...' + name + '=..."', specUrl, result);
      continue;
    }
    const propertySpec = this.valuePropertyByName_.get(name);
    if (propertySpec.value !== null) {
      if (propertySpec.value != value.toLowerCase()) {
        context.addError(
            amp.validator.ValidationError.Code.
                INVALID_PROPERTY_VALUE_IN_ATTR_VALUE,
            attrName + '="...' + name + '=' + value + '..."', specUrl, result);
      }
    } else if (propertySpec.valueDouble !== null) {
      if (parseFloat(value) != propertySpec.valueDouble) {
        context.addError(
            amp.validator.ValidationError.Code.
                INVALID_PROPERTY_VALUE_IN_ATTR_VALUE,
            attrName + '="...' + name + '=' + value + '..."', specUrl, result);
      }
    }
  }
  const notSeen = subtractDiff(this.mandatoryValuePropertyNames_, names);
  for (const name of notSeen) {
    context.addError(
        amp.validator.ValidationError.Code.
            MANDATORY_PROPERTY_MISSING_FROM_ATTR_VALUE,
        attrName + '="...' + name + '=' + '..."', specUrl, result);
  }
};


/**
 * Collect the AttrSpec pointers for a given |tagSpec|.
 * There are three ways to specify attributes:
 * (1) within a TagSpec::attrs;
 * (2) via TagSpec::attrLists which references lists by key.
 * (3) within the GLOBAL_ATTRIBUTES attrs.
 * It's possible to provide multiple specifications for the same attribute
 * name, but for any given tag only one such specification can be active. The
 * precedence is (1), (2), (3).
 * @param {!Object} tagSpec
 * @param {!goog.structs.Map<string, !amp.validator.AttrList>} rulesAttrMap
 * @return {!Array<!Object>} all of the AttrSpec pointers
 */
function GetAttrsFor(tagSpec, rulesAttrMap) {
  const attrs = [];
  const namesSeen = new goog.structs.Set();
  // (1) attributes specified within |tagSpec|.
  for (const spec of tagSpec.attrs) {
    if (!namesSeen.contains(spec.name)) {
      namesSeen.add(spec.name);
      attrs.push(spec);
    }
  }
  // (2) attributes specified via reference to an attr_list.
  for (const tagSpec_key of tagSpec.attrLists) {
    const specs = rulesAttrMap.get(tagSpec_key);
    goog.asserts.assert(specs !== undefined);
    for (const spec of specs.attrs) {
       if (!namesSeen.contains(spec.name)) {
         namesSeen.add(spec.name);
         attrs.push(spec);
       }
    }
  }
  // (3) attributes specified in the global_attr list.
  const specs = rulesAttrMap.get('$GLOBAL_ATTRIBUTES');
  goog.asserts.assert(specs !== undefined);
  for (const spec of specs.attrs) {
    if (!namesSeen.contains(spec.name)) {
      namesSeen.add(spec.name);
      attrs.push(spec);
    }
  }
  return attrs;
}


/**
 * A helper function which gets the 'detail' field for an error message,
 * falling back to the tag name if it's not available.
 * @param {?} tagSpec TagSpec instance from the validator.protoscii file.
 * @return {string}
 * @private
 */
function getDetailOrName(tagSpec) {
  return (tagSpec.detail !== null) ? tagSpec.detail : tagSpec.name;
}


/**
 * This wrapper class provides access to a TagSpec and a tag id
 * which is unique within its context, the ParsedValidatorRules.
 * @param {!amp.validator.TagSpec} tagSpec
 * @param {number} tagId
 * @param {!goog.structs.Map<string, !amp.validator.AttrList>} attrListsByName
 * @constructor
 */
const ParsedTagSpec = function ParsedTagSpec(tagSpec, tagId, attrListsByName) {
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

  const attrs = GetAttrsFor(tagSpec, attrListsByName);
  for (let i = 0; i < attrs.length; ++i) {
    const parsedAttrSpec = new ParsedAttrSpec(attrs[i], i);
    this.attrsById_.push(parsedAttrSpec);
    this.attrsByName_[parsedAttrSpec.getSpec().name] = parsedAttrSpec;
    if (parsedAttrSpec.getSpec().mandatory) {
      this.mandatoryAttrIds_.push(i);
    }
    if (parsedAttrSpec.getSpec().mandatoryOneof) {
      this.mandatoryOneofs_.push(parsedAttrSpec.getSpec().mandatoryOneof);
    }
    const altNames = parsedAttrSpec.getSpec().alternativeNames;
    for (const altName of altNames) {
      this.attrsByName_[altName] = parsedAttrSpec;
    }
  }
  this.mandatoryOneofs_ = sortAndUniquify(this.mandatoryOneofs_);
  // The Javascript validator allows a relative location of the ampengine
  // script, in addition to the official allowances. This would be dangerous
  // in production so the rule is not in the official validator file
  // (validator.protoascii) but we hack it into here.
  if (tagSpec.detail == 'amphtml engine v1.js script') {
    const parsedAttrSpec = this.attrsByName_['src'];
    parsedAttrSpec.spec_.valueRegex += '|\\.\\./dist/amp\\.js';
  }
};

/**
 * @return {number} unique id for this tag spec.
 */
ParsedTagSpec.prototype.getId = function() {
  return this.id_;
};

/**
 * Return the original tag spec. This is the json object representation from
 * amp.validator.rules.
 * @return {!Object}
 */
ParsedTagSpec.prototype.getSpec = function() {
  return this.spec_;
};

/**
 * Validates whether the attributes set on |encountered_tag| conform to this
 * tag specification. All mandatory attributes must appear. Only attributes
 * explicitly mentioned by this tag spec may appear.
 *  Returns true iff the validation is successful.
 * @param {!Context} context
 * @param {!Array<string>} encounteredAttrs Alternating key/value pain the array
 * @param {!amp.validator.ValidationResult} resultForAttempt
 */
ParsedTagSpec.prototype.validateAttributes = function(
    context, encounteredAttrs, resultForAttempt) {
  let mandatoryAttrsSeen = [];
  /** @type {!goog.structs.Set<string>} */
  const mandatoryOneofsSeen = new goog.structs.Set();
  // Our html parser delivers attributes as an array of alternating keys and
  // values. We skip over this array 2 at a time to iterate over the keys.
  for (let i = 0; i < encounteredAttrs.length; i += 2) {
    const encounteredAttrKey = encounteredAttrs[i];
    let encounteredAttrValue = encounteredAttrs[i + 1];
    // Our html parser repeats the key as the value if there is no value. We
    // replace the value with an empty string instead in this case.
    if (encounteredAttrKey === encounteredAttrValue)
      encounteredAttrValue = '';

    const encounteredAttrName = encounteredAttrKey.toLowerCase();
    const parsedSpec = this.attrsByName_[encounteredAttrName];
    if (parsedSpec === undefined) {
      // For now, we just skip data- attributes in the validator, because
      // our schema doesn't capture which ones would be ok or not. E.g.
      // in practice, some type of ad or perhaps other custom elements require
      // particular data attributes.
      // http://www.w3.org/TR/html5/single-page.html#attr-data-*
      if (goog.string.startsWith(encounteredAttrKey, 'data-'))
        continue;

      context.addError(amp.validator.ValidationError.Code.DISALLOWED_ATTR,
                       encounteredAttrName, this.spec_.specUrl,
                       resultForAttempt);
      return;
    }
    if (parsedSpec.getSpec().deprecation !== null) {
      context.addError(amp.validator.ValidationError.Code.DEPRECATED_ATTR,
                       encounteredAttrName + ' - ' +
                           parsedSpec.getSpec().deprecation,
                       parsedSpec.getSpec().deprecationUrl,
                       resultForAttempt);
      // Deprecation is only a warning, so we don't return.
    }
    if (parsedSpec.getSpec().devModeEnabled !== null) {
      context.addError(amp.validator.ValidationError.Code.DEV_MODE_ENABLED,
                       encounteredAttrName + ' - ' +
                           parsedSpec.getSpec().devModeEnabled,
                       parsedSpec.getSpec().devModeEnabledUrl,
                       resultForAttempt);
      // Enabling the developer attribute is now always an error, so we
      // return.
      return;
    }
    // The value, value_regex, and value_properties fields are
    // treated like a oneof, but we're not using oneof because it's
    // a feature that was added after protobuf 2.5.0 (which our
    // open-source version uses).
    // begin oneof {
    if (parsedSpec.getSpec().value !== null) {
      if (encounteredAttrValue != parsedSpec.getSpec().value) {
        context.addError(amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
                         encounteredAttrName + '=' + encounteredAttrValue,
                         this.spec_.specUrl, resultForAttempt);
        return;
      }
    }
    if (parsedSpec.getSpec().valueRegex !== null) {
      const valueRegex = new RegExp(parsedSpec.getSpec().valueRegex, 'g');
      if (!valueRegex.test(encounteredAttrValue)) {
        context.addError(amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
                         encounteredAttrName + '=' + encounteredAttrValue,
                         this.spec_.specUrl, resultForAttempt);
        return;
      }
    }
    if (parsedSpec.getSpec().valueProperties !== null) {
      parsedSpec.validateAttrValueProperties(
          context, encounteredAttrName, encounteredAttrValue,
          this.spec_.specUrl, resultForAttempt);
      if (resultForAttempt.status ===
          amp.validator.ValidationResult.Status.FAIL) {
        return;
      }
    }
    // } end oneof
    if (parsedSpec.getSpec().blacklistedValueRegex !== null) {
      const blacklistedValueRegex =
          new RegExp(parsedSpec.getSpec().blacklistedValueRegex, 'gi');
      if (blacklistedValueRegex.test(encounteredAttrValue)) {
        context.addError(amp.validator.ValidationError.Code.INVALID_ATTR_VALUE,
                         encounteredAttrName + '=' + encounteredAttrValue,
                         this.spec_.specUrl, resultForAttempt);
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
      context.addError(
          amp.validator.ValidationError.Code.MUTUALLY_EXCLUSIVE_ATTRS,
          parsedSpec.getSpec().mandatoryOneof, this.spec_.specUrl,
          resultForAttempt);
      return;
    }
    mandatoryOneofsSeen.add(parsedSpec.getSpec().mandatoryOneof);
  }
  // The "at least 1" part of mandatory_oneof: If none of the
  // alternatives were present, we report that an attribute is missing.
  for (const mandatoryOneof of this.mandatoryOneofs_) {
    if (!mandatoryOneofsSeen.contains(mandatoryOneof)) {
      context.addError(
          amp.validator.ValidationError.Code.MANDATORY_ATTR_MISSING,
          mandatoryOneof, this.spec_.specUrl, resultForAttempt);
    }
  }

  mandatoryAttrsSeen = sortAndUniquify(mandatoryAttrsSeen);
  const diffs = subtractDiff(this.mandatoryAttrIds_, mandatoryAttrsSeen);
  for (const diff of diffs) {
    context.addError(amp.validator.ValidationError.Code.MANDATORY_ATTR_MISSING,
                     this.attrsById_[diff].getSpec().name,
                     this.spec_.specUrl, resultForAttempt);
  }
};

/**
 * Validates whether the parent tag satisfied the spec (e.g., some
 * tags can only appear in head).
 * @param {!Context} context
 * @param {!amp.validator.ValidationResult} validationResult
 */
ParsedTagSpec.prototype.validateParentTag = function(
    context, validationResult) {
  if (this.spec_.mandatoryParent !== null &&
    this.spec_.mandatoryParent !== context.getTagNames().getParent()) {

    // Output a parent/child error using CSS Child Selector syntax which is
    // both succinct and should be well understood by web developers.
    context.addError(
        amp.validator.ValidationError.Code.WRONG_PARENT_TAG,
        context.getTagNames().getParent() + ' > ' + this.spec_.name,
        this.spec_.specUrl, validationResult);
  }
};


/**
 * This wrapper class provides access to the validation rules.
 * @constructor
 */
const ParsedValidatorRules = function ParsedValidatorRules() {
  /**
   * ParsedTagSpecs in id order.
   * @type {!Array<!ParsedTagSpec>}
   * @private
   */
  this.tagSpecById_ = [];
  /**
   * ParsedTagSpecs keyed by name
   * @type {!goog.structs.Map<string, !Array<!ParsedTagSpec>>}
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

  for (let i = 0; i < rules.tags.length; ++i) {
    const spec = rules.tags[i];
    const parsedTagSpec = new ParsedTagSpec(spec, i, attrListsByName);
    this.tagSpecById_.push(parsedTagSpec);
    goog.asserts.assert(spec.name !== null);
    if (!this.tagSpecByTagName_.containsKey(spec.name)) {
      this.tagSpecByTagName_.set(spec.name, []);
    }
    this.tagSpecByTagName_.get(spec.name).push(parsedTagSpec);
    if (spec.mandatory)
      this.mandatoryTagSpecs_.push(i);
  }
};

/**
 * Validates the provided |tagName| with respect to the tag specications
 * that are part of this instance. At least one specification must validate.
 * The ids for mandatory tag specs are emitted into |mandatory_tags_validated|.
 * @param {!Context} context
 * @param {string} tagName
 * @param {!Array<string>} encounteredAttrs Alternating key/value pain the array
 * @param {!amp.validator.ValidationResult} validationResult
 */
ParsedValidatorRules.prototype.validateTag = function(
    context, tagName, encounteredAttrs, validationResult) {
  const allTagSpecs = this.tagSpecByTagName_.get(tagName);
  if (allTagSpecs === undefined) {
    context.addError(amp.validator.ValidationError.Code.DISALLOWED_TAG,
                     tagName, /*specUrl=*/ '', validationResult);
    return;
  }
  let resultForBestAttempt = new amp.validator.ValidationResult();
  resultForBestAttempt.status = amp.validator.ValidationResult.Status.UNKNOWN;
  let resultForAttempt = new amp.validator.ValidationResult();
  resultForAttempt.status = amp.validator.ValidationResult.Status.UNKNOWN;
  for (const parsedSpec of allTagSpecs) {
    resultForAttempt = new amp.validator.ValidationResult();
    resultForAttempt.status = amp.validator.ValidationResult.Status.UNKNOWN;

    parsedSpec.validateAttributes(
        context, encounteredAttrs, resultForAttempt);
    parsedSpec.validateParentTag(context, resultForAttempt);
    if (resultForAttempt.status !==
        amp.validator.ValidationResult.Status.FAIL &&
        parsedSpec.getSpec().unique) {
      // If a duplicate tag is encountered for a spec that's supposed
      // to be unique, we've found an error that we must report.
      if (!context.recordUniqueTagspecValidated(parsedSpec.getId())) {
        const spec = parsedSpec.getSpec();
        context.addError(
            amp.validator.ValidationError.Code.DUPLICATE_UNIQUE_TAG,
            getDetailOrName(spec), spec.specUrl, validationResult);
        return;
      }
    }

    if (resultForAttempt.status !==
        amp.validator.ValidationResult.Status.FAIL) {
      // This is the successful branch of the code: thus far everything
      // went fine.

      // However we still want to merge the "errors" because warnings should
      // be reported as well (e.g., the deprecation warnings).
      validationResult.mergeFrom(resultForAttempt);

      if (parsedSpec.getSpec().mandatory)
        context.recordValidatedMandatoryTagSpec(parsedSpec.getId());
      if (parsedSpec.getSpec().mandatoryAlternatives !== null)
        context.recordMandatoryAlternativeSatisfied(
            parsedSpec.getSpec().mandatoryAlternatives);
      // (Re)set the cdata matcher to the expectations that this tag
      // brings with it.
      context.setCdataMatcher(new CdataMatcher(parsedSpec.getSpec()));
      return;
    }
    if (maxSpecificity(resultForAttempt) >
        maxSpecificity(resultForBestAttempt))
      resultForBestAttempt = resultForAttempt;
  }
  validationResult.mergeFrom(resultForBestAttempt);
};

/**
 * Emits any validation errors due to missing mandatory tags.
 * @param {!Context} context
 * @param {!amp.validator.ValidationResult} validationResult
 */
ParsedValidatorRules.prototype.maybeEmitMandatoryTagValidationErrors = function(
    context, validationResult) {
  if (context.getProgress(validationResult).complete)
    return;
  const mandatoryTagSpecsValidated = context.mandatoryTagSpecsValidated();
  if (!goog.array.equals(mandatoryTagSpecsValidated, this.mandatoryTagSpecs_)) {
    const diffs = subtractDiff(this.mandatoryTagSpecs_, mandatoryTagSpecsValidated);
    for (const diff of diffs) {
      const spec = this.tagSpecById_[diff].getSpec();
      context.addError(amp.validator.ValidationError.Code.MANDATORY_TAG_MISSING,
                       getDetailOrName(spec), spec.specUrl, validationResult);
    }
  }
  const satisfied = context.getMandatoryAlternativesSatisfied();
  /** @type {!Array<string>} */
  let missing = [];
  const specUrlsByMissing = {};
  for (const tagSpec of this.tagSpecById_) {
    const spec = tagSpec.getSpec();
    if (spec.mandatoryAlternatives !== null) {
      const alternative = spec.mandatoryAlternatives;
      if (!satisfied.contains(alternative)) {
        missing.push(alternative);
        specUrlsByMissing[missing] = spec.specUrl;
      }
    }
  }
  for (const tagMissing of sortAndUniquify(missing)) {
    context.addError(amp.validator.ValidationError.Code.MANDATORY_TAG_MISSING,
                     tagMissing, /*specUrl=*/ specUrlsByMissing[tagMissing],
                     validationResult);
  }
};

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
 * @implements {amp.htmlparser.HtmlSaxHandlerWithLocation}
 * @constructor
 */
const ValidationHandler = function ValidationHandler() {
  this.validationResult_ = new amp.validator.ValidationResult();
  this.validationResult_.status = amp.validator.ValidationResult.Status.UNKNOWN;
  // TODO(greggrothaus): plumb maxErrors all the way back to our API so the
  // test can exercise the different options or get rid of maxErrors
  // altogether.
  /**
   * Validation Context.
   * @type {!Context}
   * @private
   */
  this.context_ = new Context(/*maxErrors=*/-1);
  /**
   * Rules from parsed JSON configuration.
   * @type {!ParsedValidatorRules}
   * @private
   */
  this.rules_ = new ParsedValidatorRules();

  /**
   * Set to true when we encounter a start <style> tag, false when we encounter
   * an end <style> tag.
   * @type {boolean}
   * @private
   */
  this.inCssRegion_ = false;
};

/**
 * @return {!amp.validator.ValidationResult} Validation Result at the current
 *     step.
 */
ValidationHandler.prototype.Result = function() {
  return this.validationResult_;
};

/**
 * Callback before startDoc which gives us a document locator.
 * @param {amp.htmlparser.DocLocator} locator
 */
ValidationHandler.prototype.setDocLocator = function(locator) {
  if (locator == null) {
    goog.asserts.fail('Null DocLocator set');
  } else {
    this.context_.setDocLocator(locator);
  }
};

/**
 * Callback for the start of a new HTML document.
 */
ValidationHandler.prototype.startDoc = function() {
  this.validationResult_ = new amp.validator.ValidationResult();
  this.validationResult_.status = amp.validator.ValidationResult.Status.UNKNOWN;
};

/**
 * Callback for the end of a new HTML document. Triggers validation of mandatory
 * tag presence.
 */
ValidationHandler.prototype.endDoc = function() {
  if (this.context_.getProgress(this.validationResult_).complete)
    return;
  this.context_.setCdataMatcher(new CdataMatcher(new amp.validator.TagSpec()));
  this.rules_.maybeEmitMandatoryTagValidationErrors(
      this.context_, this.validationResult_);
  if (this.validationResult_.status ===
      amp.validator.ValidationResult.Status.UNKNOWN)
    this.validationResult_.status =
        amp.validator.ValidationResult.Status.PASS;
};

/**
 * Callback for a start HTML tag.
 * @param {string} tagName ie: 'table' (already lower-cased by htmlparser.js).
 * @param {Array<string>} attrs Alternating key/value pain the array
 */
ValidationHandler.prototype.startTag = function(tagName, attrs) {
  goog.asserts.assert(attrs !== null, 'Null attributes for tag: ' + tagName);
  this.context_.setCdataMatcher(new CdataMatcher(new amp.validator.TagSpec()));
  if (this.context_.getProgress(this.validationResult_).complete)
    return;
  this.context_.getTagNames().enterTag(tagName);
  this.rules_.validateTag(this.context_, tagName, attrs,
                          this.validationResult_);
  if (tagName === 'style')
    this.inCssRegion_ = true;
};

/**
 * Callback for an end HTML tag.
 * @param {string} tagName ie: 'table'
 */
ValidationHandler.prototype.endTag = function(tagName) {
  this.context_.setCdataMatcher(new CdataMatcher(new amp.validator.TagSpec()));
  this.context_.getTagNames().exitTag(tagName);
};

/**
 * Callback for pcdata. I'm not sure what this is supposed to include, but it
 * seems to be called for contents of <p> tags, looking at a few examples.
 * @param {string} text
 */
ValidationHandler.prototype.pcdata = function(text) {
};

/**
 * Callback for rcdata text. rcdata text includes contents of title or textarea
 * tags. The validator has no specific rules regarding these text blobs.
 * @param {string} text
 */
ValidationHandler.prototype.rcdata = function(text) {
};

/**
 * Callback for cdata.
 * @param {string} text
 */
ValidationHandler.prototype.cdata = function(text) {
  this.context_.getCdataMatcher().match(
      text, this.context_, this.validationResult_);
};

/**
 * Validates an document input as a string.
 * @param {string} inputDocContents
 * @return {!amp.validator.ValidationResult} Validation Result (status and
 *     errors)
 * @export
 */
amp.validator.validateString = function(inputDocContents) {
  goog.asserts.assertString(inputDocContents,
      'Input document is not a string');

  const handler = new ValidationHandler();
  const parser = new amp.htmlparser.HtmlParser();
  parser.parse(handler, inputDocContents);

  // TODO: This returns SUCCESS even if there are errors. Should be fixed.
  return handler.Result();
};
