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
goog.provide('parse_css.AtKeywordToken');
goog.provide('parse_css.CDCToken');
goog.provide('parse_css.CDOToken');
goog.provide('parse_css.CSSParserToken');
goog.provide('parse_css.CloseCurlyToken');
goog.provide('parse_css.CloseParenToken');
goog.provide('parse_css.CloseSquareToken');
goog.provide('parse_css.ColonToken');
goog.provide('parse_css.ColumnToken');
goog.provide('parse_css.CommaToken');
goog.provide('parse_css.DashMatchToken');
goog.provide('parse_css.DelimToken');
goog.provide('parse_css.DimensionToken');
goog.provide('parse_css.EOFToken');
goog.provide('parse_css.ErrorToken');
goog.provide('parse_css.ErrorType');
goog.provide('parse_css.FunctionToken');
goog.provide('parse_css.GroupingToken');
goog.provide('parse_css.HashToken');
goog.provide('parse_css.IdentToken');
goog.provide('parse_css.IncludeMatchToken');
goog.provide('parse_css.NumberToken');
goog.provide('parse_css.OpenCurlyToken');
goog.provide('parse_css.OpenParenToken');
goog.provide('parse_css.OpenSquareToken');
goog.provide('parse_css.PercentageToken');
goog.provide('parse_css.PrefixMatchToken');
goog.provide('parse_css.SemicolonToken');
goog.provide('parse_css.StringToken');
goog.provide('parse_css.StringValuedToken');
goog.provide('parse_css.SubstringMatchToken');
goog.provide('parse_css.SuffixMatchToken');
goog.provide('parse_css.URLToken');
goog.provide('parse_css.WhitespaceToken');
goog.provide('parse_css.tokenize');

/**
 * Returns an array of CSSParserTokens.
 *
 * Token Hierarchy:
 * CSSParserToken (abstract)
 *   - StringValuedToken (abstract)
 *     - IdentToken
 *     - FunctionToken
 *     - AtKeywordToken
 *     - HashToken
 *     - StringRoken
 *     - URLToken
 *   - GroupingToken (abstract)
 *     - OpenCurlyToken
 *     - CloseCurlyToken
 *     - OpenSquareToken
 *     - CloseSquareToken
 *     - OpenParenToken
 *     - CloseParenToken
 *   - WhitespaceToken
 *   - CDOToken
 *   - CDCToken
 *   - ColonToken
 *   - SemiColonToken
 *   - CommaToken
 *   - IncludeMatchToken
 *   - DashMatchToken
 *   - PrefixMatchToken
 *   - SuffixMatchToken
 *   - SubstringMatchToken
 *   - ColumnToken
 *   - EOFToken
 *   - DelimToken
 *   - NumberToken
 *   - PercentageToken
 *   - DimensionToken
 *   - ErrorToken
 *
 * @param {string} strIn
 * @param {number} line
 * @param {number} col
 * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
 * @return {!Array<!parse_css.CSSParserToken>}
 * @export
 */
parse_css.tokenize = function(strIn, line, col, errors) {
  const tokenizer = new Tokenizer(strIn, line, col, errors);
  return tokenizer.getTokens();
};

/**
 * @param {number} num
 * @param {number} first
 * @param {number} last
 * @return {boolean}
 */
function between(num, first, last) { return num >= first && num <= last; }

/**
 * @param {number} code
 * @return {boolean}
 */
function digit(code) { return between(code, /* '0' */ 0x30, /* '9' */ 0x39); }

/**
 * @param {number} code
 * @return {boolean}
 */
function hexDigit(code) {
  return digit(code) || between(code, /* 'A' */ 0x41, /* 'F' */ 0x46) ||
         between(code, /* 'a' */ 0x61, /* 'f' */ 0x66);
}

/**
 * @param {number} code
 * @return {boolean}
 */
function upperCaseLetter(code) {
  return between(code, /* 'A' */ 0x41, /* 'Z' */ 0x5a);
}

/**
 * @param {number} code
 * @return {boolean}
 */
function lowerCaseLetter(code) {
  return between(code, /* 'a' */ 0x61, /* 'z' */ 0x7a);
}

/**
 * @param {number} code
 * @return {boolean}
 */
function letter(code) { return upperCaseLetter(code) || lowerCaseLetter(code); }

/**
 * @param {number} code
 * @return {boolean}
 */
function nonAscii(code) { return code >= 0x80; }

/**
 * @param {number} code
 * @return {boolean}
 */
function nameStartChar(code) {
  return letter(code) || nonAscii(code) || code === /* '_' */ 0x5f;
}

/**
 * @param {number} code
 * @return {boolean}
 */
function nameChar(code) {
  return nameStartChar(code) || digit(code) || code === /* '-' */ 0x2d;
}

/**
 * @param {number} code
 * @return {boolean}
 */
function nonPrintable(code) {
  return between(code, 0, 8) || code === 0xb ||
         between(code, 0xe, 0x1f) || code === 0x7f;
}

/**
 * @param {number} code
 * @return {boolean}
 */
function newline(code) {
  return code === /* '\n' */ 0xa;
}

/**
 * @param {number} code
 * @return {boolean}
 */
function whitespace(code) {
  return newline(code) || code === /* '\t' */ 0x9 || code === /* ' ' */ 0x20;
}

/** @const @type {number} */
const maxAllowedCodepoint = 0x10ffff;

/**
 * This error can be thrown if an internal method encounters a 0x0 codepoint.
 * This cannot happen if tokenize() is called as the preprocessor replaces
 * these codepoints.
 * @param {string} message
 * @constructor
 */
const InvalidCharacterError = function(message) {
  /** @type {string} */
  this.message = message;
};

InvalidCharacterError.prototype = new Error;
/** @type {string} */
InvalidCharacterError.prototype.name = 'InvalidCharacterError';

/**
 * @param {string} str
 * @return {!Array<number>}
 */
function preprocess(str) {
  // Turn a string into an array of code points,
  // following the preprocessing cleanup rules.
  const codepoints = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code === /* '\r' */ 0xd && str.charCodeAt(i + 1) === /* '\n' */ 0xa) {
      code = /* '\n' */ 0xa;
      i++;
    }
    if (code === /* '\r' */ 0xd || code === 0xc)
      code = /* '\n' */ 0xa;
    if (code === 0x0) {
      code = 0xfffd;
    }
    if (between(code, 0xd800, 0xdbff) &&
        between(str.charCodeAt(i + 1), 0xdc00, 0xdfff)) {
      // Decode a surrogate pair into an astral codepoint.
      const lead = code - 0xd800;
      const trail = str.charCodeAt(i + 1) - 0xdc00;
      code = Math.pow(2, 20) + lead * Math.pow(2, 10) + trail;
      i++;
    }
    codepoints.push(code);
  }
  return codepoints;
}

/**
 * @param {number} code
 * @return {string}
 */
function stringFromCode(code) {
  if (code <= 0xffff) {
    return String.fromCharCode(code);
  }
  // Otherwise, encode astral char as surrogate pair.
  code -= Math.pow(2, 20);
  const lead = Math.floor(code / Math.pow(2, 10)) + 0xd800;
  const trail = code % Math.pow(2, 10) + 0xdc00;
  return String.fromCharCode(lead) + String.fromCharCode(trail);
}

/**
 * Tokenizer class. Used internally by the tokenize function.
 * @param {string} strIn
 * @param {number} line
 * @param {number} col
 * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
 * @constructor
 */
const Tokenizer = function Tokenizer(strIn, line, col, errors) {
  this.tokens_ = [];
  /**
   * @private
   * @type {!Array<!parse_css.ErrorToken>}
   */
  this.errors_ = errors;
  /**
   * @private
   * @type {!Array<number>}
   */
  this.codepoints_ = preprocess(strIn);
  /**
   * @private
   * @type {number}
   */
  this.pos_ = -1;
  /**
   * @private
   * @type {number}
   */
  this.code_;

  // Line number information.
  this.lineByPos_ = [];
  this.colByPos_ = [];
  let currentLine = line;
  let currentCol = col;
  for (let i = 0; i < this.codepoints_.length; ++i) {
    this.lineByPos_[i] = currentLine;
    this.colByPos_[i] = currentCol;
    if (newline(this.codepoints_[i])) {
      ++currentLine;
      currentCol = 0;
    } else {
      ++currentCol;
    }
  }

  let iterationCount = 0;
  while (!this.eof(this.next())) {
    const token = this.consumeAToken();
    if (token instanceof parse_css.ErrorToken) {
      this.errors_.push(token);
    } else {
      this.tokens_.push(token);
    }
    iterationCount++;
    goog.asserts.assert(iterationCount <= this.codepoints_.length * 2,
                        'Internal Error: infinite-looping');
  }
  const eofToken = new parse_css.EOFToken();
  eofToken.line = currentLine;
  eofToken.col = currentCol;
  this.tokens_.push(eofToken);
};

/**
 * @return {number}
 */
Tokenizer.prototype.getLine = function() {
  const pos = Math.min(this.pos_, this.lineByPos_.length - 1);
  return (pos < 0) ? 1 : this.lineByPos_[this.pos_];
};

/**
 * @return {number}
 */
Tokenizer.prototype.getCol = function() {
  const pos = Math.min(this.pos_, this.colByPos_.length - 1);
  return (pos < 0) ? 0 : this.colByPos_[this.pos_];
};

/**
 * @return {!Array<!parse_css.CSSParserToken>}
 */
Tokenizer.prototype.getTokens = function() {
  return this.tokens_;
};

/**
 * Returns the codepoint at the given position.
 * @param {number} num
 * @return {number}
 */
Tokenizer.prototype.codepoint = function(num) {
  if (num >= this.codepoints_.length) {
    return -1;
  }
  return this.codepoints_[num];
};

/**
 * Peeks ahead and returns the codepoint opt_num positions ahead.
 * @param {number=} opt_num
 * @return {number}
 */
Tokenizer.prototype.next = function(opt_num) {
  const num = opt_num || 1;
  goog.asserts.assert(
      num <= 3, 'Spec Error: no more than three codepoints of lookahead.');
  return this.codepoint(this.pos_ + num);
};

/**
 * A MarkedPosition object saves position information from the given
 * tokenizer and can later write that position back to a CSSParserToken
 * object.
 * @param {!Tokenizer} tokenizer
 * @constructor
 */
const MarkedPosition = function MarkedPosition(tokenizer) {
  /** @type {number} line number */
  this.line = tokenizer.getLine();
  /** @type {number} line */
  this.col = tokenizer.getCol();
};

/**
 * Adds position data to the given token, returning it for chaining.
 * @param {!parse_css.CSSParserToken} token
 * @return {!parse_css.CSSParserToken}
 */
MarkedPosition.prototype.addPositionTo = function(token) {
  token.line = this.line;
  token.col = this.col;
  return token;
};

/**
 * Moves ahead opt_num positions in the string. May move past the
 * end of the string.
 * @param {number=} opt_num
 */
Tokenizer.prototype.consume = function(opt_num) {
  const num = opt_num || 1;
  this.pos_ += num;
  this.code_ = this.codepoint(this.pos_);
};

/**
 * Backs up exactly one position in the string.
 */
Tokenizer.prototype.reconsume = function() {
  this.pos_ -= 1;
  // TODO(johannes): Oddly, adding the following breaks the test with
  // internal errors. Investigate.
  // this.code_ = this.codepoint(this.pos_);
};

/**
 * @param {number=} opt_codepoint
 * @return {boolean}
 */
Tokenizer.prototype.eof = function(opt_codepoint) {
  const codepoint = opt_codepoint || this.code_;
  return codepoint === -1;
};

/** @return {!parse_css.CSSParserToken} */
Tokenizer.prototype.consumeAToken = function() {
  this.consumeComments();
  this.consume();
  const mark = new MarkedPosition(this);  // Save off line/col.
  if (whitespace(this.code_)) {
    // Merge consecutive whitespace into one token.
    while (whitespace(this.next())) {
      this.consume();
    }
    return mark.addPositionTo(new parse_css.WhitespaceToken);
  } else if (this.code_ === /* '"' */ 0x22) {
    return mark.addPositionTo(this.consumeAStringToken());
  } else if (this.code_ === /* '#' */ 0x23) {
    if (nameChar(this.next()) ||
        this.areAValidEscape(this.next(1), this.next(2))) {
      let type = null;
      if (this.wouldStartAnIdentifier(
            this.next(1), this.next(2), this.next(3))) {
        type = 'id';
      }
      const token = new parse_css.HashToken(/*val=*/this.consumeAName());
      if (type !== null) {
        token.type = type;
      }
      return mark.addPositionTo(token);
    } else {
      return mark.addPositionTo(new parse_css.DelimToken(this.code_));
    }
  } else if (this.code_ === /* '$' */ 0x24) {
    if (this.next() === /* '=' */ 0x3d) {
      this.consume();
      return mark.addPositionTo(new parse_css.SuffixMatchToken());
    } else {
      return mark.addPositionTo(new parse_css.DelimToken(this.code_));
    }
  } else if (this.code_ === /* ''' */ 0x27) {
    return mark.addPositionTo(this.consumeAStringToken());
  } else if (this.code_ === /* '(' */ 0x28) {
    return mark.addPositionTo(new parse_css.OpenParenToken());
  } else if (this.code_ === /* ')' */ 0x29) {
    return mark.addPositionTo(new parse_css.CloseParenToken());
  } else if (this.code_ === /* '*' */ 0x2a) {
    if (this.next() === /* '=' */ 0x3d) {
      this.consume();
      return mark.addPositionTo(new parse_css.SubstringMatchToken());
    } else {
      return mark.addPositionTo(new parse_css.DelimToken(this.code_));
    }
  } else if (this.code_ === /* '+' */ 0x2b) {
    if (this.startsWithANumber()) {
      this.reconsume();
      return mark.addPositionTo(this.consumeANumericToken());
    } else {
      return mark.addPositionTo(new parse_css.DelimToken(this.code_));
    }
  } else if (this.code_ === /* ',' */ 0x2c) {
    return mark.addPositionTo(new parse_css.CommaToken());
  } else if (this.code_ === /* '-' */ 0x2d) {
    if (this.startsWithANumber()) {
      this.reconsume();
      return mark.addPositionTo(this.consumeANumericToken());
    } else if (this.next(1) === /* '-' */ 0x2d &&
               this.next(2) === /* '>' */ 0x3e) {
      this.consume(2);
      return mark.addPositionTo(new parse_css.CDCToken());
    } else if (this.startsWithAnIdentifier()) {
      this.reconsume();
      return mark.addPositionTo(this.consumeAnIdentlikeToken());
    } else {
      return mark.addPositionTo(new parse_css.DelimToken(this.code_));
    }
  } else if (this.code_ === /* '.' */ 0x2e) {
    if (this.startsWithANumber()) {
      this.reconsume();
      return mark.addPositionTo(this.consumeANumericToken());
    } else {
      return mark.addPositionTo(new parse_css.DelimToken(this.code_));
    }
  } else if (this.code_ === /* ':' */ 0x3a) {
    return mark.addPositionTo(new parse_css.ColonToken);
  } else if (this.code_ === /* ';' */ 0x3b) {
    return mark.addPositionTo(new parse_css.SemicolonToken);
  } else if (this.code_ === /* '<' */ 0x3c) {
    if (this.next(1) === /* '!' */ 0x21 && this.next(2) === /* '-' */ 0x2d &&
        this.next(3) === /* '-' */ 0x2d) {
      this.consume(3);
      return mark.addPositionTo(new parse_css.CDOToken());
    } else {
      return mark.addPositionTo(new parse_css.DelimToken(this.code_));
    }
  } else if (this.code_ === /* '@' */ 0x40) {
    if (this.wouldStartAnIdentifier(this.next(1), this.next(2), this.next(3))) {
      return mark.addPositionTo(
          new parse_css.AtKeywordToken(this.consumeAName()));
    } else {
      return mark.addPositionTo(new parse_css.DelimToken(this.code_));
    }
  } else if (this.code_ === /* '[' */ 0x5b) {
    return mark.addPositionTo(new parse_css.OpenSquareToken());
  } else if (this.code_ === /* '\' */ 0x5c) {
    if (this.startsWithAValidEscape()) {
      this.reconsume();
      return mark.addPositionTo(this.consumeAnIdentlikeToken());
    } else {
      // This condition happens if we are in consumeAToken (this method),
      // the current codepoint is 0x5c (\) and the next codepoint is a
      // newline (\n).
      return mark.addPositionTo(
          new parse_css.ErrorToken(
              parse_css.ErrorType.TOKENIZATION, 'stray trailing backslash'));
    }
  } else if (this.code_ === /* ']' */ 0x5d) {
    return mark.addPositionTo(new parse_css.CloseSquareToken());
  } else if (this.code_ === /* '^' */ 0x5e) {
    if (this.next() === /* '=' */ 0x3d) {
      this.consume();
      return mark.addPositionTo(new parse_css.PrefixMatchToken());
    } else {
      return mark.addPositionTo(new parse_css.DelimToken(this.code_));
    }
  } else if (this.code_ === /* '{' */ 0x7b) {
    return mark.addPositionTo(new parse_css.OpenCurlyToken());
  } else if (this.code_ === /* '|' */ 0x7c) {
    if (this.next() === /* '=' */ 0x3d) {
      this.consume();
      return mark.addPositionTo(new parse_css.DashMatchToken());
    } else if (this.next() === /* '|' */ 0x7c) {
      this.consume();
      return mark.addPositionTo(new parse_css.ColumnToken());
    } else {
      return mark.addPositionTo(new parse_css.DelimToken(this.code_));
    }
  } else if (this.code_ === /* '}' */ 0x7d) {
    return mark.addPositionTo(new parse_css.CloseCurlyToken());
  } else if (this.code_ === /* '~' */ 0x7e) {
    if (this.next() === /* '=' */ 0x3d) {
      this.consume();
      return mark.addPositionTo(new parse_css.IncludeMatchToken());
    } else {
      return mark.addPositionTo(new parse_css.DelimToken(this.code_));
    }
  } else if (digit(this.code_)) {
    this.reconsume();
    return mark.addPositionTo(this.consumeANumericToken());
  } else if (nameStartChar(this.code_)) {
    this.reconsume();
    return mark.addPositionTo(this.consumeAnIdentlikeToken());
  } else if (this.eof()) {
    return mark.addPositionTo(new parse_css.EOFToken());
  } else {
    return mark.addPositionTo(new parse_css.DelimToken(this.code_));
  }
};

/**
 * Consume everything starting with /* and ending at * / (ignore the space),
 * emitting a parse error if we hit the end of the file. Returns nothing.
 */
Tokenizer.prototype.consumeComments = function() {
  const mark = new MarkedPosition(this);
  while (this.next(1) === /* '/' */ 0x2f && this.next(2) === /* '*' */ 0x2a) {
    this.consume(2);
    while (true) {
      this.consume();
      if (this.code_ === /* '*' */ 0x2a && this.next() === /* '/' */ 0x2f) {
        this.consume();
        break;
      } else if (this.eof()) {
        // For example "h1 { color: red; } \* " would emit this parse error
        // at the end of the string.
        this.errors_.push(mark.addPositionTo(new parse_css.ErrorToken(
            parse_css.ErrorType.TOKENIZATION, 'unterminated comment')));
        return;
      }
    }
  }
};

/**
 * Consumes a token that starts with a number.
 * The specific type is one of:
 *   NumberToken, DimensionToken, PercentageToken
 * @return {!parse_css.CSSParserToken} */
Tokenizer.prototype.consumeANumericToken = function() {
  goog.asserts.assert(
      this.wouldStartANumber(this.next(1), this.next(2), this.next(3)),
      'Internal Error: consumeANumericToken precondition not met');
  /** @type {!parse_css.NumberToken} */
  const num = this.consumeANumber();
  if (this.wouldStartAnIdentifier(this.next(1), this.next(2), this.next(3))) {
    const token = new parse_css.DimensionToken();
    token.value = num.value;
    token.repr = num.repr;
    token.type = num.type;
    token.unit = this.consumeAName();
    return token;
  } else if (this.next() === /* '%' */ 0x25) {
    this.consume();
    const token = new parse_css.PercentageToken();
    token.value = num.value;
    token.repr = num.repr;
    return token;
  }
  return num;
};

/**
 * Consume an identifier-like token.
 * The specific type is one of:
 *   FunctionToken, URLToken, ErrorToken, IdentToken
 * @return {!parse_css.CSSParserToken}
 */
Tokenizer.prototype.consumeAnIdentlikeToken = function() {
  const name = this.consumeAName();
  if (name.toLowerCase() === 'url' && this.next() === /* '(' */ 0x28) {
    this.consume();
    while (whitespace(this.next(1)) && whitespace(this.next(2))) {
      this.consume();
    }
    if (this.next() === /* '"' */ 0x22 || this.next() === /* ''' */ 0x27) {
      return new parse_css.FunctionToken(name);
    } else if (whitespace(this.next()) &&
               (this.next(2) === /* '"' */ 0x22 ||
                this.next(2) === /* ''' */ 0x27)) {
      return new parse_css.FunctionToken(name);
    } else {
      return this.consumeAURLToken();
    }
  } else if (this.next() === /* '(' */ 0x28) {
    this.consume();
    return new parse_css.FunctionToken(name);
  } else {
    return new parse_css.IdentToken(name);
  }
};

/**
 * Consume a string token.
 * The specific type is one of:
 *   StringToken, ErrorToken
 * @return {!parse_css.CSSParserToken}
 */
Tokenizer.prototype.consumeAStringToken = function() {
  goog.asserts.assert(
      (this.code_ === /* '"' */ 0x22) || (this.code_ === /* ''' */ 0x27),
      'Internal Error: consumeAStringToken precondition not met');
  const endingCodePoint = this.code_;
  let string = '';
  while (true) {
    this.consume();
    if (this.code_ === endingCodePoint || this.eof()) {
      return new parse_css.StringToken(string);
    } else if (newline(this.code_)) {
      this.reconsume();
      return new parse_css.ErrorToken(parse_css.ErrorType.TOKENIZATION,
                                      'unterminated string');
    } else if (this.code_ === /* '\' */ 0x5c) {
      if (this.eof(this.next())) {
        continue;
      } else if (newline(this.next())) {
        this.consume();
      } else {
        string += stringFromCode(this.consumeEscape());
      }
    } else {
      string += stringFromCode(this.code_);
    }
  }
};

/**
 * Consume an URL token.
 * The specific type is one of:
 *   URLToken, ErrorToken
 * @return {!parse_css.CSSParserToken}
 */
Tokenizer.prototype.consumeAURLToken = function() {
  const token = new parse_css.URLToken('');
  while (whitespace(this.next())) {
    this.consume();
  }
  if (this.eof(this.next())) {
    return token;
  }
  while (true) {
    this.consume();
    if (this.code_ === /* ')' */ 0x29 || this.eof()) {
      return token;
    } else if (whitespace(this.code_)) {
      while (whitespace(this.next())) {
        this.consume();
      }
      if (this.next() === /* ')' */ 0x29 || this.eof(this.next())) {
        this.consume();
        return token;
      } else {
        this.consumeTheRemnantsOfABadURL();
        return new parse_css.ErrorToken(
            parse_css.ErrorType.TOKENIZATION, 'bad url');
      }
    } else if (this.code_ === /* '"' */ 0x22 || this.code_ === /* ''' */ 0x27 ||
               this.code_ === /* '(' */ 0x28 || nonPrintable(this.code_)) {
      this.consumeTheRemnantsOfABadURL();
      return new parse_css.ErrorToken(
          parse_css.ErrorType.TOKENIZATION, 'bad url');
    } else if (this.code_ === /* '\' */ 0x5c) {
      if (this.startsWithAValidEscape()) {
        token.value += stringFromCode(this.consumeEscape());
      } else {
        this.consumeTheRemnantsOfABadURL();
        return new parse_css.ErrorToken(
            parse_css.ErrorType.TOKENIZATION, 'bad url');
      }
    } else {
      token.value += stringFromCode(this.code_);
    }
  }
};

/**
 * Consume an escaped character, ex: \a212f3, followed by any whitespace.
 * Returns the numerical value of the character. If the codepoint following
 * the '\' character is not a hex code and not EOF, returns that codepoint.
 * @return {number}
 */
Tokenizer.prototype.consumeEscape = function() {
  // Assume the the current character is the \
  // and the next code point is not a newline.
  this.consume();  // '\'
  if (hexDigit(this.code_)) {
    // Consume 1-6 hex digits
    const digits = [this.code_];
    for (let total = 0; total < 5; total++) {
      if (hexDigit(this.next())) {
        this.consume();
        digits.push(this.code_);
      } else {
        break;
      }
    }
    if (whitespace(this.next())) {
      this.consume();
    }
    let value = parseInt(
        digits.map(function(x) { return String.fromCharCode(x); }).join(''),
        16);
    if (value > maxAllowedCodepoint) {
      value = 0xfffd;
    }
    return value;
  } else if (this.eof()) {
    return 0xfffd;
  } else {
    return this.code_;
  }
};

/**
 * Returns true if the codepoint sequence c1, c2 are the start
 * of an escape token.
 * @param {number} c1 codepoint at pos x
 * @param {number} c2 codepoint at pos x + 1
 * @return {boolean}
 */
Tokenizer.prototype.areAValidEscape = function(c1, c2) {
  if (c1 != /* '\' */ 0x5c) {
    return false;
  }
  if (newline(c2)) {
    return false;
  }
  return true;
};

/**
 * Returns true if the next two codepoints are the start of an escape token.
 * @return {boolean} */
Tokenizer.prototype.startsWithAValidEscape = function() {
  return this.areAValidEscape(this.code_, this.next());
};

/**
 * Returns true if the codepoint sequence c1, c2, c3 are the
 * start of an identifier.
 * @param {number} c1 codepoint at pos x
 * @param {number} c2 codepoint at pos x + 1
 * @param {number} c3 codepoint at pos x + 2
 * @return {boolean}
 */
Tokenizer.prototype.wouldStartAnIdentifier = function(c1, c2, c3) {
  if (c1 === /* '-' */ 0x2d) {
    return nameStartChar(c2) ||
        c2 === /* '-' */ 0x2d ||
        this.areAValidEscape(c2, c3);
  } else if (nameStartChar(c1)) {
    return true;
  } else if (c1 === /* '\' */ 0x5c) {
    return this.areAValidEscape(c1, c2);
  } else {
    return false;
  }
};

/**
 * Returns true if the next three codepoints are the start of an identifier.
 * @return {boolean}
 */
Tokenizer.prototype.startsWithAnIdentifier = function() {
  return this.wouldStartAnIdentifier(this.code_, this.next(1), this.next(2));
};

/**
 * Returns true if the codepoint sequence c1, c2, c3 are the
 * start of a number.
 * @param {number} c1 codepoint at pos x
 * @param {number} c2 codepoint at pos x + 1
 * @param {number} c3 codepoint at pos x + 2
 * @return {boolean}
 */
Tokenizer.prototype.wouldStartANumber = function(c1, c2, c3) {
  if (c1 === /* '+' */ 0x2b || c1 === /* '-' */ 0x2d) {
    if (digit(c2)) {
      return true;
    }
    if (c2 === /* '.' */ 0x2e && digit(c3)) {
      return true;
    }
    return false;
  } else if (c1 === /* '.' */ 0x2e) {
    if (digit(c2)) {
      return true;
    }
    return false;
  } else if (digit(c1)) {
    return true;
  } else {
    return false;
  }
};

/**
 * Returns true if the next three codepoints are the start of a number.
 * @return {boolean}
 */
Tokenizer.prototype.startsWithANumber = function() {
  return this.wouldStartANumber(this.code_, this.next(1), this.next(2));
};

/** @return {string} */
Tokenizer.prototype.consumeAName = function() {
  let result = '';
  while (true) {
    this.consume();
    if (nameChar(this.code_)) {
      result += stringFromCode(this.code_);
    } else if (this.startsWithAValidEscape()) {
      result += stringFromCode(this.consumeEscape());
    } else {
      this.reconsume();
      return result;
    }
  }
};

/**
 * Consumes a number, returning it as a string representation. Numbers
 * may include +/- prefixes, ./e/E delimiters, etc. The type string will
 * be either 'integer' or 'number'. A number may be an integer.
 * @return {!parse_css.NumberToken}
 */
Tokenizer.prototype.consumeANumber = function() {
  goog.asserts.assert(
      this.wouldStartANumber(this.next(1), this.next(2), this.next(3)),
      'Internal Error: consumeANumber precondition not met');
  /** @type {string} */
  let repr = '';
  /** @type {string} */
  let type = 'integer';
  if (this.next() === /* '+' */ 0x2b || this.next() === /* '-' */ 0x2d) {
    this.consume();
    repr += stringFromCode(this.code_);  // + or -
  }
  while (digit(this.next())) {
    this.consume();
    repr += stringFromCode(this.code_);  // 0-9
  }
  if (this.next(1) === /* '.' */ 0x2e && digit(this.next(2))) {
    this.consume();
    repr += stringFromCode(this.code_);  // '.'
    type = 'number';
    while (digit(this.next())) {
      this.consume();
      repr += stringFromCode(this.code_);  // 0-9
    }
  }
  const c1 = this.next(1);
  const c2 = this.next(2);
  const c3 = this.next(3);
  if ((c1 === /* 'E' */ 0x45 || c1 === /* 'e' */ 0x65) && digit(c2)) {
    this.consume();
    repr += stringFromCode(this.code_);  // E or e
    type = 'number';
    while (digit(this.next())) {
      this.consume();
      repr += stringFromCode(this.code_);  // 0-9
    }
  } else if ((c1 === /* 'E' */ 0x45 || c1 === /* 'e' */ 0x65) &&
             (c2 === /* '+' */ 0x2b || c2 === /* '-' */ 0x2d) && digit(c3)) {
    this.consume();
    repr += stringFromCode(this.code_);  // E or e
    this.consume();
    repr += stringFromCode(this.code_);  // + or -
    type = 'number';
    while (digit(this.next())) {
      this.consume();
      repr += stringFromCode(this.code_);  // 0-9
    }
  }
  const numberToken = new parse_css.NumberToken();
  numberToken.type = type;
  numberToken.value = this.convertAStringToANumber(repr);
  numberToken.repr = repr;
  return numberToken;
};

/**
 * Converts a numerical representation of a string to a number.
 * @param {string} string
 * @return {number}
 */
Tokenizer.prototype.convertAStringToANumber = function(string) {
  // CSS's number rules are identical to JS, afaik.
  return +string;
};

/**
 * Consumes ?. Returns nothing.
 */
Tokenizer.prototype.consumeTheRemnantsOfABadURL = function() {
  while (true) {
    this.consume();
    if (this.code_ === /* '-' */ 0x2d || this.eof()) {
      return;
    } else if (this.startsWithAValidEscape()) {
      this.consumeEscape();
    }
  }
};

/**
 * The abstract superclass for all tokens.
 * @constructor
 */
parse_css.CSSParserToken = function() {
  /** @type {number} */
  this.line = 1;
  /** @type {number} */
  this.col = 0;
};

/** @type {string} */
parse_css.CSSParserToken.prototype.tokenType = 'abstract';

/** @return {!Object} */
parse_css.CSSParserToken.prototype.toJSON = function() {
  return {
    'tokenType': this.tokenType,
    'line': this.line,
    'col': this.col
  };
};

/** @return {string} */
parse_css.CSSParserToken.prototype.toString = function() {
  return this.tokenType;
};

/** @return {string} */
parse_css.CSSParserToken.prototype.toSource = function() { return '' + this; };

/**
 * Enum for the type of error that's being emitted.
 * @enum {string}
 */
parse_css.ErrorType = {
  'TOKENIZATION': 'TOKENIZATION',
  'PARSING': 'PARSING',
  'SELECTORS': 'SELECTORS'
};

/**
 * @param {parse_css.ErrorType} errorType
 * @param {string} msg
 * @constructor
 * @extends {parse_css.CSSParserToken}
 */
parse_css.ErrorToken = function(errorType, msg) {
  goog.base(this);
  /** @override @type {parse_css.ErrorType} */
  this.errorType = errorType;
  /** @override @type {string} */
  this.msg = msg;
};
goog.inherits(parse_css.ErrorToken, parse_css.CSSParserToken);

/** @type {string} */
parse_css.ErrorToken.prototype.tokenType = 'ERROR';

/** @return {string} */
parse_css.ErrorToken.prototype.toString = function() {
  const json = this.toJSON();
  return ':' + json['line'] + ':' +
      json['col'] + ' ' + this.errorType + ' - ' + this.msg;
};

/** @return {!Object} */
parse_css.ErrorToken.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['errorType'] = this.errorType;
  json['msg'] = this.msg;
  return json;
};

/**
 * @constructor
 * @extends {parse_css.CSSParserToken}
 */
parse_css.WhitespaceToken = function() {
  goog.base(this);
};
goog.inherits(parse_css.WhitespaceToken, parse_css.CSSParserToken);

/** @type {string} */
parse_css.WhitespaceToken.prototype.tokenType = 'WHITESPACE';

/** @return {string} */
parse_css.WhitespaceToken.prototype.toString = function() { return 'WS'; };

/** @return {string} */
parse_css.WhitespaceToken.prototype.toSource = function() { return ' '; };

/**
 * @constructor
 * @extends {parse_css.CSSParserToken}
 */
parse_css.CDOToken = function() {
  goog.base(this);
};
goog.inherits(parse_css.CDOToken, parse_css.CSSParserToken);

/** @type {string} */
parse_css.CDOToken.prototype.tokenType = 'CDO';

/** @return {string} */
parse_css.CDOToken.prototype.toSource = function() { return '<!--'; };

/**
 * @constructor
 * @extends {parse_css.CSSParserToken}
 */
parse_css.CDCToken = function() {
  goog.base(this);
};
goog.inherits(parse_css.CDCToken, parse_css.CSSParserToken);

/** @type {string} */
parse_css.CDCToken.prototype.tokenType = 'CDC';

/** @return {string} */
parse_css.CDCToken.prototype.toSource = function() { return '-->'; };

/**
 * @constructor
 * @extends {parse_css.CSSParserToken}
 */
parse_css.ColonToken = function() {
  goog.base(this);
};
goog.inherits(parse_css.ColonToken, parse_css.CSSParserToken);

/** @type {string} */
parse_css.ColonToken.prototype.tokenType = ':';

/**
 * @constructor
 * @extends {parse_css.CSSParserToken}
 */
parse_css.SemicolonToken = function() {
  goog.base(this);
};
goog.inherits(parse_css.SemicolonToken, parse_css.CSSParserToken);

/** @type {string} */
parse_css.SemicolonToken.prototype.tokenType = ';';

/**
 * @constructor
 * @extends {parse_css.CSSParserToken}
 */
parse_css.CommaToken = function() {
  goog.base(this);
};
goog.inherits(parse_css.CommaToken, parse_css.CSSParserToken);

/** @type {string} */
parse_css.CommaToken.prototype.tokenType = ',';

/**
 * @constructor
 * @extends {parse_css.CSSParserToken}
 */
parse_css.GroupingToken = function() {
  goog.base(this);
  this.value = null;
  this.mirror = null;
};
goog.inherits(parse_css.GroupingToken, parse_css.CSSParserToken);

/**
 * @constructor
 * @extends {parse_css.GroupingToken}
 */
parse_css.OpenCurlyToken = function() {
  goog.base(this);
  /** @type {string} */
  this.value = '{';
  /** @type {string} */
  this.mirror = '}';
};
goog.inherits(parse_css.OpenCurlyToken, parse_css.GroupingToken);

/** @type {string} */
parse_css.OpenCurlyToken.prototype.tokenType = '{';

/**
 * @constructor
 * @extends {parse_css.GroupingToken}
 */
parse_css.CloseCurlyToken = function() {
  goog.base(this);
  /** @type {string} */
  this.value = '}';
  /** @type {string} */
  this.mirror = '{';
};
goog.inherits(parse_css.CloseCurlyToken, parse_css.GroupingToken);

/** @type {string} */
parse_css.CloseCurlyToken.prototype.tokenType = '}';

/**
 * @constructor
 * @extends {parse_css.GroupingToken}
 */
parse_css.OpenSquareToken = function() {
  goog.base(this);
  /** @type {string} */
  this.value = '[';
  /** @type {string} */
  this.mirror = ']';
};
goog.inherits(parse_css.OpenSquareToken, parse_css.GroupingToken);

/** @type {string} */
parse_css.OpenSquareToken.prototype.tokenType = '[';

/**
 * @constructor
 * @extends {parse_css.GroupingToken}
 */
parse_css.CloseSquareToken = function() {
  goog.base(this);
  /** @type {string} */
  this.value = ']';
  /** @type {string} */
  this.mirror = '[';
};
goog.inherits(parse_css.CloseSquareToken, parse_css.GroupingToken);

/** @type {string} */
parse_css.CloseSquareToken.prototype.tokenType = ']';

/**
 * @constructor
 * @extends {parse_css.GroupingToken}
 */
parse_css.OpenParenToken = function() {
  goog.base(this);
  /** @type {string} */
  this.value = '(';
  /** @type {string} */
  this.mirror = ')';
};
goog.inherits(parse_css.OpenParenToken, parse_css.GroupingToken);

/** @type {string} */
parse_css.OpenParenToken.prototype.tokenType = '(';

/**
 * @constructor
 * @extends {parse_css.GroupingToken}
 */
parse_css.CloseParenToken = function() {
  goog.base(this);
  /** @type {string} */
  this.value = ')';
  /** @type {string} */
  this.mirror = '(';
};
goog.inherits(parse_css.CloseParenToken, parse_css.GroupingToken);

/** @type {string} */
parse_css.CloseParenToken.prototype.tokenType = ')';

/**
 * @constructor
 * @extends {parse_css.CSSParserToken}
 */
parse_css.IncludeMatchToken = function() {
  goog.base(this);
};
goog.inherits(parse_css.IncludeMatchToken, parse_css.CSSParserToken);

/** @type {string} */
parse_css.IncludeMatchToken.prototype.tokenType = '~=';

/**
 * @constructor
 * @extends {parse_css.CSSParserToken}
 */
parse_css.DashMatchToken = function() {
  goog.base(this);
};
goog.inherits(parse_css.DashMatchToken, parse_css.CSSParserToken);

/** @type {string} */
parse_css.DashMatchToken.prototype.tokenType = '|=';

/**
 * @constructor
 * @extends {parse_css.CSSParserToken}
 */
parse_css.PrefixMatchToken = function() {
  goog.base(this);
};
goog.inherits(parse_css.PrefixMatchToken, parse_css.CSSParserToken);

/** @type {string} */
parse_css.PrefixMatchToken.prototype.tokenType = '^=';

/**
 * @constructor
 * @extends {parse_css.CSSParserToken}
 */
parse_css.SuffixMatchToken = function() {
  goog.base(this);
};
goog.inherits(parse_css.SuffixMatchToken, parse_css.CSSParserToken);

/** @type {string} */
parse_css.SuffixMatchToken.prototype.tokenType = '$=';

/**
 * @constructor
 * @extends {parse_css.CSSParserToken}
 */
parse_css.SubstringMatchToken = function() {
  goog.base(this);
};
goog.inherits(parse_css.SubstringMatchToken, parse_css.CSSParserToken);

/** @type {string} */
parse_css.SubstringMatchToken.prototype.tokenType = '*=';

/**
 * @constructor
 * @extends {parse_css.CSSParserToken}
 */
parse_css.ColumnToken = function() {
  goog.base(this);
};
goog.inherits(parse_css.ColumnToken, parse_css.CSSParserToken);

/** @type {string} */
parse_css.ColumnToken.prototype.tokenType = '||';

/**
 * @constructor
 * @extends {parse_css.CSSParserToken}
 */
parse_css.EOFToken = function() {
  goog.base(this);
};
goog.inherits(parse_css.EOFToken, parse_css.CSSParserToken);

/** @type {string} */
parse_css.EOFToken.prototype.tokenType = 'EOF_TOKEN';

/** @return {string} */
parse_css.EOFToken.prototype.toSource = function() { return ''; };

/**
 * @param {number} code
 * @constructor
 * @extends {parse_css.CSSParserToken}
 */
parse_css.DelimToken = function(code) {
  goog.base(this);
  /** @type {string} */
  this.value = stringFromCode(code);
};
goog.inherits(parse_css.DelimToken, parse_css.CSSParserToken);

/** @type {string} */
parse_css.DelimToken.prototype.tokenType = 'DELIM';

/** @return {string} */
parse_css.DelimToken.prototype.toString = function() {
  return 'DELIM(' + this.value + ')';
};

/** @return {!Object} */
parse_css.DelimToken.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['value'] = this.value;
  return json;
};

/** @return {string} */
parse_css.DelimToken.prototype.toSource = function() {
  if (this.value === '\\') {
    return '\\\n';
  } else {
    return this.value;
  }
};

/**
 * @constructor
 * @extends {parse_css.CSSParserToken}
 */
parse_css.StringValuedToken = function() {
  goog.base(this);
  /** @type {string} */
  this.value = 'abstract';
};
goog.inherits(parse_css.StringValuedToken, parse_css.CSSParserToken);

/**
 * @param {string} str
 * @return {boolean}
 */
parse_css.StringValuedToken.prototype.ASCIIMatch = function(str) {
  return this.value.toLowerCase() === str.toLowerCase();
};

/** @return {!Object} */
parse_css.StringValuedToken.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['value'] = this.value;
  return json;
};

/**
 * @param {string} val
 * @constructor
 * @extends {parse_css.StringValuedToken}
 */
parse_css.IdentToken = function(val) {
  goog.base(this);
  /** @type {string} */
  this.value = val;
};
goog.inherits(parse_css.IdentToken, parse_css.StringValuedToken);

/** @type {string} */
parse_css.IdentToken.prototype.tokenType = 'IDENT';

/** @return {string} */
parse_css.IdentToken.prototype.toString = function() {
  return 'IDENT(' + this.value + ')';
};

/** @return {string} */
parse_css.IdentToken.prototype.toSource = function() {
  return escapeIdent(this.value);
};

/**
 * @param {string} val
 * @constructor
 * @extends {parse_css.StringValuedToken}
 */
parse_css.FunctionToken = function(val) {
  goog.base(this);
  /** @type {string} */
  this.value = val;
  /** @type {string} */
  this.mirror = ')';
};
goog.inherits(parse_css.FunctionToken, parse_css.StringValuedToken);

/** @type {string} */
parse_css.FunctionToken.prototype.tokenType = 'FUNCTION_TOKEN';

/** @return {string} */
parse_css.FunctionToken.prototype.toString = function() {
  return 'FUNCTION_TOKEN(' + this.value + ')';
};

/** @return {string} */
parse_css.FunctionToken.prototype.toSource = function() {
  return escapeIdent(this.value) + '(';
};

/**
 * @param {string} val
 * @constructor
 * @extends {parse_css.StringValuedToken}
 */
parse_css.AtKeywordToken = function(val) {
  goog.base(this);
  /** @type {string} */
  this.value = val;
};
goog.inherits(parse_css.AtKeywordToken, parse_css.StringValuedToken);

/** @type {string} */
parse_css.AtKeywordToken.prototype.tokenType = 'AT-KEYWORD';

/** @return {string} */
parse_css.AtKeywordToken.prototype.toString = function() {
  return 'AT(' + this.value + ')';
};

/** @return {string} */
parse_css.AtKeywordToken.prototype.toSource = function() {
  return '@' + escapeIdent(this.value);
};

/**
 * @param {string} val
 * @constructor
 * @extends {parse_css.StringValuedToken}
 */
parse_css.HashToken = function(val) {
  goog.base(this);
  /** @type {string} */
  this.value = val;
  /** @type {string} */
  this.type = 'unrestricted';
};
goog.inherits(parse_css.HashToken, parse_css.StringValuedToken);

/** @type {string} */
parse_css.HashToken.prototype.tokenType = 'HASH';

/** @return {string} */
parse_css.HashToken.prototype.toString = function() {
  return 'HASH(' + this.value + ')';
};

/** @return {!Object} */
parse_css.HashToken.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['value'] = this.value;
  json['type'] = this.type;
  return json;
};

/** @return {string} */
parse_css.HashToken.prototype.toSource = function() {
  if (this.type === 'id') {
    return '#' + escapeIdent(this.value);
  } else {
    return '#' + escapeHash(this.value);
  }
};

/**
 * @param {string} val
 * @constructor
 * @extends {parse_css.StringValuedToken}
 */
parse_css.StringToken = function(val) {
  goog.base(this);
  /** @type {string} */
  this.value = val;
};
goog.inherits(parse_css.StringToken, parse_css.StringValuedToken);

/** @type {string} */
parse_css.StringToken.prototype.tokenType = 'STRING';

/** @return {string} */
parse_css.StringToken.prototype.toString = function() {
  return '"' + escapeString(this.value) + '"';
};

/**
 * @param {string} val
 * @constructor
 * @extends {parse_css.StringValuedToken}
 */
parse_css.URLToken = function(val) {
  goog.base(this);
  /** @type {string} */
  this.value = val;
};
goog.inherits(parse_css.URLToken, parse_css.StringValuedToken);

/** @type {string} */
parse_css.URLToken.prototype.tokenType = 'URL';

/** @return {string} */
parse_css.URLToken.prototype.toString = function() {
  return 'URL(' + this.value + ')';
};

/** @return {string} */
parse_css.URLToken.prototype.toSource = function() {
  return 'url("' + escapeString(this.value) + '")';
};

/**
 * @constructor
 * @extends {parse_css.CSSParserToken}
 */
parse_css.NumberToken = function() {
  goog.base(this);
  this.value = null;
  /** @type {string} */
  this.type = 'integer';
  /** @type {string} */
  this.repr = '';
};
goog.inherits(parse_css.NumberToken, parse_css.CSSParserToken);

/** @type {string} */
parse_css.NumberToken.prototype.tokenType = 'NUMBER';

/** @return {string} */
parse_css.NumberToken.prototype.toString = function() {
  if (this.type === 'integer') {
    return 'INT(' + this.value + ')';
  }
  return 'NUMBER(' + this.value + ')';
};

/** @return {!Object} */
parse_css.NumberToken.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['value'] = this.value;
  json['type'] = this.type;
  json['repr'] = this.repr;
  return json;
};

/** @return {string} */
parse_css.NumberToken.prototype.toSource = function() {
  return this.repr;
};

/**
 * @constructor
 * @extends {parse_css.CSSParserToken}
 */
parse_css.PercentageToken = function() {
  goog.base(this);
  this.value = null;
  /** @type {string} */
  this.repr = '';
};
goog.inherits(parse_css.PercentageToken, parse_css.CSSParserToken);

/** @type {string} */
parse_css.PercentageToken.prototype.tokenType = 'PERCENTAGE';

/** @return {string} */
parse_css.PercentageToken.prototype.toString = function() {
  return 'PERCENTAGE(' + this.value + ')';
};

/** @return {!Object} */
parse_css.PercentageToken.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['value'] = this.value;
  json['repr'] = this.repr;
  return json;
};

/** @return {string} */
parse_css.PercentageToken.prototype.toSource = function() {
  return this.repr + '%';
};

/**
 * @constructor
 * @extends {parse_css.CSSParserToken}
 */
parse_css.DimensionToken = function() {
  goog.base(this);
  this.value = null;
  /** @type {string} */
  this.type = 'integer';
  /** @type {string} */
  this.repr = '';
  /** @type {string} */
  this.unit = '';
};
goog.inherits(parse_css.DimensionToken, parse_css.CSSParserToken);

/** @type {string} */
parse_css.DimensionToken.prototype.tokenType = 'DIMENSION';

/** @return {string} */
parse_css.DimensionToken.prototype.toString = function() {
  return 'DIM(' + this.value + ',' + this.unit + ')';
};

/** @return {!Object} */
parse_css.DimensionToken.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['value'] = this.value;
  json['type'] = this.type;
  json['repr'] = this.repr;
  json['unit'] = this.unit;
  return json;
};

/** @return {string} */
parse_css.DimensionToken.prototype.toSource = function() {
  const source = this.repr;
  let unit = escapeIdent(this.unit);
  if (unit[0].toLowerCase() === 'e' &&
      (unit[1] === '-' || digit(unit.charCodeAt(1)))) {
    // Unit is ambiguous with scinot
    // Remove the leading "e", replace with escape.
    unit = '\\65 ' + unit.slice(1, unit.length);
  }
  return source + unit;
};

/**
 * @param {string} string
 * @return {string}
 */
function escapeIdent(string) {
  string = '' + string;
  let result = '';
  const firstcode = string.charCodeAt(0);
  for (let i = 0; i < string.length; i++) {
    const code = string.charCodeAt(i);
    // Preprocessor removes this character. Cannot happen.
    goog.asserts.assert(
        code !== 0x0,
        'Internal Error: Invalid character. The input contains U+0000.');
    if (between(code, 0x1, 0x1f) || code === 0x7f ||
        (i === 0 && digit(code)) ||
        (i === 1 && digit(code) && firstcode === /* '-' */ 0x2d)) {
      result += '\\' + code.toString(16) + ' ';
    } else if (code >= 0x80 || code === /* '-' */ 0x2d ||
               code === /* '_' */ 0x5f ||
               digit(code) || letter(code)) {
      result += string[i];
    } else {
      result += '\\' + string[i];
    }
  }
  return result;
}

/**
 * @param {string} string
 * @return {string}
 */
function escapeHash(string) {
  // Escapes the contents of "unrestricted"-type hash tokens.
  // Won't preserve the ID-ness of "id"-type hash tokens;
  // use escapeIdent() for that.
  string = '' + string;
  let result = '';
  const firstcode = string.charCodeAt(0);
  for (let i = 0; i < string.length; i++) {
    const code = string.charCodeAt(i);
    // Preprocessor removes this character. Cannot happen.
    goog.asserts.assert(
        code !== 0x0,
        'Internal Error: Invalid character. The input contains U+0000.');

    if (code >= 0x80 || code === /* '-' */ 0x2d || code === /* '_' */ 0x5f ||
        digit(code) || letter(code)) {
      result += string[i];
    } else {
      result += '\\' + code.toString(16) + ' ';
    }
  }
  return result;
}

/**
 * @param {string} string
 * @return {string}
 */
function escapeString(string) {
  string = '' + string;
  let result = '';
  for (let i = 0; i < string.length; i++) {
    const code = string.charCodeAt(i);

    // Preprocessor removes this character. Cannot happen.
    goog.asserts.assert(
        code !== 0x0,
        'Internal Error: Invalid character. The input contains U+0000.');

    if (between(code, 0x1, 0x1f) || code === 0x7f) {
      result += '\\' + code.toString(16) + ' ';
    } else if (code === /* '"' */ 0x22 || code === /* '\' */ 0x5c) {
      result += '\\' + string[i];
    } else {
      result += string[i];
    }
  }
  return result;
}
