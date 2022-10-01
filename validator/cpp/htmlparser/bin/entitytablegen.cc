// To regenerate entity.h file, run:
// bazel build htmlparser/bin:entitytablegen
// bazel-bin/htmlparser/bin/entitytablegen

#include <charconv>
#include <fstream>
#include <iostream>
#include <sstream>
#include <utility>
#include <vector>

#include "cpp/htmlparser/defer.h"
#include "cpp/htmlparser/fileutil.h"
#include "cpp/htmlparser/strings.h"

const char kFileHeader[] =
    R"HEADER(// AUTO GENERATED; DO NOT EDIT.
// To regenerate this file, see comments in bin/entitytablegen.cc

#ifndef CPP_HTMLPARSER_ENTITY_H_
#define CPP_HTMLPARSER_ENTITY_H_

#include <algorithm>
#include <array>
#include <string>
#include <string_view>

#include "cpp/htmlparser/comparators.h"

namespace htmlparser {

// Returns encoded bytes of html entity name. Returns empty if entity not found.
inline std::string_view EntityLookup(std::string_view);

// Map of Entity names to their utf-8 encoded bytes.
// https://html.spec.whatwg.org/entities.json or,
// https://html.spec.whatwg.org/multipage/syntax.html#named-character-references
)HEADER";

const char kFileFooter[] = R"FOOTER(
inline std::string_view EntityLookup(std::string_view entity_name) {
  if (auto iter = std::lower_bound(
      std::begin(kEntityMap),
      std::end(kEntityMap),
      entity_name,
      PairComparator<std::string_view, std::string_view>());
      iter != std::end(kEntityMap) && iter->first == entity_name) {
    return iter->second;
  }

  return {};
}

}  // namespace htmlparser

#endif  // CPP_HTMLPARSER_ENTITY_H_
)FOOTER";

// Extracts the entity name from it's line in entities.json.
std::string GetHtmlEntityTag(const std::string& s) {
  int x = s.find_first_of('\"');
  int y = s.find_first_of('\"', x + 1);
  return s.substr(x + 2 /* Ignore '"' and '&' */, y - x - 2);
}

int to_int(std::string* s) {
  htmlparser::Strings::Trim(s);
  int i = 0;
  std::from_chars(s->data(), s->data() + s->size(), i);
  return i;
}

// Extracts the characters codepoint from it's line in entity.json.
std::vector<int> GetCodepoint(const std::string& s) {
  int x = s.find_first_of('[');
  int y = s.find_first_of(']');
  std::string cp = s.substr(x + 1, y - x - 1);
  auto comma = cp.find_first_of(',');
  if (comma == std::string::npos) {
    return {to_int(&cp)};
  }

  std::vector<int> code_points;
  std::size_t current, previous = 0;
  current = cp.find_first_of(',');
  while (current != std::string::npos) {
    std::string cpstr = cp.substr(previous, current - previous);
    code_points.push_back(to_int(&cpstr));
    previous = current + 1;
    current = cp.find_first_of(',', previous);
  }

  std::string cpstr = cp.substr(previous, current - previous);;
  code_points.push_back(to_int(&cpstr));
  return code_points;
}

int main(int argc, char** argv) {
  std::vector<std::string> lines;
  htmlparser::FileReadOptions options;
  options.ignore_comments = true;  // No comments in the json file.
  options.comments_char = '#';
  options.white_space_transform =
      htmlparser::FileReadOptions::LineTransforms::StripWhitespace();
  if (!htmlparser::FileUtil::ReadFileLines(
          options, "cpp/htmlparser/data/entities.json", &lines)) {
    std::cerr << "Error reading input file." << std::endl;
    return EXIT_FAILURE;
  }

  if (lines.empty()) {
    std::cerr << "Parse error, entities.json empty?" << std::endl;
    return EXIT_FAILURE;
  }

  std::ofstream fd("cpp/htmlparser/entity.h");
  htmlparser::Defer __([&]() {fd.close();});

  fd << kFileHeader;
  fd << "inline constexpr std::pair<std::string_view, std::string_view>"
     << " kEntityMap[] {" << std::endl;

  int longest_entity_without_semicolon = 0;

  for (auto& line : lines) {
    if (line.at(0) == '{' || line.at(0) == '}') continue;
    std::string entity = GetHtmlEntityTag(line);
    if (entity.at(entity.size() - 1) != ';') {
      if (entity.size() > longest_entity_without_semicolon) {
        longest_entity_without_semicolon = entity.size();
      }
    }
    fd << "    {\"" << GetHtmlEntityTag(line) << "\", \"";
    for (char32_t code_point : GetCodepoint(line)) {
      if (code_point == 0) {
        std::cerr << "Error processing codepoint: " << line << std::endl;
        return EXIT_FAILURE;
      }

      if ((code_point & 0xffffff80) == 0) {  // 1 byte sequence.
        // 0b0xxxxxx.
        fd << "\\x" << code_point;
      } else if ((code_point & 0xfffff800) == 0) {  // 2 byte sequence.
        // 0b110xxxxx 0b10xxxxxx.
        fd << "\\x" << std::hex << ((code_point >> 6) | 0xc0)
           << "\\x" << std::hex << ((code_point & 0x3f) | 0x80);
      } else if ((code_point & 0xffff0000) == 0) {  // 3 byte sequence.
        // 0b1110xxxx 0b10xxxxxx 0b10xxxxxx.
        fd << "\\x" << std::hex << ((code_point >> 12) | 0xe0)
           << "\\x" << std::hex << (((code_point >> 6) & 0x3f) | 0x80)
           << "\\x" << std::hex << ((code_point & 0x3f) | 0x80);
      } else if ((code_point & 0xffe00000) == 0) {  // 4 byte sequence.
        // 0b11110xxx 0b10xxxxxx 0b10xxxxxx 0b10xxxxxx.
        fd << "\\x" << std::hex << ((code_point >> 18) | 0xf0)
           << "\\x" << std::hex << (((code_point >> 12) & 0x3f) | 0x80)
           << "\\x" << std::hex << (((code_point >> 6) & 0x3f) | 0x80)
           << "\\x" << std::hex << ((code_point & 0x3f) | 0x80);
      }
    }
    fd << "\"}," << std::endl;
  }
  fd << "};" << std::endl << std::endl;

  fd << "// All entities that do not end with a ';' are "
     << longest_entity_without_semicolon << " or fewer bytes long."
     << std::endl;
  fd << "inline constexpr int kLongestEntityWithoutSemiColon = "
     << longest_entity_without_semicolon << ";" << std::endl;
  fd << kFileFooter;
}
