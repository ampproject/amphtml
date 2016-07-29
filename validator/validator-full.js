/**
 * @license
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
goog.provide('amp.validator.Terminal');
goog.provide('amp.validator.annotateWithErrorCategories');
goog.provide('amp.validator.renderErrorMessage');
goog.provide('amp.validator.renderValidationResult');
goog.provide('amp.validator.validateString');
goog.require('amp.htmlparser.HtmlParser');
goog.require('amp.validator.ValidationHandler');
goog.require('amp.validator.ValidationResult');
goog.require('goog.asserts');
goog.require('goog.string');
goog.require('goog.uri.utils');

/**
 * Validates a document input as a string.
 * @param {string} inputDocContents
 * @return {!amp.validator.ValidationResult} Validation Result (status and
 *     errors)
 * @export
 */
amp.validator.validateString = function(inputDocContents) {
  goog.asserts.assertString(inputDocContents, 'Input document is not a string');

  const handler = new amp.validator.ValidationHandler();
  const parser = new amp.htmlparser.HtmlParser();
  parser.parse(handler, inputDocContents);

  return handler.Result();
};

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
  constructor(opt_out) { this.out_ = opt_out || null; }

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
    if (this.errors.length === 0)
      return;
  } else if (status !== amp.validator.ValidationResult.Status.FAIL) {
    terminal.error(
        'AMP validation had unknown results. This indicates a validator bug. ' +
        'Please report at https://github.com/ampproject/amphtml/issues .');
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
  goog.asserts.assert(error.code !== null);
  const format = parsedValidatorRulesSingleton.getFormatByCode()[error.code];
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
  const rendered = [];
  rendered.push(validationResult.status);
  for (const error of validationResult.errors) {
    rendered.push(errorLine(filename, error));
  }
  return rendered;
};


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
      error.code ==
          amp.validator.ValidationError.Code
              .MANDATORY_REFERENCE_POINT_MISSING ||
      error.code ==
          amp.validator.ValidationError.Code.DUPLICATE_REFERENCE_POINT) {
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
       error.params[0] === 'style amp-custom')) {
    return amp.validator.ErrorCategory.Code.AUTHOR_STYLESHEET_PROBLEM;
  }
  // E.g. "CSS syntax error in tag 'style amp-custom' - Invalid Declaration."
  // TODO(powdercloud): Legacy generic css error code. Remove after 2016-06-01.
  if (error.code === amp.validator.ValidationError.Code.CSS_SYNTAX &&
      error.params[0] === 'style amp-custom') {
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
               .CSS_SYNTAX_DISALLOWED_RELATIVE_URL) &&
      error.params[0] === 'style amp-custom') {
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
          amp.validator.ValidationError.Code.DEPRECATED_MANUFACTURED_BODY) {
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
  if (error.code === amp.validator.ValidationError.Code.DUPLICATE_UNIQUE_TAG) {
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
  // E.g. "The tag 'amp-ad' may not appear as a descendant of tag 'amp-sidebar'.
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
  for (const error of result.errors) {
    error.category = amp.validator.categorizeError(error);
  }
};
