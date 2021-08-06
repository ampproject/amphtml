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
goog.module('tokenize_css');
const asserts = goog.require('goog.asserts');
const {ValidationError} = goog.require('amp.validator.protogenerated');

/**
 * Returns an array of Tokens.
 *
 * Token Hierarchy:
 * Token (abstract)
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
 * @param {number|undefined} line
 * @param {number|undefined} col
 * @param {!Array<!ErrorToken>} errors output array for the errors.
 * @return {!Array<!Token>}
 */
const tokenize = function(strIn, line, col, errors) {
  const tokenizer = new Tokenizer(strIn, line, col, errors);
  return tokenizer.getTokens();
};
exports.tokenize = tokenize;

/**
 * @param {number} num
 * @param {number} first
 * @param {number} last
 * @return {boolean}
 */
function between(num, first, last) {
  return num >= first && num <= last;
}

/**
 * @param {number} code
 * @return {boolean}
 */
function digit(code) {
  return between(code, /* '0' */ 0x30, /* '9' */ 0x39);
}

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
function letter(code) {
  return upperCaseLetter(code) || lowerCaseLetter(code);
}

/**
 * @param {number} code
 * @return {boolean}
 */
function nonAscii(code) {
  return code >= 0x80;
}

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
  return between(code, 0, 8) || code === 0xb || between(code, 0xe, 0x1f) ||
      code === 0x7f;
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
    if (code === /* '\r' */ 0xd || code === 0xc) {
      code = /* '\n' */ 0xa;
    }
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
 * @private
 */
class Tokenizer {
  /**
   * @param {string} strIn
   * @param {number|undefined} line
   * @param {number|undefined} col
   * @param {!Array<!ErrorToken>} errors output array for the
   *     errors.
   */
  constructor(strIn, line, col, errors) {
    this.tokens_ = [];
    /**
     * @private
     * @type {!Array<!ErrorToken>}
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
    let eofToken;
    /** @private @type {!Array<number>} */
    this.lineByPos_ = [];
    /** @private @type {!Array<number>} */
    this.colByPos_ = [];
    let currentLine = line || 1;
    let currentCol = col || 0;
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
    eofToken = new EOFToken();
    eofToken.line = currentLine;
    eofToken.col = currentCol;

    let iterationCount = 0;
    while (!this.eof(this.next())) {
      const token = this.consumeAToken();
      if (token.tokenType === TokenType.ERROR) {
        this.errors_.push(/** @type {!ErrorToken} */ (token));
      } else {
        this.tokens_.push(token);
      }
      iterationCount++;
      asserts.assert(
          iterationCount <= this.codepoints_.length * 2,
          'Internal Error: infinite-looping');
    }
    this.tokens_.push(eofToken);
  }

  /**
   * @return {number}
   */
  getLine() {
    const pos = Math.min(this.pos_, this.lineByPos_.length - 1);
    return (pos < 0) ? 1 : this.lineByPos_[this.pos_];
  }

  /**
   * @return {number}
   */
  getCol() {
    const pos = Math.min(this.pos_, this.colByPos_.length - 1);
    return (pos < 0) ? 0 : this.colByPos_[this.pos_];
  }

  /**
   * @return {!Array<!Token>}
   */
  getTokens() {
    return this.tokens_;
  }

  /**
   * Returns the codepoint at the given position.
   * @param {number} num
   * @return {number}
   */
  codepoint(num) {
    if (num >= this.codepoints_.length) {
      return -1;
    }
    return this.codepoints_[num];
  }

  /**
   * Peeks ahead and returns the codepoint opt_num positions ahead.
   * @param {number=} opt_num
   * @return {number}
   */
  next(opt_num) {
    const num = opt_num || 1;
    asserts.assert(
        num <= 3, 'Spec Error: no more than three codepoints of lookahead.');
    return this.codepoint(this.pos_ + num);
  }

  /**
   * Moves ahead opt_num positions in the string. May move past the
   * end of the string.
   * @param {number=} opt_num
   */
  consume(opt_num) {
    const num = opt_num || 1;
    this.pos_ += num;
    this.code_ = this.codepoint(this.pos_);
  }

  /**
   * Backs up exactly one position in the string.
   */
  reconsume() {
    this.pos_ -= 1;
    // TODO(johannes): Oddly, adding the following breaks the test with
    // internal errors. Investigate.
    // this.code_ = this.codepoint(this.pos_);
  }

  /**
   * @param {number=} opt_codepoint
   * @return {boolean}
   */
  eof(opt_codepoint) {
    const codepoint = opt_codepoint || this.code_;
    return codepoint === -1;
  }

  /** @return {!Token} */
  consumeAToken() {
    this.consumeComments();
    this.consume();
    const mark = new Token();
    mark.line = this.getLine();
    mark.col = this.getCol();
    if (whitespace(this.code_)) {
      // Merge consecutive whitespace into one token.
      while (whitespace(this.next())) {
        this.consume();
      }
      return mark.copyPosTo(new WhitespaceToken());
    } else if (this.code_ === /* '"' */ 0x22) {
      return mark.copyPosTo(this.consumeAStringToken());
    } else if (this.code_ === /* '#' */ 0x23) {
      if (nameChar(this.next()) ||
          this.areAValidEscape(this.next(1), this.next(2))) {
        let type = null;
        if (this.wouldStartAnIdentifier(
                this.next(1), this.next(2), this.next(3))) {
          type = 'id';
        }
        const token = new HashToken();
        token.value = this.consumeAName();
        if (type !== null) {
          token.type = type;
        }
        return mark.copyPosTo(token);
      } else {
        return mark.copyPosTo(new DelimToken(this.code_));
      }
    } else if (this.code_ === /* '$' */ 0x24) {
      if (this.next() === /* '=' */ 0x3d) {
        this.consume();
        return mark.copyPosTo(new SuffixMatchToken());
      } else {
        return mark.copyPosTo(new DelimToken(this.code_));
      }
    } else if (this.code_ === /* ''' */ 0x27) {
      return mark.copyPosTo(this.consumeAStringToken());
    } else if (this.code_ === /* '(' */ 0x28) {
      return mark.copyPosTo(new OpenParenToken());
    } else if (this.code_ === /* ')' */ 0x29) {
      return mark.copyPosTo(new CloseParenToken());
    } else if (this.code_ === /* '*' */ 0x2a) {
      if (this.next() === /* '=' */ 0x3d) {
        this.consume();
        return mark.copyPosTo(new SubstringMatchToken());
      } else {
        return mark.copyPosTo(new DelimToken(this.code_));
      }
    } else if (this.code_ === /* '+' */ 0x2b) {
      if (this./*OK*/ startsWithANumber()) {
        this.reconsume();
        return mark.copyPosTo(this.consumeANumericToken());
      } else {
        return mark.copyPosTo(new DelimToken(this.code_));
      }
    } else if (this.code_ === /* ',' */ 0x2c) {
      return mark.copyPosTo(new CommaToken());
    } else if (this.code_ === /* '-' */ 0x2d) {
      if (this./*OK*/ startsWithANumber()) {
        this.reconsume();
        return mark.copyPosTo(this.consumeANumericToken());
      } else if (
          this.next(1) === /* '-' */ 0x2d && this.next(2) === /* '>' */ 0x3e) {
        this.consume(2);
        return mark.copyPosTo(new CDCToken());
      } else if (this./*OK*/ startsWithAnIdentifier()) {
        this.reconsume();
        return mark.copyPosTo(this.consumeAnIdentlikeToken());
      } else {
        return mark.copyPosTo(new DelimToken(this.code_));
      }
    } else if (this.code_ === /* '.' */ 0x2e) {
      if (this./*OK*/ startsWithANumber()) {
        this.reconsume();
        return mark.copyPosTo(this.consumeANumericToken());
      } else {
        return mark.copyPosTo(new DelimToken(this.code_));
      }
    } else if (this.code_ === /* ':' */ 0x3a) {
      return mark.copyPosTo(new ColonToken());
    } else if (this.code_ === /* ';' */ 0x3b) {
      return mark.copyPosTo(new SemicolonToken());
    } else if (this.code_ === /* '<' */ 0x3c) {
      if (this.next(1) === /* '!' */ 0x21 && this.next(2) === /* '-' */ 0x2d &&
          this.next(3) === /* '-' */ 0x2d) {
        this.consume(3);
        return mark.copyPosTo(new CDOToken());
      } else {
        return mark.copyPosTo(new DelimToken(this.code_));
      }
    } else if (this.code_ === /* '@' */ 0x40) {
      if (this.wouldStartAnIdentifier(
              this.next(1), this.next(2), this.next(3))) {
        const token = new AtKeywordToken();
        token.value = this.consumeAName();
        return mark.copyPosTo(token);
      } else {
        return mark.copyPosTo(new DelimToken(this.code_));
      }
    } else if (this.code_ === /* '[' */ 0x5b) {
      return mark.copyPosTo(new OpenSquareToken());
    } else if (this.code_ === /* '\' */ 0x5c) {
      if (this./*OK*/ startsWithAValidEscape()) {
        this.reconsume();
        return mark.copyPosTo(this.consumeAnIdentlikeToken());
      } else {
        // This condition happens if we are in consumeAToken (this method),
        // the current codepoint is 0x5c (\) and the next codepoint is a
        // newline (\n).
        return mark.copyPosTo(new ErrorToken(
            ValidationError.Code.CSS_SYNTAX_STRAY_TRAILING_BACKSLASH,
            ['style']));
      }
    } else if (this.code_ === /* ']' */ 0x5d) {
      return mark.copyPosTo(new CloseSquareToken());
    } else if (this.code_ === /* '^' */ 0x5e) {
      if (this.next() === /* '=' */ 0x3d) {
        this.consume();
        return mark.copyPosTo(new PrefixMatchToken());
      } else {
        return mark.copyPosTo(new DelimToken(this.code_));
      }
    } else if (this.code_ === /* '{' */ 0x7b) {
      return mark.copyPosTo(new OpenCurlyToken());
    } else if (this.code_ === /* '|' */ 0x7c) {
      if (this.next() === /* '=' */ 0x3d) {
        this.consume();
        return mark.copyPosTo(new DashMatchToken());
      } else if (this.next() === /* '|' */ 0x7c) {
        this.consume();
        return mark.copyPosTo(new ColumnToken());
      } else {
        return mark.copyPosTo(new DelimToken(this.code_));
      }
    } else if (this.code_ === /* '}' */ 0x7d) {
      return mark.copyPosTo(new CloseCurlyToken());
    } else if (this.code_ === /* '~' */ 0x7e) {
      if (this.next() === /* '=' */ 0x3d) {
        this.consume();
        return mark.copyPosTo(new IncludeMatchToken());
      } else {
        return mark.copyPosTo(new DelimToken(this.code_));
      }
    } else if (digit(this.code_)) {
      this.reconsume();
      return mark.copyPosTo(this.consumeANumericToken());
    } else if (nameStartChar(this.code_)) {
      this.reconsume();
      return mark.copyPosTo(this.consumeAnIdentlikeToken());
    } else if (this.eof()) {
      return mark.copyPosTo(new EOFToken());
    } else {
      const token = new DelimToken(this.code_);
      return mark.copyPosTo(token);
    }
  }

  /**
   * Consume everything starting with /* and ending at * / (ignore the space),
   * emitting a parse error if we hit the end of the file. Returns nothing.
   */
  consumeComments() {
    const mark = new Token();
    mark.line = this.getLine();
    mark.col = this.getCol();
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
          this.errors_.push(mark.copyPosTo(new ErrorToken(
              ValidationError.Code.CSS_SYNTAX_UNTERMINATED_COMMENT,
              ['style'])));
          return;
        }
      }
    }
  }

  /**
   * Consumes a token that starts with a number.
   * The specific type is one of:
   *   NumberToken, DimensionToken, PercentageToken
   * @return {!Token}
   */
  consumeANumericToken() {
    asserts.assert(
        this.wouldStartANumber(this.next(1), this.next(2), this.next(3)),
        'Internal Error: consumeANumericToken precondition not met');
    /** @type {!NumberToken} */
    const num = this.consumeANumber();
    if (this.wouldStartAnIdentifier(this.next(1), this.next(2), this.next(3))) {
      const token = new DimensionToken();
      token.value = num.value;
      token.repr = num.repr;
      token.type = num.type;
      token.unit = this.consumeAName();
      return token;
    } else if (this.next() === /* '%' */ 0x25) {
      this.consume();
      const token = new PercentageToken();
      token.value = num.value;
      token.repr = num.repr;
      return token;
    }
    return num;
  }

  /**
   * Consume an identifier-like token.
   * The specific type is one of:
   *   FunctionToken, URLToken, ErrorToken, IdentToken
   * @return {!Token}
   */
  consumeAnIdentlikeToken() {
    const name = this.consumeAName();
    if (name.toLowerCase() === 'url' && this.next() === /* '(' */ 0x28) {
      this.consume();
      while (whitespace(this.next(1)) && whitespace(this.next(2))) {
        this.consume();
      }
      if (this.next() === /* '"' */ 0x22 || this.next() === /* ''' */ 0x27) {
        const token = new FunctionToken();
        token.value = name;
        return token;
      } else if (
          whitespace(this.next()) &&
          (this.next(2) === /* '"' */ 0x22 ||
           this.next(2) === /* ''' */ 0x27)) {
        const token = new FunctionToken();
        token.value = name;
        return token;
      } else {
        return this.consumeAURLToken();
      }
    } else if (this.next() === /* '(' */ 0x28) {
      this.consume();
      const token = new FunctionToken();
      token.value = name;
      return token;
    } else {
      const token = new IdentToken();
      token.value = name;
      return token;
    }
  }

  /**
   * Consume a string token.
   * The specific type is one of:
   *   StringToken, ErrorToken
   * @return {!Token}
   */
  consumeAStringToken() {
    asserts.assert(
        (this.code_ === /* '"' */ 0x22) || (this.code_ === /* ''' */ 0x27),
        'Internal Error: consumeAStringToken precondition not met');
    const endingCodePoint = this.code_;
    let string = '';
    while (true) {
      this.consume();
      if (this.code_ === endingCodePoint || this.eof()) {
        const token = new StringToken();
        token.value = string;
        return token;
      } else if (newline(this.code_)) {
        this.reconsume();
        return new ErrorToken(
            ValidationError.Code.CSS_SYNTAX_UNTERMINATED_STRING, ['style']);
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
  }

  /**
   * Consume an URL token.
   * The specific type is one of:
   *   URLToken, ErrorToken
   * @return {!Token}
   */
  consumeAURLToken() {
    const token = new URLToken();
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
          return new ErrorToken(
              ValidationError.Code.CSS_SYNTAX_BAD_URL, ['style']);
        }
      } else if (
          this.code_ === /* '"' */ 0x22 || this.code_ === /* ''' */ 0x27 ||
          this.code_ === /* '(' */ 0x28 || nonPrintable(this.code_)) {
        this.consumeTheRemnantsOfABadURL();
        return new ErrorToken(
            ValidationError.Code.CSS_SYNTAX_BAD_URL, ['style']);
      } else if (this.code_ === /* '\' */ 0x5c) {
        if (this./*OK*/ startsWithAValidEscape()) {
          token.value += stringFromCode(this.consumeEscape());
        } else {
          this.consumeTheRemnantsOfABadURL();
          return new ErrorToken(
              ValidationError.Code.CSS_SYNTAX_BAD_URL, ['style']);
        }
      } else {
        token.value += stringFromCode(this.code_);
      }
    }
  }

  /**
   * Consume an escaped character, ex: \a212f3, followed by any whitespace.
   * Returns the numerical value of the character. If the codepoint following
   * the '\' character is not a hex code and not EOF, returns that codepoint.
   * @return {number}
   */
  consumeEscape() {
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
          digits
              .map(function(x) {
                return String.fromCharCode(x);
              })
              .join(''),
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
  }

  /**
   * Returns true if the codepoint sequence c1, c2 are the start
   * of an escape token.
   * @param {number} c1 codepoint at pos x
   * @param {number} c2 codepoint at pos x + 1
   * @return {boolean}
   */
  areAValidEscape(c1, c2) {
    if (c1 != /* '\' */ 0x5c) {
      return false;
    }
    if (newline(c2)) {
      return false;
    }
    return true;
  }

  /**
   * Returns true if the next two codepoints are the start of an escape token.
   * @return {boolean}
   */
  /*OK*/ startsWithAValidEscape() {
    return this.areAValidEscape(this.code_, this.next());
  }

  /**
   * Returns true if the codepoint sequence c1, c2, c3 are the
   * start of an identifier.
   * @param {number} c1 codepoint at pos x
   * @param {number} c2 codepoint at pos x + 1
   * @param {number} c3 codepoint at pos x + 2
   * @return {boolean}
   */
  wouldStartAnIdentifier(c1, c2, c3) {
    if (c1 === /* '-' */ 0x2d) {
      return nameStartChar(c2) || c2 === /* '-' */ 0x2d ||
          this.areAValidEscape(c2, c3);
    } else if (nameStartChar(c1)) {
      return true;
    } else if (c1 === /* '\' */ 0x5c) {
      return this.areAValidEscape(c1, c2);
    } else {
      return false;
    }
  }

  /**
   * Returns true if the next three codepoints are the start of an identifier.
   * @return {boolean}
   */
  /*OK*/ startsWithAnIdentifier() {
    return this.wouldStartAnIdentifier(this.code_, this.next(1), this.next(2));
  }

  /**
   * Returns true if the codepoint sequence c1, c2, c3 are the
   * start of a number.
   * @param {number} c1 codepoint at pos x
   * @param {number} c2 codepoint at pos x + 1
   * @param {number} c3 codepoint at pos x + 2
   * @return {boolean}
   */
  wouldStartANumber(c1, c2, c3) {
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
  }

  /**
   * Returns true if the next three codepoints are the start of a number.
   * @return {boolean}
   */
  /*OK*/ startsWithANumber() {
    return this.wouldStartANumber(this.code_, this.next(1), this.next(2));
  }

  /** @return {string} */
  consumeAName() {
    let result = '';
    while (true) {
      this.consume();
      if (nameChar(this.code_)) {
        result += stringFromCode(this.code_);
      } else if (this./*OK*/ startsWithAValidEscape()) {
        result += stringFromCode(this.consumeEscape());
      } else {
        this.reconsume();
        return result;
      }
    }
  }

  /**
   * Consumes a number, returning it as a string representation. Numbers
   * may include +/- prefixes, ./e/E delimiters, etc. The type string will
   * be either 'integer' or 'number'. A number may be an integer.
   * @return {!NumberToken}
   */
  consumeANumber() {
    asserts.assert(
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
    } else if (
        (c1 === /* 'E' */ 0x45 || c1 === /* 'e' */ 0x65) &&
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
    const numberToken = new NumberToken();
    numberToken.type = type;
    numberToken.value = this.convertAStringToANumber(repr);
    numberToken.repr = repr;
    return numberToken;
  }

  /**
   * Converts a numerical representation of a string to a number.
   * @param {string} string
   * @return {number}
   */
  convertAStringToANumber(string) {
    // CSS's number rules are identical to JS, afaik.
    return Number(string);
  }

  /**
   * Consumes ?. Returns nothing.
   */
  consumeTheRemnantsOfABadURL() {
    while (true) {
      this.consume();
      if (this.code_ === /* '-' */ 0x2d || this.eof()) {
        return;
      } else if (this./*OK*/ startsWithAValidEscape()) {
        this.consumeEscape();
      }
    }
  }
}


/**
 * NOTE: When adding to this enum, you must update TokenType_NamesById below.
 * @enum {number}
 */
const TokenType = {
  UNKNOWN: 0,
  AT_KEYWORD: 1,
  CDC: 2,  // -->
  CDO: 3,  // <!--
  CLOSE_CURLY: 4,
  CLOSE_PAREN: 5,
  CLOSE_SQUARE: 6,
  COLON: 7,
  COLUMN: 8,  // ||
  COMMA: 9,
  DASH_MATCH: 10,  // |=
  DELIM: 11,
  DIMENSION: 12,
  EOF_TOKEN: 13,  // Can't call this EOF due to symbol conflict in C.
  ERROR: 14,
  FUNCTION_TOKEN: 15,
  HASH: 16,  // #
  IDENT: 17,
  INCLUDE_MATCH: 18,  // ~=
  NUMBER: 19,
  OPEN_CURLY: 20,
  OPEN_PAREN: 21,
  OPEN_SQUARE: 22,
  PERCENTAGE: 23,
  PREFIX_MATCH: 24,  // ^=
  SEMICOLON: 25,
  STRING: 26,
  SUBSTRING_MATCH: 27,  // *=
  SUFFIX_MATCH: 28,     // $=
  WHITESPACE: 29,
  URL: 30,

  // AST nodes produced by the parsing routines.
  STYLESHEET: 31,
  AT_RULE: 32,
  QUALIFIED_RULE: 33,
  DECLARATION: 34,
  BLOCK: 35,
  FUNCTION: 36,

  // For ExtractUrls
  PARSED_CSS_URL: 37,

  // For css-selectors.js.
  TYPE_SELECTOR: 38,
  ID_SELECTOR: 39,
  ATTR_SELECTOR: 40,
  PSEUDO_SELECTOR: 41,
  CLASS_SELECTOR: 42,
  SIMPLE_SELECTOR_SEQUENCE: 43,
  COMBINATOR: 44,
  SELECTORS_GROUP: 45,
};
exports.TokenType = TokenType;

/** @type {!Array<string>} */
const TokenType_NamesById = [
  'UNKNOWN',
  'AT_KEYWORD',
  'CDC',
  'CDO',
  'CLOSE_CURLY',
  'CLOSE_PAREN',
  'CLOSE_SQUARE',
  'COLON',
  'COLUMN',
  'COMMA',
  'DASH_MATCH',
  'DELIM',
  'DIMENSION',
  'EOF_TOKEN',
  'ERROR',
  'FUNCTION_TOKEN',
  'HASH',
  'IDENT',
  'INCLUDE_MATCH',
  'NUMBER',
  'OPEN_CURLY',
  'OPEN_PAREN',
  'OPEN_SQUARE',
  'PERCENTAGE',
  'PREFIX_MATCH',
  'SEMICOLON',
  'STRING',
  'SUBSTRING_MATCH',
  'SUFFIX_MATCH',
  'WHITESPACE',
  'URL',
  'STYLESHEET',
  'AT_RULE',
  'QUALIFIED_RULE',
  'DECLARATION',
  'BLOCK',
  'FUNCTION',
  'PARSED_CSS_URL',
  'TYPE_SELECTOR',
  'ID_SELECTOR',
  'ATTR_SELECTOR',
  'PSEUDO_SELECTOR',
  'CLASS_SELECTOR',
  'SIMPLE_SELECTOR_SEQUENCE',
  'COMBINATOR',
  'SELECTORS_GROUP',
];

/**
 * The abstract superclass for all tokens.
 */
const Token = class {
  constructor() {
    /** @type {number} */
    this.line = 1;
    /** @type {number} */
    this.col = 0;
  }

  /**
   * Copies the line / col values of |this| to |other|.
   * @param {!T} other
   * @return {!T}
   * @template T
   */
  copyPosTo(other) {
    other.line = this.line;
    other.col = this.col;
    return other;
  }
};
exports.Token = Token;
/** @type {!TokenType} */
Token.prototype.tokenType = TokenType.UNKNOWN;

/** @return {!Object} */
Token.prototype.toJSON = function() {
  return {
    'tokenType': TokenType_NamesById[this.tokenType],
    'line': this.line,
    'col': this.col,
  };
};

/**
 * Error tokens carry an error code and parameters, which can be
 * formatted into an error message via the format strings in
 * validator.protoascii.
 */
const ErrorToken = class extends Token {
  /**
   * @param {!ValidationError.Code=} opt_code
   * @param {!Array<string>=} opt_params
   */
  constructor(opt_code, opt_params) {
    super();
    asserts.assert(opt_code !== undefined);
    asserts.assert(opt_params !== undefined);
    /** @type {!ValidationError.Code} */
    this.code = opt_code;
    /** @type {!Array<string>} */
    this.params = opt_params;
  }
};
/** @type {!TokenType} */
ErrorToken.prototype.tokenType = TokenType.ERROR;
exports.ErrorToken = ErrorToken;

/** @inheritDoc */
ErrorToken.prototype.toJSON = function() {
  const json = Token.prototype.toJSON.call(this);
  json['code'] = this.code;
  json['params'] = this.params;
  return json;
};

const WhitespaceToken = class extends Token {};
exports.WhitespaceToken = WhitespaceToken;
/** @type {!TokenType} */
WhitespaceToken.prototype.tokenType = TokenType.WHITESPACE;

const CDOToken = class extends Token {};
exports.CDOToken = CDOToken;
/** @type {!TokenType} */
CDOToken.prototype.tokenType = TokenType.CDO;

const CDCToken = class extends Token {};
exports.CDCToken = CDCToken;
/** @type {!TokenType} */
CDCToken.prototype.tokenType = TokenType.CDC;

const ColonToken = class extends Token {};
exports.ColonToken = ColonToken;
/** @type {!TokenType} */
ColonToken.prototype.tokenType = TokenType.COLON;

const SemicolonToken = class extends Token {};
exports.SemicolonToken = SemicolonToken;
/** @type {!TokenType} */
SemicolonToken.prototype.tokenType = TokenType.SEMICOLON;

const CommaToken = class extends Token {};
exports.CommaToken = CommaToken;
/** @type {!TokenType} */
CommaToken.prototype.tokenType = TokenType.COMMA;

const GroupingToken = class extends Token {};
exports.GroupingToken = GroupingToken;
/** @type {string} */
GroupingToken.prototype.value = 'abstract';
/** @type {string} */
GroupingToken.prototype.mirror = 'abstract';

const OpenCurlyToken = class extends GroupingToken {};
exports.OpenCurlyToken = OpenCurlyToken;
/** @type {!TokenType} */
OpenCurlyToken.prototype.tokenType = TokenType.OPEN_CURLY;
/** @type {string} */
OpenCurlyToken.prototype.value = '{';
/** @type {string} */
OpenCurlyToken.prototype.mirror = '}';

const CloseCurlyToken = class extends GroupingToken {};
exports.CloseCurlyToken = CloseCurlyToken;
/** @type {!TokenType} */
CloseCurlyToken.prototype.tokenType = TokenType.CLOSE_CURLY;
/** @type {string} */
CloseCurlyToken.prototype.value = '}';
/** @type {string} */
CloseCurlyToken.prototype.mirror = '{';

const OpenSquareToken = class extends GroupingToken {};
exports.OpenSquareToken = OpenSquareToken;
/** @type {!TokenType} */
OpenSquareToken.prototype.tokenType = TokenType.OPEN_SQUARE;
/** @type {string} */
OpenSquareToken.prototype.value = '[';
/** @type {string} */
OpenSquareToken.prototype.mirror = ']';

const CloseSquareToken = class extends GroupingToken {};
exports.CloseSquareToken = CloseSquareToken;
/** @type {!TokenType} */
CloseSquareToken.prototype.tokenType = TokenType.CLOSE_SQUARE;
/** @type {string} */
CloseSquareToken.prototype.value = ']';
/** @type {string} */
CloseSquareToken.prototype.mirror = '[';

const OpenParenToken = class extends GroupingToken {};
exports.OpenParenToken = OpenParenToken;
/** @type {!TokenType} */
OpenParenToken.prototype.tokenType = TokenType.OPEN_PAREN;
/** @type {string} */
OpenParenToken.prototype.value = '(';
/** @type {string} */
OpenParenToken.prototype.mirror = ')';

const CloseParenToken = class extends GroupingToken {};
exports.CloseParenToken = CloseParenToken;
/** @type {!TokenType} */
CloseParenToken.prototype.tokenType = TokenType.CLOSE_PAREN;
/** @type {string} */
CloseParenToken.prototype.value = ')';
/** @type {string} */
CloseParenToken.prototype.mirror = '(';

const IncludeMatchToken = class extends Token {};
exports.IncludeMatchToken = IncludeMatchToken;
/** @type {!TokenType} */
IncludeMatchToken.prototype.tokenType = TokenType.INCLUDE_MATCH;

const DashMatchToken = class extends Token {};
exports.DashMatchToken = DashMatchToken;
/** @type {!TokenType} */
DashMatchToken.prototype.tokenType = TokenType.DASH_MATCH;

const PrefixMatchToken = class extends Token {};
exports.PrefixMatchToken = PrefixMatchToken;
/** @type {!TokenType} */
PrefixMatchToken.prototype.tokenType = TokenType.PREFIX_MATCH;

const SuffixMatchToken = class extends Token {};
exports.SuffixMatchToken = SuffixMatchToken;
/** @type {!TokenType} */
SuffixMatchToken.prototype.tokenType = TokenType.SUFFIX_MATCH;

const SubstringMatchToken = class extends Token {};
exports.SubstringMatchToken = SubstringMatchToken;
/** @type {!TokenType} */
SubstringMatchToken.prototype.tokenType = TokenType.SUBSTRING_MATCH;

const ColumnToken = class extends Token {};
exports.ColumnToken = ColumnToken;
/** @type {!TokenType} */
ColumnToken.prototype.tokenType = TokenType.COLUMN;

const EOFToken = class extends Token {};
exports.EOFToken = EOFToken;
/** @type {!TokenType} */
EOFToken.prototype.tokenType = TokenType.EOF_TOKEN;

const DelimToken = class extends Token {
  /**
   * @param {number} code
   */
  constructor(code) {
    super();
    /** @type {string} */
    this.value = stringFromCode(code);
  }
};
exports.DelimToken = DelimToken;
/** @type {!TokenType} */
DelimToken.prototype.tokenType = TokenType.DELIM;

/** @inheritDoc */
DelimToken.prototype.toJSON = function() {
  const json = Token.prototype.toJSON.call(this);
  json['value'] = this.value;
  return json;
};

const StringValuedToken = class extends Token {
  constructor() {
    super();
    /** @type {string} */
    this.value = '';
  }

  /**
   * @param {string} str
   * @return {boolean}
   */
  ASCIIMatch(str) {
    return this.value.toLowerCase() === str.toLowerCase();
  }
};
/** @inheritDoc */
StringValuedToken.prototype.toJSON = function() {
  const json = Token.prototype.toJSON.call(this);
  json['value'] = this.value;
  return json;
};
exports.StringValuedToken = StringValuedToken;

const IdentToken = class extends StringValuedToken {};
/** @type {!TokenType} */
IdentToken.prototype.tokenType = TokenType.IDENT;
exports.IdentToken = IdentToken;

const FunctionToken = class extends StringValuedToken {};
/** @type {!TokenType} */
FunctionToken.prototype.tokenType = TokenType.FUNCTION_TOKEN;
/** @type {string} */
FunctionToken.prototype.mirror = ')';
exports.FunctionToken = FunctionToken;

const AtKeywordToken = class extends StringValuedToken {};
/** @type {!TokenType} */
AtKeywordToken.prototype.tokenType = TokenType.AT_KEYWORD;
exports.AtKeywordToken = AtKeywordToken;

const HashToken = class extends StringValuedToken {
  constructor() {
    super();
    /** @type {string} */
    this.type = 'unrestricted';
  }
};
/** @type {!TokenType} */
HashToken.prototype.tokenType = TokenType.HASH;

/** @inheritDoc */
HashToken.prototype.toJSON = function() {
  const json = StringValuedToken.prototype.toJSON.call(this);
  json['type'] = this.type;
  return json;
};
exports.HashToken = HashToken;

const StringToken = class extends StringValuedToken {};
/** @type {!TokenType} */
StringToken.prototype.tokenType = TokenType.STRING;
exports.StringToken = StringToken;

const URLToken = class extends StringValuedToken {};
/** @type {!TokenType} */
URLToken.prototype.tokenType = TokenType.URL;
exports.URLToken = URLToken;

const NumberToken = class extends Token {
  constructor() {
    super();
    /** @type {?number} */
    this.value = null;
    /** @type {string} */
    this.type = 'integer';
    /** @type {string} */
    this.repr = '';
  }
};
/** @type {!TokenType} */
NumberToken.prototype.tokenType = TokenType.NUMBER;

/** @inheritDoc */
NumberToken.prototype.toJSON = function() {
  const json = Token.prototype.toJSON.call(this);
  json['value'] = this.value;
  json['type'] = this.type;
  json['repr'] = this.repr;
  return json;
};
exports.NumberToken = NumberToken;

const PercentageToken = class extends Token {
  constructor() {
    super();
    /** @type {?number} */
    this.value = null;
    /** @type {string} */
    this.repr = '';
  }
};
/** @type {!TokenType} */
PercentageToken.prototype.tokenType = TokenType.PERCENTAGE;

/** @inheritDoc */
PercentageToken.prototype.toJSON = function() {
  const json = Token.prototype.toJSON.call(this);
  json['value'] = this.value;
  json['repr'] = this.repr;
  return json;
};
exports.PercentageToken = PercentageToken;

const DimensionToken = class extends Token {
  constructor() {
    super();
    /** @type {?number} */
    this.value = null;
    /** @type {string} */
    this.type = 'integer';
    /** @type {string} */
    this.repr = '';
    /** @type {string} */
    this.unit = '';
  }
};
/** @type {!TokenType} */
DimensionToken.prototype.tokenType = TokenType.DIMENSION;

/** @inheritDoc */
DimensionToken.prototype.toJSON = function() {
  const json = Token.prototype.toJSON.call(this);
  json['value'] = this.value;
  json['type'] = this.type;
  json['repr'] = this.repr;
  json['unit'] = this.unit;
  return json;
};
exports.DimensionToken = DimensionToken;
