#include "cpp/htmlparser/css/parse-css.h"

#include <deque>
#include <memory>

#include "absl/algorithm/container.h"
#include "absl/memory/memory.h"
#include "absl/strings/numbers.h"
#include "absl/strings/str_cat.h"
#include "absl/strings/str_join.h"
#include "absl/types/variant.h"
#include "cpp/htmlparser/css/parse-css.pb.h"
#include "cpp/htmlparser/logging.h"
#include "cpp/htmlparser/strings.h"

using absl::make_unique;
using absl::StrCat;
using absl::WrapUnique;
using amp::validator::ValidationError;
using std::unique_ptr;
using std::vector;

namespace htmlparser::css {

static constexpr int kMaximumCssRecursion = 100;

namespace internal {

std::string_view StripVendorPrefix(absl::string_view prefixed_string) {
  // Checking for '-' is an optimization.
  if (!prefixed_string.empty() && prefixed_string[0] == '-') {
    // ConsumePrefix returns true if anything is consumed. This slightly
    // strange syntax will cause us to exit early if we find a match.
    if (absl::ConsumePrefix(&prefixed_string, "-o-")) {
    } else if (absl::ConsumePrefix(&prefixed_string, "-moz-")) {
    } else if (absl::ConsumePrefix(&prefixed_string, "-ms-")) {
    } else if (absl::ConsumePrefix(&prefixed_string, "-webkit-")) {
    }
  }
  return prefixed_string.data();
}

std::string_view StripMinMaxPrefix(absl::string_view prefixed_string) {
  // We could just consume 'min-' and then 'max-, but then we'd allow 'min-max-'
  // but not 'max-min-' which is both wrong and weird.
  if (!absl::ConsumePrefix(&prefixed_string, "min-")) {
    absl::ConsumePrefix(&prefixed_string, "max-");
  }
  return prefixed_string.data();
}
}  // namespace internal

namespace {
// Sets |dest| to be a JSON array of the ->ToJson() results of the
// elements contained within |container|.
template <typename C>
void AppendJsonArray(htmlparser::json::JsonArray* dest, const C& container) {
  for (const auto& element : container) {
    dest->Append(element->ToJson());
  }
}

template <typename C>
void AppendValue(htmlparser::json::JsonDict* dict, const std::string& key,
                 const C& container) {
  htmlparser::json::JsonArray* array =
      dict->Get<htmlparser::json::JsonArray>(key);
  if (array) {
    AppendJsonArray(array, container);
  } else {
    htmlparser::json::JsonArray new_array;
    AppendJsonArray(&new_array, container);
    dict->Insert(key, new_array);
  }
}

}  // namespace

//
// Token implementations.
//
const std::string& Token::StringValue() const {
  static const std::string* empty = new std::string;
  return *empty;
}

std::string Token::ToString() const {
  // The following are overridden in their class: AT_KEYWORD, CLOSE_CURLY,
  // CLOSE_PAREN, CLOSE_SQUARE, DELIM, DIMENSION, FUNCTION_TOKEN, IDENT,
  // NUMBER, OPEN_CURLY, OPEN_PAREN, OPEN_SQUARE, PERCENTAGE, STRING, URL
  switch (Type()) {
    case TokenType::COLON:
      return ":";
    case TokenType::COMMA:
      return ",";
    case TokenType::EOF_TOKEN:
      return ";";
    case TokenType::SEMICOLON:
      return ";";
    case TokenType::WHITESPACE:
      return " ";
    default:
      return "";
  }
}

htmlparser::json::JsonDict Token::ToJson() const {
  htmlparser::json::JsonDict root;
  root.Insert("tokentype", TokenType::Code_Name(Type()));
  root.Insert("line", line());
  root.Insert("col", col());
  return root;
}

std::string GroupingToken::ToString() const { return StringValue(); }

DelimToken::DelimToken(char32_t code) : Token(TokenType::DELIM) {
  htmlparser::Strings::AppendCodepointToUtf8String(code, &value_);
}

DelimToken::DelimToken(const std::string& value)
    : Token(TokenType::DELIM), value_(value) {}

const std::string& DelimToken::StringValue() const { return value_; }

std::string DelimToken::ToString() const { return value_; }

htmlparser::json::JsonDict DelimToken::ToJson() const {
  htmlparser::json::JsonDict root = Token::ToJson();
  root.Insert("value", StringValue());
  return root;
}

const std::string& StringValuedToken::StringValue() const { return value_; }

std::string StringValuedToken::ToString() const { return value_; }

htmlparser::json::JsonDict StringValuedToken::ToJson() const {
  htmlparser::json::JsonDict root = Token::ToJson();
  root.Insert("value", StringValue());
  return root;
}

std::string FunctionToken::ToString() const {
  return StrCat(StringValue(), "(");
}

std::string AtKeywordToken::ToString() const {
  return StrCat("@", StringValue());
}

std::string HashToken::ToString() const { return StrCat("#", StringValue()); }

htmlparser::json::JsonDict HashToken::ToJson() const {
  htmlparser::json::JsonDict root = StringValuedToken::ToJson();
  root.Insert("type", type_);
  return root;
}

std::string StringToken::ToString() const {
  return StrCat("'", StringValue(), "'");
}

std::string URLToken::ToString() const {
  return StrCat("url(", StringValue(), ")");
}

std::string NumberToken::ToString() const { return repr_; }

htmlparser::json::JsonDict NumberToken::ToJson() const {
  htmlparser::json::JsonDict root = Token::ToJson();
  root.Insert("repr", repr_);
  root.Insert("type", type_);
  root.Insert("value", value_);
  return root;
}

const std::string& PercentageToken::StringValue() const { return repr_; }

htmlparser::json::JsonDict PercentageToken::ToJson() const {
  htmlparser::json::JsonDict root = Token::ToJson();
  root.Insert("repr", repr_);
  root.Insert("value", value_);
  return root;
}

std::string DimensionToken::ToString() const { return StrCat(repr_, unit_); }

htmlparser::json::JsonDict DimensionToken::ToJson() const {
  htmlparser::json::JsonDict root = Token::ToJson();
  root.Insert("repr", repr_);
  root.Insert("type", type_);
  root.Insert("unit", unit_);
  root.Insert("value", value_);
  return root;
}

htmlparser::json::JsonDict ErrorToken::ToJson() const {
  htmlparser::json::JsonDict root = Token::ToJson();
  root.Insert("code", ValidationError::Code_Name(code_));
  htmlparser::json::JsonArray params;
  for (const std::string& param : params_) {
    params.Append(param);
  }
  root.Insert("params", params);
  return root;
}

htmlparser::json::JsonDict Stylesheet::ToJson() const {
  htmlparser::json::JsonDict root = Rule::ToJson();
  AppendValue(&root, "rules", rules_);
  root.Insert("eof", eof_->ToJson());
  return root;
}

void Stylesheet::Accept(RuleVisitor* visitor) const {
  visitor->VisitStylesheet(*this);
  for (const unique_ptr<Rule>& rule : rules_) rule->Accept(visitor);
  visitor->LeaveStylesheet(*this);
}

htmlparser::json::JsonDict AtRule::ToJson() const {
  htmlparser::json::JsonDict root = Rule::ToJson();
  root.Insert("name", name());
  AppendValue(&root, "prelude", prelude_);
  AppendValue(&root, "rules", rules_);
  AppendValue(&root, "declarations", declarations_);
  return root;
}

void AtRule::Accept(RuleVisitor* visitor) const {
  visitor->VisitAtRule(*this);
  for (const unique_ptr<Rule>& rule : rules_) rule->Accept(visitor);
  for (const unique_ptr<Declaration>& declaration : declarations_)
    declaration->Accept(visitor);
  visitor->LeaveAtRule(*this);
}

std::string QualifiedRule::RuleName() const {
  vector<std::string> rule_name_values;
  for (const auto& prelude : prelude_) {
    const Token* token = static_cast<const Token*>(prelude.get());
    if (!token->StringValue().empty()) {
      rule_name_values.emplace_back(token->StringValue());
    }
  }
  return absl::StrJoin(rule_name_values, "");
}

htmlparser::json::JsonDict QualifiedRule::ToJson() const {
  htmlparser::json::JsonDict root = Rule::ToJson();
  AppendValue(&root, "prelude", prelude_);
  AppendValue(&root, "declarations", declarations_);
  return root;
}

const vector<unique_ptr<Token>>& QualifiedRule::prelude() const {
  return prelude_;
}

void QualifiedRule::Accept(RuleVisitor* visitor) const {
  visitor->VisitQualifiedRule(*this);
  for (const unique_ptr<Declaration>& declaration : declarations_)
    declaration->Accept(visitor);
  visitor->LeaveQualifiedRule(*this);
}

std::string Declaration::ToString() const {
  std::string declaration = StrCat(name_, ":");
  for (const auto& token : value_) {
    absl::StrAppend(&declaration, token->ToString());
  }
  if (important_) absl::StrAppend(&declaration, "important!");
  return declaration;
}

htmlparser::json::JsonDict Declaration::ToJson() const {
  htmlparser::json::JsonDict root = Rule::ToJson();
  root.Insert("name", name_);
  root.Insert("important", important_);
  AppendValue(&root, "value", value_);
  return root;
}

// For a declaration, if the first non-whitespace token is an identifier
// (including a number token type), returns its string value. Otherwise,
// returns the empty string.
std::string Declaration::FirstIdent() const {
  if (value_.empty()) return "";
  if (value_[0]->Type() == TokenType::IDENT) return value_[0]->StringValue();
  if (value_[0]->Type() == TokenType::NUMBER) return value_[0]->ToString();
  if (value_.size() >= 2 && value_[0]->Type() == TokenType::WHITESPACE) {
    if (value_[1]->Type() == TokenType::IDENT) return value_[1]->StringValue();
    if (value_[1]->Type() == TokenType::NUMBER) return value_[1]->ToString();
  }
  return "";
}

void Declaration::Accept(RuleVisitor* visitor) const {
  visitor->VisitDeclaration(*this);
  visitor->LeaveDeclaration(*this);
}

//
// Tokenization
//

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

// A MarkedPosition object saves position information from the tokenizer
// provided as |line| and |col| to the constructor and can later write that
// position back to a Token object.
class MarkedPosition {
 public:
  MarkedPosition(int line, int col, int pos)
      : line_(line), col_(col), pos_(pos) {}

  // Adds position to the given |token|, returning it for chaining.
  template <typename T>
  unique_ptr<T> AddPositionTo(unique_ptr<T> token) {
    token->set_line(line_);
    token->set_col(col_);
    token->set_pos(pos_);
    return token;
  }

 private:
  int line_;
  int col_;
  int pos_;
};

// This class isn't part of the public API. In Javascript it's just a method
// with several local variables and inner functions. Here it's a helper
// class which keeps the state in fields, and it's called by the Tokenize
// functions (which is in the header).
class Tokenizer {
 public:
  Tokenizer(vector<char32_t>* str, int line, int col,
            vector<unique_ptr<Token>>* tokens,
            vector<unique_ptr<ErrorToken>>* errors)
      : str_(str), code_(0), pos_(-1), eof_(false), errors_(errors) {
    Preprocess(str_);

    // Compute line number information.
    line_by_pos_.resize(str_->size());
    col_by_pos_.resize(str_->size());
    int current_line = line;
    int current_col = col;
    for (int ii = 0; ii < str_->size(); ++ii) {
      line_by_pos_[ii] = current_line;
      col_by_pos_[ii] = current_col;
      if (Newline((*str_)[ii])) {
        ++current_line;
        current_col = 0;
      } else {
        ++current_col;
      }
    }

    while (!EofNext()) {
      unique_ptr<Token> token = ConsumeAToken();
      if (token->Type() == TokenType::ERROR) {
        errors->emplace_back(static_cast<ErrorToken*>(token.release()));
      } else {
        tokens->emplace_back(std::move(token));
      }
    }
    tokens->emplace_back(make_unique<EOFToken>());
    tokens->back()->set_line(current_line);
    tokens->back()->set_col(current_col);
    tokens->back()->set_pos(str_->size());
  }

  // Implements 3.3. Preprocessing the input stream.
  // http://www.w3.org/TR/css-syntax-3/#input-preprocessing
  static void Preprocess(vector<char32_t>* codepoints) {
    bool last_codepoint_was_cr = false;
    int write_idx = 0;
    for (int ii = 0; ii < codepoints->size(); ++ii) {
      char32_t codepoint = (*codepoints)[ii];
      switch (codepoint) {
        case '\r':  // also known as carriage return (CR)
          (*codepoints)[write_idx] = '\n';
          write_idx++;
          last_codepoint_was_cr = true;
          break;
        case '\f':  // also known as form feed (FF)
          (*codepoints)[write_idx] = '\n';
          write_idx++;
          last_codepoint_was_cr = false;
          break;
        case '\n':  // also known as line feed (LF)
          if (!last_codepoint_was_cr) {
            (*codepoints)[write_idx] = '\n';
            write_idx++;
          }
          last_codepoint_was_cr = false;
          break;
        default:
          (*codepoints)[write_idx] = codepoint;
          write_idx++;
          last_codepoint_was_cr = false;
          break;
      }
    }
    codepoints->erase(codepoints->begin() + write_idx, codepoints->end());
  }

  int line() const {
    if (pos_ < 0) return 1;
    if (pos_ >= line_by_pos_.size()) return line_by_pos_.back();
    return line_by_pos_[pos_];
  }

  int col() const {
    if (pos_ < 0) return 0;
    if (pos_ >= col_by_pos_.size()) return col_by_pos_.back();
    return col_by_pos_[pos_];
  }

 private:
  char32_t Codepoint(int n) {
    if (n >= str_->size()) {
      return 0;
    }
    return (*str_)[n];
  }

  char32_t Next(int num = 1) {
    CHECK(num >= 0) << "Spec Error; cannot lookahead a negative amount";
    CHECK(num <= 3)
        << "Spec Error; no more than three codepoints of lookahead.";
    return Codepoint(pos_ + num);
  }

  bool Consume(int num = 1) {
    pos_ += num;
    if (pos_ >= str_->size()) {
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

  bool EofNext(int num = 1) { return pos_ + num >= str_->size(); }

  bool Eof() { return eof_; }

  void Donothing() {}

  unique_ptr<Token> ConsumeAToken() {
    ConsumeComments();
    Consume();
    MarkedPosition mark(line(), col(), pos_);
    if (Whitespace(code_)) {
      while (Whitespace(Next())) Consume();
      return mark.AddPositionTo(make_unique<WhitespaceToken>());
    } else if (code_ == /* '"' */ 0x22) {
      return mark.AddPositionTo(ConsumeAStringToken());
    } else if (code_ == /* '#' */ 0x23) {
      if (Namechar(Next()) || AreAValidEscape(Next(1), Next(2))) {
        std::string type = "unrestricted";
        if (WouldStartAnIdentifier(Next(1), Next(2), Next(3))) type = "id";
        return mark.AddPositionTo(
            make_unique<HashToken>(ConsumeAName(), /*type=*/type));
      } else {
        return mark.AddPositionTo(make_unique<DelimToken>(code_));
      }
    } else if (code_ == /* '$' */ 0x24) {
      if (Next() == /* '=' */ 0x3d) {
        Consume();
        return mark.AddPositionTo(make_unique<SuffixMatchToken>());
      } else {
        return mark.AddPositionTo(make_unique<DelimToken>(code_));
      }
    } else if (code_ == /* ''' */ 0x27) {
      return mark.AddPositionTo(ConsumeAStringToken());
    } else if (code_ == /* '(' */ 0x28) {
      return mark.AddPositionTo(make_unique<OpenParenToken>());
    } else if (code_ == /* ')' */ 0x29) {
      return mark.AddPositionTo(make_unique<CloseParenToken>());
    } else if (code_ == /* '*' */ 0x2a) {
      if (Next() == /* '=' */ 0x3d) {
        Consume();
        return mark.AddPositionTo(make_unique<SubstringMatchToken>());
      } else {
        return mark.AddPositionTo(make_unique<DelimToken>(code_));
      }
    } else if (code_ == /* '+' */ 0x2b) {
      if (StartsWithANumber()) {
        Reconsume();
        return mark.AddPositionTo(ConsumeANumericToken());
      } else {
        return mark.AddPositionTo(make_unique<DelimToken>(code_));
      }
    } else if (code_ == /* ',' */ 0x2c) {
      return mark.AddPositionTo(make_unique<CommaToken>());
    } else if (code_ == /* '-' */ 0x2d) {
      if (StartsWithANumber()) {
        Reconsume();
        return mark.AddPositionTo(ConsumeANumericToken());
      } else if (Next(1) == /* '-' */ 0x2d && Next(2) == /* '>' */ 0x3e) {
        Consume(2);
        return mark.AddPositionTo(make_unique<CDCToken>());
      } else if (StartsWithAnIdentifier()) {
        Reconsume();
        return mark.AddPositionTo(ConsumeAnIdentlikeToken());
      } else {
        return mark.AddPositionTo(make_unique<DelimToken>(code_));
      }
    } else if (code_ == /* '.' */ 0x2e) {
      if (StartsWithANumber()) {
        Reconsume();
        return mark.AddPositionTo(ConsumeANumericToken());
      } else {
        return mark.AddPositionTo(make_unique<DelimToken>(code_));
      }
    } else if (code_ == /* ':' */ 0x3a) {
      return mark.AddPositionTo(make_unique<ColonToken>());
    } else if (code_ == /* ';' */ 0x3b) {
      return mark.AddPositionTo(make_unique<SemicolonToken>());
    } else if (code_ == /* '<' */ 0x3c) {
      if (Next(1) == /* '!' */ 0x21 && Next(2) == /* '-' */ 0x2d &&
          Next(3) == /* '-' */ 0x2d) {
        Consume(3);
        return mark.AddPositionTo(make_unique<CDOToken>());
      } else {
        return mark.AddPositionTo(make_unique<DelimToken>(code_));
      }
    } else if (code_ == /* '@' */ 0x40) {
      if (WouldStartAnIdentifier(Next(1), Next(2), Next(3))) {
        return mark.AddPositionTo(make_unique<AtKeywordToken>(ConsumeAName()));
      } else {
        return mark.AddPositionTo(make_unique<DelimToken>(code_));
      }
    } else if (code_ == /* '[' */ 0x5b) {
      return mark.AddPositionTo(make_unique<OpenSquareToken>());
    } else if (code_ == /* '\' */ 0x5c) {
      if (StartsWithAValidEscape()) {
        Reconsume();
        return mark.AddPositionTo(ConsumeAnIdentlikeToken());
      } else {
        // This condition happens if we are in consumeAToken (this method),
        // the current codepoint is 0x5c (\) and the next codepoint is a
        // newline (\n).
        return mark.AddPositionTo(make_unique<ErrorToken>(
            ValidationError::CSS_SYNTAX_STRAY_TRAILING_BACKSLASH,
            vector<std::string>{"style"}));
      }
    } else if (code_ == /* ']' */ 0x5d) {
      return mark.AddPositionTo(make_unique<CloseSquareToken>());
    } else if (code_ == /* '^' */ 0x5e) {
      if (Next() == /* '=' */ 0x3d) {
        Consume();
        return mark.AddPositionTo(make_unique<PrefixMatchToken>());
      } else {
        return mark.AddPositionTo(make_unique<DelimToken>(code_));
      }
    } else if (code_ == /* '{' */ 0x7b) {
      return mark.AddPositionTo(make_unique<OpenCurlyToken>());
    } else if (code_ == /* '|' */ 0x7c) {
      if (Next() == /* '=' */ 0x3d) {
        Consume();
        return mark.AddPositionTo(make_unique<DashMatchToken>());
      } else if (Next() == /* '|' */ 0x7c) {
        Consume();
        return mark.AddPositionTo(make_unique<ColumnToken>());
      } else {
        return mark.AddPositionTo(make_unique<DelimToken>(code_));
      }
    } else if (code_ == /* '}' */ 0x7d) {
      return mark.AddPositionTo(make_unique<CloseCurlyToken>());
    } else if (code_ == /* '~' */ 0x7e) {
      if (Next() == /* '=' */ 0x3d) {
        Consume();
        return mark.AddPositionTo(make_unique<IncludeMatchToken>());
      } else {
        return mark.AddPositionTo(make_unique<DelimToken>(code_));
      }
    } else if (Digit(code_)) {
      Reconsume();
      return mark.AddPositionTo(ConsumeANumericToken());
    } else if (Namestartchar(code_)) {
      Reconsume();
      return mark.AddPositionTo(ConsumeAnIdentlikeToken());
    } else if (Eof()) {
      return mark.AddPositionTo(make_unique<EOFToken>());
    } else {
      return mark.AddPositionTo(make_unique<DelimToken>(code_));
    }
  }

  void ConsumeComments() {
    MarkedPosition mark(line(), col(), pos_);
    while (Next(1) == /* '/' */ 0x2f && Next(2) == /* '*' */ 0x2a) {
      Consume(2);
      while (true) {
        Consume();
        if (code_ == /* '*' */ 0x2a && Next() == /* '/' */ 0x2f) {
          Consume();
          break;
        } else if (Eof()) {
          errors_->emplace_back(mark.AddPositionTo(make_unique<ErrorToken>(
              ValidationError::CSS_SYNTAX_UNTERMINATED_COMMENT,
              vector<std::string>{"style"})));
          return;
        }
      }
    }
  }

  unique_ptr<Token> ConsumeANumericToken() {
    ConsumedNumber num = ConsumeANumber();
    double value;
    if (!absl::SimpleAtod(num.repr, &value)) value = 0;
    if (WouldStartAnIdentifier(Next(1), Next(2), Next(3))) {
      return make_unique<DimensionToken>(
          /*type=*/num.type, /*repr=*/num.repr,
          /*unit=*/ConsumeAName(), /*value=*/value);
    } else if (Next() == /* '%' */ 0x25) {
      Consume();
      return make_unique<PercentageToken>(num.repr, /*value=*/value);
    } else {
      return make_unique<NumberToken>(/*repr=*/num.repr, /*type=*/num.type,
                                      /*value=*/value);
    }
  }

  unique_ptr<Token> ConsumeAnIdentlikeToken() {
    std::string str = ConsumeAName();
    if (htmlparser::Strings::EqualFold(str, "url") &&
        Next() == /* '(' */ 0x28) {
      Consume();
      while (Whitespace(Next(1)) && Whitespace(Next(2))) Consume();
      if (Next() == /* '"' */ 0x22 || Next() == /* ''' */ 0x27) {
        return make_unique<FunctionToken>(std::move(str));
      } else if (Whitespace(Next()) &&
                 (Next(2) == /* '"' */ 0x22 || Next(2) == /* ''' */ 0x27)) {
        return make_unique<FunctionToken>(std::move(str));
      } else {
        return ConsumeAURLToken();
      }
    } else if (Next() == /* '(' */ 0x28) {
      Consume();
      return make_unique<FunctionToken>(std::move(str));
    }
    return make_unique<IdentToken>(std::move(str));
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
        return make_unique<ErrorToken>(
            ValidationError::CSS_SYNTAX_UNTERMINATED_STRING,
            vector<std::string>{"style"});
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
          return make_unique<ErrorToken>(ValidationError::CSS_SYNTAX_BAD_URL,
                                         vector<std::string>{"style"});
        }
      } else if (code_ == /* '"' */ 0x22 || code_ == /* ''' */ 0x27 ||
                 code_ == /* '(' */ 0x28 || Nonprintable(code_)) {
        ConsumeTheRemnantsOfABadURL();
        return make_unique<ErrorToken>(ValidationError::CSS_SYNTAX_BAD_URL,
                                       vector<std::string>{"style"});
      } else if (code_ == /* '\' */ 0x5c) {
        if (StartsWithAValidEscape()) {
          htmlparser::Strings::AppendCodepointToUtf8String(ConsumeEscape(),
                                                           &str);
        } else {
          ConsumeTheRemnantsOfABadURL();
          return make_unique<ErrorToken>(ValidationError::CSS_SYNTAX_BAD_URL,
                                         vector<std::string>{"style"});
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
    std::stringbuf buf;
    while (Consume()) {
      if (Namechar(code_)) {
        buf.sputc(code_);
      } else if (StartsWithAValidEscape()) {
        buf.sputc(ConsumeEscape());
      } else {
        Reconsume();
        return buf.str();
      }
    }

    return buf.str();
  }

  struct ConsumedNumber {
    std::string repr;
    std::string type;
  };
  ConsumedNumber ConsumeANumber() {
    ConsumedNumber number;
    number.type = "integer";
    if (Next() == /* '+' */ 0x2b || Next() == /* '-' */ 0x2d) {
      Consume();
      htmlparser::Strings::AppendCodepointToUtf8String(code_, &number.repr);
    }
    while (Digit(Next())) {
      Consume();
      htmlparser::Strings::AppendCodepointToUtf8String(code_, &number.repr);
    }
    if (Next(1) == /* '.' */ 0x2e && Digit(Next(2))) {
      Consume();
      htmlparser::Strings::AppendCodepointToUtf8String(code_, &number.repr);
      Consume();
      htmlparser::Strings::AppendCodepointToUtf8String(code_, &number.repr);
      number.type = "number";
      while (Digit(Next())) {
        Consume();
        htmlparser::Strings::AppendCodepointToUtf8String(code_, &number.repr);
      }
    }
    char32_t c1 = Next(1), c2 = Next(2), c3 = Next(3);
    if ((c1 == /* 'E' */ 0x45 || c1 == /* 'e' */ 0x65) && Digit(c2)) {
      Consume();
      htmlparser::Strings::AppendCodepointToUtf8String(code_, &number.repr);
      Consume();
      htmlparser::Strings::AppendCodepointToUtf8String(code_, &number.repr);
      number.type = "number";
      while (Digit(Next())) {
        Consume();
        htmlparser::Strings::AppendCodepointToUtf8String(code_, &number.repr);
      }
    } else if ((c1 == /* 'E' */ 0x45 || c1 == /* 'e' */ 0x65) &&
               (c2 == /* '+' */ 0x2b || c2 == /* '-' */ 0x2d) && Digit(c3)) {
      Consume();
      htmlparser::Strings::AppendCodepointToUtf8String(code_, &number.repr);
      Consume();
      htmlparser::Strings::AppendCodepointToUtf8String(code_, &number.repr);
      Consume();
      htmlparser::Strings::AppendCodepointToUtf8String(code_, &number.repr);
      number.type = "number";
      while (Digit(Next())) {
        Consume();
        htmlparser::Strings::AppendCodepointToUtf8String(code_, &number.repr);
      }
    }
    return number;
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

  vector<char32_t>* str_;
  char32_t code_;
  int32_t pos_;
  bool eof_;
  vector<int> line_by_pos_;
  vector<int> col_by_pos_;
  vector<unique_ptr<ErrorToken>>* errors_;
};
}  // namespace

// Preprocesses the input string and instantiates the Tokenizer; returns the
// resulting tokens.
vector<unique_ptr<Token>> Tokenize(vector<char32_t>* str_in, int line, int col,
                                   vector<unique_ptr<ErrorToken>>* errors) {
  vector<unique_ptr<Token>> tokens;
  Tokenizer tmp(str_in, /*line=*/line, /*col=*/col, &tokens, errors);
  return tokens;
}

unique_ptr<Token> CreateEOFTokenAt(const Token& position_token) {
  unique_ptr<Token> token = make_unique<EOFToken>();
  position_token.CopyStartPositionTo(token.get());
  return token;
}

unique_ptr<ErrorToken> CreateParseErrorTokenAt(
    const Token& position_token, ValidationError::Code code,
    const vector<std::string>& params) {
  auto token = make_unique<ErrorToken>(code, params);
  position_token.CopyStartPositionTo(token.get());
  return token;
}

//
// TokenStream
//
TokenStream::TokenStream(vector<unique_ptr<Token>> tokens)
    : tokens_(std::move(tokens)), pos_(-1) {
  CHECK(!tokens_.empty()) << "empty tokens";
  CHECK(tokens_.back()->Type() == TokenType::EOF_TOKEN)
      << tokens_.back()->Type();

  // Since the last element in |tokens| may get released, we make a
  // copy so that TokenAt may safely return it for n >=
  // tokens_.size(), even after tokens_.back() was released.
  eof_ = CreateEOFTokenAt(*tokens_.back());
}

const Token& TokenStream::TokenAt(int n) const {
  const unique_ptr<Token>& token = (n < tokens_.size()) ? tokens_[n] : eof_;
  CHECK(token.get()) << n;
  return *token;
}

void TokenStream::Consume(int n) { pos_ += n; }

const Token& TokenStream::Next() { return TokenAt(pos_ + 1); }

void TokenStream::Reconsume() { --pos_; }

const Token& TokenStream::Current() const {
  CHECK(pos_ >= 0) << "Consume not called";
  return TokenAt(pos_);
}

unique_ptr<Token> TokenStream::ReleaseCurrentOrCreateEof() {
  if (pos_ < tokens_.size()) {
    CHECK(tokens_[pos_].get()) << "null token";
    return std::move(tokens_[pos_]);
  }
  return CreateEOFTokenAt(*eof_);
}

//
// Parsing
//

// A canonicalizer is created with a specific spec for canonicalizing CSS AT
// rules. It otherwise has no state.
// |config.at_rule_spec| provides the block type rules for all CSS AT rules this
// canonicalizer should handle.
// |config.default_spec| defines the default block type for types not found in
// atRuleSpec.
class Canonicalizer {
 public:
  explicit Canonicalizer(const CssParsingConfig& config) : config_(config) {}

  BlockType::Code BlockTypeFor(const AtRule& at_rule) const {
    auto it = config_.at_rule_spec.find(
        std::string(StripVendorPrefix(at_rule.name())));
    if (it == config_.at_rule_spec.end()) return config_.default_spec;
    return it->second;
  }

  // Parses and returns a list of rules, such as at the top level of a
  // stylesheet. Return list has only QualifiedRule's and AtRule's as
  // top level elements.
  vector<unique_ptr<Rule>> ParseAListOfRules(
      vector<unique_ptr<Token>>* tokens, bool top_level,
      vector<unique_ptr<ErrorToken>>* errors) {
    TokenStream s(std::move(*tokens));
    vector<unique_ptr<Rule>> rules;
    while (true) {
      s.Consume();
      if (s.Current().Type() == TokenType::WHITESPACE) {
        continue;
      } else if (s.Current().Type() == TokenType::EOF_TOKEN) {
        return rules;
      } else if (s.Current().Type() == TokenType::CDO ||
                 s.Current().Type() == TokenType::CDC) {
        if (top_level) continue;
        ParseAQualifiedRule(&s, &rules, errors);
      } else if (s.Current().Type() == TokenType::AT_KEYWORD) {
        rules.emplace_back(ParseAnAtRule(&s, errors));
      } else {
        ParseAQualifiedRule(&s, &rules, errors);
      }
    }
  }

  // Parses an At Rule.
  unique_ptr<AtRule> ParseAnAtRule(TokenStream* s,
                                   vector<unique_ptr<ErrorToken>>* errors) {
    CHECK(s->Current().Type() == TokenType::AT_KEYWORD) << "invalid type";
    auto rule = make_unique<AtRule>(s->Current().StringValue());
    s->Current().CopyStartPositionTo(rule.get());

    while (true) {
      s->Consume();
      if (s->Current().Type() == TokenType::SEMICOLON) {
        rule->mutable_prelude()->emplace_back(CreateEOFTokenAt(s->Current()));
        return rule;
      }
      if (s->Current().Type() == TokenType::EOF_TOKEN) {
        rule->mutable_prelude()->emplace_back(s->ReleaseCurrentOrCreateEof());
        return rule;
      }
      if (s->Current().Type() == TokenType::OPEN_CURLY) {
        rule->mutable_prelude()->emplace_back(CreateEOFTokenAt(s->Current()));
        vector<unique_ptr<Token>> contents = ExtractASimpleBlock(s, errors);
        switch (BlockTypeFor(*rule)) {
          case BlockType::PARSE_AS_RULES: {
            vector<unique_ptr<Rule>> rules =
                ParseAListOfRules(&contents, /*top_level=*/false, errors);
            rule->mutable_rules()->swap(rules);
          } break;
          case BlockType::PARSE_AS_DECLARATIONS: {
            vector<unique_ptr<Declaration>> declarations =
                ParseAListOfDeclarations(&contents, errors);
            rule->mutable_declarations()->swap(declarations);
          } break;
          case BlockType::UNKNOWN:  // Ignore the unknown for now.
          case BlockType::PARSE_AS_IGNORE:
            break;
        }
        return rule;
      }
      if (!ConsumeAComponentValue(s, rule->mutable_prelude(), /*depth=*/0))
        errors->push_back(
            make_unique<ErrorToken>(ValidationError::CSS_EXCESSIVELY_NESTED,
                                    vector<std::string>{"style"}));
    }
  }

  // Parses one Qualified rule or ErrorToken appended to either |rules|
  // or |errors|, respectively. Rule will include a prelude with the CSS
  // selector (if any) and a list of declarations.
  void ParseAQualifiedRule(TokenStream* s, vector<unique_ptr<Rule>>* rules,
                           vector<unique_ptr<ErrorToken>>* errors) {
    CHECK(s->Current().Type() != TokenType::EOF_TOKEN) << "EOF_TOKEN";
    CHECK(s->Current().Type() != TokenType::AT_KEYWORD) << "AT_KEYWORD";

    auto rule = make_unique<QualifiedRule>();
    s->Current().CopyStartPositionTo(rule.get());
    s->Reconsume();
    while (true) {
      s->Consume();
      if (s->Current().Type() == TokenType::EOF_TOKEN) {
        errors->emplace_back(CreateParseErrorTokenAt(
            *rule, ValidationError::CSS_SYNTAX_EOF_IN_PRELUDE_OF_QUALIFIED_RULE,
            {"style"}));
        return;
      } else if (s->Current().Type() == TokenType::OPEN_CURLY) {
        rule->mutable_prelude()->emplace_back(CreateEOFTokenAt(s->Current()));

        // This consumes declarations (ie: "color: red;" ) inside
        // a qualified rule as that rule's value.
        vector<unique_ptr<Token>> simple_block = ExtractASimpleBlock(s, errors);
        vector<unique_ptr<Declaration>> declarations =
            ParseAListOfDeclarations(&simple_block, errors);
        rule->mutable_declarations()->swap(declarations);
        rules->emplace_back(std::move(rule));
        return;
      }
      // This consumes a CSS selector as the rules prelude.
      if (!ConsumeAComponentValue(s, rule->mutable_prelude(), /*depth=*/0))
        errors->push_back(
            make_unique<ErrorToken>(ValidationError::CSS_EXCESSIVELY_NESTED,
                                    vector<std::string>{"style"}));
    }
  }

  vector<unique_ptr<Declaration>> ParseAListOfDeclarations(
      vector<unique_ptr<Token>>* tokens,
      vector<unique_ptr<ErrorToken>>* errors) {
    vector<unique_ptr<Declaration>> decls;
    TokenStream s(std::move(*tokens));
    while (true) {
      s.Consume();
      if (s.Current().Type() == TokenType::WHITESPACE ||
          s.Current().Type() == TokenType::SEMICOLON) {
        continue;
      } else if (s.Current().Type() == TokenType::EOF_TOKEN) {
        return decls;
      } else if (s.Current().Type() == TokenType::AT_KEYWORD) {
        // The CSS3 Parsing spec allows for AT rules inside lists of
        // declarations, but our grammar does not so we deviate a tiny bit here.
        // We consume an AT rule, but drop it and instead push an error token.
        unique_ptr<AtRule> at_rule = ParseAnAtRule(&s, errors);
        errors->emplace_back(CreateParseErrorTokenAt(
            *at_rule, ValidationError::CSS_SYNTAX_INVALID_AT_RULE,
            /*params=*/{"style", at_rule->name()}));
      } else if (s.Current().Type() == TokenType::IDENT) {
        ParseADeclaration(&s, &decls, errors);
      } else {
        errors->emplace_back(CreateParseErrorTokenAt(
            s.Current(), ValidationError::CSS_SYNTAX_INVALID_DECLARATION,
            {"style"}));
        s.Reconsume();
        while (!(s.Next().Type() == TokenType::SEMICOLON ||
                 s.Next().Type() == TokenType::EOF_TOKEN)) {
          s.Consume();
          vector<unique_ptr<Token>> dummy_token_list;
          if (!ConsumeAComponentValue(&s, &dummy_token_list, /*depth=*/0))
            errors->push_back(
                make_unique<ErrorToken>(ValidationError::CSS_EXCESSIVELY_NESTED,
                                        vector<std::string>{"style"}));
        }
      }
    }
  }

  // Adds one element to either |declarations| or |errors|.
  void ParseADeclaration(TokenStream* s,
                         vector<unique_ptr<Declaration>>* declarations,
                         vector<unique_ptr<ErrorToken>>* errors) {
    CHECK(s->Current().Type() == TokenType::IDENT) << "invalid type";

    auto decl = make_unique<Declaration>(s->Current().StringValue());
    s->Current().CopyStartPositionTo(decl.get());

    while (s->Next().Type() == TokenType::WHITESPACE) s->Consume();

    s->Consume();
    if (!(s->Current().Type() == TokenType::COLON)) {
      errors->emplace_back(CreateParseErrorTokenAt(
          *decl, ValidationError::CSS_SYNTAX_INCOMPLETE_DECLARATION,
          {"style"}));
      s->Reconsume();
      while (!(s->Next().Type() == TokenType::SEMICOLON ||
               s->Next().Type() == TokenType::EOF_TOKEN)) {
        s->Consume();
      }
      return;
    }

    while (!(s->Next().Type() == TokenType::SEMICOLON ||
             s->Next().Type() == TokenType::EOF_TOKEN)) {
      s->Consume();
      if (!ConsumeAComponentValue(s, decl->mutable_value(), /*depth=*/0))
        errors->push_back(
            make_unique<ErrorToken>(ValidationError::CSS_EXCESSIVELY_NESTED,
                                    vector<std::string>{"style"}));
    }
    decl->mutable_value()->emplace_back(CreateEOFTokenAt(s->Next()));

    bool found_important = false;
    const vector<unique_ptr<Token>>& value = decl->value();
    // The last token is always EOF, so start at the 2nd to last token.
    for (int ii = value.size() - 2; ii >= 0; --ii) {
      if (value[ii]->Type() == TokenType::WHITESPACE) {
        continue;
      } else if (value[ii]->Type() == TokenType::IDENT &&
                 htmlparser::Strings::EqualFold(
                     static_cast<const IdentToken&>(*value[ii]).StringValue(),
                     "important")) {
        found_important = true;
      } else if (found_important && value[ii]->Type() == TokenType::DELIM &&
                 value[ii]->StringValue() == "!") {
        decl->set_important(value[ii]->line(), value[ii]->col());
        // Delete !important and later, but not the EOF_TOKEN.
        decl->mutable_value()->erase(decl->mutable_value()->begin() + ii,
                                     decl->mutable_value()->end() - 1);
        break;
      } else {
        break;
      }
    }
    declarations->emplace_back(std::move(decl));
  }

  // Consumes one or more tokens from |s|, appending them to |tokens|.
  // If exceeds depth, returns false;
  static bool ConsumeAComponentValue(TokenStream* s,
                                     vector<unique_ptr<Token>>* tokens,
                                     int depth) {
    if (depth > kMaximumCssRecursion) return false;
    TokenType::Code type = s->Current().Type();
    if (type == TokenType::OPEN_CURLY || type == TokenType::OPEN_SQUARE ||
        type == TokenType::OPEN_PAREN) {
      if (!ConsumeASimpleBlock(s, tokens, depth + 1)) return false;
    } else if (type == TokenType::FUNCTION_TOKEN) {
      if (!ConsumeAFunction(s, tokens, depth + 1)) return false;
    } else {
      tokens->emplace_back(s->ReleaseCurrentOrCreateEof());
    }
    return true;
  }

  // Appends a simple block's contents to |tokens|, consuming from |s|
  // all those tokens that it adds to |tokens|, including the
  // start/end grouping token.
  // If exceeds depth, returns false;
  static bool ConsumeASimpleBlock(TokenStream* s,
                                  vector<unique_ptr<Token>>* tokens,
                                  int depth) {
    if (depth > kMaximumCssRecursion) return false;
    CHECK(s->Current().Type() == TokenType::OPEN_CURLY ||
          s->Current().Type() == TokenType::OPEN_SQUARE ||
          s->Current().Type() == TokenType::OPEN_PAREN)
        << TokenType::Code_Name(s->Current().Type());
    std::string mirror =
        static_cast<const GroupingToken&>(s->Current()).Mirror();
    tokens->emplace_back(s->ReleaseCurrentOrCreateEof());
    while (true) {
      s->Consume();
      if (s->Current().Type() == TokenType::EOF_TOKEN) {
        tokens->emplace_back(s->ReleaseCurrentOrCreateEof());
        return true;
      } else if (s->Current().IsGroupingToken() &&
                 s->Current().StringValue() == mirror) {
        tokens->emplace_back(s->ReleaseCurrentOrCreateEof());
        return true;
      } else {
        if (!ConsumeAComponentValue(s, tokens, depth + 1)) return false;
      }
    }
    return true;
  }

  // Returns a simple block's contents in |s|, excluding the start/end
  // grouping token, and appended with an EOFToken.
  static vector<unique_ptr<Token>> ExtractASimpleBlock(
      TokenStream* s, vector<unique_ptr<ErrorToken>>* errors) {
    vector<unique_ptr<Token>> simple_block;
    if (!ConsumeASimpleBlock(s, &simple_block, /*depth=*/0))
      errors->push_back(
          make_unique<ErrorToken>(ValidationError::CSS_EXCESSIVELY_NESTED,
                                  vector<std::string>{"style"}));
    // A simple block always has a start token (e.g. '{') and
    // either a closing token or EOF token.
    CHECK_GE(simple_block.size(), 2);

    int original_size = simple_block.size();

    // Exclude the start token. Convert end token to EOF.
    simple_block.erase(simple_block.begin());
    unique_ptr<Token> eof = CreateEOFTokenAt(*simple_block.back());
    simple_block.back().swap(eof);
    CHECK(simple_block.size() == original_size - 1);
    return simple_block;
  }

  // Appends a function's contents to |tokens|, consuming from the
  // stream all those tokens that it adds to the |token|, including
  // the function token and end grouping token.
  // If exceeds depth, returns false;
  static bool ConsumeAFunction(TokenStream* s,
                               vector<unique_ptr<Token>>* tokens, int depth) {
    if (depth > kMaximumCssRecursion) return false;
    CHECK(s->Current().Type() == TokenType::FUNCTION_TOKEN);
    tokens->emplace_back(s->ReleaseCurrentOrCreateEof());
    while (true) {
      s->Consume();
      if (s->Current().Type() == TokenType::EOF_TOKEN ||
          s->Current().Type() == TokenType::CLOSE_PAREN) {
        tokens->emplace_back(s->ReleaseCurrentOrCreateEof());
        return true;
      } else {
        if (!ConsumeAComponentValue(s, tokens, depth + 1)) return false;
      }
    }
    return true;
  }

  // Returns a function's contents in the token list, including the leading
  // FunctionToken, but excluding the trailing CloseParen token and
  // appended with an EOFToken instead.
  static vector<unique_ptr<Token>> ExtractAFunction(
      TokenStream* s, vector<unique_ptr<ErrorToken>>* errors) {
    vector<unique_ptr<Token>> function;
    if (!ConsumeAFunction(s, &function, /*depth=*/0))
      errors->push_back(
          make_unique<ErrorToken>(ValidationError::CSS_EXCESSIVELY_NESTED,
                                  vector<std::string>{"style"}));

    // A simple block always has a start function token
    // either a close paren token or EOF token.
    CHECK_GE(function.size(), 2);

    // Convert end token to EOF.
    unique_ptr<Token> eof = CreateEOFTokenAt(*function.back());
    function.back().swap(eof);
    return function;
  }

 private:
  const CssParsingConfig config_;
};

unique_ptr<Stylesheet> ParseAStylesheet(
    vector<unique_ptr<Token>>* tokens, const CssParsingConfig& config,
    vector<unique_ptr<ErrorToken>>* errors) {
  Canonicalizer canonicalizer(config);
  unique_ptr<Token> eof = CreateEOFTokenAt(*tokens->back());
  Token start(TokenType::UNKNOWN);
  tokens->front()->CopyStartPositionTo(&start);
  vector<unique_ptr<Rule>> rules =
      canonicalizer.ParseAListOfRules(tokens, /*top_level=*/true, errors);
  auto stylesheet = make_unique<Stylesheet>(std::move(rules), std::move(eof));
  start.CopyStartPositionTo(stylesheet.get());
  return stylesheet;
}

vector<unique_ptr<Declaration>> ParseInlineStyle(
    vector<unique_ptr<Token>>* tokens, vector<unique_ptr<ErrorToken>>* errors) {
  CssParsingConfig config;
  config.default_spec = BlockType::PARSE_AS_DECLARATIONS;
  Canonicalizer canonicalizer(config);
  vector<unique_ptr<Declaration>> declarations =
      canonicalizer.ParseAListOfDeclarations(tokens, errors);
  return declarations;
}

namespace {
// Parses a CSS URL token; typically takes the form "url(http://foo)".
// Preconditions: tokens[token_idx] is a URL token
//                and token_idx + 1 is in range.
void ParseUrlToken(const vector<unique_ptr<Token>>& tokens, int token_idx,
                   ParsedCssUrl* parsed) {
  CHECK(token_idx + 1 < tokens.size());
  const Token& token = *tokens[token_idx];
  CHECK(token.Type() == TokenType::URL);
  token.CopyStartPositionTo(parsed);
  parsed->set_end_pos(tokens[token_idx + 1]->pos());
  parsed->set_utf8_url(static_cast<const URLToken&>(token).StringValue());
}

// Parses a CSS function token named 'url', including the string and closing
// paren. Typically takes the form "url('http://foo')".
// Returns the token_idx past the closing paren, or -1 if parsing fails.
// Preconditions: tokens[token_idx] is a URL token
//                and tokens[token_idx]->StringValue() == "url"
int ParseUrlFunction(const vector<unique_ptr<Token>>& tokens, int token_idx,
                     ParsedCssUrl* parsed) {
  const Token& token = *tokens[token_idx];
  CHECK(token.Type() == TokenType::FUNCTION_TOKEN);
  CHECK(static_cast<const FunctionToken&>(token).StringValue() == "url");
  CHECK(tokens.back()->Type() == TokenType::EOF_TOKEN);
  token.CopyStartPositionTo(parsed);

  ++token_idx;  // We've digested the function token above.
  CHECK(token_idx < tokens.size()) << "tokens missing EOF_TOKEN";

  // Consume optional whitespace.
  while (tokens[token_idx]->Type() == TokenType::WHITESPACE) {
    ++token_idx;
    CHECK(token_idx < tokens.size()) << "tokens missing EOF_TOKEN";
  }

  // Consume URL.
  if (tokens[token_idx]->Type() != TokenType::STRING) return -1;
  parsed->set_utf8_url(
      static_cast<const StringToken&>(*tokens[token_idx]).StringValue());
  ++token_idx;
  CHECK(token_idx < tokens.size()) << "tokens missing EOF_TOKEN";

  // Consume optional whitespace.
  while (tokens[token_idx]->Type() == TokenType::WHITESPACE) {
    ++token_idx;
    CHECK(token_idx < tokens.size()) << "tokens missing EOF_TOKEN";
  }

  // Consume ')'
  if (tokens[token_idx]->Type() != TokenType::CLOSE_PAREN) return -1;
  CHECK(token_idx + 1 < tokens.size()) << "tokens missing EOF_TOKEN";
  parsed->set_end_pos(tokens[token_idx + 1]->pos());
  return token_idx + 1;
}

// Helper class for implementing parse_css::ExtractUrls.
class UrlFunctionVisitor : public RuleVisitor {
 public:
  UrlFunctionVisitor(vector<unique_ptr<ParsedCssUrl>>* parsed_urls,
                     vector<unique_ptr<ErrorToken>>* errors)
      : parsed_urls_(parsed_urls), errors_(errors) {}

  void VisitAtRule(const AtRule& at_rule) override {
    at_rule_scope_ = at_rule.name();
  }

  void LeaveAtRule(const AtRule& at_rule) override { at_rule_scope_.clear(); }

  void VisitDeclaration(const Declaration& declaration) override {
    CHECK(!declaration.value().empty());
    CHECK(declaration.value().back()->Type() == TokenType::EOF_TOKEN);
    for (int ii = 0; ii < declaration.value().size() - 1;) {
      const Token& token = *declaration.value()[ii];
      if (token.Type() == TokenType::URL) {
        auto parsed_url = make_unique<ParsedCssUrl>();
        ParseUrlToken(declaration.value(), ii, parsed_url.get());
        parsed_url->set_at_rule_scope(at_rule_scope_);
        parsed_urls_->emplace_back(std::move(parsed_url));
        ++ii;
        continue;
      }
      if (token.Type() == TokenType::FUNCTION_TOKEN &&
          static_cast<const FunctionToken&>(token).StringValue() == "url") {
        auto parsed_url = make_unique<ParsedCssUrl>();
        ii = ParseUrlFunction(declaration.value(), ii, parsed_url.get());
        if (ii == -1) {
          auto error =
              make_unique<ErrorToken>(ValidationError::CSS_SYNTAX_BAD_URL,
                                      vector<std::string>{"style"});
          token.CopyStartPositionTo(error.get());
          errors_->emplace_back(std::move(error));
          return;
        }
        parsed_url->set_at_rule_scope(at_rule_scope_);
        parsed_urls_->emplace_back(std::move(parsed_url));
        continue;
      }
      // It's neither a url token nor a function token named url. So, we skip.
      ++ii;
    }
  }

 private:
  vector<unique_ptr<ParsedCssUrl>>* parsed_urls_;
  vector<unique_ptr<ErrorToken>>* errors_;
  std::string at_rule_scope_;
};

// Helper class for implementing parse_css::ParseMediaQueries.
class MediaQueryVisitor : public RuleVisitor {
 public:
  MediaQueryVisitor(std::vector<unique_ptr<Token>>* media_types,
                    std::vector<unique_ptr<Token>>* media_features,
                    std::vector<unique_ptr<ErrorToken>>* errors)
      : media_types_(media_types),
        media_features_(media_features),
        errors_(errors) {}

  void VisitAtRule(const AtRule& at_rule) override {
    if (!htmlparser::Strings::EqualFold(at_rule.name(), "media")) return;

    TokenStream token_stream(CloneTokens(at_rule.prelude()));
    token_stream.Consume();  // Advance to first token.
    if (!ParseAMediaQueryList(&token_stream)) {
      auto error = make_unique<ErrorToken>(
          ValidationError::CSS_SYNTAX_MALFORMED_MEDIA_QUERY,
          std::vector<std::string>{"style"});
      at_rule.CopyStartPositionTo(error.get());
      errors_->emplace_back(std::move(error));
    }
  }

 private:
  void MaybeConsumeAWhitespaceToken(TokenStream* token_stream) {
    if (token_stream->Current().Type() == TokenType::WHITESPACE)
      token_stream->Consume();
  }

  bool ParseAMediaQueryList(TokenStream* token_stream) {
    // https://www.w3.org/TR/css3-mediaqueries/#syntax
    // : S* [media_query [ ',' S* media_query ]* ]?
    // ;
    MaybeConsumeAWhitespaceToken(token_stream);
    if (token_stream->Current().Type() != TokenType::EOF_TOKEN) {
      if (!ParseAMediaQuery(token_stream)) return false;
      while (token_stream->Current().Type() == TokenType::COMMA) {
        token_stream->Consume();  // ','
        MaybeConsumeAWhitespaceToken(token_stream);
        if (!ParseAMediaQuery(token_stream)) return false;
      }
    }
    return token_stream->Current().Type() == TokenType::EOF_TOKEN;
  }

  bool ParseAMediaQuery(TokenStream* token_stream) {
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
    if (token_stream->Current().Type() == TokenType::OPEN_PAREN) {
      if (!ParseAMediaExpression(token_stream)) return false;
    } else {
      if (token_stream->Current().Type() == TokenType::IDENT &&
          (htmlparser::Strings::EqualFold(token_stream->Current().StringValue(),
                                          "only") ||
           htmlparser::Strings::EqualFold(token_stream->Current().StringValue(),
                                          "not"))) {
        token_stream->Consume();  // 'ONLY' | 'NOT'
      }
      MaybeConsumeAWhitespaceToken(token_stream);
      if (!ParseAMediaType(token_stream)) return false;
      MaybeConsumeAWhitespaceToken(token_stream);
    }
    while (token_stream->Current().Type() == TokenType::IDENT &&
           htmlparser::Strings::EqualFold(token_stream->Current().StringValue(),
                                          "and")) {
      token_stream->Consume();  // 'AND'
      MaybeConsumeAWhitespaceToken(token_stream);
      if (!ParseAMediaExpression(token_stream)) return false;
    }
    return true;
  }

  bool ParseAMediaType(TokenStream* token_stream) {
    // : IDENT
    // ;
    if (token_stream->Current().Type() == TokenType::IDENT) {
      media_types_->emplace_back(token_stream->Current().Clone());
      token_stream->Consume();
      return true;
    }
    return false;
  }

  // token_stream->Current() must be a FUNCTION_TOKEN. Consumes all Tokens up
  // to and including the matching closing paren for that FUNCTION_TOKEN.
  // If false, recursion exceeded maximum depth.
  bool ConsumeAFunction(TokenStream* token_stream, int depth = 0) {
    if (depth > kMaximumCssRecursion) return false;
    if (token_stream->Current().Type() != TokenType::FUNCTION_TOKEN)
      return false;
    token_stream->Consume();  // FUNCTION_TOKEN
    while (token_stream->Current().Type() != TokenType::EOF_TOKEN) {
      TokenType::Code type = token_stream->Current().Type();
      if (type == TokenType::FUNCTION_TOKEN) {
        if (!ConsumeAFunction(token_stream, depth + 1)) return false;
      } else if (type == TokenType::CLOSE_PAREN) {
        token_stream->Consume();
        return true;
      } else {
        token_stream->Consume();
      }
    }
    return false;  // EOF before function CLOSE_PAREN
  }

  bool ParseAMediaExpression(TokenStream* token_stream) {
    //  : '(' S* media_feature S* [ ':' S* expr ]? ')' S*
    //  ;
    if (token_stream->Current().Type() != TokenType::OPEN_PAREN) return false;
    token_stream->Consume();  // '('
    MaybeConsumeAWhitespaceToken(token_stream);
    if (!ParseAMediaFeature(token_stream)) return false;
    MaybeConsumeAWhitespaceToken(token_stream);
    if (token_stream->Current().Type() == TokenType::COLON) {
      token_stream->Consume();  // ':'
      MaybeConsumeAWhitespaceToken(token_stream);
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
      while (token_stream->Current().Type() != TokenType::EOF_TOKEN) {
        TokenType::Code type = token_stream->Current().Type();
        if (type == TokenType::CLOSE_PAREN) {
          break;
        } else if (type == TokenType::FUNCTION_TOKEN) {
          if (!ConsumeAFunction(token_stream)) return false;
        } else {
          token_stream->Consume();
        }
      }
    }
    if (token_stream->Current().Type() != TokenType::CLOSE_PAREN) return false;
    token_stream->Consume();  // ')'
    MaybeConsumeAWhitespaceToken(token_stream);
    return true;
  }

  bool ParseAMediaFeature(TokenStream* token_stream) {
    // : IDENT
    // ;
    if (token_stream->Current().Type() == TokenType::IDENT) {
      media_features_->emplace_back(token_stream->Current().Clone());
      token_stream->Consume();
      return true;
    }
    return false;
  }

  std::vector<unique_ptr<Token>>* media_types_;
  std::vector<unique_ptr<Token>>* media_features_;
  std::vector<unique_ptr<ErrorToken>>* errors_;
};

// Helper class for implementing parse_css::ExtractImportantProperties.
// Iterates over all declarations and returns pointers to declarations
// that were marked with `!important`.
class ImportantPropertyVisitor : public RuleVisitor {
 public:
  ImportantPropertyVisitor(vector<const Declaration*>* important)
      : important_(important) {}

  void VisitDeclaration(const Declaration& declaration) override {
    if (declaration.important()) important_->push_back(&declaration);
  }

 private:
  vector<const Declaration*>* important_;
};

}  // namespace

htmlparser::json::JsonDict ParsedCssUrl::ToJson() const {
  htmlparser::json::JsonDict root = Token::ToJson();
  root.Insert("endPos", end_pos_);
  root.Insert("utf8Url", utf8_url_);
  root.Insert("atRuleScope", at_rule_scope_);
  return root;
}

void ExtractUrls(const Stylesheet& stylesheet,
                 vector<unique_ptr<ParsedCssUrl>>* parsed_urls,
                 vector<unique_ptr<ErrorToken>>* errors) {
  int parsed_urls_old_size = parsed_urls->size();
  int errors_old_size = errors->size();
  UrlFunctionVisitor visitor(parsed_urls, errors);
  stylesheet.Accept(&visitor);
  // If anything went wrong, delete the urls we've already emitted.
  if (errors_old_size != errors->size())
    parsed_urls->resize(parsed_urls_old_size);
}

void ExtractUrls(const Declaration& declaration,
                 vector<unique_ptr<ParsedCssUrl>>* parsed_urls,
                 vector<unique_ptr<ErrorToken>>* errors) {
  int parsed_urls_old_size = parsed_urls->size();
  int errors_old_size = errors->size();
  UrlFunctionVisitor visitor(parsed_urls, errors);
  visitor.VisitDeclaration(declaration);
  // If anything went wrong, delete the urls we've already emitted.
  if (errors_old_size != errors->size())
    parsed_urls->resize(parsed_urls_old_size);
}

void ExtractImportantDeclarations(const Stylesheet& stylesheet,
                                  vector<const Declaration*>* important) {
  ImportantPropertyVisitor visitor(important);
  stylesheet.Accept(&visitor);
}

void ParseMediaQueries(const Stylesheet& stylesheet,
                       std::vector<unique_ptr<Token>>* media_types,
                       std::vector<unique_ptr<Token>>* media_features,
                       std::vector<unique_ptr<ErrorToken>>* errors) {
  MediaQueryVisitor visitor(media_types, media_features, errors);
  stylesheet.Accept(&visitor);
}

//
// Token Clone methods
//

unique_ptr<Token> Token::Clone() const {
  auto clone = make_unique<Token>(Type());
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> WhitespaceToken::Clone() const {
  unique_ptr<Token> clone = make_unique<WhitespaceToken>();
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> CDCToken::Clone() const {
  unique_ptr<Token> clone = make_unique<CDCToken>();
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> CDOToken::Clone() const {
  unique_ptr<Token> clone = make_unique<CDOToken>();
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> ColonToken::Clone() const {
  unique_ptr<Token> clone = make_unique<ColonToken>();
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> SemicolonToken::Clone() const {
  unique_ptr<Token> clone = make_unique<SemicolonToken>();
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> CommaToken::Clone() const {
  unique_ptr<Token> clone = make_unique<CommaToken>();
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> GroupingToken::Clone() const {
  unique_ptr<Token> clone = make_unique<GroupingToken>(Type(), value_, mirror_);
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> OpenCurlyToken::Clone() const {
  unique_ptr<Token> clone = make_unique<OpenCurlyToken>();
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> CloseCurlyToken::Clone() const {
  unique_ptr<Token> clone = make_unique<CloseCurlyToken>();
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> OpenSquareToken::Clone() const {
  unique_ptr<Token> clone = make_unique<OpenSquareToken>();
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> CloseSquareToken::Clone() const {
  unique_ptr<Token> clone = make_unique<CloseSquareToken>();
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> OpenParenToken::Clone() const {
  unique_ptr<Token> clone = make_unique<OpenParenToken>();
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> CloseParenToken::Clone() const {
  unique_ptr<Token> clone = make_unique<CloseParenToken>();
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> IncludeMatchToken::Clone() const {
  unique_ptr<Token> clone = make_unique<IncludeMatchToken>();
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> DashMatchToken::Clone() const {
  unique_ptr<Token> clone = make_unique<DashMatchToken>();
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> PrefixMatchToken::Clone() const {
  unique_ptr<Token> clone = make_unique<PrefixMatchToken>();
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> SuffixMatchToken::Clone() const {
  unique_ptr<Token> clone = make_unique<SuffixMatchToken>();
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> SubstringMatchToken::Clone() const {
  unique_ptr<Token> clone = make_unique<SubstringMatchToken>();
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> ColumnToken::Clone() const {
  unique_ptr<Token> clone = make_unique<ColumnToken>();
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> EOFToken::Clone() const {
  unique_ptr<Token> clone = make_unique<EOFToken>();
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> DelimToken::Clone() const {
  unique_ptr<Token> clone = WrapUnique(new DelimToken(value_));
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> StringValuedToken::Clone() const {
  unique_ptr<Token> clone = make_unique<StringValuedToken>(value_, Type());
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> IdentToken::Clone() const {
  unique_ptr<Token> clone = make_unique<IdentToken>(StringValue());
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> FunctionToken::Clone() const {
  unique_ptr<Token> clone = make_unique<FunctionToken>(StringValue());
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> AtKeywordToken::Clone() const {
  unique_ptr<Token> clone = make_unique<AtKeywordToken>(StringValue());
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> HashToken::Clone() const {
  unique_ptr<Token> clone = make_unique<HashToken>(StringValue(), type_);
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> StringToken::Clone() const {
  unique_ptr<Token> clone = make_unique<StringToken>(StringValue());
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> URLToken::Clone() const {
  unique_ptr<Token> clone = make_unique<URLToken>(StringValue());
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> NumberToken::Clone() const {
  unique_ptr<Token> clone = make_unique<NumberToken>(repr_, type_, value_);
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> PercentageToken::Clone() const {
  unique_ptr<Token> clone = make_unique<PercentageToken>(repr_, value_);
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> DimensionToken::Clone() const {
  unique_ptr<Token> clone =
      make_unique<DimensionToken>(type_, repr_, unit_, value_);
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> ErrorToken::Clone() const {
  unique_ptr<Token> clone = make_unique<ErrorToken>(code_, params_);
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> ParsedCssUrl::Clone() const {
  unique_ptr<Token> clone = WrapUnique(new ParsedCssUrl(end_pos_));
  ParsedCssUrl* parsed_clone = static_cast<ParsedCssUrl*>(clone.get());
  parsed_clone->set_utf8_url(utf8_url());
  parsed_clone->set_at_rule_scope(at_rule_scope());
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> TypeSelector::Clone() const {
  unique_ptr<Token> clone = make_unique<TypeSelector>(
      namespace_prefix_ ? make_unique<std::string>(*namespace_prefix_)
                        : nullptr,
      element_name_);
  TypeSelector* selector_clone = static_cast<TypeSelector*>(clone.get());
  selector_clone->set_end_pos(end_pos());
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> IdSelector::Clone() const {
  unique_ptr<Token> clone = make_unique<IdSelector>(value_);
  CopyStartPositionTo(clone.get());
  IdSelector* selector_clone = static_cast<IdSelector*>(clone.get());
  selector_clone->set_end_pos(end_pos());
  return clone;
}

unique_ptr<Token> AttrSelector::Clone() const {
  unique_ptr<Token> clone = make_unique<AttrSelector>(
      namespace_prefix_ ? make_unique<std::string>(*namespace_prefix_)
                        : nullptr,
      attr_name_, match_operator_, value_);
  CopyStartPositionTo(clone.get());
  AttrSelector* selector_clone = dynamic_cast<AttrSelector*>(clone.get());
  selector_clone->set_value_start_pos(value_start_pos());
  selector_clone->set_value_end_pos(value_end_pos());
  return clone;
}

unique_ptr<Token> PseudoSelector::Clone() const {
  unique_ptr<Token> clone =
      make_unique<PseudoSelector>(is_class_, name_, func_);
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> ClassSelector::Clone() const {
  unique_ptr<Token> clone = make_unique<ClassSelector>(value_);
  CopyStartPositionTo(clone.get());
  ClassSelector* selector_clone = static_cast<ClassSelector*>(clone.get());
  selector_clone->set_end_pos(end_pos());
  return clone;
}

unique_ptr<Token> SimpleSelectorSequence::Clone() const {
  unique_ptr<Token> clone = make_unique<SimpleSelectorSequence>(
      CloneToken(type_selector_), CloneTokens(other_selectors_));
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> Combinator::Clone() const {
  unique_ptr<Token> clone = make_unique<Combinator>(
      combinator_type(), CloneToken(left_), CloneToken(right_));
  CopyStartPositionTo(clone.get());
  return clone;
}

unique_ptr<Token> SelectorsGroup::Clone() const {
  unique_ptr<Token> clone = make_unique<SelectorsGroup>(CloneTokens(elements_));
  CopyStartPositionTo(clone.get());
  return clone;
}

//
// Selector
//
Selector::Selector(TokenType::Code type) : Token(type) {}

void Selector::ForEachChild(std::function<void(const Selector&)> lambda) const {
  // This method body is intentionally left blank.
}

//
// TypeSelector
//
TypeSelector::TypeSelector(unique_ptr<std::string> namespace_prefix,
                           const std::string& element_name)
    : Selector(TokenType::TYPE_SELECTOR),
      end_pos_(-1),
      namespace_prefix_(std::move(namespace_prefix)),
      element_name_(element_name) {}

std::string TypeSelector::ToString() const {
  if (namespace_prefix_ == nullptr) return element_name_;
  return StrCat(*namespace_prefix_, "|", element_name_);
}

htmlparser::json::JsonDict TypeSelector::ToJson() const {
  htmlparser::json::JsonDict json = Token::ToJson();
  if (namespace_prefix_ != nullptr) {
    std::string* prefix = json.Get<std::string>("namespacePrefix");
    if (prefix) {
      *prefix = *namespace_prefix_;
    } else {
      json.Insert("namespacePrefix", *namespace_prefix_);
    }
  }
  json.Insert("elementName", element_name_.c_str());
  json.Insert("pos", pos());
  json.Insert("endPos", end_pos());
  return json;
}

void TypeSelector::Accept(SelectorVisitor* visitor) const {
  visitor->VisitTypeSelector(*this);
}

namespace {
// Helper function for determining whether the provided |token| is a specific
// delimiter.
bool IsDelim(const Token& token, const std::string& delim_char) {
  return (token.Type() == TokenType::DELIM) &&
         static_cast<const DelimToken*>(&token)->StringValue() == delim_char;
}
}  // namespace

unique_ptr<TypeSelector> ParseATypeSelector(TokenStream* token_stream) {
  unique_ptr<std::string> namespace_prefix;
  std::string element_name = "*";
  const Token& start = token_stream->Current();
  if (IsDelim(token_stream->Current(), "|")) {
    namespace_prefix = make_unique<std::string>();
    token_stream->Consume();
  } else if (IsDelim(token_stream->Current(), "*") &&
             IsDelim(token_stream->Next(), "|")) {
    namespace_prefix = make_unique<std::string>("*");
    token_stream->Consume();
    token_stream->Consume();
  } else if (token_stream->Current().Type() == TokenType::IDENT &&
             IsDelim(token_stream->Next(), "|")) {
    namespace_prefix = make_unique<std::string>(
        static_cast<const IdentToken*>(&token_stream->Current())
            ->StringValue());
    token_stream->Consume();
    token_stream->Consume();
  }
  if (token_stream->Current().Type() == TokenType::DELIM &&
      IsDelim(token_stream->Current(), "*")) {
    element_name = "*";
    token_stream->Consume();
  } else if (token_stream->Current().Type() == TokenType::IDENT) {
    element_name =
        static_cast<const IdentToken*>(&token_stream->Current())->StringValue();
    token_stream->Consume();
  }
  auto selector =
      make_unique<TypeSelector>(std::move(namespace_prefix), element_name);
  start.CopyStartPositionTo(selector.get());
  selector->set_end_pos(token_stream->Current().pos());
  return selector;
}

//
// IdSelector
//
IdSelector::IdSelector(const std::string& value)
    : Selector(TokenType::ID_SELECTOR), end_pos_(-1), value_(value) {}

void IdSelector::Accept(SelectorVisitor* visitor) const {
  visitor->VisitIdSelector(*this);
}

std::string IdSelector::ToString() const { return StrCat("#", value_); }

htmlparser::json::JsonDict IdSelector::ToJson() const {
  htmlparser::json::JsonDict json = Token::ToJson();
  json.Insert("value", value_);
  json.Insert("endPos", end_pos_);
  return json;
}

unique_ptr<IdSelector> ParseAnIdSelector(TokenStream* token_stream) {
  CHECK(TokenType::HASH == token_stream->Current().Type());
  const HashToken& hash =
      *static_cast<const HashToken*>(&token_stream->Current());
  token_stream->Consume();
  auto selector = make_unique<IdSelector>(hash.StringValue());
  hash.CopyStartPositionTo(selector.get());
  selector->set_end_pos(token_stream->Current().pos());
  return selector;
}

//
// AttrSelector
//
AttrSelector::AttrSelector(unique_ptr<std::string> namespace_prefix,
                           const std::string& attr_name,
                           const std::string& match_operator,
                           const std::string& value)
    : Selector(TokenType::ATTR_SELECTOR),
      value_start_pos_(-1),
      value_end_pos_(-1),
      namespace_prefix_(std::move(namespace_prefix)),
      attr_name_(attr_name),
      match_operator_(match_operator),
      value_(value) {}

void AttrSelector::Accept(SelectorVisitor* visitor) const {
  visitor->VisitAttrSelector(*this);
}

htmlparser::json::JsonDict AttrSelector::ToJson() const {
  htmlparser::json::JsonDict json = Token::ToJson();
  if (namespace_prefix_ != nullptr) {
    std::string* prefix = json.Get<std::string>("namespacePrefix");
    if (prefix) {
      *prefix = *namespace_prefix_;
    } else {
      json.Insert("namespacePrefix", *namespace_prefix_);
    }
  }
  json.Insert("attrName", attr_name_);
  json.Insert("matchOperator", match_operator_);
  json.Insert("value", value_);
  json.Insert("valueStartPos", value_start_pos_);
  json.Insert("valueEndPos", value_end_pos_);
  return json;
}

namespace {  // Helper for ParseAnAttrSelector.
unique_ptr<ErrorToken> NewInvalidAttrSelectorError(const Token& start) {
  auto error =
      make_unique<ErrorToken>(ValidationError::CSS_SYNTAX_INVALID_ATTR_SELECTOR,
                              vector<std::string>{"style"});
  start.CopyStartPositionTo(error.get());
  return error;
}
}  // namespace

// token_stream->Current() must be the open square token.
// Returns either an AttrSelector or a ErrorToken.
ErrorTokenOr<AttrSelector> ParseAnAttrSelector(TokenStream* token_stream) {
  CHECK(TokenType::OPEN_SQUARE == token_stream->Current().Type());
  const Token& start = token_stream->Current();
  token_stream->Consume();  // Consumes '['.
  if (token_stream->Current().Type() == TokenType::WHITESPACE)
    token_stream->Consume();
  // This part is defined in https://www.w3.org/TR/css3-selectors/#attrnmsp:
  // Attribute selectors and namespaces. It is similar to parseATypeSelector.
  unique_ptr<std::string> namespace_prefix;
  if (IsDelim(token_stream->Current(), "|")) {
    namespace_prefix = make_unique<std::string>();
    token_stream->Consume();
  } else if (IsDelim(token_stream->Current(), "*") &&
             IsDelim(token_stream->Next(), "|")) {
    namespace_prefix = make_unique<std::string>("*");
    token_stream->Consume();
    token_stream->Consume();
  } else if (token_stream->Current().Type() == TokenType::IDENT &&
             IsDelim(token_stream->Next(), "|")) {
    namespace_prefix = make_unique<std::string>(
        static_cast<const IdentToken*>(&token_stream->Current())
            ->StringValue());
    token_stream->Consume();
    token_stream->Consume();
  }
  // Now parse the attribute name. This part is mandatory.
  if (token_stream->Current().Type() != TokenType::IDENT)
    return NewInvalidAttrSelectorError(start);
  const IdentToken* ident =
      static_cast<const IdentToken*>(&token_stream->Current());
  const std::string& attr_name = ident->StringValue();
  token_stream->Consume();
  if (token_stream->Current().Type() == TokenType::WHITESPACE)
    token_stream->Consume();

  // After the attribute name, we may see an operator; if we do, then
  // we must see either a string or an identifier. This covers
  // 6.3.1 Attribute presence and value selectors
  // (https://www.w3.org/TR/css3-selectors/#attribute-representation) and
  // 6.3.2 Substring matching attribute selectors
  // (https://www.w3.org/TR/css3-selectors/#attribute-substrings).

  std::string match_operator;
  if (IsDelim(token_stream->Current(), "=")) {
    match_operator = "=";
    token_stream->Consume();
  } else if (token_stream->Current().Type() == TokenType::INCLUDE_MATCH) {
    match_operator = "~=";
    token_stream->Consume();
  } else if (token_stream->Current().Type() == TokenType::DASH_MATCH) {
    match_operator = "|=";
    token_stream->Consume();
  } else if (token_stream->Current().Type() == TokenType::PREFIX_MATCH) {
    match_operator = "^=";
    token_stream->Consume();
  } else if (token_stream->Current().Type() == TokenType::SUFFIX_MATCH) {
    match_operator = "$=";
    token_stream->Consume();
  } else if (token_stream->Current().Type() == TokenType::SUBSTRING_MATCH) {
    match_operator = "*=";
    token_stream->Consume();
  }
  if (token_stream->Current().Type() == TokenType::WHITESPACE)
    token_stream->Consume();
  std::string value;
  int value_start_pos = -1;
  int value_end_pos = -1;
  if (!match_operator.empty()) {  // If we saw an operator, parse the value.
    if (token_stream->Current().Type() == TokenType::IDENT) {
      value_start_pos = token_stream->Current().pos();
      value = static_cast<const IdentToken*>(&token_stream->Current())
                  ->StringValue();
      token_stream->Consume();
      value_end_pos = token_stream->Current().pos();
    } else if (token_stream->Current().Type() == TokenType::STRING) {
      value_start_pos = token_stream->Current().pos();
      value = static_cast<const StringToken*>(&token_stream->Current())
                  ->StringValue();
      token_stream->Consume();
      value_end_pos = token_stream->Current().pos();
    } else {
      return NewInvalidAttrSelectorError(start);
    }
  }
  if (token_stream->Current().Type() == TokenType::WHITESPACE)
    token_stream->Consume();
  // The attribute selector must in any case terminate with a close square
  // token.
  if (token_stream->Current().Type() != TokenType::CLOSE_SQUARE)
    return NewInvalidAttrSelectorError(start);
  token_stream->Consume();
  auto selector = make_unique<AttrSelector>(std::move(namespace_prefix),
                                            attr_name, match_operator, value);
  start.CopyStartPositionTo(selector.get());
  selector->set_value_start_pos(value_start_pos);
  selector->set_value_end_pos(value_end_pos);
  return selector;
}

//
// PseudoSelector
//
PseudoSelector::PseudoSelector(bool is_class, const std::string& name,
                               const htmlparser::json::JsonArray& func)
    : Selector(TokenType::PSEUDO_SELECTOR),
      is_class_(is_class),
      name_(name),
      func_(func) {}

void PseudoSelector::Accept(SelectorVisitor* visitor) const {
  visitor->VisitPseudoSelector(*this);
}

htmlparser::json::JsonDict PseudoSelector::ToJson() const {
  htmlparser::json::JsonDict json = Token::ToJson();
  json.Insert("isClass", is_class_);
  json.Insert("name", name_);
  if (!func_.empty()) json.Insert("func", func_);
  return json;
}

// token_stream->Current() must be the ColonToken. Returns an error if
// the pseudo token can't be parsed (e.g., a lone ':').
// Returns either a PseudoSelector or an ErrorToken.
ErrorTokenOr<PseudoSelector> ParseAPseudoSelector(TokenStream* token_stream) {
  CHECK(TokenType::COLON == token_stream->Current().Type());
  const Token& first_colon = token_stream->Current();
  token_stream->Consume();
  bool is_class = true;
  if (token_stream->Current().Type() == TokenType::COLON) {
    // '::' starts a pseudo element, ':' starts a pseudo class.
    is_class = false;
    token_stream->Consume();
  }
  std::string name;
  vector<unique_ptr<Token>> func;
  if (token_stream->Current().Type() == TokenType::IDENT) {
    name =
        static_cast<const IdentToken*>(&token_stream->Current())->StringValue();
    token_stream->Consume();
  } else if (token_stream->Current().Type() == TokenType::FUNCTION_TOKEN) {
    name = static_cast<const FunctionToken*>(&token_stream->Current())
               ->StringValue();
    vector<unique_ptr<ErrorToken>> errors;
    func = Canonicalizer::ExtractAFunction(token_stream, &errors);
    if (!errors.empty()) return std::move(errors[0]);
    token_stream->Consume();
  } else {
    auto error = make_unique<ErrorToken>(
        ValidationError::CSS_SYNTAX_ERROR_IN_PSEUDO_SELECTOR,
        vector<std::string>{"style"});
    first_colon.CopyStartPositionTo(error.get());
    return error;
  }
  htmlparser::json::JsonArray func_json;
  for (const unique_ptr<Token>& t : func) func_json.Append(t->ToJson());
  auto selector = make_unique<PseudoSelector>(is_class, name, func_json);
  first_colon.CopyStartPositionTo(selector.get());
  return selector;
}

//
// ClassSelector
//
ClassSelector::ClassSelector(const std::string& value)
    : Selector(TokenType::CLASS_SELECTOR), end_pos_(-1), value_(value) {}

std::string ClassSelector::ToString() const { return StrCat(".", value_); }

htmlparser::json::JsonDict ClassSelector::ToJson() const {
  htmlparser::json::JsonDict json = Token::ToJson();
  json.Insert("value", value_);
  json.Insert("endPos", end_pos_);
  return json;
}

void ClassSelector::Accept(SelectorVisitor* visitor) const {
  visitor->VisitClassSelector(*this);
}

// token_stream->Current() must be the '.' delimiter token.
unique_ptr<ClassSelector> ParseAClassSelector(TokenStream* token_stream) {
  CHECK(IsDelim(token_stream->Current(), ".")) << "invalid delimiter token";
  CHECK(TokenType::IDENT == token_stream->Next().Type())
      << "invalid ident token";
  const DelimToken& dot =
      *static_cast<const DelimToken*>(&token_stream->Current());
  token_stream->Consume();
  const IdentToken& ident =
      *static_cast<const IdentToken*>(&token_stream->Current());
  token_stream->Consume();
  auto selector = make_unique<ClassSelector>(ident.StringValue());
  dot.CopyStartPositionTo(selector.get());
  selector->set_end_pos(token_stream->Current().pos());
  return selector;
}

//
// SimpleSelectorSequence
//
SimpleSelectorSequence::SimpleSelectorSequence(
    unique_ptr<TypeSelector> type_selector,
    vector<unique_ptr<Selector>> other_selectors)
    : Selector(TokenType::SIMPLE_SELECTOR_SEQUENCE),
      type_selector_(std::move(type_selector)),
      other_selectors_(std::move(other_selectors)) {}

void SimpleSelectorSequence::ForEachChild(
    std::function<void(const Selector&)> lambda) const {
  lambda(*type_selector_);
  for (const unique_ptr<Selector>& other : other_selectors_) lambda(*other);
}

htmlparser::json::JsonDict SimpleSelectorSequence::ToJson() const {
  htmlparser::json::JsonDict json = Token::ToJson();
  json.Insert("typeSelector", type_selector_->ToJson());
  AppendValue(&json, "otherSelectors", other_selectors_);
  return json;
}

void SimpleSelectorSequence::Accept(SelectorVisitor* visitor) const {
  visitor->VisitSimpleSelectorSequence(*this);
}

// token_stream->Current() must be the first token of the sequence.
// This function will return an error if no selector is found.
// Returns either a SimpleSelectorSequence or an ErrorToken.
ErrorTokenOr<SimpleSelectorSequence> ParseASimpleSelectorSequence(
    TokenStream* token_stream) {
  const Token& start = token_stream->Current();
  unique_ptr<TypeSelector> type_selector;
  if (IsDelim(token_stream->Current(), "*") ||
      IsDelim(token_stream->Current(), "|") ||
      token_stream->Current().Type() == TokenType::IDENT) {
    type_selector = ParseATypeSelector(token_stream);
  }
  vector<unique_ptr<Selector>> other_selectors;
  while (true) {
    if (token_stream->Current().Type() == TokenType::HASH) {
      other_selectors.emplace_back(ParseAnIdSelector(token_stream));
    } else if (IsDelim(token_stream->Current(), ".") &&
               token_stream->Next().Type() == TokenType::IDENT) {
      other_selectors.emplace_back(ParseAClassSelector(token_stream));
    } else if (token_stream->Current().Type() == TokenType::OPEN_SQUARE) {
      ErrorTokenOr<AttrSelector> parsed = ParseAnAttrSelector(token_stream);
      if (absl::holds_alternative<unique_ptr<ErrorToken>>(parsed))
        return std::move(absl::get<unique_ptr<ErrorToken>>(parsed));
      other_selectors.emplace_back(
          std::move(absl::get<unique_ptr<AttrSelector>>(parsed)));
    } else if (token_stream->Current().Type() == TokenType::COLON) {
      ErrorTokenOr<PseudoSelector> parsed = ParseAPseudoSelector(token_stream);
      if (absl::holds_alternative<unique_ptr<ErrorToken>>(parsed))
        return std::move(absl::get<unique_ptr<ErrorToken>>(parsed));
      other_selectors.emplace_back(
          std::move(absl::get<unique_ptr<PseudoSelector>>(parsed)));
      // NOTE: If ever adding more 'else if' clauses here, be sure to update
      // IsSimpleSelectorSequenceStart accordingly.
    } else {
      if (type_selector == nullptr) {
        if (other_selectors.empty()) {
          auto error = make_unique<ErrorToken>(
              ValidationError::CSS_SYNTAX_MISSING_SELECTOR,
              vector<std::string>{"style"});
          start.CopyStartPositionTo(error.get());
          return error;
        }
        // If no type selector is given then the universal selector is
        // implied.
        type_selector = make_unique<TypeSelector>(
            /*namespace_prefix=*/nullptr, /*element_name=*/"*");
        start.CopyStartPositionTo(type_selector.get());
        // Since it's an implied selector, it doesn't occupy any space in the
        // input.
        type_selector->set_end_pos(type_selector->pos());
      }
      auto sequence = make_unique<SimpleSelectorSequence>(
          std::move(type_selector), std::move(other_selectors));
      start.CopyStartPositionTo(sequence.get());
      return sequence;
    }
  }
}

//
// Combinator
//
Combinator::Combinator(CombinatorType::Code combinator_type,
                       unique_ptr<Selector> left,
                       unique_ptr<SimpleSelectorSequence> right)
    : Selector(TokenType::COMBINATOR),
      combinator_type_(combinator_type),
      left_(std::move(left)),
      right_(std::move(right)) {}

void Combinator::ForEachChild(
    std::function<void(const Selector&)> lambda) const {
  lambda(*left_);
  lambda(*right_);
}

htmlparser::json::JsonDict Combinator::ToJson() const {
  htmlparser::json::JsonDict json = Token::ToJson();
  json.Insert("combinatorType", CombinatorType::Code_Name(combinator_type_));
  json.Insert("left", left_->ToJson());
  json.Insert("right", right_->ToJson());
  return json;
}

void Combinator::Accept(SelectorVisitor* visitor) const {
  visitor->VisitCombinator(*this);
}

CombinatorType::Code Combinator::combinator_type() const {
  return combinator_type_;
}

CombinatorType::Code CombinatorTypeForToken(const Token& token) {
  if (token.Type() == TokenType::WHITESPACE) return CombinatorType::DESCENDANT;
  if (IsDelim(token, ">")) return CombinatorType::CHILD;
  if (IsDelim(token, "+")) return CombinatorType::ADJACENT_SIBLING;
  if (IsDelim(token, "~")) return CombinatorType::GENERAL_SIBLING;
  // CombinatorTypeForToken is only ever called if the token has one of these
  // delimiters, so reaching this point is impossible.
  CHECK(false) << absl::StrCat(
      "not a combinator token - type=", TokenType::Code_Name(token.Type()),
      " value=", token.StringValue());
}

// Whether or not the provided token could be the start of a simple
// selector sequence. See the simple_selector_sequence production in
// http://www.w3.org/TR/css3-selectors/#grammar.
bool IsSimpleSelectorSequenceStart(const Token& token) {
  // Type selector start.
  if (IsDelim(token, "*") || IsDelim(token, "|") ||
      token.Type() == TokenType::IDENT)
    return true;
  // Id selector start.
  if (token.Type() == TokenType::HASH) return true;
  // Class selector start.
  if (IsDelim(token, ".")) return true;
  // Attr selector start.
  if (token.Type() == TokenType::OPEN_SQUARE) return true;
  // A pseudo selector.
  if (token.Type() == TokenType::COLON) return true;
  return false;
}

// The selector production from
// http://www.w3.org/TR/css3-selectors/#grammar
// Returns an ErrorToken if no selector is found; otherwise returns a
// SimpleSelectorSequence or Combinator.
ErrorTokenOr<Selector> ParseASelector(TokenStream* token_stream) {
  if (!IsSimpleSelectorSequenceStart(token_stream->Current())) {
    auto error = make_unique<ErrorToken>(
        ValidationError::CSS_SYNTAX_NOT_A_SELECTOR_START,
        vector<std::string>{"style"});
    token_stream->Current().CopyStartPositionTo(error.get());
    return error;
  }
  ErrorTokenOr<SimpleSelectorSequence> parsed =
      ParseASimpleSelectorSequence(token_stream);
  if (absl::holds_alternative<unique_ptr<ErrorToken>>(parsed))
    return std::move(absl::get<unique_ptr<ErrorToken>>(parsed));
  ErrorTokenOr<Selector> left(
      std::move(absl::get<unique_ptr<SimpleSelectorSequence>>(parsed)));
  while (true) {
    // Consume whitespace in front of combinators, while being careful
    // to not eat away the infamous "whitespace operator" (sigh, haha).
    if ((token_stream->Current().Type() == TokenType::WHITESPACE) &&
        !IsSimpleSelectorSequenceStart(token_stream->Next()))
      token_stream->Consume();
    // If present, grab the combinator token which we'll use for line
    // / column info.
    if (!(((token_stream->Current().Type() == TokenType::WHITESPACE) &&
           IsSimpleSelectorSequenceStart(token_stream->Next())) ||
          IsDelim(token_stream->Current(), "+") ||
          IsDelim(token_stream->Current(), ">") ||
          IsDelim(token_stream->Current(), "~")))
      return left;
    const Token& combinator_token = token_stream->Current();
    token_stream->Consume();
    if (token_stream->Current().Type() == TokenType::WHITESPACE)
      token_stream->Consume();
    ErrorTokenOr<SimpleSelectorSequence> right =
        ParseASimpleSelectorSequence(token_stream);
    if (absl::holds_alternative<unique_ptr<ErrorToken>>(right))
      return std::move(absl::get<unique_ptr<ErrorToken>>(right));
    auto combinator = make_unique<Combinator>(
        CombinatorTypeForToken(combinator_token),
        std::move(absl::get<unique_ptr<Selector>>(left)),
        std::move(absl::get<unique_ptr<SimpleSelectorSequence>>(right)));
    combinator_token.CopyStartPositionTo(combinator.get());
    left = std::move(combinator);
  }
}

//
// SelectorsGroup
//
SelectorsGroup::SelectorsGroup(vector<unique_ptr<Selector>> elements)
    : Selector(TokenType::SELECTORS_GROUP), elements_(std::move(elements)) {}

void SelectorsGroup::ForEachChild(
    std::function<void(const Selector&)> lambda) const {
  for (const unique_ptr<Selector>& selector : elements_) lambda(*selector);
}

htmlparser::json::JsonDict SelectorsGroup::ToJson() const {
  htmlparser::json::JsonDict json = Token::ToJson();
  AppendValue(&json, "elements", elements_);
  return json;
}

void SelectorsGroup::Accept(SelectorVisitor* visitor) const {
  visitor->VisitSelectorsGroup(*this);
}

// The selectors_group production from
// http://www.w3.org/TR/css3-selectors/#grammar.
// Returns an ErrorToken if no selector is found; otherwise returns a
// SelectorsGroup, SimpleSelectorSequence, or Combinator.
ErrorTokenOr<Selector> ParseASelectorsGroup(TokenStream* token_stream) {
  if (!IsSimpleSelectorSequenceStart(token_stream->Current())) {
    auto error = make_unique<ErrorToken>(
        ValidationError::CSS_SYNTAX_NOT_A_SELECTOR_START,
        vector<std::string>{"style"});
    token_stream->Current().CopyStartPositionTo(error.get());
    return error;
  }
  const Token& start = token_stream->Current();
  ErrorTokenOr<Selector> maybe_selector = ParseASelector(token_stream);
  if (absl::holds_alternative<unique_ptr<ErrorToken>>(maybe_selector))
    return maybe_selector;
  vector<unique_ptr<Selector>> elements;
  elements.emplace_back(
      std::move(absl::get<unique_ptr<Selector>>(maybe_selector)));
  while (true) {
    if (token_stream->Current().Type() == TokenType::WHITESPACE)
      token_stream->Consume();
    if (token_stream->Current().Type() == TokenType::COMMA) {
      token_stream->Consume();
      if (token_stream->Current().Type() == TokenType::WHITESPACE)
        token_stream->Consume();
      maybe_selector = ParseASelector(token_stream);
      if (absl::holds_alternative<unique_ptr<ErrorToken>>(maybe_selector))
        return maybe_selector;
      elements.emplace_back(
          std::move(absl::get<unique_ptr<Selector>>(maybe_selector)));
      continue;
    }
    // We're about to claim success and return a selector,
    // but before we do, we check that no unparsed input remains.
    if (token_stream->Current().Type() != TokenType::EOF_TOKEN) {
      auto error = make_unique<ErrorToken>(
          ValidationError::CSS_SYNTAX_UNPARSED_INPUT_REMAINS_IN_SELECTOR,
          vector<std::string>{"style"});
      token_stream->Current().CopyStartPositionTo(error.get());
      return error;
    }
    if (elements.size() == 1) return std::move(elements.back());
    auto group = make_unique<SelectorsGroup>(std::move(elements));
    start.CopyStartPositionTo(group.get());
    return unique_ptr<Selector>(std::move(group));
  }
}

void SelectorVisitor::VisitQualifiedRule(const QualifiedRule& qualified_rule) {
  vector<unique_ptr<Token>> cloned_prelude;
  cloned_prelude.reserve(qualified_rule.prelude().size());
  for (const auto& token : qualified_rule.prelude()) {
    cloned_prelude.push_back(token->Clone());
  }
  TokenStream stream(std::move(cloned_prelude));
  stream.Consume();
  ErrorTokenOr<Selector> maybe_selector = ParseASelectorsGroup(&stream);
  if (absl::holds_alternative<unique_ptr<ErrorToken>>(maybe_selector)) {
    errors_->emplace_back(
        std::move(absl::get<unique_ptr<ErrorToken>>(maybe_selector)));
    return;
  }
  const Selector& selector = *absl::get<unique_ptr<Selector>>(maybe_selector);
  std::deque<const Selector*> to_visit = {&selector};
  while (!to_visit.empty()) {
    const Selector* node = to_visit.front();
    to_visit.pop_front();
    node->Accept(this);
    node->ForEachChild(
        [&to_visit](const Selector& child) { to_visit.push_back(&child); });
  }
}
}  // namespace htmlparser::css
