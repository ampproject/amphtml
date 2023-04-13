goog.module('amp.validator.keyframesParseCss');

const parse_css = goog.require('parse_css');
const tokenize_css = goog.require('tokenize_css');
const {ValidationError} = goog.require('amp.validator.protogenerated');

/**
 * Fills an ErrorToken with the provided position, code, and params.
 * @param {!tokenize_css.Token} positionToken
 * @param {!ValidationError.Code} code
 * @param {!Array<string>} params
 * @return {!tokenize_css.ErrorToken}
 */
const createErrorTokenAt = function(positionToken, code, params) {
  const token = new tokenize_css.ErrorToken(code, params);
  positionToken.copyPosTo(token);
  return token;
};
exports.createErrorTokenAt = createErrorTokenAt;

/** @private */
class KeyframesVisitor extends parse_css.RuleVisitor {
  /**
   * @param {!Array<!tokenize_css.ErrorToken>} errors
   */
  constructor(errors) {
    super();

    /** @type {!Array<!tokenize_css.ErrorToken>} */
    this.errors = errors;

    /** @type {boolean} */
    this.parentIsKeyframesAtRule = false;
  }

  /** @inheritDoc */
  visitQualifiedRule(qualifiedRule) {
    if (!this.parentIsKeyframesAtRule) {
      this.errors.push(createErrorTokenAt(
          qualifiedRule,
          ValidationError.Code
              .CSS_SYNTAX_DISALLOWED_QUALIFIED_RULE_MUST_BE_INSIDE_KEYFRAME,
          ['style', qualifiedRule.ruleName()]));
      return;
    }
    if (qualifiedRule.declarations.length > 0) {
      return;
    }
    this.errors.push(createErrorTokenAt(
        qualifiedRule,
        ValidationError.Code.CSS_SYNTAX_QUALIFIED_RULE_HAS_NO_DECLARATIONS,
        ['style', qualifiedRule.ruleName()]));
  }

  /** @inheritDoc */
  visitAtRule(atRule) {
    switch (atRule.name) {
      case 'keyframes':
      case '-moz-keyframes':
      case '-o-keyframes':
      case '-webkit-keyframes':
        if (this.parentIsKeyframesAtRule) {
          this.errors.push(createErrorTokenAt(
              atRule,
              ValidationError.Code
                  .CSS_SYNTAX_DISALLOWED_KEYFRAME_INSIDE_KEYFRAME,
              ['style']));
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
 * @param {!Array<!tokenize_css.ErrorToken>} errors
 */
const validateKeyframesCss = function(styleSheet, errors) {
  const visitor = new KeyframesVisitor(errors);
  styleSheet.accept(visitor);
};
exports.validateKeyframesCss = validateKeyframesCss;
