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
goog.provide('parse_css.CSSParserRule');
goog.provide('parse_css.Declaration');
goog.provide('parse_css.QualifiedRule');
goog.provide('parse_css.Stylesheet');
goog.provide('parse_css.TokenStream');
goog.provide('parse_css.extractAFunction');
goog.provide('parse_css.extractASimpleBlock');
goog.provide('parse_css.parseAStylesheet');

goog.require('goog.asserts');
goog.require('parse_css.tokenize');

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
 * A TokenStream is essentially an array of CSSParserToken objects
 * with a reference to a current position. Consume/Reconsume methods
 * move the current position. tokenAt, current, and next inspect tokens
 * at specific points.
 *
 * @param {!Array<!parse_css.CSSParserToken>} tokens
 * @export
 * @constructor
 */
parse_css.TokenStream = function(tokens) {
  /** @type {!Array<!parse_css.CSSParserToken>} */
  this.tokens = tokens;
  goog.asserts.assert(this.tokens.length > 0,
      'Internal Error: empty TokenStream - must have EOF token');
  goog.asserts.assertInstanceof(
      this.tokens[tokens.length - 1], parse_css.EOFToken,
      'Internal Error: TokenStream must end with EOF');
  this.pos = -1;
};

/**
 * Returns the token at an absolute position in the token stream.
 *
 * @param {number} num
 * @return {!parse_css.CSSParserToken}
 */
parse_css.TokenStream.prototype.tokenAt = function(num) {
  // The last token is guaranteed to be the EOF token (with correct
  // line / col!) so any request past the length of the array
  // fetches that.
  return (num < this.tokens.length) ?
      this.tokens[num] : this.tokens[this.tokens.length - 1];
};

/**
 * Returns the token at the current position in the token stream.
 * @return {!parse_css.CSSParserToken}
 */
parse_css.TokenStream.prototype.current = function() {
  return this.tokenAt(this.pos);
};

/**
 * Returns the token at the next position in the token stream.
 * @return {!parse_css.CSSParserToken}
 */
parse_css.TokenStream.prototype.next = function() {
  return this.tokenAt(this.pos + 1);
};

/**
 * Advances the stream by one.
 * @export
 */
parse_css.TokenStream.prototype.consume = function() {
  this.pos++;
};

/** Rewinds to the previous position in the input. */
parse_css.TokenStream.prototype.reconsume = function() {
  this.pos--;
};

/**
 * Creates an EOF token at the same line/col as the given token,
 * used for breaking up a list of tokens.
 * @param {!parse_css.CSSParserToken} positionToken
 * @return {!parse_css.EOFToken}
 */
function createEOFTokenAt(positionToken) {
  const eof = new parse_css.EOFToken;
  eof.line = positionToken.line;
  eof.col = positionToken.col;
  return eof;
}

/**
 * Creates a ParseError token at the same line/col as the given token.
 * @param {!parse_css.CSSParserToken} positionToken
 * @param {string} detail
 * @return {!parse_css.ErrorToken}
 */
function createParseErrorTokenAt(positionToken, detail) {
  const error = new parse_css.ErrorToken(parse_css.ErrorType.PARSING, detail);
  error.line = positionToken.line;
  error.col = positionToken.col;
  return error;
}

/**
 * Returns a Stylesheet object with nested parse_css.CSSParserRules.
 *
 * The top level CSSParserRules in a Stylesheet are always a series of
 * QualifiedRule's or AtRule's.
 *
 * @param {!Array<!parse_css.CSSParserToken>} tokenList
 * @param {!Object<string,parse_css.BlockType>} atRuleSpec block type rules for
 * all CSS AT rules this canonicalizer should handle.
 * @param {parse_css.BlockType} defaultSpec default block type for types not
 * found in atRuleSpec.
 * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
 * @return {!parse_css.Stylesheet}
 * @export
 */
parse_css.parseAStylesheet = function(
    tokenList, atRuleSpec, defaultSpec, errors) {
  const canonicalizer = new Canonicalizer(atRuleSpec, defaultSpec);
  const stylesheet = new parse_css.Stylesheet();

  stylesheet.rules = canonicalizer.parseAListOfRules(
      tokenList, /* topLevel */ true, errors);
  stylesheet.line = tokenList[0].line;
  stylesheet.col = tokenList[0].col;
  const eof = /** @type {!parse_css.EOFToken} */
      (tokenList[tokenList.length - 1]);
  stylesheet.eof = eof;

  return stylesheet;
};

/**
 * Abstract super class for the parser rules.
 * @constructor
 * @extends {parse_css.CSSParserToken}
 */
parse_css.CSSParserRule = function() {
  goog.base(this);
};
goog.inherits(parse_css.CSSParserRule, parse_css.CSSParserToken);

/** @type {string} */
parse_css.CSSParserRule.tokenType = 'abstract';

/**
 * @param {number=} opt_indent
 * @return {string}
 */
parse_css.CSSParserRule.prototype.toString = function(opt_indent) {
  return JSON.stringify(this.toJSON(), null, opt_indent);
};

/**
 * @constructor
 * @extends {parse_css.CSSParserRule}
 */
parse_css.Stylesheet = function() {
  goog.base(this);
  /** @type {!Array<!parse_css.CSSParserRule>} */
  this.rules = [];
  /** @type {?parse_css.EOFToken} */
  this.eof = null;
};
goog.inherits(parse_css.Stylesheet, parse_css.CSSParserRule);

/** @type {string} */
parse_css.Stylesheet.prototype.tokenType = 'STYLESHEET';

/** @return {!Object} */
parse_css.Stylesheet.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['rules'] = arrayToJSON(this.rules);
  json['eof'] = this.eof.toJSON();
  return json;
};

/**
 * @param {string} name
 * @constructor
 * @extends {parse_css.CSSParserRule}
 */
parse_css.AtRule = function(name) {
  goog.base(this);
  /** @type {string} */
  this.name = name;
  /** @type {!Array<!parse_css.CSSParserToken>} */
  this.prelude = [];
  /** @type {!Array<!parse_css.CSSParserRule>} */
  this.rules = [];
  /** @type {!Array<!parse_css.Declaration>} */
  this.declarations = [];
};
goog.inherits(parse_css.AtRule, parse_css.CSSParserRule);

/** @type {string} */
parse_css.AtRule.prototype.tokenType = 'AT_RULE';

/** @return {!Object} */
parse_css.AtRule.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['name'] = this.name;
  json['prelude'] = arrayToJSON(this.prelude);
  json['rules'] = arrayToJSON(this.rules);
  json['declarations'] = arrayToJSON(this.declarations);
  return json;
};

/**
 * @constructor
 * @extends {parse_css.CSSParserRule}
 */
parse_css.QualifiedRule = function() {
  goog.base(this);
  /** @type {!Array<!parse_css.CSSParserToken>} */
  this.prelude = [];
  /** @type {!Array<!parse_css.Declaration>} */
  this.declarations = [];
};
goog.inherits(parse_css.QualifiedRule, parse_css.CSSParserRule);

/** @type {string} */
parse_css.QualifiedRule.prototype.tokenType = 'QUALIFIED_RULE';

/** @return {!Object} */
parse_css.QualifiedRule.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['prelude'] = arrayToJSON(this.prelude);
  json['declarations'] = arrayToJSON(this.declarations);
  return json;
};

/**
 * @param {string} name
 * @constructor
 * @extends {parse_css.CSSParserRule}
 */
parse_css.Declaration = function(name) {
  goog.base(this);
  /** @type {string} */
  this.name = name;
  /** @type {!Array<!parse_css.CSSParserToken>} */
  this.value = [];
  /** @type {boolean} */
  this.important = false;
};
goog.inherits(parse_css.Declaration, parse_css.CSSParserRule);

/** @type {string} */
parse_css.Declaration.prototype.tokenType = 'DECLARATION';

/** @return {!Object} */
parse_css.Declaration.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['name'] = this.name;
  json['important'] = this.important;
  json['value'] = arrayToJSON(this.value);
  return json;
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
  'PARSE_AS_IGNORE': 'PARSE_AS_IGNORE'
};

/**
 * A canonicalizer is created with a specific spec for canonicalizing CSS AT
 * rules. It otherwise has no state.
 * @param {!Object<string,parse_css.BlockType>} atRuleSpec block type rules for
 * all CSS AT rules this canonicalizer should handle.
 * @param {parse_css.BlockType} defaultSpec default block type for types not
 * found in atRuleSpec.
 * @constructor
 */
const Canonicalizer = function Canonicalizer(atRuleSpec, defaultSpec) {
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
};

/**
 * Returns a type telling us how to canonicalize a given AT rule's block.
 * @param {!parse_css.AtRule} atRule
 * @return {!parse_css.BlockType}
 */
Canonicalizer.prototype.blockTypeFor = function(atRule) {
  const maybeBlockType = this.atRuleSpec_[atRule.name];
  if (maybeBlockType !== undefined) {
    return maybeBlockType;
  } else {
    return this.defaultAtRuleSpec_;
  }
};

/**
 * Parses and returns a list of rules, such as at the top level of a stylesheet.
 * Return list has only QualifiedRule's and AtRule's as top level elements.
 * @param {!Array<!parse_css.CSSParserToken>} tokenList
 * @param {boolean} topLevel
 * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
 * @return {!Array<!parse_css.CSSParserRule>}
 */
Canonicalizer.prototype.parseAListOfRules = function(
    tokenList, topLevel, errors) {
  const tokenStream = new parse_css.TokenStream(tokenList);
  const rules = [];
  while (true) {
    tokenStream.consume();
    if (tokenStream.current() instanceof parse_css.WhitespaceToken) {
      continue;
    } else if (tokenStream.current() instanceof parse_css.EOFToken) {
      return rules;
    } else if (tokenStream.current() instanceof parse_css.CDOToken ||
               tokenStream.current() instanceof parse_css.CDCToken) {
      if (topLevel) {
        continue;
      }
      this.parseAQualifiedRule(tokenStream, rules, errors);
    } else if (tokenStream.current() instanceof parse_css.AtKeywordToken) {
      rules.push(this.parseAnAtRule(tokenStream, errors));
    } else {
      this.parseAQualifiedRule(tokenStream, rules, errors);
    }
  }
};

/**
 * Parses an At Rule.
 *
 * @param {!parse_css.TokenStream} tokenStream
 * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
 * @return {!parse_css.AtRule}
 */
Canonicalizer.prototype.parseAnAtRule = function(tokenStream, errors) {
  goog.asserts.assertInstanceof(tokenStream.current(), parse_css.AtKeywordToken,
      'Internal Error: parseAnAtRule precondition not met');

  const startToken =
      /** @type {!parse_css.AtKeywordToken} */ (tokenStream.current());
  const rule = new parse_css.AtRule(startToken.value);
  rule.line = startToken.line;
  rule.col = startToken.col;

  while (true) {
    tokenStream.consume();
    if (tokenStream.current() instanceof parse_css.SemicolonToken ||
        tokenStream.current() instanceof parse_css.EOFToken) {
      rule.prelude.push(tokenStream.current());
      return rule;
    }
    if (tokenStream.current() instanceof parse_css.OpenCurlyToken) {
      rule.prelude.push(createEOFTokenAt(tokenStream.current()));

      const contents = parse_css.extractASimpleBlock(tokenStream);

      switch (this.blockTypeFor(rule)) {
        case parse_css.BlockType.PARSE_AS_RULES:
          rule.rules = this.parseAListOfRules(
              contents, /* topLevel */ false, errors);
          break;
        case parse_css.BlockType.PARSE_AS_DECLARATIONS:
          rule.declarations = this.parseAListOfDeclarations(contents, errors);
          break;
        case parse_css.BlockType.PARSE_AS_IGNORE:
          break;
        default:
          goog.asserts.fail(
              'Unrecognized blockType ' + this.blockTypeFor(rule));
          break;
      }

      return rule;
    }
    consumeAComponentValue(tokenStream, rule.prelude);
  }
};

/**
 * Parses one Qualified rule or ErrorToken appended to either rules or errors
 * respectively. Rule will include a prelude with the CSS selector (if any)
 * and a list of declarations.
 *
 * @param {!parse_css.TokenStream} tokenStream
 * @param {!Array<!parse_css.CSSParserRule>} rules output array for new rule
 * @param {!Array<!parse_css.ErrorToken>} errors output array for new error.
 */
Canonicalizer.prototype.parseAQualifiedRule = function(
    tokenStream, rules, errors) {
  goog.asserts.assert(
      !(tokenStream.current() instanceof parse_css.EOFToken) &&
      !(tokenStream.current() instanceof parse_css.AtKeywordToken),
      'Internal Error: parseAQualifiedRule precondition not met');

  const rule = new parse_css.QualifiedRule();
  rule.line = tokenStream.current().line;
  rule.col = tokenStream.current().col;
  tokenStream.reconsume();
  while (true) {
    tokenStream.consume();
    if (tokenStream.current() instanceof parse_css.EOFToken) {
      errors.push(createParseErrorTokenAt(rule,
          'Hit EOF when trying to parse the prelude of a qualified rule.'));
      return;
    }
    if (tokenStream.current() instanceof parse_css.OpenCurlyToken) {
      rule.prelude.push(createEOFTokenAt(tokenStream.current()));

      // This consumes declarations (ie: "color: red;" ) inside
      // a qualified rule as that rule's value.
      rule.declarations = this.parseAListOfDeclarations(
          parse_css.extractASimpleBlock(tokenStream), errors);

      rules.push(rule);
      return;
    }
    // This consumes a CSS selector as the rules prelude.
    consumeAComponentValue(tokenStream, rule.prelude);
  }
};

/**
 * @param {!Array<!parse_css.CSSParserToken>} tokenList
 * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
 * @return {!Array<!parse_css.Declaration>}
 */
Canonicalizer.prototype.parseAListOfDeclarations = function(tokenList, errors) {
  /** @type {!Array<!parse_css.Declaration>} */
  const decls = [];
  const tokenStream = new parse_css.TokenStream(tokenList);
  while (true) {
    tokenStream.consume();
    if (tokenStream.current() instanceof parse_css.WhitespaceToken ||
        tokenStream.current() instanceof parse_css.SemicolonToken) {
      continue;
    } else if (tokenStream.current() instanceof parse_css.EOFToken) {
      return decls;
    } else if (tokenStream.current() instanceof parse_css.AtKeywordToken) {
      // The CSS3 Parsing spec allows for AT rules inside lists of
      // declarations, but our grammar does not so we deviate a tiny bit here.
      // We consume an AT rule, but drop it and instead push an error token.
      const atRule = this.parseAnAtRule(tokenStream, errors);
      errors.push(createParseErrorTokenAt(atRule,
            '@' + atRule.name + ' found inside declaration'));
    } else if (tokenStream.current() instanceof parse_css.IdentToken) {
      this.parseADeclaration(tokenStream, decls, errors);
    } else {
      errors.push(createParseErrorTokenAt(
          tokenStream.current(), 'Invalid Declaration'));
      tokenStream.reconsume();
      while (!(tokenStream.next() instanceof parse_css.SemicolonToken ||
               tokenStream.next() instanceof parse_css.EOFToken)) {
        tokenStream.consume();
        const dummyTokenList = [];
        consumeAComponentValue(tokenStream, dummyTokenList);
      }
    }
  }
};

/**
 * Adds one element to either declarations or errors.
 * @param {!parse_css.TokenStream} tokenStream
 * @param {!Array<!parse_css.Declaration>} declarations output array for
 * declarations
 * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
 */
Canonicalizer.prototype.parseADeclaration = function(
    tokenStream, declarations, errors) {
  goog.asserts.assertInstanceof(tokenStream.current(), parse_css.IdentToken,
      'Internal Error: parseADeclaration precondition not met');

  const startToken =
      /** @type {!parse_css.IdentToken} */ (tokenStream.current());
  const decl = new parse_css.Declaration(startToken.value);
  decl.line = startToken.line;
  decl.col = startToken.col;

  while (tokenStream.next() instanceof parse_css.WhitespaceToken) {
    tokenStream.consume();
  }

  tokenStream.consume();
  if (!(tokenStream.current() instanceof parse_css.ColonToken)) {
    errors.push(createParseErrorTokenAt(startToken, 'Incomplete declaration'));
    tokenStream.reconsume();
    while (!(tokenStream.next() instanceof parse_css.SemicolonToken ||
             tokenStream.next() instanceof parse_css.EOFToken)) {
      tokenStream.consume();
    }
    return;
  }

  while (!(tokenStream.next() instanceof parse_css.SemicolonToken ||
           tokenStream.next() instanceof parse_css.EOFToken)) {
    tokenStream.consume();
    consumeAComponentValue(tokenStream, decl.value);
  }
  decl.value.push(createEOFTokenAt(tokenStream.next()));

  let foundImportant = false;
  for (let i = decl.value.length - 1; i >= 0; i--) {
    if (decl.value[i] instanceof parse_css.WhitespaceToken) {
      continue;
    } else if (decl.value[i] instanceof parse_css.IdentToken &&
               decl.value[i].ASCIIMatch('important')) {
      foundImportant = true;
    } else if (foundImportant &&
               decl.value[i] instanceof parse_css.DelimToken &&
               decl.value[i].value === '!') {
      decl.value.splice(i, decl.value.length);
      decl.important = true;
      break;
    } else {
      break;
    }
  }

  declarations.push(decl);
};

/**
 * Consumes one or more tokens from a tokenStream, appending them to a
 * tokenList.
 * @param {!parse_css.TokenStream} tokenStream
 * @param {!Array<!parse_css.CSSParserToken>} tokenList output array for tokens.
 */
function consumeAComponentValue(tokenStream, tokenList) {
  if (tokenStream.current() instanceof parse_css.OpenCurlyToken ||
      tokenStream.current() instanceof parse_css.OpenSquareToken ||
      tokenStream.current() instanceof parse_css.OpenParenToken) {
    consumeASimpleBlock(tokenStream, tokenList);
  } else if (tokenStream.current() instanceof parse_css.FunctionToken) {
    consumeAFunction(tokenStream, tokenList);
  } else {
    tokenList.push(tokenStream.current());
  }
}

/**
 * consumeASimpleBlock appends a simple block's contents to a tokenList,
 * consuming from the stream all those tokens that it adds to the tokenList,
 * including the start/end grouping token.
 * @param {!parse_css.TokenStream} tokenStream
 * @param {!Array<!parse_css.CSSParserToken>} tokenList output array for tokens.
 */
function consumeASimpleBlock(tokenStream, tokenList) {
  goog.asserts.assert(
    (tokenStream.current() instanceof parse_css.OpenCurlyToken ||
     tokenStream.current() instanceof parse_css.OpenSquareToken ||
     tokenStream.current() instanceof parse_css.OpenParenToken),
    'Internal Error: consumeASimpleBlock precondition not met');

  const startToken =
      /** @type {!parse_css.GroupingToken} */ (tokenStream.current());
  const mirror = startToken.mirror;

  tokenList.push(startToken);
  while (true) {
    tokenStream.consume();
    if (tokenStream.current() instanceof parse_css.EOFToken) {
      tokenList.push(tokenStream.current());
      return;
    } else if (tokenStream.current() instanceof parse_css.GroupingToken &&
               tokenStream.current().value === mirror) {
      tokenList.push(tokenStream.current());
      return;
    } else {
      consumeAComponentValue(tokenStream, tokenList);
    }
  }
}

/**
 * extractASimpleBlock returns a simple block's contents in tokenList,
 * excluding the start/end grouping token, and appended with an EOFToken.
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!Array<!parse_css.CSSParserToken>}
 */
parse_css.extractASimpleBlock = function(tokenStream) {
  /** @type {!Array<!parse_css.CSSParserToken>} */
  const consumedTokens = [];
  consumeASimpleBlock(tokenStream, consumedTokens);
  // A simple block always has a start token (e.g. '{') and
  // either a closing token or EOF token.
  goog.asserts.assert(consumedTokens.length >= 2);

  // Exclude the start token. Convert end token to EOF.
  /** @type {!Array<!parse_css.CSSParserToken>} */
  const tokenList = consumedTokens.slice(1, -1);
  tokenList.push(createEOFTokenAt(consumedTokens[consumedTokens.length - 1]));
  return tokenList;
};

/**
 * consumeAFunction appends a functions contents to a tokenList,
 * consuming from the stream all those tokens that it adds to the tokenList,
 * including the function token and end grouping token.
 * @param {!parse_css.TokenStream} tokenStream
 * @param {!Array<!parse_css.CSSParserToken>} tokenList output array for tokens.
 */
function consumeAFunction(tokenStream, tokenList) {
  goog.asserts.assertInstanceof(tokenStream.current(), parse_css.FunctionToken,
      'Internal Error: consumeAFunction precondition not met');
  tokenList.push(tokenStream.current());
  while (true) {
    tokenStream.consume();
    if (tokenStream.current() instanceof parse_css.EOFToken) {
      tokenList.push(tokenStream.current());
      return;
    } else if (tokenStream.current() instanceof parse_css.CloseParenToken) {
      tokenList.push(tokenStream.current());
      return;
    } else {
      consumeAComponentValue(tokenStream, tokenList);
    }
  }
}

/**
 * extractAFunction returns a function's contents in tokenList,
 * including the leading FunctionToken, but excluding the trailing
 * CloseParen token and appended with an EOFToken instead.
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!Array<!parse_css.CSSParserToken>}
 */
parse_css.extractAFunction = function(tokenStream) {
  /** @type {!Array<!parse_css.CSSParserToken>} */
  const consumedTokens = [];
  consumeAFunction(tokenStream, consumedTokens);
  // A function always has a start FunctionToken and
  // either a CloseParenToken or EOFToken.
  goog.asserts.assert(consumedTokens.length >= 2);

  // Convert end token to EOF.
  /** @type {!Array<!parse_css.CSSParserToken>} */
  const tokenList = consumedTokens.slice(0, -1);
  tokenList.push(createEOFTokenAt(consumedTokens[consumedTokens.length - 1]));
  return tokenList;
}
