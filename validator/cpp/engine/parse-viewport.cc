#include "cpp/engine/parse-viewport.h"

#include <map>

#include "absl/strings/ascii.h"
#include "cpp/engine/utf8-util.h"
#include "cpp/htmlparser/strings.h"

using std::map;

namespace amp::validator::parse_viewport {
namespace {
bool IsWhitespace(char32_t code) {
  return code == '\t' || code == '\n' || code == '\r' || code == ' ';
}

bool IsSeparator(char32_t code) { return code == ',' || code == ';'; }

int ParseProperty(const std::vector<char32_t>& content, int pos,
                  map<std::string, std::string>* value_by_name) {
  int start = pos;
  while (pos < content.size() &&
         !(IsWhitespace(content[pos]) || IsSeparator(content[pos]) ||
           '=' == content[pos]))
    ++pos;
  if (pos >= content.size() || IsSeparator(content[pos])) return pos;
  std::vector<char32_t> property_name(content.begin() + start,
                                      content.begin() + pos);
  while (pos < content.size() &&
         !(IsSeparator(content[pos]) || '=' == content[pos]))
    ++pos;
  if (pos >= content.size() || IsSeparator(content[pos])) return pos;
  while (pos < content.size() &&
         (IsWhitespace(content[pos]) || '=' == content[pos]))
    ++pos;
  if (pos >= content.size() || IsSeparator(content[pos])) return pos;
  start = pos;
  while (pos < content.size() &&
         !(IsWhitespace(content[pos]) || IsSeparator(content[pos]) ||
           '=' == content[pos]))
    ++pos;
  std::vector<char32_t> property_value(content.begin() + start,
                                       content.begin() + pos);
  (*value_by_name)[absl::AsciiStrToLower(
      htmlparser::Strings::CodepointsToUtf8String(property_name))] =
      htmlparser::Strings::CodepointsToUtf8String(property_value);
  return pos;
}

void ParseContent(const std::vector<char32_t>& content,
                  map<std::string, std::string>* value_by_name) {
  for (int pos = 0; pos < content.size(); ++pos) {
    while (pos < content.size() &&
           (IsWhitespace(content[pos]) || IsSeparator(content[pos]) ||
            '=' == content[pos]))
      ++pos;
    if (pos < content.size()) {
      pos = ParseProperty(content, pos, value_by_name);
    }
  }
}
}  // namespace

map<std::string, std::string> ParseContent(const std::string& content) {
  map<std::string, std::string> value_by_name;
  ParseContent(htmlparser::Strings::Utf8ToCodepoints(content), &value_by_name);
  return value_by_name;
}
}  // namespace amp::validator::parse_viewport
