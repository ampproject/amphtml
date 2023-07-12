#include "cpp/htmlparser/doctype.h"

#include <sstream>

#include "cpp/htmlparser/strings.h"

namespace htmlparser {

// Skips leading whitespace and moves the string view cursor past the leading
// whitespace chars.
void SkipLeadingWhitespace(std::string_view* s) {
  if (s->empty()) return;
  std::size_t first_char = s->find_first_not_of(Strings::kWhitespace);
  s->remove_prefix(first_char != std::string::npos ? first_char : s->size());
}

// Returns prefix string [0, [any(stop_chars)])
// s cursor is moved to the first stop_char seen.
std::string ReadUntil(std::string_view* s, const std::string& stop_chars) {
  if (s->empty()) return "";

  std::stringstream ss;
  while (!s->empty()) {
    char c = s->front();
    s->remove_prefix(1);
    if (stop_chars.find(c) != stop_chars.npos) {
      return ss.str();
    }
    ss << c;
  }
  return ss.str();
}

void StripSelfClosingSlash(std::string_view* s) {
  while (!s->empty() && s->back() == '/') {
    s->remove_suffix(1);
  }
}

bool ParseDoctype(std::string_view s, Node* doctype_node) {
  bool quirks = false;

  SkipLeadingWhitespace(&s);
  StripSelfClosingSlash(&s);

  std::size_t space = Strings::IndexAny(s, Strings::kWhitespace);
  if (space == std::string::npos) {
    space = s.size();
  }
  std::string data(s.data(), space);
  s.remove_prefix(space);
  SkipLeadingWhitespace(&s);

  if (!(Strings::EqualFold(data, "html") && s.empty())) {
    quirks = true;
  }

  Strings::ToLower(&data);
  doctype_node->SetData(data);

  if (s.size() < 6) {
    // It can't start with "PUBLIC" or "SYSTEM".
    // Ignore the rest of the string.
    return quirks;
  }

  std::string key(s.data(), 6);
  std::string val;
  Strings::ToLower(&key);
  s.remove_prefix(6);
  while ((key == "public" || key == "system")) {
    SkipLeadingWhitespace(&s);
    if (s.empty()) break;
    auto quote = s.at(0);
    if (quote != '"' && quote != '\'') break;
    s.remove_prefix(1);
    std::string val = ReadUntil(&s, {quote});
    doctype_node->AddAttribute(
        {"" /* namespace */, key /* key */, val /* value */});

    if (key == "public") {
      key = "system";
    } else {
      key = "";
    }
  }

  if (!key.empty() || !s.empty()) {
    quirks = true;
  } else {
    std::string ns = doctype_node->Attributes()[0].name_space;
    std::string k = doctype_node->Attributes()[0].key;
    std::string v = doctype_node->Attributes()[0].value;
    if (k == "public") {
      if (Strings::EqualFold(v, "-//w3o//dtd w3 html strict 3.0//en//") ||
          Strings::EqualFold(v, "-/w3d/dtd html 4.0 transitional/en") ||
          Strings::EqualFold(v, "html")) {
        quirks = true;
      } else {
        for (const auto& qk : kQuirkyIDs) {
          if (Strings::StartsWith(v, qk)) {
            quirks = true;
            break;
          }
        }
      }

      // The following two public IDs only cause quirks mode if there is no
      // system ID.
      if (doctype_node->Attributes().size() == 1 &&
          (Strings::StartsWith(v, "-//w3c//dtd html 4.01 frameset//") ||
           Strings::StartsWith(v, "-//w3c//dtd html 4.01 transitional//"))) {
        quirks = true;
      }
    }
    k = doctype_node->Attributes().back().key;
    if (k == "system") {
      if (Strings::EqualFold(
          v, "http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd")) {
        quirks = true;
      }
    }
  }

  return quirks;
}

}  // namespace htmlparser
