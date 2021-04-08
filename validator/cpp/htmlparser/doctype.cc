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

#include "doctype.h"

#include <sstream>

#include "strings.h"

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

// Skips:
// lang=en
// lang="en"
// lang='en'
// lang
// lang = "en"
// lang = en
// lang = 'en'
void SkipLangAttribute(std::string_view* s) {
  // Stop if there is not minimum 4 characters ("lang").
  if (s->size() < 4) return;

  // Extract and check these 4 chars.
  std::string_view maybelang = s->substr(0, 4);
  if (!Strings::EqualFold(maybelang, "lang")) return;

  // lang attribute seen.
  s->remove_prefix(4);
  SkipLeadingWhitespace(s);

  // Empty lang attribute. (with no value).
  // <!doctype html lang> or <!doctype lang html>
  if (s->empty() || s->front() != '=') {
    return;
  }

  s->remove_prefix(1);  // Move past '='.
  SkipLeadingWhitespace(s);
  if (s->empty()) return;

  // Skip attribute value if it is in quotes.
  char quote = s->front();
  if (quote == '"' || quote == '\'') {
    s->remove_prefix(1);
    std::size_t i = 0;
    // Read until closing quote.
    while (!s->empty()) {
      i = s->find(quote, i);
      if (i != std::string_view::npos) {
        if (i > 0 && s->at(i - 1) == '\\') {
          continue;
        }
        break;
      }
    }

    // Nothing after quote start.
    // <!doctype lang='> or <!doctype lang=">
    if (s->empty()) return;

    std::string value(s->substr(0, i));
    Attribute lang_attr{"", "lang", value};
    s->remove_prefix(i + 1);
    return;
  }

  // Skip lang value until next whitespace.
  std::string lang_val = ReadUntil(s, Strings::kWhitespace);
}

bool ParseDoctype(std::string_view s, Node* doctype_node) {
  bool quirks = false;

  SkipLeadingWhitespace(&s);
  StripSelfClosingSlash(&s);

#if ALLOW_LANG_ATTRIBUTE_IN_DOCTYPE
  SkipLangAttribute(&s);
  SkipLeadingWhitespace(&s);
#endif

  std::size_t space = Strings::IndexAny(s, Strings::kWhitespace);
  if (space == std::string::npos) {
    space = s.size();
  }
  std::string data(s.data(), space);
  s.remove_prefix(space);
  SkipLeadingWhitespace(&s);

#if ALLOW_LANG_ATTRIBUTE_IN_DOCTYPE
  SkipLangAttribute(&s);
#endif

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
