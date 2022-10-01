#include "cpp/htmlparser/grammar/tablebuilder.h"

#include <algorithm>
#include <array>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <iterator>

#include "absl/strings/match.h"
#include "cpp/htmlparser/defer.h"
#include "cpp/htmlparser/fileutil.h"
#include "cpp/htmlparser/strings.h"

namespace htmlparser::grammar {

constexpr std::string_view BOLD_RED_BEGIN = "\033[1;31m";
constexpr std::string_view BOLD_RED_END = "\033[0m";
constexpr std::array<std::string_view, 3> kBuiltInStates {
  "PUSH", "POP", "SHIFT"
};

TableBuilder::TableBuilder(std::string_view grammar_file_path,
                           ParseOptions options)
    : grammar_file_path_(grammar_file_path),
      parse_options_(options) {}

bool TableBuilder::ParseRulesAndGenerateTable() {
  if (!std::filesystem::exists(grammar_file_path_)) {
    std::cerr << BOLD_RED_BEGIN << "Cannot read file: " << grammar_file_path_
              << BOLD_RED_END << "\n";
    return false;
  }

  if (!ParseGrammarFile()) {
    std::cerr << "Parse failed.\n";
    return false;
  }

  std::set<std::string> declared_states{kBuiltInStates.begin(),
                                        kBuiltInStates.end()};

  std::set<std::string> transition_states{"$"};
  std::set<std::string> callback_codes{};

  for (auto& r : raw_rules_) {
    declared_states.insert(r.state);
    for (auto& t : r.transition) {
      transition_states.insert(t);
    }
    for (char c : r.input.charset) {
      charset_.insert(c);
    }
    if (!r.callback.empty()) callback_codes.insert(r.callback);
  }

  std::set<std::string> unused_states;
  std::set_difference(declared_states.begin(), declared_states.end(),
                      transition_states.begin(), transition_states.end(),
                      std::inserter(unused_states, unused_states.begin()));

  for (auto& s  : kBuiltInStates) {
    unused_states.erase(s.data());
  }

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

  for (auto& s : kBuiltInStates) {
    undefined_states.erase(s.data());
  }

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

  for (auto& s : kBuiltInStates) {
    declared_states.erase(s.data());
  }

  if (declared_states.size() >= UINT8_MAX) {
    std::cerr << "Maximum " << UINT8_MAX + 1 << " states supported. "
              << declared_states.size() << " declared." << std::endl;
    return false;
  }

  std::array<int, INT8_MAX> charindexes = {-1};
  for (int i = 0; i < INT8_MAX; i++) {
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

  uint8_t state_code_counter{0};
  for (auto& s : declared_states) {
    uint8_t code = state_code_counter++;
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

  uint8_t callback_code_counter{0};
  for (auto& c : callback_codes) {
    callback_codes_.insert({c, ++callback_code_counter});
  }

  // Special callback denoting the end of parsing.
  callback_codes_.insert({"PARSE_END", ++callback_code_counter});

  for (auto& r : raw_rules_) {
    uint8_t code = state_codes_[r.state];
    auto value = ComputeState(r);
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
    const std::array<int, INT8_MAX>& tokenindexes,
    const std::map<uint8_t, std::vector<uint32_t>>& table) {
  std::ofstream fd(parse_options_.output_file_path);
  htmlparser::Defer ____([&]() { fd.close(); });

  fd << "// -*- C++ -*-\n";

  fd << "\n// AUTO GENERATED; DO NOT EDIT.\n";
  fd << "// To regenerate this file, see comments in bin/validatorgen\n\n";
  if (!parse_options_.ifdef_guard.empty()) {
    fd << "#ifndef " << parse_options_.ifdef_guard << "\n";
    fd << "#define " << parse_options_.ifdef_guard << "\n\n";
  } else {
    fd << "#pragma once\n";
  }

  fd << "#include <array>\n";
  fd << "#include <functional>\n";
  fd << "#include <iostream>\n";
  fd << "#include <optional>\n";
  fd << "#include <string_view>\n";
  fd << "#include <utility>\n";
  fd << "#include <vector>\n\n";


  if (!parse_options_.cpp_namespace.empty()) {
    fd << "namespace " << parse_options_.cpp_namespace << " {\n\n";
  }

  fd << "enum class StateCode : uint8_t {\n";
  for (auto [k, v] : state_codes_) {
    fd << "  " << k << " = " << static_cast<int>(v) << ",\n";
  }
  fd << "};\n\n";

  fd << "enum class CallbackCode {\n";
  fd << "  NONE = 0,\n";
  for (auto [k, v] : callback_codes_) {
    fd << "  " << k << " = " << static_cast<int>(v) << ",\n";
  }
  fd << "};\n\n";

  fd << "using Callback = std::function<void(CallbackCode, StateCode, int)>;\n";
  fd << "using LineCol = std::pair<int, int>;\n\n";

  fd << R"(
// Validates json string, returns error line/col if str is invalid json.
inline std::pair<bool, LineCol> Validate(std::string_view str,
                                         Callback callback = nullptr);

// Extracts CallbackCode from the bytes.
inline static CallbackCode ToCallbackCode(uint32_t code);

// Extracts push StateCode from the bytes.
inline static StateCode ToPushStateCode(uint32_t code);

// Extracts active State code from the bytes.
inline static StateCode ToCurrentStateCode(uint32_t code);

// Returns code for current token and active state.
inline static uint32_t CodeForToken(unsigned char c, StateCode state);

// Checks the push bit is on.
inline static bool HasPushBit(uint32_t code);

// Checks the pop bit is on.
inline static bool HasPopBit(uint32_t code);

// Checks the shift bit is on.
inline static bool HasShiftBit(uint32_t code);

)";

  fd << "constexpr std::array<int, INT8_MAX> kTokenIndexes {\n    ";
  for (int i = 0; i < tokenindexes.size(); i++) {
    fd << tokenindexes[i];
    fd << (i > 0 && ((i + 1) % 8 == 0) ? ",\n    " : ", ");
  }
  fd << "};\n\n";

  if (charset_.find(0x80) == charset_.end()) charset_.insert(0x80);

  fd << "constexpr std::array<std::array<uint32_t, " << charset_.size() + 1
     << ">, " << declared_states.size() << "> kParseStates {{\n";

  for (auto& [k, v] : table) {
    fd << "    // " << *std::next(declared_states.begin(), k) << "\n";
    fd << "    // Code: " << std::dec << static_cast<int>(k) << "\n";
    fd << "    {";
    for (int i = 0; i < v.size(); i++) {
      fd << "0x" << std::hex << v[i];
      if (i < v.size() - 1) {
        fd << (i > 0 && ((i + 1) % 6 == 0) ? ",\n     " : ", ");
      }
    }

    fd << "},\n";
  }

  fd << "}};\n\n";

  fd << R"(
inline static CallbackCode ToCallbackCode(uint32_t code) {
  // 4th byte.
  return static_cast<CallbackCode>((code & 0xff000000) >> 24);
}

inline static StateCode ToPushStateCode(uint32_t code) {
  // 3rd byte.
  return static_cast<StateCode>((code & 0x00ff0000) >> 16);
}

inline static StateCode ToCurrentStateCode(uint32_t code) {
  // 2nd byte.
  return static_cast<StateCode>((code & 0x0000ff00) >> 8);
}

inline static bool HasPushBit(uint32_t code) {
  // 8th bit in first byte.
  return (code & 0x80);
}

inline static bool HasPopBit(uint32_t code) {
  // 7th bit in first byte.
  return ((code & 0x40) >> 6) == 1;
}

inline static bool HasShiftBit(uint32_t code) {
  // 6th bit in first byte.
  return ((code & 0x20) >> 5) == 1;
}

inline static uint32_t CodeForToken(unsigned char c, StateCode state) {
  if (c > INT8_MAX) {
)";

  fd << "    return kParseStates[static_cast<uint8_t>(state)][";
  fd << std::dec << charset_.size() - 1 << "];\n";
  fd << "  }\n";
  fd << "  int index = kTokenIndexes[c];\n";
  fd << "  if (index == -1) index = " << std::dec << charset_.size() << ";\n";
  fd << "  return kParseStates[static_cast<uint8_t>(state)][index];\n}\n\n";

  fd << R"(
inline std::optional<StateCode> ParseToken(
    char c, StateCode state, int i, std::vector<StateCode>* states_stack,
    Callback callback = nullptr) {
  uint32_t code = CodeForToken(c, state);
  if (code == 0xff) {
    code = CodeForToken(0, state);
  }

  if (code == 0xff) {
    return std::nullopt;
  }

  auto callback_code = ToCallbackCode(code);
  if (callback && callback_code > CallbackCode::NONE) {
    callback(callback_code, state, i);
  }

  if (HasPushBit(code)) {
    auto shift_code = ToPushStateCode(code);
    states_stack->push_back(shift_code);
    return ToCurrentStateCode(code);
  } else if (HasPopBit(code) && !states_stack->empty()) {
    state = states_stack->back();
    states_stack->pop_back();
    return state;
  } else if (HasShiftBit(code) && !states_stack->empty()) {
    auto shift_state = states_stack->back();
    states_stack->pop_back();
    if (auto s = ParseToken(c, shift_state, i, states_stack); s) {
      code = CodeForToken(c, shift_state);
      callback_code = ToCallbackCode(code);
      if (callback && callback_code > CallbackCode::NONE) {
        callback(callback_code, shift_state, i);
      }
      return s.value();
    } else {
      return std::nullopt;
    }
  } else {
    return ToCurrentStateCode(code);
  }
}

std::pair<bool, LineCol> Validate(std::string_view str, Callback callback) {
  StateCode state = StateCode::$;
  uint32_t code = 0;
  CallbackCode callback_code = CallbackCode::NONE;
  std::vector<StateCode> states_stack {StateCode::$};

  LineCol line_col{0, 0};
  std::size_t str_size = str.size();
  for (std::size_t i = 0; i < str_size; i++) {
    uint8_t c = str.at(i);
    if (c == '\n' || (c == '\r' &&
                      i < str_size - 1 &&
                      str.at(i + 1) != '\n')) {
      line_col.first++;
      line_col.second = 0;
    } else {
      line_col.second++;
    }

    auto s = ParseToken(c, state, i, &states_stack, callback);
    if (!s.has_value()) {
      // Invalid character.
      return {false, line_col};
    }
    state = s.value();
  }

  code = CodeForToken()";
  fd << +parse_options_.termination_sentinel << ", state);\n";
  fd << "  callback_code = ToCallbackCode(code);\n";
  fd << "  auto end = ParseToken(";
  fd << +parse_options_.termination_sentinel;
  fd << R"(, state, str.size() - 1, &states_stack, callback);
  if (!end.has_value()) {
    return {false, line_col};
  }
  state = end.value();
  if (callback && callback_code > CallbackCode::NONE) {
    callback(callback_code, state, str.size() - 1);
  }

  if (state != StateCode::$) {
    return {false, line_col};
  }

  // Final callback denoting end of parsing.
  if (callback) {
    callback(CallbackCode::PARSE_END, state, str.size());
  }

  return {true, line_col};
}

)";

  if (!parse_options_.cpp_namespace.empty()) {
    fd << "}  // namespace " << parse_options_.cpp_namespace << "\n\n";
  }

  if (!parse_options_.ifdef_guard.empty()) {
    fd << "#endif  // " << parse_options_.ifdef_guard << std::endl;
  }

  return true;
}

std::optional<uint32_t> TableBuilder::ComputeState(Rule r) {
  uint8_t cb_code = r.callback.empty() ? 0 : callback_codes_[r.callback];
  if (r.transition.size() == 3) {
    return ComputeStateBits(cb_code, state_codes_[r.transition[2]],
                            state_codes_[r.transition[0]],
                            true, false, false);
  } else if (r.transition.size() == 2) {
    if (r.transition[0] == "PUSH") {
      return ComputeStateBits(cb_code, state_codes_[r.transition[2]], 0,
                              true, false, false);
    } else if (r.transition[1] == "PUSH") {
      return ComputeStateBits(cb_code, 0, state_codes_[r.transition[2]],
                              true, false, false);
    }
  } else if (r.transition.size() == 1) {
    if (r.transition[0] == "POP") {
      return ComputeStateBits(cb_code, 0, 0, false, true, false);
    } else if (r.transition[0] == "SHIFT") {
      return ComputeStateBits(cb_code, 0, 0, false, false, true);
    } else {
      return ComputeStateBits(cb_code, 0, state_codes_[r.transition[0]],
                              false, false, false);
    }
  }

  return std::nullopt;
}

bool TableBuilder::ParseGrammarFile() {
  htmlparser::FileReadOptions options;
  options.ignore_comments = true;
  options.comments_char = '#';
  options.white_space_transform =
      htmlparser::FileReadOptions::LineTransforms::StripWhitespace();
  bool valid_rule = true;
  htmlparser::FileUtil::ReadFileLines(
      options, grammar_file_path_, [&](std::string_view line, int line_number) {
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
  htmlparser::Strings::Trim(&state);

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
      std::cerr << "Invalid input declaration at: " << line_no << ":"
                << line_size - line.size() << std::endl;
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

          line.remove_prefix(3); /* .. and char */
          previous_char = 0;
          continue;
        }
      }

      if (c == '"') {
        line.remove_prefix(1);
        if (line.front() != ' ') {
          std::cerr << "Invalid syntax. Expecting whitespace at: " << line_no
                    << ":" << line_size - line.size() << std::endl;
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
      std::cerr << "Invalid char. Exepcting .* at : " << line_no << ":"
                << line_size - line.size() << std::endl;
      return std::nullopt;
    }
    line.remove_prefix(1);
  } else if (c == '0' && line.size() > 1 && line.at(1) == ' ') {
    line.remove_prefix(1);
  } else {
    std::cerr << "Parse failed for character: " << c << std::endl;
    return std::nullopt;
  }

  RemoveLeadingWhitespace(&line);
  std::string transition;
  std::string callback;
  if (auto n = line.find_first_of(' '); n != std::string::npos) {
    transition = line.substr(0, n);
    if (absl::StrContains(transition, ' ')) {
      std::cerr << "Invalid syntax at line: " << line_no << ":"
                << line_size - line.size() << std::endl;
      return std::nullopt;
    }
    line.remove_prefix(n + 1);
    callback = line.substr(0, line.find_first_of(';'));
    htmlparser::Strings::Trim(&callback);
  } else {
    transition = line.substr(0, line.find_first_of(';'));
  }

  if (transition.empty()) {
    std::cerr << "No transition state for : " << state << std::endl;
    return std::nullopt;
  }

  auto transition_states = Strings::SplitStringAt(transition, '|');

  if (state == "$") {
    for (const auto& t : transition_states) {
      if (std::find(kBuiltInStates.begin(), kBuiltInStates.end(), t) !=
          kBuiltInStates.end()) {
        std::cerr << "PUSH|POP|SHIFT are invalid in begin \"$\" state."
                  << std::endl;
        return std::nullopt;
      }
    }
  }

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

  if (transition_states.size() == 3 && transition_states[1] != "PUSH") {
    std::cerr << "PUSH must be followed by push state at: " << line_no << ":"
              << line_size - line.size() << std::endl;
    return std::nullopt;
  } else if (transition_states.size() == 2 && transition_states[0] != "PUSH" &&
             transition_states[1] != "PUSH") {
    std::cerr << "Missing PUSH identifier for multiple states at: " << line_no
              << ":" << line_size - line.size() << std::endl;
    return std::nullopt;
  } else if (transition_states.size() == 1 && transition_states[0] == "PUSH") {
    std::cerr << "Missing push state with PUSH identifier at: " << line_no
              << ":" << line_size - line.size() << std::endl;
    return std::nullopt;
  }

  return Rule{
      .state = state,
      .input = {.exclude = exclude, .charset{input.begin(), input.end()}},
      .transition = transition_states,
      .callback = callback};
}

std::optional<uint32_t> TableBuilder::ComputeStateBits(
    uint8_t callback_code, uint8_t push_state_code, uint8_t current_state_code,
    bool push, bool pop, bool shift) {
  uint32_t result = callback_code << 24;
  result |= (push_state_code << 16);
  result |= (current_state_code << 8);
  if (push) result |= (1 << 7);
  if (pop) result |= (1 << 6);
  if (shift) result |= (1 << 5);
  return result;
}

}  // namespace htmlparser::grammar
