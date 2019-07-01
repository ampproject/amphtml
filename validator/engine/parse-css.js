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
goog.provide('parse_css.AtRule');
goog.provide('parse_css.BlockType');
goog.provide('parse_css.Declaration');
goog.provide('parse_css.ParsedCssUrl');
goog.provide('parse_css.QualifiedRule');
goog.provide('parse_css.Rule');
goog.provide('parse_css.RuleVisitor');
goog.provide('parse_css.Stylesheet');
goog.provide('parse_css.TokenStream');
goog.provide('parse_css.extractAFunction');
goog.provide('parse_css.extractASimpleBlock');
goog.provide('parse_css.extractUrls');
goog.provide('parse_css.parseAStylesheet');
goog.provide('parse_css.parseInlineStyle');
goog.provide('parse_css.parseMediaQueries');
goog.provide('parse_css.stripMinMax');
goog.provide('parse_css.stripVendorPrefix');
goog.require('amp.validator.ValidationError.Code');
goog.require('goog.asserts');
goog.require('goog.string');
goog.require('parse_css.EOFToken');
goog.require('parse_css.ErrorToken');
goog.require('parse_css.TRIVIAL_EOF_TOKEN');
goog.require('parse_css.TRIVIAL_ERROR_TOKEN');
goog.require('parse_css.Token');
goog.require('parse_css.TokenType');

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
parse_css.TokenStream = class {
  /**
   * @param {!Array<!parse_css.Token>} tokens
   */
  constructor(tokens) {
    goog.asserts.assert(
        tokens.length > 0,
        'Internal Error: empty TokenStream - must have EOF token');
    goog.asserts.assert(
        tokens[tokens.length - 1].tokenType === parse_css.TokenType.EOF_TOKEN,
        'Internal Error: TokenStream must end with EOF');

    /** @type {!Array<!parse_css.Token>} */
    this.tokens = tokens;
    /** @type {number} */
    this.pos = -1;
  }

  /**
   * Returns the token at an absolute position in the token stream.
   *
   * @param {number} num
   * @return {!parse_css.Token}
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
   * @return {!parse_css.Token}
   */
  current() {
    return this.tokenAt(this.pos);
  }

  /**
   * Returns the token at the next position in the token stream.
   * @return {!parse_css.Token}
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

/**
 * Strips vendor prefixes from identifiers, e.g. property names or names
 * of at rules. E.g., "-moz-keyframes" -> "keyframes".
 * @param {string} prefixedString
 * @return {string}
 */
parse_css.stripVendorPrefix = function(prefixedString) {
  // Checking for '-' is an optimization.
  if (prefixedString !== '' && prefixedString[0] === '-') {
    if (goog.string./*OK*/ startsWith(prefixedString, '-o-'))
    {return prefixedString.substr('-o-'.length);}
    if (goog.string./*OK*/ startsWith(prefixedString, '-moz-'))
    {return prefixedString.substr('-moz-'.length);}
    if (goog.string./*OK*/ startsWith(prefixedString, '-ms-'))
    {return prefixedString.substr('-ms-'.length);}
    if (goog.string./*OK*/ startsWith(prefixedString, '-webkit-'))
    {return prefixedString.substr('-webkit-'.length);}
  }
  return prefixedString;
};

/**
 * Strips 'min-' or 'max-' from the start of a media feature identifier, if
 * present. E.g., "min-width" -> "width".
 * @param {string} prefixedString
 * @return {string}
 */
parse_css.stripMinMax = function(prefixedString) {
  if (goog.string./*OK*/ startsWith(prefixedString, 'min-')) {
    return prefixedString.substr('min-'.length);
  }
  if (goog.string./*OK*/ startsWith(prefixedString, 'max-')) {
    return prefixedString.substr('max-'.length);
  }
  return prefixedString;
};

/**
 * Returns a Stylesheet object with nested parse_css.Rules.
 *
 * The top level Rules in a Stylesheet are always a series of
 * QualifiedRule's or AtRule's.
 *
 * @param {!Array<!parse_css.Token>} tokenList
 * @param {!Object<string,parse_css.BlockType>} atRuleSpec block type rules for
 * all CSS AT rules this canonicalizer should handle.
 * @param {parse_css.BlockType} defaultSpec default block type for types not
 * found in atRuleSpec.
 * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
 * @return {!parse_css.Stylesheet}
 */
parse_css.parseAStylesheet = function(
  tokenList, atRuleSpec, defaultSpec, errors) {
  const canonicalizer = new Canonicalizer(atRuleSpec, defaultSpec);
  const stylesheet = new parse_css.Stylesheet();

  stylesheet.rules =
      canonicalizer.parseAListOfRules(tokenList, /* topLevel */ true, errors);
  tokenList[0].copyPosTo(stylesheet);
  const eof = /** @type {!parse_css.EOFToken} */
      (tokenList[tokenList.length - 1]);
  stylesheet.eof = eof;

  return stylesheet;
};

/**
 * Returns a array of Declaration objects.
 *
 * @param {!Array<!parse_css.Token>} tokenList
 * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
 * @return {!Array<!parse_css.Declaration>}
 */
parse_css.parseInlineStyle = function(tokenList, errors) {
  const canonicalizer =
      new Canonicalizer({}, parse_css.BlockType.PARSE_AS_DECLARATIONS);
  return canonicalizer.parseAListOfDeclarations(tokenList, errors);
};

/**
 * Abstract super class for the parser rules.
 */
parse_css.Rule = class extends parse_css.Token {
  constructor() {
    super();
    /** @type {parse_css.TokenType} */
    this.tokenType = parse_css.TokenType.UNKNOWN;
  }

  /** @param {!parse_css.RuleVisitor} visitor */
  accept(visitor) {}

  /**
   * @param {number=} opt_indent
   * @return {string}
   */
  toString(opt_indent) {
    return JSON.stringify(this.toJSON(), null, opt_indent);
  }
};

parse_css.Stylesheet = class extends parse_css.Rule {
  constructor() {
    super();
    /** @type {!Array<!parse_css.Rule>} */
    this.rules = [];
    /** @type {?parse_css.EOFToken} */
    this.eof = null;
    /** @type {parse_css.TokenType} */
    this.tokenType = parse_css.TokenType.STYLESHEET;
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
/** @inheritDoc */
parse_css.Stylesheet.prototype.toJSON = function() {
  const json = parse_css.Rule.prototype.toJSON.call(this);
  json['rules'] = arrayToJSON(this.rules);
  json['eof'] = this.eof.toJSON();
  return json;
};

parse_css.AtRule = class extends parse_css.Rule {
  /**
   * @param {string} name
   */
  constructor(name) {
    super();
    /** @type {string} */
    this.name = name;
    /** @type {!Array<!parse_css.Token>} */
    this.prelude = [];
    /** @type {!Array<!parse_css.Rule>} */
    this.rules = [];
    /** @type {!Array<!parse_css.Declaration>} */
    this.declarations = [];
    /** @type {parse_css.TokenType} */
    this.tokenType = parse_css.TokenType.AT_RULE;
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
/** @inheritDoc */
parse_css.AtRule.prototype.toJSON = function() {
  const json = parse_css.Rule.prototype.toJSON.call(this);
  json['name'] = this.name;
  json['prelude'] = arrayToJSON(this.prelude);
  json['rules'] = arrayToJSON(this.rules);
  json['declarations'] = arrayToJSON(this.declarations);
  return json;
};

parse_css.QualifiedRule = class extends parse_css.Rule {
  constructor() {
    super();
    /** @type {!Array<!parse_css.Token>} */
    this.prelude = [];
    /** @type {!Array<!parse_css.Declaration>} */
    this.declarations = [];
    /** @type {parse_css.TokenType} */
    this.tokenType = parse_css.TokenType.QUALIFIED_RULE;
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
/** @inheritDoc */
parse_css.QualifiedRule.prototype.toJSON = function() {
  const json = parse_css.Rule.prototype.toJSON.call(this);
  json['prelude'] = arrayToJSON(this.prelude);
  json['declarations'] = arrayToJSON(this.declarations);
  return json;
};

/** @return {string} The concatenation of the qualified rule name. */
parse_css.QualifiedRule.prototype.ruleName = function() {
  let ruleName = '';
  for (let i = 0; i < this.prelude.length; ++i) {
    const prelude =
    /** @type {!parse_css.IdentToken} */ (this.prelude[i]);
    if (prelude.value) {ruleName += prelude.value;}
  }
  return ruleName;
};

parse_css.Declaration = class extends parse_css.Rule {
  /**
   * @param {string} name
   */
  constructor(name) {
    super();
    /** @type {string} */
    this.name = name;
    /** @type {!Array<!parse_css.Token>} */
    this.value = [];
    /** @type {boolean} */
    this.important = false;
    /** @type {parse_css.TokenType} */
    this.tokenType = parse_css.TokenType.DECLARATION;
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
    if (this.value[0].tokenType === parse_css.TokenType.IDENT) {
      return /** @type {!parse_css.StringValuedToken} */ (this.value[0]).value;
    }
    if (this.value.length >= 2 &&
        (this.value[0].tokenType === parse_css.TokenType.WHITESPACE) &&
        this.value[1].tokenType === parse_css.TokenType.IDENT) {
      return /** @type {!parse_css.StringValuedToken} */ (this.value[1]).value;
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
parse_css.Declaration.prototype.toJSON = function() {
  const json = parse_css.Rule.prototype.toJSON.call(this);
  json['name'] = this.name;
  json['important'] = this.important;
  json['value'] = arrayToJSON(this.value);
  return json;
};

/**
 * A visitor for Rule subclasses (StyleSheet, AtRule, QualifiedRule,
 * Declaration). Pass this to the Rule::Accept method.
 * Visitation order is to call the Visit* method on the current node,
 * then visit the children, then call the Leave* method on the current node.
 */
parse_css.RuleVisitor = class {
  constructor() {}

  /** @param {!parse_css.Stylesheet} stylesheet */
  visitStylesheet(stylesheet) {}

  /** @param {!parse_css.Stylesheet} stylesheet */
  leaveStylesheet(stylesheet) {}

  /** @param {!parse_css.AtRule} atRule */
  visitAtRule(atRule) {}

  /** @param {!parse_css.AtRule} atRule */
  leaveAtRule(atRule) {}

  /** @param {!parse_css.QualifiedRule} qualifiedRule */
  visitQualifiedRule(qualifiedRule) {}

  /** @param {!parse_css.QualifiedRule} qualifiedRule */
  leaveQualifiedRule(qualifiedRule) {}

  /** @param {!parse_css.Declaration} declaration */
  visitDeclaration(declaration) {}

  /** @param {!parse_css.Declaration} declaration */
  leaveDeclaration(declaration) {}
};

/**
 * Enum describing how to parse the rules inside a CSS AT Rule.
 * @enum {string}
 */
parse_css.BlockType = {
  // Parse this simple block as a list of rules
  // (Either Qualified Rules or AT Rules)
  'PARSE_AS_RULES': 'PARSE_AS_RULES',
  // Parse this simple block as a list of declarations
  'PARSE_AS_DECLARATIONS': 'PARSE_AS_DECLARATIONS',
  // Ignore this simple block, do not parse. This is generally used
  // in conjunction with a later step emitting an error for this rule.
  'PARSE_AS_IGNORE': 'PARSE_AS_IGNORE',
};

/**
 * A canonicalizer is created with a specific spec for canonicalizing CSS AT
 * rules. It otherwise has no state.
 * @private
 */
class Canonicalizer {
  /**
   * @param {!Object<string,parse_css.BlockType>} atRuleSpec block
   * type rules for all CSS AT rules this canonicalizer should handle.
   * @param {parse_css.BlockType} defaultSpec default block type for
   * types not found in atRuleSpec.
   */
  constructor(atRuleSpec, defaultSpec) {
    /**
     * @type {!Object<string,parse_css.BlockType>}
     * @private
     */
    this.atRuleSpec_ = atRuleSpec;
    /**
     * @type {parse_css.BlockType}
     * @private
     */
    this.defaultAtRuleSpec_ = defaultSpec;
  }

  /**
   * Returns a type telling us how to canonicalize a given AT rule's block.
   * @param {!parse_css.AtRule} atRule
   * @return {!parse_css.BlockType}
   */
  blockTypeFor(atRule) {
    const maybeBlockType =
        this.atRuleSpec_[parse_css.stripVendorPrefix(atRule.name)];
    if (maybeBlockType !== undefined) {
      return maybeBlockType;
    } else {
      return this.defaultAtRuleSpec_;
    }
  }

  /**
   * Parses and returns a list of rules, such as at the top level of a stylesheet.
   * Return list has only QualifiedRule's and AtRule's as top level elements.
   * @param {!Array<!parse_css.Token>} tokenList
   * @param {boolean} topLevel
   * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
   * @return {!Array<!parse_css.Rule>}
   */
  parseAListOfRules(tokenList, topLevel, errors) {
    const tokenStream = new parse_css.TokenStream(tokenList);
    const rules = [];
    while (true) {
      tokenStream.consume();
      const current = tokenStream.current().tokenType;
      if (current === parse_css.TokenType.WHITESPACE) {
        continue;
      } else if (current === parse_css.TokenType.EOF_TOKEN) {
        return rules;
      } else if (
        current === parse_css.TokenType.CDO ||
          current === parse_css.TokenType.CDC) {
        if (topLevel) {
          continue;
        }
        this.parseAQualifiedRule(tokenStream, rules, errors);
      } else if (current === parse_css.TokenType.AT_KEYWORD) {
        rules.push(this.parseAnAtRule(tokenStream, errors));
      } else {
        this.parseAQualifiedRule(tokenStream, rules, errors);
      }
    }
  }

  /**
   * Parses an At Rule.
   *
   * @param {!parse_css.TokenStream} tokenStream
   * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
   * @return {!parse_css.AtRule}
   */
  parseAnAtRule(tokenStream, errors) {
    goog.asserts.assert(
        tokenStream.current().tokenType === parse_css.TokenType.AT_KEYWORD,
        'Internal Error: parseAnAtRule precondition not met');

    const startToken =
    /** @type {!parse_css.AtKeywordToken} */ (tokenStream.current());
    const rule = new parse_css.AtRule(startToken.value);
    startToken.copyPosTo(rule);

    while (true) {
      tokenStream.consume();
      const current = tokenStream.current().tokenType;
      if (current === parse_css.TokenType.SEMICOLON ||
          current === parse_css.TokenType.EOF_TOKEN) {
        rule.prelude.push(tokenStream.current());
        return rule;
      }
      if (current === parse_css.TokenType.OPEN_CURLY) {
        rule.prelude.push(
            tokenStream.current().copyPosTo(new parse_css.EOFToken()));

        /** @type {!Array<!parse_css.Token>} */
        const contents = parse_css.extractASimpleBlock(tokenStream, errors);

        switch (this.blockTypeFor(rule)) {
          case parse_css.BlockType.PARSE_AS_RULES: {
            rule.rules =
                this.parseAListOfRules(contents, /* topLevel */ false, errors);
            break;
          }
          case parse_css.BlockType.PARSE_AS_DECLARATIONS: {
            rule.declarations = this.parseAListOfDeclarations(contents, errors);
            break;
          }
          case parse_css.BlockType.PARSE_AS_IGNORE: {
            break;
          }
          default: {
            goog.asserts.fail(
                'Unrecognized blockType ' + this.blockTypeFor(rule));
            break;
          }
        }
        return rule;
      }
      if (!consumeAComponentValue(tokenStream, rule.prelude, /*depth*/0))
      {errors.push(tokenStream.current().copyPosTo(
          new parse_css.ErrorToken(
              amp.validator.ValidationError.Code.CSS_EXCESSIVELY_NESTED,
              ['style'])));}
    }
  }

  /**
   * Parses one Qualified rule or ErrorToken appended to either rules or errors
   * respectively. Rule will include a prelude with the CSS selector (if any)
   * and a list of declarations.
   *
   * @param {!parse_css.TokenStream} tokenStream
   * @param {!Array<!parse_css.Rule>} rules output array for new rule
   * @param {!Array<!parse_css.ErrorToken>} errors output array for new error.
   */
  parseAQualifiedRule(tokenStream, rules, errors) {
    goog.asserts.assert(
        tokenStream.current().tokenType !== parse_css.TokenType.EOF_TOKEN &&
            tokenStream.current().tokenType !== parse_css.TokenType.AT_KEYWORD,
        'Internal Error: parseAQualifiedRule precondition not met');

    const rule = tokenStream.current().copyPosTo(new parse_css.QualifiedRule());
    tokenStream.reconsume();
    while (true) {
      tokenStream.consume();
      const current = tokenStream.current().tokenType;
      if (current === parse_css.TokenType.EOF_TOKEN) {
        errors.push(rule.copyPosTo(new parse_css.ErrorToken(
            amp.validator.ValidationError.Code
                .CSS_SYNTAX_EOF_IN_PRELUDE_OF_QUALIFIED_RULE,
            ['style'])));
        return;
      }
      if (current === parse_css.TokenType.OPEN_CURLY) {
        rule.prelude.push(
            tokenStream.current().copyPosTo(new parse_css.EOFToken()));

        // This consumes declarations (ie: "color: red;" ) inside
        // a qualified rule as that rule's value.
        rule.declarations = this.parseAListOfDeclarations(
            parse_css.extractASimpleBlock(tokenStream, errors), errors);

        rules.push(rule);
        return;
      }
      // This consumes a CSS selector as the rules prelude.
      if (!consumeAComponentValue(tokenStream, rule.prelude, /*depth*/0))
      {errors.push(tokenStream.current().copyPosTo(
          new parse_css.ErrorToken(
              amp.validator.ValidationError.Code.CSS_EXCESSIVELY_NESTED,
              ['style'])));}
    }
  }

  /**
   * @param {!Array<!parse_css.Token>} tokenList
   * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
   * @return {!Array<!parse_css.Declaration>}
   */
  parseAListOfDeclarations(tokenList, errors) {
    /** @type {!Array<!parse_css.Declaration>} */
    const decls = [];
    const tokenStream = new parse_css.TokenStream(tokenList);
    while (true) {
      tokenStream.consume();
      const current = tokenStream.current().tokenType;
      if (current === parse_css.TokenType.WHITESPACE ||
          current === parse_css.TokenType.SEMICOLON) {
        continue;
      } else if (current === parse_css.TokenType.EOF_TOKEN) {
        return decls;
      } else if (current === parse_css.TokenType.AT_KEYWORD) {
        // The CSS3 Parsing spec allows for AT rules inside lists of
        // declarations, but our grammar does not so we deviate a tiny bit here.
        // We consume an AT rule, but drop it and instead push an error token.
        const atRule = this.parseAnAtRule(tokenStream, errors);
        errors.push(atRule.copyPosTo(new parse_css.ErrorToken(
            amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_AT_RULE,
            ['style', atRule.name])));
      } else if (current === parse_css.TokenType.IDENT) {
        this.parseADeclaration(tokenStream, decls, errors);
      } else {
        errors.push(tokenStream.current().copyPosTo(new parse_css.ErrorToken(
            amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_DECLARATION,
            ['style'])));
        tokenStream.reconsume();
        while (
          !(tokenStream.next().tokenType === parse_css.TokenType.SEMICOLON ||
              tokenStream.next().tokenType === parse_css.TokenType.EOF_TOKEN)) {
          tokenStream.consume();
          const dummyTokenList = [];
          if (!consumeAComponentValue(tokenStream, dummyTokenList, /*depth*/0))
          {errors.push(tokenStream.current().copyPosTo(
              new parse_css.ErrorToken(
                  amp.validator.ValidationError.Code.CSS_EXCESSIVELY_NESTED,
                  ['style'])));}
        }
      }
    }
  }

  /**
   * Adds one element to either declarations or errors.
   * @param {!parse_css.TokenStream} tokenStream
   * @param {!Array<!parse_css.Declaration>} declarations output array for
   * declarations
   * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
   */
  parseADeclaration(tokenStream, declarations, errors) {
    goog.asserts.assert(
        tokenStream.current().tokenType === parse_css.TokenType.IDENT,
        'Internal Error: parseADeclaration precondition not met');

    const startToken =
    /** @type {!parse_css.IdentToken} */ (tokenStream.current());
    const decl =
        startToken.copyPosTo(new parse_css.Declaration(startToken.value));

    while (tokenStream.next().tokenType === parse_css.TokenType.WHITESPACE) {
      tokenStream.consume();
    }

    tokenStream.consume();
    if (!(tokenStream.current().tokenType === parse_css.TokenType.COLON)) {
      errors.push(startToken.copyPosTo(new parse_css.ErrorToken(
          amp.validator.ValidationError.Code.CSS_SYNTAX_INCOMPLETE_DECLARATION,
          ['style'])));
      tokenStream.reconsume();
      while (
        !(tokenStream.next().tokenType === parse_css.TokenType.SEMICOLON ||
            tokenStream.next().tokenType === parse_css.TokenType.EOF_TOKEN)) {
        tokenStream.consume();
      }
      return;
    }

    while (
      !(tokenStream.next().tokenType === parse_css.TokenType.SEMICOLON ||
          tokenStream.next().tokenType === parse_css.TokenType.EOF_TOKEN)) {
      tokenStream.consume();
      if (!consumeAComponentValue(tokenStream, decl.value, /*depth*/0))
      {errors.push(tokenStream.current().copyPosTo(
          new parse_css.ErrorToken(
              amp.validator.ValidationError.Code.CSS_EXCESSIVELY_NESTED,
              ['style'])));}
    }
    decl.value.push(tokenStream.next().copyPosTo(new parse_css.EOFToken()));

    let foundImportant = false;
    for (let i = decl.value.length - 1; i >= 0; i--) {
      if (decl.value[i].tokenType === parse_css.TokenType.WHITESPACE) {
        continue;
      } else if (
        decl.value[i].tokenType === parse_css.TokenType.IDENT &&
          /** @type {parse_css.IdentToken} */
          (decl.value[i]).ASCIIMatch('important')) {
        foundImportant = true;
      } else if (
        foundImportant &&
          decl.value[i].tokenType === parse_css.TokenType.DELIM &&
        /** @type {parse_css.DelimToken} */ (decl.value[i]).value === '!') {
        decl.value.splice(i, decl.value.length);
        decl.important = true;
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
 * @param {!parse_css.TokenStream} tokenStream
 * @param {!Array<!parse_css.Token>} tokenList output array for tokens.
 * @param {number} depth
 * @return {boolean}
 */
function consumeAComponentValue(tokenStream, tokenList, depth) {
  if (depth > kMaximumCssRecursion) {return false;}
  const current = tokenStream.current().tokenType;
  if (current === parse_css.TokenType.OPEN_CURLY ||
      current === parse_css.TokenType.OPEN_SQUARE ||
      current === parse_css.TokenType.OPEN_PAREN) {
    if (!consumeASimpleBlock(tokenStream, tokenList, depth + 1))
    {return false;}
  } else if (current === parse_css.TokenType.FUNCTION_TOKEN) {
    if (!consumeAFunction(tokenStream, tokenList, depth + 1))
    {return false;}
  } else {
    tokenList.push(tokenStream.current());
  }
  return true;
}

/**
 * Appends a simple block's contents to a tokenList, consuming from
 * the stream all those tokens that it adds to the tokenList,
 * including the start/end grouping token. If exceeds depth, returns false.
 * @param {!parse_css.TokenStream} tokenStream
 * @param {!Array<!parse_css.Token>} tokenList output array for tokens.
 * @param {number} depth
 * @return {boolean}
 */
function consumeASimpleBlock(tokenStream, tokenList, depth) {
  if (depth > kMaximumCssRecursion) {return false;}
  const current = tokenStream.current().tokenType;
  goog.asserts.assert(
      (current === parse_css.TokenType.OPEN_CURLY ||
       current === parse_css.TokenType.OPEN_SQUARE ||
       current === parse_css.TokenType.OPEN_PAREN),
      'Internal Error: consumeASimpleBlock precondition not met');

  const startToken =
  /** @type {!parse_css.GroupingToken} */ (tokenStream.current());
  const {mirror} = startToken;

  tokenList.push(startToken);
  while (true) {
    tokenStream.consume();
    const current = tokenStream.current().tokenType;
    if (current === parse_css.TokenType.EOF_TOKEN) {
      tokenList.push(tokenStream.current());
      return true;
    } else if (
      (current === parse_css.TokenType.CLOSE_CURLY ||
         current === parse_css.TokenType.CLOSE_SQUARE ||
         current === parse_css.TokenType.CLOSE_PAREN) &&
      /** @type {parse_css.GroupingToken} */ (tokenStream.current()).value ===
            mirror) {
      tokenList.push(tokenStream.current());
      return true;
    } else {
      if (!consumeAComponentValue(tokenStream, tokenList, depth + 1))
      {return false;}
    }
  }
}

/**
 * Returns a simple block's contents in tokenStream, excluding the
 * start/end grouping token, and appended with an EOFToken.
 * @param {!parse_css.TokenStream} tokenStream
 * @param {!Array<!parse_css.ErrorToken>} errors
 * @return {!Array<!parse_css.Token>}
 */
parse_css.extractASimpleBlock = function(tokenStream, errors) {
  /** @type {!Array<!parse_css.Token>} */
  const consumedTokens = [];
  if (!consumeASimpleBlock(tokenStream, consumedTokens, /*depth*/0)) {
    errors.push(tokenStream.current().copyPosTo(
        new parse_css.ErrorToken(
            amp.validator.ValidationError.Code.CSS_EXCESSIVELY_NESTED,
            ['style'])));
  }

  // A simple block always has a start token (e.g. '{') and
  // either a closing token or EOF token.
  goog.asserts.assert(consumedTokens.length >= 2);

  // Exclude the start token. Convert end token to EOF.
  const end = consumedTokens.length - 1;
  consumedTokens[end] = consumedTokens[end].copyPosTo(new parse_css.EOFToken());
  return consumedTokens.slice(1);
};

/**
 * Appends a function's contents to a tokenList, consuming from the
 * stream all those tokens that it adds to the tokenList, including
 * the function token and end grouping token. If exceeds depth, returns false.
 * @param {!parse_css.TokenStream} tokenStream
 * @param {!Array<!parse_css.Token>} tokenList output array for tokens.
 * @param {number} depth
 * @return {boolean}
 */
function consumeAFunction(tokenStream, tokenList, depth) {
  if (depth > kMaximumCssRecursion) {return false;}
  goog.asserts.assert(
      tokenStream.current().tokenType === parse_css.TokenType.FUNCTION_TOKEN,
      'Internal Error: consumeAFunction precondition not met');
  tokenList.push(tokenStream.current());
  while (true) {
    tokenStream.consume();
    const current = tokenStream.current().tokenType;
    if (current === parse_css.TokenType.EOF_TOKEN ||
        current === parse_css.TokenType.CLOSE_PAREN) {
      tokenList.push(tokenStream.current());
      return true;
    } else {
      if (!consumeAComponentValue(tokenStream, tokenList, depth + 1))
      {return false;}
    }
  }
}

/**
 * Returns a function's contents in tokenList, including the leading
 * FunctionToken, but excluding the trailing CloseParen token and
 * appended with an EOFToken instead.
 * @param {!parse_css.TokenStream} tokenStream
 * @param {!Array<!parse_css.ErrorToken>} errors
 * @return {!Array<!parse_css.Token>}
 */
parse_css.extractAFunction = function(tokenStream, errors) {
  /** @type {!Array<!parse_css.Token>} */
  const consumedTokens = [];
  if (!consumeAFunction(tokenStream, consumedTokens, /*depth*/0)) {
    errors.push(tokenStream.current().copyPosTo(
        new parse_css.ErrorToken(
            amp.validator.ValidationError.Code.CSS_EXCESSIVELY_NESTED,
            ['style'])));
  }

  // A function always has a start FunctionToken and
  // either a CloseParenToken or EOFToken.
  goog.asserts.assert(consumedTokens.length >= 2);

  // Convert end token to EOF.
  const end = consumedTokens.length - 1;
  consumedTokens[end] = consumedTokens[end].copyPosTo(new parse_css.EOFToken());
  return consumedTokens;
};

/**
 * Used by parse_css.ExtractUrls to return urls it has seen. This represents
 * URLs in CSS such as url(http://foo.com/) and url("http://bar.com/").
 * For this token, line() and col() indicate the position information
 * of the left-most CSS token that's part of the URL. E.g., this would be
 * the URLToken instance or the FunctionToken instance.
 */
parse_css.ParsedCssUrl = class extends parse_css.Token {
  constructor() {
    super();
    /** @type {parse_css.TokenType} */
    this.tokenType = parse_css.TokenType.PARSED_CSS_URL;
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
/** @inheritDoc */
parse_css.ParsedCssUrl.prototype.toJSON = function() {
  const json = parse_css.Token.prototype.toJSON.call(this);
  json['utf8Url'] = this.utf8Url;
  json['atRuleScope'] = this.atRuleScope;
  return json;
};

/**
 * Parses a CSS URL token; typically takes the form "url(http://foo)".
 * Preconditions: tokens[token_idx] is a URL token
 *                and token_idx + 1 is in range.
 * @param {!Array<!parse_css.Token>} tokens
 * @param {number} tokenIdx
 * @param {!parse_css.ParsedCssUrl} parsed
 */
function parseUrlToken(tokens, tokenIdx, parsed) {
  goog.asserts.assert(tokenIdx + 1 < tokens.length);
  const token = tokens[tokenIdx];
  goog.asserts.assert(token.tokenType === parse_css.TokenType.URL);
  token.copyPosTo(parsed);
  parsed.utf8Url = /** @type {parse_css.URLToken}*/ (token).value;
}

/**
 * Parses a CSS function token named 'url', including the string and closing
 * paren. Typically takes the form "url('http://foo')".
 * Returns the token_idx past the closing paren, or -1 if parsing fails.
 * Preconditions: tokens[token_idx] is a URL token
 *                and tokens[token_idx]->StringValue() == "url"
 * @param {!Array<!parse_css.Token>} tokens
 * @param {number} tokenIdx
 * @param {!parse_css.ParsedCssUrl} parsed
 * @return {number}
 */
function parseUrlFunction(tokens, tokenIdx, parsed) {
  const token = tokens[tokenIdx];
  goog.asserts.assert(token.tokenType == parse_css.TokenType.FUNCTION_TOKEN);
  goog.asserts.assert(
      /** @type {parse_css.FunctionToken} */ (token).value === 'url');
  goog.asserts.assert(
      tokens[tokens.length - 1].tokenType === parse_css.TokenType.EOF_TOKEN);
  token.copyPosTo(parsed);
  ++tokenIdx; // We've digested the function token above.
  // Safe: tokens ends w/ EOF_TOKEN.
  goog.asserts.assert(tokenIdx < tokens.length);

  // Consume optional whitespace.
  while (tokens[tokenIdx].tokenType === parse_css.TokenType.WHITESPACE) {
    ++tokenIdx;
    // Safe: tokens ends w/ EOF_TOKEN.
    goog.asserts.assert(tokenIdx < tokens.length);
  }

  // Consume URL.
  if (tokens[tokenIdx].tokenType !== parse_css.TokenType.STRING) {
    return -1;
  }
  parsed.utf8Url =
    /** @type {parse_css.StringToken} */ (tokens[tokenIdx]).value;

  ++tokenIdx;
  // Safe: tokens ends w/ EOF_TOKEN.
  goog.asserts.assert(tokenIdx < tokens.length);

  // Consume optional whitespace.
  while (tokens[tokenIdx].tokenType === parse_css.TokenType.WHITESPACE) {
    ++tokenIdx;
    // Safe: tokens ends w/ EOF_TOKEN.
    goog.asserts.assert(tokenIdx < tokens.length);
  }

  // Consume ')'
  if (tokens[tokenIdx].tokenType !== parse_css.TokenType.CLOSE_PAREN) {
    return -1;
  }
  return tokenIdx + 1;
}

/**
 * Helper class for implementing parse_css.extractUrls.
 * @private
 */
class UrlFunctionVisitor extends parse_css.RuleVisitor {
  /**
   * @param {!Array<!parse_css.ParsedCssUrl>} parsedUrls
   * @param {!Array<!parse_css.ErrorToken>} errors
   */
  constructor(parsedUrls, errors) {
    super();

    /** @type {!Array<!parse_css.ParsedCssUrl>} */
    this.parsedUrls = parsedUrls;
    /** @type {!Array<!parse_css.ErrorToken>} */
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
    goog.asserts.assert(declaration.value.length > 0);
    goog.asserts.assert(
        declaration.value[declaration.value.length - 1].tokenType ===
        parse_css.TokenType.EOF_TOKEN);
    for (let ii = 0; ii < declaration.value.length - 1;) {
      const token = declaration.value[ii];
      if (token.tokenType === parse_css.TokenType.URL) {
        const parsedUrl = new parse_css.ParsedCssUrl();
        parseUrlToken(declaration.value, ii, parsedUrl);
        parsedUrl.atRuleScope = this.atRuleScope;
        this.parsedUrls.push(parsedUrl);
        ++ii;
        continue;
      }
      if (token.tokenType === parse_css.TokenType.FUNCTION_TOKEN &&
      /** @type {!parse_css.FunctionToken} */ (token).value === 'url') {
        const parsedUrl = new parse_css.ParsedCssUrl();
        ii = parseUrlFunction(declaration.value, ii, parsedUrl);
        if (ii === -1) {
          this.errors.push(token.copyPosTo(new parse_css.ErrorToken(
              amp.validator.ValidationError.Code.CSS_SYNTAX_BAD_URL,
              ['style'])));
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
 * Extracts the URLs within the provided stylesheet, emitting them into
 * parsedUrls and errors into errors.
 * @param {!parse_css.Stylesheet} stylesheet
 * @param {!Array<!parse_css.ParsedCssUrl>} parsedUrls
 * @param {!Array<!parse_css.ErrorToken>} errors
 */
parse_css.extractUrls = function(stylesheet, parsedUrls, errors) {
  const parsedUrlsOldLength = parsedUrls.length;
  const errorsOldLength = errors.length;
  const visitor = new UrlFunctionVisitor(parsedUrls, errors);
  stylesheet.accept(visitor);
  // If anything went wrong, delete the urls we've already emitted.
  if (errorsOldLength !== errors.length) {
    parsedUrls.splice(parsedUrlsOldLength);
  }
};

/**
 * Helper class for implementing parse_css.parseMediaQueries.
 * @private
 */
class MediaQueryVisitor extends parse_css.RuleVisitor {
  /**
   * @param {!Array<!parse_css.IdentToken>} mediaTypes
   * @param {!Array<!parse_css.IdentToken>} mediaFeatures
   * @param {!Array<!parse_css.ErrorToken>} errors
   */
  constructor(mediaTypes, mediaFeatures, errors) {
    super();

    /** @type {!Array<!parse_css.IdentToken>} */
    this.mediaTypes = mediaTypes;
    /** @type {!Array<!parse_css.IdentToken>} */
    this.mediaFeatures = mediaFeatures;
    /** @type {!Array<!parse_css.ErrorToken>} */
    this.errors = errors;
  }

  /** @inheritDoc */
  visitAtRule(atRule) {
    if (atRule.name.toLowerCase() !== 'media') {return;}

    const tokenStream = new parse_css.TokenStream(atRule.prelude);
    tokenStream.consume(); // Advance to first token.
    if (!this.parseAMediaQueryList_(tokenStream)) {
      this.errors.push(atRule.copyPosTo(new parse_css.ErrorToken(
          amp.validator.ValidationError.Code.CSS_SYNTAX_MALFORMED_MEDIA_QUERY,
          ['style'])));
    }
  }

  /**
   * Maybe consume one whitespace token.
   * @param {!parse_css.TokenStream} tokenStream
   * @private
   */
  maybeConsumeAWhitespaceToken_(tokenStream) {
    // While the grammar calls for consuming multiple whitespace tokens,
    // our tokenizer already collapses whitespace so only one token can ever
    // be present.
    if (tokenStream.current().tokenType === parse_css.TokenType.WHITESPACE)
    {tokenStream.consume();}
  }

  /**
   * Parse a media query list
   * @param {!parse_css.TokenStream} tokenStream
   * @return {boolean}
   * @private
   */
  parseAMediaQueryList_(tokenStream) {
    // https://www.w3.org/TR/css3-mediaqueries/#syntax
    // : S* [media_query [ ',' S* media_query ]* ]?
    // ;
    this.maybeConsumeAWhitespaceToken_(tokenStream);
    if (tokenStream.current().tokenType !== parse_css.TokenType.EOF_TOKEN) {
      if (!this.parseAMediaQuery_(tokenStream)) {return false;}
      while (tokenStream.current().tokenType === parse_css.TokenType.COMMA) {
        tokenStream.consume(); // ','
        this.maybeConsumeAWhitespaceToken_(tokenStream);
        if (!this.parseAMediaQuery_(tokenStream)) {return false;}
      }
    }
    return tokenStream.current().tokenType === parse_css.TokenType.EOF_TOKEN;
  }

  /**
   * Parse a media query
   * @param {!parse_css.TokenStream} tokenStream
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
    if (tokenStream.current().tokenType === parse_css.TokenType.OPEN_PAREN) {
      if (!this.parseAMediaExpression_(tokenStream)) {return false;}
    } else {
      if (tokenStream.current().tokenType === parse_css.TokenType.IDENT &&
          (
            /** @type {parse_css.IdentToken} */
            (tokenStream.current()).ASCIIMatch('only') ||
              /** @type {parse_css.IdentToken} */
              (tokenStream.current()).ASCIIMatch('not'))) {
        tokenStream.consume(); // 'ONLY' | 'NOT'
      }
      this.maybeConsumeAWhitespaceToken_(tokenStream);
      if (!this.parseAMediaType_(tokenStream)) {return false;}
      this.maybeConsumeAWhitespaceToken_(tokenStream);
    }
    while (tokenStream.current().tokenType === parse_css.TokenType.IDENT &&
           /** @type {parse_css.IdentToken} */
           (tokenStream.current()).ASCIIMatch('and')) {
      tokenStream.consume(); // 'AND'
      this.maybeConsumeAWhitespaceToken_(tokenStream);
      if (!this.parseAMediaExpression_(tokenStream)) {return false;}
    }
    return true;
  }

  /**
   * Parse a media type
   * @param {!parse_css.TokenStream} tokenStream
   * @return {boolean}
   * @private
   */
  parseAMediaType_(tokenStream) {
    // : IDENT
    // ;
    if (tokenStream.current().tokenType === parse_css.TokenType.IDENT) {
      this.mediaTypes.push(
          /** @type {!parse_css.IdentToken} */ (tokenStream.current()));
      tokenStream.consume();
      return true;
    }
    return false;
  }

  /**
   * Parse a media expression
   * @param {!parse_css.TokenStream} tokenStream
   * @return {boolean}
   * @private
   */
  parseAMediaExpression_(tokenStream) {
    //  : '(' S* media_feature S* [ ':' S* expr ]? ')' S*
    //  ;
    if (tokenStream.current().tokenType !== parse_css.TokenType.OPEN_PAREN)
    {return false;}
    tokenStream.consume(); // '('
    this.maybeConsumeAWhitespaceToken_(tokenStream);
    if (!this.parseAMediaFeature_(tokenStream)) {return false;}
    this.maybeConsumeAWhitespaceToken_(tokenStream);
    if (tokenStream.current().tokenType === parse_css.TokenType.COLON) {
      tokenStream.consume(); // '('
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
      while (
        tokenStream.current().tokenType !== parse_css.TokenType.EOF_TOKEN &&
          tokenStream.current().tokenType !== parse_css.TokenType.CLOSE_PAREN)
      {tokenStream.consume();}
    }
    if (tokenStream.current().tokenType !== parse_css.TokenType.CLOSE_PAREN)
    {return false;}
    tokenStream.consume(); // ')'
    this.maybeConsumeAWhitespaceToken_(tokenStream);
    return true;
  }

  /**
   * Parse a media feature
   * @param {!parse_css.TokenStream} tokenStream
   * @return {boolean}
   * @private
   */
  parseAMediaFeature_(tokenStream) {
    // : IDENT
    // ;
    if (tokenStream.current().tokenType === parse_css.TokenType.IDENT) {
      this.mediaFeatures.push(
          /** @type {!parse_css.IdentToken} */ (tokenStream.current()));
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
 * @param {!parse_css.Stylesheet} stylesheet
 * @param {!Array<!parse_css.IdentToken>} mediaTypes
 * @param {!Array<!parse_css.IdentToken>} mediaFeatures
 * @param {!Array<!parse_css.ErrorToken>} errors
 */
parse_css.parseMediaQueries = function(
  stylesheet, mediaTypes, mediaFeatures, errors) {
  const visitor = new MediaQueryVisitor(mediaTypes, mediaFeatures, errors);
  stylesheet.accept(visitor);
};
