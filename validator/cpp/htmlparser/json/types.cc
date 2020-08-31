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

#include "json/types.h"

namespace htmlparser::json {

constexpr std::array<std::string_view, 35> kIndentSpaces {
  "",
  " ",
  "  ",
  "   ",
  "    ",
  "     ",
  "      ",
  "       ",
  "        ",
  "         ",
  "          ",
  "           ",
  "            ",
  "             ",
  "              ",
  "               ",
  "                ",
  "                 ",
  "                  ",
  "                   ",
  "                    ",
  "                     ",
  "                      ",
  "                       ",
  "                        ",
  "                         ",
  "                          ",
  "                           ",
  "                            ",
  "                             ",
  "                              ",
  "                               ",
  "                                ",
  "                                 ",
  "                                  "};

constexpr int64_t MAX_SAFE_INTEGER = 9007199254740992;  // 2 ^^ 53.

void AddIndentation(std::stringbuf* buf, int indent_columns) {
  if (indent_columns > 35) indent_columns = 35;
  if (indent_columns > 0) {
    buf->sputn(kIndentSpaces[indent_columns].data(), indent_columns);
  }
}

std::string NullValue::ToString(int indent_columns) const {
  std::stringbuf buf;
  ToString(&buf, indent_columns);
  return buf.str();
}

void NullValue::ToString(std::stringbuf* buf, int indent_columns) const {
  AddIndentation(buf, indent_columns);
  buf->sputn("null", 4);
}

std::string JsonDict::ToString(int indent_columns) const {
  std::stringbuf buf;
  ToString(&buf, indent_columns);
  return buf.str();
}

void JsonDict::ToString(std::stringbuf* buf, int indent_columns) const {
  bool first = true;
  buf->sputc('{');
  buf->sputc('\n');
  for (auto& [k, v] : values_) {
    if (!first) {
      buf->sputc(',');
      buf->sputc('\n');
    }
    AddIndentation(buf, indent_columns + 2);
    first = false;
    buf->sputc('"');
    buf->sputn(k.c_str(), k.size());
    buf->sputn("\":", 2);
    if (!v.Has<JsonArray, JsonDict>()) {
      v.ToString(buf, 1);
    } else {
      v.ToString(buf, indent_columns + 2);
    }
  }
  buf->sputc('\n');
  AddIndentation(buf, indent_columns);
  buf->sputc('}');
}

std::string JsonArray::ToString(int indent_columns) const {
  std::stringbuf buf;
  ToString(&buf, indent_columns);
  return buf.str();
}

void JsonArray::ToString(std::stringbuf* buf, int indent_columns) const {
  bool first = true;
  buf->sputc('[');
  buf->sputc('\n');
  for (auto& i : items_) {
    if (!first) {
      buf->sputc(',');
      buf->sputc('\n');
    }
    first = false;
    i.ToString(buf, indent_columns + 2);
  }
  buf->sputc('\n');
  AddIndentation(buf, indent_columns);
  buf->sputc(']');
}

std::string JsonObject::ToString(int indent_columns) const {
  std::stringbuf buf;
  ToString(&buf, indent_columns);
  return buf.str();
}

template <class... Fs>
struct overloaded : Fs... {
  template <class... Ts>
  overloaded(Ts&&... ts) : Fs{std::forward<Ts>(ts)}...
  {}

  using Fs::operator()...;
};

template <class ...Ts>
overloaded(Ts&&...) -> overloaded<std::remove_reference_t<Ts>...>;

void JsonObject::ToString(std::stringbuf* buf, int indent_columns) const {
  AddIndentation(buf, indent_columns);
  std::visit(
      overloaded{
          [&](int32_t i) {
            std::string str = std::to_string(i);
            buf->sputn(str.c_str(), str.size());
          },
          [&](int64_t i) {
            bool overflow = (
                (i < 0 && i < -MAX_SAFE_INTEGER + 1) ||
                (i > 0 && i > MAX_SAFE_INTEGER - 1));
            if (overflow) {
              buf->sputc('"');
            }
            std::string str = std::to_string(i);
            buf->sputn(str.c_str(), str.size());
            if (overflow) {
              buf->sputc('"');
            }
          },
          [&](double d) {
            std::string str = std::to_string(d);
            buf->sputn(str.c_str(), str.size());
          },
          [&](float f) {
            std::string str = std::to_string(f);
            buf->sputn(str.c_str(), str.size());
          },
          [&](bool b) { b ? buf->sputn("true", 4) : buf->sputn("false", 5); },
          [&](const std::string& str) {
            buf->sputc('"');
            buf->sputn(str.c_str(), str.size());
            buf->sputc('"');
          },
          [&](NullValue n) { buf->sputn("null", 4); },
          [&](const JsonArray& a) { a.ToString(buf, indent_columns); },
          [&](const JsonDict& d) { d.ToString(buf, indent_columns); },
          [&](const Any<JsonArray>& a) {
            a.ToString(buf, indent_columns);
          },
          [&](const Any<JsonDict>& a) {
            a.ToString(buf, indent_columns);
          },
          [&](const Any<JsonObject>& a) {
            a.ToString(buf, indent_columns);
          },
      }, v_);
}

}  // namespace htmlparser::json
