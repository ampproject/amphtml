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
goog.provide('parse_css.Function');
goog.provide('parse_css.QualifiedRule');
goog.provide('parse_css.SimpleBlock');
goog.provide('parse_css.Stylesheet');
goog.provide('parse_css.TokenStream');
goog.provide('parse_css.canonicalize');
goog.provide('parse_css.parseAListOfDeclarations');
goog.provide('parse_css.parseAListOfRules');
goog.provide('parse_css.parseAStylesheet');

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
  if (this.tokens.length === 0) {
    throw 'Internal Error: empty TokenStream - must have EOF token';
  }
  if (!(this.tokens[tokens.length - 1] instanceof parse_css.EOFToken)) {
    throw 'Internal Error: TokenStream must end with EOF';
  }
  this.pos = -1;
};

/**x
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

function parseerror(s, msg) {
  console.log('Parse error at token ' + s.pos + ': ' + s.current() + '.\n' +
              msg);
  return true;
}

/**
 * Parses and returns a list of rules, such as at the topLevel of a stylesheet.
 * Return list has only QualifiedRule's and AtRule's as top level elements.
 * @param {!parse_css.TokenStream} tokenStream
 * @param {boolean} topLevel
 * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
 * @return {!Array<!parse_css.CSSParserRule>}
 */
function consumeAListOfRules(tokenStream, topLevel, errors) {
  const rules = [];
  let rule;
  while (true) {
    tokenStream.consume();
    if (tokenStream.current() instanceof parse_css.WhitespaceToken) {
      continue;
    } else if (tokenStream.current() instanceof parse_css.EOFToken) {
      rules.push(tokenStream.current());
      return rules;
    } else if (tokenStream.current() instanceof parse_css.CDOToken ||
               tokenStream.current() instanceof parse_css.CDCToken) {
      if (topLevel) {
        continue;
      }

      /** @type {!parse_css.QualifiedRule|!parse_css.ErrorToken} */
      const ruleOrError = consumeAQualifiedRule(tokenStream);
      if (ruleOrError instanceof parse_css.QualifiedRule) {
        rules.push(ruleOrError);
      } else {
        if (!(ruleOrError instanceof parse_css.ErrorToken))
          throw 'Internal Error: unexpected token';  // Cannot happen
        errors.push(ruleOrError);
      }
    } else if (tokenStream.current() instanceof parse_css.AtKeywordToken) {
      if (rule = consumeAnAtRule(tokenStream)) {
        rules.push(rule);
      }
    } else {
      /** @type {!parse_css.QualifiedRule|!parse_css.ErrorToken} */
      const ruleOrError2 = consumeAQualifiedRule(tokenStream);
      if (ruleOrError2 instanceof parse_css.QualifiedRule) {
        rules.push(ruleOrError2);
      } else {
        if (!(ruleOrError2 instanceof parse_css.ErrorToken))
          throw 'Internal Error: unexpected token';  // Cannot happen
        errors.push(ruleOrError2);
      }
    }
  }
}

/**
 * Parses and consumes an At Rule.
 *
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!parse_css.AtRule}
 */
function consumeAnAtRule(tokenStream) {
  if (!(tokenStream.current() instanceof parse_css.AtKeywordToken))
    throw 'Internal Error: consumeAnAtRule precondition not met';

  const startToken =
      /** @type {!parse_css.AtKeywordToken} */ (tokenStream.current());
  const rule = new parse_css.AtRule(startToken.value);
  rule.line = startToken.line;
  rule.col = startToken.col;

  while (true) {
    tokenStream.consume();
    if (tokenStream.current() instanceof parse_css.SemicolonToken) {
      rule.prelude.push(tokenStream.current());
      return rule;
    }
    if (tokenStream.current() instanceof parse_css.EOFToken) {
      const eof = new parse_css.EOFToken();
      eof.line = tokenStream.current().line;
      eof.col = tokenStream.current().col;
      rule.prelude.push(eof);
      return rule;
    }
    if (tokenStream.current() instanceof parse_css.OpenCurlyToken) {
      const eof = new parse_css.EOFToken();
      eof.line = tokenStream.current().line;
      eof.col = tokenStream.current().col;
      rule.prelude.push(eof);
      rule.value = consumeASimpleBlock(tokenStream);
      return rule;
    }
    if (tokenStream.current() instanceof parse_css.SimpleBlock) {
      const simpleBlock =
          /** @type {parse_css.SimpleBlock} */ (tokenStream.current());
      if (simpleBlock.name === '{') {
        rule.value = simpleBlock;
        const eof = new parse_css.EOFToken();
        eof.line = simpleBlock.line;
        eof.col = simpleBlock.col;
        rule.prelude.push(eof);
        return rule;
      }
    }
    rule.prelude.push(consumeAComponentValue(tokenStream));
  }
}

/**
 * Parses and consumes a Qualified rule. Rule will include a prelude
 * with the CSS selector (if any) and a value with a SimpleBlock
 * containing all of the qualified rule declarations.
 *
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!parse_css.QualifiedRule|!parse_css.ErrorToken}
 */
function consumeAQualifiedRule(tokenStream) {
  if (tokenStream.current() instanceof parse_css.EOFToken ||
      tokenStream.current() instanceof parse_css.AtKeywordToken)
    throw 'Internal Error: consumeAQualifiedRule precondition not met';

  const rule = new parse_css.QualifiedRule();
  rule.line = tokenStream.current().line;
  rule.col = tokenStream.current().col;
  tokenStream.reconsume();
  while (true) {
    tokenStream.consume();
    if (tokenStream.current() instanceof parse_css.EOFToken) {
      const error = new parse_css.ErrorToken(parse_css.ErrorType.PARSING,
          'Hit EOF when trying to parse the prelude of a qualified rule.');
      error.line = rule.line;
      error.col = rule.col;
      return error;
    }
    if (tokenStream.current() instanceof parse_css.OpenCurlyToken) {
      const eof = new parse_css.EOFToken();
      eof.line = tokenStream.current().line;
      eof.col = tokenStream.current().col;
      rule.prelude.push(eof);

      // This consumes declarations (ie: "color: red;" ) inside
      // a qualified rule as that rule's value.
      rule.value = consumeASimpleBlock(tokenStream);
      return rule;
    }
    if (tokenStream.current() instanceof parse_css.SimpleBlock) {
      // This consumes declarations (ie: "color: red;" ) inside
      // a qualified rule as that rule's value. In this case, this
      // qualified rule has no prelude (selector) and so applies to
      // all tags.
      const simpleBlock =
          /** @type {parse_css.SimpleBlock} */ (tokenStream.current());
      if (simpleBlock.name === '{') {
        const eof = new parse_css.EOFToken();
        eof.line = simpleBlock.line;
        eof.col = simpleBlock.col;
        rule.prelude.push(eof);

        rule.value = simpleBlock;
        return rule;
      }
    }
    // This consumes a CSS selector as the rules prelude.
    rule.prelude.push(consumeAComponentValue(tokenStream));
  }
}

/**
 * @param {!parse_css.TokenStream} tokenStream
 * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
 * @return {!Array<!parse_css.Declaration>}
 */
function consumeAListOfDeclarations(tokenStream, errors) {
  /** @type {!Array<!parse_css.Declaration>} */
  const decls = [];
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
      const atRule = consumeAnAtRule(tokenStream);
      const error = new parse_css.ErrorToken(
          parse_css.ErrorType.PARSING,
          '@' + atRule.name + ' found inside declaration');
      error.line = atRule.line;
      error.col = atRule.col;
      errors.push(error);
    } else if (tokenStream.current() instanceof parse_css.IdentToken) {
      const temp = [tokenStream.current()];
      while (!(tokenStream.next() instanceof parse_css.SemicolonToken ||
               tokenStream.next() instanceof parse_css.EOFToken)) {
        tokenStream.consume();
        temp.push(consumeAComponentValue(tokenStream));
      }
      if (tokenStream.next() instanceof parse_css.EOFToken) {
        temp.push(tokenStream.next());
      } else if (tokenStream.next() instanceof parse_css.SemicolonToken) {
        const eof = new parse_css.EOFToken();
        eof.line = tokenStream.next().line;
        eof.col = tokenStream.next().col;
        temp.push(eof);
      }

      /** @type {!parse_css.Declaration|!parse_css.ErrorToken} */
      const declOrError = consumeADeclaration(new parse_css.TokenStream(temp));
      if (declOrError instanceof parse_css.Declaration) {
        decls.push(declOrError);
      } else if (declOrError instanceof parse_css.ErrorToken) {
        errors.push(declOrError);
      } else {
        goog.asserts.fail('unable to parse declaration');
      }
    } else {
      const error = new parse_css.ErrorToken(
          parse_css.ErrorType.PARSING, 'Invalid Declaration');
      error.line = tokenStream.current().line;
      error.col = tokenStream.current().col;
      errors.push(error);
      tokenStream.reconsume();
      while (!(tokenStream.next() instanceof parse_css.SemicolonToken ||
               tokenStream.next() instanceof parse_css.EOFToken)) {
        tokenStream.consume();
        consumeAComponentValue(tokenStream);
      }
    }
  }
}

/**
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!parse_css.Declaration|!parse_css.ErrorToken}
 */
function consumeADeclaration(tokenStream) {
  // Assumes that the next input token will be an ident token.
  tokenStream.consume();
  if (!(tokenStream.current() instanceof parse_css.IdentToken))
    throw 'Internal Error: consumeADeclaration precondition not met';
  const startToken =
      /** @type {!parse_css.IdentToken} */ (tokenStream.current());
  const decl = new parse_css.Declaration(startToken.value);
  decl.line = startToken.line;
  decl.col = startToken.col;

  while (tokenStream.next() instanceof parse_css.WhitespaceToken) {
    tokenStream.consume();
  }
  if (!(tokenStream.next() instanceof parse_css.ColonToken)) {
    const error = new parse_css.ErrorToken(
        parse_css.ErrorType.PARSING, 'Incomplete declaration');
    error.line = startToken.line;
    error.col = startToken.col;
    return error;
  } else {
    tokenStream.consume();
  }
  while (!(tokenStream.next() instanceof parse_css.EOFToken)) {
    tokenStream.consume();
    decl.value.push(consumeAComponentValue(tokenStream));
  }
  const eof = tokenStream.next();
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
  decl.value.push(eof);
  return decl;
}

/**
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!parse_css.SimpleBlock|parse_css.Function|!parse_css.CSSParserToken}
 */
function consumeAComponentValue(tokenStream) {
  if (tokenStream.current() instanceof parse_css.OpenCurlyToken ||
      tokenStream.current() instanceof parse_css.OpenSquareToken ||
      tokenStream.current() instanceof parse_css.OpenParenToken) {
    return consumeASimpleBlock(tokenStream);
  }
  if (tokenStream.current() instanceof parse_css.FunctionToken) {
    return consumeAFunction(tokenStream);
  }
  return tokenStream.current();
}

/**
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!parse_css.SimpleBlock}
 */
function consumeASimpleBlock(tokenStream) {
  if (!(tokenStream.current() instanceof parse_css.OpenCurlyToken ||
        tokenStream.current() instanceof parse_css.OpenSquareToken ||
        tokenStream.current() instanceof parse_css.OpenParenToken))
    throw 'Internal Error: consumeASimpleBlock precondition not met';

  const startToken =
      /** @type {!parse_css.OpenCurlyToken|!parse_css.OpenSquareToken|
      !parse_css.OpenParenToken} */ (tokenStream.current());
  const mirror = startToken.mirror;
  const block = new parse_css.SimpleBlock(startToken.value);
  block.line = startToken.line;
  block.col = startToken.col;
  while (true) {
    tokenStream.consume();
    if (tokenStream.current() instanceof parse_css.EOFToken) {
      block.value.push(tokenStream.current());
      return block;
    }
    if (tokenStream.current() instanceof parse_css.GroupingToken) {
      const current =
          /** @type {!parse_css.GroupingToken} */ (tokenStream.current());
      if (current.value === mirror) {
        // We actually want the position after the current token, so
        // that's next.
        const eof = new parse_css.EOFToken();
        eof.line = tokenStream.next().line;
        eof.col = tokenStream.next().col;
        block.value.push(eof);
        return block;
      }
    }

    block.value.push(consumeAComponentValue(tokenStream));
  }
}

/**
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!parse_css.Function}
 */
function consumeAFunction(tokenStream) {
  if (!(tokenStream.current() instanceof parse_css.FunctionToken))
    throw 'Internal Error: consumeAFunction precondition not met';
  const startToken =
      /** @type {!parse_css.FunctionToken} */ (tokenStream.current());

  const func = new parse_css.Function(startToken.value);
  func.line = startToken.line;
  func.col = startToken.col;
  while (true) {
    tokenStream.consume();
    if (tokenStream.current() instanceof parse_css.EOFToken) {
      func.value.push(tokenStream.current());
      return func;
    } else if (tokenStream.current() instanceof parse_css.CloseParenToken) {
      const eof = new parse_css.EOFToken();
      eof.line = tokenStream.current().line;
      eof.col = tokenStream.current().col;
      func.value.push(eof);
      return func;
    } else {
      func.value.push(consumeAComponentValue(tokenStream));
    }
  }
}

/**
 * Returns a Stylesheet object. The object has a value attribute
 * which is of type !Array<!parse_css.CSSParserRule>, which in turn may have
 * nested parse_css.CSSParserRules.
 *
 * The top level CSSParserRules in a Stylesheet are always a series of
 * QualifiedRule's or AtRule's.
 *
 * Each QualifiedRule or AtRule may have a 'value' and 'prelude' attribute.
 *  - the value, if present, is a SimpleBlock.
 *  - he prelude, is an array of outputs from consumeAComponentValue.
 *
 * A SimpleBlock has, in turn, a 'value' attribute which is an array of
 * outputs of consumeAComponentValue.
 *
 * consumeAComponentValue outputs one of the following:
 *  - SimpleBlock's (which recursively can contain SimpleBlocks).
 *  - Function's
 *  - CSSParserToken's
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
  /** @type {!parse_css.TokenStream} */
  const tokenStream = new parse_css.TokenStream(tokenList);
  /** @type {!parse_css.Stylesheet} */
  const sheet = new parse_css.Stylesheet();
  sheet.value = consumeAListOfRules(tokenStream, /*topLevel=*/true, errors);
  sheet.line = sheet.value[0].line;
  sheet.col = sheet.value[0].col;

  return parse_css.canonicalize(sheet, atRuleSpec, defaultSpec, errors);
};

/**
 * @param {!Array<!parse_css.CSSParserToken>} tokenList
 * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
 * @return {!Array<!parse_css.CSSParserRule>}
 */
parse_css.parseAListOfRules = function(tokenList, errors) {
  /** @type {!parse_css.TokenStream} */
  const tokenStream = new parse_css.TokenStream(tokenList);
  return consumeAListOfRules(tokenStream, /*topLevel=*/false, errors);
};

/**
 * @param {!Array<!parse_css.CSSParserToken>} tokenList
 * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
 * @return {!Array<!parse_css.Declaration>}
 */
parse_css.parseAListOfDeclarations = function(tokenList, errors) {
  /** @type {!parse_css.TokenStream} */
  const tokenStream = new parse_css.TokenStream(tokenList);
  return consumeAListOfDeclarations(tokenStream, errors);
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
  /** @type {!Array<!parse_css.CSSParserRule|!parse_css.EOFToken>} */
  this.value = [];
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
  if (this.value.length !== 0) {
    json['value'] = arrayToJSON(this.value);
  }
  if (this.eof !== null) {
    json['eof'] = this.eof.toJSON();
  }
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
  /** @type {!Array<!parse_css.SimpleBlock|!parse_css.Function|
  !parse_css.CSSParserToken>} */
  this.prelude = [];
  /** @type {?parse_css.SimpleBlock} */
  this.value = null;
  /** @type {!Array<!Object>} */
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
  if (this.value !== null) {
    json['value'] = this.value.toJSON();
  }
  return json;
};

/**
 * @constructor
 * @extends {parse_css.CSSParserRule}
 */
parse_css.QualifiedRule = function() {
  goog.base(this);
  /** @type {!Array<!parse_css.SimpleBlock|!parse_css.Function|
  !parse_css.CSSParserToken>} */
  this.prelude = [];
  /** @type {!Array<!parse_css.Declaration>} */
  this.declarations = [];
  /** @type {?parse_css.SimpleBlock} */
  this.value = null;
};
goog.inherits(parse_css.QualifiedRule, parse_css.CSSParserRule);

/** @type {string} */
parse_css.QualifiedRule.prototype.tokenType = 'QUALIFIED_RULE';

/** @return {!Object} */
parse_css.QualifiedRule.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['prelude'] = arrayToJSON(this.prelude);
  json['declarations'] = arrayToJSON(this.declarations);
  if (this.value != null) {
    json['value'] = this.value.toJSON();
  }
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
  /** @type {!Array<!parse_css.SimpleBlock|!parse_css.Function|
   * !parse_css.CSSParserToken>} */
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
 * @param {string} type
 * @constructor
 * @extends {parse_css.CSSParserRule}
 */
parse_css.SimpleBlock = function(type) {
  goog.base(this);
  /** @type {string} */
  this.name = type;
  /** @type {!Array<!parse_css.SimpleBlock|!parse_css.Function|
  !parse_css.CSSParserToken>} */
  this.value = [];
};
goog.inherits(parse_css.SimpleBlock, parse_css.CSSParserRule);

/** @type {string} */
parse_css.SimpleBlock.prototype.tokenType = 'BLOCK';

/** @return {!Object} */
parse_css.SimpleBlock.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['name'] = this.name;
  json['value'] = arrayToJSON(this.value);
  return json;
};

/**
 * @param {string} name
 * @constructor
 * @extends {parse_css.CSSParserRule}
 */
parse_css.Function = function(name) {
  goog.base(this);
  /** @type {string} */
  this.name = name;
  /** @type {!Array<!parse_css.SimpleBlock|!parse_css.Function|
  !parse_css.CSSParserToken>} */
  this.value = [];
};
goog.inherits(parse_css.Function, parse_css.CSSParserRule);

/** @type {string} */
parse_css.Function.prototype.tokenType = 'FUNCTION';

/** @return {!Object} */
parse_css.Function.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['name'] = this.name;
  json['value'] = arrayToJSON(this.value);
  return json;
};

/* Grammar Application */

/**
 * Enum describing how to parse a SimpleBlock child of a CSS Rule.
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
 * Canonicalizes the rules found in the input stylesheet. Note that the
 * canonicalize will in-place modify some of the CSSParser tokens in the input.
 *
 * @param {!parse_css.Stylesheet} stylesheet
 * @param {!Object<string,parse_css.BlockType>} atRuleSpec block type rules for
 * all CSS AT rules this canonicalizer should handle.
 * @param {parse_css.BlockType} defaultSpec default block type for types not
 * found in atRuleSpec.
 * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
 * @return {!parse_css.Stylesheet}
 * @export
 */
parse_css.canonicalize = function(
    stylesheet, atRuleSpec, defaultSpec, errors) {
  const canonicalizer = new Canonicalizer(atRuleSpec, defaultSpec);
  return canonicalizer.canonicalizeStylesheet(stylesheet, errors);
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
 * @param {!parse_css.Stylesheet} stylesheet
 * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
 * @return {!parse_css.Stylesheet}
 */
Canonicalizer.prototype.canonicalizeStylesheet = function(stylesheet, errors) {
  for (let i = 0; i < stylesheet.value.length; i++) {
    const currentRule = stylesheet.value[i];
    if (currentRule instanceof parse_css.EOFToken) {
      stylesheet.eof = currentRule;
    } else if (currentRule instanceof parse_css.QualifiedRule) {
      stylesheet.rules.push(
          this.canonicalizeQualifiedRule(currentRule, errors));
    } else if (currentRule instanceof parse_css.AtRule) {
      stylesheet.rules.push(this.canonicalizeAtRule(currentRule, errors));
    } else {
      goog.asserts.fail('unexpected rule inside a top-level stylesheet: ' +
          currentRule.name);
    }
  }

  // Clear the value field, just to reduce mess in outputs.
  stylesheet.value = [];

  return stylesheet;
};



/**
 * @param {!parse_css.SimpleBlock} simpleBlock
 * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
 * @return {!Array<!parse_css.CSSParserRule>} canonicalRules array of
 * canonicalized rules, all either QualifiedRule's or AtRule's
 */
Canonicalizer.prototype.canonicalizeAListOfRules = function(
    simpleBlock, errors) {
  /** @type {!Array<!parse_css.CSSParserRule>} */
  const simpleRules = parse_css.parseAListOfRules(simpleBlock.value, errors);
  /** @type {!Array<!Object>} */
  const canonicalRules = [];
  for (let i = 0; i < simpleRules.length; i++) {
    /** @type {!parse_css.CSSParserRule} */
    const currentRule = simpleRules[i];
    if (currentRule instanceof parse_css.QualifiedRule) {
      canonicalRules.push(this.canonicalizeQualifiedRule(currentRule, errors));
    } else if (currentRule instanceof parse_css.AtRule) {
      canonicalRules.push(this.canonicalizeAtRule(currentRule, errors));
    } else {
      // Note that we are dropping the EOFToken here from the output. This may
      // not be the best thing to do, but it simplifies the type of our output
      // array.
      goog.asserts.assert(
          currentRule instanceof parse_css.EOFToken,
          'unexpected rule inside a list of rules: ' + currentRule.name);
    }
  }
  return canonicalRules;
};

/**
 * @param {!parse_css.AtRule} atRule
 * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
 * @return {!parse_css.AtRule}
 */
Canonicalizer.prototype.canonicalizeAtRule = function(atRule, errors) {
  if (atRule.value === null)
    return atRule;

  /** @type {!parse_css.BlockType} */
  const blockType = this.blockTypeFor(atRule);
  const simpleBlock = /** @type {!parse_css.SimpleBlock} */ (atRule.value);
  if (blockType === parse_css.BlockType.PARSE_AS_RULES) {
    atRule.rules = this.canonicalizeAListOfRules(atRule.value, errors);
  } else if (blockType === parse_css.BlockType.PARSE_AS_DECLARATIONS) {
    atRule.declarations = parse_css.parseAListOfDeclarations(
        simpleBlock.value, errors);
  } else {
    goog.asserts.assert(blockType === parse_css.BlockType.PARSE_AS_IGNORE);
  }

  // Clear the value field, just to reduce mess in outputs.
  atRule.value = null;

  return atRule;
};

/**
 * @param {!parse_css.QualifiedRule} qualifiedRule
 * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
 * @return {!parse_css.QualifiedRule}
 */
Canonicalizer.prototype.canonicalizeQualifiedRule = function(
    qualifiedRule, errors) {
  const simpleBlock =
      /** @type {!parse_css.SimpleBlock} */ (qualifiedRule.value);
  qualifiedRule.declarations =
      parse_css.parseAListOfDeclarations(simpleBlock.value, errors);
  // Clear the value field, just to reduce mess in outputs.
  qualifiedRule.value = null;
  return qualifiedRule;
};
