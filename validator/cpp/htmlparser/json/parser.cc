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

#include <vector>

#include "json/parser.h"
#include "json/states.h"

namespace htmlparser::json {

inline std::optional<uint8_t> ParseToken(char c, uint8_t state,
                                         std::vector<uint8_t>* states_stack);

std::pair<bool, LineCol> JSONParser::Validate(std::string_view json) {
  uint8_t state = 0;
  std::vector<uint8_t> states_stack {0};

  LineCol line_col{0, 0};
  std::size_t str_size = json.size();
  for (std::size_t i = 0; i < str_size; i++) {
    uint8_t c = json.at(i);
    if (c == '\n' || (c == '\r' &&
                      i < str_size - 1 &&
                      json.at(i + 1) != '\n')) {
      line_col.first++;
      line_col.second = 0;
    } else {
      line_col.second++;
    }

    auto s = ParseToken(c, state, &states_stack);
    if (!s.has_value()) {
      // Invalid character.
      return {false, line_col};
    }

    state = s.value();
  }

  auto end = ParseToken(' ', state, &states_stack);
  if (!end.has_value()) {
    return {false, line_col};
  }
  state = end.value();

  if (static_cast<StateCode>(state) != StateCode::$) {
    return {false, line_col};
  }

  return {true, line_col};
}

inline std::optional<uint8_t> ParseToken(char c, uint8_t state,
                                         std::vector<uint8_t>* states_stack) {
  auto code = CodeForToken(c, state);

  if (code == 0xff) {
    code = CodeForToken(0, state);
  }

  if (code == 0xff) {
    return std::nullopt;
  }

  if (HasPushBit(code)) {
    uint8_t shift_code = 0;
    shift_code = ToPushStateCode(code);
    states_stack->push_back(shift_code);
  } else if (HasPopBit(code) && !states_stack->empty()) {
    state = states_stack->back();
    states_stack->pop_back();

    // TODO: Fix the grammar.txt file to support GOTO.
    if (c == ',' &&
        state == static_cast<uint8_t>(StateCode::ARRAY_SEPARATOR)) {
      state = static_cast<uint8_t>(StateCode::ARRAY_NEXT_ITEM);
    } else if (c == ']' && state == static_cast<uint8_t>(
        StateCode::ARRAY_SEPARATOR)) {
      state = static_cast<uint8_t>(StateCode::ARRAY_END);
    } else if (c == '}' && state == static_cast<uint8_t>(
        StateCode::OBJECT_SEPARATOR)) {
      state = static_cast<uint8_t>(StateCode::OBJECT_END);
    } else if (c == ',' && state == static_cast<uint8_t>(
        StateCode::OBJECT_SEPARATOR)) {
      state = static_cast<uint8_t>(
          htmlparser::json::StateCode::OBJECT_KEY_BEGIN_QUOTE);
    }

    return state;
  }

  state = ToCurrentStateCode(code);
  return state;
}

}  // namespace htmlparser::json
