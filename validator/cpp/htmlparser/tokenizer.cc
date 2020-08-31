//
// Copyright 2019 The AMP HTML Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the license.
//

#include "tokenizer.h"

#include "atom.h"
#include "atomutil.h"
#include "defer.h"
#include "strings.h"

namespace htmlparser {

constexpr std::string_view kScriptClosingTag = "</script>";
constexpr char32_t kReplacementChar = 0xfffd;

Tokenizer::Tokenizer(std::string_view html, std::string context_tag) :
    buffer_(html), lines_cols_{{1, 0}}, current_line_col_{1, 0},
    token_line_col_{1, 0} {
  if (!context_tag.empty()) {
    Strings::ToLower(&context_tag);
    if (std::find(kAllowedFragmentContainers.begin(),
                  kAllowedFragmentContainers.end(),
                  AtomUtil::ToAtom(context_tag)) !=
        kAllowedFragmentContainers.end()) {
      raw_tag_ = context_tag;
    }
  }
}

inline char32_t Tokenizer::ReadChar() {
  if (raw_.end >= buffer_.size()) {
    eof_ = true;
    return 0;
  }

  current_char_ = Strings::DecodeUtf8Symbol(buffer_.substr(raw_.end)).value_or(
      kReplacementChar);

  current_line_col_.second++;
  raw_.end += Strings::CodePointNumBytes(current_char_);
  if (current_char_ == '\n' || (current_char_ == '\r' &&
                    raw_.end < buffer_.size() &&
                    buffer_.at(raw_.end) == '\n')) {
    lines_cols_.back() = current_line_col_;
    // Increment line number and reset column number.
    current_line_col_.first++;
    current_line_col_.second = 0;
    lines_cols_.push_back({current_line_col_.first + 1, 0});
  }

  return current_char_;
}

inline void Tokenizer::UnreadChar() {
  raw_.end = raw_.end - Strings::CodePointNumBytes(current_char_);
  if (current_line_col_.second == 0) {
    lines_cols_.pop_back();
    current_line_col_ = lines_cols_.back();
    return;
  }

  current_line_col_.second--;
}

void Tokenizer::SkipWhiteSpace() {
  while (!eof_) {
    auto c = ReadChar();
    switch (c) {
      case ' ':
      case '\n':
      case '\r':
      case '\t':
      case '\f':
        break;
      default:
        UnreadChar();
        return;
    }
  }
}

void Tokenizer::SetAllowCDATA(bool allow_cdata) {
  allow_cdata_ = allow_cdata;
}

void Tokenizer::NextIsNotRawText() {
  raw_tag_ = "";
}

void Tokenizer::ReadRawOrRCDATA() {
  if (raw_tag_ == "script") {
    ReadScript();
    text_is_raw_ = true;
    raw_tag_ = "";
    return;
  }

  while (!eof_) {
    auto c = ReadChar();
    if (eof_) break;
    if (c != '<') continue;
    c = ReadChar();
    if (eof_) break;
    if (c != '/') continue;
    if (ReadRawEndTag() || eof_) break;
  }

  data_.end = raw_.end;
  // A textarea's or title's RCDATA can contain escaped entities.
  text_is_raw_ = raw_tag_ != "textarea" && raw_tag_ != "title";
  raw_tag_ = "";
}

bool Tokenizer::ReadRawEndTag() {
  for (std::size_t i = 0; i < raw_tag_.size(); ++i) {
    auto c = ReadChar();
    if (eof_) return false;
    if (c != raw_tag_.at(i) && c != (raw_tag_.at(i) - ('a' - 'A'))) {
      UnreadChar();
      return false;
    }
  }

  auto c = ReadChar();
  if (eof_) return false;
  switch (c) {
    case ' ':
    case '\n':
    case '\t':
    case '\f':
    case '/':
    case '>':
      // The 3 is 2 for the leading "</" plus 1 for the trailing character c.
      raw_.end -= (3 /* <, /, and > */ + raw_tag_.size());
      current_line_col_.second -= (3 /* <, /, and > */ + raw_tag_.size());
      return true;
  }
  UnreadChar();
  return false;
}

enum ScriptDataState {
  DONE = 0,
  SCRIPT_DATA = 1,
  SCRIPT_DATA_LESS_THAN_SIGN = 2,
  SCRIPT_DATA_END_TAG_OPEN = 3,
  SCRIPT_DATA_ESCAPE_START = 4,
  SCRIPT_DATA_ESCAPE_START_DASH = 5,
  SCRIPT_DATA_ESCAPED = 6,
  SCRIPT_DATA_ESCAPED_DASH = 7,
  SCRIPT_DATA_ESCAPED_DASH_DASH = 8,
  SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN = 9,
  SCRIPT_DATA_ESCAPED_END_TAG_OPEN = 10,
  SCRIPT_DATA_DOUBLE_ESCAPE_START = 11,
  SCRIPT_DATA_DOUBLE_ESCAPED = 12,
  SCRIPT_DATA_DOUBLE_ESCAPED_DASH  = 13,
  SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH  = 14,
  SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN = 15,
  SCRIPT_DATA_DOUBLE_ESCAPED_END = 16
};

void Tokenizer::ReadScript() {
  defer({data_.end = raw_.end;});
  ScriptDataState state = ScriptDataState::SCRIPT_DATA;
  while (!eof_ && state != ScriptDataState::DONE) {
    switch (state) {
      case ScriptDataState::SCRIPT_DATA: {
        auto c = ReadChar();
        if (eof_) return;
        if (c == '<') {
          state = ScriptDataState::SCRIPT_DATA_LESS_THAN_SIGN;
        } else {
          state = ScriptDataState::SCRIPT_DATA;
        }
        break;
      }
      case ScriptDataState::SCRIPT_DATA_LESS_THAN_SIGN: {
        auto c = ReadChar();
        if (eof_) return;
        if (c == '/') {
          state = ScriptDataState::SCRIPT_DATA_END_TAG_OPEN;
        } else if (c == '!') {
          state = ScriptDataState::SCRIPT_DATA_ESCAPE_START;
        } else {
          UnreadChar();
          state = ScriptDataState::SCRIPT_DATA;
        }
        break;
      }
      case ScriptDataState::SCRIPT_DATA_END_TAG_OPEN: {
        if (ReadRawEndTag() || eof_) {
          return;
        }
        state = ScriptDataState::SCRIPT_DATA;
        break;
      }
      case ScriptDataState::SCRIPT_DATA_ESCAPE_START: {
        auto c = ReadChar();
        if (eof_) return;
        if (c == '-') {
          state = ScriptDataState::SCRIPT_DATA_ESCAPE_START_DASH;
        } else {
          UnreadChar();
          state = ScriptDataState::SCRIPT_DATA;
        }
        break;
      }
      case ScriptDataState::SCRIPT_DATA_ESCAPE_START_DASH: {
        auto c = ReadChar();
        if (eof_) return;
        if (c == '-') {
          state = SCRIPT_DATA_ESCAPED_DASH_DASH;
        } else {
          UnreadChar();
          state = ScriptDataState::SCRIPT_DATA;
        }
        break;
      }
      case ScriptDataState::SCRIPT_DATA_ESCAPED: {
        auto c = ReadChar();
        if (eof_) return;
        if (c == '-') {
          state = ScriptDataState::SCRIPT_DATA_ESCAPED_DASH;
        } else if (c == '<') {
          state = ScriptDataState::SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
        } else {
          state = ScriptDataState::SCRIPT_DATA_ESCAPED;
        }
        break;
      }
      case ScriptDataState::SCRIPT_DATA_ESCAPED_DASH: {
        auto c = ReadChar();
        if (eof_) return;
        if (c == '-') {
          state = ScriptDataState::SCRIPT_DATA_ESCAPED_DASH_DASH;
        } else if (c == '<') {
          state = ScriptDataState::SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
        } else {
          state = ScriptDataState::SCRIPT_DATA_ESCAPED;
        }
        break;
      }
      case ScriptDataState::SCRIPT_DATA_ESCAPED_DASH_DASH: {
        auto c = ReadChar();
        if (eof_) return;
        if (c == '-') {
          state = ScriptDataState::SCRIPT_DATA_ESCAPED_DASH_DASH;
        } else if (c == '<') {
          state = ScriptDataState::SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
        } else if (c == '>') {
          state = ScriptDataState::SCRIPT_DATA;
        } else {
          state = ScriptDataState::SCRIPT_DATA_ESCAPED;
        }
        break;
      }
      case ScriptDataState::SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN: {
        auto c = ReadChar();
        if (eof_) return;
        if (c == '/') {
          state = ScriptDataState::SCRIPT_DATA_ESCAPED_END_TAG_OPEN;
        } else if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z')) {
          state = ScriptDataState::SCRIPT_DATA_DOUBLE_ESCAPE_START;
        } else {
          UnreadChar();
          state = ScriptDataState::SCRIPT_DATA;
        }
        break;
      }
      case ScriptDataState::SCRIPT_DATA_ESCAPED_END_TAG_OPEN: {
        if (ReadRawEndTag()) {
          state = ScriptDataState::DONE;
        } else {
          state = ScriptDataState::SCRIPT_DATA_ESCAPED;
        }
        break;
      }
      case ScriptDataState::SCRIPT_DATA_DOUBLE_ESCAPE_START: {
        UnreadChar();
        static std::string script_tag_l = "script";
        static std::string script_tag_u = "SCRIPT";
        for (int8_t i = 0; i < 6 /*script*/; ++i) {
          auto c = ReadChar();
          if (eof_) return;
          if (c != script_tag_l[i] && c != script_tag_u[i]) {
            UnreadChar();
            state = ScriptDataState::SCRIPT_DATA_ESCAPED;
          }
        }
        auto c = ReadChar();
        if (eof_) return;
        if (c == ' ' || c == '\n' || c == '\r' || c == '\t'  || c == '\f'
            || c == '/' || c == '>') {
          state = ScriptDataState::SCRIPT_DATA_DOUBLE_ESCAPED;
        } else {
          UnreadChar();
          state = ScriptDataState::SCRIPT_DATA_ESCAPED;
        }
        break;
      }
      case ScriptDataState::SCRIPT_DATA_DOUBLE_ESCAPED: {
        auto c = ReadChar();
        if (eof_) return;
        if (c == '-') {
          state = ScriptDataState::SCRIPT_DATA_DOUBLE_ESCAPED_DASH;
        } else if (c == '<') {
          state = ScriptDataState::SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN;
        } else {
          state = ScriptDataState::SCRIPT_DATA_DOUBLE_ESCAPED;
        }
        break;
      }
      case ScriptDataState::SCRIPT_DATA_DOUBLE_ESCAPED_DASH: {
        auto c = ReadChar();
        if (eof_) return;
        if (c == '-') {
          state = ScriptDataState::SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH;
        } else if (c == '<') {
          state = ScriptDataState::SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN;
        } else if (c == '>') {
          state = ScriptDataState::SCRIPT_DATA;
        } else {
          state = SCRIPT_DATA_DOUBLE_ESCAPED;
        }
        break;
      }
      case ScriptDataState::SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH: {
        auto c = ReadChar();
        if (eof_) return;
        if (c == '-') {
          state = ScriptDataState::SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH;
        } else if (c == '<') {
          state = ScriptDataState::SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN;
        } else if (c == '>') {
          state = ScriptDataState::SCRIPT_DATA;
        } else {
          state = ScriptDataState::SCRIPT_DATA_DOUBLE_ESCAPED;
        }
        break;
      }
      case ScriptDataState::SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN: {
        auto c = ReadChar();
        if (eof_) return;
        if (c == '/') {
          state = ScriptDataState::SCRIPT_DATA_DOUBLE_ESCAPED_END;
        } else {
          UnreadChar();
          state = ScriptDataState::SCRIPT_DATA_DOUBLE_ESCAPED;
        }
        break;
      }
      case ScriptDataState::SCRIPT_DATA_DOUBLE_ESCAPED_END: {
        if (ReadRawEndTag()) {
          raw_.end += kScriptClosingTag.size();
          state = ScriptDataState::SCRIPT_DATA_ESCAPED;
        } else {
          if (eof_) return;
          state  = ScriptDataState::SCRIPT_DATA_DOUBLE_ESCAPED;
        }
        break;
      }
      default:
        break;
    }
  }
}

void Tokenizer::ReadComment() {
  data_.start = raw_.end;
  defer({
    if (data_.end < data_.start) {
      // It's a comment with no data, like <!-->
      data_.end = data_.start;
    }
  });
  int dash_count = 2;
  while (!eof_) {
    auto c = ReadChar();
    if (eof_) {
      // Ignore up to two dashes at EOF.
      if (dash_count > 2) {
        dash_count = 2;
      }
      data_.end = raw_.end - dash_count;
      return;
    }
    if (c == '-') {
      dash_count++;
      continue;
    } else if (c == '>') {
      if (dash_count >= 2) {
        data_.end = raw_.end - 3 /* --> */;
        return;
      }
    } else if (c == '!') {
      if (dash_count >= 2) {
        auto c = ReadChar();
        if (eof_) {
          data_.end = raw_.end;
          return;
        }
        if (c == '>') {
          data_.end = raw_.end - 4 /* --!> */;
          return;
        }
      }
    }
    dash_count = 0;
  }
}

void Tokenizer::ReadUntilCloseAngle() {
  data_.start = raw_.end;
  while (!eof_) {
    auto c = ReadChar();
    if (eof_) {
      data_.end = raw_.end;
      return;
    }
    if (c == '>') {
      data_.end = raw_.end - 1 /* ">" */;
      return;
    }
  }
}

TokenType Tokenizer::ReadMarkupDeclaration() {
  data_.start = raw_.end;
  char32_t c[2];
  for (int i = 0; i < 2; ++i) {
    c[i] = ReadChar();
    if (eof_) {
      data_.end = raw_.end;
      return TokenType::COMMENT_TOKEN;
    }
  }

  if (c[0] == '-' && c[1] == '-') {
    ReadComment();
    return TokenType::COMMENT_TOKEN;
  }

  raw_.end = raw_.end - 2;
  if (ReadDoctype()) {
    return TokenType::DOCTYPE_TOKEN;
  }

  if (allow_cdata_ && ReadCDATA()) {
    convert_null_ = true;
    return TokenType::TEXT_TOKEN;
  }

  // It's a bogus comment.
  ReadUntilCloseAngle();
  return TokenType::COMMENT_TOKEN;
}

bool Tokenizer::ReadDoctype() {
  token_line_col_ = {current_line_col_.first,
                     current_line_col_.second - 2 /* <! */};

  static const std::string kDoctype = "DOCTYPE";
  for (std::size_t i = 0; i < kDoctype.size(); ++i) {
    auto c = ReadChar();
    if (eof_) {
      data_.end = raw_.end;
      return false;
    }
    if (c != kDoctype.at(i) && c != kDoctype.at(i)+('a'-'A')) {
      // Back up to read the fragment of "DOCTYPE" again.
      raw_.end = data_.start;
      return false;
    }
  }

  SkipWhiteSpace();
  if (eof_) {
    data_.start = raw_.end;
    data_.end = raw_.end;
    return true;
  }

  ReadUntilCloseAngle();
  return true;
}

bool Tokenizer::ReadCDATA() {
  static const std::string kCData = "[CDATA[";
  for (std::size_t i = 0; i < kCData.size(); ++i) {
    auto c = ReadChar();
    if (eof_) {
      data_.end = raw_.end;
      return false;
    }
    if (c != kCData[i]) {
      // Back up to read the fragment of "[CDATA[" again.
      data_.end = raw_.start;
      return false;
    }
  }
  data_.start = raw_.end;
  int brackets = 0;
  while (!eof_) {
    auto c = ReadChar();
    if (eof_) {
      data_.end = raw_.end;
      return true;
    }
    switch (c) {
      case ']':
        brackets++;
        break;
      case '>':
        if (brackets >= 2) {
          data_.end = raw_.end - 3 /* "]]>".size() */;
          return true;
        }
        brackets = 0;
        break;
      default:
        brackets = 0;
    }
  }
  return false;
}

template<typename... Args>
bool Tokenizer::StartTagIn(Args... ss) {
  std::vector<std::string> argsList{ss...};
  for (const auto& s : argsList) {
    if (data_.end - data_.start != s.size()) continue;
    bool matched = true;
    for (std::size_t i = 0; i < s.size(); ++i) {
      char c = buffer_.at(data_.start + i);
      if ('A' <= c && c <= 'Z') {
        c += 'a' - 'A';
      }
      if (c != s[i]) {
        matched = false;
        break;
      }
    }
    if (matched) {
      return true;
    }
  }
  return false;
}

TokenType Tokenizer::ReadStartTag(bool template_mode) {
  token_line_col_ = {current_line_col_.first,
                     current_line_col_.second - 1 /* < */};
  ReadTag(true, template_mode);

  if (eof_) {
    return TokenType::ERROR_TOKEN;
  }

  // Several tags flag the tokenizer's next token as raw.
  bool raw = false;
  char c = buffer_.at(data_.start);

  // Lowercase.
  if ('A' <= c && c <= 'Z') {
    c += 'a' - 'A';
  }

  switch (c) {
    case 'i':
      raw = StartTagIn("iframe");
      break;
    case 'n':
      raw = StartTagIn("noembed", "noframes", "noscript");
      break;
    case 'p':
      raw = StartTagIn("plaintext");
      break;
    case 's':
      raw = StartTagIn("script", "style");
      break;
    case 't':
      raw = StartTagIn("textarea", "title");
      break;
    case 'x':
      raw = StartTagIn("xmp");
  }

  if (raw) {
    int size = data_.end - data_.start;
    raw_tag_ = std::string(buffer_.substr(data_.start, size));
    Strings::ToLower(&raw_tag_);
  }

  // Look for a self-closing token like "<br/>".
  if (!eof_ && buffer_[raw_.end - 2] == '/') {
    return TokenType::SELF_CLOSING_TAG_TOKEN;
  }

  return TokenType::START_TAG_TOKEN;
}

void Tokenizer::ReadTag(bool save_attr, bool template_mode) {
  attributes_.clear();
  n_attributes_returned_ = 0;

  // Read the tag name and attribute key/value pairs.
  ReadTagName();
  SkipWhiteSpace();

  while (!eof_) {
    auto c = ReadChar();
    if (eof_ || c == '>') {
      break;
    }

    // Undo previous > read.
    UnreadChar();

    ReadTagAttributeKey(template_mode);
    ReadTagAttributeValue();
    // Save pending_attribute if save_attr and that attribute has a non-empty
    // key.
    if (save_attr &&
        std::get<0>(pending_attribute_).start !=
        std::get<0>(pending_attribute_).end) {
      attributes_.push_back(pending_attribute_);
    }
    SkipWhiteSpace();
  }
}

void Tokenizer::ReadTagName() {
  data_.start = raw_.end - Strings::CodePointNumBytes(current_char_);
  while (!eof_) {
    auto c = ReadChar();
    if (eof_) {
      data_.end = raw_.end;
      return;
    }
    switch (c) {
      case ' ':
      case '\n':
      case '\r':
      case '\t':
      case '\f':
        data_.end = raw_.end - 1;
        return;
      case '/':
      case '>':
        UnreadChar();
        data_.end = raw_.end;
        return;
    }
  }
}

// Sets pending_attribute_[0] to the "k" in "<div k=v>".
// Precondition: eof_ != true;
void Tokenizer::ReadTagAttributeKey(bool template_mode) {
  std::get<0>(pending_attribute_).start = raw_.end;
  std::get<LineCol>(pending_attribute_) =
      {current_line_col_.first, current_line_col_.second + 1};

  // All mustache_ prefixed variables applies to parsing logic for AMP mustache
  // templates. See: https://amp.dev/documentation/components/amp-mustache/
  bool mustache_inside_section_block = false;
  std::string mustache_section_name = "";

  while (!eof_) {
    auto c = ReadChar();
    if (eof_) {
      std::get<0>(pending_attribute_).start = raw_.end;
      return;
    }

    // Template attributes processing.
    // Looks for following special syntax.
    // {{#section}}...{{/section}}
    // {{^section}}...{{/section}}
    // {{variable}}
    if (template_mode) {
      UnreadChar();
      UnreadChar();
      UnreadChar();
      auto c1 = ReadChar();
      auto c2 = ReadChar();
      c = ReadChar();
      if (mustache_inside_section_block && c1 == '{' && c2 == '{' && c == '/') {
        // Look for closing section name. If not resort to default behavior.
        // Reason for this logic is to differentiate between:
        // <p {{#mycondition}}class=foo{{/mycondition}} foo=bar> vs.
        // <img {{#mycondition}}class=foo />
        int raw_end = raw_.end;
        std::string_view close_section =
            buffer_.substr(raw_.end, mustache_section_name.size());
        bool section_name_match = close_section == mustache_section_name;
        if (section_name_match) {
          raw_.end += mustache_section_name.size();
          auto e1 = ReadChar();
          auto e2 = ReadChar();
          if (e1 == '}' && e2 == '}') {
            mustache_inside_section_block = false;
            continue;
          } else {
            raw_.end = raw_end;
          }
        }
      }

      if (c1 == '{' && c2 == '{' && (c == '#' || c == '^')) {
        auto n = buffer_.find("}}", raw_.end);
        if (n != std::string_view::npos) {
          mustache_section_name = buffer_.substr(raw_.end, n - raw_.end);
          mustache_inside_section_block = true;
          continue;
        }
      }
    }

    switch (c) {
      case ' ':
      case '\n':
      case '\r':
      case '\t':
      case '\f':
      case '/': {
        std::get<0>(pending_attribute_).end = raw_.end - 1;
        return;
      }
      case '=':
      case '>': {
        UnreadChar();
        std::get<0>(pending_attribute_).end = raw_.end;
        return;
      }
    }
  }
}

// Sets pending_attribute_.second to the "v" in "<div k=v>".
void Tokenizer::ReadTagAttributeValue() {
  std::get<1>(pending_attribute_).start = raw_.end;
  std::get<1>(pending_attribute_).end = raw_.end;
  SkipWhiteSpace();
  if (eof_) {
    return;
  }
  auto c = ReadChar();
  if (eof_) {
    return;
  }

  if (c != '=') {
    UnreadChar();
    return;
  }

  SkipWhiteSpace();
  if (eof_) {
    return;
  }

  auto quote = ReadChar();
  if (eof_) {
    return;
  }

  switch (quote) {
    case '>':
      UnreadChar();
      return;
    case '\'':
    case '"':
      std::get<1>(pending_attribute_).start = raw_.end;
      while (!eof_) {
        c = ReadChar();
        if (eof_) {
          std::get<1>(pending_attribute_).end = raw_.end;
          return;
        }
        if (c == quote) {
          std::get<1>(pending_attribute_).end = raw_.end - 1;
          return;
        }
      }
      break;
    default: {
      std::get<1>(pending_attribute_).start = raw_.end - 1;
      while (!eof_) {
        c = ReadChar();
        if (eof_) {
          std::get<1>(pending_attribute_).end = raw_.end;
          return;
        }
        switch (c) {
          case ' ':
          case '\n':
          case '\r':
          case '\t':
          case '\f':
            std::get<1>(pending_attribute_).end = raw_.end - 1;
            return;
          case '>':
            UnreadChar();
            std::get<1>(pending_attribute_).end = raw_.end;
            return;
        }
      }
    }
  }
}

TokenType Tokenizer::Next(bool template_mode) {
  raw_.start = raw_.end;
  data_.start = raw_.end;
  data_.end = raw_.end;
  is_token_manufactured_ = false;

  if (eof_) {
    err_ = true;
    token_type_ = TokenType::ERROR_TOKEN;
    return token_type_;
  }

  if (raw_tag_ != "") {
    if (raw_tag_ == "plaintext") {
      // Read everything up to EOF.
      while (!eof_) {
        ReadChar();
      }
      data_.end = raw_.end;
      text_is_raw_ = true;
    } else {
      ReadRawOrRCDATA();
    }

    if (data_.end > data_.start) {
      token_type_ = TokenType::TEXT_TOKEN;
      convert_null_ = true;
      return token_type_;
    }
  }

  text_is_raw_ = false;
  convert_null_ = false;

  while (!eof_) {
    auto c = ReadChar();

    if (eof_) {
      break;
    }

    if (c != '<') {
      continue;
    }

    // We have a non-text token, but we might have accumulated some text
    // before that. If so, we return the text first, and return the non text
    // token on the subsequent call to Next.
    //
    // <space><space><mytag>, returns two spaces before processing the mytag
    // token in the next call.
    if (data_.start < raw_.end - Strings::CodePointNumBytes(c)) {
      raw_.end -= Strings::CodePointNumBytes(c);
      current_line_col_.second--;
      data_.end = raw_.end;
      token_type_ = TokenType::TEXT_TOKEN;
      return token_type_;
    }

    c = ReadChar();
    if (eof_) break;

    // Check if the '<' we have just read is part of a tag, comment or
    // doctype. If not, it's part of the accumulated text token.
    TokenType token_type;
    if (Strings::IsCharAlphabet(c)) {
      token_type = TokenType::START_TAG_TOKEN;
    } else if (c == '/') {
      token_type = TokenType::END_TAG_TOKEN;
    } else if (c == '!' || c == '?') {
      token_type = TokenType::COMMENT_TOKEN;
    } else {
      UnreadChar();
      continue;
    }

    switch (token_type) {
      case TokenType::START_TAG_TOKEN:
        token_type_ = ReadStartTag(template_mode);
        return token_type_;
      case TokenType::END_TAG_TOKEN:
        c = ReadChar();
        if (eof_) break;
        if (c == '>') {
          // "</> does not generate a token at all. Generate an empty comment
          // to allow passthrough clients to pick up the data using raw_.
          // Reset the tokenizer state and start again.
          token_type_ = TokenType::COMMENT_TOKEN;
          return token_type_;
        }
        if (Strings::IsCharAlphabet(c)) {
          ReadTag(false);
          if (eof_) {
            token_type_ = TokenType::ERROR_TOKEN;
          } else {
            token_type_ = TokenType::END_TAG_TOKEN;
          }
          return token_type_;
        }
        ReadUntilCloseAngle();
        token_type_ = TokenType::COMMENT_TOKEN;
        return token_type_;
      case TokenType::COMMENT_TOKEN: {
        if (c == '!') {
          token_type_ = ReadMarkupDeclaration();
          return token_type_;
        }
        is_token_manufactured_ = true;
        // <? is part of the comment text.
        UnreadChar();
        UnreadChar();
        ReadUntilCloseAngle();
        token_type_ = TokenType::COMMENT_TOKEN;
        return token_type_;
      }
      default:
        break;
    }
  }

  if (raw_.start < raw_.end) {
    data_.end = raw_.end;
    token_type_ = TokenType::TEXT_TOKEN;
    return token_type_;
  }

  token_type_ = TokenType::ERROR_TOKEN;
  return token_type_;
}

std::string_view Tokenizer::Raw() {
  int size = raw_.end - raw_.start;
  return buffer_.substr(raw_.start, size);
}

std::string Tokenizer::Text() {
  switch (token_type_) {
    case TokenType::TEXT_TOKEN:
    case TokenType::COMMENT_TOKEN:
    case TokenType::DOCTYPE_TOKEN: {
      int size = data_.end - data_.start;
      std::string s(buffer_.substr(data_.start, size));
      data_.start = raw_.end;
      data_.end = raw_.end;
      Strings::ConvertNewLines(&s);
      if (convert_null_ || token_type_ == TokenType::COMMENT_TOKEN) {
        // Replace \x00 with \ufffd.
        Strings::ReplaceAny(&s,
                            Strings::kNullChar,
                            Strings::kNullReplacementChar);
      }
      if (!text_is_raw_) Strings::UnescapeString(&s, false);
      return s;
    }
    default:
      break;
  }

  return "";
}

std::optional<std::tuple<std::string, bool>> Tokenizer::TagName() {
  if (data_.start < data_.end) {
    switch (token_type_) {
      case TokenType::START_TAG_TOKEN:
      case TokenType::END_TAG_TOKEN:
      case TokenType::SELF_CLOSING_TAG_TOKEN: {
        int size = data_.end - data_.start;
        std::string s(buffer_.substr(data_.start, size));
        data_.start = raw_.end;
        data_.end = raw_.end;
        Strings::ToLower(&s);
        return std::make_tuple<std::string, bool>(std::move(s),
            n_attributes_returned_ < attributes_.size());
      }
      default:
        break;
    }
  }

  return std::nullopt;
}

std::optional<std::tuple<Attribute, bool>> Tokenizer::TagAttr() {
  if (n_attributes_returned_ < attributes_.size()) {
    switch (token_type_) {
      case TokenType::START_TAG_TOKEN:
      case TokenType::SELF_CLOSING_TAG_TOKEN: {
        auto attr = attributes_[n_attributes_returned_];
        n_attributes_returned_++;
        int size = std::get<0>(attr).end - std::get<0>(attr).start;
        std::string key(buffer_.substr(std::get<0>(attr).start, size));
        int value_size = std::get<1>(attr).end - std::get<1>(attr).start;
        std::string val(buffer_.substr(std::get<1>(attr).start, value_size));
        Strings::ToLower(&key);
        Strings::ConvertNewLines(&val);
        Strings::UnescapeString(&val, true);
        return std::make_tuple<Attribute, bool>(
            {.name_space = "",
             .key = std::move(key),
             .value = std::move(val),
             .position_in_html_src = std::get<LineCol>(attr)},
            n_attributes_returned_ < attributes_.size());
      }
      default:
        break;
    }
  }

  return std::nullopt;
}

Token Tokenizer::token() {
  Token t;
  t.token_type = token_type_;
  switch (token_type_) {
    case TokenType::TEXT_TOKEN: {
      t.data = Text();
      int line_number = current_line_col_.first;
      int column_number = current_line_col_.second - t.data.size();
      // Shift to previous line, where this text belongs.
      if (column_number < 0) {
        if (lines_cols_.size() > 1) {
          auto previous_token_linecol = lines_cols_[lines_cols_.size() - 2];
          line_number = previous_token_linecol.first;
          column_number =
              previous_token_linecol.second - abs(column_number) + 1;
        } else {
          column_number = 0;
        }
      }
      token_line_col_ = {line_number, column_number};
      break;
    }
    case TokenType::COMMENT_TOKEN:
    case TokenType::DOCTYPE_TOKEN:
      t.data = Text();
      t.is_manufactured = is_token_manufactured_;
      token_line_col_ = {current_line_col_.first,
                         current_line_col_.second - t.data.size()};
      break;
    case TokenType::START_TAG_TOKEN:
    case TokenType::SELF_CLOSING_TAG_TOKEN:
    case TokenType::END_TAG_TOKEN: {
      auto tag_name_value = TagName();
      if (tag_name_value.has_value()) {
        std::string tag_name = std::get<0>(tag_name_value.value());
        bool has_attributes = std::get<1>(tag_name_value.value());
        Atom atom = AtomUtil::ToAtom(tag_name);
        if (atom != Atom::UNKNOWN) {
          t.atom = atom;
        } else {
          t.atom = Atom::UNKNOWN;
          t.data = tag_name;
        }
        if (has_attributes) {
          while (true) {
            auto a = TagAttr();
            if (!a.has_value()) break;
            auto attr = std::get<Attribute>(a.value());
            bool more_attributes = std::get<bool>(a.value());
            t.attributes.push_back(attr);
            if (!more_attributes) break;
          }
        }
      }
      break;
    }
    case TokenType::ERROR_TOKEN:
      // Ignore.
      break;
  }

  t.position_in_html_src = token_line_col_;
  return t;
}

}  // namespace htmlparser
