//
// Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

#include <fstream>
#include <filesystem>
#include <iostream>

#include "defer.h"
#include "fileutil.h"
#include "grammar/tablebuilder.h"
#include "strings.h"

namespace htmlparser::grammar {

constexpr std::string_view BOLD_RED_BEGIN = "\033[1;31m";
constexpr std::string_view BOLD_RED_END = "\033[0m";
std::string PrintChar(char c);

TableBuilder::TableBuilder(std::string_view grammar_file_path,
                           OutputFileOptions options) :
  grammar_file_path_(grammar_file_path),
  header_options_(options) {
}

bool TableBuilder::ParseRulesAndGenerateTable() {
  if (!std::filesystem::exists(grammar_file_path_)) {
    std::cerr << BOLD_RED_BEGIN << "Cannot read file: "
              << grammar_file_path_
              << BOLD_RED_END << "\n";
    return false;
  }

  if (!ParseGrammarFile()) {
    std::cerr << "Parse failed.\n";
    return false;
  }

  std::set<std::string> declared_states{"PUSH", "POP"};
  std::set<std::string> transition_states{"$"};
  for (auto& r : raw_rules_) {
    declared_states.insert(r.state);
    for (auto& t : r.transition) {
      transition_states.insert(t);
    }
    for (char c : r.input.charset) {
      charset_.insert(c);
    }
  }

  std::set<std::string> unused_states;
  std::set_difference(
      declared_states.begin(), declared_states.end(),
      transition_states.begin(), transition_states.end(),
      std::inserter(unused_states, unused_states.begin()));

  if (!unused_states.empty()) {
    std::cerr << BOLD_RED_BEGIN << "Following states defined but not used: \n";
    for (auto& us : unused_states) {
      std::cerr << us << std::endl;
    }
    std::cerr << BOLD_RED_END;
    return false;
  }

  std::set<std::string> undefined_states;
  std::set_difference(
      transition_states.begin(), transition_states.end(),
      declared_states.begin(), declared_states.end(),
      std::inserter(undefined_states, undefined_states.begin()));

  if (!undefined_states.empty()) {
    std::cerr << BOLD_RED_BEGIN << "Following states not defined: \n";
    for (auto& us : undefined_states) {
      std::cerr << us << std::endl;
    }
    std::cerr << BOLD_RED_END << std::endl;
    return false;
  }

  for (auto& t : transition_states) {
    if (declared_states.find(t) == declared_states.end()) {
      std::cerr << "State: " << t << " not found.\n";
      return false;
    }
  }

  declared_states.erase("PUSH");
  declared_states.erase("POP");

  if (declared_states.size() > 256) {
    std::cerr << "Maximum 256 states supported. "
              << declared_states.size() << " declared."
              << std::endl;
    return false;
  }

  std::array<int, 127> charindexes = {-1};
  for (int i = 0; i < 127; i++) {
    // Default to match rest of the chars column (last column).
    charindexes[i] = charset_.size();
  }

  int i = 0;

  for (int c : charset_) {
    charindexes[c] = i;
    i++;
  }

  std::map<uint8_t, std::vector<uint32_t>> table;

  bool has_non_ascii_char_def = charset_.find(0x80) != charset_.end();

  for (auto& s : declared_states) {
    uint8_t code = state_code_counter_;
    state_code_counter_ += 1;
    state_codes_.insert({s, code});

    for (int i = 0; i < charset_.size(); i++) {
      table[code].push_back(0xff);
    }

    if (!has_non_ascii_char_def) {
      // For non-ascii chars.
      table[code].push_back(0xff);
    }

    // For all characters.
    table[code].push_back(0xff);
  }

  for (auto& r : raw_rules_) {
    uint8_t code = state_codes_[r.state];
    auto value = ComputeState(code, r);
    if (!value.has_value()) return false;

    if (r.input.charset.empty()) {
      table[code][charset_.size()] = value.value();
      table[code][charset_.size() + 1] = value.value();
    } else {
      if (r.input.exclude) {
        if (!has_non_ascii_char_def) {
          table[code][charset_.size()] = value.value();
        }
        // Allows rest of the chars.
        table[code][charset_.size() + 1] = value.value();
      } else {
        for (int c : r.input.charset) {
          if (c == 0x80) {
            table[code][charset_.size() - 1] = value.value();
          } else {
            table[code][charindexes[c]] = value.value();
          }
        }
      }
    }
  }

  return OutputHeaderFile(declared_states, charindexes, table);
}

bool TableBuilder::OutputHeaderFile(
    const std::set<std::string>& declared_states,
    const std::array<int, 127>& tokenindexes,
    const std::map<uint8_t, std::vector<uint32_t>>& table) {
  std::ofstream fd(header_options_.output_file_path);
  htmlparser::Defer ____([&]() {fd.close();});

  fd << "// -*- C++ -*-\n";

  if (!header_options_.license_header.empty()) {
    fd << header_options_.license_header << "\n";
  }
  fd << "\n// AUTO GENERATED; DO NOT EDIT.\n";
  fd << "// To regenerate this file, see comments in bin/jsongrammargen\n\n";
  if (!header_options_.ifdef_guard.empty()) {
    fd << "#ifndef " << header_options_.ifdef_guard << "\n";
    fd << "#define " << header_options_.ifdef_guard << "\n\n";
  } else {
    fd << "#pragma once\n";
  }

  fd << "#include <array>\n\n";

  if (!header_options_.cpp_namespace.empty()) {
    fd << "namespace " << header_options_.cpp_namespace << " {\n\n";
  }

  fd << "enum class StateCode {\n";
  for (auto [k, v] : state_codes_) {
    fd << "  " << k << " = " << static_cast<int>(v) << ",\n";
  }
  fd << "};\n\n";

  fd << "enum class CallbackCode {\n";
  fd << "  // TODO: Implement callbacks.\n";
  fd << "};\n\n";

  fd << R"(
// Extracts CallbackCode from the bytes.
inline static uint8_t ToCallbackCode(uint32_t code);

// Extracts push StateCode from the bytes.
inline static uint8_t ToPushStateCode(uint32_t code);

// Extracts active State code from the bytes.
inline static uint8_t ToCurrentStateCode(uint32_t code);

// Returns code for current token and active state.
inline static uint32_t CodeForToken(unsigned char c, uint8_t state);

// Checks the push bit is on.
inline static bool HasPushBit(uint32_t code);

// Checks the push bit is off.
inline static bool HasPopBit(uint32_t code);

)";

  fd << "constexpr std::array<int, 127> kTokenIndexes {\n    ";
  for (int i = 0; i < tokenindexes.size(); i++) {
    fd << tokenindexes[i];
    if (tokenindexes[i] < charset_.size()) {
      fd << " /* " << PrintChar(
          *(std::next(charset_.begin(), tokenindexes[i]))) << " */";
    }
    fd << (i > 0 && ((i + 1) % 6 == 0) ? ",\n    " : ", ");
  }
  fd << "};\n\n";

  if (charset_.find(0x80) == charset_.end())
    charset_.insert(0x80);

  fd << "constexpr std::array<std::array<uint32_t, " << charset_.size() + 1
     << ">, "
     << declared_states.size() << "> kParseStates {{\n";

  for (auto& [k, v] : table) {
    fd << "    // " << *std::next(declared_states.begin(), k) << "\n";
    fd << "    // Code: " << std::dec << static_cast<int>(k) << "\n";
    fd << "    {";
    for (int i = 0; i < v.size(); i++) {
      fd << "0x" << std::hex << v[i];
      fd << " /* " << PrintChar(*(std::next(charset_.begin(), i)))
         << " */";
      if (i < v.size() - 1) {
        fd << (i > 0 && ((i + 1) % 4 == 0) ? ",\n     " : ", ");
      }
    }

    fd << "},\n";
  }

  fd << "}};\n\n";

  fd << R"(
inline static uint8_t ToCallbackCode(uint32_t code) {
  // 4th byte.
  return static_cast<uint8_t>(code >> 24);
}

inline static uint8_t ToPushStateCode(uint32_t code) {
  // 3rd byte.
  return static_cast<uint8_t>((code & 0x00ff0000) >> 16);
}

inline static uint8_t ToCurrentStateCode(uint32_t code) {
  // 2nd byte.
  return static_cast<uint8_t>((code & 0x0000ff00) >> 8);
}

inline static bool HasPushBit(uint32_t code) {
  // 6th bit in first byte.
  return ((code & 0x80) >> 7) == 1;
}

inline static bool HasPopBit(uint32_t code) {
  // 7th bit in first byte.
  return ((code & 0x40) >> 6) == 1;
}

// TODO: In follow up change modify the signature to accept a unicode
// character, that is char32_t and based on the charset for this state return
// the code from second last or last column accordingly.
inline static uint32_t CodeForToken(unsigned char c, uint8_t state) {
  if (c > 127) {
)";

  fd << "    return kParseStates[state][";
  fd << std::dec << charset_.size() - 1 << "];\n";
  fd << "  }\n";
  fd << "  int index = kTokenIndexes[c];\n";
  fd << "  if (index == -1) index = " << std::dec << charset_.size() << ";\n";
  fd << "  return kParseStates[state][index];\n}\n\n";

  if (!header_options_.cpp_namespace.empty()) {
    fd << "}  // namespace " << header_options_.cpp_namespace << "\n\n";
  }

  if (!header_options_.ifdef_guard.empty()) {
    fd << "#endif  // " << header_options_.ifdef_guard << std::endl;
  }

  return true;
}

std::optional<uint32_t> TableBuilder::ComputeState(uint8_t row, Rule r) {
  if (r.transition.size() == 3) {
    return ComputeStateBits(
        0,
        state_codes_[r.transition[2]],
        state_codes_[r.transition[0]],
        true,
        false);
  } else if (r.transition.size() == 2) {
    if (r.transition[0] == "PUSH") {
      return ComputeStateBits(
            0,
            state_codes_[r.transition[2]],
            0,
            true,
            false);
    } else if (r.transition[1] == "PUSH") {
      return ComputeStateBits(
          0,
          0,
          state_codes_[r.transition[2]],
          true,
          false);
    }
  } else if (r.transition.size() == 1) {
    if (r.transition[0] == "POP") {
      return ComputeStateBits(
          0,
          0,
          0,
          false,
          true);
    } else {
      return ComputeStateBits(
          0,
          0,
          state_codes_[r.transition[0]],
          false,
          false);
    }
  }

  return true;
}

bool TableBuilder::ParseGrammarFile() {
  htmlparser::FileReadOptions options;
  options.ignore_comments = true;
  options.comments_char = '#';
  options.white_space_transform =
      htmlparser::FileReadOptions::LineTransforms::StripWhitespace();
  bool valid_rule = true;
  htmlparser::FileUtil::ReadFileLines(
      options,
      grammar_file_path_,
      [&](std::string_view line, int line_number) {
        auto rule = ReadRule(line, line_number);
        if (!rule.has_value()) {
          valid_rule = false;
          return;
        }
        raw_rules_.push_back(rule.value());
      });
  return valid_rule;
}

void TableBuilder::RemoveLeadingWhitespace(std::string_view* line) const {
  while (line->data()) {
    char c = line->front();
    if (c == ' ' || c == '\t') {
      line->remove_prefix(1);
      continue;
    }
    return;
  }
}

std::optional<Rule> TableBuilder::ReadRule(std::string_view line,
                                           int line_no) const {
  std::stringbuf buf;
  int line_size = line.size();
  while (line.data()) {
    char c = line.front();
    line.remove_prefix(1);
    if (c == ' ') {
      RemoveLeadingWhitespace(&line);
      break;
    }
    buf.sputc(c);
  }

  std::string state = buf.str();

  bool exclude = false;
  std::vector<uint8_t> input;
  char c = line.front();

  if (c == '^' && line.at(1) == '"') {
    exclude = true;
    line.remove_prefix(1);
    c = line.front();
  }

  if (c == '\'') {
    line.remove_prefix(1);
    c = line.front();
    line.remove_prefix(1);
    if (line.front() == '\'') {
      line.remove_prefix(1);
      input.push_back(c);
    } else {
      std::cerr << "Invalid input declaration at: " <<
                line_no << ":" << line_size - line.size() << std::endl;
      return std::nullopt;
    }
  } else if (c == '"') {
    line.remove_prefix(1);
    char previous_char = ' ';
    while (line.data()) {
      c = line.front();
      if (previous_char == '\\') {
        switch (c) {
          case '"': {
            input.pop_back();
            input.push_back('"');
            previous_char = '"';
            line.remove_prefix(1);
            continue;
          }
          case 'n': {
            input.pop_back();
            input.push_back('\n');
            previous_char = '\n';
            line.remove_prefix(1);
            continue;
          }
          case 't': {
            input.pop_back();
            input.push_back('\t');
            previous_char = '\t';
            line.remove_prefix(1);
            continue;
          }
          case 'r': {
            input.pop_back();
            input.push_back('\r');
            previous_char = '\r';
            line.remove_prefix(1);
            continue;
          }
          case 'f': {
            input.pop_back();
            input.push_back('\f');
            previous_char = '\f';
            line.remove_prefix(1);
            continue;
          }

          // Special escaped identifier for declaring non-ascii character types.
          //
          // "abcdef\u" declares group of characters a,b,c,d,e,f and any non
          // ascii character.
          //
          // State tables last two columns are rest of the chars columns.
          //  - Second last column contains code for non-ascii characters.
          //  - Last column contains code for all (including non-ascii
          //  characters).
          //  If last column state is to accept any character, second last
          //  column's value is ignored.
          //
          //  For example:
          //  MY_RULE "0123456789\u" MY_OBJECT_START;
          //  MY_RULE .* MY_OBJECT_START;
          //
          //  The second declaration overrides the first declaration and have
          //  same meaning, it just widens the character range for the rule.
          //  All the characters ascii and non-ascii will be accepted by this
          //  rule.
          //
          //  The exclusion marker works differently.
          //
          //  For example:
          //  MY_RULE ^"0123456789" MY_OBJECT_START;
          //  MY_RULE .* MY_OBJECT_START;
          //
          //  The second rule doesn't override the previous exclusion chars. So
          //  MY_RULE will transition to MY_OBJECT_START for any characters
          //  except 0, 1, 2, 3, 4, 5, 6, 7, 8 and 9.
          case 'u': {
            input.pop_back();
            input.push_back(0x80);
            previous_char = 'u';
            line.remove_prefix(1);
            continue;
          }
        }
      }

      // Checks if period is part of range specifier.
      if (c == '.' && previous_char != 0 && line.size() > 3) {
        if (line.at(1) == '.') {
          char range_end = line.at(2);
          if (range_end < previous_char) {
            std::cerr << "Invalid range : " << previous_char << ".."
                      << range_end << "\n";
            return std::nullopt;
          }

          for (int i = previous_char; i <= range_end; i++) {
            input.push_back(i);
          }

          line.remove_prefix(3);  /* .. and char */
          previous_char = 0;
          continue;
        }
      }

      if (c == '"') {
        line.remove_prefix(1);
        if (line.front() != ' ') {
          std::cerr << "Invalid syntax. Expecting whitespace at: "
                    << line_no << ":" << line_size - line.size()
                    << std::endl;
          return std::nullopt;
        }
        break;
      }

      input.push_back(c);
      previous_char = c;
      line.remove_prefix(1);
    }
  } else if (c == '.') {
    line.remove_prefix(1);
    c = line.front();
    if (c != '*') {
      std::cerr << "Invalid char. Exepcting .* at : "
                << line_no << ":" << line_size - line.size() << std::endl;
      return std::nullopt;
    }
    line.remove_prefix(1);
  } else {
    std::cerr << "Parse failed for character: " << c << std::endl;
    return std::nullopt;
  }

  RemoveLeadingWhitespace(&line);
  std::string transition(line.substr(0, line.find_first_of(';')));
  if (transition.find(' ') != std::string::npos) {
    std::cerr << "Invalid syntax at line: " << line_no << ":"
              << line_size - line.size() << std::endl;;
    return std::nullopt;
  }

  if (transition.empty()) {
    std::cerr << "No transition state for : " << state << std::endl;
    return std::nullopt;
  }

  auto transition_states = Strings::SplitStringAt(transition, '|');

  if (transition_states.size() > 3) {
    std::cerr << BOLD_RED_BEGIN
              << "Maximum 3 transition states allowed. Found: "
              << transition_states.size() << "\n";
    for (auto& t : transition_states) {
      std::cerr << t << std::endl;
    }
    std::cerr << BOLD_RED_END;
    return std::nullopt;
  }

  if (transition_states.size() == 3 &&
      transition_states[1] != "PUSH") {
    std::cerr << "PUSH must be followed by push state at: "
              << line_no << ":" << line_size - line.size() << std::endl;
    return std::nullopt;
  } else if (transition_states.size() == 2 &&
             transition_states[0] != "PUSH" &&
             transition_states[1] != "PUSH") {
    std::cerr << "Missing PUSH identifier for multiple states at: "
              << line_no << ":" << line_size - line.size() << std::endl;
    return std::nullopt;
  } else if (transition_states.size() == 1 &&
             transition_states[0] == "PUSH") {
    std::cerr << "Missing push state with PUSH identifier at: "
              << line_no << ":" << line_size - line.size() << std::endl;
    return std::nullopt;
  }

  return Rule{.state = state,
              .input = {.exclude = exclude,
                        .charset{input.begin(), input.end()}},
              .transition = transition_states};
}

std::optional<uint32_t> TableBuilder::ComputeStateBits(
    uint8_t callback_code,
    uint8_t push_state_code,
    uint8_t current_state_code,
    bool push,
    bool pop) {
  uint32_t result = callback_code << 24;
  result |= (push_state_code << 16);
  result |= (current_state_code << 8);
  if (push) result |= (1 << 7);
  if (pop) result |= (1 << 6);
  return result;
}

std::string PrintChar(char c) {
  switch (c) {
    case '\r':
      return "CR";
    case '\t':
      return "TAB";
    case '\f':
      return "FF";
    case '\b':
      return "BKSPC";
    case '\n':
      return "LF";
    case 0x80:
      return "\\u";
    default: {
      if (static_cast<int>(c) > 126) {
        return ".*";
      } else {
        return std::string({c});
      }
    }
  }
}

}  // namespace htmlparser::grammar
