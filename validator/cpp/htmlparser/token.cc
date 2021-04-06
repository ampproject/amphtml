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

#include "token.h"

#include "strings.h"

namespace htmlparser {

std::string Token::TagString() const {
  switch (token_type) {
    case TokenType::ERROR_TOKEN:
      return "Error";
    case TokenType::TEXT_TOKEN:
      return "Text";
    case TokenType::START_TAG_TOKEN:
      return "StartTag";
    case TokenType::END_TAG_TOKEN:
      return "EndTag";
    case TokenType::SELF_CLOSING_TAG_TOKEN:
      return "SelfClosingTag";
    case TokenType::COMMENT_TOKEN:
      return "Comment";
    case TokenType::DOCTYPE_TOKEN:
      return "Doctype";
  }
  return "Invalid token with no token type.";
}

std::string Token::String() const {
  switch (token_type) {
    case TokenType::ERROR_TOKEN:
      return "";
    case TokenType::TEXT_TOKEN:
      return Strings::EscapeString(data);
    case TokenType::START_TAG_TOKEN:
      return "<" + data + ">";
    case TokenType::END_TAG_TOKEN:
      return "</" + data + ">";
    case TokenType::SELF_CLOSING_TAG_TOKEN:
      return "<" + data + "/>";
    case TokenType::COMMENT_TOKEN:
      return "<!--" + data + ">";
    case TokenType::DOCTYPE_TOKEN:
      return "<!DOCTYPE " + data + ">";
  }

  return "Invalid(token)";
}

bool Attribute::operator==(const Attribute& other) const {
  return (name_space == other.name_space &&
          key == other.key &&
          value == other.value);
}

bool Attribute::operator!=(const Attribute& other) const {
  return !(operator==(other));
}

std::string Attribute::String() const {
  return name_space + ":" + key + ": " + value;
}

std::string Attribute::KeyPart() const {
  if (name_space.empty()) return key;

  return name_space + ":" + key;
}
}  // namespace htmlparser
