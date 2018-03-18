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
goog.provide('parse_css.TRIVIAL_EOF_TOKEN');
goog.provide('parse_css.TRIVIAL_ERROR_TOKEN');
goog.provide('parse_css.Token');
goog.provide('parse_css.TokenType');
goog.provide('parse_css.URLToken');
goog.provide('parse_css.WhitespaceToken');
goog.provide('parse_css.tokenize');
goog.require('amp.validator.LIGHT');
goog.require('amp.validator.ValidationError');
goog.require('goog.asserts');

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
 * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
 * @return {!Array<!parse_css.Token>}
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
    if (code === /* '\r' */ 0xd || code === 0xc) code = /* '\n' */ 0xa;
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
   * @param {!Array<!parse_css.ErrorToken>} errors output array for the errors.
   */
  constructor(strIn, line, col, errors) {
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
    let eofToken;
    if (amp.validator.LIGHT) {
      eofToken = parse_css.TRIVIAL_EOF_TOKEN;
    } else {
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
      eofToken = new parse_css.EOFToken();
      eofToken.line = currentLine;
      eofToken.col = currentCol;
    }

    let iterationCount = 0;
    while (!this.eof(this.next())) {
      const token = this.consumeAToken();
      if (token.tokenType === parse_css.TokenType.ERROR) {
        if (amp.validator.LIGHT) {
          this.errors_.push(parse_css.TRIVIAL_ERROR_TOKEN);
          this.tokens_ = [];
          return;
        }
        this.errors_.push(/** @type {!parse_css.ErrorToken} */ (token));
      } else {
        this.tokens_.push(token);
      }
      iterationCount++;
      goog.asserts.assert(
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
   * @return {!Array<!parse_css.Token>}
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
    goog.asserts.assert(
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

  /** @return {!parse_css.Token} */
  consumeAToken() {
    this.consumeComments();
    this.consume();
    const mark = new parse_css.Token();
    if (!amp.validator.LIGHT) {
      mark.line = this.getLine();
      mark.col = this.getCol();
    }
    if (whitespace(this.code_)) {
      // Merge consecutive whitespace into one token.
      while (whitespace(this.next())) {
        this.consume();
      }
      if (amp.validator.LIGHT) {
        return TRIVIAL_WHITESPACE_TOKEN;
      }
      return mark.copyPosTo(new parse_css.WhitespaceToken());
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
        const token = new parse_css.HashToken();
        token.value = this.consumeAName();
        if (type !== null) {
          token.type = type;
        }
        return mark.copyPosTo(token);
      } else {
        if (amp.validator.LIGHT) {
          return TRIVIAL_DELIM_TOKEN_23;
        }
        return mark.copyPosTo(new parse_css.DelimToken(this.code_));
      }
    } else if (this.code_ === /* '$' */ 0x24) {
      if (this.next() === /* '=' */ 0x3d) {
        this.consume();
        if (amp.validator.LIGHT) {
          return TRIVIAL_SUFFIX_MATCH_TOKEN;
        }
        return mark.copyPosTo(new parse_css.SuffixMatchToken());
      } else {
        if (amp.validator.LIGHT) {
          return TRIVIAL_DELIM_TOKEN_24;
        }
        return mark.copyPosTo(new parse_css.DelimToken(this.code_));
      }
    } else if (this.code_ === /* ''' */ 0x27) {
      return mark.copyPosTo(this.consumeAStringToken());
    } else if (this.code_ === /* '(' */ 0x28) {
      if (amp.validator.LIGHT) {
        return TRIVIAL_OPEN_PAREN_TOKEN;
      }
      return mark.copyPosTo(new parse_css.OpenParenToken());
    } else if (this.code_ === /* ')' */ 0x29) {
      if (amp.validator.LIGHT) {
        return TRIVIAL_CLOSE_PAREN_TOKEN;
      }
      return mark.copyPosTo(new parse_css.CloseParenToken());
    } else if (this.code_ === /* '*' */ 0x2a) {
      if (this.next() === /* '=' */ 0x3d) {
        this.consume();
        if (amp.validator.LIGHT) {
          return TRIVIAL_SUBSTRING_MATCH_TOKEN;
        }
        return mark.copyPosTo(new parse_css.SubstringMatchToken());
      } else {
        if (amp.validator.LIGHT) {
          return TRIVIAL_DELIM_TOKEN_2A;
        }
        return mark.copyPosTo(new parse_css.DelimToken(this.code_));
      }
    } else if (this.code_ === /* '+' */ 0x2b) {
      if (this./*OK*/ startsWithANumber()) {
        this.reconsume();
        return mark.copyPosTo(this.consumeANumericToken());
      } else {
        if (amp.validator.LIGHT) {
          return TRIVIAL_DELIM_TOKEN_2B;
        }
        return mark.copyPosTo(new parse_css.DelimToken(this.code_));
      }
    } else if (this.code_ === /* ',' */ 0x2c) {
      if (amp.validator.LIGHT) {
        return TRIVIAL_COMMA_TOKEN;
      }
      return mark.copyPosTo(new parse_css.CommaToken());
    } else if (this.code_ === /* '-' */ 0x2d) {
      if (this./*OK*/ startsWithANumber()) {
        this.reconsume();
        return mark.copyPosTo(this.consumeANumericToken());
      } else if (
          this.next(1) === /* '-' */ 0x2d && this.next(2) === /* '>' */ 0x3e) {
        this.consume(2);
        if (amp.validator.LIGHT) {
          return TRIVIAL_CDC_TOKEN;
        }
        return mark.copyPosTo(new parse_css.CDCToken());
      } else if (this./*OK*/ startsWithAnIdentifier()) {
        this.reconsume();
        return mark.copyPosTo(this.consumeAnIdentlikeToken());
      } else {
        if (amp.validator.LIGHT) {
          return TRIVIAL_DELIM_TOKEN_2D;
        }
        return mark.copyPosTo(new parse_css.DelimToken(this.code_));
      }
    } else if (this.code_ === /* '.' */ 0x2e) {
      if (this./*OK*/ startsWithANumber()) {
        this.reconsume();
        return mark.copyPosTo(this.consumeANumericToken());
      } else {
        if (amp.validator.LIGHT) {
          return TRIVIAL_DELIM_TOKEN_2E;
        }
        return mark.copyPosTo(new parse_css.DelimToken(this.code_));
      }
    } else if (this.code_ === /* ':' */ 0x3a) {
      if (amp.validator.LIGHT) {
        return TRIVIAL_COLON_TOKEN;
      }
      return mark.copyPosTo(new parse_css.ColonToken());
    } else if (this.code_ === /* ';' */ 0x3b) {
      if (amp.validator.LIGHT) {
        return TRIVIAL_SEMICOLON_TOKEN;
      }
      return mark.copyPosTo(new parse_css.SemicolonToken());
    } else if (this.code_ === /* '<' */ 0x3c) {
      if (this.next(1) === /* '!' */ 0x21 && this.next(2) === /* '-' */ 0x2d &&
          this.next(3) === /* '-' */ 0x2d) {
        this.consume(3);
        if (amp.validator.LIGHT) {
          return TRIVIAL_CDO_TOKEN;
        }
        return mark.copyPosTo(new parse_css.CDOToken());
      } else {
        if (amp.validator.LIGHT) {
          return TRIVIAL_DELIM_TOKEN_3C;
        }
        return mark.copyPosTo(new parse_css.DelimToken(this.code_));
      }
    } else if (this.code_ === /* '@' */ 0x40) {
      if (this.wouldStartAnIdentifier(
              this.next(1), this.next(2), this.next(3))) {
        const token = new parse_css.AtKeywordToken();
        token.value = this.consumeAName();
        return mark.copyPosTo(token);
      } else {
        if (amp.validator.LIGHT) {
          return TRIVIAL_DELIM_TOKEN_40;
        }
        return mark.copyPosTo(new parse_css.DelimToken(this.code_));
      }
    } else if (this.code_ === /* '[' */ 0x5b) {
      if (amp.validator.LIGHT) {
        return TRIVIAL_OPEN_SQUARE_TOKEN;
      }
      return mark.copyPosTo(new parse_css.OpenSquareToken());
    } else if (this.code_ === /* '\' */ 0x5c) {
      if (this./*OK*/ startsWithAValidEscape()) {
        this.reconsume();
        return mark.copyPosTo(this.consumeAnIdentlikeToken());
      } else {
        if (amp.validator.LIGHT) {
          return parse_css.TRIVIAL_ERROR_TOKEN;
        }
        // This condition happens if we are in consumeAToken (this method),
        // the current codepoint is 0x5c (\) and the next codepoint is a
        // newline (\n).
        return mark.copyPosTo(new parse_css.ErrorToken(
            amp.validator.ValidationError.Code
                .CSS_SYNTAX_STRAY_TRAILING_BACKSLASH,
            ['style']));
      }
    } else if (this.code_ === /* ']' */ 0x5d) {
      if (amp.validator.LIGHT) {
        return TRIVIAL_CLOSE_SQUARE_TOKEN;
      }
      return mark.copyPosTo(new parse_css.CloseSquareToken());
    } else if (this.code_ === /* '^' */ 0x5e) {
      if (this.next() === /* '=' */ 0x3d) {
        this.consume();
        if (amp.validator.LIGHT) {
          return TRIVIAL_PREFIX_MATCH_TOKEN;
        }
        return mark.copyPosTo(new parse_css.PrefixMatchToken());
      } else {
        if (amp.validator.LIGHT) {
          return TRIVIAL_DELIM_TOKEN_5E;
        }
        return mark.copyPosTo(new parse_css.DelimToken(this.code_));
      }
    } else if (this.code_ === /* '{' */ 0x7b) {
      if (amp.validator.LIGHT) {
        return TRIVIAL_OPEN_CURLY_TOKEN;
      }
      return mark.copyPosTo(new parse_css.OpenCurlyToken());
    } else if (this.code_ === /* '|' */ 0x7c) {
      if (this.next() === /* '=' */ 0x3d) {
        this.consume();
        if (amp.validator.LIGHT) {
          return TRIVIAL_DASH_MATCH_TOKEN;
        }
        return mark.copyPosTo(new parse_css.DashMatchToken());
      } else if (this.next() === /* '|' */ 0x7c) {
        this.consume();
        if (amp.validator.LIGHT) {
          return TRIVIAL_COLUMN_TOKEN;
        }
        return mark.copyPosTo(new parse_css.ColumnToken());
      } else {
        if (amp.validator.LIGHT) {
          return TRIVIAL_DELIM_TOKEN_7C;
        }
        return mark.copyPosTo(new parse_css.DelimToken(this.code_));
      }
    } else if (this.code_ === /* '}' */ 0x7d) {
      if (amp.validator.LIGHT) {
        return TRIVIAL_CLOSE_CURLY_TOKEN;
      }
      return mark.copyPosTo(new parse_css.CloseCurlyToken());
    } else if (this.code_ === /* '~' */ 0x7e) {
      if (this.next() === /* '=' */ 0x3d) {
        this.consume();
        if (amp.validator.LIGHT) {
          return TRIVIAL_CLOSE_CURLY_TOKEN;
        }
        return mark.copyPosTo(new parse_css.IncludeMatchToken());
      } else {
        if (amp.validator.LIGHT) {
          return TRIVIAL_DELIM_TOKEN_7E;
        }
        return mark.copyPosTo(new parse_css.DelimToken(this.code_));
      }
    } else if (digit(this.code_)) {
      this.reconsume();
      return mark.copyPosTo(this.consumeANumericToken());
    } else if (nameStartChar(this.code_)) {
      this.reconsume();
      return mark.copyPosTo(this.consumeAnIdentlikeToken());
    } else if (this.eof()) {
      if (amp.validator.LIGHT) {
        return parse_css.TRIVIAL_EOF_TOKEN;
      }
      return mark.copyPosTo(new parse_css.EOFToken());
    } else {
      const token = new parse_css.DelimToken(this.code_);
      return mark.copyPosTo(token);
    }
  }

  /**
   * Consume everything starting with /* and ending at * / (ignore the space),
   * emitting a parse error if we hit the end of the file. Returns nothing.
   */
  consumeComments() {
    const mark = new parse_css.Token();
    if (!amp.validator.LIGHT) {
      mark.line = this.getLine();
      mark.col = this.getCol();
    }
    while (this.next(1) === /* '/' */ 0x2f && this.next(2) === /* '*' */ 0x2a) {
      this.consume(2);
      while (true) {
        this.consume();
        if (this.code_ === /* '*' */ 0x2a && this.next() === /* '/' */ 0x2f) {
          this.consume();
          break;
        } else if (this.eof()) {
          if (amp.validator.LIGHT) {
            this.errors_.push(parse_css.TRIVIAL_ERROR_TOKEN);
          } else {
            // For example "h1 { color: red; } \* " would emit this parse error
            // at the end of the string.
            this.errors_.push(mark.copyPosTo(new parse_css.ErrorToken(
                amp.validator.ValidationError.Code
                    .CSS_SYNTAX_UNTERMINATED_COMMENT,
                ['style'])));
          }
          return;
        }
      }
    }
  }

  /**
   * Consumes a token that starts with a number.
   * The specific type is one of:
   *   NumberToken, DimensionToken, PercentageToken
   * @return {!parse_css.Token} */
  consumeANumericToken() {
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
  }

  /**
   * Consume an identifier-like token.
   * The specific type is one of:
   *   FunctionToken, URLToken, ErrorToken, IdentToken
   * @return {!parse_css.Token}
   */
  consumeAnIdentlikeToken() {
    const name = this.consumeAName();
    if (name.toLowerCase() === 'url' && this.next() === /* '(' */ 0x28) {
      this.consume();
      while (whitespace(this.next(1)) && whitespace(this.next(2))) {
        this.consume();
      }
      if (this.next() === /* '"' */ 0x22 || this.next() === /* ''' */ 0x27) {
        const token = new parse_css.FunctionToken();
        token.value = name;
        return token;
      } else if (
          whitespace(this.next()) &&
          (this.next(2) === /* '"' */ 0x22 ||
           this.next(2) === /* ''' */ 0x27)) {
        const token = new parse_css.FunctionToken();
        token.value = name;
        return token;
      } else {
        return this.consumeAURLToken();
      }
    } else if (this.next() === /* '(' */ 0x28) {
      this.consume();
      const token = new parse_css.FunctionToken();
      token.value = name;
      return token;
    } else {
      const token = new parse_css.IdentToken();
      token.value = name;
      return token;
    }
  }

  /**
   * Consume a string token.
   * The specific type is one of:
   *   StringToken, ErrorToken
   * @return {!parse_css.Token}
   */
  consumeAStringToken() {
    goog.asserts.assert(
        (this.code_ === /* '"' */ 0x22) || (this.code_ === /* ''' */ 0x27),
        'Internal Error: consumeAStringToken precondition not met');
    const endingCodePoint = this.code_;
    let string = '';
    while (true) {
      this.consume();
      if (this.code_ === endingCodePoint || this.eof()) {
        const token = new parse_css.StringToken();
        token.value = string;
        return token;
      } else if (newline(this.code_)) {
        this.reconsume();
        if (amp.validator.LIGHT) {
          return parse_css.TRIVIAL_ERROR_TOKEN;
        }
        return new parse_css.ErrorToken(
            amp.validator.ValidationError.Code.CSS_SYNTAX_UNTERMINATED_STRING,
            ['style']);
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
   * @return {!parse_css.Token}
   */
  consumeAURLToken() {
    const token = new parse_css.URLToken();
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
          if (amp.validator.LIGHT) {
            return parse_css.TRIVIAL_ERROR_TOKEN;
          }
          return new parse_css.ErrorToken(
              amp.validator.ValidationError.Code.CSS_SYNTAX_BAD_URL, ['style']);
        }
      } else if (
          this.code_ === /* '"' */ 0x22 || this.code_ === /* ''' */ 0x27 ||
          this.code_ === /* '(' */ 0x28 || nonPrintable(this.code_)) {
        this.consumeTheRemnantsOfABadURL();
        if (amp.validator.LIGHT) {
          return parse_css.TRIVIAL_ERROR_TOKEN;
        }
        return new parse_css.ErrorToken(
            amp.validator.ValidationError.Code.CSS_SYNTAX_BAD_URL, ['style']);
      } else if (this.code_ === /* '\' */ 0x5c) {
        if (this./*OK*/ startsWithAValidEscape()) {
          token.value += stringFromCode(this.consumeEscape());
        } else {
          this.consumeTheRemnantsOfABadURL();
          if (amp.validator.LIGHT) {
            return parse_css.TRIVIAL_ERROR_TOKEN;
          }
          return new parse_css.ErrorToken(
              amp.validator.ValidationError.Code.CSS_SYNTAX_BAD_URL, ['style']);
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
   * @return {boolean} */
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
   * @return {!parse_css.NumberToken}
   */
  consumeANumber() {
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
    const numberToken = new parse_css.NumberToken();
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
    return +string;
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
parse_css.TokenType = {
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
  SELECTORS_GROUP: 45
};

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
parse_css.Token = class {
  constructor() {
    if (!amp.validator.LIGHT) {
      /** @type {number} */
      this.line = 1;
      /** @type {number} */
      this.col = 0;
    }
  }

  /**
   * Copies the line / col values of |this| to |other|.
   * @param {!T} other
   * @return {!T}
   * @template T
   */
  copyPosTo(other) {
    if (!amp.validator.LIGHT) {
      other.line = this.line;
      other.col = this.col;
    }
    return other;
  }
};
/** @type {!parse_css.TokenType} */
parse_css.Token.prototype.tokenType = parse_css.TokenType.UNKNOWN;

if (!amp.validator.LIGHT) {
  /** @return {!Object} */
  parse_css.Token.prototype.toJSON = function() {
    return {
      'tokenType': TokenType_NamesById[this.tokenType],
      'line': this.line,
      'col': this.col
    };
  };
}

/**
 * Error tokens carry an error code and parameters, which can be
 * formatted into an error message via the format strings in
 * validator.protoascii.
 */
parse_css.ErrorToken = class extends parse_css.Token {
  /**
   * @param {amp.validator.ValidationError.Code=} opt_code
   * @param {!Array<string>=} opt_params
   */
  constructor(opt_code, opt_params) {
    super();
    if (!amp.validator.LIGHT) {
      goog.asserts.assert(opt_code !== undefined);
      goog.asserts.assert(opt_params !== undefined);
      /** @type {!amp.validator.ValidationError.Code} */
      this.code = opt_code;
      /** @type {!Array<string>} */
      this.params = opt_params;
    }
  }
};
/** @type {!parse_css.TokenType} */
parse_css.ErrorToken.prototype.tokenType = parse_css.TokenType.ERROR;

if (!amp.validator.LIGHT) {
  /** @inheritDoc */
  parse_css.ErrorToken.prototype.toJSON = function() {
    const json = parse_css.Token.prototype.toJSON.call(this);
    json['code'] = this.code;
    json['params'] = this.params;
    return json;
  };
}

if (amp.validator.LIGHT) {
  /**
   * @type {!parse_css.ErrorToken}
   */
  parse_css.TRIVIAL_ERROR_TOKEN = new parse_css.ErrorToken();
}

parse_css.WhitespaceToken = class extends parse_css.Token {};
/** @type {!parse_css.TokenType} */
parse_css.WhitespaceToken.prototype.tokenType = parse_css.TokenType.WHITESPACE;
const TRIVIAL_WHITESPACE_TOKEN = new parse_css.WhitespaceToken();

parse_css.CDOToken = class extends parse_css.Token {};
/** @type {!parse_css.TokenType} */
parse_css.CDOToken.prototype.tokenType = parse_css.TokenType.CDO;
const TRIVIAL_CDO_TOKEN = new parse_css.CDOToken();

parse_css.CDCToken = class extends parse_css.Token {};
/** @type {!parse_css.TokenType} */
parse_css.CDCToken.prototype.tokenType = parse_css.TokenType.CDC;
const TRIVIAL_CDC_TOKEN = new parse_css.CDCToken();

parse_css.ColonToken = class extends parse_css.Token {};
/** @type {!parse_css.TokenType} */
parse_css.ColonToken.prototype.tokenType = parse_css.TokenType.COLON;
const TRIVIAL_COLON_TOKEN = new parse_css.ColonToken();

parse_css.SemicolonToken = class extends parse_css.Token {};
/** @type {!parse_css.TokenType} */
parse_css.SemicolonToken.prototype.tokenType = parse_css.TokenType.SEMICOLON;
const TRIVIAL_SEMICOLON_TOKEN = new parse_css.SemicolonToken();

parse_css.CommaToken = class extends parse_css.Token {};
/** @type {!parse_css.TokenType} */
parse_css.CommaToken.prototype.tokenType = parse_css.TokenType.COMMA;
const TRIVIAL_COMMA_TOKEN = new parse_css.CommaToken();

parse_css.GroupingToken = class extends parse_css.Token {};
/** @type {string} */
parse_css.GroupingToken.prototype.value = 'abstract';
/** @type {string} */
parse_css.GroupingToken.prototype.mirror = 'abstract';

parse_css.OpenCurlyToken = class extends parse_css.GroupingToken {};
/** @type {!parse_css.TokenType} */
parse_css.OpenCurlyToken.prototype.tokenType = parse_css.TokenType.OPEN_CURLY;
/** @type {string} */
parse_css.OpenCurlyToken.prototype.value = '{';
/** @type {string} */
parse_css.OpenCurlyToken.prototype.mirror = '}';
const TRIVIAL_OPEN_CURLY_TOKEN = new parse_css.OpenCurlyToken();

parse_css.CloseCurlyToken = class extends parse_css.GroupingToken {};
/** @type {!parse_css.TokenType} */
parse_css.CloseCurlyToken.prototype.tokenType = parse_css.TokenType.CLOSE_CURLY;
/** @type {string} */
parse_css.CloseCurlyToken.prototype.value = '}';
/** @type {string} */
parse_css.CloseCurlyToken.prototype.mirror = '{';
const TRIVIAL_CLOSE_CURLY_TOKEN = new parse_css.CloseCurlyToken();

parse_css.OpenSquareToken = class extends parse_css.GroupingToken {};
/** @type {!parse_css.TokenType} */
parse_css.OpenSquareToken.prototype.tokenType = parse_css.TokenType.OPEN_SQUARE;
/** @type {string} */
parse_css.OpenSquareToken.prototype.value = '[';
/** @type {string} */
parse_css.OpenSquareToken.prototype.mirror = ']';
const TRIVIAL_OPEN_SQUARE_TOKEN = new parse_css.OpenSquareToken();

parse_css.CloseSquareToken = class extends parse_css.GroupingToken {};
/** @type {!parse_css.TokenType} */
parse_css.CloseSquareToken.prototype.tokenType =
    parse_css.TokenType.CLOSE_SQUARE;
/** @type {string} */
parse_css.CloseSquareToken.prototype.value = ']';
/** @type {string} */
parse_css.CloseSquareToken.prototype.mirror = '[';
const TRIVIAL_CLOSE_SQUARE_TOKEN = new parse_css.CloseSquareToken();

parse_css.OpenParenToken = class extends parse_css.GroupingToken {};
/** @type {!parse_css.TokenType} */
parse_css.OpenParenToken.prototype.tokenType = parse_css.TokenType.OPEN_PAREN;
/** @type {string} */
parse_css.OpenParenToken.prototype.value = '(';
/** @type {string} */
parse_css.OpenParenToken.prototype.mirror = ')';
const TRIVIAL_OPEN_PAREN_TOKEN = new parse_css.OpenParenToken();

parse_css.CloseParenToken = class extends parse_css.GroupingToken {};
/** @type {!parse_css.TokenType} */
parse_css.CloseParenToken.prototype.tokenType = parse_css.TokenType.CLOSE_PAREN;
/** @type {string} */
parse_css.CloseParenToken.prototype.value = ')';
/** @type {string} */
parse_css.CloseParenToken.prototype.mirror = '(';
const TRIVIAL_CLOSE_PAREN_TOKEN = new parse_css.CloseParenToken();

parse_css.IncludeMatchToken = class extends parse_css.Token {};
/** @type {!parse_css.TokenType} */
parse_css.IncludeMatchToken.prototype.tokenType =
    parse_css.TokenType.INCLUDE_MATCH;
const TRIVIAL_INCLUDE_MATCH_TOKEN = new parse_css.IncludeMatchToken();

parse_css.DashMatchToken = class extends parse_css.Token {};
/** @type {!parse_css.TokenType} */
parse_css.DashMatchToken.prototype.tokenType = parse_css.TokenType.DASH_MATCH;
const TRIVIAL_DASH_MATCH_TOKEN = new parse_css.DashMatchToken();

parse_css.PrefixMatchToken = class extends parse_css.Token {};
/** @type {!parse_css.TokenType} */
parse_css.PrefixMatchToken.prototype.tokenType =
    parse_css.TokenType.PREFIX_MATCH;
const TRIVIAL_PREFIX_MATCH_TOKEN = new parse_css.PrefixMatchToken();

parse_css.SuffixMatchToken = class extends parse_css.Token {};
/** @type {!parse_css.TokenType} */
parse_css.SuffixMatchToken.prototype.tokenType =
    parse_css.TokenType.SUFFIX_MATCH;
const TRIVIAL_SUFFIX_MATCH_TOKEN = new parse_css.SuffixMatchToken();

parse_css.SubstringMatchToken = class extends parse_css.Token {};
/** @type {!parse_css.TokenType} */
parse_css.SubstringMatchToken.prototype.tokenType =
    parse_css.TokenType.SUBSTRING_MATCH;
const TRIVIAL_SUBSTRING_MATCH_TOKEN = new parse_css.SubstringMatchToken();

parse_css.ColumnToken = class extends parse_css.Token {};
/** @type {!parse_css.TokenType} */
parse_css.ColumnToken.prototype.tokenType = parse_css.TokenType.COLUMN;
const TRIVIAL_COLUMN_TOKEN = new parse_css.ColumnToken();

parse_css.EOFToken = class extends parse_css.Token {};
/** @type {!parse_css.TokenType} */
parse_css.EOFToken.prototype.tokenType = parse_css.TokenType.EOF_TOKEN;

/** @type {!parse_css.EOFToken} */
parse_css.TRIVIAL_EOF_TOKEN = new parse_css.EOFToken();

parse_css.DelimToken = class extends parse_css.Token {
  /**
   * @param {number} code
   */
  constructor(code) {
    super();
    /** @type {string} */
    this.value = stringFromCode(code);
  }
};
/** @type {!parse_css.TokenType} */
parse_css.DelimToken.prototype.tokenType = parse_css.TokenType.DELIM;

const TRIVIAL_DELIM_TOKEN_23 = new parse_css.DelimToken(0x23);
const TRIVIAL_DELIM_TOKEN_24 = new parse_css.DelimToken(0x24);
const TRIVIAL_DELIM_TOKEN_2A = new parse_css.DelimToken(0x2a);
const TRIVIAL_DELIM_TOKEN_2B = new parse_css.DelimToken(0x2b);
const TRIVIAL_DELIM_TOKEN_2D = new parse_css.DelimToken(0x2d);
const TRIVIAL_DELIM_TOKEN_2E = new parse_css.DelimToken(0x2e);
const TRIVIAL_DELIM_TOKEN_3C = new parse_css.DelimToken(0x3c);
const TRIVIAL_DELIM_TOKEN_40 = new parse_css.DelimToken(0x40);
const TRIVIAL_DELIM_TOKEN_5E = new parse_css.DelimToken(0x5E);
const TRIVIAL_DELIM_TOKEN_7C = new parse_css.DelimToken(0x7C);
const TRIVIAL_DELIM_TOKEN_7E = new parse_css.DelimToken(0x7E);

if (!amp.validator.LIGHT) {
  /** @inheritDoc */
  parse_css.DelimToken.prototype.toJSON = function() {
    const json = parse_css.Token.prototype.toJSON.call(this);
    json['value'] = this.value;
    return json;
  };
}

parse_css.StringValuedToken = class extends parse_css.Token {
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
if (!amp.validator.LIGHT) {
  /** @inheritDoc */
  parse_css.StringValuedToken.prototype.toJSON = function() {
    const json = parse_css.Token.prototype.toJSON.call(this);
    json['value'] = this.value;
    return json;
  };
}

parse_css.IdentToken = class extends parse_css.StringValuedToken {};
/** @type {!parse_css.TokenType} */
parse_css.IdentToken.prototype.tokenType = parse_css.TokenType.IDENT;

parse_css.FunctionToken = class extends parse_css.StringValuedToken {};
/** @type {!parse_css.TokenType} */
parse_css.FunctionToken.prototype.tokenType =
    parse_css.TokenType.FUNCTION_TOKEN;
/** @type {string} */
parse_css.FunctionToken.prototype.mirror = ')';

parse_css.AtKeywordToken = class extends parse_css.StringValuedToken {};
/** @type {!parse_css.TokenType} */
parse_css.AtKeywordToken.prototype.tokenType = parse_css.TokenType.AT_KEYWORD;

parse_css.HashToken = class extends parse_css.StringValuedToken {
  constructor() {
    super();
    /** @type {string} */
    this.type = 'unrestricted';
  }
};
/** @type {!parse_css.TokenType} */
parse_css.HashToken.prototype.tokenType = parse_css.TokenType.HASH;

if (!amp.validator.LIGHT) {
  /** @inheritDoc */
  parse_css.HashToken.prototype.toJSON = function() {
    const json = parse_css.StringValuedToken.prototype.toJSON.call(this);
    json['type'] = this.type;
    return json;
  };
}

parse_css.StringToken = class extends parse_css.StringValuedToken {};
/** @type {!parse_css.TokenType} */
parse_css.StringToken.prototype.tokenType = parse_css.TokenType.STRING;

parse_css.URLToken = class extends parse_css.StringValuedToken {};
/** @type {!parse_css.TokenType} */
parse_css.URLToken.prototype.tokenType = parse_css.TokenType.URL;

parse_css.NumberToken = class extends parse_css.Token {
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
/** @type {!parse_css.TokenType} */
parse_css.NumberToken.prototype.tokenType = parse_css.TokenType.NUMBER;

if (!amp.validator.LIGHT) {
  /** @inheritDoc */
  parse_css.NumberToken.prototype.toJSON = function() {
    const json = parse_css.Token.prototype.toJSON.call(this);
    json['value'] = this.value;
    json['type'] = this.type;
    json['repr'] = this.repr;
    return json;
  };
}

parse_css.PercentageToken = class extends parse_css.Token {
  constructor() {
    super();
    /** @type {?number} */
    this.value = null;
    /** @type {string} */
    this.repr = '';
  }
};
/** @type {!parse_css.TokenType} */
parse_css.PercentageToken.prototype.tokenType = parse_css.TokenType.PERCENTAGE;

if (!amp.validator.LIGHT) {
  /** @inheritDoc */
  parse_css.PercentageToken.prototype.toJSON = function() {
    const json = parse_css.Token.prototype.toJSON.call(this);
    json['value'] = this.value;
    json['repr'] = this.repr;
    return json;
  };
}

parse_css.DimensionToken = class extends parse_css.Token {
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
/** @type {!parse_css.TokenType} */
parse_css.DimensionToken.prototype.tokenType = parse_css.TokenType.DIMENSION;

if (!amp.validator.LIGHT) {
  /** @inheritDoc */
  parse_css.DimensionToken.prototype.toJSON = function() {
    const json = parse_css.Token.prototype.toJSON.call(this);
    json['value'] = this.value;
    json['type'] = this.type;
    json['repr'] = this.repr;
    json['unit'] = this.unit;
    return json;
  };
}
