/**
 * @license DEDUPE_ON_MINIFY
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

goog.provide('parse_css.validateAmp4AdsCss');

goog.require('amp.validator.ValidationError');
goog.require('parse_css.ErrorToken');
goog.require('parse_css.RuleVisitor');
goog.require('parse_css.Stylesheet');
goog.require('parse_css.TRIVIAL_ERROR_TOKEN');
goog.require('parse_css.TokenType');
goog.require('parse_css.stripVendorPrefix');

/**
 * Fills an ErrorToken with the provided position, code, and params.
 * @param {!parse_css.Token} positionToken
 * @param {!amp.validator.ValidationError.Code} code
 * @param {!Array<string>} params
 * @return {!parse_css.ErrorToken}
 */
function createParseErrorTokenAt(positionToken, code, params) {
  const token = new parse_css.ErrorToken(code, params);
  positionToken.copyPosTo(token);
  return token;
}

/**
 * For a list of |tokens|, if the first non-whitespace token is an identifier,
 * returns its string value. Otherwise, returns the empty string.
 * @param {!Array<parse_css.Token>} tokens
 * @return {string}
 */
function firstIdent(tokens) {
  if (tokens.length === 0) {
    return '';
  }
  if (tokens[0].tokenType === parse_css.TokenType.IDENT) {
    return /** @type {!parse_css.StringValuedToken} */ (tokens[0]).value;
  }
  if (tokens.length >= 2 &&
      (tokens[0].tokenType === parse_css.TokenType.WHITESPACE) &&
      tokens[1].tokenType === parse_css.TokenType.IDENT) {
    return /** @type {!parse_css.StringValuedToken} */ (tokens[1]).value;
  }
  return '';
}

/** @private */
class Amp4AdsVisitor extends parse_css.RuleVisitor {
  /**
   * @param {!Array<parse_css.ErrorToken>} errors
   */
  constructor(errors) {
    super();

    /** @type {!Array<parse_css.ErrorToken>} */
    this.errors = errors;

    /** @type {parse_css.AtRule} */
    this.inKeyframes = null;
  }

  /** @inheritDoc */
  visitDeclaration(declaration) {
    // position:fixed and position:sticky are disallowed.
    if (declaration.name !== 'position') {
      return;
    }
    const ident = firstIdent(declaration.value);
    if (ident === 'fixed' || ident === 'sticky') {
      this.errors.push(createParseErrorTokenAt(
          declaration, amp.validator.ValidationError.Code
              .CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE,
          ['style', 'position', ident]));
    }
  }

  /** @inheritDoc */
  visitQualifiedRule(qualifiedRule) {
    for (const decl of qualifiedRule.declarations) {
      const name = parse_css.stripVendorPrefix(decl.name);
      // The name of the property may identify a transition. The only
      // properties that may be transitioned are opacity and transform.
      if (name === 'transition') {
        const transitionedProperty = firstIdent(decl.value);
        const transitionedPropertyStripped =
            parse_css.stripVendorPrefix(transitionedProperty);
        if (transitionedPropertyStripped !== 'opacity' &&
            transitionedPropertyStripped !== 'transform') {
          this.errors.push(createParseErrorTokenAt(
              decl, amp.validator.ValidationError.Code
                  .CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE_WITH_HINT,
              [
                'style', 'transition', transitionedProperty,
                '[\'opacity\', \'transform\']',
              ]));
        }
      }
      // This is the @keyframes variant for identifying transitions;
      // the only properties that may be specified within a transition
      // are opacity, transform, and animation-timing-function.
      if (this.inKeyframes !== null && name !== 'transform' &&
          name !== 'opacity' && name !== 'animation-timing-function') {
        this.errors.push(createParseErrorTokenAt(
            decl, amp.validator.ValidationError.Code
                .CSS_SYNTAX_PROPERTY_DISALLOWED_WITHIN_AT_RULE,
            [
              'style', decl.name, this.inKeyframes.name,
              '[\'animation-timing-function\', \'opacity\', \'transform\']',
            ]));
      }
    }
  }

  /** @inheritDoc */
  visitAtRule(atRule) {
    if (parse_css.stripVendorPrefix(atRule.name) === 'keyframes') {
      this.inKeyframes = atRule;
    } else {
      this.inKeyframes = null;
    }
  }

  /** @inheritDoc */
  leaveAtRule(atRule) { this.inKeyframes = null; }
}

/**
 * @param {!parse_css.Stylesheet} styleSheet
 * @param {!Array<!parse_css.ErrorToken>} errors
 */
parse_css.validateAmp4AdsCss = function(styleSheet, errors) {
  const visitor = new Amp4AdsVisitor(errors);
  styleSheet.accept(visitor);
};
