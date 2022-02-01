#include <fstream>
#include <iostream>
#include <sstream>
#include <utility>

#include "cpp/htmlparser/defer.h"
#include "cpp/htmlparser/fileutil.h"

const char kFileHeader[] =
    R"HEADER(// AUTO GENERATED; DO NOT EDIT.
// To regenerate this file, see comments in bin/casetable.cc

#ifndef CPP_HTMLPARSER_CASETABLE_H_
#define CPP_HTMLPARSER_CASETABLE_H_

#include <algorithm>
#include <utility>

#include "cpp/htmlparser/comparators.h"

namespace htmlparser {

inline char32_t ToLowerChar(char32_t);
inline char32_t ToUpperChar(char32_t);

// Unicode lowercase to uppercase conversion mapping table.
// This facilitates character conversion without depending on the system/program
// locale settings.
// These are unicode code points.
)HEADER";

const char kFileFooter[] = R"FOOTER(
inline char32_t ToLowerChar(char32_t c) {
  // Returns if c is already a lowercase ascii.
  if ('a' <= c && c <= 'z') return c;

  // Returns lower case ascii.
  if ('A' <= c && c <= 'Z') {
    return c + 32;
  }

  if (auto iter = std::lower_bound(std::begin(kUppercaseToLowerTable),
                                   std::end(kUppercaseToLowerTable),
                                   c,
                                   PairComparator<char32_t, char32_t>());
      iter != std::end(kUppercaseToLowerTable) && iter->first == c) {
    return iter->second;
  }
  return c;
}

inline char32_t ToUpperChar(char32_t c) {
  // If it is a lower case ascii return upper case ascii.
  if ('a' <= c && c <= 'z') {
    return c - 32;
  }

  // Returns if it is already upper case ascii.
  if ('A' <= c && c <= 'Z') return c;

  if (auto iter = std::lower_bound(std::begin(kLowercaseToUpperTable),
                                   std::end(kLowercaseToUpperTable),
                                   c,
                                   PairComparator<char32_t, char32_t>());
      iter != std::end(kLowercaseToUpperTable) && iter->first == c) {
    return iter->second;
  }
  return c;
}

}  // namespace htmlparser

#endif  // CPP_HTMLPARSER_CASETABLE_H_
)FOOTER";

namespace htmlparser {

// Components of a line in CaseTable.txt file.
struct Entry {
  std::string upper_case;
  std::string lower_case;
  std::string description;
};

}  // namespace htmlparser

int main(int argc, char** argv) {
  std::vector<std::string> lines;
  htmlparser::FileReadOptions options;
  options.ignore_comments = true;
  options.comments_char = '#';
  options.white_space_transform =
      htmlparser::FileReadOptions::LineTransforms::StripWhitespace();
  if (!htmlparser::FileUtil::ReadFileLines(
          options, "testdata/go/CaseFolding.txt", &lines)) {
    std::cerr << "Error reading input file." << std::endl;
    return EXIT_FAILURE;
  }

  if (lines.empty()) {
    std::cerr << "Parse error, CaseFolding.txt empty?" << std::endl;
    return EXIT_FAILURE;
  }

  std::vector<htmlparser::Entry> upper_to_lower;

  for (auto& line : lines) {
    std::vector<std::string> line_components;
    int delim = 0;
    for (int i = 0; i < line.size(); i++) {
      if (line.at(i) != ';') continue;
      line_components.push_back(line.substr(delim, i - delim));
      delim = i + 2;
    }
    // Rest of the line.
    line_components.push_back(line.substr(delim, line.size() - delim));

    if (line_components.size() != 4) continue;

    // Skip full.
    if (line_components[1] == "F") {
      continue;
    }

    upper_to_lower.push_back({.upper_case = line_components[0],
                              .lower_case = line_components[2],
                              .description = line_components[3]});
  }
  if (upper_to_lower.empty()) {
    std::cerr << "No entry found. Aborting." << std::endl;
    return EXIT_FAILURE;
  }

  std::ofstream fd("cpp/htmlparser/casetable.h");
  htmlparser::Defer __([&]() { fd.close(); });

  fd << kFileHeader;
  fd << "inline constexpr std::pair<char32_t, char32_t> "
        "kUppercaseToLowerTable[] {"
     << std::endl;
  for (auto& entry : upper_to_lower) {
    fd << "    {0x" << entry.upper_case << ", 0x" << entry.lower_case
       << "},  // " << entry.description << std::endl;
  }
  fd << "};" << std::endl;

  fd << "inline constexpr std::pair<char32_t, char32_t> "
        "kLowercaseToUpperTable[] {"
     << std::endl;
  for (auto& entry : upper_to_lower) {
    fd << "    {0x" << entry.lower_case << ", 0x" << entry.upper_case
       << "},  // " << entry.description << std::endl;
  }
  fd << "};" << std::endl;
  fd << kFileFooter;
}
