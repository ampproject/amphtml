#include "cpp/htmlparser/token.h"

#include "cpp/htmlparser/strings.h"

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
