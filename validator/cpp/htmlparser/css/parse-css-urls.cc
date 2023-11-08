#include "cpp/htmlparser/css/parse-css-urls.h"

#include <memory>

#include "absl/algorithm/container.h"
#include "absl/memory/memory.h"
#include "absl/strings/ascii.h"
#include "absl/strings/numbers.h"
#include "absl/strings/str_join.h"
#include "absl/types/variant.h"
#include "cpp/htmlparser/logging.h"
#include "cpp/htmlparser/strings.h"

using absl::AsciiStrToLower;
using absl::c_find;
using absl::make_unique;
using std::unique_ptr;
using std::vector;

namespace htmlparser::css::url {

//
// Token implementations.
//
const std::string& Token::StringValue() const {
  static const std::string* empty = new std::string;
  return *empty;
}

const std::string& StringValuedToken::StringValue() const { return value_; }

//
// Tokenization
//

// Implements 3.3. Preprocessing the input stream.
// http://www.w3.org/TR/css-syntax-3/#input-preprocessing
void Preprocess(vector<char32_t>* codepoints) {
  if (c_find(*codepoints, '\r') == codepoints->end() &&
      c_find(*codepoints, '\f') == codepoints->end())
    return;
  vector<char32_t> out;
  bool last_codepoint_was_cr = false;
  for (char32_t codepoint : *codepoints) {
    switch (codepoint) {
      case '\r':  // also known as carriage return (CR)
        out.push_back('\n');
        last_codepoint_was_cr = true;
        break;
      case '\f':  // also known as form feed (FF)
        out.push_back('\n');
        last_codepoint_was_cr = false;
        break;
      case '\n':  // also known as line feed (LF)
        if (!last_codepoint_was_cr) out.push_back('\n');
        last_codepoint_was_cr = false;
        break;
      default:
        out.push_back(codepoint);
        last_codepoint_was_cr = false;
        break;
    }
  }
  codepoints->swap(out);
}

namespace {
bool Between(char32_t num, char32_t first, char32_t last) {
  return num >= first && num <= last;
}
bool Digit(char32_t code) {
  return Between(code, /* '0' */ 0x30, /* '9' */ 0x39);
}
bool Hexdigit(char32_t code) {
  return Digit(code) || Between(code, /* 'A' */ 0x41, /* 'F' */ 0x46) ||
         Between(code, /* 'a' */ 0x61, /* 'f' */ 0x66);
}
bool Uppercaseletter(char32_t code) {
  return Between(code, /* 'A' */ 0x41, /* 'Z' */ 0x5a);
}
bool Lowercaseletter(char32_t code) {
  return Between(code, /* 'a' */ 0x61, /* 'z' */ 0x7a);
}
bool Letter(char32_t code) {
  return Uppercaseletter(code) || Lowercaseletter(code);
}
bool Nonascii(char32_t code) { return code >= 0x80; }
bool Namestartchar(char32_t code) {
  return Letter(code) || Nonascii(code) || code == /* '_' */ 0x5f;
}
bool Namechar(char32_t code) {
  return Namestartchar(code) || Digit(code) || code == /* '-' */ 0x2d;
}
bool Nonprintable(char32_t code) {
  return Between(code, 0, 8) || code == 0xb || Between(code, 0xe, 0x1f) ||
         code == 0x7f;
}
bool Newline(char32_t code) { return code == /* '\n' */ 0xa; }
bool Whitespace(char32_t code) {
  return Newline(code) || code == 9 || code == /* ' ' */ 0x20;
}
char32_t kMaximumallowedcodepoint = 0x10ffff;

template <typename T>
unique_ptr<T> AddPositionTo(int position, unique_ptr<T> token) {
  token->set_pos(position);
  return token;
}

// This class isn't part of the public API. In Javascript it's just a method
// with several local variables and inner functions. Here it's a helper
// class which keeps the state in fields, and it's called by the Tokenize
// functions (which is in the header).
class Tokenizer {
 public:
  Tokenizer(const vector<char32_t>& str, vector<unique_ptr<Token>>* tokens,
            vector<unique_ptr<ErrorToken>>* errors)
      : str_(str), code_(0), pos_(-1), eof_(false), errors_(errors) {
    Preprocess(&str_);

    int iteration_count = 0;
    while (!EofNext()) {
      unique_ptr<Token> token = ConsumeAToken();
      if (token->Type() == TokenType::ERROR) {
        errors->emplace_back(static_cast<ErrorToken*>(token.release()));
      } else {
        tokens->emplace_back(std::move(token));
      }
      ++iteration_count;
      LOG_IF(FATAL, iteration_count > str.size() * 2)
          << "Internal error: infinite-looping";
    }
    tokens->emplace_back(make_unique<EOFToken>());
    tokens->back()->set_pos(str_.size());
  }

 private:
  char32_t Codepoint(int n) {
    if (n >= str_.size()) return 0;
    return str_[n];
  }

  char32_t Next(int num = 1) {
    CHECK(num >= 0) << "Spec Error; negative lookahead.";
    CHECK(num <= 3)
        << "Spec Error; no more than three codepoints of lookahead.";
    return Codepoint(pos_ + num);
  }

  bool Consume(int num = 1) {
    pos_ += num;
    if (pos_ >= str_.size()) {
      eof_ = true;
    } else {
      code_ = Codepoint(pos_);
    }

    // Stop consuming if it is EOF.
    return !eof_;
  }

  bool Reconsume() {
    pos_ -= 1;
    eof_ = false;
    return true;
  }

  bool EofNext(int num = 1) { return pos_ + num >= str_.size(); }

  bool Eof() { return eof_; }

  void Donothing() {}

  unique_ptr<Token> ConsumeAToken() {
    ConsumeComments();
    Consume();
    int mark = pos_;
    if (Whitespace(code_)) {
      while (Whitespace(Next())) Consume();
      return AddPositionTo(mark, make_unique<WhitespaceToken>());
    } else if (code_ == /* '"' */ 0x22) {
      return AddPositionTo(mark, ConsumeAStringToken());
    } else if (code_ == /* '#' */ 0x23) {
      if (Namechar(Next()) || AreAValidEscape(Next(1), Next(2))) {
        return AddPositionTo(mark, make_unique<HashToken>(ConsumeAName()));
      } else {
        return AddPositionTo(mark, make_unique<DelimToken>());
      }
    } else if (code_ == /* '$' */ 0x24) {
      if (Next() == /* '=' */ 0x3d) {
        Consume();
        return AddPositionTo(mark, make_unique<SuffixMatchToken>());
      } else {
        return AddPositionTo(mark, make_unique<DelimToken>());
      }
    } else if (code_ == /* ''' */ 0x27) {
      return AddPositionTo(mark, ConsumeAStringToken());
    } else if (code_ == /* '(' */ 0x28) {
      return AddPositionTo(mark, make_unique<OpenParenToken>());
    } else if (code_ == /* ')' */ 0x29) {
      return AddPositionTo(mark, make_unique<CloseParenToken>());
    } else if (code_ == /* '*' */ 0x2a) {
      if (Next() == /* '=' */ 0x3d) {
        Consume();
        return AddPositionTo(mark, make_unique<SubstringMatchToken>());
      } else {
        return AddPositionTo(mark, make_unique<DelimToken>());
      }
    } else if (code_ == /* '+' */ 0x2b) {
      if (StartsWithANumber()) {
        Reconsume();
        return AddPositionTo(mark, ConsumeANumericToken());
      } else {
        return AddPositionTo(mark, make_unique<DelimToken>());
      }
    } else if (code_ == /* ',' */ 0x2c) {
      return AddPositionTo(mark, make_unique<CommaToken>());
    } else if (code_ == /* '-' */ 0x2d) {
      if (StartsWithANumber()) {
        Reconsume();
        return AddPositionTo(mark, ConsumeANumericToken());
      } else if (Next(1) == /* '-' */ 0x2d && Next(2) == /* '>' */ 0x3e) {
        Consume(2);
        return AddPositionTo(mark, make_unique<CDCToken>());
      } else if (StartsWithAnIdentifier()) {
        Reconsume();
        return AddPositionTo(mark, ConsumeAnIdentlikeToken());
      } else {
        return AddPositionTo(mark, make_unique<DelimToken>());
      }
    } else if (code_ == /* '.' */ 0x2e) {
      if (StartsWithANumber()) {
        Reconsume();
        return AddPositionTo(mark, ConsumeANumericToken());
      } else {
        return AddPositionTo(mark, make_unique<DelimToken>());
      }
    } else if (code_ == /* ':' */ 0x3a) {
      return AddPositionTo(mark, make_unique<ColonToken>());
    } else if (code_ == /* ';' */ 0x3b) {
      return AddPositionTo(mark, make_unique<SemicolonToken>());
    } else if (code_ == /* '<' */ 0x3c) {
      if (Next(1) == /* '!' */ 0x21 && Next(2) == /* '-' */ 0x2d &&
          Next(3) == /* '-' */ 0x2d) {
        Consume(3);
        return AddPositionTo(mark, make_unique<CDOToken>());
      } else {
        return AddPositionTo(mark, make_unique<DelimToken>());
      }
    } else if (code_ == /* '@' */ 0x40) {
      if (WouldStartAnIdentifier(Next(1), Next(2), Next(3))) {
        return AddPositionTo(mark, make_unique<AtKeywordToken>(ConsumeAName()));
      } else {
        return AddPositionTo(mark, make_unique<DelimToken>());
      }
    } else if (code_ == /* '[' */ 0x5b) {
      return AddPositionTo(mark, make_unique<OpenSquareToken>());
    } else if (code_ == /* '\' */ 0x5c) {
      if (StartsWithAValidEscape()) {
        Reconsume();
        return AddPositionTo(mark, ConsumeAnIdentlikeToken());
      } else {
        // This condition happens if we are in consumeAToken (this method),
        // the current codepoint is 0x5c (\) and the next codepoint is a
        // newline (\n).
        return AddPositionTo(mark, make_unique<ErrorToken>());
      }
    } else if (code_ == /* ']' */ 0x5d) {
      return AddPositionTo(mark, make_unique<CloseSquareToken>());
    } else if (code_ == /* '^' */ 0x5e) {
      if (Next() == /* '=' */ 0x3d) {
        Consume();
        return AddPositionTo(mark, make_unique<PrefixMatchToken>());
      } else {
        return AddPositionTo(mark, make_unique<DelimToken>());
      }
    } else if (code_ == /* '{' */ 0x7b) {
      return AddPositionTo(mark, make_unique<OpenCurlyToken>());
    } else if (code_ == /* '|' */ 0x7c) {
      if (Next() == /* '=' */ 0x3d) {
        Consume();
        return AddPositionTo(mark, make_unique<DashMatchToken>());
      } else if (Next() == /* '|' */ 0x7c) {
        Consume();
        return AddPositionTo(mark, make_unique<ColumnToken>());
      } else {
        return AddPositionTo(mark, make_unique<DelimToken>());
      }
    } else if (code_ == /* '}' */ 0x7d) {
      return AddPositionTo(mark, make_unique<CloseCurlyToken>());
    } else if (code_ == /* '~' */ 0x7e) {
      if (Next() == /* '=' */ 0x3d) {
        Consume();
        return AddPositionTo(mark, make_unique<IncludeMatchToken>());
      } else {
        return AddPositionTo(mark, make_unique<DelimToken>());
      }
    } else if (Digit(code_)) {
      Reconsume();
      return AddPositionTo(mark, ConsumeANumericToken());
    } else if (Namestartchar(code_)) {
      Reconsume();
      return AddPositionTo(mark, ConsumeAnIdentlikeToken());
    } else if (Eof()) {
      return AddPositionTo(mark, make_unique<EOFToken>());
    } else {
      return AddPositionTo(mark, make_unique<DelimToken>());
    }
  }

  void ConsumeComments() {
    int mark = pos_;
    while (Next(1) == /* '/' */ 0x2f && Next(2) == /* '*' */ 0x2a) {
      Consume(2);
      while (true) {
        Consume();
        if (code_ == /* '*' */ 0x2a && Next() == /* '/' */ 0x2f) {
          Consume();
          break;
        } else if (Eof()) {
          errors_->emplace_back(AddPositionTo(mark, make_unique<ErrorToken>()));
          return;
        }
      }
    }
  }

  unique_ptr<Token> ConsumeANumericToken() {
    ConsumeANumber();
    if (WouldStartAnIdentifier(Next(1), Next(2), Next(3))) {
      return make_unique<DimensionToken>();
    } else if (Next() == /* '%' */ 0x25) {
      Consume();
      return make_unique<PercentageToken>();
    } else {
      return make_unique<NumberToken>();
    }
  }

  unique_ptr<Token> ConsumeAnIdentlikeToken() {
    std::string str = ConsumeAName();
    if (AsciiStrToLower(str) == "url" && Next() == /* '(' */ 0x28) {
      Consume();
      while (Whitespace(Next(1)) && Whitespace(Next(2))) Consume();
      if (Next() == /* '"' */ 0x22 || Next() == /* ''' */ 0x27) {
        return make_unique<FunctionToken>(str);
      } else if (Whitespace(Next()) &&
                 (Next(2) == /* '"' */ 0x22 || Next(2) == /* ''' */ 0x27)) {
        return make_unique<FunctionToken>(str);
      } else {
        return ConsumeAURLToken();
      }
    } else if (Next() == /* '(' */ 0x28) {
      Consume();
      return make_unique<FunctionToken>(str);
    }
    return make_unique<IdentToken>(str);
  }

  unique_ptr<Token> ConsumeAStringToken() {
    char32_t ending_code_point = code_;
    std::string str;
    while (true) {
      Consume();
      if (code_ == ending_code_point || Eof()) {
        return make_unique<StringToken>(str);
      } else if (Newline(code_)) {
        Reconsume();
        return make_unique<ErrorToken>();
      } else if (code_ == /* '\' */ 0x5c) {
        if (EofNext()) {
          Donothing();
        } else if (Newline(Next())) {
          Consume();
        } else {
          htmlparser::Strings::AppendCodepointToUtf8String(ConsumeEscape(),
                                                           &str);
        }
      } else {
        htmlparser::Strings::AppendCodepointToUtf8String(code_, &str);
      }
    }
  }

  unique_ptr<Token> ConsumeAURLToken() {
    std::string str;
    while (Whitespace(Next())) Consume();
    if (EofNext()) return make_unique<URLToken>(str);
    while (true) {
      Consume();
      if (code_ == /* ')' */ 0x29 || Eof()) {
        return make_unique<URLToken>(str);
      } else if (Whitespace(code_)) {
        while (Whitespace(Next())) Consume();
        if (Next() == /* ')' */ 0x29 || EofNext()) {
          Consume();
          return make_unique<URLToken>(str);
        } else {
          ConsumeTheRemnantsOfABadURL();
          return make_unique<ErrorToken>();
        }
      } else if (code_ == /* '"' */ 0x22 || code_ == /* ''' */ 0x27 ||
                 code_ == /* '(' */ 0x28 || Nonprintable(code_)) {
        ConsumeTheRemnantsOfABadURL();
        return make_unique<ErrorToken>();
      } else if (code_ == /* '\' */ 0x5c) {
        if (StartsWithAValidEscape()) {
          htmlparser::Strings::AppendCodepointToUtf8String(ConsumeEscape(),
                                                           &str);
        } else {
          ConsumeTheRemnantsOfABadURL();
          return make_unique<ErrorToken>();
        }
      } else {
        htmlparser::Strings::AppendCodepointToUtf8String(code_, &str);
      }
    }
  }

  char32_t ConsumeEscape() {
    // Assume the current character is the '\\'
    // and the next code point is not a newline.
    Consume();
    if (Hexdigit(code_)) {
      // Consume 1-6 hex digits
      std::string digits;
      digits.push_back(static_cast<uint8_t>(code_));
      for (int total = 0; total < 5; ++total) {
        if (Hexdigit(Next())) {
          Consume();
          digits.push_back(static_cast<uint8_t>(code_));
        } else {
          break;
        }
      }
      if (Whitespace(Next())) Consume();
      uint32_t value;
      if (!absl::numbers_internal::safe_strtou32_base(digits, &value,
                                                      /*base=*/16)) {
        value = 0xfffd;
      }
      if (value > kMaximumallowedcodepoint) value = 0xfffd;
      return value;
    } else if (Eof()) {
      return 0xfffd;
    } else {
      return code_;
    }
  }

  bool AreAValidEscape(char32_t c1, char32_t c2) {
    if (c1 != /* '\' */ 0x5c) return false;
    if (Newline(c2)) return false;
    return true;
  }

  bool StartsWithAValidEscape() { return AreAValidEscape(code_, Next()); }

  bool WouldStartAnIdentifier(char32_t c1, char32_t c2, char32_t c3) {
    if (c1 == /* '-' */ 0x2d) {
      return Namestartchar(c2) || c2 == /* '-' */ 0x2d ||
             AreAValidEscape(c2, c3);
    } else if (Namestartchar(c1)) {
      return true;
    } else if (c1 == /* '\' */ 0x5c) {
      return AreAValidEscape(c1, c2);
    } else {
      return false;
    }
  }

  bool StartsWithAnIdentifier() {
    return WouldStartAnIdentifier(code_, Next(1), Next(2));
  }

  bool WouldStartANumber(char32_t c1, char32_t c2, char32_t c3) {
    if (c1 == /* '+' */ 0x2b || c1 == /* '-' */ 0x2d) {
      if (Digit(c2)) return true;
      if (c2 == /* '.' */ 0x2e && Digit(c3)) return true;
      return false;
    } else if (c1 == /* '.' */ 0x2e) {
      if (Digit(c2)) return true;
      return false;
    } else if (Digit(c1)) {
      return true;
    } else {
      return false;
    }
  }

  bool StartsWithANumber() {
    return WouldStartANumber(code_, Next(1), Next(2));
  }

  std::string ConsumeAName() {
    std::string result;
    while (Consume()) {
      if (Namechar(code_)) {
        htmlparser::Strings::AppendCodepointToUtf8String(code_, &result);
      } else if (StartsWithAValidEscape()) {
        htmlparser::Strings::AppendCodepointToUtf8String(ConsumeEscape(),
                                                         &result);
      } else {
        Reconsume();
        break;
      }
    }
    return result;
  }

  void ConsumeANumber() {
    if (Next() == /* '+' */ 0x2b || Next() == /* '-' */ 0x2d) {
      Consume();
    }
    while (Digit(Next())) {
      Consume();
    }
    if (Next(1) == /* '.' */ 0x2e && Digit(Next(2))) {
      Consume();
      Consume();
      while (Digit(Next())) {
        Consume();
      }
    }
    char32_t c1 = Next(1), c2 = Next(2), c3 = Next(3);
    if ((c1 == /* 'E' */ 0x45 || c1 == /* 'e' */ 0x65) && Digit(c2)) {
      Consume();
      Consume();
      while (Digit(Next())) {
        Consume();
      }
    } else if ((c1 == /* 'E' */ 0x45 || c1 == /* 'e' */ 0x65) &&
               (c2 == /* '+' */ 0x2b || c2 == /* '-' */ 0x2d) && Digit(c3)) {
      Consume();
      Consume();
      Consume();
      while (Digit(Next())) {
        Consume();
      }
    }
  }

  void ConsumeTheRemnantsOfABadURL() {
    while (Consume()) {
      if (code_ == /* '-' */ 0x2d || Eof()) {
        return;
      } else if (StartsWithAValidEscape()) {
        ConsumeEscape();
        Donothing();
      } else {
        Donothing();
      }
    }
  }

  vector<char32_t> str_;
  char32_t code_;
  int32_t pos_;
  bool eof_;
  vector<unique_ptr<ErrorToken>>* errors_;
};
}  // namespace

std::string CodepointsToUtf8String(const vector<char32_t>& codes, int begin,
                                   int end) {
  std::stringbuf buf;
  for (auto iter = codes.begin() + begin; iter != codes.begin() + end; iter++) {
    auto encoded_bytes = htmlparser::Strings::EncodeUtf8Symbol(*iter);
    if (encoded_bytes.has_value()) {
      buf.sputn(encoded_bytes.value().c_str(), encoded_bytes.value().size());
    }
  }
  return buf.str();
}

// predeclare since these functions can recurse between each other.
int ConsumeAComponentValue(const vector<unique_ptr<Token>>& tokens,
                           int start_pos);

TokenType::Code TypeOrEof(const vector<unique_ptr<Token>>& tokens,
                          const int pos) {
  if (pos < tokens.size()) return tokens[pos]->Type();
  return tokens[tokens.size() - 1]->Type();
}

int ConsumeABlock(const vector<unique_ptr<Token>>& tokens,
                  const int start_pos) {
  TokenType::Code type = TypeOrEof(tokens, start_pos);
  TokenType::Code mirror;
  if (type == TokenType::OPEN_CURLY) {
    mirror = TokenType::CLOSE_CURLY;
  } else if (type == TokenType::OPEN_PAREN) {
    mirror = TokenType::CLOSE_PAREN;
  } else if (type == TokenType::OPEN_SQUARE) {
    mirror = TokenType::CLOSE_SQUARE;
  } else if (type == TokenType::FUNCTION_TOKEN) {
    mirror = TokenType::CLOSE_PAREN;
  } else {
    LOG(FATAL) << "Unexpected type: " << TokenType::Code_Name(type);
  }
  int cur_pos = start_pos;
  while (true) {
    cur_pos++;
    TokenType::Code type = TypeOrEof(tokens, cur_pos);
    if (type == TokenType::EOF_TOKEN || type == mirror) {
      return cur_pos;
    } else {
      cur_pos = ConsumeAComponentValue(tokens, cur_pos);
    }
  }

  return cur_pos;
}

int ConsumeAComponentValue(const vector<unique_ptr<Token>>& tokens,
                           const int start_pos) {
  TokenType::Code type = TypeOrEof(tokens, start_pos);
  CHECK(type != TokenType::EOF_TOKEN);
  if (type == TokenType::OPEN_CURLY || type == TokenType::OPEN_SQUARE ||
      type == TokenType::OPEN_PAREN || type == TokenType::FUNCTION_TOKEN) {
    return ConsumeABlock(tokens, start_pos);
  }

  return start_pos;
}

// Returns the position in |tokens| which marks the end of the font-face that
// starts at position |start_pos|.
int ConsumeAFontFace(const vector<unique_ptr<Token>>& tokens,
                     const int start_pos) {
  CHECK(TypeOrEof(tokens, start_pos) == TokenType::AT_KEYWORD)
      << TokenType::Code_Name(TypeOrEof(tokens, start_pos));
  CHECK(static_cast<const AtKeywordToken&>(*tokens[start_pos]).StringValue() ==
        "font-face")
      << static_cast<const AtKeywordToken&>(*tokens[start_pos]).StringValue();
  int cur_pos = start_pos;
  while (true) {
    cur_pos++;
    TokenType::Code type = TypeOrEof(tokens, cur_pos);
    if (type == TokenType::SEMICOLON || type == TokenType::EOF_TOKEN) {
      return cur_pos;
    }
    if (type == TokenType::OPEN_CURLY) {
      return ConsumeABlock(tokens, cur_pos);
    }
    cur_pos = ConsumeAComponentValue(tokens, cur_pos);
  }
}

int ConsumeAUrlFunction(const vector<unique_ptr<Token>>& tokens,
                        const int start_pos, std::string* url) {
  TokenType::Code type = TypeOrEof(tokens, start_pos);
  CHECK(type == TokenType::FUNCTION_TOKEN) << TokenType::Code_Name(type);
  int cur_pos = start_pos;
  *url = "";
  while (true) {
    cur_pos++;
    type = TypeOrEof(tokens, cur_pos);
    if (type == TokenType::EOF_TOKEN || type == TokenType::CLOSE_PAREN)
      return cur_pos;
    if (type == TokenType::WHITESPACE) {
      continue;
    } else if (type == TokenType::STRING && url->empty()) {
      *url = static_cast<const URLToken&>(*tokens[cur_pos]).StringValue();
      continue;
    } else {
      break;  // error case;
    }
  }

  // Valid URL functions shouldn't contain anything except whitespace and
  // a single string. This is an invalid URL function, so just consume
  // a generic function and output an empty URL.
  *url = "";
  return ConsumeABlock(tokens, start_pos);
}

bool SegmentCss(const std::string& utf8_css, vector<CssSegment>* segments) {
  // This changes the input string into an array of UTF8 Codepoints. Each
  // codepoint can match one or more bytes in the input string.
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(utf8_css);
  // This cleans up some line endings (\r \f \n).
  url::Preprocess(&css);

  vector<unique_ptr<ErrorToken>> errors;
  const vector<unique_ptr<Token>> tokens = url::Tokenize(css, &errors);

  // Documents with CSS errors are invalid AMP, so we can just exit early.
  if (!errors.empty()) return false;

  // This code includes limited CSS parsing. The reason it works is that we
  // can assume that the input is valid CSS. It might not be, but if it isn't
  // then the document is invalid AMP. So, if the input is invalid CSS we
  // need only be sure not to crash or produce a document with a security
  // vulnerability. At most this code will rewrite the URL contents of url()
  // tokens in the CSS so there shouldn't really much to worry about in
  // either case.

  int css_chars_emitted_until = 0;
  // Tracks the end of the last font-face rule we encountered. If this is past
  // the current position, then we are inside a font-face.
  int end_of_font_face = -1;
  for (int cur_pos = 0; cur_pos < tokens.size(); ++cur_pos) {
    Token& token = *tokens[cur_pos];

    // The AMP Cache uses different URL mappings for images and fonts, so we
    // must keep track of which is which. Fortunately we can track fonts as
    // any URL inside a "font-face" @ Rule and assume everything else is an
    // image.
    if (token.Type() == TokenType::AT_KEYWORD &&
        static_cast<const AtKeywordToken&>(token).StringValue() ==
            "font-face") {
      end_of_font_face = ConsumeAFontFace(tokens, cur_pos);
    }

    // There are two types of URL tokens. The first is an URL token and the
    // second is a Function token with url as the function name. The
    // difference is really if the URL inside has quotes around it or not.
    if (token.Type() == TokenType::URL) {
      {
        // Output a segment which contains all non-URL CSS that we saw since
        // the last time we output a segment.
        CssSegment segment;
        segment.type = CssSegment::BYTES;
        segment.utf8_data =
            CodepointsToUtf8String(css, css_chars_emitted_until, token.pos());
        segments->emplace_back(segment);
      }

      {
        // Next, output a segment which includes the URL token we found.
        CssSegment segment;
        segment.type = end_of_font_face > cur_pos ? CssSegment::OTHER_URL
                                                  : CssSegment::IMAGE_URL;
        segment.utf8_data = static_cast<const URLToken&>(token).StringValue();
        segments->emplace_back(segment);
      }

      CHECK(cur_pos + 1 < tokens.size()) << "tokens missing EOF_TOKEN";
      // Set our next range start to the start of the next token.
      css_chars_emitted_until = tokens[cur_pos + 1]->pos();
    }

    if (token.Type() == TokenType::FUNCTION_TOKEN &&
        static_cast<const FunctionToken&>(token).StringValue() == "url") {
      {
        // Output a segment which contains all non-URL CSS that we saw since
        // the last time we output a segment.
        CssSegment segment;
        segment.type = CssSegment::BYTES;
        segment.utf8_data =
            CodepointsToUtf8String(css, css_chars_emitted_until, token.pos());
        segments->emplace_back(segment);
      }

      {
        // Next, output a segment which includes the URL token we found.
        CssSegment segment;
        segment.type = end_of_font_face > cur_pos ? CssSegment::OTHER_URL
                                                  : CssSegment::IMAGE_URL;
        // Record the URL as the segment's URL.
        cur_pos = ConsumeAUrlFunction(tokens, cur_pos, &segment.utf8_data);
        segments->emplace_back(segment);
      }

      // If we have more tokens, set our next range start to the start of
      // the next token.
      if (cur_pos + 1 < tokens.size())
        css_chars_emitted_until = tokens[cur_pos + 1]->pos();
    }
  }

  // Add a segment with the remainder. It might be an empty segment.
  CssSegment segment;
  segment.type = CssSegment::BYTES;
  segment.utf8_data =
      CodepointsToUtf8String(css, css_chars_emitted_until, css.size());
  segments->emplace_back(segment);
  return true;
}

// Preprocesses the input string and instantiates the Tokenizer; returns the
// resulting tokens.
vector<unique_ptr<Token>> Tokenize(const vector<char32_t>& str_in,
                                   vector<unique_ptr<ErrorToken>>* errors) {
  vector<char32_t> str(str_in);
  Preprocess(&str);
  vector<unique_ptr<Token>> tokens;
  Tokenizer tmp(str, &tokens, errors);
  return tokens;
}
}  // namespace htmlparser::css::url
