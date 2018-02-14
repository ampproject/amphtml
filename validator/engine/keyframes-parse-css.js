/**
 * @license DEDUPE_ON_MINIFY
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

goog.provide('parse_css.validateKeyframesCss');

goog.require('amp.validator.LIGHT');
goog.require('amp.validator.ValidationError');
goog.require('parse_css.ErrorToken');
goog.require('parse_css.RuleVisitor');
goog.require('parse_css.Stylesheet');
goog.require('parse_css.TRIVIAL_ERROR_TOKEN');


/**
 * Fills an ErrorToken with the provided position, code, and params.
 * @param {!parse_css.Token} positionToken
 * @param {!amp.validator.ValidationError.Code} code
 * @param {!Array<string>} params
 * @return {!parse_css.ErrorToken}
 */
function createErrorTokenAt(positionToken, code, params) {
  const token = new parse_css.ErrorToken(code, params);
  positionToken.copyPosTo(token);
  return token;
}

/** @private */
class KeyframesVisitor extends parse_css.RuleVisitor {
  /**
   * @param {!Array<parse_css.ErrorToken>} errors
   */
  constructor(errors) {
    super();

    /** @type {!Array<parse_css.ErrorToken>} */
    this.errors = errors;

    /** @type {boolean} */
    this.parentIsKeyframesAtRule = false;
  }

  /** @inheritDoc */
  visitQualifiedRule(qualifiedRule) {
    if (!this.parentIsKeyframesAtRule) {
      if (amp.validator.LIGHT) {
        this.errors.push(parse_css.TRIVIAL_ERROR_TOKEN);
      } else {
        this.errors.push(createErrorTokenAt(
            qualifiedRule,
            amp.validator.ValidationError.Code
                .CSS_SYNTAX_DISALLOWED_QUALIFIED_RULE_MUST_BE_INSIDE_KEYFRAME,
            ['style', qualifiedRule.ruleName()]));
      }
      return;
    }
    if (qualifiedRule.declarations.length > 0) return;
    if (amp.validator.LIGHT) {
      this.errors.push(parse_css.TRIVIAL_ERROR_TOKEN);
    } else {
      this.errors.push(createErrorTokenAt(
          qualifiedRule,
          amp.validator.ValidationError.Code
              .CSS_SYNTAX_QUALIFIED_RULE_HAS_NO_DECLARATIONS,
          ['style', qualifiedRule.ruleName()]));
    }
  }

  /** @inheritDoc */
  visitAtRule(atRule) {
    switch (atRule.name) {
      case 'keyframes':
      case '-moz-keyframes':
      case '-o-keyframes':
      case '-webkit-keyframes':
        if (this.parentIsKeyframesAtRule) {
          if (amp.validator.LIGHT) {
            this.errors.push(parse_css.TRIVIAL_ERROR_TOKEN);
          } else {
            this.errors.push(createErrorTokenAt(
                atRule,
                amp.validator.ValidationError.Code
                    .CSS_SYNTAX_DISALLOWED_KEYFRAME_INSIDE_KEYFRAME,
                ['style']));
          }
        }
        this.parentIsKeyframesAtRule = true;
        return;
      default:
    }
  }

  /** @inheritDoc */
  leaveAtRule(atRule) {
    this.parentIsKeyframesAtRule = false;
  }
}

/**
 * @param {!parse_css.Stylesheet} styleSheet
 * @param {!Array<!parse_css.ErrorToken>} errors
 */
parse_css.validateKeyframesCss = function(styleSheet, errors) {
  const visitor = new KeyframesVisitor(errors);
  styleSheet.accept(visitor);
};
