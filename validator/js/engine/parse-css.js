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
 *
 * Credits:
 *   This original version of this file was derived from
 *   https://github.com/tabatkins/parse-css by Tab Atkins,
 *   licensed under the CC0 license
 *   (http://creativecommons.org/publicdomain/zero/1.0/).
 */
goog.module('parse_css');

const asserts = goog.require('goog.asserts');
const googString = goog.require('goog.string');
const tokenize_css = goog.require('tokenize_css');
const {ValidationError} = goog.require('amp.validator.protogenerated');

/**
 * @param {!Array<?>} arr
 * @return {!Array<!Object>}
 */
function arrayToJSON(arr) {
  const json = [];
  for (let i = 0; i < arr.length; i++) {
    json.push(arr[i].toJSON());
  }
  return json;
}

/**
 * A TokenStream is essentially an array of Token objects
 * with a reference to a current position. Consume/Reconsume methods
 * move the current position. tokenAt, current, and next inspect tokens
 * at specific points.
 */
const TokenStream = class {
  /**
   * @param {!Array<!tokenize_css.Token>} tokens
   */
  constructor(tokens) {
    asserts.assert(
        tokens.length > 0,
        'Internal Error: empty TokenStream - must have EOF token');
    asserts.assert(
        tokens[tokens.length - 1].tokenType ===
            tokenize_css.TokenType.EOF_TOKEN,
        'Internal Error: TokenStream must end with EOF');

    /** @type {!Array<!tokenize_css.Token>} */
    this.tokens = tokens;
    /** @type {number} */
    this.pos = -1;
  }

  /**
   * Returns the token at an absolute position in the token stream.
   *
   * @param {number} num
   * @return {!tokenize_css.Token}
   */
  tokenAt(num) {
    // The last token is guaranteed to be the EOF token (with correct
    // line / col!) so any request past the length of the array
    // fetches that.
    return (num < this.tokens.length) ? this.tokens[num] :
                                        this.tokens[this.tokens.length - 1];
  }

  /**
   * Returns the token at the current position in the token stream.
   * @return {!tokenize_css.Token}
   */
  current() {
    return this.tokenAt(this.pos);
  }

  /**
   * Returns the token at the next position in the token stream.
   * @return {!tokenize_css.Token}
   */
  next() {
    return this.tokenAt(this.pos + 1);
  }

  /**
   * Advances the stream by one.
   */
  consume() {
    this.pos++;
  }

  /** Rewinds to the previous position in the input. */
  reconsume() {
    this.pos--;
  }
};
exports.TokenStream = TokenStream;

/**
 * Strips vendor prefixes from identifiers, e.g. property names or names
 * of at rules. E.g., "-moz-keyframes" -> "keyframes".
 * @param {string} prefixedString
 * @return {string}
 */
const stripVendorPrefix = function(prefixedString) {
  // Checking for '-' is an optimization.
  if (prefixedString !== '' && prefixedString[0] === '-') {
    if (googString./*OK*/ startsWith(prefixedString, '-o-')) {
      return prefixedString.substr('-o-'.length);
    }
    if (googString./*OK*/ startsWith(prefixedString, '-moz-')) {
      return prefixedString.substr('-moz-'.length);
    }
    if (googString./*OK*/ startsWith(prefixedString, '-ms-')) {
      return prefixedString.substr('-ms-'.length);
    }
    if (googString./*OK*/ startsWith(prefixedString, '-webkit-')) {
      return prefixedString.substr('-webkit-'.length);
    }
  }
  return prefixedString;
};
exports.stripVendorPrefix = stripVendorPrefix;

/**
 * Strips 'min-' or 'max-' from the start of a media feature identifier, if
 * present. E.g., "min-width" -> "width".
 * @param {string} prefixedString
 * @return {string}
 */
const stripMinMax = function(prefixedString) {
  if (googString./*OK*/ startsWith(prefixedString, 'min-')) {
    return prefixedString.substr('min-'.length);
  }
  if (googString./*OK*/ startsWith(prefixedString, 'max-')) {
    return prefixedString.substr('max-'.length);
  }
  return prefixedString;
};
exports.stripMinMax = stripMinMax;

/**
 * Returns a Stylesheet object with nested Rules.
 *
 * The top level Rules in a Stylesheet are always a series of
 * QualifiedRule's or AtRule's.
 *
 * @param {!Array<!tokenize_css.Token>} tokenList
 * @param {!Object<string,!BlockType>} atRuleSpec block type rules for
 * all CSS AT rules this canonicalizer should handle.
 * @param {!BlockType} defaultSpec default block type for types not
 * found in atRuleSpec.
 * @param {!Array<!tokenize_css.ErrorToken>} errors output array for the errors.
 * @return {!Stylesheet}
 */
const parseAStylesheet = function(tokenList, atRuleSpec, defaultSpec, errors) {
  const canonicalizer = new Canonicalizer(atRuleSpec, defaultSpec);
  const stylesheet = new Stylesheet();

  stylesheet.rules =
      canonicalizer.parseAListOfRules(tokenList, /* topLevel */ true, errors);
  tokenList[0].copyPosTo(stylesheet);
  const eof = /** @type {!tokenize_css.EOFToken} */
      (tokenList[tokenList.length - 1]);
  stylesheet.eof = eof;

  return stylesheet;
};
exports.parseAStylesheet = parseAStylesheet;

/**
 * Returns a array of Declaration objects.
 *
 * @param {!Array<!tokenize_css.Token>} tokenList
 * @param {!Array<!tokenize_css.ErrorToken>} errors output array for the errors.
 * @return {!Array<!Declaration>}
 */
const parseInlineStyle = function(tokenList, errors) {
  const canonicalizer = new Canonicalizer({}, BlockType.PARSE_AS_DECLARATIONS);
  return canonicalizer.parseAListOfDeclarations(tokenList, errors);
};
exports.parseInlineStyle = parseInlineStyle;

/**
 * Abstract super class for the parser rules.
 */
const Rule = class extends tokenize_css.Token {
  constructor() {
    super();
    /** @type {!tokenize_css.TokenType} */
    this.tokenType = tokenize_css.TokenType.UNKNOWN;
  }

  /** @param {!RuleVisitor} visitor */
  accept(visitor) {}

  /**
   * @param {number=} opt_indent
   * @return {string}
   */
  toString(opt_indent) {
    return JSON.stringify(this.toJSON(), null, opt_indent);
  }
};
exports.Rule = Rule;

const Stylesheet = class extends Rule {
  constructor() {
    super();
    /** @type {!Array<!Rule>} */
    this.rules = [];
    /** @type {?tokenize_css.EOFToken} */
    this.eof = null;
    /** @type {!tokenize_css.TokenType} */
    this.tokenType = tokenize_css.TokenType.STYLESHEET;
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitStylesheet(this);
    for (const rule of this.rules) {
      rule.accept(visitor);
    }
    visitor.leaveStylesheet(this);
  }
};
exports.Stylesheet = Stylesheet;

/** @inheritDoc */
Stylesheet.prototype.toJSON = function() {
  const json = Rule.prototype.toJSON.call(this);
  json['rules'] = arrayToJSON(this.rules);
  json['eof'] = this.eof.toJSON();
  return json;
};

const AtRule = class extends Rule {
  /**
   * @param {string} name
   */
  constructor(name) {
    super();
    /** @type {string} */
    this.name = name;
    /** @type {!Array<!tokenize_css.Token>} */
    this.prelude = [];
    /** @type {!Array<!Rule>} */
    this.rules = [];
    /** @type {!Array<!Declaration>} */
    this.declarations = [];
    /** @type {!tokenize_css.TokenType} */
    this.tokenType = tokenize_css.TokenType.AT_RULE;
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitAtRule(this);
    for (const rule of this.rules) {
      rule.accept(visitor);
    }
    for (const declaration of this.declarations) {
      declaration.accept(visitor);
    }
    visitor.leaveAtRule(this);
  }
};
exports.AtRule = AtRule;

/** @inheritDoc */
AtRule.prototype.toJSON = function() {
  const json = Rule.prototype.toJSON.call(this);
  json['name'] = this.name;
  json['prelude'] = arrayToJSON(this.prelude);
  json['rules'] = arrayToJSON(this.rules);
  json['declarations'] = arrayToJSON(this.declarations);
  return json;
};

const QualifiedRule = class extends Rule {
  constructor() {
    super();
    /** @type {!Array<!tokenize_css.Token>} */
    this.prelude = [];
    /** @type {!Array<!Declaration>} */
    this.declarations = [];
    /** @type {!tokenize_css.TokenType} */
    this.tokenType = tokenize_css.TokenType.QUALIFIED_RULE;
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitQualifiedRule(this);
    for (const declaration of this.declarations) {
      declaration.accept(visitor);
    }
    visitor.leaveQualifiedRule(this);
  }
};
exports.QualifiedRule = QualifiedRule;

/** @inheritDoc */
QualifiedRule.prototype.toJSON = function() {
  const json = Rule.prototype.toJSON.call(this);
  json['prelude'] = arrayToJSON(this.prelude);
  json['declarations'] = arrayToJSON(this.declarations);
  return json;
};

/** @return {string} The concatenation of the qualified rule name. */
QualifiedRule.prototype.ruleName = function() {
  let ruleName = '';
  for (let i = 0; i < this.prelude.length; ++i) {
    const prelude =
        /** @type {!tokenize_css.IdentToken} */ (this.prelude[i]);
    if (prelude.value) {
      ruleName += prelude.value;
    }
  }
  return ruleName;
};

const Declaration = class extends Rule {
  /**
   * @param {string} name
   */
  constructor(name) {
    super();
    /** @type {string} */
    this.name = name;
    /** @type {!Array<!tokenize_css.Token>} */
    this.value = [];
    /** @type {boolean} */
    this.important = false;
    /** @type {number} */
    this.important_line = -1;
    /** @type {number} */
    this.important_col = -1;
    /** @type {!tokenize_css.TokenType} */
    this.tokenType = tokenize_css.TokenType.DECLARATION;
  }

  /**
   * For a declaration, if the first non-whitespace token is an identifier,
   * returns its string value. Otherwise, returns the empty string.
   * @return {string}
   */
  firstIdent() {
    if (this.value.length === 0) {
      return '';
    }
    if (this.value[0].tokenType === tokenize_css.TokenType.IDENT) {
      return /** @type {!tokenize_css.StringValuedToken} */ (this.value[0])
          .value;
    }
    if (this.value.length >= 2 &&
        (this.value[0].tokenType === tokenize_css.TokenType.WHITESPACE) &&
        this.value[1].tokenType === tokenize_css.TokenType.IDENT) {
      return /** @type {!tokenize_css.StringValuedToken} */ (this.value[1])
          .value;
    }
    return '';
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitDeclaration(this);
    visitor.leaveDeclaration(this);
  }
};
/** @inheritDoc */
Declaration.prototype.toJSON = function() {
  const json = Rule.prototype.toJSON.call(this);
  json['name'] = this.name;
  json['important'] = this.important;
  json['value'] = arrayToJSON(this.value);
  return json;
};
exports.Declaration = Declaration;

/**
 * A visitor for Rule subclasses (StyleSheet, AtRule, QualifiedRule,
 * Declaration). Pass this to the Rule::Accept method.
 * Visitation order is to call the Visit* method on the current node,
 * then visit the children, then call the Leave* method on the current node.
 */
const RuleVisitor = class {
  constructor() {}

  /** @param {!Stylesheet} stylesheet */
  visitStylesheet(stylesheet) {}

  /** @param {!Stylesheet} stylesheet */
  leaveStylesheet(stylesheet) {}

  /** @param {!AtRule} atRule */
  visitAtRule(atRule) {}

  /** @param {!AtRule} atRule */
  leaveAtRule(atRule) {}

  /** @param {!QualifiedRule} qualifiedRule */
  visitQualifiedRule(qualifiedRule) {}

  /** @param {!QualifiedRule} qualifiedRule */
  leaveQualifiedRule(qualifiedRule) {}

  /** @param {!Declaration} declaration */
  visitDeclaration(declaration) {}

  /** @param {!Declaration} declaration */
  leaveDeclaration(declaration) {}
};
exports.RuleVisitor = RuleVisitor;

/**
 * Enum describing how to parse the rules inside a CSS AT Rule.
 * @enum {string}
 */
const BlockType = {
  // Parse this simple block as a list of rules
  // (Either Qualified Rules or AT Rules)
  'PARSE_AS_RULES': 'PARSE_AS_RULES',
  // Parse this simple block as a list of declarations
  'PARSE_AS_DECLARATIONS': 'PARSE_AS_DECLARATIONS',
  // Ignore this simple block, do not parse. This is generally used
  // in conjunction with a later step emitting an error for this rule.
  'PARSE_AS_IGNORE': 'PARSE_AS_IGNORE',
};
exports.BlockType = BlockType;

/**
 * A canonicalizer is created with a specific spec for canonicalizing CSS AT
 * rules. It otherwise has no state.
 * @private
 */
class Canonicalizer {
  /**
   * @param {!Object<string,!BlockType>} atRuleSpec block
   * type rules for all CSS AT rules this canonicalizer should handle.
   * @param {!BlockType} defaultSpec default block type for
   * types not found in atRuleSpec.
   */
  constructor(atRuleSpec, defaultSpec) {
    /**
     * @type {!Object<string,!BlockType>}
     * @private
     */
    this.atRuleSpec_ = atRuleSpec;
    /**
     * @type {!BlockType}
     * @private
     */
    this.defaultAtRuleSpec_ = defaultSpec;
  }

  /**
   * Returns a type telling us how to canonicalize a given AT rule's block.
   * @param {!AtRule} atRule
   * @return {!BlockType}
   */
  blockTypeFor(atRule) {
    const maybeBlockType = this.atRuleSpec_[stripVendorPrefix(atRule.name)];
    if (maybeBlockType !== undefined) {
      return maybeBlockType;
    } else {
      return this.defaultAtRuleSpec_;
    }
  }

  /**
   * Parses and returns a list of rules, such as at the top level of a
   * stylesheet. Return list has only QualifiedRule's and AtRule's as top level
   * elements.
   * @param {!Array<!tokenize_css.Token>} tokenList
   * @param {boolean} topLevel
   * @param {!Array<!tokenize_css.ErrorToken>} errors output array for the
   *     errors.
   * @return {!Array<!Rule>}
   */
  parseAListOfRules(tokenList, topLevel, errors) {
    const tokenStream = new TokenStream(tokenList);
    const rules = [];
    while (true) {
      tokenStream.consume();
      const current = tokenStream.current().tokenType;
      if (current === tokenize_css.TokenType.WHITESPACE) {
        continue;
      } else if (current === tokenize_css.TokenType.EOF_TOKEN) {
        return rules;
      } else if (
          current === tokenize_css.TokenType.CDO ||
          current === tokenize_css.TokenType.CDC) {
        if (topLevel) {
          continue;
        }
        this.parseAQualifiedRule(tokenStream, rules, errors);
      } else if (current === tokenize_css.TokenType.AT_KEYWORD) {
        rules.push(this.parseAnAtRule(tokenStream, errors));
      } else {
        this.parseAQualifiedRule(tokenStream, rules, errors);
      }
    }
  }

  /**
   * Parses an At Rule.
   *
   * @param {!TokenStream} tokenStream
   * @param {!Array<!tokenize_css.ErrorToken>} errors output array for the
   *     errors.
   * @return {!AtRule}
   */
  parseAnAtRule(tokenStream, errors) {
    asserts.assert(
        tokenStream.current().tokenType === tokenize_css.TokenType.AT_KEYWORD,
        'Internal Error: parseAnAtRule precondition not met');

    const startToken =
        /** @type {!tokenize_css.AtKeywordToken} */ (tokenStream.current());
    const rule = new AtRule(startToken.value);
    startToken.copyPosTo(rule);

    while (true) {
      tokenStream.consume();
      const current = tokenStream.current().tokenType;
      if (current === tokenize_css.TokenType.SEMICOLON ||
          current === tokenize_css.TokenType.EOF_TOKEN) {
        rule.prelude.push(tokenStream.current());
        return rule;
      }
      if (current === tokenize_css.TokenType.OPEN_CURLY) {
        rule.prelude.push(
            tokenStream.current().copyPosTo(new tokenize_css.EOFToken()));

        /** @type {!Array<!tokenize_css.Token>} */
        const contents = extractASimpleBlock(tokenStream, errors);

        switch (this.blockTypeFor(rule)) {
          case BlockType.PARSE_AS_RULES: {
            rule.rules =
                this.parseAListOfRules(contents, /* topLevel */ false, errors);
            break;
          }
          case BlockType.PARSE_AS_DECLARATIONS: {
            rule.declarations = this.parseAListOfDeclarations(contents, errors);
            break;
          }
          case BlockType.PARSE_AS_IGNORE: {
            break;
          }
          default: {
            asserts.fail('Unrecognized blockType ' + this.blockTypeFor(rule));
            break;
          }
        }
        return rule;
      }
      if (!consumeAComponentValue(tokenStream, rule.prelude, /*depth*/ 0)) {
        errors.push(tokenStream.current().copyPosTo(new tokenize_css.ErrorToken(
            ValidationError.Code.CSS_EXCESSIVELY_NESTED, ['style'])));
      }
    }
  }

  /**
   * Parses one Qualified rule or ErrorToken appended to either rules or errors
   * respectively. Rule will include a prelude with the CSS selector (if any)
   * and a list of declarations.
   *
   * @param {!TokenStream} tokenStream
   * @param {!Array<!Rule>} rules output array for new rule
   * @param {!Array<!tokenize_css.ErrorToken>} errors output array for new
   *     error.
   */
  parseAQualifiedRule(tokenStream, rules, errors) {
    asserts.assert(
        tokenStream.current().tokenType !== tokenize_css.TokenType.EOF_TOKEN &&
            tokenStream.current().tokenType !==
                tokenize_css.TokenType.AT_KEYWORD,
        'Internal Error: parseAQualifiedRule precondition not met');

    const rule = tokenStream.current().copyPosTo(new QualifiedRule());
    tokenStream.reconsume();
    while (true) {
      tokenStream.consume();
      const current = tokenStream.current().tokenType;
      if (current === tokenize_css.TokenType.EOF_TOKEN) {
        errors.push(rule.copyPosTo(new tokenize_css.ErrorToken(
            ValidationError.Code.CSS_SYNTAX_EOF_IN_PRELUDE_OF_QUALIFIED_RULE,
            ['style'])));
        return;
      }
      if (current === tokenize_css.TokenType.OPEN_CURLY) {
        rule.prelude.push(
            tokenStream.current().copyPosTo(new tokenize_css.EOFToken()));

        // This consumes declarations (ie: "color: red;" ) inside
        // a qualified rule as that rule's value.
        rule.declarations = this.parseAListOfDeclarations(
            extractASimpleBlock(tokenStream, errors), errors);

        rules.push(rule);
        return;
      }
      // This consumes a CSS selector as the rules prelude.
      if (!consumeAComponentValue(tokenStream, rule.prelude, /*depth*/ 0)) {
        errors.push(tokenStream.current().copyPosTo(new tokenize_css.ErrorToken(
            ValidationError.Code.CSS_EXCESSIVELY_NESTED, ['style'])));
      }
    }
  }

  /**
   * @param {!Array<!tokenize_css.Token>} tokenList
   * @param {!Array<!tokenize_css.ErrorToken>} errors output array for the
   *     errors.
   * @return {!Array<!Declaration>}
   */
  parseAListOfDeclarations(tokenList, errors) {
    /** @type {!Array<!Declaration>} */
    const decls = [];
    const tokenStream = new TokenStream(tokenList);
    while (true) {
      tokenStream.consume();
      const current = tokenStream.current().tokenType;
      if (current === tokenize_css.TokenType.WHITESPACE ||
          current === tokenize_css.TokenType.SEMICOLON) {
        continue;
      } else if (current === tokenize_css.TokenType.EOF_TOKEN) {
        return decls;
      } else if (current === tokenize_css.TokenType.AT_KEYWORD) {
        // The CSS3 Parsing spec allows for AT rules inside lists of
        // declarations, but our grammar does not so we deviate a tiny bit here.
        // We consume an AT rule, but drop it and instead push an error token.
        const atRule = this.parseAnAtRule(tokenStream, errors);
        errors.push(atRule.copyPosTo(new tokenize_css.ErrorToken(
            ValidationError.Code.CSS_SYNTAX_INVALID_AT_RULE,
            ['style', atRule.name])));
      } else if (current === tokenize_css.TokenType.IDENT) {
        this.parseADeclaration(tokenStream, decls, errors);
      } else {
        errors.push(tokenStream.current().copyPosTo(new tokenize_css.ErrorToken(
            ValidationError.Code.CSS_SYNTAX_INVALID_DECLARATION, ['style'])));
        tokenStream.reconsume();
        while (!(
            tokenStream.next().tokenType === tokenize_css.TokenType.SEMICOLON ||
            tokenStream.next().tokenType ===
                tokenize_css.TokenType.EOF_TOKEN)) {
          tokenStream.consume();
          const dummyTokenList = [];
          if (!consumeAComponentValue(
                  tokenStream, dummyTokenList, /*depth*/ 0)) {
            errors.push(
                tokenStream.current().copyPosTo(new tokenize_css.ErrorToken(
                    ValidationError.Code.CSS_EXCESSIVELY_NESTED, ['style'])));
          }
        }
      }
    }
  }

  /**
   * Adds one element to either declarations or errors.
   * @param {!TokenStream} tokenStream
   * @param {!Array<!Declaration>} declarations output array for
   * declarations
   * @param {!Array<!tokenize_css.ErrorToken>} errors output array for the
   *     errors.
   */
  parseADeclaration(tokenStream, declarations, errors) {
    asserts.assert(
        tokenStream.current().tokenType === tokenize_css.TokenType.IDENT,
        'Internal Error: parseADeclaration precondition not met');

    const startToken =
        /** @type {!tokenize_css.IdentToken} */ (tokenStream.current());
    const decl = startToken.copyPosTo(new Declaration(startToken.value));

    while (tokenStream.next().tokenType === tokenize_css.TokenType.WHITESPACE) {
      tokenStream.consume();
    }

    tokenStream.consume();
    if (!(tokenStream.current().tokenType === tokenize_css.TokenType.COLON)) {
      errors.push(startToken.copyPosTo(new tokenize_css.ErrorToken(
          ValidationError.Code.CSS_SYNTAX_INCOMPLETE_DECLARATION, ['style'])));
      tokenStream.reconsume();
      while (!(
          tokenStream.next().tokenType === tokenize_css.TokenType.SEMICOLON ||
          tokenStream.next().tokenType === tokenize_css.TokenType.EOF_TOKEN)) {
        tokenStream.consume();
      }
      return;
    }

    while (
        !(tokenStream.next().tokenType === tokenize_css.TokenType.SEMICOLON ||
          tokenStream.next().tokenType === tokenize_css.TokenType.EOF_TOKEN)) {
      tokenStream.consume();
      if (!consumeAComponentValue(tokenStream, decl.value, /*depth*/ 0)) {
        errors.push(tokenStream.current().copyPosTo(new tokenize_css.ErrorToken(
            ValidationError.Code.CSS_EXCESSIVELY_NESTED, ['style'])));
      }
    }
    decl.value.push(tokenStream.next().copyPosTo(new tokenize_css.EOFToken()));

    let foundImportant = false;
    // The last token is always EOF, so start at the 2nd to last token.
    for (let i = decl.value.length - 2; i >= 0; i--) {
      if (decl.value[i].tokenType === tokenize_css.TokenType.WHITESPACE) {
        continue;
      } else if (
          decl.value[i].tokenType === tokenize_css.TokenType.IDENT &&
          /** @type {!tokenize_css.IdentToken} */
          (decl.value[i]).ASCIIMatch('important')) {
        foundImportant = true;
      } else if (
          foundImportant &&
          decl.value[i].tokenType === tokenize_css.TokenType.DELIM &&
          /** @type {!tokenize_css.DelimToken} */ (decl.value[i]).value ===
              '!') {
        decl.important = true;
        decl.important_line = decl.value[i].line;
        decl.important_col = decl.value[i].col;
        // Delete !important and later, but not the EOF token
        decl.value.splice(i, decl.value.length - i - 1);
        break;
      } else {
        break;
      }
    }

    declarations.push(decl);
  }
}

/** @type {number} **/
const kMaximumCssRecursion = 100;

/**
 * Consumes one or more tokens from a tokenStream, appending them to a
 * tokenList. If exceeds depth, returns false
 * @param {!TokenStream} tokenStream
 * @param {!Array<!tokenize_css.Token>} tokenList output array for tokens.
 * @param {number} depth
 * @return {boolean}
 */
function consumeAComponentValue(tokenStream, tokenList, depth) {
  if (depth > kMaximumCssRecursion) {
    return false;
  }
  const current = tokenStream.current().tokenType;
  if (current === tokenize_css.TokenType.OPEN_CURLY ||
      current === tokenize_css.TokenType.OPEN_SQUARE ||
      current === tokenize_css.TokenType.OPEN_PAREN) {
    if (!consumeASimpleBlock(tokenStream, tokenList, depth + 1)) {
      return false;
    }
  } else if (current === tokenize_css.TokenType.FUNCTION_TOKEN) {
    if (!consumeAFunction(tokenStream, tokenList, depth + 1)) {
      return false;
    }
  } else {
    tokenList.push(tokenStream.current());
  }
  return true;
}

/**
 * Appends a simple block's contents to a tokenList, consuming from
 * the stream all those tokens that it adds to the tokenList,
 * including the start/end grouping token. If exceeds depth, returns false.
 * @param {!TokenStream} tokenStream
 * @param {!Array<!tokenize_css.Token>} tokenList output array for tokens.
 * @param {number} depth
 * @return {boolean}
 */
function consumeASimpleBlock(tokenStream, tokenList, depth) {
  if (depth > kMaximumCssRecursion) {
    return false;
  }
  const current = tokenStream.current().tokenType;
  asserts.assert(
      (current === tokenize_css.TokenType.OPEN_CURLY ||
       current === tokenize_css.TokenType.OPEN_SQUARE ||
       current === tokenize_css.TokenType.OPEN_PAREN),
      'Internal Error: consumeASimpleBlock precondition not met');

  const startToken =
      /** @type {!tokenize_css.GroupingToken} */ (tokenStream.current());
  const {mirror} = startToken;

  tokenList.push(startToken);
  while (true) {
    tokenStream.consume();
    const current = tokenStream.current().tokenType;
    if (current === tokenize_css.TokenType.EOF_TOKEN) {
      tokenList.push(tokenStream.current());
      return true;
    } else if (
        (current === tokenize_css.TokenType.CLOSE_CURLY ||
         current === tokenize_css.TokenType.CLOSE_SQUARE ||
         current === tokenize_css.TokenType.CLOSE_PAREN) &&
        /** @type {!tokenize_css.GroupingToken} */
        (tokenStream.current()).value === mirror) {
      tokenList.push(tokenStream.current());
      return true;
    } else {
      if (!consumeAComponentValue(tokenStream, tokenList, depth + 1)) {
        return false;
      }
    }
  }
}

/**
 * Returns a simple block's contents in tokenStream, excluding the
 * start/end grouping token, and appended with an EOFToken.
 * @param {!TokenStream} tokenStream
 * @param {!Array<!tokenize_css.ErrorToken>} errors
 * @return {!Array<!tokenize_css.Token>}
 */
const extractASimpleBlock = function(tokenStream, errors) {
  /** @type {!Array<!tokenize_css.Token>} */
  const consumedTokens = [];
  if (!consumeASimpleBlock(tokenStream, consumedTokens, /*depth*/ 0)) {
    errors.push(tokenStream.current().copyPosTo(new tokenize_css.ErrorToken(
        ValidationError.Code.CSS_EXCESSIVELY_NESTED, ['style'])));
  }

  // A simple block always has a start token (e.g. '{') and
  // either a closing token or EOF token.
  asserts.assert(consumedTokens.length >= 2);

  // Exclude the start token. Convert end token to EOF.
  const end = consumedTokens.length - 1;
  consumedTokens[end] =
      consumedTokens[end].copyPosTo(new tokenize_css.EOFToken());
  return consumedTokens.slice(1);
};
exports.extractASimpleBlock = extractASimpleBlock;

/**
 * Appends a function's contents to a tokenList, consuming from the
 * stream all those tokens that it adds to the tokenList, including
 * the function token and end grouping token. If exceeds depth, returns false.
 * @param {!TokenStream} tokenStream
 * @param {!Array<!tokenize_css.Token>} tokenList output array for tokens.
 * @param {number} depth
 * @return {boolean}
 */
function consumeAFunction(tokenStream, tokenList, depth) {
  if (depth > kMaximumCssRecursion) {
    return false;
  }
  asserts.assert(
      tokenStream.current().tokenType === tokenize_css.TokenType.FUNCTION_TOKEN,
      'Internal Error: consumeAFunction precondition not met');
  tokenList.push(tokenStream.current());
  while (true) {
    tokenStream.consume();
    const current = tokenStream.current().tokenType;
    if (current === tokenize_css.TokenType.EOF_TOKEN ||
        current === tokenize_css.TokenType.CLOSE_PAREN) {
      tokenList.push(tokenStream.current());
      return true;
    } else {
      if (!consumeAComponentValue(tokenStream, tokenList, depth + 1)) {
        return false;
      }
    }
  }
}

/**
 * Returns a function's contents in tokenList, including the leading
 * FunctionToken, but excluding the trailing CloseParen token and
 * appended with an EOFToken instead.
 * @param {!TokenStream} tokenStream
 * @param {!Array<!tokenize_css.ErrorToken>} errors
 * @return {!Array<!tokenize_css.Token>}
 */
const extractAFunction = function(tokenStream, errors) {
  /** @type {!Array<!tokenize_css.Token>} */
  const consumedTokens = [];
  if (!consumeAFunction(tokenStream, consumedTokens, /*depth*/ 0)) {
    errors.push(tokenStream.current().copyPosTo(new tokenize_css.ErrorToken(
        ValidationError.Code.CSS_EXCESSIVELY_NESTED, ['style'])));
  }
  // A function always has a start FunctionToken and
  // either a CloseParenToken or EOFToken.
  asserts.assert(consumedTokens.length >= 2);

  // Convert end token to EOF.
  const end = consumedTokens.length - 1;
  consumedTokens[end] =
      consumedTokens[end].copyPosTo(new tokenize_css.EOFToken());
  return consumedTokens;
};
exports.extractAFunction = extractAFunction;

/**
 * Used by ExtractUrls to return urls it has seen. This represents
 * URLs in CSS such as url(http://foo.com/) and url("http://bar.com/").
 * For this token, line() and col() indicate the position information
 * of the left-most CSS token that's part of the URL. E.g., this would be
 * the URLToken instance or the FunctionToken instance.
 */
const ParsedCssUrl = class extends tokenize_css.Token {
  constructor() {
    super();
    /** @type {!tokenize_css.TokenType} */
    this.tokenType = tokenize_css.TokenType.PARSED_CSS_URL;
    /**
     * The decoded URL. This string will not contain CSS string escapes,
     * quotes, or similar. Encoding is utf8.
     * @type {string}
     */
    this.utf8Url = '';
    /**
     * A rule scope, in case the url was encountered within an at-rule.
     * If not within an at-rule, this string is empty.
     * @type {string}
     */
    this.atRuleScope = '';
  }
};
exports.ParsedCssUrl = ParsedCssUrl;

/** @inheritDoc */
ParsedCssUrl.prototype.toJSON = function() {
  const json = tokenize_css.Token.prototype.toJSON.call(this);
  json['utf8Url'] = this.utf8Url;
  json['atRuleScope'] = this.atRuleScope;
  return json;
};

/**
 * Parses a CSS URL token; typically takes the form "url(http://foo)".
 * Preconditions: tokens[token_idx] is a URL token
 *                and token_idx + 1 is in range.
 * @param {!Array<!tokenize_css.Token>} tokens
 * @param {number} tokenIdx
 * @param {!ParsedCssUrl} parsed
 */
function parseUrlToken(tokens, tokenIdx, parsed) {
  asserts.assert(tokenIdx + 1 < tokens.length);
  const token = tokens[tokenIdx];
  asserts.assert(token.tokenType === tokenize_css.TokenType.URL);
  token.copyPosTo(parsed);
  parsed.utf8Url = /** @type {!tokenize_css.URLToken}*/ (token).value;
}

/**
 * Parses a CSS function token named 'url', including the string and closing
 * paren. Typically takes the form "url('http://foo')".
 * Returns the token_idx past the closing paren, or -1 if parsing fails.
 * Preconditions: tokens[token_idx] is a URL token
 *                and tokens[token_idx]->StringValue() == "url"
 * @param {!Array<!tokenize_css.Token>} tokens
 * @param {number} tokenIdx
 * @param {!ParsedCssUrl} parsed
 * @return {number}
 */
function parseUrlFunction(tokens, tokenIdx, parsed) {
  const token = tokens[tokenIdx];
  asserts.assert(token.tokenType == tokenize_css.TokenType.FUNCTION_TOKEN);
  asserts.assert(
      /** @type {!tokenize_css.FunctionToken} */ (token).value === 'url');
  asserts.assert(
      tokens[tokens.length - 1].tokenType === tokenize_css.TokenType.EOF_TOKEN);
  token.copyPosTo(parsed);
  ++tokenIdx;  // We've digested the function token above.
  // Safe: tokens ends w/ EOF_TOKEN.
  asserts.assert(tokenIdx < tokens.length);

  // Consume optional whitespace.
  while (tokens[tokenIdx].tokenType === tokenize_css.TokenType.WHITESPACE) {
    ++tokenIdx;
    // Safe: tokens ends w/ EOF_TOKEN.
    asserts.assert(tokenIdx < tokens.length);
  }

  // Consume URL.
  if (tokens[tokenIdx].tokenType !== tokenize_css.TokenType.STRING) {
    return -1;
  }
  parsed.utf8Url =
      /** @type {!tokenize_css.StringToken} */ (tokens[tokenIdx]).value;

  ++tokenIdx;
  // Safe: tokens ends w/ EOF_TOKEN.
  asserts.assert(tokenIdx < tokens.length);

  // Consume optional whitespace.
  while (tokens[tokenIdx].tokenType === tokenize_css.TokenType.WHITESPACE) {
    ++tokenIdx;
    // Safe: tokens ends w/ EOF_TOKEN.
    asserts.assert(tokenIdx < tokens.length);
  }

  // Consume ')'
  if (tokens[tokenIdx].tokenType !== tokenize_css.TokenType.CLOSE_PAREN) {
    return -1;
  }
  return tokenIdx + 1;
}

/**
 * Helper class for implementing extractUrls.
 * @private
 */
class UrlFunctionVisitor extends RuleVisitor {
  /**
   * @param {!Array<!ParsedCssUrl>} parsedUrls
   * @param {!Array<!tokenize_css.ErrorToken>} errors
   */
  constructor(parsedUrls, errors) {
    super();

    /** @type {!Array<!ParsedCssUrl>} */
    this.parsedUrls = parsedUrls;
    /** @type {!Array<!tokenize_css.ErrorToken>} */
    this.errors = errors;
    /** @type {string} */
    this.atRuleScope = '';
  }

  /** @inheritDoc */
  visitAtRule(atRule) {
    this.atRuleScope = atRule.name;
  }

  /** @inheritDoc */
  leaveAtRule(atRule) {
    this.atRuleScope = '';
  }

  /** @inheritDoc */
  visitQualifiedRule(qualifiedRule) {
    this.atRuleScope = '';
  }

  /** @inheritDoc */
  visitDeclaration(declaration) {
    asserts.assert(declaration.value.length > 0);
    asserts.assert(
        declaration.value[declaration.value.length - 1].tokenType ===
        tokenize_css.TokenType.EOF_TOKEN);
    for (let ii = 0; ii < declaration.value.length - 1;) {
      const token = declaration.value[ii];
      if (token.tokenType === tokenize_css.TokenType.URL) {
        const parsedUrl = new ParsedCssUrl();
        parseUrlToken(declaration.value, ii, parsedUrl);
        parsedUrl.atRuleScope = this.atRuleScope;
        this.parsedUrls.push(parsedUrl);
        ++ii;
        continue;
      }
      if (token.tokenType === tokenize_css.TokenType.FUNCTION_TOKEN &&
          /** @type {!tokenize_css.FunctionToken} */ (token).value === 'url') {
        const parsedUrl = new ParsedCssUrl();
        ii = parseUrlFunction(declaration.value, ii, parsedUrl);
        if (ii === -1) {
          this.errors.push(token.copyPosTo(new tokenize_css.ErrorToken(
              ValidationError.Code.CSS_SYNTAX_BAD_URL, ['style'])));
          return;
        }
        parsedUrl.atRuleScope = this.atRuleScope;
        this.parsedUrls.push(parsedUrl);
        continue;
      }
      // It's neither a url token nor a function token named url. So, we skip.
      ++ii;
    }
  }
}

/**
 * Helper class for implementing ExtractImportantProperties.
 * Iterates over all declarations and returns pointers to declarations
 * that were marked with `!important`.
 * @private
 */
class ImportantPropertyVisitor extends RuleVisitor {
  /**
   * @param {!Array<!Declaration>} important
   */
  constructor(important) {
    super();

    /** @type {!Array<!Declaration>} */
    this.important = important;
  }

  /** @inheritDoc */
  visitDeclaration(declaration) {
    if (declaration.important) this.important.push(declaration);
  }
}

/**
 * Extracts the URLs within the provided stylesheet, emitting them into
 * parsedUrls and errors into errors.
 * @param {!Stylesheet} stylesheet
 * @param {!Array<!ParsedCssUrl>} parsedUrls
 * @param {!Array<!tokenize_css.ErrorToken>} errors
 */
const extractUrlsFromStylesheet = function(stylesheet, parsedUrls, errors) {
  const parsedUrlsOldLength = parsedUrls.length;
  const errorsOldLength = errors.length;
  const visitor = new UrlFunctionVisitor(parsedUrls, errors);
  stylesheet.accept(visitor);
  // If anything went wrong, delete the urls we've already emitted.
  if (errorsOldLength !== errors.length) {
    parsedUrls.splice(parsedUrlsOldLength);
  }
};
exports.extractUrlsFromStylesheet = extractUrlsFromStylesheet;

/**
 * Same as the stylesheet variant above, but operates on a single declaration at
 * a time. Usedful when operating on parsed style attributes.
 * @param {!Declaration} declaration
 * @param {!Array<!ParsedCssUrl>} parsedUrls
 * @param {!Array<!tokenize_css.ErrorToken>} errors
 */
const extractUrlsFromDeclaration = function(declaration, parsedUrls, errors) {
  const parsedUrlsOldLength = parsedUrls.length;
  const errorsOldLength = errors.length;
  const visitor = new UrlFunctionVisitor(parsedUrls, errors);
  declaration.accept(visitor);
  // If anything went wrong, delete the urls we've already emitted.
  if (errorsOldLength !== errors.length) {
    parsedUrls.splice(parsedUrlsOldLength);
  }
};
exports.extractUrlsFromDeclaration = extractUrlsFromDeclaration;

/**
 * Extracts the declarations marked `!important` within within the provided
 * stylesheet, emitting them into `important`.
 * @param {!Stylesheet} stylesheet
 * @param {!Array<!Declaration>} important
 */
const extractImportantDeclarations = function(stylesheet, important) {
  const visitor = new ImportantPropertyVisitor(important);
  stylesheet.accept(visitor);
};
exports.extractImportantDeclarations = extractImportantDeclarations;

/**
 * Helper class for implementing parseMediaQueries.
 * @private
 */
class MediaQueryVisitor extends RuleVisitor {
  /**
   * @param {!Array<!tokenize_css.IdentToken>} mediaTypes
   * @param {!Array<!tokenize_css.IdentToken>} mediaFeatures
   * @param {!Array<!tokenize_css.ErrorToken>} errors
   */
  constructor(mediaTypes, mediaFeatures, errors) {
    super();

    /** @type {!Array<!tokenize_css.IdentToken>} */
    this.mediaTypes = mediaTypes;
    /** @type {!Array<!tokenize_css.IdentToken>} */
    this.mediaFeatures = mediaFeatures;
    /** @type {!Array<!tokenize_css.ErrorToken>} */
    this.errors = errors;
  }

  /** @inheritDoc */
  visitAtRule(atRule) {
    if (atRule.name.toLowerCase() !== 'media') {
      return;
    }

    const tokenStream = new TokenStream(atRule.prelude);
    tokenStream.consume();  // Advance to first token.
    if (!this.parseAMediaQueryList_(tokenStream)) {
      this.errors.push(atRule.copyPosTo(new tokenize_css.ErrorToken(
          ValidationError.Code.CSS_SYNTAX_MALFORMED_MEDIA_QUERY, ['style'])));
    }
  }

  /**
   * Maybe consume one whitespace token.
   * @param {!TokenStream} tokenStream
   * @private
   */
  maybeConsumeAWhitespaceToken_(tokenStream) {
    // While the grammar calls for consuming multiple whitespace tokens,
    // our tokenizer already collapses whitespace so only one token can ever
    // be present.
    if (tokenStream.current().tokenType === tokenize_css.TokenType.WHITESPACE) {
      tokenStream.consume();
    }
  }

  /**
   * Parse a media query list
   * @param {!TokenStream} tokenStream
   * @return {boolean}
   * @private
   */
  parseAMediaQueryList_(tokenStream) {
    // https://www.w3.org/TR/css3-mediaqueries/#syntax
    // : S* [media_query [ ',' S* media_query ]* ]?
    // ;
    this.maybeConsumeAWhitespaceToken_(tokenStream);
    if (tokenStream.current().tokenType !== tokenize_css.TokenType.EOF_TOKEN) {
      if (!this.parseAMediaQuery_(tokenStream)) {
        return false;
      }
      while (tokenStream.current().tokenType === tokenize_css.TokenType.COMMA) {
        tokenStream.consume();  // ','
        this.maybeConsumeAWhitespaceToken_(tokenStream);
        if (!this.parseAMediaQuery_(tokenStream)) {
          return false;
        }
      }
    }
    return tokenStream.current().tokenType === tokenize_css.TokenType.EOF_TOKEN;
  }

  /**
   * Parse a media query
   * @param {!TokenStream} tokenStream
   * @return {boolean}
   * @private
   */
  parseAMediaQuery_(tokenStream) {
    // : [ONLY | NOT]? S* media_type S* [ AND S* expression ]*
    // | expression [ AND S* expression ]*
    // ;
    //
    // Below we parse media queries with this equivalent grammar:
    // : (expression | [ONLY | NOT]? S* media_type S* )
    // [ AND S* expression ]*
    // ;
    //
    // This is more convenient because we know that expressions must start with
    // '(', so it's simpler to use as a check to distinguis the expression case
    // from the media type case.
    if (tokenStream.current().tokenType === tokenize_css.TokenType.OPEN_PAREN) {
      if (!this.parseAMediaExpression_(tokenStream)) {
        return false;
      }
    } else {
      if (tokenStream.current().tokenType === tokenize_css.TokenType.IDENT &&
          (
              /** @type {!tokenize_css.IdentToken} */
              (tokenStream.current()).ASCIIMatch('only') ||
              /** @type {!tokenize_css.IdentToken} */
              (tokenStream.current()).ASCIIMatch('not'))) {
        tokenStream.consume();  // 'ONLY' | 'NOT'
      }
      this.maybeConsumeAWhitespaceToken_(tokenStream);
      if (!this.parseAMediaType_(tokenStream)) {
        return false;
      }
      this.maybeConsumeAWhitespaceToken_(tokenStream);
    }
    while (tokenStream.current().tokenType === tokenize_css.TokenType.IDENT &&
           /** @type {!tokenize_css.IdentToken} */
           (tokenStream.current()).ASCIIMatch('and')) {
      tokenStream.consume();  // 'AND'
      this.maybeConsumeAWhitespaceToken_(tokenStream);
      if (!this.parseAMediaExpression_(tokenStream)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Parse a media type
   * @param {!TokenStream} tokenStream
   * @return {boolean}
   * @private
   */
  parseAMediaType_(tokenStream) {
    // : IDENT
    // ;
    if (tokenStream.current().tokenType === tokenize_css.TokenType.IDENT) {
      this.mediaTypes.push(
          /** @type {!tokenize_css.IdentToken} */ (tokenStream.current()));
      tokenStream.consume();
      return true;
    }
    return false;
  }

  /**
   * Parse a media expression
   * @param {!TokenStream} tokenStream
   * @return {boolean}
   * @private
   */
  parseAMediaExpression_(tokenStream) {
    //  : '(' S* media_feature S* [ ':' S* expr ]? ')' S*
    //  ;
    if (tokenStream.current().tokenType !== tokenize_css.TokenType.OPEN_PAREN) {
      return false;
    }
    tokenStream.consume();  // '('
    this.maybeConsumeAWhitespaceToken_(tokenStream);
    if (!this.parseAMediaFeature_(tokenStream)) {
      return false;
    }
    this.maybeConsumeAWhitespaceToken_(tokenStream);
    if (tokenStream.current().tokenType === tokenize_css.TokenType.COLON) {
      tokenStream.consume();  // '('
      this.maybeConsumeAWhitespaceToken_(tokenStream);
      // The CSS3 grammar at this point just tells us to expect some
      // expr. Which tokens are accepted here are defined by the media
      // feature found above. We don't implement media features here, so
      // we just loop over tokens until we find a CLOSE_PAREN or EOF.
      // While expr in general may have arbitrary sets of open/close parens,
      // it seems that https://www.w3.org/TR/css3-mediaqueries/#media1
      // suggests that media features cannot:
      //
      // "Media features only accept single values: one keyword, one number,
      // or a number with a unit identifier. (The only exceptions are the
      // ‘aspect-ratio’ and ‘device-aspect-ratio’ media features.)
      while (tokenStream.current().tokenType !==
                 tokenize_css.TokenType.EOF_TOKEN &&
             tokenStream.current().tokenType !==
                 tokenize_css.TokenType.CLOSE_PAREN) {
        tokenStream.consume();
      }
    }
    if (tokenStream.current().tokenType !==
        tokenize_css.TokenType.CLOSE_PAREN) {
      return false;
    }
    tokenStream.consume();  // ')'
    this.maybeConsumeAWhitespaceToken_(tokenStream);
    return true;
  }

  /**
   * Parse a media feature
   * @param {!TokenStream} tokenStream
   * @return {boolean}
   * @private
   */
  parseAMediaFeature_(tokenStream) {
    // : IDENT
    // ;
    if (tokenStream.current().tokenType === tokenize_css.TokenType.IDENT) {
      this.mediaFeatures.push(
          /** @type {!tokenize_css.IdentToken} */ (tokenStream.current()));
      tokenStream.consume();
      return true;
    }
    return false;
  }
}

/**
 * Parses media queries within the provided stylesheet, emitting the set of
 * discovered media types and media features, as well as errors if parsing
 * failed.
 * parsedUrls and errors into errors.
 * @param {!Stylesheet} stylesheet
 * @param {!Array<!tokenize_css.IdentToken>} mediaTypes
 * @param {!Array<!tokenize_css.IdentToken>} mediaFeatures
 * @param {!Array<!tokenize_css.ErrorToken>} errors
 */
const parseMediaQueries = function(
    stylesheet, mediaTypes, mediaFeatures, errors) {
  const visitor = new MediaQueryVisitor(mediaTypes, mediaFeatures, errors);
  stylesheet.accept(visitor);
};
exports.parseMediaQueries = parseMediaQueries;

/**
 * Abstract super class for CSS Selectors. The Token class, which this
 * class inherits from, has line, col, and tokenType fields.
 */
const Selector = class extends tokenize_css.Token {
  /** @param {function(!Selector)} lambda */
  forEachChild(lambda) {}

  /** @param {!SelectorVisitor} visitor */
  accept(visitor) {}
};
exports.Selector = Selector;

/**
 * A super class for making visitors (by overriding the types of interest). The
 * standard RuleVisitor does not recursively parse the prelude of qualified
 * rules for the components of a selector. This visitor re-parses these preludes
 * and then visits the fields within. The parse step has the possibility of
 * emitting new CSS ErrorTokens
 */
const SelectorVisitor = class extends RuleVisitor {
  /**
   * @param {!Array<!tokenize_css.ErrorToken>} errors
   */
  constructor(errors) {
    super();
    /**
     * @type {!Array<!tokenize_css.ErrorToken>}
     * @private
     */
    this.errors_ = errors;
  }

  /** @param {!QualifiedRule} qualifiedRule */
  visitQualifiedRule(qualifiedRule) {
    const tokenStream = new TokenStream(qualifiedRule.prelude);
    tokenStream.consume();
    const maybeSelector = parseASelectorsGroup(tokenStream);
    if (maybeSelector instanceof tokenize_css.ErrorToken) {
      this.errors_.push(maybeSelector);
      return;
    }

    /** @type {!Array<!Selector>} */
    const toVisit = [maybeSelector];
    while (toVisit.length > 0) {
      /** @type {!Selector} */
      const node = toVisit.shift();
      node.accept(this);
      node.forEachChild(child => {
        toVisit.push(child);
      });
    }
  }

  /** @param {!TypeSelector} typeSelector */
  visitTypeSelector(typeSelector) {}

  /** @param {!IdSelector} idSelector */
  visitIdSelector(idSelector) {}

  /** @param {!AttrSelector} attrSelector */
  visitAttrSelector(attrSelector) {}

  /** @param {!PseudoSelector} pseudoSelector */
  visitPseudoSelector(pseudoSelector) {}

  /** @param {!ClassSelector} classSelector */
  visitClassSelector(classSelector) {}

  /** @param {!SimpleSelectorSequence} sequence */
  visitSimpleSelectorSequence(sequence) {}

  /** @param {!Combinator} combinator */
  visitCombinator(combinator) {}

  /** @param {!SelectorsGroup} group */
  visitSelectorsGroup(group) {}
};
exports.SelectorVisitor = SelectorVisitor;

/**
 * This node models type selectors and universial selectors.
 * http://www.w3.org/TR/css3-selectors/#type-selectors
 * http://www.w3.org/TR/css3-selectors/#universal-selector
 */
const TypeSelector = class extends Selector {
  /**
   * Choices for namespacePrefix:
   * - 'a specific namespace prefix' means 'just that specific namespace'.
   * - '' means 'without a namespace'
   * - '*' means 'any namespace including without a namespace'
   * - null means the default namespace if one is declared, and '*' otherwise.
   *
   * The universal selector is covered by setting the elementName to '*'.
   *
   * @param {?string} namespacePrefix
   * @param {string} elementName
   */
  constructor(namespacePrefix, elementName) {
    super();
    /** @type {?string} */
    this.namespacePrefix = namespacePrefix;
    /** @type {string} */
    this.elementName = elementName;
    /** @type {!tokenize_css.TokenType} */
    this.tokenType = tokenize_css.TokenType.TYPE_SELECTOR;
  }

  /**
   * Serializes the selector to a string (in this case CSS syntax that
   * could be used to recreate it).
   * @return {string}
   */
  toString() {
    if (this.namespacePrefix === null) {
      return this.elementName;
    }
    return this.namespacePrefix + '|' + this.elementName;
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitTypeSelector(this);
  }
};

/** @inheritDoc */
TypeSelector.prototype.toJSON = function() {
  const json = Selector.prototype.toJSON.call(this);
  json['namespacePrefix'] = this.namespacePrefix;
  json['elementName'] = this.elementName;
  return json;
};

/**
 * Helper function for determining whether the provided token is a specific
 * delimiter.
 * @param {!tokenize_css.Token} token
 * @param {string} delimChar
 * @return {boolean}
 */
function isDelim(token, delimChar) {
  return token.tokenType === tokenize_css.TokenType.DELIM &&
      /** @type {!tokenize_css.DelimToken} */ (token).value === delimChar;
}

/**
 * tokenStream.current() is the first token of the type selector.
 * @param {!TokenStream} tokenStream
 * @return {!TypeSelector}
 */
const parseATypeSelector = function(tokenStream) {
  /** @type {?string} */
  let namespacePrefix = null;
  /** @type {string} */
  let elementName = '*';
  const start = tokenStream.current();

  if (isDelim(tokenStream.current(), '|')) {
    namespacePrefix = '';
    tokenStream.consume();
  } else if (
      isDelim(tokenStream.current(), '*') && isDelim(tokenStream.next(), '|')) {
    namespacePrefix = '*';
    tokenStream.consume();
    tokenStream.consume();
  } else if (
      tokenStream.current().tokenType === tokenize_css.TokenType.IDENT &&
      isDelim(tokenStream.next(), '|')) {
    const ident =
        /** @type {!tokenize_css.IdentToken} */ (tokenStream.current());
    namespacePrefix = ident.value;
    tokenStream.consume();
    tokenStream.consume();
  }
  if (isDelim(tokenStream.current(), '*')) {
    elementName = '*';
    tokenStream.consume();
  } else if (tokenStream.current().tokenType === tokenize_css.TokenType.IDENT) {
    const ident =
        /** @type {!tokenize_css.IdentToken} */ (tokenStream.current());
    elementName = ident.value;
    tokenStream.consume();
  }
  return start.copyPosTo(new TypeSelector(namespacePrefix, elementName));
};
exports.parseATypeSelector = parseATypeSelector;

/**
 * An ID selector references some document id.
 * http://www.w3.org/TR/css3-selectors/#id-selectors
 * Typically written as '#foo'.
 */
const IdSelector = class extends Selector {
  /**
   * @param {string} value
   */
  constructor(value) {
    super();
    /** @type {string} */
    this.value = value;
    /** @type {!tokenize_css.TokenType} */
    this.tokenType = tokenize_css.TokenType.ID_SELECTOR;
  }

  /** @return {string} */
  toString() {
    return '#' + this.value;
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitIdSelector(this);
  }
};
/** @inheritDoc */
IdSelector.prototype.toJSON = function() {
  const json = Selector.prototype.toJSON.call(this);
  json['value'] = this.value;
  return json;
};

/**
 * tokenStream.current() must be the hash token.
 * @param {!TokenStream} tokenStream
 * @return {!IdSelector}
 */
const parseAnIdSelector = function(tokenStream) {
  asserts.assert(
      tokenStream.current().tokenType === tokenize_css.TokenType.HASH,
      'Precondition violated: must start with HashToken');
  const hash = /** @type {!tokenize_css.HashToken} */ (tokenStream.current());
  tokenStream.consume();
  return hash.copyPosTo(new IdSelector(hash.value));
};
exports.parseAnIdSelector = parseAnIdSelector;

/**
 * An attribute selector matches document nodes based on their attributes.
 * http://www.w3.org/TR/css3-selectors/#attribute-selectors
 *
 * Typically written as '[foo=bar]'.
 */
const AttrSelector = class extends Selector {
  /**
   * @param {?string} namespacePrefix
   * @param {string} attrName
   * @param {string} matchOperator is either the string
   * representation of the match operator (e.g., '=' or '~=') or '',
   * in which case the attribute selector is a check for the presence
   * of the attribute.
   * @param {string} value is the value to apply the match operator
   * against, or if matchOperator is '', then this must be empty as
   * well.
   */
  constructor(namespacePrefix, attrName, matchOperator, value) {
    super();
    /** @type {?string} */
    this.namespacePrefix = namespacePrefix;
    /** @type {string} */
    this.attrName = attrName;
    /** @type {string} */
    this.matchOperator = matchOperator;
    /** @type {string} */
    this.value = value;
    /** @type {!tokenize_css.TokenType} */
    this.tokenType = tokenize_css.TokenType.ATTR_SELECTOR;
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitAttrSelector(this);
  }
};
exports.AttrSelector = AttrSelector;

/** @inheritDoc */
AttrSelector.prototype.toJSON = function() {
  const json = Selector.prototype.toJSON.call(this);
  json['namespacePrefix'] = this.namespacePrefix;
  json['attrName'] = this.attrName;
  json['matchOperator'] = this.matchOperator;
  json['value'] = this.value;
  return json;
};

/**
 * Helper for parseAnAttrSelector.
 * @private
 * @param {!tokenize_css.Token} start
 * @return {!tokenize_css.ErrorToken}
 */
function newInvalidAttrSelectorError(start) {
  return start.copyPosTo(new tokenize_css.ErrorToken(
      ValidationError.Code.CSS_SYNTAX_INVALID_ATTR_SELECTOR, ['style']));
}

/**
 * tokenStream.current() must be the open square token.
 * @param {!TokenStream} tokenStream
 * @return {!AttrSelector|!tokenize_css.ErrorToken}
 */
function parseAnAttrSelector(tokenStream) {
  asserts.assert(
      tokenStream.current().tokenType === tokenize_css.TokenType.OPEN_SQUARE,
      'Precondition violated: must be an OpenSquareToken');
  const start = tokenStream.current();
  tokenStream.consume();  // Consumes '['.
  if (tokenStream.current().tokenType === tokenize_css.TokenType.WHITESPACE) {
    tokenStream.consume();
  }
  // This part is defined in https://www.w3.org/TR/css3-selectors/#attrnmsp:
  // Attribute selectors and namespaces. It is similar to parseATypeSelector.
  let namespacePrefix = null;
  if (isDelim(tokenStream.current(), '|')) {
    namespacePrefix = '';
    tokenStream.consume();
  } else if (
      isDelim(tokenStream.current(), '*') && isDelim(tokenStream.next(), '|')) {
    namespacePrefix = '*';
    tokenStream.consume();
    tokenStream.consume();
  } else if (
      tokenStream.current().tokenType === tokenize_css.TokenType.IDENT &&
      isDelim(tokenStream.next(), '|')) {
    const ident =
        /** @type {!tokenize_css.IdentToken} */ (tokenStream.current());
    namespacePrefix = ident.value;
    tokenStream.consume();
    tokenStream.consume();
  }
  // Now parse the attribute name. This part is mandatory.
  if (!(tokenStream.current().tokenType === tokenize_css.TokenType.IDENT)) {
    return newInvalidAttrSelectorError(start);
  }
  const ident =
      /** @type {!tokenize_css.IdentToken} */ (tokenStream.current());
  const attrName = ident.value;
  tokenStream.consume();
  if (tokenStream.current().tokenType === tokenize_css.TokenType.WHITESPACE) {
    tokenStream.consume();
  }

  // After the attribute name, we may see an operator; if we do, then
  // we must see either a string or an identifier. This covers
  // 6.3.1 Attribute presence and value selectors
  // (https://www.w3.org/TR/css3-selectors/#attribute-representation) and
  // 6.3.2 Substring matching attribute selectors
  // (https://www.w3.org/TR/css3-selectors/#attribute-substrings).

  /** @type {string} */
  let matchOperator = '';
  const current = tokenStream.current().tokenType;
  if (isDelim(tokenStream.current(), '=')) {
    matchOperator = '=';
    tokenStream.consume();
  } else if (current === tokenize_css.TokenType.INCLUDE_MATCH) {
    matchOperator = '~=';
    tokenStream.consume();
  } else if (current === tokenize_css.TokenType.DASH_MATCH) {
    matchOperator = '|=';
    tokenStream.consume();
  } else if (current === tokenize_css.TokenType.PREFIX_MATCH) {
    matchOperator = '^=';
    tokenStream.consume();
  } else if (current === tokenize_css.TokenType.SUFFIX_MATCH) {
    matchOperator = '$=';
    tokenStream.consume();
  } else if (current === tokenize_css.TokenType.SUBSTRING_MATCH) {
    matchOperator = '*=';
    tokenStream.consume();
  }
  if (tokenStream.current().tokenType === tokenize_css.TokenType.WHITESPACE) {
    tokenStream.consume();
  }
  /** @type {string} */
  let value = '';
  if (matchOperator !== '') {  // If we saw an operator, parse the value.
    const current = tokenStream.current().tokenType;
    if (current === tokenize_css.TokenType.IDENT) {
      const ident =
          /** @type {!tokenize_css.IdentToken} */ (tokenStream.current());
      value = ident.value;
      tokenStream.consume();
    } else if (current === tokenize_css.TokenType.STRING) {
      const str =
          /** @type {!tokenize_css.StringToken} */ (tokenStream.current());
      value = str.value;
      tokenStream.consume();
    }
  }
  if (tokenStream.current().tokenType === tokenize_css.TokenType.WHITESPACE) {
    tokenStream.consume();
  }
  // The attribute selector must in any case terminate with a close square
  // token.
  if (tokenStream.current().tokenType !== tokenize_css.TokenType.CLOSE_SQUARE) {
    return newInvalidAttrSelectorError(start);
  }
  tokenStream.consume();
  const selector =
      new AttrSelector(namespacePrefix, attrName, matchOperator, value);
  return start.copyPosTo(selector);
}

/**
 * @param {!Array<!Object>} array
 * @return {!Array<string>}
 */
function recursiveArrayToJSON(array) {
  const json = [];
  for (const entry of array) {
    json.push(entry.toJSON());
  }
  return json;
}

/**
 * A pseudo selector can match either pseudo classes or pseudo elements.
 * http://www.w3.org/TR/css3-selectors/#pseudo-classes
 * http://www.w3.org/TR/css3-selectors/#pseudo-elements.
 *
 * Typically written as ':visited', ':lang(fr)', and '::first-line'.
 *
 * isClass: Pseudo selectors with a single colon (e.g., ':visited')
 * are pseudo class selectors. Selectors with two colons (e.g.,
 * '::first-line') are pseudo elements.
 *
 * func: If it's a function style pseudo selector, like lang(fr), then func
 * the function tokens. TODO(powdercloud): parse this in more detail.
 */
const PseudoSelector = class extends Selector {
  /**
   * @param {boolean} isClass
   * @param {string} name
   * @param {!Array<!tokenize_css.Token>} func
   */
  constructor(isClass, name, func) {
    super();
    /** @type {boolean} */
    this.isClass = isClass;
    /** @type {string} */
    this.name = name;
    /** @type {!Array<!tokenize_css.Token>} */
    this.func = func;
    /** @type {!tokenize_css.TokenType} */
    this.tokenType = tokenize_css.TokenType.PSEUDO_SELECTOR;
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitPseudoSelector(this);
  }
};
exports.PseudoSelector = PseudoSelector;

/** @inheritDoc */
PseudoSelector.prototype.toJSON = function() {
  const json = Selector.prototype.toJSON.call(this);
  json['isClass'] = this.isClass;
  json['name'] = this.name;
  if (this.func.length !== 0) {
    json['func'] = recursiveArrayToJSON(this.func);
  }
  return json;
};

/**
 * tokenStream.current() must be the ColonToken. Returns an error if
 * the pseudo token can't be parsed (e.g., a lone ':').
 * @param {!TokenStream} tokenStream
 * @return {!PseudoSelector|!tokenize_css.ErrorToken}
 */
function parseAPseudoSelector(tokenStream) {
  asserts.assert(
      tokenStream.current().tokenType === tokenize_css.TokenType.COLON,
      'Precondition violated: must be a ":"');
  const firstColon = tokenStream.current();
  tokenStream.consume();
  let isClass = true;
  if (tokenStream.current().tokenType === tokenize_css.TokenType.COLON) {
    // '::' starts a pseudo element, ':' starts a pseudo class.
    isClass = false;
    tokenStream.consume();
  }
  if (tokenStream.current().tokenType === tokenize_css.TokenType.IDENT) {
    const ident =
        /** @type {!tokenize_css.IdentToken} */ (tokenStream.current());
    const name = ident.value;
    tokenStream.consume();
    return firstColon.copyPosTo(new PseudoSelector(isClass, name, []));
  } else if (
      tokenStream.current().tokenType ===
      tokenize_css.TokenType.FUNCTION_TOKEN) {
    const funcToken =
        /** @type {!tokenize_css.FunctionToken} */ (tokenStream.current());
    /**  @type {!Array<!tokenize_css.ErrorToken>} */
    const errors = [];
    const func = extractAFunction(tokenStream, errors);
    if (errors.length > 0) {
      return errors[0];
    }
    tokenStream.consume();
    return firstColon.copyPosTo(
        new PseudoSelector(isClass, funcToken.value, func));
  } else {
    return firstColon.copyPosTo(new tokenize_css.ErrorToken(
        ValidationError.Code.CSS_SYNTAX_ERROR_IN_PSEUDO_SELECTOR, ['style']));
  }
}

/**
 * A class selector of the form '.value' is a shorthand notation for
 * an attribute match of the form '[class~=value]'.
 * http://www.w3.org/TR/css3-selectors/#class-html
 */
const ClassSelector = class extends Selector {
  /**
   * @param {string} value the class to match.
   */
  constructor(value) {
    super();
    /** @type {string} */
    this.value = value;
    /** @type {!tokenize_css.TokenType} */
    this.tokenType = tokenize_css.TokenType.CLASS_SELECTOR;
  }
  /** @return {string} */
  toString() {
    return '.' + this.value;
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitClassSelector(this);
  }
};
/** @inheritDoc */
ClassSelector.prototype.toJSON = function() {
  const json = Selector.prototype.toJSON.call(this);
  json['value'] = this.value;
  return json;
};

/**
 * tokenStream.current() must be the '.' delimiter token.
 * @param {!TokenStream} tokenStream
 * @return {!ClassSelector}
 */
const parseAClassSelector = function(tokenStream) {
  asserts.assert(
      isDelim(tokenStream.current(), '.') &&
          tokenStream.next().tokenType === tokenize_css.TokenType.IDENT,
      'Precondition violated: must start with "." and follow with ident');
  const dot = tokenStream.current();
  tokenStream.consume();
  const ident =
      /** @type {!tokenize_css.IdentToken} */ (tokenStream.current());
  tokenStream.consume();
  return dot.copyPosTo(new ClassSelector(ident.value));
};
exports.parseAClassSelector = parseAClassSelector;


/**
 * Models a simple selector sequence, e.g. '*|foo#id'.
 */
const SimpleSelectorSequence = class extends Selector {
  /**
   * @param {!TypeSelector} typeSelector
   * @param {!Array<!Selector>} otherSelectors
   */
  constructor(typeSelector, otherSelectors) {
    super();
    /** @type {!TypeSelector} */
    this.typeSelector = typeSelector;
    /** @type {!Array<!Selector>} */
    this.otherSelectors = otherSelectors;
    /** @type {!tokenize_css.TokenType} */
    this.tokenType = tokenize_css.TokenType.SIMPLE_SELECTOR_SEQUENCE;
  }

  /** @inheritDoc */
  forEachChild(lambda) {
    lambda(this.typeSelector);
    for (const other of this.otherSelectors) {
      lambda(other);
    }
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitSimpleSelectorSequence(this);
  }
};
/** @inheritDoc */
SimpleSelectorSequence.prototype.toJSON = function() {
  const json = Selector.prototype.toJSON.call(this);
  json['typeSelector'] = this.typeSelector.toJSON();
  json['otherSelectors'] = recursiveArrayToJSON(this.otherSelectors);
  return json;
};

/**
 * tokenStream.current must be the first token of the sequence.
 * This function will return an error if no selector is found.
 * @param {!TokenStream} tokenStream
 * @return {!SimpleSelectorSequence|!tokenize_css.ErrorToken}
 */
const parseASimpleSelectorSequence = function(tokenStream) {
  const start = tokenStream.current();
  let typeSelector = null;
  if (isDelim(tokenStream.current(), '*') ||
      isDelim(tokenStream.current(), '|') ||
      tokenStream.current().tokenType === tokenize_css.TokenType.IDENT) {
    typeSelector = parseATypeSelector(tokenStream);
  }
  /** @type {!Array<!Selector>} */
  const otherSelectors = [];
  while (true) {
    if (tokenStream.current().tokenType === tokenize_css.TokenType.HASH) {
      otherSelectors.push(parseAnIdSelector(tokenStream));
    } else if (
        isDelim(tokenStream.current(), '.') &&
        tokenStream.next().tokenType === tokenize_css.TokenType.IDENT) {
      otherSelectors.push(parseAClassSelector(tokenStream));
    } else if (
        tokenStream.current().tokenType ===
        tokenize_css.TokenType.OPEN_SQUARE) {
      const maybeAttrSelector = parseAnAttrSelector(tokenStream);
      if (maybeAttrSelector.tokenType === tokenize_css.TokenType.ERROR) {
        return /** @type {!tokenize_css.ErrorToken} */ (maybeAttrSelector);
      }
      otherSelectors.push(
          /** @type {!Selector} */ (maybeAttrSelector));
    } else if (
        tokenStream.current().tokenType === tokenize_css.TokenType.COLON) {
      const maybePseudo = parseAPseudoSelector(tokenStream);
      if (maybePseudo.tokenType === tokenize_css.TokenType.ERROR) {
        return /** @type {!tokenize_css.ErrorToken} */ (maybePseudo);
      }
      otherSelectors.push(/** @type {!Selector} */ (maybePseudo));
      // NOTE: If adding more 'else if' clauses here, be sure to udpate
      // isSimpleSelectorSequenceStart accordingly.
    } else {
      if (typeSelector === null) {
        if (otherSelectors.length == 0) {
          return tokenStream.current().copyPosTo(new tokenize_css.ErrorToken(
              ValidationError.Code.CSS_SYNTAX_MISSING_SELECTOR, ['style']));
        }
        // If no type selector is given then the universal selector is
        // implied.
        typeSelector = start.copyPosTo(new TypeSelector(
            /*namespacePrefix=*/ null, /*elementName=*/ '*'));
      }
      return start.copyPosTo(
          new SimpleSelectorSequence(typeSelector, otherSelectors));
    }
  }
};
exports.parseASimpleSelectorSequence = parseASimpleSelectorSequence;

/**
 * @enum {string}
 */
const CombinatorType = {
  'DESCENDANT': 'DESCENDANT',
  'CHILD': 'CHILD',
  'ADJACENT_SIBLING': 'ADJACENT_SIBLING',
  'GENERAL_SIBLING': 'GENERAL_SIBLING',
};
exports.CombinatorType = CombinatorType;

/**
 * Models a combinator, as described in
 * http://www.w3.org/TR/css3-selectors/#combinators.
 */
const Combinator = class extends Selector {
  /**
   * @param {!CombinatorType} combinatorType
   * @param {!SimpleSelectorSequence|!Combinator} left
   * @param {!SimpleSelectorSequence} right
   */
  constructor(combinatorType, left, right) {
    super();
    /** @type {!CombinatorType} */
    this.combinatorType = combinatorType;
    /** @type {!SimpleSelectorSequence|!Combinator} */
    this.left = left;
    /** @type {!SimpleSelectorSequence} */
    this.right = right;
    /** @type {!tokenize_css.TokenType} */
    this.tokenType = tokenize_css.TokenType.COMBINATOR;
  }

  /** @inheritDoc */
  forEachChild(lambda) {
    lambda(this.left);
    lambda(this.right);
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitCombinator(this);
  }
};
exports.Combinator = Combinator;

/** @inheritDoc */
Combinator.prototype.toJSON = function() {
  const json = Selector.prototype.toJSON.call(this);
  json['combinatorType'] = this.combinatorType;
  json['left'] = this.left.toJSON();
  json['right'] = this.right.toJSON();
  return json;
};

/**
 * The CombinatorType for a given token; helper function used when
 * constructing a Combinator instance.
 * @param {!tokenize_css.Token} token
 * @return {!CombinatorType}
 */
function combinatorTypeForToken(token) {
  if (token.tokenType === tokenize_css.TokenType.WHITESPACE) {
    return CombinatorType.DESCENDANT;
  } else if (isDelim(token, '>')) {
    return CombinatorType.CHILD;
  } else if (isDelim(token, '+')) {
    return CombinatorType.ADJACENT_SIBLING;
  } else if (isDelim(token, '~')) {
    return CombinatorType.GENERAL_SIBLING;
  }
  asserts.fail('Internal Error: not a combinator token');
}

/**
 * Whether or not the provided token could be the start of a simple
 * selector sequence. See the simple_selector_sequence production in
 * http://www.w3.org/TR/css3-selectors/#grammar.
 * @param {!tokenize_css.Token} token
 * @return {boolean}
 */
function isSimpleSelectorSequenceStart(token) {
  // Type selector start.
  if (isDelim(token, '*') || isDelim(token, '|') ||
      (token.tokenType === tokenize_css.TokenType.IDENT)) {
    return true;
  }
  // Id selector start.
  if (token.tokenType === tokenize_css.TokenType.HASH) {
    return true;
  }
  // Class selector start.
  if (isDelim(token, '.')) {
    return true;
  }
  // Attr selector start.
  if (token.tokenType === tokenize_css.TokenType.OPEN_SQUARE) {
    return true;
  }
  // A pseudo selector.
  if (token.tokenType === tokenize_css.TokenType.COLON) {
    return true;
  }
  // TODO(johannes): add the others.
  return false;
}

/**
 * The selector production from
 * http://www.w3.org/TR/css3-selectors/#grammar
 * Returns an ErrorToken if no selector is found.
 * @param {!TokenStream} tokenStream
 * @return {!SimpleSelectorSequence|
 *          !Combinator|!tokenize_css.ErrorToken}
 */
const parseASelector = function(tokenStream) {
  if (!isSimpleSelectorSequenceStart(tokenStream.current())) {
    return tokenStream.current().copyPosTo(new tokenize_css.ErrorToken(
        ValidationError.Code.CSS_SYNTAX_NOT_A_SELECTOR_START, ['style']));
  }
  const parsed = parseASimpleSelectorSequence(tokenStream);
  if (parsed.tokenType === tokenize_css.TokenType.ERROR) {
    return parsed;
  }
  let left = /** @type {!SimpleSelectorSequence}*/ (parsed);
  while (true) {
    // Consume whitespace in front of combinators, while being careful
    // to not eat away the infamous "whitespace operator" (sigh, haha).
    if ((tokenStream.current().tokenType ===
         tokenize_css.TokenType.WHITESPACE) &&
        !isSimpleSelectorSequenceStart(tokenStream.next())) {
      tokenStream.consume();
    }
    // If present, grab the combinator token which we'll use for line
    // / column info.
    if (!(((tokenStream.current().tokenType ===
            tokenize_css.TokenType.WHITESPACE) &&
           isSimpleSelectorSequenceStart(tokenStream.next())) ||
          isDelim(tokenStream.current(), '+') ||
          isDelim(tokenStream.current(), '>') ||
          isDelim(tokenStream.current(), '~'))) {
      return left;
    }
    const combinatorToken = tokenStream.current();
    tokenStream.consume();
    if (tokenStream.current().tokenType === tokenize_css.TokenType.WHITESPACE) {
      tokenStream.consume();
    }
    const right = parseASimpleSelectorSequence(tokenStream);
    if (right.tokenType === tokenize_css.TokenType.ERROR) {
      return right;  // TODO(johannes): more than one error / partial tree.
    }
    left = combinatorToken.copyPosTo(new Combinator(
        combinatorTypeForToken(combinatorToken), left,
        /** @type {!SimpleSelectorSequence} */ (right)));
  }
};
exports.parseASelector = parseASelector;

/**
 * Models a selectors group, as described in
 * http://www.w3.org/TR/css3-selectors/#grouping.
 */
const SelectorsGroup = class extends Selector {
  /**
   * @param {!Array<!SimpleSelectorSequence|
   *         !Combinator>} elements
   */
  constructor(elements) {
    super();
    /**
       @type {!Array<!SimpleSelectorSequence|
        !Combinator>}
     */
    this.elements = elements;
    /** @type {!tokenize_css.TokenType} */
    this.tokenType = tokenize_css.TokenType.SELECTORS_GROUP;
  }

  /** @inheritDoc */
  forEachChild(lambda) {
    for (const child of this.elements) {
      lambda(child);
    }
  }

  /** @param {!SelectorVisitor} visitor */
  accept(visitor) {
    visitor.visitSelectorsGroup(this);
  }
};
/** @inheritDoc */
SelectorsGroup.prototype.toJSON = function() {
  const json = Selector.prototype.toJSON.call(this);
  json['elements'] = recursiveArrayToJSON(this.elements);
  return json;
};

/**
 * The selectors_group production from
 * http://www.w3.org/TR/css3-selectors/#grammar.
 * In addition, this parsing routine checks that no input remains,
 * that is, after parsing the production we reached the end of |token_stream|.
 * @param {!TokenStream} tokenStream
 * @return {!SelectorsGroup|!tokenize_css.ErrorToken}
 */
const parseASelectorsGroup = function(tokenStream) {
  if (!isSimpleSelectorSequenceStart(tokenStream.current())) {
    return tokenStream.current().copyPosTo(new tokenize_css.ErrorToken(
        ValidationError.Code.CSS_SYNTAX_NOT_A_SELECTOR_START, ['style']));
  }
  const start = tokenStream.current();
  const elements = [parseASelector(tokenStream)];
  if (elements[0].tokenType === tokenize_css.TokenType.ERROR) {
    return elements[0];
  }
  while (true) {
    if (tokenStream.current().tokenType === tokenize_css.TokenType.WHITESPACE) {
      tokenStream.consume();
    }
    if (tokenStream.current().tokenType === tokenize_css.TokenType.COMMA) {
      tokenStream.consume();
      if (tokenStream.current().tokenType ===
          tokenize_css.TokenType.WHITESPACE) {
        tokenStream.consume();
      }
      elements.push(parseASelector(tokenStream));
      if (elements[elements.length - 1].tokenType ===
          tokenize_css.TokenType.ERROR) {
        return elements[elements.length - 1];
      }
      continue;
    }
    // We're about to claim success and return a selector,
    // but before we do, we check that no unparsed input remains.
    if (!(tokenStream.current().tokenType ===
          tokenize_css.TokenType.EOF_TOKEN)) {
      return tokenStream.current().copyPosTo(new tokenize_css.ErrorToken(
          ValidationError.Code.CSS_SYNTAX_UNPARSED_INPUT_REMAINS_IN_SELECTOR,
          ['style']));
    }
    if (elements.length == 1) {
      return elements[0];
    }
    return start.copyPosTo(new SelectorsGroup(elements));
  }
};
exports.parseASelectorsGroup = parseASelectorsGroup;
